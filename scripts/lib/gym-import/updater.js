// The location-update path of the production importer. See docs/import-workflow.md ("Updating the location of existing gyms").
//
// Same conventions as importer.js: modes dry-run (default) | verify | apply; only `apply` writes, and only after every check, the
// confirmation token and the production flag pass. An update batch can change ONLY address / lat / lng of existing APPROVED spots.
// Every record names the gym's content hash when it was researched (expect_h); a gym whose content differs from that is refused,
// never overwritten. Nothing here inserts, deletes, or touches any other field. importer.js hands a batch here when EVERY record is
// {"intent":"update"}; a batch mixing inserts and updates stays in importer.js and is refused there.
//
// Per gym the live row is in one of three states:
//   before   its content hash is exactly expect_h (nothing changed since the research)
//   after    address/lat/lng hold the new values and every other field is unchanged (this batch was applied)
//   changed  anything else -> refused
// All before = a fresh update; all after = already applied (nothing to write); a mix = refused (never merged).
//
// The same path also runs RETIRE records ({"intent":"retire"}: an approved gym that is closed or a confirmed duplicate becomes
// status 'rejected' + rejection_reason, the moderator UI's own decision format; the row is kept, never deleted). A batch in which every
// record is an update or a retire is a "maintenance" batch. A retire target is in one of:
//   before   approved, content hash = expect_h
//   after    status 'rejected' and rejection_reason equal to the record's reason (the retirement was applied)
//   missing / changed -> refused
// The gates are the same: FULL coverage, token (which also binds the retire ops), production flag, final re-check, conditional write.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const N = require('./normalize');
const V = require('./validate');
const M = require('./match');
const P = require('./plan');
const S = require('./index-store');
const T = require('./target');
const MF = require('./manifest');
const { liveStateSha, drift } = require('./importer');

const UPDATER_VERSION = 1;
const MAX_UPDATES = 100;                     // one reviewable report; bigger corrections are split into several batches
const NEAR_M = M.T.PROBABLE_COLOCATED_M;     // 60 m: the same rule that makes a new gym a probable duplicate
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');
const driftTotal = d => d.added.length + d.removed.length + d.changed.length;
// Drift of every spot EXCEPT this batch's targets, on both sides (importer.js drift() ignores ids on the live side only, which is right
// for inserts -- new ids are not in the index -- but would report an updated target as removed).
const driftExcept = (rows, index, ids) => { const d = drift(rows, index); const keep = id => !ids.has(id); return { added: d.added.filter(keep), removed: d.removed.filter(keep), changed: d.changed.filter(keep) }; };
const sample = (a, n = 6) => a.slice(0, n).join(', ') + (a.length > n ? `, … (+${a.length - n})` : '');
const hasPin = set => set.lat !== undefined || set.lng !== undefined;
// The token binds --apply to this batch, the exact updates, the plan (which embeds the index), the target, the preflight coverage and
// the observed production state. A different prefix and version from the insert token, so neither can ever stand in for the other.
// `retires` (the exact retire ops) is appended only when there are any, so tokens of update-only batches are unchanged; `payload` already
// hashes them too (target.opsPayload), so a token for a different set of retirements can never match.
const confirmToken = ({ batchId, planSha, payload, host, kind, coverage, liveSha, retires = [] }) =>
  sha256(JSON.stringify(['gym-update-confirm', UPDATER_VERSION, batchId, planSha, payload, host, kind, coverage, liveSha, ...(retires.length ? [retires] : [])])).slice(0, 16);

// Location-only rules on top of validate.js (which allows more fields for planning). Returns a list of problems.
function locationProblems(rec) {
  const out = [];
  const set = rec.set && typeof rec.set === 'object' && !Array.isArray(rec.set) ? rec.set : null;
  if (!set || !Object.keys(set).length) return ['"set" must list the location fields to change'];
  const other = Object.keys(set).filter(k => !T.LOCATION_FIELDS.includes(k));
  if (other.length) out.push(`only ${T.LOCATION_FIELDS.join(', ')} may be changed (not ${other.join(', ')})`);
  if ((set.lat === undefined) !== (set.lng === undefined)) out.push('lat and lng must change together');
  if ('address' in set && (typeof set.address !== 'string' || !set.address.trim())) out.push('address can be corrected, never cleared (a non-empty text)');
  if (typeof rec.expect_h !== 'string' || !V.EXPECT_H.test(rec.expect_h)) out.push('expect_h (the gym\'s content hash when researched) is required');
  if (typeof rec.source !== 'string' || !rec.source.trim() || rec.source.length > 400) out.push('source (where the new location comes from) is required, max 400 chars');
  return out;
}

