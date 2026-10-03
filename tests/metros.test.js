// City metros (js/modules/metros.js): the curated table, radius membership, search ranking, the ?place= round trip, the
// place filter and the region page counts. Pure modules only.   node --test "tests/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

// constants.js reads window.matchMedia at import time (reduced motion).
globalThis.window = globalThis.window || {};
globalThis.window.matchMedia = () => ({ matches: false });

const mods = (async () => ({
  metros: await import('../js/modules/metros.js'),
  idx: await import('../js/modules/search-index.js'),
  geo: await import('../js/modules/geo.js'),
  slug: await import('../js/modules/slug.js'),
  page: await import('../js/modules/page-html.js'),
  regions: await import('../js/modules/regions.js'),
}))();
const routerMod = import('../js/modules/router.js');

const gym = (id, name, suburb, country, state, lat, lng) => ({ id, name, suburb, country, state, lat, lng, address: '' });

test('metros: the table is well formed (unique slugs, real region codes, sane radii)', async () => {
  const { metros, regions } = await mods;
  assert.ok(metros.METROS.length >= 40, 'metros: ' + metros.METROS.length);
  const seen = new Set();
  for (const m of metros.METROS) {
    assert.match(m.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, m.name);
    assert.ok(!seen.has(m.country + ':' + m.slug), 'duplicate slug ' + m.country + ':' + m.slug);
    seen.add(m.country + ':' + m.slug);
    assert.ok(Math.abs(m.lat) <= 85 && Math.abs(m.lng) <= 180 && m.radiusKm >= 10 && m.radiusKm <= 60, m.name);
    assert.ok((regions.STATES_BY_COUNTRY[m.country] || []).some(([code]) => code === m.state), `${m.name}: state ${m.country}:${m.state} is not in STATES_BY_COUNTRY`);
    assert.equal(metros.metroOf({ country: m.country, lat: m.lat, lng: m.lng }), m, m.name + ': its own centre belongs to it');
    assert.equal(metros.metroByKey(metros.metroKey(m)), m, m.name + ': key round trip');
    assert.equal(metros.metroByPath(m.country, encodeURIComponent(m.state.toLowerCase()), m.slug), m, m.name + ': path round trip');
  }
  assert.ok(Object.isFrozen(metros.METROS) && Object.isFrozen(metros.METROS[0]));
});

test('metros: membership is by country and radius; nearest centre wins; no coordinates, no metro', async () => {
  const { metros } = await mods;
  const sydney = metros.METROS.find(m => m.slug === 'sydney');
  assert.equal(metros.metroOf(gym('a', 'A', 'Marrickville', 'AU', 'NSW', -33.91, 151.15)), sydney);
  assert.equal(metros.metroOf(gym('b', 'B', 'Penrith', 'AU', 'NSW', -33.75, 150.69)), sydney, 'about 50 km out is still Sydney');
  assert.equal(metros.metroOf(gym('c', 'C', 'Newcastle', 'AU', 'NSW', -32.93, 151.78)), null, 'Newcastle is 120 km away: no metro');
  assert.equal(metros.metroOf(gym('d', 'D', 'Sydney', 'NZ', 'AUCKLAND', -33.87, 151.21)), null, 'the country must match');
  assert.equal(metros.metroOf({ country: 'AU', lat: null, lng: 151 }), null);
  assert.equal(metros.metroOf(null), null);
  // Overlapping circles: a point between Kyoto and Osaka belongs to whichever centre is nearer.
  const kyoto = metros.METROS.find(m => m.slug === 'kyoto'), osaka = metros.METROS.find(m => m.slug === 'osaka');
  const at = t => ({ country: 'JP', lat: kyoto.lat + (osaka.lat - kyoto.lat) * t, lng: kyoto.lng + (osaka.lng - kyoto.lng) * t });
  assert.equal(metros.metroOf(at(0.35)), kyoto);
  assert.equal(metros.metroOf(at(0.65)), osaka);
  // groupByMetro: gyms of one country in one pass; gyms outside every metro are left out.
  const spots = [gym('1', 'a', '', 'AU', 'NSW', -33.9, 151.2), gym('2', 'b', '', 'AU', 'VIC', -37.8, 145), gym('3', 'c', '', 'AU', 'NSW', -32.93, 151.78), gym('4', 'd', '', 'GB', 'ENGLAND', 51.5, -0.1)];
  const g = metros.groupByMetro(spots, 'AU');
  assert.deepEqual([...g.entries()].map(([m, l]) => [m.slug, l.map(x => x.id)]), [['sydney', ['1']], ['melbourne', ['2']]]);
});

