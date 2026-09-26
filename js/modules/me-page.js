// /me, /me/saved, /me/climbed (DESIGN.md sec. 6.1): the account area as a page, replacing the Me menu. Saved and Climbed
// gyms as dense rows linking to their pages; Add a gym, Pending review (moderators), Sign out; About / Privacy / Terms.
// No email address is shown (sec. 18 Provenance: "no email addresses visible anywhere").
import { openAuthModal } from './auth-ui.js';
import { loadMyCommunity, saveDisplayName } from './community.js';
import { isContributor, levelFor, validDisplayName } from './provenance.js';
import { stateLabel } from './map.js';
import { startAddGym } from './modals.js';
import { mePageHtml, pageSkeletonHtml } from './page-html.js';
import { currentRoute, refreshPage, registerView, setPageTitle } from './router.js';
import { gymPath } from './slug.js';
import { appState } from './state.js';
import { showToast } from './utils.js';

function gymsFor(ids){
  const byId = new Map(appState.spots.map(g => [g.id, g]));
  return [...ids].map(id => byId.get(id)).filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(g => ({ g, ctx: { region: stateLabel(g.country, g.state), href: gymPath(g) } }));
}

let loadingCommunity = false;
function communityCtx(){
  const c = appState.myCommunity;
  return c ? { ...c, level: levelFor(c.points), contributor: isContributor(c.points) } : null;
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
    community: communityCtx(),
  });
  if(!appState.myCommunity && !loadingCommunity){
    loadingCommunity = true;
    loadMyCommunity().then(c => { appState.myCommunity = c; loadingCommunity = false; refreshPage(); });
  }
}

export function initMePage(){
  registerView('me', { enter });
  document.getElementById('view').addEventListener('submit', async (e)=>{
    const form = e.target.closest('[data-page-form="display-name"]');
    if(!form) return;
    e.preventDefault();
    const input = form.querySelector('#displayName'), hint = form.querySelector('#displayNameHint');
    const name = input.value.trim();
    if(!validDisplayName(name)){
      input.setAttribute('aria-invalid', 'true');
      hint.textContent = 'Use 2 to 40 characters, without @ or < >.';
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    try{
      await saveDisplayName(name);
      if(appState.myCommunity) appState.myCommunity.displayName = name;
      appState.provenanceCache.clear();             // "added by" lines pick up the new name
      showToast('Display name saved');
      refreshPage();
    }catch(err){
      hint.textContent = 'Could not save — try again.';
      console.error(err);
    }
  });
  document.getElementById('view').addEventListener('click', (e)=>{
    if(!currentRoute() || currentRoute().name !== 'me') return;
    const btn = e.target.closest('[data-page-action]');
    if(!btn) return;
    switch(btn.dataset.pageAction){
      case 'sign-in': openAuthModal(); break;
      case 'sign-out': window.auth.signOut(); showToast('Signed out'); break;
      case 'add-gym': startAddGym(); break;
      // Privacy/Terms dialogs are opened by their existing controls (modals.js initInfoModals), kept in the list footer.
      case 'privacy': document.getElementById('openPrivacy').click(); break;
      case 'terms': document.getElementById('openTerms').click(); break;
    }
  });
}
