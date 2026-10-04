// history.js: looking back through verified batches imported after the baseline (location updates AND inserts), verified against
// the index each batch was planned against. Offline; synthetic repo roots only.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const S = require('../scripts/lib/gym-import/index-store');
const H = require('../scripts/lib/gym-import/history');
const { contentHash } = require('../scripts/lib/gym-import/normalize');
const { tmp, PROD } = require('./helpers/import-helpers');

const indexOf = rows => { const d = tmp(); S.write(rows, d, { source: 'test' }); return S.load(d); };
const NEW_GYM = { id: 'g-aaaaaaaaaa', name: 'Summit Lab', suburb: 'Newtown', state: 'NSW', country: 'AU', lat: -33.897, lng: 151.179, address: '1 King St', types: ['indoor-bouldering'], notes: null, photo: null };
const MOVED = { ...PROD[0], lat: -33.8811, lng: 151.2109 };

function writeBatch(root, id, { manifest, plan }) {
  const dir = path.join(root, 'import', 'batches', id);
  fs.mkdirSync(dir, { recursive: true });
  const base = { schema_version: 1, batch_id: id, target: { kind: 'production', host: 'x.supabase.co' }, payload_sha256: 'f'.repeat(64), verification: { ok: true, checked: 1, problems: [] } };
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify({ ...base, ...manifest }));
  if (plan) fs.writeFileSync(path.join(dir, 'plan.json'), JSON.stringify(plan));
}

// baseline (T0) -> location update of seed-100 (T1) -> insert of NEW_GYM (T2). Batch ids deliberately sort in the OPPOSITE order to
// their finish times, so the look-back must order by the manifest's finished_at, not by name.
function world({ currentRows, insertIds = [NEW_GYM.id], planInsertIds = insertIds } = {}) {
  const root = tmp();
  const A = indexOf(PROD), B = indexOf([MOVED, ...PROD.slice(1)]);
  const C = currentRows || [MOVED, ...PROD.slice(1), NEW_GYM];
  S.write(C, path.join(root, 'import', 'index'), { source: 'test' });
  writeBatch(root, H.BASELINE_BATCH, { manifest: { status: 'imported', ids: ['g-0000000000'], finished_at: '2026-09-24T00:00:00.000Z' } });
  writeBatch(root, '2026-12-01-updates', { manifest: { kind: 'update', status: 'updated', ids: ['seed-100'], finished_at: '2026-10-01T00:00:00.000Z' },
    plan: { index: { sha256: A.sha256, count: A.entries.length }, records: [{ class: 'update', id: 'seed-100', expect_h: contentHash(PROD[0]), changes: [{ field: 'lat', before: PROD[0].lat, after: MOVED.lat }, { field: 'lng', before: PROD[0].lng, after: MOVED.lng }] }] } });
  writeBatch(root, '2026-10-02-nz', { manifest: { status: 'imported', ids: insertIds, finished_at: '2026-10-02T00:00:00.000Z' },
    plan: { index: { sha256: B.sha256, count: B.entries.length }, records: planInsertIds.map(id => ({ class: 'new', id })).concat([{ class: 'rejected', id: 'g-bbbbbbbbbb' }]) } });
  return { root, A, index: S.load(path.join(root, 'import', 'index')) };
}

test('history: later batches are found newest first by finished_at; the baseline is not one of them', () => {
  const { root } = world();
  const later = H.laterBatches(root);
  assert.deepEqual(later.map(b => [b.id, b.kind]), [['2026-10-02-nz', 'insert'], ['2026-12-01-updates', 'update']]);
  assert.deepEqual(later[0].inserts, [NEW_GYM.id], 'only class "new" records are inserts (rejected ones are not)');
  assert.deepEqual(H.updateBatches(root).map(b => b.id), ['2026-12-01-updates']);
});

test('history: revertIndex undoes a later insert batch and a location update and lands exactly on the earlier index', () => {
  const { root, A, index } = world();
  const r = H.revertIndex(index, root);
  assert.equal(r.sha256, A.sha256);
  assert.deepEqual(r.removedInserts, [NEW_GYM.id]);
  assert.deepEqual(r.revertedUpdates, ['seed-100']);
  assert.equal(r.byId.has(NEW_GYM.id), false);
  assert.equal(r.byId.get('seed-100').lat, PROD[0].lat);
});

test('history: an unexplained gym (approved outside the pipeline) makes the look-back throw instead of hiding it', () => {
  const extra = { ...NEW_GYM, id: 'community-0f3a7c2e-9999-4222-8333-444455556666', name: 'Other Gym', lat: -34.5, lng: 150.9 };
  const { root, index } = world({ currentRows: [MOVED, ...PROD.slice(1), NEW_GYM, extra] });
  assert.throws(() => H.revertIndex(index, root), /insert batch 2026-10-02-nz: undoing it does not give the index it was planned against/);
});

