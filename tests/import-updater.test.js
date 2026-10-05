// Maintenance batches (scripts/lib/gym-import/updater.js): location updates (address / lat / lng) and gym-information fills (website /
// hours; the "gym information" section at the end of this file) of existing approved spots, and retirements, each bound to
// the gym's researched content hash (expect_h), with the importer's gates (FULL preflight, confirmation token, production flag),
// a final re-check, one PATCH per gym pinned to updated_at, read-back verification and a manifest.   node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const P = require('../scripts/lib/gym-import/plan');
const S = require('../scripts/lib/gym-import/index-store');
const T = require('../scripts/lib/gym-import/target');
const MF = require('../scripts/lib/gym-import/manifest');
const { runImport } = require('../scripts/lib/gym-import/importer');
const { ROOT, tmp, PROD, makeBatch, rec } = require('./helpers/import-helpers');
const { prodRow, fakeJwt } = require('./helpers/local-stack');

const failing = r => r.checks.filter(c => c.status === 'FAIL').map(c => c.name);
const BASE = () => PROD.map(r => prodRow({ ...r, created_at: 'x', updated_at: 'ts-0', submitted_by: null }));
const upd = (index, id, set, over = {}) => ({ intent: 'update', id, expect_h: index.byId.get(id).h, reason: 'pin from OpenStreetMap node/1 (test)', source: 'OpenStreetMap node/1 (test)', set, ...over });
// Two location corrections that keep clear of every other gym: seed-100 pin + address, seed-102 pin only.
const TWO = ix => [upd(ix, 'seed-100', { lat: -33.882, lng: 151.213, address: '14 Example St, Surry Hills NSW 2010' }), upd(ix, 'seed-102', { lat: -33.8785, lng: 151.196 })];

// A fake production database for the update path: approved/pending reads, and a PATCH that behaves like PostgREST with the
// updated_at filter (0 rows when the row changed). hooks: beforeRead(q, state), beforePatch(u, state) to simulate races.
function fakeProd({ approved, pending = [] }) {
  const state = { approved: approved.map(r => ({ ...r })), pending: pending.map(r => ({ ...r })), patches: [], infoPatches: [], identityPatches: [], retires: [], inserts: 0, hooks: {} };
  let clock = 0;
  const api = {
    async probe() { return { ok: true, status: 200 }; },
    async getAll(q) {
      if (state.hooks.beforeRead) state.hooks.beforeRead(q, state);
      if (q.includes('status=eq.approved')) return state.approved.filter(r => r.status === 'approved').map(r => ({ ...r }));   // state.approved holds every non-pending row (a retired one is 'rejected')
      if (q.includes('status=eq.pending')) return state.pending.map(r => ({ ...r }));
      const m = /id=in\.\(([^)]*)\)/.exec(q); if (m) { const ids = m[1].split(','); return [...state.approved, ...state.pending].filter(r => ids.includes(r.id)).map(r => ({ ...r })); }
      throw new Error('unexpected query ' + q);
    },
    async insertSpots() { state.inserts++; throw new Error('an update batch must never insert'); },
    async updateSpotLocation(u, gate) {
      assert.ok(gate && Array.isArray(gate.updates) && gate.payloadSha, 'only a gated update reaches the database');
      if (state.hooks.beforePatch) state.hooks.beforePatch(u, state);
      state.patches.push({ id: u.id, set: u.set, updatedAt: u.updatedAt });
      const row = state.approved.find(r => r.id === u.id && r.status === 'approved' && r.updated_at === u.updatedAt);
      if (!row) return { ok: true, status: 200, json: [], text: '[]' };
      Object.assign(row, u.set, { updated_at: 'ts-w' + (++clock) });
      return { ok: true, status: 200, json: [{ ...row }], text: '' };
    },
    async updateSpotInfo(u, gate) {
      assert.ok(gate && Array.isArray(gate.updates) && gate.payloadSha, 'only a gated information fill reaches the database');
      assert.ok(Object.keys(u.set).every(k => ['website', 'hours', 'day_pass', 'facilities', 'notes'].includes(k)), 'an information fill carries the gym-information fields only');
      if (state.hooks.beforePatch) state.hooks.beforePatch(u, state);
      state.infoPatches.push({ id: u.id, set: u.set, updatedAt: u.updatedAt });
      const row = state.approved.find(r => r.id === u.id && r.status === 'approved' && r.updated_at === u.updatedAt);
      if (!row) return { ok: true, status: 200, json: [], text: '[]' };
      Object.assign(row, u.set, { updated_at: 'ts-w' + (++clock) });
      return { ok: true, status: 200, json: [{ ...row }], text: '' };
    },
    async updateSpotIdentity(u, gate) {
      assert.ok(gate && Array.isArray(gate.updates) && gate.payloadSha, 'only a gated identity correction reaches the database');
      assert.ok(Object.keys(u.set).every(k => ['name', 'suburb', 'types'].includes(k)), 'an identity correction carries name/suburb/types only (never a slug)');
      if (state.hooks.beforePatch) state.hooks.beforePatch(u, state);
      state.identityPatches.push({ id: u.id, set: u.set, updatedAt: u.updatedAt });
      const row = state.approved.find(r => r.id === u.id && r.status === 'approved' && r.updated_at === u.updatedAt);
      if (!row) return { ok: true, status: 200, json: [], text: '[]' };
      Object.assign(row, u.set, { updated_at: 'ts-w' + (++clock) });
      if (state.hooks.afterIdentityPatch) state.hooks.afterIdentityPatch(row, u);
      return { ok: true, status: 200, json: [{ ...row }], text: '' };
    },
    async retireSpot(u, gate) {
      assert.ok(gate && Array.isArray(gate.retires) && gate.retires.length && gate.payloadSha, 'only a gated retirement reaches the database');
      if (state.hooks.beforePatch) state.hooks.beforePatch(u, state);
      state.retires.push({ id: u.id, reason: u.reason, updatedAt: u.updatedAt });
      const row = state.approved.find(r => r.id === u.id && r.status === 'approved' && r.updated_at === u.updatedAt);
      if (!row) return { ok: true, status: 200, json: [], text: '[]' };
      Object.assign(row, { status: 'rejected', rejection_reason: u.reason, updated_at: 'ts-w' + (++clock) });
      return { ok: true, status: 200, json: [{ ...row }], text: '' };
    },
  };
  return { api, state };
}

async function world({ records = TWO, approved = BASE(), indexRows = null, pending = [], id = '2026-02-01-location-fix' } = {}) {
  const root = tmp();
  fs.mkdirSync(path.join(root, 'js'), { recursive: true }); fs.mkdirSync(path.join(root, 'import', 'batches'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'js', 'supabase-init.js'), path.join(root, 'js', 'supabase-init.js'));
  S.write(indexRows || BASE(), path.join(root, 'import', 'index'), { source: 'fake production' });
  const index = S.load(path.join(root, 'import', 'index'));
  const b = makeBatch(typeof records === 'function' ? records(index) : records, { id, root: path.join(root, 'import', 'batches') });
  const plan = await P.planBatch({ dir: b.dir, index });
  fs.writeFileSync(path.join(b.dir, 'plan.json'), JSON.stringify(plan, null, 1) + '\n');
  const prod = T.productionConfig(root);
  const key = fakeJwt({ role: 'service_role', ref: prod.ref, exp: 4102444800 });
  const fake = fakeProd({ approved, pending });
  const base = { batchDir: b.dir, root, env: { SUPABASE_URL: prod.url, SUPABASE_SERVICE_ROLE_KEY: key }, api: fake.api };
  return { root, b, index, plan, fake, base, key };
}
const row = (w, id) => w.fake.state.approved.find(r => r.id === id);

// ============================================ success and idempotency ===========================================================
test('dry-run: an update batch is planned as updates, previewed with a token, and writes nothing', async () => {
  const w = await world();
  assert.equal(w.plan.counts.update, 2); assert.equal(w.plan.importable, true, w.plan.blockers.join());
  const dry = await runImport({ ...w.base });
  assert.equal(dry.exit, 0, dry.report); assert.equal(dry.kind, 'update'); assert.equal(dry.coverage, 'FULL'); assert.equal(dry.state, 'fresh');
  assert.match(dry.token, /^[0-9a-f]{16}$/);
  assert.match(dry.report, /Would update \(2 gyms, 5 field changes; nothing else changes\)/);
  assert.match(dry.report, /seed-100 {2}Boulder Barn {2}lat\+lng\+address {2}pin moves \d+ m/);
  assert.equal(w.fake.state.patches.length, 0); assert.equal(w.fake.state.inserts, 0);
  assert.equal(fs.existsSync(path.join(w.b.dir, 'manifest.json')), false);
});

test('apply: needs the token AND the production flag; then changes exactly address/lat/lng, verifies, writes a manifest; re-runs write nothing', async () => {
  const w = await world();
  const before = JSON.parse(JSON.stringify(w.fake.state.approved));
  const dry = await runImport({ ...w.base });
  const noFlag = await runImport({ ...w.base, mode: 'apply', confirm: dry.token });
  assert.equal(noFlag.exit, 2); assert.ok(failing(noFlag).includes('gate: --i-understand-this-writes-to-production'));
  const noTok = await runImport({ ...w.base, mode: 'apply', productionFlag: true }); assert.equal(noTok.exit, 2); assert.ok(failing(noTok).includes('gate: --confirm'));
  const wrongTok = await runImport({ ...w.base, mode: 'apply', confirm: '0123456789abcdef', productionFlag: true }); assert.equal(wrongTok.exit, 2);
  assert.equal(w.fake.state.patches.length, 0, 'no write before every gate passes');

  const ok = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(ok.exit, 0, ok.report); assert.equal(ok.wrote, true); assert.deepEqual(ok.applied, ['seed-100', 'seed-102']);
  assert.equal(w.fake.state.patches.length, 2);
  assert.ok(w.fake.state.patches.every(p => p.updatedAt === 'ts-0'), 'every PATCH is pinned to the row version seen at the final re-check');
  const a = row(w, 'seed-100'), b0 = before.find(r => r.id === 'seed-100');
  assert.equal(a.lat, -33.882); assert.equal(a.lng, 151.213); assert.equal(a.address, '14 Example St, Surry Hills NSW 2010');
  for (const f of ['name', 'suburb', 'state', 'country', 'types', 'notes', 'photo', 'status', 'community', 'edited', 'submitted_by', 'created_at']) assert.deepEqual(a[f], b0[f], 'unchanged: ' + f);
  assert.equal(row(w, 'seed-102').address, null, 'a pin-only update leaves the address alone');
  for (const id of ['seed-101', 'community-0f3a7c2e-1111-4222-8333-444455556666']) assert.deepEqual(row(w, id), before.find(r => r.id === id), 'other gyms untouched');
  const m = JSON.parse(fs.readFileSync(path.join(w.b.dir, 'manifest.json'), 'utf8'));
  assert.equal(m.status, 'updated'); assert.equal(m.kind, 'update'); assert.equal(m.rows_updated, 2); assert.deepEqual(m.ids, ['seed-100', 'seed-102']);
  assert.equal(m.verification.ok, true); assert.equal(m.approved_before, m.approved_after);
  assert.deepEqual(m.changes.map(c => c.fields), [['lat', 'lng', 'address'], ['lat', 'lng']]);
  assert.ok(!JSON.stringify(m).includes(w.key), 'no credential in the manifest');
  assert.equal(MF.readManifest(w.b.dir).valid, true, 'an update manifest counts as imported');

  const again = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(again.exit, 0, again.report); assert.equal(again.state, 'already-updated'); assert.equal(w.fake.state.patches.length, 2, 'a second apply writes nothing');
  const ver = await runImport({ ...w.base, mode: 'verify' }); assert.equal(ver.exit, 0, ver.report); assert.equal(ver.state, 'already-updated');
});

test('recovery: the updates are in production but no manifest exists -> nothing written, a recovery manifest; verify before apply is refused', async () => {
  const w = await world();
  const ver0 = await runImport({ ...w.base, mode: 'verify' }); assert.equal(ver0.exit, 2); assert.ok(failing(ver0).includes('verify'));
  Object.assign(row(w, 'seed-100'), { lat: -33.882, lng: 151.213, address: '14 Example St, Surry Hills NSW 2010', updated_at: 'ts-x' });
  Object.assign(row(w, 'seed-102'), { lat: -33.8785, lng: 151.196, updated_at: 'ts-y' });
  const r = await runImport({ ...w.base, mode: 'apply', confirm: 'irrelevant', productionFlag: true });
  assert.equal(r.exit, 0, r.report); assert.equal(r.state, 'already-present'); assert.equal(w.fake.state.patches.length, 0);
  assert.equal(JSON.parse(fs.readFileSync(path.join(w.b.dir, 'manifest.json'), 'utf8')).status, 'updated-recovered');
});

// ============================================ content hash (expect_h) ===========================================================
test('expect_h: an update researched against different content is refused before any read of production', async () => {
  const w = await world({ records: ix => [upd(ix, 'seed-100', { lat: -33.882, lng: 151.213 }, { expect_h: '0000000000000000' })] });
  assert.equal(w.plan.counts.invalid, 1); assert.match(JSON.stringify(w.plan), /changed-since-research/);
  const r = await runImport({ ...w.base });
  assert.equal(r.exit, 2); assert.ok(failing(r).includes('researched content is the indexed content (expect_h)'), failing(r).join());
  assert.equal(w.fake.state.patches.length, 0);
});

test('expect_h: a gym edited in production since the research (any field) is refused, never overwritten', async () => {
  const approved = BASE(); approved.find(r => r.id === 'seed-100').notes = 'a moderator edited this';
  const w = await world({ approved });
  const r = await runImport({ ...w.base });
  assert.equal(r.exit, 2); assert.ok(failing(r).includes('production still has the researched content (expect_h)'), failing(r).join());
  assert.equal(w.fake.state.patches.length, 0);
});

test('a change between the dry-run and apply is caught by the final re-check; a change between the re-check and the PATCH matches 0 rows', async () => {
  // (a) another spot changes after the token was issued
  const w1 = await world(); const dry1 = await runImport({ ...w1.base });
  let reads = 0;
  w1.fake.state.hooks.beforeRead = (q, st) => { if (q.includes('status=eq.approved') && ++reads === 2) st.approved.find(r => r.id === 'seed-101').notes = 'edited mid-flight'; };
  const r1 = await runImport({ ...w1.base, mode: 'apply', confirm: dry1.token, productionFlag: true });
  assert.equal(r1.exit, 2); assert.ok(failing(r1).includes('final re-check before write'), failing(r1).join()); assert.equal(w1.fake.state.patches.length, 0);

  // (b) the FIRST target is edited just before its PATCH: 0 rows, nothing written, refused (exit 2), no manifest
  const w2 = await world(); const dry2 = await runImport({ ...w2.base });
  w2.fake.state.hooks.beforePatch = (u, st) => { if (u.id === 'seed-100') st.approved.find(r => r.id === 'seed-100').updated_at = 'ts-moderator'; };
  const r2 = await runImport({ ...w2.base, mode: 'apply', confirm: dry2.token, productionFlag: true });
  assert.equal(r2.exit, 2, r2.report); assert.ok(failing(r2).includes('updates')); assert.match(r2.report, /0 row\(s\) matched/);
  assert.equal(row(w2, 'seed-100').lat, -33.88, 'not overwritten'); assert.equal(w2.fake.state.patches.length, 1, 'stopped at the first refusal');
  assert.equal(fs.existsSync(path.join(w2.b.dir, 'manifest.json')), false);

  // (c) the SECOND target is edited just before its PATCH: one gym updated -> partial state, failure record, exit 4, no manifest
  const w3 = await world(); const dry3 = await runImport({ ...w3.base });
  w3.fake.state.hooks.beforePatch = (u, st) => { if (u.id === 'seed-102') st.approved.find(r => r.id === 'seed-102').updated_at = 'ts-moderator'; };
  const r3 = await runImport({ ...w3.base, mode: 'apply', confirm: dry3.token, productionFlag: true });
  assert.equal(r3.exit, 4, r3.report); assert.equal(r3.wrote, true);
  assert.equal(fs.existsSync(path.join(w3.b.dir, 'manifest.json')), false, 'a partial update never leaves a manifest');
  const f = JSON.parse(fs.readFileSync(path.join(w3.b.dir, 'import-failure.json'), 'utf8'));
  assert.equal(f.status, 'update-failed'); assert.deepEqual(f.applied_ids, ['seed-100']);
  // and a re-run refuses the mixed state instead of finishing it
  const again = await runImport({ ...w3.base });
  assert.equal(again.exit, 2); assert.ok(failing(again).includes('no partly applied batch'), failing(again).join());
});

// ============================================ location-only rules ===============================================================
test('location updates: only address, lat and lng can change (name/suburb/types are the identity family, tested below): every other field, a half pin, a cleared address, or a missing expect_h/source is refused', async () => {
  const cases = [
    [ix => [upd(ix, 'seed-100', { notes: 'x', lat: -33.882, lng: 151.213 })], 'notes + pin (notes is an info fill)'],
    [ix => [upd(ix, 'seed-100', { photo: 'https://example.com/p.jpg' })], 'photo'],
    [ix => [upd(ix, 'seed-100', { state: 'VIC' })], 'state'],
    [ix => [upd(ix, 'seed-100', { country: 'NZ' })], 'country'],
    [ix => [upd(ix, 'seed-100', { status: 'rejected' })], 'status'],
    [ix => [upd(ix, 'seed-100', { lat: -33.882 })], 'lat without lng'],
    [ix => [upd(ix, 'seed-100', { address: '' })], 'cleared address'],
    [ix => [upd(ix, 'seed-100', { address: '   ' })], 'blank address'],
    [ix => [{ ...upd(ix, 'seed-100', { lat: -33.882, lng: 151.213 }), expect_h: undefined }], 'no expect_h'],
    [ix => [{ ...upd(ix, 'seed-100', { lat: -33.882, lng: 151.213 }), source: undefined }], 'no source'],
    [ix => [upd(ix, 'seed-100', { lat: -33.882, lng: 151.213 }), upd(ix, 'seed-100', { address: '1 Other St' })], 'two updates of one gym'],
    [ix => [upd(ix, 'seed-100', { lat: '-33.882', lng: '151.213' })], 'numeric strings'],
  ];
  for (const [records, what] of cases) {
    const w = await world({ records });
    const r = await runImport({ ...w.base });
    assert.equal(r.exit, 2, what + '\n' + r.report); assert.equal(w.fake.state.patches.length, 0, what);
    assert.ok(failing(r).some(n => /records validate|one update per gym/.test(n)), what + ': ' + failing(r).join());
  }
  const unknown = await world({ records: ix => [{ ...upd(ix, 'seed-100', { lat: -33.882, lng: 151.213 }), id: 'seed-999' }] });
  const ru = await runImport({ ...unknown.base }); assert.equal(ru.exit, 2); assert.ok(failing(ru).includes('every target gym exists in the index'));
});

test('a batch mixing inserts and updates stays on the insert-only path and is refused there', async () => {
  const w = await world({ records: ix => [rec({ name: 'Brand New Gym', lat: -33.6, lng: 151.4 }), upd(ix, 'seed-100', { lat: -33.882, lng: 151.213 })] });
  const r = await runImport({ ...w.base });
  assert.equal(r.exit, 2); assert.equal(r.kind, undefined, 'not handed to the updater'); assert.ok(failing(r).includes('insert-only'), failing(r).join());
  assert.equal(w.fake.state.patches.length, 0); assert.equal(w.fake.state.inserts, 0);
});

