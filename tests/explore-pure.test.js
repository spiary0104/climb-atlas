// Unit tests for the pure Explore modules (docs/DESIGN.md sec. 6.2, 7.2, 7.7, 7.8, 9): geometry + URL state (geo.js),
// the search index (search-index.js) and pin markup (pin-html.js). No DOM, no MapLibre.   node --test "tests/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

// constants.js reads window.matchMedia at import time (reduced motion).
globalThis.window = globalThis.window || {};
globalThis.window.matchMedia = () => ({ matches: false });

const mods = (async () => ({
  geo: await import('../js/modules/geo.js'),
  idx: await import('../js/modules/search-index.js'),
  pin: await import('../js/modules/pin-html.js'),
  slug: await import('../js/modules/slug.js'),
  prov: await import('../js/modules/provenance.js'),
}))();
// router.js is DOM-free at import time; matchRoute is pure.
const routerMod = import('../js/modules/router.js');

test('geo: distance and its display format', async () => {
  const { geo } = await mods;
  const sydney = { lat: -33.8688, lng: 151.2093 }, melbourne = { lat: -37.8136, lng: 144.9631 };
  assert.ok(Math.abs(geo.distanceKm(sydney, melbourne) - 714) < 5);
  assert.equal(geo.distanceKm(sydney, sydney), 0);
  assert.deepEqual([0.004, 0.35, 4.26, 12.7, 1204.2].map(geo.formatDistance), ['10 m', '350 m', '4.3 km', '13 km', '1,204 km']);
  assert.equal(geo.formatDistance(NaN), '');
});

test('geo: viewport bounds are antimeridian-safe and a view wider than the world covers everything', async () => {
  const { geo } = await mods;
  const fiji = geo.boundsOf(170, -25, 190, -10);            // crosses 180
  assert.ok(geo.inBounds({ lat: -18, lng: 178 }, fiji) && geo.inBounds({ lat: -18, lng: -179 }, fiji));
  assert.ok(!geo.inBounds({ lat: -18, lng: 0 }, fiji) && !geo.inBounds({ lat: 10, lng: 178 }, fiji));
  const world = geo.boundsOf(-300, -80, 200, 80);
  assert.ok(geo.inBounds({ lat: 0, lng: 0 }, world) && geo.inBounds({ lat: 0, lng: 179 }, world) && geo.inBounds({ lat: 0, lng: -179 }, world));
  const sydney = geo.boundsOf(150.9, -34.1, 151.4, -33.7);
  assert.ok(geo.inBounds({ lat: -33.9, lng: 151.2 }, sydney) && !geo.inBounds({ lat: -37.8, lng: 144.9 }, sydney));
  assert.ok(geo.inBounds({ lat: 1, lng: 1 }, null), 'no scope = everything');
});

test('geo: gyms sharing a coordinate get a deterministic spread; singletons get none (sec. 7.8)', async () => {
  const { geo } = await mods;
  const spots = [{ id: 'b', lat: 1, lng: 2 }, { id: 'a', lat: 1, lng: 2 }, { id: 'c', lat: 1.0000001, lng: 2 }, { id: 'solo', lat: 5, lng: 5 }];
  const o1 = geo.stackOffsets(spots), o2 = geo.stackOffsets([...spots].reverse());
  assert.deepEqual([...o1.entries()].sort(), [...o2.entries()].sort(), 'independent of input order');
  assert.equal(o1.has('solo'), false);
  assert.equal(o1.size, 3);
  const pts = [...o1.values()].map(p => p.join(','));
  assert.equal(new Set(pts).size, 3, 'every member at a distinct offset');
  for (const [dx, dy] of o1.values()) assert.ok(Math.hypot(dx, dy) >= 10, 'visibly apart at any zoom');
});

test('geo: explore URL state round-trips and rejects malformed input without throwing (sec. 6.2)', async () => {
  const { geo } = await mods;
  const state = { q: 'blochaus', place: 'AU:NSW', camera: { lng: 151.2093, lat: -33.8688, zoom: 12.5 }, types: ['indoor-bouldering', 'top-rope'], saved: true, climbed: false, photos: true };
  const qs = geo.encodeExploreState(state);
  assert.equal(qs, 'q=blochaus&place=AU:NSW&c=151.2093,-33.8688,12.50&t=boulder,toprope&saved=1&photos=1');
  const back = geo.decodeExploreState('?' + qs);
  assert.deepEqual(back, { camera: { lng: 151.2093, lat: -33.8688, zoom: 12.5 }, types: ['indoor-bouldering', 'top-rope'], saved: true, climbed: false, photos: true, place: 'AU:NSW', q: 'blochaus' });
  assert.equal(geo.encodeExploreState({ types: geo.ALL_TYPES }), '', 'all types on = no t= parameter');
  const junk = geo.decodeExploreState('?c=NaN,1,2&t=nope,,x&place=<script>&saved=yes&q=' + 'x'.repeat(500));
  assert.equal(junk.camera, null);
  assert.deepEqual(junk.types, geo.ALL_TYPES);
  assert.equal(junk.place, null);
  assert.equal(junk.saved, false);
  assert.equal(junk.q.length, 100);
  assert.equal(geo.decodeExploreState('?c=10,95,3').camera, null, 'latitude out of range');
  assert.equal(geo.decodeExploreState('?c=190,10,3').camera.lng, -170, 'longitude wrapped');
  assert.doesNotThrow(() => geo.decodeExploreState('%%%&&=='));
});

