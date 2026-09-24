#!/usr/bin/env node
// Compare two introspection captures.  node scripts/compare-schema.js <liveDir> <schemaSqlScratchDir>
// Prints every difference: only-in-live, only-in-schema.sql, and changed.
'use strict';
const fs = require('fs'), path = require('path');
const [A, B] = process.argv.slice(2).map(d => path.resolve(d));
const load = (d, n) => JSON.parse(fs.readFileSync(path.join(d, n + '.json'), 'utf8'));
const ws = s => (s == null ? s : String(s).replace(/\s+/g, ' ').trim());
let diffs = 0;
const out = (...a) => console.log(...a);
function cmp(title, name, keyFn, fieldsFn) {
  const a = new Map(load(A, name).map(r => [keyFn(r), r])), b = new Map(load(B, name).map(r => [keyFn(r), r]));
  const onlyA = [...a.keys()].filter(k => !b.has(k)), onlyB = [...b.keys()].filter(k => !a.has(k));
  const changed = [...a.keys()].filter(k => b.has(k)).map(k => { const fa = fieldsFn(a.get(k)), fb = fieldsFn(b.get(k)); const d = Object.keys(fa).filter(f => JSON.stringify(fa[f]) !== JSON.stringify(fb[f])).map(f => `${f}: live=${JSON.stringify(fa[f])} | schema.sql=${JSON.stringify(fb[f])}`); return d.length ? [k, d] : null; }).filter(Boolean);
  out(`\n## ${title}: live ${a.size}, schema.sql ${b.size}`);
  if (!onlyA.length && !onlyB.length && !changed.length) out('   identical');
  onlyA.forEach(k => { out('   ONLY IN LIVE       ', k); diffs++; });
  onlyB.forEach(k => { out('   ONLY IN schema.sql ', k); diffs++; });
  changed.forEach(([k, d]) => { out('   CHANGED            ', k); d.forEach(x => out('        ' + x)); diffs++; });
}
cmp('Relations (kind, RLS, owner)', '02-relations', r => r.name, r => ({ kind: r.kind, rls_enabled: r.rls_enabled, rls_forced: r.rls_forced, owner: r.owner }));
cmp('Columns', '03-columns', r => r.table + '.' + r.column, r => ({ position: r.position, type: r.type, not_null: r.not_null, default: ws(r.default), generated: r.generated, identity: r.identity }));
cmp('Constraints (PK / FK / unique / check)', '04-constraints', r => r.table + '.' + r.name, r => ({ type: r.type, definition: ws(r.definition), deferrable: r.deferrable, validated: r.validated }));
cmp('Indexes', '05-indexes', r => r.table + '.' + r.name, r => ({ definition: ws(r.definition) }));
cmp('RLS policies (public schema)', '06-policies', r => r.schema + '.' + r.table + '.' + r.name, r => ({ permissive: r.permissive, roles: r.roles, cmd: r.cmd, using: ws(r.using), with_check: ws(r.with_check) }));
out('\n## Extensions');
const ea = load(A, '01-extensions'), eb = load(B, '01-extensions');
out('   live:      ', ea.map(e => `${e.name}@${e.schema}`).join(', '));
out('   schema.sql:', eb.map(e => `${e.name}@${e.schema}`).join(', '));
out('\n## Objects present in live only (schema.sql defines none of these)');
out('   functions (public, non-extension):', JSON.stringify(load(A, '09-functions')));
out('   triggers :', load(A, '10-triggers').map(t => `${t.schema}.${t.table}.${t.name}`).join(', ') || 'none');
const va = load(A, '11-views'); out('   views/matviews (public):', va.views.length + '/' + va.matviews.length);
process.exit(0);
