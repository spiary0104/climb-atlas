// Synthetic-batch tests for the gym-import pipeline: one record of each kind (new, exact duplicate, renamed, moved pin,
// invalid, probable duplicate, update), decisions, id freezing, order independence and idempotency.   node --test "tests/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const P = require('../scripts/lib/gym-import/plan');
const S = require('../scripts/lib/gym-import/index-store');
const { PROD, makeIndex, makeBatch, rec, byName, tmp } = require('./helpers/import-helpers');

const barn = PROD[0];
const asRec = g => ({ name: g.name, suburb: g.suburb, state: g.state, country: g.country, lat: g.lat, lng: g.lng, types: g.types, address: g.address, notes: g.notes, photo: g.photo });

const BATCH = [
  rec(),                                                                                              // 1 genuinely new
  asRec(barn),                                                                                        // 2 exact duplicate, no id
  { id: 'seed-100', ...asRec(barn) },                                                                 // 3 exact duplicate carrying the legacy id
  rec({ name: 'Boulder Barn Reloaded', suburb: 'Surry Hills', lat: barn.lat, lng: barn.lng, address: null }), // 4 renamed existing gym (same spot)
  { ...asRec(PROD[1]), lat: -37.79927, lng: 144.978 },                                                // 5 same gym, pin ~30 m away
  { name: '', suburb: 'X', state: 'NSW', country: 'AU', lat: '12', lng: 151, types: ['indoor-bouldering'], photo: 'javascript:alert(1)' }, // 6 invalid
  rec({ name: 'Studio Nine', suburb: 'Ultimo', lat: -33.87915, lng: 151.19505, address: null }),      // 7 probable duplicate (40 m from Granite Gym, different name)
  { intent: 'update', id: 'seed-100', reason: 'Gym added lead climbing wall', set: { types: ['indoor-bouldering', 'lead-climbing'] } }, // 8 intentional update
  { intent: 'update', id: 'seed-999', reason: 'this id does not exist', set: { notes: 'x' } },         // 9 update of unknown gym
];

async function plan(records, opts = {}) {
  const b = makeBatch(records, opts);
  const p = await P.planBatch({ dir: b.dir, index: opts.index || makeIndex() });
  return { p, b };
}

test('each kind of record lands in its own class, and the report says what would happen', async () => {
  const { p } = await plan(BATCH);
  const cls = n => p.records.find(r => r.line === n).class;
  assert.equal(cls(1), 'new');
  assert.equal(cls(2), 'existing'); assert.equal(cls(3), 'existing');
  assert.equal(cls(4), 'probable-duplicate');
  assert.equal(cls(5), 'existing');
  assert.equal(cls(6), 'invalid');
  assert.equal(cls(7), 'probable-duplicate');
  assert.equal(cls(8), 'update');
  assert.equal(cls(9), 'invalid');
  assert.deepEqual([p.counts.new, p.counts.existing, p.counts.update, p.counts['probable-duplicate'], p.counts.invalid], [1, 3, 1, 2, 2]);
  assert.equal(p.importable, false);
  assert.ok(p.blockers.some(b => /invalid/.test(b)) && p.blockers.some(b => /probable duplicate/.test(b)));
  const { renderReport } = require('../scripts/lib/gym-import/report');
  const text = renderReport(p);
  for (const s of ['NOT importable', 'Insert as NEW gyms | 1', 'Probable duplicates', 'Invalid records', 'Updates to existing gyms', 'nothing was written anywhere except this batch directory']) assert.ok(text.includes(s), s);
});

test('exact duplicates: existing, identical content, matched to the production id (never treated as new)', async () => {
  const { p } = await plan(BATCH);
  const a = p.records.find(r => r.line === 2), b = p.records.find(r => r.line === 3);
  for (const r of [a, b]) { assert.equal(r.id, 'seed-100'); assert.equal(r.match.id, 'seed-100'); assert.equal(r.same_content, true); }
  assert.equal(a.id_frozen, undefined, 'an existing gym is never given a new id');
});

test('renamed existing gym at the same spot is surfaced for review, not merged and not silently added', async () => {
  const { p } = await plan(BATCH);
  const r = p.records.find(x => x.line === 4);
  assert.equal(r.class, 'probable-duplicate');
  assert.equal(r.candidates[0].id, 'seed-100');
  assert.match(r.candidates[0].reason, /renamed|related|co-located/);
});

