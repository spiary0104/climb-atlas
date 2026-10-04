// Small shared helpers: HTML escaping, directions links, toast.
// escapeHtml / safeUrl live in html-safe.js (pure, unit-tested); re-exported so existing imports keep working.
export { escapeHtml, safeUrl } from './html-safe.js';

// Deliberately just destination + lat/lng, no origin -- Google Maps fills
// the origin in as the visitor's current location. Works off coordinates
// alone so it doesn't depend on a spot having a verified street address.
export function directionsUrl(g){
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(g.lat+','+g.lng)}`;
}

// --- toast ---
let hideTimer = null, restoreTimer = null;
let pendingAction = null;   // {message, label, onAction}: a toast with an action stays until it is used, and returns after a plain toast

export function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;                   // also removes an action button
  t.classList.remove('toast--action');
  t.classList.add('show');
  clearTimeout(hideTimer); clearTimeout(restoreTimer);
  hideTimer = setTimeout(()=>{
    t.classList.remove('show');
    if(pendingAction) restoreTimer = setTimeout(()=>paintActionToast(t), 400);   // after the fade-out
  }, 2400);
}

// A toast with one action button (the "newer version is ready" prompt). It does not time out: the person decides when.
export function showActionToast(message, label, onAction){
  pendingAction = { message, label, onAction };
  clearTimeout(hideTimer); clearTimeout(restoreTimer);
  paintActionToast(document.getElementById('toast'));
}

function paintActionToast(t){
  if(!pendingAction) return;
  const { message, label, onAction } = pendingAction;
  t.textContent = '';
  const text = document.createElement('span');
  text.textContent = message;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-tertiary toast-action';
  btn.textContent = label;
  btn.addEventListener('click', ()=>{
    pendingAction = null;
    onAction();
  });
  t.append(text, btn);
  t.classList.add('toast--action', 'show');
}
