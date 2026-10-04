// Batch loading, classification and the plan (dry-run) object. Pure with respect to production: reads a batch directory and
// the local match index, returns a plan. Nothing here can write to Supabase.
//
// Classes:  new | existing | update | retire | probable-duplicate | invalid | rejected
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const N = require('./normalize');
const V = require('./validate');
const M = require('./match');
const store = require('./index-store');
const { isImported } = require('./manifest');

const BATCH_DIR_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]{1,60}$/;
const VISIBLE = ['name', 'suburb', 'state', 'lat', 'lng', 'address', 'types'];   // fields the index can compare directly

function readNdjson(file) {
  const out = [];
  if (!fs.existsSync(file)) return out;
  fs.readFileSync(file, 'utf8').split('\n').forEach((raw, i) => {
    if (!raw.trim()) return;
    try { out.push({ line: i + 1, rec: JSON.parse(raw) }); } catch (e) { out.push({ line: i + 1, parseError: e.message }); }
  });
  return out;
}

function loadBatch(dir) {
  const id = path.basename(dir);
  const metaFile = path.join(dir, 'batch.json');
  const problems = [];
  let meta = null;
  if (!BATCH_DIR_RE.test(id)) problems.push(`batch directory name "${id}" must look like YYYY-MM-DD-short-slug`);
  if (!fs.existsSync(metaFile)) problems.push('batch.json is missing');
  else {
    try { meta = JSON.parse(fs.readFileSync(metaFile, 'utf8')); } catch (e) { problems.push('batch.json is not valid JSON'); }
    if (meta && meta.batch_id !== id) problems.push(`batch.json batch_id (${meta.batch_id}) does not match the directory name (${id})`);
    if (meta && meta.schema_version !== 1) problems.push('batch.json schema_version must be 1');
    if (meta && (!meta.description || String(meta.description).length < 5)) problems.push('batch.json needs a description');
  }
  const lines = readNdjson(path.join(dir, 'records.ndjson'));
  const decFile = path.join(dir, 'decisions.json');
  let decisions = {};
  if (fs.existsSync(decFile)) {
    try { decisions = JSON.parse(fs.readFileSync(decFile, 'utf8')).decisions || {}; } catch (e) { problems.push('decisions.json is not valid JSON'); }
  }
  const imported = isImported(dir);   // a well-formed manifest that says 'imported'; a stray/failed/forged file does not count
  return { id, dir, meta, lines, decisions, problems, imported };
}

// Other, not-yet-imported batches: their new records count as "staged" gyms to compare against (never as existing).
function loadStaged(batchesDir, exceptId) {
  const out = [];
  if (!fs.existsSync(batchesDir)) return out;
  for (const name of fs.readdirSync(batchesDir).sort()) {
    if (name === exceptId || !BATCH_DIR_RE.test(name)) continue;
    const dir = path.join(batchesDir, name);
    if (!fs.statSync(dir).isDirectory() || isImported(dir)) continue;
    for (const { rec } of readNdjson(path.join(dir, 'records.ndjson'))) {
      if (!rec || rec.intent === 'update' || typeof rec.lat !== 'number' || typeof rec.lng !== 'number' || !rec.country || !rec.name) continue;
      out.push({ id: rec.id || null, name: rec.name, country: rec.country, state: rec.state, suburb: rec.suburb, lat: rec.lat, lng: rec.lng, address: rec.address || null, batch: name });
    }
  }
  return out;
}

const normalisedForHash = (rec, safeUrl) => ({ ...rec, photo: rec.photo ? (safeUrl(rec.photo) || rec.photo) : null });

function diffVisible(rec, e) {
  const out = [];
  for (const f of VISIBLE) {
    const a = f === 'types' ? [...(rec.types || [])].sort() : (f === 'address' ? N.emptyToNull(rec.address) : rec[f]);
    const b = f === 'types' ? [...(e.types || [])].sort() : (f === 'address' ? N.emptyToNull(e.address) : e[f]);
    if (JSON.stringify(a) !== JSON.stringify(b)) out.push(f);
  }
  return out;
}

