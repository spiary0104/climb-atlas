// Moderator actions (DESIGN.md sec. 10.5), used by the /mod page (mod-page.js) and the gym page's verify control.
// Decisions are recorded, not deleted: a rejected gym keeps status 'rejected' with its reason; a proposal keeps
// status 'approved'/'rejected' (contributor history and points, sec. 10.1/10.6). RLS allows all of this to moderators only.
import { loadContributorCounts } from './community.js';
import { loadPending, loadSpots } from './data-load.js';
import { render } from './explore.js';
import { refreshPage } from './router.js';
import { appState } from './state.js';
import { showToast } from './utils.js';

// The queue count lives on /me and /mod; both re-render from appState.
export function renderPendingBadge(){
  refreshPage();
}

async function refreshAfterModeration(){
  await loadSpots();
  await loadContributorCounts();
  await loadPending();
  appState.provenanceCache.clear();
  render();          // Explore (and, through it, the current page)
}

// Only the text fields a moderator can correct in the panel are taken from `fields`; anything else is ignored.
const CORRECTABLE = ['name', 'suburb', 'address', 'notes'];
function corrections(fields = {}){
  const out = {};
  for(const k of CORRECTABLE){
    if(!(k in fields)) continue;
    const v = String(fields[k] == null ? '' : fields[k]).trim();
    out[k] = v || (k === 'address' || k === 'notes' ? null : undefined);
    if(out[k] === undefined) delete out[k];          // name/suburb can't be blanked
  }
  return out;
}

async function run(label, fn){
  try{ await fn(); showToast(label); return true; }
  catch(err){ showToast('Could not save — try again'); console.error(err); return false; }
  finally{ await refreshAfterModeration(); }
}

export function approveSpot(id, fields){
  return run('Gym approved', async () => {
    const {error} = await window.sb.from('spots').update({ ...corrections(fields), status: 'approved', verified_at: null }).eq('id', id);   // approving is not verifying (the gym page has its own control); never keep a value a submitter tried to set
    if(error) throw error;
  });
}

export function rejectSpot(id, reason){
  return run('Gym rejected', async () => {
    const {error} = await window.sb.from('spots').update({ status: 'rejected', rejection_reason: String(reason || '').trim().slice(0, 200) || null }).eq('id', id);
    if(error) throw error;
  });
}

export function approveEdit(pendingEditId, fields){
  const pe = appState.pendingEdits.find(p => p.id === pendingEditId);
  if(!pe) return Promise.resolve(false);
  return run('Edit approved', async () => {
    const {error: e1} = await window.sb.from('spots').update({
      name: pe.name, suburb: pe.suburb, state: pe.state, country: pe.country,
      types: pe.types, address: pe.address, notes: pe.notes, photo: pe.photo, lat: pe.lat, lng: pe.lng,
      ...corrections(fields), edited: true,
    }).eq('id', pe.spot_id);
    if(e1) throw e1;
    const {error: e2} = await window.sb.from('pending_edits').update({ status: 'approved', decided_at: new Date().toISOString() }).eq('id', pe.id);
    if(e2) throw e2;
  });
}

export function rejectEdit(pendingEditId, reason){
  return run('Edit rejected', async () => {
    const {error} = await window.sb.from('pending_edits').update({
      status: 'rejected', rejection_reason: String(reason || '').trim().slice(0, 200) || null, decided_at: new Date().toISOString(),
    }).eq('id', pendingEditId);
    if(error) throw error;
  });
}

export function dismissReport(id){
  return run('Report dismissed', async () => {
    const {error} = await window.sb.from('reports').delete().eq('id', id);
    if(error) throw error;
  });
}

// "Verified" (sec. 10.1): confirmed by a moderator; shown as no mark on cards and "Verified" on the page.
export function setVerified(spotId, on){
  return run(on ? 'Marked verified' : 'Verification removed', async () => {
    const {error} = await window.sb.from('spots').update({ verified_at: on ? new Date().toISOString() : null }).eq('id', spotId);
    if(error) throw error;
  });
}

export function initModeration(){ /* actions only; /mod wires its own events (mod-page.js) */ }
