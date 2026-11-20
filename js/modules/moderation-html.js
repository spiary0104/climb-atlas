// Moderation markup for /mod (DESIGN.md sec. 10.5): the unified queue (new gyms, edits, reports) and the side panel with
// a field-by-field diff, the contributor's note, editable fields for approve-with-changes, and a required rejection
// reason. Pure (no DOM / appState), unit-tested with hostile data (tests/render-html.test.js): everything here comes from
// rows anyone can insert, so EVERY interpolated value is escaped and photo links go through safeUrl(). Rows and buttons
// carry only a numeric index or a fixed action name; mod-page.js looks the item up in its own array.
import { TYPE_LABELS } from './constants.js';
import { escapeHtml, safeUrl } from './html-safe.js';
import { t, th } from './i18n.js';
import { icon } from './icons.js';
import { DAYS, FACILITIES, cleanFacilities, cleanHours } from './gym-info.js';

const KINDS = ['spot', 'edit', 'report'];
const kindOf = k => (KINDS.includes(k) ? k : 'report');
const KIND_KEY = { spot: 'mod.kind.spot', edit: 'mod.kind.edit', report: 'mod.kind.report' };
const kindLabel = k => t(KIND_KEY[k]);            // k is always a kindOf() result
const typesText = types => (Array.isArray(types) ? types : []).map(t => TYPE_LABELS[t] || t).join(' · ');

