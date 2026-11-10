// Migration 20261101000100 in the import pipeline: name_local / address_local on NEW gyms (insert path), the information-fill rules for the new fields
// (validate.js), the column preflight (target.js Api.missingColumns + importer.js), and that the content hash did not move.   node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const V = require('../scripts/lib/gym-import/validate');
const N = require('../scripts/lib/gym-import/normalize');
const P = require('../scripts/lib/gym-import/plan');
const S = require('../scripts/lib/gym-import/index-store');
const T = require('../scripts/lib/gym-import/target');
const R = require('../scripts/lib/gym-import/research');
const { runImport, toRow, diffRow } = require('../scripts/lib/gym-import/importer');
const { ROOT, tmp, PROD, makeBatch, rec } = require('./helpers/import-helpers');
const { prodRow, fakeJwt } = require('./helpers/local-stack');

const TRIO = { info_source: 'https://www.example.com/gym', info_source_kind: 'official-site', info_checked_on: '2026-11-02' };
const VISITOR = { booking: 'Book online for peak hours', payment: 'WeChat Pay and Alipay', english_help: 'Some staff speak English', id_required: 'Passport at the desk', shoe_hire: 'Yes, 20 RMB', note: 'Closed on public holidays' };
const upd = (set, over = {}) => ({ intent: 'update', id: 'seed-100', expect_h: '0123456789abcdef', reason: 'fill from the official site (test)', source: set.info_source || 'https://www.example.com/gym', set, ...over });
const errors = async (set, over) => (await V.validateUpdateRecord(upd(set, over))).errors;
const codes = async (set, over) => (await errors(set, over)).map(e => `${e.code}:${e.field}`);

test('valid fills: name_local, address_local and visitor+trio each validate; name_local/address_local/website/facilities need no trio', async () => {
  for (const set of [
    { name_local: '香蕉攀岩(凯德天府店)' }, { address_local: '天仁路388号天府凯德L5-15号' }, { name_local: '香蕉攀岩', address_local: '天仁路388号', website: 'https://www.example.com/', facilities: ['cafe'] },
    { visitor: VISITOR, ...TRIO }, { visitor: { note: 'x' }, ...TRIO }, { hours: { mon: '10:00-22:00' }, ...TRIO }, { day_pass: '68 RMB', ...TRIO, info_source_kind: 'official-social', info_source: 'https://www.xiaohongshu.com/user/profile/abc' },
    { name_local: 'x'.repeat(120) }, { address_local: '地'.repeat(300) }, { visitor: { booking: 'b'.repeat(160) }, ...TRIO },
    { visitor: VISITOR, hours: { mon: '10:00-22:00' }, day_pass: '68 RMB', name_local: 'N', ...TRIO },
  ]) assert.deepEqual(await errors(set, { source: set.info_source || 'https://www.example.com/gym' }), [], JSON.stringify(set).slice(0, 80));
});