// State of one gym in a snapshot. e = its index entry (the content researched against), rec = the update record.
function stateOf(live, e, rec) {
  if (!live) return { state: 'missing' };
  if (live.status !== 'approved') return { state: 'not-approved' };
  const h = S.toEntry(live).h;
  if (h === rec.expect_h) return { state: 'before', h, updatedAt: live.updated_at };
  const equalsTarget = Object.entries(rec.set).every(([k, v]) => (k === 'address' ? N.emptyToNull(live.address) === N.emptyToNull(v) : N.sameCoord(live[k], v)));
  const restored = { ...live }; for (const k of Object.keys(rec.set)) restored[k] = e[k];
  if (equalsTarget && S.toEntry(restored).h === rec.expect_h) return { state: 'after', h, updatedAt: live.updated_at };
  return { state: 'changed', h };
}

// State of one retire target: live = the row (any status) or undefined; rec = the retire record.
function stateOfRetire(live, rec) {
  if (!live) return { state: 'missing' };
  // "after" = rejected with exactly the recorded reason AND otherwise untouched: the content hash ignores status/rejection_reason,
  // so a correctly retired row still hashes to expect_h. Any other rejected row is "changed" (never treated as our retirement).
  if (live.status === 'rejected') { const rh = S.toEntry(live).h; return live.rejection_reason === rec.reason && rh === rec.expect_h ? { state: 'after', h: rh, updatedAt: live.updated_at } : { state: 'changed', h: rh }; }
  if (live.status !== 'approved') return { state: 'changed', h: S.toEntry(live).h };
  const h = S.toEntry(live).h;
  return h === rec.expect_h ? { state: 'before', h, updatedAt: live.updated_at } : { state: 'changed', h };
}

