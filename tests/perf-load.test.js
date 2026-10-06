'use strict';
// Cold-load performance (final-stage audit): Explore reads only its columns, pages in parallel and renders before the
// contributor counts; whole rows are fetched per gym where they are needed.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

test('Explore reads only its columns: no research notes, no gym-information fields in the cold load', () => {
  const src = read('js/modules/data-load.js');
  const cols = /export const LIST_COLUMNS = '([^']+)';/.exec(src)[1].split(',');
  for (const c of ['id', 'name', 'suburb', 'state', 'country', 'lat', 'lng', 'types', 'address', 'photo', 'slug', 'community', 'edited', 'verified_at', 'created_at', 'submitted_by', 'hours'])
    assert.ok(cols.includes(c), 'needed by Explore: ' + c);
  // hours rides along (rows, cards, the peek card and the Open now filter say open/closed from it); the rest of the gym information stays out
  for (const c of ['notes', 'website', 'day_pass', 'facilities', 'rejection_reason']) assert.ok(!cols.includes(c), 'not in the cold load: ' + c);
  assert.ok(!/from\('spots'\)\.select\('\*'\)\.eq\('status','approved'\)/.test(src), 'the bulk read is not select(*)');
  assert.match(src, /select\(LIST_COLUMNS\)/);
  assert.ok(!/count: 'exact'/.test(src), 'no count round trip before the rest of the pages');
  assert.match(src, /await Promise\.all\(Array\.from\(\{ length: BATCH \}/, 'pages read in parallel batches');
});

test('whole rows load on demand where they are shown or edited, cached per gym', () => {
  const data = read('js/modules/data-load.js');
  assert.match(data, /export function loadFullSpot\(g\)/);
  assert.match(data, /\.select\('\*'\)\.eq\('id', g\.id\)\.eq\('status', 'approved'\)\.maybeSingle\(\)/, 'one approved row (public, so the service worker may cache it)');
  assert.match(data, /await loadFullSpots\(appState\.pendingEdits\.map\(e => e\.spot_id\)\);/, '/mod diffs compare whole rows');
  const gp = read('js/modules/gym-page.js');
  assert.match(gp, /const before = visibleInfo\(g\);/); assert.match(gp, /visibleInfo\(full\) !== before/, 're-render only when the whole row adds something visible');
  assert.match(read('js/modules/modals.js'), /await loadFullSpot\(g\);/);
});

test('boot renders the map and list before the contributor counts and the signed-in reads', () => {
  const main = read('js/main.js');
  const i = main.indexOf('await loadSpots();');
  const tail = main.slice(i);
  assert.ok(tail.indexOf('render();') < tail.indexOf('loadContributorCounts()'), 'first render precedes the counts');
  assert.ok(!/await loadContributorCounts\(\);\s*appState\.loaded = true;/.test(main));
  assert.match(read('index.html'), /<link rel="preconnect" href="https:\/\/thayxaampaelvntoaido\.supabase\.co" crossorigin>/);
});

test('the gym-list read starts before the app runs, with the same columns, and is taken once', () => {
  const html = read('index.html');
  const at = s => { const i = html.indexOf(s); assert.ok(i >= 0, 'script tag missing: ' + s); return i; };
  assert.ok(at('js/supabase-init.js') < at('js/spots-prefetch.js') && at('js/auth.js') < at('js/spots-prefetch.js'), 'after the client exists');
  assert.ok(at('<script src="js/spots-prefetch.js">') < at('<script type="module" src="js/main.js">'), 'before the app');
  const pre = read('js/spots-prefetch.js');
  const data = read('js/modules/data-load.js');
  assert.equal(/const columns = '([^']+)';/.exec(pre)[1], /export const LIST_COLUMNS = '([^']+)';/.exec(data)[1], 'same columns as loadSpots');
  assert.match(pre, /\.eq\('status', 'approved'\)/); assert.ok(!/count: 'exact'/.test(pre), 'no count round trip');
  assert.match(pre, /await Promise\.all\(Array\.from\(\{ length: BATCH \}/, 'pages read in parallel batches');
  assert.match(data, /window\.spotsPrefetch\.columns === LIST_COLUMNS/, 'ignored if the columns ever drift');
  assert.match(data, /const early = prefetched; prefetched = null;/, 'a later reload (moderation) reads afresh');
  assert.match(read('sw.js'), /'js\/spots-prefetch\.js',/);
});

// Lazy map (TASKS: Map performance): MapLibre is no longer a parser-blocking script; map.js loads it after the first list
// render, and the module graph is preloaded so it is not discovered one import level at a time.
const MODULE_GRAPH = () => {
  const seen = new Set();
  (function walk(f) {
    if (seen.has(f)) return; seen.add(f);
    for (const m of read(f).matchAll(/(?:import|export)[^'"]*?from\s*['"](\.[^'"]+)['"]/g)) walk(path.posix.join(path.posix.dirname(f), m[1]));
  })('js/main.js');
  return seen;
};

test('index.html does not load MapLibre; map.js does, pinned to the stylesheet version with SRI', () => {
  const html = read('index.html');
  assert.ok(!/<script[^>]+maplibre-gl/.test(html), 'no MapLibre script tag in the shell');
  const css = /unpkg\.com\/maplibre-gl@([\d.]+)\/dist\/maplibre-gl\.css/.exec(html);
  assert.ok(css, 'the MapLibre stylesheet stays in the shell');
  const map = read('js/modules/map.js');
  assert.ok(map.includes(`const MAPLIBRE_SRC = 'https://unpkg.com/maplibre-gl@${css[1]}/dist/maplibre-gl.js';`), 'same version as the stylesheet');
  assert.match(map, /const MAPLIBRE_SRI = 'sha384-[A-Za-z0-9+/]{64}';/);
  assert.match(map, /s\.integrity = MAPLIBRE_SRI; s\.crossOrigin = 'anonymous';/, 'SRI + CORS, as the script tag had (the service worker caches it)');
  assert.ok(!/new maplibregl\.Map\(/.test(map.slice(0, map.indexOf('export function startMap'))), 'no map is made at import time');
  for (const f of ['js/modules/mini-map.js', 'js/modules/add-page.js']) assert.match(read(f), /mapLibrary\(\)\.then\(/, f + ' waits for the library');
});

test('boot starts the map after the first render, with a backstop for a slow read', () => {
  const main = read('js/main.js');
  const timer = main.indexOf('const mapTimer = setTimeout(startMap, 4000);');
  assert.ok(timer >= 0 && timer < main.indexOf('await loadSpots();'), 'the backstop is armed before the read');
  const tail = main.slice(main.indexOf('applyLanding();'));
  assert.ok(tail.indexOf('render();') < tail.indexOf('startMap();'), 'MapLibre loads after the first render');
  assert.match(tail, /clearTimeout\(mapTimer\);\s*startMap\(\);/);
});

test('the shell preloads exactly the module graph of js/main.js', () => {
  const pre = new Set([...read('index.html').matchAll(/<link rel="modulepreload" href="([^"]+)" fetchpriority="low">/g)].map(m => m[1]));
  assert.deepEqual([...pre].sort(), [...MODULE_GRAPH()].sort(), 'add or remove the modulepreload links when imports change');
});