test('invalid values are refused offline: lengths, control characters, untrimmed, wrong types, bad visitor keys/values', async () => {
  const bad = async (set, code, what) => { const c = await codes({ ...set }, { source: TRIO.info_source }); assert.ok(c.some(x => x.startsWith(code)), `${what}: ${c.join()}`); };
  await bad({ name_local: 'x'.repeat(121) }, 'too-long', 'name_local 121');
  await bad({ address_local: 'x'.repeat(301) }, 'too-long', 'address_local 301');
  for (const v of ['', ' x', 'x ', 'a\nb', 'a\tb', 'a\u0000b', 'a\u007fb', 'a\u0085b', null, 5, ['x']]) { await bad({ name_local: v }, v === 'a\nb' || v === 'a\tb' || v === 'a\u0000b' || v === 'a\u007fb' || v === 'a\u0085b' ? 'control-chars' : v === ' ' || v === ' x' || v === 'x ' ? 'untrimmed' : 'bad-local-text', 'name_local ' + JSON.stringify(v)); }
  await bad({ address_local: 'a\r\nb' }, 'control-chars', 'address_local line break');
  const w = visitor => ({ visitor, ...TRIO });
  await bad(w({}), 'bad-visitor', 'empty visitor'); await bad(w(['x']), 'bad-visitor', 'array'); await bad(w('x'), 'bad-visitor', 'string'); await bad(w(null), 'bad-visitor', 'null');
  await bad(w({ phone: '123' }), 'bad-visitor', 'unknown key'); await bad(w({ note: 5 }), 'bad-visitor', 'number'); await bad(w({ note: '' }), 'bad-visitor', 'empty value');
  await bad(w({ note: 'n'.repeat(161) }), 'bad-visitor', '161 chars'); await bad(w({ note: ' pad' }), 'bad-visitor', 'untrimmed'); await bad(w({ note: 'a\nb' }), 'bad-visitor', 'line break'); await bad(w({ note: { a: 1 } }), 'bad-visitor', 'nested');
  // the provenance values
  const t = over => ({ visitor: VISITOR, ...TRIO, ...over });
  await bad(t({ info_source_kind: 'map' }), 'bad-info-source-kind', 'map kind'); await bad(t({ info_source_kind: 'directory' }), 'bad-info-source-kind', 'directory kind');
  await bad(t({ info_source_kind: 'other' }), 'bad-info-source-kind', 'other kind'); await bad(t({ info_source_kind: null }), 'bad-info-source-kind', 'null kind');
  for (const u of ['http://www.example.com/gym', 'ftp://example.com/', 'www.example.com', 'https://', 'https://u:p@example.com/', 'https://exa mple.com/', 'javascript:alert(1)', 5]) await bad(t({ info_source: u }), 'bad-info-source', 'source ' + u);
  await bad(t({ info_source: 'https://example.com/' + 'a'.repeat(400) }), 'too-long', 'source > 400');
  for (const d of ['2026-13-01', '2026-02-30', '26-11-02', '2019-12-31', '2999-01-01', '', null, 20261102]) await bad(t({ info_checked_on: d }), 'bad-info-date', 'date ' + d);
  const tomorrow = new Date(Date.now() + 86400e3 * 2).toISOString().slice(0, 10); await bad(t({ info_checked_on: tomorrow }), 'bad-info-date', 'future date');
  await bad({ visitor: VISITOR, info_source: TRIO.info_source }, 'provenance-incomplete', 'partial trio');
  assert.deepEqual(await codes(t({ info_checked_on: '2020-01-01' }), { source: TRIO.info_source }), [], 'the DB minimum date is accepted');
});

test('the trio is required with hours / day_pass / visitor, all-or-none, and never alone', async () => {
  for (const f of [{ hours: { mon: '9-5' } }, { day_pass: '68 RMB' }, { visitor: { note: 'x' } }]) {
    const c = await codes(f); assert.ok(c.includes(`provenance-required:${Object.keys(f)[0]}`), JSON.stringify(f) + ' ' + c.join());
  }
  assert.ok((await codes({ ...TRIO })).some(c => c.startsWith('provenance-orphan')), 'a trio without hours/day_pass/visitor is refused');
  assert.ok((await codes({ website: 'https://example.com/', ...TRIO })).some(c => c.startsWith('provenance-orphan')), 'nor with website only');
  assert.ok((await codes({ hours: { mon: '9-5' }, info_source_kind: 'official-site' })).some(c => c.startsWith('provenance-incomplete')));
  for (const f of [{ name_local: 'N' }, { address_local: 'A' }, { website: 'https://example.com/' }, { facilities: ['cafe'] }, { notes: 'Temporarily closed.' }]) assert.deepEqual(await errors(f, { source: 'https://example.com/' }), [], JSON.stringify(f));
});