test('geo: case- and diacritic-insensitive folding and word starts (sec. 9.1)', async () => {
  const { geo } = await mods;
  assert.equal(geo.fold('München'), 'munchen');
  assert.equal(geo.fold('Île-de-France'), 'ile-de-france');
  assert.deepEqual(geo.wordStarts('Blochaus  Marrickville (Sydney)'), ['blochaus', 'marrickville', 'sydney']);
  assert.deepEqual(geo.wordStarts('東京 ボルダリング'), ['東京', geo.fold('ボルダリング')], 'kana with voicing marks stay one word');
  assert.ok(geo.wordStarts('B-PUMP 東京 ボルダリング').some(w => w.startsWith(geo.fold('ボル'))));
});

const SPOTS = [
  { id: 's1', name: 'BlocHaus Marrickville', suburb: 'Marrickville', state: 'NSW', country: 'AU', address: '1 Chalk St', lat: -33.91, lng: 151.15 },
  { id: 's2', name: 'Nine Degrees Alexandria', suburb: 'Alexandria', state: 'NSW', country: 'AU', lat: -33.9, lng: 151.19 },
  { id: 's3', name: 'Boulderwelt München Ost', suburb: 'München', state: 'BY', country: 'DE', lat: 48.13, lng: 11.6 },
  { id: 's4', name: 'Einstein Boulderhalle', suburb: 'München', state: 'BY', country: 'DE', lat: 48.1, lng: 11.5 },
  { id: 's5', name: 'Broken', suburb: 'Nowhere', state: 'X', country: 'ZZ', lat: null, lng: 1 },
];
const OPTS = { countryLabels: { AU: 'Australia', DE: 'Germany' }, stateLabel: (c, s) => ({ 'AU:NSW': 'NSW', 'DE:BY': 'Bayern' })[c + ':' + s] || s };

test('search index: groups, counts, bounds, prefix-on-word-start and diacritic matching (sec. 9)', async () => {
  const { idx } = await mods;
  const index = idx.buildSearchIndex(SPOTS, OPTS);
  assert.equal(index.gyms.length, 4, 'rows without coordinates are skipped');
  const mun = idx.querySearchIndex(index, 'munchen');
  assert.deepEqual(mun.city.map(c => [c.label, c.count, c.secondary]), [['München', 2, 'Bayern · Germany']]);
  assert.deepEqual(mun.gym.map(g => g.id), ['s3', 's4'], 'gyms match on suburb too; a name match ranks first');
  const de = idx.querySearchIndex(index, 'ger');
  assert.deepEqual(de.country.map(c => [c.key, c.count]), [['DE', 2]]);
  assert.deepEqual(idx.querySearchIndex(index, 'NSW').region.map(r => [r.key, r.count]), [['AU:NSW', 2]], 'region codes are searchable');
  assert.deepEqual(idx.querySearchIndex(index, 'de').country.map(c => c.key), ['DE'], 'country codes are searchable');
  assert.deepEqual(idx.querySearchIndex(index, 'chalk').gym.map(g => g.id), ['s1'], 'addresses are searchable');
  assert.deepEqual(idx.querySearchIndex(index, 'rick').gym, [], 'prefix on word starts only, not substrings');
  assert.deepEqual(idx.querySearchIndex(index, 'nine alex').gym.map(g => g.id), ['s2'], 'every query word must match');
  assert.equal(idx.querySearchIndex(index, '   ').total, 0);
  const nsw = idx.findPlace(index, 'AU:NSW');
  assert.deepEqual(nsw.bounds, { west: 151.15, south: -33.91, east: 151.19, north: -33.9 });
  assert.equal(idx.findPlace(index, 'AU:NOPE'), null);
  assert.equal(idx.placeKey('AU', 'NSW', 'Marrickville'), 'AU:NSW:Marrickville');
});

