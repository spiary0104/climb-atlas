// Climb Atlas entry point (ES module). Loaded after the classic scripts
// supabase-init.js (window.sb) and auth.js (window.auth).
import { closeAuthModal, initAuthUI, renderAuthUI } from './modules/auth-ui.js';
import { checkModerator, loadMarks, loadPending, loadSpots } from './modules/data-load.js';
import { initLogbook } from './modules/logbook.js';
import { initMap } from './modules/map.js';
import { initForms, initInfoModals, initModalKeyboard } from './modules/modals.js';
import { initModeration, renderPendingBadge } from './modules/moderation.js';
import { initSidebar, render } from './modules/sidebar.js';
import { appState } from './modules/state.js';

// Wire up each area in the same order the old single-file app.js did.
initMap();
initSidebar();
initModalKeyboard();
initAuthUI();
initForms();
initLogbook();
initModeration();
initInfoModals();

async function init(){
  // Accordion buttons expose their state; every group starts collapsed.
  document.querySelectorAll('.region-header, .country-label').forEach(b=>{
    b.setAttribute('aria-expanded', String(!b.parentElement.classList.contains('collapsed')));
  });
  // Placeholder rows while Supabase answers, so the panel isn't blank and
  // the count doesn't read "0" for the first second.
  document.getElementById('gymList').innerHTML = Array.from({length:6}, ()=>'<div class="skeleton-row" aria-hidden="true"><span></span><span></span></div>').join('');
  document.getElementById('countNum').textContent = '…';
  await window.auth.init();
  window.auth.onChange(async (user)=>{
    renderAuthUI(user);
    await loadMarks();
    await checkModerator();
    await loadPending();
    renderPendingBadge();
    render();
    if(user) closeAuthModal();
  });
  await loadSpots();
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
