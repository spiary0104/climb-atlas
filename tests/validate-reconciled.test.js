// Tests for scripts/validate-reconciled.js: the ORIGINAL pre-import expectations still hold (simulated offline: production without the 246
// imported gyms), the post-import expectations hold for the real state, and each way the two can disagree is a failure.
// "Live production" is taken from the committed match index (id, name, country, lat, lng, address), so no network is used.
//   node --test "tests/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { runChecks, checkOriginalGymsJson, ORIGINAL_GYMS_JSON_BLOB } = require('../scripts/validate-reconciled');
const { readManifest } = require('../scripts/lib/gym-import/manifest');
const S = require('../scripts/lib/gym-import/index-store');
const { ROOT, tmp } = require('./helpers/import-helpers');

const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const BATCH = path.join(ROOT, 'import', 'batches', '2026-09-24-reconciled-new-gyms');
const orig = read('data/gyms.json'), out = read('data/gyms.reconciled.json'), decisions = read('data/reconciliation/2026-09-24/decisions.json');
const REAL_MANIFEST = readManifest(BATCH);
const index = S.load();
const liveRows = idx => idx.entries.map(e => ({ id: e.id, name: e.name, country: e.country, lat: e.lat, lng: e.lng, address: e.address }));
const NEW_IDS = new Set(out.filter(g => g.id.startsWith('g-')).map(g => g.id));
const clone = x => JSON.parse(JSON.stringify(x));
const stub = () => ({ ok: true, detail: 'stubbed (covered by its own tests)' });
const run = (o = {}) => runChecks({ orig, out, decisions, live: liveRows(index), manifest: REAL_MANIFEST, originalCheck: stub, ...o });
const byName = (r, n) => r.results.find(x => x.name.startsWith(n + '.'));
const failedNames = r => r.results.filter(x => !x.ok).map(x => x.name.split('.')[0]);

test('precondition: the committed index is the post-import index (2,127 gyms incl. the 246 imported ids)', () => {
  assert.equal(index.entries.length, 2127); assert.equal(NEW_IDS.size, 246);
  assert.ok([...NEW_IDS].every(id => index.byId.has(id)));
  assert.equal(REAL_MANIFEST.valid, true);
});

