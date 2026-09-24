// Human-readable dry-run report. Deterministic (no timestamps), size-capped, so it is cheap to read and to diff.
'use strict';

const CAP = 25;
const esc = s => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const cut = (list, n = CAP) => ({ shown: list.slice(0, n), more: Math.max(0, list.length - n) });

function renderReport(plan) {
  const c = plan.counts, L = [];
  const by = cls => plan.records.filter(r => r.class === cls);
  L.push(`# Import dry-run: ${plan.batch_id}`, '');
  L.push(`**Result: ${plan.importable ? 'READY for review/import' : 'NOT importable yet'}** — this report is a dry-run; nothing was written anywhere except this batch directory.`, '');
  L.push('| What would happen | Records |', '|---|---:|');
  L.push(`| Insert as NEW gyms | ${c.new} |`);
  L.push(`| Update existing gyms (explicit update records) | ${c.update} |`);
  L.push(`| Already exist — no action (identical content: ${c.existing_identical}; content differs, NOT applied: ${c.existing_content_differs}) | ${c.existing} |`);
  L.push(`| Probable duplicates — need a human decision | ${c['probable-duplicate']} |`);
  L.push(`| Invalid — rejected | ${c.invalid} |`);
  L.push(`| Rejected by a human decision | ${c.rejected} |`);
  L.push(`| **Total records in batch** | ${c.records} |`, '');
  L.push(`Index: ${plan.index.count} known gyms (sha256 ${plan.index.sha256.slice(0, 12)}…${plan.index.meta_matches ? '' : ', WARNING: index-meta.json does not match the index file'}). Plan: ${plan.plan_sha256.slice(0, 12)}…` + (plan.staged_batches_compared.length ? ` Also compared against staged batches: ${plan.staged_batches_compared.join(', ')}.` : ''), '');

  if (plan.blockers.length) { L.push('## Blockers', ...plan.blockers.map(b => `- ${b}`), ''); }

  const inv = by('invalid');
  if (inv.length) {
    L.push(`## Invalid records (${inv.length})`, '');
    const { shown, more } = cut(inv);
    shown.forEach(r => { L.push(`- line ${r.line}${r.name ? ` "${esc(r.name)}"` : ''}:`); r.errors.forEach(e => L.push(`  - \`${e.code}\`${e.field ? ` (${e.field})` : ''}: ${esc(e.message)}`)); });
    if (more) L.push(`- … and ${more} more (see plan.json)`);
    L.push('');
  }

  const pd = by('probable-duplicate');
  if (pd.length) {
    L.push(`## Probable duplicates — human review required (${pd.length})`, '', 'Nothing is merged or dropped automatically. For each, add an entry to `decisions.json` (see docs/import-workflow.md): `distinct`, `same-as`, or `reject`.', '');
    const { shown, more } = cut(pd);
    shown.forEach(r => {
      L.push(`- line ${r.line} \`${r.id}\` "${esc(r.name)}" (${r.country})${r.reason ? ' — ' + r.reason : ''}${r.decision_note ? ' — **' + esc(r.decision_note) + '**' : ''}`);
      r.candidates.slice(0, 5).forEach(k => L.push(`  - ${k.batch ? `[${k.batch}] ` : ''}\`${k.id}\` "${esc(k.name)}" — ${k.reason}, ${k.dist_m} m`));
    });
    if (more) L.push(`- … and ${more} more (see plan.json)`);
    L.push('');
  }

  const up = by('update');
  if (up.length) {
    L.push(`## Updates to existing gyms (${up.length})`, '');
    const { shown, more } = cut(up);
    shown.forEach(r => {
      L.push(`- line ${r.line} \`${r.id}\` — ${esc(r.update_reason)}`);
      r.changes.forEach(ch => L.push(`  - ${ch.field}: ${esc(JSON.stringify(ch.before))} → ${esc(JSON.stringify(ch.after))}`.slice(0, 300)));
    });
    if (more) L.push(`- … and ${more} more (see plan.json)`);
    L.push('');
  }

  const nw = by('new');
  if (nw.length) {
    const cc = {}; nw.forEach(r => { cc[r.country] = (cc[r.country] || 0) + 1; });
    L.push(`## New gyms (${nw.length})`, '', 'By country: ' + Object.entries(cc).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).map(([k, v]) => `${k} ${v}`).join(', '), '');
    const { shown, more } = cut(nw, 15);
    shown.forEach(r => L.push(`- line ${r.line} \`${r.id}${r.id_frozen ? '' : '?'}\` "${esc(r.name)}" (${r.country})${r.reviewed_distinct ? ' — reviewed as distinct' : ''}`));
    if (more) L.push(`- … and ${more} more (see plan.json)`);
    if (nw.some(r => !r.id_frozen)) L.push('', '`?` = id derived but not yet frozen into records.ndjson (`freeze-ids`).');
    L.push('');
  }

  const ex = by('existing');
  if (ex.length) {
    const differs = ex.filter(r => !r.same_content), moved = ex.filter(r => r.pin_moved_m);
    L.push(`## Existing gyms (${ex.length}) — no action`, '');
    if (differs.length) {
      L.push(`Content differs from production for ${differs.length} (NOT applied — use an explicit update record):`);
      const { shown, more } = cut(differs, 10);
      shown.forEach(r => L.push(`- line ${r.line} \`${r.match.id}\` "${esc(r.name)}": ${r.differing.join(', ')}`));
      if (more) L.push(`- … and ${more} more`);
      L.push('');
    }
    if (moved.length) L.push(`${moved.length} matched with a different pin (largest ${Math.max(...moved.map(r => r.pin_moved_m))} m); production pins are kept.`, '');
  }

  const warn = {};
  plan.records.forEach(r => (r.warnings || []).forEach(w => { (warn[w.code] = warn[w.code] || []).push(r); }));
  const codes = Object.keys(warn).filter(k => k !== 'content-differs').sort();
  if (codes.length) {
    L.push('## Warnings', '');
    codes.forEach(k => { L.push(`- \`${k}\` × ${warn[k].length}: lines ${warn[k].slice(0, 12).map(r => r.line).join(', ')}${warn[k].length > 12 ? ', …' : ''}`); });
    L.push('');
  }
  return L.join('\n');
}

module.exports = { renderReport };
