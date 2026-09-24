// The production importer: INSERT-ONLY, gated, verifiable. See docs/import-workflow.md ("Production importer").
//
// Modes:  dry-run (default) | verify | apply.  Only `apply` can write, and only after every check and flag below passes.
// It can insert `new` gyms and nothing else: there is no code path that updates, deletes, merges or overwrites a spot.
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
const { canonicalSha } = require('./stage');
const MF = require('./manifest');

const IMPORTER_VERSION = 2;
const MAX_ROWS = 1000;                 // one request = one atomic statement; bigger batches must be split
const HEX_ID = /^g-[0-9a-f]{10,40}$/;
const COLS = ['id', 'name', 'suburb', 'state', 'country', 'lat', 'lng', 'types', 'notes', 'photo', 'address', 'community', 'edited', 'status'];
const sha256 = s => crypto.createHash('sha256').update(s).digest('hex');
const chunk = (a, n) => { const o = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; };

// The exact row that would be inserted. Provenance flags are fixed here, never taken from research data.
function toRow(r, safeUrl) {
  return {
    id: r.id, name: r.name, suburb: r.suburb, state: r.state, country: r.country, lat: r.lat, lng: r.lng, types: [...r.types],
    notes: N.emptyToNull(r.notes), photo: r.photo ? (safeUrl(r.photo) || null) : null, address: N.emptyToNull(r.address),
    community: false, edited: false, status: 'approved',
  };
}
const payloadSha = rows => sha256(JSON.stringify(rows));
// Hash of the live approved spots as observed right now (id + content hash, sorted). Two runs see the same value only if production
// is identical, so binding the token to it means "the state I reviewed is the state you are about to write into".
const liveStateSha = approved => sha256(JSON.stringify(approved.map(r => [r.id, S.toEntry(r).h]).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))));
// The confirmation token binds --apply to: this exact batch, the exact rows that will be inserted (payload), the plan (which embeds the
// index), the target project (host) and kind, the preflight coverage (a PARTIAL public dry-run can never yield a token that --apply
// accepts), the observed live production state, and the importer version. 64 bits: it is an anti-accident confirmation, not a secret.
const confirmToken = ({ batchId, planSha, payload, host, kind, coverage, liveSha }) =>
  sha256(JSON.stringify(['gym-import-confirm', IMPORTER_VERSION, batchId, planSha, payload, host, kind, coverage, liveSha])).slice(0, 16);

// Which fields of a production row differ from the staged row (empty = identical, incl. provenance flags).
function diffRow(row, db) {
  const d = [];
  for (const f of ['name', 'suburb', 'state', 'country']) if (row[f] !== db[f]) d.push(f);
  for (const f of ['lat', 'lng']) if (Number(row[f]) !== Number(db[f])) d.push(f);
  if (JSON.stringify([...row.types].sort()) !== JSON.stringify([...(db.types || [])].sort())) d.push('types');
  for (const f of ['notes', 'photo', 'address']) if (N.emptyToNull(row[f]) !== N.emptyToNull(db[f])) d.push(f);
  if (db.status !== 'approved') d.push('status');
  if (db.community !== false) d.push('community');
  if (db.edited !== false) d.push('edited');
  if (db.submitted_by !== null && db.submitted_by !== undefined) d.push('submitted_by');
  return d;
}

function drift(liveRows, index, ignoreIds = new Set()) {
  const live = new Map(liveRows.filter(r => !ignoreIds.has(r.id)).map(r => [r.id, S.toEntry(r)]));
  return {
    added: [...live.keys()].filter(id => !index.byId.has(id)).sort(),
    removed: [...index.byId.keys()].filter(id => !live.has(id)).sort(),
    changed: [...live.keys()].filter(id => index.byId.has(id) && index.byId.get(id).h !== live.get(id).h).sort(),
  };
}
const driftTotal = d => d.added.length + d.removed.length + d.changed.length;
const sample = (a, n = 6) => a.slice(0, n).join(', ') + (a.length > n ? `, … (+${a.length - n})` : '');

