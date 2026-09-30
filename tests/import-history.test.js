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