async function runUpdate(opts) {
  const { batchDir, mode = 'dry-run', confirm = null, productionFlag = false, env = process.env, root = T.ROOT, indexDir = null, now = () => new Date().toISOString() } = opts;
  const checks = [];
  const add = (status, name, detail = '') => checks.push({ status, name, detail });
  const fails = () => checks.filter(c => c.status === 'FAIL');
  const res = { kind: 'update', mode, batchId: path.basename(batchDir || ''), checks, state: null, coverage: 'NONE', exit: 0, wrote: false, updates: [], retires: [], applied: [], token: null };
  const done = exit => { res.exit = exit; res.report = renderUpdateReport(res); return res; };
  const refuse = () => done(2);

  if (!['dry-run', 'verify', 'apply'].includes(mode)) throw new Error('unknown mode ' + mode);
  if (!batchDir || !fs.existsSync(batchDir)) { add('FAIL', 'batch specified', 'an existing batch directory must be given explicitly'); return refuse(); }
  add('PASS', 'batch specified explicitly', res.batchId + ' (maintenance batch: location corrections and/or retirements of existing gyms)');

  // ---- target and credentials (offline; same rules as importer.js) --------------------------------------------------------
  const target = T.resolveTarget(env, { root, requireExplicit: mode === 'apply' });
  res.target = { kind: target.kind, host: target.host };
  target.problems.forEach(p => add('FAIL', 'target', p));
  if (target.problems.length) return refuse();
  add('PASS', 'target', `${target.kind} (${target.host})`);
  if (target.kind === 'production') {
    if (!path.resolve(batchDir).startsWith(path.resolve(root, 'import', 'batches') + path.sep)) add('FAIL', 'production uses repo batches only', 'the batch must live under import/batches/ for a production target');
    if (indexDir) add('FAIL', 'production uses the repo index only', 'an --index override is only allowed for a local target');
    if (fails().length) return refuse();
  }
  const keyProblems = target.serviceKey ? T.validateServiceKey(target.serviceKey, target) : [];
  if (mode === 'apply') (target.serviceKey ? keyProblems : T.validateServiceKey(null, target)).forEach(p => add('FAIL', 'service-role credential', p));
  else if (target.serviceKey && keyProblems.length) keyProblems.forEach(p => add('FAIL', 'service-role credential', p));
  if (fails().length) return refuse();

  // ---- batch: structure, validation, location-only ----------------------------------------------------------------------------
  const batch = P.loadBatch(batchDir);
  batch.problems.forEach(p => add('FAIL', 'batch metadata', p));
  const recs = [];
  batch.lines.forEach(l => { if (l.parseError) add('FAIL', 'batch records', `line ${l.line}: not valid JSON`); else if (!l.rec || typeof l.rec !== 'object' || Array.isArray(l.rec)) add('FAIL', 'batch records', `line ${l.line}: not an object`); else recs.push({ line: l.line, rec: l.rec }); });
  if (!recs.length) add('FAIL', 'batch has records', 'records.ndjson is empty');
  if (recs.length > MAX_UPDATES) add('FAIL', 'batch size', `${recs.length} records exceeds ${MAX_UPDATES}; split the batch`);
  const notUpdate = recs.filter(x => x.rec.intent !== 'update' && x.rec.intent !== 'retire');
  if (notUpdate.length) add('FAIL', 'update-only', `${notUpdate.length} record(s) are neither update nor retire records (first: line ${notUpdate[0].line}); a maintenance batch holds updates and retirements only`);
  const bad = [];
  for (const x of recs) {
    const retire = x.rec.intent === 'retire';
    const v = retire ? await V.validateRetireRecord(x.rec) : await V.validateUpdateRecord(x.rec);
    const probs = [...v.errors.map(e => `${e.code} (${e.field})`), ...(retire ? [] : locationProblems(x.rec))];
    if (probs.length) bad.push(`line ${x.line} ${x.rec.id || '?'}: ${probs.join('; ')}`);
  }
  if (bad.length) add('FAIL', 'records validate (location updates only)', `${bad.length} invalid: ${sample(bad, 3)}`);
  const idCount = new Map(); recs.forEach(x => idCount.set(x.rec.id, (idCount.get(x.rec.id) || 0) + 1));
  const dups = [...idCount].filter(([, n]) => n > 1).map(([id]) => id);
  if (dups.length) add('FAIL', 'one update per gym', sample(dups) + ' (one record per gym: a gym cannot be updated twice, retired twice, or both updated and retired)');
  if (!fails().length) {
    const nr = recs.filter(x => x.rec.intent === 'retire').length;
    add('PASS', 'batch valid', `${recs.length - nr} update(s) and ${nr} retirement(s): updates change only ${T.LOCATION_FIELDS.join('/')} (lat+lng together, addresses non-empty); retirements only set status rejected + the reason; expect_h and source on every record, one per gym`);
  }
  if (fails().length) return refuse();
  res.updates = recs.filter(x => x.rec.intent === 'update').map(x => ({ id: x.rec.id, set: x.rec.set, expect_h: x.rec.expect_h }));
  res.retires = recs.filter(x => x.rec.intent === 'retire').map(x => ({ id: x.rec.id, reason_code: x.rec.reason_code, reason: x.rec.reason, ...(x.rec.duplicate_of ? { duplicate_of: x.rec.duplicate_of } : {}), expect_h: x.rec.expect_h }));
  res.payloadSha = sha256(JSON.stringify(T.opsPayload(res.updates, res.retires)));   // update-only batches: unchanged (the updates alone)
  const ids = recs.map(x => x.rec.id);                            // every target, in record order
  res.ids = ids;
  const retireIds = new Set(res.retires.map(r => r.id));

  // ---- local index: integrity, and the research snapshot equals it --------------------------------------------------------------
  let index;
  try { index = S.load(indexDir ? path.resolve(indexDir) : path.join(root, 'import', 'index')); } catch (e) { add('FAIL', 'match index', e.message); return refuse(); }
  if (!index.metaMatches) { add('FAIL', 'match index integrity', 'index-meta.json does not match gym-index.ndjson'); return refuse(); }
  add('PASS', 'match index integrity', `${index.entries.length} gyms, sha256 ${index.sha256.slice(0, 12)}…`);
  const unknown = recs.filter(x => !index.byId.has(x.rec.id)).map(x => x.rec.id);
  if (unknown.length) { add('FAIL', 'every target gym exists in the index', `unknown id(s): ${sample(unknown)}`); return refuse(); }
  const stale = recs.filter(x => index.byId.get(x.rec.id).h !== x.rec.expect_h).map(x => `${x.rec.id} (expect_h ${x.rec.expect_h}, index ${index.byId.get(x.rec.id).h})`);
  if (stale.length) { add('FAIL', 'researched content is the indexed content (expect_h)', `${stale.length} gym(s) changed since the update was researched: ${sample(stale, 3)}; re-research them`); return refuse(); }
  add('PASS', 'researched content is the indexed content (expect_h)', `all ${recs.length} gyms match their expect_h in the index`);
  res.names = Object.fromEntries(ids.map(id => [id, index.byId.get(id).name]));
  res.moves = Object.fromEntries(recs.filter(x => x.rec.intent === 'update' && hasPin(x.rec.set)).map(x => [x.rec.id, Math.round(N.meters(index.byId.get(x.rec.id), x.rec.set))]));

  // ---- live production reads (read-only) ----------------------------------------------------------------------------------------
  const api = opts.api || new T.Api(target);
  const snapshot = async () => {
    const approved = await api.getAll('/rest/v1/spots?select=*&status=eq.approved&order=id');
    const byId = new Map(approved.map(r => [r.id, r]));
    let pending = null;
    if (res.coverage === 'FULL') {
      for (const r of await api.getAll(`/rest/v1/spots?select=*&id=in.(${ids.join(',')})&order=id`, { service: true })) if (!byId.has(r.id)) byId.set(r.id, r);   // a target that is no longer approved
      pending = await api.getAll('/rest/v1/spots?select=*&status=eq.pending&order=id', { service: true });
    }
    const states = recs.map(x => ({ id: x.rec.id, ...(x.rec.intent === 'retire' ? stateOfRetire(byId.get(x.rec.id), x.rec) : stateOf(byId.get(x.rec.id), index.byId.get(x.rec.id), x.rec)) }));
    return { approved, byId, pending, states };
  };
  const count = (states, s) => states.filter(x => x.state === s).length;
  // The 60 m rule against production as it is now (approved, and pending with the service-role read) and within the batch.
  const nearProblems = snap => {
    const out = [];
    const pinned = recs.filter(r => r.rec.intent === 'update' && hasPin(r.rec.set));
    for (const x of pinned) {
      const pin = { lat: x.rec.set.lat, lng: x.rec.set.lng };
      const other = [...snap.approved, ...(snap.pending || [])].find(o => o.id !== x.rec.id && N.meters(pin, o) <= NEAR_M);
      const otherNew = pinned.find(o => o !== x && N.meters(pin, o.rec.set) <= NEAR_M);
      if (other) out.push(`${x.rec.id} -> within ${Math.round(N.meters(pin, other))} m of ${other.id} (${other.name}${other.status === 'pending' ? ', pending' : ''})`);
      else if (otherNew) out.push(`${x.rec.id} -> within ${Math.round(N.meters(pin, otherNew.rec.set))} m of the new pin of ${otherNew.rec.id}`);
    }
    return out;
  };
  try {
    const p = await api.probe();
    if (!p.ok) { add('FAIL', 'production reachable (read)', `HTTP ${p.status}`); return refuse(); }
    if (target.serviceKey) {
      const sp = await api.probe({ service: true });
      if (!sp.ok) { add('FAIL', 'service-role credential accepted by the server', `HTTP ${sp.status} (the key is wrong, revoked, or for another project)`); return refuse(); }
      res.coverage = 'FULL';
      add('PASS', 'service-role credential accepted', 'read probe OK (no write attempted)');
    } else {
      add(mode === 'apply' ? 'FAIL' : 'SKIP', 'service-role credential', 'not provided: pending rows cannot be checked, so this dry-run has PARTIAL coverage and --apply would be refused');
      res.coverage = 'PARTIAL';
    }
    if (fails().length) return refuse();
    const snap = await snapshot();
    res.approvedCount = snap.approved.length;
    const st = snap.states;
    const gone = st.filter(x => x.state === 'missing' || x.state === 'not-approved');
    if (gone.length) { add('FAIL', 'every target gym is an approved spot', sample(gone.map(x => `${x.id} (${x.state})`)) + (res.retires.length && res.coverage !== 'FULL' ? ' -- a retired gym is no longer publicly visible: re-run with the service-role key (FULL coverage) to read it' : '')); return refuse(); }
    const changed = st.filter(x => x.state === 'changed');
    if (changed.length) { add('FAIL', 'production still has the researched content (expect_h)', `${changed.length} gym(s) changed in production since the research and are not in the updated state either: ${sample(changed.map(x => x.id))}. Nothing will be overwritten; re-research them.`); return refuse(); }
    const mf = MF.readManifest(batchDir);
    const mfMismatch = mf.exists ? (mf.valid ? MF.mismatches(mf.manifest, { batchId: res.batchId, payloadSha: res.payloadSha, host: target.host, ids }) : mf.problems) : [];

    // ---- already applied: every gym is in the updated state ------------------------------------------------------------------
    if (count(st, 'after') === ids.length) {
      if (mf.exists && mfMismatch.length) { add('FAIL', 'manifest matches this batch, payload and target', `manifest.json is not valid for this run (${mfMismatch.join('; ')})`); return refuse(); }
      res.state = mf.exists ? 'already-updated' : 'already-present';
      add('PASS', 'idempotent re-run', `all ${ids.length} gyms are already in the applied state (${res.updates.length} new location(s) with every other field unchanged, ${res.retires.length} retired with the recorded reason); NOTHING will be written`);
      const others = driftExcept(snap.approved, index, new Set(ids));
      add(driftTotal(others) ? 'WARN' : 'PASS', 'index vs production (excluding this batch)', driftTotal(others) ? `${driftTotal(others)} other difference(s)` : 'identical');
      if (mode === 'apply' && !mf.exists) {
        const m = manifestFor({ res, batch, target, now, status: 'updated-recovered', before: snap.approved.length, after: snap.approved.length, verification: { ok: true, checked: ids.length, problems: [] }, updated: 0, liveSha: liveStateSha(snap.approved), states: st });
        MF.writeManifest(batchDir, m); res.manifest = m; res.manifestWritten = true;
        add('PASS', 'manifest', 'the updates were already in production but there was no manifest.json; wrote a recovery manifest (a local file; no database write)');
      }
      return done(0);
    }
    if (count(st, 'after')) { add('FAIL', 'no partly applied batch', `${count(st, 'after')} of ${ids.length} gyms are already updated (${sample(st.filter(x => x.state === 'after').map(x => x.id))}) and ${count(st, 'before')} are not; refusing a mixed state (inspect, then split the batch)`); return refuse(); }
    if (mf.exists) { add('FAIL', 'no manifest without the updates', `${MF.MANIFEST} exists but production has none of this batch's updates; investigate before re-running`); return refuse(); }
    res.state = 'fresh';
    if (mode === 'verify') { add('FAIL', 'verify', 'the updates are not in production yet (nothing to verify)'); return refuse(); }
    add('PASS', 'production still has the researched content (expect_h)', `${ids.length} of ${ids.length} gyms unchanged since the research`);

    // ---- fresh path: drift, plan, 60 m rule, token ---------------------------------------------------------------------------
    const dr = drift(snap.approved, index);
    if (driftTotal(dr)) { add('FAIL', 'production has not drifted from the index', `added ${dr.added.length} (${sample(dr.added, 4)}), removed ${dr.removed.length} (${sample(dr.removed, 4)}), changed ${dr.changed.length} (${sample(dr.changed, 4)}); rebuild the index (build-index --live) and re-plan`); return refuse(); }
    add('PASS', 'production matches the index', `${snap.approved.length} approved spots, identical to the index`);
    const plan = await P.planBatch({ dir: batchDir, index });
    const c = plan.counts;
    const allUpdate = (c.update || 0) === res.updates.length && (c.retire || 0) === res.retires.length && !c.new && !c.existing && !c['probable-duplicate'] && !c.invalid && !c.rejected;
    if (!allUpdate || !plan.importable) { add('FAIL', 'every record is (still) an update', `plan: update ${c.update}, retire ${c.retire || 0}, new ${c.new}, existing ${c.existing}, probable-duplicate ${c['probable-duplicate']}, invalid ${c.invalid}, rejected ${c.rejected}; blockers: ${plan.blockers.join(' | ') || 'none'}`); return refuse(); }
    add('PASS', 'every record is an update', `fresh plan: ${c.update || 0} update(s) and ${c.retire || 0} retirement(s), nothing else, no blockers`);
    const pf = path.join(batchDir, 'plan.json');
    if (!fs.existsSync(pf) || JSON.stringify(plan) !== JSON.stringify(JSON.parse(fs.readFileSync(pf, 'utf8')))) { add('FAIL', 'committed plan.json is current', 'plan.json is missing or differs from a fresh plan; re-run "plan", review report.md and commit'); return refuse(); }
    add('PASS', 'committed plan.json is current', `plan ${plan.plan_sha256.slice(0, 12)}…`);
    res.planSha = plan.plan_sha256;
    const near = nearProblems(snap);
    if (near.length) { add('FAIL', `no new pin within ${NEAR_M} m of another gym`, sample(near, 3)); return refuse(); }
    add(res.coverage === 'FULL' ? 'PASS' : 'WARN', `no new pin within ${NEAR_M} m of another gym`, res.coverage === 'FULL' ? `checked against ${snap.approved.length} approved and ${snap.pending.length} pending spots and within the batch` : 'approved spots and the batch only (PARTIAL: pending rows not read)');

    res.liveSha = liveStateSha(snap.approved);
    res.applyReady = res.coverage === 'FULL';
    if (res.applyReady) res.token = confirmToken({ batchId: res.batchId, planSha: plan.plan_sha256, payload: res.payloadSha, host: target.host, kind: target.kind, coverage: 'FULL', liveSha: res.liveSha, retires: res.retires });
    if (mode !== 'apply') { add('PASS', 'dry-run', 'NO WRITES PERFORMED'); return done(0); }

    // ---- apply gates ----------------------------------------------------------------------------------------------------------
    if (!res.applyReady) add('FAIL', 'gate: full preflight coverage', 'apply requires the service-role preflight (FULL coverage)');
    if (!confirm) add('FAIL', 'gate: --confirm', `required: --confirm ${res.token} (printed by the FULL-coverage dry-run for exactly this batch, payload, target and production state)`);
    else if (confirm !== res.token) add('FAIL', 'gate: --confirm', 'the confirmation token does not match this batch/payload/target/production state; re-run the dry-run with the service-role key and read its report');
    else add('PASS', 'gate: --confirm', 'matches');
    if (target.kind === 'production') add(productionFlag ? 'PASS' : 'FAIL', 'gate: --i-understand-this-writes-to-production', productionFlag ? 'given' : 'required for the production target');
    if (fails().length) return refuse();

    // ---- last look immediately before the writes -------------------------------------------------------------------------------
    const before = await snapshot();
    if (!before.pending) { add('FAIL', 'final re-check before write', 'no privileged (pending-row) read available'); return refuse(); }
    const dr2 = drift(before.approved, index), near2 = nearProblems(before), moved = liveStateSha(before.approved) !== res.liveSha, notBefore = before.states.filter(x => x.state !== 'before');
    if (driftTotal(dr2) || near2.length || moved || notBefore.length) { add('FAIL', 'final re-check before write', `production changed during preflight (drift ${driftTotal(dr2)}, pins near a gym ${near2.length}, state hash moved ${moved}, gyms not in the researched state ${notBefore.length}); nothing written`); return refuse(); }
    add('PASS', 'final re-check before write', 'production still identical to the index and to the state the token was issued for; every gym still has its researched content');
    res.beforeCount = before.approved.length;
    res.startedAt = now();

    // ---- the writes: one PATCH per gym, each pinned to the row version seen just above -----------------------------------------
    const gate = T.mintUpdateGate({ batchId: res.batchId, token: res.token, updates: res.updates, retires: res.retires, payloadSha: res.payloadSha });
    let stopped = null;
    for (const u of [...res.updates, ...res.retires]) {
      const updatedAt = before.states.find(x => x.id === u.id).updatedAt;
      try {
        const r = retireIds.has(u.id) ? await api.retireSpot({ id: u.id, reason: u.reason, updatedAt }, gate) : await api.updateSpotLocation({ id: u.id, set: u.set, updatedAt }, gate);
        if (!r.ok) { stopped = `${u.id}: HTTP ${r.status} ${String(r.text).slice(0, 200)}`; break; }
        if (!Array.isArray(r.json) || r.json.length !== 1) { stopped = `${u.id}: ${Array.isArray(r.json) ? r.json.length : 'no'} row(s) matched (the row changed after the final re-check, or is no longer approved)`; break; }
        res.applied.push(u.id);
      } catch (e) { stopped = `${u.id}: no response (${T.redact(e.message, [target.serviceKey, target.anonKey])})`; break; }
    }
    const after = await snapshot();
    const nAfter = count(after.states, 'after');
    res.wrote = nAfter > 0;
    if (stopped) {
      add('FAIL', 'updates', `stopped at ${stopped}`);
      if (!nAfter) { add('PASS', 'post-failure check', 'no gym is in the updated state: nothing was written'); return refuse(); }
      const f = failureFor({ res, batch, target, now, phase: 'partial-update', states: after.states, problems: [stopped] });
      MF.writeFailure(batchDir, f); res.failureWritten = true;
      add('WARN', MF.FAILURE, `${nAfter} of ${ids.length} gyms were updated before the stop; wrote a failure record (NOT manifest.json). Inspect production before doing anything else.`);
      return done(4);
    }
    add('PASS', 'updates', `${res.applied.length} gym(s) updated, one PATCH each, each pinned to the row version checked just before`);

    // ---- post-write verification (read-only) -------------------------------------------------------------------------------------
    const problems = [];
    after.states.forEach(x => { if (x.state !== 'after') problems.push(`${x.id}: ${x.state} (expected ${retireIds.has(x.id) ? "status rejected with the recorded reason" : 'the new location with every other field unchanged'})`); });
    const expectCount = res.beforeCount - res.retires.length;
    if (after.approved.length !== expectCount) problems.push(`approved count ${after.approved.length}, expected ${expectCount} (${res.beforeCount} before; an update never adds or removes a spot, a retirement removes exactly one approved spot each)`);
    const drAfter = driftExcept(after.approved, index, new Set(ids));
    if (driftTotal(drAfter)) problems.push(`other spots changed: added ${drAfter.added.length}, removed ${drAfter.removed.length}, changed ${drAfter.changed.length}`);
    res.verification = { ok: problems.length === 0, checked: ids.length, problems };
    add(problems.length ? 'FAIL' : 'PASS', 'post-update verification', problems.length ? sample(problems, 4) : `all ${ids.length} gyms are in the applied state (${res.updates.length} hold exactly the new ${T.LOCATION_FIELDS.join('/')} with every other field unchanged, ${res.retires.length} are rejected with the recorded reason); approved count ${res.beforeCount} -> ${expectCount}; every other spot unchanged`);
    if (problems.length) {
      MF.writeFailure(batchDir, failureFor({ res, batch, target, now, phase: 'verification-failed', states: after.states, problems }));
      res.failureWritten = true;
      add('WARN', MF.FAILURE, 'wrote a failure record (NOT manifest.json); the updates ARE in production — inspect before re-running');
      return done(4);
    }
    const m = manifestFor({ res, batch, target, now, status: 'updated', before: res.beforeCount, after: after.approved.length, verification: res.verification, updated: res.applied.filter(id => !retireIds.has(id)).length, startedAt: res.startedAt, liveSha: res.liveSha, states: after.states });
    MF.writeManifest(batchDir, m); res.manifest = m; res.manifestWritten = true;
    add('PASS', 'manifest', 'wrote manifest.json (verified update; no credentials in it). Next: rebuild the index (build-index --live)');
    return done(0);
  } catch (e) {
    add('FAIL', 'production reads', T.redact(e.message, [target.serviceKey, target.anonKey]));
    return res.wrote ? done(4) : refuse();
  }
}