test('history: an inserted id missing from the index, or a manifest that disagrees with plan.json, throws', () => {
  const missing = world({ currentRows: [MOVED, ...PROD.slice(1)] });
  assert.throws(() => H.revertIndex(missing.index, missing.root), /g-aaaaaaaaaa is not in the index/);
  const forged = world({ insertIds: [NEW_GYM.id], planInsertIds: [NEW_GYM.id, 'g-cccccccccc'] });
  assert.throws(() => H.laterBatches(forged.root), /plan\.json and manifest\.json name different gyms/);
});

test('history: revertLiveRows leaves out rows a later insert batch added and shows updated rows at their earlier values', () => {
  const { root } = world();
  const live = [MOVED, ...PROD.slice(1), NEW_GYM].map(r => ({ id: r.id, name: r.name, country: r.country, lat: r.lat, lng: r.lng, address: r.address }));
  const r = H.revertLiveRows(live, root);
  assert.equal(r.removed, 1);
  assert.equal(r.reverted, 1);
  assert.deepEqual(r.rows.map(x => x.id).sort(), PROD.map(x => x.id).sort());
  assert.equal(r.rows.find(x => x.id === 'seed-100').lat, PROD[0].lat);
});

test('history: the real repository still reconstructs the index each verified batch was planned against', () => {
  const r = H.revertIndex(S.load());
  const plan = JSON.parse(fs.readFileSync(path.join(S.ROOT, 'import', 'batches', '2026-09-30-location-updates', 'plan.json'), 'utf8'));
  assert.equal(r.sha256, plan.index.sha256);
});

// ---- retirements (updater.js "retire" records: closed / duplicate gyms set to rejected, so they left the approved set and the index) ----
// baseline A -> location update of seed-100 (index B) -> retirement of seed-101 (current index C = B minus seed-101).
function retireWorld({ currentRows, manifestRetired = ['seed-101'], entry } = {}) {
  const root = tmp();
  const A = indexOf(PROD), B = indexOf([MOVED, ...PROD.slice(1)]);
  const C = currentRows || [MOVED, PROD[2], PROD[3]];
  S.write(C, path.join(root, 'import', 'index'), { source: 'test' });
  writeBatch(root, H.BASELINE_BATCH, { manifest: { status: 'imported', ids: ['g-0000000000'], finished_at: '2026-09-24T00:00:00.000Z' } });
  writeBatch(root, '2026-10-01-updates', { manifest: { kind: 'update', status: 'updated', ids: ['seed-100'], finished_at: '2026-10-01T00:00:00.000Z' },
    plan: { index: { sha256: A.sha256, count: A.entries.length }, records: [{ class: 'update', id: 'seed-100', expect_h: contentHash(PROD[0]), changes: [{ field: 'lat', before: PROD[0].lat, after: MOVED.lat }, { field: 'lng', before: PROD[0].lng, after: MOVED.lng }] }] } });
  writeBatch(root, '2026-10-04-retire', { manifest: { kind: 'update', status: 'updated', ids: ['seed-101'], retired: manifestRetired, finished_at: '2026-10-04T00:00:00.000Z' },
    plan: { index: { sha256: B.sha256, count: B.entries.length }, records: [{ class: 'retire', id: 'seed-101', expect_h: B.byId.get('seed-101').h, reason_code: 'closed', retire_reason: 'permanently closed (test)', entry: entry || B.byId.get('seed-101') }] } });
  return { root, A, B, index: S.load(path.join(root, 'import', 'index')) };
}
const FIELDS_OF = e => S.FIELDS.reduce((o, k) => (o[k] = e[k], o), {});

test('history: a retire batch is looked through -- the retired gym is restored exactly as recorded, then the earlier update is undone, each step hash-checked', () => {
  const { root, A, B, index } = retireWorld();
  const later = H.laterBatches(root);
  assert.deepEqual(later.map(b => [b.id, b.kind, b.retires.length, b.updates.length]), [['2026-10-04-retire', 'update', 1, 0], ['2026-10-01-updates', 'update', 0, 1]]);
  const r = H.revertIndex(index, root);
  assert.equal(r.sha256, A.sha256, 'ends on the index the first batch was planned against');
  assert.deepEqual(r.restoredRetired, ['seed-101']);
  assert.deepEqual(FIELDS_OF(r.byId.get('seed-101')), FIELDS_OF(B.byId.get('seed-101')), 'restored with the recorded entry');
  assert.equal(r.byId.get('seed-100').lat, PROD[0].lat);
  assert.equal(r.entries.length, PROD.length);
});