async function runImport(opts) {
  const { batchDir, mode = 'dry-run', confirm = null, productionFlag = false, env = process.env, root = T.ROOT, indexDir = null, now = () => new Date().toISOString() } = opts;
  const checks = [];
  const add = (status, name, detail = '') => checks.push({ status, name, detail });
  const fails = () => checks.filter(c => c.status === 'FAIL');
  const res = { mode, batchId: path.basename(batchDir || ''), checks, state: null, coverage: 'NONE', exit: 0, wrote: false, rows: [], token: null };
  const done = exit => { res.exit = exit; res.report = renderReport(res); return res; };
  const refuse = () => done(2);

  if (!['dry-run', 'verify', 'apply'].includes(mode)) throw new Error('unknown mode ' + mode);
  if (!batchDir || !fs.existsSync(batchDir)) { add('FAIL', 'batch specified', 'an existing batch directory must be given explicitly'); return refuse(); }
  add('PASS', 'batch specified explicitly', res.batchId);

  // ---- target and credentials (offline) -----------------------------------------------------------------------------
  const target = T.resolveTarget(env, { root, requireExplicit: mode === 'apply' });
  res.target = { kind: target.kind, host: target.host };
  target.problems.forEach(p => add('FAIL', 'target', p));
  if (target.problems.length) return refuse();
  add('PASS', 'target', `${target.kind} (${target.host})`);
  if (target.kind === 'production') {
    const inRepo = path.resolve(batchDir).startsWith(path.resolve(root, 'import', 'batches') + path.sep);
    if (!inRepo) add('FAIL', 'production uses repo batches only', 'the batch must live under import/batches/ for a production target');
    if (indexDir) add('FAIL', 'production uses the repo index only', 'an --index override is only allowed for a local target');
    if (fails().length) return refuse();
  }
  const keyProblems = target.serviceKey ? T.validateServiceKey(target.serviceKey, target) : [];
  if (mode === 'apply') {
    (target.serviceKey ? keyProblems : T.validateServiceKey(null, target)).forEach(p => add('FAIL', 'service-role credential', p));
  } else if (target.serviceKey && keyProblems.length) keyProblems.forEach(p => add('FAIL', 'service-role credential', p));
  if (fails().length) return refuse();
  const keyOk = !!target.serviceKey;

  // ---- batch: structure, validation, insert-only, frozen ids ------------------------------------------------------
  const batch = P.loadBatch(batchDir);
  batch.problems.forEach(p => add('FAIL', 'batch metadata', p));
  const recs = [];
  batch.lines.forEach(l => { if (l.parseError) add('FAIL', 'batch records', `line ${l.line}: not valid JSON`); else if (!l.rec || typeof l.rec !== 'object' || Array.isArray(l.rec)) add('FAIL', 'batch records', `line ${l.line}: not an object`); else recs.push({ line: l.line, rec: l.rec }); });
  if (!recs.length) add('FAIL', 'batch has records', 'records.ndjson is empty');
  if (recs.length > MAX_ROWS) add('FAIL', 'batch size', `${recs.length} records exceeds ${MAX_ROWS}; split the batch (one request is one atomic insert)`);
  const nonNew = recs.filter(x => x.rec.intent !== undefined && x.rec.intent !== 'new');
  if (nonNew.length) add('FAIL', 'insert-only', `${nonNew.length} record(s) have intent "${nonNew[0].rec.intent}" (first: line ${nonNew[0].line}); this importer inserts new gyms only and never updates, deletes or merges`);
  let invalid = 0; const firstInvalid = [];
  for (const x of recs) { const v = await V.validateNewRecord(x.rec); if (v.errors.length) { invalid++; if (firstInvalid.length < 3) firstInvalid.push(`line ${x.line}: ${v.errors[0].code} (${v.errors[0].field})`); } }
  if (invalid) add('FAIL', 'records validate', `${invalid} invalid record(s), e.g. ${firstInvalid.join('; ')}`);
  const unfrozen = recs.filter(x => !HEX_ID.test(x.rec.id || ''));
  if (unfrozen.length) add('FAIL', 'every record has a frozen g-<hex> id', `${unfrozen.length} without one (first: line ${unfrozen[0].line}); run freeze-ids and re-plan`);
  const idCount = new Map(); recs.forEach(x => idCount.set(x.rec.id, (idCount.get(x.rec.id) || 0) + 1));
  const dups = [...idCount].filter(([, n]) => n > 1).map(([id]) => id);
  if (dups.length) add('FAIL', 'staged ids are unique', sample(dups));
  if (!fails().length) add('PASS', 'batch valid', `${recs.length} records: schema OK, insert-only, all ids frozen and unique`);
  if (fails().length) return refuse();

  // ---- recorded provenance still valid ---------------------------------------------------------------------------
  const meta = batch.meta, src = (meta && meta.source) || {};
  if (src.staged !== undefined && src.staged !== recs.length) add('FAIL', 'provenance: staged count', `batch.json says ${src.staged}, records.ndjson has ${recs.length}`);
  if (src.not_staged_other && Object.keys(src.not_staged_other).length) add('FAIL', 'provenance: nothing left unresolved', JSON.stringify(src.not_staged_other));
  if (src.decisions) {
    const df = path.resolve(root, src.decisions.file);
    if (!fs.existsSync(df)) add('FAIL', 'provenance: decisions file', `${src.decisions.file} is missing`);
    else {
      const d = JSON.parse(fs.readFileSync(df, 'utf8'));
      if (canonicalSha(d) !== src.decisions.canonical_sha256) add('FAIL', 'provenance: decisions file unchanged', `${src.decisions.file} changed since staging; re-review and re-stage`);
      const banned = new Set([...(src.decisions.rejected_records_excluded || []), ...d.duplicates_removed.map(x => x.remove_final_id || x.remove_repo_id)]);
      const hit = recs.filter(x => banned.has(x.rec.id));
      if (hit.length) add('FAIL', 'provenance: no rejected record staged', sample(hit.map(x => x.rec.id)));
      else add('PASS', 'provenance: decisions', `${src.decisions.file} unchanged; ${banned.size} rejected/duplicate record(s) absent from the batch`);
    }
  } else add('WARN', 'provenance: decisions', 'batch.json records no decisions file');
  if (src.file) {
    const sf = path.resolve(root, src.file);
    if (!fs.existsSync(sf)) add('SKIP', 'provenance: source file', `${src.file} not present here (untracked artefact); batch records are authoritative`);
    else { try { add(canonicalSha(JSON.parse(fs.readFileSync(sf, 'utf8'))) === src.canonical_sha256 ? 'PASS' : 'WARN', 'provenance: source file', canonicalSha(JSON.parse(fs.readFileSync(sf, 'utf8'))) === src.canonical_sha256 ? `${src.file} still matches` : `${src.file} has changed since staging (informational: the batch is frozen)`); } catch (e) { add('WARN', 'provenance: source file', 'unreadable'); } }
  }
  if (fails().length) return refuse();

  // ---- local index --------------------------------------------------------------------------------------------------
  let index;
  try { index = S.load(indexDir ? path.resolve(indexDir) : path.join(root, 'import', 'index')); } catch (e) { add('FAIL', 'match index', e.message); return refuse(); }
  if (!index.metaMatches) { add('FAIL', 'match index integrity', 'index-meta.json does not match gym-index.ndjson'); return refuse(); }
  add('PASS', 'match index integrity', `${index.entries.length} gyms, sha256 ${index.sha256.slice(0, 12)}…`);

  // ---- live production reads (read-only) ----------------------------------------------------------------------------
  const api = opts.api || new T.Api(target);
  const ids = recs.map(x => x.rec.id);
  const live = {};
  const snapshot = async () => {
    const approved = await api.getAll('/rest/v1/spots?select=*&status=eq.approved&order=id');
    const byId = new Map(approved.map(r => [r.id, r]));
    let all = new Map(byId), pending = null;
    if (res.coverage === 'FULL') {
      for (const part of chunk(ids, 100)) for (const r of await api.getAll(`/rest/v1/spots?select=*&id=in.(${part.join(',')})&order=id`, { service: true })) all.set(r.id, r);
      pending = await api.getAll('/rest/v1/spots?select=*&status=eq.pending&order=id', { service: true });
    }
    return { approved, byId, presentRows: ids.filter(id => all.has(id)).map(id => all.get(id)), pending };
  };
  try {
    const p = await api.probe();
    if (!p.ok) { add('FAIL', 'production reachable (read)', `HTTP ${p.status}`); return refuse(); }
    if (keyOk) {
      const sp = await api.probe({ service: true });
      if (!sp.ok) { add('FAIL', 'service-role credential accepted by the server', `HTTP ${sp.status} (the key is wrong, revoked, or for another project)`); return refuse(); }
      res.coverage = 'FULL';
      add('PASS', 'service-role credential accepted', 'read probe OK (no write attempted)');
    } else {
      add(mode === 'apply' ? 'FAIL' : 'SKIP', 'service-role credential', 'not provided: pending rows and non-approved ids cannot be checked, so this dry-run has PARTIAL coverage and --apply would be refused');
      res.coverage = 'PARTIAL';
    }
    if (fails().length) return refuse();
    const snap = await snapshot();
    res.liveApprovedCount = snap.approved.length;

    // ---- where are we? nothing imported / all imported / something in between --------------------------------
    const present = snap.presentRows, N_ = ids.length;
    const rows = []; for (const x of recs) rows.push(toRow(x.rec, (await V.deps()).safeUrl));
    res.rows = rows;
    res.payloadSha = payloadSha(rows);
    // A manifest is an OUTPUT of a previous import, never a precondition: a pre-import dry-run needs none. If one exists it is validated
    // against this batch, the exact payload and this target; it can only cause a refusal or a label, never make a check pass.
    const mf = MF.readManifest(batchDir);
    const mfMismatch = mf.exists ? (mf.valid ? MF.mismatches(mf.manifest, { batchId: res.batchId, payloadSha: res.payloadSha, host: target.host, ids }) : mf.problems) : [];
    if (fs.existsSync(path.join(batchDir, MF.FAILURE))) add('WARN', 'previous failed import attempt', `${MF.FAILURE} exists; production state below is what counts`);

    if (present.length === N_) {
      const bad = []; rows.forEach(r => { const d = diffRow(r, snap.byId.get(r.id) || present.find(p2 => p2.id === r.id)); if (d.length) bad.push(`${r.id}: ${d.join('/')}`); });
      if (bad.length) { add('FAIL', 'already in production, content differs', `${bad.length} staged id(s) exist with different content, e.g. ${sample(bad, 3)}. The importer will not overwrite an existing spot.`); return refuse(); }
      if (mf.exists && mfMismatch.length) { add('FAIL', 'manifest matches this batch, payload and target', `manifest.json is not valid for this run (${mfMismatch.join('; ')}); it is ignored for decisions but blocks a silent "already imported"`); return refuse(); }
      res.state = mf.exists ? 'already-imported' : 'already-present';
      add('PASS', 'idempotent re-run', `all ${N_} staged ids already exist in production with identical content; NOTHING will be written`);
      const others = drift(snap.approved, index, new Set(ids));
      add(driftTotal(others) ? 'WARN' : 'PASS', 'index vs production (excluding this batch)', driftTotal(others) ? `${driftTotal(others)} other difference(s); rebuild the index after reviewing` : 'identical');
      if (mode === 'apply' && !mf.exists) {
        const m = manifestFor({ res, batch, target, now, status: 'imported-recovered', before: null, after: snap.approved.length, verification: { ok: true, checked: N_, problems: [] }, inserted: 0, liveSha: liveStateSha(snap.approved) });
        MF.writeManifest(batchDir, m); res.manifest = m; res.manifestWritten = true;
        add('PASS', 'manifest', 'batch was already in production (identical content) but had no manifest.json; wrote a recovery manifest (a local file; no database write)');
      }
      return done(0);
    }
    if (present.length) { add('FAIL', 'staged ids absent from production', `${present.length} of ${N_} staged ids already exist (${sample(present.map(p2 => p2.id))}); refusing a partial/mixed state`); return refuse(); }
    if (mf.exists) { add('FAIL', 'no manifest without rows', `${MF.MANIFEST} exists but production has none of the staged rows${mfMismatch.length ? ` (and it does not match this run: ${mfMismatch.join('; ')})` : ''}; refusing to import on top of a claimed import — investigate, then remove the file only if the rows are genuinely gone`); return refuse(); }
    res.state = 'fresh';
    if (mode === 'verify') { add('FAIL', 'verify', 'the batch is not in production yet (nothing to verify)'); return refuse(); }
    add('PASS', 'staged ids absent from production', `${N_} of ${N_} absent` + (res.coverage === 'FULL' ? ' (all statuses checked with the service-role read)' : ' (approved rows only: PARTIAL)'));

    // ---- fresh path: drift, classification, dedupe, plan ---------------------------------------------------------
    const dr = drift(snap.approved, index);
    if (driftTotal(dr)) { add('FAIL', 'production has not drifted from the index', `added ${dr.added.length} (${sample(dr.added, 4)}), removed ${dr.removed.length} (${sample(dr.removed, 4)}), changed ${dr.changed.length} (${sample(dr.changed, 4)}); rebuild the index (build-index --live) and re-plan`); return refuse(); }
    add('PASS', 'production matches the index', `${snap.approved.length} approved spots, identical to the index`);

    const plan = await P.planBatch({ dir: batchDir, index });
    const c = plan.counts;
    const allNew = c.new === N_ && !c.existing && !c.update && !c['probable-duplicate'] && !c.invalid && !c.rejected;
    if (!allNew || !plan.importable) { add('FAIL', 'every staged record is (still) new', `plan: new ${c.new}, existing ${c.existing}, update ${c.update}, probable-duplicate ${c['probable-duplicate']}, invalid ${c.invalid}, rejected ${c.rejected}; blockers: ${plan.blockers.join(' | ') || 'none'}`); return refuse(); }
    add('PASS', 'every staged record is new', `fresh plan: ${c.new} new, 0 existing, 0 update, 0 probable-duplicate, 0 invalid, 0 rejected, no blockers`);
    const pf = path.join(batchDir, 'plan.json');
    if (!fs.existsSync(pf) || JSON.stringify(plan) !== JSON.stringify(JSON.parse(fs.readFileSync(pf, 'utf8')))) { add('FAIL', 'committed plan.json is current', 'plan.json is missing or differs from a fresh plan; re-run "plan", review report.md and commit'); return refuse(); }
    add('PASS', 'committed plan.json is current', `plan ${plan.plan_sha256.slice(0, 12)}…`);
    const staged = meta.index_at_staging && meta.index_at_staging.sha256;
    add(staged === index.sha256 ? 'PASS' : 'WARN', 'index at staging', staged === index.sha256 ? 'unchanged since the batch was staged' : 'the index changed since staging, but the plan was re-derived against the current index and is clean');
    res.planSha = plan.plan_sha256;

    if (res.coverage === 'FULL') {
      const clash = [];
      for (const x of recs) { const pool = snap.pending.filter(p2 => p2.country === x.rec.country); const s = M.scan(x.rec, pool, { forceProbable: true }); if (s.probable.length) clash.push(`${x.rec.id} ~ ${s.probable[0].id} (${s.probable[0].reason}, ${s.probable[0].dist_m} m)`); }
      if (clash.length) { add('FAIL', 'no staged record duplicates a pending submission', `${clash.length}: ${sample(clash, 3)}`); return refuse(); }
      add('PASS', 'no staged record duplicates a pending submission', `${snap.pending.length} pending row(s) checked`);
    } else add('SKIP', 'pending submissions', 'not checked without a service-role read');

    res.liveSha = liveStateSha(snap.approved);
    res.applyReady = res.coverage === 'FULL';
    // A token exists only for a FULL-coverage (service-role) preflight. A PARTIAL public dry-run has none, and even a token computed
    // from one could never match, because coverage is part of what it is bound to.
    if (res.applyReady) res.token = confirmToken({ batchId: res.batchId, planSha: plan.plan_sha256, payload: res.payloadSha, host: target.host, kind: target.kind, coverage: 'FULL', liveSha: res.liveSha });

    if (mode !== 'apply') { add('PASS', 'dry-run', 'NO WRITES PERFORMED'); return done(0); }

    // ---- apply gates -----------------------------------------------------------------------------------------------------
    if (!res.applyReady) add('FAIL', 'gate: full preflight coverage', 'apply requires the service-role preflight (FULL coverage)');
    if (!confirm) add('FAIL', 'gate: --confirm', `required: --confirm ${res.token} (printed by the FULL-coverage dry-run for exactly this batch, payload, target and production state)`);
    else if (confirm !== res.token) add('FAIL', 'gate: --confirm', 'the confirmation token does not match this batch/payload/target/production state (a token from a partial dry-run never matches); re-run the dry-run with the service-role key and read its report');
    else add('PASS', 'gate: --confirm', 'matches');
    if (target.kind === 'production') add(productionFlag ? 'PASS' : 'FAIL', 'gate: --i-understand-this-writes-to-production', productionFlag ? 'given' : 'required for the production target');
    if (fails().length) return refuse();

    // ---- last look immediately before the write -------------------------------------------------------------------
    // Nothing but this re-check, the gate mint and the INSERT separates the checks from the write. Any difference (a row added, removed
    // or CHANGED, a staged id now present, a new pending clash) is a refusal: the importer never tries to reconcile.
    const before = await snapshot();
    if (!before.pending) { add('FAIL', 'final re-check before write', 'no privileged (pending-row) read available'); return refuse(); }
    const dr2 = drift(before.approved, index);
    const clash2 = before.pending.filter(p2 => recs.some(x => M.scan(x.rec, [p2], { forceProbable: true }).probable.length));
    const liveMoved = liveStateSha(before.approved) !== res.liveSha;
    if (before.presentRows.length || driftTotal(dr2) || clash2.length || liveMoved) { add('FAIL', 'final re-check before write', `production changed during preflight (present ${before.presentRows.length}, drift ${driftTotal(dr2)}, pending clashes ${clash2.length}, state hash moved ${liveMoved}); nothing written`); return refuse(); }
    add('PASS', 'final re-check before write', 'production still identical to the index and to the state the token was issued for; ids still absent');
    res.beforeCount = before.approved.length;
    res.startedAt = now();

    const gate = T.mintWriteGate({ batchId: res.batchId, token: res.token, rows, payloadSha: res.payloadSha });
    let outcomeUnknown = false;
    try {
      const r = await api.insertSpots(rows, gate);
      res.wrote = r.ok;
      if (!r.ok) { add('FAIL', 'insert', `HTTP ${r.status}: ${String(r.text).slice(0, 300)}. The insert is a single atomic statement, so nothing was written.`); const chk = await snapshot(); if (chk.presentRows.length) { add('FAIL', 'post-failure check', `${chk.presentRows.length} staged row(s) unexpectedly present; inspect production before retrying`); return done(4); } return refuse(); }
    } catch (e) { outcomeUnknown = true; add('WARN', 'insert', `no response (${e.message}); checking what happened`); }
    const after = await snapshot();
    if (outcomeUnknown && after.presentRows.length === 0) { add('FAIL', 'insert', 'the request did not complete and no staged row exists; nothing was written. Safe to re-run after checking connectivity.'); return done(4); }
    res.wrote = after.presentRows.length > 0;
    if (after.presentRows.length !== N_) {
      // Cannot happen for one atomic INSERT unless something else touched production; never described as a success.
      add('FAIL', 'insert', `${after.presentRows.length} of ${N_} staged rows exist after the insert; this is a partial/unknown state`);
      const f = failureFor({ res, batch, target, now, phase: 'partial-or-unknown-outcome', present: after.presentRows.map(x => x.id), problems: [`${after.presentRows.length} of ${N_} staged ids exist`] });
      MF.writeFailure(batchDir, f); res.failureWritten = true;
      add('WARN', MF.FAILURE, 'wrote a failure record (NOT manifest.json); inspect production before doing anything else');
      return done(4);
    }
    add('PASS', 'insert', `all ${N_} row(s) written in one atomic statement`);

    // ---- post-import verification (read-only) -----------------------------------------------------------------------
    const problems = [];
    rows.forEach(r => { const db = after.presentRows.find(x => x.id === r.id); if (!db) return; const d = diffRow(r, db); if (d.length) problems.push(`${r.id}: ${d.join('/')}`); });
    if (after.approved.length !== res.beforeCount + N_) problems.push(`approved count ${after.approved.length}, expected ${res.beforeCount + N_}`);
    const drAfter = drift(after.approved, index, new Set(ids));
    if (driftTotal(drAfter)) problems.push(`pre-existing spots changed: added ${drAfter.added.length}, removed ${drAfter.removed.length}, changed ${drAfter.changed.length}`);
    res.verification = { ok: problems.length === 0, checked: N_, problems };
    add(problems.length ? 'FAIL' : 'PASS', 'post-import verification', problems.length ? sample(problems, 4) : `all ${N_} rows present and identical to the staged content; approved ${res.beforeCount} → ${after.approved.length}; every pre-existing spot unchanged`);
    if (problems.length) {
      // manifest.json means "imported and verified". A failed verification must never leave one behind.
      MF.writeFailure(batchDir, failureFor({ res, batch, target, now, phase: 'verification-failed', present: after.presentRows.map(x => x.id), problems }));
      res.failureWritten = true;
      add('WARN', MF.FAILURE, 'wrote a failure record (NOT manifest.json); the rows ARE in production — inspect before re-running');
      return done(4);
    }
    const m = manifestFor({ res, batch, target, now, status: 'imported', before: res.beforeCount, after: after.approved.length, verification: res.verification, inserted: after.presentRows.length, startedAt: res.startedAt, liveSha: res.liveSha });
    MF.writeManifest(batchDir, m); res.manifest = m; res.manifestWritten = true;
    add('PASS', 'manifest', 'wrote manifest.json (verified import; no credentials in it)');
    return done(0);
  } catch (e) {
    add('FAIL', 'production reads', T.redact(e.message, [target.serviceKey, target.anonKey]));
    return res.wrote ? done(4) : refuse();
  }
}

