// The offline list: data/spots-fallback.json (an id-correct export from production) replaced the legacy data/gyms.json at
// runtime, and "Revert to original" (which needed the legacy file) is gone.   node --test "tests/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
function walk(dir, out = []) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = dir + '/' + e.name;
    if (e.isDirectory()) walk(rel, out); else out.push(rel);
  }
  return out;
}
const listColumns = () => /export const LIST_COLUMNS = '([^']+)'/.exec(read('js/modules/data-load.js'))[1].split(',');

test('data-load.js fetches data/spots-fallback.json (once) and loadSpots falls back to it when Supabase is missing', async () => {
  const calls = [];
  const rows = [{ id: 'g-1', name: 'Alpha', lat: 1, lng: 2, types: [] }, { id: 'g-2', name: 'Beta', lat: 3, lng: 4, types: [] }];
  globalThis.window = {};                       // data-load.js reads window.sb / window.spotsPrefetch at load
  globalThis.fetch = async (url) => { calls.push(String(url)); return { ok: true, json: async () => rows }; };
  try {
    const { ensureFallbackData, loadSpots } = await import('../js/modules/data-load.js');
    const { appState } = await import('../js/modules/state.js');
    assert.deepEqual(await ensureFallbackData(), rows);
    assert.deepEqual(await ensureFallbackData(), rows);
    assert.deepEqual(calls, ['data/spots-fallback.json'], 'one fetch of the new file, nothing else');
    await loadSpots();
    assert.equal(appState.usingFallback, true);
    assert.deepEqual(appState.spots.map(s => s.id), ['g-1', 'g-2']);
    assert.equal(calls.length, 1, 'the second read comes from memory');
  } finally { delete globalThis.window; delete globalThis.fetch; }
});

test('no runtime code path references the legacy data/gyms.json, SEED_GYMS or ensureSeedData any more', () => {
  const scanned = [...walk('js'), ...walk('css'), ...walk('scripts'), 'index.html', 'sw.js', 'vercel.json', 'supabase/geocode.html',
    ...walk('api').filter(f => /\.(m?js|json)$/.test(f))].filter(f => !/^api\/_places\.json$/.test(f));
  assert.ok(scanned.includes('js/modules/data-load.js') && scanned.includes('scripts/build-sitemap.js'));
  const bad = [];
  for (const f of scanned) {
    const src = read(f).replace(/pre-id-reconciliation:data\/gyms\.json/g, '');   // the path of the file inside the git tag
    if (/data\/gyms\.json|'data', 'gyms\.json'|ensureSeedData/.test(src)) bad.push(f + ': legacy path / ensureSeedData');
    if (f.startsWith('js/') && /SEED_GYMS/.test(src)) bad.push(f + ': SEED_GYMS');
  }
  assert.deepEqual(bad, []);
  assert.equal(fs.existsSync(path.join(ROOT, 'data', 'gyms.json')), false, 'the legacy file is no longer on the public path');
});

test('the provenance copy keeps the original blob id and stays behind the vercel.json redirect', () => {
  assert.ok(fs.existsSync(path.join(ROOT, 'data', 'reconciliation', 'gyms.original.json')));
  const redirects = JSON.parse(read('vercel.json')).redirects.map(r => r.source);
  assert.ok(redirects.includes('/data/reconciliation/:path*'), 'data/reconciliation/ is not served publicly');
  assert.match(read('scripts/validate-reconciled.js'), /ORIGINAL_GYMS_JSON_BLOB = '23bca878ed8324de4dd0fd4f76b514c7028bee1d'/);
});

test('the edit form has no "Revert to original" control, handler or style', () => {
  assert.doesNotMatch(read('index.html'), /eRevertBtn|Revert to original/i);
  assert.doesNotMatch(read('js/modules/modals.js'), /eRevertBtn|revertToOriginal|Revert to original|currentInfo/);
  for (const f of walk('css')) assert.doesNotMatch(read(f), /eRevertBtn/, f);
  assert.doesNotMatch(read('js/modules/data-load.js'), /revert/i);
});

test('the fallback file is not precached by the service worker', () => {
  const shell = /const SHELL_FILES = \[([\s\S]*?)\];/.exec(read('sw.js'))[1];
  assert.ok(shell.includes("'js/modules/data-load.js'"), 'the SHELL_FILES list was found');
  assert.doesNotMatch(shell, /spots-fallback|gyms\.json|\bdata\//);
});

test('buildFallback keeps exactly the Explore list columns, in id order, one gym per line', () => {
  const { buildFallback, listColumns: cols } = require('../scripts/lib/fallback');
  assert.deepEqual(cols(), listColumns(), 'the generator reads LIST_COLUMNS from data-load.js');
  assert.match(read('js/spots-prefetch.js'), new RegExp("const columns = '" + listColumns().join(',') + "'"), 'prefetch uses the same columns');
  const out = buildFallback([{ id: 'a', name: 'A', secret_note: 'x', research: 'long text', lat: 1 }, { id: 'b', name: 'B', hours: { mon: '9-5' } }]);
  const parsed = JSON.parse(out.text);
  assert.equal(out.count, 2);
  assert.deepEqual(parsed.map(r => r.id), ['a', 'b']);
  for (const r of parsed) assert.deepEqual(Object.keys(r), listColumns());
  assert.equal('secret_note' in parsed[0], false);
  assert.equal(parsed[0].suburb, null, 'a missing column is null, like the database list read');
  assert.equal(out.text.split('\n').length, 2 + 2 + 1, 'brackets on their own lines, one gym per line');
});

test('data/spots-fallback.json is a well-formed export: list columns only, unique ids, id order, a full set of gyms', () => {
  const rows = JSON.parse(read('data/spots-fallback.json'));
  assert.ok(Array.isArray(rows) && rows.length > 2000, 'rows: ' + rows.length);
  const cols = listColumns();
  assert.equal(new Set(rows.map(r => r.id)).size, rows.length, 'unique ids');
  for (let i = 1; i < rows.length; i++) assert.ok(rows[i - 1].id < rows[i].id, 'id order at ' + i);
  for (const r of rows) {
    assert.deepEqual(Object.keys(r), cols, r.id);
    assert.ok(typeof r.name === 'string' && Number.isFinite(r.lat) && Number.isFinite(r.lng) && Array.isArray(r.types), r.id);
  }
});
