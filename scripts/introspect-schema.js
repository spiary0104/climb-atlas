#!/usr/bin/env node
// Read-only schema introspection.  node scripts/introspect-schema.js <live|scratch> <outDir>
//   live    -> the linked Supabase project, via `supabase db query --linked` (Management API). Every query is
//              wrapped in BEGIN READ ONLY ... ROLLBACK so the database itself rejects any write.
//   local   -> the Supabase CLI local stack (supabase start), for validating migrations.
//   scratch -> a throwaway local Postgres container (docker exec climb-scratch psql), used to see what
//              supabase/schema.sql produces. Never touches production.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), { spawnSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const [target, outArg] = process.argv.slice(2);
if (!['live', 'scratch', 'local'].includes(target) || !outArg) { console.error('usage: introspect-schema.js <live|scratch|local> <outDir>'); process.exit(1); }
// local = the Supabase CLI local stack (container supabase_db_<project_id>); scratch = ad-hoc container (DB_CONTAINER, default climb-scratch)
const CONTAINER = process.env.DB_CONTAINER || (target === 'local' ? 'supabase_db_climb-atlas' : 'climb-scratch');
const outDir = path.resolve(outArg); fs.mkdirSync(outDir, { recursive: true });
const SB = process.env.SUPABASE_BIN || 'C:/Users/Spiar/tools/supabase-cli/supabase.exe';
const qdirs = [path.join(ROOT, 'supabase', 'introspection', 'queries')];
if (target === 'live') qdirs.push(path.join(ROOT, 'supabase', 'introspection', 'queries-live-only'));
const files = qdirs.flatMap(d => fs.readdirSync(d).filter(f => f.endsWith('.sql')).map(f => path.join(d, f))).sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
let failed = 0;
for (const f of files) {
  const name = path.basename(f, '.sql'); const sql = fs.readFileSync(f, 'utf8');
  if (/\b(insert|update|delete|drop|alter|create|truncate|grant|revoke)\b\s/i.test(sql.replace(/'[^']*'/g, "''")) ) { console.error('refusing non-SELECT-looking query', name); process.exit(3); }
  let stdout;
  if (target === 'live') {
    const tmp = path.join(os.tmpdir(), 'introspect-' + name + '.sql');
    fs.writeFileSync(tmp, 'begin read only;\n' + sql + '\nrollback;\n');
    const r = spawnSync(SB, ['db', 'query', '--linked', '-f', tmp], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, env: process.env });
    fs.unlinkSync(tmp); stdout = (r.stdout || '') + (r.status ? '\n' + r.stderr : '');
    const i = stdout.indexOf('{'); let parsed;
    try { parsed = JSON.parse(stdout.slice(i)); } catch (e) { console.error(name, 'FAILED:', stdout.slice(0, 400)); failed++; continue; }
    const row = parsed.rows && parsed.rows[0]; if (!row) { console.error(name, 'no rows'); failed++; continue; }
    fs.writeFileSync(path.join(outDir, name + '.json'), JSON.stringify(row.data, null, 1)); console.log('ok  ', name);
  } else {
    const r = spawnSync('docker', ['exec', '-i', CONTAINER, 'psql', '-U', 'postgres', '-d', process.env.SCRATCH_DB || 'postgres', '-At', '-q', '-v', 'ON_ERROR_STOP=1'], { input: 'begin read only;\n' + sql + '\nrollback;\n', encoding: 'utf8', maxBuffer: 1 << 28 });
    if (r.status) { console.error(name, 'FAILED:', r.stderr.slice(0, 400)); failed++; continue; }
    const line = r.stdout.split('\n').find(l => l.trim().startsWith('[') || l.trim().startsWith('{'));
    fs.writeFileSync(path.join(outDir, name + '.json'), JSON.stringify(JSON.parse(line), null, 1)); console.log('ok  ', name);
  }
}
process.exit(failed ? 1 : 0);
