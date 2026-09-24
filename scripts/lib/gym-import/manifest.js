// Manifest lifecycle for an import batch.
//
//   manifest.json        OUTPUT of a successful, verified import (or of a verified recovery). It is NEVER an input the importer
//                        trusts: a pre-import dry-run needs none, and if one exists it is validated against the batch, the exact
//                        payload and the target, and is only ever used to REFUSE or to label a state that live production reads
//                        have already proven. It can not make any safety check pass.
//   import-failure.json  OUTPUT of an import that wrote (or may have written) but did not verify. Deliberately a different file
//                        name: nothing treats it as "imported".
//
// Only two statuses count as "imported": 'imported' and 'imported-recovered'.
'use strict';
const fs = require('fs');
const path = require('path');

const MANIFEST = 'manifest.json';
const FAILURE = 'import-failure.json';
const IMPORTED_STATUSES = new Set(['imported', 'imported-recovered']);

function readManifest(batchDir) {
  const file = path.join(batchDir, MANIFEST);
  if (!fs.existsSync(file)) return { exists: false, valid: false, problems: [], manifest: null };
  const problems = [];
  let m = null;
  try { m = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return { exists: true, valid: false, problems: ['manifest.json is not valid JSON'], manifest: null }; }
  if (!m || typeof m !== 'object' || Array.isArray(m)) return { exists: true, valid: false, problems: ['manifest.json is not an object'], manifest: null };
  if (m.schema_version !== 1) problems.push('schema_version is not 1');
  if (m.batch_id !== path.basename(batchDir)) problems.push(`batch_id "${m.batch_id}" does not match the batch directory`);
  if (!IMPORTED_STATUSES.has(m.status)) problems.push(`status "${m.status}" does not mean imported`);
  if (!Array.isArray(m.ids) || !m.ids.length) problems.push('ids is missing');
  if (!m.target || !m.target.host || !m.target.kind) problems.push('target is missing');
  if (!/^[0-9a-f]{64}$/.test(m.payload_sha256 || '')) problems.push('payload_sha256 is missing');
  if (!m.verification || m.verification.ok !== true) problems.push('verification.ok is not true');
  return { exists: true, valid: problems.length === 0, problems, manifest: m };
}

// Would a tool be right to consider this batch imported? Only for a well-formed manifest that says so.
const isImported = batchDir => readManifest(batchDir).valid;

// Compare a manifest with what the importer is about to do; returns a list of mismatches (empty = consistent).
function mismatches(m, { batchId, payloadSha, host, ids }) {
  const out = [];
  if (m.batch_id !== batchId) out.push('batch');
  if (m.payload_sha256 !== payloadSha) out.push('payload');
  if (m.target.host !== host) out.push(`target (${m.target.host})`);
  if (JSON.stringify(m.ids) !== JSON.stringify(ids)) out.push('ids');
  return out;
}

function write(batchDir, name, obj) {
  const file = path.join(batchDir, name);
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n');
  return file;
}
const writeManifest = (dir, m) => write(dir, MANIFEST, m);
const writeFailure = (dir, f) => write(dir, FAILURE, f);

module.exports = { MANIFEST, FAILURE, IMPORTED_STATUSES, readManifest, isImported, mismatches, writeManifest, writeFailure };
