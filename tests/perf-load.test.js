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
  for (const c of ['id', 'name', 'suburb', 'state', 'country', 'lat', 'lng', 'types', 'address', 'photo', 'slug', 'community', 'edited', 'verified_at', 'created_at', 'submitted_by'])
    assert.ok(cols.includes(c), 'needed by Explore: ' + c);
  for (const c of ['notes', 'hours', 'website', 'day_pass', 'facilities', 'rejection_reason']) assert.ok(!cols.includes(c), 'not in the cold load: ' + c);
  assert.ok(!/from\('spots'\)\.select\('\*'\)\.eq\('status','approved'\)/.test(src), 'the bulk read is not select(*)');
  assert.match(src, /select\(LIST_COLUMNS, opts\)/); assert.match(src, /page\(0, \{ count: 'exact' \}\)/); assert.match(src, /await Promise\.all\(rest\)/);
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

test('the gym-list read starts before MapLibre loads, with the same columns, and is taken once', () => {
  const html = read('index.html');
  const at = s => { const i = html.indexOf(s); assert.ok(i >= 0, 'script tag missing: ' + s); return i; };
  assert.ok(at('js/supabase-init.js') < at('js/spots-prefetch.js') && at('js/auth.js') < at('js/spots-prefetch.js'), 'after the client exists');
  assert.ok(at('js/spots-prefetch.js') < at('maplibre-gl.js') && at('maplibre-gl.js') < at('js/main.js'), 'before MapLibre, which still precedes the app');
  const pre = read('js/spots-prefetch.js');
  const data = read('js/modules/data-load.js');
  assert.equal(/const columns = '([^']+)';/.exec(pre)[1], /export const LIST_COLUMNS = '([^']+)';/.exec(data)[1], 'same columns as loadSpots');
  assert.match(pre, /\.eq\('status', 'approved'\)/); assert.match(pre, /page\(0, \{ count: 'exact' \}\)/); assert.match(pre, /await Promise\.all\(rest\)/);
  assert.match(data, /window\.spotsPrefetch\.columns === LIST_COLUMNS/, 'ignored if the columns ever drift');
  assert.match(data, /const early = prefetched; prefetched = null;/, 'a later reload (moderation) reads afresh');
  assert.match(read('sw.js'), /'js\/spots-prefetch\.js',/);
});
