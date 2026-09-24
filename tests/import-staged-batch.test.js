// Regression tests for the first real staging batch (import/batches/2026-09-24-reconciled-new-gyms): 246 genuinely new gyms.
// They pin what "correctly staged" means so a later edit cannot silently add a duplicate, an existing gym or an unfrozen id.
// Parts that need the untracked data/gyms.reconciled.json skip themselves when it is absent.   node --test "tests/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const P = require('../scripts/lib/gym-import/plan');
const S = require('../scripts/lib/gym-import/index-store');
const V = require('../scripts/lib/gym-import/validate');
const { stageFromFile } = require('../scripts/lib/gym-import/stage');
const { ROOT, tmp, rec, preImportIndex, batchImported } = require('./helpers/import-helpers');

const ID = '2026-09-24-reconciled-new-gyms';
const DIR = path.join(ROOT, 'import', 'batches', ID);
const RECONCILED = path.join(ROOT, 'data', 'gyms.reconciled.json');
const DECISIONS = path.join(ROOT, 'data', 'reconciliation', '2026-09-24', 'decisions.json');
const lines = () => fs.readFileSync(path.join(DIR, 'records.ndjson'), 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
// After the (future, approved) production import the batch gets a manifest.json and the real index is rebuilt to include these gyms.
// These tests describe the batch as staged, so they use the pre-import view of the index and skip the checks that only hold before import.
const IMPORTED = batchImported(ID);
const skipNoSource = fs.existsSync(RECONCILED) ? false : 'data/gyms.reconciled.json not present';

test('staged batch: 246 records, every one with a frozen g-<10 hex> id, unique, none colliding with the 1,881 production ids', () => {
  const recs = lines(), index = preImportIndex();
  assert.equal(recs.length, 246);
  assert.equal(index.entries.length, 1881);
  for (const r of recs) assert.match(r.id, /^g-[0-9a-f]{10}$/, r.name);
  assert.equal(new Set(recs.map(r => r.id)).size, 246);
  assert.deepEqual(recs.filter(r => index.byId.has(r.id)).map(r => r.id), [], 'no staged id may equal a production id');
  assert.equal(recs.filter(r => !r.id.startsWith('g-')).length, 0, 'no seed-*/community-* ids: none of the 1,881 existing gyms is staged');
});

test('staged batch: validates cleanly (schema, states, types, coordinates, photo safety)', async () => {
  for (const r of lines()) { const v = await V.validateNewRecord(r); assert.deepEqual(v.errors, [], r.id + ' ' + r.name); }
  const b = P.loadBatch(DIR);
  assert.deepEqual(b.problems, []); assert.equal(b.meta.source.staged, 246); assert.equal(b.meta.source.records_in_source, 2127);
  assert.equal(b.meta.source.not_staged_because_already_in_production, 1881); assert.deepEqual(b.meta.source.not_staged_other, {});
});

test('staged batch: the dry-run plan is 246 new and nothing else, with no blockers; committed plan.json/report.md are the current plan', async () => {
  const plan = await P.planBatch({ dir: DIR, index: preImportIndex() });
  const c = plan.counts;
  assert.deepEqual([c.records, c.new, c.existing, c.update, c['probable-duplicate'], c.invalid, c.rejected], [246, 246, 0, 0, 0, 0, 0]);
  assert.equal(c.new_id_not_frozen, 0);
  assert.deepEqual(plan.staged_batches_compared, []);
  if (IMPORTED) {                                                  // after import: the only blocker is "already imported"; the committed plan is a historical record
    assert.deepEqual(plan.blockers, ['batch already has a manifest.json (already imported)']); assert.equal(plan.importable, false);
    return;
  }
  assert.deepEqual(plan.blockers, []); assert.equal(plan.importable, true);
  const committed = JSON.parse(fs.readFileSync(path.join(DIR, 'plan.json'), 'utf8'));
  assert.equal(JSON.stringify(plan), JSON.stringify(committed), 'plan.json is stale: re-run "plan" and commit it');
  const { renderReport } = require('../scripts/lib/gym-import/report');
  assert.equal(renderReport(plan) + '\n', fs.readFileSync(path.join(DIR, 'report.md'), 'utf8'));
});

test('staged batch: contains none of the rejected/duplicate records and reflects the three approved decisions', () => {
  const d = JSON.parse(fs.readFileSync(DECISIONS, 'utf8')), recs = lines(), byId = new Map(recs.map(r => [r.id, r]));
  const rejected = d.duplicates_removed.filter(x => x.rejected_record);
  assert.equal(rejected.length, 3);
  for (const x of rejected) {
    assert.ok(!byId.has(x.remove_final_id), x.remove_final_id + ' (rejected) must not be staged');
    assert.ok(byId.has(x.retained_final_id), x.retained_final_id + ' (retained) must be staged');
    const { final_id, id, ...snap } = x.rejected_record;
    assert.ok(!recs.some(r => r.name === snap.name && r.lat === snap.lat && r.lng === snap.lng), 'rejected record content must not be staged');
  }
  // the earlier Stage 0 duplicates of production gyms are not staged either (by id and by name+pin)
  for (const x of d.duplicates_removed.filter(x => x.same_gym_as_live_id)) assert.ok(!byId.has(x.remove_repo_id));
  assert.match(byId.get('g-8213f51019').notes, /closed Sundays; Daangn post dated Sep 2026/);
  assert.match(byId.get('g-e8a005400e').notes, /day pass 15,000 won/);
  assert.equal(byId.get('g-138cbc8020').name, 'Climb Days (클라임데이즈)');
  assert.equal(byId.get('g-138cbc8020').address, '경기도 안양시 만안구 덕천로152번길 25 (안양동)');
  assert.equal(byId.get('g-138cbc8020').lat, 37.3930261);   // record B's verified pin is kept
  // and the pipeline itself would still catch any of them if they came back
});

test('staged batch equals the reconciled dataset\'s new records exactly (same records, same order, same content)', { skip: skipNoSource }, () => {
  const all = JSON.parse(fs.readFileSync(RECONCILED, 'utf8'));
  const idx = preImportIndex();
  const expected = all.filter(g => !idx.byId.has(g.id));
  assert.equal(expected.length, 246);
  assert.equal(JSON.stringify(lines()), JSON.stringify(expected));
  assert.equal(all.length - expected.length, 1881);
  const b = P.loadBatch(DIR);
  assert.equal(b.meta.source.canonical_sha256, require('../scripts/lib/gym-import/stage').canonicalSha(all), 'batch.json provenance must match the reconciled file it was staged from');
});

test('staging is idempotent and safe: same source again = unchanged; a different source into the same batch is refused', { skip: skipNoSource }, async () => {
  const all = JSON.parse(fs.readFileSync(RECONCILED, 'utf8')), index = preImportIndex();
  const root = tmp(), args = { source: RECONCILED, slug: 'reconciled-new-gyms', description: 'test staging of the reconciled new gyms', date: '2026-09-24', index, batchesDir: root };
  const first = await stageFromFile(args), second = await stageFromFile(args);
  assert.equal(first.action, 'created'); assert.equal(second.action, 'unchanged'); assert.equal(first.staged, 246);
  const before = fs.readFileSync(path.join(first.dir, 'records.ndjson'));
  const otherSrc = path.join(tmp(), 'other.json');
  fs.writeFileSync(otherSrc, JSON.stringify([...all, rec({ name: 'Brand New Extra Gym', lat: -33.3, lng: 151.9 })]));
  await assert.rejects(() => stageFromFile({ ...args, source: otherSrc }), /already exists and differs/);
  assert.ok(fs.readFileSync(path.join(first.dir, 'records.ndjson')).equals(before), 'refused staging must not modify the batch');
});

test('staging never stages existing records, and refuses to stage anything the decisions file lists as rejected', async () => {
  const N = require('../scripts/lib/gym-import/normalize');
  const src = path.join(tmp(), 'src.json'), index = preImportIndex();
  const a = rec({ name: 'Fresh Wall One', suburb: 'A', lat: -33.11, lng: 151.11 }), b = rec({ name: 'Fresh Wall Two', suburb: 'B', lat: -33.22, lng: 151.44 });
  a.id = N.deriveId(a, new Set()); b.id = N.deriveId(b, new Set([a.id]));
  const existing = { id: 'seed-0', name: '9 Degrees Alexandria', suburb: 'Alexandria', state: 'NSW', country: 'AU', lat: -33.9042, lng: 151.1968, types: ['indoor-bouldering'], address: "Building 3/85 O'Riordan St, Alexandria NSW 2015", notes: null };
  fs.writeFileSync(src, JSON.stringify([a, b, existing]));
  const args = { source: src, slug: 'synthetic-stage', description: 'synthetic staging test', date: '2026-01-01', index };
  const ok = await stageFromFile({ ...args, batchesDir: tmp() });
  assert.equal(ok.staged, 2); assert.deepEqual(ok.byClass, { new: 2, existing: 1 });
  const staged = fs.readFileSync(path.join(ok.dir, 'records.ndjson'), 'utf8').trim().split('\n').map(l => JSON.parse(l));
  assert.deepEqual(staged.map(r => r.id), [a.id, b.id], 'the existing gym is not copied into the batch');
  const guarded = tmp();
  await assert.rejects(() => stageFromFile({ ...args, batchesDir: guarded, mustExclude: [b.id] }), /listed as rejected.*g-/);
  assert.deepEqual(fs.readdirSync(guarded), [], 'a refused staging writes nothing');
});

test('production boundary for staging: data/gyms.json is unchanged; before import nothing is imported, after import the manifest matches the batch', () => {
  cp.execSync('git diff --quiet -- data/gyms.json', { cwd: ROOT });                           // no unstaged edits (compares with the index, so a deliberate, staged change during an integration is fine)
  const idx = S.load();
  assert.equal(idx.metaMatches, true);
  const mf = path.join(DIR, 'manifest.json');
  if (!IMPORTED) { assert.equal(idx.entries.length, 1881); assert.equal(fs.existsSync(mf), false, 'nothing has been imported'); return; }
  const m = JSON.parse(fs.readFileSync(mf, 'utf8'));
  assert.match(m.status, /^imported/); assert.deepEqual(m.ids, lines().map(r => r.id)); assert.equal(m.rows_inserted, 246);
});
