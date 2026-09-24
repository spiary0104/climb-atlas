// Unit tests for the import pipeline's building blocks (validation, matching thresholds, hashing, index format) and its
// production boundary (static + CLI).   node --test "tests/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const V = require('../scripts/lib/gym-import/validate');
const M = require('../scripts/lib/gym-import/match');
const N = require('../scripts/lib/gym-import/normalize');
const S = require('../scripts/lib/gym-import/index-store');
const { ROOT, rec, makeBatch, makeIndex, tmp } = require('./helpers/import-helpers');

const codes = r => r.errors.map(e => e.code);

test('validation: a good record passes; every required field is checked with a specific code', async () => {
  const ok = await V.validateNewRecord(rec());
  assert.deepEqual(ok.errors, []);
  for (const [field, val, code] of [['name', '', 'required'], ['suburb', ' ', 'required'], ['state', null, 'required'], ['country', 'au', 'bad-country'], ['lat', '5', 'bad-coordinate'], ['lng', 181, 'bad-coordinate'], ['lat', NaN, 'bad-coordinate'], ['types', [], 'bad-types'], ['types', ['x'], 'bad-types'], ['types', ['top-rope', 'top-rope'], 'bad-types'], ['name', 'x'.repeat(201), 'too-long'], ['notes', 'x'.repeat(4001), 'too-long'], ['name', 'a\u0000b', 'control-chars'], ['name', ' padded', 'untrimmed'], ['address', 5, 'bad-text']]) {
    const r = await V.validateNewRecord(rec({ [field]: val }));
    assert.ok(codes(r).includes(code), `${field}=${JSON.stringify(val)} should give ${code}, got ${codes(r)}`);
    assert.ok(r.errors.every(e => e.message.length > 10), 'messages are descriptive');
  }
  assert.ok(codes(await V.validateNewRecord(rec({ lat: 0, lng: 0 }))).includes('bad-coordinate'));
});

test('validation: photo must be a plain http(s) URL (same rule as the app: safeUrl)', async () => {
  for (const bad of ['javascript:alert(1)', 'JAVASCRIPT:alert(1)', 'data:text/html,x', '//evil.example/x.png', 'ftp://x.example/a', 'https://user:pw@x.example/a', 'not a url', 'https://x"onerror="alert(1)']) assert.ok(codes(await V.validateNewRecord(rec({ photo: bad }))).includes('unsafe-photo'), bad);
  for (const good of [null, '', 'https://example.com/a.jpg', 'http://example.com/a.png?x=1']) assert.deepEqual((await V.validateNewRecord(rec({ photo: good }))).errors, [], String(good));
});

test('validation: types allow-list equals the app\'s TYPE_LABELS; states come from regions.js; unknown countries warn', async () => {
  globalThis.window = globalThis.window || {}; globalThis.window.matchMedia = () => ({ matches: false });
  const { TYPE_LABELS } = await import('../js/modules/constants.js');
  assert.deepEqual([...V.TYPES].sort(), Object.keys(TYPE_LABELS).sort());
  assert.ok(codes(await V.validateNewRecord(rec({ state: 'ZZ' }))).includes('bad-state'));
  const unknown = await V.validateNewRecord(rec({ country: 'XX', state: 'Y' }));
  assert.deepEqual(unknown.errors, []); assert.ok(unknown.warnings.some(w => w.code === 'unsupported-country'));
});

