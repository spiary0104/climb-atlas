// Behavioural tests for sw.js: loads the real service-worker source in a sandbox with a fake Cache Storage and fake network,
// dispatches fetch/activate events, and checks what is (not) cached.   node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
const SB = 'https://abcdefghij.supabase.co';
const ANON = 'sb_publishable_anon';

function makeWorker() {
  const listeners = {};
  const stores = new Map();                       // cache name -> Map(url -> Response)
  const puts = [];                                // every cache.put, for assertions
  const net = { calls: [], impl: async () => new Response('[]', { status: 200 }) };
  const cacheApi = async (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const m = stores.get(name);
    return {
      match: async (req) => { const r = m.get(typeof req === 'string' ? req : req.url); return r ? r.clone() : undefined; },
      put: async (req, res) => { puts.push({ cache: name, url: req.url }); m.set(req.url, res); },
      delete: async (req) => m.delete(typeof req === 'string' ? req : req.url),
      keys: async () => [...m.keys()].map((u) => new Request(u)),
      addAll: async () => {},
    };
  };
  const caches = {
    open: cacheApi,
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
  };
  const ctx = {
    self: { addEventListener: (t, f) => { listeners[t] = f; }, location: { origin: 'https://climbatlas.org' }, skipWaiting() {}, clients: { claim: async () => {} } },
    caches, Response, Request, URL, console,
    fetch: async (req) => { net.calls.push(req.url); return net.impl(req); },
  };
  vm.createContext(ctx);
  vm.runInContext(SRC, ctx);
  const dispatchFetch = async (request) => {
    const evt = { request, responded: null, respondWith(p) { this.responded = Promise.resolve(p); } };
    listeners.fetch(evt);
    return evt;
  };
  const activate = async () => { let p; listeners.activate({ waitUntil: (x) => { p = x; } }); await p; };
  return { ctx, stores, puts, net, dispatchFetch, activate, listeners };
}
const get = (url, headers) => new Request(url, { method: 'GET', headers });

const PRIVATE_READS = [
  `${SB}/rest/v1/marks?select=spot_id%2Cmark_type&user_id=eq.11111111-1111-1111-1111-111111111111`,
  `${SB}/rest/v1/sessions?select=*%2Csession_climbs%28*%29&user_id=eq.11111111-1111-1111-1111-111111111111&order=session_date.desc`,
  `${SB}/rest/v1/session_climbs?select=*`,
  `${SB}/rest/v1/moderators?select=user_id&user_id=eq.11111111-1111-1111-1111-111111111111`,
  `${SB}/rest/v1/pending_edits?select=*`,
  `${SB}/rest/v1/reports?select=*`,
  `${SB}/rest/v1/spots?select=*&status=eq.pending`,                                   // moderator's queue
  `${SB}/rest/v1/spots?select=id&submitted_by=eq.11111111-1111-1111-1111-111111111111&created_at=gte.2026-09-01`,
  `${SB}/rest/v1/spots?select=*&status=eq.approved&submitted_by=eq.11111111-1111-1111-1111-111111111111`,
  `${SB}/rest/v1/spots?select=*`,                                                     // no status filter => includes own/pending rows for some users
  `${SB}/rest/v1/routes?select=*`,
  `${SB}/rest/v1/rpc/recent_submission_count`,
  `${SB}/auth/v1/user`,
  `${SB}/auth/v1/session`,
  `${SB}/storage/v1/object/private/x`,
  `${SB}/rest/v1/spots_evil?status=eq.approved`,
  `${SB}/rest/v1/spots/../marks?status=eq.approved`,
];
const PUBLIC_SPOTS = `${SB}/rest/v1/spots?select=*&status=eq.approved&order=id&offset=0&limit=1000`;

test('private Supabase responses are never intercepted or cached (marks, sessions, moderator queues, own submissions, auth, ...)', async () => {
  const w = makeWorker();
  w.net.impl = async () => new Response('[{"secret":"private-row"}]', { status: 200 });
  for (const url of PRIVATE_READS) {
    const evt = await w.dispatchFetch(get(url, { Authorization: 'Bearer user-jwt-of-A', apikey: ANON }));
    assert.equal(evt.responded, null, 'worker took over a private request: ' + url);
  }
  assert.equal(w.puts.length, 0, 'something was written to Cache Storage: ' + JSON.stringify(w.puts));
  assert.equal([...w.stores.values()].reduce((n, m) => n + m.size, 0), 0);
});

test('no cross-user leak: a private response fetched as user A is not available to user B, online or offline', async () => {
  const w = makeWorker();
  const url = `${SB}/rest/v1/spots?select=*&status=eq.pending`;
  // A (moderator) loads the queue while online: worker must not touch it
  w.net.impl = async () => new Response('[{"id":"pending-1","name":"only for moderators"}]', { status: 200 });
  const a = await w.dispatchFetch(get(url, { Authorization: 'Bearer moderator-jwt' }));
  assert.equal(a.responded, null);
  // later: offline, different user (or signed out) asks for the same URL
  w.net.impl = async () => { throw new TypeError('offline'); };
  const b = await w.dispatchFetch(get(url, { Authorization: 'Bearer user-B-jwt' }));
  assert.equal(b.responded, null, 'worker would have answered from a cache');
  assert.equal(w.puts.length, 0);
});

test('non-GET requests (spot submissions, marks, edits, reports, deletes) are never intercepted', async () => {
  const w = makeWorker();
  for (const method of ['POST', 'PATCH', 'PUT', 'DELETE']) {
    const evt = await w.dispatchFetch(new Request(PUBLIC_SPOTS, { method, body: method === 'DELETE' ? undefined : '{}' }));
    assert.equal(evt.responded, null, method);
  }
  assert.equal(w.puts.length, 0);
});

