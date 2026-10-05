// Gym page /gym/{slug} (DESIGN.md sec. 8): header with breadcrumb, meta, provenance and actions; optional 16:9 hero;
// Essentials (address + static map); Your history here; About; Nearby; Community. Sections without data do not render.
// Markup is built by page-html.js (pure); this module finds the gym, gathers the per-user context and handles actions.
import { COUNTRY_LABELS } from './constants.js';
import { loadFullSpot } from './data-load.js';
import { distanceKm, encodeExploreState, formatDistance } from './geo.js';
import { checkedInRecently, loadCheckins, startCheckin } from './checkin.js';
import { loadGymProvenance, loadMyEditFor } from './community.js';
import { loadSessions } from './logbook.js';
import { destroyMiniMaps, mountMiniMaps } from './mini-map.js';
import { stateLabel } from './map.js';
import { metroOf, metrosForRegion } from './metros.js';
import { toggleMark } from './marks.js';
import { setVerified } from './moderation.js';
import { openEditModal, openReportModal } from './modals.js';
import { gymPageHtml, notFoundHtml, pageSkeletonHtml } from './page-html.js';
import { gymDayKey, status } from './hours.js';
import { currentRoute, refreshPage, registerView, setPageTitle } from './router.js';
import { provenanceLine, publicNotes } from './provenance.js';
import { gymSeo } from './seo-meta.js';
import { gymShareText, sharePlace } from './share.js';
import { cityPath, countryPath, gymPath, metroPath, regionPath } from './slug.js';
import { appState } from './state.js';

const NEARBY_KM = 25;

const regionOf = g => stateLabel(g.country, g.state);
const distanceFor = g => appState.userLocation ? formatDistance(distanceKm(appState.userLocation, g)) : '';

export function findGym(slug){
  return appState.bySlug.get(slug) || appState.spots.find(s => s.id === slug) || null;
}