// manifest.json for an update batch: written only after the read-back verification passed. No credential of any kind.
function manifestFor({ res, batch, target, now, status, before, after, verification, updated, startedAt, liveSha, states }) {
  return {
    schema_version: 1, updater_version: UPDATER_VERSION, kind: 'update', batch_id: batch.id, status,
    target: { kind: target.kind, host: target.host }, coverage: res.coverage,
    plan_sha256: res.planSha || null, payload_sha256: res.payloadSha, confirm_token: res.token || null, live_state_sha256: liveSha || null,
    rows_updated: updated, approved_before: before, approved_after: after,
    changes: res.updates.map(u => ({ id: u.id, fields: Object.keys(u.set), expect_h: u.expect_h, after_h: (states.find(x => x.id === u.id) || {}).h || null })),
    // Retirements are listed separately (absent for an update-only batch): ids of every gym set to 'rejected', plus the recorded reasons.
    ...(res.retires.length ? { rows_retired: res.retires.length, retired: res.retires.map(r => r.id), retirements: res.retires.map(r => ({ id: r.id, reason_code: r.reason_code, reason: r.reason, ...(r.duplicate_of ? { duplicate_of: r.duplicate_of } : {}), expect_h: r.expect_h })) } : {}),
    verification, started_at: startedAt || now(), finished_at: now(),
    ids: res.ids,                                    // every target (updates and retirements), in record order
  };
}
function failureFor({ res, batch, target, now, phase, states, problems }) {
  return {
    schema_version: 1, updater_version: UPDATER_VERSION, kind: 'update', batch_id: batch.id, status: 'update-failed', phase,
    target: { kind: target.kind, host: target.host }, payload_sha256: res.payloadSha, staged: res.ids.length,
    applied_ids: res.applied, states: states.map(x => ({ id: x.id, state: x.state })), approved_before: res.beforeCount || null,
    problems, started_at: res.startedAt || null, finished_at: now(),
  };
}