// A photo value is a link only when it is an absolute http(s) URL; anything else is shown as inert text.
export function photoText(photo){
  if(!photo) return '';
  const url = safeUrl(photo);
  return url
    ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(photo)}</a>`
    : `${escapeHtml(photo)} <span class="mod-inert">${th('mod.notWebLink')}</span>`;
}

const FIELDS = [
  ['name', 'mod.f.name', v => escapeHtml(v)],
  ['suburb', 'mod.f.suburb', v => escapeHtml(v)],
  ['state', 'mod.f.state', v => escapeHtml(v)],
  ['country', 'mod.f.country', v => escapeHtml(v)],
  ['address', 'mod.f.address', v => escapeHtml(v || '')],
  ['types', 'mod.f.types', v => escapeHtml(typesText(v))],
  ['description', 'mod.f.description', v => escapeHtml(v || '')],
  ['website', 'mod.f.website', v => photoText(v)],
  ['day_pass', 'mod.f.dayPass', v => escapeHtml(v || '')],
  ['hours', 'mod.f.hours', v => escapeHtml(hoursText(v))],
  ['facilities', 'mod.f.facilities', v => escapeHtml(cleanFacilities(v).map(k => facilityLabel(k)).join(' · '))],
  ['photo', 'mod.f.image', v => photoText(v)],
  ['notes', 'mod.f.notes', v => escapeHtml(v || ''), { onlyIfProposed: true }],   // legacy submissions only
];
const facilityLabel = k => (Object.fromEntries(FACILITIES))[k];   // FACILITIES labels follow the language (gym-info.js)
const hoursText = h => { const c = cleanHours(h) || {}; return DAYS.filter(([k]) => c[k]).map(([k, label]) => label.slice(0, 3) + ' ' + c[k]).join(' · '); };
// Values compare in normal form: jsonb returns object keys in its own order, and empty means absent.
const norm = (key, v) => key === 'hours' ? cleanHours(v) : key === 'facilities' ? cleanFacilities(v) : v;
const same = (a, b, key) => JSON.stringify(norm(key, a) ?? '') === JSON.stringify(norm(key, b) ?? '') || (key === 'facilities' && !cleanFacilities(a).length && !cleanFacilities(b).length);
const where = r => (Number.isFinite(r.lat) && Number.isFinite(r.lng)) ? Number(r.lat).toFixed(5) + ', ' + Number(r.lng).toFixed(5) : '';

// Field-by-field diff (old -> new) of a proposed edit against the live gym; unchanged fields are counted, not listed.
export function diffRowsHtml(current, proposed){
  const rows = [];
  let unchanged = 0;
  for(const [key, labelKey, show, opts = {}] of FIELDS){
    if(opts.onlyIfProposed && !proposed[key]) continue;
    if(current && same(current[key], proposed[key], key)){ unchanged++; continue; }
    rows.push(`<tr><th scope="row">${escapeHtml(t(labelKey))}</th><td>${current ? show(current[key]) : ''}</td><td>${show(proposed[key])}</td></tr>`);
  }
  if(current && where(current) === where(proposed)) unchanged++;
  else rows.push(`<tr><th scope="row">${th('mod.f.location')}</th><td class="tnum">${current ? escapeHtml(where(current)) : ''}</td><td class="tnum">${escapeHtml(where(proposed))}</td></tr>`);
  return { rows: rows.join(''), unchanged };
}

// One queue row. item: {kind, name}; ctx: {index, contributor, level, age, flagged, selected}
export function modRowHtml(item, ctx){
  const k = kindOf(item.kind);
  return `<li class="mod-row${ctx.selected ? ' is-selected' : ''}"><button type="button" class="mod-row-main" data-mod-index="${Number(ctx.index)}"${ctx.selected ? ' aria-current="true"' : ''}>`
    + `<span class="mod-kind mod-kind--${k}">${escapeHtml(kindLabel(k))}</span><span class="mod-gym">${escapeHtml(item.name)}</span>`
    + `<span class="mod-who">${escapeHtml(ctx.contributor)}${ctx.level ? ` · <span class="tnum">${th('mod.lv', { level: Number(ctx.level) })}</span>` : ''}</span>`
    + `<span class="mod-age tnum">${escapeHtml(ctx.age)}</span>${ctx.flagged ? `<span class="mod-flag">${th('mod.doubleCheck')}</span>` : ''}</button></li>`;
}

export function modQueueHtml(items, ctxs){
  if(!items.length) return `<div class="empty-state mod-empty"><p class="empty-title">${th('mod.emptyTitle')}</p><p>${th('mod.emptyBody')}</p></div>`;
  return `<ul class="mod-queue" aria-label="${th('mod.queueAria')}">${items.map((it, i) => modRowHtml(it, ctxs[i])).join('')}</ul>`;
}

// Editable copy of the proposal's text fields: what Approve applies (approve-with-changes, sec. 10.5).
function correctionFieldsHtml(r){
  const input = (key, label) => `<div class="field"><label for="modField-${key}">${escapeHtml(label)}</label><input id="modField-${key}" data-mod-field="${key}" type="text" value="${escapeHtml(r[key] || '')}"></div>`;
  return `<fieldset class="mod-correct"><legend class="section-label">${th('mod.correct')}</legend>`
    + input('name', t('mod.f.name')) + input('suburb', t('mod.f.suburb')) + input('address', t('mod.f.address'))
    + `<div class="field"><label for="modField-description">${th('mod.f.description')}</label><textarea id="modField-description" data-mod-field="description" maxlength="600">${escapeHtml(r.description || '')}</textarea></div></fieldset>`;
}

const reasonHtml = () => `<div class="field mod-reason"><label for="modReason">${th('mod.reasonLabel')}</label>`
  + `<input id="modReason" type="text" maxlength="200" placeholder="${th('mod.reasonPh')}"></div>`;

// The side panel. item: {kind, name, row, current}; ctx: {contributor, level, age, href}
export function modPanelHtml(item, ctx){
  const k = kindOf(item.kind), r = item.row || {};
  const head = `<div class="mod-panel-head"><div><p class="mod-kind mod-kind--${k}">${escapeHtml(kindLabel(k))}</p><h2 class="panel-title" id="modPanelTitle">${escapeHtml(item.name)}</h2>`
    + `<p class="mod-meta">${escapeHtml(ctx.contributor)}${ctx.level ? ` · <span class="tnum">${th('mod.level', { level: Number(ctx.level) })}</span>` : ''} · ${escapeHtml(ctx.age)}</p></div>`
    + `<button type="button" class="btn btn-tertiary btn-icon btn-sm" data-mod-action="close" aria-label="${th('common.close')}">${icon('x', {size:'sm'})}</button></div>`;
  if(k === 'report'){
    return head + `<blockquote class="mod-note">${escapeHtml(r.message)}</blockquote>`
      + `<div class="mod-actions"><a class="btn btn-secondary btn-sm" href="${escapeHtml(ctx.href || '/')}" data-link>${th('peek.openPage')}</a>`
      + `<button type="button" class="btn btn-secondary btn-sm" data-mod-action="edit-spot">${th('peek.suggestEdit')}</button>`
      + `<button type="button" class="btn btn-tertiary btn-sm btn-danger pending-dismiss" data-mod-action="dismiss">${th('common.dismiss')}</button></div>`;
  }
  const flag = r.review_requested ? `<p class="mod-flag">${th('mod.flagAsked')}</p>` : '';
  const note = r.edit_note ? `<blockquote class="mod-note">${escapeHtml(r.edit_note)}</blockquote>` : '';
  const d = diffRowsHtml(k === 'edit' ? item.current : null, r);
  const diff = `<table class="mod-diff"><thead><tr><th scope="col">${th('mod.field')}</th><th scope="col">${k === 'edit' ? th('mod.now') : ''}</th><th scope="col">${escapeHtml(t(k === 'edit' ? 'mod.proposed' : 'mod.submitted'))}</th></tr></thead>`
    + `<tbody>${d.rows}</tbody></table>${k === 'edit' && d.unchanged ? `<p class="mod-unchanged">${th('mod.unchanged', { count: Number(d.unchanged) })}</p>` : ''}`;
  return head + flag + note + diff + correctionFieldsHtml(r) + reasonHtml()
    + `<div class="mod-actions"><button type="button" class="btn btn-tertiary btn-danger pending-reject" data-mod-action="reject">${th('mod.reject')}</button>`
    + `<button type="button" class="btn btn-primary pending-approve" data-mod-action="approve">${th('mod.approve')}</button></div>`
    + `<p class="mod-keys">${th('mod.keysLead')} <kbd>J</kbd>/<kbd>K</kbd> ${th('mod.keyMove')} · <kbd>A</kbd> ${th('mod.keyApprove')} · <kbd>R</kbd> ${th('mod.keyReject')} · <kbd>Esc</kbd> ${th('mod.keyClose')}</p>`;
}

// The page: the queue and (when a row is open) the panel.
export function modPageHtml({ queue, panel, count }){
  return `<article class="page mod-page"><header class="page-header-row"><div><h1 class="page-title">${th('mod.review')}</h1>`
    + `<p class="place-meta tnum">${th('mod.waiting', { count: Number(count) })}</p></div></header>`
    + `<div class="mod-layout${panel ? ' has-panel' : ''}"><section class="mod-list" aria-label="${th('mod.queue')}">${queue}</section>`
    + `${panel ? `<aside class="mod-panel panel" aria-labelledby="modPanelTitle">${panel}</aside>` : ''}</div></article>`;
}
