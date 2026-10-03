// Explore filters (DESIGN.md sec. 7.6): the chip row, applied pills (place / text), the All filters sheet with its live
// count, and the filter half of the URL query. The chip row is one element that nav-free CSS positions: list pane on
// desktop, over the map below 1024px (explore.js moves it between slots).
//   Type chips: all three on = no chip selected; tapping one narrows to it; tapping the last selected one returns to all.
import { openAuthModal } from './auth-ui.js';
import { COUNTRY_LABELS } from './constants.js';
import { ALL_TYPES, fold, inBounds } from './geo.js';
import { appliedPillHtml } from './list-html.js';
import { stateLabel } from './map.js';
import { findPlace } from './search-index.js';
import { safeUrl } from './html-safe.js';
import { appState } from './state.js';

let onChange = () => {};
const $ = id => document.getElementById(id);

// The current filters as a plain object, so the All filters sheet can count a draft with the same predicate.
export const currentFilters = () => ({
  types: new Set(appState.activeTypes), saved: appState.showBookmarkedOnly, climbed: appState.showClimbedOnly,
  photos: appState.showPhotosOnly, place: appState.placeFilter, text: appState.searchTerm,
});
const defaultFilters = () => ({ types: new Set(ALL_TYPES), saved: false, climbed: false, photos: false, place: null, text: '' });

function inPlace(g, place){
  if(!place) return true;
  if(g.country !== place.country) return false;
  if(place.kind === 'country') return true;
  if(g.state !== place.state) return false;
  return place.kind === 'region' || (g.suburb || '').trim() === place.label;
}

export function matches(g, f){
  if(!(g.types || []).some(t => f.types.has(t))) return false;
  if(f.climbed && !appState.climbedIds.has(g.id)) return false;
  if(f.saved && !appState.bookmarkedIds.has(g.id)) return false;
  if(f.photos && !safeUrl(g.photo)) return false;
  if(!inPlace(g, f.place)) return false;
  if(f.text){
    // Name, suburb, address, region and country, by label and by code ("NSW", "JP"), diacritic-insensitive.
    const hay = fold([g.name, g.suburb, g.address, g.state, stateLabel(g.country, g.state), g.country, COUNTRY_LABELS[g.country]].join(' '));
    if(!hay.includes(fold(f.text).trim())) return false;
  }
  return true;
}

export function applyFilters(){
  const f = currentFilters();
  appState.filtered = appState.spots.filter(g => matches(g, f));
  return appState.filtered;
}
export const filtersActive = () => {
  const f = currentFilters();
  return f.types.size < ALL_TYPES.length || f.saved || f.climbed || f.photos || !!f.place || !!f.text;
};

// Share of gyms with a usable photo link, recomputed only when the spots array changes.
export const PHOTO_FILTER_MIN = 0.05;
let shareOf = null, share = 0;
function photoShare(){
  if(shareOf !== appState.spots){ shareOf = appState.spots; share = shareOf.length ? shareOf.filter(g => safeUrl(g.photo)).length / shareOf.length : 0; }
  return share;
}

// ----- chip row -----------------------------------------------------------------------------------------------------
export function renderFilterBar(){
  const narrowed = appState.activeTypes.size < ALL_TYPES.length;
  document.querySelectorAll('#filterBar [data-filter-type]').forEach(c => {
    c.setAttribute('aria-pressed', String(narrowed && appState.activeTypes.has(c.dataset.filterType)));
  });
  const flags = { saved: appState.showBookmarkedOnly, climbed: appState.showClimbedOnly, photos: appState.showPhotosOnly };
  document.querySelectorAll('#filterBar [data-filter-flag]').forEach(c => c.setAttribute('aria-pressed', String(!!flags[c.dataset.filterFlag])));
  // "Has photos" only once at least 5% of gyms have one (it emptied the map everywhere); kept while the filter is on.
  const photosHidden = !appState.showPhotosOnly && photoShare() < PHOTO_FILTER_MIN;
  document.querySelectorAll('[data-filter-flag="photos"], #filterSheetPhotos').forEach(el => { el.hidden = photosHidden; });
  const pills = [];
  if(appState.placeFilter) pills.push(appliedPillHtml('place', appState.placeFilter.label));
  if(appState.searchTerm) pills.push(appliedPillHtml('text', appState.searchTerm));
  $('appliedPills').innerHTML = pills.join('');
}

function toggleType(type){
  const s = appState.activeTypes;
  if(s.size === ALL_TYPES.length) appState.activeTypes = new Set([type]);
  else if(s.has(type)){ s.delete(type); if(!s.size) appState.activeTypes = new Set(ALL_TYPES); }
  else { s.add(type); }
}