test('search index: result groups respect the per-group limits (cities 5, regions 3, countries 2, gyms 8)', async () => {
  const { idx } = await mods;
  const many = Array.from({ length: 30 }, (_, i) => ({ id: 'g' + i, name: 'Alpha Gym ' + i, suburb: 'Alpha ' + i, state: 'Area' + (i % 6), country: ['AA', 'AB', 'AC'][i % 3], lat: i, lng: i }));
  const r = idx.querySearchIndex(idx.buildSearchIndex(many, {}), 'a');
  assert.deepEqual([r.city.length, r.region.length, r.country.length, r.gym.length], [5, 3, 2, 8]);
  assert.equal(r.total, 18);
});

test('pins: teardrop vs dot, type colour class by priority, rings stacked selected > saved > climbed (sec. 7.7)', async () => {
  const { pin } = await mods;
  assert.deepEqual([['top-rope', 'indoor-bouldering'], ['lead-climbing', 'top-rope'], ['lead-climbing'], [], null, ['<x>']].map(pin.pinType),
    ['boulder', 'toprope', 'lead', 'other', 'other', 'other']);
  const plain = pin.pinSvg({ types: ['top-rope'] });
  assert.match(plain, /width="16" height="21" viewBox="0 0 24 32"/);
  assert.match(plain, /class="pin-body pin-body--toprope"/);
  assert.match(plain, /class="pin-dot"/);
  assert.ok(!/pin-ring/.test(plain));
  const all = pin.pinSvg({ types: ['lead-climbing'], selected: true, saved: true, climbed: true, checkedIn: true });
  const rings = [...all.matchAll(/stroke-width="([\d.]+)" class="pin-ring pin-ring--([a-z]+)"/g)].map(m => [m[2], Number(m[1])]);
  assert.deepEqual(rings.map(r => r[0]), ['climbed', 'saved', 'selected'], 'drawn outermost first; selected is innermost');
  assert.ok(rings[0][1] > rings[1][1] && rings[1][1] > rings[2][1]);
  assert.equal(rings[2][1], 1.5 + 2 * 3, 'innermost ring: 2px outside a 1px outline at 1.5 units/px');
  assert.match(all, /pin-dot pin-dot--checked-in/);
  const dot = pin.pinSvg({ kind: 'dot', types: ['indoor-bouldering'], saved: true });
  assert.match(dot, /width="6" height="6"/);
  assert.ok(!/pin-dot/.test(dot), 'dots have no centre dot');
  assert.match(dot, /pin-ring--saved/);
  // anything unexpected falls back to a fixed shape: no caller value reaches the markup
  const odd = pin.pinSvg({ kind: '"><script>', types: ['"><img>'], selected: 'yes' });
  assert.ok(!/script|img/.test(odd));
  assert.match(odd, /pin-svg--teardrop/);
});

test('slugs: the same rule as the database migration (name + new suburb words, accents folded, id fallback, clash suffixes)', async () => {
  const { slug } = await mods;
  // The cases verified against supabase/migrations/*_add_spot_slugs.sql on the local database (2026-09-26).
  assert.equal(slug.slugBase('BlocHaus', 'Marrickville', 'seed-1'), 'blochaus-marrickville');
  assert.equal(slug.slugBase('B-PUMP Tokyo Akihabara', 'Akihabara, Tokyo', 'seed-3'), 'b-pump-tokyo-akihabara');
  assert.equal(slug.slugBase('Boulderwelt München Ost', 'München', 'seed-4'), 'boulderwelt-munchen-ost');
  assert.equal(slug.slugBase('東京ボルダリング', '新宿', 'seed-5'), 'seed-5');
  assert.equal(slug.slugBase('9 Degrees Alexandria', 'Alexandria', 'g-abc123'), '9-degrees-alexandria');
  assert.ok(slug.slugBase('x'.repeat(200), '', 'id').length <= 80);
  const rows = [
    { id: 'seed-2', name: 'BlocHaus', suburb: 'Marrickville', created_at: '2021-01-01' },
    { id: 'seed-1', name: 'BlocHaus', suburb: 'Marrickville', created_at: '2020-01-01' },
    { id: 'seed-9', name: 'Kept', suburb: 'Here', slug: 'stored-slug' },
  ];
  slug.assignMissingSlugs(rows);
  assert.deepEqual(rows.map(r => r.slug), ['blochaus-marrickville-2', 'blochaus-marrickville', 'stored-slug'], 'oldest keeps the plain slug; stored slugs never change');
  assert.equal(slug.gymPath({ slug: 'a-b' }), '/gym/a-b');
  assert.equal(slug.gymPath({ id: 'x"><b>' }), '/gym/x%22%3E%3Cb%3E', 'ids are URL-encoded in paths');
  assert.equal(slug.cityPath('AU', 'NSW', 'Surry Hills'), '/in/au/nsw/surry-hills');
  assert.equal(slug.regionPath('FR', 'Île-de-France'), '/in/fr/%C3%AEle-de-france');
});

