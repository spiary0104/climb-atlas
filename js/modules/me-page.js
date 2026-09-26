// /me, /me/saved, /me/climbed (DESIGN.md sec. 6.1): the account area as a page, replacing the Me menu. Saved and Climbed
// gyms as dense rows linking to their pages; Add a gym, Pending review (moderators), Sign out; About / Privacy / Terms.
// No email address is shown (sec. 18 Provenance: "no email addresses visible anywhere").
import { openAuthModal } from './auth-ui.js';
import { stateLabel } from './map.js';
import { openPendingModal } from './moderation.js';
import { startAddGym } from './modals.js';
import { mePageHtml, pageSkeletonHtml } from './page-html.js';
import { currentRoute, registerView, setPageTitle } from './router.js';
import { gymPath } from './slug.js';
import { appState } from './state.js';
import { showToast } from './utils.js';

function gymsFor(ids){
  const byId = new Map(appState.spots.map(g => [g.id, g]));
  return [...ids].map(id => byId.get(id)).filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(g => ({ g, ctx: { region: stateLabel(g.country, g.state), href: gymPath(g) } }));
}

function enter({ section }, view){
  if(!window.auth.user){ setPageTitle('Me'); view.innerHTML = mePageHtml({ signedIn: false }); return; }
  if(!appState.loaded){ setPageTitle('Me'); view.innerHTML = pageSkeletonHtml(); return; }
  setPageTitle(section === 'climbed' ? 'Climbed' : 'Saved');
  view.innerHTML = mePageHtml({
    signedIn: true, section,
    saved: gymsFor(appState.bookmarkedIds), climbed: gymsFor(appState.climbedIds),
    isModerator: appState.isModerator,
    pendingCount: appState.pendingSpots.length + appState.pendingEdits.length + appState.pendingReports.length,
  });
}

export function initMePage(){
  registerView('me', { enter });
  document.getElementById('view').addEventListener('click', (e)=>{
    if(!currentRoute() || currentRoute().name !== 'me') return;
    const btn = e.target.closest('[data-page-action]');
    if(!btn) return;
    switch(btn.dataset.pageAction){
      case 'sign-in': openAuthModal(); break;
      case 'sign-out': window.auth.signOut(); showToast('Signed out'); break;
      case 'add-gym': startAddGym(); break;
      case 'pending': openPendingModal(); break;
      // Privacy/Terms dialogs are opened by their existing controls (modals.js initInfoModals), kept in the list footer.
      case 'privacy': document.getElementById('openPrivacy').click(); break;
      case 'terms': document.getElementById('openTerms').click(); break;
    }
  });
}
