// /me, /me/saved, /me/climbed (DESIGN.md sec. 6.1): the account area as a page, replacing the Me menu. Saved and Climbed
// gyms as dense rows linking to their pages; Add a gym, Pending review (moderators), Sign out; About / Privacy / Terms.
// No email address is shown (sec. 18 Provenance: "no email addresses visible anywhere").
import { t } from './i18n.js';
import { openAuthModal } from './auth-ui.js';
import { loadMyCommunity, saveDisplayName } from './community.js';
import { displayNameSaveMessage, isContributor, isMissingTable, levelFor, validDisplayName } from './provenance.js';
import { stateLabel } from './map.js';
import { startAddGym } from './modals.js';
import { mePageHtml, pageSkeletonHtml } from './page-html.js';
import { currentRoute, navigate, refreshPage, registerView, setPageTitle } from './router.js';
import { gymPath } from './slug.js';
import { appState } from './state.js';
import { showToast, clearDeviceData } from './utils.js';

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
  if(!window.auth.user){ setPageTitle(t('me.title')); view.innerHTML = mePageHtml({ signedIn: false }); return; }
  if(!appState.loaded){ setPageTitle(t('me.title')); view.innerHTML = pageSkeletonHtml(); return; }
  setPageTitle(t(section === 'climbed' ? 'me.climbed' : 'me.saved'));
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
      hint.textContent = t('me.nameInvalid');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    try{
      await saveDisplayName(name);
      if(appState.myCommunity) appState.myCommunity.displayName = name;
      appState.provenanceCache.clear();             // "added by" lines pick up the new name
      showToast(t('me.nameSaved'));
      refreshPage();
    }catch(err){
      hint.textContent = displayNameSaveMessage(err);      // the real reason, not always "try again"
      if(isMissingTable(err) && appState.myCommunity){ appState.myCommunity.profilesAvailable = false; refreshPage(); }
      else console.error(err);
    }
  });
  document.getElementById('view').addEventListener('click', (e)=>{
    if(!currentRoute() || currentRoute().name !== 'me') return;
    const btn = e.target.closest('[data-page-action]');
    if(!btn) return;
    switch(btn.dataset.pageAction){
      case 'sign-in': openAuthModal(); break;
      case 'sign-out': window.auth.signOut(); showToast(t('me.signedOut')); break;
      case 'add-gym': startAddGym(); break;
      case 'delete-account': deleteAccount(btn); break;
    }
  });
  document.getElementById('view').addEventListener('change', (e)=>{
    const box = e.target.closest('[data-delete-confirm]');
    const btn = document.querySelector('[data-page-action="delete-account"]');
    if(box && btn) btn.disabled = !box.checked;
  });
}

// The Edge Function (supabase/functions/delete-account) deletes the caller's own auth user with the service role; the
// database foreign keys remove the personal data and unlink submissions. Then this device signs out locally (the
// server-side session is already gone with the user).
async function deleteAccount(btn){
  const box = document.querySelector('[data-delete-confirm]'), hint = document.getElementById('deleteHint');
  if(!box || !box.checked || !window.sb || !window.auth.user) return;
  btn.disabled = true; box.disabled = true;
  if(hint) hint.textContent = t('me.deleting');
  try{
    const { data, error } = await window.sb.functions.invoke('delete-account', { method: 'POST' });
    if(error || !data || !data.deleted) throw error || new Error('not deleted');
  }catch(err){
    console.error('[delete-account]', err);
    if(hint) hint.textContent = t('me.deleteFailed');
    btn.disabled = false; box.disabled = false;
    return;
  }
  try{ await window.sb.auth.signOut({ scope: 'local' }); }catch(e){ /* the account is gone either way */ }
  clearDeviceData(window.localStorage, window.sessionStorage);
  showToast(t('me.deleted'));
  navigate('/');
}