test('history: a retire batch throws on any unexplained difference (gym vanished outside the pipeline, retired gym still indexed, tampered entry, manifest/plan disagreement)', () => {
  const vanished = retireWorld({ currentRows: [MOVED, PROD[3]] });
  assert.throws(() => H.revertIndex(vanished.index, vanished.root), /update batch 2026-10-04-retire: undoing it does not give the index it was planned against/);
  const still = retireWorld({ currentRows: [MOVED, ...PROD.slice(1)] });
  assert.throws(() => H.revertIndex(still.index, still.root), /retired gym seed-101 is still in the index/);
  const B = indexOf([MOVED, ...PROD.slice(1)]);
  const tampered = retireWorld({ entry: { ...B.byId.get('seed-101'), lat: -37.0 } });
  assert.throws(() => H.revertIndex(tampered.index, tampered.root), /undoing it does not give the index it was planned against/);
  const forged = retireWorld({ manifestRetired: [] });
  assert.throws(() => H.laterBatches(forged.root), /retire different gyms/);
  const noEntry = retireWorld({ entry: { id: 'seed-999' } });
  assert.throws(() => H.laterBatches(noEntry.root), /no recorded index entry for the retired gym seed-101/);
});

test('history: revertLiveRows puts a retired gym back (it is no longer an approved live row) and still undoes updates; real drift still shows', () => {
  const { root, B } = retireWorld();
  const view = e => ({ id: e.id, name: e.name, country: e.country, lat: e.lat, lng: e.lng, address: e.address });
  const live = [MOVED, PROD[2], PROD[3]].map(view);
  const r = H.revertLiveRows(live, root);
  assert.equal(r.restored, 1); assert.equal(r.reverted, 1); assert.equal(r.removed, 0);
  assert.deepEqual(r.rows.map(x => x.id).sort(), PROD.map(x => x.id).sort());
  const back = r.rows.find(x => x.id === 'seed-101');
  assert.equal(back.name, B.byId.get('seed-101').name); assert.equal(back.lat, B.byId.get('seed-101').lat); assert.equal('h' in back, false, 'the content hash is not a column');
  assert.equal(r.rows.find(x => x.id === 'seed-100').lat, PROD[0].lat);
  // a live row that is neither the original nor the updated value stays as it is, so drift still fails the provenance checks
  const drift = H.revertLiveRows([{ ...view(MOVED), lat: -30 }, view(PROD[2]), view(PROD[3])], root);
  assert.equal(drift.rows.find(x => x.id === 'seed-100').lat, -30);
  // if the retired gym is (unexpectedly) still a live row, it is not duplicated
  const dup = H.revertLiveRows([view(MOVED), ...PROD.slice(1).map(view)], root);
  assert.equal(dup.rows.filter(x => x.id === 'seed-101').length, 1); assert.equal(dup.restored, 0);
});

test('history: an insert that was later retired unwinds (newest first): the retire restores it, the insert batch then removes it', () => {
  const root = tmp();
  const A = indexOf(PROD), B = indexOf([...PROD, NEW_GYM]);
  S.write(PROD, path.join(root, 'import', 'index'), { source: 'test' });   // current: the new gym was inserted and then retired
  writeBatch(root, H.BASELINE_BATCH, { manifest: { status: 'imported', ids: ['g-0000000000'], finished_at: '2026-09-24T00:00:00.000Z' } });
  writeBatch(root, '2026-10-02-nz', { manifest: { status: 'imported', ids: [NEW_GYM.id], finished_at: '2026-10-02T00:00:00.000Z' }, plan: { index: { sha256: A.sha256, count: A.entries.length }, records: [{ class: 'new', id: NEW_GYM.id }] } });
  writeBatch(root, '2026-10-04-retire', { manifest: { kind: 'update', status: 'updated', ids: [NEW_GYM.id], retired: [NEW_GYM.id], finished_at: '2026-10-04T00:00:00.000Z' },
    plan: { index: { sha256: B.sha256, count: B.entries.length }, records: [{ class: 'retire', id: NEW_GYM.id, entry: B.byId.get(NEW_GYM.id) }] } });
  const r = H.revertIndex(S.load(path.join(root, 'import', 'index')), root);
  assert.equal(r.sha256, A.sha256); assert.deepEqual(r.restoredRetired, [NEW_GYM.id]); assert.deepEqual(r.removedInserts, [NEW_GYM.id]);
  const live = H.revertLiveRows(PROD.map(x => ({ id: x.id, name: x.name })), root);
  assert.equal(live.rows.length, PROD.length); assert.equal(live.restored, 1); assert.equal(live.removed, 1);
});

