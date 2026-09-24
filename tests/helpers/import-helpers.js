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

module.exports = { ROOT, tmp, PROD, makeIndex, makeBatch, rec, byName };
