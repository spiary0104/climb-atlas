#!/usr/bin/env node
// Gym import pipeline CLI. Nothing here writes to Supabase; the only network access is `--live`, a read-only GET of
// approved spots (the same request the public site makes). See docs/import-workflow.md.
//
//   node scripts/gym-import.js new-batch <slug> [--description "..."]
//   node scripts/gym-import.js validate   <batch>                 offline schema checks only
//   node scripts/gym-import.js plan       <batch> [--no-write] [--no-staged] [--index <dir>]
//   node scripts/gym-import.js freeze-ids <batch>                 write derived g-<hex> ids into records.ndjson (once)
//   node scripts/gym-import.js stage-from-file <source.json> --slug <slug> --description "..." [--date YYYY-MM-DD] [--decisions <decisions.json>]
//                                                                 stage only the NEW records of a JSON array into a fresh batch
//   node scripts/gym-import.js import <batch> [--dry-run]         DEFAULT. Preflight + live read-only checks + report. Never writes.
//   node scripts/gym-import.js import <batch> --verify            read-only: confirm an imported batch is in production unchanged
//   node scripts/gym-import.js import <batch> --apply --confirm <token> [--i-understand-this-writes-to-production]
//                                                                 the ONLY command that can write (insert new gyms). See docs/import-workflow.md
//   node scripts/gym-import.js build-index (--from-snapshot <file.json> | --live) [--out <dir>]
//   node scripts/gym-import.js verify-index (--from-snapshot <file.json> | --live) [--index <dir>]
//
// <batch> is a directory, or just its name under import/batches/. Exit codes: 0 ok, 1 usage/validation failure,
// 2 plan produced but not importable / import preflight refused, 4 import wrote (or may have written) but verification failed.
'use strict';
const fs = require('fs');
const path = require('path');
const V = require('./lib/gym-import/validate');
const P = require('./lib/gym-import/plan');
const S = require('./lib/gym-import/index-store');
const { renderReport } = require('./lib/gym-import/report');
const { stageFromFile, relTo } = require('./lib/gym-import/stage');
const { runImport } = require('./lib/gym-import/importer');
const { redact } = require('./lib/gym-import/target');

const ROOT = S.ROOT;
const BATCHES = path.join(ROOT, 'import', 'batches');

function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2); if (['no-write', 'no-staged', 'live', 'dry-run', 'apply', 'verify', 'i-understand-this-writes-to-production'].includes(k)) flags[k] = true; else flags[k] = argv[++i]; }
    else pos.push(a);
  }
  return { pos, flags };
}
const batchPath = arg => {
  if (!arg) throw new Error('missing <batch>');
  const p = fs.existsSync(arg) ? path.resolve(arg) : path.join(BATCHES, arg);
  if (!fs.existsSync(p) || !fs.statSync(p).isDirectory()) throw new Error('batch directory not found: ' + arg);
  return p;
};
const rel = p => path.relative(ROOT, p).replace(/\\/g, '/');

async function cmdValidate(dir) {
  const b = P.loadBatch(dir);
  let bad = 0, warn = 0;
  b.problems.forEach(p => { console.log('batch: ' + p); bad++; });
  const seen = new Map();
  for (const { line, rec, parseError } of b.lines) {
    if (parseError) { console.log(`line ${line}: bad-json: ${parseError}`); bad++; continue; }
    if (!rec || typeof rec !== 'object' || Array.isArray(rec)) { console.log(`line ${line}: bad-record: must be a JSON object`); bad++; continue; }
    const v = rec.intent === 'update' ? await V.validateUpdateRecord(rec) : await V.validateNewRecord(rec);
    if (rec.id && rec.intent !== 'update') { if (seen.has(rec.id)) { v.errors.push({ code: 'duplicate-id-in-batch', field: 'id', message: `id also used on line ${seen.get(rec.id)}` }); } else seen.set(rec.id, line); }
    v.errors.forEach(e => console.log(`line ${line}${rec.name ? ` "${rec.name}"` : ''}: ERROR ${e.code}${e.field ? ` (${e.field})` : ''}: ${e.message}`));
    v.warnings.forEach(e => { console.log(`line ${line}${rec.name ? ` "${rec.name}"` : ''}: warning ${e.code}: ${e.message}`); warn++; });
    if (v.errors.length) bad++;
  }
  console.log(`\n${b.id}: ${b.lines.length} record line(s), ${bad} with errors, ${warn} warning(s). ${bad ? 'INVALID' : 'Schema OK'} (offline check only; run "plan" for duplicate detection).`);
  return bad ? 1 : 0;
}

