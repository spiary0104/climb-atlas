// Moderator pending-review panel: approve/reject spots and edits, dismiss reports.
import { TYPE_LABELS } from './constants.js';
import { loadPending, loadSpots } from './data-load.js';
import { openEditModal } from './modals.js';
import { render } from './sidebar.js';
import { appState } from './state.js';
import { escapeHtml, showToast } from './utils.js';

// --- moderation: pending review panel ---
const pendingModalBackdrop = document.getElementById('pendingModalBackdrop');
const pendingReviewBtn = document.getElementById('pendingReviewBtn');

export function renderPendingBadge(){
  if(!appState.isModerator){
    pendingReviewBtn.style.display = 'none';
    return;
  }
  const count = appState.pendingSpots.length + appState.pendingEdits.length + appState.pendingReports.length;
  pendingReviewBtn.classList.remove('init-hidden'); // initial hidden state now lives in CSS
  pendingReviewBtn.style.display = '';
  pendingReviewBtn.textContent = count ? `Pending review (${count})` : 'Pending review';
}

function renderPendingPanel(){
  const list = document.getElementById('pendingList');
  const cards = [];
  appState.pendingSpots.forEach(g=>{
    cards.push(`<div class="pending-item">
        <div class="pending-kind">New spot</div>
        <div class="popup-name">${escapeHtml(g.name)}</div>
        <div class="popup-meta">${escapeHtml(g.suburb)}, ${g.state} (${g.country}) · ${g.types.map(t=>TYPE_LABELS[t]||t).join(' · ')}</div>
        ${g.address?`<div class="pending-notes">${escapeHtml(g.address)}</div>`:''}
        ${g.notes?`<div class="pending-notes">${escapeHtml(g.notes)}</div>`:''}
        ${g.photo?`<div class="pending-notes">Photo: <a href="${escapeHtml(g.photo)}" target="_blank" rel="noopener noreferrer">${escapeHtml(g.photo)}</a></div>`:''}
        <div class="pending-actions">
          <button class="btn-cancel pending-reject" data-kind="spot" data-id="${g.id}">Reject</button>
          <button class="btn-submit pending-approve" data-kind="spot" data-id="${g.id}">Approve</button>
        </div>
      </div>`);
  });
  appState.pendingEdits.forEach(pe=>{
    const target = appState.spots.find(s=>s.id===pe.spot_id) || (window.SEED_GYMS||[]).find(s=>s.id===pe.spot_id);
    cards.push(`<div class="pending-item">
        <div class="pending-kind">Edit to ${escapeHtml(target?target.name:pe.spot_id)}</div>
        <div class="popup-name">${escapeHtml(pe.name)}</div>
        <div class="popup-meta">${escapeHtml(pe.suburb)}, ${pe.state} (${pe.country}) · ${pe.types.map(t=>TYPE_LABELS[t]||t).join(' · ')}</div>
        ${pe.address?`<div class="pending-notes">${escapeHtml(pe.address)}</div>`:''}
        ${pe.notes?`<div class="pending-notes">${escapeHtml(pe.notes)}</div>`:''}
        ${pe.photo?`<div class="pending-notes">Photo: <a href="${escapeHtml(pe.photo)}" target="_blank" rel="noopener noreferrer">${escapeHtml(pe.photo)}</a></div>`:''}
        <div class="pending-actions">
          <button class="btn-cancel pending-reject" data-kind="edit" data-id="${pe.id}">Reject</button>
          <button class="btn-submit pending-approve" data-kind="edit" data-id="${pe.id}">Approve</button>
        </div>
      </div>`);
  });
  appState.pendingReports.forEach(r=>{
    const target = appState.spots.find(s=>s.id===r.spot_id) || (window.SEED_GYMS||[]).find(s=>s.id===r.spot_id);
    cards.push(`<div class="pending-item">
        <div class="pending-kind">Report on ${escapeHtml(target?target.name:r.spot_id)}</div>
        <div class="pending-notes">${escapeHtml(r.message)}</div>
        <div class="pending-actions">
          <button class="btn-cancel pending-dismiss" data-kind="report" data-id="${r.id}">Dismiss</button>
          <button class="btn-submit pending-edit-spot" data-kind="report" data-spot-id="${r.spot_id}">Edit this spot</button>
        </div>
      </div>`);
  });
  list.innerHTML = cards.length ? cards.join('') : '<div class="empty-state">Nothing pending review.</div>';
}

