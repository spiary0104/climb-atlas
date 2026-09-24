// Moderator pending-review panel: approve/reject spots and edits, dismiss reports.
import { loadPending, loadSpots } from './data-load.js';
import { openEditModal } from './modals.js';
import { pendingPanelHtml } from './moderation-html.js';
import { render } from './sidebar.js';
import { appState } from './state.js';
import { showToast } from './utils.js';

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

function findSpotById(id){
  return appState.spots.find(s=>s.id===id) || (window.SEED_GYMS||[]).find(s=>s.id===id);
}

function renderPendingPanel(){
  document.getElementById('pendingList').innerHTML = pendingPanelHtml({
    spots: appState.pendingSpots,
    edits: appState.pendingEdits,
    reports: appState.pendingReports,
    findSpot: findSpotById
  });
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