// ============================================ 60 m rule =========================================================================
test('60 m: a new pin on top of another approved gym, a pending submission, or another new pin in the batch is refused', async () => {
  const onto = await world({ records: ix => [upd(ix, 'seed-102', { lat: -33.8801, lng: 151.2101 })] });   // ~15 m from seed-100
  assert.match(JSON.stringify(onto.plan), /pin-near-other-gym/);
  const r1 = await runImport({ ...onto.base }); assert.equal(r1.exit, 2); assert.equal(onto.fake.state.patches.length, 0);
  const pend = { id: 'community-0f3a7c2e-1111-4222-8333-444455556677', name: 'Pending gym', suburb: 'Ultimo', state: 'NSW', country: 'AU', lat: -33.8786, lng: 151.1961, types: ['indoor-bouldering'], status: 'pending', community: true, edited: false };
  const nearPending = await world({ pending: [pend] });
  const r2 = await runImport({ ...nearPending.base });
  assert.equal(r2.exit, 2); assert.ok(failing(r2).includes('no new pin within 60 m of another gym'), failing(r2).join()); assert.match(r2.report, /pending/);
  const pair = await world({ records: ix => [upd(ix, 'seed-100', { lat: -33.8785, lng: 151.1962 }), upd(ix, 'seed-102', { lat: -33.8785, lng: 151.196 })] });   // ~18 m apart
  const r3 = await runImport({ ...pair.base }); assert.equal(r3.exit, 2); assert.equal(pair.fake.state.patches.length, 0);
  assert.match(JSON.stringify(pair.plan), /pin-near-other-gym/);
});

// ============================================ coverage, credentials, targets ====================================================
test('without the service-role key a dry-run is PARTIAL with no token, and apply is refused; production batches must live in the repo', async () => {
  const w = await world();
  const partial = await runImport({ ...w.base, env: { SUPABASE_URL: w.base.env.SUPABASE_URL } });
  assert.equal(partial.exit, 0, partial.report); assert.equal(partial.coverage, 'PARTIAL'); assert.equal(partial.token, null);
  const noKey = await runImport({ ...w.base, env: { SUPABASE_URL: w.base.env.SUPABASE_URL }, mode: 'apply', confirm: 'x', productionFlag: true });
  assert.equal(noKey.exit, 2);
  const noUrl = await runImport({ ...w.base, env: { SUPABASE_SERVICE_ROLE_KEY: w.key }, mode: 'apply', confirm: 'x', productionFlag: true });
  assert.equal(noUrl.exit, 2); assert.match(noUrl.report, /must be set explicitly/);
  const outside = makeBatch(TWO(w.index), { id: '2026-02-01-outside' });
  const r = await runImport({ ...w.base, batchDir: outside.dir }); assert.equal(r.exit, 2); assert.ok(failing(r).includes('production uses repo batches only'));
  assert.equal(w.fake.state.patches.length, 0);
});

// ============================================ the write itself (target.js) ======================================================
test('target.js updateSpotLocation: refuses without the update gate or with anything but the approved change; sends one pinned PATCH', async () => {
  const api = new T.Api({ url: 'https://example.supabase.co', serviceKey: 'service-key-xxxxxxxx', anonKey: 'anon-key-xxxxxxxx' });
  const sent = []; api._send = async (method, q, o) => { sent.push({ method, q, o }); return { ok: true, status: 200, json: [{}] }; };
  const updates = [{ id: 'seed-100', set: { lat: -33.882, lng: 151.213, address: '14 Example St' }, expect_h: '0123456789abcdef' }];
  const payloadSha = crypto.createHash('sha256').update(JSON.stringify(updates)).digest('hex');
  const gate = T.mintUpdateGate({ batchId: 'b', token: 't', updates, payloadSha });
  const u = { id: 'seed-100', set: updates[0].set, updatedAt: '2026-09-24T01:02:03.123456+00:00' };
  await assert.rejects(api.updateSpotLocation(u, null), /no update gate/);
  await assert.rejects(api.updateSpotLocation(u, T.mintWriteGate({ batchId: 'b', token: 't', rows: [], payloadSha })), /no update gate/, 'the insert gate cannot authorise an update');
  await assert.rejects(api.updateSpotLocation(u, { ...gate }), /no update gate/, 'a copied gate is not a gate');
  await assert.rejects(api.updateSpotLocation(u, T.mintUpdateGate({ batchId: 'b', token: 't', updates, payloadSha: 'f'.repeat(64) })), /hash mismatch/);
  await assert.rejects(api.updateSpotLocation({ ...u, set: { ...u.set, lat: -30 } }, gate), /not the approved one/);
  await assert.rejects(api.updateSpotLocation({ ...u, id: 'seed-101' }, gate), /not the approved one/);
  const sneaky = [{ id: 'seed-100', set: { lat: 1, lng: 2, name: 'x' }, expect_h: '0123456789abcdef' }];
  await assert.rejects(api.updateSpotLocation({ ...u, set: sneaky[0].set }, T.mintUpdateGate({ updates: sneaky, payloadSha: crypto.createHash('sha256').update(JSON.stringify(sneaky)).digest('hex') })), /only address\/lat\/lng/);
  await assert.rejects(api.updateSpotLocation({ ...u, updatedAt: '' }, gate), /updated_at/);
  assert.equal(sent.length, 0, 'nothing sent for any refusal');
  await api.updateSpotLocation(u, gate);
  assert.equal(sent.length, 1); assert.equal(sent[0].method, 'PATCH'); assert.equal(sent[0].o.service, true);
  assert.equal(sent[0].q, '/rest/v1/spots?id=eq.seed-100&status=eq.approved&updated_at=eq.2026-09-24T01%3A02%3A03.123456%2B00%3A00');
  assert.deepEqual(JSON.parse(sent[0].o.body), updates[0].set); assert.match(sent[0].o.headers.Prefer, /return=representation/);
});

// ============================================ retirements (intent "retire") =====================================================
// A closed or duplicate approved gym is set to status 'rejected' + rejection_reason through the same gates as a location update.
const ret = (index, id, over = {}) => ({ intent: 'retire', id, expect_h: index.byId.get(id).h, reason_code: 'closed', reason: 'permanently closed, confirmed on the gym website (test)', source: 'https://example.com/closed (test)', ...over });
const DUP_REASON = 'duplicate of seed-100, the same gym listed twice (test)';
const RET2 = ix => [ret(ix, 'seed-101'), ret(ix, 'seed-102', { reason_code: 'duplicate', duplicate_of: 'seed-100', reason: DUP_REASON })];
const approvedOf = w => w.fake.state.approved.filter(r => r.status === 'approved');