test('sources: maps, directories and review sites are refused for information; official-social needs a social host; official-site must not be one; source must equal info_source', async () => {
  const set = (info_source, info_source_kind = 'official-site') => ({ hours: { mon: '9-5' }, info_source, info_source_kind, info_checked_on: '2026-11-02' });
  const denied = ['https://www.amap.com/place/B0FFF', 'https://uri.amap.com/marker?position=1,2', 'https://www.dianping.com/shop/123', 'https://m.dianping.com/shop/1', 'https://www.google.com/maps/place/Gym', 'https://maps.google.com/?q=gym',
    'https://maps.app.goo.gl/abc', 'https://map.baidu.com/poi/x', 'https://www.openstreetmap.org/node/1', 'https://www.tripadvisor.com/Attraction-1', 'https://www.meituan.com/x'];
  for (const u of denied) for (const kind of ['official-site', 'official-social']) assert.ok((await codes(set(u, kind), { source: u })).some(c => c.startsWith('bad-info-source:info_source')), kind + ' ' + u);
  // also when only the record's free-text source names such a URL (a name_local fill has no trio)
  for (const u of ['https://www.amap.com/place/B0FFF', 'https://www.dianping.com/shop/123', 'https://www.google.com/maps/place/Gym']) assert.ok((await codes({ name_local: 'N' }, { source: `${u} (map listing)` })).includes('bad-source:source'), u);
  assert.deepEqual(await codes({ name_local: 'N' }, { source: 'https://www.google.com/search?q=gym' }), [], 'a non-map google URL is not a map');
  // kinds against hosts
  assert.deepEqual(await codes(set('https://www.xiaohongshu.com/user/profile/1', 'official-social'), { source: 'https://www.xiaohongshu.com/user/profile/1' }), []);
  assert.deepEqual(await codes(set('https://mp.weixin.qq.com/s/abc', 'official-social'), { source: 'https://mp.weixin.qq.com/s/abc' }), []);
  assert.deepEqual(await codes(set('https://www.instagram.com/gym/', 'official-social'), { source: 'https://www.instagram.com/gym/' }), []);
  assert.deepEqual(await codes(set('https://gym.example.cn/visit'), { source: 'https://gym.example.cn/visit' }), []);
  assert.ok((await codes(set('https://gym.example.cn/visit', 'official-social'), { source: 'https://gym.example.cn/visit' })).includes('bad-info-source:info_source'), 'official-social on a non-social host');
  assert.ok((await codes(set('https://www.xiaohongshu.com/user/profile/1'), { source: 'https://www.xiaohongshu.com/user/profile/1' })).includes('bad-info-source:info_source_kind'), 'official-site on a social platform');
  assert.ok((await codes(set('https://gym.example.cn/visit'), { source: 'https://gym.example.cn/other' })).includes('source-mismatch:source'), 'source differs from info_source');
  assert.ok((await codes(set('https://gym.example.cn/visit'), { source: undefined })).includes('bad-source:source') === false);
});

test('infoSetProblems (the write gate) applies the same rules to a hand-built set', async () => {
  assert.deepEqual(await V.infoSetProblems({ name_local: 'N', visitor: VISITOR, hours: { mon: '9-5' }, ...TRIO }), []);
  assert.ok((await V.infoSetProblems({ hours: { mon: '9-5' } }))[0].includes('info_source'));
  assert.ok((await V.infoSetProblems({ visitor: { phone: 'x' }, ...TRIO })).some(m => /unknown visitor key/.test(m)));
  assert.ok((await V.infoSetProblems({ hours: { mon: '9-5' }, ...TRIO, info_source: 'https://www.amap.com/x' })).some(m => /map \/ directory/.test(m)));
});

