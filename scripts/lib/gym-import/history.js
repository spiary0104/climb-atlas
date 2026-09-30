// Looking back through verified location-update batches (updater.js), for provenance checks about an EARLIER state of production
// (the first import's reconciliation: validate-reconciled.js and the tests that reconstruct the pre-import index).
//
// An update batch changes address/lat/lng of existing gyms after that earlier state was recorded. Its committed plan.json lists every
// change as {field, before, after} plus the gym's content hash before it (expect_h), and records the index it was planned against
// (index.sha256). revertIndex() undoes each verified update batch on the current index, newest first, and REQUIRES the result to hash
// exactly to that recorded index: an unexplained difference throws instead of being silently "reverted". Read-only; nothing here writes.
'use strict';
const fs = require('fs');
const path = require('path');
const S = require('./index-store');
const MF = require('./manifest');

// Verified update batches (a valid manifest with kind "update"), newest first (batch ids start with the date).
function updateBatches(root = S.ROOT) {
  const dir = path.join(root, 'import', 'batches');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(n => fs.existsSync(path.join(dir, n, MF.MANIFEST))).sort().reverse()
    .map(n => ({ id: n, dir: path.join(dir, n), mf: MF.readManifest(path.join(dir, n)) }))
    .filter(b => b.mf.valid && b.mf.manifest.kind === 'update')
    .map(b => {
      const pf = path.join(b.dir, 'plan.json');
      if (!fs.existsSync(pf)) throw new Error(`update batch ${b.id} has a manifest but no plan.json to look back through`);
      const plan = JSON.parse(fs.readFileSync(pf, 'utf8'));
      const updates = plan.records.filter(r => r.class === 'update');
      if (JSON.stringify(updates.map(r => r.id).sort()) !== JSON.stringify([...b.mf.manifest.ids].sort())) throw new Error(`update batch ${b.id}: plan.json and manifest.json name different gyms`);
      return { id: b.id, indexSha: plan.index && plan.index.sha256, updates };
    });
}

const serialize = entries => [...entries].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)).map(e => JSON.stringify(S.FIELDS.reduce((o, k) => (o[k] = e[k], o), {}))).join('\n') + '\n';
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

// The index as it was before every verified update batch (or the given index unchanged when there are none).
function revertIndex(index, root = S.ROOT) {
  const batches = updateBatches(root);
  if (!batches.length) return index;
  const byId = new Map(index.entries.map(e => [e.id, { ...e }]));
  const reverted = [];
  for (const b of batches) {
    for (const r of b.updates) {
      const e = byId.get(r.id);
      if (!e) throw new Error(`update batch ${b.id}: ${r.id} is not in the index`);
      for (const c of r.changes) {
        if (!same(e[c.field], c.after)) throw new Error(`update batch ${b.id}: ${r.id}.${c.field} in the index is not the updated value; the index does not reflect this batch`);
        e[c.field] = c.before;
      }
      e.h = r.expect_h;
      reverted.push(r.id);
    }
    const text = serialize([...byId.values()]);
    if (S.sha256(Buffer.from(text)) !== b.indexSha) throw new Error(`update batch ${b.id}: undoing it does not give the index it was planned against (${String(b.indexSha).slice(0, 12)}…)`);
  }
  const entries = [...byId.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)), byCountry = new Map();
  for (const e of entries) { if (!byCountry.has(e.country)) byCountry.set(e.country, []); byCountry.get(e.country).push(e); }
  const text = serialize(entries);
  return { ...index, entries, byId: new Map(entries.map(e => [e.id, e])), byCountry, sha256: S.sha256(Buffer.from(text)), text, metaMatches: true, revertedUpdates: reverted, revertedBatches: batches.map(b => b.id) };
}

// Live rows ({id, name, country, lat, lng, address, ...}) seen as they were before the verified update batches. A row holding the
// updated value is shown with the value before the update; anything else is left exactly as it is (so real drift still shows).
function revertLiveRows(rows, root = S.ROOT) {
  const batches = updateBatches(root);
  const out = rows.map(r => ({ ...r }));
  const byId = new Map(out.map(r => [r.id, r]));
  let n = 0;
  for (const b of batches) for (const u of b.updates) {
    const r = byId.get(u.id); if (!r) continue;
    if (u.changes.every(c => same(c.field === 'address' ? (r.address || null) : r[c.field], c.after))) { u.changes.forEach(c => { r[c.field] = c.before; }); n++; }
  }
  return { rows: out, reverted: n, batches: batches.map(b => b.id) };
}

module.exports = { updateBatches, revertIndex, revertLiveRows };