// Deterministic (no timestamps).
function renderUpdateReport(res) {
  const L = [];
  const label = { 'dry-run': 'DRY RUN — no writes', verify: 'VERIFY — no writes', apply: 'APPLY' }[res.mode];
  L.push(`# Update preflight: ${res.batchId}  [${label}]`, '');
  L.push(`Target: ${res.target ? `${res.target.kind} (${res.target.host})` : 'unresolved'} | Coverage: ${res.coverage}${res.coverage === 'PARTIAL' ? ' (public reads only)' : ''}${res.state ? ' | State: ' + res.state : ''}`);
  if (res.updates.length || res.retires.length) L.push(`Updates: ${res.updates.length}${res.retires.length ? ` | Retirements: ${res.retires.length}` : ''} | payload sha256 ${res.payloadSha ? res.payloadSha.slice(0, 16) + '…' : '-'}${res.planSha ? ' | plan ' + res.planSha.slice(0, 12) + '…' : ''}`);
  if (res.state === 'fresh') L.push(res.token ? `Confirmation token (required by --apply; bound to this batch, payload, target and production state): ${res.token}` : 'Confirmation token: none (PARTIAL coverage; run the dry-run with the service-role key to obtain one)');
  L.push('', '## Checks');
  res.checks.forEach(c => L.push(`- [${c.status}] ${c.name}${c.detail ? ': ' + c.detail : ''}`));
  if (res.updates.length && res.state === 'fresh' && res.names) {
    const fields = res.updates.reduce((n, u) => n + Object.keys(u.set).length, 0);
    L.push('', `## ${res.mode === 'apply' ? 'Updated' : 'Would update'} (${res.updates.length} gyms, ${fields} field changes; nothing else changes)`, '');
    res.updates.forEach((u, i) => L.push(`${String(i + 1).padStart(3)}. ${u.id}  ${res.names[u.id]}  ${Object.keys(u.set).join('+')}${res.moves[u.id] !== undefined ? `  pin moves ${res.moves[u.id]} m` : ''}`));
  }
  if (res.retires.length && res.state === 'fresh' && res.names) {
    L.push('', `## ${res.mode === 'apply' ? 'Retired' : 'Would retire'} (${res.retires.length} gyms; status becomes rejected with the reason, the record is kept, nothing else changes)`, '');
    res.retires.forEach((r, i) => L.push(`${String(i + 1).padStart(3)}. ${r.id}  ${res.names[r.id]}  ${r.reason_code}${r.duplicate_of ? ' of ' + r.duplicate_of : ''}  "${r.reason}"`));
  }
  const bad = res.checks.filter(c => c.status === 'FAIL').length;
  L.push('', `## Result: ${bad ? 'REFUSED (' + bad + ' failed check' + (bad > 1 ? 's' : '') + ')' + (res.wrote ? ' — SOME UPDATES WERE WRITTEN, see the failure record' : ' — nothing was written') : res.wrote ? 'UPDATED' : res.state && res.state !== 'fresh' ? 'NOTHING TO DO (already in production)' : (res.mode === 'apply' ? 'NOT WRITTEN' : 'PREFLIGHT PASSED' + (res.coverage === 'FULL' ? '' : ' (PARTIAL coverage: --apply needs the service-role read)')) + ' — ' + (res.wrote ? 'production was written' : 'production was NOT written')}`);
  return L.join('\n');
}

module.exports = { runUpdate, stateOf, stateOfRetire, locationProblems, confirmToken, renderUpdateReport, UPDATER_VERSION, MAX_UPDATES };
