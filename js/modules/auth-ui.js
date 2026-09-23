// Sign-in widget + sign-in modal (the auth session itself is window.auth, js/auth.js).
import { appState } from './state.js';
import { escapeHtml, showToast } from './utils.js';

// --- auth UI ---
const authWidget = document.getElementById('authWidget');
const authModalBackdrop = document.getElementById('authModalBackdrop');
const authStatus = document.getElementById('authStatus');
const authEmailInput = document.getElementById('authEmail');

export function renderAuthUI(user){
  authWidget.innerHTML = user
    ? `<span class="auth-email" title="${escapeHtml(user.email||'')}">${escapeHtml(user.email||'Signed in')}</span><button class="btn btn-text" id="signOutBtn">Sign out</button>`
    : `<button class="btn btn-outline" id="signInBtn">Sign in</button>`;
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