async function cmdPlan(dir, flags) {
  const index = S.load(flags.index ? path.resolve(flags.index) : undefined);
  const plan = await P.planBatch({ dir, index, includeStaged: !flags['no-staged'] });
  const report = renderReport(plan);
  if (!flags['no-write']) {
    fs.writeFileSync(path.join(dir, 'plan.json'), JSON.stringify(plan, null, 1) + '\n');
    fs.writeFileSync(path.join(dir, 'report.md'), report + '\n');
    console.log(`wrote ${rel(path.join(dir, 'plan.json'))} and ${rel(path.join(dir, 'report.md'))}\n`);
  }
  const c = plan.counts;
  console.log(`${plan.batch_id}: ${c.records} records -> new ${c.new} | existing ${c.existing} (identical ${c.existing_identical}, differs ${c.existing_content_differs}) | update ${c.update} | probable-duplicate ${c['probable-duplicate']} | invalid ${c.invalid} | rejected ${c.rejected}`);
  console.log(plan.importable ? 'Importable after human review of the report. (Nothing was written to production.)' : 'NOT importable yet:\n  - ' + plan.blockers.join('\n  - '));
  return plan.importable ? 0 : 2;
}

async function cmdFreeze(dir, flags) {
  const index = S.load(flags.index ? path.resolve(flags.index) : undefined);
  const plan = await P.planBatch({ dir, index });
  const n = P.freezeIds(dir, plan);
  console.log(n ? `froze ${n} id(s) into ${rel(path.join(dir, 'records.ndjson'))}. Re-run "plan".` : 'nothing to freeze (every valid new record already has an id).');
  return 0;
}

async function sourceRows(flags) {
  if (flags.live) { const { rows, host } = await S.fetchLive(); return { rows, source: `live:${host}`, built_from: 'GET /rest/v1/spots?status=eq.approved (anon, read-only)' }; }
  if (flags['from-snapshot']) {
    const file = path.resolve(flags['from-snapshot']);
    const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
    return { rows: rows.filter(r => r.status === undefined || r.status === 'approved'), source: 'snapshot', built_from: path.basename(file) };
  }
  throw new Error('need --live or --from-snapshot <file.json>');
}

async function cmdBuildIndex(flags) {
  const { rows, source, built_from } = await sourceRows(flags);
  const dir = path.resolve(flags.out || S.DEFAULT_DIR);
  const meta = S.write(rows, dir, { source, built_from, note: 'Derived from production spots (approved). Not a source of truth; rebuild rather than edit.' });
  console.log(`wrote ${rel(dir)}/gym-index.ndjson: ${meta.count} gyms, sha256 ${meta.sha256.slice(0, 16)}…`);
  return 0;
}

async function cmdVerifyIndex(flags) {
  const { rows, source } = await sourceRows(flags);
  const idx = S.load(flags.index ? path.resolve(flags.index) : undefined);
  const fresh = new Map(rows.map(r => [r.id, S.toEntry(r)]));
  const missingInIndex = [...fresh.keys()].filter(id => !idx.byId.has(id)).sort();
  const extraInIndex = [...idx.byId.keys()].filter(id => !fresh.has(id)).sort();
  const changed = [...fresh.keys()].filter(id => idx.byId.has(id) && idx.byId.get(id).h !== fresh.get(id).h).sort();
  console.log(`index: ${idx.entries.length} gyms | ${source}: ${fresh.size} gyms | index-meta matches file: ${idx.metaMatches}`);
  const show = (label, a) => { if (a.length) console.log(`  ${label}: ${a.length} e.g. ${a.slice(0, 8).join(', ')}`); };
  show('in source but not in index', missingInIndex); show('in index but not in source', extraInIndex); show('content changed since index was built', changed);
  const ok = !missingInIndex.length && !extraInIndex.length && !changed.length && idx.metaMatches;
  console.log(ok ? 'Index is up to date.' : 'Index is STALE: rebuild with build-index before planning a batch.');
  return ok ? 0 : 1;
}

