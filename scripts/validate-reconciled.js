#!/usr/bin/env node
// Independent validation of data/gyms.reconciled.json against live production (read-only; public anon GETs only).
//
//   node scripts/validate-reconciled.js
//
// Uses its own implementation of the id hash (does not import the reconcile script) so the check is not circular.
//
// TWO STATES, decided from LIVE FACTS (never from the manifest):
//   pre-import   none of the reconciled dataset's new `g-` gyms exists in production yet. Original Stage 0 expectations apply:
//                the new gyms are absent from live and there are exactly EXPECT_NEW of them.
//   post-import  ALL of them exist in production (the first import batch has run). Expectations: same count, each already live under
//                its frozen id with identical content (check 2 covers every live-id record), and the import manifest agrees.
//   anything in between (some but not all) is a FAILURE: production and the dataset disagree about what was imported.
// The manifest is only cross-checked (check 10): after an import it must exist and match; before one it must not exist.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BATCH_ID = '2026-09-24-reconciled-new-gyms';
// git blob id of data/gyms.json at tag pre-id-reconciliation: platform-independent (line-ending filters applied), so the original
// dataset can be proven unchanged even where the tag is unavailable.
const ORIGINAL_GYMS_JSON_BLOB = '23bca878ed8324de4dd0fd4f76b514c7028bee1d';

// independent id derivation (deliberately NOT imported from the pipeline)
const norm = s => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\([^)]*\)/g, ' ')
  .replace(/[^a-z0-9Ѐ-ӿ぀-ヿ㐀-鿿가-힯]+/g, ' ').replace(/\s+/g, ' ').trim();
const fullHash = g => crypto.createHash('sha1').update([g.country, norm(g.name), norm(g.suburb), (+g.lat).toFixed(4), (+g.lng).toFixed(4)].join('|')).digest('hex');
const sortKeys = o => Object.keys(o).sort().reduce((a, k) => (a[k] = o[k], a), {});
const keyOf = g => [g.country, g.name, g.lat, g.lng].join('|');

