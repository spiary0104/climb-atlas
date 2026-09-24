// Where the importer talks to, which credentials it accepts, and the ONLY code that can write to a database.
//
//  - Reads (GET) use the public anon key: the production one is already public in js/supabase-init.js; for a local Supabase it comes
//    from SUPABASE_ANON_KEY. With a valid service-role key the same reads also see non-approved (pending) rows.
//  - The service-role key is read from the environment ONLY (SUPABASE_SERVICE_ROLE_KEY). It is never read from a file, never
//    printed (error text is redacted), and never written to a batch, manifest or report.
//  - The single write is Api.insertSpots(): one plain `INSERT` (no upsert, no on_conflict, no PATCH/PUT/DELETE, no rpc). It needs a
//    write gate that only importer.js can mint after every preflight check and CLI safety flag has passed.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const ENV = { url: 'SUPABASE_URL', service: 'SUPABASE_SERVICE_ROLE_KEY', anon: 'SUPABASE_ANON_KEY' };
const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

function productionConfig(root = ROOT) {
  const init = fs.readFileSync(path.join(root, 'js', 'supabase-init.js'), 'utf8');
  const url = (init.match(/https:\/\/[a-z0-9]+\.supabase\.co/) || [])[0];
  const anonKey = (init.match(/sb_publishable_[A-Za-z0-9_-]+/) || [])[0];
  if (!url || !anonKey) throw new Error('Could not read the production URL / public key from js/supabase-init.js');
  const host = new URL(url).host;
  return { url, host, ref: host.split('.')[0], anonKey };
}

// Decide where we are pointed. Never falls back silently: an unset SUPABASE_URL means "production, read-only" for a dry-run and is
// an error for --apply (a write target must be chosen deliberately). Only the production project or a local Supabase are allowed.
function resolveTarget(env = process.env, { root = ROOT, requireExplicit = false } = {}) {
  const prod = productionConfig(root), problems = [];
  const raw = env[ENV.url] ? String(env[ENV.url]).trim() : '';
  if (!raw && requireExplicit) problems.push(`${ENV.url} must be set explicitly for --apply (there is deliberately no default write target)`);
  let url;
  try { url = new URL(raw || prod.url); } catch (e) { problems.push(`${ENV.url} is not a valid URL`); url = new URL(prod.url); }
  if (url.username || url.password || (url.pathname && url.pathname !== '/') || url.search || url.hash) problems.push(`${ENV.url} must be a bare origin (no path, query or credentials)`);
  let kind = null;
  if (url.host === prod.host) { kind = 'production'; if (url.protocol !== 'https:') problems.push('the production URL must be https'); }
  else if (LOCAL_HOSTS.has(url.hostname)) kind = 'local';
  else problems.push(`unknown target host "${url.host}": the importer only targets the production project (${prod.host}) or a local Supabase (127.0.0.1 / localhost)`);
  let anonKey = null;
  if (kind === 'production') anonKey = prod.anonKey;
  else if (kind === 'local') { anonKey = env[ENV.anon] ? String(env[ENV.anon]).trim() : null; if (!anonKey) problems.push(`${ENV.anon} is required for a local target (get it from \`supabase status\`)`); }
  const serviceKey = env[ENV.service] ? String(env[ENV.service]) : null;
  return { url: `${url.protocol}//${url.host}`, host: url.host, kind, prod, anonKey, serviceKey, problems };
}

function decodeJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try { return JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')); } catch (e) { return null; }
}