test('history: a gym-information fill (website/hours) leaves the index and the compared live fields alone when looking back', () => {
  const root = tmp();
  const A = indexOf(PROD);
  S.write(PROD, path.join(root, 'import', 'index'), { source: 'test' });
  writeBatch(root, H.BASELINE_BATCH, { manifest: { status: 'imported', ids: ['g-0000000000'], finished_at: '2026-09-24T00:00:00.000Z' } });
  writeBatch(root, '2026-10-05-gym-info', { manifest: { kind: 'update', status: 'updated', ids: ['seed-100'], finished_at: '2026-10-05T00:00:00.000Z' },
    plan: { index: { sha256: A.sha256, count: A.entries.length }, records: [{ class: 'update', id: 'seed-100', expect_h: contentHash(PROD[0]), changes: [{ field: 'website', before: null, after: 'https://example.com/' }, { field: 'hours', before: null, after: { mon: '9-5' } }] }] } });
  const index = S.load(path.join(root, 'import', 'index'));
  const r = H.revertIndex(index, root);
  assert.equal(r.sha256, A.sha256, 'undoing a fill gives the index it was planned against (the index never carried these fields)');
  assert.deepEqual(r.revertedUpdates, ['seed-100']);
  const rows = PROD.map(p => ({ ...p, website: p.id === 'seed-100' ? 'https://example.com/' : null }));
  const live = H.revertLiveRows(rows, root);
  assert.equal(live.reverted, 0, 'nothing to revert in the compared fields'); assert.deepEqual(live.rows.map(x => x.lat), rows.map(x => x.lat));
});

test('history: an identity update (name/suburb/types) is reverted like a location change; the type tags are compared as a set (the index keeps them sorted, the record lists them in canonical order)', () => {
  const RENAMED = { ...PROD[1], name: 'Vertical Works Fitzroy', suburb: 'Fitzroy North', types: ['indoor-bouldering', 'top-rope', 'lead-climbing'] };
  const changes = [{ field: 'name', before: PROD[1].name, after: RENAMED.name }, { field: 'suburb', before: PROD[1].suburb, after: RENAMED.suburb }, { field: 'types', before: ['indoor-bouldering', 'top-rope'], after: RENAMED.types }];
  const build = (current, recChanges = changes) => {
    const root = tmp(), A = indexOf(PROD);
    S.write(current, path.join(root, 'import', 'index'), { source: 'test' });
    writeBatch(root, '2026-10-06-identity', { manifest: { kind: 'update', status: 'updated', ids: ['seed-101'], finished_at: '2026-10-06T00:00:00.000Z' },
      plan: { index: { sha256: A.sha256, count: A.entries.length }, records: [{ class: 'update', id: 'seed-101', expect_h: contentHash(PROD[1]), changes: recChanges }] } });
    return { root, A, index: S.load(path.join(root, 'import', 'index')) };
  };
  const { root, A, index } = build([PROD[0], RENAMED, ...PROD.slice(2)]);
  assert.deepEqual(index.byId.get('seed-101').types, ['indoor-bouldering', 'lead-climbing', 'top-rope'], 'the index holds the tags sorted');
  const r = H.revertIndex(index, root);
  assert.equal(r.sha256, A.sha256, 'undoing the identity update gives exactly the index it was planned against'); assert.deepEqual(r.revertedUpdates, ['seed-101']);
  assert.equal(r.byId.get('seed-101').name, 'Vertical Works'); assert.equal(r.byId.get('seed-101').suburb, 'Fitzroy'); assert.deepEqual(r.byId.get('seed-101').types, ['indoor-bouldering', 'top-rope']);
  assert.equal(r.byId.get('seed-101').h, contentHash(PROD[1]));
  const live = H.revertLiveRows([PROD[0], RENAMED, ...PROD.slice(2)].map(p => ({ ...p })), root);
  assert.equal(live.reverted, 1); assert.equal(live.rows.find(x => x.id === 'seed-101').name, 'Vertical Works'); assert.deepEqual(live.rows.find(x => x.id === 'seed-101').types, ['indoor-bouldering', 'top-rope']);
  // an index that does not hold the updated value (the batch is not reflected) throws instead of being "reverted"
  const wrong = build([PROD[0], { ...RENAMED, name: 'Someone Else Renamed It' }, ...PROD.slice(2)]);
  assert.throws(() => H.revertIndex(wrong.index, wrong.root), /seed-101\.name in the index is not the updated value/);
  // a row holding another value is left exactly as it is (real drift still shows)
  const drift = H.revertLiveRows([PROD[0], { ...RENAMED, name: 'Someone Else Renamed It' }, ...PROD.slice(2)].map(p => ({ ...p })), root);
  assert.equal(drift.reverted, 0); assert.equal(drift.rows.find(x => x.id === 'seed-101').name, 'Someone Else Renamed It');
});