// Duplicate protection for an identity update: would gym `e`, with the new name/suburb in `set`, look like ANOTHER existing gym (same country, the
// matcher's evaluatePair rules)? `batchSets` = id -> set of the other identity updates in this batch, so two gyms renamed to related names nearby are
// caught too. A pair already flagged before the change is not "made" by it, unless the change adds a name-based reason to a non-name one (co-located
// gyms that now also share a name). Returns [{id, name, reason, dist_m, inBatch}].
const NAME_DRIVEN = new Set(['same-name', 'same-address-related-name', 'same-name-but-pin-differs', 'same-name-same-suburb-far-pin', 'renamed-or-related-name-nearby', 'similar-name-nearby']);
const withIdentity = (g, set) => ({ ...g, name: set.name !== undefined ? set.name : g.name, suburb: set.suburb !== undefined ? set.suburb : g.suburb });
function identityDuplicates(e, set, index, batchSets) {
  if (set.name === undefined && set.suburb === undefined) return [];   // type tags take no part in duplicate detection
  const after = withIdentity(e, set), out = [];
  for (const o of index.byCountry.get(e.country) || []) {
    if (o.id === e.id) continue;
    const oAfter = batchSets.has(o.id) ? withIdentity(o, batchSets.get(o.id)) : o;
    const a = M.evaluatePair(after, oAfter);
    if (!a) continue;
    const b = M.evaluatePair(e, o);
    if (b && !(NAME_DRIVEN.has(a.reason) && !NAME_DRIVEN.has(b.reason))) continue;
    out.push({ id: o.id, name: oAfter.name, reason: a.reason, dist_m: a.dist_m, inBatch: batchSets.has(o.id) });
  }
  return out.sort((x, y) => x.dist_m - y.dist_m || (x.id < y.id ? -1 : 1));
}