// Check 9: the ORIGINAL data/gyms.json is unchanged. Durable references: the git blob id (pinned above) and, when available, the tag.
function checkOriginalGymsJson(root = ROOT) {
  const sh = (c) => execSync(c, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  const cur = fs.readFileSync(path.join(root, 'data', 'gyms.json'));
  const sha = b => crypto.createHash('sha256').update(b).digest('hex');
  let blob = null; try { blob = sh('git hash-object --path=data/gyms.json data/gyms.json'); } catch (e) { /* not a git checkout */ }
  const pinned = blob === ORIGINAL_GYMS_JSON_BLOB;
  let tag = 'tag not available here';
  let tagOk = true;
  try { sh('git rev-parse -q --verify refs/tags/pre-id-reconciliation'); try { sh('git diff --quiet pre-id-reconciliation -- data/gyms.json'); tag = 'identical to git tag pre-id-reconciliation'; } catch (e) { tagOk = false; tag = 'DIFFERS from git tag pre-id-reconciliation'; } } catch (e) { /* tag absent: the pinned blob id is the reference */ }
  // No UNSTAGED edits. (A deliberate, staged change during an integration is allowed; committed history is covered by the blob/tag checks.)
  let unstaged = true; try { unstaged = sh('git diff --name-only -- data/gyms.json') === ''; } catch (e) { /* not a git checkout */ }
  const backupPath = path.join(root, 'data', 'backups', 'gyms.pre-reconciliation-2026-09-24.json');
  const haveBackup = fs.existsSync(backupPath);
  const backupOk = !haveBackup || sha(fs.readFileSync(backupPath)) === sha(cur);
  const ok = pinned && tagOk && unstaged && backupOk;
  return { ok, detail: `sha256 ${sha(cur).slice(0, 16)}… | git blob ${blob ? blob.slice(0, 10) : 'n/a'}… ${pinned ? '= pinned original' : '!= PINNED ORIGINAL ' + ORIGINAL_GYMS_JSON_BLOB.slice(0, 10) + '…'} | ${tag} | no unstaged edits: ${unstaged} | ${haveBackup ? 'byte-identical to local backup: ' + backupOk : 'local backup not present (gitignored; blob id + tag are the durable references)'}` };
}

// ctx: { orig, out, decisions, live, manifest, originalCheck }
//   orig      data/gyms.json (original 2,133 records)         out       data/gyms.reconciled.json
//   decisions data/reconciliation/<date>/decisions.json         live      approved production rows ({id,name,country,lat,lng,address})
//   manifest  result of manifest.readManifest() for the batch (or null)   originalCheck  () => {ok, detail}
function runChecks(ctx) {
  const { orig, out, decisions, live } = ctx;
  const dropIds = new Set(decisions.duplicates_removed.map(d => d.remove_repo_id));
  const known = decisions.known_content_differences_vs_live || {};
  const append = decisions.notes_append || {};
  const carry = decisions.field_carryovers || {};
  // Duplicates among the NEW records (not of live gyms) shrink the expected number of new gyms below the 249 found by Stage 0.
  const internalDups = decisions.duplicates_removed.filter(d => d.same_gym_as_new_final_id);
  const EXPECT_NEW = 249 - internalDups.length;
  // A frozen id is derived from the fields as they were when it was assigned; a documented carry-over may have replaced some since.
  const basis = g => { const c = Object.values(carry).find(x => x.retained_final_id === g.id); return c ? { ...g, ...c.was } : g; };

  const results = [];
  const check = (name, ok, detail) => { results.push({ name, ok, detail }); };
  const liveById = new Map(live.map(l => [l.id, l]));
  const outById = new Map(); out.forEach(g => outById.set(g.id, (outById.get(g.id) || 0) + 1));
  const gRecords = out.filter(g => g.id.startsWith('g-'));
  const gIds = new Set(gRecords.map(g => g.id));
  const gLive = gRecords.filter(g => liveById.has(g.id)).length;
  const mode = gLive === 0 ? 'pre-import' : gLive === gRecords.length ? 'post-import' : 'INCONSISTENT';

  check('0. state is unambiguous: the new g- gyms are ALL absent from production (pre-import) or ALL present (post-import)', mode !== 'INCONSISTENT',
    `${gRecords.length} g- records in the dataset; ${gLive} exist in production -> ${mode}` + (mode === 'INCONSISTENT' ? ' (production and the dataset disagree about what was imported)' : ''));

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
  check('2. no live id is assigned to a different gym', wrong.length === 0, wrong.length ? wrong.slice(0, 5).join(' | ') : `${out.filter(g => liveById.has(g.id)).length} live-id records verified against live (country, coordinates, address, name)`);

  // 3. no unrelated live id remains attached to a repo gym
  const outKeys = new Map(out.map(g => [keyOf(basis(g)), g]));   // basis(): match a carried-over record by its ORIGINAL fields
  let staleAttached = 0, reIded = 0;
  orig.forEach(o => {
    if (dropIds.has(o.id)) return;
    const now = outKeys.get(keyOf(o)); if (!now) return;
    if (liveById.has(o.id) && now.id !== o.id) reIded++;                                    // held someone else's live id, now changed
    if (liveById.has(now.id) === false && now.id.startsWith('seed-')) staleAttached++;      // seed id not present live
  });
  const liveIdRecords = out.filter(g => liveById.has(g.id)).length;
  check('3. no unrelated live id remains attached to a repo gym', staleAttached === 0 && liveIdRecords === live.length, `records carrying a live id: ${liveIdRecords} (= live rows ${live.length}); repo gyms that held another gym's live id and were re-id'd: ${reIded}; seed-* ids not present live: ${staleAttached}`);

  // 4. all ids unique
  check('4. all ids are unique', new Set(out.map(g => g.id)).size === out.length, `${out.length} records, ${new Set(out.map(g => g.id)).size} distinct ids`);

  // 5. the new g- gyms: format, hash of their own (freeze-time) fields, expected count, and state-specific placement
  const bad = [];
  gRecords.forEach(g => {
    const m = /^g-([0-9a-f]{10,40})$/.exec(g.id); if (!m) { bad.push(g.id + ' (bad format)'); return; }
    if (!fullHash(basis(g)).startsWith(m[1])) bad.push(g.id + ' (does not match hash of its own fields)');
    if (mode === 'pre-import' && liveById.has(g.id)) bad.push(g.id + ' (collides with live)');
    if (mode === 'post-import' && !liveById.has(g.id)) bad.push(g.id + ' (expected in production after the import)');
  });
  check('5. genuinely new gyms each have one unique, non-colliding g- id', gRecords.length === EXPECT_NEW && bad.length === 0,
    `${mode}: new records: ${gRecords.length} (expected 249 - ${internalDups.length} documented in-batch duplicates = ${EXPECT_NEW}); problems: ${bad.length}${bad.length ? ' e.g. ' + bad[0] : ''}`);

  // 6. no array-position dependence: shuffle the input and re-derive every new id (against the ids that were "used" at freeze time)
  const rnd = (() => { let s = 12345; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; })();
  let posDep = 0;
  for (let run = 0; run < 5; run++) {
    const shuffled = [...gRecords].sort(() => rnd() - 0.5);
    const used = new Set(live.map(l => l.id).filter(id => !gIds.has(id))); const rederived = new Map();
    shuffled.forEach(g => { const h = fullHash(basis(g)); for (let len = 10; len <= 40; len += 2) { const id = 'g-' + h.slice(0, len); if (!used.has(id)) { used.add(id); rederived.set(keyOf(g), id); break; } } });
    gRecords.forEach(g => { if (rederived.get(keyOf(g)) !== g.id) posDep++; });
  }
  const seedNew = out.filter(g => !liveById.has(g.id) && g.id.startsWith('seed-')).length;
  check('6. no array-position-derived ids', posDep === 0 && seedNew === 0, `5 shuffled re-derivations: ${posDep} mismatches; non-live seed-* ids: ${seedNew}`);

  // 7. no records silently lost; retained records unchanged apart from id (and documented notes appends / field carry-overs)
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

  // 9. original data/gyms.json untouched (durable references: pinned blob id, tag, local backup when present)
  const orig9 = (ctx.originalCheck || checkOriginalGymsJson)();
  check('9. original data/gyms.json is unchanged', orig9.ok, orig9.detail);

  // 10. the import manifest agrees with the dataset and with production (cross-check only: the mode came from live facts)
  const mf = ctx.manifest || { exists: false };
  if (mode === 'post-import') {
    const m = mf.manifest, mProblems = [];
    if (!mf.exists) mProblems.push('production already has the new gyms but the batch has no manifest.json');
    else if (!mf.valid) mProblems.push('manifest.json is not valid: ' + (mf.problems || []).join('; '));
    else {
      if (JSON.stringify([...m.ids].sort()) !== JSON.stringify([...gIds].sort())) mProblems.push('manifest ids differ from the dataset\'s g- ids');
      if (m.rows_inserted !== EXPECT_NEW) mProblems.push(`manifest rows_inserted ${m.rows_inserted} != ${EXPECT_NEW}`);
      if (m.approved_after - m.approved_before !== EXPECT_NEW) mProblems.push(`manifest approved_after - approved_before = ${m.approved_after - m.approved_before}`);
      if (m.target.kind !== 'production') mProblems.push('manifest target is not production');
      if (m.approved_after > live.length) mProblems.push(`manifest approved_after ${m.approved_after} exceeds live rows ${live.length}`);
    }
    check('10. post-import: the import manifest matches the dataset and production', mProblems.length === 0, mProblems.length ? mProblems.join(' | ') : `status ${m.status}, ${m.rows_inserted} rows, approved ${m.approved_before} -> ${m.approved_after}, ids == the ${gRecords.length} g- records, all live`);
  } else if (mode === 'pre-import') {
    check('10. pre-import: no import manifest exists yet', !mf.exists, mf.exists ? 'a manifest.json exists but production does not have the gyms it claims' : 'no manifest, as expected before the import');
  }

  const retainedLive = out.filter(g => liveById.has(g.id)).length;
  const summary = { mode, before: orig.length, after: out.length, retainedLive, liveRows: live.length, newG: gRecords.length, removed: dropIds.size, expectNew: EXPECT_NEW };
  return { mode, results, summary, failed: results.filter(r => !r.ok).length };
}

async function fetchLive() {
  const init = fs.readFileSync(path.join(ROOT, 'js', 'supabase-init.js'), 'utf8');
  const URL_ = init.match(/https:\/\/[a-z0-9]+\.supabase\.co/)[0];
  const KEY = init.match(/sb_publishable_[A-Za-z0-9_-]+/)[0];
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const r = await fetch(`${URL_}/rest/v1/spots?select=id,name,country,lat,lng,address&status=eq.approved&order=id`, { method: 'GET', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, Range: `${from}-${from + 999}` } });
    if (!r.ok) throw new Error('Supabase HTTP ' + r.status);
    const page = await r.json(); rows.push(...page); if (page.length < 1000) break;
  }
  return rows;
}