test('retire: the dry-run lists retirements apart from location changes and writes nothing', async () => {
  const w = await world({ records: RET2 });
  assert.equal(w.plan.counts.retire, 2); assert.equal(w.plan.counts.update, 0); assert.equal(w.plan.importable, true, w.plan.blockers.join());
  const pr = w.plan.records.find(r => r.id === 'seed-102');
  assert.equal(pr.class, 'retire'); assert.equal(pr.reason_code, 'duplicate'); assert.equal(pr.duplicate_of, 'seed-100'); assert.equal(pr.expect_h, w.index.byId.get('seed-102').h);
  assert.deepEqual(pr.entry, w.index.byId.get('seed-102'), 'the plan records the full index entry from before the retirement');
  assert.equal(w.plan.index.sha256, w.index.sha256, 'and the index it was planned against');
  const dry = await runImport({ ...w.base });
  assert.equal(dry.exit, 0, dry.report); assert.equal(dry.kind, 'update'); assert.equal(dry.coverage, 'FULL'); assert.equal(dry.state, 'fresh');
  assert.match(dry.token, /^[0-9a-f]{16}$/);
  assert.match(dry.report, /Would retire \(2 gyms; status becomes rejected/);
  assert.match(dry.report, /seed-101 {2}Vertical Works {2}closed {2}"permanently closed/);
  assert.match(dry.report, /seed-102 {2}Granite Gym {2}duplicate of seed-100 {2}"duplicate of seed-100/);
  assert.doesNotMatch(dry.report, /Would update/, 'no location-change section when there are no location changes');
  assert.equal(w.fake.state.patches.length + w.fake.state.retires.length, 0); assert.equal(fs.existsSync(path.join(w.b.dir, 'manifest.json')), false);
  const md = require('../scripts/lib/gym-import/report').renderReport(w.plan);   // the plan report lists them too, apart from "Updates to existing gyms"
  assert.match(md, /\| Retire existing gyms .* \| 2 \|/); assert.match(md, /## Retirements of existing gyms \(2\)/);
  assert.match(md, /`seed-102` "Granite Gym" \(AU\) — duplicate of `seed-100`: duplicate of seed-100/); assert.doesNotMatch(md, /## Updates to existing gyms/);
});

test('retire apply: needs the token AND the production flag; sets exactly status + reason; approved count -2; every other spot unchanged; manifest lists retirements; re-runs write nothing', async () => {
  const w = await world({ records: RET2 });
  const before = JSON.parse(JSON.stringify(w.fake.state.approved));
  const dry = await runImport({ ...w.base });
  const noFlag = await runImport({ ...w.base, mode: 'apply', confirm: dry.token }); assert.equal(noFlag.exit, 2); assert.ok(failing(noFlag).includes('gate: --i-understand-this-writes-to-production'));
  const noTok = await runImport({ ...w.base, mode: 'apply', productionFlag: true }); assert.equal(noTok.exit, 2); assert.ok(failing(noTok).includes('gate: --confirm'));
  const wrong = await runImport({ ...w.base, mode: 'apply', confirm: '0123456789abcdef', productionFlag: true }); assert.equal(wrong.exit, 2);
  assert.equal(w.fake.state.retires.length, 0, 'no write before every gate passes');

  const ok = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(ok.exit, 0, ok.report); assert.equal(ok.wrote, true); assert.deepEqual(ok.applied, ['seed-101', 'seed-102']);
  assert.equal(w.fake.state.retires.length, 2); assert.equal(w.fake.state.patches.length, 0, 'retirements never go through the location PATCH');
  assert.ok(w.fake.state.retires.every(p => p.updatedAt === 'ts-0'), 'every PATCH is pinned to the row version seen at the final re-check');
  for (const [id, reason] of [['seed-101', 'permanently closed, confirmed on the gym website (test)'], ['seed-102', DUP_REASON]]) {
    const a = row(w, id), b0 = before.find(r => r.id === id);
    assert.equal(a.status, 'rejected'); assert.equal(a.rejection_reason, reason);
    for (const f of ['name', 'suburb', 'state', 'country', 'lat', 'lng', 'address', 'types', 'notes', 'photo', 'community', 'edited', 'submitted_by', 'created_at']) assert.deepEqual(a[f], b0[f], 'unchanged: ' + f);
  }
  for (const id of ['seed-100', 'community-0f3a7c2e-1111-4222-8333-444455556666']) assert.deepEqual(row(w, id), before.find(r => r.id === id), 'other gyms byte-identical');
  assert.equal(approvedOf(w).length, before.length - 2, 'approved count went down by exactly the number of retirements');
  assert.equal(w.fake.state.approved.length, before.length, 'nothing was deleted');
  const m = JSON.parse(fs.readFileSync(path.join(w.b.dir, 'manifest.json'), 'utf8'));
  assert.equal(m.kind, 'update'); assert.equal(m.status, 'updated'); assert.equal(m.rows_updated, 0); assert.equal(m.rows_retired, 2);
  assert.deepEqual(m.retired, ['seed-101', 'seed-102']); assert.deepEqual(m.ids, ['seed-101', 'seed-102']); assert.deepEqual(m.changes, []);
  assert.deepEqual(m.retirements.map(r => [r.id, r.reason_code, r.duplicate_of || null]), [['seed-101', 'closed', null], ['seed-102', 'duplicate', 'seed-100']]);
  assert.equal(m.approved_before, before.length); assert.equal(m.approved_after, before.length - 2); assert.equal(m.verification.ok, true);
  assert.ok(!JSON.stringify(m).includes(w.key), 'no credential in the manifest');
  assert.equal(MF.readManifest(w.b.dir).valid, true, 'a maintenance manifest counts as imported');

  const again = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(again.exit, 0, again.report); assert.equal(again.state, 'already-updated'); assert.equal(w.fake.state.retires.length, 2, 'a second apply writes nothing');
  const ver = await runImport({ ...w.base, mode: 'verify' }); assert.equal(ver.exit, 0, ver.report); assert.equal(ver.state, 'already-updated');
  const partial = await runImport({ ...w.base, env: { SUPABASE_URL: w.base.env.SUPABASE_URL } });
  assert.equal(partial.exit, 2); assert.match(partial.report, /service-role key \(FULL coverage\) to read it/, 'a retired gym is only visible with the privileged read');
});

test('retire recovery: the gyms are already rejected with the recorded reason but no manifest exists -> nothing written, a recovery manifest; a different reason is refused', async () => {
  const w = await world({ records: RET2 });
  const ver0 = await runImport({ ...w.base, mode: 'verify' }); assert.equal(ver0.exit, 2); assert.ok(failing(ver0).includes('verify'));
  Object.assign(row(w, 'seed-101'), { status: 'rejected', rejection_reason: 'permanently closed, confirmed on the gym website (test)', updated_at: 'ts-x' });
  Object.assign(row(w, 'seed-102'), { status: 'rejected', rejection_reason: 'some other moderator reason', updated_at: 'ts-y' });
  const other = await runImport({ ...w.base, mode: 'apply', confirm: 'irrelevant', productionFlag: true });
  assert.equal(other.exit, 2); assert.ok(failing(other).includes('production still has the researched content (expect_h)'), failing(other).join());
  row(w, 'seed-102').rejection_reason = DUP_REASON;
  const r = await runImport({ ...w.base, mode: 'apply', confirm: 'irrelevant', productionFlag: true });
  assert.equal(r.exit, 0, r.report); assert.equal(r.state, 'already-present'); assert.equal(w.fake.state.retires.length, 0);
  const m = JSON.parse(fs.readFileSync(path.join(w.b.dir, 'manifest.json'), 'utf8'));
  assert.equal(m.status, 'updated-recovered'); assert.deepEqual(m.retired, ['seed-101', 'seed-102']);
});

test('retire: a gym changed since the research, or changed between the dry-run and the PATCH, is refused; nothing else is ever written', async () => {
  // edited in production since the research (any field), or no longer approved
  const approved = BASE(); approved.find(r => r.id === 'seed-101').notes = 'a moderator edited this';
  const edited = await world({ records: RET2, approved });
  const r0 = await runImport({ ...edited.base }); assert.equal(r0.exit, 2); assert.ok(failing(r0).includes('production still has the researched content (expect_h)'), failing(r0).join());
  const pend = BASE(); pend.find(r => r.id === 'seed-101').status = 'pending';
  const notApproved = await world({ records: RET2, approved: pend });
  const r1 = await runImport({ ...notApproved.base }); assert.equal(r1.exit, 2); assert.equal(notApproved.fake.state.retires.length, 0);

  // another spot changes after the token was issued: the final re-check refuses
  const w1 = await world({ records: RET2 }); const dry1 = await runImport({ ...w1.base });
  let reads = 0;
  w1.fake.state.hooks.beforeRead = (q, st) => { if (q.includes('status=eq.approved') && ++reads === 2) st.approved.find(r => r.id === 'seed-100').notes = 'edited mid-flight'; };
  const r2 = await runImport({ ...w1.base, mode: 'apply', confirm: dry1.token, productionFlag: true });
  assert.equal(r2.exit, 2); assert.ok(failing(r2).includes('final re-check before write'), failing(r2).join()); assert.equal(w1.fake.state.retires.length, 0);

  // the FIRST target is edited just before its PATCH: 0 rows, nothing written, exit 2, no manifest
  const w2 = await world({ records: RET2 }); const dry2 = await runImport({ ...w2.base });
  w2.fake.state.hooks.beforePatch = (u, st) => { if (u.id === 'seed-101') st.approved.find(r => r.id === 'seed-101').updated_at = 'ts-moderator'; };
  const r3 = await runImport({ ...w2.base, mode: 'apply', confirm: dry2.token, productionFlag: true });
  assert.equal(r3.exit, 2, r3.report); assert.match(r3.report, /0 row\(s\) matched/); assert.equal(row(w2, 'seed-101').status, 'approved', 'not retired'); assert.equal(w2.fake.state.retires.length, 1, 'stopped at the first refusal');
  assert.equal(fs.existsSync(path.join(w2.b.dir, 'manifest.json')), false);

  // the SECOND target is edited just before its PATCH: one gym retired -> failure record, exit 4, no manifest; a re-run refuses the mixed state
  const w3 = await world({ records: RET2 }); const dry3 = await runImport({ ...w3.base });
  w3.fake.state.hooks.beforePatch = (u, st) => { if (u.id === 'seed-102') st.approved.find(r => r.id === 'seed-102').updated_at = 'ts-moderator'; };
  const r4 = await runImport({ ...w3.base, mode: 'apply', confirm: dry3.token, productionFlag: true });
  assert.equal(r4.exit, 4, r4.report); assert.equal(r4.wrote, true); assert.equal(fs.existsSync(path.join(w3.b.dir, 'manifest.json')), false);
  const f = JSON.parse(fs.readFileSync(path.join(w3.b.dir, 'import-failure.json'), 'utf8'));
  assert.equal(f.status, 'update-failed'); assert.deepEqual(f.applied_ids, ['seed-101']); assert.equal(f.staged, 2);
  const again = await runImport({ ...w3.base }); assert.equal(again.exit, 2); assert.ok(failing(again).includes('no partly applied batch'), failing(again).join());
});

test('retire verification: an unexpected approved count or a changed bystander after the writes is a failure record (exit 4), never a manifest', async () => {
  const w = await world({ records: RET2 }); const dry = await runImport({ ...w.base });
  let reads = 0;
  w.fake.state.hooks.beforeRead = (q, st) => { if (q.includes('status=eq.approved') && ++reads === 3) st.approved.find(r => r.id === 'seed-100').notes = 'changed after the writes'; };
  const r = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(r.exit, 4, r.report); assert.ok(failing(r).includes('post-update verification'), failing(r).join());
  assert.equal(fs.existsSync(path.join(w.b.dir, 'manifest.json')), false); assert.equal(JSON.parse(fs.readFileSync(path.join(w.b.dir, 'import-failure.json'), 'utf8')).phase, 'verification-failed');
});

test('maintenance batch: updates and retirements together work in one batch; the manifest keeps them apart; a half-applied mix is refused', async () => {
  const mixed = ix => [upd(ix, 'seed-100', { lat: -33.882, lng: 151.213 }), ret(ix, 'seed-101')];
  const w = await world({ records: mixed });
  assert.equal(w.plan.counts.update, 1); assert.equal(w.plan.counts.retire, 1); assert.equal(w.plan.importable, true, w.plan.blockers.join());
  const dry = await runImport({ ...w.base });
  assert.equal(dry.exit, 0, dry.report); assert.match(dry.report, /Would update \(1 gyms, 2 field changes/); assert.match(dry.report, /Would retire \(1 gyms/);
  const ok = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(ok.exit, 0, ok.report); assert.deepEqual(ok.applied, ['seed-100', 'seed-101']);
  assert.equal(w.fake.state.patches.length, 1); assert.equal(w.fake.state.retires.length, 1);
  assert.equal(row(w, 'seed-100').lat, -33.882); assert.equal(row(w, 'seed-100').status, 'approved'); assert.equal(row(w, 'seed-101').status, 'rejected');
  assert.equal(approvedOf(w).length, BASE().length - 1);
  const m = JSON.parse(fs.readFileSync(path.join(w.b.dir, 'manifest.json'), 'utf8'));
  assert.deepEqual(m.ids, ['seed-100', 'seed-101']); assert.deepEqual(m.retired, ['seed-101']); assert.equal(m.rows_updated, 1); assert.equal(m.rows_retired, 1);
  assert.deepEqual(m.changes.map(c => c.id), ['seed-100'], 'location changes list only the updates');
  const again = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true }); assert.equal(again.exit, 0); assert.equal(again.state, 'already-updated');

  // the update is already applied but the retirement is not: a mixed state is refused, never merged
  const half = await world({ records: mixed });
  Object.assign(row(half, 'seed-100'), { lat: -33.882, lng: 151.213, updated_at: 'ts-x' });
  const rh = await runImport({ ...half.base }); assert.equal(rh.exit, 2); assert.ok(failing(rh).includes('no partly applied batch'), failing(rh).join());
  assert.equal(half.fake.state.patches.length + half.fake.state.retires.length, 0);
});

test('a batch mixing new/insert records with retirements stays on the insert path and is refused there', async () => {
  const w = await world({ records: ix => [rec({ name: 'Brand New Gym', lat: -33.6, lng: 151.4 }), ret(ix, 'seed-101')] });
  const r = await runImport({ ...w.base });
  assert.equal(r.exit, 2); assert.equal(r.kind, undefined, 'not handed to the updater'); assert.ok(failing(r).includes('insert-only'), failing(r).join());
  assert.equal(w.fake.state.patches.length + w.fake.state.retires.length + w.fake.state.inserts, 0);
});

test('retire plan blockers: unknown id, stale expect_h, a missing / self / retired duplicate_of, and one record per gym', async () => {
  const cases = [
    [ix => [ret(ix, 'seed-101', { id: 'seed-999', expect_h: '0123456789abcdef' })], 'unknown-id'],
    [ix => [ret(ix, 'seed-101', { expect_h: '0000000000000000' })], 'changed-since-research'],
    [ix => [ret(ix, 'seed-101', { reason_code: 'duplicate', duplicate_of: 'seed-999' })], 'duplicate-of-unknown'],
    [ix => [ret(ix, 'seed-101', { reason_code: 'duplicate', duplicate_of: 'seed-101' })], 'bad-duplicate-of'],
    [ix => [ret(ix, 'seed-101', { reason_code: 'duplicate' })], 'duplicate-of-required'],
    [ix => [ret(ix, 'seed-101', { duplicate_of: 'seed-100' })], 'duplicate-of-forbidden'],
    [ix => [ret(ix, 'seed-101', { reason_code: 'duplicate', duplicate_of: 'seed-102' }), ret(ix, 'seed-102')], 'duplicate-of-retired'],
    [ix => [ret(ix, 'seed-101'), upd(ix, 'seed-101', { lat: -37.8, lng: 144.97 })], 'one-record-per-gym'],
    [ix => [ret(ix, 'seed-101'), ret(ix, 'seed-101')], 'one-record-per-gym'],
    [ix => [ret(ix, 'seed-101', { reason: 'short' })], 'bad-reason'],
    [ix => [ret(ix, 'seed-101', { source: undefined })], 'bad-source'],
  ];
  for (const [records, code] of cases) {
    const w = await world({ records });
    assert.equal(w.plan.importable, false, code);
    assert.ok(JSON.stringify(w.plan.records).includes(`"${code}"`), `${code} in ${JSON.stringify(w.plan.records.map(r => r.errors))}`);
    assert.ok(w.plan.blockers.some(b => /invalid record/.test(b)), code + ': ' + w.plan.blockers.join());
    const r = await runImport({ ...w.base });
    assert.equal(r.exit, 2, code + '\n' + r.report); assert.equal(w.fake.state.retires.length + w.fake.state.patches.length, 0, code);
  }
  // a duplicate_of in another country is allowed but warned about
  const far = await world({ records: ix => [ret(ix, 'seed-101', { reason_code: 'duplicate', duplicate_of: 'community-0f3a7c2e-1111-4222-8333-444455556666' })] });
  assert.equal(far.plan.importable, true); assert.ok(far.plan.records[0].warnings.some(x => x.code === 'duplicate-other-country'));
  // more than 100 records are refused
  const big = await world({ records: ix => Array.from({ length: 101 }, (_, i) => ret(ix, 'seed-101', { reason: 'closed ' + i + ' ........' })) });
  assert.equal((await runImport({ ...big.base })).exit, 2);
});

test('retire confirmation token: bound to the retire ops (a different set of retirements, reason or duplicate_of never matches); update-only tokens are unchanged', async () => {
  const U = require('../scripts/lib/gym-import/updater');
  const args = { batchId: 'b', planSha: 'p', payload: 'x', host: 'h', kind: 'production', coverage: 'FULL', liveSha: 'l' };
  const r1 = [{ id: 'seed-101', reason_code: 'closed', reason: 'permanently closed (test)', expect_h: '0123456789abcdef' }];
  const t0 = U.confirmToken(args);
  assert.equal(U.confirmToken({ ...args, retires: [] }), t0, 'no retirements: the token is exactly the update-only token');
  const t1 = U.confirmToken({ ...args, retires: r1 });
  assert.notEqual(t1, t0);
  assert.notEqual(U.confirmToken({ ...args, retires: [{ ...r1[0], reason: 'a different reason (test)' }] }), t1);
  assert.notEqual(U.confirmToken({ ...args, retires: [{ ...r1[0], reason_code: 'duplicate', duplicate_of: 'seed-100' }] }), t1);
  assert.notEqual(U.confirmToken({ ...args, retires: [...r1, { ...r1[0], id: 'seed-102' }] }), t1);
  // end to end: the token printed for one set of retirements is refused for another (same production state, same batch name)
  const a = await world({ records: ix => [ret(ix, 'seed-101')] }), b = await world({ records: ix => [ret(ix, 'seed-101', { reason: 'closed for good, the building is empty (test)' })] });
  const da = await runImport({ ...a.base }), db = await runImport({ ...b.base });
  assert.notEqual(da.token, db.token);
  const cross = await runImport({ ...b.base, mode: 'apply', confirm: da.token, productionFlag: true });
  assert.equal(cross.exit, 2); assert.ok(failing(cross).includes('gate: --confirm')); assert.equal(b.fake.state.retires.length, 0);
  // the gate itself hashes the retirements too
  const upds = [{ id: 'seed-100', set: { lat: 1, lng: 2 }, expect_h: '0123456789abcdef' }];
  assert.equal(T.opsPayload(upds, []), upds); assert.deepEqual(T.opsPayload(upds, r1), { updates: upds, retires: r1 });
});

test('target.js retireSpot: refuses without the update gate or with anything but the approved retirement; sends one pinned PATCH with exactly {status, rejection_reason}', async () => {
  const api = new T.Api({ url: 'https://example.supabase.co', serviceKey: 'service-key-xxxxxxxx', anonKey: 'anon-key-xxxxxxxx' });
  const sent = []; api._send = async (method, q, o) => { sent.push({ method, q, o }); return { ok: true, status: 200, json: [{}] }; };
  const updates = [], retires = [{ id: 'seed-101', reason_code: 'closed', reason: 'permanently closed (test)', expect_h: '0123456789abcdef' }];
  const mint = (o = {}) => { const g = { updates, retires, ...o }; return T.mintUpdateGate({ batchId: 'b', token: 't', ...g, payloadSha: o.payloadSha || crypto.createHash('sha256').update(JSON.stringify(T.opsPayload(g.updates, g.retires))).digest('hex') }); };
  const gate = mint();
  const u = { id: 'seed-101', reason: 'permanently closed (test)', updatedAt: '2026-09-24T01:02:03.123456+00:00' };
  await assert.rejects(api.retireSpot(u, null), /no update gate/);
  await assert.rejects(api.retireSpot(u, T.mintWriteGate({ batchId: 'b', token: 't', rows: [], payloadSha: 'f'.repeat(64) })), /no update gate/, 'the insert gate cannot authorise a retirement');
  await assert.rejects(api.retireSpot(u, { ...gate }), /no update gate/, 'a copied gate is not a gate');
  await assert.rejects(api.retireSpot(u, mint({ payloadSha: 'f'.repeat(64) })), /hash mismatch/);
  await assert.rejects(api.retireSpot({ ...u, reason: 'a different reason (test)' }, gate), /not the approved one/);
  await assert.rejects(api.retireSpot({ ...u, id: 'seed-102' }, gate), /not the approved one/);
  await assert.rejects(api.retireSpot(u, mint({ updates: [{ id: 'seed-100', set: { lat: 1, lng: 2 }, expect_h: '0123456789abcdef' }], retires: [] })), /not the approved one/, 'a gate with no retirements retires nothing');
  const long = [{ ...retires[0], reason: 'x'.repeat(201) }];
  await assert.rejects(api.retireSpot({ ...u, reason: long[0].reason }, mint({ retires: long })), /8-200 characters/);
  await assert.rejects(api.retireSpot({ ...u, updatedAt: '' }, gate), /updated_at/);
  await assert.rejects(api.updateSpotLocation({ id: 'seed-101', set: { lat: 1, lng: 2 }, updatedAt: 'x' }, gate), /not the approved one/, 'a retirement gate cannot move a pin that was not approved');
  assert.equal(sent.length, 0, 'nothing sent for any refusal');
  await api.retireSpot(u, gate);
  assert.equal(sent.length, 1); assert.equal(sent[0].method, 'PATCH'); assert.equal(sent[0].o.service, true);
  assert.equal(sent[0].q, '/rest/v1/spots?id=eq.seed-101&status=eq.approved&updated_at=eq.2026-09-24T01%3A02%3A03.123456%2B00%3A00');
  assert.deepEqual(JSON.parse(sent[0].o.body), { status: 'rejected', rejection_reason: 'permanently closed (test)' }); assert.match(sent[0].o.headers.Prefer, /return=representation/);
  assert.ok(!sent.some(s => s.method === 'DELETE'), 'there is no DELETE anywhere');
});

// The real-database run of the update path lives in import-importer.test.js with the other local-stack tests: they all reset
// the shared local `spots` table, and node --test runs test FILES in parallel.

test('stateOfRetire: "after" needs the recorded reason AND an otherwise untouched row (content hash = expect_h)', () => {
  const { stateOfRetire } = require('../scripts/lib/gym-import/updater');
  const row = { id: 'seed-433', name: 'Gravity Research Sapporo', suburb: 'Sapporo', state: 'HOKKAIDO', country: 'JP', lat: 43.0618, lng: 141.3545, address: 'x', types: ['indoor-bouldering'], notes: null, photo: null, status: 'approved', updated_at: 't1' };
  const expect_h = S.toEntry(row).h, reason = 'Closed 14 Apr 2025 (operator store list).';
  const r = { id: row.id, expect_h, reason };
  assert.equal(stateOfRetire(row, r).state, 'before');
  assert.equal(stateOfRetire({ ...row, status: 'rejected', rejection_reason: reason }, r).state, 'after');
  assert.equal(stateOfRetire({ ...row, status: 'rejected', rejection_reason: 'another reason here' }, r).state, 'changed');
  assert.equal(stateOfRetire({ ...row, status: 'rejected', rejection_reason: reason, name: 'Renamed' }, r).state, 'changed', 'a rejected row that was also edited is not our retirement');
  assert.equal(stateOfRetire({ ...row, name: 'Renamed' }, r).state, 'changed');
  assert.equal(stateOfRetire(undefined, r).state, 'missing');
});

// ============================================ gym information (intent "update", set: website / hours) ==============================
// FILL-ONLY: website and hours of an approved gym that has none. They are not part of the content hash, so the updater reads the fields
// themselves; a field that already holds a value is never overwritten. Same gates, pin and one-PATCH-per-gym rule as location updates.
const HOURS = { mon: '6am–10pm', tue: '6am–10pm', sat: '8am–6pm' };
const info = (index, id, set = { website: 'https://www.example.com/gym', hours: HOURS }, over = {}) => upd(index, id, set, { reason: 'website and hours from the official site (test)', source: 'https://www.example.com/gym (official site, test)', ...over });
const INFO2 = ix => [info(ix, 'seed-100'), info(ix, 'seed-102', { website: 'https://example.org/' })];
const infoBase = () => BASE().map(r => ({ ...r, website: null, hours: null }));   // production rows carry the columns, empty

test('info dry-run: planned as plain updates (no duplicate/new classes), the report names website host and hours days, nothing is written', async () => {
  const w = await world({ records: INFO2, approved: infoBase(), id: '2026-03-01-gym-info' });
  assert.equal(w.plan.counts.update, 2); assert.equal(w.plan.counts['probable-duplicate'], 0); assert.equal(w.plan.counts.new, 0); assert.equal(w.plan.counts.invalid, 0);
  assert.equal(w.plan.importable, true, w.plan.blockers.join());
  assert.deepEqual(w.plan.records[0].changes, [{ field: 'website', before: null, after: 'https://www.example.com/gym' }, { field: 'hours', before: null, after: HOURS }]);
  const { renderReport } = require('../scripts/lib/gym-import/report');
  const rep = renderReport(w.plan);
  assert.match(rep, /FILLS gym information \(only if empty in production; never overwrites\): website example\.com \+ hours mon,tue,sat/);
  assert.match(rep, /website example\.org/);
  const dry = await runImport({ ...w.base });
  assert.equal(dry.exit, 0, dry.report); assert.equal(dry.kind, 'update'); assert.equal(dry.coverage, 'FULL'); assert.equal(dry.state, 'fresh');
  assert.match(dry.token, /^[0-9a-f]{16}$/);
  assert.match(dry.report, /Would fill gym information \(2 gyms;/);
  assert.match(dry.report, /seed-100 {2}Boulder Barn {2}website example\.com \+ hours mon,tue,sat/);
  assert.doesNotMatch(dry.report, /Would update \(/, 'no location section when there are no location updates');
  assert.equal(w.fake.state.patches.length + w.fake.state.infoPatches.length, 0);
  assert.equal(fs.existsSync(path.join(w.b.dir, 'manifest.json')), false);
});

test('info apply: gates first; then ONE PATCH per gym with exactly {website, hours}; verified; manifest keeps fills apart; re-run is a no-op', async () => {
  const w = await world({ records: INFO2, approved: infoBase(), id: '2026-03-01-gym-info' });
  const before = JSON.parse(JSON.stringify(w.fake.state.approved));
  const dry = await runImport({ ...w.base });
  const noFlag = await runImport({ ...w.base, mode: 'apply', confirm: dry.token });
  assert.equal(noFlag.exit, 2); assert.ok(failing(noFlag).includes('gate: --i-understand-this-writes-to-production'));
  const noTok = await runImport({ ...w.base, mode: 'apply', productionFlag: true }); assert.equal(noTok.exit, 2); assert.ok(failing(noTok).includes('gate: --confirm'));
  assert.equal(w.fake.state.infoPatches.length, 0, 'no write before every gate passes');

  const ok = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(ok.exit, 0, ok.report); assert.equal(ok.wrote, true); assert.deepEqual(ok.applied, ['seed-100', 'seed-102']);
  assert.equal(w.fake.state.patches.length, 0, 'the location PATCH is never used for an information fill');
  assert.equal(w.fake.state.infoPatches.length, 2, 'one PATCH per gym');
  assert.ok(w.fake.state.infoPatches.every(p => p.updatedAt === 'ts-0'), 'every PATCH is pinned to the row version seen at the final re-check');
  assert.deepEqual(w.fake.state.infoPatches[0].set, { website: 'https://www.example.com/gym', hours: HOURS });
  assert.deepEqual(w.fake.state.infoPatches[1].set, { website: 'https://example.org/' });
  const a = row(w, 'seed-100'), b0 = before.find(r => r.id === 'seed-100');
  assert.equal(a.website, 'https://www.example.com/gym'); assert.deepEqual(a.hours, HOURS);
  for (const f of ['name', 'suburb', 'state', 'country', 'lat', 'lng', 'address', 'types', 'notes', 'photo', 'status', 'community', 'edited']) assert.deepEqual(a[f], b0[f], 'unchanged: ' + f);
  assert.equal(row(w, 'seed-102').hours, null, 'a website-only fill leaves hours alone');
  for (const id of ['seed-101', 'community-0f3a7c2e-1111-4222-8333-444455556666']) assert.deepEqual(row(w, id), before.find(r => r.id === id), 'other gyms untouched');
  const m = JSON.parse(fs.readFileSync(path.join(w.b.dir, 'manifest.json'), 'utf8'));
  assert.equal(m.status, 'updated'); assert.equal(m.kind, 'update'); assert.deepEqual(m.ids, ['seed-100', 'seed-102']);
  assert.equal(m.rows_updated, 0, 'fills are not counted as location updates'); assert.deepEqual(m.changes, []);
  assert.equal(m.rows_info_filled, 2); assert.deepEqual(m.info_filled.map(c => [c.id, c.fields]), [['seed-100', ['website', 'hours']], ['seed-102', ['website']]]);
  assert.ok(m.info_filled.every(c => c.after_h === c.expect_h), 'the content hash is unchanged by a fill');
  assert.equal(m.verification.ok, true); assert.equal(m.approved_before, m.approved_after);
  assert.ok(!JSON.stringify(m).includes(w.key), 'no credential in the manifest');
  assert.equal(MF.readManifest(w.b.dir).valid, true);

  const again = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(again.exit, 0, again.report); assert.equal(again.state, 'already-updated'); assert.equal(w.fake.state.infoPatches.length, 2, 'a second apply writes nothing');
  const ver = await runImport({ ...w.base, mode: 'verify' }); assert.equal(ver.exit, 0, ver.report); assert.equal(ver.state, 'already-updated');
  fs.unlinkSync(path.join(w.b.dir, 'manifest.json'));
  const rec2 = await runImport({ ...w.base, mode: 'apply', confirm: 'irrelevant', productionFlag: true });
  assert.equal(rec2.exit, 0, rec2.report); assert.equal(rec2.state, 'already-present'); assert.equal(w.fake.state.infoPatches.length, 2, 'recovery writes nothing to the database');
});

test('info fill-only: a field that already holds a value is refused, naming the gym and field -- nothing is written; hours {} counts as empty', async () => {
  const set = (id, patch) => { const a = infoBase(); Object.assign(a.find(r => r.id === id), patch); return a; };
  for (const [patch, field] of [[{ website: 'https://community.example/edit' }, 'website'], [{ hours: { mon: '9-5' } }, 'hours'], [{ website: 'https://www.example.com/gym' }, 'website']]) {
    const w = await world({ records: INFO2, approved: set('seed-100', patch) });
    const r = await runImport({ ...w.base });
    assert.equal(r.exit, 2, r.report); assert.ok(failing(r).includes('fill-only: gym information already set in production') || failing(r).includes('production still has the researched content (expect_h)'), failing(r).join());
    assert.equal(w.fake.state.infoPatches.length, 0);
    const apply = await runImport({ ...w.base, mode: 'apply', confirm: '0'.repeat(16), productionFlag: true });
    assert.equal(apply.exit, 2); assert.equal(w.fake.state.infoPatches.length, 0, 'apply writes nothing either');
    if (patch.website === 'https://www.example.com/gym') continue;   // website already equals the record but hours is empty: half applied, refused as changed
    assert.ok(failing(r).includes('fill-only: gym information already set in production'), failing(r).join());
    assert.match(r.report, new RegExp(`seed-100 "Boulder Barn": ${field} already has a value`));
  }
  // a gym edited since the research (content hash moved) is the generic refusal
  const edited = await world({ records: INFO2, approved: set('seed-100', { notes: 'a moderator edited this' }) });
  const re = await runImport({ ...edited.base }); assert.equal(re.exit, 2); assert.ok(!failing(re).includes('fill-only: gym information already set in production')); assert.ok(failing(re).includes('production still has the researched content (expect_h)'), failing(re).join());
  // an empty hours object is empty: the fill goes ahead
  const ok = await world({ records: INFO2, approved: set('seed-100', { hours: {} }) });
  const dry = await runImport({ ...ok.base }); assert.equal(dry.exit, 0, dry.report);
  const done = await runImport({ ...ok.base, mode: 'apply', confirm: dry.token, productionFlag: true }); assert.equal(done.exit, 0, done.report);
  assert.deepEqual(row(ok, 'seed-100').hours, HOURS);
});

test('info records: website and hours values are validated strictly (byte for byte what the database will hold)', async () => {
  const long = 'https://example.com/' + 'a'.repeat(281);
  const cases = [
    [{ website: 'javascript:alert(1)' }, 'javascript:'], [{ website: 'ftp://example.com/' }, 'ftp'], [{ website: 'example.com' }, 'no scheme'], [{ website: 'https://example.com/a b' }, 'whitespace'],
    [{ website: ' https://example.com/' }, 'leading space'], [{ website: 'https://example.com/\n' }, 'newline'], [{ website: long }, '> 300 chars'], [{ website: 'https://user:pw@example.com/' }, 'credentials'],
    [{ website: 42 }, 'non-string'], [{ website: '' }, 'empty'], [{ website: null }, 'null'],
    [{ hours: { xyz: '9-5' } }, 'unknown key'], [{ hours: { mon: 9 } }, 'non-string value'], [{ hours: { mon: ' 9-5' } }, 'untrimmed (leading)'], [{ hours: { mon: '9-5 ' } }, 'untrimmed (trailing)'],
    [{ hours: { mon: 'x'.repeat(41) } }, '> 40 chars'], [{ hours: {} }, 'empty object'], [{ hours: { mon: '' } }, 'empty value'], [{ hours: ['9-5'] }, 'array'], [{ hours: 'Mon 9-5' }, 'string'], [{ hours: null }, 'null'],
    [{ hours: { Mon: '9-5' } }, 'upper-case key'], [{ hours: { mon: '9\n5' } }, 'line break'],
  ];
  for (const [set, what] of cases) {
    const w = await world({ records: ix => [info(ix, 'seed-100', set)], approved: infoBase() });
    assert.equal(w.plan.counts.invalid, 1, what); assert.equal(w.plan.importable, false, what);
    const r = await runImport({ ...w.base });
    assert.equal(r.exit, 2, what + '\n' + r.report); assert.ok(failing(r).some(n => /records validate/.test(n)), what + ': ' + failing(r).join());
    assert.equal(w.fake.state.infoPatches.length, 0, what);
  }
  const edge = [{ website: 'https://example.com/' + 'a'.repeat(280) }, { hours: { sun: 'x'.repeat(40) } }, { website: 'http://example.com' }, { hours: { mon: 'Closed', tue: '24 hours' } }];   // exactly at the limits / minimal valid
  for (const set of edge) { const w = await world({ records: ix => [info(ix, 'seed-100', set)], approved: infoBase() }); assert.equal(w.plan.counts.update, 1, JSON.stringify(set).slice(0, 60)); assert.equal(w.plan.importable, true, w.plan.blockers.join()); }
});

test('info records: one family per record (info never mixes with location or other fields) and one record per gym; a maintenance batch may mix the families across gyms', async () => {
  for (const [set, what] of [[{ website: 'https://example.com/', lat: -33.882, lng: 151.213 }, 'website + pin'], [{ hours: HOURS, address: '1 St' }, 'hours + address'], [{ website: 'https://example.com/', name: 'Renamed' }, 'website + name']]) {
    const w = await world({ records: ix => [info(ix, 'seed-100', set)], approved: infoBase() });
    assert.equal(w.plan.counts.invalid, 1, what); assert.match(JSON.stringify(w.plan), /mixed-families/, what);
    const r = await runImport({ ...w.base }); assert.equal(r.exit, 2, what); assert.ok(failing(r).some(n => /records validate/.test(n)), what); assert.equal(w.fake.state.infoPatches.length + w.fake.state.patches.length, 0);
  }
  const twice = await world({ records: ix => [info(ix, 'seed-100'), upd(ix, 'seed-100', { lat: -33.882, lng: 151.213 })], approved: infoBase() });
  const rt = await runImport({ ...twice.base }); assert.equal(rt.exit, 2); assert.ok(failing(rt).includes('one update per gym'), failing(rt).join());

  const mixed = ix => [info(ix, 'seed-100'), upd(ix, 'seed-102', { lat: -33.8785, lng: 151.196 }), ret(ix, 'seed-101')];
  const w = await world({ records: mixed, approved: infoBase(), id: '2026-03-02-maintenance' });
  assert.equal(w.plan.counts.update, 2); assert.equal(w.plan.counts.retire, 1); assert.equal(w.plan.importable, true, w.plan.blockers.join());
  const dry = await runImport({ ...w.base });
  assert.equal(dry.exit, 0, dry.report); assert.match(dry.report, /Would update \(1 gyms, 2 field changes/); assert.match(dry.report, /Would fill gym information \(1 gyms/); assert.match(dry.report, /Would retire \(1 gyms/);
  const ok = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(ok.exit, 0, ok.report); assert.deepEqual(ok.applied, ['seed-100', 'seed-102', 'seed-101']);
  assert.equal(w.fake.state.infoPatches.length, 1); assert.equal(w.fake.state.patches.length, 1); assert.equal(w.fake.state.retires.length, 1);
  assert.equal(row(w, 'seed-100').website, 'https://www.example.com/gym'); assert.equal(row(w, 'seed-102').lat, -33.8785); assert.equal(row(w, 'seed-101').status, 'rejected');
  const m = JSON.parse(fs.readFileSync(path.join(w.b.dir, 'manifest.json'), 'utf8'));
  assert.equal(m.rows_updated, 1); assert.deepEqual(m.changes.map(c => c.id), ['seed-102'], 'location changes list only the location updates');
  assert.equal(m.rows_info_filled, 1); assert.deepEqual(m.info_filled.map(c => c.id), ['seed-100']); assert.deepEqual(m.retired, ['seed-101']);
  assert.deepEqual(m.ids, ['seed-100', 'seed-102', 'seed-101']);
  const again = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true }); assert.equal(again.exit, 0); assert.equal(again.state, 'already-updated');
  // the location update is applied but the fill is not: a mixed state is refused, never merged
  const half = await world({ records: mixed, approved: infoBase() });
  Object.assign(row(half, 'seed-102'), { lat: -33.8785, lng: 151.196, updated_at: 'ts-x' });
  const rh = await runImport({ ...half.base }); assert.equal(rh.exit, 2); assert.ok(failing(rh).includes('no partly applied batch'), failing(rh).join());
});

test('info: a gym changed between the dry-run and the apply, or just before its PATCH, is refused and nothing is written', async () => {
  // (a) a community edit approved after the token was issued (website filled) -> the final re-check refuses
  const w1 = await world({ records: INFO2, approved: infoBase() }); const dry1 = await runImport({ ...w1.base });
  let reads = 0;
  w1.fake.state.hooks.beforeRead = (q, st) => { if (q.includes('status=eq.approved') && ++reads === 2) st.approved.find(r => r.id === 'seed-102').website = 'https://community.example/'; };
  const r1 = await runImport({ ...w1.base, mode: 'apply', confirm: dry1.token, productionFlag: true });
  assert.equal(r1.exit, 2, r1.report); assert.ok(failing(r1).includes('final re-check before write'), failing(r1).join()); assert.equal(w1.fake.state.infoPatches.length, 0);
  assert.equal(row(w1, 'seed-102').website, 'https://community.example/', 'the community value stays');

  // (b) the FIRST target is edited just before its PATCH: 0 rows match, refused, no manifest
  const w2 = await world({ records: INFO2, approved: infoBase() }); const dry2 = await runImport({ ...w2.base });
  w2.fake.state.hooks.beforePatch = (u, st) => { if (u.id === 'seed-100') { const r = st.approved.find(x => x.id === 'seed-100'); r.website = 'https://community.example/'; r.updated_at = 'ts-moderator'; } };
  const r2 = await runImport({ ...w2.base, mode: 'apply', confirm: dry2.token, productionFlag: true });
  assert.equal(r2.exit, 2, r2.report); assert.ok(failing(r2).includes('updates')); assert.match(r2.report, /0 row\(s\) matched/);
  assert.equal(row(w2, 'seed-100').website, 'https://community.example/', 'not overwritten'); assert.equal(w2.fake.state.infoPatches.length, 1, 'stopped at the first refusal');
  assert.equal(fs.existsSync(path.join(w2.b.dir, 'manifest.json')), false);

  // (c) the SECOND target changes just before its PATCH: one gym filled -> partial state, failure record, exit 4, no manifest; a re-run refuses the mixed state
  const w3 = await world({ records: INFO2, approved: infoBase() }); const dry3 = await runImport({ ...w3.base });
  w3.fake.state.hooks.beforePatch = (u, st) => { if (u.id === 'seed-102') st.approved.find(r => r.id === 'seed-102').updated_at = 'ts-moderator'; };
  const r3 = await runImport({ ...w3.base, mode: 'apply', confirm: dry3.token, productionFlag: true });
  assert.equal(r3.exit, 4, r3.report); assert.equal(fs.existsSync(path.join(w3.b.dir, 'manifest.json')), false);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(w3.b.dir, 'import-failure.json'), 'utf8')).applied_ids, ['seed-100']);
  const again = await runImport({ ...w3.base }); assert.equal(again.exit, 2); assert.ok(failing(again).includes('no partly applied batch'), failing(again).join());
});

test('info verification: another spot whose website/hours changed during the writes is a failure record (exit 4), never a manifest', async () => {
  const w = await world({ records: INFO2, approved: infoBase() }); const dry = await runImport({ ...w.base });
  w.fake.state.hooks.beforePatch = (u, st) => { if (u.id === 'seed-102') st.approved.find(r => r.id === 'seed-101').website = 'https://bystander.example/'; };
  const r = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(r.exit, 4, r.report); assert.match(r.report, /website\/hours\/day_pass\/facilities of other spots changed: seed-101/);
  assert.equal(fs.existsSync(path.join(w.b.dir, 'manifest.json')), false); assert.equal(fs.existsSync(path.join(w.b.dir, 'import-failure.json')), true);
});

test('stateOf for info records: before = hash ok and every field empty; after = every field equals the record (hours deep equality); anything else is changed and lists the fields already set', () => {
  const { stateOf } = require('../scripts/lib/gym-import/updater');
  const base = { ...infoBase().find(r => r.id === 'seed-100'), updated_at: 'ts-0' }, h = S.toEntry(base).h;
  const rec1 = { id: 'seed-100', expect_h: h, set: { website: 'https://example.com/', hours: { mon: '9-5', tue: '9-5' } } };
  const st = r => stateOf(r, null, rec1);
  assert.equal(st(base).state, 'before'); assert.equal(st({ ...base, hours: {} }).state, 'before', 'hours {} is empty'); assert.equal(st({ ...base, website: undefined, hours: undefined }).state, 'before');
  assert.equal(st({ ...base, website: 'https://example.com/', hours: { tue: '9-5', mon: '9-5' } }).state, 'after', 'key order does not matter');
  assert.deepEqual(st({ ...base, website: 'https://other.example/' }), { state: 'changed', h, filled: ['website'] });
  assert.deepEqual(st({ ...base, hours: { mon: '9-6' } }).filled, ['hours']);
  assert.equal(st({ ...base, website: 'https://example.com/' }).state, 'changed', 'half applied is not before, not after'); assert.deepEqual(st({ ...base, website: 'https://example.com/' }).filled, []);
  assert.equal(st({ ...base, website: 'https://example.com/', hours: rec1.set.hours, notes: 'edited' }).state, 'changed', 'content hash moved');
  assert.equal(stateOf({ ...base, hours: { mon: '9-5' } }, null, { ...rec1, set: { website: 'https://example.com/' } }).state, 'before', 'only the fields in "set" matter (hours is not being filled)');
  assert.equal(st({ ...base, status: 'rejected' }).state, 'not-approved'); assert.equal(st(undefined).state, 'missing');
});

test('info: website/hours are not part of the content hash (a fill never changes expect_h)', () => {
  const N = require('../scripts/lib/gym-import/normalize');
  const g = infoBase()[0];
  assert.equal(N.contentHash(g), N.contentHash({ ...g, website: 'https://example.com/', hours: { mon: '9-5' }, description: 'x', day_pass: '1', facilities: ['cafe'] }));
  assert.equal(S.toEntry(g).h, S.toEntry({ ...g, website: 'https://example.com/' }).h);
});

test('target.js updateSpotInfo: refuses without the update gate or with anything but the approved change; sends one pinned PATCH with exactly the approved {website, hours}', async () => {
  const api = new T.Api({ url: 'https://example.supabase.co', serviceKey: 'service-key-xxxxxxxx', anonKey: 'anon-key-xxxxxxxx' });
  const sent = []; api._send = async (method, q, o) => { sent.push({ method, q, o }); return { ok: true, status: 200, json: [{}] }; };
  const sha = (updates, retires = []) => crypto.createHash('sha256').update(JSON.stringify(T.opsPayload(updates, retires))).digest('hex');
  const updates = [{ id: 'seed-100', set: { website: 'https://example.com/gym', hours: { mon: '6am–10pm' } }, expect_h: '0123456789abcdef' }];
  const payloadSha = sha(updates), gate = T.mintUpdateGate({ batchId: 'b', token: 't', updates, payloadSha });
  const u = { id: 'seed-100', set: updates[0].set, updatedAt: '2026-09-24T01:02:03.123456+00:00' };
  await assert.rejects(api.updateSpotInfo(u, null), /no update gate/);
  await assert.rejects(api.updateSpotInfo(u, T.mintWriteGate({ batchId: 'b', token: 't', rows: [], payloadSha })), /no update gate/, 'the insert gate cannot authorise a fill');
  await assert.rejects(api.updateSpotInfo(u, { ...gate }), /no update gate/, 'a copied gate is not a gate');
  await assert.rejects(api.updateSpotInfo(u, Object.freeze({ [Object.getOwnPropertySymbols(gate)[0]]: true, updates, retires: [], payloadSha })), /no update gate/, 'a hand-built look-alike is not a gate');
  await assert.rejects(api.updateSpotInfo(u, T.mintUpdateGate({ batchId: 'b', token: 't', updates, payloadSha: 'f'.repeat(64) })), /hash mismatch/);
  await assert.rejects(api.updateSpotInfo({ ...u, set: { ...u.set, website: 'https://evil.example/' } }, gate), /not the approved one/, 'a different body');
  await assert.rejects(api.updateSpotInfo({ ...u, set: { website: u.set.website } }, gate), /not the approved one/, 'a subset of the approved body');
  await assert.rejects(api.updateSpotInfo({ ...u, id: 'seed-101' }, gate), /not the approved one/, 'a different gym');
  const bad = async (set, re) => { const g = T.mintUpdateGate({ batchId: 'b', token: 't', updates: [{ id: 'seed-100', set, expect_h: '0123456789abcdef' }], payloadSha: sha([{ id: 'seed-100', set, expect_h: '0123456789abcdef' }]) }); await assert.rejects(api.updateSpotInfo({ ...u, set }, g), re); };
  await bad({ website: 'https://example.com/', name: 'x' }, /only website\/hours/);
  await bad({ lat: 1, lng: 2 }, /only website\/hours/);
  await bad({ website: 'https://example.com/', status: 'rejected' }, /only website\/hours/);
  await bad({ website: 'javascript:alert(1)' }, /website must be/);
  await bad({ website: 'https://example.com/a b' }, /website must be/);
  await bad({ hours: { mon: ' 9-5' } }, /hours\.mon must be/);
  await bad({ hours: { zzz: '9-5' } }, /unknown day/);
  await bad({ hours: {} }, /at least one day/);
  await assert.rejects(api.updateSpotInfo({ ...u, updatedAt: '' }, gate), /updated_at/);
  await assert.rejects(api.updateSpotLocation(u, gate), /only address\/lat\/lng/, 'the location write cannot carry website/hours');
  await assert.rejects(api.retireSpot({ id: 'seed-100', reason: 'permanently closed (test)', updatedAt: 'x' }, gate), /not the approved one/, 'an info gate retires nothing');
  assert.equal(sent.length, 0, 'nothing sent for any refusal');
  await api.updateSpotInfo(u, gate);
  assert.equal(sent.length, 1); assert.equal(sent[0].method, 'PATCH'); assert.equal(sent[0].o.service, true);
  assert.equal(sent[0].q, '/rest/v1/spots?id=eq.seed-100&status=eq.approved&updated_at=eq.2026-09-24T01%3A02%3A03.123456%2B00%3A00');
  assert.equal(sent[0].o.body, JSON.stringify(updates[0].set), 'the body is exactly the approved set'); assert.match(sent[0].o.headers.Prefer, /return=representation/);
});

test('info confirmation token: bound to the exact values (a different website/hours never matches)', async () => {
  const { confirmToken } = require('../scripts/lib/gym-import/updater');
  const mk = set => confirmToken({ batchId: 'b', planSha: 'p', payload: crypto.createHash('sha256').update(JSON.stringify([{ id: 'seed-100', set, expect_h: '0123456789abcdef' }])).digest('hex'), host: 'h', kind: 'local', coverage: 'FULL', liveSha: 'l' });
  assert.notEqual(mk({ website: 'https://example.com/' }), mk({ website: 'https://example.org/' }));
  assert.notEqual(mk({ hours: { mon: '9-5' } }), mk({ hours: { mon: '9-6' } }));
  assert.equal(mk({ website: 'https://example.com/' }), mk({ website: 'https://example.com/' }));
  const w = await world({ records: INFO2, approved: infoBase() }); const w2 = await world({ records: ix => [info(ix, 'seed-100', { website: 'https://other.example/' }), info(ix, 'seed-102', { website: 'https://example.org/' })], approved: infoBase() });
  assert.notEqual((await runImport({ ...w.base })).token, (await runImport({ ...w2.base })).token);
});

// ============================================ gym information, part 2: day_pass + facilities (same fill-only path) ================
// day_pass: text, 1..120 chars, trimmed, single line. facilities: non-empty, unique keys of the fixed list, in CANONICAL order (the order of
// js/modules/gym-info.js FACILITIES), so the stored text[] equals the record byte for byte. Empty in production = null / '' (day_pass),
// null / [] (facilities; the column is not null default '{}').
const DAYPASS = 'A$28 adult, A$22 concession', FAC = ['cafe', 'shoe-hire', 'parking'];
const infoBase2 = () => infoBase().map(r => ({ ...r, day_pass: null, facilities: [] }));   // production: day_pass null, facilities '{}'
const DP2 = ix => [info(ix, 'seed-100', { day_pass: DAYPASS, facilities: FAC }), info(ix, 'seed-102', { facilities: ['yoga'] })];

test('info day pass + facilities: dry-run names them, ONE PATCH per gym with exactly the approved fields, verified, manifest, re-run is a no-op', async () => {
  const w = await world({ records: DP2, approved: infoBase2(), id: '2026-03-03-gym-info-dp' });
  assert.equal(w.plan.importable, true, w.plan.blockers.join());
  assert.deepEqual(w.plan.records[0].changes, [{ field: 'day_pass', before: null, after: DAYPASS }, { field: 'facilities', before: null, after: FAC }]);
  const dry = await runImport({ ...w.base });
  assert.equal(dry.exit, 0, dry.report); assert.equal(dry.kind, 'update'); assert.equal(dry.state, 'fresh');
  assert.match(dry.report, /seed-100 {2}Boulder Barn {2}day pass \+ facilities \(3\)/); assert.match(dry.report, /seed-102 {2}Granite Gym {2}facilities \(1\)/);
  assert.match(require('../scripts/lib/gym-import/report').renderReport(w.plan), /FILLS gym information \(only if empty in production; never overwrites\): day pass \+ facilities \(3\)/);
  assert.equal(w.fake.state.infoPatches.length, 0);
  const before = JSON.parse(JSON.stringify(w.fake.state.approved));
  const ok = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(ok.exit, 0, ok.report); assert.deepEqual(ok.applied, ['seed-100', 'seed-102']);
  assert.equal(w.fake.state.patches.length, 0); assert.equal(w.fake.state.infoPatches.length, 2);
  assert.deepEqual(w.fake.state.infoPatches[0].set, { day_pass: DAYPASS, facilities: FAC }); assert.deepEqual(w.fake.state.infoPatches[1].set, { facilities: ['yoga'] });
  assert.equal(row(w, 'seed-100').day_pass, DAYPASS); assert.deepEqual(row(w, 'seed-100').facilities, FAC); assert.deepEqual(row(w, 'seed-102').facilities, ['yoga']); assert.equal(row(w, 'seed-102').day_pass, null);
  for (const f of ['name', 'lat', 'lng', 'address', 'types', 'notes', 'status', 'website', 'hours']) assert.deepEqual(row(w, 'seed-100')[f], before.find(r => r.id === 'seed-100')[f], 'unchanged: ' + f);
  for (const id of ['seed-101', 'community-0f3a7c2e-1111-4222-8333-444455556666']) assert.deepEqual(row(w, id), before.find(r => r.id === id), 'other gyms untouched');
  const m = JSON.parse(fs.readFileSync(path.join(w.b.dir, 'manifest.json'), 'utf8'));
  assert.equal(m.status, 'updated'); assert.equal(m.rows_updated, 0); assert.equal(m.rows_info_filled, 2);
  assert.deepEqual(m.info_filled.map(c => [c.id, c.fields]), [['seed-100', ['day_pass', 'facilities']], ['seed-102', ['facilities']]]); assert.equal(m.verification.ok, true);
  const again = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(again.exit, 0, again.report); assert.equal(again.state, 'already-updated'); assert.equal(w.fake.state.infoPatches.length, 2, 'a second apply writes nothing');
  assert.equal((await runImport({ ...w.base, mode: 'verify' })).exit, 0);
});

test('info day pass + facilities fill-only: a different value is refused naming gym + field, nothing is written; "" / null / [] are empty', async () => {
  const set = (id, patch) => { const a = infoBase2(); Object.assign(a.find(r => r.id === id), patch); return a; };
  for (const [patch, field] of [[{ day_pass: 'A$30 adult' }, 'day_pass'], [{ facilities: ['kids'] }, 'facilities'], [{ facilities: ['parking', 'cafe', 'shoe-hire'] }, 'facilities'], [{ facilities: ['cafe'] }, 'facilities']]) {
    const w = await world({ records: DP2, approved: set('seed-100', patch) });
    const r = await runImport({ ...w.base });
    assert.equal(r.exit, 2, r.report); assert.ok(failing(r).includes('fill-only: gym information already set in production'), failing(r).join());
    assert.match(r.report, new RegExp(`seed-100 "Boulder Barn": ${field} already has a value`));
    const apply = await runImport({ ...w.base, mode: 'apply', confirm: '0'.repeat(16), productionFlag: true });
    assert.equal(apply.exit, 2); assert.equal(w.fake.state.infoPatches.length, 0, 'nothing written');
  }
  // one field already equals the record, the other is empty: half applied, refused (never merged)
  const half = await world({ records: DP2, approved: set('seed-100', { day_pass: DAYPASS }) });
  assert.equal((await runImport({ ...half.base })).exit, 2); assert.equal(half.fake.state.infoPatches.length, 0);
  // "" for day_pass, null / [] for facilities are empty: the fill goes ahead
  for (const patch of [{ day_pass: '' }, { facilities: null }, { facilities: [] }, { day_pass: null, facilities: undefined }]) {
    const ok = await world({ records: DP2, approved: set('seed-100', patch) });
    const dry = await runImport({ ...ok.base }); assert.equal(dry.exit, 0, JSON.stringify(patch) + dry.report);
    const done = await runImport({ ...ok.base, mode: 'apply', confirm: dry.token, productionFlag: true }); assert.equal(done.exit, 0, done.report);
    assert.equal(row(ok, 'seed-100').day_pass, DAYPASS); assert.deepEqual(row(ok, 'seed-100').facilities, FAC);
  }
  // only the fields in "set" matter: a gym that already has facilities still gets its day pass
  const only = await world({ records: ix => [info(ix, 'seed-100', { day_pass: DAYPASS })], approved: set('seed-100', { facilities: ['kids'] }) });
  const d2 = await runImport({ ...only.base }); assert.equal(d2.exit, 0, d2.report);
  const x = await runImport({ ...only.base, mode: 'apply', confirm: d2.token, productionFlag: true }); assert.equal(x.exit, 0, x.report);
  assert.equal(row(only, 'seed-100').day_pass, DAYPASS); assert.deepEqual(row(only, 'seed-100').facilities, ['kids'], 'facilities untouched');
});

test('info records: day_pass and facilities values are validated strictly (byte for byte what the database will hold)', async () => {
  const cases = [
    [{ day_pass: '' }, 'empty day pass'], [{ day_pass: 'x'.repeat(121) }, '> 120 chars'], [{ day_pass: ' A$28' }, 'untrimmed (leading)'], [{ day_pass: 'A$28 ' }, 'untrimmed (trailing)'],
    [{ day_pass: 'A$28\nadult' }, 'newline'], [{ day_pass: 'A$28\tadult' }, 'tab'], [{ day_pass: 'A$28\r' }, 'carriage return'], [{ day_pass: 28 }, 'number'], [{ day_pass: null }, 'null'], [{ day_pass: ['A$28'] }, 'array'],
    [{ facilities: [] }, 'empty array'], [{ facilities: ['cafe', 'spa'] }, 'unknown key'], [{ facilities: ['cafe', 'cafe'] }, 'duplicate'], [{ facilities: 'cafe' }, 'string'], [{ facilities: null }, 'null'],
    [{ facilities: ['cafe', 7] }, 'non-string member'], [{ facilities: [null] }, 'null member'], [{ facilities: ['Cafe'] }, 'wrong case'], [{ facilities: ['shoe_hire'] }, 'wrong separator'],
    [{ facilities: ['parking', 'cafe'] }, 'not in canonical order'], [{ facilities: ['yoga', 'training'] }, 'not in canonical order (2)'], [{ facilities: { cafe: true } }, 'object'],
  ];
  for (const [set, what] of cases) {
    const w = await world({ records: ix => [info(ix, 'seed-100', set)], approved: infoBase2() });
    assert.equal(w.plan.counts.invalid, 1, what); assert.equal(w.plan.importable, false, what);
    const r = await runImport({ ...w.base });
    assert.equal(r.exit, 2, what + '\n' + r.report); assert.ok(failing(r).some(n => /records validate/.test(n)), what + ': ' + failing(r).join());
    assert.equal(w.fake.state.infoPatches.length, 0, what);
  }
  const edge = [{ day_pass: 'x'.repeat(120) }, { day_pass: 'Free' }, { facilities: ['cafe', 'training', 'kids', 'shoe-hire', 'shop', 'showers', 'parking', 'yoga'] }, { facilities: ['yoga'] }, { facilities: ['training', 'shop', 'yoga'] }];
  for (const set of edge) { const w = await world({ records: ix => [info(ix, 'seed-100', set)], approved: infoBase2() }); assert.equal(w.plan.counts.update, 1, JSON.stringify(set).slice(0, 60)); assert.equal(w.plan.importable, true, w.plan.blockers.join()); }
  const V = require('../scripts/lib/gym-import/validate');
  assert.deepEqual([...V.FACILITY_KEYS], ['cafe', 'training', 'kids', 'shoe-hire', 'shop', 'showers', 'parking', 'yoga']);
  assert.deepEqual([...V.INFO_FIELDS], ['website', 'hours', 'day_pass', 'facilities', 'notes']);
});

test('info day pass + facilities: the validator keys equal the migration check and js/modules/gym-info.js (no drift)', () => {
  const V = require('../scripts/lib/gym-import/validate');
  const mig = fs.readFileSync(path.join(ROOT, 'supabase/migrations/20261004000100_gym_information.sql'), 'utf8');
  const arr = /facilities <@ array\[([^\]]*)\]/.exec(mig)[1].split(',').map(x => x.trim().replace(/'/g, ''));
  assert.deepEqual(arr, [...V.FACILITY_KEYS], 'the migration check list, in the same order');
  assert.equal(Number(/char_length\(day_pass\) <= (\d+)/.exec(mig)[1]), V.INFO_LIMITS.day_pass);
  const js = fs.readFileSync(path.join(ROOT, 'js/modules/gym-info.js'), 'utf8');
  const keys = [...js.slice(js.indexOf('export const FACILITIES'), js.indexOf('// Database caps')).matchAll(/\['([a-z-]+)', '/g)].map(m => m[1]);
  assert.deepEqual(keys, [...V.FACILITY_KEYS], 'js/modules/gym-info.js FACILITIES order');
  assert.equal(Number(/day_pass: (\d+)/.exec(js)[1]), V.INFO_LIMITS.day_pass);
});

test('info day pass + facilities never mix with location or other fields in one record; a maintenance batch may mix the families across gyms', async () => {
  for (const [set, what] of [[{ day_pass: DAYPASS, lat: -33.882, lng: 151.213 }, 'day pass + pin'], [{ facilities: FAC, address: '1 St' }, 'facilities + address'], [{ day_pass: DAYPASS, name: 'Renamed' }, 'day pass + name'], [{ facilities: FAC, website: 'https://example.com/', notes: 'x', name: 'Renamed' }, 'info + notes + name']]) {
    const w = await world({ records: ix => [info(ix, 'seed-100', set)], approved: infoBase2() });
    assert.equal(w.plan.counts.invalid, 1, what); assert.match(JSON.stringify(w.plan), /mixed-families/, what);
    const r = await runImport({ ...w.base }); assert.equal(r.exit, 2, what); assert.equal(w.fake.state.infoPatches.length + w.fake.state.patches.length, 0);
  }
  const mixed = ix => [info(ix, 'seed-100', { day_pass: DAYPASS, facilities: FAC }), upd(ix, 'seed-102', { lat: -33.8785, lng: 151.196 }), ret(ix, 'seed-101')];
  const w = await world({ records: mixed, approved: infoBase2(), id: '2026-03-04-maintenance-dp' });
  const dry = await runImport({ ...w.base }); assert.equal(dry.exit, 0, dry.report);
  const ok = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true }); assert.equal(ok.exit, 0, ok.report);
  assert.equal(w.fake.state.infoPatches.length, 1); assert.equal(w.fake.state.patches.length, 1); assert.equal(w.fake.state.retires.length, 1);
  assert.deepEqual(row(w, 'seed-100').facilities, FAC); assert.equal(row(w, 'seed-102').lat, -33.8785);
});

test('info verification: another spot whose day pass or facilities changed during the writes is a failure record (exit 4), never a manifest', async () => {
  for (const patch of [{ day_pass: 'A$1 bystander' }, { facilities: ['yoga'] }]) {
    const w = await world({ records: DP2, approved: infoBase2() }); const dry = await runImport({ ...w.base });
    w.fake.state.hooks.beforePatch = (u, st) => { if (u.id === 'seed-102') Object.assign(st.approved.find(r => r.id === 'seed-101'), patch); };
    const r = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
    assert.equal(r.exit, 4, r.report); assert.match(r.report, /of other spots changed: seed-101/);
    assert.equal(fs.existsSync(path.join(w.b.dir, 'manifest.json')), false); assert.equal(fs.existsSync(path.join(w.b.dir, 'import-failure.json')), true);
  }
});

test('stateOf for day pass + facilities: empty = null/\'\'/[]; after = deep equality (facilities in order); anything else is changed and names the field', () => {
  const { stateOf } = require('../scripts/lib/gym-import/updater');
  const base = { ...infoBase2().find(r => r.id === 'seed-100'), updated_at: 'ts-0' }, h = S.toEntry(base).h;
  const rec1 = { id: 'seed-100', expect_h: h, set: { day_pass: DAYPASS, facilities: FAC } };
  const st = r => stateOf(r, null, rec1);
  for (const e of [{}, { day_pass: '' }, { facilities: null }, { facilities: undefined, day_pass: undefined }]) assert.equal(st({ ...base, ...e }).state, 'before', JSON.stringify(e));
  assert.equal(st({ ...base, day_pass: DAYPASS, facilities: [...FAC] }).state, 'after');
  assert.equal(st({ ...base, day_pass: DAYPASS, facilities: ['parking', 'shoe-hire', 'cafe'] }).state, 'changed', 'a reordered array is not the record');
  assert.deepEqual(st({ ...base, facilities: ['kids'] }), { state: 'changed', h, filled: ['facilities'] });
  assert.deepEqual(st({ ...base, day_pass: 'other' }).filled, ['day_pass']);
  assert.deepEqual(st({ ...base, day_pass: DAYPASS }).filled, [], 'half applied: not before, not after, nothing foreign');
  assert.equal(st({ ...base, day_pass: DAYPASS, facilities: FAC, notes: 'edited' }).state, 'changed', 'content hash moved');
  assert.equal(stateOf({ ...base, facilities: ['kids'] }, null, { ...rec1, set: { day_pass: DAYPASS } }).state, 'before', 'only the fields in "set" matter');
});

test('target.js updateSpotInfo: the gate accepts day_pass/facilities exactly as approved and refuses invalid values and foreign fields', async () => {
  const api = new T.Api({ url: 'https://example.supabase.co', serviceKey: 'service-key-xxxxxxxx', anonKey: 'anon-key-xxxxxxxx' });
  const sent = []; api._send = async (method, q, o) => { sent.push({ method, q, o }); return { ok: true, status: 200, json: [{}] }; };
  const sha = updates => crypto.createHash('sha256').update(JSON.stringify(T.opsPayload(updates, []))).digest('hex');
  const gateFor = set => { const updates = [{ id: 'seed-100', set, expect_h: '0123456789abcdef' }]; return T.mintUpdateGate({ batchId: 'b', token: 't', updates, payloadSha: sha(updates) }); };
  const u = set => ({ id: 'seed-100', set, updatedAt: '2026-09-24T01:02:03.123456+00:00' });
  const bad = async (set, re) => assert.rejects(api.updateSpotInfo(u(set), gateFor(set)), re, JSON.stringify(set));
  await bad({ day_pass: '' }, /day_pass must be/); await bad({ day_pass: 'x'.repeat(121) }, /day_pass is 121/); await bad({ day_pass: ' A$28' }, /day_pass must be trimmed/);
  await bad({ day_pass: 'A$28\nadult' }, /day_pass must be trimmed/); await bad({ day_pass: 28 }, /day_pass must be/);
  await bad({ facilities: [] }, /facilities must be a non-empty array/); await bad({ facilities: ['spa'] }, /unknown facility/); await bad({ facilities: ['cafe', 'cafe'] }, /duplicates/);
  await bad({ facilities: 'cafe' }, /facilities must be a non-empty array/); await bad({ facilities: ['parking', 'cafe'] }, /canonical order/); await bad({ facilities: [7] }, /unknown facility/);
  await bad({ day_pass: DAYPASS, status: 'rejected' }, /only website\/hours\/day_pass\/facilities/); await bad({ facilities: FAC, description: 'x' }, /only website\/hours\/day_pass\/facilities/);
  assert.equal(sent.length, 0, 'nothing sent for any refusal');
  const set = { day_pass: DAYPASS, facilities: FAC }, gate = gateFor(set);
  await assert.rejects(api.updateSpotInfo(u({ day_pass: DAYPASS }), gate), /not the approved one/, 'a subset of the approved body');
  await assert.rejects(api.updateSpotInfo(u({ day_pass: DAYPASS, facilities: ['cafe'] }), gate), /not the approved one/, 'a different body');
  await api.updateSpotInfo(u(set), gate);
  assert.equal(sent.length, 1); assert.equal(sent[0].method, 'PATCH'); assert.equal(sent[0].o.body, JSON.stringify(set), 'the body is exactly the approved set');
  assert.equal(sent[0].q, '/rest/v1/spots?id=eq.seed-100&status=eq.approved&updated_at=eq.2026-09-24T01%3A02%3A03.123456%2B00%3A00');
});

test('info confirmation token is bound to the exact day pass and facilities', async () => {
  const { confirmToken } = require('../scripts/lib/gym-import/updater');
  const mk = set => confirmToken({ batchId: 'b', planSha: 'p', payload: crypto.createHash('sha256').update(JSON.stringify([{ id: 'seed-100', set, expect_h: '0123456789abcdef' }])).digest('hex'), host: 'h', kind: 'local', coverage: 'FULL', liveSha: 'l' });
  assert.notEqual(mk({ day_pass: 'A$28' }), mk({ day_pass: 'A$29' })); assert.notEqual(mk({ facilities: ['cafe'] }), mk({ facilities: ['cafe', 'shop'] }));
  assert.equal(mk({ facilities: ['cafe'] }), mk({ facilities: ['cafe'] }));
});

// ============================================ gym identity (intent "update", set: name / suburb / types) =========================
// A CORRECTION of the identity fields of an existing approved gym. Unlike gym information they ARE in the content hash and in the index, so the states
// come from the hash: before = hash is expect_h; after = the fields hold exactly the record AND the row with them restored hashes to expect_h.
// Same gates, pin and one-PATCH-per-gym rule as location updates; a rename must not make the gym look like another gym; the stored slug never moves.
const H = require('../scripts/lib/gym-import/history');
const M = require('../scripts/lib/gym-import/match');
const slugged = () => BASE().map(r => ({ ...r, slug: 'slug-' + r.id }));   // production rows carry the stored slug the database keeps
const idRec = (ix, id, set, over = {}) => upd(ix, id, set, { reason: 'name, suburb and type tags confirmed on the official site (test)', source: 'https://www.example.com/about (official site, test)', ...over });
const FULL_TYPES = ['indoor-bouldering', 'top-rope', 'lead-climbing'];   // canonical TYPES order (the index keeps them sorted: indoor, lead, top)
const ID3 = ix => [idRec(ix, 'seed-100', { name: 'Boulder Barn Sydney' }), idRec(ix, 'seed-101', { suburb: 'Fitzroy North', types: FULL_TYPES }), idRec(ix, 'seed-102', { name: 'Granite Gym Ultimo', suburb: 'Ultimo NSW', types: ['indoor-bouldering', 'top-rope'] })];
const identityKeys = r => ({ id: r.id, name: r.name, suburb: r.suburb, types: r.types });

test('identity: a rename, a suburb change and a type change are planned with before -> after, written with ONE pinned PATCH each, verified, and the slug stays', async () => {
  const w = await world({ records: ID3, approved: slugged(), id: '2026-04-01-gym-identity' });
  assert.equal(w.plan.counts.update, 3); assert.equal(w.plan.counts.invalid, 0); assert.equal(w.plan.importable, true, w.plan.blockers.join());
  assert.deepEqual(w.plan.records[0].changes, [{ field: 'name', before: 'Boulder Barn', after: 'Boulder Barn Sydney' }]);
  assert.deepEqual(w.plan.records[1].changes, [{ field: 'suburb', before: 'Fitzroy', after: 'Fitzroy North' }, { field: 'types', before: ['indoor-bouldering', 'top-rope'], after: FULL_TYPES }]);
  const rep = require('../scripts/lib/gym-import/report').renderReport(w.plan);
  assert.match(rep, /CORRECTS identity \(name; the stored slug and every other field stay as they are\)/);
  assert.match(rep, /name: "Boulder Barn" → "Boulder Barn Sydney"/); assert.match(rep, /suburb: "Fitzroy" → "Fitzroy North"/); assert.match(rep, /types: \["indoor-bouldering","top-rope"\] → \["indoor-bouldering","top-rope","lead-climbing"\]/);
  const before = JSON.parse(JSON.stringify(w.fake.state.approved));
  const dry = await runImport({ ...w.base });
  assert.equal(dry.exit, 0, dry.report); assert.equal(dry.kind, 'update'); assert.equal(dry.coverage, 'FULL'); assert.equal(dry.state, 'fresh'); assert.match(dry.token, /^[0-9a-f]{16}$/);
  assert.match(dry.report, /Would correct gym identity \(3 gyms; name\/suburb\/types only/);
  assert.match(dry.report, /seed-100 {2}name: "Boulder Barn" -> "Boulder Barn Sydney"/); assert.match(dry.report, /seed-101 {2}suburb: "Fitzroy" -> "Fitzroy North"; types: "indoor-bouldering\+top-rope" -> "indoor-bouldering\+top-rope\+lead-climbing"/);
  assert.doesNotMatch(dry.report, /Would update \(/, 'no location section when there are no location updates');
  assert.equal(w.fake.state.identityPatches.length, 0, 'a dry-run writes nothing');
  // the gates come first
  const noFlag = await runImport({ ...w.base, mode: 'apply', confirm: dry.token }); assert.equal(noFlag.exit, 2); assert.ok(failing(noFlag).includes('gate: --i-understand-this-writes-to-production'));
  const noTok = await runImport({ ...w.base, mode: 'apply', productionFlag: true }); assert.equal(noTok.exit, 2); assert.ok(failing(noTok).includes('gate: --confirm'));
  assert.equal(w.fake.state.identityPatches.length, 0, 'no write before every gate passes');

  const ok = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(ok.exit, 0, ok.report); assert.equal(ok.wrote, true); assert.deepEqual(ok.applied, ['seed-100', 'seed-101', 'seed-102']); assert.deepEqual(ok.identityIds, ['seed-100', 'seed-101', 'seed-102']);
  assert.equal(w.fake.state.identityPatches.length, 3, 'one PATCH per gym'); assert.equal(w.fake.state.patches.length + w.fake.state.infoPatches.length, 0, 'no other write is used for an identity correction');
  assert.ok(w.fake.state.identityPatches.every(p => p.updatedAt === 'ts-0'), 'every PATCH is pinned to the row version seen at the final re-check');
  assert.deepEqual(w.fake.state.identityPatches.map(p => p.set), [{ name: 'Boulder Barn Sydney' }, { suburb: 'Fitzroy North', types: FULL_TYPES }, { name: 'Granite Gym Ultimo', suburb: 'Ultimo NSW', types: ['indoor-bouldering', 'top-rope'] }], 'each body is exactly the approved set (no slug, nothing else)');
  assert.equal(row(w, 'seed-100').name, 'Boulder Barn Sydney'); assert.equal(row(w, 'seed-101').suburb, 'Fitzroy North'); assert.deepEqual(row(w, 'seed-101').types, FULL_TYPES);
  for (const id of ['seed-100', 'seed-101', 'seed-102']) {
    const was = before.find(r => r.id === id);
    for (const f of ['state', 'country', 'lat', 'lng', 'address', 'notes', 'photo', 'status', 'community', 'edited', 'submitted_by', 'created_at', 'slug']) assert.deepEqual(row(w, id)[f], was[f], id + ' unchanged: ' + f);
    assert.equal(row(w, id).slug, 'slug-' + id, 'the stored slug never changes');
  }
  assert.equal(row(w, 'seed-100').suburb, 'Surry Hills', 'a rename leaves the suburb alone'); assert.deepEqual(row(w, 'seed-100').types, ['indoor-bouldering']);
  assert.deepEqual(row(w, 'community-0f3a7c2e-1111-4222-8333-444455556666'), before.find(r => r.id === 'community-0f3a7c2e-1111-4222-8333-444455556666'), 'other gyms untouched');
  const m = JSON.parse(fs.readFileSync(path.join(w.b.dir, 'manifest.json'), 'utf8'));
  assert.equal(m.status, 'updated'); assert.equal(m.kind, 'update'); assert.deepEqual(m.ids, ['seed-100', 'seed-101', 'seed-102']);
  assert.equal(m.rows_updated, 0, 'identity corrections are not counted as location updates'); assert.deepEqual(m.changes, []);
  assert.equal(m.rows_identity_changed, 3); assert.deepEqual(m.identity_changed.map(c => [c.id, c.fields]), [['seed-100', ['name']], ['seed-101', ['suburb', 'types']], ['seed-102', ['name', 'suburb', 'types']]]);
  for (const c of m.identity_changed) { assert.notEqual(c.after_h, c.expect_h, 'the content hash changes with the identity'); assert.equal(c.after_h, S.toEntry(row(w, c.id)).h, 'after_h is the hash of the row now in production'); assert.equal(c.after_h, S.toEntry({ ...before.find(r => r.id === c.id), ...w.fake.state.identityPatches.find(p => p.id === c.id).set }).h, 'and of the researched row with the set applied'); }
  assert.equal(m.verification.ok, true); assert.equal(m.approved_before, m.approved_after); assert.ok(!JSON.stringify(m).includes(w.key), 'no credential in the manifest');
  assert.equal(MF.readManifest(w.b.dir).valid, true);

  // a re-run of the fully applied batch is a safe no-op; verify agrees; a lost manifest is recovered without a write
  const again = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(again.exit, 0, again.report); assert.equal(again.state, 'already-updated'); assert.equal(w.fake.state.identityPatches.length, 3, 'a second apply writes nothing');
  const ver = await runImport({ ...w.base, mode: 'verify' }); assert.equal(ver.exit, 0, ver.report); assert.equal(ver.state, 'already-updated');
  // history: once the index is rebuilt from production, the look-back reverts the identity changes exactly like location changes
  S.write(approvedOf(w), path.join(w.root, 'import', 'index'), { source: 'rebuilt after the batch' });
  const rebuilt = S.load(path.join(w.root, 'import', 'index'));
  assert.equal(rebuilt.byId.get('seed-101').name, 'Vertical Works'); assert.deepEqual(rebuilt.byId.get('seed-101').types, ['indoor-bouldering', 'lead-climbing', 'top-rope'], 'the index keeps the tags sorted');
  const rev = H.revertIndex(rebuilt, w.root);
  assert.equal(rev.sha256, w.index.sha256, 'undoing the batch gives exactly the index it was planned against'); assert.deepEqual(rev.revertedUpdates.sort(), ['seed-100', 'seed-101', 'seed-102']);
  assert.equal(rev.byId.get('seed-100').name, 'Boulder Barn'); assert.equal(rev.byId.get('seed-102').suburb, 'Ultimo'); assert.deepEqual(rev.byId.get('seed-102').types, ['top-rope']);
  const live = H.revertLiveRows(approvedOf(w).map(r => ({ id: r.id, name: r.name, suburb: r.suburb, types: r.types, country: r.country, lat: r.lat, lng: r.lng, address: r.address })), w.root);
  assert.equal(live.reverted, 3); assert.equal(live.rows.find(r => r.id === 'seed-100').name, 'Boulder Barn'); assert.equal(live.rows.find(r => r.id === 'seed-101').suburb, 'Fitzroy');
  fs.unlinkSync(path.join(w.b.dir, 'manifest.json'));
  const rec2 = await runImport({ ...w.base, mode: 'apply', confirm: 'irrelevant', productionFlag: true });
  assert.equal(rec2.exit, 2, 'the index was rebuilt, so the researched hashes are stale and the batch is refused (re-research), exactly like a location update');
  assert.equal(w.fake.state.identityPatches.length, 3, 'nothing written');
});

test('identity: a lost manifest is recovered (nothing written to the database) while the index still holds the researched content', async () => {
  const w = await world({ records: ID3, approved: slugged(), id: '2026-04-01-gym-identity-recover' });
  const dry = await runImport({ ...w.base });
  const ok = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true }); assert.equal(ok.exit, 0, ok.report);
  fs.unlinkSync(path.join(w.b.dir, 'manifest.json'));
  const rec2 = await runImport({ ...w.base, mode: 'apply', confirm: 'irrelevant', productionFlag: true });
  assert.equal(rec2.exit, 0, rec2.report); assert.equal(rec2.state, 'already-present'); assert.equal(w.fake.state.identityPatches.length, 3, 'recovery writes nothing to the database');
  assert.equal(JSON.parse(fs.readFileSync(path.join(w.b.dir, 'manifest.json'), 'utf8')).status, 'updated-recovered');
});

test('identity: a gym changed since the research is refused, never overwritten (stale expect_h, a production edit, a partly applied batch, a race)', async () => {
  // (a) researched against different content
  const stale = await world({ records: ix => [idRec(ix, 'seed-100', { name: 'Boulder Barn Sydney' }, { expect_h: '0000000000000000' })], approved: slugged() });
  assert.equal(stale.plan.counts.invalid, 1); assert.match(JSON.stringify(stale.plan), /changed-since-research/);
  const r0 = await runImport({ ...stale.base }); assert.equal(r0.exit, 2); assert.ok(failing(r0).includes('researched content is the indexed content (expect_h)'), failing(r0).join()); assert.equal(stale.fake.state.identityPatches.length, 0);
  // (b) any field edited in production since (a moderator edit; also a rename to something else)
  for (const edit of [{ notes: 'a moderator edited this' }, { name: 'Boulder Barn (moderator rename)' }, { suburb: 'Redfern' }, { types: ['top-rope'] }]) {
    const approved = slugged(); Object.assign(approved.find(r => r.id === 'seed-100'), edit);
    const w = await world({ approved, records: ix => [idRec(ix, 'seed-100', { name: 'Boulder Barn Sydney' })] });
    const r = await runImport({ ...w.base });
    assert.equal(r.exit, 2, JSON.stringify(edit)); assert.ok(failing(r).includes('production still has the researched content (expect_h)'), failing(r).join()); assert.equal(w.fake.state.identityPatches.length, 0);
  }
  // (c) one target already holds its new values and another does not: a before/after mix is refused, never merged
  const half = await world({ records: ID3, approved: slugged() });
  Object.assign(row(half, 'seed-100'), { name: 'Boulder Barn Sydney', updated_at: 'ts-x' });
  const rh = await runImport({ ...half.base }); assert.equal(rh.exit, 2); assert.ok(failing(rh).includes('no partly applied batch'), failing(rh).join()); assert.equal(half.fake.state.identityPatches.length, 0);
  // an "after" row whose OTHER content also changed is "changed", not "after"
  const drift = await world({ records: ID3, approved: slugged() });
  for (const id of ['seed-100', 'seed-101', 'seed-102']) Object.assign(row(drift, id), JSON.parse(JSON.stringify(ID3(drift.index).find(r => r.id === id).set)), { updated_at: 'ts-x' });
  row(drift, 'seed-101').notes = 'edited after the correction';
  const rd = await runImport({ ...drift.base }); assert.equal(rd.exit, 2); assert.ok(failing(rd).includes('production still has the researched content (expect_h)'), failing(rd).join());
  // (d) a change between the dry-run and the apply is caught by the final re-check
  const w1 = await world({ records: ID3, approved: slugged() }); const dry1 = await runImport({ ...w1.base });
  let reads = 0; w1.fake.state.hooks.beforeRead = (q, st) => { if (q.includes('status=eq.approved') && ++reads === 2) st.approved.find(r => r.id === 'community-0f3a7c2e-1111-4222-8333-444455556666').notes = 'edited mid-flight'; };
  const r1 = await runImport({ ...w1.base, mode: 'apply', confirm: dry1.token, productionFlag: true });
  assert.equal(r1.exit, 2); assert.ok(failing(r1).includes('final re-check before write'), failing(r1).join()); assert.equal(w1.fake.state.identityPatches.length, 0);
  // (e) the FIRST target is edited just before its PATCH: 0 rows match (the updated_at pin), nothing is overwritten, no manifest
  const w2 = await world({ records: ID3, approved: slugged() }); const dry2 = await runImport({ ...w2.base });
  w2.fake.state.hooks.beforePatch = (u, st) => { if (u.id === 'seed-100') st.approved.find(r => r.id === 'seed-100').updated_at = 'ts-moderator'; };
  const r2 = await runImport({ ...w2.base, mode: 'apply', confirm: dry2.token, productionFlag: true });
  assert.equal(r2.exit, 2, r2.report); assert.match(r2.report, /0 row\(s\) matched/); assert.equal(row(w2, 'seed-100').name, 'Boulder Barn', 'not overwritten'); assert.equal(fs.existsSync(path.join(w2.b.dir, 'manifest.json')), false);
  // (f) the SECOND target is edited just before its PATCH: a partial state, a failure record, exit 4, no manifest; a re-run refuses to finish it
  const w3 = await world({ records: ID3, approved: slugged() }); const dry3 = await runImport({ ...w3.base });
  w3.fake.state.hooks.beforePatch = (u, st) => { if (u.id === 'seed-101') st.approved.find(r => r.id === 'seed-101').updated_at = 'ts-moderator'; };
  const r3 = await runImport({ ...w3.base, mode: 'apply', confirm: dry3.token, productionFlag: true });
  assert.equal(r3.exit, 4, r3.report); assert.equal(fs.existsSync(path.join(w3.b.dir, 'manifest.json')), false);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(w3.b.dir, 'import-failure.json'), 'utf8')).applied_ids, ['seed-100']);
  const again = await runImport({ ...w3.base }); assert.equal(again.exit, 2); assert.ok(failing(again).includes('no partly applied batch'), failing(again).join());
});

test('identity records: name, suburb and types are validated strictly (trimmed single-line text within the limits; types from the list, unique, canonical order); nothing is cleaned silently', async () => {
  const cases = [
    [{ name: '' }, 'empty name'], [{ name: '   ' }, 'blank name'], [{ name: ' Boulder Barn Sydney' }, 'leading space'], [{ name: 'Boulder Barn Sydney ' }, 'trailing space'],
    [{ name: 'Boulder\nBarn' }, 'newline'], [{ name: 'Boulder\tBarn' }, 'tab'], [{ name: 'Boulder\u0007Barn' }, 'control char'], [{ name: 'x'.repeat(201) }, 'name too long'],
    [{ name: 42 }, 'numeric name'], [{ name: null }, 'null name'],
    [{ suburb: '' }, 'empty suburb'], [{ suburb: ' Surry Hills North' }, 'untrimmed suburb'], [{ suburb: 'Surry\nHills' }, 'suburb line break'], [{ suburb: 'y'.repeat(201) }, 'suburb too long'], [{ suburb: null }, 'null suburb'],
    [{ types: [] }, 'empty types'], [{ types: 'top-rope' }, 'types not an array'], [{ types: ['bouldering'] }, 'unknown type'], [{ types: ['top-rope', 'top-rope'] }, 'duplicate type'],
    [{ types: ['top-rope', 'indoor-bouldering'] }, 'wrong order'], [{ types: ['lead-climbing', 'top-rope'] }, 'wrong order 2'], [{ types: [1] }, 'non-string type'], [{ types: null }, 'null types'],
  ];
  for (const [set, what] of cases) {
    const w = await world({ records: ix => [idRec(ix, 'seed-100', set)], approved: slugged() });
    assert.equal(w.plan.counts.invalid, 1, what + ': ' + JSON.stringify(w.plan.records[0]));
    const r = await runImport({ ...w.base });
    assert.equal(r.exit, 2, what + '\n' + r.report); assert.ok(failing(r).some(n => /records validate/.test(n)), what + ': ' + failing(r).join()); assert.equal(w.fake.state.identityPatches.length, 0, what);
  }
  // the same fields at their limits are fine (200 chars)
  const edge = await world({ records: ix => [idRec(ix, 'seed-100', { name: 'x'.repeat(200), suburb: 'y'.repeat(200) })], approved: slugged() });
  assert.equal(edge.plan.counts.invalid, 0, JSON.stringify(edge.plan.records[0].errors)); assert.equal(edge.plan.counts.update, 1);
  // record-level rules: a reason, expect_h and a source are required; one record per gym
  for (const [over, what] of [[{ reason: 'short' }, 'reason too short'], [{ expect_h: undefined }, 'no expect_h'], [{ source: undefined }, 'no source'], [{ source: '  ' }, 'blank source'], [{ source: 'https://example.com/' + 'a'.repeat(400) }, 'source too long']]) {
    const w = await world({ records: ix => [idRec(ix, 'seed-100', { name: 'Boulder Barn Sydney' }, over)], approved: slugged() });
    const r = await runImport({ ...w.base }); assert.equal(r.exit, 2, what); assert.ok(failing(r).some(n => /records validate/.test(n)), what + ': ' + failing(r).join()); assert.equal(w.fake.state.identityPatches.length, 0, what);
  }
  const twice = await world({ records: ix => [idRec(ix, 'seed-100', { name: 'Boulder Barn Sydney' }), idRec(ix, 'seed-100', { suburb: 'Redfern' })], approved: slugged() });
  const rt = await runImport({ ...twice.base }); assert.equal(rt.exit, 2); assert.ok(failing(rt).includes('one update per gym'), failing(rt).join());
  const both = await world({ records: ix => [idRec(ix, 'seed-100', { name: 'Boulder Barn Sydney' }), ret(ix, 'seed-100')], approved: slugged() });
  const rb = await runImport({ ...both.base }); assert.equal(rb.exit, 2); assert.equal(both.fake.state.identityPatches.length + both.fake.state.retires.length, 0);
  // the batch size limit is the updater's (100 records)
  const many = await world({ records: ix => Array.from({ length: 101 }, (_, i) => idRec(ix, 'seed-100', { name: 'Name ' + i })), approved: slugged() });
  const rm = await runImport({ ...many.base }); assert.equal(rm.exit, 2); assert.ok(failing(rm).includes('batch size'), failing(rm).join());
});

test('identity: one family per record -- never mixed with location, information or any other field; a maintenance batch may mix the families across DIFFERENT gyms', async () => {
  for (const [set, what] of [[{ name: 'Boulder Barn Sydney', lat: -33.882, lng: 151.213 }, 'name + pin'], [{ suburb: 'Redfern', address: '1 St' }, 'suburb + address'], [{ types: ['top-rope'], notes: 'x' }, 'types + notes'],
    [{ name: 'Boulder Barn Sydney', website: 'https://example.com/' }, 'name + website'], [{ name: 'Boulder Barn Sydney', state: 'VIC' }, 'name + state'], [{ name: 'Boulder Barn Sydney', slug: 'new-slug' }, 'name + slug'], [{ name: 'Boulder Barn Sydney', status: 'rejected' }, 'name + status']]) {
    const w = await world({ records: ix => [idRec(ix, 'seed-100', set)], approved: slugged() });
    assert.equal(w.plan.counts.invalid, 1, what); assert.match(JSON.stringify(w.plan), /mixed-families|field-not-updatable/, what);
    const r = await runImport({ ...w.base }); assert.equal(r.exit, 2, what); assert.ok(failing(r).some(n => /records validate/.test(n)), what);
    assert.equal(w.fake.state.identityPatches.length + w.fake.state.patches.length + w.fake.state.infoPatches.length, 0, what);
  }
  const mixed = ix => [idRec(ix, 'seed-100', { name: 'Boulder Barn Sydney' }), upd(ix, 'seed-102', { lat: -33.8785, lng: 151.196 }), info(ix, 'seed-101'), ret(ix, 'community-0f3a7c2e-1111-4222-8333-444455556666')];
  const w = await world({ records: mixed, approved: infoBase().map(r => ({ ...r, slug: 'slug-' + r.id })), id: '2026-04-02-maintenance-identity' });
  assert.equal(w.plan.counts.update, 3); assert.equal(w.plan.counts.retire, 1); assert.equal(w.plan.importable, true, w.plan.blockers.join());
  const dry = await runImport({ ...w.base });
  assert.equal(dry.exit, 0, dry.report); assert.match(dry.report, /Would update \(1 gyms, 2 field changes/); assert.match(dry.report, /Would fill gym information \(1 gyms/); assert.match(dry.report, /Would correct gym identity \(1 gyms/); assert.match(dry.report, /Would retire \(1 gyms/);
  const ok = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(ok.exit, 0, ok.report); assert.deepEqual(ok.applied, ['seed-100', 'seed-102', 'seed-101', 'community-0f3a7c2e-1111-4222-8333-444455556666']);
  assert.equal(w.fake.state.identityPatches.length, 1); assert.equal(w.fake.state.patches.length, 1); assert.equal(w.fake.state.infoPatches.length, 1); assert.equal(w.fake.state.retires.length, 1);
  const m = JSON.parse(fs.readFileSync(path.join(w.b.dir, 'manifest.json'), 'utf8'));
  assert.equal(m.rows_updated, 1); assert.deepEqual(m.changes.map(c => c.id), ['seed-102'], 'location changes list only the location updates');
  assert.deepEqual(m.identity_changed.map(c => c.id), ['seed-100']); assert.equal(m.rows_identity_changed, 1); assert.deepEqual(m.info_filled.map(c => c.id), ['seed-101']); assert.deepEqual(m.retired, ['community-0f3a7c2e-1111-4222-8333-444455556666']);
  const again = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true }); assert.equal(again.exit, 0); assert.equal(again.state, 'already-updated');
});

test('identity: a value equal to the current one is refused as a no-op, and says so; nothing is dropped silently', async () => {
  for (const [set, what] of [[{ name: 'Boulder Barn' }, 'same name'], [{ suburb: 'Surry Hills' }, 'same suburb'], [{ types: ['indoor-bouldering'] }, 'same types'], [{ name: 'Boulder Barn', suburb: 'Surry Hills' }, 'all same'],
    [{ name: 'Boulder Barn', suburb: 'Redfern' }, 'one same, one new'], [{ types: ['indoor-bouldering', 'top-rope'] }, 'same types on another gym (set equality)']]) {
    const id = what.includes('another') ? 'seed-101' : 'seed-100';
    const w = await world({ records: ix => [idRec(ix, id, set)], approved: slugged() });
    const r = await runImport({ ...w.base });
    assert.equal(r.exit, 2, what + '\n' + r.report); assert.ok(failing(r).includes('identity update changes every field it lists'), what + ': ' + failing(r).join());
    assert.match(r.report, /already holds? the recorded value \(no-op\)/, what); assert.equal(w.fake.state.identityPatches.length, 0, what);
  }
  // the plan flags a half no-op as invalid with its own code; a whole no-op stays "existing, update-is-noop"
  const half = await world({ records: ix => [idRec(ix, 'seed-100', { name: 'Boulder Barn', suburb: 'Redfern' })], approved: slugged() });
  assert.equal(half.plan.counts.invalid, 1); assert.match(JSON.stringify(half.plan), /identity-noop/);
  const whole = await world({ records: ix => [idRec(ix, 'seed-100', { name: 'Boulder Barn' })], approved: slugged() });
  assert.equal(whole.plan.records[0].class, 'existing'); assert.equal(whole.plan.records[0].match.reason, 'update-is-noop');
});

// Production rows for the duplicate-protection tests: far from the PROD gyms, so only the pairs below interact.
const dupRow = (id, name, lat, lng, over = {}) => ({ id, name, suburb: 'Test Town', state: 'NSW', country: 'AU', lat, lng, address: null, types: ['indoor-bouldering'], notes: null, photo: null, ...over });
const DUPS = () => [dupRow('seed-200', 'Summit Climbing', -33.9, 151.2), dupRow('seed-201', 'Boulder Lab', -33.9005, 151.2005),   // ~70 m apart, unrelated names
  dupRow('seed-202', 'Alpha Wall', -33.7, 151.1), dupRow('seed-203', 'Beta Rock', -33.70015, 151.1),                                 // ~17 m apart already (co-located), unrelated names
  dupRow('seed-204', 'Peak One', -33.6, 151.0), dupRow('seed-205', 'Crux Climbing', -33.6007, 151.0)];                              // ~78 m apart, unrelated names
const dupWorld = records => { const rows = [...BASE(), ...DUPS().map(r => prodRow({ ...r, created_at: 'x', updated_at: 'ts-0', submitted_by: null, slug: 'slug-' + r.id }))]; return world({ records, approved: rows, indexRows: rows }); };

test('identity duplicate protection: a rename or suburb change that would make the gym a probable duplicate of ANOTHER approved gym is refused, naming the other gym', async () => {
  // same name as another gym (Boulder Barn, seed-100, 1.4 km away): the matcher's "same name, pin differs"
  const same = await dupWorld(ix => [idRec(ix, 'seed-102', { name: 'Boulder Barn' })]);
  assert.equal(same.plan.counts.invalid, 1); assert.match(JSON.stringify(same.plan.records[0].errors), /rename-duplicates-other-gym/); assert.match(same.plan.records[0].errors[0].message, /seed-100 "Boulder Barn" -- same-name-but-pin-differs, \d+ m/);
  const r1 = await runImport({ ...same.base }); assert.equal(r1.exit, 2); assert.ok(failing(r1).includes('every record is (still) an update'), failing(r1).join()); assert.match(r1.report, /would make it a probable duplicate of seed-100/); assert.equal(same.fake.state.identityPatches.length, 0);
  // a related name within the matcher's "renamed" distance of another gym (seed-200 "Summit Climbing", ~70 m): "Summit Climbing Gym" is related
  const rel = await dupWorld(ix => [idRec(ix, 'seed-201', { name: 'Summit Climbing Gym' })]);
  assert.equal(rel.plan.counts.invalid, 1); assert.match(rel.plan.records[0].errors[0].message, /seed-200 "Summit Climbing" -- renamed-or-related-name-nearby, \d+ m/);
  const r2 = await runImport({ ...rel.base }); assert.equal(r2.exit, 2); assert.equal(rel.fake.state.identityPatches.length, 0);
  assert.equal(M.evaluatePair({ ...DUPS()[1], name: 'Summit Climbing Gym' }, DUPS()[0]).tier, 'probable', 'the plan uses the matcher\'s own pair rules (match.js)');
  // an unrelated new name at the same place is fine; so is a type-only change, and a rename far from every related name
  const fine = await dupWorld(ix => [idRec(ix, 'seed-201', { name: 'Boulder Lab Redfern' }), idRec(ix, 'seed-102', { types: FULL_TYPES }), idRec(ix, 'seed-100', { name: 'Boulder Barn Sydney' })]);
  assert.equal(fine.plan.counts.invalid, 0, JSON.stringify(fine.plan.records.map(r => r.errors))); assert.equal(fine.plan.importable, true, fine.plan.blockers.join());
  // a pair that was ALREADY flagged before the change is not "made" by it (seed-202/203 are 17 m apart: a rename between unrelated names keeps them co-located)
  const pre = await dupWorld(ix => [idRec(ix, 'seed-203', { name: 'Beta Rocks Gym' })]);
  assert.equal(pre.plan.counts.invalid, 0, JSON.stringify(pre.plan.records[0].errors));
  // ... but giving two already co-located gyms the SAME name adds a name-based reason and is refused
  const joined = await dupWorld(ix => [idRec(ix, 'seed-203', { name: 'Alpha Wall' })]);
  assert.equal(joined.plan.counts.invalid, 1); assert.match(joined.plan.records[0].errors[0].message, /seed-202/);
  // a suburb-only change is checked with the same rules: giving seed-102 (Granite Gym) the suburb of another gym of that name is only a duplicate if the names match, so it passes
  const sub = await dupWorld(ix => [idRec(ix, 'seed-102', { suburb: 'Surry Hills' })]);
  assert.equal(sub.plan.counts.invalid, 0, JSON.stringify(sub.plan.records[0].errors));
});

test('identity duplicate protection: two records in one batch that rename different gyms to related names nearby are both refused (order independent)', async () => {
  const recs = ix => [idRec(ix, 'seed-204', { name: 'Vertex Climbing' }), idRec(ix, 'seed-205', { name: 'Vertex Gym' })];   // ~78 m apart; each alone is fine
  for (const order of [recs, ix => recs(ix).reverse()]) {
    const w = await dupWorld(order);
    assert.equal(w.plan.counts.invalid, 2, JSON.stringify(w.plan.records.map(r => r.errors))); assert.ok(w.plan.records.every(r => /also changed in this batch/.test(r.errors[0].message)), 'both sides name the other record');
    const r = await runImport({ ...w.base }); assert.equal(r.exit, 2); assert.equal(w.fake.state.identityPatches.length, 0);
  }
  for (const one of [ix => [idRec(ix, 'seed-204', { name: 'Vertex Climbing' })], ix => [idRec(ix, 'seed-205', { name: 'Vertex Gym' })]]) { const w = await dupWorld(one); assert.equal(w.plan.counts.invalid, 0); assert.equal(w.plan.counts.update, 1); }
});

test('stateOf for identity records: before = hash is expect_h; after = the fields equal the record (types in order) and the restored row hashes to expect_h; anything else is changed', () => {
  const { stateOf } = require('../scripts/lib/gym-import/updater');
  const base = { ...BASE().find(r => r.id === 'seed-101'), slug: 's' };   // Vertical Works, Fitzroy, [indoor-bouldering, top-rope]
  const e = S.toEntry(base), rec1 = { id: 'seed-101', expect_h: e.h, set: { name: 'Vertical Works Fitzroy', suburb: 'Fitzroy North', types: FULL_TYPES } };
  const applied = { ...base, ...rec1.set };
  assert.equal(stateOf(base, e, rec1).state, 'before'); assert.equal(stateOf(base, e, rec1).updatedAt, 'ts-0');
  const a = stateOf(applied, e, rec1); assert.equal(a.state, 'after'); assert.equal(a.h, S.toEntry(applied).h); assert.notEqual(a.h, e.h);
  assert.equal(a.h, S.toEntry({ ...base, ...rec1.set }).h, 'the after-hash is the content hash of the researched row with the set applied');
  assert.equal(stateOf({ ...applied, notes: 'edited since' }, e, rec1).state, 'changed', 'another compared field changed as well');
  assert.equal(stateOf({ ...applied, lat: -37.8 }, e, rec1).state, 'changed'); assert.equal(stateOf({ ...applied, address: 'elsewhere' }, e, rec1).state, 'changed');
  assert.equal(stateOf({ ...applied, name: 'Another Name' }, e, rec1).state, 'changed', 'a field holding a third value');
  assert.equal(stateOf({ ...applied, suburb: 'Fitzroy' }, e, rec1).state, 'changed', 'only some fields applied');
  assert.equal(stateOf({ ...applied, types: ['lead-climbing', 'top-rope', 'indoor-bouldering'] }, e, rec1).state, 'changed', 'types in another order: not byte for byte');
  assert.equal(stateOf({ ...base, notes: 'edited' }, e, rec1).state, 'changed', 'before needs the exact researched hash');
  assert.equal(stateOf({ ...base, status: 'rejected' }, e, rec1).state, 'not-approved'); assert.equal(stateOf(undefined, e, rec1).state, 'missing');
  const same = stateOf(base, e, { ...rec1, set: { name: 'Vertical Works' } });
  assert.equal(same.state, 'changed'); assert.equal(same.noop, true, 'a no-op is never "before": it can not be written');
  // trailing/leading whitespace differences are real differences (the database value must equal the record)
  assert.equal(stateOf({ ...applied, name: 'Vertical Works Fitzroy ' }, e, rec1).state, 'changed');
});

test('identity verification: a database that moved a slug, or changed another field of a target or another spot during the writes, is a failure record (exit 4), never a manifest', async () => {
  for (const [hook, what] of [
    [(row0) => { row0.slug = 'a-new-slug'; }, 'slug of a target changed'],
    [(row0) => { row0.notes = 'trigger touched notes'; }, 'another compared field of a target changed'],
    [(row0) => { row0.name = row0.name + ' (trigger)'; }, 'the stored name is not the approved one'],
  ]) {
    const w = await world({ records: ID3, approved: slugged() }); const dry = await runImport({ ...w.base });
    w.fake.state.hooks.afterIdentityPatch = (row0, u) => { if (u.id === 'seed-101') hook(row0); };
    const r = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
    assert.equal(r.exit, 4, what + '\n' + r.report); assert.equal(fs.existsSync(path.join(w.b.dir, 'manifest.json')), false, what); assert.equal(fs.existsSync(path.join(w.b.dir, 'import-failure.json')), true, what);
  }
  // another spot's slug moved during the writes
  const w2 = await world({ records: ID3, approved: slugged() }); const dry2 = await runImport({ ...w2.base });
  w2.fake.state.hooks.beforePatch = (u, st) => { if (u.id === 'seed-102') st.approved.find(r => r.id === 'community-0f3a7c2e-1111-4222-8333-444455556666').slug = 'moved'; };
  const r2 = await runImport({ ...w2.base, mode: 'apply', confirm: dry2.token, productionFlag: true });
  assert.equal(r2.exit, 4, r2.report); assert.match(r2.report, /stored slug changed: community-0f3a7c2e/);
  // an approved count that moves (a spot removed during the writes)
  const w3 = await world({ records: ID3, approved: slugged() }); const dry3 = await runImport({ ...w3.base });
  w3.fake.state.hooks.beforePatch = (u, st) => { if (u.id === 'seed-102') st.approved.find(r => r.id === 'community-0f3a7c2e-1111-4222-8333-444455556666').status = 'rejected'; };
  const r3 = await runImport({ ...w3.base, mode: 'apply', confirm: dry3.token, productionFlag: true });
  assert.equal(r3.exit, 4, r3.report); assert.match(r3.report, /approved count/);
});

test('target.js updateSpotIdentity: refuses without the update gate, with anything but the approved change, any non-identity key (a slug included) or an invalid value; sends one pinned PATCH with exactly the approved set', async () => {
  const api = new T.Api({ url: 'https://example.supabase.co', serviceKey: 'service-key-xxxxxxxx', anonKey: 'anon-key-xxxxxxxx' });
  const sent = []; api._send = async (method, q, o) => { sent.push({ method, q, o }); return { ok: true, status: 200, json: [{}] }; };
  const sha = (updates, retires = []) => crypto.createHash('sha256').update(JSON.stringify(T.opsPayload(updates, retires))).digest('hex');
  const updates = [{ id: 'seed-100', set: { name: 'Boulder Barn Sydney', suburb: 'Redfern', types: ['indoor-bouldering', 'top-rope'] }, expect_h: '0123456789abcdef' }];
  const payloadSha = sha(updates), gate = T.mintUpdateGate({ batchId: 'b', token: 't', updates, payloadSha });
  const u = { id: 'seed-100', set: updates[0].set, updatedAt: '2026-09-24T01:02:03.123456+00:00' };
  await assert.rejects(api.updateSpotIdentity(u, null), /no update gate/);
  await assert.rejects(api.updateSpotIdentity(u, undefined), /no update gate/);
  await assert.rejects(api.updateSpotIdentity(u, T.mintWriteGate({ batchId: 'b', token: 't', rows: [], payloadSha })), /no update gate/, 'the insert gate cannot authorise an identity correction');
  await assert.rejects(api.updateSpotIdentity(u, { ...gate }), /no update gate/, 'a copied gate is not a gate');
  await assert.rejects(api.updateSpotIdentity(u, Object.freeze({ [Object.getOwnPropertySymbols(gate)[0]]: true, updates, retires: [], payloadSha })), /no update gate/, 'a hand-built look-alike is not a gate');
  await assert.rejects(api.updateSpotIdentity(u, T.mintUpdateGate({ batchId: 'b', token: 't', updates, payloadSha: 'f'.repeat(64) })), /hash mismatch/);
  await assert.rejects(api.updateSpotIdentity({ ...u, set: { ...u.set, name: 'Hijacked' } }, gate), /not the approved one/, 'a different body');
  await assert.rejects(api.updateSpotIdentity({ ...u, set: { name: u.set.name } }, gate), /not the approved one/, 'a subset of the approved body');
  await assert.rejects(api.updateSpotIdentity({ ...u, id: 'seed-101' }, gate), /not the approved one/, 'a different gym');
  const bad = async (set, re) => { const g = T.mintUpdateGate({ batchId: 'b', token: 't', updates: [{ id: 'seed-100', set, expect_h: '0123456789abcdef' }], payloadSha: sha([{ id: 'seed-100', set, expect_h: '0123456789abcdef' }]) }); await assert.rejects(api.updateSpotIdentity({ ...u, set }, g), re, JSON.stringify(set)); };
  await bad({ name: 'Boulder Barn Sydney', lat: 1, lng: 2 }, /only name\/suburb\/types/); await bad({ name: 'X', notes: 'x' }, /only name\/suburb\/types/); await bad({ name: 'X', slug: 'new-slug' }, /only name\/suburb\/types/);
  await bad({ slug: 'new-slug' }, /only name\/suburb\/types/); await bad({ name: 'X', status: 'rejected' }, /only name\/suburb\/types/); await bad({ website: 'https://example.com/' }, /only name\/suburb\/types/); await bad({}, /only name\/suburb\/types/);
  await bad({ name: '' }, /name is required/); await bad({ name: ' X' }, /name has leading\/trailing whitespace/); await bad({ name: 'a\nb' }, /name contains control characters/); await bad({ name: 'x'.repeat(201) }, /name is 201 chars/); await bad({ name: 7 }, /name is required/);
  await bad({ suburb: '' }, /suburb is required/); await bad({ suburb: 'y'.repeat(201) }, /suburb is 201 chars/); await bad({ suburb: 'a\tb' }, /suburb contains control characters/);
  await bad({ types: [] }, /types must be a non-empty array/); await bad({ types: 'top-rope' }, /types must be a non-empty array/); await bad({ types: ['nope'] }, /unknown type/); await bad({ types: ['top-rope', 'top-rope'] }, /duplicates/);
  await bad({ types: ['top-rope', 'indoor-bouldering'] }, /canonical order/); await bad({ types: [3] }, /unknown type/);
  await assert.rejects(api.updateSpotIdentity({ ...u, id: '../x' }, gate), /not the approved one|bad id/);
  await assert.rejects(api.updateSpotIdentity({ ...u, updatedAt: '' }, gate), /updated_at/);
  await assert.rejects(api.updateSpotLocation(u, gate), /only address\/lat\/lng/, 'the location write cannot carry identity fields');
  await assert.rejects(api.updateSpotInfo(u, gate), /only website\/hours\/day_pass\/facilities/, 'the information write cannot carry identity fields');
  await assert.rejects(api.retireSpot({ id: 'seed-100', reason: 'permanently closed (test)', updatedAt: 'x' }, gate), /not the approved one/, 'an identity gate retires nothing');
  assert.equal(sent.length, 0, 'nothing sent for any refusal');
  await api.updateSpotIdentity(u, gate);
  assert.equal(sent.length, 1); assert.equal(sent[0].method, 'PATCH'); assert.equal(sent[0].o.service, true);
  assert.equal(sent[0].q, '/rest/v1/spots?id=eq.seed-100&status=eq.approved&updated_at=eq.2026-09-24T01%3A02%3A03.123456%2B00%3A00');
  assert.equal(sent[0].o.body, JSON.stringify(updates[0].set), 'the body is exactly the approved set'); assert.ok(!/slug/.test(sent[0].o.body), 'no slug in the body'); assert.match(sent[0].o.headers.Prefer, /return=representation/);
  assert.deepEqual(T.IDENTITY_FIELDS, ['name', 'suburb', 'types']);
});

test('identity confirmation token: bound to the exact values (a different name, suburb or types never matches)', async () => {
  const { confirmToken } = require('../scripts/lib/gym-import/updater');
  const mk = set => confirmToken({ batchId: 'b', planSha: 'p', payload: crypto.createHash('sha256').update(JSON.stringify([{ id: 'seed-100', set, expect_h: '0123456789abcdef' }])).digest('hex'), host: 'h', kind: 'local', coverage: 'FULL', liveSha: 'l' });
  assert.notEqual(mk({ name: 'A' }), mk({ name: 'B' })); assert.notEqual(mk({ suburb: 'A' }), mk({ suburb: 'B' })); assert.notEqual(mk({ types: ['top-rope'] }), mk({ types: ['indoor-bouldering', 'top-rope'] }));
  assert.equal(mk({ name: 'A' }), mk({ name: 'A' }));
  const a = await world({ records: ix => [idRec(ix, 'seed-100', { name: 'Boulder Barn Sydney' })], approved: slugged() }), b = await world({ records: ix => [idRec(ix, 'seed-100', { name: 'Boulder Barn Redfern' })], approved: slugged() });
  assert.notEqual((await runImport({ ...a.base })).token, (await runImport({ ...b.base })).token, 'the token a dry-run prints is bound to the exact corrections');
  const w = await world({ records: ix => [idRec(ix, 'seed-100', { name: 'Boulder Barn Sydney' })], approved: slugged() });
  const dry = await runImport({ ...w.base });
  const swapped = fs.readFileSync(path.join(w.b.dir, 'records.ndjson'), 'utf8').replace('Boulder Barn Sydney', 'Boulder Barn Elsewhere');
  fs.writeFileSync(path.join(w.b.dir, 'records.ndjson'), swapped);
  const r = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(r.exit, 2); assert.equal(w.fake.state.identityPatches.length, 0, 'records edited after the dry-run: the committed plan.json is stale, nothing is written');
});

test('identity: name, suburb and types are part of the content hash (an identity correction always changes it); the slug is not', () => {
  const N = require('../scripts/lib/gym-import/normalize');
  const g = BASE()[0];
  assert.notEqual(N.contentHash(g), N.contentHash({ ...g, name: g.name + ' 2' })); assert.notEqual(N.contentHash(g), N.contentHash({ ...g, suburb: 'Elsewhere' })); assert.notEqual(N.contentHash(g), N.contentHash({ ...g, types: ['top-rope'] }));
  assert.equal(N.contentHash(g), N.contentHash({ ...g, slug: 'another-slug' }), 'the slug is not part of the content hash');
});

// ============================================ gym information: notes (fill-only; the one info field that IS in the content hash) =====
// A notes fill is an info update ({"set":{"notes":"..."}}, alone or with website/hours/day_pass/facilities). Because notes is part of the content hash, its state is
// read from h0 = the hash of the row with notes removed: before = h0 is expect_h and notes empty; after = h0 is expect_h and notes equal the record; else changed.
const NOTE = 'Temporarily closed (last checked 5 October 2026).';
const notesRec = (ix, id, set = { notes: NOTE }, over = {}) => info(ix, id, set, { reason: 'temporarily closed, per the gym website (test)', ...over });
const NOTES2 = ix => [notesRec(ix, 'seed-101'), notesRec(ix, 'seed-102', { notes: NOTE, hours: HOURS })];

test('notes fill records: a notes-only record and notes + hours validate; invalid notes values are refused, never cleaned', async () => {
  const V = require('../scripts/lib/gym-import/validate');
  const rec1 = set => ({ intent: 'update', id: 'seed-101', expect_h: '0123456789abcdef', reason: 'temporarily closed, per the gym website (test)', source: 'https://example.com/', set });
  const errs = async set => (await V.validateUpdateRecord(rec1(set))).errors;
  for (const set of [{ notes: NOTE }, { notes: NOTE, hours: HOURS }, { notes: 'x' }, { notes: 'y'.repeat(2000) }, { notes: NOTE, website: 'https://example.com/', day_pass: 'Free', facilities: ['cafe'] }]) assert.deepEqual(await errs(set), [], JSON.stringify(set).slice(0, 60));
  assert.ok(V.isInfoSet({ notes: NOTE }) && V.INFO_FIELDS.includes('notes'));
  for (const [v, code] of [['', 'bad-notes'], [null, 'bad-notes'], [7, 'bad-notes'], [['a'], 'bad-notes'], [' leading', 'untrimmed'], ['trailing ', 'untrimmed'], ['two\nlines', 'control-chars'], ['tab\there', 'control-chars'], ['cr\r', 'control-chars'], ['bell\u0007', 'control-chars'], ['z'.repeat(2001), 'too-long']]) {
    const e = await errs({ notes: v }); assert.ok(e.some(x => x.code === code && x.field === 'notes'), JSON.stringify(v).slice(0, 30) + ' -> ' + JSON.stringify(e));
  }
  assert.ok((await errs({ notes: NOTE, name: 'Renamed' })).some(x => x.code === 'mixed-families'), 'notes never mixes with identity fields');
  assert.ok((await errs({ notes: NOTE, lat: -33.9, lng: 151.2 })).some(x => x.code === 'mixed-families'), 'notes never mixes with location fields');
  assert.deepEqual(await V.infoSetProblems({ notes: NOTE }), []); assert.match((await V.infoSetProblems({ notes: '' }))[0], /notes must be non-empty/);
  assert.match(V.describeInfoSet({ notes: NOTE, hours: HOURS }), /hours mon,tue,sat \+ notes "Temporarily closed/);
  // the notes of a NEW gym record keep their own (lenient) rules
  assert.deepEqual((await V.validateNewRecord({ name: 'N', suburb: 'S', state: 'NSW', country: 'AU', lat: -33.9, lng: 151.2, types: ['indoor-bouldering'], notes: 'two\nlines' })).errors, []);
});

test('stateOf for notes records (real content hash): before = h0 is expect_h and notes empty; after = notes equal the record; a different value is changed and names notes', () => {
  const { stateOf } = require('../scripts/lib/gym-import/updater');
  const N = require('../scripts/lib/gym-import/normalize');
  const base = { ...infoBase2().find(r => r.id === 'seed-101'), updated_at: 'ts-0' }, h = S.toEntry(base).h;
  const rec1 = { id: 'seed-101', expect_h: h, set: { notes: NOTE } };
  const st = r => stateOf(r, null, rec1);
  for (const e of [{ notes: null }, { notes: '' }, { notes: undefined }]) assert.deepEqual(st({ ...base, ...e }), { state: 'before', h, updatedAt: 'ts-0' }, JSON.stringify(e));
  const filled = { ...base, notes: NOTE }, hAfter = S.toEntry(filled).h;
  assert.notEqual(hAfter, h, 'the fill moves the real content hash');
  assert.equal(N.contentHash({ ...filled, notes: null }), h, 'but h0 (notes removed) is still expect_h');
  assert.deepEqual(st(filled), { state: 'after', h: hAfter, updatedAt: 'ts-0' }, 'after reports the REAL new hash (the manifest after_h)');
  assert.deepEqual(st({ ...base, notes: 'Closed on Sundays.' }), { state: 'changed', h: S.toEntry({ ...base, notes: 'Closed on Sundays.' }).h, filled: ['notes'] }, 'fill-only: another value is never overwritten');
  assert.deepEqual(st({ ...base, notes: NOTE + ' ' }).filled, ['notes'], 'not the record byte for byte');
  assert.equal(st({ ...filled, name: base.name + ' 2' }).state, 'changed', 'another hashed field moved: not after');
  assert.equal(st({ ...base, name: base.name + ' 2' }).state, 'changed', 'another hashed field moved: not before');
  assert.deepEqual(st({ ...base, name: base.name + ' 2' }).filled, []);
  assert.equal(st({ ...filled, status: 'rejected' }).state, 'not-approved'); assert.equal(st(undefined).state, 'missing');
  // notes together with another info field: every listed field must be empty (before) or equal (after); h0 is used because notes is listed
  const both = { id: 'seed-101', expect_h: h, set: { notes: NOTE, hours: { mon: '9-5' } } };
  assert.equal(stateOf(base, null, both).state, 'before'); assert.equal(stateOf({ ...filled, hours: { mon: '9-5' } }, null, both).state, 'after');
  assert.deepEqual(stateOf({ ...filled, hours: { mon: '9-6' } }, null, both).filled, ['hours']); assert.equal(stateOf(filled, null, both).state, 'changed', 'half applied');
  // a record WITHOUT notes still compares the live hash, exactly as before: a moderator's notes edit is "content changed"
  const web = { id: 'seed-101', expect_h: h, set: { website: 'https://example.com/' } };
  assert.equal(stateOf(base, null, web).state, 'before'); assert.equal(stateOf({ ...base, notes: 'edited' }, null, web).state, 'changed', 'content hash moved');
});

test('notes fill: dry-run names the note, ONE info PATCH per gym with exactly the approved fields, verified, manifest keeps the real after_h, re-run is a no-op', async () => {
  const w = await world({ records: NOTES2, approved: infoBase2(), id: '2026-10-05-notes-fill' });
  assert.equal(w.plan.counts.update, 2); assert.equal(w.plan.importable, true, w.plan.blockers.join());
  assert.deepEqual(w.plan.records[0].changes, [{ field: 'notes', before: null, after: NOTE }]);
  const before = JSON.parse(JSON.stringify(w.fake.state.approved));
  const dry = await runImport({ ...w.base }); assert.equal(dry.exit, 0, dry.report);
  assert.match(dry.report, /seed-101  Vertical Works  notes "Temporarily closed \(last checked 5 October 2026\)\."/);
  assert.equal(w.fake.state.infoPatches.length, 0, 'a dry-run writes nothing');
  const ok = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(ok.exit, 0, ok.report); assert.deepEqual(ok.applied, ['seed-101', 'seed-102']);
  assert.equal(w.fake.state.patches.length, 0); assert.equal(w.fake.state.infoPatches.length, 2);
  assert.deepEqual(w.fake.state.infoPatches[0].set, { notes: NOTE }); assert.deepEqual(w.fake.state.infoPatches[1].set, { notes: NOTE, hours: HOURS });
  assert.ok(w.fake.state.infoPatches.every(p => p.updatedAt === 'ts-0'), 'pinned to the row version seen at the final re-check');
  const a = row(w, 'seed-101'), b0 = before.find(r => r.id === 'seed-101');
  assert.equal(a.notes, NOTE);
  for (const f of ['name', 'suburb', 'state', 'country', 'lat', 'lng', 'address', 'types', 'photo', 'status', 'website', 'hours']) assert.deepEqual(a[f], b0[f], 'unchanged: ' + f);
  for (const id of ['seed-100', 'community-0f3a7c2e-1111-4222-8333-444455556666']) assert.deepEqual(row(w, id), before.find(r => r.id === id), 'other gyms untouched');
  const m = JSON.parse(fs.readFileSync(path.join(w.b.dir, 'manifest.json'), 'utf8'));
  assert.equal(m.status, 'updated'); assert.equal(m.rows_info_filled, 2); assert.deepEqual(m.info_filled.map(c => [c.id, c.fields]), [['seed-101', ['notes']], ['seed-102', ['notes', 'hours']]]);
  assert.ok(m.info_filled.every(c => c.after_h !== c.expect_h && c.after_h === S.toEntry(row(w, c.id)).h), 'after_h is the real new hash (notes is in it)');
  assert.equal(m.verification.ok, true); assert.equal(MF.readManifest(w.b.dir).valid, true);
  const again = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(again.exit, 0, again.report); assert.equal(again.state, 'already-updated'); assert.equal(w.fake.state.infoPatches.length, 2, 'a second apply writes nothing');
  const ver = await runImport({ ...w.base, mode: 'verify' }); assert.equal(ver.exit, 0, ver.report); assert.equal(ver.state, 'already-updated');
});

test('notes fill-only: a gym whose notes already hold another value is refused, naming the gym and notes; nothing is written; "" counts as empty', async () => {
  const set = (id, patch) => infoBase2().map(r => (r.id === id ? { ...r, ...patch } : r));
  const held = await world({ records: ix => [notesRec(ix, 'seed-101')], approved: set('seed-101', { notes: 'Closed on Sundays.' }) });
  const r = await runImport({ ...held.base }); assert.equal(r.exit, 2, r.report);
  assert.ok(failing(r).includes('fill-only: gym information already set in production'), failing(r).join());
  assert.match(r.report, /seed-101 "Vertical Works": notes already has a value/);
  const apply = await runImport({ ...held.base, mode: 'apply', confirm: '0'.repeat(16), productionFlag: true });
  assert.equal(apply.exit, 2); assert.equal(held.fake.state.infoPatches.length, 0);
  // seed-100 already has notes in production AND in the index (researched against that content): the fill is still refused as fill-only, naming notes
  const had = await world({ records: ix => [notesRec(ix, 'seed-100')], approved: infoBase2() });
  const rh = await runImport({ ...had.base }); assert.equal(rh.exit, 2); assert.ok(failing(rh).includes('fill-only: gym information already set in production'), failing(rh).join());
  assert.match(rh.report, /seed-100 "Boulder Barn": notes already has a value/);
  // another hashed field edited since the research is the generic refusal, not a fill-only one
  const edited = await world({ records: ix => [notesRec(ix, 'seed-101')], approved: set('seed-101', { name: 'Vertical Works 2' }) });
  const re = await runImport({ ...edited.base }); assert.equal(re.exit, 2); assert.ok(failing(re).includes('production still has the researched content (expect_h)'), failing(re).join());
  // an empty string is empty: the fill goes ahead
  const ok = await world({ records: ix => [notesRec(ix, 'seed-101')], approved: set('seed-101', { notes: '' }) });
  const dry = await runImport({ ...ok.base }); assert.equal(dry.exit, 0, dry.report);
  const done = await runImport({ ...ok.base, mode: 'apply', confirm: dry.token, productionFlag: true }); assert.equal(done.exit, 0, done.report);
  assert.equal(row(ok, 'seed-101').notes, NOTE);
});

test('notes fill plan: invalid notes are invalid records; an expect_h from another content is refused', async () => {
  for (const [set, what] of [[{ notes: '' }, 'empty'], [{ notes: ' padded ' }, 'untrimmed'], [{ notes: 'a\nb' }, 'newline'], [{ notes: 'x'.repeat(2001) }, '2001 chars'], [{ notes: 5 }, 'non-string'], [{ notes: NOTE, name: 'Renamed' }, 'notes + name']]) {
    const w = await world({ records: ix => [notesRec(ix, 'seed-101', set)], approved: infoBase2() });
    assert.equal(w.plan.counts.invalid, 1, what); assert.equal(w.plan.importable, false, what);
    const r = await runImport({ ...w.base }); assert.equal(r.exit, 2, what); assert.ok(failing(r).some(n => /records validate/.test(n)), what + ': ' + failing(r).join());
    assert.equal(w.fake.state.infoPatches.length, 0, what);
  }
  const w = await world({ records: ix => [notesRec(ix, 'seed-101', { notes: NOTE }, { expect_h: '0123456789abcdef' })], approved: infoBase2() });
  assert.equal(w.plan.counts.invalid, 1); assert.match(JSON.stringify(w.plan), /changed-since-research/);
});

test('notes fill verification: another hashed field of the target, or another spot (notes or any hashed field), changing during the writes is a failure record (exit 4), never a manifest', async () => {
  for (const [hook, what] of [
    [(u, st) => { if (u.id === 'seed-101') st.approved.find(r => r.id === 'seed-101').name = 'Vertical Works (renamed)'; }, 'target name'],
    [(u, st) => { if (u.id === 'seed-102') st.approved.find(r => r.id === 'seed-101').photo = 'https://example.com/p.jpg'; }, 'target photo (hashed)'],
    [(u, st) => { if (u.id === 'seed-102') st.approved.find(r => r.id === 'seed-100').notes = 'edited by a moderator'; }, 'bystander notes'],
  ]) {
    const w = await world({ records: NOTES2, approved: infoBase2() }); const dry = await runImport({ ...w.base });
    w.fake.state.hooks.beforePatch = hook;
    const r = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
    assert.equal(r.exit, 4, what + '\n' + r.report); assert.equal(fs.existsSync(path.join(w.b.dir, 'manifest.json')), false, what); assert.equal(fs.existsSync(path.join(w.b.dir, 'import-failure.json')), true, what);
  }
});

test('target.js updateSpotInfo: notes go through the same gate; invalid notes and foreign fields are refused; sends one pinned PATCH with exactly the approved body', async () => {
  const api = new T.Api({ url: 'https://example.supabase.co', serviceKey: 'service-key-xxxxxxxx', anonKey: 'anon-key-xxxxxxxx' });
  const sent = []; api._send = async (method, q, o) => { sent.push({ method, q, o }); return { ok: true, status: 200, json: [{}] }; };
  const sha = updates => crypto.createHash('sha256').update(JSON.stringify(T.opsPayload(updates, []))).digest('hex');
  const gateFor = set => { const updates = [{ id: 'seed-101', set, expect_h: '0123456789abcdef' }]; return T.mintUpdateGate({ batchId: 'b', token: 't', updates, payloadSha: sha(updates) }); };
  const u = set => ({ id: 'seed-101', set, updatedAt: '2026-09-24T01:02:03.123456+00:00' });
  const bad = async (set, re) => assert.rejects(api.updateSpotInfo(u(set), gateFor(set)), re, JSON.stringify(set));
  await bad({ notes: '' }, /notes must be non-empty/); await bad({ notes: null }, /notes must be non-empty/); await bad({ notes: ' x' }, /notes has leading/); await bad({ notes: 'a\nb' }, /single-line/);
  await bad({ notes: 'x'.repeat(2001) }, /notes is 2001/); await bad({ notes: NOTE, photo: 'https://example.com/p.jpg' }, /only website\/hours\/day_pass\/facilities\/notes/);
  assert.equal(sent.length, 0, 'nothing sent for any refusal');
  const set = { notes: NOTE }, gate = gateFor(set);
  await assert.rejects(api.updateSpotInfo(u({ notes: NOTE + '!' }), gate), /not the approved one/);
  await api.updateSpotInfo(u(set), gate);
  assert.equal(sent.length, 1); assert.equal(sent[0].method, 'PATCH'); assert.equal(sent[0].o.body, JSON.stringify(set));
  assert.equal(sent[0].q, '/rest/v1/spots?id=eq.seed-101&status=eq.approved&updated_at=eq.2026-09-24T01%3A02%3A03.123456%2B00%3A00');
});

test('notes fill: the confirmation token is bound to the exact note', async () => {
  const { confirmToken } = require('../scripts/lib/gym-import/updater');
  const mk = set => confirmToken({ batchId: 'b', planSha: 'p', payload: crypto.createHash('sha256').update(JSON.stringify([{ id: 'seed-101', set, expect_h: '0123456789abcdef' }])).digest('hex'), host: 'h', kind: 'local', coverage: 'FULL', liveSha: 'l' });
  assert.notEqual(mk({ notes: 'Temporarily closed.' }), mk({ notes: 'Permanently closed.' })); assert.equal(mk({ notes: NOTE }), mk({ notes: NOTE }));
});
