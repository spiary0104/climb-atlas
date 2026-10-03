// Moderation markup for /mod (DESIGN.md sec. 10.5): the unified queue (new gyms, edits, reports) and the side panel with
// a field-by-field diff, the contributor's note, editable fields for approve-with-changes, and a required rejection
// reason. Pure (no DOM / appState), unit-tested with hostile data (tests/render-html.test.js): everything here comes from
// rows anyone can insert, so EVERY interpolated value is escaped and photo links go through safeUrl(). Rows and buttons
// carry only a numeric index or a fixed action name; mod-page.js looks the item up in its own array.
import { TYPE_LABELS } from './constants.js';
import { escapeHtml, safeUrl } from './html-safe.js';
import { icon } from './icons.js';
import { DAYS, FACILITIES, cleanFacilities, cleanHours } from './gym-info.js';

const KIND_LABEL = { spot: 'New gym', edit: 'Edit', report: 'Report' };
const kindOf = k => (KIND_LABEL[k] ? k : 'report');
const typesText = types => (Array.isArray(types) ? types : []).map(t => TYPE_LABELS[t] || t).join(' · ');

// A photo value is a link only when it is an absolute http(s) URL; anything else is shown as inert text.
export function photoText(photo){
  if(!photo) return '';
  const url = safeUrl(photo);
  return url
    ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(photo)}</a>`
    : `${escapeHtml(photo)} <span class="mod-inert">(not a web link — not clickable)</span>`;
}

const FIELDS = [
  ['name', 'Name', v => escapeHtml(v)],
  ['suburb', 'Suburb', v => escapeHtml(v)],
  ['state', 'Region', v => escapeHtml(v)],
  ['country', 'Country', v => escapeHtml(v)],
  ['address', 'Address', v => escapeHtml(v || '')],
  ['types', 'Types', v => escapeHtml(typesText(v))],
  ['description', 'About', v => escapeHtml(v || '')],
  ['website', 'Website', v => photoText(v)],
  ['day_pass', 'Day pass', v => escapeHtml(v || '')],
  ['hours', 'Hours', v => escapeHtml(hoursText(v))],
  ['facilities', 'Facilities', v => escapeHtml(cleanFacilities(v).map(k => FACILITY_LABEL[k]).join(' · '))],
  ['photo', 'Photo', v => photoText(v)],
  ['notes', 'Research notes', v => escapeHtml(v || ''), { onlyIfProposed: true }],   // legacy submissions only
];
const FACILITY_LABEL = Object.fromEntries(FACILITIES);
const hoursText = h => { const c = cleanHours(h) || {}; return DAYS.filter(([k]) => c[k]).map(([k, label]) => label.slice(0, 3) + ' ' + c[k]).join(' · '); };
// Values compare in normal form: jsonb returns object keys in its own order, and empty means absent.
const norm = (key, v) => key === 'hours' ? cleanHours(v) : key === 'facilities' ? cleanFacilities(v) : v;
const same = (a, b, key) => JSON.stringify(norm(key, a) ?? '') === JSON.stringify(norm(key, b) ?? '') || (key === 'facilities' && !cleanFacilities(a).length && !cleanFacilities(b).length);
const where = r => (Number.isFinite(r.lat) && Number.isFinite(r.lng)) ? Number(r.lat).toFixed(5) + ', ' + Number(r.lng).toFixed(5) : '';

// Field-by-field diff (old -> new) of a proposed edit against the live gym; unchanged fields are counted, not listed.
export function diffRowsHtml(current, proposed){
  const rows = [];
  let unchanged = 0;
  for(const [key, label, show, opts = {}] of FIELDS){
    if(opts.onlyIfProposed && !proposed[key]) continue;
    if(current && same(current[key], proposed[key], key)){ unchanged++; continue; }
    rows.push(`<tr><th scope="row">${label}</th><td>${current ? show(current[key]) : ''}</td><td>${show(proposed[key])}</td></tr>`);
  }
  if(current && where(current) === where(proposed)) unchanged++;
  else rows.push(`<tr><th scope="row">Location</th><td class="tnum">${current ? escapeHtml(where(current)) : ''}</td><td class="tnum">${escapeHtml(where(proposed))}</td></tr>`);
  return { rows: rows.join(''), unchanged };
}

// One queue row. item: {kind, name}; ctx: {index, contributor, level, age, flagged, selected}
export function modRowHtml(item, ctx){
  const k = kindOf(item.kind);
  return `<li class="mod-row${ctx.selected ? ' is-selected' : ''}"><button type="button" class="mod-row-main" data-mod-index="${Number(ctx.index)}"${ctx.selected ? ' aria-current="true"' : ''}>`
    + `<span class="mod-kind mod-kind--${k}">${KIND_LABEL[k]}</span><span class="mod-gym">${escapeHtml(item.name)}</span>`
    + `<span class="mod-who">${escapeHtml(ctx.contributor)}${ctx.level ? ` · <span class="tnum">Lv ${Number(ctx.level)}</span>` : ''}</span>`
    + `<span class="mod-age tnum">${escapeHtml(ctx.age)}</span>${ctx.flagged ? '<span class="mod-flag">Double-check</span>' : ''}</button></li>`;
}

export function modQueueHtml(items, ctxs){
  if(!items.length) return '<div class="empty-state mod-empty"><p class="empty-title">Nothing to review</p><p>New gyms, edits and reports will appear here.</p></div>';
  return `<ul class="mod-queue" aria-label="Review queue">${items.map((it, i) => modRowHtml(it, ctxs[i])).join('')}</ul>`;
}

// Editable copy of the proposal's text fields: what Approve applies (approve-with-changes, sec. 10.5).
function correctionFieldsHtml(r){
  const input = (key, label) => `<div class="field"><label for="modField-${key}">${label}</label><input id="modField-${key}" data-mod-field="${key}" type="text" value="${escapeHtml(r[key] || '')}"></div>`;
  return `<fieldset class="mod-correct"><legend class="section-label">Check or correct before approving</legend>`
    + input('name', 'Name') + input('suburb', 'Suburb') + input('address', 'Address')
    + `<div class="field"><label for="modField-description">About</label><textarea id="modField-description" data-mod-field="description" maxlength="600">${escapeHtml(r.description || '')}</textarea></div></fieldset>`;
}

const reasonHtml = () => `<div class="field mod-reason"><label for="modReason">Reason for rejecting (shown to the contributor)</label>`
  + `<input id="modReason" type="text" maxlength="200" placeholder="e.g. Duplicate of an existing gym"></div>`;

// The side panel. item: {kind, name, row, current}; ctx: {contributor, level, age, href}
export function modPanelHtml(item, ctx){
  const k = kindOf(item.kind), r = item.row || {};
  const head = `<div class="mod-panel-head"><div><p class="mod-kind mod-kind--${k}">${KIND_LABEL[k]}</p><h2 class="panel-title" id="modPanelTitle">${escapeHtml(item.name)}</h2>`
    + `<p class="mod-meta">${escapeHtml(ctx.contributor)}${ctx.level ? ` · <span class="tnum">level ${Number(ctx.level)}</span>` : ''} · ${escapeHtml(ctx.age)}</p></div>`
    + `<button type="button" class="btn btn-tertiary btn-icon btn-sm" data-mod-action="close" aria-label="Close">${icon('x', {size:'sm'})}</button></div>`;
  if(k === 'report'){
    return head + `<blockquote class="mod-note">${escapeHtml(r.message)}</blockquote>`
      + `<div class="mod-actions"><a class="btn btn-secondary btn-sm" href="${escapeHtml(ctx.href || '/')}" data-link>Open gym page</a>`
      + `<button type="button" class="btn btn-secondary btn-sm" data-mod-action="edit-spot">Suggest an edit</button>`
      + `<button type="button" class="btn btn-tertiary btn-sm btn-danger pending-dismiss" data-mod-action="dismiss">Dismiss</button></div>`;
  }
  const flag = r.review_requested ? '<p class="mod-flag">The contributor asked for a double-check.</p>' : '';
  const note = r.edit_note ? `<blockquote class="mod-note">${escapeHtml(r.edit_note)}</blockquote>` : '';
  const d = diffRowsHtml(k === 'edit' ? item.current : null, r);
  const diff = `<table class="mod-diff"><thead><tr><th scope="col">Field</th><th scope="col">${k === 'edit' ? 'Now' : ''}</th><th scope="col">${k === 'edit' ? 'Proposed' : 'Submitted'}</th></tr></thead>`
    + `<tbody>${d.rows}</tbody></table>${k === 'edit' && d.unchanged ? `<p class="mod-unchanged">${Number(d.unchanged)} fields unchanged</p>` : ''}`;
  return head + flag + note + diff + correctionFieldsHtml(r) + reasonHtml()
    + `<div class="mod-actions"><button type="button" class="btn btn-tertiary btn-danger pending-reject" data-mod-action="reject">Reject</button>`
    + `<button type="button" class="btn btn-primary pending-approve" data-mod-action="approve">Approve</button></div>`
    + `<p class="mod-keys">Keys: <kbd>J</kbd>/<kbd>K</kbd> move · <kbd>A</kbd> approve · <kbd>R</kbd> reject · <kbd>Esc</kbd> close</p>`;
}

// The page: the queue and (when a row is open) the panel.
export function modPageHtml({ queue, panel, count }){
  return `<article class="page mod-page"><header class="page-header-row"><div><h1 class="page-title">Review</h1>`
    + `<p class="place-meta tnum">${escapeHtml(count === 1 ? '1 item waiting' : Number(count) + ' items waiting')}</p></div></header>`
    + `<div class="mod-layout${panel ? ' has-panel' : ''}"><section class="mod-list" aria-label="Queue">${queue}</section>`
    + `${panel ? `<aside class="mod-panel panel" aria-labelledby="modPanelTitle">${panel}</aside>` : ''}</div></article>`;
}
