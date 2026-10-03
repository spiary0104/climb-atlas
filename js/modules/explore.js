// Explore controller (DESIGN.md sec. 7): wires the map, the scoped list, filters, search, the peek card and the mobile
// sheet together, and keeps the URL query (?q=&place=&c=lng,lat,z&t=…&saved=1) in step so back/forward restore a view.
//   Selection: row click -> fly + select + peek (desktop) / the gym page (mobile); pin click -> select + peek (desktop) /
//   carousel (mobile), a carousel card opens the gym page; Esc, the close button or a click on empty map clears it.
//   Hover is mirrored both ways (row <-> pin). Explore stays mounted behind pages (router.js), so Back restores it.
//   Landing (sec. 19 decision 5): URL camera -> last camera on this device -> densest gym area of the home country -> world.
import { motion } from './constants.js';
import { decodeExploreState, encodeExploreState } from './geo.js';
import { applyFilters, applyUrlFilters, filterUrlState, initFilters, renderFilterBar, resetFilters, setPlaceFilter, setTextFilter } from './filters.js';
import { gymCtx, initList, markCarouselSelected, renderCarousel, renderList, scrollRowIntoView, setRowHover, setRowSelected, showSkeleton, updateRowMarks } from './list.js';
import { peekHtml } from './list-html.js';
import { exploreUrl, isExplore, navigate, refreshPage, registerView } from './router.js';
import { assignMissingSlugs, gymPath } from './slug.js';
import { LAST_CAMERA_KEY, clusterExpansionZoom, clusterLeafIds, flyToPlace, landingCamera, map, paintMarkers, rebuildClusterIndex, refreshPin, setMapHandlers, viewBounds } from './map.js';
import { setMarksListener, toggleMark } from './marks.js';
import { openEditModal, openReportModal, startAddGym } from './modals.js';
import { closeSearch, initSearch, isSearchOpen, openSearch, rebuildSearchIndex } from './search.js';
import { SHEET_QUERY, initSheet, isSheetMode, setMinPeek, setSnap } from './sheet.js';
import { appState } from './state.js';
import { showToast } from './utils.js';

const $ = id => document.getElementById(id);
const byId = new Map();
let indexedSpots = null;      // the spots array the search index and id map were built from
let urlApplied = false;
let freshSearch = false;      // mobile: the first four results after a search render as photo cards
let movedSinceScope = false;
let focusSearchOnRender = false;  // first-run (sec. 7.10): focus the search once its index exists

const spotById = id => byId.get(id) || null;

// ----- rendering --------------------------------------------------------------------------------------------------
// Full refresh after data/auth/moderation changes (main.js, moderation.js).
// { page: false } refreshes Explore only, leaving an open page as it is (main.js: the boot's second render).
export function render({ page = true } = {}){
  if(!appState.loaded) return;                 // skeleton rows until the first load (auth can fire earlier)
  if(indexedSpots !== appState.spots){
    indexedSpots = appState.spots;
    byId.clear();
    assignMissingSlugs(appState.spots);          // only rows without a stored slug (offline data / pre-migration DB)
    appState.bySlug = new Map(appState.spots.map(g => [g.slug, g]));
    appState.spots.forEach(g => byId.set(g.id, g));
    rebuildSearchIndex();
    if(!urlApplied){ urlApplied = true; applyUrlFilters(decodeExploreState(location.search)); }
    else if(appState.placeFilter) setPlaceFilter(appState.searchIndex.places.find(p => p.key === appState.placeFilter.key) || null);
  }
  filtersChanged({write: false});
  if(focusSearchOnRender){ focusSearchOnRender = false; if(isExplore() && appState.exploreFirstRun) $('searchInput').focus({preventScroll: true}); }
  if(appState.selectedId && !spotById(appState.selectedId)) clearSelection();
  renderPeek();
  if(page) refreshPage();                       // a page opened before the data arrived renders now
}

function refreshList(){
  renderList({zoom: map.getZoom()});
}

function filtersChanged({push = false, write = true} = {}){
  applyFilters();
  rebuildClusterIndex(appState.filtered);
  renderFilterBar();
  if(!appState.scopeBounds || appState.searchAsMove) appState.scopeBounds = viewBounds();
  refreshList();
  if(write) writeUrl({push});
}