test('the validator limits equal the migration (no drift)', () => {
  const mig = fs.readFileSync(path.join(ROOT, 'supabase', 'migrations', '20261101000100_local_names_visitor_info.sql'), 'utf8');
  assert.equal(V.MIGRATION_LOCAL, '20261101000100');
  assert.equal(Number(/char_length\(btrim\(name_local\)\) between 1 and (\d+)/.exec(mig)[1]), V.INFO_LIMITS.name_local);
  assert.equal(Number(/char_length\(btrim\(address_local\)\) between 1 and (\d+)/.exec(mig)[1]), V.INFO_LIMITS.address_local);
  assert.equal(Number(/\^\.\{(\d+)\}/.exec(mig)[1]) - 1, V.INFO_LIMITS.visitor_value);
  assert.equal(Number(/char_length\(info_source\) <= (\d+)/.exec(mig)[1]), V.INFO_LIMITS.info_source);
  assert.deepEqual([...V.VISITOR_KEYS], /array\[([^\]]+)\]/.exec(mig)[1].split(',').map(x => x.trim().replace(/'/g, '')));
  assert.deepEqual([...V.INFO_SOURCE_KINDS], /info_source_kind in \(([^)]+)\)/.exec(mig)[1].split(',').map(x => x.trim().replace(/'/g, '')));
  assert.equal(/info_checked_on >= date '(\d{4}-\d{2}-\d{2})'/.exec(mig)[1], V.MIN_CHECKED_ON);
  for (const c of V.NEW_COLUMNS) assert.ok(new RegExp(`add column if not exists ${c}\\b`).test(mig), c);
});

// ---- new gyms: name_local / address_local reach the inserted row, the content hash does not move -----------------------------------------------------
test('insert records: optional name_local / address_local validate with the same limits; unknown keys are still refused', async () => {
  assert.deepEqual((await V.validateNewRecord(rec({ name_local: '香蕉攀岩', address_local: '天仁路388号' }))).errors, []);
  assert.deepEqual((await V.validateNewRecord(rec({ name_local: null, address_local: '' }))).errors, []);
  for (const over of [{ name_local: 'x'.repeat(121) }, { address_local: 'x'.repeat(301) }, { name_local: ' pad' }, { address_local: 'a\nb' }, { name_local: 5 }]) assert.ok((await V.validateNewRecord(rec(over))).errors.length, JSON.stringify(over));
  assert.ok((await V.validateNewRecord(rec({ visitor: { note: 'x' } }))).errors.some(e => e.code === 'unknown-field'), 'visitor is a fill, not a new-gym field');
});

test('contentHash is byte-for-byte unchanged by name_local / address_local / visitor / provenance; the index format has no new field', () => {
  const g = { name: 'Summit Lab', suburb: 'Newtown', state: 'NSW', country: 'AU', lat: -33.897, lng: 151.179, address: '1 King St', types: ['indoor-bouldering'], notes: 'n', photo: null };
  const base = N.contentHash(g);
  assert.equal(N.contentHash({ ...g, name_local: '香蕉攀岩', address_local: '天仁路388号', visitor: VISITOR, ...TRIO }), base);
  assert.equal(S.toEntry({ id: 'x', ...g, name_local: 'n', visitor: VISITOR, ...TRIO }).h, S.toEntry({ id: 'x', ...g }).h);
  assert.ok(!S.FIELDS.some(f => ['name_local', 'address_local', 'visitor', 'info_source', 'info_source_kind', 'info_checked_on'].includes(f)), 'index-store FIELDS unchanged');
  assert.equal(JSON.stringify(S.toEntry({ id: 'x', ...g, name_local: 'n' })), JSON.stringify(S.toEntry({ id: 'x', ...g })));
});

test('toRow: name_local / address_local appear only when the record has them (payloads and tokens of other batches are unchanged); diffRow compares them', async () => {
  const safe = (await V.deps()).safeUrl;
  const plain = toRow({ id: 'g-0123456789', ...rec() }, safe);
  assert.ok(!('name_local' in plain) && !('address_local' in plain));
  assert.deepEqual(Object.keys(plain), ['id', 'name', 'suburb', 'state', 'country', 'lat', 'lng', 'types', 'notes', 'photo', 'address', 'community', 'edited', 'status']);
  const withLocal = toRow({ id: 'g-0123456789', ...rec({ name_local: '香蕉攀岩', address_local: '天仁路388号' }) }, safe);
  assert.equal(withLocal.name_local, '香蕉攀岩'); assert.equal(withLocal.address_local, '天仁路388号');
  assert.equal(withLocal.community, false); assert.equal(withLocal.status, 'approved');
  const db = { ...withLocal, submitted_by: null };
  assert.deepEqual(diffRow(withLocal, db), []);
  assert.deepEqual(diffRow(withLocal, { ...db, name_local: null }), ['name_local']);
  assert.deepEqual(diffRow(withLocal, { ...db, address_local: 'x' }), ['address_local']);
  assert.deepEqual(diffRow(plain, { ...plain, name_local: 'anything', submitted_by: null }), [], 'a row staged without them is not compared on them');
});

test('research: a candidate\'s name_local / address_local become import-record fields only when present', () => {
  const c = { cid: 'x-one', name: 'N', suburb: 'S', state: 'NSW', country: 'AU', lat: 1, lng: 2, types: ['indoor-bouldering'], address: null, notes: null, photo: null };
  const a = R.toImportRecord(c, '2026-11-01-x');
  assert.ok(!('name_local' in a) && !('address_local' in a));
  const b = R.toImportRecord({ ...c, name_local: '本地名', address_local: '本地址' }, '2026-11-01-x');
  assert.equal(b.name_local, '本地名'); assert.equal(b.address_local, '本地址');
  assert.deepEqual({ ...b, name_local: undefined, address_local: undefined }, { ...a, name_local: undefined, address_local: undefined });
});

// ---- Api.missingColumns --------------------------------------------------------------------------------------------------------------------------
test('Api.missingColumns: [] when readable; the missing ones when PostgREST answers 400; any other failure throws (never read as "present")', async () => {
  const mk = handler => { const api = new T.Api({ url: 'https://example.supabase.co', serviceKey: 'service-key-xxxxxxxx', anonKey: 'anon-key-xxxxxxxx' }); const sent = []; api._send = async (m, q, o) => { sent.push({ m, q, o }); return handler(q); }; return { api, sent }; };
  const ok = mk(() => ({ ok: true, status: 200, json: [] }));
  assert.deepEqual(await ok.api.missingColumns(['name_local', 'visitor']), []);
  assert.deepEqual(ok.sent.map(x => [x.m, x.q]), [['GET', '/rest/v1/spots?select=name_local,visitor&limit=1']], 'one read-only GET');
  const some = mk(q => (/select=[^&]*address_local/.test(q) ? { ok: false, status: 400, json: { code: '42703' } } : { ok: true, status: 200, json: [] }));
  assert.deepEqual(await some.api.missingColumns(['name_local', 'address_local', 'visitor']), ['address_local']);
  assert.ok(some.sent.every(x => x.m === 'GET'), 'only reads');
  assert.deepEqual(await mk(() => ({ ok: false, status: 400, json: {} })).api.missingColumns(['a', 'b']), ['a', 'b']);
  await assert.rejects(mk(() => ({ ok: false, status: 401, json: {} })).api.missingColumns(['a']), /HTTP 401/);
  await assert.rejects(mk(() => ({ ok: false, status: 503, json: {} })).api.missingColumns(['a']), /HTTP 503/);
  await assert.rejects(mk(q => (q.includes('select=a,b') ? { ok: false, status: 400 } : { ok: true, status: 200 })).api.missingColumns(['a', 'b']), /individually readable/);
});

// ---- insert path against a fake production -----------------------------------------------------------------------------------------------------------
function fakeProd(approved, { missing = [] } = {}) {
  const state = { approved: approved.map(r => ({ ...r })), inserts: [], columnChecks: [], log: [] };
  const api = {
    async probe() { return { ok: true, status: 200 }; },
    async missingColumns(cols) { state.columnChecks.push(cols); return missing.filter(c => cols.includes(c)); },
    async getAll(q) {
      if (q.includes('status=eq.approved')) return state.approved.map(r => ({ ...r }));
      if (q.includes('status=eq.pending')) return [];
      if (/id=in\./.test(q)) { const ids = /id=in\.\(([^)]*)\)/.exec(q)[1].split(','); return state.approved.filter(r => ids.includes(r.id)).map(r => ({ ...r })); }
      throw new Error('unexpected query ' + q);
    },
    async insertSpots(rows, gate) { assert.ok(gate && gate.rows === rows); state.log.push('INSERT'); state.inserts.push(rows); rows.forEach(r => state.approved.push({ ...r, created_at: 'x', updated_at: 'x', submitted_by: null })); return { ok: true, status: 201, text: '' }; },
  };
  return { api, state };
}
async function insertWorld(records, opts) {
  const root = tmp();
  fs.mkdirSync(path.join(root, 'js'), { recursive: true }); fs.mkdirSync(path.join(root, 'import', 'batches'), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'js', 'supabase-init.js'), path.join(root, 'js', 'supabase-init.js'));
  const approved = PROD.map(r => prodRow({ ...r, created_at: 'x', updated_at: 'x', submitted_by: null }));
  S.write(approved, path.join(root, 'import', 'index'), { source: 'fake production' });
  const b = makeBatch(records, { id: '2026-11-03-local-names', root: path.join(root, 'import', 'batches') });
  const index = S.load(path.join(root, 'import', 'index'));
  let plan = await P.planBatch({ dir: b.dir, index }); P.freezeIds(b.dir, plan); plan = await P.planBatch({ dir: b.dir, index });
  fs.writeFileSync(path.join(b.dir, 'plan.json'), JSON.stringify(plan, null, 1) + '\n');
  const prod = T.productionConfig(root), key = fakeJwt({ role: 'service_role', ref: prod.ref, exp: 4102444800 });
  const fake = fakeProd(approved, opts);
  return { b, plan, fake, base: { batchDir: b.dir, root, env: { SUPABASE_URL: prod.url, SUPABASE_SERVICE_ROLE_KEY: key }, api: fake.api } };
}
const NEW2 = () => [rec({ name: 'Summit Lab', suburb: 'Newtown', lat: -33.897, lng: 151.179, name_local: '山顶实验室', address_local: '金山路1号' }), rec({ name: 'Yarra Vertical', suburb: 'Richmond', state: 'VIC', lat: -37.82, lng: 145.0 })];

test('insert path: a record with name_local / address_local validates, plans as new, and the inserted row carries them (the other row does not)', async () => {
  const w = await insertWorld(NEW2());
  assert.equal(w.plan.importable, true, w.plan.blockers.join()); assert.equal(w.plan.counts.new, 2);
  const dry = await runImport({ ...w.base });
  assert.equal(dry.exit, 0, dry.report);
  assert.ok(dry.checks.some(c => c.status === 'PASS' && c.name === 'migration 20261101000100 applied'), 'the dry-run reports the column check');
  assert.deepEqual(w.fake.state.columnChecks, [['name_local', 'address_local']], 'only the columns this batch writes are checked');
  const ok = await runImport({ ...w.base, mode: 'apply', confirm: dry.token, productionFlag: true });
  assert.equal(ok.exit, 0, ok.report);
  const rows = w.fake.state.inserts[0];
  const a = rows.find(r => r.name === 'Summit Lab'), b = rows.find(r => r.name === 'Yarra Vertical');
  assert.equal(a.name_local, '山顶实验室'); assert.equal(a.address_local, '金山路1号'); assert.ok(!('name_local' in b));
  assert.equal(a.community, false); assert.equal(a.status, 'approved');
  assert.ok(ok.checks.some(c => c.name === 'post-import verification' && c.status === 'PASS'), ok.report);
});

test('insert preflight: migration not applied -> refused with a clear message before anything is written; a batch without the fields never asks', async () => {
  const w = await insertWorld(NEW2(), { missing: ['name_local', 'address_local'] });
  const dry = await runImport({ ...w.base });
  assert.equal(dry.exit, 2); const f = dry.checks.find(c => c.status === 'FAIL');
  assert.equal(f.name, 'migration 20261101000100 applied'); assert.match(f.detail, /migration 20261101000100 not applied: production has no column name_local, address_local/); assert.match(dry.report, /migration 20261101000100 not applied/);
  assert.equal(dry.token, null);
  const ap = await runImport({ ...w.base, mode: 'apply', confirm: 'deadbeef00000000', productionFlag: true });
  assert.equal(ap.exit, 2); assert.equal(w.fake.state.inserts.length, 0, 'nothing inserted'); assert.deepEqual(w.fake.state.log, []);
  const plainW = await insertWorld([rec({ name: 'Plain Gym', suburb: 'Newtown', lat: -33.897, lng: 151.179 })], { missing: ['name_local'] });
  const d2 = await runImport({ ...plainW.base });
  assert.equal(d2.exit, 0, d2.report); assert.deepEqual(plainW.fake.state.columnChecks, [], 'no new column used: no check, behaviour unchanged');
});
