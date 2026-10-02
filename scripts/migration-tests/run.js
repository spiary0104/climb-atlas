#!/usr/bin/env node
// Offline test of supabase/migrations/ on a THROWAWAY plain Postgres container (never production, never the local
// Supabase stack). See README.md in this folder.
//
//   node scripts/migration-tests/run.js            # create container, test, remove container
//   node scripts/migration-tests/run.js --control  # negative control: skip the six new migrations; cases must FAIL
//   node scripts/migration-tests/run.js --keep     # leave the container running afterwards (psql into it to look around)
//
// Steps: container -> Supabase shim -> baseline + three earlier migrations -> legacy seed data -> the six hardening
// migrations (then each applied a SECOND time to prove they are idempotent) -> 20-tests.sql -> print results.
'use strict';
const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const NAME = 'bouldeer-migtest';
const IMAGE = process.env.MIGTEST_IMAGE || 'postgres:17';   // production is Postgres 17.6
const DIR = __dirname;
const MIG = path.resolve(DIR, '..', '..', 'supabase', 'migrations');
const keep = process.argv.includes('--keep');
const control = process.argv.includes('--control');   // negative control: skip the hardening migrations, the tests must then FAIL

const docker = (args, opts = {}) => cp.spawnSync('docker', args, { encoding: 'utf8', ...opts });
function psql(sql, label) {
  const r = docker(['exec', '-i', NAME, 'psql', '-U', 'postgres', '-X', '-q', '-v', 'ON_ERROR_STOP=1'], { input: sql });
  if (r.status !== 0) { console.error(`FAILED: ${label}\n${r.stdout}\n${r.stderr}`); throw new Error(label); }
  return r.stdout;
}
const readSql = f => fs.readFileSync(f, 'utf8');
const migrations = fs.readdirSync(MIG).filter(f => f.endsWith('.sql')).sort();
const HARDENING = migrations.filter(f => f >= '20261002000100');
const EARLIER = migrations.filter(f => f < '20261002000100');

function cleanup() { if (!keep) docker(['rm', '-f', NAME]); }

(async () => {
  if (docker(['info']).status !== 0) { console.error('Docker daemon is not running.'); process.exit(2); }
  docker(['rm', '-f', NAME]);
  const up = docker(['run', '--rm', '-d', '--name', NAME, '-e', 'POSTGRES_PASSWORD=x', '-p', '55432:5432', IMAGE]);
  if (up.status !== 0) { console.error(up.stderr); process.exit(2); }
  try {
    for (let i = 0; ; i++) {      // pg_isready can answer during the image's init restart: require two successes in a row
      if (i > 60) throw new Error('postgres did not come up');
      const a = docker(['exec', NAME, 'pg_isready', '-U', 'postgres']);
      if (a.status === 0) { await new Promise(r => setTimeout(r, 1500)); if (docker(['exec', NAME, 'pg_isready', '-U', 'postgres']).status === 0) break; }
      await new Promise(r => setTimeout(r, 1000));
    }
    psql(readSql(path.join(DIR, '00-supabase-shim.sql')), 'supabase shim');
    for (const f of EARLIER) { psql(readSql(path.join(MIG, f)), f); console.log('applied  ' + f); }
    psql(readSql(path.join(DIR, '10-seed-before-hardening.sql')), 'legacy seed data');
    console.log('seeded   legacy data (orphan edit, 300-char name, user C with gyms/route/check-in/...)');
    if (!control) {
      for (const f of HARDENING) { psql(readSql(path.join(MIG, f)), f); console.log('applied  ' + f); }
      for (const f of HARDENING) { psql(readSql(path.join(MIG, f)), 're-run of ' + f); console.log('re-ran   ' + f + '  (idempotent)'); }
    } else console.log('CONTROL RUN: hardening migrations NOT applied; most cases below are expected to FAIL');
    psql(readSql(path.join(DIR, '20-tests.sql')), '20-tests.sql');
    const out = psql("select case when ok then 'PASS' else 'FAIL' end || '  ' || name || case when ok then '' else '   <-- ' || detail end from t.results order by n;", 'results');
    process.stdout.write('\n' + out.replace(/^\s+|\s+$/g, '').split('\n').map(l => l.trim()).filter(l => l && !/^[-(]/.test(l) && !/^\?column\?/.test(l)).join('\n') + '\n');
    const tot = psql("select count(*) filter (where ok) || '/' || count(*) from t.results;", 'totals').split('\n').map(l => l.trim()).find(l => /^\d+\/\d+$/.test(l));
    console.log(`\n${tot} passed`);
    process.exitCode = tot.split('/')[0] === tot.split('/')[1] ? 0 : 1;
  } catch (e) {
    console.error(e.message);
    process.exitCode = 2;
  } finally {
    cleanup();
  }
})();