// Breadcrumb Country > Region > Metro when the gym's region page lists that metro (its core region, or a neighbour with 2+
// of its gyms: Japan > Kanagawa > Tokyo), otherwise Country > Region > Suburb. Countries the map does not know (free-text
// "Other" submissions) get no link.
export function placeCrumbs(g){
  const known = !!COUNTRY_LABELS[g.country];
  const metro = known ? metroOf(g) : null;
  const inCore = !!metro && (metro.state === g.state || metrosForRegion(appState.spots, g.country, g.state).some(x => x.metro === metro));
  return [
    { label: COUNTRY_LABELS[g.country] || g.country, href: known ? countryPath(g.country) : null },
    { label: regionOf(g), href: known ? regionPath(g.country, g.state) : null },
    inCore ? { label: metro.name, href: metroPath(metro) }
      : { label: g.suburb, href: known && g.suburb ? cityPath(g.country, g.state, g.suburb) : null },
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

// "All 22 gyms in Sydney": the gym's metro page and how many gyms it lists, counted with the metro page's own rule
// (region-page.js metroView: same country, metroOf === metro) so the number on the link is the number on the page.
// Null when the gym is in no metro or is the metro's only gym. Uses the gyms already loaded; no extra read.
function metroLinkOf(g){
  const metro = COUNTRY_LABELS[g.country] ? metroOf(g) : null;
  if(!metro) return null;
  let total = 0;
  for(const o of appState.spots) if(o.country === metro.country && metroOf(o) === metro) total++;
  return total >= 2 ? { name: metro.name, total, href: metroPath(metro) } : null;
}

function historyOf(g){
  if(!window.auth.user) return null;
  const here = (appState.sessions || []).filter(s => s.spot_id === g.id);
  return here.length ? { count: here.length, last: here[0].session_date } : null;
}

// What the gym page shows from columns outside the Explore list read (gym-info.js, publicNotes): compared before/after.
// Essentials "Today" line: the gym's own weekday (when its time zone is known) and an Open / Closed word when its hours are readable.
function hoursContext(g){
  const st = status(g);
  return { today: gymDayKey(g) || undefined, hoursStatus: st.state === 'unknown' ? null : st.state };
}
const visibleInfo = g => JSON.stringify([g.description || '', g.website || '', g.hours || null, g.day_pass || '', g.facilities || [], publicNotes(g.notes)]);

// Late reads re-render only while this gym's page is still the one showing: a person who has moved on to another page
// (Nearby, Back, /add) must not have it torn down under them. The reads are batched so the page re-renders once, not four
// times (each render rebuilds the mini map).
function refreshIfShowing(g){
  const r = currentRoute();
  if(r && r.name === 'gym' && findGym(r.params.slug) === g) refreshPage();
}

function enter({ slug }, view){
  destroyMiniMaps();
  if(!appState.loaded){ view.innerHTML = pageSkeletonHtml(); setPageTitle('Loading'); return; }
  const g = findGym(slug);
  if(!g){ view.innerHTML = notFoundHtml('gym'); setPageTitle('Gym not found'); return; }
  // An id or an outdated URL resolves to the canonical slug without adding a history entry.
  if(g.slug && slug !== g.slug) history.replaceState(null, '', gymPath(g));
  // The list read carries only Explore's columns: fetch the whole row once, then re-render if this page is still showing.
  // Re-render only when the whole row adds something the page shows (a re-render also rebuilds the mini map, measurable on
  // phones); for most gyms the list columns already hold everything visible.
  if(!g._full){
    const before = visibleInfo(g);
    loadFullSpot(g).then(full => { if(full._full && visibleInfo(full) !== before) refreshIfShowing(g); });
  }
  view.innerHTML = gymPageHtml(g, {
    crumbs: placeCrumbs(g),
    region: regionOf(g),
    country: COUNTRY_LABELS[g.country] || g.country,
    distance: distanceFor(g),
    saved: appState.bookmarkedIds.has(g.id),
    climbed: appState.climbedIds.has(g.id),
    history: historyOf(g),
    nearby: nearbyOf(g),
    metroLink: metroLinkOf(g),
    exploreHref: '/?' + encodeExploreState({ camera: { lng: g.lng, lat: g.lat, zoom: 15 } }),
    provenance: provenanceLine(g, appState.provenanceCache.get(g.id) || { contributors: appState.contributorCounts.get(g.id) }),
    myEdit: appState.myEditCache.get(g.id) || null,
    isModerator: appState.isModerator,
    checkedIn: !!window.auth.user && checkedInRecently(g.id),
    hours: hoursContext(g),
  });
  setPageTitle(gymSeo(g, { region: regionOf(g), country: COUNTRY_LABELS[g.country] || g.country }).title);
  mountMiniMaps(view);
  // Provenance (added by / contributors / last edited) and, for the signed-in editor, their own latest proposal.
  const late = [];
  if(!appState.provenanceCache.has(g.id)) late.push(loadGymProvenance(g.id));
  if(window.auth.user && !appState.myEditCache.has(g.id)) late.push(loadMyEditFor(g.id));
  // Signed-in: fetch the check-ins once so the action reads "Checked in today" when it should.
  if(window.auth.user && !appState.checkinsLoaded) late.push(loadCheckins());
  // Signed-in: fetch the logbook once so "Your history here" can appear.
  if(window.auth.user && !appState.sessionsLoaded){
    appState.sessionsLoaded = true;
    late.push(loadSessions());
  }
  if(late.length) Promise.allSettled(late).then(() => refreshIfShowing(g));
}

export function initGymPage(){
  registerView('gym', { enter, leave: destroyMiniMaps });
  registerView('notfound', { enter(params, view){ view.innerHTML = notFoundHtml(); setPageTitle('Page not found'); } });
  document.getElementById('view').addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-page-action]');
    if(!btn) return;
    const id = btn.dataset.spotId;
    switch(btn.dataset.pageAction){
      case 'checkin': startCheckin(id); break;
      case 'save': toggleMark(id, 'bookmarked'); break;
      case 'climbed': toggleMark(id, 'climbed'); break;
      case 'edit': openEditModal(id, { focus: btn.dataset.editFocus || '' }); break;
      case 'report': openReportModal(id); break;
      case 'share': {   // the gym is already loaded: no extra read; Web Share, else copy the link (share.js)
        const g = appState.spots.find(s => s.id === id);
        if(g) sharePlace(gymShareText(g, { region: regionOf(g) }));
        break;
      }
      case 'verify': setVerified(id, true); break;
      case 'unverify': setVerified(id, false); break;
    }
  });
}