// ----- URL + last camera ------------------------------------------------------------------------------------------
function writeUrl({push = false} = {}){
  if(!isExplore()) return;                      // a page owns the URL while it is showing
  const c = map.getCenter();
  const qs = encodeExploreState({...filterUrlState(), camera: {lng: c.lng, lat: c.lat, zoom: map.getZoom()}});
  const url = location.pathname + (qs ? '?' + qs : '') + location.hash;
  if(url === location.pathname + location.search + location.hash) return;
  try{ history[push ? 'pushState' : 'replaceState'](null, '', url); }catch(err){ /* e.g. rate-limited replaceState */ }
}
function saveCamera(){
  const c = map.getCenter();
  try{ localStorage.setItem(LAST_CAMERA_KEY, JSON.stringify({lng: +c.lng.toFixed(4), lat: +c.lat.toFixed(4), zoom: +map.getZoom().toFixed(2)})); }catch(err){ /* ignore */ }
}
function onPopState(){
  if(!urlApplied) return;                       // before the first load the URL is applied by render()
  const s = decodeExploreState(location.search);
  applyUrlFilters(s);
  if(s.camera) map.jumpTo({center: [s.camera.lng, s.camera.lat], zoom: s.camera.zoom});
  filtersChanged({write: false});
}

// The visitor's home country from the browser locale ("en-AU" -> AU; a bare "ja" -> JP), then the densest cluster of its
// gyms at metro scale (60px at zoom 7 is ~45 km: London, not one of its boroughs). No location permission is involved.
const LANG_COUNTRY = {ja:'JP', ko:'KR', de:'DE', fr:'FR', it:'IT', es:'ES', nl:'NL', sv:'SE', pl:'PL', da:'DK', fi:'FI', nb:'NO', nn:'NO', pt:'PT', cs:'CZ', hu:'HU', el:'GR', zh:'CN', ru:'RU', tr:'TR', he:'IL'};
function homeCountry(){
  const langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
  for(const l of langs){ const r = l.split(/[-_]/).slice(1).find(p => /^[A-Za-z]{2}$/.test(p)); if(r) return r.toUpperCase(); }
  for(const l of langs){ const c = LANG_COUNTRY[l.slice(0, 2).toLowerCase()]; if(c) return c; }
  return null;
}
function homeCamera(){
  const cc = homeCountry();
  const pts = cc ? appState.spots.filter(g => g.country === cc) : [];
  if(!pts.length) return null;
  const sc = new Supercluster({radius: 60, maxZoom: 16}).load(pts.map(g => ({type: 'Feature', properties: {}, geometry: {type: 'Point', coordinates: [g.lng, g.lat]}})));
  const best = sc.getClusters([-180, -85, 180, 85], 7).sort((a, b) => (b.properties.point_count || 1) - (a.properties.point_count || 1))[0];
  return best ? {center: best.geometry.coordinates, zoom: 10} : null;
}
export function applyLanding(){
  if(landingCamera) return;
  const home = homeCamera();
  if(home){ map.jumpTo(home); return; }
  // First-ever visit and no home area (sec. 7.10): the world view gets the first-run prompt (list.js) and, on desktop, the
  // search field is focused. On phones focusing would open the full-height search over the map, so the prompt's button does it.
  appState.exploreFirstRun = true;
  focusSearchOnRender = !isSheetMode();
}

// ----- selection, hover, peek -------------------------------------------------------------------------------------
function announce(text){ $('liveRegion').textContent = text; }

function setHover(id){
  if(id === appState.hoverId){ setRowHover(id, null); return; }   // the list may have re-rendered since
  const prev = appState.hoverId;
  appState.hoverId = id;
  refreshPin(prev); refreshPin(id);
  setRowHover(id, prev);
}

function select(id, {fly = false} = {}){
  const g = spotById(id);
  if(!g) return;
  const prev = appState.selectedId;
  appState.selectedId = id;
  if(prev && prev !== id) refreshPin(prev);
  setRowSelected(id, prev);
  if(appState.markerEls[id]) refreshPin(id); else paintMarkers();
  if(fly){
    const padding = isSheetMode() ? {top: 0, left: 0, right: 0, bottom: Math.round(window.innerHeight * 0.45)} : 0;
    map.flyTo({center: [g.lng, g.lat], zoom: Math.max(map.getZoom(), 13), padding, duration: motion(800)});
  }
  scrollRowIntoView(id);
  markCarouselSelected(id);
  renderPeek();
}

export function clearSelection(){
  const prev = appState.selectedId;
  appState.selectedId = null;
  refreshPin(prev);
  setRowSelected(null, prev);
  hideCarousel();
  renderPeek();
}

