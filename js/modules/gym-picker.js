// Gym picker for "Log a session" (real-phone test 2026-09-28: a 2,000-option <select> was unusable on a phone). Search by
// gym name, city, region or country, or browse continent -> country -> gyms. Pure (no DOM): buildPickerIndex once per
// spots array, queryGyms per keystroke, and the markup. Nothing renders the whole dataset: a search shows at most
// PICKER_LIMIT matches, and browsing renders a country's gyms only when that country is opened (logbook.js).
import { COUNTRY_LABELS, COUNTRY_TO_REGION, REGION_LABELS } from './constants.js';
import { fold, wordStarts } from './geo.js';
import { escapeHtml } from './html-safe.js';
import { icon } from './icons.js';

export const PICKER_LIMIT = 50;
const byLabel = (a, b) => a.label.localeCompare(b.label);

// -> { gyms: [{id, name, place, country, words, nameWords, folded}] by name, byId, continents: [{key, label, count,
//      countries: [{code, label, count}]}] }
export function buildPickerIndex(spots, { stateLabel = (c, s) => s } = {}){
  const gyms = [], counts = new Map();                  // continent -> Map(country -> count)
  for(const g of spots || []){
    if(!g || !g.id) continue;
    const country = COUNTRY_LABELS[g.country] || g.country || '';
    const region = stateLabel(g.country, g.state) || g.state || '';
    const place = [g.suburb, region && region !== country ? region : '', country].filter(Boolean).join(' · ');
    gyms.push({ id: g.id, name: g.name || '', place, country: g.country,
      words: [...wordStarts(g.name), ...wordStarts(g.suburb), ...wordStarts(region), ...wordStarts(country), ...wordStarts(g.country)],
      nameWords: wordStarts(g.name), folded: fold(g.name).trim() });
    const cont = COUNTRY_TO_REGION[g.country] || 'other';
    if(!counts.has(cont)) counts.set(cont, new Map());
    counts.get(cont).set(g.country, (counts.get(cont).get(g.country) || 0) + 1);
  }
  gyms.sort((a, b) => a.name.localeCompare(b.name));
  const continents = [...Object.keys(REGION_LABELS), 'other'].filter(k => counts.has(k)).map(k => {
    const countries = [...counts.get(k)].map(([code, count]) => ({ code, label: COUNTRY_LABELS[code] || code || 'Unknown', count })).sort(byLabel);
    return { key: k, label: REGION_LABELS[k] || 'Other', count: countries.reduce((n, c) => n + c.count, 0), countries };
  });
  return { gyms, byId: new Map(gyms.map(e => [e.id, e])), continents };
}

// Every query word must start a word of the gym's name, city, region or country ("boulder berlin", "tokyo", "nsw").
// Ranked: exact name > name prefix > all words in the name > location matches; then by name. -> {items, total}
export function queryGyms(index, text, limit = PICKER_LIMIT){
  const qWords = wordStarts(text), qFolded = fold(text).trim();
  if(!qWords.length) return { items: [], total: 0 };
  const hits = [];
  for(const e of index.gyms){
    if(!qWords.every(q => e.words.some(w => w.startsWith(q)))) continue;
    const s = e.folded === qFolded ? 3 : e.folded.startsWith(qFolded) ? 2 : qWords.every(q => e.nameWords.some(w => w.startsWith(q))) ? 1 : 0;
    hits.push([s, e]);
  }
  hits.sort((a, b) => b[0] - a[0] || a[1].name.localeCompare(b[1].name));
  return { items: hits.slice(0, limit).map(h => h[1]), total: hits.length };
}

export const gymsInCountry = (index, code) => index.gyms.filter(e => e.country === code);

// The current choice, always visible above the picker. e: an index entry or null ("No specific gym").
export function pickerCurrentHtml(e, open = false){
  const text = e
    ? `<span class="gym-picker-name">${escapeHtml(e.name)}</span><span class="gym-picker-place">${escapeHtml(e.place)}</span>`
    : '<span class="gym-picker-name gym-picker-none">No specific gym</span>';
  return `${e ? icon('check-circle', {size:'sm'}) : icon('map-pin', {size:'sm'})}<span class="gym-picker-text">${text}</span>`
    + `<button type="button" class="btn btn-tertiary btn-sm" id="sGymToggle" aria-expanded="${open ? 'true' : 'false'}" aria-controls="sGymPanel">${e ? 'Change' : 'Choose a gym'}</button>`;
}

// Search results: a listbox driven from the search field (aria-activedescendant). Empty state names the query.
export function pickerResultsHtml(query, result, selectedId = ''){
  if(!result.items.length){
    return `<p class="picker-empty" role="status">No gyms match “${escapeHtml(query.trim())}”. Try the gym’s city or country, or browse by clearing the search.</p>`;
  }
  const more = result.total > result.items.length
    ? `<p class="picker-note tnum" role="status">Showing ${Number(result.items.length)} of ${Number(result.total)}. Keep typing to narrow it down.</p>`
    : `<p class="visually-hidden" role="status">${Number(result.total)} ${result.total === 1 ? 'gym' : 'gyms'} found</p>`;
  return `<ul class="picker-options" id="sGymOptions" role="listbox" aria-label="Matching gyms">`
    + result.items.map((e, i) => `<li class="picker-option" id="sGymOpt-${Number(i)}" role="option" data-gym-id="${escapeHtml(e.id)}" aria-selected="${e.id === selectedId ? 'true' : 'false'}">`
      + `<span class="gym-picker-name">${escapeHtml(e.name)}</span><span class="gym-picker-place">${escapeHtml(e.place)}</span></li>`).join('')
    + `</ul>` + more;
}

// Browsing: "No specific gym", then every continent collapsed (details/summary: native keyboard and screen-reader support),
// each with its countries, also collapsed; a country's gyms are filled in when it opens (pickerGymsHtml).
export function pickerBrowseHtml(index, selectedId = ''){
  const none = `<button type="button" class="picker-gym" data-gym-id=""${selectedId ? '' : ' aria-current="true"'}><span class="gym-picker-name">No specific gym</span></button>`;
  const groups = index.continents.map(c => `<details class="picker-group"><summary>${icon('caret-right', {size:'sm'})}<span class="picker-summary-label">${escapeHtml(c.label)}</span><span class="picker-count tnum">${Number(c.count)}</span></summary>`
    + c.countries.map(k => `<details class="picker-country" data-country="${escapeHtml(k.code)}"><summary>${icon('caret-right', {size:'sm'})}<span class="picker-summary-label">${escapeHtml(k.label)}</span><span class="picker-count tnum">${Number(k.count)}</span></summary><div class="picker-country-gyms"></div></details>`).join('')
    + `</details>`).join('');
  return `<div class="picker-browse">${none}${groups}</div>`;
}

export function pickerGymsHtml(entries, selectedId = ''){
  return entries.map(e => `<button type="button" class="picker-gym" data-gym-id="${escapeHtml(e.id)}"${e.id === selectedId ? ' aria-current="true"' : ''}>`
    + `<span class="gym-picker-name">${escapeHtml(e.name)}</span><span class="gym-picker-place">${escapeHtml(e.place)}</span></button>`).join('');
}
