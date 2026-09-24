// Test harness for the importer's integration tests: talks to a LOCAL Supabase stack only (`supabase start`, Docker).
// Keys are read at run time from `supabase status` (they are local demo keys, never stored in the repo). Everything here refuses to
// run against a non-local URL, so these tests can never touch production.
'use strict';
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

function cliPath() {
  const candidates = [process.env.SUPABASE_CLI, path.join(process.env.USERPROFILE || '', 'tools', 'supabase-cli', 'supabase.exe'), 'supabase'].filter(Boolean);
  return candidates.find(c => c === 'supabase' || fs.existsSync(c));
}

let cached;
function localStack() {
  if (cached !== undefined) return cached;
  cached = null;
  const cli = cliPath();
  if (!cli) return cached;
  const docker = path.join(process.env.LOCALAPPDATA || '', 'Programs', 'DockerDesktop', 'resources', 'bin');
  const env = { ...process.env, PATH: process.env.PATH + path.delimiter + docker };
  const r = cp.spawnSync(cli, ['status', '-o', 'json'], { cwd: ROOT, env, encoding: 'utf8', timeout: 90000 });
  if (r.status !== 0 || !r.stdout) return cached;
  try {
    const j = JSON.parse(r.stdout.slice(r.stdout.indexOf('{')));
    const url = new URL(j.API_URL);
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) return cached;      // hard stop: local only
    cached = { url: `${url.protocol}//${url.host}`, anon: j.ANON_KEY, service: j.SERVICE_ROLE_KEY };
  } catch (e) { /* not running */ }
  return cached;
}

function admin(stack) {
  const h = { apikey: stack.service, Authorization: 'Bearer ' + stack.service, 'Content-Type': 'application/json' };
  const call = async (method, p, body, extra = {}) => {
    if (!stack.url.startsWith('http://127.0.0.1') && !stack.url.startsWith('http://localhost')) throw new Error('local-stack helper refuses non-local URLs');
    const r = await fetch(stack.url + p, { method, headers: { ...h, ...extra }, body: body === undefined ? undefined : JSON.stringify(body) });
    const t = await r.text();
    if (!r.ok) throw new Error(`${method} ${p} -> ${r.status} ${t.slice(0, 200)}`);
    return t ? JSON.parse(t) : null;
  };
  return {
    reset: () => call('DELETE', '/rest/v1/spots?id=neq.__never__'),                    // local database only
    insert: rows => call('POST', '/rest/v1/spots', rows, { Prefer: 'return=minimal' }),
    patch: (id, body) => call('PATCH', `/rest/v1/spots?id=eq.${id}`, body, { Prefer: 'return=minimal' }),
    all: () => call('GET', '/rest/v1/spots?select=*&order=id'),
    byId: id => call('GET', `/rest/v1/spots?select=*&id=eq.${id}`),
  };
}

// A spot as the live table stores it (used to seed the local "production").
const prodRow = (o = {}) => ({ community: false, edited: false, status: 'approved', photo: null, notes: null, address: null, types: ['indoor-bouldering'], ...o });

// A syntactically valid JWT (unsigned/garbage signature) for credential-validation tests.
const fakeJwt = claims => ['{"alg":"HS256","typ":"JWT"}', JSON.stringify(claims), 'sig'].map(x => Buffer.from(x).toString('base64url')).join('.');

module.exports = { localStack, admin, prodRow, fakeJwt };
