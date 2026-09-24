// Shared helpers for the import-pipeline tests: temp batch/index directories and a small synthetic production index.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const S = require('../../scripts/lib/gym-import/index-store');

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

// The match index as it was BEFORE any batch in import/batches was imported. Once a batch has a manifest.json the real index is
// rebuilt from production and includes its gyms; the Stage 0 / staging regression tests are about the pre-import world, so they
// use this (identical to the real index until the first import).
function preImportIndex() {
  const idx = S.load();
  const dir = path.join(ROOT, 'import', 'batches'), imported = new Set();
  if (fs.existsSync(dir)) for (const b of fs.readdirSync(dir)) { const m = path.join(dir, b, 'manifest.json'); if (fs.existsSync(m)) (JSON.parse(fs.readFileSync(m, 'utf8')).ids || []).forEach(id => imported.add(id)); }
  if (!imported.size) return idx;
  const entries = idx.entries.filter(e => !imported.has(e.id)), byId = new Map(), byCountry = new Map();
  for (const e of entries) { byId.set(e.id, e); if (!byCountry.has(e.country)) byCountry.set(e.country, []); byCountry.get(e.country).push(e); }
  return { ...idx, entries, byId, byCountry, sha256: S.sha256(Buffer.from(entries.map(e => JSON.stringify(e)).join('\n'))), metaMatches: true, preImportView: true };
}
const batchImported = id => fs.existsSync(path.join(ROOT, 'import', 'batches', id, 'manifest.json'));

module.exports = { ROOT, tmp, PROD, makeIndex, makeBatch, rec, byName, preImportIndex, batchImported };