test('matching thresholds (one table, exercised at each boundary)', () => {
  const base = { name: 'Alpha Climbing', country: 'AU', state: 'NSW', suburb: 'S', lat: -33, lng: 151, address: null };
  const ADDR = '10 Long Street Sydney';
  const at = (m, over = {}) => ({ ...base, ...over, lat: base.lat + m / 111195 });   // ~m metres north
  const tier = (r, e = base) => { const p = M.evaluatePair(r, e); return p && p.tier + ':' + p.reason; };
  assert.equal(tier(at(900)), 'existing:same-name');
  assert.equal(tier(at(1100)), 'probable:same-name-but-pin-differs');
  assert.equal(tier(at(14000)), 'probable:same-name-but-pin-differs');
  assert.equal(tier(at(20000)), 'probable:same-name-same-suburb-far-pin');      // same suburb+state: still reviewed at any distance
  assert.equal(tier(at(20000, { suburb: 'Elsewhere' })), null);                 // same name, other suburb, 20 km: a different gym
  assert.equal(tier(at(50, { name: 'Alpha Climbing Reloaded' })), 'probable:renamed-or-related-name-nearby');
  assert.equal(tier(at(300, { name: 'Alpha Climbing Reloaded' })), null);
  assert.equal(tier(at(40, { name: 'Zed' })), 'probable:co-located');
  assert.equal(tier(at(80, { name: 'Zed' })), null);
  assert.equal(tier(at(400, { name: 'Zed', address: ADDR }), { ...base, name: 'Other', address: ADDR }), 'probable:same-address-different-name');
  assert.equal(tier(at(5000, { name: 'Alpha Rock', address: '10, Long street, Sydney' }), { ...base, address: ADDR }), 'existing:same-address-related-name');
  assert.equal(tier(at(0, { country: 'NZ' })), null, 'never across countries');
  assert.equal(tier(at(0, { name: 'ALPHA  climbing!' })), 'existing:same-name', 'case/punctuation-insensitive');
  assert.equal(tier(at(0, { name: 'Alpha Climbing (アルファ)' })), 'existing:same-name', 'parenthetical translations are ignored');
});

test('ambiguity: several same-name gyms nearby are never auto-picked unless one is clearly closest', () => {
  const c = (id, d) => ({ id, name: 'X', tier: 'existing', reason: 'same-name', dist_m: d });
  assert.equal(M.pickExisting([c('a', 10)]).match.id, 'a');
  assert.equal(M.pickExisting([c('a', 10), c('b', 900)]).match.id, 'a');
  assert.equal(M.pickExisting([c('a', 100), c('b', 200)]).match, null);
});

test('hashing and ids: normalisation parity, content hash sensitivity, id collision extension', () => {
  assert.equal(N.n1('Alé Climbing (알레) Hyehwa!'), 'ale climbing hyehwa');
  const g = { name: 'A', suburb: 'B', state: 'X', country: 'AU', lat: 1, lng: 2, types: ['top-rope', 'indoor-bouldering'], address: null, notes: null, photo: null };
  assert.equal(N.contentHash(g), N.contentHash({ ...g, types: ['indoor-bouldering', 'top-rope'], address: '', notes: '  ' }), 'type order and empty/null are not changes');
  for (const f of ['name', 'notes', 'photo', 'address', 'lat']) assert.notEqual(N.contentHash(g), N.contentHash({ ...g, [f]: f === 'lat' ? 1.5 : 'changed' }), f);
  const id1 = N.deriveId(g, new Set());
  assert.match(id1, /^g-[0-9a-f]{10}$/);
  assert.equal(N.deriveId(g, new Set([id1])).length, 14, 'collision extends by two hex chars');
  assert.equal(N.deriveId({ ...g, lat: 1.00001 }, new Set()), id1, 'ids use 4-decimal coordinates so tiny pin tweaks do not matter');
});

test('index format: deterministic, sorted, only match fields, no notes/photo, rebuild is byte-identical', () => {
  const rows = require('./helpers/import-helpers').PROD;
  const a = S.serialize(rows), b = S.serialize([...rows].reverse());
  assert.equal(a, b);
  const first = JSON.parse(a.split('\n')[0]);
  assert.deepEqual(Object.keys(first), S.FIELDS);
  assert.ok(!a.includes('Friendly'), 'notes must not be copied into the index');
  const idx = makeIndex(); assert.equal(idx.metaMatches, true);
});