async function cmdStage(source, flags) {
  if (!source || !fs.existsSync(source)) throw new Error('missing/unknown <source.json>');
  const index = S.load(flags.index ? path.resolve(flags.index) : undefined);
  let dec = null;
  if (flags.decisions) {   // reconciliation decisions.json: records it lists as rejected must never be staged
    const d = JSON.parse(fs.readFileSync(path.resolve(flags.decisions), 'utf8'));
    const rejected = d.duplicates_removed.map(x => x.remove_final_id || x.remove_repo_id);
    dec = { rejectedIds: rejected, meta: { file: rel(path.resolve(flags.decisions)), canonical_sha256: require('./lib/gym-import/stage').canonicalSha(d), rejected_records_excluded: rejected } };
  }
  const r = await stageFromFile({
    source: path.resolve(source), slug: flags.slug, description: flags.description, date: flags.date || new Date().toISOString().slice(0, 10),
    index, batchesDir: BATCHES, mustExclude: dec ? dec.rejectedIds : [], provenance: { file: rel(path.resolve(source)), extra: dec ? { decisions: dec.meta } : {} },
  });
  console.log(`${r.action}: ${rel(r.dir)}  (${r.staged} new record(s) staged)`);
  console.log('source classes: ' + Object.entries(r.byClass).map(([k, v]) => `${k} ${v}`).join(', '));
  if (r.notStaged.length) { console.log(`WARNING: ${r.notStaged.length} source record(s) were neither new nor existing and were NOT staged (fix them in the source):`); r.notStaged.slice(0, 10).forEach(x => console.log(`  line ${x.line} ${x.class} "${x.name}"`)); }
  console.log('Next: validate, plan, then review report.md. Nothing was written to production.');
  return r.notStaged.length ? 2 : 0;
}

async function cmdImport(arg, flags) {
  if (!arg) { console.error('usage: import <batch> [--dry-run | --verify | --apply --confirm <token> [--i-understand-this-writes-to-production]]\nThe batch must be named explicitly.'); return 1; }
  const chosen = ['dry-run', 'verify', 'apply'].filter(m => flags[m]);
  if (chosen.length > 1) { console.error('error: choose only one of --dry-run, --verify, --apply'); return 1; }
  const mode = chosen[0] || 'dry-run';              // no flag = dry-run: the default can never write
  const r = await runImport({ batchDir: batchPath(arg), mode, confirm: flags.confirm || null, productionFlag: !!flags['i-understand-this-writes-to-production'], indexDir: flags.index || null });
  console.log(r.report);
  if (flags['report-file']) fs.writeFileSync(path.resolve(flags['report-file']), r.report + '\n');
  return r.exit;
}

function cmdNewBatch(slug, flags) {
  if (!slug || !/^[a-z0-9][a-z0-9-]{1,60}$/.test(slug)) throw new Error('slug must be lower-case letters/digits/hyphens, e.g. "japan-osaka-round-1"');
  const id = new Date().toISOString().slice(0, 10) + '-' + slug;
  const dir = path.join(BATCHES, id);
  if (fs.existsSync(dir)) throw new Error('batch already exists: ' + id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'batch.json'), JSON.stringify({ schema_version: 1, batch_id: id, description: flags.description || 'TODO: what was researched, from which sources', created: id.slice(0, 10) }, null, 2) + '\n');
  fs.writeFileSync(path.join(dir, 'records.ndjson'), '');
  console.log(`created ${rel(dir)}/ (batch.json, records.ndjson). Append one JSON object per line to records.ndjson.`);
  return 0;
}

(async () => {
  const { pos, flags } = parseArgs(process.argv.slice(2));
  const [cmd, arg] = pos;
  try {
    let code;
    switch (cmd) {
      case 'new-batch': code = cmdNewBatch(arg, flags); break;
      case 'validate': code = await cmdValidate(batchPath(arg)); break;
      case 'plan': code = await cmdPlan(batchPath(arg), flags); break;
      case 'freeze-ids': code = await cmdFreeze(batchPath(arg), flags); break;
      case 'stage-from-file': code = await cmdStage(arg, flags); break;
      case 'build-index': code = await cmdBuildIndex(flags); break;
      case 'verify-index': code = await cmdVerifyIndex(flags); break;
      case 'import': code = await cmdImport(arg, flags); break;
      default:
        console.error(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 14).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
        code = 1;
    }
    // Never process.exit() here: with fetch sockets still closing, Node on Windows can crash (0xC0000409) and lose the exit code,
    // and this CLI's exit codes are part of its safety contract. Setting exitCode lets the event loop drain first.
    process.exitCode = code;
  } catch (e) { console.error('error: ' + redact(e.message, [process.env.SUPABASE_SERVICE_ROLE_KEY, process.env.SUPABASE_ANON_KEY])); process.exitCode = 1; }
})();
