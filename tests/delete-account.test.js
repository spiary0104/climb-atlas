// Delete account: the Edge Function handler (supabase/functions/delete-account/handler.js, run here in Node with fake
// Supabase calls, no network) and the Me page control.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
globalThis.window = globalThis.window || {};
globalThis.window.matchMedia = globalThis.window.matchMedia || (() => ({ matches: false }));   // constants.js reads it at import

let H;
test.before(async () => { H = await import('../supabase/functions/delete-account/handler.js'); });

const req = (method, headers = {}) => new Request('https://x.supabase.co/functions/v1/delete-account', { method, headers });
function fakes({ user = { id: 'u-1' }, getError = null, delError = null } = {}){
  const calls = { getUser: [], deleteUser: [] };
  return { calls, deps: {
    getUser: async jwt => { calls.getUser.push(jwt); return getError ? { user: null, error: getError } : { user, error: null }; },
    deleteUser: async id => { calls.deleteUser.push(id); return { error: delError }; },
  } };
}

test('delete-account: clearDeviceData removes bouldeer_* keys except the language and map style, and the milestone session flag', async () => {
  const { clearDeviceData } = await import('../js/modules/utils.js');
  const store = o => { const m = new Map(Object.entries(o)); return { get length(){ return m.size; }, key: i => [...m.keys()][i] ?? null, removeItem: k => m.delete(k), keys: () => [...m.keys()] }; };
  const local = store({ bouldeer_lang: 'de', bouldeer_map_style: 'dark', bouldeer_add_draft: '{}', bouldeer_welcomed_u1: '1', bouldeer_recent_searches: '[]', other_site_key: 'keep' });
  const session = store({ bouldeer_milestone_shown: '1', other: 'keep' });
  clearDeviceData(local, session);
  assert.deepEqual(local.keys().sort(), ['bouldeer_lang', 'bouldeer_map_style', 'other_site_key']);
  assert.deepEqual(session.keys(), ['other']);
  assert.doesNotThrow(() => clearDeviceData(null, null));   // storage unavailable
  assert.match(read('js/modules/me-page.js'), /clearDeviceData\(window\.localStorage, window\.sessionStorage\)/);
});

test('delete-account: deletes only the caller\'s own account, after Auth confirms the token', async () => {
  const f = fakes();
  const res = await H.handle(req('POST', { Authorization: 'Bearer tok-abc', Origin: 'https://www.bouldeer.com' }), f.deps);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { deleted: true });
  assert.deepEqual(f.calls.getUser, ['tok-abc']);
  assert.deepEqual(f.calls.deleteUser, ['u-1'], 'the id comes from Auth, never from the request');
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), 'https://www.bouldeer.com');
});

test('delete-account: no token, a bad token, or the wrong method deletes nothing', async () => {
  for(const [r, status] of [[req('POST'), 401], [req('POST', { Authorization: 'Basic x' }), 401], [req('GET', { Authorization: 'Bearer t' }), 405]]){
    const f = fakes();
    const res = await H.handle(r, f.deps);
    assert.equal(res.status, status);
    assert.deepEqual(f.calls.deleteUser, []);
  }
  const bad = fakes({ getError: new Error('invalid JWT') });
  assert.equal((await H.handle(req('POST', { Authorization: 'Bearer forged' }), bad.deps)).status, 401);
  assert.deepEqual(bad.calls.deleteUser, []);
  const noUser = fakes({ user: null });
  assert.equal((await H.handle(req('POST', { Authorization: 'Bearer t' }), noUser.deps)).status, 401);
});

test('delete-account: a failed delete reports 500; preflight answers CORS; unknown origins get the site origin', async () => {
  const f = fakes({ delError: new Error('db') });
  const res = await H.handle(req('POST', { Authorization: 'Bearer t' }), f.deps);
  assert.equal(res.status, 500); assert.deepEqual(await res.json(), { error: 'delete_failed' });
  const pre = await H.handle(req('OPTIONS', { Origin: 'http://localhost:8000' }), fakes().deps);
  assert.equal(pre.status, 200);
  assert.equal(pre.headers.get('Access-Control-Allow-Origin'), 'http://localhost:8000');
  assert.match(pre.headers.get('Access-Control-Allow-Headers'), /authorization/);
  const evil = await H.handle(req('OPTIONS', { Origin: 'https://evil.example' }), fakes().deps);
  assert.equal(evil.headers.get('Access-Control-Allow-Origin'), 'https://www.bouldeer.com');
});

test('delete-account: the function reads the service key from the environment only; none is in the repo', () => {
  const ts = read('supabase/functions/delete-account/index.ts');
  assert.match(ts, /Deno\.env\.get\('SUPABASE_SERVICE_ROLE_KEY'\)/);
  assert.ok(!/eyJ[A-Za-z0-9_-]{20,}/.test(ts + read('supabase/functions/delete-account/handler.js')), 'no literal JWT/key');
  // what the account deletion relies on: personal data cascades, shared content is unlinked (migration 20261002000500)
  const fk = read('supabase/migrations/20261002000500_account_deletion_fks.sql');
  assert.match(fk, /on delete set null/);
});

test('Me page: Delete account is folded away, names what goes and what stays, and the danger button starts disabled', async () => {
  const P = await import('../js/modules/page-html.js');
  const html = P.deleteAccountHtml();
  assert.match(html, /<details class="me-delete-details"><summary class="me-delete-summary">Delete account<\/summary>/);
  assert.match(html, /<input type="checkbox" data-delete-confirm>/);
  assert.match(html, /<button type="button" class="btn btn-secondary btn-danger" data-page-action="delete-account" disabled>Delete my account<\/button>/);
  assert.ok(!/btn-primary/.test(html), 'never the primary action');
  assert.match(html, /role="status" aria-live="polite"/);
  assert.ok(P.mePageHtml({ signedIn: true, saved: [], climbed: [], community: null }).includes('data-page-action="delete-account"'));
  assert.ok(!P.mePageHtml({ signedIn: false }).includes('delete-account'), 'signed out: no delete control');
  const me = read('js/modules/me-page.js');
  assert.match(me, /functions\.invoke\('delete-account', \{ method: 'POST' \}\)/);
  assert.match(me, /signOut\(\{ scope: 'local' \}\)/);
});
