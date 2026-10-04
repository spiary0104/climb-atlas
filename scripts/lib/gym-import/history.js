// Looking back through verified batches imported AFTER the baseline (the first import, the Stage 0 reconciliation), for provenance
// checks about that earlier state of production (validate-reconciled.js and the tests that reconstruct the pre-import index).
//
// Two kinds of later batch, both recorded by a valid manifest.json and their committed plan.json:
//  - a maintenance batch (updater.js; manifest kind "update") changed address/lat/lng or the identity (name/suburb/types) of existing gyms (or filled their website/hours/day pass/facilities, which the index does not carry and
//    which are skipped when reverting): plan.json lists every change as
//    {field, before, after} plus the gym's content hash before it (expect_h); and/or RETIRED gyms (closed / duplicate, status set to
//    'rejected', so they left the approved set and the rebuilt index): plan.json records each retired gym's full index entry as it was
//    BEFORE the retirement (class "retire", entry) and the manifest lists them in `retired`;
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
const { INFO_FIELDS } = require('./validate');

// The batch whose pre-import world the provenance checks describe. Everything verified after it is looked through.
const BASELINE_BATCH = '2026-09-24-reconciled-new-gyms';
const INSERT_STATUSES = new Set(['imported', 'imported-recovered']);
const sortedIds = ids => JSON.stringify([...ids].sort());

// Verified batches finished after the baseline, newest first. Each: {id, kind:'update'|'insert', indexSha, updates, retires, inserts}.
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
        const updates = plan.records.filter(r => r.class === 'update'), retires = plan.records.filter(r => r.class === 'retire');
        if (sortedIds([...updates, ...retires].map(r => r.id)) !== sortedIds(m.ids)) throw new Error(`update batch ${b.id}: plan.json and manifest.json name different gyms`);
        if (sortedIds(retires.map(r => r.id)) !== sortedIds(m.retired || [])) throw new Error(`update batch ${b.id}: plan.json and manifest.json retire different gyms`);
        for (const r of retires) if (!r.entry || r.entry.id !== r.id || !r.entry.h) throw new Error(`update batch ${b.id}: plan.json has no recorded index entry for the retired gym ${r.id}`);
        return { id: b.id, kind: 'update', indexSha, updates, retires, inserts: [] };
      }
      if (!INSERT_STATUSES.has(m.status)) throw new Error(`batch ${b.id}: manifest status "${m.status}" is neither an insert nor an update`);
      const inserts = plan.records.filter(r => r.class === 'new').map(r => r.id);
      if (sortedIds(inserts) !== sortedIds(m.ids)) throw new Error(`insert batch ${b.id}: plan.json and manifest.json name different gyms`);
      return { id: b.id, kind: 'insert', indexSha, updates: [], retires: [], inserts };
    });
}
// Kept for callers that only care about location updates.
const updateBatches = (root = S.ROOT) => laterBatches(root).filter(b => b.kind === 'update');

const serialize = entries => [...entries].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)).map(e => JSON.stringify(S.FIELDS.reduce((o, k) => (o[k] = e[k], o), {}))).join('\n') + '\n';
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
// Identity changes (name/suburb/types) are in the index like location changes and are reverted the same way. The type tags are compared as a set: the index
// keeps them sorted while a record (and the database) lists them in the canonical order.
const sameField = (field, a, b) => (field === 'types' && Array.isArray(a) && Array.isArray(b) ? same([...a].sort(), [...b].sort()) : same(a, b));

// The index as it was before every verified later batch (or the given index unchanged when there are none).
function revertIndex(index, root = S.ROOT) {
  const batches = laterBatches(root);
  if (!batches.length) return index;
  const byId = new Map(index.entries.map(e => [e.id, { ...e }]));
  const reverted = [], removed = [], restored = [], gone = new Set();   // removed ids; entries are filtered, never deleted (the static boundary test bans delete calls here)
  const current = () => [...byId.values()].filter(e => !gone.has(e.id));
  for (const b of batches) {
    for (const r of b.updates) {
      const e = byId.get(r.id);
      if (!e || gone.has(r.id)) throw new Error(`update batch ${b.id}: ${r.id} is not in the index`);
      for (const c of r.changes.filter(c => !INFO_FIELDS.includes(c.field))) {   // gym information (website/hours/day pass/facilities) is not in the index
        if (!sameField(c.field, e[c.field], c.after)) throw new Error(`update batch ${b.id}: ${r.id}.${c.field} in the index is not the updated value; the index does not reflect this batch`);
        e[c.field] = c.before;
      }
      e.h = r.expect_h;
      reverted.push(r.id);
    }
    for (const r of b.retires) {
      if (byId.has(r.id) && !gone.has(r.id)) throw new Error(`update batch ${b.id}: retired gym ${r.id} is still in the index; the index does not reflect this batch`);
      byId.set(r.id, { ...r.entry });   // put the gym back exactly as it was recorded before it was retired
      restored.push(r.id);
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
  return { ...index, entries, byId: new Map(entries.map(e => [e.id, e])), byCountry, sha256: S.sha256(Buffer.from(text)), text, metaMatches: true, revertedUpdates: reverted, restoredRetired: restored, removedInserts: removed, revertedBatches: batches.map(b => b.id) };
}

// Live rows ({id, name, country, lat, lng, address, ...}) seen as they were before the verified later batches. A row holding an updated
// value is shown with the value before the update; a row a later insert batch added is left out; a gym a later batch RETIRED (it is no
// longer an approved row) is put back as recorded in that batch's plan.json; anything else is left exactly as it is (so real drift
// still shows). Batches are undone newest first, so a gym that was inserted and then retired (or updated and then retired) unwinds
// correctly.
function revertLiveRows(rows, root = S.ROOT) {
  const batches = laterBatches(root);
  let out = rows.map(r => ({ ...r }));
  let n = 0, removed = 0, restored = 0;
  for (const b of batches) {
    for (const r of b.retires) {
      if (out.some(x => x.id === r.id)) continue;
      const { h: _hash, ...row } = r.entry;   // the content hash is not a table column
      out.push(row); restored++;
    }
    const byId = new Map(out.map(r => [r.id, r]));
    for (const u of b.updates) {
      const r = byId.get(u.id); if (!r) continue;
      // a gym-information fill leaves no trace in the compared fields; a field the row does not carry (callers select e.g. only
      // id,name,country,lat,lng,address, without suburb/types) can neither confirm nor contradict the update, so only carried fields count
      const cs = u.changes.filter(c => !INFO_FIELDS.includes(c.field) && (c.field === 'address' || c.field in r));
      if (cs.length && cs.every(c => sameField(c.field, c.field === 'address' ? (r.address || null) : r[c.field], c.after))) { cs.forEach(c => { r[c.field] = c.before; }); n++; }
    }
    if (b.inserts.length) { const ins = new Set(b.inserts), before = out.length; out = out.filter(r => !ins.has(r.id)); removed += before - out.length; }
  }
  return { rows: out, reverted: n, removed, restored, batches: batches.map(b => b.id) };
}

module.exports = { BASELINE_BATCH, laterBatches, updateBatches, revertIndex, revertLiveRows };
