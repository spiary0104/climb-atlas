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
  const state = { approved: approved.map(r => ({ ...r })), pending: pending.map(r => ({ ...r })), patches: [], infoPatches: [], retires: [], inserts: 0, hooks: {} };
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
      assert.ok(Object.keys(u.set).every(k => ['website', 'hours', 'day_pass', 'facilities'].includes(k)), 'an information fill carries the gym-information fields only');
      if (state.hooks.beforePatch) state.hooks.beforePatch(u, state);
      state.infoPatches.push({ id: u.id, set: u.set, updatedAt: u.updatedAt });
      const row = state.approved.find(r => r.id === u.id && r.status === 'approved' && r.updated_at === u.updatedAt);
      if (!row) return { ok: true, status: 200, json: [], text: '[]' };
      Object.assign(row, u.set, { updated_at: 'ts-w' + (++clock) });
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
test('only address, lat and lng can change: every other field, a half pin, a cleared address, or a missing expect_h/source is refused', async () => {
  const cases = [
    [ix => [upd(ix, 'seed-100', { name: 'Hijacked' })], 'name'],
    [ix => [upd(ix, 'seed-100', { types: ['top-rope'] })], 'types'],
    [ix => [upd(ix, 'seed-100', { notes: 'x' })], 'notes'],
    [ix => [upd(ix, 'seed-100', { suburb: 'Elsewhere' })], 'suburb'],
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
  assert.deepEqual([...V.INFO_FIELDS], ['website', 'hours', 'day_pass', 'facilities']);
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
  for (const [set, what] of [[{ day_pass: DAYPASS, lat: -33.882, lng: 151.213 }, 'day pass + pin'], [{ facilities: FAC, address: '1 St' }, 'facilities + address'], [{ day_pass: DAYPASS, name: 'Renamed' }, 'day pass + name'], [{ facilities: FAC, website: 'https://example.com/', notes: 'x' }, 'info + notes']]) {
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
