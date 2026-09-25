// Sign-in widget + sign-in modal (the auth session itself is window.auth, js/auth.js).
import { appState } from './state.js';
import { escapeHtml, showToast } from './utils.js';

// --- auth UI ---
const authWidget = document.getElementById('authWidget');
const accountSlot = document.getElementById('accountSlot');
const meAccount = document.getElementById('meAccount');
const authModalBackdrop = document.getElementById('authModalBackdrop');
const authStatus = document.getElementById('authStatus');
const authEmailInput = document.getElementById('authEmail');

export function renderAuthUI(user){
  authWidget.innerHTML = user
    ? '<button type="button" class="btn btn-tertiary" id="signOutBtn">Sign out</button>'
    : '<button type="button" class="btn btn-tertiary" id="signInBtn">Sign in</button>';
  meAccount.textContent = user ? `Signed in as ${user.email || 'you'}` : 'Not signed in';
  const initial = ((user && user.email) || '?').trim().charAt(0).toUpperCase() || '?';
  accountSlot.innerHTML = user
    ? `<button type="button" class="avatar-btn" data-nav="me" aria-controls="meMenu" aria-expanded="false" aria-label="Account menu"><span class="avatar" aria-hidden="true">${escapeHtml(initial)}</span></button>`
    : '<button type="button" class="btn btn-tertiary" id="topSignInBtn">Sign in</button>';
  updateMarksFilterAvailability();
}

function updateMarksFilterAvailability(){
  const signedIn = !!window.auth.user;
  const climbedFilter = document.getElementById('filterClimbed');
  const bookmarkedFilter = document.getElementById('filterBookmarked');
  [climbedFilter, bookmarkedFilter].forEach(el=>{
    if(!el) return;
    el.disabled = !signedIn;
    if(!signedIn && el.checked) el.checked = false;
  });
  if(!signedIn){ appState.showClimbedOnly = false; appState.showBookmarkedOnly = false; }
}

export function openAuthModal(){
  if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
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
  authWidget.addEventListener('click', (e)=>{
    if(e.target.id === 'signInBtn') openAuthModal();
    else if(e.target.id === 'signOutBtn'){
      window.auth.signOut();
      showToast('Signed out');
    }
  });
  document.getElementById('authCancelBtn').addEventListener('click', closeAuthModal);
  authModalBackdrop.addEventListener('click', (e)=>{
    if(e.target === authModalBackdrop) closeAuthModal();
  });

  document.getElementById('googleSignInBtn').addEventListener('click', async ()=>{
    try{
      await window.auth.signInWithGoogle();
    }catch(err){
      authStatus.textContent = 'Could not start Google sign-in.';
      authStatus.className = 'auth-status err';
      console.error(err);
    }
  });

  document.getElementById('sendMagicLinkBtn').addEventListener('click', async ()=>{
    const email = authEmailInput.value.trim();
    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      authStatus.textContent = email ? 'That doesn’t look like an email address.' : 'Enter your email first.';
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
      authStatus.textContent = 'Check your email for a sign-in link.';
      authStatus.className = 'auth-status ok';
    }catch(err){
      authStatus.textContent = 'Could not send the link — try again.';
      authStatus.className = 'auth-status err';
      console.error(err);
    }
    btn.disabled = false;
  });
}
