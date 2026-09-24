#!/usr/bin/env node
// Compare two introspection captures.  node scripts/compare-schema.js <liveDir> <otherDir>
// Prints every difference (only-in-live, only-in-other, changed). Exit code 1 if anything differs.
// Compares the public schema only; Supabase platform schemas (auth, storage, realtime, ...) are ignored.
'use strict';
const fs = require('fs'), path = require('path');
const [A, B] = process.argv.slice(2).map(d => path.resolve(d));
const load = (d, n) => JSON.parse(fs.readFileSync(path.join(d, n + '.json'), 'utf8'));
const ws = s => (s == null ? s : String(s).replace(/\s+/g, ' ').trim());
let diffs = 0;
const out = (...a) => console.log(...a);

function cmp(title, name, keyFn, fieldsFn, filter) {
  const pick = d => load(d, name).filter(filter || (() => true));
  const a = new Map(pick(A).map(r => [keyFn(r), r])), b = new Map(pick(B).map(r => [keyFn(r), r]));
  const onlyA = [...a.keys()].filter(k => !b.has(k)), onlyB = [...b.keys()].filter(k => !a.has(k));
  const changed = [...a.keys()].filter(k => b.has(k)).map(k => {
    const fa = fieldsFn(a.get(k)), fb = fieldsFn(b.get(k));
    const d = Object.keys(fa).filter(f => JSON.stringify(fa[f]) !== JSON.stringify(fb[f])).map(f => `${f}: live=${JSON.stringify(fa[f])} | other=${JSON.stringify(fb[f])}`);
    return d.length ? [k, d] : null;
  }).filter(Boolean);
  out(`\n## ${title}: live ${a.size}, other ${b.size}`);
  if (!onlyA.length && !onlyB.length && !changed.length) out('   identical');
  onlyA.forEach(k => { out('   ONLY IN LIVE  ', k); diffs++; });
  onlyB.forEach(k => { out('   ONLY IN OTHER ', k); diffs++; });
  changed.forEach(([k, d]) => { out('   CHANGED       ', k); d.forEach(x => out('        ' + x)); diffs++; });
}

cmp('Relations (kind, RLS enabled/forced, owner)', '02-relations', r => r.name, r => ({ kind: r.kind, rls_enabled: r.rls_enabled, rls_forced: r.rls_forced, owner: r.owner }));
cmp('Columns (incl. physical order)', '03-columns', r => r.table + '.' + r.column, r => ({ position: r.position, type: r.type, not_null: r.not_null, default: ws(r.default), generated: r.generated, identity: r.identity }));
cmp('Constraints (PK / FK / check)', '04-constraints', r => r.table + '.' + r.name, r => ({ type: r.type, definition: ws(r.definition), deferrable: r.deferrable, validated: r.validated }));
cmp('Indexes', '05-indexes', r => r.table + '.' + r.name, r => ({ definition: ws(r.definition) }));
cmp('RLS policies (public)', '06-policies', r => r.schema + '.' + r.table + '.' + r.name, r => ({ permissive: r.permissive, roles: r.roles, cmd: r.cmd, using: ws(r.using), with_check: ws(r.with_check) }), r => r.schema === 'public');
cmp('Functions (public, non-extension)', '09-functions', r => r.schema + '.' + r.name + '(' + r.args + ')', r => ({ returns: r.returns, language: r.language, security_definer: r.security_definer, volatility: r.volatility, owner: r.owner }));
cmp('Function definitions (body, search_path, attributes)', '13-function-definitions', r => r.name, r => ({ def: ws(r.def) }));
cmp('Function EXECUTE privileges', '14-function-acls', r => r.function, r => ({ acl: r.acl }));
cmp('Triggers (public tables)', '10-triggers', r => r.schema + '.' + r.table + '.' + r.name, r => ({ enabled: r.enabled, definition: ws(r.definition) }), r => r.schema === 'public');
cmp('Table privileges (public)', '07-table-grants', r => r.table + '.' + r.grantee + '.' + r.privilege, r => ({ grantable: r.grantable }));

out('\n## Extensions');
const ex = d => load(d, '01-extensions').map(e => e.name + '@' + e.schema).join(', ');
out('   live :', ex(A)); out('   other:', ex(B)); if (ex(A) !== ex(B)) diffs++;

out('\n## public schema ACL, column ACLs, default privileges');
const ga = load(A, '08-schema-and-default-grants'), gb = load(B, '08-schema-and-default-grants');
const pdp = g => g.default_privileges.filter(d => d.schema === 'public').map(d => d.role + '|' + d.object_type + '|' + d.acl).sort();
const s1 = JSON.stringify([ga.public_schema_acl, ga.public_schema_owner, ga.column_level_acls, pdp(ga)]);
const s2 = JSON.stringify([gb.public_schema_acl, gb.public_schema_owner, gb.column_level_acls, pdp(gb)]);
out(s1 === s2 ? '   identical' : '   DIFFERENT'); if (s1 !== s2) { diffs++; out('   live :', s1); out('   other:', s2); }

out('\n## Views / matviews / enums+domains / sequences / event triggers / public publications');
const rest = d => { const v = load(d, '11-views'), t = load(d, '12-types-sequences-misc'); return JSON.stringify([v.views.length, v.matviews.length, t.types, t.sequences, t.event_triggers, t.publications.filter(p => p.schema === 'public')]); };
out(rest(A) === rest(B) ? '   identical' : '   DIFFERENT'); if (rest(A) !== rest(B)) diffs++;

out('\n' + (diffs ? diffs + ' DIFFERENCE(S) FOUND' : 'NO DIFFERENCES in the compared public-schema objects'));
process.exit(diffs ? 1 : 0);
