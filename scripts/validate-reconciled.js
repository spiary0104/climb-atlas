#!/usr/bin/env node
// Independent validation of data/gyms.reconciled.json (read-only; fetches live spots with the public anon key).
//
//   node scripts/validate-reconciled.js
//
// Uses its own implementation of the id hash (does not import the reconcile script) so the check is not circular.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'data', 'reconciliation', process.argv[2] || '2026-09-24');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const orig = JSON.parse(read('data/gyms.json'));
const out = JSON.parse(read('data/gyms.reconciled.json'));
const decisions = JSON.parse(fs.readFileSync(path.join(DIR, 'decisions.json'), 'utf8'));
const dropIds = new Set(decisions.duplicates_removed.map(d => d.remove_repo_id));
const known = decisions.known_content_differences_vs_live || {};
const append = decisions.notes_append || {};
const carry = decisions.field_carryovers || {};
// Duplicates among the NEW records (not of live gyms) shrink the expected number of new gyms below the 249 found by Stage 0.
const internalDups = decisions.duplicates_removed.filter(d => d.same_gym_as_new_final_id);
const EXPECT_NEW = 249 - internalDups.length;
// A frozen id is derived from the fields as they were when it was assigned; a documented carry-over may have replaced some since.
const basis = g => { const c = Object.values(carry).find(x => x.retained_final_id === g.id); return c ? { ...g, ...c.was } : g; };

