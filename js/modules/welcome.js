// The one-time welcome sheet after a new account's first sign-in (welcome-html.js holds the pure parts). Once per account
// on this device (localStorage). If storage cannot be read or written it stays away rather than risk showing every visit,
// and it never stacks on another open dialog (it simply waits for the next load).
import { navigate } from './router.js';
import { isNewAccount, welcomeHtml } from './welcome-html.js';

const KEY = 'bouldeer_welcomed_';

function seen(id){
  try{ return localStorage.getItem(KEY + id) === '1'; }catch(err){ return true; }
}
function markSeen(id){
  try{ localStorage.setItem(KEY + id, '1'); return true; }catch(err){ return false; }
}

export function maybeShowWelcome(user){
  if(!isNewAccount(user) || seen(user.id)) return false;
  if(document.querySelector('.modal-backdrop:not(.hidden)')) return false;
  if(!markSeen(user.id)) return false;
  document.getElementById('welcomeBody').innerHTML = welcomeHtml();
  document.getElementById('welcomeModalBackdrop').classList.remove('hidden');
  return true;
}

function close(){ document.getElementById('welcomeModalBackdrop').classList.add('hidden'); }

export function initWelcome(){
  const backdrop = document.getElementById('welcomeModalBackdrop');
  backdrop.addEventListener('click', (e) => {
    if(e.target === backdrop) return close();
    const btn = e.target.closest('[data-welcome-action]');
    if(!btn) return;
    close();
    if(btn.dataset.welcomeAction === 'passport') navigate('/me/passport');
  });
  document.getElementById('welcomeClose').addEventListener('click', close);
}
