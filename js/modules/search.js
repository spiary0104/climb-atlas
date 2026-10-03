// Search field + results (DESIGN.md sec. 9, basic): one combobox over gyms, cities, regions and countries.
//   Desktop: in the top bar, results in a popover. Below 1024px: over the map; focusing it opens a full-height panel.
//   Empty field: recent searches (up to 5, this device only) and the "Worth traveling for" destinations.
//   Browse (the Regions tab): every country with gyms, grouped by continent, so no place is reachable only by typing.
//   Keyboard: arrows move, Enter selects (or applies the text as a list filter), Escape closes.
import { COUNTRY_LABELS, COUNTRY_TO_REGION, REGION_LABELS } from './constants.js';
import { searchGroupHtml, searchOptionHtml } from './list-html.js';
import { stateLabel } from './map.js';
import { fold } from './geo.js';
import { buildSearchIndex, querySearchIndex } from './search-index.js';
import { appState } from './state.js';

export const RECENT_KEY = 'bouldeer_recent_searches';
const FEATURED = ['CN', 'JP', 'KR', 'US', 'DE', 'GB'];      // "Worth traveling for" (kept at the owner's request)
const $ = id => document.getElementById(id);
let cb = {};
let results = [];          // entries in display order; options refer to them by index
let active = -1;
let timer = null;
let mode = 'query';        // 'query' | 'browse'

export function rebuildSearchIndex(){
  appState.searchIndex = buildSearchIndex(appState.spots, { countryLabels: COUNTRY_LABELS, stateLabel });
}

function readRecent(){
  try{
    const r = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(r) ? r.filter(e => e && typeof e.key === 'string' && typeof e.label === 'string').slice(0, 5) : [];
  }catch(err){ return []; }
}
function remember(entry){
  const slim = { kind: entry.kind, key: entry.key, label: entry.label, secondary: entry.secondary || '' };
  const next = [slim, ...readRecent().filter(e => !(e.kind === slim.kind && e.key === slim.key))].slice(0, 5);
  try{ localStorage.setItem(RECENT_KEY, JSON.stringify(next)); }catch(err){ /* ignore */ }
}
// A recent entry is re-resolved against the live index, so a stale or tampered local value can only ever select a place
// or gym that exists.
function resolve(entry){
  const idx = appState.searchIndex;
  if(!idx) return null;
  if(entry.kind === 'gym') return idx.gyms.find(g => g.id === entry.key) || null;
  return idx.places.find(p => p.key === entry.key && p.kind === entry.kind) || null;
}

const panel = () => $('searchPanel');
const input = () => $('searchInput');
export const isSearchOpen = () => $('search').classList.contains('is-open');

function setOpen(open){
  $('search').classList.toggle('is-open', open);
  input().setAttribute('aria-expanded', String(open));
  panel().hidden = !open;
  document.body.classList.toggle('search-open', open);
  if(!open){ active = -1; input().removeAttribute('aria-activedescendant'); }
}

const listbox = html => `<div role="listbox" id="searchListbox" aria-label="Search results">${html}</div>`;

function renderGroups(groups){
  results = [];
  const html = groups.filter(g => g.items.length).map(g => searchGroupHtml(g.title, g.items.map(e => {
    results.push(e.entry || e);
    return searchOptionHtml(e.entry || e, results.length - 1, { recent: !!e.recent });
  }).join(''))).join('');
  active = -1;
  input().removeAttribute('aria-activedescendant');
  return html;
}

