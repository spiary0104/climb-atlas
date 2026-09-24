// Shared helpers for the import-pipeline tests: temp batch/index directories and a small synthetic production index.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const S = require('../../scripts/lib/gym-import/index-store');
const { readManifest, isImported } = require('../../scripts/lib/gym-import/manifest');

const ROOT = path.resolve(__dirname, '..', '..');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'gym-import-test-'));

// A tiny "production" (all approved rows, full records; the index keeps only the match fields + content hash).
const PROD = [
  { id: 'seed-100', name: 'Boulder Barn', suburb: 'Surry Hills', state: 'NSW', country: 'AU', lat: -33.88, lng: 151.21, address: '12 Example St, Surry Hills NSW 2010', types: ['indoor-bouldering'], notes: 'Friendly', photo: null },
  { id: 'seed-101', name: 'Vertical Works', suburb: 'Fitzroy', state: 'VIC', country: 'AU', lat: -37.799, lng: 144.978, address: '5 Brunswick St, Fitzroy VIC 3065', types: ['indoor-bouldering', 'top-rope'], notes: null, photo: null },
  { id: 'seed-102', name: 'Granite Gym', suburb: 'Ultimo', state: 'NSW', country: 'AU', lat: -33.879, lng: 151.195, address: null, types: ['top-rope'], notes: null, photo: null },
  { id: 'community-0f3a7c2e-1111-4222-8333-444455556666', name: 'Kletterhalle Mitte', suburb: 'Berlin', state: 'BE', country: 'DE', lat: 52.52, lng: 13.405, address: 'Torstrasse 1, Berlin', types: ['lead-climbing'], notes: null, photo: null },
];

function makeIndex(rows = PROD) {
  const dir = tmp();
  S.write(rows, dir, { source: 'test' });
  return S.load(dir);
}

// Create batches/<id>/ with batch.json + records.ndjson (records = objects or raw strings) and optional decisions.
function makeBatch(records, { id = '2026-01-01-synthetic', decisions = null, root = tmp() } = {}) {
  const dir = path.join(root, id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'batch.json'), JSON.stringify({ schema_version: 1, batch_id: id, description: 'synthetic test batch' }));
  fs.writeFileSync(path.join(dir, 'records.ndjson'), records.map(r => (typeof r === 'string' ? r : JSON.stringify(r))).join('\n') + '\n');
  if (decisions) fs.writeFileSync(path.join(dir, 'decisions.json'), JSON.stringify({ decisions }));
  return { dir, root, id };
}

const rec = (over = {}) => ({ name: 'Summit Lab', suburb: 'Newtown', state: 'NSW', country: 'AU', lat: -33.897, lng: 151.179, types: ['indoor-bouldering'], address: '1 King St, Newtown NSW 2042', notes: 'n', photo: null, ...over });
const byName = (plan, name) => plan.records.find(r => r.name === name);

// The match index as it was BEFORE a batch was imported, for regression tests about the pre-import world (Stage 0 reconciliation,
// staging). Before the import (no manifest) this IS the real index. After a verified import the real index is rebuilt from production
// and contains the batch's gyms, so the pre-import view is reconstructed by removing them -- and that reconstruction is only accepted
// if it hashes to the index sha256/count recorded in batch.json (index_at_staging) when the batch was staged. That recorded hash is
// independent of the manifest: a wrong, forged or stale manifest makes this throw instead of silently changing what tests see.
// Nothing in the importer itself uses this; production logic always reads the live database.
function preImportIndex(batchId = '2026-09-24-reconciled-new-gyms', root = ROOT) {
  const idx = S.load(path.join(root, 'import', 'index'));
  const dir = path.join(root, 'import', 'batches', batchId);
  const mf = readManifest(dir);
  if (!mf.exists) return idx;
  if (!mf.valid) throw new Error('manifest for ' + batchId + ' is not valid: ' + mf.problems.join('; '));
  const staged = JSON.parse(fs.readFileSync(path.join(dir, 'batch.json'), 'utf8')).index_at_staging;
  if (!staged || !staged.sha256) throw new Error('batch.json has no index_at_staging to verify the reconstruction against');
  const remove = new Set(mf.manifest.ids);
  const lines = fs.readFileSync(path.join(root, 'import', 'index', 'gym-index.ndjson'), 'utf8').split(String.fromCharCode(10)).filter(Boolean);
  const kept = lines.filter(l => !remove.has(JSON.parse(l).id));
  const text = kept.join(String.fromCharCode(10)) + String.fromCharCode(10);
  if (S.sha256(Buffer.from(text)) !== staged.sha256 || kept.length !== staged.count) throw new Error('cannot reconstruct the pre-import index for ' + batchId + ': the result does not match index_at_staging in batch.json (' + kept.length + ' gyms)');
  const entries = kept.map(l => JSON.parse(l)), byId = new Map(), byCountry = new Map();
  for (const e of entries) { byId.set(e.id, e); if (!byCountry.has(e.country)) byCountry.set(e.country, []); byCountry.get(e.country).push(e); }
  return { ...idx, entries, byId, byCountry, sha256: staged.sha256, metaMatches: true, preImportView: true };
}
const batchImported = id => isImported(path.join(ROOT, 'import', 'batches', id));

module.exports = { ROOT, tmp, PROD, makeIndex, makeBatch, rec, byName, preImportIndex, batchImported };
