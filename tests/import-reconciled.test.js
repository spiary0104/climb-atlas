// Runs the pipeline over the 2,127-record reconciliation result (data/gyms.reconciled.json, untracked, never imported) against
// the committed match index. Skipped when the fixture files are absent (fresh clone). Read-only: production is never touched.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const P = require('../scripts/lib/gym-import/plan');
const S = require('../scripts/lib/gym-import/index-store');
const N = require('../scripts/lib/gym-import/normalize');
const { ROOT, makeBatch, tmp, preImportIndex } = require('./helpers/import-helpers');

const RECONCILED = path.join(ROOT, 'data', 'gyms.reconciled.json');
const DECISIONS = path.join(ROOT, 'data', 'reconciliation', '2026-09-24', 'decisions.json');
const decisions = () => JSON.parse(fs.readFileSync(DECISIONS, 'utf8'));
// Frozen ids are derived from the fields as they were when assigned; an approved carry-over may have replaced some since.
const basis = g => { const c = Object.values(decisions().field_carryovers || {}).find(x => x.retained_final_id === g.id); return c ? { ...g, ...c.was } : g; };
const ORIGINAL = path.join(ROOT, 'data', 'gyms.json');
const HAVE = fs.existsSync(RECONCILED) && fs.existsSync(path.join(ROOT, 'import', 'index', 'gym-index.ndjson'));
const opts = { skip: HAVE ? false : 'data/gyms.reconciled.json or import/index not present' };

let cache = null;
async function run(records = null) {
  const index = preImportIndex();
  const recs = records || JSON.parse(fs.readFileSync(RECONCILED, 'utf8'));
  const b = makeBatch(recs, { id: '2026-09-24-fixture-reconciled' });
  return { plan: await P.planBatch({ dir: b.dir, index }), index, recs, b };
}
const base = async () => (cache = cache || await run());

test('index matches the production snapshot recorded at reconciliation time (1,881 gyms) and is small', opts, async () => {
  const idx = preImportIndex();
  assert.equal(idx.entries.length, 1881);
  assert.equal(S.load().metaMatches, true, 'index-meta.json sha256 must match gym-index.ndjson');
  assert.ok(fs.statSync(path.join(ROOT, 'import', 'index', 'gym-index.ndjson')).size < 600 * 1024);
  assert.deepEqual(Object.keys(idx.entries[0]), S.FIELDS);
  assert.ok(!('notes' in idx.entries[0]) && !('photo' in idx.entries[0]), 'index must not duplicate full records');
});

test('all 1,881 existing production gyms are recognised as existing, each mapped to its own production id', opts, async () => {
  const { plan, index, recs } = await base();
  const ex = plan.records.filter(r => r.class === 'existing');
  assert.equal(ex.length, 1881);
  assert.equal(new Set(ex.map(r => r.match.id)).size, 1881, 'each production gym matched exactly once');
  for (const r of ex) assert.ok(index.byId.has(r.match.id));
  // records already carrying a production id are matched to that very id
  const legacy = recs.filter(g => !g.id.startsWith('g-'));
  assert.equal(legacy.length, 1881);
  const byLine = new Map(plan.records.map(r => [r.line, r]));
  legacy.forEach((g, i) => { const r = plan.records.find(x => x.match && x.match.id === g.id); assert.ok(r, g.id); });
  assert.equal(plan.counts.existing_identical + plan.counts.existing_content_differs, 1881);
  assert.equal(plan.counts.existing_content_differs, 4, 'known differences: 1 edited gym (seed-458) + 3 notes appended to Korean records');
  assert.deepEqual(plan.records.filter(r => r.class === 'existing' && !r.same_content).map(r => r.match.id).sort(), ['seed-1228', 'seed-1238', 'seed-1240', 'seed-458']);
  assert.equal(byLine.size, 2127);
});

test('matching works WITHOUT ids: strip every id and the 1,881 are still recognised (no dependence on seed-* ids or position)', opts, async () => {
  const { recs } = await base();
  const stripped = recs.filter(g => !g.id.startsWith('g-')).map(({ id, ...rest }) => rest);
  const { plan } = await run(stripped);
  assert.equal(plan.counts.existing + plan.counts['probable-duplicate'], 1881);
  assert.equal(plan.counts.new, 0, 'no existing gym may come back as new');
  assert.equal(plan.counts.invalid, 0);
  // the overwhelming majority are outright "existing"; any that are only "probable" must point at their own production gym
  // (production has different gyms with the same name, e.g. two "Pulse Climbing", so truth is keyed by record position in the stripped file)
  const truthByLine = stripped.map((_, i) => recs.filter(g => !g.id.startsWith('g-'))[i].id);
  for (const r of plan.records) {
    const truth = truthByLine[r.line - 1];
    if (r.class === 'existing') assert.equal(r.match.id, truth, r.name);
    else assert.ok(r.candidates.some(c => c.id === truth), 'probable record does not point at its own gym: ' + r.name);
  }
  assert.ok(plan.counts.existing >= 1800, 'existing=' + plan.counts.existing);
});