const SPOTS = [
  gym('s1', 'BlocHaus Marrickville', 'Marrickville', 'AU', 'NSW', -33.91, 151.15),
  gym('s2', 'Nine Degrees Alexandria', 'Alexandria', 'AU', 'NSW', -33.9, 151.19),
  gym('s3', 'Sydney Climbing Co', 'Sydney', 'AU', 'NSW', -33.87, 151.2),
  gym('s4', 'Newcastle Rock', 'Newcastle', 'AU', 'NSW', -32.93, 151.78),
  gym('m1', 'Hub Melbourne', 'Melbourne CBD', 'AU', 'VIC', -37.81, 144.96),
  gym('m2', 'Northside Boulders', 'Brunswick', 'AU', 'VIC', -37.77, 144.96),
  gym('m3', 'Melbourne Rock Co', 'Melbourne', 'AU', 'VIC', -37.82, 144.95),
  gym('n1', 'Brooklyn Boulders', 'Brooklyn', 'US', 'NY', 40.68, -73.98),
  gym('n2', 'Chelsea Cliffs', 'New York', 'US', 'NY', 40.75, -74.0),
  gym('n3', 'Albany Rocks', 'Albany', 'US', 'NY', 42.65, -73.75),
  gym('w1', 'Boulderhalle Wien', 'Wien', 'AT', 'WIEN', 48.2, 16.37),
  gym('z1', 'Zürich Blocs', 'Zürich', 'CH', 'ZURICH', 47.38, 8.54),
];
const OPTS = { countryLabels: { AU: 'Australia', US: 'United States', AT: 'Austria', CH: 'Switzerland' }, stateLabel: (c, s) => s };

test('search: a metro is a city result that outranks suburbs and gyms (Sydney, Melbourne, New York)', async () => {
  const { idx } = await mods;
  const index = idx.buildSearchIndex(SPOTS, OPTS);

  const syd = idx.querySearchIndex(index, 'sydney');
  assert.deepEqual(syd.city.map(c => [c.label, c.key, c.count, c.secondary]), [['Sydney', 'AU:NSW:~sydney', 3, 'NSW · Australia']],
    'one Sydney city result: the metro (3 gyms; Newcastle is outside), not also the suburb called Sydney');
  assert.deepEqual(syd.gym.map(g => g.id), ['s3'], 'gyms still match by name');

  const mel = idx.querySearchIndex(index, 'melbourne');
  assert.deepEqual(mel.city.map(c => [c.label, c.count]), [['Melbourne', 3], ['Melbourne CBD', 1]], 'the metro first, then the suburb that merely starts with the word');

  const ny = idx.querySearchIndex(index, 'new york');
  assert.deepEqual(ny.city.map(c => [c.label, c.key, c.count]), [['New York', 'US:NY:~new-york', 2]], 'multi-word names; the Albany gym is 220 km away');

  assert.deepEqual(idx.querySearchIndex(index, 'syd').city.map(c => c.label), ['Sydney'], 'prefix');
  assert.deepEqual(idx.querySearchIndex(index, 'SYDNEY').city.map(c => c.label), ['Sydney'], 'case');
  assert.deepEqual(idx.querySearchIndex(index, 'zurich').city.map(c => c.label), ['Zurich'], 'diacritics fold: the suburb Zürich is subsumed');
  assert.deepEqual(idx.querySearchIndex(index, 'Zürich').city.map(c => c.label), ['Zurich']);
  assert.deepEqual(idx.querySearchIndex(index, 'wien').city.map(c => [c.label, c.key]), [['Vienna', 'AT:WIEN:~vienna']], 'aliases find the metro');
  assert.deepEqual(idx.querySearchIndex(index, 'newcastle').city.map(c => c.key), ['AU:NSW:Newcastle'], 'a suburb outside every metro is still a city result');
  assert.deepEqual(idx.querySearchIndex(index, 'marrickville').city.map(c => c.key), ['AU:NSW:Marrickville'], 'suburbs inside a metro stay searchable by name');
});

test('place keys: a metro place round-trips through ?place=; old suburb, region and country places still work', async () => {
  const { idx, geo, metros } = await mods;
  const index = idx.buildSearchIndex(SPOTS, OPTS);
  const sydney = idx.findPlace(index, 'AU:NSW:~sydney');
  assert.equal(sydney.metro, 'sydney');
  assert.equal(sydney.count, 3);
  assert.deepEqual(sydney.bounds, { west: 151.15, south: -33.91, east: 151.2, north: -33.87 }, 'the map frames the metro gyms');
  assert.equal(metros.metroKey(metros.metroByKey('AU:NSW:~sydney')), 'AU:NSW:~sydney');

  const qs = geo.encodeExploreState({ place: 'AU:NSW:~sydney', camera: { lng: 151.2, lat: -33.9, zoom: 10 } });
  assert.equal(qs, 'place=AU:NSW:~sydney&c=151.2000,-33.9000,10.00', 'readable: the ~ is not percent-encoded');
  assert.equal(geo.decodeExploreState('?' + qs).place, 'AU:NSW:~sydney');
  assert.equal(geo.decodeExploreState('?place=AU:NSW:%7Esydney').place, 'AU:NSW:~sydney', 'the encoded form decodes too');
  assert.equal(idx.findPlace(index, geo.decodeExploreState('?' + qs).place), sydney, 'shared link -> the same place entry');

  // Old URLs keep working, including the old suburb key "Sydney", which now resolves (hidden from results, still a place).
  for (const key of ['AU:NSW:Marrickville', 'AU:NSW', 'AU', 'AU:NSW:Sydney']) {
    const q = geo.encodeExploreState({ place: key });
    assert.equal(q, 'place=' + key);
    assert.equal(geo.decodeExploreState('?' + q).place, key);
    assert.ok(idx.findPlace(index, key), key);
  }
  assert.equal(idx.findPlace(index, 'AU:NSW:Sydney').metro, undefined, 'the old key is the suburb, not the metro');
  assert.equal(idx.findPlace(index, 'AU:NSW:~nope'), null);
  assert.equal(geo.decodeExploreState('?place=<script>').place, null);
});

