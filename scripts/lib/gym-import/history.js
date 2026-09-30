// Looking back through verified batches imported AFTER the baseline (the first import, the Stage 0 reconciliation), for provenance
// checks about that earlier state of production (validate-reconciled.js and the tests that reconstruct the pre-import index).
//
// Two kinds of later batch, both recorded by a valid manifest.json and their committed plan.json:
//  - a location-update batch (updater.js) changed address/lat/lng of existing gyms: plan.json lists every change as {field, before,
//    after} plus the gym's content hash before it (expect_h);
//  - an insert batch (importer.js; e.g. a regional-research batch) added new gyms: plan.json lists them as class "new" and the
//    manifest names exactly those ids.
// Each plan.json also records the index it was planned against (index.sha256). revertIndex() undoes the batches on the current index,
// newest first (by the manifest's finished_at), and REQUIRES each intermediate result to hash exactly to that batch's recorded index:
// an unexplained difference (a gym approved or edited outside the pipeline, a wrong or forged manifest) throws instead of being
// silently "reverted". Read-only; nothing here writes.
'use strict';
const fs = require('fs');
const path = require('path');
const S = require('./index-store');
const MF = require('./manifest');

// The batch whose pre-import world the provenance checks describe. Everything verified after it is looked through.
const BASELINE_BATCH = '2026-09-24-reconciled-new-gyms';
const INSERT_STATUSES = new Set(['imported', 'imported-recovered']);
const sortedIds = ids => JSON.stringify([...ids].sort());

// Verified batches finished after the baseline, newest first. Each: {id, kind:'update'|'insert', indexSha, updates, inserts}.
function laterBatches(root = S.ROOT) {
  const dir = path.join(root, 'import', 'batches');
  if (!fs.existsSync(dir)) return [];
  const all = fs.readdirSync(dir).filter(n => fs.existsSync(path.join(dir, n, MF.MANIFEST)))
    .map(n => ({ id: n, dir: path.join(dir, n), mf: MF.readManifest(path.join(dir, n)) }))
    .filter(b => b.mf.valid);
  const base = all.find(b => b.id === BASELINE_BATCH);
  const after = base ? String(base.mf.manifest.finished_at || '') : '';
  return all.filter(b => b.id !== BASELINE_BATCH && String(b.mf.manifest.finished_at || '') > after)
    .sort((a, b) => (String(b.mf.manifest.finished_at) < String(a.mf.manifest.finished_at) ? -1 : String(b.mf.manifest.finished_at) > String(a.mf.manifest.finished_at) ? 1 : (a.id < b.id ? 1 : -1)))
    .map(b => {
      const m = b.mf.manifest, pf = path.join(b.dir, 'plan.json');
      if (!fs.existsSync(pf)) throw new Error(`batch ${b.id} has a manifest but no plan.json to look back through`);
      const plan = JSON.parse(fs.readFileSync(pf, 'utf8'));
      const indexSha = plan.index && plan.index.sha256;
      if (m.kind === 'update') {
        const updates = plan.records.filter(r => r.class === 'update');
        if (sortedIds(updates.map(r => r.id)) !== sortedIds(m.ids)) throw new Error(`update batch ${b.id}: plan.json and manifest.json name different gyms`);
        return { id: b.id, kind: 'update', indexSha, updates, inserts: [] };
      }
      if (!INSERT_STATUSES.has(m.status)) throw new Error(`batch ${b.id}: manifest status "${m.status}" is neither an insert nor an update`);
      const inserts = plan.records.filter(r => r.class === 'new').map(r => r.id);
      if (sortedIds(inserts) !== sortedIds(m.ids)) throw new Error(`insert batch ${b.id}: plan.json and manifest.json name different gyms`);
      return { id: b.id, kind: 'insert', indexSha, updates: [], inserts };
    });
}
// Kept for callers that only care about location updates.
const updateBatches = (root = S.ROOT) => laterBatches(root).filter(b => b.kind === 'update');

const serialize = entries => [...entries].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)).map(e => JSON.stringify(S.FIELDS.reduce((o, k) => (o[k] = e[k], o), {}))).join('\n') + '\n';
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

// The index as it was before every verified later batch (or the given index unchanged when there are none).
function revertIndex(index, root = S.ROOT) {
  const batches = laterBatches(root);
  if (!batches.length) return index;
  const byId = new Map(index.entries.map(e => [e.id, { ...e }]));
  const reverted = [], removed = [], gone = new Set();   // removed ids; entries are filtered, never deleted (the static boundary test bans delete calls here)
  const current = () => [...byId.values()].filter(e => !gone.has(e.id));
  for (const b of batches) {
    for (const r of b.updates) {
      const e = byId.get(r.id);
      if (!e || gone.has(r.id)) throw new Error(`update batch ${b.id}: ${r.id} is not in the index`);
      for (const c of r.changes) {
        if (!same(e[c.field], c.after)) throw new Error(`update batch ${b.id}: ${r.id}.${c.field} in the index is not the updated value; the index does not reflect this batch`);
        e[c.field] = c.before;
      }
      e.h = r.expect_h;
      reverted.push(r.id);
    }
    for (const id of b.inserts) {
      if (!byId.has(id) || gone.has(id)) throw new Error(`insert batch ${b.id}: ${id} is not in the index; the index does not reflect this batch`);
      gone.add(id);
      removed.push(id);
    }
    const text = serialize(current());
    if (S.sha256(Buffer.from(text)) !== b.indexSha) throw new Error(`${b.kind} batch ${b.id}: undoing it does not give the index it was planned against (${String(b.indexSha).slice(0, 12)}…)`);
  }
  const entries = current().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)), byCountry = new Map();
  for (const e of entries) { if (!byCountry.has(e.country)) byCountry.set(e.country, []); byCountry.get(e.country).push(e); }
  const text = serialize(entries);
  return { ...index, entries, byId: new Map(entries.map(e => [e.id, e])), byCountry, sha256: S.sha256(Buffer.from(text)), text, metaMatches: true, revertedUpdates: reverted, removedInserts: removed, revertedBatches: batches.map(b => b.id) };
}

// Live rows ({id, name, country, lat, lng, address, ...}) seen as they were before the verified later batches. A row holding an updated
// value is shown with the value before the update; a row a later insert batch added is left out; anything else is left exactly as it is
// (so real drift still shows).
function revertLiveRows(rows, root = S.ROOT) {
  const batches = laterBatches(root);
  const inserted = new Set(batches.flatMap(b => b.inserts));
  const out = rows.filter(r => !inserted.has(r.id)).map(r => ({ ...r }));
  const byId = new Map(out.map(r => [r.id, r]));
  let n = 0;
  for (const b of batches) for (const u of b.updates) {
    const r = byId.get(u.id); if (!r) continue;
    if (u.changes.every(c => same(c.field === 'address' ? (r.address || null) : r[c.field], c.after))) { u.changes.forEach(c => { r[c.field] = c.before; }); n++; }
  }
  return { rows: out, reverted: n, removed: rows.length - out.length, batches: batches.map(b => b.id) };
}

module.exports = { BASELINE_BATCH, laterBatches, updateBatches, revertIndex, revertLiveRows };