test('slightly different coordinate for an existing gym: matched as existing, pin difference reported, production data NOT overwritten', async () => {
  const { p } = await plan(BATCH);
  const r = p.records.find(x => x.line === 5);
  assert.equal(r.class, 'existing');
  assert.equal(r.match.id, 'seed-101');
  assert.ok(r.pin_moved_m > 20 && r.pin_moved_m < 60, 'pin_moved_m ' + r.pin_moved_m);
  assert.equal(r.same_content, false);
  assert.ok(r.differing.includes('lat'));
  assert.ok(!p.records.some(x => x.class === 'update' && x.id === 'seed-101'), 'no update was invented');
  assert.ok(r.warnings.some(w => w.code === 'content-differs' && /NOT applied/.test(w.message)));
});

test('invalid records are rejected with specific, actionable messages', async () => {
  const { p } = await plan(BATCH);
  const r = p.records.find(x => x.line === 6);
  const codes = r.errors.map(e => e.code);
  assert.ok(codes.includes('required') && codes.includes('bad-coordinate') && codes.includes('unsafe-photo'), codes.join());
  assert.ok(r.errors.find(e => e.code === 'bad-coordinate').message.includes('JSON number'));
  assert.ok(r.errors.find(e => e.code === 'unsafe-photo').message.includes('http(s)'));
  const u = p.records.find(x => x.line === 9);
  assert.equal(u.errors[0].code, 'unknown-id');
});

test('malformed lines: broken JSON, non-objects, unknown/forbidden fields, bad ids', async () => {
  const { p } = await plan(['{"name": "broken', '[1,2]', JSON.stringify(rec({ status: 'approved' })), JSON.stringify(rec({ community: true, name: 'C' })), JSON.stringify(rec({ lattitude: 1, name: 'Typo' })), JSON.stringify(rec({ id: 'seed-1', name: 'LegacyId' })), JSON.stringify(rec({ id: 'nonsense', name: 'BadId' })), JSON.stringify(rec({ types: ['climbing-wall'], name: 'BadType' })), JSON.stringify(rec({ state: 'ZZ', name: 'BadState' })), JSON.stringify(rec({ lat: 91, name: 'BadLat' }))]);
  assert.ok(p.records.every(r => r.class === 'invalid'), p.records.map(r => r.class).join());
  const code = n => p.records.find(r => r.line === n).errors.map(e => e.code);
  assert.deepEqual(code(1), ['bad-json']); assert.deepEqual(code(2), ['bad-record']);
  assert.ok(code(3).includes('unknown-field')); assert.ok(code(4).includes('forbidden-value')); assert.ok(code(5).includes('unknown-field'));
  assert.ok(code(6).includes('legacy-id-unknown')); assert.ok(code(7).includes('bad-id')); assert.ok(code(8).includes('bad-types')); assert.ok(code(9).includes('bad-state')); assert.ok(code(10).includes('bad-coordinate'));
});

test('probable duplicate (different name, 40 m from an existing gym) is surfaced with the candidate, never merged', async () => {
  const { p } = await plan(BATCH);
  const r = p.records.find(x => x.line === 7);
  assert.equal(r.class, 'probable-duplicate');
  assert.deepEqual(r.candidates.map(c => c.id), ['seed-102']);
  assert.equal(r.candidates[0].reason, 'co-located');
});

test('intentional update: shows before/after, needs a reason, carries expect_h for compare-and-swap, never touches other fields', async () => {
  const { p } = await plan(BATCH);
  const u = p.records.find(x => x.line === 8);
  assert.equal(u.class, 'update');
  assert.deepEqual(u.changes, [{ field: 'types', before: ['indoor-bouldering'], after: ['indoor-bouldering', 'lead-climbing'] }]);
  assert.equal(u.expect_h, makeIndex().byId.get('seed-100').h);
  const noReason = (await plan([{ intent: 'update', id: 'seed-100', set: { notes: 'x' } }])).p.records[0];
  assert.equal(noReason.class, 'invalid'); assert.ok(noReason.errors.some(e => e.code === 'reason-required'));
  const forbidden = (await plan([{ intent: 'update', id: 'seed-100', reason: 'try to change country', set: { country: 'NZ', status: 'pending' } }])).p.records[0];
  assert.equal(forbidden.class, 'invalid'); assert.equal(forbidden.errors.filter(e => e.code === 'field-not-updatable').length, 2);
  const noop = (await plan([{ intent: 'update', id: 'seed-100', reason: 'same value as before', set: { name: 'Boulder Barn' } }])).p.records[0];
  assert.equal(noop.class, 'existing'); assert.equal(noop.match.reason, 'update-is-noop');
});