function openPendingModal(){
  renderPendingPanel();
  pendingModalBackdrop.classList.remove('hidden');
}

async function refreshAfterModeration(){
  await loadSpots();
  await loadPending();
  renderPendingPanel();
  renderPendingBadge();
  render();
}

async function approveSpot(id){
  try{
    const {error} = await window.sb.from('spots').update({status:'approved'}).eq('id', id);
    if(error) throw error;
    showToast('Spot approved ✓');
  }catch(err){
    showToast('Could not approve — try again');
    console.error(err);
  }
  await refreshAfterModeration();
}

async function rejectSpot(id){
  try{
    const {error} = await window.sb.from('spots').delete().eq('id', id);
    if(error) throw error;
    showToast('Spot rejected');
  }catch(err){
    showToast('Could not reject — try again');
    console.error(err);
  }
  await refreshAfterModeration();
}

async function approveEdit(pendingEditId){
  const pe = appState.pendingEdits.find(p=>p.id===pendingEditId);
  if(!pe) return;
  try{
    const {error: e1} = await window.sb.from('spots').update({
      name: pe.name, suburb: pe.suburb, state: pe.state, country: pe.country,
      types: pe.types, address: pe.address, notes: pe.notes, photo: pe.photo, lat: pe.lat, lng: pe.lng,
      edited: true, updated_at: new Date().toISOString()
    }).eq('id', pe.spot_id);
    if(e1) throw e1;
    const {error: e2} = await window.sb.from('pending_edits').delete().eq('id', pe.id);
    if(e2) throw e2;
    showToast('Edit approved ✓');
  }catch(err){
    showToast('Could not approve edit — try again');
    console.error(err);
  }
  await refreshAfterModeration();
}

async function rejectEdit(pendingEditId){
  try{
    const {error} = await window.sb.from('pending_edits').delete().eq('id', pendingEditId);
    if(error) throw error;
    showToast('Edit rejected');
  }catch(err){
    showToast('Could not reject — try again');
    console.error(err);
  }
  await refreshAfterModeration();
}

async function dismissReport(id){
  try{
    const {error} = await window.sb.from('reports').delete().eq('id', id);
    if(error) throw error;
    showToast('Report dismissed');
  }catch(err){
    showToast('Could not dismiss — try again');
    console.error(err);
  }
  await refreshAfterModeration();
}

export function initModeration(){
  pendingReviewBtn.addEventListener('click', openPendingModal);

  document.getElementById('pendingList').addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const kind = btn.dataset.kind;
    const id = btn.dataset.id;
    if(btn.classList.contains('pending-approve')){
      btn.closest('.pending-actions').querySelectorAll('button').forEach(b=>b.disabled=true);
      if(kind === 'spot') approveSpot(id); else approveEdit(id);
    } else if(btn.classList.contains('pending-reject')){
      btn.closest('.pending-actions').querySelectorAll('button').forEach(b=>b.disabled=true);
      if(kind === 'spot') rejectSpot(id); else rejectEdit(id);
    } else if(btn.classList.contains('pending-dismiss')){
      btn.closest('.pending-actions').querySelectorAll('button').forEach(b=>b.disabled=true);
      dismissReport(id);
    } else if(btn.classList.contains('pending-edit-spot')){
      pendingModalBackdrop.classList.add('hidden');
      openEditModal(btn.dataset.spotId);
    }
  });
}
