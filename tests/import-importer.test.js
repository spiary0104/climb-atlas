// Tests for the production importer (scripts/lib/gym-import/importer.js).
//  * Integration tests run against a LOCAL Supabase stack (`supabase start`); they skip if it is not running. They can never reach
//    production: the helper refuses non-local URLs and every env passed to the importer points at 127.0.0.1.
//  * Production-mode GATES are tested with an in-memory fake API and a temporary repo root, so no network is involved.
//   node --test "tests/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const P = require('../scripts/lib/gym-import/plan');
const S = require('../scripts/lib/gym-import/index-store');
const T = require('../scripts/lib/gym-import/target');
const N = require('../scripts/lib/gym-import/normalize');
const { runImport, toRow, diffRow } = require('../scripts/lib/gym-import/importer');
const { ROOT, tmp, PROD, makeBatch, makeIndex, rec } = require('./helpers/import-helpers');
const { localStack, admin, prodRow, fakeJwt } = require('./helpers/local-stack');

const stack = localStack();
const skip = stack ? false : 'local Supabase stack is not running (supabase start)';
const adm = stack ? admin(stack) : null;
const env = (over = {}) => ({ SUPABASE_URL: stack.url, SUPABASE_ANON_KEY: stack.anon, SUPABASE_SERVICE_ROLE_KEY: stack.service, ...over });
const CLI = path.join(ROOT, 'scripts', 'gym-import.js');

// ---- world builders ----------------------------------------------------------------------------------------------------
const NEW3 = () => [
  rec({ name: 'Summit Lab', suburb: 'Newtown', lat: -33.897, lng: 151.179 }),
  rec({ name: 'Granite Peak Bouldering', suburb: 'Manly', lat: -33.797, lng: 151.289, address: '2 Ocean St, Manly NSW 2095', types: ['indoor-bouldering', 'top-rope'] }),
  rec({ name: 'Yarra Vertical', suburb: 'Richmond', state: 'VIC', lat: -37.82, lng: 145.0, address: null, notes: null }),
];
async function anonApproved() {
  const r = await fetch(stack.url + '/rest/v1/spots?select=*&status=eq.approved&order=id', { headers: { apikey: stack.anon, Authorization: 'Bearer ' + stack.anon } });
  return r.json();
}
async function world({ existing = PROD, records = NEW3(), decorate } = {}) {
  await adm.reset();
  if (existing.length) await adm.insert(existing.map(prodRow));
  const indexDir = tmp(); S.write(await anonApproved(), indexDir, { source: 'local test' });
  const b = makeBatch(records);
  const index = S.load(indexDir);
  if (decorate) decorate(b);
  let plan = await P.planBatch({ dir: b.dir, index });
  P.freezeIds(b.dir, plan);
  plan = await P.planBatch({ dir: b.dir, index });
  fs.writeFileSync(path.join(b.dir, 'plan.json'), JSON.stringify(plan, null, 1) + '\n');
  return { b, indexDir, index, plan };
}
const run = (w, o = {}) => runImport({ batchDir: w.b.dir, indexDir: w.indexDir, env: env(), ...o });
const failing = r => r.checks.filter(c => c.status === 'FAIL').map(c => c.name);
// A real Api that counts every request by method, so tests can prove "zero writes".
function spy(e = env()) {
  const api = new T.Api(T.resolveTarget(e)), calls = [], orig = api._send.bind(api);
  api._send = (method, p, o) => { calls.push(method); return orig(method, p, o); };
  return { api, calls, writes: () => calls.filter(m => m !== 'GET').length };
}
const dbIds = async () => (await adm.all()).map(r => r.id).sort();
const manifestOf = w => path.join(w.b.dir, 'manifest.json');

// ============================================ 1. successful insertion ===========================================================
test('apply inserts a small synthetic batch: rows exist, provenance flags fixed, existing spots untouched, manifest written', { skip }, async () => {
  const w = await world();
  const dry = await run(w);
  assert.equal(dry.exit, 0, dry.report); assert.equal(dry.state, 'fresh'); assert.equal(dry.coverage, 'FULL'); assert.match(dry.token, /^[0-9a-f]{16}$/);
  const before = await adm.all();
  const r = await run(w, { mode: 'apply', confirm: dry.token });
  assert.equal(r.exit, 0, r.report); assert.equal(r.wrote, true);
  const after = await adm.all();
  assert.equal(after.length, before.length + 3);
  for (const old of before) assert.deepEqual(after.find(x => x.id === old.id), old, 'pre-existing spot ' + old.id + ' must be byte-identical (incl. updated_at)');
  for (const row of r.rows) {
    const db = after.find(x => x.id === row.id); assert.ok(db, row.id + ' inserted');
    assert.deepEqual(diffRow(row, db), []);
    assert.equal(db.status, 'approved'); assert.equal(db.community, false); assert.equal(db.edited, false); assert.equal(db.submitted_by, null);
  }
  assert.equal(r.verification.ok, true);
  const m = JSON.parse(fs.readFileSync(manifestOf(w), 'utf8'));
  assert.equal(m.status, 'imported'); assert.equal(m.rows_inserted, 3); assert.equal(m.approved_after, m.approved_before + 3); assert.deepEqual(m.ids, r.rows.map(x => x.id));
  const text = JSON.stringify(m) + r.report;
  assert.ok(!text.includes(stack.service) && !text.includes(stack.anon), 'no credential may appear in the manifest or report');
});

// ============================================ 2. dry-run / default mode never writes ==============================================
test('dry-run (and the default mode) performs zero writes and leaves no manifest', { skip }, async () => {
  const w = await world();
  const before = JSON.stringify(await adm.all());
  for (const mode of ['dry-run', undefined]) {
    const s = spy();
    const r = await run(w, { mode, api: s.api, confirm: 'ffffffffffff', productionFlag: true });   // even with apply-only inputs supplied
    assert.equal(r.exit, 0, r.report); assert.equal(s.writes(), 0, 'non-GET requests: ' + s.calls.join()); assert.ok(s.calls.length > 0);
    assert.match(r.report, /DRY RUN — no writes/); assert.match(r.report, /production was NOT written/);
  }
  assert.equal(JSON.stringify(await adm.all()), before);
  assert.equal(fs.existsSync(manifestOf(w)), false);
});

test('dry-run without a service-role key works but reports PARTIAL coverage and is not apply-ready', { skip }, async () => {
  const w = await world();
  const r = await run(w, { env: env({ SUPABASE_SERVICE_ROLE_KEY: undefined }) });
  assert.equal(r.exit, 0); assert.equal(r.coverage, 'PARTIAL'); assert.equal(r.applyReady, false);
  assert.match(r.report, /PARTIAL coverage/);
  assert.ok(r.checks.some(c => c.status === 'SKIP' && /pending submissions/.test(c.name)));
});

// ============================================ 3. --apply (and the other gates) are required ======================================
test('CLI: without --apply nothing is written even when a valid confirmation token is supplied; flag conflicts and missing batch are usage errors', { skip }, async () => {
  const w = await world();
  const dry = await run(w);
  const before = JSON.stringify(await adm.all());
  const cli = (...a) => cp.spawnSync(process.execPath, [CLI, 'import', ...a], { encoding: 'utf8', env: { ...process.env, ...env() } });
  const args = ['--index', w.indexDir];
  const noFlag = cli(w.b.dir, ...args, '--confirm', dry.token, '--i-understand-this-writes-to-production');
  assert.equal(noFlag.status, 0, noFlag.stdout + noFlag.stderr); assert.match(noFlag.stdout, /DRY RUN/);
  assert.equal(JSON.stringify(await adm.all()), before, 'default mode must not write');
  assert.equal(cli(w.b.dir, ...args, '--apply', '--dry-run').status, 1);
  assert.equal(cli(w.b.dir, ...args, '--apply', '--verify').status, 1);
  assert.equal(cli().status, 1, 'the batch must be named explicitly');
  assert.equal(cli('no-such-batch-here', '--apply').status, 1);
  const noConfirm = cli(w.b.dir, ...args, '--apply'); assert.equal(noConfirm.status, 2); assert.match(noConfirm.stdout, /gate: --confirm/);
  const wrong = cli(w.b.dir, ...args, '--apply', '--confirm', '000000000000'); assert.equal(wrong.status, 2); assert.match(wrong.stdout, /does not match/);
  assert.equal(JSON.stringify(await adm.all()), before, 'refused applies must not write');
  const ok = cli(w.b.dir, ...args, '--apply', '--confirm', dry.token); assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.equal((await adm.all()).length, JSON.parse(before).length + 3);
});

test('apply gates: the confirmation token is bound to batch + payload + target; changing the batch invalidates it', { skip }, async () => {
  const w = await world();
  const dry = await run(w);
  const before = JSON.stringify(await adm.all());
  const noTok = await run(w, { mode: 'apply' }); assert.equal(noTok.exit, 2); assert.ok(failing(noTok).includes('gate: --confirm'));
  const bad = await run(w, { mode: 'apply', confirm: 'abcdefabcdef' }); assert.equal(bad.exit, 2);
  assert.equal(JSON.stringify(await adm.all()), before);
  // edit a record after the dry-run: the plan is stale, so it is refused before the token is even considered
  const f = path.join(w.b.dir, 'records.ndjson'); const lines = fs.readFileSync(f, 'utf8').trim().split('\n'); const o = JSON.parse(lines[0]); o.name = o.name + ' Renamed'; lines[0] = JSON.stringify(o);
  fs.writeFileSync(f, lines.join('\n') + '\n');
  const stale = await run(w, { mode: 'apply', confirm: dry.token }); assert.equal(stale.exit, 2); assert.ok(failing(stale).includes('committed plan.json is current'));
  assert.equal(JSON.stringify(await adm.all()), before);
});

// ============================================ 4. refusals ===========================================================================
test('duplicate id refusal: a staged id that already exists (approved, pending, or with different content) is refused; nothing is written', { skip }, async () => {
  const existingG = { id: 'g-aaaaaaaaaa', name: 'Already Imported Gym', suburb: 'Elsewhere', state: 'NSW', country: 'AU', lat: -33.5, lng: 151.5, address: null };
  const w = await world({ existing: [...PROD, existingG] });
  // stage a *different* gym that carries the id of the existing one
  const f = path.join(w.b.dir, 'records.ndjson'); const lines = fs.readFileSync(f, 'utf8').trim().split('\n'); const o = JSON.parse(lines[0]); lines[0] = JSON.stringify({ ...o, id: 'g-aaaaaaaaaa' });
  fs.writeFileSync(f, lines.join('\n') + '\n');
  const before = JSON.stringify(await adm.all());
  const r = await run(w); assert.equal(r.exit, 2); assert.ok(failing(r).some(n => /absent from production|content differs/.test(n)), failing(r).join());
  const a = await run(w, { mode: 'apply', confirm: 'x'.repeat(12) }); assert.equal(a.exit, 2);
  assert.equal(JSON.stringify(await adm.all()), before);
  // a PENDING row with a staged id is invisible to the public API: only the service-role read can catch it
  const w2 = await world();
  const staged = JSON.parse(fs.readFileSync(path.join(w2.b.dir, 'records.ndjson'), 'utf8').trim().split('\n')[1]);
  await adm.insert([{ id: staged.id, name: 'Pending thing', suburb: 'x', state: 'NSW', country: 'AU', lat: -20, lng: 140, types: ['top-rope'], community: true, edited: false, status: 'pending' }]);
  const partial = await run(w2, { env: env({ SUPABASE_SERVICE_ROLE_KEY: undefined }) });
  assert.equal(partial.exit, 0, 'without a service key the pending row is invisible (that is why apply requires the key)'); assert.equal(partial.coverage, 'PARTIAL');
  const full = await run(w2); assert.equal(full.exit, 2); assert.ok(failing(full).some(n => /absent from production/.test(n)));
});

