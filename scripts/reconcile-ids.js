#!/usr/bin/env node
// Read-only reconciliation of data/gyms.json against the LIVE Supabase `spots` table.
//
//   node scripts/reconcile-ids.js [outDir]
//
// Live `spots.id` values are canonical: marks / sessions / routes reference them.
// This script NEVER writes to Supabase and NEVER modifies data/gyms.json. It fetches the
// approved live rows with the public anon key (same access any site visitor has), matches
// each repo gym to at most one live gym, and writes review files to outDir
// (default data/reconciliation/<date>/). No dependencies beyond Node >= 18.
//
// Matching is by country + name + coordinates -- never by array position or id alone.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const outDir = path.resolve(process.argv[2] || path.join(ROOT, 'data', 'reconciliation', new Date().toISOString().slice(0, 10)));
fs.mkdirSync(outDir, { recursive: true });

// ---- normalisation ---------------------------------------------------------
const STOP = new Set(['climbing', 'climb', 'gym', 'center', 'centre', 'bouldering', 'boulder', 'boulders', 'wall', 'walls', 'club', 'the', 'and', 'indoor', 'sport', 'sports', 'rock', 'park']);
const n1 = s => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/\([^)]*\)/g, ' ').replace(/[^a-z0-9Ѐ-ӿ぀-ヿ㐀-鿿가-힯]+/g, ' ').replace(/\s+/g, ' ').trim();
const n2 = s => n1(s).split(' ').filter(t => t && !STOP.has(t)).join(' ');
const toks = s => new Set(n2(s).split(' ').filter(Boolean));
function jaccard(a, b) { const A = toks(a), B = toks(b); if (!A.size || !B.size) return 0; let i = 0; A.forEach(t => { if (B.has(t)) i++; }); return i / (A.size + B.size - i); }
function meters(a, b) {
  const R = 6371000, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

// ---- inputs ----------------------------------------------------------------
const repo = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'gyms.json'), 'utf8'));
const init = fs.readFileSync(path.join(ROOT, 'js', 'supabase-init.js'), 'utf8');
const URL_ = (init.match(/https:\/\/[a-z0-9]+\.supabase\.co/) || [])[0];
const KEY = (init.match(/sb_publishable_[A-Za-z0-9_-]+/) || [])[0];
if (!URL_ || !KEY) throw new Error('Could not read the Supabase URL / anon key from js/supabase-init.js');

async function fetchLive() {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const res = await fetch(`${URL_}/rest/v1/spots?select=*&status=eq.approved&order=id`, {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, Range: `${from}-${from + 999}` }
    });
    if (!res.ok) throw new Error('Supabase HTTP ' + res.status);
    const page = await res.json();
    rows.push(...page);
    if (page.length < 1000) break;
  }
  return rows;
}

