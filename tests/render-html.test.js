// Renders the Explore builders (row, card, carousel, peek card, pills, search options) and the moderator panel with benign and with hostile database values, and checks that hostile values
// cannot add tags, attributes, event handlers or executable links.   node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

// constants.js reads window.matchMedia at import time; the builders themselves are DOM-free.
globalThis.window = globalThis.window || {};
globalThis.window.matchMedia = () => ({ matches: false });

const modules = (async () => ({
  list: await import('../js/modules/list-html.js'),
  page: await import('../js/modules/page-html.js'),
  mod: await import('../js/modules/moderation-html.js'),
  add: await import('../js/modules/add-html.js'),
  brand: await import('../js/modules/brand.js'),
  stamp: await import('../js/modules/stamp-html.js'),
}))();

// Minimal HTML tokenizer (enough for our own templates): returns [{tag, attrs:{name:value}}] for every start tag.
function tags(html) {
  const out = [];
  const re = /<([a-zA-Z][\w-]*)((?:\s+[^\s"'<>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/g;
  let m;
  while ((m = re.exec(html))) {
    const attrs = {};
    const are = /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
    let a;
    while ((a = are.exec(m[2]))) attrs[a[1]] = a[2] ?? a[3] ?? a[4] ?? '';
    out.push({ tag: m[1].toLowerCase(), attrs });
  }
  return out;
}
const shape = html => tags(html).map(t => t.tag + '[' + Object.keys(t.attrs).sort().join(',') + ']');
const hasHandlerAttrs = html => tags(html).some(t => Object.keys(t.attrs).some(n => /^on/i.test(n)));
const allText = html => html.replace(/<[^>]*>/g, '');
// Every <svg> must be a sprite icon or the shared boulder placeholder, and every <use> must point into our own sprites.
const onlySpriteIcons = html => tags(html).every(t => (t.tag !== 'svg' || /^(icon|placeholder-art|pin-svg)\b/.test(t.attrs.class || '') && t.attrs['aria-hidden'] === 'true')
  && (t.tag !== 'use' || /^assets\/icons\.svg#i-[a-z-]+$|^assets\/boulder\.svg#boulder$/.test(t.attrs.href || '')));
const countSvg = html => (html.match(/<svg\b/gi) || []).length;

const HOSTILE = [
  '"><img src=x onerror=window.__pwned=1>',
  "' onmouseover='window.__pwned=2",
  'x" onfocus="window.__pwned=3" autofocus x="',
  '</div><script>window.__pwned=4</script>',
  '<svg/onload=window.__pwned=5>',
  '`onerror=window.__pwned=6`',
  '&quot;&lt;b&gt;',
];

const benignSpot = { id: 'community-0f3a7c2e-1111-4222-8333-444455556666', name: 'Boulder Barn', suburb: 'Surry Hills', state: 'NSW', country: 'AU',
  types: ['indoor-bouldering', 'top-rope'], address: '1 Example St', notes: 'Friendly staff', photo: 'https://example.com/a.jpg', lat: -33.9, lng: 151.2 };

// Every builder that renders a gym (row, card, carousel card, peek card) gets the same hostile-input contract the old popup had.
const BUILDERS = ['rowHtml', 'cardHtml', 'carouselCardHtml', 'peekHtml'];
const ctxBenign = { region: 'New South Wales', country: 'Australia', saved: true, climbed: false, distance: '1.2 km', selected: false };

test('explore builders: hostile values in every field cannot add tags/attributes or handlers (structure identical to a benign render)', async () => {
  const { list } = await modules;
  for (const b of BUILDERS) {
    const benign = list[b](benignSpot, ctxBenign);
    for (const h of HOSTILE) {
      // (an unknown type string is dropped, not rendered, so the benign types stay to keep the dot/tag count comparable)
      const hostile = list[b]({ ...benignSpot, id: h, name: h, suburb: h, address: h, notes: h, types: [...benignSpot.types, h] }, { ...ctxBenign, region: h, country: h, distance: h });
      assert.deepEqual(shape(hostile), shape(benign), b + ': tag/attribute structure changed for payload ' + h);
      assert.equal(hasHandlerAttrs(hostile), false, b + ': event-handler attribute injected: ' + h);
      assert.ok(!/<script/i.test(hostile), b + ': raw markup leaked: ' + h);
      assert.equal(countSvg(hostile), countSvg(benign), b + ': svg markup leaked: ' + h);
      assert.ok(onlySpriteIcons(hostile), b + ': non-sprite svg/use for payload ' + h);
    }
  }
  for (const h of HOSTILE) {
    for (const [kind, benign] of [['place', list.appliedPillHtml('place', 'Sydney')], ['text', list.appliedPillHtml('text', 'boulder')]]) {
      const hostile = list.appliedPillHtml(kind, h);
      assert.deepEqual(shape(hostile), shape(benign), 'applied pill ' + kind + ': ' + h);
      assert.equal(hasHandlerAttrs(hostile), false);
    }
    const opt = list.searchOptionHtml({ kind: 'city', label: h, secondary: h, count: 3 }, 0);
    assert.deepEqual(shape(opt), shape(list.searchOptionHtml({ kind: 'city', label: 'Sydney', secondary: 'NSW', count: 3 }, 0)), 'search option: ' + h);
    assert.deepEqual(shape(list.searchOptionHtml({ kind: h, label: 'x' }, h)), shape(list.searchOptionHtml({ kind: 'gym', label: 'x' }, 0)), 'unknown kind/index cannot change markup: ' + h);
    assert.deepEqual(shape(list.searchGroupHtml(h, '')), shape(list.searchGroupHtml('Cities', '')), 'search group: ' + h);
    assert.ok(!/<script|<img/i.test(list.emptyHtml('search', h)), 'search empty state: ' + h);
  }
});

test('explore builders: no inline handlers; actions are data-gym-action + data-spot-id and the id is attribute-escaped', async () => {
  const { list } = await modules;
  const html = list.peekHtml({ ...benignSpot, id: 'x"><b>' }, ctxBenign);
  assert.equal(hasHandlerAttrs(html), false);
  assert.ok(!/window\.__|onclick|onerror/i.test(html));
  const btns = tags(html).filter(t => t.attrs['data-gym-action']);
  assert.deepEqual(btns.map(b => b.attrs['data-gym-action']), ['close', 'save', 'climbed', 'edit', 'report']);
  for (const b of btns.filter(b => b.attrs['data-spot-id'] !== undefined)) assert.equal(b.attrs['data-spot-id'], 'x&quot;&gt;&lt;b&gt;');
  const row = tags(list.rowHtml({ ...benignSpot, id: 'x"><b>' }, ctxBenign));
  assert.deepEqual(row.filter(t => t.attrs['data-gym-action']).map(t => t.attrs['data-gym-action']), ['open', 'save']);
});

test('explore builders: javascript:/data: photo is never rendered as an image; a normal https photo is (and it sits over the placeholder)', async () => {
  const { list } = await modules;
  for (const b of BUILDERS) {
    for (const bad of ['javascript:alert(1)', 'data:image/svg+xml;base64,PHN2Zz4=', 'JAVASCRIPT:alert(1)', 'not a url', '//evil.example/x.png', 'https://x"onerror="alert(1)']) {
      assert.equal(tags(list[b]({ ...benignSpot, photo: bad }, ctxBenign)).some(t => t.tag === 'img'), false, b + ' ' + bad);
    }
    const imgs = tags(list[b](benignSpot, ctxBenign)).filter(t => t.tag === 'img');
    assert.equal(imgs.length, 1, b);
    assert.equal(imgs[0].attrs.src, 'https://example.com/a.jpg');
    assert.equal(Object.keys(imgs[0].attrs).some(n => /^on/i.test(n)), false);
    assert.match(imgs[0].attrs.class, /\bgym-photo\b/, b + ': broken photos are hidden by the capture-phase handler via .gym-photo');
  }
  // Without a photo the boulder placeholder carries the initial as text.
  const row = list.rowHtml({ ...benignSpot, photo: null, name: 'élan' }, ctxBenign);
  assert.ok(/<use href="assets\/boulder\.svg#boulder"\/>/.test(row) && allText(row).includes('É'));
});

test('explore builders: quotes and HTML-special characters in ordinary text survive as text', async () => {
  const { list } = await modules;
  const html = list.peekHtml({ ...benignSpot, name: 'Tom & Jerry\'s "Rock" <Gym>', notes: '5 < 6 & "quoted"' }, ctxBenign);
  assert.ok(html.includes('Tom &amp; Jerry&#39;s &quot;Rock&quot; &lt;Gym&gt;'));
  assert.ok(html.includes('5 &lt; 6 &amp; &quot;quoted&quot;'));
  assert.equal(shape(html).length, shape(list.peekHtml(benignSpot, ctxBenign)).length);
});

test('internal research notes never reach visitors: peek card and gym page hide them, keep real descriptions, still escape', async () => {
  const { list, page } = await modules;
  const research = "Found via climbing-net.com (Japanese gym directory). Official news Sep 2026; bouldering gym. Pin is the Nominatim centroid of the chome/neighbourhood (house number not in OSM), so about 200-400 m. Added Sep 2026 via a native-language directory pass.";
  const mixed = 'Nonprofit, pay-what-you-can gym. Address and position independently verified (Nominatim geocode confirmed by the US Census Bureau geocoder, within 0.05km).';
  // (the gym page's map credit legitimately says "© OpenStreetMap", so that word is not a leak marker here)
  const leaks = html => /nominatim|climbing-net|directory pass|independently verified|centroid|Pin is/i.test(html);
  const stored = { ...benignSpot, notes: research };
  const peek = list.peekHtml(stored, ctxBenign), gym = page.gymPageHtml(stored, pageCtx());
  assert.ok(!/peek-notes/.test(peek) && !leaks(peek), 'peek card: research note hidden');
  assert.ok(!/aboutTitle/.test(gym) && !leaks(gym), 'gym page: no About section for a research note');
  assert.equal(stored.notes, research, 'the stored note is not modified (edit forms and /mod still show it)');
  const peekMixed = list.peekHtml({ ...benignSpot, notes: mixed }, ctxBenign), gymMixed = page.gymPageHtml({ ...benignSpot, notes: mixed }, pageCtx());
  assert.ok(allText(peekMixed).includes('Nonprofit, pay-what-you-can gym.') && !leaks(peekMixed), 'peek card: real sentence kept, boilerplate dropped');
  assert.ok(/aboutTitle/.test(gymMixed) && allText(gymMixed).includes('Nonprofit, pay-what-you-can gym.') && !leaks(gymMixed), 'gym page: About keeps the real sentence only');
  // a genuine note renders exactly as before, with HTML-special characters still escaped
  const real = list.peekHtml({ ...benignSpot, notes: 'Day pass <$22> & "chalk" free' }, ctxBenign);
  assert.ok(real.includes('<p class="peek-notes">Day pass &lt;$22&gt; &amp; &quot;chalk&quot; free</p>'));
  assert.ok(page.gymPageHtml({ ...benignSpot, notes: 'Day pass <$22> & "chalk" free' }, pageCtx()).includes('<p class="prose">Day pass &lt;$22&gt; &amp; &quot;chalk&quot; free</p>'));
  // missing or non-string notes render nothing and do not throw
  for (const n of [undefined, null, '', '   ']) {
    assert.ok(!/peek-notes/.test(list.peekHtml({ ...benignSpot, notes: n }, ctxBenign)), 'peek: ' + n);
    assert.ok(!/aboutTitle/.test(page.gymPageHtml({ ...benignSpot, notes: n }, pageCtx())), 'page: ' + n);
  }
});

test('explore builders: behaviour the popup had is preserved in the peek card, and rows carry the dense-row content', async () => {
  const { list } = await modules;
  const html = list.peekHtml(benignSpot, { ...ctxBenign, climbed: true, saved: false });
  const text = allText(html);
  assert.ok(text.includes('Boulder Barn') && text.includes('Surry Hills, New South Wales, Australia'));
  assert.ok(/ouldering/.test(text) && /op rope/i.test(text));
  assert.ok(text.includes('1 Example St') && text.includes('Friendly staff'));
  const climbed = tags(html).find(t => t.attrs['data-gym-action'] === 'climbed');
  const saved = tags(html).find(t => t.attrs['data-gym-action'] === 'save');
  assert.equal(climbed.attrs['aria-pressed'], 'true');
  assert.equal(saved.attrs['aria-pressed'], 'false');
  const dir = tags(html).find(t => /\bpeek-directions\b/.test(t.attrs.class || ''));
  assert.match(dir.attrs.href, /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&amp;destination=/);
  assert.equal(dir.attrs.rel, 'noopener noreferrer');
  const row = list.rowHtml({ ...benignSpot, community: true }, ctxBenign);
  assert.ok(allText(row).includes('Surry Hills · New South Wales') && allText(row).includes('1.2 km'));
  assert.equal(tags(row).filter(t => /\btype-dot--/.test(t.attrs.class || '')).length, 2, 'one type dot per known type');
  assert.ok(/provenance-mark--community/.test(row), 'community-added (the default) is the grey ring-dot');
  assert.ok(/provenance-mark--verified/.test(list.rowHtml(benignSpot, { ...ctxBenign, provenance: 'community-verified' })), 'community-verified is the forest ring-dot');
  assert.ok(!/provenance-mark/.test(list.rowHtml(benignSpot, { ...ctxBenign, provenance: 'verified' })), 'no mark on a verified gym (sec. 10.2)');
  assert.ok(!/provenance-mark/.test(list.rowHtml(benignSpot, { ...ctxBenign, provenance: '"><script>' })), 'an unknown state renders nothing');
  assert.match(list.capRowHtml(1204), /Zoom in to see all <span class="tnum">1,204<\/span>/);
  assert.deepEqual(['area', 'filters', 'search'].map(k => tags(list.emptyHtml(k, 'x')).filter(t => t.attrs['data-list-action']).map(t => t.attrs['data-list-action']).join(',')),
    ['zoom-out,add-gym', 'clear-filters', 'search-city']);
});

// ===== gym page (DESIGN.md sec. 8) =====
const pageCtx = (over = {}) => ({ crumbs: [{ label: 'Australia', href: '/in/au' }, { label: 'NSW', href: '/in/au/nsw' }, { label: 'Surry Hills', href: '/in/au/nsw/surry-hills' }],
  region: 'NSW', country: 'Australia', distance: '', saved: false, climbed: false, history: null, nearby: [], exploreHref: '/?c=151.2,-33.9,15', ...over });

test('gym page: hostile values in every field cannot add tags/attributes or handlers', async () => {
  const { page } = await modules;
  const near = { g: { ...benignSpot, id: 'n1', name: 'Near' }, ctx: { region: 'NSW', href: '/gym/near', distance: '1 km away' } };
  const benign = page.gymPageHtml(benignSpot, pageCtx({ nearby: [near], history: { count: 2, last: '2026-09-01' } }));
  for (const h of HOSTILE) {
    const hostile = page.gymPageHtml({ ...benignSpot, id: h, name: h, suburb: h, address: h, notes: h, types: [...benignSpot.types, h] },
      pageCtx({ region: h, crumbs: [{ label: h, href: h }, { label: h, href: '/in/au/nsw' }, { label: h, href: '/x' }], distance: '', exploreHref: h,
        nearby: [{ g: { ...near.g, name: h, suburb: h }, ctx: { region: h, href: h, distance: h } }], history: { count: 2, last: h } }));
    assert.deepEqual(shape(hostile), shape(benign), 'gym page structure changed for payload ' + h);
    assert.equal(hasHandlerAttrs(hostile), false, 'handler injected: ' + h);
    assert.ok(!/<script/i.test(hostile), 'raw markup leaked: ' + h);
    assert.ok(onlySpriteIcons(hostile), 'non-sprite svg for payload ' + h);
  }
  assert.equal(tags(page.breadcrumbHtml([{ label: 'a', href: 'javascript:alert(1)' }])).find(t => t.tag === 'a').attrs.href, 'javascript:alert(1)',
    'breadcrumb hrefs come only from slug.js path builders (never data); escaping keeps them inert text in the attribute');
});

test('gym page: the minimum page renders no empty sections; the photo page shows the hero and no prompt (sec. 8.2, Phase 3 acceptance)', async () => {
  const { page } = await modules;
  const minimal = { id: 'g-1', name: 'Bare Gym', suburb: 'Somewhere', state: 'NSW', country: 'AU', types: ['top-rope'], lat: -33.9, lng: 151.2 };
  const html = page.gymPageHtml(minimal, pageCtx());
  const text = allText(html);
  const headings = tags(html).filter(t => /^h[12]$/.test(t.tag)).length;
  assert.ok(!/gym-hero/.test(html), 'no placeholder hero');
  assert.ok(!/aboutTitle|nearbyTitle|historyTitle/.test(html), 'no About / Nearby / history without data');
  assert.equal((html.match(/contribute-prompt/g) || []).length, 1, 'exactly one contribution prompt');
  assert.ok(/essentialsTitle/.test(html) && /data-mini-map/.test(html), 'Essentials with the map thumbnail is always there');
  assert.ok(text.includes('Somewhere, NSW'), 'address row falls back to the place when there is no street address');
  assert.equal(headings, 3, 'h1 + Community + Essentials only');
  assert.ok(!/—<|>—|undefined|null|NaN/.test(html), 'no dash placeholders or leaked empties');
  const withPhoto = page.gymPageHtml({ ...minimal, photo: 'https://example.com/wall.jpg', notes: 'Great setting' }, pageCtx());
  const hero = tags(withPhoto).find(t => /\bgym-hero\b/.test(t.attrs.class || ''));
  assert.equal(hero.attrs.src, 'https://example.com/wall.jpg');
  assert.ok(!/contribute-prompt/.test(withPhoto), 'no prompt when the page has a photo');
  assert.ok(/aboutTitle/.test(withPhoto));
  for (const bad of ['javascript:alert(1)', 'data:image/png;base64,AAA', '//evil/x.png']) assert.ok(!/gym-hero/.test(page.gymPageHtml({ ...minimal, photo: bad }, pageCtx())), bad);
  const acts = tags(html).filter(t => t.attrs['data-page-action']).map(t => t.attrs['data-page-action']);
  assert.deepEqual(acts, ['edit', 'edit', 'report', 'checkin', 'save', 'climbed'], 'prompt, community actions, then the action row (Check in first, sec. 11.1)');
  assert.equal(tags(html).find(t => t.attrs['data-page-action'] === 'checkin').attrs.class, 'btn btn-primary', 'Check in is the one primary action');
  const done = page.gymPageHtml(minimal, pageCtx({ checkedIn: true }));
  assert.ok(!/data-page-action="checkin"/.test(done) && /Checked in today/.test(done) && !/btn-primary/.test(done), 'after a check-in: "Checked in today", disabled, no primary');
  assert.ok(!/mascot/.test(html), 'no character on gym pages (sec. 12.2)');
});

test('region pages: hostile place and gym names stay text; cards up to 20 gyms, dense rows beyond (DNA #2)', async () => {
  const { page } = await modules;
  const item = name => ({ g: { ...benignSpot, name }, ctx: { region: 'NSW', href: '/gym/x' } });
  const build = (name, n) => page.placePageHtml({ crumbs: [{ label: 'Regions', href: '/in' }, { label: name, current: true }], title: name, meta: n + ' gyms',
    tilesTitle: 'Cities', tiles: [{ label: name, href: '/in/au/nsw/x', count: 3 }], gymsTitle: 'Gyms', gyms: Array.from({ length: n }, () => item(name)),
    map: { lat: -33.9, lng: 151.2, zoom: 9, href: '/?place=AU:NSW', label: 'Show ' + name } });
  const benign = build('Sydney', 3);
  for (const h of HOSTILE) {
    const hostile = build(h, 3);
    assert.deepEqual(shape(hostile), shape(benign), 'place page structure changed for payload ' + h);
    assert.equal(hasHandlerAttrs(hostile), false);
    assert.ok(onlySpriteIcons(hostile));
    const index = page.regionsIndexHtml([{ title: h, items: [{ label: h, href: '/in/au', count: 2 }] }], 2);
    assert.deepEqual(shape(index), shape(page.regionsIndexHtml([{ title: 'Asia', items: [{ label: 'Japan', href: '/in/jp', count: 2 }] }], 2)));
  }
  assert.equal((build('A', 20).match(/class="gym-card page-card"/g) || []).length, 20, '20 gyms: cards');
  assert.equal((build('A', 21).match(/class="page-row"/g) || []).length, 21, '21 gyms: dense rows');
  assert.ok(/data-mini-map data-points/.test(benign), 'the region map plots its gyms');
  assert.ok(!/mascot/.test(benign), 'no character on region pages (sec. 12.2)');
  const bc = benign.slice(benign.indexOf('<nav class="breadcrumb"'), benign.indexOf('</nav>'));
  const crumbs = tags(bc).filter(t => t.tag === 'li');
  assert.equal(crumbs[crumbs.length - 1].attrs['aria-current'], 'page', 'the current place is marked, not linked');
  assert.ok(!/<a[^>]*>Sydney<\/a>/.test(bc), 'and not a link');
});

test('log page: month calendar starts on Monday and marks session days; signed-out shows only the sign-in call', async () => {
  const { page } = await modules;
  const cal = page.calendarHtml(2026, 8, new Map([['2026-09-26', 2], ['2026-09-01', 1]]), '2026-09-26');   // September 2026
  const days = tags(cal).filter(t => /\bcal-day\b/.test(t.attrs.class || ''));
  assert.equal(days.length, 30);
  assert.equal(cal.indexOf('<td></td>'), cal.indexOf('<tbody><tr>') + '<tbody><tr>'.length, '1 September 2026 is a Tuesday: one empty Monday cell first');
  assert.deepEqual(days.filter(d => /has-session/.test(d.attrs.class)).map(d => d.attrs['aria-label']), ['1 September, 1 session', '26 September, 2 sessions']);
  assert.match(days.find(d => /is-today/.test(d.attrs.class)).attrs['aria-label'], /^26 September/);
  assert.equal((cal.match(/<tr>/g) || []).length, 6, 'header + 5 weeks');
  const out = page.logPageHtml({ signedIn: false });
  assert.deepEqual(tags(out).filter(t => t.attrs['data-page-action']).map(t => t.attrs['data-page-action']), ['sign-in']);
  const inn = page.logPageHtml({ signedIn: true, count: 2, calendar: cal, sessions: '<div class="session-item"></div>' });
  assert.equal((inn.match(/\bbtn-primary\b/g) || []).length, 1, 'one primary action: Log a session');
});

test('me page: saved/climbed tabs as links, rows link to gym pages, no email anywhere, moderator-only pending button', async () => {
  const { page } = await modules;
  const row = name => ({ g: { ...benignSpot, name }, ctx: { region: 'NSW', href: '/gym/boulder-barn' } });
  const base = { signedIn: true, section: 'saved', saved: [row('Boulder Barn')], climbed: [], isModerator: false, pendingCount: 0 };
  const html = page.mePageHtml(base);
  const tabs = tags(html).filter(t => /\btab\b/.test(t.attrs.class || ''));
  assert.deepEqual(tabs.map(t => [t.attrs.href, t.attrs['aria-current'] || '']), [['/me/saved', 'page'], ['/me/climbed', ''], ['/me/passport', '']]);
  assert.equal(tags(html).find(t => /page-row/.test(t.attrs.class || '')).attrs.href, '/gym/boulder-barn');
  assert.ok(!/pending/.test(html), 'no Pending review for non-moderators');
  assert.match(page.mePageHtml({ ...base, isModerator: true, pendingCount: 3 }), /Pending review <span class="tnum">\(3\)<\/span>/);
  assert.ok(/Save a gym from its page/.test(page.mePageHtml({ ...base, saved: [] })), 'empty state text');
  assert.ok(!/@/.test(html), 'no email address on /me (sec. 18)');
  for (const h of HOSTILE) {
    const hostile = page.mePageHtml({ ...base, saved: [row(h)], section: h });
    assert.deepEqual(shape(hostile), shape(html), 'me page structure changed for payload ' + h);
    assert.equal(hasHandlerAttrs(hostile), false);
  }
  const out = page.mePageHtml({ signedIn: false });
  assert.deepEqual(tags(out).filter(t => t.attrs['data-page-action']).map(t => t.attrs['data-page-action']), ['sign-in']);
  // About / Privacy / Terms are plain links to their own pages (the Privacy/Terms dialogs are gone).
  assert.deepEqual(tags(out).filter(t => t.tag === 'a' && /link-quiet/.test(t.attrs.class || '')).map(t => t.attrs.href), ['/about.html', '/privacy', '/terms']);
});

test('community: /me contributions and the gym page provenance lines keep hostile names and reasons as text', async () => {
  const { page } = await modules;
  const c = s => ({ displayName: s, points: 65, level: 3, contributor: true, submissions: [{ kind: 'gym', name: s, status: 'rejected', reason: s }, { kind: 'edit', name: s, status: 'pending', reason: null }] });
  const benign = page.meContributionsHtml(c('mika.sends'));
  assert.ok(allText(benign).includes('65 points · level 3 · Contributor'));
  assert.ok(allText(benign).includes('New gym: mika.sends') && allText(benign).includes('Not accepted') && allText(benign).includes('In review'));
  for (const h of HOSTILE) {
    const hostile = page.meContributionsHtml(c(h));
    assert.deepEqual(shape(hostile), shape(benign), 'contributions structure changed for payload ' + h);
    assert.equal(hasHandlerAttrs(hostile), false);
    const gp = page.gymPageHtml(benignSpot, pageCtx({ provenance: { state: 'community-added', text: h }, myEdit: { status: 'rejected', rejection_reason: h } }));
    assert.deepEqual(shape(gp), shape(page.gymPageHtml(benignSpot, pageCtx({ provenance: { state: 'community-added', text: 'x' }, myEdit: { status: 'rejected', rejection_reason: 'y' } }))), 'gym page provenance: ' + h);
  }
  assert.equal(page.meContributionsHtml(null), '', 'nothing while loading');
  assert.ok(/Your edit is awaiting review/.test(page.gymPageHtml(benignSpot, pageCtx({ myEdit: { status: 'pending' } }))));
  assert.ok(!/awaiting review|accepted/.test(page.gymPageHtml(benignSpot, pageCtx({ myEdit: { status: 'approved' } }))), 'approved edits need no note');
});

// ===== /mod: queue and side panel (DESIGN.md sec. 10.5). Every value comes from rows anyone can insert. =====
const pendingSpot = { id: 'community-aaaa', name: 'N', suburb: 'S', state: 'NSW', country: 'AU', types: ['top-rope'], address: 'A', notes: 'n', photo: 'https://example.com/p.jpg', lat: -33.9, lng: 151.2 };
const pendingEdit = { id: '11111111-2222-3333-4444-555555555555', spot_id: 'seed-1', name: 'N2', suburb: 'S', state: 'NSW', country: 'AU', types: ['top-rope'], address: 'A', notes: 'n', photo: 'https://example.com/p.jpg', lat: -33.9, lng: 151.2, edit_note: 'moved', review_requested: true };
const currentGym = { id: 'seed-1', name: 'Known Gym', suburb: 'S', state: 'NSW', country: 'AU', types: ['top-rope'], address: 'A', notes: 'n', photo: 'https://example.com/p.jpg', lat: -33.9, lng: 151.2 };
const pendingReport = { id: '99999999-2222-3333-4444-555555555555', spot_id: 'seed-1', message: 'wrong pin' };
const modCtx = (over = {}) => ({ index: 0, contributor: 'mika.sends', level: 2, age: 'today', flagged: false, selected: true, href: '/gym/known-gym', ...over });
const panels = (s, e, r) => [
  mod => mod.modPanelHtml({ kind: 'spot', name: s.name, row: s }, modCtx()),
  mod => mod.modPanelHtml({ kind: 'edit', name: 'Known Gym', row: e, current: currentGym }, modCtx()),
  mod => mod.modPanelHtml({ kind: 'report', name: 'Known Gym', row: r }, modCtx()),
];

test('moderation: hostile names/fields/notes/reasons cannot alter the queue or panel markup (all three kinds)', async () => {
  const { mod } = await modules;
  // Every text field replaced by the same value, so the benign baseline changes the same diff rows as the payload.
  const rows = h => [
    { ...pendingSpot, id: h, name: h, suburb: h, state: h, country: h, types: [h], address: h, notes: h },
    { ...pendingEdit, id: h, spot_id: h, name: h, suburb: h, state: h, country: h, types: [h], address: h, notes: h, edit_note: h },
    { ...pendingReport, id: h, spot_id: h, message: h },
  ];
  const benign = panels(...rows('plain words')).map(f => f(mod));
  const benignRow = mod.modRowHtml({ kind: 'edit', name: 'Known Gym' }, modCtx());
  for (const h of HOSTILE) {
    panels(...rows(h)).map(f => f(mod)).forEach((html, i) => {
      assert.deepEqual(shape(html), shape(benign[i]), 'panel ' + i + ' structure changed for payload ' + h);
      assert.equal(hasHandlerAttrs(html), false, 'handler injected: ' + h);
      assert.ok(!/<script/i.test(html) && onlySpriteIcons(html), 'raw markup leaked: ' + h);
    });
    const row = mod.modRowHtml({ kind: h, name: h }, modCtx({ contributor: h, age: h, index: h }));
    assert.deepEqual(shape(row), shape(benignRow), 'queue row structure changed for payload ' + h);
  }
});

test('moderation: a javascript: photo submitted via a proposal is inert text, never a link (the reported vector)', async () => {
  const { mod } = await modules;
  for (const bad of ['javascript:alert(document.domain)', 'JaVaScRiPt:alert(1)', ' javascript:alert(1)', 'java\nscript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:x']) {
    for (const html of [mod.modPanelHtml({ kind: 'edit', name: 'G', row: { ...pendingEdit, photo: bad }, current: currentGym }, modCtx()),
      mod.modPanelHtml({ kind: 'spot', name: 'G', row: { ...pendingSpot, photo: bad } }, modCtx())]) {
      const links = tags(html).filter(t => t.tag === 'a');
      assert.ok(links.every(a => /^https:\/\/example\.com\//.test(a.attrs.href || '')), 'unsafe link rendered for ' + JSON.stringify(bad));
      assert.ok(html.includes('not a web link'), 'not marked inert');
    }
  }
  const ok = tags(mod.modPanelHtml({ kind: 'spot', name: 'G', row: pendingSpot }, modCtx())).find(t => t.tag === 'a');
  assert.equal(ok.attrs.href, 'https://example.com/p.jpg');
  assert.match(ok.attrs.rel, /noopener/);
});

test('moderation: destructive buttons are .btn-danger, never the primary and never a close control; Escape cannot reach them', async () => {
  const { mod } = await modules;
  const all = panels(pendingSpot, pendingEdit, pendingReport).map(f => f(mod)).join('');
  const btns = tags(all).filter(t => t.tag === 'button');
  for (const b of btns.filter(b => /reject|dismiss/.test(b.attrs['data-mod-action'] || ''))) {
    assert.match(b.attrs.class, /\bbtn-danger\b/);
    assert.ok(!/btn-primary/.test(b.attrs.class) && !('data-modal-close' in b.attrs));
  }
  assert.equal(btns.filter(b => b.attrs['data-mod-action'] === 'reject').length, 2);
  assert.equal(btns.filter(b => b.attrs['data-mod-action'] === 'dismiss').length, 1);
  // Normalise CRLF (a Windows checkout with core.autocrlf) so the LF-based pattern below matches on any checkout.
  const page = fs.readFileSync(require('node:path').join(__dirname, '..', 'js', 'modules', 'mod-page.js'), 'utf8').replace(/\r\n/g, '\n');
  const esc = /if\(e\.key === 'Escape'\)\{([\s\S]*?)return;\n    \}/.exec(page)[1];
  assert.ok(!/act\(|reject|dismiss|approve/.test(esc), 'Escape only closes the panel');
  assert.match(page, /if\(!reason\)\{/, 'a rejection requires a reason');
});

test('moderation: the diff lists changed fields old -> new, counts the rest, and shows the note and double-check flag', async () => {
  const { mod } = await modules;
  const html = mod.modPanelHtml({ kind: 'edit', name: 'Known Gym', row: pendingEdit, current: currentGym }, modCtx());
  const rows = [...html.matchAll(/<tr><th scope="row">([^<]+)<\/th><td>([^<]*)<\/td><td>([^<]*)<\/td><\/tr>/g)].map(m => m.slice(1));
  assert.deepEqual(rows, [['Name', 'Known Gym', 'N2']], 'only the changed field');
  assert.ok(/13 fields unchanged/.test(html), 'core, gym-information and photo fields compared; research notes only when proposed');
  assert.ok(allText(html).includes('moved') && allText(html).includes('asked for a double-check'));
  assert.ok(/id="modReason"/.test(html) && /data-mod-field="name"/.test(html), 'reason field and correctable fields');
  assert.equal(mod.modQueueHtml([], []).includes('Nothing to review'), true);
  const odd = mod.modPanelHtml({ kind: 'spot', name: 'G', row: { ...pendingSpot, types: ['bouldering-cave'] } }, modCtx());
  assert.ok(allText(odd).includes('bouldering-cave'), 'unknown type strings are shown as text');
  assert.doesNotThrow(() => mod.modPanelHtml({ kind: 'spot', name: 'G', row: { ...pendingSpot, types: null, address: null, notes: null, photo: null, lat: null } }, modCtx()));
  assert.ok(!/mascot/.test(html), 'no character on /mod (sec. 12.2)');
});

// ===== /add (DESIGN.md sec. 10.3): the draft is typed by the visitor and restored from localStorage, so all of it is untrusted =====
const draftOf = (v, over = {}) => ({ step: 1, name: v, types: ['top-rope', v], suburb: v, country: v, state: v, countryOther: v, stateOther: v,
  address: v, photo: v, notes: v, lat: -33.9, lng: 151.2, zoom: 15, ...over });

test('add: hostile draft values cannot alter the step 1 / step 2 markup or the note under the map', async () => {
  const { add } = await modules;
  const benign = [1, 2].map(step => add.addStepHtml(draftOf('plain words', { step }), { signedIn: false }));
  const nearBenign = add.nearHtml(draftOf('plain words'), { g: { name: 'plain words' }, km: 0.05 }, '/gym/x');
  const areaBenign = add.nearHtml(draftOf('plain words'), { g: { name: 'x' }, km: 3 }, '/gym/x');
  for (const h of HOSTILE) {
    [1, 2].forEach((step, i) => {
      const html = add.addStepHtml(draftOf(h, { step }), { signedIn: false });
      assert.deepEqual(shape(html), shape(benign[i]), 'step ' + step + ' structure changed for payload ' + h);
      assert.equal(hasHandlerAttrs(html), false, 'handler injected: ' + h);
      assert.ok(!/<script/i.test(html) && onlySpriteIcons(html), 'raw markup leaked: ' + h);
    });
    assert.deepEqual(shape(add.nearHtml(draftOf(h), { g: { name: h }, km: 0.05 }, '/gym/x')), shape(nearBenign), 'duplicate note changed for ' + h);
    assert.deepEqual(shape(add.nearHtml(draftOf(h), { g: { name: h }, km: 3 }, '/gym/x')), shape(areaBenign), 'area note changed for ' + h);
  }
});

test('add: step 1 asks only for the pin, a name and a type; the area comes from the nearest gym within 25 km', async () => {
  const { add } = await modules;
  assert.deepEqual(add.stepOneMissing(draftOf('Crux', { zoom: 10 }), 10), ['the pin (zoom in to street level)']);
  assert.deepEqual(add.stepOneMissing(draftOf('', { types: [] }), 15), ['a name', 'at least one climbing type']);
  assert.deepEqual(add.stepOneMissing({ ...draftOf('Crux'), lat: null }, 15), ['the pin (zoom in to street level)']);
  assert.deepEqual(add.stepOneMissing(draftOf('Crux'), 15), []);
  const spots = [{ name: 'Far', suburb: 'Far', country: 'AU', state: 'VIC', lat: -37.8, lng: 144.9 },
    { name: 'Near', suburb: 'Newtown', country: 'AU', state: 'NSW', lat: -33.9, lng: 151.18 }, { name: 'No pin', lat: null, lng: null }];
  const r = add.areaFor(spots, { lat: -33.9, lng: 151.2 });
  assert.equal(r.near.g.name, 'Near');
  assert.deepEqual(r.area, { suburb: 'Newtown', country: 'AU', state: 'NSW' });
  assert.equal(add.areaFor(spots, { lat: 0, lng: 0 }).area, null, 'no area from a gym thousands of km away');
  assert.equal(add.areaFor([], { lat: 0, lng: 0 }).near, null);
  assert.deepEqual(add.areaMissing({ suburb: ' ', country: 'AU', state: '' }), ['a suburb or town', 'a country and region']);
  assert.deepEqual(add.countryState({ country: 'OTHER', countryOther: ' France ', stateOther: 'Île-de-France' }), { country: 'France', state: 'Île-de-France' });
  const dup = add.nearHtml(draftOf('x'), { g: { name: 'Crux' }, km: 0.08 }, '/gym/crux');
  assert.ok(/add-near--warn/.test(dup) && /href="\/gym\/crux"/.test(dup) && allText(dup).includes('80 m'));
  assert.ok(allText(add.nearHtml({ ...draftOf(''), country: '' }, null, '/')).includes('step 2 will ask'));
});

test('add: one primary (Submit for review) per step, sign-in note only when signed out, no character on /add', async () => {
  const { add } = await modules;
  for (const step of [1, 2]) {
    const out = add.addStepHtml(draftOf('Crux', { step, country: 'AU', state: 'NSW' }), { signedIn: false });
    const btns = tags(out).filter(t => t.tag === 'button');
    assert.equal(btns.filter(b => /btn-primary/.test(b.attrs.class)).length, 1);
    assert.equal(btns.find(b => /btn-primary/.test(b.attrs.class)).attrs.type, 'submit');
    assert.ok(allText(out).includes('sign in when you submit'));
    assert.ok(!allText(add.addStepHtml(draftOf('Crux', { step }), { signedIn: true })).includes('sign in when you submit'));
  }
  const s2 = add.addStepHtml(draftOf('Crux', { step: 2, country: 'AU', state: 'NSW' }), {});
  assert.ok(/<option value="NSW" selected>/.test(s2) && /<option value="AU" selected>Australia/.test(s2), 'area pre-filled');
  assert.ok(/data-add-field="stateOther"/.test(add.addStepHtml(draftOf('Crux', { step: 2, country: 'OTHER' }), {})), 'Other country: free text');
  assert.ok(/disabled>Submitting…/.test(add.addStepHtml(draftOf('Crux'), { busy: true })));
  for (const html of [add.addPageHtml(), add.addDoneHtml(), s2]) assert.ok(!/mascot/.test(html));
  assert.ok(allText(add.addDoneHtml()).includes("Thanks — it's in review."));
});

// ===== Brand marks (DESIGN.md sec. 1A, 12.2): the seal and the first-run art ===========================================
test('brand: the seal is a decorative-safe SVG with arched BOULDEER; first-run art only for its two kinds, decorative', async () => {
  const { brand, page } = await modules;
  const a = brand.sealSvg(), b = brand.sealSvg({ mono: true });
  assert.match(a, /^<svg class="seal" viewBox="0 0 120 120" role="img" aria-label="Bouldeer seal"/);
  assert.ok(/<textPath [^>]*>BOULDEER<\/textPath>/.test(a) && /assets\/mascot\/head\.svg/.test(a), 'colour seal: lettering + the colour head');
  assert.ok(/class="seal seal--mono"/.test(b) && /assets\/mascot\/stamp-head\.svg/.test(b), 'mono seal: the single-ink stamp head');
  const ids = s => [...s.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set([...ids(a), ...ids(b)]).size, ids(a).length + ids(b).length, 'two seals on one page never share ids');
  assert.ok(!/<script|\son[a-z]+=/i.test(a + b));
  const hostile = brand.sealSvg({ label: '"><img src=x onerror=alert(1)>' });
  assert.ok(!/<img/.test(hostile) && hasHandlerAttrs(hostile) === false, 'the label is escaped');
  assert.match(brand.firstRunArt('log'), /^<img class="mascot mascot--spot" src="assets\/mascot\/chalking-up\.svg" alt=""/);
  assert.match(brand.firstRunArt('saved'), /src="assets\/mascot\/field-notes\.svg" alt=""/);
  assert.match(brand.firstRunArt('explore'), /src="assets\/mascot\/backpacker\.svg" alt=""/);
  for (const k of ['', 'fell-off', '../x', 'constructor', undefined]) assert.equal(brand.firstRunArt(k), '', 'no art for ' + k);
  const row = { g: { ...benignSpot, name: 'Boulder Barn' }, ctx: { region: 'NSW', href: '/gym/boulder-barn' } };
  const base = { signedIn: true, section: 'saved', saved: [], climbed: [], isModerator: false, pendingCount: 0 };
  assert.match(page.mePageHtml(base), /field-notes\.svg/, 'first run: nothing saved or climbed');
  assert.ok(!/field-notes\.svg/.test(page.mePageHtml({ ...base, climbed: [row] })), 'not once something is climbed (not a first run)');
  assert.ok(!/field-notes\.svg/.test(page.mePageHtml({ ...base, section: 'climbed' })), 'not on the Climbed tab');
  assert.equal((page.mePageHtml(base).match(/<svg class="seal[" ]/g) || []).length, 0, 'first run: the seal steps aside for field-notes (one character per screen)');
  assert.equal((page.mePageHtml({ ...base, saved: [row] }).match(/<svg class="seal[" ]/g) || []).length, 1, 'otherwise one seal on /me');
  assert.equal((page.mePageHtml({ signedIn: false }).match(/<svg class="seal[" ]/g) || []).length, 1, 'signed out: the seal');
});

// ===== Phase 5: stamps, passport, check-in and milestone sheets (DESIGN.md sec. 11, 12.3). Names come from any proposal. =====
// Tag-level: no script/foreignObject element, no handler attribute, no javascript: attribute value. Escaped TEXT may
// legitimately contain words like "onerror="; only real tags and attributes matter.
const svgOk = html => tags(html).every(t => !/^(script|foreignobject)$/i.test(t.tag) && Object.entries(t.attrs).every(([k, v]) => !/^on/i.test(k) && !/^\s*javascript:/i.test(v || '')));

test('stamp: hostile gym/city names cannot alter the SVG; the tilt is stable and within 8 degrees; ids never collide', async () => {
  const { stamp } = await modules;
  const benign = stamp.stampSvg({ title: 'Plain Words Gym', date: '2026-09-12T10:00:00Z', seed: 'seed-1' });
  assert.match(benign, /^<svg class="stamp" viewBox="0 0 120 120" role="img"/);
  assert.ok(benign.includes('>PLAIN WORDS GYM</textPath>') && benign.includes('>12 SEP 2026</textPath>'), 'caps name + caps date');
  assert.ok(/href="assets\/mascot\/stamp-head\.svg"/.test(benign), 'the single-ink stamp head');
  for (const h of HOSTILE) {
    const out = stamp.stampSvg({ title: h, date: h, seed: h, label: h });
    assert.deepEqual(shape(out), shape(stamp.stampSvg({ title: 'x', date: 'x', seed: 'x', label: 'x' })), 'stamp structure changed for ' + h);
    assert.ok(svgOk(out) && hasHandlerAttrs(out) === false, 'markup leaked: ' + h);
  }
  for (const seed of ['a', 'seed-1', 'community-xyz', '', 'AU:NSW:alexandria']) {
    const t = stamp.stampTilt(seed);
    assert.ok(Number.isInteger(t) && t >= -8 && t <= 8, seed);
    assert.equal(stamp.stampTilt(seed), t, 'stable');
  }
  const ids = [...(stamp.stampSvg({ title: 'a' }) + stamp.stampSvg({ title: 'b' })).matchAll(/id="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(stamp.stampSvg({ title: 'x'.repeat(60) }).includes('…'), 'very long names are shortened');
  assert.equal(stamp.stampDate('not a date'), '');
  assert.equal(stamp.niceDate('2026-09-12T10:00:00Z'), '12 Sep 2026');
});

test('passport page: hostile city/gym names and notes stay text; empty, signed-out and filtered states; no email', async () => {
  const { stamp } = await modules;
  const stampOf = v => ({ key: 'AU:NSW:' + v, city: v, gyms: 2, first: '2026-01-02T10:00:00Z', last: '2026-02-01T10:00:00Z', seed: v });
  const rowOf = v => ({ g: { ...benignSpot, name: v, suburb: v }, ctx: { href: '/gym/x', city: v, date: '2 Jan 2026', note: v } });
  const page = v => stamp.passportPageHtml({ signedIn: true, stats: '3 gyms · 2 cities · 1 country', stamps: [stampOf(v)], rows: [rowOf(v)], filter: '', filterLabel: '' });
  const benign = page('plain words');
  for (const h of HOSTILE) {
    const out = page(h);
    assert.deepEqual(shape(out), shape(benign), 'passport structure changed for ' + h);
    assert.ok(svgOk(out) && hasHandlerAttrs(out) === false, 'markup leaked: ' + h);
  }
  assert.ok(/Stamps/.test(benign) && /Recent check-ins/.test(benign) && /3 gyms · 2 cities · 1 country/.test(benign));
  const btn = tags(benign).find(t => /\bstamp-btn\b/.test(t.attrs.class || ''));
  assert.equal(btn.attrs['aria-pressed'], 'false');
  const filtered = stamp.passportPageHtml({ signedIn: true, stats: '', stamps: [stampOf('Newtown')], rows: [], filter: 'AU:NSW:Newtown', filterLabel: 'Newtown' });
  assert.equal(tags(filtered).find(t => /\bstamp-btn\b/.test(t.attrs.class || '')).attrs['aria-pressed'], 'true');
  assert.ok(/Showing Newtown/.test(filtered) && /data-passport-city=""/.test(filtered), 'a "Show all" control');
  const empty = stamp.passportPageHtml({ signedIn: true, stats: '', stamps: [], rows: [] });
  assert.ok(/traveller-passport\.svg/.test(empty) && /Your first stamp is one check-in away\./.test(empty), 'empty: the traveller + the line from sec. 11.3');
  assert.ok(!/traveller-passport/.test(benign), 'the traveller only on the empty passport');
  const out = stamp.passportPageHtml({ signedIn: false });
  assert.ok(/data-page-action="sign-in"/.test(out) && !/mascot/.test(out), 'signed out: sign in, no character');
  assert.ok(!/@/.test(benign));
});

test('check-in sheet: hostile names stay text; near shows the distance, confirm needs "I\'m here"; one primary; note max 140; no photo field', async () => {
  const { stamp } = await modules;
  const near = stamp.checkinSheetHtml({ name: 'Plain' }, { mode: 'near', distance: '120 m', date: '27 Sep 2026' });
  const conf = stamp.checkinSheetHtml({ name: 'Plain' }, { mode: 'confirm', date: '27 Sep 2026' });
  assert.ok(/120 m away/.test(near) && !/id="ciHere"/.test(near));
  assert.ok(/id="ciHere"/.test(conf) && /I’m at Plain now/.test(conf));
  for (const html of [near, conf]) {
    assert.equal((html.match(/\bbtn-primary\b/g) || []).length, 1);
    assert.match(html, /<textarea id="ciNote" maxlength="140"/);
    assert.ok(!/photo/i.test(html), 'note only (owner decision)');
    assert.ok(!/mascot/.test(html), 'no character in the sheet itself: the stamp head arrives with the stamp');
  }
  for (const h of HOSTILE) {
    for (const mode of ['near', 'confirm']) {
      const out = stamp.checkinSheetHtml({ name: h }, { mode, distance: h, date: h });
      assert.deepEqual(shape(out), shape(stamp.checkinSheetHtml({ name: 'x' }, { mode, distance: 'x', date: 'x' })), mode + ' changed for ' + h);
      assert.equal(hasHandlerAttrs(out), false);
    }
  }
  assert.ok(/disabled>Stamping…/.test(stamp.checkinSheetHtml({ name: 'x' }, { busy: true })));
  const done = stamp.stampedHtml({ id: 'g1', name: 'Plain' }, { checked_at: '2026-09-27T09:00:00Z' }, 'Your first stamp.');
  assert.deepEqual(tags(done).filter(t => t.attrs['data-ci-action']).map(t => t.attrs['data-ci-action']), ['log', 'share', 'done']);
  assert.equal((done.match(/\bbtn-primary\b/g) || []).length, 1);
  assert.ok(/class="stamp"/.test(done) && /Your first stamp\./.test(done));
  const hostileDone = stamp.stampedHtml({ id: '<x>', name: '<img src=x onerror=alert(1)>' }, { checked_at: 'x' }, '<script>alert(1)</script>');
  assert.ok(svgOk(hostileDone) && hasHandlerAttrs(hostileDone) === false && !/<img/.test(hostileDone));
});

test('milestone sheet: topped-out by default, fresh-stamp for travel, dyno for a grade; escaped; at most three other marks; one primary', async () => {
  const { stamp } = await modules;
  const m = stamp.milestoneHtml({ title: 'First stamp', sentence: 'x', pose: 'topped-out', others: [] });
  assert.ok(/topped-out-flag\.svg" alt="" width="160" height="160"/.test(m), 'topped-out at 160px (the one sheet allowed to break an edge)');
  assert.ok(/dyno\.svg/.test(stamp.milestoneHtml({ title: 'First V6', pose: 'dyno' })));
  assert.ok(/fresh-stamp\.svg" alt="" width="160" height="160"/.test(stamp.milestoneHtml({ title: 'First stamp abroad', pose: 'fresh-stamp' })));
  assert.ok(/topped-out-flag\.svg/.test(stamp.milestoneHtml({ title: 'x', pose: 'constructor' })), 'unknown poses fall back, never build a path');
  assert.equal((m.match(/\bbtn-primary\b/g) || []).length, 1);
  assert.deepEqual(tags(m).filter(t => t.attrs['data-ms-action']).map(t => t.attrs['data-ms-action']), ['share', 'done']);
  const many = stamp.milestoneHtml({ title: 'a', others: ['b', 'c', 'd', 'e'] });
  assert.equal((many.match(/class="milestone-mark"/g) || []).length, 3, 'up to three other marks');
  for (const h of HOSTILE) {
    const out = stamp.milestoneHtml({ title: h, sentence: h, others: [h] });
    assert.deepEqual(shape(out), shape(stamp.milestoneHtml({ title: 'x', sentence: 'x', others: ['x'] })), 'changed for ' + h);
    assert.equal(hasHandlerAttrs(out), false);
  }
});

test('page header art: Regions always; Log and Me only signed out; decorative; unknown names render nothing', async () => {
  const { page } = await modules;
  const art = s => [...s.matchAll(/<div class="page-art" aria-hidden="true"><img src="assets\/art\/([a-z-]+)\.svg" alt=""/g)].map(m => m[1]);
  assert.deepEqual(art(page.regionsIndexHtml([], 0)), ['regions-wall']);
  assert.deepEqual(art(page.logPageHtml({ signedIn: false })), ['log-still-life']);
  assert.deepEqual(art(page.logPageHtml({ signedIn: true, count: 0, sessions: '', calendar: '' })), [], 'not over a signed-in log');
  assert.deepEqual(art(page.mePageHtml({ signedIn: false })), ['me-shelf']);
  assert.deepEqual(art(page.mePageHtml({ signedIn: true, section: 'saved', saved: [], climbed: [], isModerator: false, pendingCount: 0 })), [], 'not on a signed-in /me (first-run art and the seal live there)');
  for (const k of ['', '../x', 'constructor', undefined]) assert.equal(page.pageArtHtml(k), '');
});

// ----- open / closed fragments (hours.js -> ctx.hours) ---------------------------------------------------------------
test('open/closed fragment: row, card, carousel card and peek card carry it; row and card keep their structure; unknown renders nothing', async () => {
  const { list } = await modules;
  const open = { state: 'open', text: 'Open · until 10pm' }, closed = { state: 'closed', text: 'Closed · opens 6am' };
  const frag = (html) => [...html.matchAll(/<(span|p) class="([a-z-]+) hours-state hours-state--(open|closed) tnum" data-hours-id="([^"]*)">([^<]*)<\/\1>/g)].map(m => m.slice(2));
  for (const [b, cls] of [['rowHtml', 'gym-row-hours'], ['cardHtml', 'gym-card-hours'], ['carouselCardHtml', 'carousel-card-hours'], ['peekHtml', 'peek-hours']]) {
    assert.deepEqual(frag(list[b](benignSpot, { ...ctxBenign, hours: open })), [[cls, 'open', benignSpot.id, 'Open · until 10pm']], b);
    assert.deepEqual(frag(list[b](benignSpot, { ...ctxBenign, hours: closed })), [[cls, 'closed', benignSpot.id, 'Closed · opens 6am']], b);
    for (const none of [undefined, null, { state: 'unknown', text: 'Open' }, { state: 'open', text: '' }, { state: 'open' }, { state: 'maybe', text: 'x' }, 'open']) {
      const html = list[b](benignSpot, { ...ctxBenign, hours: none });
      assert.deepEqual(frag(html), [], b + ' renders nothing for ' + JSON.stringify(none));
      assert.equal(html, list[b](benignSpot, ctxBenign), b + ': identical to no hours at all');
    }
  }
  // the row stays one 56px line: the fragment is one extra span inside the meta line, not a new line or element type
  const plain = shape(list.rowHtml(benignSpot, ctxBenign)), withHours = shape(list.rowHtml(benignSpot, { ...ctxBenign, hours: open }));
  assert.deepEqual(withHours.filter((t, i) => t !== plain[i]).length >= 1, true);
  assert.equal(withHours.length, plain.length + 1);
  assert.match(list.rowHtml(benignSpot, { ...ctxBenign, hours: open }), /aria-label="Boulder Barn, [^"]*, Surry Hills · New South Wales, Open · until 10pm"/, 'the row\'s accessible name says it');
});

test('open/closed fragment: hostile hours (strings in the database, or a hostile ctx.hours) cannot add markup', async () => {
  const { list } = await modules;
  const hours = await import('../js/modules/hours.js');
  const info = await import('../js/modules/gym-info.js');
  const now = new Date('2027-01-08T12:00:00Z');
  for (const h of HOSTILE) {
    // through the real pipeline: a hostile day string is not understood, so the gym is unknown and nothing renders
    const gym = { ...benignSpot, country: 'GB', hours: { fri: h, thu: h } };
    const line = hours.statusLine(hours.status(gym, now, { userLocation: null }));
    assert.equal(line, null, 'unreadable hours => no status: ' + h);
    for (const b of BUILDERS) {
      const html = list[b](gym, { ...ctxBenign, hours: line });
      assert.equal(html, list[b](gym, ctxBenign));
      assert.ok(!/hours-state/.test(html), b + ': fragment rendered for hostile hours');
    }
    // a hostile ctx.hours text is escaped, a hostile state is dropped
    for (const b of BUILDERS) {
      const html = list[b](benignSpot, { ...ctxBenign, hours: { state: 'open', text: h } });
      assert.deepEqual(shape(html).filter(t => !shape(list[b](benignSpot, { ...ctxBenign, hours: { state: 'open', text: 'Open' } })).includes(t)), [], b + ': structure changed for text ' + h);
      assert.equal(hasHandlerAttrs(html), false);
      assert.ok(!/<script/i.test(html));
      assert.ok(!/hours-state/.test(list[b](benignSpot, { ...ctxBenign, hours: { state: h, text: 'Open' } })), b + ': hostile state accepted');
    }
    // the gym page's Today line shows the gym's own text, escaped, with the state word only when we know it
    const rows = info.essentialsRowsHtml({ hours: { fri: h } }, { today: 'fri', hoursStatus: 'open' });
    assert.ok(!/<script/i.test(rows) && !hasHandlerAttrs(rows), 'essentials: ' + h);
  }
});

test('gym page Essentials: the Today line gets a dot and the word only when the state is known', async () => {
  const info = await import('../js/modules/gym-info.js');
  const g = { hours: { fri: '6am-10pm', sat: '8am-8pm' } };
  assert.match(info.essentialsRowsHtml(g, { today: 'fri', hoursStatus: 'open' }), /<summary><span class="hours-state hours-state--open"><span class="hours-dot" aria-hidden="true"><\/span>Open<\/span> · Today: 6am-10pm<\/summary>/);
  assert.match(info.essentialsRowsHtml(g, { today: 'sat', hoursStatus: 'closed' }), /<summary><span class="hours-state hours-state--closed"><span class="hours-dot" aria-hidden="true"><\/span>Closed<\/span> · Today: 8am-8pm<\/summary>/);
  assert.match(info.essentialsRowsHtml(g, { today: 'fri' }), /<summary>Today: 6am-10pm<\/summary>/, 'unknown: as before');
  assert.match(info.essentialsRowsHtml(g, { today: 'fri', hoursStatus: 'bogus' }), /<summary>Today: 6am-10pm<\/summary>/);
  assert.match(info.essentialsRowsHtml(g, { today: 'tue', hoursStatus: 'open' }), /<summary>Opening hours<\/summary>/, 'no entry for today: no state word');
});
