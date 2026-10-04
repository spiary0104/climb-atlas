// Gym information (DESIGN.md sec. 8.2; migration 20261004000100): the public fields a gym page fills in progressively,
// description, website, weekly hours, day pass and facilities. Pure: no DOM, no appState. Every value comes from rows
// anyone can propose, so everything is escaped here and URLs go through safeUrl. Missing fields render nothing: a gym
// with only a name and a location is a complete page (sec. 8.2 "Minimum page").
import { escapeHtml, safeUrl } from './html-safe.js';

export const DAYS = [['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'], ['thu', 'Thursday'], ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday']];
// The fixed list the database accepts (spots_facilities_check); order is the display order.
export const FACILITIES = [['cafe', 'Café'], ['training', 'Training area'], ['kids', 'Kids’ climbing'], ['shoe-hire', 'Shoe hire'],
  ['shop', 'Shop'], ['showers', 'Showers'], ['parking', 'Parking'], ['yoga', 'Yoga']];
// Database caps (migration 20261004000100); the form maxlengths use the same numbers (tested).
export const LIMITS = { description: 600, website: 300, day_pass: 120, hour: 40 };

const DAY_KEYS = DAYS.map(d => d[0]);
const FACILITY_KEYS = FACILITIES.map(f => f[0]);
const str = v => (typeof v === 'string' ? v.trim() : '');

// Only weekday keys with a non-empty string, trimmed and capped; null when nothing is left.
export function cleanHours(hours){
  if(!hours || typeof hours !== 'object' || Array.isArray(hours)) return null;
  const out = {};
  for(const k of DAY_KEYS){ const v = str(hours[k]).slice(0, LIMITS.hour); if(v) out[k] = v; }
  return Object.keys(out).length ? out : null;
}
// Known keys only, each once, in display order.
export function cleanFacilities(list){
  const set = new Set(Array.isArray(list) ? list : []);
  return FACILITY_KEYS.filter(k => set.has(k));
}
// "https://www.example.com/path" -> "example.com"; '' for anything that is not an http(s) URL.
export function websiteLabel(url){
  const safe = safeUrl(url);
  if(!safe) return '';
  try{ return new URL(safe).hostname.replace(/^www\./, ''); }catch(err){ return ''; }
}
// Monday-first weekday key for a date (the visitor's own day; gyms carry no time zone).
export const todayKey = (date = new Date()) => DAY_KEYS[(date.getDay() + 6) % 7];
// The practical facts the contribution prompt asks for (sec. 8.2): when none is known, the prompt shows.
export const hasPracticalInfo = g => !!(g && (websiteLabel(g.website) || cleanHours(g.hours) || str(g.day_pass)));

// ===== Gym page ======================================================================================================
// Essentials rows that appear only when the data exists: day pass, hours (weekly, today emphasised), website.
// hoursStatus: 'open' | 'closed' (from hours.js, passed in) puts a dot and the word before "Today"; null/absent leaves the line as it was.
export function essentialsRowsHtml(g, { today = todayKey(), hoursStatus = null } = {}){
  const rows = [];
  const pass = str(g.day_pass);
  if(pass) rows.push(`<div class="essentials-row"><h3 class="essentials-label">Day pass</h3><p class="panel-row">${escapeHtml(pass)}</p></div>`);
  const hours = cleanHours(g.hours);
  if(hours){
    const todayText = hours[today] || '';
    const state = hoursStatus === 'open' ? 'Open' : hoursStatus === 'closed' ? 'Closed' : '';
    const stateHtml = state && todayText ? `<span class="hours-state hours-state--${state.toLowerCase()}"><span class="hours-dot" aria-hidden="true"></span>${state}</span> · ` : '';
    const summary = todayText ? `${stateHtml}Today: ${escapeHtml(todayText)}` : 'Opening hours';
    const table = DAYS.filter(([k]) => hours[k]).map(([k, label]) => `<tr${k === today ? ' class="is-today"' : ''}><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(hours[k])}</td></tr>`).join('');
    rows.push(`<div class="essentials-row"><h3 class="essentials-label">Hours</h3><details class="hours"><summary>${summary}</summary>`
      + `<table class="hours-table"><caption class="visually-hidden">Opening hours as the gym states them</caption><tbody>${table}</tbody></table></details></div>`);
  }
  const site = safeUrl(g.website), label = websiteLabel(g.website);
  if(site && label) rows.push(`<div class="essentials-row"><h3 class="essentials-label">Website</h3><p class="panel-row"><a class="link" href="${escapeHtml(site)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a></p></div>`);
  return rows.join('');
}

export function facilitiesHtml(g){
  const list = cleanFacilities(g.facilities);
  if(!list.length) return '';
  const label = Object.fromEntries(FACILITIES);
  return `<section class="page-section" aria-labelledby="facilitiesTitle"><h2 class="section-title" id="facilitiesTitle">Facilities</h2>`
    + `<ul class="facility-list">${list.map(k => `<li class="facility-chip">${escapeHtml(label[k])}</li>`).join('')}</ul></section>`;
}

// ===== Forms (the edit dialog and /add) ==============================================================================
// The shared gym-information fields. prefix: id prefix ('e' -> e-website); v: current values. opts.hoursAndFacilities
// false leaves out the weekly hours and facilities (the /add step keeps to the quick facts; they come with an edit).
export function infoFieldsHtml(prefix, v = {}, { hoursAndFacilities = true, data = '' } = {}){
  const p = escapeHtml(prefix);
  const attr = key => (data ? ` ${data}="${escapeHtml(key)}"` : '');
  const hours = cleanHours(v.hours) || {};
  const facilities = new Set(cleanFacilities(v.facilities));
  let html = `<div class="field"><label for="${p}-website">Website (optional)</label><input id="${p}-website"${attr('website')} type="url" inputmode="url" maxlength="${LIMITS.website}" placeholder="https://" value="${escapeHtml(str(v.website))}"></div>`
    + `<div class="field"><label for="${p}-day-pass">Day pass price (optional)</label><input id="${p}-day-pass"${attr('day_pass')} type="text" maxlength="${LIMITS.day_pass}" placeholder="e.g. A$28 adult, A$22 concession" value="${escapeHtml(str(v.day_pass))}"></div>`;
  if(hoursAndFacilities){
    html += `<fieldset class="field hours-fields"><legend class="field-label">Opening hours (optional, as the gym states them)</legend>`
      + DAYS.map(([k, label]) => `<label class="hours-field"><span>${escapeHtml(label)}</span><input id="${p}-hours-${k}" data-hours-day="${k}" type="text" maxlength="${LIMITS.hour}" placeholder="e.g. 6am–10pm or Closed" value="${escapeHtml(hours[k] || '')}"></label>`).join('')
      + `</fieldset>`
      + `<fieldset class="field"><legend class="field-label">Facilities (optional)</legend><div class="facility-checks">`
      + FACILITIES.map(([k, label]) => `<label class="check-row"><input type="checkbox" data-facility="${k}"${facilities.has(k) ? ' checked' : ''}>${escapeHtml(label)}</label>`).join('')
      + `</div></fieldset>`;
  }
  html += `<div class="field"><label for="${p}-description">About this gym (optional)</label><textarea id="${p}-description"${attr('description')} maxlength="${LIMITS.description}" placeholder="What it’s like: walls, style, atmosphere">${escapeHtml(str(v.description))}</textarea></div>`;
  return html;
}

// Reads the fields back. get(id) returns the element (or null); root.querySelectorAll is only used for the checkbox and
// hours groups, passed in as arrays so this stays pure and testable.
export function readInfoFields(prefix, get, { hourInputs = [], facilityInputs = [] } = {}){
  const val = id => { const el = get(prefix + '-' + id); return el ? str(el.value) : ''; };
  const hours = {};
  for(const el of hourInputs) if(DAY_KEYS.includes(el.dataset.hoursDay)) hours[el.dataset.hoursDay] = el.value;
  const website = val('website');
  return {
    website: website ? (safeUrl(website) || website) : null,          // an invalid URL is kept so the caller can refuse it
    day_pass: val('day-pass').slice(0, LIMITS.day_pass) || null,
    description: val('description').slice(0, LIMITS.description) || null,
    hours: hourInputs.length ? cleanHours(hours) : undefined,
    facilities: facilityInputs.length ? cleanFacilities(facilityInputs.filter(el => el.checked).map(el => el.dataset.facility)) : undefined,
  };
}
