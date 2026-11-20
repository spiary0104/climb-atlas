// Bouldeer entry point (ES module). Loaded after the classic scripts
// supabase-init.js (window.sb) and auth.js (window.auth).
import { closeAuthModal, initAuthUI, renderAuthUI } from './modules/auth-ui.js';
import { loadContributorCounts } from './modules/community.js';
import { checkModerator, loadMarks, loadPending, loadSpots } from './modules/data-load.js';
import { applyLanding, initExplore, render } from './modules/explore.js';
import { initGymPage } from './modules/gym-page.js';
import { initLogbook } from './modules/logbook.js';
import { initMap, startMap } from './modules/map.js';
import { initForms, initModalKeyboard } from './modules/modals.js';
import { initModeration, renderPendingBadge } from './modules/moderation.js';
import { initLogPage } from './modules/log-page.js';
import { initMePage } from './modules/me-page.js';
import { initModPage } from './modules/mod-page.js';
import { initAddPage } from './modules/add-page.js';
import { initCheckin } from './modules/checkin.js';
import { initMilestoneSheet } from './modules/milestone-sheet.js';
import { initPassportPage } from './modules/passport-page.js';
import { initNavigation } from './modules/nav.js';
import { initRegionPages } from './modules/region-page.js';
import { initRouter, refreshPage } from './modules/router.js';
import { currentLocale, initI18n, setLocale, t } from './modules/i18n.js';
import { appState } from './modules/state.js';
import { showActionToast } from './modules/utils.js';

// sw-register.js (a classic script) announces a newer service worker; the person chooses when to reload, never us.
window.addEventListener('bouldeer:sw-updated', () => {
  showActionToast(t('sw.updated'), t('sw.refresh'), () => location.reload());
});

// Interface language before anything renders (English needs no fetch). A picker change switches in place: the open
// page and the Explore list re-render, while the URL, map camera, filters and selection stay exactly as they were.
await initI18n();
const syncLangPickers = () => { for(const s of document.querySelectorAll('select[data-lang-picker]')) s.value = currentLocale(); };
syncLangPickers();
document.addEventListener('change', (e) => {
  const s = e.target && e.target.closest ? e.target.closest('select[data-lang-picker]') : null;
  if(!s || s.value === currentLocale()) return;
  const inPage = !!s.closest('#view');
  // the /me page re-renders: give keyboard focus back to its (new) picker
  setLocale(s.value, { manual: true }).then(() => { if(inPage){ const n = document.querySelector('#view select[data-lang-picker]'); if(n) n.focus(); } });
});
window.addEventListener('bouldeer:locale', () => {
  syncLangPickers();
  const banner = document.getElementById('offlineBanner');
  if(appState.usingFallback && banner) banner.textContent = t('explore.offline');
  renderAuthUI(window.auth && window.auth.user);
  if(appState.loaded) render();
  refreshPage();
});

// Wire up each area. The list shows skeleton rows until the first load finishes.
initMap();
initModalKeyboard();
initAuthUI();
initForms();
initLogbook();
initModeration();
initExplore();
initGymPage();
initRegionPages();
initLogPage();
initMePage();
initModPage();
initAddPage();
initCheckin();
initMilestoneSheet();
initPassportPage();
initNavigation();
initRouter();          // after every view has registered: renders the page for the URL (a skeleton until data arrives)

async function init(){
  await window.auth.init();
  window.auth.onChange(async (user)=>{
    appState.sessionsLoaded = false;   // the gym page refetches the logbook for whoever is signed in now
    appState.checkinsLoaded = false; appState.checkins = [];   // and the passport / check-in state
    appState.myEditCache.clear();
    appState.myCommunity = null;
    renderAuthUI(user);
    await loadMarks();
    await checkModerator();
    await loadPending();
    renderPendingBadge();
    render();
    if(user) closeAuthModal();
  });
  // MapLibre (270 KB) loads after the first render, so on a slow phone it doesn't compete with the gym rows or the list.
  // A slow or failing read must not hold the map back: after 4 s it starts anyway.
  const mapTimer = setTimeout(startMap, 4000);
  await loadSpots();
  // The rows are usually here already (js/spots-prefetch.js): yield once so the shell paints before the first full
  // render instead of both running as one long task.
  await new Promise(resolve => setTimeout(resolve));
  appState.loaded = true;
  applyLanding();
  render();                                    // list (and pins, once the map is there) as soon as the gyms are in
  clearTimeout(mapTimer);
  startMap();
  const counts = loadContributorCounts();      // in parallel with the signed-in reads below
  await loadMarks();
  await checkModerator();
  await loadPending();
  await counts;
  renderAuthUI(window.auth.user);
  renderPendingBadge();
  // The page is already showing; render it again only when these reads can change it: signed-in marks/history/moderator
  // controls, or the contributor counts behind this gym's provenance mark (a re-render also rebuilds the mini map).
  const shown = document.querySelector('#view .gym-page [data-spot-id]');
  render({ page: !!window.auth.user || !shown || appState.contributorCounts.has(shown.dataset.spotId) });
  if(appState.usingFallback){
    // The text lives here, not in the static shell: a crawler or reader mode must never pick up a warning that is not true.
    const banner = document.getElementById('offlineBanner');
    banner.textContent = t('explore.offline');
    banner.classList.remove('hidden');
  }
}

init();