function closePeek(){
  const back = appState.selectedId && document.querySelector(`#gymList [data-spot-id="${CSS.escape(appState.selectedId)}"][data-gym-action="open"]`);
  clearSelection();
  if(back) back.focus({preventScroll: true});
}

function renderPeek(){
  const peek = $('peek');
  const g = appState.selectedId && spotById(appState.selectedId);
  const show = !!g && !isSheetMode();           // mobile has no peek card: rows and carousel cards open the gym page
  if(!show){ peek.hidden = true; peek.innerHTML = ''; return; }
  const wasHidden = peek.hidden;
  peek.innerHTML = peekHtml(g, gymCtx(g));
  peek.hidden = false;
  if(wasHidden) announce(g.name + ' — details open');
}

function showCarousel(ids){
  appState.carouselIds = ids;
  renderCarousel();
  setMinPeek(ids.length ? $('carousel').offsetHeight + $('sheetHandle').offsetHeight + 16 : 0);
  if(ids.length) setSnap('peek');
}
function hideCarousel(){
  if(!appState.carouselIds.length) return;
  appState.carouselIds = [];
  renderCarousel();
  setMinPeek(0);
}

// ----- actions ------------------------------------------------------------------------------------------------------
function gymAction(action, id){
  switch(action){
    case 'open': if(isSheetMode()) openGymPage(id); else select(id, {fly: true}); break;
    case 'details': openGymPage(id); break;
    case 'save': toggleMark(id, 'bookmarked'); break;
    case 'climbed': toggleMark(id, 'climbed'); break;
    case 'edit': openEditModal(id); break;
    case 'report': openReportModal(id); break;
    case 'close': closePeek(); break;
  }
}

function openGymPage(id){
  const g = spotById(id);
  if(g) navigate(gymPath(g));
}

function listAction(action){
  const z = map.getZoom();
  if(action === 'zoom-out') map.easeTo({zoom: Math.max(1, z - 2), duration: motion(500)});
  else if(action === 'zoom-in') map.easeTo({zoom: Math.min(18, z + 2), duration: motion(500)});
  else if(action === 'add-gym') startAddGym();
  else if(action === 'clear-filters'){ resetFilters(); filtersChanged({push: true}); }
  else if(action === 'search-city'){ setTextFilter(''); filtersChanged({push: true}); openSearch(); }
}

function onPlace(place){
  if(!isExplore()) navigate(exploreUrl());     // searching from a page returns to Explore first
  setPlaceFilter(place);
  setTextFilter('');
  flyToPlace(place);
  filtersChanged({push: true});
  if(isSheetMode()){ freshSearch = true; setSnap('half'); }
}

function onGym(id){
  const g = spotById(id);
  if(!g) return;
  // From a page, or on mobile (no peek card), a gym picked by name opens its page (sec. 9.3).
  if(!isExplore() || isSheetMode()){ navigate(gymPath(g)); return; }
  // A gym picked by name is shown even if the current filters hide it.
  if(!appState.filtered.includes(g)){ resetFilters(); filtersChanged({push: true}); }
  select(id, {fly: true});
}

function onText(text){
  if(!isExplore()) navigate(exploreUrl());
  setTextFilter(text);
  setPlaceFilter(null);
  applyFilters();
  const hits = appState.filtered;
  if(hits.length && hits.length <= 500){
    const lngs = hits.map(g => g.lng), lats = hits.map(g => g.lat);
    const w = Math.min(...lngs), e = Math.max(...lngs);
    if(e - w < 180) map.fitBounds([[w, Math.min(...lats)], [e, Math.max(...lats)]], {padding: 48, maxZoom: 13, duration: motion(1200)});
  }
  filtersChanged({push: true});
  if(isSheetMode()){ freshSearch = true; setSnap('half'); }
}

function onMarksChanged(id){
  if(appState.showBookmarkedOnly || appState.showClimbedOnly){ filtersChanged({write: false}); }
  else { updateRowMarks(id); refreshPin(id); }
  if(appState.selectedId === id) renderPeek();
  refreshPage();
}

// ----- search as I move -------------------------------------------------------------------------------------------
function setSearchAsMove(on){
  appState.searchAsMove = on;
  $('searchAsMove').setAttribute('aria-pressed', String(on));
  if(on){ appState.scopeBounds = viewBounds(); movedSinceScope = false; refreshList(); }
  $('searchThisArea').hidden = on || !movedSinceScope;
}