(async () => {
  const live = await fetchLive();
  fs.writeFileSync(path.join(outDir, 'live-snapshot.json'), JSON.stringify(live));
  const liveById = new Map(live.map(g => [g.id, g]));
  const claimedLive = new Set();     // live ids already matched
  const match = new Map();           // repo index -> { live, tier, dist, note }
  const byCountry = new Map();
  live.forEach(l => { if (!byCountry.has(l.country)) byCountry.set(l.country, []); byCountry.get(l.country).push(l); });

  const claim = (ri, l, tier, note) => {
    claimedLive.add(l.id);
    match.set(ri, { live: l, tier, dist: Math.round(meters(repo[ri], l)), note: note || '' });
  };

  // T1: same id AND it is plausibly the same gym (same country, same name or within 150 m)
  repo.forEach((r, ri) => {
    const l = liveById.get(r.id);
    if (!l || l.country !== r.country || claimedLive.has(l.id)) return;
    if (n1(l.name) === n1(r.name) || meters(r, l) <= 150) claim(ri, l, 'T1-exact-id', '');
  });

  // T2: same country + identical normalised name. Greedy one-to-one, closest pair first, so when
  // two repo gyms compete for one live gym the nearest wins and the other is reported as a
  // possible duplicate of that live gym (human decision) instead of silently becoming "new".
  const ambiguous = [];
  const duplicateOfLive = [];
  const pairs = [];
  repo.forEach((r, ri) => {
    if (match.has(ri) || !n1(r.name)) return;
    (byCountry.get(r.country) || []).forEach(l => { if (!claimedLive.has(l.id) && n1(l.name) === n1(r.name)) pairs.push({ ri, l, d: meters(r, l) }); });
  });
  pairs.sort((a, b) => a.d - b.d);
  const nameTotals = new Map(); // how many repo / live gyms carry each (country, name)
  repo.forEach(r => { const k = r.country + '|' + n1(r.name); nameTotals.set(k, (nameTotals.get(k) || 0) + 1); });
  const decided = new Set();
  pairs.forEach(({ ri, l, d }) => {
    if (match.has(ri) || claimedLive.has(l.id)) return;
    const r = repo[ri];
    const rivals = pairs.filter(p => p.ri === ri && p.l !== l && !claimedLive.has(p.l.id));
    if (d <= 1000 && (rivals.length === 0 || rivals[0].d > d * 3 + 200)) claim(ri, l, 'T2-same-name', '');
    else if (rivals.length === 0) claim(ri, l, 'T2-same-name-moved', `pin differs by ${Math.round(d)} m`);
    else { ambiguous.push({ repo: r, reason: 'several unclaimed live gyms share this name and distances are not decisive', candidates: [{ l, d }, ...rivals.map(p => ({ l: p.l, d: p.d }))].slice(0, 4).map(x => ({ id: x.l.id, name: x.l.name, dist_m: Math.round(x.d) })) }); decided.add(ri); }
  });
  // Repo gyms whose only same-name live counterpart was claimed by a closer repo gym.
  repo.forEach((r, ri) => {
    if (match.has(ri) || decided.has(ri)) return;
    const taken = pairs.filter(p => p.ri === ri && claimedLive.has(p.l.id));
    if (taken.length) { const t = taken.sort((a, b) => a.d - b.d)[0]; duplicateOfLive.push({ repo: r, live: t.l, dist_m: Math.round(t.d) }); }
  });
  const duplicateOfLiveRepo = new Set(duplicateOfLive.map(x => x.repo));

  // T3: same country, within 100 m, names related (renamed / translated / rebranded).
  repo.forEach((r, ri) => {
    if (match.has(ri) || ambiguous.some(a => a.repo === r) || duplicateOfLiveRepo.has(r)) return;
    const cands = (byCountry.get(r.country) || []).filter(l => !claimedLive.has(l.id) && meters(r, l) <= 100)
      .map(l => ({ l, d: meters(r, l), j: jaccard(r.name, l.name), cont: n2(l.name).includes(n2(r.name)) || n2(r.name).includes(n2(l.name)) }))
      .filter(c => c.j >= 0.5 || (c.cont && n2(r.name).length > 3));
    if (cands.length === 1) claim(ri, cands[0].l, 'T3-renamed-nearby', `name differs; ${Math.round(cands[0].d)} m apart`);
    else if (cands.length > 1) ambiguous.push({ repo: r, reason: 'several live gyms within 100 m with related names', candidates: cands.map(c => ({ id: c.l.id, name: c.l.name, dist_m: Math.round(c.d) })) });
  });

  // T4 (review only, never auto-applied): same country, within 250 m, some name similarity.
  const probable = [];
  repo.forEach((r, ri) => {
    if (match.has(ri) || ambiguous.some(a => a.repo === r) || duplicateOfLiveRepo.has(r)) return;
    const c = (byCountry.get(r.country) || []).filter(l => !claimedLive.has(l.id))
      .map(l => ({ l, d: meters(r, l), j: jaccard(r.name, l.name) })).filter(x => x.d <= 250 && x.j >= 0.25).sort((a, b) => a.d - b.d)[0];
    if (c) probable.push({ repo: r, live: c.l, dist_m: Math.round(c.d), jaccard: +c.j.toFixed(2) });
  });
  const probableRepo = new Set(probable.map(p => p.repo));
  const ambiguousRepo = new Set(ambiguous.map(a => a.repo));

  // ---- new ids for repo gyms with no live counterpart ----------------------
  // Stable, content-derived, NOT position-derived: g-<10 hex of sha1(country|name|suburb|lat|lng)>.
  // Derived once, then frozen in the data (a later rename or pin fix must not change it).
  const used = new Set([...live.map(l => l.id)]);
  const newId = r => {
    const seed = [r.country, n1(r.name), n1(r.suburb), (+r.lat).toFixed(4), (+r.lng).toFixed(4)].join('|');
    const h = crypto.createHash('sha1').update(seed).digest('hex');
    for (let len = 10; len <= 40; len += 2) { const id = 'g-' + h.slice(0, len); if (!used.has(id)) { used.add(id); return id; } }
    throw new Error('id collision for ' + r.name);
  };

  const rows = { exact: [], replaced: [], newGyms: [], ambiguousRows: [], probableRows: [] };
  const finalId = new Array(repo.length);
  repo.forEach((r, ri) => {
    const m = match.get(ri);
    if (m) {
      finalId[ri] = m.live.id;
      const base = { name: r.name, country: r.country, suburb: r.suburb, repo_id: r.id, live_id: m.live.id, tier: m.tier, dist_m: m.dist, note: m.note };
      (r.id === m.live.id ? rows.exact : rows.replaced).push(base);
    } else if (ambiguousRepo.has(r) || probableRepo.has(r) || duplicateOfLiveRepo.has(r)) {
      finalId[ri] = null; // decided by a human; not assigned
    } else {
      finalId[ri] = newId(r);
      rows.newGyms.push({ name: r.name, country: r.country, suburb: r.suburb, state: r.state, old_repo_id: r.id, proposed_new_id: finalId[ri] });
    }
  });

  // Live gyms nobody matched.
  const unmatchedLive = live.filter(l => !claimedLive.has(l.id)).map(l => ({ id: l.id, name: l.name, country: l.country, suburb: l.suburb, lat: l.lat, lng: l.lng }));

  // A repo gym that currently holds a live id belonging to a DIFFERENT gym: must be re-id'd.
  const idConflicts = repo.map((r, ri) => ({ r, ri })).filter(({ r, ri }) => liveById.has(r.id) && finalId[ri] !== r.id)
    .map(({ r, ri }) => ({ repo_gym: r.name, country: r.country, repo_id: r.id, live_gym_with_that_id: liveById.get(r.id).name, will_become: finalId[ri] || '(needs human decision)' }));

  // Duplicate candidates inside the repo (same country, <60 m or same normalised name+suburb).
  const dups = [];
  for (let i = 0; i < repo.length; i++) for (let j = i + 1; j < repo.length; j++) {
    const a = repo[i], b = repo[j]; if (a.country !== b.country) continue;
    if (Math.abs(a.lat - b.lat) > 0.001 || Math.abs(a.lng - b.lng) > 0.001) { if (!(n1(a.name) === n1(b.name) && n1(a.suburb) === n1(b.suburb))) continue; }
    const d = meters(a, b);
    if (d <= 60 || (n1(a.name) === n1(b.name) && n1(a.suburb) === n1(b.suburb))) dups.push({ a_id: a.id, a_name: a.name, b_id: b.id, b_name: b.name, country: a.country, dist_m: Math.round(d) });
  }
  // Repo-new gyms that sit right next to an existing live gym (possible duplicates of live).
  const newNearLive = [];
  repo.forEach((r, ri) => { if (!finalId[ri] || match.has(ri)) return; (byCountry.get(r.country) || []).forEach(l => { const d = meters(r, l); if (d <= 60) newNearLive.push({ new_gym: r.name, proposed_id: finalId[ri], live_id: l.id, live_name: l.name, country: r.country, dist_m: Math.round(d) }); }); });

  // Content drift for matched gyms (repo differs from live in data fields) -- informational only.
  const F = ['name', 'suburb', 'state', 'lat', 'lng', 'address', 'notes'];
  let driftCount = 0; const driftByField = {}; const typeDiff = [];
  repo.forEach((r, ri) => {
    const m = match.get(ri); if (!m) return; let any = false;
    F.forEach(f => { const a = r[f] == null ? null : r[f], b = m.live[f] == null ? null : m.live[f]; if (JSON.stringify(a) !== JSON.stringify(b)) { driftByField[f] = (driftByField[f] || 0) + 1; any = true; } });
    if (JSON.stringify([...(r.types || [])].sort()) !== JSON.stringify([...(m.live.types || [])].sort())) { driftByField.types = (driftByField.types || 0) + 1; any = true; }
    if (any) driftCount++;
  });

  // ---- write review files -----------------------------------------------------
  const csv = (name, list) => {
    if (!list.length) { fs.writeFileSync(path.join(outDir, name), ''); return; }
    const cols = Object.keys(list[0]);
    const esc = v => { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    fs.writeFileSync(path.join(outDir, name), [cols.join(','), ...list.map(o => cols.map(c => esc(o[c])).join(','))].join('\n'));
  };
  csv('1-exact-matches.csv', rows.exact);
  csv('2-id-replacements.csv', rows.replaced);
  csv('3-new-gyms-proposed-ids.csv', rows.newGyms);
  csv('4-unmatched-live.csv', unmatchedLive);
  csv('5-id-conflicts.csv', idConflicts);
  csv('6-duplicate-candidates-in-repo.csv', dups);
  csv('7-new-gyms-near-live-gyms.csv', newNearLive);
  fs.writeFileSync(path.join(outDir, '8-ambiguous.json'), JSON.stringify(ambiguous.map(a => ({ repo_id: a.repo.id, name: a.repo.name, country: a.repo.country, suburb: a.repo.suburb, reason: a.reason, candidates: a.candidates })), null, 1));
  fs.writeFileSync(path.join(outDir, '10-possible-duplicates-of-live-gyms.json'), JSON.stringify(duplicateOfLive.map(x => ({ repo_id: x.repo.id, repo_name: x.repo.name, country: x.repo.country, repo_suburb: x.repo.suburb, live_id: x.live.id, live_name: x.live.name, dist_m: x.dist_m })), null, 1));
  fs.writeFileSync(path.join(outDir, '9-probable-review.json'), JSON.stringify(probable.map(p => ({ repo_id: p.repo.id, repo_name: p.repo.name, live_id: p.live.id, live_name: p.live.name, country: p.repo.country, dist_m: p.dist_m, name_similarity: p.jaccard })), null, 1));
  // Proposed (NOT applied) mapping repo index -> final id, for the later write-back step.
  fs.writeFileSync(path.join(outDir, 'proposed-id-map.json'), JSON.stringify(repo.map((r, ri) => ({ old_id: r.id, name: r.name, country: r.country, final_id: finalId[ri] })), null, 0));

  const tiers = {}; match.forEach(m => tiers[m.tier] = (tiers[m.tier] || 0) + 1);
  const finals = finalId.filter(Boolean);
  const summary = {
    generated: new Date().toISOString(), live_rows: live.length, repo_rows: repo.length,
    matched: match.size, by_tier: tiers,
    exact_same_id: rows.exact.length, id_replacements: rows.replaced.length,
    new_gyms_get_new_ids: rows.newGyms.length, ambiguous: ambiguous.length, possible_duplicates_of_live_gyms: duplicateOfLive.length, probable_needs_review: probable.length,
    unmatched_live: unmatchedLive.length, repo_gyms_currently_holding_a_live_id_of_a_different_gym: idConflicts.length,
    duplicate_candidates_in_repo: dups.length, new_gyms_within_60m_of_live_gym: newNearLive.length,
    matched_gyms_whose_repo_content_differs_from_live: driftCount, drift_by_field: driftByField,
    final_ids_unique: new Set(finals).size === finals.length, final_ids_assigned: finals.length, final_ids_pending_human_decision: finalId.filter(x => !x).length,
    live_ids_preserved: live.filter(l => finals.includes(l.id)).length
  };
  fs.writeFileSync(path.join(outDir, '0-summary.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  console.log('\nFiles written to', outDir);
})().catch(e => { console.error(e); process.exit(1); });
