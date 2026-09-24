#!/usr/bin/env node
// Builds data/gyms.reconciled.json from data/gyms.json + the Stage 0 reconciliation outputs.
//
//   node scripts/build-reconciled.js
//
// Reads:  data/gyms.json (never modified), data/reconciliation/<date>/proposed-id-map.json,
//         data/reconciliation/<date>/decisions.json
// Writes: data/gyms.reconciled.json (a NEW file). Does not touch Supabase or gyms.json.
//
// Rules: live ids are kept exactly; repo gyms holding a different gym's live id are re-id'd to the
// matching live id; genuinely new gyms get the frozen id already assigned in proposed-id-map.json
// (g-<hex>, derived once from country|name|suburb|lat|lng -- never from array position);
// documented duplicates are removed (their full records are kept in decisions.json for audit); documented notes appends and
// field carry-overs are applied to the retained record; nothing else about a record changes.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIR = path.join(ROOT, 'data', 'reconciliation', process.argv[2] || '2026-09-24');
const srcPath = path.join(ROOT, 'data', 'gyms.json');
const outPath = path.join(ROOT, 'data', 'gyms.reconciled.json');

const raw = fs.readFileSync(srcPath, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
const repo = JSON.parse(raw);
const map = JSON.parse(fs.readFileSync(path.join(DIR, 'proposed-id-map.json'), 'utf8'));
const decisions = JSON.parse(fs.readFileSync(path.join(DIR, 'decisions.json'), 'utf8'));
if (map.length !== repo.length) throw new Error('proposed-id-map.json does not match gyms.json (length). Re-run scripts/reconcile-ids.js.');

const drop = new Set(decisions.duplicates_removed.map(d => d.remove_repo_id));
const append = decisions.notes_append || {};
const carry = decisions.field_carryovers || {};   // fields REPLACED on a retained record (frozen ids are NOT re-derived)
const out = [];
repo.forEach((g, i) => {
  const m = map[i];
  if (m.old_id !== g.id || m.name !== g.name) throw new Error('map/gyms.json mismatch at index ' + i + ' (' + g.id + ')');
  if (drop.has(g.id)) return;                       // documented duplicate
  if (!m.final_id) throw new Error('No final id for ' + g.id + ' ' + g.name + ' and it is not a documented duplicate');
  const rec = { ...g, id: m.final_id };
  if (append[g.id]) rec.notes = (rec.notes || '') + append[g.id];
  if (carry[g.id]) {
    for (const [k, v] of Object.entries(carry[g.id].set)) {
      if (JSON.stringify(g[k]) !== JSON.stringify(carry[g.id].was[k])) throw new Error('field_carryovers.' + g.id + '.was.' + k + ' does not match gyms.json; re-review the decision');
      rec[k] = v;
    }
    if (carry[g.id].retained_final_id !== m.final_id) throw new Error('field_carryovers.' + g.id + ' retained_final_id does not match the frozen id');
  }
  out.push(rec);
});

const body = '[' + eol + out.map(g => JSON.stringify(g)).join(',' + eol) + eol + ']' + eol;
JSON.parse(body); // sanity
fs.writeFileSync(outPath, body);
console.log('wrote', path.relative(ROOT, outPath), '|', repo.length, '->', out.length, 'records |', out.filter(g => g.id.startsWith('g-')).length, 'new g- ids');