async function main() {
  const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
  const DIR = path.join(ROOT, 'data', 'reconciliation', process.argv[2] || '2026-09-24');
  const { readManifest } = require('./lib/gym-import/manifest');
  const live = await fetchLive();
  const r = runChecks({ orig: JSON.parse(read('data/gyms.json')), out: JSON.parse(read('data/gyms.reconciled.json')), decisions: JSON.parse(fs.readFileSync(path.join(DIR, 'decisions.json'), 'utf8')), live, manifest: readManifest(path.join(ROOT, 'import', 'batches', BATCH_ID)) });
  const s = r.summary;
  console.log(`\nSTATE: ${s.mode}`);
  console.log('BEFORE: ' + s.before + ' records | AFTER: ' + s.after + ' records');
  console.log(`  live ids retained: ${s.retainedLive}/${s.liveRows} (their live rows are unchanged; the repo file changes ids only)`);
  console.log(`  new g- ids: ${s.newG} (expected ${s.expectNew}) | documented duplicates removed: ${s.removed} | live rows now: ${s.liveRows}\n`);
  r.results.forEach(x => console.log((x.ok ? 'PASS  ' : 'FAIL  ') + x.name + '\n        ' + x.detail));
  console.log('\n' + (r.failed ? r.failed + ' CHECK(S) FAILED' : 'ALL CHECKS PASSED'));
  process.exitCode = r.failed ? 1 : 0;   // not process.exit(): it can crash Node on Windows while fetch sockets close
}

module.exports = { runChecks, checkOriginalGymsJson, ORIGINAL_GYMS_JSON_BLOB };
if (require.main === module) main().catch(e => { console.error(e); process.exitCode = 2; });