test('post-import (the real state): every check passes, state derived from live facts', () => {
  const r = run();
  assert.equal(r.mode, 'post-import'); assert.deepEqual(failedNames(r), [], JSON.stringify(r.results.filter(x => !x.ok)));
  assert.deepEqual([r.summary.liveRows, r.summary.retainedLive, r.summary.newG, r.summary.expectNew], [2127, 2127, 246, 246]);
  assert.match(byName(r, '5').detail, /^post-import: new records: 246 \(expected 249 - 3/);
  assert.match(byName(r, '10').detail, /status imported, 246 rows, approved 1881 -> 2127, ids == the 246 g- records, all live/);
});

test('pre-import logic is PRESERVED: production without the 246 (no manifest) passes the original expectations, incl. "246 new, all absent from live"', () => {
  const r = run({ live: liveRows(index).filter(l => !NEW_IDS.has(l.id)), manifest: { exists: false } });
  assert.equal(r.mode, 'pre-import'); assert.deepEqual(failedNames(r), [], JSON.stringify(r.results.filter(x => !x.ok)));
  assert.deepEqual([r.summary.liveRows, r.summary.retainedLive, r.summary.newG], [1881, 1881, 246]);
  assert.match(byName(r, '5').detail, /^pre-import: new records: 246/);
  assert.match(byName(r, '10').detail, /no manifest, as expected before the import/);
  assert.ok(byName(r, '3').detail.includes('records carrying a live id: 1881 (= live rows 1881)'));
});

test('state consistency: some-but-not-all of the new gyms in production is a failure, in either direction', () => {
  const partial = run({ live: liveRows(index).filter(l => ![...NEW_IDS].slice(0, 5).includes(l.id)) });
  assert.equal(partial.mode, 'INCONSISTENT'); assert.ok(failedNames(partial).includes('0'));
  const onlyFew = run({ live: liveRows(index).filter(l => !NEW_IDS.has(l.id) || [...NEW_IDS].slice(0, 3).includes(l.id)), manifest: { exists: false } });
  assert.equal(onlyFew.mode, 'INCONSISTENT'); assert.ok(failedNames(onlyFew).includes('0'));
});

test('manifest cross-check (check 10): required and matching after import; forbidden before it; never trusted to decide the state', () => {
  const m = REAL_MANIFEST.manifest;
  const asMf = manifest => ({ exists: true, valid: true, problems: [], manifest });
  assert.ok(failedNames(run({ manifest: { exists: false } })).includes('10'), 'post-import without a manifest');
  assert.ok(failedNames(run({ manifest: { exists: true, valid: false, problems: ['bad'], manifest: null } })).includes('10'), 'invalid manifest');
  assert.ok(failedNames(run({ manifest: asMf({ ...m, ids: m.ids.slice(1) }) })).includes('10'), 'ids differ from the dataset');
  assert.ok(failedNames(run({ manifest: asMf({ ...m, rows_inserted: 245 }) })).includes('10'), 'rows_inserted wrong');
  assert.ok(failedNames(run({ manifest: asMf({ ...m, approved_after: m.approved_after + 1 }) })).includes('10'), 'approved delta wrong');
  assert.ok(failedNames(run({ manifest: asMf({ ...m, target: { kind: 'local', host: 'x' } }) })).includes('10'), 'not a production manifest');
  assert.ok(failedNames(run({ manifest: asMf({ ...m, approved_after: 99999 }) })).includes('10'), 'manifest claims more rows than production has');
  // a manifest cannot change the mode: with the 246 absent from live, a claimed import is a failure, not a "post-import" pass
  const pre = run({ live: liveRows(index).filter(l => !NEW_IDS.has(l.id)), manifest: REAL_MANIFEST });
  assert.equal(pre.mode, 'pre-import'); assert.ok(failedNames(pre).includes('10'));
});

test('dataset/production disagreements are caught (each independently)', () => {
  // a production pin moved by 1 m: the reconciled record is no longer "the same gym at the same point"
  const moved = liveRows(index); const i = moved.findIndex(l => NEW_IDS.has(l.id)); moved[i] = { ...moved[i], lat: moved[i].lat + 0.00002 };
  assert.ok(failedNames(run({ live: moved })).includes('2'), 'moved pin');
  // a production gym that the dataset does not know
  assert.ok(failedNames(run({ live: [...liveRows(index), { id: 'seed-99999', name: 'Unknown', country: 'AU', lat: 1, lng: 1, address: null }] })).includes('1'), 'extra production id');
  // a dataset record whose fields no longer hash to its frozen id
  const tampered = clone(out); const t = tampered.find(g => g.id.startsWith('g-')); t.lat += 0.01;
  const r = run({ out: tampered }); assert.ok(failedNames(r).includes('5') && failedNames(r).includes('2'), 'hash/pin mismatch');
  // a new record missing from the dataset
  const missing = clone(out).filter(g => g.id !== [...NEW_IDS][0]);
  assert.ok(failedNames(run({ out: missing })).includes('5') || failedNames(run({ out: missing })).includes('1'), 'missing new record');
  // a live id assigned to a different gym
  const swapped = clone(out); const [a, b] = swapped.filter(g => !g.id.startsWith('g-')); const idA = a.id; a.id = b.id; b.id = idA;
  assert.ok(failedNames(run({ out: swapped })).includes('2'), 'ids swapped between two gyms');
  // an id used twice
  const dup = clone(out); dup[1].id = dup[0].id; assert.ok(failedNames(run({ out: dup })).includes('4'), 'duplicate id');
  // a documented duplicate that reappears in the reconciled dataset
  const back = clone(out); back.push(clone(decisions.duplicates_removed.find(d => d.rejected_record).rejected_record)); assert.ok(failedNames(run({ out: back })).length >= 1, 'rejected duplicate re-added');
});

test('an altered or lost record in the dataset (vs the original data/gyms.json + documented changes) is caught', () => {
  const edited = clone(out); edited.find(g => !g.id.startsWith('g-')).notes = 'silently edited notes';
  assert.ok(failedNames(run({ out: edited })).includes('7'), 'altered');
  const lost = clone(out).slice(1); assert.ok(failedNames(run({ out: lost })).includes('7'), 'lost');
});

test('check 9: the ORIGINAL data/gyms.json is verified against a pinned git blob id (and the tag / local backup when present)', () => {
  const inGit = (() => { try { cp.execSync('git rev-parse --git-dir', { cwd: ROOT, stdio: 'ignore' }); return true; } catch (e) { return false; } })();
  if (inGit) {
    const r = checkOriginalGymsJson(ROOT);
    assert.equal(r.ok, true, r.detail); assert.match(r.detail, /= pinned original/);
    assert.equal(cp.execSync('git hash-object --path=data/gyms.json data/gyms.json', { cwd: ROOT }).toString().trim(), ORIGINAL_GYMS_JSON_BLOB);
  }
  // any other content (not a git checkout, different file) can never pass
  const root = tmp(); fs.mkdirSync(path.join(root, 'data'), { recursive: true }); fs.writeFileSync(path.join(root, 'data', 'gyms.json'), '[]');
  const bad = checkOriginalGymsJson(root); assert.equal(bad.ok, false); assert.doesNotMatch(bad.detail, /= pinned original/);
});
