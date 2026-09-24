// Stage the genuinely NEW records of a JSON array file (e.g. the reconciled dataset) into an import batch, without copying the
// records that already exist in production. Deterministic and repeatable: staging the same source again is a no-op, staging a
// different source into an existing batch is refused. Never touches production or the source file.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const P = require('./plan');

const canonicalSha = v => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const relTo = (root, p) => path.relative(root, p).replace(/\\/g, '/');

async function stageFromFile({ source, slug, description, date, index, batchesDir, mustExclude = [], provenance = {} }) {
  if (!/^[a-z0-9][a-z0-9-]{1,60}$/.test(slug || '')) throw new Error('slug must be lower-case letters/digits/hyphens');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw new Error('date must be YYYY-MM-DD');
  if (!description || description.length < 5) throw new Error('a description is required');
  const raw = fs.readFileSync(source, 'utf8');
  const all = JSON.parse(raw);
  if (!Array.isArray(all) || all.some(r => !r || typeof r !== 'object' || Array.isArray(r))) throw new Error('source must be a JSON array of objects');

  // Plan the whole source against the index in a scratch directory to learn each record's class.
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'gym-stage-'));
  const probeId = `${date}-stage-probe`;
  const probeDir = path.join(scratch, probeId);
  fs.mkdirSync(probeDir);
  fs.writeFileSync(path.join(probeDir, 'batch.json'), JSON.stringify({ schema_version: 1, batch_id: probeId, description: 'probe' }));
  fs.writeFileSync(path.join(probeDir, 'records.ndjson'), all.map(r => JSON.stringify(r)).join('\n') + '\n');
  const plan = await P.planBatch({ dir: probeDir, index, includeStaged: false });
  fs.rmSync(scratch, { recursive: true, force: true });

  const byClass = {};
  plan.records.forEach(r => { byClass[r.class] = (byClass[r.class] || 0) + 1; });
  const keepLines = new Set(plan.records.filter(r => r.class === 'new').map(r => r.line));
  const staged = all.filter((_, i) => keepLines.has(i + 1));
  const banned = staged.filter(r => mustExclude.includes(r.id));
  if (banned.length) throw new Error('refusing to stage record(s) listed as rejected in the decisions file: ' + banned.map(r => r.id).join(', '));
  const skipped = { ...byClass }; delete skipped.new;
  const notStaged = plan.records.filter(r => r.class !== 'new' && r.class !== 'existing');   // anything needing attention (never silently dropped)
  const body = staged.map(r => JSON.stringify(r)).join('\n') + '\n';

  const batchId = `${date}-${slug}`;
  const dir = path.join(batchesDir, batchId);
  const meta = {
    schema_version: 1, batch_id: batchId, description, created: date,
    source: {
      kind: 'stage-from-file', file: provenance.file || path.basename(source), canonical_sha256: canonicalSha(all), records_in_source: all.length,
      staged: staged.length, not_staged_because_already_in_production: skipped.existing || 0,
      not_staged_other: Object.fromEntries(Object.entries(skipped).filter(([k]) => k !== 'existing')),
      ...(provenance.extra || {}),
    },
    index_at_staging: { sha256: index.sha256, count: index.entries.length },
  };
  const metaText = JSON.stringify(meta, null, 2) + '\n';

  let action = 'created';
  if (fs.existsSync(dir)) {
    const sameRecords = fs.existsSync(path.join(dir, 'records.ndjson')) && fs.readFileSync(path.join(dir, 'records.ndjson'), 'utf8') === body;
    const sameMeta = fs.existsSync(path.join(dir, 'batch.json')) && fs.readFileSync(path.join(dir, 'batch.json'), 'utf8') === metaText;
    if (!sameRecords || !sameMeta) throw new Error(`batch ${batchId} already exists and differs from what this source would stage (records identical: ${sameRecords}, batch.json identical: ${sameMeta}). Refusing to overwrite; use a new slug/date if this is a different batch.`);
    action = 'unchanged';
  } else if (staged.length) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'records.ndjson'), body);
    fs.writeFileSync(path.join(dir, 'batch.json'), metaText);
  }
  return { action, batchId, dir, staged: staged.length, byClass, notStaged, meta };
}

module.exports = { stageFromFile, canonicalSha, relTo };
