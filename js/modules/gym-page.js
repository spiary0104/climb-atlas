// Gym page /gym/{slug} (DESIGN.md sec. 8): header with breadcrumb, meta, provenance and actions; optional 16:9 hero;
// Essentials (address + static map); Your history here; About; Nearby; Community. Sections without data do not render.
// Markup is built by page-html.js (pure); this module finds the gym, gathers the per-user context and handles actions.
import { COUNTRY_LABELS } from './constants.js';
import { distanceKm, encodeExploreState, formatDistance } from './geo.js';
import { loadGymProvenance, loadMyEditFor } from './community.js';
import { loadSessions } from './logbook.js';
import { destroyMiniMaps, mountMiniMaps } from './mini-map.js';
import { stateLabel } from './map.js';
import { toggleMark } from './marks.js';
import { setVerified } from './moderation.js';
import { openEditModal, openReportModal } from './modals.js';
import { gymPageHtml, notFoundHtml, pageSkeletonHtml } from './page-html.js';
import { refreshPage, registerView, setPageTitle } from './router.js';
import { provenanceLine } from './provenance.js';
import { cityPath, countryPath, gymPath, regionPath } from './slug.js';
import { appState } from './state.js';

const NEARBY_KM = 25;

const regionOf = g => stateLabel(g.country, g.state);
const distanceFor = g => appState.userLocation ? formatDistance(distanceKm(appState.userLocation, g)) : '';

export function findGym(slug){
  return appState.bySlug.get(slug) || appState.spots.find(s => s.id === slug) || null;
}

// Breadcrumb Country > Region > City; countries the map does not know (free-text "Other" submissions) get no link.
export function placeCrumbs(g){
  const known = !!COUNTRY_LABELS[g.country];
  return [
    { label: COUNTRY_LABELS[g.country] || g.country, href: known ? countryPath(g.country) : null },
    { label: regionOf(g), href: known ? regionPath(g.country, g.state) : null },
    { label: g.suburb, href: known && g.suburb ? cityPath(g.country, g.state, g.suburb) : null },
  ].filter(c => c.label);
}

function nearbyOf(g){
  return appState.spots
    .filter(o => o.id !== g.id && o.country === g.country)
    .map(o => ({ o, d: distanceKm(g, o) }))
    .filter(x => x.d <= NEARBY_KM)
    .sort((a, b) => a.d - b.d)
    .slice(0, 4)
    .map(({ o, d }) => ({ g: o, ctx: { region: regionOf(o), href: gymPath(o), distance: formatDistance(d) + ' away' } }));
}

function historyOf(g){
  if(!window.auth.user) return null;
  const here = (appState.sessions || []).filter(s => s.spot_id === g.id);
  return here.length ? { count: here.length, last: here[0].session_date } : null;
}

function enter({ slug }, view){
  destroyMiniMaps();
  if(!appState.loaded){ view.innerHTML = pageSkeletonHtml(); setPageTitle('Loading'); return; }
  const g = findGym(slug);
  if(!g){ view.innerHTML = notFoundHtml('gym'); setPageTitle('Gym not found'); return; }
  // An id or an outdated URL resolves to the canonical slug without adding a history entry.
  if(g.slug && slug !== g.slug) history.replaceState(null, '', gymPath(g));
  view.innerHTML = gymPageHtml(g, {
    crumbs: placeCrumbs(g),
    region: regionOf(g),
    country: COUNTRY_LABELS[g.country] || g.country,
    distance: distanceFor(g),
    saved: appState.bookmarkedIds.has(g.id),
    climbed: appState.climbedIds.has(g.id),
    history: historyOf(g),
    nearby: nearbyOf(g),
    exploreHref: '/?' + encodeExploreState({ camera: { lng: g.lng, lat: g.lat, zoom: 15 } }),
    provenance: provenanceLine(g, appState.provenanceCache.get(g.id) || { contributors: appState.contributorCounts.get(g.id) }),
    myEdit: appState.myEditCache.get(g.id) || null,
    isModerator: appState.isModerator,
  });
  setPageTitle([g.name, g.suburb].filter(Boolean).join(', '));
  mountMiniMaps(view);
  // Provenance (added by / contributors / last edited) and, for the signed-in editor, their own latest proposal.
  if(!appState.provenanceCache.has(g.id)) loadGymProvenance(g.id).then(refreshPage);
  if(window.auth.user && !appState.myEditCache.has(g.id)) loadMyEditFor(g.id).then(refreshPage);
  // Signed-in: fetch the logbook once so "Your history here" can appear.
  if(window.auth.user && !appState.sessionsLoaded){
    appState.sessionsLoaded = true;
    loadSessions().then(refreshPage);
  }
}

export function initGymPage(){
  registerView('gym', { enter, leave: destroyMiniMaps });
  registerView('notfound', { enter(params, view){ view.innerHTML = notFoundHtml(); setPageTitle('Page not found'); } });
  document.getElementById('view').addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-page-action]');
    if(!btn) return;
    const id = btn.dataset.spotId;
    switch(btn.dataset.pageAction){
      case 'save': toggleMark(id, 'bookmarked'); break;
      case 'climbed': toggleMark(id, 'climbed'); break;
      case 'edit': openEditModal(id); break;
      case 'report': openReportModal(id); break;
      case 'verify': setVerified(id, true); break;
      case 'unverify': setVerified(id, false); break;
    }
  });
}
