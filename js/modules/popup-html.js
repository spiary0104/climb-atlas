// Builds the HTML for a spot's map popup. Pure (no DOM, no appState): map.js passes in the per-user state.
// Nothing here uses inline event handlers: the buttons carry data-popup-action / data-spot-id and one delegated
// listener (sidebar.js initSidebar) reads them back, so a spot id can never become executable code.
import { TYPE_LABELS } from './constants.js';
import { escapeHtml, safeUrl } from './html-safe.js';
import { directionsUrl } from './utils.js';
import { icon } from './icons.js';

export function buildPopupHtml(g, { climbed = false, bookmarked = false, region = '' } = {}){
  const typeLabel = (g.types || []).map(t=>TYPE_LABELS[t] || t).join(' · ');
  const photo = safeUrl(g.photo);          // only absolute http(s) links are ever rendered as an image
  const id = escapeHtml(g.id);
  return `${photo?`<img class="popup-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(g.name)}">`:''}
       <div class="popup-name">${escapeHtml(g.name)}</div>
       <div class="popup-meta">${escapeHtml(g.suburb)}, ${escapeHtml(region)} · ${escapeHtml(typeLabel)}${g.community?' · community-added':''}${g.edited?' · edited':''}</div>
       ${g.address?`<div class="popup-address">${escapeHtml(g.address)}</div>`:''}
       ${g.notes?`<div class="popup-notes">${escapeHtml(g.notes)}</div>`:''}
       <div class="popup-actions">
         <button type="button" class="btn btn-secondary btn-sm climbed-btn" aria-pressed="${climbed}" data-popup-action="climbed" data-spot-id="${id}">${icon('check', {size:'sm'})}Climbed</button>
         <button type="button" class="btn btn-secondary btn-sm bookmark-btn" aria-pressed="${bookmarked}" data-popup-action="bookmarked" data-spot-id="${id}">${icon('bookmark-simple', {size:'sm'})}Save</button>
       </div>
       <div class="popup-links">
         <a class="btn btn-secondary btn-sm popup-directions-btn" href="${escapeHtml(directionsUrl(g))}" target="_blank" rel="noopener noreferrer">${icon('navigation-arrow', {size:'sm'})}Directions</a>
         <button type="button" class="btn btn-secondary btn-sm popup-edit-btn" data-popup-action="edit" data-spot-id="${id}">${icon('pencil-simple', {size:'sm'})}Edit</button>
       </div>
       <button type="button" class="btn btn-tertiary btn-sm popup-report-btn" data-popup-action="report" data-spot-id="${id}">${icon('flag', {size:'sm'})}Report incorrect info</button>`;
}