test('production/index drift refusal: rows added, removed or changed since the index was built are all refused', { skip }, async () => {
  for (const kind of ['added', 'removed', 'changed']) {
    const w = await world();
    if (kind === 'added') await adm.insert([prodRow({ id: 'seed-777', name: 'Somebody Else Added This', suburb: 'x', state: 'QLD', country: 'AU', lat: -27, lng: 153 })]);
    if (kind === 'removed') await fetch(stack.url + '/rest/v1/spots?id=eq.seed-101', { method: 'DELETE', headers: { apikey: stack.service, Authorization: 'Bearer ' + stack.service } });
    if (kind === 'changed') await adm.patch('seed-100', { name: 'Boulder Barn (moderator edit)' });
    const before = JSON.stringify(await adm.all());
    const r = await run(w); assert.equal(r.exit, 2, kind + '\n' + r.report);
    assert.ok(failing(r).includes('production has not drifted from the index'), kind + ': ' + failing(r).join());
    const a = await run(w, { mode: 'apply', confirm: 'x'.repeat(12) }); assert.equal(a.exit, 2);
    assert.equal(JSON.stringify(await adm.all()), before, kind + ': nothing written');
  }
});

test('index integrity: a tampered/edited index is refused', { skip }, async () => {
  const w = await world();
  fs.appendFileSync(path.join(w.indexDir, 'gym-index.ndjson'), '\n');
  const r = await run(w); assert.equal(r.exit, 2); assert.ok(failing(r).includes('match index integrity'));
});

test('malformed / invalid batch refusal: bad JSON, non-objects, invalid fields, unfrozen ids, empty, missing, oversize', { skip }, async () => {
  const cases = {
    'invalid field': rec({ name: 'Bad Lat', lat: 200 }),
    'unsafe photo': rec({ name: 'Bad Photo', photo: 'javascript:alert(1)' }),
    'broken json': '{"name": "broken',
    'not an object': '[1,2,3]',
    'legacy id': rec({ id: 'seed-5', name: 'Legacy Id' }),
    'unknown field': rec({ name: 'Typo', lattitude: 1 }),
  };
  for (const [label, bad] of Object.entries(cases)) {
    await adm.reset();
    const indexDir = tmp(); S.write([], indexDir, {});
    const b = makeBatch([rec({ name: 'Fine Gym', id: 'g-1111111111' }), bad], { id: '2026-01-01-bad-batch' });
    const before = JSON.stringify(await adm.all());
    const r = await runImport({ batchDir: b.dir, indexDir, env: env(), mode: 'apply', confirm: 'x'.repeat(12) });
    assert.equal(r.exit, 2, label + '\n' + r.report); assert.equal(r.wrote, false);
    assert.equal(JSON.stringify(await adm.all()), before, label);
  }
  const indexDir = tmp(); S.write([], indexDir, {});
  const empty = makeBatch([], { id: '2026-01-01-empty' }); fs.writeFileSync(path.join(empty.dir, 'records.ndjson'), '');
  assert.ok(failing(await runImport({ batchDir: empty.dir, indexDir, env: env() })).includes('batch has records'));
  assert.ok(failing(await runImport({ batchDir: path.join(tmp(), 'nope'), indexDir, env: env() })).includes('batch specified'));
  const many = makeBatch(Array.from({ length: 1001 }, (_, i) => rec({ id: 'g-' + i.toString(16).padStart(10, '0'), name: 'G' + i })), { id: '2026-01-01-oversize' });
  assert.ok(failing(await runImport({ batchDir: many.dir, indexDir, env: env() })).includes('batch size'));
  const noMeta = makeBatch([rec()], { id: '2026-01-01-nometa' }); fs.unlinkSync(path.join(noMeta.dir, 'batch.json'));
  assert.ok(failing(await runImport({ batchDir: noMeta.dir, indexDir, env: env() })).includes('batch metadata'));
});

test('probable-duplicate refusal: a staged gym 30 m from an existing gym is never inserted', { skip }, async () => {
  const dup = rec({ name: 'Boulder Barn Annex', suburb: 'Surry Hills', lat: PROD[0].lat + 0.00027, lng: PROD[0].lng, address: null });
  const w = await world({ records: [rec({ name: 'Totally Fine', lat: -33.6, lng: 151.4 }), dup] });
  assert.ok(w.plan.counts['probable-duplicate'] >= 1, 'the planner flags it');
  const before = JSON.stringify(await adm.all());
  const r = await run(w); assert.equal(r.exit, 2); assert.ok(failing(r).includes('every staged record is (still) new'), failing(r).join());
  const a = await run(w, { mode: 'apply', confirm: 'x'.repeat(12) }); assert.equal(a.exit, 2);
  assert.equal(JSON.stringify(await adm.all()), before);
});

test('existing-record update attempt refusal: update records are never accepted, and nothing existing changes', { skip }, async () => {
  const w = await world({ records: [rec({ name: 'Fine New Gym', lat: -33.6, lng: 151.4 }), { intent: 'update', id: 'seed-100', reason: 'try to change an existing gym', set: { name: 'Hijacked' } }] });
  const before = JSON.stringify(await adm.all());
  const r = await run(w, { mode: 'apply', confirm: 'x'.repeat(12) });
  assert.equal(r.exit, 2); assert.ok(failing(r).includes('insert-only'), failing(r).join()); assert.match(r.report, /never updates, deletes or merges/);
  assert.equal(JSON.stringify(await adm.all()), before);
});

test('a staged record that already exists in production (existing, not new) is refused, not skipped or merged', { skip }, async () => {
  const copy = { ...PROD[0], id: 'g-cccccccccc' };   // same gym as an existing production spot, staged under a new id
  const w = await world({ records: [rec({ name: 'Fine New Gym', lat: -33.6, lng: 151.4 }), copy] });
  assert.equal(w.plan.counts.existing, 1);
  const r = await run(w); assert.equal(r.exit, 2); assert.ok(failing(r).includes('every staged record is (still) new'));
});

test('a pending community submission that duplicates a staged gym blocks the import (service-role read)', { skip }, async () => {
  const w = await world();
  const s = JSON.parse(fs.readFileSync(path.join(w.b.dir, 'records.ndjson'), 'utf8').trim().split('\n')[0]);
  await adm.insert([{ id: 'community-0f3a7c2e-9999-4222-8333-444455556666', name: s.name, suburb: s.suburb, state: s.state, country: s.country, lat: s.lat, lng: s.lng, types: s.types, community: true, edited: false, status: 'pending' }]);
  const r = await run(w); assert.equal(r.exit, 2); assert.ok(failing(r).includes('no staged record duplicates a pending submission'), failing(r).join());
});

// ============================================ 5. credentials =======================================================================
test('missing / invalid credentials: apply is refused before any write; the server rejecting a key is caught by the read probe', { skip }, async () => {
  const w = await world();
  const dry = await run(w);
  const before = JSON.stringify(await adm.all());
  const cases = {
    'missing': undefined,
    'empty': '   ',
    'publishable key': 'sb_publishable_' + 'x'.repeat(30),
    'anon jwt': stack.anon,
    'garbage': 'not-a-key',
    'quoted': `"${stack.service}"`,
    'expired': fakeJwt({ role: 'service_role', exp: 1000 }),
    'truncated secret': 'sb_secret_short',
  };
  for (const [label, key] of Object.entries(cases)) {
    const r = await run(w, { mode: 'apply', confirm: dry.token, env: env({ SUPABASE_SERVICE_ROLE_KEY: key }) });
    assert.equal(r.exit, 2, label + '\n' + r.report); assert.ok(failing(r).includes('service-role credential'), label);
    assert.equal(r.wrote, false);
    assert.ok(!r.report.includes(stack.service) && (!key || key.trim().length < 9 || !r.report.includes(key.trim())), label + ': a supplied credential must never be echoed in the report');
  }
  // shaped like a service key but signed with the wrong secret: only the server can tell
  const forged = fakeJwt({ iss: 'supabase-demo', role: 'service_role', exp: 1983812996 });
  const r = await run(w, { mode: 'apply', confirm: dry.token, env: env({ SUPABASE_SERVICE_ROLE_KEY: forged }) });
  assert.equal(r.exit, 2); assert.ok(failing(r).includes('service-role credential accepted by the server'), failing(r).join());
  assert.equal(JSON.stringify(await adm.all()), before);
  assert.ok(!r.report.includes(forged), 'a rejected key is not echoed');
});

test('credential validation rules (static): roles, project refs, formats, expiry', () => {
  const prod = { kind: 'production', prod: { ref: 'thayxaampaelvntoaido' } }, local = { kind: 'local', prod: { ref: 'thayxaampaelvntoaido' } };
  const v = (k, t = prod) => T.validateServiceKey(k, t);
  assert.deepEqual(v(fakeJwt({ role: 'service_role', ref: 'thayxaampaelvntoaido' })), []);
  assert.match(v(fakeJwt({ role: 'service_role', ref: 'otherprojectref' }))[0], /different Supabase project/);
  assert.match(v(fakeJwt({ role: 'service_role' }))[0], /no project ref/);
  assert.match(v(fakeJwt({ role: 'anon', ref: 'thayxaampaelvntoaido' }))[0], /not service_role/);
  assert.match(v(fakeJwt({ role: 'service_role', ref: 'thayxaampaelvntoaido' }), local)[0], /PRODUCTION key but the target is local/);
  assert.deepEqual(v(fakeJwt({ role: 'service_role', iss: 'supabase-demo' }), local), []);
  assert.deepEqual(v('sb_secret_' + 'x'.repeat(30)), []);
  assert.match(v('sb_publishable_' + 'x'.repeat(30))[0], /publishable/);
  assert.match(v(null)[0], /not set/); assert.match(v('a b')[0], /malformed/);
  assert.match(T.redact('boom sb_secret_abcdefghijklmnop boom', ['sb_secret_abcdefghijklmnop']), /\[redacted\]/);
});

test('target resolution: only production or localhost; apply has no default target; unknown hosts refused', () => {
  const e = (o) => T.resolveTarget(o);
  assert.equal(e({}).kind, 'production'); assert.deepEqual(e({}).problems, []);
  assert.match(T.resolveTarget({}, { requireExplicit: true }).problems[0], /must be set explicitly/);
  assert.equal(e({ SUPABASE_URL: 'http://127.0.0.1:54321', SUPABASE_ANON_KEY: 'a' }).kind, 'local');
  assert.match(e({ SUPABASE_URL: 'http://127.0.0.1:54321' }).problems[0], /SUPABASE_ANON_KEY is required/);
  for (const bad of ['https://evil.supabase.co', 'https://example.com', 'http://thayxaampaelvntoaido.supabase.co', 'https://thayxaampaelvntoaido.supabase.co/rest/v1', 'https://user:pw@thayxaampaelvntoaido.supabase.co', 'not a url']) assert.ok(e({ SUPABASE_URL: bad, SUPABASE_ANON_KEY: 'a' }).problems.length > 0, bad);
});

// ============================================ 6. idempotency =====================================================================
test('repeated import is idempotent: the second apply writes nothing, creates no duplicates, alters no row', { skip }, async () => {
  const w = await world();
  const dry = await run(w);
  const first = await run(w, { mode: 'apply', confirm: dry.token }); assert.equal(first.exit, 0, first.report);
  const afterFirst = JSON.stringify(await adm.all());
  const manifest1 = fs.readFileSync(manifestOf(w), 'utf8');
  const s = spy();
  const second = await run(w, { mode: 'apply', confirm: dry.token, api: s.api });
  assert.equal(second.exit, 0, second.report); assert.equal(second.state, 'already-imported'); assert.equal(second.wrote, false);
  assert.equal(s.writes(), 0); assert.match(second.report, /NOTHING TO DO/);
  assert.equal(JSON.stringify(await adm.all()), afterFirst, 'no row changed, none added');
  assert.equal(fs.readFileSync(manifestOf(w), 'utf8'), manifest1, 'the manifest is not rewritten');
  const third = await run(w, { mode: 'dry-run' }); assert.equal(third.exit, 0); assert.equal(third.state, 'already-imported');
  const ver = await run(w, { mode: 'verify' }); assert.equal(ver.exit, 0);
});