test('the 246 genuinely new gyms are all recognised as new: none matches production, none is held, none is invalid', opts, async () => {
  const { plan, recs } = await base();
  const newIds = new Set(recs.filter(g => g.id.startsWith('g-')).map(g => g.id));
  assert.equal(newIds.size, 246, '249 found in Stage 0 minus 3 approved in-batch duplicates');
  const cls = plan.records.filter(r => newIds.has(r.id));
  assert.equal(cls.length, 246);
  assert.equal(cls.filter(r => r.class === 'new').length, 246);
  assert.equal(plan.counts.new, 246); assert.equal(plan.counts['probable-duplicate'], 0); assert.equal(plan.counts.invalid, 0); assert.equal(plan.counts.rejected, 0);
  assert.equal(plan.counts.records, 2127);
  assert.deepEqual(plan.blockers, [], 'every record already has an id, no invalid/probable/rejected records');
  assert.equal(cls.every(r => r.id_frozen), true);
  assert.equal(plan.importable, true, plan.blockers.join());
});

test('approved in-batch duplicate decisions: rejected records are absent from the batch, retained ones carry exactly the approved changes, all auditable', opts, async () => {
  const d = decisions(), recs = JSON.parse(fs.readFileSync(RECONCILED, 'utf8'));
  const byId = new Map(recs.map(g => [g.id, g]));
  const pairs = [['g-8213f51019', 'g-7523c09127'], ['g-e8a005400e', 'g-429da12245'], ['g-138cbc8020', 'g-11bb3a6ff4']];
  for (const [keep, drop] of pairs) {
    assert.ok(byId.has(keep), keep + ' retained'); assert.ok(!byId.has(drop), drop + ' must not be in the batch');
    const e = d.duplicates_removed.find(x => x.remove_final_id === drop);
    assert.ok(e, drop + ' documented'); assert.equal(e.retained_final_id, keep); assert.equal(e.same_gym_as_new_final_id, keep);
    assert.equal(e.conclusion, 'SAME PHYSICAL GYM'); assert.ok(e.evidence.length >= 2 && e.action && e.reviewed);
    assert.equal(e.rejected_record.final_id, drop); assert.ok(e.rejected_record.name && e.rejected_record.lat, 'full rejected record preserved');
  }
  // carry-overs applied exactly as approved
  assert.match(byId.get('g-8213f51019').notes, /Also reported: closed Sundays; Daangn post dated Sep 2026/);
  assert.match(byId.get('g-e8a005400e').notes, /day pass 15,000 won; closed Sundays and 2nd\/4th Saturdays/);
  const cd = byId.get('g-138cbc8020'), orig = JSON.parse(fs.readFileSync(ORIGINAL, 'utf8'));
  const B = orig.find(g => g.id === 'seed-1982'), A = orig.find(g => g.id === 'seed-1900');
  assert.equal(cd.name, A.name); assert.equal(cd.address, A.address);
  for (const k of ['lat', 'lng', 'notes', 'suburb', 'state', 'types', 'country']) assert.deepEqual(cd[k], B[k], 'Climb Days ' + k + ' must stay as record B');
  // the retained Mad Gym / Chamonix records differ from their originals in notes only
  for (const [keep, seed] of [['g-8213f51019', 'seed-1891'], ['g-e8a005400e', 'seed-1893']]) {
    const o = orig.find(g => g.id === seed), n = byId.get(keep);
    for (const k of Object.keys(o).filter(k => k !== 'id' && k !== 'notes')) assert.deepEqual(n[k], o[k], keep + ' ' + k);
    assert.ok(n.notes.startsWith(o.notes) && n.notes.length > o.notes.length);
  }
});

test('the rejected records are still recognised as duplicates if they ever come back (fed in alongside the batch)', opts, async () => {
  const d = decisions(), recs = JSON.parse(fs.readFileSync(RECONCILED, 'utf8')).filter(g => g.id.startsWith('g-'));
  const back = d.duplicates_removed.filter(x => x.rejected_record).map(x => { const { final_id, id, ...r } = x.rejected_record; return r; });
  assert.equal(back.length, 3);
  const { plan } = await run([...recs, ...back]);
  assert.equal(plan.counts['probable-duplicate'], 6, 'both sides of each pair are flagged');
  assert.equal(plan.counts.new, 246 - 3);
});

