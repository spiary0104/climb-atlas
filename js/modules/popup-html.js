// Builds the HTML for a spot's map popup. Pure (no DOM, no appState): map.js passes in the per-user state.
// Nothing here uses inline event handlers: the buttons carry data-popup-action / data-spot-id and one delegated
// listener (sidebar.js initSidebar) reads them back, so a spot id can never become executable code.
import { TYPE_LABELS } from './constants.js';
import { escapeHtml, safeUrl } from './html-safe.js';
import { directionsUrl } from './utils.js';

export function buildPopupHtml(g, { climbed = false, bookmarked = false, region = '' } = {}){
  const typeLabel = (g.types || []).map(t=>TYPE_LABELS[t] || t).join(' · ');
  const photo = safeUrl(g.photo);          // only absolute http(s) links are ever rendered as an image
  const id = escapeHtml(g.id);
  return `${photo?`<img class="popup-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(g.name)}">`:''}
       <div class="popup-name">${escapeHtml(g.name)}</div>
       <div class="popup-meta">${escapeHtml(g.suburb)}, ${escapeHtml(region)} · ${escapeHtml(typeLabel)}${g.community?' · community-added':''}${g.edited?' · edited':''}</div>
       ${g.address?`<div class="popup-address">${escapeHtml(g.address)}</div>`:''}
       ${g.notes?`<div style="font-size:12px;color:var(--text-dim)">${escapeHtml(g.notes)}</div>`:''}
       <div class="popup-actions">
         <button class="mark-btn climbed-btn ${climbed?'active':''}" data-popup-action="climbed" data-spot-id="${id}">✓ Climbed</button>
         <button class="mark-btn bookmark-btn ${bookmarked?'active':''}" data-popup-action="bookmarked" data-spot-id="${id}">★ Save</button>
       </div>
       <div class="popup-links">
         <a class="popup-directions-btn" href="${escapeHtml(directionsUrl(g))}" target="_blank" rel="noopener noreferrer">📍 Directions</a>
         <button class="popup-edit-btn" data-popup-action="edit" data-spot-id="${id}">Edit this spot</button>
       </div>
       <button class="popup-report-btn" data-popup-action="report" data-spot-id="${id}">⚑ Report incorrect info</button>`;
}