test('a full record whose content differs from an existing gym is never an update: it is "existing, differs, not applied"', async () => {
  const { p } = await plan([{ ...asRec(barn), name: 'Boulder Barn (renamed by research)', notes: 'changed' }]);
  const r = p.records[0];
  assert.notEqual(r.class, 'update');
  assert.ok(['existing', 'probable-duplicate'].includes(r.class));
  assert.equal(p.counts.update, 0);
  assert.ok(!p.records.some(x => x.class === 'new'));
});

test('ids are deterministic, content-derived and independent of line order', async () => {
  const recs = [rec({ name: 'Alpha Wall', lat: -33.7, lng: 151.1, suburb: 'A' }), rec({ name: 'Beta Wall', lat: -33.71, lng: 151.3, suburb: 'B' }), rec({ name: 'Gamma Wall', lat: -33.72, lng: 151.5, suburb: 'C' })];
  const ids = async list => { const { p } = await plan(list); return Object.fromEntries(p.records.map(r => [r.name, r.id])); };
  const a = await ids(recs), b = await ids([...recs].reverse()), c = await ids(recs);
  assert.deepEqual(a, b); assert.deepEqual(a, c);
  for (const id of Object.values(a)) assert.match(id, /^g-[0-9a-f]{10}$/);
  assert.equal(new Set(Object.values(a)).size, 3);
});

test('freeze-ids writes ids once; later edits to the record do not change the frozen id; freezing is idempotent', async () => {
  const b = makeBatch([rec({ name: 'Delta Wall', suburb: 'D', lat: -33.6, lng: 151.4 })]);
  const index = makeIndex();
  const p1 = await P.planBatch({ dir: b.dir, index });
  assert.equal(p1.records[0].id_frozen, false);
  assert.ok(p1.blockers.some(x => /no frozen id/.test(x)));
  assert.equal(P.freezeIds(b.dir, p1), 1);
  const file = path.join(b.dir, 'records.ndjson');
  const frozen = JSON.parse(fs.readFileSync(file, 'utf8').trim());
  assert.equal(frozen.id, p1.records[0].id);
  // researcher fixes the pin and the name afterwards: id must stay
  fs.writeFileSync(file, JSON.stringify({ ...frozen, name: 'Delta Wall Sydney', lat: -33.61 }) + '\n');
  const p2 = await P.planBatch({ dir: b.dir, index });
  assert.equal(p2.records[0].id, frozen.id); assert.equal(p2.records[0].id_frozen, true);
  assert.equal(P.freezeIds(b.dir, p2), 0);
  assert.equal(p2.importable, true, p2.blockers.join());
});

test('within-batch duplicates are both flagged (order independent); a human decision releases them', async () => {
  const a = rec({ name: 'Twin Rock', suburb: 'T', lat: -33.5, lng: 151.5 }), b = rec({ name: 'Twin Rock (Newtown)', suburb: 'T', lat: -33.5002, lng: 151.5 });
  const fwd = (await plan([a, b])).p, rev = (await plan([b, a])).p;
  for (const p of [fwd, rev]) { assert.equal(p.counts['probable-duplicate'], 2); assert.equal(p.counts.new, 0); }
  assert.deepEqual(fwd.records.map(r => r.id).sort(), rev.records.map(r => r.id).sort());
  const [x, y] = fwd.records;
  // "distinct" must cover every candidate and carry a reason
  const dec = (over) => ({ [x.id]: { decision: 'distinct', reason: 'Two separate gyms in one building (checked both sites)', reviewed_against: [y.id], ...over } });
  assert.equal((await plan([a, b], { decisions: dec() })).p.records.find(r => r.id === x.id).class, 'new');
  assert.equal((await plan([a, b], { decisions: dec({ reviewed_against: [] }) })).p.records.find(r => r.id === x.id).class, 'probable-duplicate', 'stale decision');
  assert.equal((await plan([a, b], { decisions: dec({ reason: '' }) })).p.records.find(r => r.id === x.id).class, 'probable-duplicate', 'reason required');
  const rej = (await plan([a, b], { decisions: { [x.id]: { decision: 'reject', reason: 'duplicate of the other record' } } })).p;
  assert.equal(rej.records.find(r => r.id === x.id).class, 'rejected');
  assert.equal(rej.records.find(r => r.id === y.id).class, 'new', 'rejecting one side releases the other');
});