test('CLI: validate exit codes, plan exit codes, and import usage errors (no network)', () => {
  const run = (...args) => cp.spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'gym-import.js'), ...args], { encoding: 'utf8' });
  const good = makeBatch([rec()]), bad = makeBatch([rec({ name: '' })], { id: '2026-01-02-bad' });
  const v1 = run('validate', good.dir); assert.equal(v1.status, 0, v1.stdout + v1.stderr); assert.match(v1.stdout, /Schema OK/);
  const v2 = run('validate', bad.dir); assert.equal(v2.status, 1); assert.match(v2.stdout, /ERROR required \(name\)/);
  assert.equal(run('import').status, 1, 'import needs an explicit batch');
  const both = run('import', good.dir, '--apply', '--dry-run', '--i-understand-this-writes-to-production'); assert.equal(both.status, 1); assert.match(both.stderr, /only one of/);
  const idx = tmp(); S.write(require('./helpers/import-helpers').PROD, idx, {});
  const pl = run('plan', good.dir, '--index', idx); assert.equal(pl.status, 2, pl.stdout + pl.stderr);   // new ids not frozen yet -> not importable
  assert.ok(fs.existsSync(path.join(good.dir, 'plan.json')) && fs.existsSync(path.join(good.dir, 'report.md')));
  assert.equal(run('freeze-ids', good.dir, '--index', idx).status, 0);
  const pl2 = run('plan', good.dir, '--index', idx); assert.equal(pl2.status, 0, pl2.stdout + pl2.stderr);
  const bytes = fs.readFileSync(path.join(good.dir, 'plan.json'));
  run('plan', good.dir, '--index', idx); assert.ok(fs.readFileSync(path.join(good.dir, 'plan.json')).equals(bytes), 'plan.json is byte-identical on rerun');
});

test('production boundary: writes exist only in the gated importer; everything else is read-only (static check)', () => {
  const dir = path.join(ROOT, 'scripts', 'lib', 'gym-import');
  const files = ['scripts/gym-import.js', ...fs.readdirSync(dir).map(f => 'scripts/lib/gym-import/' + f)];
  const IMPORTER = ['scripts/lib/gym-import/target.js', 'scripts/lib/gym-import/importer.js'];
  for (const f of files) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
    assert.ok(!/method:\s*['"](POST|PATCH|PUT|DELETE)/i.test(src), f + ': non-GET HTTP method');
    assert.ok(!/\.(insert|upsert|update|delete|rpc)\(/.test(src.replace(/\.update\(seed\)|\.update\(payload\)|\.update\(buf\)|\.update\(JSON|\.update\(s\)/g, '')), f + ': supabase-js write call');
    // the CLI may name the env var (only to redact it from error text); it must not use it, and nothing else may mention privileged access
    if (f === 'scripts/gym-import.js') assert.ok(!/service_role|createClient|psql|db push|migration repair|_send\('POST'|insertSpots/i.test(src.replace('process.env.SUPABASE_SERVICE_ROLE_KEY', '')) && (src.match(/SUPABASE_SERVICE_ROLE_KEY/g) || []).length === 1 && /redact\(e\.message, \[process\.env\.SUPABASE_SERVICE_ROLE_KEY/.test(src), f + ': privileged access');
    else if (!IMPORTER.includes(f)) assert.ok(!/service_role|SUPABASE_SERVICE|createClient|psql|db push|migration repair|_send\('POST'|insertSpots/i.test(src), f + ': privileged access');
    else assert.ok(!/createClient|psql|db push|migration repair/i.test(src), f + ': privileged access');
    assert.ok(!/child_process|execSync|spawn\(/.test(src), f + ': shells out');
  }
  // network: only the index fetch and the importer's HTTP client; the single write lives in target.js
  const net = files.filter(f => /\bfetch\(/.test(fs.readFileSync(path.join(ROOT, f), 'utf8'))).sort();
  assert.deepEqual(net, ['scripts/lib/gym-import/index-store.js', 'scripts/lib/gym-import/target.js']);
  assert.match(fs.readFileSync(path.join(ROOT, 'scripts/lib/gym-import/index-store.js'), 'utf8'), /method: 'GET'/);
});
