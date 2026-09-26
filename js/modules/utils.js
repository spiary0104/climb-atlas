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
export function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2400);
}