let moveTimer = null;
function onMoveEnd(){
  clearTimeout(moveTimer);
  moveTimer = setTimeout(()=>{
    if(appState.searchAsMove) appState.scopeBounds = viewBounds();
    else { movedSinceScope = true; $('searchThisArea').hidden = false; }
    refreshList();
    if(urlApplied){ saveCamera(); writeUrl(); }   // never before the URL's own filters have been read
  }, 150);
}

// ----- layout slots: the search field and chip row sit in the top bar / list pane on desktop, over the map below 1024 --
function placeControls(){
  const small = window.matchMedia(SHEET_QUERY).matches;
  $(small ? 'mapSearchSlot' : 'topbarSearchSlot').appendChild($('search'));
  $(small ? 'mapFilterSlot' : 'listFilterSlot').appendChild($('filterBar'));
  if(!small) hideCarousel();
  renderPeek();
}

// ----- nav entry points (nav.js) ----------------------------------------------------------------------------------
export function showExplore(){ closeSearch(); if(!isExplore()) navigate(exploreUrl()); if(isSheetMode()) setSnap('half'); }

export function initExplore(){
  showSkeleton();
  initList({
    onGymAction: gymAction, onListAction: listAction, onHover: setHover,
    onSortChange: refreshList, onCarouselSelect: id => select(id, {details: false}),
    onFlyTo: t => map.flyTo({center: t.center, zoom: t.zoom, duration: motion(1500)}),
    cardsFirst: () => (isSheetMode() && freshSearch && appState.listView === 'rows') ? 4 : 0,
  });
  initFilters({onChange: filtersChanged});
  initSearch({onPlace, onGym, onText});
  initSheet();
  setMarksListener(onMarksChanged);
  setMapHandlers({
    onPinClick(id){
      if(isSheetMode()){ select(id, {details: false}); showCarousel([id]); }
      else select(id, {details: true});
    },
    onPinHover: setHover,
    onMapClick(){ if(appState.selectedId || appState.carouselIds.length) clearSelection(); },
    onClusterClick({clusterId, lngLat}){
      map.easeTo({center: lngLat, zoom: clusterExpansionZoom(clusterId), duration: motion(500)});
      if(isSheetMode()) showCarousel(clusterLeafIds(clusterId, 20));
    },
    onLocate(loc){
      appState.userLocation = loc;                       // the default sort becomes distance (list.js effectiveSort)
      refreshList();
      if(appState.selectedId) renderPeek();
    },
    onLocateError(){ showToast('Location unavailable — sorting by name'); },
  });
  map.on('moveend', onMoveEnd);
  map.on('dragstart', ()=>{ freshSearch = false; });
  $('peek').addEventListener('click', (e)=>{
    const act = e.target.closest('[data-gym-action]');
    if(act) gymAction(act.dataset.gymAction, act.dataset.spotId);
  });
  $('searchAsMove').addEventListener('click', ()=> setSearchAsMove(!appState.searchAsMove));
  $('searchThisArea').addEventListener('click', ()=>{
    appState.scopeBounds = viewBounds();
    movedSinceScope = false;
    $('searchThisArea').hidden = true;
    refreshList();
  });
  // Back/forward are routed by router.js; Explore restores its query state whenever it is (re)entered.
  registerView('explore', { enter(params, container, {returning, initial}){
    if(initial) return;
    if(returning) map.resize();                // the map was hidden (0 x 0) while a page showed
    onPopState();
  } });
  // The skip link targets the list on Explore and the page itself elsewhere (<base href> would turn #id into a reload).
  document.querySelector('.skip-link').addEventListener('click', (e)=>{ e.preventDefault(); (isExplore() ? $('gymList') : $('view')).focus(); });
  // Escape closes the topmost layer only: dialogs (modals.js) and search handle it first and mark it.
  document.addEventListener('keydown', (e)=>{
    if(e.key !== 'Escape' || e.defaultPrevented) return;
    if(!isExplore() || document.querySelector('.modal-backdrop:not(.hidden)') || isSearchOpen()) return;
    if(appState.selectedId || appState.carouselIds.length){ e.preventDefault(); closePeek(); }
  });
  // <img> error events don't bubble: a capture-phase listener hides a broken photo so the boulder placeholder shows.
  document.addEventListener('error', (e)=>{
    if(e.target && e.target.matches && e.target.matches('img.gym-photo')) e.target.classList.add('is-broken');
  }, true);
  window.matchMedia(SHEET_QUERY).addEventListener('change', placeControls);
  placeControls();
}
