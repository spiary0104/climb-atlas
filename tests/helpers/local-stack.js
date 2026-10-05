// Test harness for the importer's integration tests: talks to a LOCAL Supabase stack only (`supabase start`, Docker).
// Keys are read at run time from `supabase status` (they are local demo keys, never stored in the repo). Everything here refuses to
// run against a non-local URL, so these tests can never touch production.
'use strict';
const cp = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
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

// One local Supabase database serves every checkout, worktree and session on this machine, and the local-stack tests reset it
// (DELETE every spot). Two runs at the same time wipe each other's rows mid-test, which showed up as a rare failure far from its
// cause. acquireStackLock() makes runs take turns: an exclusive lock file in the OS temp directory (shared by every worktree),
// created atomically ('wx'); a waiter takes over a lock only when the process that holds it is gone. Returns release().
const lockFile = url => path.join(os.tmpdir(), 'bouldeer-local-stack-' + crypto.createHash('sha1').update(new URL(url).host).digest('hex').slice(0, 8) + '.lock');
const alive = pid => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
async function acquireStackLock(stack, { timeoutMs = 15 * 60 * 1000, pollMs = 200, file = lockFile(stack.url) } = {}) {
  const started = Date.now();
  for (;;) {
    try {
      fs.writeFileSync(file, JSON.stringify({ pid: process.pid, cwd: process.cwd(), at: new Date().toISOString() }), { flag: 'wx' });
      let released = false;
      const release = () => {
        if (released) return; released = true;
        try { if (JSON.parse(fs.readFileSync(file, 'utf8')).pid === process.pid) fs.unlinkSync(file); } catch (e) { /* already gone */ }
      };
      process.once('exit', release);   // a run that ends without its after() hook still frees the stack
      return release;
    } catch (e) {
      if (e.code !== 'EEXIST') throw e;
    }
    let text = null, owner = null;
    try { text = fs.readFileSync(file, 'utf8'); owner = JSON.parse(text); } catch (e) { /* vanished or still being written */ }
    const stale = owner ? !alive(owner.pid) : (() => { try { return Date.now() - fs.statSync(file).mtimeMs > 5000; } catch (e) { return false; } })();
    if (stale) {
      // remove it only if it is still the same stale lock (another waiter may have replaced it a moment ago)
      try { const now = fs.readFileSync(file, 'utf8'); if (text === null || now === text) fs.unlinkSync(file); } catch (e) { /* gone already */ }
      continue;
    }
    if (Date.now() - started > timeoutMs) throw new Error(`the local Supabase stack is in use by another test run (pid ${owner && owner.pid}, ${owner && owner.cwd}); waited ${Math.round(timeoutMs / 1000)} s for ${file}`);
    await new Promise(r => setTimeout(r, pollMs));
  }
}

// A spot as the live table stores it (used to seed the local "production").
const prodRow = (o = {}) => ({ community: false, edited: false, status: 'approved', photo: null, notes: null, address: null, types: ['indoor-bouldering'], ...o });

// A syntactically valid JWT (unsigned/garbage signature) for credential-validation tests.
const fakeJwt = claims => ['{"alg":"HS256","typ":"JWT"}', JSON.stringify(claims), 'sig'].map(x => Buffer.from(x).toString('base64url')).join('.');

module.exports = { localStack, admin, prodRow, fakeJwt, acquireStackLock, lockFile };
