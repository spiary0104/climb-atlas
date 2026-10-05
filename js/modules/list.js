// The viewport-scoped list (DESIGN.md sec. 7.1-7.4, 7.10): status line with count and sort, dense rows or photo cards,
// the 400 cap, skeletons, the three empty states, and the mobile pin-tap carousel. Rendering only: explore.js owns
// selection and passes callbacks in initList().
import { COUNTRY_FLY_TARGETS, COUNTRY_LABELS, LIST_CAP } from './constants.js';
import { distanceKm, formatDistance, inBounds } from './geo.js';
import { capRowHtml, carouselCardHtml, cardHtml, emptyHtml, introHtml, rowHtml, skeletonHtml } from './list-html.js';
import { stateLabel } from './map.js';
import { metroOf } from './metros.js';
import { gymPath } from './slug.js';
import { provenanceState } from './provenance.js';
import { filtersActive } from './filters.js';
import { status, statusLine } from './hours.js';
import { firstRunArt } from './brand.js';
import { appState } from './state.js';

export const LIST_VIEW_KEY = 'bouldeer_list_view';
const $ = id => document.getElementById(id);
let cb = {};

// Per-gym context for the markup builders (list-html.js is pure).
export function gymCtx(g){
  return {
    region: stateLabel(g.country, g.state),
    country: COUNTRY_LABELS[g.country] || g.country,
    saved: appState.bookmarkedIds.has(g.id),
    climbed: appState.climbedIds.has(g.id),
    selected: g.id === appState.selectedId,
    distance: appState.userLocation ? formatDistance(distanceKm(appState.userLocation, g)) : '',
    href: gymPath(g),
    provenance: provenanceState(g, appState.contributorCounts.get(g.id)),
    hours: statusLine(status(g)),      // null when unknown: nothing renders
  };
}

// Nearest first by default (final-stage audit): to the visitor once located, otherwise to the centre of the area the list
// shows, so a city's list starts in the middle of the city rather than at "A".
export const effectiveSort = () => appState.sortBy || 'distance';
function sortOrigin(){
  if(appState.userLocation) return appState.userLocation;
  const b = appState.scopeBounds;
  if(!b) return null;
  const east = b.east < b.west ? b.east + 360 : b.east;              // across the antimeridian
  const lng = (b.west + east) / 2;
  return { lat: (b.south + b.north) / 2, lng: lng > 180 ? lng - 360 : lng };
}

function sortSpots(list){
  const by = effectiveSort();
  const origin = by === 'distance' ? sortOrigin() : null;
  if(origin){
    const d = new Map(list.map(g => [g.id, distanceKm(origin, g)]));
    return list.sort((a, b) => d.get(a.id) - d.get(b.id) || a.name.localeCompare(b.name));
  }
  if(by === 'recent') return list.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')) || a.name.localeCompare(b.name));
  return list.sort((a, b) => a.name.localeCompare(b.name));
}