const init = read('js/supabase-init.js');
const URL_ = init.match(/https:\/\/[a-z0-9]+\.supabase\.co/)[0];
const KEY = init.match(/sb_publishable_[A-Za-z0-9_-]+/)[0];
async function fetchLive() {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${URL_}/rest/v1/spots?select=id,name,country,lat,lng,address&status=eq.approved&order=id`, { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, Range: `${from}-${from + 999}` } });
    if (!r.ok) throw new Error('Supabase HTTP ' + r.status);
    const page = await r.json(); rows.push(...page); if (page.length < 1000) break;
  }
  return rows;
}
// independent id derivation
const norm = s => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\([^)]*\)/g, ' ')
  .replace(/[^a-z0-9Ѐ-ӿ぀-ヿ㐀-鿿가-힯]+/g, ' ').replace(/\s+/g, ' ').trim();
const fullHash = g => crypto.createHash('sha1').update([g.country, norm(g.name), norm(g.suburb), (+g.lat).toFixed(4), (+g.lng).toFixed(4)].join('|')).digest('hex');

const results = [];
const check = (name, ok, detail) => { results.push({ name, ok, detail }); };

(async () => {
  const live = await fetchLive();
  const liveById = new Map(live.map(l => [l.id, l]));
  const liveIds = new Set(live.keys ? live.map(l => l.id) : []);
  const outById = new Map();
  out.forEach(g => outById.set(g.id, (outById.get(g.id) || 0) + 1));

  // 1. every live id exactly once
  const missing = live.filter(l => outById.get(l.id) !== 1);
  check('1. every live id appears exactly once', missing.length === 0, `${live.length} live ids; problems: ${missing.length}`);

  // 2. no live id assigned to a different gym (same country + same address point; name equal unless a documented edit)
  const wrong = [];
  out.forEach(g => {
    const l = liveById.get(g.id); if (!l) return;
    const samePoint = g.country === l.country && Math.abs(g.lat - l.lat) < 1e-6 && Math.abs(g.lng - l.lng) < 1e-6;
    const sameName = g.name === l.name || known[g.id];
    const sameAddr = (g.address || null) === (l.address || null);
    if (!(samePoint && sameName && sameAddr)) wrong.push(`${g.id}: repo "${g.name}" vs live "${l.name}"`);
  });
  check('2. no live id is assigned to a different gym', wrong.length === 0, wrong.length ? wrong.slice(0, 5).join(' | ') : `${live.length} live-id records verified against live (country, coordinates, address, name)`);

  // 3. no unrelated live id remains attached to a repo gym
  const keyOf = g => [g.country, g.name, g.lat, g.lng].join('|');
  const outKeys = new Map(out.map(g => [keyOf(basis(g)), g]));   // basis(): match a carried-over record by its ORIGINAL fields
  let staleAttached = 0, reIded = 0;
  orig.forEach(o => {
    if (dropIds.has(o.id)) return;
    const now = outKeys.get(keyOf(o)); if (!now) return;
    if (liveById.has(o.id) && now.id !== o.id) { reIded++; }      // held someone else's live id, now changed
    if (liveById.has(now.id) === false && now.id.startsWith('seed-')) staleAttached++;   // seed id not present live
  });
  const liveIdRecords = out.filter(g => liveById.has(g.id)).length;
  check('3. no unrelated live id remains attached to a repo gym', staleAttached === 0 && liveIdRecords === live.length, `records carrying a live id: ${liveIdRecords} (= live rows ${live.length}); repo gyms that held another gym's live id and were re-id'd: ${reIded}; seed-* ids not present live: ${staleAttached}`);

  // 4. all ids unique
  check('4. all ids are unique', new Set(out.map(g => g.id)).size === out.length, `${out.length} records, ${new Set(out.map(g => g.id)).size} distinct ids`);

  // 5. new g- ids
  const newOnes = out.filter(g => !liveById.has(g.id));
  const bad = [];
  newOnes.forEach(g => {
    const m = /^g-([0-9a-f]{10,40})$/.exec(g.id); if (!m) { bad.push(g.id + ' (bad format)'); return; }
    if (liveById.has(g.id)) bad.push(g.id + ' (collides with live)');
    if (!fullHash(basis(g)).startsWith(m[1])) bad.push(g.id + ' (does not match hash of its own fields)');
  });
  check('5. genuinely new gyms each have one unique, non-colliding g- id', newOnes.length === EXPECT_NEW && bad.length === 0, `new records: ${newOnes.length} (expected 249 - ${internalDups.length} documented in-batch duplicates = ${EXPECT_NEW}); problems: ${bad.length}${bad.length ? ' e.g. ' + bad[0] : ''}`);

  // 6. no array-position dependence: shuffle the input and re-derive every new id
  const rnd = (() => { let s = 12345; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; })();
  let posDep = 0;
  for (let run = 0; run < 5; run++) {
    const shuffled = [...newOnes].sort(() => rnd() - 0.5);
    const used = new Set(live.map(l => l.id)); const rederived = new Map();
    shuffled.forEach(g => { const h = fullHash(basis(g)); for (let len = 10; len <= 40; len += 2) { const id = 'g-' + h.slice(0, len); if (!used.has(id)) { used.add(id); rederived.set(keyOf(g), id); break; } } });
    newOnes.forEach(g => { if (rederived.get(keyOf(g)) !== g.id) posDep++; });
  }
  const seedNew = out.filter(g => !liveById.has(g.id) && g.id.startsWith('seed-')).length;
  check('6. no array-position-derived ids', posDep === 0 && seedNew === 0, `5 shuffled re-derivations: ${posDep} mismatches; non-live seed-* ids: ${seedNew}`);

  // 7. no records silently lost; retained records unchanged apart from id (and documented notes appends)
  const expected = orig.filter(o => !dropIds.has(o.id));
  const lost = [], changed = [];
  expected.forEach(o => {
    const now = outKeys.get(keyOf(o)); if (!now) { lost.push(o.id + ' ' + o.name); return; }
    const want = { ...o, id: now.id }; if (append[o.id]) want.notes = (want.notes || '') + append[o.id];
    if (carry[o.id]) Object.assign(want, carry[o.id].set);
    if (JSON.stringify(sortKeys(want)) !== JSON.stringify(sortKeys(now))) changed.push(o.id + ' ' + o.name);
  });
  check('7. no records silently lost or altered (documented notes appends / field carry-overs excepted)', lost.length === 0 && changed.length === 0 && out.length === expected.length, `expected ${expected.length} (=${orig.length} - ${dropIds.size} documented duplicates); got ${out.length}; lost ${lost.length}; altered ${changed.length}`);

  // 7b. every documented removal is auditable: the full rejected record is preserved in decisions.json, equals the record in
  //     data/gyms.json, is absent from the reconciled file, and points at a retained record that IS in the reconciled file
  const audit = [];
  decisions.duplicates_removed.forEach(d => {
    const o = orig.find(x => x.id === d.remove_repo_id);
    if (!o) audit.push(d.remove_repo_id + ' not in gyms.json');
    if (d.same_gym_as_new_final_id) {
      const { final_id, ...snap } = d.rejected_record || {};
      if (!d.rejected_record || JSON.stringify(snap) !== JSON.stringify(o)) audit.push(d.remove_repo_id + ': rejected_record snapshot missing or differs from gyms.json');
      if (out.some(g => g.id === d.remove_final_id)) audit.push(d.remove_final_id + ' still in reconciled file');
      if (!out.some(g => g.id === d.retained_final_id)) audit.push(d.retained_final_id + ' (retained) missing from reconciled file');
      if (!d.evidence || !d.evidence.length || !d.action || !d.conclusion) audit.push(d.remove_repo_id + ': relationship/evidence/action not recorded');
    }
  });
  check('7b. every rejected duplicate is documented and auditable', audit.length === 0, `${decisions.duplicates_removed.length} documented removals (${internalDups.length} among new records); problems: ${audit.length}${audit.length ? ' e.g. ' + audit[0] : ''}`);

  // 8. counts before/after
  const retainedLive = out.filter(g => liveById.has(g.id)).length;
  const newG = out.filter(g => g.id.startsWith('g-')).length;
  const idChanged = orig.filter(o => { const n = outKeys.get(keyOf(o)); return n && n.id !== o.id; }).length;

  // 9. original file untouched (byte-for-byte)
  const sha = b => crypto.createHash('sha256').update(b).digest('hex');
  const cur = fs.readFileSync(path.join(ROOT, 'data', 'gyms.json'));
  const backupPath = path.join(ROOT, 'data', 'backups', 'gyms.pre-reconciliation-2026-09-24.json');
  // git may store LF while the working copy is CRLF (autocrlf), so compare with git's own diff, not raw bytes
  let sameAsTag = true; try { execSync('git diff --quiet pre-id-reconciliation -- data/gyms.json', { cwd: ROOT }); } catch (e) { sameAsTag = false; }
  const untouchedSinceTag = execSync('git status --porcelain -- data/gyms.json', { cwd: ROOT }).toString().trim() === '';
  const backupOk = fs.existsSync(backupPath) && sha(fs.readFileSync(backupPath)) === sha(cur);
  check('9. original data/gyms.json is byte-for-byte unchanged', sameAsTag && untouchedSinceTag && backupOk, `sha256 ${sha(cur).slice(0, 16)}… | identical to git tag pre-id-reconciliation: ${sameAsTag} | no working-tree modification: ${untouchedSinceTag} | byte-identical to local backup: ${backupOk}`);

  console.log('\nBEFORE: ' + orig.length + ' records | AFTER: ' + out.length + ' records');
  console.log(`  live ids retained: ${retainedLive}/${live.length} (their live rows are unchanged; the repo file changes ids only)`);
  console.log(`  new g- ids: ${newG} | documented duplicates removed: ${dropIds.size} | live rows now: ${live.length}\n`);
  results.forEach(r => console.log((r.ok ? 'PASS  ' : 'FAIL  ') + r.name + '\n        ' + r.detail));
  const failed = results.filter(r => !r.ok).length;
  console.log('\n' + (failed ? failed + ' CHECK(S) FAILED' : 'ALL CHECKS PASSED'));
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });

function sortKeys(o) { return Object.keys(o).sort().reduce((a, k) => (a[k] = o[k], a), {}); }
