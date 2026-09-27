// Stamp, passport, check-in and milestone markup (DESIGN.md sec. 11, 12.3). Pure: no DOM, no appState; unit-tested with
// hostile data in tests/render-html.test.js. Every gym or city name comes from rows anyone can propose, so every
// interpolated value is escaped; buttons carry only fixed action names or the escaped city key.
import { firstRunArt, milestoneArt } from './brand.js';
import { escapeHtml } from './html-safe.js';
import { icon } from './icons.js';
import { thumbHtml } from './list-html.js';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
// "12 SEP 2026" from an ISO timestamp (the stamp's own caps; the only uppercase display text, sec. 11.4)
export function stampDate(iso){
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}
export const niceDate = iso => { const s = stampDate(iso); return s ? s.charAt(0) + s.slice(1).replace(/[A-Z]{3}/, m => m.charAt(0) + m.slice(1).toLowerCase()) : ''; };

// Stable tilt in [-8, 8] degrees from a seed (gym id or city key), so a stamp never wobbles between renders.
export function stampTilt(seed){
  let h = 2166136261;
  for(const ch of String(seed || '')){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return (h % 17) - 8;
}

let seq = 0;
// The stamp (sec. 11.4): two dashed rings, the name arched at the top in Fraunces caps, the date along the bottom in
// Inter caps, the single-ink stamp head in the centre; forest ink on cream. title: a gym or city name.
export function stampSvg({ title, date, seed, label } = {}){
  const n = ++seq, top = 'stampTop' + n, bottom = 'stampBottom' + n;
  let name = String(title || '').trim().toUpperCase();
  if(name.length > 24) name = name.slice(0, 23).trim() + '…';
  const size = Math.max(6.5, Math.min(11, 108 / Math.max(1, name.length * 0.74)));
  const when = stampDate(date);
  return `<svg class="stamp" viewBox="0 0 120 120" role="img" aria-label="${escapeHtml((label || 'Stamp') + ': ' + (title || '') + (when ? ', ' + when : ''))}" focusable="false">`
    + `<defs><path id="${top}" d="M 16.5 60 A 43.5 43.5 0 0 1 103.5 60"/><path id="${bottom}" d="M 11 60 A 49 49 0 0 0 109 60"/></defs>`
    + `<g transform="rotate(${Number(stampTilt(seed))} 60 60)">`
    + '<circle class="stamp-ring" cx="60" cy="60" r="56"/><circle class="stamp-ring stamp-ring--inner" cx="60" cy="60" r="38"/>'
    + `<text class="stamp-name" font-size="${Number(size.toFixed(2))}" letter-spacing="1.6"><textPath href="#${top}" startOffset="50%" text-anchor="middle">${escapeHtml(name)}</textPath></text>`
    + `<text class="stamp-date" font-size="7.5" letter-spacing="1.4"><textPath href="#${bottom}" startOffset="50%" text-anchor="middle">${escapeHtml(when)}</textPath></text>`
    + '<circle class="stamp-dot" cx="8.5" cy="60" r="1.6"/><circle class="stamp-dot" cx="111.5" cy="60" r="1.6"/>'
    + '<image href="assets/mascot/stamp-head.svg" x="38" y="41" width="44" height="37.5"/></g></svg>';
}

// ----- /me/passport (sec. 11.3) -----
// One city stamp in the grid: a toggle button that filters the rows (aria-pressed).
function stampCellHtml(st, filter){
  return `<li><button type="button" class="stamp-btn" data-passport-city="${escapeHtml(st.key)}" aria-pressed="${st.key === filter ? 'true' : 'false'}">`
    + stampSvg({ title: st.city, date: st.first, seed: st.seed, label: 'City stamp' })
    + `<span class="stamp-caption"><span class="stamp-city">${escapeHtml(st.city)}</span><span class="stamp-count tnum">${escapeHtml(st.gyms === 1 ? '1 gym' : st.gyms + ' gyms')}</span></span></button></li>`;
}
// One recent check-in: the dense row (gym, city · date, note snippet) linking to the gym page.
function checkinRowHtml(r){
  return `<a class="page-row checkin-row" href="${escapeHtml(r.ctx.href)}" data-link>` + thumbHtml(r.g, 'row')
    + `<span class="gym-row-text"><span class="gym-row-title">${escapeHtml(r.g.name)}</span><span class="gym-row-meta">${escapeHtml([r.ctx.city, r.ctx.date].filter(Boolean).join(' · '))}</span>`
    + (r.ctx.note ? `<span class="checkin-note">${escapeHtml(r.ctx.note)}</span>` : '') + '</span></a>';
}
// p: {signedIn, stats (text), stamps: [{key, city, gyms, first, last, seed}], rows: [{g, ctx:{href, city, date, note}}],
//     filter: city key or '', filterLabel}
export function passportPageHtml(p){
  const head = `<header class="place-header"><nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/me" data-link>Me</a></li><li aria-current="page">Passport</li></ol></nav>`
    + `<h1 class="page-title">Passport</h1>`;
  if(!p.signedIn){
    return `<article class="page passport-page">${head}<p class="place-meta">Check in at gyms to collect a stamp for every city you climb in.</p></header>`
      + '<p class="page-cta"><button type="button" class="btn btn-primary" data-page-action="sign-in">Sign in</button></p></article>';
  }
  if(!p.stamps.length){
    return `<article class="page passport-page">${head}</header><div class="empty-state passport-empty">` + firstRunArt('passport')
      + '<p class="empty-title">Your first stamp is one check-in away.</p><p>Check in from a gym’s page when you get there.</p>'
      + '<p><a class="btn btn-secondary" href="/" data-link>Find a gym</a></p></div></article>';
  }
  const grid = '<ul class="stamp-grid">' + p.stamps.map(st => stampCellHtml(st, p.filter)).join('') + '</ul>';
  const filterNote = p.filter ? `<p class="passport-filter">Showing ${escapeHtml(p.filterLabel || '')} · <button type="button" class="link" data-passport-city="">Show all</button></p>` : '';
  const rows = p.rows.map(checkinRowHtml).join('');
  return `<article class="page passport-page">${head}<p class="place-meta tnum">${escapeHtml(p.stats)}</p></header>`
    + `<section class="page-section" aria-labelledby="stampsTitle"><h2 class="section-title" id="stampsTitle">Stamps</h2>${grid}</section>`
    + `<section class="page-section" aria-labelledby="recentTitle"><h2 class="section-title" id="recentTitle">Recent check-ins</h2>${filterNote}<div class="page-list">${rows}</div></section></article>`;
}

// ----- the check-in sheet (sec. 11.1) -----
// ctx: {mode: 'near' | 'confirm', distance (text), date (text), busy}
export function checkinSheetHtml(g, ctx = {}){
  const where = ctx.mode === 'near'
    ? `<p class="checkin-where">${icon('map-pin', {size:'sm'})}<span>You’re ${escapeHtml(ctx.distance || 'here')} away.</span></p>`
    : `<label class="check-row checkin-here"><input type="checkbox" id="ciHere"> I’m at ${escapeHtml(g.name)} now</label>`;
  return `<h2 id="dlg-check-in">Check in</h2><p class="sub">${escapeHtml(g.name)} · ${escapeHtml(ctx.date || '')}</p>${where}`
    + '<div class="field"><label for="ciNote">Note (optional)</label><textarea id="ciNote" maxlength="140" placeholder="New set on the slab, great session"></textarea>'
    + '<p class="form-hint tnum" id="ciCount" aria-live="polite">0 / 140</p></div>'
    + '<div class="modal-actions"><button type="button" class="btn btn-secondary" data-ci-action="cancel">Cancel</button>'
    + `<button type="button" class="btn btn-primary" data-ci-action="stamp"${ctx.busy ? ' disabled' : ''}>${ctx.busy ? 'Stamping…' : 'Stamp it'}</button></div>`;
}

// After the stamp lands: the stamp, the passport line, Log this session · Share · Done.
export function stampedHtml(g, checkin, line){
  return `<h2 id="dlg-check-in" class="visually-hidden">Checked in</h2><div class="stamp-stage">`
    + stampSvg({ title: g.name, date: checkin.checked_at, seed: g.id, label: 'Stamp' }) + '</div>'
    + `<p class="passport-line">${escapeHtml(line || '')}</p>`
    + '<div class="modal-actions checkin-actions"><button type="button" class="btn btn-secondary" data-ci-action="log">Log this session</button>'
    + '<button type="button" class="btn btn-secondary" data-ci-action="share">Share</button>'
    + '<button type="button" class="btn btn-primary" data-ci-action="done">Done</button></div>';
}

// ----- the milestone sheet (sec. 12.3) -----
// One of the other milestones earned at the same time: a 32px ink-outline mark and its title.
const milestoneMarkHtml = t => `<li><span class="milestone-mark" aria-hidden="true">${icon('check', {size:'sm'})}</span>${escapeHtml(t)}</li>`;
// m: {title, sentence, pose, others: [titles]}
export function milestoneHtml(m){
  const others = (m.others || []).slice(0, 3);
  const marks = others.length ? '<ul class="milestone-marks">' + others.map(milestoneMarkHtml).join('') + '</ul>' : '';
  return milestoneArt(m.pose) + `<h2 id="dlg-milestone" class="milestone-title">${escapeHtml(m.title || '')}</h2>`
    + `<p class="milestone-sentence">${escapeHtml(m.sentence || '')}</p>${marks}`
    + '<div class="modal-actions"><button type="button" class="btn btn-secondary" data-ms-action="share">Share card</button>'
    + '<button type="button" class="btn btn-primary" data-ms-action="done">Done</button></div>';
}