test('place filter: a metro matches by radius (any suburb, any region code), a suburb by name', async () => {
  const { idx } = await mods;
  const index = idx.buildSearchIndex(SPOTS, OPTS);
  const ids = place => SPOTS.filter(g => idx.inPlace(g, idx.findPlace(index, place))).map(g => g.id);
  assert.deepEqual(ids('AU:NSW:~sydney'), ['s1', 's2', 's3']);
  assert.deepEqual(ids('AU:VIC:~melbourne'), ['m1', 'm2', 'm3']);
  assert.deepEqual(ids('AU:NSW:Marrickville'), ['s1']);
  assert.deepEqual(ids('AU:NSW:Sydney'), ['s3'], 'the old suburb key keeps its old meaning');
  assert.deepEqual(ids('AU:NSW'), ['s1', 's2', 's3', 's4']);
  assert.deepEqual(ids('AU').length, 7);
  assert.equal(idx.inPlace(SPOTS[0], null), true);
  // A metro place with the right slug but another country never matches.
  assert.equal(idx.inPlace(gym('x', 'x', '', 'NZ', 'AUCKLAND', -33.87, 151.2), { kind: 'city', country: 'AU', state: 'NSW', metro: 'sydney' }), false);
});

test('region pages: the meta line counts each kind honestly (no suburbs as cities)', async () => {
  const { page } = await mods;
  assert.equal(page.regionMeta({ gyms: 28, cities: 1, areas: 6 }), '28 gyms · 1 city · 6 other areas');
  assert.equal(page.regionMeta({ gyms: 28, cities: 3, areas: 0 }), '28 gyms · 3 cities');
  assert.equal(page.regionMeta({ gyms: 12, cities: 0, areas: 5 }), '12 gyms · 5 areas', 'no metro: they are areas, not cities');
  assert.equal(page.regionMeta({ gyms: 1, cities: 0, areas: 1 }), '1 gym · 1 area');
  assert.equal(page.regionMeta({ gyms: 2400, cities: 0, areas: 0 }), '2,400 gyms');
  assert.ok(!/cities/.test(page.regionMeta({ gyms: 28, areas: 28 })));
  // The place page renders "Cities" then "Other areas" as two tile sections with unique heading ids.
  const html = page.placePageHtml({ crumbs: [], title: 'NSW', meta: 'm', tileSections: [
    { title: 'Cities', tiles: [{ label: 'Sydney', href: '/in/au/nsw/sydney', count: 22 }] },
    { title: 'Other areas', tiles: [{ label: 'Newcastle', href: '/in/au/nsw/newcastle', count: 3 }] },
    { title: 'Empty', tiles: [] }], gyms: [] });
  assert.deepEqual([...html.matchAll(/<h2 class="section-title" id="(\w+)">([^<]+)</g)].map(m => [m[1], m[2]]), [['tilesTitle', 'Cities'], ['tilesTitle1', 'Other areas']]);
  assert.ok(html.includes('href="/in/au/nsw/sydney"') && html.includes('22 gyms'));
});

test('urls: a metro lives at /in/{cc}/{region}/{slug} and resolves before a suburb of the same name', async () => {
  const { slug, metros } = await mods;
  const { matchRoute } = await routerMod;
  const sydney = metros.METROS.find(m => m.slug === 'sydney');
  assert.equal(slug.metroPath(sydney), '/in/au/nsw/sydney');
  assert.equal(slug.metroPath(sydney), slug.cityPath('AU', 'NSW', 'Sydney'), 'same path as the suburb called Sydney: the metro wins');
  const r = matchRoute('/in/au/nsw/sydney');
  assert.deepEqual([r.name, r.params], ['city', { country: 'au', region: 'nsw', city: 'sydney' }]);
  assert.equal(metros.metroByPath(r.params.country, encodeURIComponent(r.params.region), r.params.city), sydney);
  assert.equal(metros.metroByPath('au', 'vic', 'sydney'), null, 'the region must be the metro\'s core region');
  assert.equal(metros.metroByPath('au', 'nsw', 'marrickville'), null, 'suburbs fall through to the old city page');
  assert.equal(metros.metroByPath('xx', 'nsw', 'sydney'), null);
  assert.equal(slug.metroPath(metros.METROS.find(m => m.slug === 'xi-an')), '/in/cn/xian/xi-an');
});