test('idempotent recovery: rows in production but no manifest (e.g. crash after the insert) -> no write, a recovery manifest is written', { skip }, async () => {
  const w = await world();
  const dry = await run(w);
  await run(w, { mode: 'apply', confirm: dry.token });
  fs.unlinkSync(manifestOf(w));
  const before = JSON.stringify(await adm.all());
  const s = spy();
  const r = await run(w, { mode: 'apply', confirm: dry.token, api: s.api });
  assert.equal(r.exit, 0, r.report); assert.equal(r.state, 'already-present'); assert.equal(s.writes(), 0);
  assert.equal(JSON.parse(fs.readFileSync(manifestOf(w), 'utf8')).status, 'imported-recovered');
  assert.equal(JSON.stringify(await adm.all()), before);
});

test('re-running against a partially/differently present batch is refused, never merged', { skip }, async () => {
  const w = await world();
  const dry = await run(w);
  await run(w, { mode: 'apply', confirm: dry.token });
  fs.unlinkSync(manifestOf(w));
  const id = JSON.parse(fs.readFileSync(path.join(w.b.dir, 'records.ndjson'), 'utf8').trim().split('\n')[0]).id;
  await adm.patch(id, { name: 'Edited by a moderator after import' });
  const before = JSON.stringify(await adm.all());
  const r = await run(w, { mode: 'apply', confirm: dry.token }); assert.equal(r.exit, 2); assert.ok(failing(r).includes('already in production, content differs'));
  assert.equal(JSON.stringify(await adm.all()), before, 'the moderator edit is preserved');
  await adm.reset(); await adm.insert(PROD.map(prodRow));                 // now only ONE of the staged ids exists
  await adm.insert([{ ...toRow(JSON.parse(fs.readFileSync(path.join(w.b.dir, 'records.ndjson'), 'utf8').trim().split('\n')[0]), u => u), community: false }]);
  const partial = await run(w); assert.equal(partial.exit, 2);
});

// ============================================ 7. post-import verification ========================================================
test('post-import verification: `verify` passes on a good import and FAILS if production later differs; a bad insert fails verification (exit 4)', { skip }, async () => {
  const w = await world();
  const dry = await run(w);
  await run(w, { mode: 'apply', confirm: dry.token });
  assert.equal((await run(w, { mode: 'verify' })).exit, 0);
  const id = JSON.parse(fs.readFileSync(path.join(w.b.dir, 'records.ndjson'), 'utf8').trim().split('\n')[2]).id;
  await adm.patch(id, { lat: 10 });
  const bad = await run(w, { mode: 'verify' }); assert.equal(bad.exit, 2); assert.ok(failing(bad).includes('already in production, content differs'));
  // an insert whose stored result differs from the staged payload (here: changed behind the importer's back) is caught by the read-back
  const w3 = await world();
  const d3 = await run(w3);
  const s3 = spy(); const real3 = s3.api.insertSpots.bind(s3.api);
  s3.api.insertSpots = async (rows, gate) => { const r = await real3(rows, gate); await adm.patch(rows[1].id, { notes: 'changed behind the importer\'s back' }); return r; };
  const failed = await run(w3, { mode: 'apply', confirm: d3.token, api: s3.api });
  assert.equal(failed.exit, 4, failed.report); assert.equal(failed.verification.ok, false);
  assert.equal(fs.existsSync(manifestOf(w3)), false, 'a failed verification must NOT leave a manifest.json behind');
  const fail = JSON.parse(fs.readFileSync(path.join(w3.b.dir, 'import-failure.json'), 'utf8'));
  assert.equal(fail.status, 'import-failed'); assert.equal(fail.phase, 'verification-failed'); assert.ok(fail.problems.length >= 1);
  assert.equal(require('../scripts/lib/gym-import/manifest').isImported(w3.b.dir), false);
});

test('the insert itself is atomic and insert-only: a payload containing one existing id writes nothing and changes nothing', { skip }, async () => {
  await adm.reset(); await adm.insert(PROD.map(prodRow));
  const before = JSON.stringify(await adm.all());
  const api = new T.Api(T.resolveTarget(env()));
  const fresh = toRow({ ...rec({ name: 'Atomic Fresh', lat: -33.1, lng: 151.1 }), id: 'g-bbbbbbbbbb' }, u => u);
  const clash = { ...toRow({ ...rec({ name: 'Overwrite attempt' }), id: 'seed-100' }, u => u) };
  const rows = [fresh, clash];
  const gate = T.mintWriteGate({ batchId: 'x', token: 'y', rows, payloadSha: require('../scripts/lib/gym-import/importer').payloadSha(rows) });
  const r = await api.insertSpots(rows, gate);
  assert.equal(r.ok, false); assert.ok([409, 400].includes(r.status), 'HTTP ' + r.status);
  assert.equal(JSON.stringify(await adm.all()), before, 'neither the fresh row nor an overwrite happened');
  await assert.rejects(() => api.insertSpots(rows, null), /no write gate/);
  await assert.rejects(() => api.insertSpots(rows, {}), /no write gate/);
  await assert.rejects(() => api.insertSpots([...rows], gate), /do not match the approved payload/);
  await assert.rejects(() => new T.Api(T.resolveTarget(env({ SUPABASE_SERVICE_ROLE_KEY: undefined }))).insertSpots(rows, gate), /no service-role key/);
});

// ============================================ 8. production-mode gates (fake API, temp repo root; no network) ====================
function fakeProduction({ approved, pending = [], failInsert = false, behaviour = failInsert ? 'reject' : 'ok' }) {
  // Behaves like the database for a plain INSERT: atomic (any existing id fails the whole statement, nothing changes), never overwrites.
  // behaviour: 'ok' | 'reject' (HTTP 409) | 'lose-after' (rows written, response lost) | 'drop-before' (request never arrives) | 'partial' (1 row, then lost)
  const netErr = () => Object.assign(new Error('socket hang up'), { network: true });
  const state = { approved: approved.map(r => ({ ...r })), pending: pending.map(r => ({ ...r })), inserts: [], reads: 0, log: [] };
  const api = {
    async probe() { return { ok: true, status: 200 }; },
    async getAll(q) {
      state.reads++;
      if (q.includes('status=eq.approved')) { state.log.push('read:approved'); return state.approved.map(r => ({ ...r })); }
      if (q.includes('status=eq.pending')) { state.log.push('read:pending'); return state.pending.map(r => ({ ...r })); }
      const m = /id=in\.\(([^)]*)\)/.exec(q); if (m) { state.log.push('read:ids'); const ids = m[1].split(','); return [...state.approved, ...state.pending].filter(r => ids.includes(r.id)).map(r => ({ ...r })); }
      throw new Error('unexpected query ' + q);
    },
    async insertSpots(rows, gate) {
      assert.ok(gate && gate.rows === rows, 'the fake API only accepts the gated payload');
      state.log.push('INSERT');
      if (behaviour === 'drop-before') throw netErr();
      state.inserts.push(rows);
      const existing = new Set([...state.approved, ...state.pending].map(r => r.id));
      if (behaviour === 'reject' || rows.some(r => existing.has(r.id))) return { ok: false, status: 409, text: 'duplicate key value violates unique constraint' };
      const put = r => state.approved.push({ ...r, created_at: 'x', updated_at: 'x', submitted_by: null });
      if (behaviour === 'partial') { put(rows[0]); throw netErr(); }
      rows.forEach(put);
      if (behaviour === 'lose-after') throw netErr();
      return { ok: true, status: 201, text: '' };
    },
  };
  return { api, state };
}
async function prodWorld({ withPending = [], behaviour = 'ok' } = {}) {
  const root = tmp();
  fs.mkdirSync(path.join(root, 'js'), { recursive: true }); fs.mkdirSync(path.join(root, 'import', 'batches'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'js', 'supabase-init.js'), path.join(root, 'js', 'supabase-init.js'));
  const approved = PROD.map(r => prodRow({ ...r, created_at: 'x', updated_at: 'x', submitted_by: null }));
  S.write(approved, path.join(root, 'import', 'index'), { source: 'fake production' });
  const b = makeBatch(NEW3(), { id: '2026-01-01-fake-prod', root: path.join(root, 'import', 'batches') });
  const index = S.load(path.join(root, 'import', 'index'));
  let plan = await P.planBatch({ dir: b.dir, index }); P.freezeIds(b.dir, plan); plan = await P.planBatch({ dir: b.dir, index });
  fs.writeFileSync(path.join(b.dir, 'plan.json'), JSON.stringify(plan, null, 1) + '\n');
  const prod = T.productionConfig(root);
  const goodKey = fakeJwt({ role: 'service_role', ref: prod.ref, exp: 4102444800 });
  const fake = fakeProduction({ approved, pending: withPending, behaviour });
  const base = { batchDir: b.dir, root, env: { SUPABASE_URL: prod.url, SUPABASE_SERVICE_ROLE_KEY: goodKey }, api: fake.api };
  return { root, b, fake, base, prod, goodKey };
}

