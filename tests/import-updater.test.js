// Location-update batches (scripts/lib/gym-import/updater.js): address / lat / lng of existing approved spots only, each bound to
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
  const state = { approved: approved.map(r => ({ ...r })), pending: pending.map(r => ({ ...r })), patches: [], retires: [], inserts: 0, hooks: {} };
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