test('router: paths map to views; unknown paths are notfound, never an exception', async () => {
  const { matchRoute } = await routerMod;
  const m = p => { const r = matchRoute(p); return [r.name, r.params]; };
  assert.deepEqual(m('/'), ['explore', {}]);
  assert.deepEqual(m('/index.html'), ['explore', {}]);
  assert.deepEqual(m('/gym/blochaus-marrickville'), ['gym', { slug: 'blochaus-marrickville' }]);
  assert.deepEqual(m('/gym/boulderwelt-m%C3%BCnchen'), ['gym', { slug: 'boulderwelt-münchen' }]);
  assert.deepEqual(m('/in'), ['regions', {}]);
  assert.deepEqual(m('/in/au'), ['country', { country: 'au' }]);
  assert.deepEqual(m('/in/au/nsw'), ['region', { country: 'au', region: 'nsw' }]);
  assert.deepEqual(m('/in/au/nsw/surry-hills'), ['city', { country: 'au', region: 'nsw', city: 'surry-hills' }]);
  assert.deepEqual(m('/log'), ['log', {}]);
  assert.deepEqual(m('/me'), ['me', {}]);
  assert.deepEqual(m('/me/saved'), ['me', { section: 'saved' }]);
  assert.deepEqual(m('/me/passport'), ['passport', {}]);
  for (const bad of ['/gym/', '/gym/a/b', '/in/AUSTRALIA1', '/me/passports', '/admin', '/gym/%E0%A4%A']) assert.equal(matchRoute(bad).name, bad === '/gym/%E0%A4%A' ? 'gym' : 'notfound', bad);
});

test('geo: fitCamera frames a box (region pages) and clamps the zoom', async () => {
  const { geo } = await mods;
  const sydney = geo.fitCamera({ west: 150.9, south: -34.1, east: 151.4, north: -33.7 }, 360, 270);
  assert.ok(Math.abs(sydney.lng - 151.15) < 1e-9 && sydney.lat < -33.7 && sydney.lat > -34.1);
  assert.ok(sydney.zoom > 8 && sydney.zoom < 11, 'city-scale zoom: ' + sydney.zoom);
  assert.equal(geo.fitCamera({ west: 151.2, south: -33.9, east: 151.2, north: -33.9 }, 360, 270).zoom, 13, 'a single point clamps to maxZoom');
  assert.equal(geo.fitCamera({ west: -170, south: -60, east: 170, north: 70 }, 360, 270).zoom, 2, 'the world clamps to minZoom');
});

test('provenance: states, levels, relative time, the page line and display-name rules (sec. 10)', async () => {
  const { prov } = await mods;
  assert.equal(prov.provenanceState({}, 0), 'community-added', 'the default, seed-imported gyms included');
  assert.equal(prov.provenanceState({}, 2), 'community-verified');
  assert.equal(prov.provenanceState({ verified_at: '2026-09-01' }, 0), 'verified');
  assert.deepEqual([0, 14, 15, 49, 50, 149, 150, 399, 400, 5000].map(prov.levelFor), [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  assert.equal(prov.isContributor(49), false); assert.equal(prov.isContributor(50), true);
  const now = new Date('2026-09-26T12:00:00Z');
  assert.deepEqual(['2026-09-26T08:00:00Z', '2026-09-25T10:00:00Z', '2026-09-20T12:00:00Z', '2026-08-26T12:00:00Z', '2026-03-01T12:00:00Z', '2023-09-01T12:00:00Z', null, 'nope'].map(d => prov.formatRelative(d, now)),
    ['today', 'yesterday', '6 days ago', '4 weeks ago', '6 months ago', '3 years ago', '', '']);
  assert.equal(prov.provenanceLine({ submitted_by: 'u1' }, { added_by: 'mika.sends', contributors: 3, last_edited: '2026-09-23T12:00:00Z' }, now).text,
    'Community-verified · added by mika.sends · last edited 3 days ago · 3 contributors');
  assert.equal(prov.provenanceLine({ submitted_by: 'u1' }, { contributors: 1 }, now).text, 'Community-added · added by a climber · 1 contributor', 'no display name -> "a climber", never an email');
  assert.equal(prov.provenanceLine({}, null, now).text, 'Community-added', 'seed gyms: no invented adder');
  for (const bad of ['a', 'x'.repeat(41), 'me@example.com', '<b>', '   ']) assert.equal(prov.validDisplayName(bad), false, bad);
  for (const ok of ['mika.sends', 'Jo', 'Élodie M.']) assert.equal(prov.validDisplayName(ok), true, ok);
});
