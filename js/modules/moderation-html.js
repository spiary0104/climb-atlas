// HTML for the moderator "Pending review" panel. Pure (no DOM / appState) so it can be unit-tested with hostile data
// (tests/render-html.test.js). Everything here comes from rows anyone can insert (pending spots, proposed edits, reports),
// so EVERY interpolated value is escaped for attribute context, and photo links go through safeUrl().
import { TYPE_LABELS } from './constants.js';
import { escapeHtml, safeUrl } from './html-safe.js';

function typesText(types){
  return (Array.isArray(types) ? types : []).map(t=>TYPE_LABELS[t] || t).join(' · ');
}

function photoLine(photo){
  if(!photo) return '';
  const url = safeUrl(photo);
  return url
    ? `<div class="pending-notes">Photo: <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(photo)}</a></div>`
    : `<div class="pending-notes">Photo: ${escapeHtml(photo)} (not a web link — not clickable)</div>`;
}

export function pendingSpotCardHtml(g){
  return `<div class="pending-item">
        <div class="pending-kind">New spot</div>
        <div class="popup-name">${escapeHtml(g.name)}</div>
        <div class="popup-meta">${escapeHtml(g.suburb)}, ${escapeHtml(g.state)} (${escapeHtml(g.country)}) · ${escapeHtml(typesText(g.types))}</div>
        ${g.address?`<div class="pending-notes">${escapeHtml(g.address)}</div>`:''}
        ${g.notes?`<div class="pending-notes">${escapeHtml(g.notes)}</div>`:''}
        ${photoLine(g.photo)}
        <div class="pending-actions">
          <button class="btn-danger pending-reject" data-kind="spot" data-id="${escapeHtml(g.id)}">Reject</button>
          <button class="btn-submit pending-approve" data-kind="spot" data-id="${escapeHtml(g.id)}">Approve</button>
        </div>
      </div>`;
}

export function pendingEditCardHtml(pe, targetName){
  return `<div class="pending-item">
        <div class="pending-kind">Edit to ${escapeHtml(targetName || pe.spot_id)}</div>
        <div class="popup-name">${escapeHtml(pe.name)}</div>
        <div class="popup-meta">${escapeHtml(pe.suburb)}, ${escapeHtml(pe.state)} (${escapeHtml(pe.country)}) · ${escapeHtml(typesText(pe.types))}</div>
        ${pe.address?`<div class="pending-notes">${escapeHtml(pe.address)}</div>`:''}
        ${pe.notes?`<div class="pending-notes">${escapeHtml(pe.notes)}</div>`:''}
        ${photoLine(pe.photo)}
        <div class="pending-actions">
          <button class="btn-danger pending-reject" data-kind="edit" data-id="${escapeHtml(pe.id)}">Reject</button>
          <button class="btn-submit pending-approve" data-kind="edit" data-id="${escapeHtml(pe.id)}">Approve</button>
        </div>
      </div>`;
}

export function pendingReportCardHtml(r, targetName){
  return `<div class="pending-item">
        <div class="pending-kind">Report on ${escapeHtml(targetName || r.spot_id)}</div>
        <div class="pending-notes">${escapeHtml(r.message)}</div>
        <div class="pending-actions">
          <button class="btn-danger pending-dismiss" data-kind="report" data-id="${escapeHtml(r.id)}">Dismiss</button>
          <button class="btn-submit pending-edit-spot" data-kind="report" data-spot-id="${escapeHtml(r.spot_id)}">Edit this spot</button>
        </div>
      </div>`;
}

// spots/edits/reports are the raw rows; findSpot(id) returns a spot (or undefined) so edits/reports can show its name.
export function pendingPanelHtml({ spots, edits, reports, findSpot }){
  const cards = [];
  spots.forEach(g => cards.push(pendingSpotCardHtml(g)));
  edits.forEach(pe => { const t = findSpot(pe.spot_id); cards.push(pendingEditCardHtml(pe, t && t.name)); });
  reports.forEach(r => { const t = findSpot(r.spot_id); cards.push(pendingReportCardHtml(r, t && t.name)); });
  return cards.length ? cards.join('') : '<div class="empty-state">Nothing pending review.</div>';
}