// "84 gyms in view · Sydney": the metro (metros.js), else the region ("· NSW"), only when most of the view is that one
// place and the map is zoomed to city level, so the line never names a place the view does not mostly show.
function dominantRegion(list){
  if(!list.length) return '';
  const metros = new Map(), counts = new Map();
  for(const g of list){
    const m = metroOf(g);
    if(m) metros.set(m, (metros.get(m) || 0) + 1);
    const k = g.country + ':' + g.state;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  const topMetro = [...metros.entries()].sort((a, b) => b[1] - a[1])[0];
  if(topMetro && topMetro[1] / list.length >= 0.6) return topMetro[0].name;
  const [key, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if(n / list.length < 0.6) return '';
  const [country, ...rest] = key.split(':');
  return stateLabel(country, rest.join(':'));
}

function renderStatus(zoomedIn){
  const n = appState.inView.length;
  $('countNum').textContent = n.toLocaleString('en-US');
  $('countLabel').textContent = n === 1 ? 'gym in view' : 'gyms in view';
  const place = appState.placeFilter ? appState.placeFilter.label : zoomedIn ? dominantRegion(appState.inView) : '';
  $('statusPlace').textContent = place ? ' · ' + place : '';
  const sort = $('sortSelect');
  const nearest = sort.querySelector('option[value="distance"]');
  nearest.hidden = false;
  nearest.textContent = appState.userLocation ? 'Nearest to you' : 'Nearest to centre';
  sort.value = effectiveSort();
}

// Orientation (final-stage audit): a first-time visitor is told what Bouldeer is, in one line above the list, once per
// device. Shown at start-up, before the data, with fixed wording: inserting it when the gyms arrive pushed the list down
// (a measured layout shift). Dismissed with its button.
export const INTRO_KEY = 'bouldeer_intro_seen';
function renderIntro(){
  const el = $('exploreIntro');
  let seen = false;
  try{ seen = localStorage.getItem(INTRO_KEY) === '1'; }catch(err){ /* private mode: show it */ }
  if(seen) return;
  el.innerHTML = introHtml();
  el.hidden = false;
  el.querySelector('[data-intro-close]').addEventListener('click', () => { el.hidden = true; });
  // Counted as seen only once Explore is actually on screen: a first visit that lands on a shared gym page (Explore
  // hidden behind it) must still get the line when the person reaches the map.
  const markSeen = () => { try{ localStorage.setItem(INTRO_KEY, '1'); }catch(err){ /* private mode */ } };
  const explore = document.getElementById('explore');
  if(explore && !explore.hidden) markSeen();
  else if(explore && typeof MutationObserver === 'function'){
    const mo = new MutationObserver(() => { if(!explore.hidden){ markSeen(); mo.disconnect(); } });
    mo.observe(explore, { attributes: true, attributeFilter: ['hidden'] });
  }
}

// Featured destinations ("Worth traveling for", kept at the owner's request): only at world/continent zoom.
function renderFeatured(zoom){
  $('featuredDestinations').hidden = zoom >= 4;
}

// First-ever visit with no home area (sec. 7.10, flag set by explore.js applyLanding): the backpacker and "Where are you
// climbing?" above the featured destinations, at world/continent zoom only. It ends for good once the person zooms in,
// picks a place or searches; the camera saved on the first moveend means the next visit is not a first run.
function renderFirstRun(zoom){
  const el = $('exploreFirstRun');
  const show = appState.exploreFirstRun && zoom < 4 && !appState.placeFilter && !appState.searchTerm;
  if(appState.exploreFirstRun && !show) appState.exploreFirstRun = false;
  if(show && !el.firstChild) el.innerHTML = firstRunArt('explore') + '<p class="empty-title">Where are you climbing?</p>'
    + '<button type="button" class="btn btn-secondary btn-sm" data-list-action="search-city">Search a city</button>';
  el.hidden = !show;
}

export function renderList({zoom = 0} = {}){
  if(!appState.loaded){ showSkeleton(); return; }
  const scoped = appState.filtered.filter(g => inBounds(g, appState.scopeBounds));
  appState.inView = sortSpots(scoped);
  renderStatus(zoom >= 8);
  renderFeatured(zoom);
  renderFirstRun(zoom);
  const list = $('gymList');
  list.setAttribute('aria-busy', 'false');
  if(!appState.inView.length){
    const anyInArea = appState.spots.some(g => inBounds(g, appState.scopeBounds));
    list.innerHTML = appState.searchTerm && !appState.filtered.length ? emptyHtml('search', appState.searchTerm)
      : anyInArea && filtersActive() ? emptyHtml('filters') : emptyHtml('area');
    return;
  }
  const shown = appState.inView.slice(0, LIST_CAP);
  const cards = appState.listView === 'cards';
  const firstCards = cb.cardsFirst ? cb.cardsFirst() : 0;       // mobile: first four as cards after a fresh search
  // Keyboard users keep their place: a re-render (e.g. after a row click flies the map) restores focus to the same gym.
  const focused = list.contains(document.activeElement) ? document.activeElement : null;
  const focusId = focused && focused.dataset.spotId, focusAction = focused && focused.dataset.gymAction;
  list.classList.toggle('is-cards', cards);
  list.innerHTML = shown.map((g, i) => (cards || i < firstCards ? cardHtml : rowHtml)(g, gymCtx(g))).join('')
    + (appState.inView.length > LIST_CAP ? capRowHtml(appState.inView.length) : '');
  if(focusId){
    const again = list.querySelector(`[data-spot-id="${CSS.escape(focusId)}"][data-gym-action="${CSS.escape(focusAction)}"]`);
    if(again) again.focus({preventScroll: true});
  }
}

export function showSkeleton(){
  const list = $('gymList');
  list.setAttribute('aria-busy', 'true');
  list.innerHTML = skeletonHtml(appState.listView);
  $('countNum').textContent = '…';
  $('statusPlace').textContent = '';
  $('sortSelect').value = effectiveSort();   // the hidden Distance option is first in the markup
}

// ----- targeted updates (no full re-render: keeps scroll position and focus) ----------------------------------------
const itemOf = id => document.querySelector(`#gymList [data-id="${CSS.escape(id)}"]`);

export function setRowSelected(id, prev){
  if(prev){ const p = itemOf(prev); if(p) p.classList.remove('is-selected'); }
  const el = id && itemOf(id);
  if(el) el.classList.add('is-selected');
}
export function setRowHover(id, prev){
  if(prev){ const p = itemOf(prev); if(p) p.classList.remove('is-hover'); }
  const el = id && itemOf(id);
  if(el) el.classList.add('is-hover');
}
export function scrollRowIntoView(id){
  const el = id && itemOf(id);
  if(el) el.scrollIntoView({block: 'nearest'});
}
export function updateRowMarks(id){
  const el = itemOf(id);
  const btn = el && el.querySelector('[data-gym-action="save"]');
  if(btn) btn.setAttribute('aria-pressed', String(appState.bookmarkedIds.has(id)));
}

// ----- mobile carousel ------------------------------------------------------------------------------------------------
export function renderCarousel(){
  const box = $('carousel');
  const gyms = appState.carouselIds.map(id => appState.visibleIndex[id]).filter(Boolean);
  box.hidden = !gyms.length;
  box.innerHTML = gyms.map(g => carouselCardHtml(g, gymCtx(g))).join('');
}
export function markCarouselSelected(id){
  document.querySelectorAll('#carousel .carousel-card').forEach(c => c.classList.toggle('is-selected', c.dataset.spotId === id));
}

// ----- events ---------------------------------------------------------------------------------------------------------
function moveFocus(from, delta){
  const items = [...document.querySelectorAll('#gymList [data-gym-action="open"]')];
  const i = items.indexOf(from);
  const next = items[Math.max(0, Math.min(items.length - 1, i + delta))];
  if(next){ next.focus(); cb.onHover(next.dataset.spotId); }
}

export function initList(callbacks){
  renderIntro();
  cb = callbacks;
  try{ const v = localStorage.getItem(LIST_VIEW_KEY); if(v === 'rows' || v === 'cards') appState.listView = v; }catch(err){ /* ignore */ }
  syncViewToggle();
  const list = $('gymList');
  list.addEventListener('click', (e)=>{
    const act = e.target.closest('[data-gym-action], [data-list-action]');
    if(!act) return;
    if(act.dataset.listAction) cb.onListAction(act.dataset.listAction);
    else cb.onGymAction(act.dataset.gymAction, act.dataset.spotId);
  });
  $('exploreFirstRun').addEventListener('click', (e)=>{
    const act = e.target.closest('[data-list-action]');
    if(act) cb.onListAction(act.dataset.listAction);
  });
  list.addEventListener('mouseover', (e)=>{
    const item = e.target.closest('[data-id]');
    cb.onHover(item ? item.dataset.id : null);
  });
  list.addEventListener('mouseleave', ()=> cb.onHover(null));
  // Arrow keys move between rows; Enter/Space on a row button opens its peek card (native button behaviour).
  list.addEventListener('keydown', (e)=>{
    const row = e.target.closest('[data-gym-action="open"]');
    if(!row) return;
    if(e.key === 'ArrowDown'){ e.preventDefault(); moveFocus(row, 1); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); moveFocus(row, -1); }
  });
  $('sortSelect').addEventListener('change', (e)=>{ appState.sortBy = e.target.value; cb.onSortChange(); });
  $('viewToggle').addEventListener('click', (e)=>{
    const b = e.target.closest('[data-view]');
    if(!b || b.dataset.view === appState.listView) return;
    appState.listView = b.dataset.view;
    try{ localStorage.setItem(LIST_VIEW_KEY, appState.listView); }catch(err){ /* ignore */ }
    syncViewToggle();
    cb.onSortChange();
  });
  $('featuredDestinations').addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-country]');
    const target = btn && COUNTRY_FLY_TARGETS[btn.dataset.country];
    if(target) cb.onFlyTo(target);
  });
  $('carousel').addEventListener('click', (e)=>{
    const card = e.target.closest('[data-gym-action]');
    if(card) cb.onGymAction(card.dataset.gymAction, card.dataset.spotId);
  });
  // Swiping the carousel changes the selected pin (sec. 7.9): whichever card is centred when scrolling settles.
  let t;
  $('carousel').addEventListener('scroll', ()=>{
    clearTimeout(t);
    t = setTimeout(()=>{
      const box = $('carousel');
      const mid = box.getBoundingClientRect().left + box.clientWidth / 2;
      let best = null, bestD = Infinity;
      box.querySelectorAll('.carousel-card').forEach(c => {
        const r = c.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        if(d < bestD){ bestD = d; best = c; }
      });
      if(best && best.dataset.spotId !== appState.selectedId) cb.onCarouselSelect(best.dataset.spotId);
    }, 120);
  }, {passive: true});
}

function syncViewToggle(){
  document.querySelectorAll('#viewToggle [data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === appState.listView)));
}