async function planBatch({ dir, index, batchesDir, includeStaged = true }) {
  const d = await V.deps();
  const batch = loadBatch(dir);
  const staged = includeStaged ? loadStaged(batchesDir || path.dirname(dir), batch.id) : [];
  const stagedByCountry = new Map();
  staged.forEach(s => { if (!stagedByCountry.has(s.country)) stagedByCountry.set(s.country, []); stagedByCountry.get(s.country).push(s); });

  const items = [];        // one per non-blank line
  for (const { line, rec, parseError } of batch.lines) {
    const it = { line, rec, errors: [], warnings: [], cls: null };
    if (parseError) { it.errors.push({ code: 'bad-json', field: null, message: 'line is not valid JSON: ' + parseError }); it.cls = 'invalid'; }
    else if (!rec || typeof rec !== 'object' || Array.isArray(rec)) { it.errors.push({ code: 'bad-record', field: null, message: 'line must be a JSON object' }); it.cls = 'invalid'; }
    else {
      it.intent = rec.intent === 'update' ? 'update' : rec.intent === 'retire' ? 'retire' : 'new';
      const v = it.intent === 'update' ? await V.validateUpdateRecord(rec) : it.intent === 'retire' ? await V.validateRetireRecord(rec) : await V.validateNewRecord(rec);
      it.errors.push(...v.errors); it.warnings.push(...v.warnings);
      if (it.errors.length) it.cls = 'invalid';
    }
    items.push(it);
  }

  // ---- maintenance records: one record per gym (an id may not be updated twice, retired twice, or both updated and retired) ----
  // Only groups that involve a retire are flagged here; the updater has always refused duplicate updates on its own.
  const maint = new Map();
  items.forEach(it => { if (it.cls !== 'invalid' && (it.intent === 'update' || it.intent === 'retire') && typeof it.rec.id === 'string') { if (!maint.has(it.rec.id)) maint.set(it.rec.id, []); maint.get(it.rec.id).push(it); } });
  for (const [id, group] of maint) {
    if (group.length > 1 && group.some(it => it.intent === 'retire')) group.forEach(it => { it.errors.push({ code: 'one-record-per-gym', field: 'id', message: `${id} appears in ${group.length} update/retire records of this batch; one record per gym (a gym cannot be both updated and retired)` }); it.cls = 'invalid'; });
  }
  const retiringIds = new Set(items.filter(it => it.intent === 'retire' && it.rec && typeof it.rec.id === 'string').map(it => it.rec.id));

  // ---- ids: frozen ones are checked; missing ones get a provisional id (order-independent) ------------------------------
  const used = new Set([...index.byId.keys(), ...staged.map(s => s.id).filter(Boolean)]);
  const frozenCount = new Map();
  items.forEach(it => { if (it.cls !== 'invalid' && it.intent === 'new' && it.rec.id) frozenCount.set(it.rec.id, (frozenCount.get(it.rec.id) || 0) + 1); });
  for (const it of items) {
    if (it.cls === 'invalid' || it.intent !== 'new') continue;
    if (it.rec.id) {
      it.id = it.rec.id; it.frozen = true;
      if (frozenCount.get(it.id) > 1) { it.errors.push({ code: 'duplicate-id-in-batch', field: 'id', message: `id ${it.id} is used by more than one line in this batch` }); it.cls = 'invalid'; }
      else if (staged.some(s => s.id === it.id)) { it.errors.push({ code: 'id-in-other-batch', field: 'id', message: `id ${it.id} is already used by another staged batch` }); it.cls = 'invalid'; }
    }
  }
  for (const it of items) if (it.id) used.add(it.id);
  const needId = items.filter(it => it.cls !== 'invalid' && it.intent === 'new' && !it.id).sort((a, b) => N.idHash(a.rec) < N.idHash(b.rec) ? -1 : N.idHash(a.rec) > N.idHash(b.rec) ? 1 : a.line - b.line);
  for (const it of needId) { it.id = N.deriveId(it.rec, used); used.add(it.id); it.frozen = false; }

  // ---- human decisions -------------------------------------------------------------------------------------------------
  const decisions = batch.decisions, usedDecisions = new Set();
  const decisionFor = it => (it.id && decisions[it.id]) || null;
  for (const it of items) {
    if (it.cls === 'invalid' || it.intent !== 'new') continue;
    const dec = decisionFor(it);
    if (dec && dec.decision === 'reject') { it.cls = 'rejected'; it.decision = dec; usedDecisions.add(it.id); }
  }

  // ---- match new records against the index (existing gyms) and staged batches -----------------------------------------
  for (const it of items) {
    if (it.cls !== null || it.intent !== 'new') continue;
    const r = it.rec, pool = index.byCountry.get(r.country) || [];
    const { existing, probable, nearestSameCountryM } = M.scan(r, pool);
    it.candidates = probable.slice();
    const sc = M.scan(r, stagedByCountry.get(r.country) || [], { forceProbable: true });
    sc.probable.forEach(c => it.candidates.push(c));
    if (pool.length && nearestSameCountryM > M.T.FAR_FROM_COUNTRY_M) it.warnings.push({ code: 'far-from-country', field: 'lat', message: `nearest known ${r.country} gym is ${Math.round(nearestSameCountryM / 1000)} km away -- check coordinates/country` });

    const anchor = it.rec.id ? index.byId.get(it.rec.id) : null;
    if (anchor) {
      const nameEq = N.n1(anchor.name) === N.n1(r.name) && !!N.n1(r.name);
      const dist = Math.round(N.meters(r, anchor));
      if (anchor.country === r.country && (nameEq || dist <= M.T.ID_CONFIRM_M)) { it.match = { id: anchor.id, name: anchor.name, tier: 'existing', reason: 'id-confirmed-by-content', dist_m: dist }; it.cls = 'existing'; }
      else { it.errors.push({ code: 'id-collision', field: 'id', message: `id ${anchor.id} already belongs to a different gym in production ("${anchor.name}", ${anchor.country}, ${dist} m away)` }); it.cls = 'invalid'; }
      const others = existing.filter(c => c.id !== anchor.id);
      if (it.cls === 'existing' && others.length) it.warnings.push({ code: 'also-matches', field: null, message: 'also matches other existing gym(s): ' + others.map(c => c.id).join(', ') });
      continue;
    }
    if (it.rec.id && !/^g-/.test(it.rec.id)) { it.errors.push({ code: 'legacy-id-unknown', field: 'id', message: `id ${it.rec.id} is a legacy (seed-/community-) id but no such gym exists in production; new gyms must use g-<hex> ids (run freeze-ids)` }); it.cls = 'invalid'; continue; }
    if (existing.length) {
      const pick = M.pickExisting(existing);
      if (pick.match) {
        it.match = pick.match; it.cls = 'existing';
        if (it.rec.id) it.warnings.push({ code: 'id-ignored', field: 'id', message: `record id ${it.rec.id} is not the existing gym's id; the existing id ${pick.match.id} is authoritative` });
      } else { it.candidates = [...pick.ambiguous, ...it.candidates.filter(c => !pick.ambiguous.some(a => a.id === c.id))]; it.reason = 'ambiguous-existing-match'; it.cls = 'probable-duplicate'; }
      continue;
    }
    if (it.candidates.length) it.cls = 'probable-duplicate'; else it.cls = 'new';
  }

  // ---- within-batch duplicates: among records still "new", flag both sides (order-independent) ------------------------
  const pending = items.filter(it => it.cls === 'new');
  const byCountry = new Map();
  pending.forEach(it => { const c = it.rec.country; if (!byCountry.has(c)) byCountry.set(c, []); byCountry.get(c).push(it); });
  for (const group of byCountry.values()) {
    for (const it of group) {
      const pool = group.filter(o => o !== it).map(o => ({ id: o.id, name: o.rec.name, country: o.rec.country, state: o.rec.state, suburb: o.rec.suburb, lat: o.rec.lat, lng: o.rec.lng, address: o.rec.address || null, batch: '(this batch)' }));
      const s = M.scan(it.rec, pool, { forceProbable: true });
      if (s.probable.length) it.inBatch = s.probable;
    }
  }
  for (const it of pending) if (it.inBatch) { it.candidates = [...(it.candidates || []), ...it.inBatch]; it.cls = 'probable-duplicate'; }

  // ---- apply decisions to probable-duplicates -------------------------------------------------------------------------
  for (const it of items) {
    if (it.cls !== 'probable-duplicate') continue;
    const dec = decisionFor(it);
    if (!dec) continue;
    usedDecisions.add(it.id);
    const candIds = it.candidates.map(c => c.id).filter(Boolean);
    if (dec.decision === 'distinct') {
      const reviewed = new Set(dec.reviewed_against || []);
      const unseen = candIds.filter(id => !reviewed.has(id));
      if (!dec.reason || String(dec.reason).length < 8) it.decisionNote = 'decision ignored: "reason" (>= 8 chars) is required';
      else if (unseen.length) it.decisionNote = 'decision is stale: new candidate(s) not covered by reviewed_against: ' + unseen.join(', ');
      else { it.cls = 'new'; it.decision = dec; it.reviewedDistinct = true; }
    } else if (dec.decision === 'same-as') {
      if (dec.same_as && it.candidates.some(c => c.id === dec.same_as && !c.batch)) {
        const c = it.candidates.find(x => x.id === dec.same_as); it.match = { ...c, reason: 'human-reviewed: ' + c.reason }; it.cls = 'existing'; it.decision = dec;
      } else it.decisionNote = 'decision ignored: same_as must be one of the candidate ids that exist in production';
    } else it.decisionNote = `decision ignored: unknown decision "${dec.decision}"`;
  }

  // ---- classify existing matches: same content? pin moved? -----------------------------------------------------------
  for (const it of items) {
    if (it.cls !== 'existing' || it.intent !== 'new') continue;
    const e = index.byId.get(it.match.id);
    const same = N.contentHash(normalisedForHash(it.rec, d.safeUrl)) === e.h;
    it.sameContent = same;
    if (!same) {
      it.differing = diffVisible(it.rec, e);
      if (!it.differing.length) it.differing = ['notes-or-photo'];
      it.warnings.push({ code: 'content-differs', field: null, message: `matches existing ${e.id} but content differs (${it.differing.join(', ')}); NOT applied. Use an explicit update record if this change is intended.` });
    }
    if (it.match.dist_m > 0) it.pinMovedM = it.match.dist_m;
  }

  // ---- updates ---------------------------------------------------------------------------------------------------------
  // The identity changes of the whole batch (id -> set), fixed before the loop so the duplicate check is independent of record order.
  const identitySets = new Map(items.filter(o => o.cls !== 'invalid' && o.intent === 'update' && o.rec && index.byId.has(o.rec.id) && V.isIdentitySet(o.rec.set) && !V.isInfoSet(o.rec.set)).map(o => [o.rec.id, o.rec.set]));
  for (const it of items) {
    if (it.cls !== null || it.intent !== 'update') continue;
    const e = index.byId.get(it.rec.id);
    if (!e) { it.errors.push({ code: 'unknown-id', field: 'id', message: `no gym with id ${it.rec.id} exists in production (per the index); an update cannot create a gym` }); it.cls = 'invalid'; continue; }
    const changes = [];
    let noop = 0;
    for (const [f, v] of Object.entries(it.rec.set)) {
      // website/hours/day_pass/facilities are not in the index (nor in the content hash): the plan can only say they are FILLED; updater.js refuses the batch
      // if production already holds a value (fill-only). `before: null` is therefore the only state an applied update can start from.
      if (V.INFO_FIELDS.includes(f)) changes.push({ field: f, before: null, after: v });
      else if (VISIBLE.includes(f)) {
        const before = e[f];
        const same = JSON.stringify(f === 'types' ? [...v].sort() : (f === 'address' ? N.emptyToNull(v) : v)) === JSON.stringify(f === 'types' ? [...before].sort() : (f === 'address' ? N.emptyToNull(before) : before));
        if (same) { noop++; it.warnings.push({ code: 'noop-field', field: f, message: `"${f}" already has this value` }); } else changes.push({ field: f, before, after: v });
      } else changes.push({ field: f, before: '(not in index; compared at import time)', after: f === 'photo' && v ? (d.safeUrl(v) || v) : v });
    }
    it.id = e.id; it.expectH = e.h;
    // Researched against a different version of the gym: refuse rather than overwrite a change made since (moderator edit,
    // another import). expect_h is optional here; updater.js (the only thing that writes updates) requires it.
    if (it.rec.expect_h !== undefined && it.rec.expect_h !== e.h) { it.errors.push({ code: 'changed-since-research', field: 'expect_h', message: `${e.id} no longer has the content this update was researched against (expect_h ${it.rec.expect_h}, index ${e.h}); re-research it` }); it.cls = 'invalid'; continue; }
    // Identity updates (name/suburb/types only): a value equal to the current one is a no-op (refused, never silently dropped), and a rename or a suburb
    // change must not make the gym look like another existing gym (or another gym renamed in this batch): the matcher's own pair rules, see identityDuplicates.
    if (V.isIdentitySet(it.rec.set) && !V.isInfoSet(it.rec.set) && Object.keys(it.rec.set).every(f => V.IDENTITY_FIELDS.includes(f))) {
      const same = Object.keys(it.rec.set).filter(f => V.sameIdentityValue(f, it.rec.set[f], e[f]));
      // (a record where EVERY value is the current one stays "existing / update-is-noop" below; the updater refuses it with a clear message)
      if (same.length && same.length < Object.keys(it.rec.set).length) { it.errors.push({ code: 'identity-noop', field: same[0], message: `${e.id} already has this ${same.join(' + ')} (an identity update must change every field it lists; drop ${same.length > 1 ? 'those fields' : 'that field'})` }); it.cls = 'invalid'; continue; }
      const dups = same.length ? [] : identityDuplicates(e, it.rec.set, index, identitySets);
      if (dups.length) { it.errors.push({ code: 'rename-duplicates-other-gym', field: it.rec.set.name !== undefined ? 'name' : 'suburb', message: `the corrected identity of ${e.id} "${e.name}" would make it a probable duplicate of ${dups.slice(0, 3).map(d => `${d.id} "${d.name}"${d.inBatch ? ' (also changed in this batch)' : ''} -- ${d.reason}, ${d.dist_m} m`).join('; ')}${dups.length > 3 ? ` (+${dups.length - 3} more)` : ''}` }); it.cls = 'invalid'; continue; }
    }
    // A moved pin must not land on another gym: the same 60 m rule that makes a new gym a probable duplicate.
    if (it.rec.set.lat !== undefined || it.rec.set.lng !== undefined) {
      const pin = { lat: it.rec.set.lat ?? e.lat, lng: it.rec.set.lng ?? e.lng };
      const near = index.entries.find(o => o.id !== e.id && N.meters(pin, o) <= M.T.PROBABLE_COLOCATED_M);
      const nearNew = items.find(o => o !== it && o.intent === 'update' && o.rec && o.rec.set && o.rec.id !== e.id && o.rec.set.lat !== undefined && N.meters(pin, { lat: o.rec.set.lat, lng: o.rec.set.lng }) <= M.T.PROBABLE_COLOCATED_M);
      if (near || nearNew) { const o = near || { id: nearNew.rec.id, name: 'new pin of ' + nearNew.rec.id }; it.errors.push({ code: 'pin-near-other-gym', field: 'lat', message: `the new pin is within ${M.T.PROBABLE_COLOCATED_M} m of ${o.id} (${o.name})` }); it.cls = 'invalid'; continue; }
    }
    if (!changes.length) { it.cls = 'existing'; it.match = { id: e.id, name: e.name, tier: 'existing', reason: 'update-is-noop', dist_m: 0 }; it.sameContent = true; continue; }
    it.changes = changes; it.cls = 'update';
    const nm = changes.find(c => c.field === 'name'); if (nm) it.warnings.push({ code: 'rename', field: 'name', message: `renames "${e.name}" -> "${nm.after}"` });
    const moved = (it.rec.set.lat !== undefined || it.rec.set.lng !== undefined) ? Math.round(N.meters({ lat: it.rec.set.lat ?? e.lat, lng: it.rec.set.lng ?? e.lng }, e)) : 0;
    if (moved > 500) it.warnings.push({ code: 'large-pin-move', field: 'lat', message: `moves the pin by ${moved} m` });
  }

  // ---- retirements: an approved gym that is closed or a confirmed duplicate -> status 'rejected' (updater.js) ---------------------
  for (const it of items) {
    if (it.cls !== null || it.intent !== 'retire') continue;
    const e = index.byId.get(it.rec.id);
    if (!e) { it.errors.push({ code: 'unknown-id', field: 'id', message: `no gym with id ${it.rec.id} exists in production (per the index); there is nothing to retire` }); it.cls = 'invalid'; continue; }
    if (it.rec.expect_h !== e.h) { it.errors.push({ code: 'changed-since-research', field: 'expect_h', message: `${e.id} no longer has the content this retirement was researched against (expect_h ${it.rec.expect_h}, index ${e.h}); re-research it` }); it.cls = 'invalid'; continue; }
    if (it.rec.reason_code === 'duplicate') {
      const keeper = index.byId.get(it.rec.duplicate_of);
      if (!keeper) { it.errors.push({ code: 'duplicate-of-unknown', field: 'duplicate_of', message: `duplicate_of ${it.rec.duplicate_of} is not a gym in production (per the index); the gym that stays must exist` }); it.cls = 'invalid'; continue; }
      if (retiringIds.has(it.rec.duplicate_of)) { it.errors.push({ code: 'duplicate-of-retired', field: 'duplicate_of', message: `duplicate_of ${it.rec.duplicate_of} is itself retired in this batch; the gym that stays must stay` }); it.cls = 'invalid'; continue; }
      if (keeper.country !== e.country) it.warnings.push({ code: 'duplicate-other-country', field: 'duplicate_of', message: `${e.id} is in ${e.country} but ${keeper.id} (the gym that stays) is in ${keeper.country}` });
      else { const m = Math.round(N.meters(e, keeper)); if (m > 500) it.warnings.push({ code: 'duplicate-far-apart', field: 'duplicate_of', message: `${e.id} and ${keeper.id} are ${m} m apart; check they are the same gym` }); }
    }
    it.id = e.id; it.expectH = e.h; it.entry = store.FIELDS.reduce((o, k) => (o[k] = e[k], o), {}); it.cls = 'retire';
  }

  // ---- assemble ---------------------------------------------------------------------------------------------------------
  const unusedDecisions = Object.keys(decisions).filter(k => !usedDecisions.has(k));
  const records = items.map(it => {
    const o = { line: it.line, class: it.cls };
    if (it.id) { o.id = it.id; if (it.intent === 'new') o.id_frozen = !!it.frozen; }
    if (it.rec && it.rec.name) o.name = it.rec.name; else if (it.rec && it.cls === 'update' && it.match) o.name = it.match.name;
    if (it.cls === 'retire') { o.name = it.entry.name; o.country = it.entry.country; }
    if (it.rec && it.rec.country) o.country = it.rec.country;
    if (it.cls === 'existing') { o.id = it.match.id; delete o.id_frozen; o.match ={ id: it.match.id, name: it.match.name, reason: it.match.reason, dist_m: it.match.dist_m }; o.same_content = it.sameContent !== false; if (it.differing) o.differing = it.differing; if (it.pinMovedM) o.pin_moved_m = it.pinMovedM; }
    if (it.cls === 'probable-duplicate') { o.candidates = it.candidates.map(c => ({ id: c.id, name: c.name, reason: c.reason, dist_m: c.dist_m, ...(c.batch ? { batch: c.batch } : {}) })); if (it.reason) o.reason = it.reason; if (it.decisionNote) o.decision_note = it.decisionNote; }
    if (it.cls === 'update') { o.changes = it.changes; o.expect_h = it.expectH; o.update_reason = it.rec.reason; }
    if (it.cls === 'retire') { o.expect_h = it.expectH; o.reason_code = it.rec.reason_code; o.retire_reason = it.rec.reason; if (it.rec.duplicate_of) o.duplicate_of = it.rec.duplicate_of; o.entry = it.entry; }   // entry = the index entry BEFORE retirement, so history.js can restore it
    if (it.cls === 'new' && it.reviewedDistinct) o.reviewed_distinct = { reason: it.decision.reason, reviewer: it.decision.reviewer || null };
    if (it.cls === 'rejected') o.rejected_reason = it.decision.reason || null;
    if (it.errors.length) o.errors = it.errors;
    if (it.warnings.length) o.warnings = it.warnings;
    return o;
  });

  const counts = { records: records.length, new: 0, existing: 0, update: 0, 'probable-duplicate': 0, invalid: 0, rejected: 0 };
  if (records.some(r => r.class === 'retire')) counts.retire = 0;   // only present when used, so plans of insert/update batches are unchanged
  records.forEach(r => counts[r.class]++);
  const counts2 = { existing_identical: records.filter(r => r.class === 'existing' && r.same_content).length, existing_content_differs: records.filter(r => r.class === 'existing' && !r.same_content).length, new_id_not_frozen: records.filter(r => r.class === 'new' && !r.id_frozen).length, warnings: records.reduce((n, r) => n + (r.warnings ? r.warnings.length : 0), 0) };
  const blockers = [];
  batch.problems.forEach(p => blockers.push('batch: ' + p));
  if (counts.invalid) blockers.push(`${counts.invalid} invalid record(s) must be fixed or removed`);
  if (counts['probable-duplicate']) blockers.push(`${counts['probable-duplicate']} probable duplicate(s) need a human decision (decisions.json)`);
  if (counts2.new_id_not_frozen) blockers.push(`${counts2.new_id_not_frozen} new record(s) have no frozen id (run freeze-ids)`);
  if (unusedDecisions.length) blockers.push(`${unusedDecisions.length} decision(s) in decisions.json do not apply to any record: ${unusedDecisions.slice(0, 5).join(', ')}`);
  if (batch.imported) blockers.push('batch already has a manifest.json (already imported)');
  if (!counts.new && !counts.update && !counts.retire) blockers.push('nothing to import (no new, update or retire records)');
  const importable = blockers.length === 0;

  const core = { batch_id: batch.id, index_sha256: index.sha256, actions: records.filter(r => r.class === 'new' || r.class === 'update' || r.class === 'retire').map(r => r.class === 'new' ? { op: 'insert', id: r.id } : r.class === 'update' ? { op: 'update', id: r.id, changes: r.changes, expect_h: r.expect_h } : { op: 'retire', id: r.id, expect_h: r.expect_h, reason_code: r.reason_code, reason: r.retire_reason, duplicate_of: r.duplicate_of }).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0) || (a.op < b.op ? -1 : 1)) };   // no line numbers: the hash must not depend on record order
  const plan = {
    plan_version: 1, batch_id: batch.id,
    index: { sha256: index.sha256, count: index.entries.length, meta_matches: index.metaMatches },
    staged_batches_compared: [...new Set(staged.map(s => s.batch))],
    counts: { ...counts, ...counts2 }, importable, blockers, unused_decisions: unusedDecisions,
    plan_sha256: crypto.createHash('sha256').update(JSON.stringify(core)).digest('hex'),
    records,
  };
  return plan;
}

// Write the provisional ids of valid new-intent records into records.ndjson (idempotent; never touches records that already have an id).
function freezeIds(dir, plan) {
  const file = path.join(dir, 'records.ndjson');
  const idByLine = new Map(plan.records.filter(r => r.id && r.id_frozen === false && r.class !== 'invalid').map(r => [r.line, r.id]));
  if (!idByLine.size) return 0;
  const text = fs.readFileSync(file, 'utf8').split('\n');
  idByLine.forEach((id, line) => { const rec = JSON.parse(text[line - 1]); text[line - 1] = JSON.stringify({ id, ...rec }); });
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, text.join('\n'));
  fs.renameSync(tmp, file);
  return idByLine.size;
}

module.exports = { BATCH_DIR_RE, VISIBLE, loadBatch, loadStaged, planBatch, freezeIds, store };