// Static (offline) checks of a service-role credential. The server-side probe in importer.js is the final word.
function validateServiceKey(key, target) {
  const problems = [];
  if (!key || !key.trim()) return [`${ENV.service} is not set (export it in your shell for the run; never put it in a file in the repo)`];
  if (key !== key.trim() || /[\s"'`]/.test(key)) return [`${ENV.service} is malformed (contains whitespace or quotes; paste the bare value)`];
  if (key.startsWith('sb_publishable_')) return [`${ENV.service} is a publishable (anon) key, not a service-role/secret key`];
  if (key.startsWith('sb_secret_')) { if (key.length < 30) problems.push(`${ENV.service} looks truncated`); return problems; }
  const claims = decodeJwt(key);
  if (!claims) return [`${ENV.service} is not a recognised Supabase key (expected a service_role JWT or an sb_secret_ key)`];
  if (claims.role !== 'service_role') return [`${ENV.service} is a JWT with role "${claims.role}", not service_role`];
  if (claims.exp && claims.exp * 1000 < Date.now()) problems.push(`${ENV.service} has expired`);
  if (target.kind === 'production') {
    if (!claims.ref) problems.push(`${ENV.service} has no project ref, so it cannot be confirmed to belong to the production project`);
    else if (claims.ref !== target.prod.ref) problems.push(`${ENV.service} belongs to a different Supabase project (${claims.ref}), not ${target.prod.ref}`);
  } else if (claims.ref && claims.ref === target.prod.ref) problems.push(`${ENV.service} is the PRODUCTION key but the target is local; refusing to mix them`);
  return problems;
}

const redact = (text, secrets) => (secrets || []).filter(s => s && s.length > 8).reduce((t, s) => String(t).split(s).join('[redacted]'), String(text));

// A write gate is minted only by importer.js (see mintWriteGate) after all preflight checks and CLI flags have passed.
const GATE = Symbol('gym-import-write-gate');
const mintWriteGate = ({ batchId, token, rows }) => Object.freeze({ [GATE]: true, batchId, token, rows });

class Api {
  constructor(target, { timeoutMs = 60000 } = {}) { this.t = target; this.timeoutMs = timeoutMs; }
  secrets() { return [this.t.serviceKey, this.t.anonKey]; }
  async _send(method, pathQuery, { service = false, headers = {}, body } = {}) {
    const key = service ? this.t.serviceKey : this.t.anonKey;
    if (!key) throw new Error(service ? 'no service-role key available' : 'no anon key available');
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), this.timeoutMs);
    try {
      const res = await fetch(this.t.url + pathQuery, { method, headers: { apikey: key, Authorization: 'Bearer ' + key, ...headers }, body, signal: ctl.signal });
      const text = await res.text();
      let json = null; try { json = text ? JSON.parse(text) : null; } catch (e) { /* non-JSON body */ }
      return { status: res.status, ok: res.ok, json, text: redact(text, this.secrets()), headers: res.headers };
    } catch (e) { const err = new Error(redact(e.message, this.secrets())); err.network = true; throw err; }
    finally { clearTimeout(timer); }
  }
  // Read-only. Paginates with Range so >1000 rows work.
  async getAll(pathQuery, { service = false } = {}) {
    const rows = [];
    for (let from = 0; ; from += 1000) {
      const r = await this._send('GET', pathQuery, { service, headers: { Range: `${from}-${from + 999}`, 'Range-Unit': 'items' } });
      if (!r.ok) { const err = new Error(`GET ${pathQuery.split('?')[0]} failed: HTTP ${r.status}`); err.status = r.status; throw err; }
      rows.push(...r.json);
      if (r.json.length < 1000) break;
    }
    return rows;
  }
  async probe({ service = false } = {}) { return this._send('GET', '/rest/v1/spots?select=id&limit=1', { service }); }

  // THE ONLY WRITE in the importer: one atomic INSERT of new rows into spots. Plain insert: if any id already exists the whole
  // statement fails and nothing is written; existing rows can never be changed by it.
  async insertSpots(rows, gate) {
    if (!gate || gate[GATE] !== true) throw new Error('refusing to write: no write gate (all preflight checks and safety flags must pass first)');
    if (!Array.isArray(rows) || !rows.length || rows !== gate.rows) throw new Error('refusing to write: rows do not match the approved payload');
    return this._send('POST', '/rest/v1/spots', { service: true, headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(rows) });
  }
}

module.exports = { ROOT, ENV, productionConfig, resolveTarget, validateServiceKey, decodeJwt, redact, mintWriteGate, Api };
