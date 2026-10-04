// Where the importer talks to, which credentials it accepts, and the ONLY code that can write to a database.
//
//  - Reads (GET) use the public anon key: the production one is already public in js/supabase-init.js; for a local Supabase it comes
//    from SUPABASE_ANON_KEY. With a valid service-role key the same reads also see non-approved (pending) rows.
//  - The service-role key is read from the environment ONLY (SUPABASE_SERVICE_ROLE_KEY). It is never read from a file, never
//    printed (error text is redacted), and never written to a batch, manifest or report.
//  - Five writes exist, behind two gates: Api.insertSpots() -- one plain `INSERT` of new rows (no upsert, no on_conflict,
//    no PUT/DELETE, no rpc), gate minted only by importer.js -- and, behind the update gate minted only by updater.js,
//    Api.updateSpotLocation() -- a PATCH of address/lat/lng on one approved row pinned by id + updated_at -- Api.updateSpotInfo() --
//    a PATCH of website/hours/day_pass/facilities on one approved row pinned the same way (the updater only fills fields that are empty) --
//    Api.updateSpotIdentity() -- a PATCH of name/suburb/types on one approved row pinned the same way (the stored slug is never sent) -- and
//    Api.retireSpot() -- a PATCH of status='rejected' + rejection_reason on one approved row pinned the same way. Both gates exist
//    only after every preflight check and CLI safety flag has passed. Nothing can delete a spot or change any other field.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { INFO_FIELDS, IDENTITY_FIELDS, infoSetProblems, identitySetProblems } = require('./validate');

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
// Only the exact objects minted here are gates: a copy ({...gate} copies the symbol too) or a hand-built look-alike is refused.
const MINTED_WRITE_GATES = new WeakSet();
const mintWriteGate = ({ batchId, token, rows, payloadSha }) => { const g = Object.freeze({ [GATE]: true, batchId, token, rows, payloadSha }); MINTED_WRITE_GATES.add(g); return g; };
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');

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
    if (!gate || gate[GATE] !== true || !MINTED_WRITE_GATES.has(gate)) throw new Error('refusing to write: no write gate (all preflight checks and safety flags must pass first)');
    if (!Array.isArray(rows) || !rows.length || rows !== gate.rows) throw new Error('refusing to write: rows do not match the approved payload');
    if (!gate.payloadSha || sha256(JSON.stringify(rows)) !== gate.payloadSha) throw new Error('refusing to write: the payload changed after it was approved (hash mismatch)');
    return this._send('POST', '/rest/v1/spots', { service: true, headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(rows) });
  }

  // THE ONLY UPDATE in the importer (updater.js): one location correction of one existing approved spot. PATCH with the row
  // pinned by id + status=approved + the exact updated_at observed at the final re-check (optimistic concurrency: if anything
  // touched the row since, zero rows match and nothing changes). The body may carry address/lat/lng only, and must be exactly
  // the approved payload entry. Returns the updated row(s) (Prefer: return=representation) so the caller can count them.
  async updateSpotLocation(u, gate) {
    if (!gate || gate[UPDATE_GATE] !== true || !MINTED_UPDATE_GATES.has(gate)) throw new Error('refusing to update: no update gate (all preflight checks and safety flags must pass first)');
    if (!gate.payloadSha || sha256(JSON.stringify(opsPayload(gate.updates, gate.retires))) !== gate.payloadSha) throw new Error('refusing to update: the payload changed after it was approved (hash mismatch)');
    const approved = gate.updates.find(x => x.id === u.id);
    if (!approved || JSON.stringify(approved.set) !== JSON.stringify(u.set)) throw new Error('refusing to update: this change is not the approved one for ' + u.id);
    const keys = Object.keys(u.set);
    if (!keys.length || keys.some(k => !LOCATION_FIELDS.includes(k))) throw new Error('refusing to update: only ' + LOCATION_FIELDS.join('/') + ' may be changed');
    if (('lat' in u.set) !== ('lng' in u.set)) throw new Error('refusing to update: lat and lng change together');
    for (const k of ['lat', 'lng']) if (k in u.set && (typeof u.set[k] !== 'number' || !Number.isFinite(u.set[k]))) throw new Error('refusing to update: ' + k + ' must be a finite number');
    if ('address' in u.set && (typeof u.set.address !== 'string' || !u.set.address.trim())) throw new Error('refusing to update: an address can be corrected, never cleared');
    if (typeof u.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(u.id)) throw new Error('refusing to update: bad id');
    if (typeof u.updatedAt !== 'string' || !u.updatedAt) throw new Error('refusing to update: the row version (updated_at) observed at the final re-check is required');
    const q = `/rest/v1/spots?id=eq.${encodeURIComponent(u.id)}&status=eq.approved&updated_at=eq.${encodeURIComponent(u.updatedAt)}`;
    return this._send('PATCH', q, { service: true, headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(u.set) });
  }

  // THE ONLY GYM-INFORMATION WRITE in the importer (updater.js): fills website, hours, day_pass and/or facilities of one existing approved spot. Same gate,
  // same pin (id + status=approved + the exact updated_at observed at the final re-check) and the same one-PATCH-per-gym rule as
  // updateSpotLocation. The body is exactly the approved {website?, hours?, day_pass?, facilities?} and nothing else. That the fields are still empty is
  // checked by the updater before this is called; the updated_at pin keeps it true at write time (a row edited since matches zero rows).
  async updateSpotInfo(u, gate) {
    if (!gate || gate[UPDATE_GATE] !== true || !MINTED_UPDATE_GATES.has(gate)) throw new Error('refusing to update: no update gate (all preflight checks and safety flags must pass first)');
    if (!gate.payloadSha || sha256(JSON.stringify(opsPayload(gate.updates, gate.retires))) !== gate.payloadSha) throw new Error('refusing to update: the payload changed after it was approved (hash mismatch)');
    const approved = gate.updates.find(x => x.id === u.id);
    if (!approved || JSON.stringify(approved.set) !== JSON.stringify(u.set)) throw new Error('refusing to update: this change is not the approved one for ' + u.id);
    const keys = Object.keys(u.set);
    if (!keys.length || keys.some(k => !INFO_FIELDS.includes(k))) throw new Error('refusing to update: only ' + INFO_FIELDS.join('/') + ' may be changed');
    const bad = await infoSetProblems(u.set);
    if (bad.length) throw new Error('refusing to update: ' + bad[0]);
    if (typeof u.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(u.id)) throw new Error('refusing to update: bad id');
    if (typeof u.updatedAt !== 'string' || !u.updatedAt) throw new Error('refusing to update: the row version (updated_at) observed at the final re-check is required');
    const q = `/rest/v1/spots?id=eq.${encodeURIComponent(u.id)}&status=eq.approved&updated_at=eq.${encodeURIComponent(u.updatedAt)}`;
    return this._send('PATCH', q, { service: true, headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(u.set) });
  }

  // THE ONLY IDENTITY WRITE in the importer (updater.js): corrects name, suburb and/or types of one existing approved spot. Same gate, same pin
  // (id + status=approved + the exact updated_at observed at the final re-check) and the same one-PATCH-per-gym rule as updateSpotLocation. The body is exactly the
  // approved {name?, suburb?, types?} and nothing else -- never a slug: the database keeps the stored slug (set once, never changed), so a rename does not
  // move the gym's URL. Values are re-validated here (trimmed single-line text within the column limits; types from the allowed list, in canonical order).
  async updateSpotIdentity(u, gate) {
    if (!gate || gate[UPDATE_GATE] !== true || !MINTED_UPDATE_GATES.has(gate)) throw new Error('refusing to update: no update gate (all preflight checks and safety flags must pass first)');
    if (!gate.payloadSha || sha256(JSON.stringify(opsPayload(gate.updates, gate.retires))) !== gate.payloadSha) throw new Error('refusing to update: the payload changed after it was approved (hash mismatch)');
    const approved = gate.updates.find(x => x.id === u.id);
    if (!approved || JSON.stringify(approved.set) !== JSON.stringify(u.set)) throw new Error('refusing to update: this change is not the approved one for ' + u.id);
    const keys = Object.keys(u.set);
    if (!keys.length || keys.some(k => !IDENTITY_FIELDS.includes(k))) throw new Error('refusing to update: only ' + IDENTITY_FIELDS.join('/') + ' may be changed');
    const bad = await identitySetProblems(u.set);
    if (bad.length) throw new Error('refusing to update: ' + bad[0]);
    if (typeof u.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(u.id)) throw new Error('refusing to update: bad id');
    if (typeof u.updatedAt !== 'string' || !u.updatedAt) throw new Error('refusing to update: the row version (updated_at) observed at the final re-check is required');
    const q = `/rest/v1/spots?id=eq.${encodeURIComponent(u.id)}&status=eq.approved&updated_at=eq.${encodeURIComponent(u.updatedAt)}`;
    return this._send('PATCH', q, { service: true, headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(u.set) });
  }

  // THE ONLY RETIREMENT in the importer (updater.js): one approved spot is marked rejected (closed / confirmed duplicate) -- the
  // moderator UI's own decision format (status 'rejected' + rejection_reason); the row is kept, never deleted. Same gate as
  // updateSpotLocation and the same optimistic concurrency: the row is pinned by id + status=approved + the exact updated_at observed
  // at the final re-check, so a row touched since (or no longer approved) matches zero rows and nothing changes. The body is exactly
  // {status, rejection_reason} and the reason must be the approved one for that id.
  async retireSpot(u, gate) {
    if (!gate || gate[UPDATE_GATE] !== true || !MINTED_UPDATE_GATES.has(gate)) throw new Error('refusing to retire: no update gate (all preflight checks and safety flags must pass first)');
    if (!gate.payloadSha || sha256(JSON.stringify(opsPayload(gate.updates, gate.retires))) !== gate.payloadSha) throw new Error('refusing to retire: the payload changed after it was approved (hash mismatch)');
    const approved = (gate.retires || []).find(x => x.id === u.id);
    if (!approved || approved.reason !== u.reason) throw new Error('refusing to retire: this retirement is not the approved one for ' + u.id);
    if (typeof u.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(u.id)) throw new Error('refusing to retire: bad id');
    if (typeof u.reason !== 'string' || u.reason.length < 8 || u.reason.length > 200 || u.reason !== u.reason.trim()) throw new Error('refusing to retire: the rejection reason must be 8-200 characters of trimmed text');
    if (typeof u.updatedAt !== 'string' || !u.updatedAt) throw new Error('refusing to retire: the row version (updated_at) observed at the final re-check is required');
    const q = `/rest/v1/spots?id=eq.${encodeURIComponent(u.id)}&status=eq.approved&updated_at=eq.${encodeURIComponent(u.updatedAt)}`;
    return this._send('PATCH', q, { service: true, headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify({ status: 'rejected', rejection_reason: u.reason }) });
  }
}

// What the update gate's payload hash covers: the location updates alone (exactly as before retirements existed), or updates AND
// retirements when the batch has any, so the gate and the confirmation token can never authorise a different set of operations.
const opsPayload = (updates, retires) => (retires && retires.length ? { updates, retires } : updates);

// The fields an update batch may change (updater.js enforces the same list before a gate is ever minted).
const LOCATION_FIELDS = Object.freeze(['address', 'lat', 'lng']);
const UPDATE_GATE = Symbol('gym-import-update-gate');
// Only the exact objects minted here are gates: a copy ({...gate} copies the symbol too) or a hand-built look-alike is refused.
const MINTED_UPDATE_GATES = new WeakSet();
const mintUpdateGate = ({ batchId, token, updates, retires = [], payloadSha }) => { const g = Object.freeze({ [UPDATE_GATE]: true, batchId, token, updates, retires, payloadSha }); MINTED_UPDATE_GATES.add(g); return g; };

module.exports = { ROOT, ENV, productionConfig, resolveTarget, validateServiceKey, decodeJwt, redact, mintWriteGate, mintUpdateGate, opsPayload, LOCATION_FIELDS, INFO_FIELDS, IDENTITY_FIELDS, Api };