test('the public approved-spots read IS cached network-first and still works offline (existing behaviour preserved)', async () => {
  const w = makeWorker();
  w.net.impl = async () => new Response('[{"id":"seed-1","name":"Public Gym"}]', { status: 200, headers: { 'Content-Type': 'application/json' } });
  const online = await w.dispatchFetch(get(PUBLIC_SPOTS, { apikey: ANON }));
  assert.ok(online.responded, 'public read not handled');
  assert.match(await (await online.responded).text(), /Public Gym/);
  assert.deepEqual(w.puts.map((p) => p.cache), ['climbatlas-data-v5']);
  // offline: network throws, cached public copy is served
  w.net.impl = async () => { throw new TypeError('offline'); };
  const offline = await w.dispatchFetch(get(PUBLIC_SPOTS, { apikey: ANON }));
  assert.match(await (await offline.responded).text(), /Public Gym/);
  // the same public URL requested by a signed-in user is the same public data: still fine
  const signedIn = await w.dispatchFetch(get(PUBLIC_SPOTS, { apikey: ANON, Authorization: 'Bearer user-jwt' }));
  assert.ok(signedIn.responded);
});

test('a Supabase response that declares itself private / no-store is not stored even on the public URL', async () => {
  for (const cc of ['private', 'no-store', 'private, max-age=0', 'public, no-store']) {
    const w = makeWorker();
    w.net.impl = async () => new Response('[]', { status: 200, headers: { 'Cache-Control': cc } });
    const evt = await w.dispatchFetch(get(PUBLIC_SPOTS));
    await evt.responded;
    assert.equal(w.puts.length, 0, cc);
  }
  const w = makeWorker();
  w.net.impl = async () => new Response('err', { status: 500 });
  await (await w.dispatchFetch(get(PUBLIC_SPOTS))).responded;
  assert.equal(w.puts.length, 0, 'error responses are not stored');
});

test('activation deletes the old v4 data cache and any non-public entry left in the current data cache', async () => {
  const w = makeWorker();
  const old = await w.ctx.caches.open('climbatlas-data-v4');                   // what the previous worker left behind
  await old.put(new Request(`${SB}/rest/v1/marks?select=*`), new Response('[{"private":1}]'));
  const cur = await w.ctx.caches.open('climbatlas-data-v5');
  await cur.put(new Request(`${SB}/rest/v1/sessions?select=*`), new Response('[{"private":2}]'));
  await cur.put(new Request(PUBLIC_SPOTS), new Response('[{"public":3}]'));
  await w.activate();
  assert.equal(w.stores.has('climbatlas-data-v4'), false, 'old data cache still present');
  const remaining = [...w.stores.get('climbatlas-data-v5').keys()];
  assert.deepEqual(remaining, [PUBLIC_SPOTS]);
});

test('static/shared caching is unchanged: app shell stale-while-revalidate, tiles cache-first, CDN + Google Fonts (Cache-Control: private) cached', async () => {
  const w = makeWorker();
  w.net.impl = async (req) => new Response('body:' + req.url, { status: 200, headers: req.url.includes('fonts.googleapis.com') ? { 'Cache-Control': 'private, max-age=86400' } : {} });
  for (const url of ['https://climbatlas.org/index.html', 'https://climbatlas.org/js/main.js']) {
    const e = await w.dispatchFetch(get(url)); await e.responded;
  }
  const tile = await w.dispatchFetch(get('https://basemaps.cartocdn.com/dark_all/3/1/2.png')); await tile.responded;
  const cdn = await w.dispatchFetch(get('https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js')); await cdn.responded;
  const font = await w.dispatchFetch(get('https://fonts.googleapis.com/css2?family=Inter')); await font.responded;
  const bySrc = Object.fromEntries(w.puts.map((p) => [new URL(p.url).hostname + new URL(p.url).pathname, p.cache]));
  assert.equal(bySrc['climbatlas.org/index.html'], 'climbatlas-shell-v5');
  assert.equal(bySrc['basemaps.cartocdn.com/dark_all/3/1/2.png'], 'climbatlas-tiles-v5');
  assert.equal(bySrc['unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js'], 'climbatlas-runtime-v5');
  assert.equal(bySrc['fonts.googleapis.com/css2'], 'climbatlas-runtime-v5');
  // second tile request is served from cache without touching the network
  const before = w.net.calls.length;
  const again = await w.dispatchFetch(get('https://basemaps.cartocdn.com/dark_all/3/1/2.png')); await again.responded;
  assert.equal(w.net.calls.length, before);
});

test('precache list: every listed file exists on disk and includes the new safety modules', () => {
  const m = /const SHELL_FILES = \[([\s\S]*?)\];/.exec(SRC);
  const files = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]).filter((f) => f !== './');
  for (const f of files) assert.ok(fs.existsSync(path.join(ROOT, f)), 'missing precache file: ' + f);
  for (const f of ['js/modules/html-safe.js', 'js/modules/popup-html.js', 'js/modules/moderation-html.js']) assert.ok(files.includes(f), 'not precached: ' + f);
  // every module the app imports is precached, so the shell still boots offline
  const modDir = path.join(ROOT, 'js', 'modules');
  for (const f of fs.readdirSync(modDir).filter((n) => n.endsWith('.js'))) assert.ok(files.includes('js/modules/' + f), 'app module not precached: ' + f);
});