test('the 3 previously confirmed duplicate Korean records do not reappear as new (fed in from the original gyms.json)', { skip: HAVE && fs.existsSync(ORIGINAL) ? false : 'gyms.json/fixture not present' }, async () => {
  const orig = JSON.parse(fs.readFileSync(ORIGINAL, 'utf8'));
  const dups = ['seed-1966', 'seed-1970', 'seed-1971'].map(id => orig.find(g => g.id === id));
  assert.ok(dups.every(Boolean));
  const expectLive = { 'seed-1966': 'seed-1228', 'seed-1970': 'seed-1238', 'seed-1971': 'seed-1240' };
  const clean = dups.map(({ id, ...rest }) => ({ ...rest, __orig: id }));
  const { plan } = await run(clean.map(({ __orig, ...r }) => r));
  plan.records.forEach((r, i) => {
    const orig = clean[i].__orig;
    assert.notEqual(r.class, 'new', orig + ' reappeared as a new gym');
    const ids = r.class === 'existing' ? [r.match.id] : r.candidates.map(c => c.id);
    assert.ok(ids.includes(expectLive[orig]), `${orig} should point at ${expectLive[orig]}, got ${ids}`);
  });
});

test('IDs: every frozen g- id equals the deterministic derivation of its fields at freeze time; derivation ignores order', opts, async () => {
  const { recs } = await base();
  const fresh = recs.filter(g => g.id.startsWith('g-'));
  const used = new Set(recs.filter(g => !g.id.startsWith('g-')).map(g => g.id));
  fresh.forEach(g => { const id = N.deriveId(basis(g), used); used.add(id); assert.equal(id, g.id, g.name); });
  // the approved Climb Days carry-over added a parenthetical Korean name, which the id normalisation ignores, so even a re-derivation gives the same id
  assert.equal(N.deriveId(fresh.find(g => g.id === 'g-138cbc8020'), new Set()), 'g-138cbc8020');
  // the batch planner derives the same ids when they are NOT supplied, whatever the order
  const noIds = fresh.map(g => { const { id, ...r } = basis(g); return r; });
  const shuffled = [...noIds].sort((a, b) => N.idHash(b).localeCompare(N.idHash(a)));
  const a = (await run(noIds)).plan, b = (await run(shuffled)).plan;
  const map = p => Object.fromEntries(p.records.map(r => [r.name + '|' + r.country, r.id]));
  assert.deepEqual(map(a), map(b));
  const expected = Object.fromEntries(fresh.map(g => [basis(g).name + '|' + g.country, g.id]));
  assert.deepEqual(map(a), expected, 'derived ids must equal the ids frozen during reconciliation');
});

test('shuffling the whole 2,127-record file does not change any record\'s class, id or match', opts, async () => {
  const { plan, recs } = await base();
  let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const shuffled = recs.map(r => [rnd(), r]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  const { plan: p2 } = await run(shuffled);
  const key = p => Object.fromEntries(p.records.map(r => [r.name + '|' + r.country + '|' + (r.match ? r.match.id : r.id), r.class + '|' + r.id + '|' + (r.candidates || []).map(c => c.id).sort().join(',')]));
  assert.deepEqual(key(p2), key(plan));
  assert.equal(p2.plan_sha256, plan.plan_sha256, 'plan hash is order-independent');
});

test('rerunning the same import is a no-op: identical plan bytes, and once inserted nothing is new', opts, async () => {
  const { plan, index, recs } = await base();
  const again = (await run()).plan;
  assert.equal(JSON.stringify(again), JSON.stringify(plan));
  // simulate: production now also holds the 246 records the plan would insert
  const inserted = new Set(plan.records.filter(r => r.class === 'new').map(r => r.id));
  const rows = [...preImportIndex().entries.map(e => ({ ...e, notes: null, photo: null })), ...recs.filter(g => inserted.has(g.id))];
  const dir = tmp(); S.write(rows, dir, { source: 'simulated' });
  const b = makeBatch(recs, { id: '2026-09-24-fixture-reconciled' });
  const after = await P.planBatch({ dir: b.dir, index: S.load(dir) });
  assert.equal(after.counts.new, 0, 'nothing may be inserted twice');
  assert.equal(after.counts.existing, 1881 + 246);
});

test('the real index is never modified by planning', opts, async () => {
  const f = path.join(ROOT, 'import', 'index', 'gym-index.ndjson');
  const before = fs.readFileSync(f);
  await run();
  assert.ok(fs.readFileSync(f).equals(before));
});