// manifest.json: the record of a VERIFIED import (status 'imported') or a verified recovery ('imported-recovered'). Written only after the
// read-back verification passed. Contains no credential of any kind (no key, no key fragment, no request headers).
function manifestFor({ res, batch, target, now, status, before, after, verification, inserted, startedAt, liveSha }) {
  return {
    schema_version: 1, importer_version: IMPORTER_VERSION, batch_id: batch.id, status,
    target: { kind: target.kind, host: target.host },
    coverage: res.coverage,
    plan_sha256: res.planSha || null, payload_sha256: res.payloadSha, confirm_token: res.token || null, live_state_sha256: liveSha || null,
    rows_inserted: inserted, approved_before: before, approved_after: after,
    verification, started_at: startedAt || now(), finished_at: now(),
    ids: res.rows.map(r => r.id),
  };
}
// import-failure.json: a write that did not verify (or an unknown outcome). Never named or shaped like a manifest.
function failureFor({ res, batch, target, now, phase, present, problems }) {
  return {
    schema_version: 1, importer_version: IMPORTER_VERSION, batch_id: batch.id, status: 'import-failed', phase,
    target: { kind: target.kind, host: target.host }, payload_sha256: res.payloadSha, staged: res.rows.length,
    staged_ids_present_in_production: present, approved_before: res.beforeCount, problems, started_at: res.startedAt || null, finished_at: now(),
  };
}