test('decisions: same-as must name a real existing candidate; unused decisions block the plan', async () => {
  const r7 = rec({ name: 'Studio Nine', suburb: 'Ultimo', lat: -33.87915, lng: 151.19505, address: null });
  const first = (await plan([r7])).p.records[0];
  const ok = (await plan([r7], { decisions: { [first.id]: { decision: 'same-as', same_as: 'seed-102', reason: 'renamed Granite Gym' } } })).p.records[0];
  assert.equal(ok.class, 'existing'); assert.equal(ok.match.id, 'seed-102');
  const bad = (await plan([r7], { decisions: { [first.id]: { decision: 'same-as', same_as: 'seed-101', reason: 'wrong candidate' } } })).p.records[0];
  assert.equal(bad.class, 'probable-duplicate'); assert.match(bad.decision_note, /candidate/);
  const unused = (await plan([rec()], { decisions: { 'g-0000000000': { decision: 'reject', reason: 'nothing here' } } })).p;
  assert.ok(unused.unused_decisions.includes('g-0000000000')); assert.equal(unused.importable, false);
});

test('rerunning is idempotent: identical plan bytes, no writes to the index, and after the gyms exist nothing is new', async () => {
  const index = makeIndex();
  const before = fs.readFileSync(path.join(index.dir, 'gym-index.ndjson'));
  const b = makeBatch([rec({ name: 'Epsilon Wall', suburb: 'E', lat: -33.55, lng: 151.45 }), rec({ name: 'Zeta Wall', suburb: 'Z', lat: -33.56, lng: 151.95 })]);
  const p0 = await P.planBatch({ dir: b.dir, index });
  P.freezeIds(b.dir, p0);
  const p1 = await P.planBatch({ dir: b.dir, index }), p2 = await P.planBatch({ dir: b.dir, index });
  assert.equal(JSON.stringify(p1), JSON.stringify(p2));
  assert.equal(p1.plan_sha256, p2.plan_sha256);
  assert.equal(p1.counts.new, 2);
  assert.ok(fs.readFileSync(path.join(index.dir, 'gym-index.ndjson')).equals(before), 'planning must not modify the index');
  // simulate a completed import: the two gyms are now in "production"
  const rows = [...PROD, ...fs.readFileSync(path.join(b.dir, 'records.ndjson'), 'utf8').trim().split('\n').map(l => JSON.parse(l))];
  const dir2 = tmp(); S.write(rows, dir2, { source: 'simulated' });
  const p3 = await P.planBatch({ dir: b.dir, index: S.load(dir2) });
  assert.equal(p3.counts.new, 0); assert.equal(p3.counts.existing, 2); assert.equal(p3.counts.existing_identical, 2);
  assert.equal(p3.importable, false); assert.ok(p3.blockers.some(x => /nothing to import/.test(x)));
});

test('a second staged batch is compared against the first (cross-batch duplicates surface)', async () => {
  const root = tmp();
  makeBatch([rec({ name: 'Omega Wall', suburb: 'O', lat: -33.3, lng: 151.3 })], { id: '2026-01-01-first', root });
  const second = makeBatch([rec({ name: 'Omega Wall', suburb: 'O', lat: -33.3001, lng: 151.3 })], { id: '2026-01-02-second', root });
  const p = await P.planBatch({ dir: second.dir, index: makeIndex() });
  assert.equal(p.records[0].class, 'probable-duplicate');
  assert.equal(p.records[0].candidates[0].batch, '2026-01-01-first');
  const alone = await P.planBatch({ dir: second.dir, index: makeIndex(), includeStaged: false });
  assert.equal(alone.records[0].class, 'new');
});

test('an id that already belongs to a different production gym is rejected (never overwrites it)', async () => {
  const { p } = await plan([rec({ id: 'seed-101', name: 'Impostor Gym', lat: -33.9, lng: 151.0 })]);
  assert.equal(p.records[0].class, 'invalid'); assert.equal(p.records[0].errors[0].code, 'id-collision');
});

test('a batch with only clean new records is importable; the plan lists insert actions only', async () => {
  const b = makeBatch([rec({ name: 'Eta Wall', suburb: 'H', lat: -33.45, lng: 151.05 })]);
  const index = makeIndex();
  P.freezeIds(b.dir, await P.planBatch({ dir: b.dir, index }));
  const p = await P.planBatch({ dir: b.dir, index });
  assert.equal(p.importable, true, p.blockers.join());
  assert.equal(p.counts.new, 1);
});