const FLAG_KEYS = { saved: 'showBookmarkedOnly', climbed: 'showClimbedOnly', photos: 'showPhotosOnly' };
function toggleFlag(flag){
  if(flag !== 'photos' && !window.auth.user){ openAuthModal(); return false; }
  appState[FLAG_KEYS[flag]] = !appState[FLAG_KEYS[flag]];
  return true;
}

export function setPlaceFilter(place){ appState.placeFilter = place; }
export function setTextFilter(text){ appState.searchTerm = (text || '').trim().slice(0, 100); }

export function resetFilters(){
  const d = defaultFilters();
  applyDraft(d);
}
function applyDraft(d){
  appState.activeTypes = new Set(d.types);
  appState.showBookmarkedOnly = !!d.saved && !!window.auth.user;
  appState.showClimbedOnly = !!d.climbed && !!window.auth.user;
  appState.showPhotosOnly = !!d.photos;
  appState.placeFilter = d.place;
  appState.searchTerm = d.text;
}

// ----- URL (filter half; explore.js adds the camera) ---------------------------------------------------------------
export function filterUrlState(){
  return { types: [...appState.activeTypes], saved: appState.showBookmarkedOnly, climbed: appState.showClimbedOnly,
    photos: appState.showPhotosOnly, place: appState.placeFilter ? appState.placeFilter.key : null, q: appState.searchTerm };
}
export function applyUrlFilters(s){
  appState.activeTypes = new Set(s.types);
  appState.showBookmarkedOnly = s.saved;
  appState.showClimbedOnly = s.climbed;
  appState.showPhotosOnly = s.photos;
  appState.placeFilter = s.place && appState.searchIndex ? findPlace(appState.searchIndex, s.place) : null;
  appState.searchTerm = s.q || '';
}

// ----- All filters sheet ------------------------------------------------------------------------------------------
let draft = null;
const sheetBackdrop = () => $('filterSheetBackdrop');

function draftCount(){
  const inScope = appState.spots.filter(g => inBounds(g, appState.scopeBounds));
  return inScope.filter(g => matches(g, draft)).length;
}
function syncSheet(){
  const signedIn = !!window.auth.user;
  document.querySelectorAll('#filterSheet input[data-sheet-type]').forEach(i => { i.checked = draft.types.has(i.dataset.sheetType); });
  document.querySelectorAll('#filterSheet input[data-sheet-flag]').forEach(i => {
    const flag = i.dataset.sheetFlag;
    i.checked = !!draft[flag];
    if(flag !== 'photos') i.disabled = !signedIn;
  });
  $('filterSheetMarksHint').hidden = signedIn;
  const n = draftCount();
  $('applyFiltersBtn').textContent = n === 1 ? 'Show 1 gym' : 'Show ' + n.toLocaleString('en-US') + ' gyms';
}
export function openFilterSheet(){
  draft = currentFilters();
  syncSheet();
  sheetBackdrop().classList.remove('hidden');
}
function closeFilterSheet(){ sheetBackdrop().classList.add('hidden'); draft = null; }

export function initFilters(opts){
  onChange = opts.onChange;
  $('filterBar').addEventListener('click', (e)=>{
    const type = e.target.closest('[data-filter-type]');
    const flag = e.target.closest('[data-filter-flag]');
    const remove = e.target.closest('[data-remove-filter]');
    if(type) toggleType(type.dataset.filterType);
    else if(flag){ if(!toggleFlag(flag.dataset.filterFlag)) return; }
    else if(remove){ if(remove.dataset.removeFilter === 'place') appState.placeFilter = null; else appState.searchTerm = ''; }
    else if(e.target.closest('#allFiltersBtn')){ openFilterSheet(); return; }
    else return;
    onChange({push: true});
  });
  $('filterSheet').addEventListener('change', (e)=>{
    if(!draft) return;
    const t = e.target.closest('input[data-sheet-type]');
    const f = e.target.closest('input[data-sheet-flag]');
    if(t){
      if(t.checked) draft.types.add(t.dataset.sheetType); else draft.types.delete(t.dataset.sheetType);
      if(!draft.types.size){ draft.types = new Set(ALL_TYPES); }   // "none" is not a useful filter: back to all
    } else if(f) draft[f.dataset.sheetFlag] = f.checked;
    syncSheet();
  });
  $('resetFiltersBtn').addEventListener('click', ()=>{ const keep = draft; draft = {...defaultFilters(), place: keep.place, text: keep.text}; syncSheet(); });
  $('applyFiltersBtn').addEventListener('click', ()=>{
    applyDraft(draft);
    closeFilterSheet();
    onChange({push: true});
  });
  $('filterSheetClose').addEventListener('click', closeFilterSheet);
}
