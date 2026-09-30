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
  const state = { approved: approved.map(r => ({ ...r })), pending: pending.map(r => ({ ...r })), patches: [], inserts: 0, hooks: {} };
  let clock = 0;
  const api = {
    async probe() { return { ok: true, status: 200 }; },
    async getAll(q) {
      if (state.hooks.beforeRead) state.hooks.beforeRead(q, state);
      if (q.includes('status=eq.approved')) return state.approved.map(r => ({ ...r }));
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

// The real-database run of the update path lives in import-importer.test.js with the other local-stack tests: they all reset
// the shared local `spots` table, and node --test runs test FILES in parallel.