// Deterministic (no timestamps): identical inputs and production state give an identical report.
function renderReport(res) {
  const L = [];
  const label = { 'dry-run': 'DRY RUN — no writes', verify: 'VERIFY — no writes', apply: 'APPLY' }[res.mode];
  L.push(`# Import preflight: ${res.batchId}  [${label}]`, '');
  L.push(`Target: ${res.target ? `${res.target.kind} (${res.target.host})` : 'unresolved'} | Coverage: ${res.coverage}${res.coverage === 'PARTIAL' ? ' (public reads only)' : ''}${res.state ? ' | State: ' + res.state : ''}`);
  if (res.rows.length) L.push(`Rows: ${res.rows.length} | payload sha256 ${res.payloadSha ? res.payloadSha.slice(0, 16) + '…' : '-'}${res.planSha ? ' | plan ' + res.planSha.slice(0, 12) + '…' : ''}`);
  if (res.state === 'fresh') L.push(res.token ? `Confirmation token (required by --apply; bound to this batch, payload, target and production state): ${res.token}` : 'Confirmation token: none (PARTIAL coverage; run the dry-run with the service-role key to obtain one)');
  L.push('', '## Checks');
  res.checks.forEach(c => L.push(`- [${c.status}] ${c.name}${c.detail ? ': ' + c.detail : ''}`));
  if (res.rows.length && res.state === 'fresh') {
    const cc = {}; res.rows.forEach(r => { cc[r.country] = (cc[r.country] || 0) + 1; });
    L.push('', `## ${res.mode === 'apply' ? 'Inserted' : 'Would insert'} (${res.rows.length} new spots, all status=approved, community=false, edited=false)`, 'By country: ' + Object.entries(cc).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([k, v]) => `${k} ${v}`).join(', '), '');
    res.rows.forEach((r, i) => L.push(`${String(i + 1).padStart(3)}. ${r.id}  ${r.country}  ${r.name}`));
  }
  const bad = res.checks.filter(c => c.status === 'FAIL').length;
  L.push('', `## Result: ${bad ? 'REFUSED (' + bad + ' failed check' + (bad > 1 ? 's' : '') + ') — nothing was written' : res.wrote ? 'IMPORTED' : res.state && res.state !== 'fresh' ? 'NOTHING TO DO (already in production)' : (res.mode === 'apply' ? 'NOT WRITTEN' : 'PREFLIGHT PASSED' + (res.coverage === 'FULL' ? '' : ' (PARTIAL coverage: --apply needs the service-role read)')) + ' — ' + (res.wrote ? 'production was written' : 'production was NOT written')}`);
  return L.join('\n');
}

module.exports = { runImport, toRow, payloadSha, confirmToken, liveStateSha, diffRow, drift, renderReport, MAX_ROWS, COLS, IMPORTER_VERSION };
