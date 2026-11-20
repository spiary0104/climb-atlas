// Sign-in widget + sign-in modal (the auth session itself is window.auth, js/auth.js).
import { t, th } from './i18n.js';
import { appState } from './state.js';
import { showToast } from './utils.js';

// --- auth UI ---
const accountSlot = document.getElementById('accountSlot');
const authModalBackdrop = document.getElementById('authModalBackdrop');
const authStatus = document.getElementById('authStatus');
const authEmailInput = document.getElementById('authEmail');

// Signed in: the default avatar (the deer head) opens /me. Signed out: a "Sign in" text button (sec. 6.4).
export function renderAuthUI(user){
  accountSlot.innerHTML = user
    ? `<button type="button" class="avatar-btn" data-nav="me" aria-label="${th('auth.avatarAria')}"><span class="avatar mascot mascot--avatar" aria-hidden="true"><img src="assets/mascot/head.svg" alt=""></span></button>`
    : `<button type="button" class="btn btn-tertiary" id="topSignInBtn">${th('auth.signIn')}</button>`;
  updateMarksFilterAvailability();
}

// Saved/Climbed filters need an account: signing out switches them off (the chip row re-renders from appState on the
// render() that follows every auth change; tapping those chips while signed out opens sign-in, filters.js).
function updateMarksFilterAvailability(){
  if(!window.auth.user){ appState.showClimbedOnly = false; appState.showBookmarkedOnly = false; }
}

export function openAuthModal(){
  if(!window.sb){ showToast(t('common.notConfigured')); return; }
  authStatus.textContent = '';
  authStatus.className = 'auth-status';
  authEmailInput.value = '';
  authModalBackdrop.classList.remove('hidden');
}
export function closeAuthModal(){
  authModalBackdrop.classList.add('hidden');
}

export function initAuthUI(){
  accountSlot.addEventListener('click', (e)=>{ if(e.target.closest('#topSignInBtn')) openAuthModal(); });
  document.getElementById('authCancelBtn').addEventListener('click', closeAuthModal);
  authModalBackdrop.addEventListener('click', (e)=>{
    if(e.target === authModalBackdrop) closeAuthModal();
  });

  document.getElementById('googleSignInBtn').addEventListener('click', async ()=>{
    try{
      await window.auth.signInWithGoogle();
    }catch(err){
      authStatus.textContent = t('auth.googleFailed');
      authStatus.className = 'auth-status err';
      console.error(err);
    }
  });

  document.getElementById('sendMagicLinkBtn').addEventListener('click', async ()=>{
    const email = authEmailInput.value.trim();
    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      authStatus.textContent = email ? t('auth.badEmail') : t('auth.enterEmail');
      authStatus.className = 'auth-status err';
      authEmailInput.setAttribute('aria-invalid', 'true');
      authEmailInput.focus();
      return;
    }
    authEmailInput.removeAttribute('aria-invalid');
    const btn = document.getElementById('sendMagicLinkBtn');
    btn.disabled = true;
    try{
      await window.auth.signInWithEmail(email);
      authStatus.textContent = t('auth.checkEmail');
      authStatus.className = 'auth-status ok';
    }catch(err){
      authStatus.textContent = t('auth.sendFailed');
      authStatus.className = 'auth-status err';
      console.error(err);
    }
    btn.disabled = false;
  });
}