test('production gates (fake API): dry-run passes; apply needs the token AND --i-understand-this-writes-to-production; only then one gated insert', async () => {
  const pw = await prodWorld();
  const dry = await runImport({ ...pw.base });
  assert.equal(dry.exit, 0, dry.report); assert.equal(dry.target.kind, 'production'); assert.equal(dry.coverage, 'FULL'); assert.equal(pw.fake.state.inserts.length, 0);
  const noFlag = await runImport({ ...pw.base, mode: 'apply', confirm: dry.token }); assert.equal(noFlag.exit, 2); assert.ok(failing(noFlag).includes('gate: --i-understand-this-writes-to-production'));
  const wrongTok = await runImport({ ...pw.base, mode: 'apply', confirm: 'deadbeef0000', productionFlag: true }); assert.equal(wrongTok.exit, 2);
  assert.equal(pw.fake.state.inserts.length, 0, 'no insert before every gate passes');
  const ok = await runImport({ ...pw.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(ok.exit, 0, ok.report); assert.equal(pw.fake.state.inserts.length, 1); assert.equal(pw.fake.state.inserts[0].length, 3);
  assert.equal(JSON.parse(fs.readFileSync(path.join(pw.b.dir, 'manifest.json'), 'utf8')).target.kind, 'production');
  assert.ok(!fs.readFileSync(path.join(pw.b.dir, 'manifest.json'), 'utf8').includes(pw.goodKey));
  const again = await runImport({ ...pw.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(again.exit, 0); assert.equal(pw.fake.state.inserts.length, 1, 'second apply must not insert again');
});

test('production gates: apply has no default target; wrong-project keys, unknown hosts, --index overrides and out-of-repo batches are refused', async () => {
  const pw = await prodWorld();
  const noUrl = await runImport({ ...pw.base, env: { SUPABASE_SERVICE_ROLE_KEY: pw.goodKey }, mode: 'apply', confirm: 'x', productionFlag: true });
  assert.equal(noUrl.exit, 2); assert.match(noUrl.report, /must be set explicitly/);
  const otherRef = fakeJwt({ role: 'service_role', ref: 'someotherproject', exp: 4102444800 });
  const r1 = await runImport({ ...pw.base, env: { ...pw.base.env, SUPABASE_SERVICE_ROLE_KEY: otherRef }, mode: 'apply', confirm: 'x', productionFlag: true }); assert.equal(r1.exit, 2); assert.match(r1.report, /different Supabase project/);
  const r2 = await runImport({ ...pw.base, env: { SUPABASE_URL: 'https://evil.supabase.co', SUPABASE_SERVICE_ROLE_KEY: pw.goodKey } }); assert.equal(r2.exit, 2); assert.match(r2.report, /unknown target host/);
  const r3 = await runImport({ ...pw.base, indexDir: tmp() }); assert.equal(r3.exit, 2); assert.ok(failing(r3).includes('production uses the repo index only'));
  const outside = makeBatch(NEW3(), { id: '2026-01-01-outside' });
  const r4 = await runImport({ ...pw.base, batchDir: outside.dir }); assert.equal(r4.exit, 2); assert.ok(failing(r4).includes('production uses repo batches only'));
  assert.equal(pw.fake.state.inserts.length, 0);
});

test('production gates: a pending submission near a staged gym, a failed insert, and a mid-flight change all stop or report correctly', async () => {
  const near = { id: 'community-0f3a7c2e-1111-4222-8333-444455556677', name: 'Summit Lab', suburb: 'Newtown', state: 'NSW', country: 'AU', lat: -33.897, lng: 151.179, types: ['indoor-bouldering'], status: 'pending', community: true, edited: false };
  const pw = await prodWorld({ withPending: [near] });
  const r = await runImport({ ...pw.base }); assert.equal(r.exit, 2); assert.ok(failing(r).includes('no staged record duplicates a pending submission'));
  const pw2 = await prodWorld(); pw2.fake.state.failInsert = false;
  const failFake = fakeProduction({ approved: pw2.fake.state.approved, failInsert: true });
  const dry = await runImport({ ...pw2.base, api: failFake.api });
  const rejected = await runImport({ ...pw2.base, api: failFake.api, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(rejected.exit, 2); assert.ok(failing(rejected).includes('insert')); assert.equal(fs.existsSync(path.join(pw2.b.dir, 'manifest.json')), false, 'no manifest for a write that did not happen');
  // production changes between the dry-run token and apply: caught by the final re-check, before any insert
  const pw3 = await prodWorld(); const dry3 = await runImport({ ...pw3.base });
  const real = pw3.fake.api.getAll; let calls = 0;
  pw3.fake.api.getAll = async q => { const rows = await real(q); if (q.includes('status=eq.approved') && ++calls === 2) rows.push(prodRow({ id: 'seed-888', name: 'Appeared mid-flight', suburb: 'x', state: 'NSW', country: 'AU', lat: -30, lng: 150, created_at: 'x', updated_at: 'x', submitted_by: null })); return rows; };
  const raced = await runImport({ ...pw3.base, mode: 'apply', confirm: dry3.token, productionFlag: true });
  assert.equal(raced.exit, 2); assert.ok(failing(raced).includes('production has not drifted from the index') || failing(raced).includes('final re-check before write'), failing(raced).join());
  assert.equal(pw3.fake.state.inserts.length, 0);
});

test('recorded provenance is re-verified: a changed decisions file, a staged rejected record, or a wrong staged count refuses the import', async () => {
  const { canonicalSha } = require('../scripts/lib/gym-import/stage');
  const pw = await prodWorld();
  const ids = fs.readFileSync(path.join(pw.b.dir, 'records.ndjson'), 'utf8').trim().split('\n').map(l => JSON.parse(l).id);
  const decisionsPath = path.join(pw.root, 'decisions.json');
  const decisions = { duplicates_removed: [{ remove_final_id: 'g-deadbeef00', remove_repo_id: 'seed-x' }] };
  fs.writeFileSync(decisionsPath, JSON.stringify(decisions));
  const setMeta = extra => {
    const bj = path.join(pw.b.dir, 'batch.json'); const m = JSON.parse(fs.readFileSync(bj, 'utf8'));
    m.source = { staged: 3, not_staged_other: {}, decisions: { file: 'decisions.json', canonical_sha256: canonicalSha(decisions), rejected_records_excluded: ['g-deadbeef00'] }, ...extra };
    fs.writeFileSync(bj, JSON.stringify(m));
  };
  setMeta({});
  const ok = await runImport({ ...pw.base }); assert.equal(ok.exit, 0, ok.report); assert.ok(ok.checks.some(c => c.status === 'PASS' && c.name === 'provenance: decisions'));
  fs.writeFileSync(decisionsPath, JSON.stringify({ ...decisions, note: 'edited after staging' }));
  const changed = await runImport({ ...pw.base }); assert.equal(changed.exit, 2); assert.ok(failing(changed).includes('provenance: decisions file unchanged'));
  fs.writeFileSync(decisionsPath, JSON.stringify(decisions));
  fs.writeFileSync(decisionsPath, JSON.stringify({ duplicates_removed: [{ remove_final_id: ids[0] }] })); const d2 = JSON.parse(fs.readFileSync(decisionsPath, 'utf8'));
  setMeta({ decisions: { file: 'decisions.json', canonical_sha256: canonicalSha(d2), rejected_records_excluded: [ids[0]] } });
  const banned = await runImport({ ...pw.base }); assert.equal(banned.exit, 2); assert.ok(failing(banned).includes('provenance: no rejected record staged'));
  fs.writeFileSync(decisionsPath, JSON.stringify(decisions)); setMeta({ staged: 5 });
  const count = await runImport({ ...pw.base }); assert.equal(count.exit, 2); assert.ok(failing(count).includes('provenance: staged count'));
  fs.unlinkSync(decisionsPath); setMeta({});
  const missing = await runImport({ ...pw.base }); assert.equal(missing.exit, 2); assert.ok(failing(missing).includes('provenance: decisions file'));
  assert.equal(pw.fake.state.inserts.length, 0);
});

// Opt-in, READ-ONLY check of the real 246-record batch against real production (public GETs only; no key is used or needed):
//   GYM_IMPORT_LIVE_TESTS=1 node --test tests/import-importer.test.js
test('LIVE (opt-in, read-only): the real 246-record batch passes the full preflight against production with zero writes', { skip: process.env.GYM_IMPORT_LIVE_TESTS === '1' ? false : 'set GYM_IMPORT_LIVE_TESTS=1 to run (production read-only)' }, async () => {
  const dir = path.join(ROOT, 'import', 'batches', '2026-09-24-reconciled-new-gyms');
  const target = T.resolveTarget({});
  assert.equal(target.serviceKey, null, 'this test must run without any service-role credential');
  const api = new T.Api(target), calls = [], orig = api._send.bind(api);
  api._send = (m, p, o) => { calls.push(m); return orig(m, p, o); };
  const r = await runImport({ batchDir: dir, env: {}, api });
  assert.equal(r.exit, 0, r.report); assert.equal(r.target.kind, 'production'); assert.equal(r.rows.length, 246);
  // before the import the batch is 'fresh'; after it (valid manifest present) production must hold all 246 rows identically -> 'already-imported'
  const imported = require('../scripts/lib/gym-import/manifest').isImported(dir);
  assert.equal(r.state, imported ? 'already-imported' : 'fresh');
  assert.ok(calls.length > 0 && calls.every(m => m === 'GET'), 'only GET requests: ' + [...new Set(calls)].join());
  assert.equal(fs.existsSync(path.join(dir, 'manifest.json')), imported);
});

// ============================================ AUDIT: manifest lifecycle, provenance, token binding, write gate ===================
const MFM = require('../scripts/lib/gym-import/manifest');
const { confirmToken, payloadSha, IMPORTER_VERSION } = require('../scripts/lib/gym-import/importer');
const failureOf = w => path.join(w.b.dir, 'import-failure.json');
const MANIFEST_KEYS = ['approved_after', 'approved_before', 'batch_id', 'confirm_token', 'coverage', 'finished_at', 'ids', 'importer_version', 'live_state_sha256', 'payload_sha256', 'plan_sha256', 'rows_inserted', 'schema_version', 'started_at', 'status', 'target', 'verification'];

test('manifest lifecycle: an OUTPUT, never an input. A pre-import dry-run needs none; only a verified apply creates one; exact fields', { skip }, async () => {
  const w = await world();
  assert.equal(fs.existsSync(manifestOf(w)), false, 'the batch starts without a manifest');
  const dry = await run(w);
  assert.equal(dry.exit, 0, dry.report); assert.equal(dry.state, 'fresh'); assert.equal(dry.coverage, 'FULL');       // a COMPLETE preflight without a manifest
  assert.equal(fs.existsSync(manifestOf(w)), false, 'a dry-run creates nothing');
  for (const bad of [undefined, '0000000000000000']) { const r = await run(w, { mode: 'apply', confirm: bad }); assert.equal(r.exit, 2); }
  assert.equal(fs.existsSync(manifestOf(w)), false, 'refused applies create nothing'); assert.equal(fs.existsSync(failureOf(w)), false);
  const ok = await run(w, { mode: 'apply', confirm: dry.token });
  assert.equal(ok.exit, 0, ok.report);
  const m = JSON.parse(fs.readFileSync(manifestOf(w), 'utf8'));
  assert.deepEqual(Object.keys(m).sort(), MANIFEST_KEYS);
  assert.equal(m.status, 'imported'); assert.equal(m.coverage, 'FULL'); assert.equal(m.importer_version, IMPORTER_VERSION); assert.equal(m.schema_version, 1);
  assert.deepEqual(m.target, { kind: 'local', host: '127.0.0.1:54321' });
  assert.deepEqual(m.verification, { ok: true, checked: 3, problems: [] });
  assert.equal(m.confirm_token, dry.token); assert.equal(m.rows_inserted, 3); assert.equal(m.ids.length, 3);
  assert.match(m.payload_sha256, /^[0-9a-f]{64}$/); assert.match(m.plan_sha256, /^[0-9a-f]{64}$/); assert.match(m.live_state_sha256, /^[0-9a-f]{64}$/);
  assert.equal(MFM.readManifest(w.b.dir).valid, true); assert.equal(MFM.isImported(w.b.dir), true);
  for (const secret of [stack.service, stack.anon]) assert.ok(!JSON.stringify(m).includes(secret));
});

test('a manifest cannot be used to bypass anything: forged, malformed, wrong-batch, wrong-payload, wrong-target or "failed" manifests are refused or ignored', { skip }, async () => {
  const w = await world();
  const dry = await run(w);
  const before = JSON.stringify(await adm.all());
  const ids = JSON.parse(JSON.stringify(dry.rows.map(r => r.id)));
  const good = { schema_version: 1, importer_version: IMPORTER_VERSION, batch_id: w.b.id, status: 'imported', target: { kind: 'local', host: '127.0.0.1:54321' }, payload_sha256: dry.payloadSha, ids, verification: { ok: true, checked: 3, problems: [] } };
  const variants = {
    'well-formed and matching, but production has none of the rows': good,
    'empty object': {}, 'wrong batch id': { ...good, batch_id: 'someone-else' }, 'failed status': { ...good, status: 'imported-verification-failed' },
    'verification not ok': { ...good, verification: { ok: false } }, 'other payload': { ...good, payload_sha256: 'f'.repeat(64) }, 'other target': { ...good, target: { kind: 'production', host: 'x.supabase.co' } },
  };
  for (const [label, m] of Object.entries(variants)) {
    fs.writeFileSync(manifestOf(w), JSON.stringify(m));
    const r = await run(w); assert.equal(r.exit, 2, label + '\n' + r.report); assert.ok(failing(r).includes('no manifest without rows'), label);
    const a = await run(w, { mode: 'apply', confirm: dry.token }); assert.equal(a.exit, 2, label); assert.equal(a.wrote, false);
    assert.equal(JSON.stringify(await adm.all()), before, label + ': production unchanged');
  }
  fs.writeFileSync(manifestOf(w), 'not json at all');
  assert.equal((await run(w)).exit, 2); assert.equal(MFM.isImported(w.b.dir), false);
  fs.unlinkSync(manifestOf(w));
  // rows present + a manifest that does not match this run: NOT labelled already-imported
  await run(w, { mode: 'apply', confirm: dry.token });
  const real = fs.readFileSync(manifestOf(w), 'utf8');
  fs.writeFileSync(manifestOf(w), JSON.stringify({ ...JSON.parse(real), payload_sha256: 'a'.repeat(64) }));
  const mism = await run(w); assert.equal(mism.exit, 2); assert.ok(failing(mism).includes('manifest matches this batch, payload and target'));
  fs.writeFileSync(manifestOf(w), real);
  const okAgain = await run(w); assert.equal(okAgain.exit, 0); assert.equal(okAgain.state, 'already-imported');
});

test('only a well-formed "imported" manifest marks a batch as imported (planner, staged-batch comparison); stray or failed files do not', async () => {
  const root = tmp();
  const a = makeBatch([rec({ name: 'Staged Elsewhere', lat: -33.3, lng: 151.3 })], { id: '2026-01-01-alpha', root });
  const b = makeBatch([rec({ name: 'Staged Elsewhere', lat: -33.3001, lng: 151.3 })], { id: '2026-01-02-beta', root });
  const index = makeIndex();
  const cmp = async () => (await P.planBatch({ dir: b.dir, index })).records[0].class;
  assert.equal(await cmp(), 'probable-duplicate', 'a staged (unimported) batch is compared against');
  fs.writeFileSync(path.join(a.dir, 'manifest.json'), '{}');
  assert.equal(await cmp(), 'probable-duplicate', 'a stray/forged manifest does not hide a staged batch');
  fs.writeFileSync(path.join(a.dir, 'manifest.json'), JSON.stringify({ schema_version: 1, batch_id: '2026-01-01-alpha', status: 'imported-verification-failed', ids: ['g-1'], target: { kind: 'local', host: 'h' }, payload_sha256: 'a'.repeat(64), verification: { ok: false } }));
  assert.equal(await cmp(), 'probable-duplicate', 'a failed manifest does not hide it either');
  fs.writeFileSync(path.join(a.dir, 'manifest.json'), JSON.stringify({ schema_version: 1, batch_id: '2026-01-01-alpha', status: 'imported', ids: ['g-1'], target: { kind: 'local', host: 'h' }, payload_sha256: 'a'.repeat(64), verification: { ok: true } }));
  assert.equal(await cmp(), 'new', 'a valid imported manifest: those gyms are in production now, so they are no longer "staged"');
});

test('a failed or ambiguous write never leaves a manifest claiming success (lost response, dropped request, partial write, rejected insert, failed verification)', async () => {
  const outcomes = {};
  for (const behaviour of ['reject', 'lose-after', 'drop-before', 'partial']) {
    const pw = await prodWorld({ behaviour });
    const dry = await runImport({ ...pw.base });
    assert.equal(dry.exit, 0, dry.report);
    const r = await runImport({ ...pw.base, mode: 'apply', confirm: dry.token, productionFlag: true });
    outcomes[behaviour] = { exit: r.exit, manifest: fs.existsSync(path.join(pw.b.dir, 'manifest.json')), failure: fs.existsSync(path.join(pw.b.dir, 'import-failure.json')), rows: pw.fake.state.approved.length - PROD.length };
    if (behaviour === 'partial') assert.equal(JSON.parse(fs.readFileSync(path.join(pw.b.dir, 'import-failure.json'), 'utf8')).phase, 'partial-or-unknown-outcome');
  }
  assert.deepEqual(outcomes.reject, { exit: 2, manifest: false, failure: false, rows: 0 }, 'rejected insert: nothing written, nothing recorded');
  assert.deepEqual(outcomes['drop-before'], { exit: 4, manifest: false, failure: false, rows: 0 }, 'request never arrived: exit 4, nothing written, no manifest');
  assert.deepEqual(outcomes.partial, { exit: 4, manifest: false, failure: true, rows: 1 }, 'partial state: failure record only');
  assert.deepEqual(outcomes['lose-after'], { exit: 0, manifest: true, failure: false, rows: 3 }, 'response lost but ALL rows verified in production: a genuine success');
});

test('idempotency matrix (fake production): none imported / all identical / some exist / one differs / response lost / verification fails - never an overwrite', async () => {
  // a) none imported -> inserts once
  const a = await prodWorld(); const da = await runImport({ ...a.base });
  assert.equal((await runImport({ ...a.base, mode: 'apply', confirm: da.token, productionFlag: true })).exit, 0); assert.equal(a.fake.state.inserts.length, 1);
  // b) all already exist identically -> no second insert, exit 0
  const rb = await runImport({ ...a.base, mode: 'apply', confirm: da.token, productionFlag: true }); assert.equal(rb.exit, 0); assert.equal(a.fake.state.inserts.length, 1);
  // c) some exist -> refused, no insert
  const c = await prodWorld(); const dc = await runImport({ ...c.base });
  const staged = JSON.parse(fs.readFileSync(path.join(c.b.dir, 'records.ndjson'), 'utf8').trim().split('\n')[0]);
  c.fake.state.approved.push({ ...toRow(staged, u => u), created_at: 'x', updated_at: 'x', submitted_by: null });
  const rc = await runImport({ ...c.base, mode: 'apply', confirm: dc.token, productionFlag: true }); assert.equal(rc.exit, 2); assert.equal(c.fake.state.inserts.length, 0);
  // d) an existing record differs -> refused; that row keeps the other value
  const d = await prodWorld(); const dd = await runImport({ ...d.base }); await runImport({ ...d.base, mode: 'apply', confirm: dd.token, productionFlag: true });
  fs.unlinkSync(path.join(d.b.dir, 'manifest.json'));
  d.fake.state.approved.find(r => r.id === dd.rows[1].id).name = 'Edited after import';
  const rd = await runImport({ ...d.base, mode: 'apply', confirm: dd.token, productionFlag: true }); assert.equal(rd.exit, 2); assert.equal(d.fake.state.inserts.length, 1);
  assert.equal(d.fake.state.approved.find(r => r.id === dd.rows[1].id).name, 'Edited after import', 'the edit survives');
  // the fake database itself refuses to overwrite: an id collision fails the whole statement
  const e = fakeProduction({ approved: PROD.map(r => prodRow({ ...r, created_at: 'x', updated_at: 'x', submitted_by: null })) });
  const clash = [toRow({ ...rec(), id: 'g-1212121212' }, u => u), toRow({ ...rec(), id: 'seed-100' }, u => u)];
  const gate = T.mintWriteGate({ batchId: 'x', token: 'y', rows: clash, payloadSha: payloadSha(clash) });
  assert.equal((await e.api.insertSpots(clash, gate)).ok, false); assert.equal(e.state.approved.length, PROD.length);
});

test('confirmation token: bound to batch, payload, plan, target host and kind, coverage, live state and importer version', () => {
  const base = { batchId: 'b', planSha: 'p', payload: 'x', host: 'h.supabase.co', kind: 'production', coverage: 'FULL', liveSha: 'l' };
  const t0 = confirmToken(base);
  assert.match(t0, /^[0-9a-f]{16}$/);
  for (const [k, v] of Object.entries({ batchId: 'b2', planSha: 'p2', payload: 'x2', host: 'other.supabase.co', kind: 'local', coverage: 'PARTIAL', liveSha: 'l2' })) assert.notEqual(confirmToken({ ...base, [k]: v }), t0, k + ' must change the token');
  assert.equal(confirmToken({ ...base }), t0, 'deterministic');
});

test('token invalidation end to end: changed records, changed batch, changed production state and partial coverage all invalidate it', { skip }, async () => {
  const w = await world();
  const dry = await run(w); const t0 = dry.token;
  // (1) a public-only (PARTIAL) dry-run yields NO token, and a token computed for PARTIAL coverage is rejected by --apply
  const partial = await run(w, { env: env({ SUPABASE_SERVICE_ROLE_KEY: undefined }) });
  assert.equal(partial.exit, 0); assert.equal(partial.coverage, 'PARTIAL'); assert.equal(partial.token, null); assert.match(partial.report, /Confirmation token: none \(PARTIAL/);
  const fake = confirmToken({ batchId: w.b.id, planSha: dry.planSha, payload: dry.payloadSha, host: '127.0.0.1:54321', kind: 'local', coverage: 'PARTIAL', liveSha: dry.liveSha });
  const before = JSON.stringify(await adm.all());
  const viaPartial = await run(w, { mode: 'apply', confirm: fake }); assert.equal(viaPartial.exit, 2); assert.ok(failing(viaPartial).includes('gate: --confirm'));
  const noKey = await run(w, { mode: 'apply', confirm: t0, env: env({ SUPABASE_SERVICE_ROLE_KEY: undefined }) }); assert.equal(noKey.exit, 2); assert.equal(noKey.checks.some(c => c.name === 'production reads'), false, 'refused before any network read');
  assert.equal(JSON.stringify(await adm.all()), before);
  // (2) same records under another batch name -> different token
  const copy = makeBatch(fs.readFileSync(path.join(w.b.dir, 'records.ndjson'), 'utf8').trim().split('\n'), { id: '2026-01-05-other-name' });
  const pl = await P.planBatch({ dir: copy.dir, index: w.index }); fs.writeFileSync(path.join(copy.dir, 'plan.json'), JSON.stringify(pl, null, 1) + '\n');
  const other = await runImport({ batchDir: copy.dir, indexDir: w.indexDir, env: env() }); assert.equal(other.exit, 0, other.report); assert.notEqual(other.token, t0);
  // (3) an edited record (plan regenerated so everything else is consistent) -> different token; the old token is refused
  const f = path.join(w.b.dir, 'records.ndjson'); const lines = fs.readFileSync(f, 'utf8').trim().split('\n'); const o = JSON.parse(lines[2]); o.notes = 'edited after the dry-run'; lines[2] = JSON.stringify(o);
  fs.writeFileSync(f, lines.join('\n') + '\n');
  const pl2 = await P.planBatch({ dir: w.b.dir, index: w.index }); fs.writeFileSync(path.join(w.b.dir, 'plan.json'), JSON.stringify(pl2, null, 1) + '\n');
  const edited = await run(w); assert.equal(edited.exit, 0); assert.notEqual(edited.token, t0);
  const stale = await run(w, { mode: 'apply', confirm: t0 }); assert.equal(stale.exit, 2); assert.ok(failing(stale).includes('gate: --confirm'));
  // (4) production state changes: refused as drift; and once the index is rebuilt to match, the token is different again
  await adm.insert([prodRow({ id: 'seed-4242', name: 'Added by someone else', suburb: 'x', state: 'QLD', country: 'AU', lat: -27.5, lng: 153.0 })]);
  const drifted = await run(w, { mode: 'apply', confirm: edited.token }); assert.equal(drifted.exit, 2); assert.ok(failing(drifted).includes('production has not drifted from the index'));
  S.write(await anonApproved(), w.indexDir, { source: 'rebuilt' });
  const idx2 = S.load(w.indexDir); const pl3 = await P.planBatch({ dir: w.b.dir, index: idx2 }); fs.writeFileSync(path.join(w.b.dir, 'plan.json'), JSON.stringify(pl3, null, 1) + '\n');
  const rebuilt = await run(w); assert.equal(rebuilt.exit, 0, rebuilt.report); assert.notEqual(rebuilt.token, edited.token); assert.notEqual(rebuilt.liveSha, edited.liveSha);
  assert.equal((await adm.all()).some(r => r.id.startsWith('g-')), false, 'no staged row was ever written');
});

test('the token depends on no credential: two different service-role keys give the same token', async () => {
  const pw = await prodWorld();
  const k2 = fakeJwt({ role: 'service_role', ref: pw.prod.ref, exp: 4102444800, jti: 'a-different-key' });
  const t1 = (await runImport({ ...pw.base })).token, t2 = (await runImport({ ...pw.base, env: { ...pw.base.env, SUPABASE_SERVICE_ROLE_KEY: k2 } })).token;
  assert.ok(t1 && t1 === t2);
});

test('final write gate: the last thing before the INSERT is the final live re-check; a changed/added row or a new pending clash refuses; the payload is re-hashed', async () => {
  // order of API calls in a successful apply: ... reads ..., final re-check reads, INSERT, post-import reads
  const pw = await prodWorld(); const dry = await runImport({ ...pw.base });
  pw.fake.state.log.length = 0;
  const ok = await runImport({ ...pw.base, mode: 'apply', confirm: dry.token, productionFlag: true }); assert.equal(ok.exit, 0, ok.report);
  const log = pw.fake.state.log, at = log.indexOf('INSERT');
  assert.equal(log.filter(x => x === 'INSERT').length, 1, 'exactly one INSERT');
  assert.deepEqual(log.slice(at - 3, at), ['read:approved', 'read:ids', 'read:pending'], 'the INSERT is immediately preceded by a full live re-read');
  // production changes after the token was issued but before the write
  const changes = {
    'a row CHANGED': (rows, pend) => { rows.find(r => r.id === 'seed-101').name = 'Vertical Works (edited)'; },
    'a row ADDED': (rows) => { rows.push(prodRow({ id: 'seed-9001', name: 'New Arrival', suburb: 'x', state: 'QLD', country: 'AU', lat: -27, lng: 153, created_at: 'x', updated_at: 'x', submitted_by: null })); },
    'a row REMOVED': (rows) => { rows.splice(rows.findIndex(r => r.id === 'seed-102'), 1); },
    'a pending clash appears': (rows, pend, staged) => { pend.push({ id: 'community-0f3a7c2e-2222-4222-8333-444455556666', name: staged.name, suburb: staged.suburb, state: staged.state, country: staged.country, lat: staged.lat, lng: staged.lng, types: staged.types, status: 'pending', community: true, edited: false }); },
  };
  for (const [label, mutate] of Object.entries(changes)) {
    const w = await prodWorld(); const d = await runImport({ ...w.base });
    const staged = JSON.parse(fs.readFileSync(path.join(w.b.dir, 'records.ndjson'), 'utf8').trim().split('\n')[0]);
    let approvedReads = 0; const realGet = w.fake.api.getAll;
    w.fake.api.getAll = async (q, o) => { const rows = await realGet(q, o); if (q.includes('status=eq.approved') && ++approvedReads === 2) mutate(w.fake.state.approved, w.fake.state.pending, staged); return q.includes('status=eq.approved') ? w.fake.state.approved.map(r => ({ ...r })) : q.includes('status=eq.pending') ? w.fake.state.pending.map(r => ({ ...r })) : rows; };
    const r = await runImport({ ...w.base, mode: 'apply', confirm: d.token, productionFlag: true });
    assert.equal(r.exit, 2, label + '\n' + r.report); assert.ok(failing(r).includes('final re-check before write'), label + ': ' + failing(r).join());
    assert.equal(w.fake.state.inserts.length, 0, label + ': no INSERT was attempted'); assert.equal(fs.existsSync(path.join(w.b.dir, 'manifest.json')), false);
  }
  // the payload cannot change between approval and the INSERT
  const rows = [toRow({ ...rec(), id: 'g-3434343434' }, u => u)];
  const gate = T.mintWriteGate({ batchId: 'x', token: 'y', rows, payloadSha: payloadSha(rows) });
  rows[0].name = 'tampered after approval';
  await assert.rejects(() => new T.Api(T.resolveTarget({ SUPABASE_URL: 'http://127.0.0.1:1', SUPABASE_ANON_KEY: 'a'.repeat(20), SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_' + 'z'.repeat(30) })).insertSpots(rows, gate), /payload changed after it was approved/);
});

test('credentials never leak: not in reports, errors, exceptions, CLI output, tokens or manifests (unreachable target and injected failures)', async () => {
  const KEY = 'sb_secret_' + 'LEAKCANARY0123456789abcdefghijk', ANON = 'anon-canary-' + 'q'.repeat(24);
  const e = { SUPABASE_URL: 'http://127.0.0.1:1', SUPABASE_ANON_KEY: ANON, SUPABASE_SERVICE_ROLE_KEY: KEY };
  const b = makeBatch([rec({ id: 'g-5656565656' })], { id: '2026-01-01-leak-check' });
  const idx = tmp(); S.write([], idx, {});
  const r = await runImport({ batchDir: b.dir, indexDir: idx, env: e });
  assert.equal(r.exit, 2); assert.ok(failing(r).length >= 1);
  for (const s of [KEY, ANON, 'LEAKCANARY']) assert.ok(!r.report.includes(s) && !JSON.stringify(r.checks).includes(s), 'runImport output leaked ' + s);
  const cli = cp.spawnSync(process.execPath, [CLI, 'import', b.dir, '--index', idx, '--apply', '--confirm', 'x'.repeat(16)], { encoding: 'utf8', env: { ...process.env, ...e } });
  for (const s of [KEY, ANON, 'LEAKCANARY']) assert.ok(!(cli.stdout + cli.stderr).includes(s), 'CLI output leaked ' + s);
  // an exception whose message contains the key is redacted before it reaches the report
  const pw = await prodWorld(); const canary = pw.goodKey;
  pw.fake.api.getAll = async () => { throw new Error('upstream said: bad credential ' + canary); };
  const inj = await runImport({ ...pw.base }); assert.equal(inj.exit, 2); assert.ok(!inj.report.includes(canary) && inj.report.includes('[redacted]'));
  // network errors from the real client are redacted too
  const api = new T.Api(T.resolveTarget(e)); api.secrets = () => [KEY, ANON];
  await assert.rejects(() => api.getAll('/rest/v1/spots?select=id'), err => !err.message.includes(KEY) && !err.message.includes(ANON));
});

test('pre-import view of the index is verified against the hash recorded at staging, NOT trusted from a manifest (forged manifests throw)', async () => {
  const { preImportIndex } = require('./helpers/import-helpers');
  const root = tmp();
  const mk = (rows, name) => { const d = path.join(root, 'import', name); fs.mkdirSync(d, { recursive: true }); return d; };
  const base = PROD.map(r => prodRow(r));
  const extra = [prodRow({ id: 'g-aaaaaaaaaa', name: 'Imported One', suburb: 's', state: 'NSW', country: 'AU', lat: -30, lng: 150 }), prodRow({ id: 'g-bbbbbbbbbb', name: 'Imported Two', suburb: 's', state: 'NSW', country: 'AU', lat: -31, lng: 150 })];
  const idxDir = mk(base, 'index'); const pre = S.write(base, idxDir, {});               // the index as staged
  const batchId = '2026-01-01-pre-import-view'; const bdir = path.join(root, 'import', 'batches', batchId); fs.mkdirSync(bdir, { recursive: true });
  fs.writeFileSync(path.join(bdir, 'batch.json'), JSON.stringify({ schema_version: 1, batch_id: batchId, description: 'test batch', index_at_staging: { sha256: pre.sha256, count: pre.count } }));
  assert.equal(preImportIndex(batchId, root).entries.length, PROD.length, 'no manifest: the real index IS the pre-import state');
  S.write([...base, ...extra], idxDir, {});                                                // production/index after the import
  const manifest = ids => ({ schema_version: 1, batch_id: batchId, status: 'imported', ids, target: { kind: 'local', host: 'h' }, payload_sha256: 'a'.repeat(64), verification: { ok: true } });
  fs.writeFileSync(path.join(bdir, 'manifest.json'), JSON.stringify(manifest(['g-aaaaaaaaaa', 'g-bbbbbbbbbb'])));
  const view = preImportIndex(batchId, root);
  assert.equal(view.entries.length, PROD.length); assert.equal(view.sha256, pre.sha256); assert.equal(view.preImportView, true);
  for (const [label, ids] of Object.entries({ 'removes a real pre-existing gym': ['g-aaaaaaaaaa', 'g-bbbbbbbbbb', 'seed-100'], 'omits an imported gym': ['g-aaaaaaaaaa'], 'names ids that are not in the index': ['g-aaaaaaaaaa', 'g-bbbbbbbbbb', 'g-cccccccccc'] })) {
    fs.writeFileSync(path.join(bdir, 'manifest.json'), JSON.stringify(manifest(label === 'names ids that are not in the index' ? ['g-aaaaaaaaaa', 'g-cccccccccc'] : ids)));
    assert.throws(() => preImportIndex(batchId, root), /cannot reconstruct the pre-import index/, label);
  }
  fs.writeFileSync(path.join(bdir, 'manifest.json'), '{}'); assert.throws(() => preImportIndex(batchId, root), /not valid/);
});

test('production logic never derives state from a manifest: the importer reads only the live database and the index', () => {
  const src = f => fs.readFileSync(path.join(ROOT, 'scripts', 'lib', 'gym-import', f), 'utf8');
  const im = src('importer.js');
  assert.ok(!/preImportIndex/.test(im), 'no test-only helper in production code');
  // every use of the manifest in the importer is validation, labelling or writing; none feeds index/drift/plan/presence decisions
  const uses = [...im.matchAll(/mf\.[a-zA-Z]+|MF\.[a-zA-Z]+/g)].map(m => m[0]);
  assert.ok(uses.every(u => /^(mf\.(exists|valid|problems|manifest)|MF\.(readManifest|mismatches|writeManifest|writeFailure|FAILURE|MANIFEST))$/.test(u)), uses.join());
});

// ============================================ 9. static guarantees ================================================================
test('static: exactly four write call sites -- a plain INSERT (importer.js), a location PATCH, a gym-information PATCH and a retire PATCH (all three via updater.js) -- and no delete/upsert/merge capability', () => {
  const dir = path.join(ROOT, 'scripts', 'lib', 'gym-import');
  const src = f => fs.readFileSync(path.join(dir, f), 'utf8').split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
  const t = src('target.js'), im = src('importer.js'), up = src('updater.js');
  assert.equal((t.match(/_send\('POST'/g) || []).length, 1, 'exactly one POST call site (insertSpots)');
  assert.equal((t.match(/_send\('PATCH'/g) || []).length, 3, 'exactly three PATCH call sites (updateSpotLocation, updateSpotInfo, retireSpot)');
  for (const bad of [/_send\('(PUT|DELETE)'/, /method:\s*['"](PUT|DELETE)/i, /on_conflict/, /resolution=(merge|ignore)/, /\/rpc\//, /upsert/i, /Prefer:[^,}]*(merge|ignore)-duplicates/]) for (const [n, s] of [['target.js', t], ['importer.js', im], ['updater.js', up]]) assert.ok(!bad.test(s), n + ': ' + bad);
  assert.ok(!/_send\('(PATCH|PUT|DELETE)'|method:\s*['"](PATCH|PUT|DELETE)/i.test(im + up), 'no raw write method outside target.js');
  // the PATCH changes one approved row, pinned to the version seen at the final re-check, and sends only the approved fields
  const patch = t.slice(t.indexOf('async updateSpotLocation('), t.indexOf("_send('PATCH'"));
  assert.match(patch, /id=eq\.\$\{encodeURIComponent\(u\.id\)\}&status=eq\.approved&updated_at=eq\.\$\{encodeURIComponent\(u\.updatedAt\)\}/);
  assert.match(t.slice(t.indexOf("_send('PATCH'")), /body: JSON\.stringify\(u\.set\)/);
  // the gym-information PATCH is pinned the same way; its body is exactly the approved {website?, hours?}, and it only accepts those fields
  const info = t.slice(t.indexOf('async updateSpotInfo('), t.indexOf("_send('PATCH'", t.indexOf('async updateSpotInfo(')) + 400);
  assert.match(info, /id=eq\.\$\{encodeURIComponent\(u\.id\)\}&status=eq\.approved&updated_at=eq\.\$\{encodeURIComponent\(u\.updatedAt\)\}/);
  assert.match(info, /body: JSON\.stringify\(u\.set\) \}\);\s*\}/, 'the info PATCH body is exactly the approved set');
  assert.match(info, /keys\.some\(k => !INFO_FIELDS\.includes\(k\)\)/);
  assert.ok(/INFO_FIELDS = Object\.freeze\(\['website', 'hours'\]\)/.test(src('validate.js')), 'the information fields are exactly website and hours');
  assert.ok(!/body: JSON\.stringify\(\{ \.\.\./.test(t), 'no PATCH body is built by spreading');
  // the retire PATCH is pinned the same way and its body is exactly {status:'rejected', rejection_reason}
  const retire = t.slice(t.indexOf('async retireSpot('), t.indexOf("_send('PATCH'", t.indexOf('async retireSpot(')));
  assert.match(retire, /id=eq\.\$\{encodeURIComponent\(u\.id\)\}&status=eq\.approved&updated_at=eq\.\$\{encodeURIComponent\(u\.updatedAt\)\}/);
  assert.match(t.slice(t.indexOf('async retireSpot(')), /body: JSON\.stringify\(\{ status: 'rejected', rejection_reason: u\.reason \}\)/);
  assert.match(t, /const LOCATION_FIELDS = Object\.freeze\(\['address', 'lat', 'lng'\]\)/);
  assert.ok(!/_send\('POST'|_send\('PATCH'|insertSpots\(|updateSpotLocation\(|updateSpotInfo\(|retireSpot\(/.test(src('plan.js') + src('match.js') + src('validate.js') + src('stage.js') + src('index-store.js') + src('report.js') + src('manifest.js') + src('history.js') + src('research.js')), 'no other module writes');
  assert.ok(!/require\('\.\/(target|importer|updater)'\)|fetch\(|mintWriteGate|mintUpdateGate/.test(src('research.js')), 'the research tooling is offline: no target, no network, no gate');
  assert.equal((im.match(/api\.insertSpots\(/g) || []).length, 1, 'the importer calls the insert exactly once, after the gates');
  assert.ok(!/updateSpotLocation\(|updateSpotInfo\(|retireSpot\(|mintUpdateGate\(/.test(im), 'the importer never updates or retires');
  assert.equal((up.match(/api\.updateSpotLocation\(/g) || []).length, 1, 'the updater calls the update in one place, after the gates');
  assert.equal((up.match(/api\.updateSpotInfo\(/g) || []).length, 1, 'the updater calls the information fill in one place, after the gates');
  assert.equal((up.match(/api\.retireSpot\(/g) || []).length, 1, 'the updater calls the retire in one place, after the gates');
  assert.ok(!/insertSpots\(|mintWriteGate\(/.test(up), 'the updater never inserts');
  for (const [s, mint] of [[im, 'mintWriteGate('], [up, 'mintUpdateGate(']]) assert.ok(s.indexOf(mint) > s.indexOf("'gate: --confirm'") && s.indexOf(mint) > s.indexOf("'final re-check before write'") && s.indexOf("'final re-check before write'") > 0, mint + ' only after the safety checks');
  assert.ok(!/child_process|execSync|spawn\(/.test(t + im + up));
});

test('the insert write gate cannot be copied or forged: only the exact object mintWriteGate returned opens insertSpots', async () => {
  // Offline: every refusal happens before any request (the target points at a closed local port).
  const api = new T.Api(T.resolveTarget({ SUPABASE_URL: 'http://127.0.0.1:1', SUPABASE_ANON_KEY: 'a'.repeat(20), SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_' + 'z'.repeat(30) }), { timeoutMs: 500 });
  const rows = [toRow({ ...rec({ name: 'Gate Copy' }), id: 'g-dddddddddd' }, u => u)];
  const gate = T.mintWriteGate({ batchId: 'x', token: 'y', rows, payloadSha: require('../scripts/lib/gym-import/importer').payloadSha(rows) });
  const copy = { ...gate };
  const sym = Object.getOwnPropertySymbols(gate)[0];
  assert.equal(copy[sym], true, 'a spread copy carries the gate symbol, so the symbol alone must not be enough');
  await assert.rejects(() => api.insertSpots(rows, copy), /no write gate/);
  await assert.rejects(() => api.insertSpots(rows, Object.freeze({ [sym]: true, batchId: 'x', token: 'y', rows, payloadSha: gate.payloadSha })), /no write gate/);
  await assert.rejects(() => api.insertSpots(rows, Object.assign(Object.create(Object.getPrototypeOf(gate)), gate)), /no write gate/);
  // the real gate passes the gate check and only then reaches the (unreachable) network
  await assert.rejects(() => api.insertSpots(rows, gate), e => !/no write gate|approved payload|payload changed/.test(e.message));
});

test('static: no credential is stored in the repository (tracked files, batches, manifests, reports)', () => {
  const files = cp.execSync('git ls-files', { cwd: ROOT, encoding: 'utf8', maxBuffer: 1e8 }).split('\n').filter(f => f && !/\.(png|jpg|jpeg|gif|ico|webp|woff2?)$/.test(f) && fs.existsSync(path.join(ROOT, f)));
  const jwt = /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}/g;
  for (const f of files) {
    if (f.startsWith('tests/')) continue;                                      // tests build fake keys on purpose
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    assert.ok(!/sb_secret_[A-Za-z0-9_-]{20,}/.test(s), f + ': secret key');
    for (const m of s.match(jwt) || []) { const c = T.decodeJwt(m); assert.ok(!(c && c.role === 'service_role'), f + ': service_role JWT'); }
    if (/^(scripts|import|docs|supabase)\//.test(f) || /^js\//.test(f)) assert.ok(!/SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"]?[A-Za-z0-9._-]{20,}/.test(s), f + ': key assignment');
  }
  assert.ok(!files.some(f => /(^|\/)\.env(\.|$)/.test(f)), 'no .env file may be tracked');
  assert.match(fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8'), /^\.env$/m);
});

test('the real 246-record batch has the exact payload the importer would insert (offline check of toRow)', async () => {
  const dir = path.join(ROOT, 'import', 'batches', '2026-09-24-reconciled-new-gyms');
  const recs = fs.readFileSync(path.join(dir, 'records.ndjson'), 'utf8').trim().split('\n').map(JSON.parse);
  const safeUrl = (await require('../scripts/lib/gym-import/validate').deps()).safeUrl;
  const rows = recs.map(r => toRow(r, safeUrl));
  assert.equal(rows.length, 246);
  for (const r of rows) { assert.deepEqual(Object.keys(r), ['id', 'name', 'suburb', 'state', 'country', 'lat', 'lng', 'types', 'notes', 'photo', 'address', 'community', 'edited', 'status']); assert.equal(r.status, 'approved'); assert.equal(r.community, false); assert.equal(r.edited, false); assert.match(r.id, /^g-[0-9a-f]{10}$/); }
  assert.equal(N.emptyToNull(rows[0].notes) === rows[0].notes, true);
});

// ============================================ location updates (updater.js) against the real local database ==================
// Kept in this file on purpose: every local-stack test resets the same local `spots` table, and files run in parallel.
const updRec = (index, id, set) => ({ intent: 'update', id, expect_h: index.byId.get(id).h, reason: 'pin from OpenStreetMap node/1 (test)', source: 'OpenStreetMap node/1 (test)', set });
const TWO = ix => [updRec(ix, 'seed-100', { lat: -33.882, lng: 151.213, address: '14 Example St, Surry Hills NSW 2010' }), updRec(ix, 'seed-102', { lat: -33.8785, lng: 151.196 })];
test('LOCAL STACK: a real update changes only address/lat/lng (slug kept, updated_at bumped); re-run writes nothing; a concurrent edit is refused', { skip }, async () => {
  const e = { SUPABASE_URL: stack.url, SUPABASE_ANON_KEY: stack.anon, SUPABASE_SERVICE_ROLE_KEY: stack.service };
  const setup = async id => {
    await adm.reset(); await adm.insert(PROD.map(prodRow));
    const indexDir = tmp(); S.write(await anonApproved(), indexDir, { source: 'local test' });
    const index = S.load(indexDir);
    const b = makeBatch(TWO(index), { id });
    fs.writeFileSync(path.join(b.dir, 'plan.json'), JSON.stringify(await P.planBatch({ dir: b.dir, index }), null, 1) + '\n');
    return { b, indexDir };
  };
  const { b, indexDir } = await setup('2026-02-01-local-fix');
  const dry = await runImport({ batchDir: b.dir, indexDir, env: e });
  assert.equal(dry.exit, 0, dry.report); assert.equal(dry.kind, 'update'); assert.equal(dry.coverage, 'FULL');
  const before = await adm.all();
  const ok = await runImport({ batchDir: b.dir, indexDir, env: e, mode: 'apply', confirm: dry.token });
  assert.equal(ok.exit, 0, ok.report);
  const after = await adm.all();
  const was = id => before.find(r => r.id === id), now = id => after.find(r => r.id === id);
  assert.equal(now('seed-100').lat, -33.882); assert.equal(now('seed-100').lng, 151.213); assert.equal(now('seed-100').address, '14 Example St, Surry Hills NSW 2010');
  assert.equal(now('seed-100').slug, was('seed-100').slug, 'the stored slug never changes');
  assert.notEqual(now('seed-100').updated_at, was('seed-100').updated_at, 'the database records the edit time');
  for (const f of ['name', 'suburb', 'state', 'country', 'types', 'notes', 'photo', 'status', 'community', 'edited', 'created_at']) assert.deepEqual(now('seed-100')[f], was('seed-100')[f], f);
  assert.deepEqual(now('seed-101'), was('seed-101'), 'other gyms untouched'); assert.equal(after.length, before.length);
  const again = await runImport({ batchDir: b.dir, indexDir, env: e, mode: 'apply', confirm: dry.token });
  assert.equal(again.exit, 0); assert.deepEqual(await adm.all(), after, 'the re-run wrote nothing');
  assert.equal((await runImport({ batchDir: b.dir, indexDir, env: e, mode: 'verify' })).exit, 0);

  // a moderator edits a target gym after the dry-run: refused, nothing written
  const s2 = await setup('2026-02-01-local-race');
  const dry2 = await runImport({ batchDir: s2.b.dir, indexDir: s2.indexDir, env: e });
  await adm.patch('seed-102', { notes: 'edited by a moderator' });
  const snap = JSON.stringify(await adm.all());
  const raced = await runImport({ batchDir: s2.b.dir, indexDir: s2.indexDir, env: e, mode: 'apply', confirm: dry2.token });
  assert.equal(raced.exit, 2, raced.report); assert.equal(JSON.stringify(await adm.all()), snap, 'nothing written');
});

// ============================================ retirements (intent "retire") against the real local database ====================
const retRec = (index, id, over = {}) => ({ intent: 'retire', id, expect_h: index.byId.get(id).h, reason_code: 'closed', reason: 'permanently closed, confirmed on the gym website (test)', source: 'https://example.com/closed (test)', ...over });
const DUP_REASON = 'duplicate of seed-100, the same gym listed twice (test)';
const RET2 = ix => [retRec(ix, 'seed-101'), retRec(ix, 'seed-102', { reason_code: 'duplicate', duplicate_of: 'seed-100', reason: DUP_REASON })];
async function retSetup(id, records = RET2) {
  await adm.reset(); await adm.insert(PROD.map(prodRow));
  const indexDir = tmp(); S.write(await anonApproved(), indexDir, { source: 'local test' });
  const index = S.load(indexDir);
  const b = makeBatch(records(index), { id });
  fs.writeFileSync(path.join(b.dir, 'plan.json'), JSON.stringify(await P.planBatch({ dir: b.dir, index }), null, 1) + '\n');
  return { b, indexDir, index };
}
const approvedCount = rows => rows.filter(r => r.status === 'approved').length;

test('LOCAL STACK: a real retirement sets status rejected + the reason on exactly the targets (record kept, other spots byte-identical, approved count -2); re-run writes nothing', { skip }, async () => {
  const e = env();
  const { b, indexDir } = await retSetup('2026-02-02-local-retire');
  const dry = await runImport({ batchDir: b.dir, indexDir, env: e });
  assert.equal(dry.exit, 0, dry.report); assert.equal(dry.kind, 'update'); assert.equal(dry.coverage, 'FULL'); assert.equal(dry.state, 'fresh'); assert.match(dry.report, /Would retire \(2 gyms/);
  const before = await adm.all();
  assert.equal(JSON.stringify(await adm.all()), JSON.stringify(before), 'the dry-run wrote nothing');
  const ok = await runImport({ batchDir: b.dir, indexDir, env: e, mode: 'apply', confirm: dry.token });
  assert.equal(ok.exit, 0, ok.report); assert.deepEqual(ok.applied, ['seed-101', 'seed-102']);
  const after = await adm.all();
  const was = id => before.find(r => r.id === id), now = id => after.find(r => r.id === id);
  assert.equal(after.length, before.length, 'nothing was deleted');
  assert.equal(approvedCount(after), approvedCount(before) - 2, 'approved count went down by exactly the number of retirements');
  for (const [id, reason] of [['seed-101', 'permanently closed, confirmed on the gym website (test)'], ['seed-102', DUP_REASON]]) {
    assert.equal(now(id).status, 'rejected'); assert.equal(now(id).rejection_reason, reason);
    assert.notEqual(now(id).updated_at, was(id).updated_at, 'the database records the edit time');
    for (const f of ['name', 'suburb', 'state', 'country', 'lat', 'lng', 'address', 'types', 'notes', 'photo', 'community', 'edited', 'created_at', 'slug', 'submitted_by']) assert.deepEqual(now(id)[f], was(id)[f], id + ' unchanged: ' + f);
  }
  for (const id of ['seed-100', 'community-0f3a7c2e-1111-4222-8333-444455556666']) assert.deepEqual(now(id), was(id), id + ' is byte-identical, including updated_at');
  const m = JSON.parse(fs.readFileSync(path.join(b.dir, 'manifest.json'), 'utf8'));
  assert.equal(m.kind, 'update'); assert.equal(m.status, 'updated'); assert.deepEqual(m.retired, ['seed-101', 'seed-102']); assert.equal(m.rows_retired, 2); assert.equal(m.rows_updated, 0);
  assert.equal(m.approved_before, approvedCount(before)); assert.equal(m.approved_after, approvedCount(before) - 2); assert.equal(m.verification.ok, true);
  assert.equal((await anonApproved()).length, approvedCount(after), 'the public site no longer shows the retired gyms');
  // idempotent: already applied -> nothing written, recovery manifest when the manifest is missing
  const again = await runImport({ batchDir: b.dir, indexDir, env: e, mode: 'apply', confirm: dry.token });
  assert.equal(again.exit, 0, again.report); assert.equal(again.state, 'already-updated'); assert.deepEqual(await adm.all(), after, 'the re-run wrote nothing');
  assert.equal((await runImport({ batchDir: b.dir, indexDir, env: e, mode: 'verify' })).exit, 0);
  fs.unlinkSync(path.join(b.dir, 'manifest.json'));
  const rec = await runImport({ batchDir: b.dir, indexDir, env: e, mode: 'apply', confirm: 'irrelevant' });
  assert.equal(rec.exit, 0, rec.report); assert.equal(rec.state, 'already-present'); assert.deepEqual(await adm.all(), after, 'recovery wrote nothing to the database');
  assert.equal(JSON.parse(fs.readFileSync(path.join(b.dir, 'manifest.json'), 'utf8')).status, 'updated-recovered');
});

test('LOCAL STACK: a gym changed between the dry-run and the apply (or just before its PATCH) is refused and nothing is retired', { skip }, async () => {
  const e = env();
  // changed after the token was issued: the final re-check refuses
  const s1 = await retSetup('2026-02-02-local-retire-race');
  const dry1 = await runImport({ batchDir: s1.b.dir, indexDir: s1.indexDir, env: e });
  await adm.patch('seed-102', { notes: 'edited by a moderator' });
  const snap1 = JSON.stringify(await adm.all());
  const r1 = await runImport({ batchDir: s1.b.dir, indexDir: s1.indexDir, env: e, mode: 'apply', confirm: dry1.token });
  assert.equal(r1.exit, 2, r1.report); assert.equal(JSON.stringify(await adm.all()), snap1, 'nothing written');
  // changed after the final re-check, just before the PATCH of the first target: zero rows match, nothing retired
  const s2 = await retSetup('2026-02-02-local-retire-race2');
  const dry2 = await runImport({ batchDir: s2.b.dir, indexDir: s2.indexDir, env: e });
  const api = new T.Api(T.resolveTarget(e)), real = api.retireSpot.bind(api);
  api.retireSpot = async (u, g) => { if (u.id === 'seed-101') await adm.patch('seed-101', { notes: 'edited in the last millisecond' }); return real(u, g); };
  const r2 = await runImport({ batchDir: s2.b.dir, indexDir: s2.indexDir, env: e, mode: 'apply', confirm: dry2.token, api });
  assert.equal(r2.exit, 2, r2.report); assert.match(r2.report, /0 row\(s\) matched/);
  const rows = await adm.all();
  assert.equal(approvedCount(rows), PROD.length, 'no spot was retired'); assert.equal(rows.find(r => r.id === 'seed-101').notes, 'edited in the last millisecond');
  assert.equal(fs.existsSync(path.join(s2.b.dir, 'manifest.json')), false);
});

test('LOCAL STACK: a maintenance batch with an update and a retirement works; a batch mixing an insert with a retirement is refused and writes nothing', { skip }, async () => {
  const e = env();
  const s = await retSetup('2026-02-02-local-maintenance', ix => [updRec(ix, 'seed-100', { lat: -33.882, lng: 151.213 }), retRec(ix, 'seed-101')]);
  const dry = await runImport({ batchDir: s.b.dir, indexDir: s.indexDir, env: e });
  assert.equal(dry.exit, 0, dry.report); assert.match(dry.report, /Would update \(1 gyms/); assert.match(dry.report, /Would retire \(1 gyms/);
  const before = await adm.all();
  const ok = await runImport({ batchDir: s.b.dir, indexDir: s.indexDir, env: e, mode: 'apply', confirm: dry.token });
  assert.equal(ok.exit, 0, ok.report);
  const after = await adm.all(), now = id => after.find(r => r.id === id), was = id => before.find(r => r.id === id);
  assert.equal(now('seed-100').lat, -33.882); assert.equal(now('seed-100').status, 'approved'); assert.equal(now('seed-101').status, 'rejected');
  assert.equal(approvedCount(after), approvedCount(before) - 1);
  for (const id of ['seed-102', 'community-0f3a7c2e-1111-4222-8333-444455556666']) assert.deepEqual(now(id), was(id), id + ' untouched');
  const m = JSON.parse(fs.readFileSync(path.join(s.b.dir, 'manifest.json'), 'utf8'));
  assert.deepEqual(m.ids, ['seed-100', 'seed-101']); assert.deepEqual(m.retired, ['seed-101']); assert.equal(m.rows_updated, 1); assert.equal(m.rows_retired, 1);

  const x = await retSetup('2026-02-02-local-insert-retire', ix => [rec({ name: 'Brand New Gym', lat: -33.6, lng: 151.4 }), retRec(ix, 'seed-101')]);
  const snap = JSON.stringify(await adm.all());
  const r = await runImport({ batchDir: x.b.dir, indexDir: x.indexDir, env: e, mode: 'apply', confirm: 'x'.repeat(16) });
  assert.equal(r.exit, 2); assert.equal(r.kind, undefined, 'not handed to the updater'); assert.ok(failing(r).includes('insert-only'), failing(r).join());
  assert.equal(JSON.stringify(await adm.all()), snap, 'nothing written');
});

// ============================================ gym information (website, hours) against the real local database =================
const INFO_HOURS = { mon: '6am–10pm', tue: '6am–10pm', sat: '8am–6pm', sun: 'Closed' };
const infoRec = (index, id, set = { website: 'https://www.example.com/gym', hours: INFO_HOURS }) => ({ ...updRec(index, id, set), reason: 'website and hours from the official site (test)', source: 'https://www.example.com/gym (official site, test)' });
const INFO_TWO = ix => [infoRec(ix, 'seed-100'), infoRec(ix, 'seed-102', { website: 'https://example.org/' })];

test('LOCAL STACK: a real information fill writes exactly website/hours (hours as jsonb, other columns and gyms byte-identical), re-run writes nothing; an already-filled field is refused; a concurrent edit is refused', { skip }, async () => {
  const e = env();
  const s = await retSetup('2026-02-03-local-gym-info', INFO_TWO);
  const dry = await runImport({ batchDir: s.b.dir, indexDir: s.indexDir, env: e });
  assert.equal(dry.exit, 0, dry.report); assert.equal(dry.kind, 'update'); assert.equal(dry.coverage, 'FULL'); assert.equal(dry.state, 'fresh'); assert.match(dry.report, /Would fill gym information \(2 gyms/);
  const before = await adm.all();
  assert.equal(JSON.stringify(await adm.all()), JSON.stringify(before), 'the dry-run wrote nothing');
  const ok = await runImport({ batchDir: s.b.dir, indexDir: s.indexDir, env: e, mode: 'apply', confirm: dry.token });
  assert.equal(ok.exit, 0, ok.report); assert.deepEqual(ok.applied, ['seed-100', 'seed-102']);
  const after = await adm.all();
  const was = id => before.find(r => r.id === id), now = id => after.find(r => r.id === id);
  assert.equal(now('seed-100').website, 'https://www.example.com/gym'); assert.deepEqual(now('seed-100').hours, INFO_HOURS);
  assert.equal(now('seed-102').website, 'https://example.org/'); assert.equal(now('seed-102').hours, null, 'a website-only fill leaves hours empty');
  for (const id of ['seed-100', 'seed-102']) {
    assert.notEqual(now(id).updated_at, was(id).updated_at, 'the database records the edit time');
    for (const f of ['name', 'suburb', 'state', 'country', 'lat', 'lng', 'address', 'types', 'notes', 'photo', 'status', 'community', 'edited', 'created_at', 'slug', 'description', 'day_pass', 'facilities']) assert.deepEqual(now(id)[f], was(id)[f], id + ' unchanged: ' + f);
  }
  for (const id of ['seed-101', 'community-0f3a7c2e-1111-4222-8333-444455556666']) assert.deepEqual(now(id), was(id), id + ' is byte-identical, including updated_at');
  assert.equal(after.length, before.length);
  const m = JSON.parse(fs.readFileSync(path.join(s.b.dir, 'manifest.json'), 'utf8'));
  assert.equal(m.kind, 'update'); assert.equal(m.status, 'updated'); assert.equal(m.rows_updated, 0); assert.equal(m.rows_info_filled, 2); assert.deepEqual(m.info_filled.map(c => c.id), ['seed-100', 'seed-102']); assert.equal(m.verification.ok, true);
  const again = await runImport({ batchDir: s.b.dir, indexDir: s.indexDir, env: e, mode: 'apply', confirm: dry.token });
  assert.equal(again.exit, 0, again.report); assert.equal(again.state, 'already-updated'); assert.deepEqual(await adm.all(), after, 'the re-run wrote nothing');
  assert.equal((await runImport({ batchDir: s.b.dir, indexDir: s.indexDir, env: e, mode: 'verify' })).exit, 0);

  // fill-only: a field filled in production since the research (a community edit approved) is refused, nothing is written
  const s2 = await retSetup('2026-02-03-local-gym-info-filled', INFO_TWO);
  await adm.patch('seed-100', { website: 'https://community.example/' });
  const snap2 = JSON.stringify(await adm.all());
  const r2 = await runImport({ batchDir: s2.b.dir, indexDir: s2.indexDir, env: e });
  assert.equal(r2.exit, 2, r2.report); assert.ok(failing(r2).includes('fill-only: gym information already set in production'), failing(r2).join()); assert.match(r2.report, /seed-100 "[^"]+": website already has a value/);
  assert.equal(JSON.stringify(await adm.all()), snap2, 'nothing written');

  // a community edit lands after the dry-run (token already issued): the final re-check refuses, nothing is written
  const s3 = await retSetup('2026-02-03-local-gym-info-race', INFO_TWO);
  const dry3 = await runImport({ batchDir: s3.b.dir, indexDir: s3.indexDir, env: e });
  await adm.patch('seed-102', { website: 'https://community.example/' });
  const snap3 = JSON.stringify(await adm.all());
  const r3 = await runImport({ batchDir: s3.b.dir, indexDir: s3.indexDir, env: e, mode: 'apply', confirm: dry3.token });
  assert.equal(r3.exit, 2, r3.report); assert.equal(JSON.stringify(await adm.all()), snap3, 'nothing written');

  // an edit just before the PATCH of the first target: zero rows match (the updated_at pin), nothing is overwritten
  const s4 = await retSetup('2026-02-03-local-gym-info-race2', INFO_TWO);
  const dry4 = await runImport({ batchDir: s4.b.dir, indexDir: s4.indexDir, env: e });
  const api = new T.Api(T.resolveTarget(e)), real = api.updateSpotInfo.bind(api);
  api.updateSpotInfo = async (u, g) => { if (u.id === 'seed-100') await adm.patch('seed-100', { website: 'https://community.example/last-millisecond' }); return real(u, g); };
  const r4 = await runImport({ batchDir: s4.b.dir, indexDir: s4.indexDir, env: e, mode: 'apply', confirm: dry4.token, api });
  assert.equal(r4.exit, 2, r4.report); assert.match(r4.report, /0 row\(s\) matched/);
  const rows4 = await adm.all();
  assert.equal(rows4.find(r => r.id === 'seed-100').website, 'https://community.example/last-millisecond', 'not overwritten'); assert.equal(rows4.find(r => r.id === 'seed-100').hours, null);
  assert.equal(fs.existsSync(path.join(s4.b.dir, 'manifest.json')), false);
});
