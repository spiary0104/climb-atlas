// Bouldeer entry point (ES module). Loaded after the classic scripts
// supabase-init.js (window.sb) and auth.js (window.auth).
import { closeAuthModal, initAuthUI, renderAuthUI } from './modules/auth-ui.js';
import { checkModerator, loadMarks, loadPending, loadSpots } from './modules/data-load.js';
import { applyLanding, initExplore, render } from './modules/explore.js';
import { initGymPage } from './modules/gym-page.js';
import { initLogbook } from './modules/logbook.js';
import { initMap } from './modules/map.js';
import { initForms, initInfoModals, initModalKeyboard } from './modules/modals.js';
import { initModeration, renderPendingBadge } from './modules/moderation.js';
import { initNavigation } from './modules/nav.js';
import { initRouter } from './modules/router.js';
import { appState } from './modules/state.js';

// Wire up each area. The list shows skeleton rows until the first load finishes.
initMap();
initModalKeyboard();
initAuthUI();
initForms();
initLogbook();
initModeration();
initInfoModals();
initExplore();
initGymPage();
initNavigation();
initRouter();          // after every view has registered: renders the page for the URL (a skeleton until data arrives)

async function init(){
  await window.auth.init();
  window.auth.onChange(async (user)=>{
    appState.sessionsLoaded = false;   // the gym page refetches the logbook for whoever is signed in now
    renderAuthUI(user);
    await loadMarks();
    await checkModerator();
    await loadPending();
    renderPendingBadge();
    render();
    if(user) closeAuthModal();
  });
  await loadSpots();
  appState.loaded = true;
  applyLanding();
  await loadMarks();
  await checkModerator();
  await loadPending();
  renderAuthUI(window.auth.user);
  renderPendingBadge();
  render();
  if(appState.usingFallback){
    document.getElementById('offlineBanner').classList.remove('hidden');
  }
}

init();