function render(){
  const q = input().value.trim();
  $('searchClear').hidden = !q;
  const idx = appState.searchIndex;
  if(!idx){ panel().innerHTML = '<p class="search-note">Loading gyms…</p>'; return; }
  if(!q){
    const countries = idx.places.filter(p => p.kind === 'country');
    const groups = [{ title: 'Recent', items: readRecent().map(resolve).filter(Boolean).map(entry => ({ entry, recent: true })) }];
    if(mode === 'browse'){
      const byRegion = {};
      countries.forEach(c => { const r = COUNTRY_TO_REGION[c.country] || 'other'; (byRegion[r] = byRegion[r] || []).push(c); });
      Object.keys(REGION_LABELS).concat('other').forEach(r => {
        if(byRegion[r]) groups.push({ title: REGION_LABELS[r] || 'Other', items: byRegion[r].sort((a, b) => a.label.localeCompare(b.label)) });
      });
    } else {
      groups.push({ title: 'Worth traveling for', items: FEATURED.map(code => countries.find(c => c.country === code)).filter(Boolean) });
    }
    panel().innerHTML = listbox(renderGroups(groups));
    return;
  }
  const r = querySearchIndex(idx, q);
  if(!r.total){
    results = [];
    panel().innerHTML = '<p class="search-note">Nothing for “<span class="search-note-term"></span>” — try a city or country.</p>';
    panel().querySelector('.search-note-term').textContent = q;
    return;
  }
  panel().innerHTML = listbox(renderGroups([
    { title: 'Cities', items: r.city }, { title: 'Regions', items: r.region },
    { title: 'Countries', items: r.country }, { title: 'Gyms', items: r.gym },
  ]));
}

function setActive(i){
  const opts = panel().querySelectorAll('[role="option"]');
  if(!opts.length) return;
  active = (i + opts.length) % opts.length;
  opts.forEach((o, n) => o.setAttribute('aria-selected', String(n === active)));
  input().setAttribute('aria-activedescendant', opts[active].id);
  opts[active].scrollIntoView({block: 'nearest'});
}

function choose(entry){
  if(!entry) return;
  remember(entry);
  input().value = '';
  setOpen(false);
  input().blur();
  if(entry.kind === 'gym') cb.onGym(entry.id);
  else cb.onPlace(entry);
}

export function openSearch({browse = false} = {}){
  mode = browse ? 'browse' : 'query';
  setOpen(true);
  render();
  input().focus();
}
export function closeSearch(){ setOpen(false); }

export function initSearch(callbacks){
  cb = callbacks;
  const field = input();
  field.addEventListener('focus', ()=>{ if(!isSearchOpen()){ mode = 'query'; setOpen(true); render(); } });
  field.addEventListener('input', ()=>{
    mode = 'query';
    if(!isSearchOpen()) setOpen(true);
    clearTimeout(timer);
    timer = setTimeout(render, 120);
  });
  field.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowDown'){ e.preventDefault(); if(!isSearchOpen()){ setOpen(true); render(); } setActive(active + 1); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); setActive(active - 1); }
    else if(e.key === 'Enter'){
      e.preventDefault();
      clearTimeout(timer);
      if(active >= 0) choose(results[active]);
      else if(field.value.trim()){
        const text = field.value.trim();
        if(mode === 'query') render();            // results for exactly this text, even if typed faster than the debounce
        // Enter on a query that names a place exactly ("Sydney", "Japan", "NSW") goes to that place; anything else stays a
        // text search over gym names and areas (sec. 9.3).
        const exact = results.find(r => r && r.kind && r.kind !== 'gym' && fold(r.label || '') === fold(text));
        if(exact){ choose(exact); return; }
        field.value = ''; setOpen(false); field.blur(); cb.onText(text);
      }
    } else if(e.key === 'Escape' && isSearchOpen()){
      e.preventDefault();          // tells explore.js's Escape handler this key is handled (the peek card stays open)
      setOpen(false);
    }
  });
  // mousedown keeps focus in the field (combobox pattern); click selects.
  panel().addEventListener('mousedown', (e)=>{ if(e.target.closest('[role="option"]')) e.preventDefault(); });
  panel().addEventListener('click', (e)=>{
    const opt = e.target.closest('[role="option"]');
    if(opt) choose(results[Number(opt.dataset.index)]);
  });
  $('searchClear').addEventListener('click', ()=>{ field.value = ''; render(); field.focus(); });
  $('searchBack').addEventListener('click', ()=>{ field.value = ''; setOpen(false); });
  document.addEventListener('pointerdown', (e)=>{ if(isSearchOpen() && !e.target.closest('#search')) setOpen(false); });
}
