// Modal keyboard/focus handling, edit/report spot forms. Adding a gym is the /add page.
import { openAuthModal } from './auth-ui.js';
import { infoFieldsHtml, readInfoFields } from './gym-info.js';
import { ensureSeedData, loadFullSpot } from './data-load.js';
import { map } from './map.js';
import { STATES_BY_COUNTRY } from './regions.js';
import { appState } from './state.js';
import { navigate, refreshPage } from './router.js';
import { submitErrorMessage } from './submit-errors.js';
import { escapeHtml, safeUrl, showToast } from './utils.js';

// --- modal keyboard/focus handling ---
// Every modal is a .modal-backdrop toggled via the `hidden` class by its own
// open/close function. Rather than threading focus management through each
// of those, watch the class flips: on open, remember what had focus and move
// it into the dialog; on close, put it back. Escape triggers the dialog's own
// cancel/close button so each modal's existing close logic still runs.
const DESTRUCTIVE = '.btn-danger, .pending-reject, .pending-dismiss, .pending-approve, .session-delete, [data-destructive]';
const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// --- country/state dropdowns (shared by add + edit forms) ---
function populateStateSelect(stateSelectId, country){
  const sel = document.getElementById(stateSelectId);
  const prevValue = sel.value;
  sel.innerHTML = STATES_BY_COUNTRY[country].map(([code,label])=>`<option value="${escapeHtml(code)}">${escapeHtml(label)}</option>`).join('');
  if(STATES_BY_COUNTRY[country].some(([code])=>code===prevValue)) sel.value = prevValue;
}
// "Other (not listed)" lets someone propose a country this map doesn't support
// yet -- there's no STATES_BY_COUNTRY entry or short code for it, so the normal
// state <select> is swapped for two free-text inputs instead. Submitted as
// whatever the person types (moderator-reviewed either way); a country only
// gets proper chip/colour/filter support once someone formally adds it, the
// same one-at-a-time process every existing country went through.
function toggleOtherCountryFields(prefix, country){
  const isOther = country === 'OTHER';
  document.getElementById(prefix + 'OtherCountryFields').style.display = isOther ? 'flex' : 'none';
  document.getElementById(prefix + 'State').parentElement.style.display = isOther ? 'none' : '';
  if(!isOther) populateStateSelect(prefix + 'State', country);
}
function getCountryState(prefix){
  const countrySel = document.getElementById(prefix + 'Country');
  if(countrySel.value === 'OTHER'){
    return {
      country: document.getElementById(prefix + 'CountryOther').value.trim(),
      state: document.getElementById(prefix + 'StateOther').value.trim()
    };
  }
  return {country: countrySel.value, state: document.getElementById(prefix + 'State').value};
}

// Suggesting an edit and reporting a gym need an account (the database refuses anonymous rows, migration 20261002000100):
// signed-out people get the sign-in dialog and a toast instead of a form that cannot be submitted.
function requireSignIn(reason){
  if(window.auth && window.auth.user) return true;
  showToast(reason);
  openAuthModal();
  return false;
}

// --- pin placing (edit form) ---
const placingBanner = document.getElementById('placingBanner');
const editModalBackdrop = document.getElementById('editModalBackdrop');
const editPinStatus = document.getElementById('editPinStatus');
function startPlacing(mode){
  appState.placingMode = mode;
  appState.isPlacing = true;
  placingBanner.classList.add('show');
  map.getContainer().style.cursor = 'crosshair';
}
function stopPlacing(){
  appState.isPlacing = false;
  placingBanner.classList.remove('show');
  map.getContainer().style.cursor = '';
}
// Rather than a silently disabled Submit, list what's still missing so
// the person filling the form knows why. Cleared once nothing is.
function renderFormHint(hintId, missing){
  const el = document.getElementById(hintId);
  el.textContent = missing.length ? 'Still needed: ' + missing.join(', ') + '.' : '';
}
// --- edit spot flow ---
export async function openEditModal(id, { focus = '' } = {}){
  const g = appState.spots.find(x=>x.id===id);
  if(!g) return;
  if(!requireSignIn('Sign in to suggest an edit')) return;
  // Only an edited seed spot can be reverted, and only the seed file knows
  // its original values -- pull it in for that case alone.
  if(g.edited && !g.community) await ensureSeedData().catch(()=>{});
  await loadFullSpot(g);            // the form shows (and an edit carries) the whole row, not just Explore's columns
  appState.currentEditId = id;
  appState.currentEditPin = {lat: g.lat, lng: g.lng};
  document.getElementById('eName').value = g.name;
  document.getElementById('eSuburb').value = g.suburb;
  if(STATES_BY_COUNTRY[g.country]){
    document.getElementById('eCountry').value = g.country;
    toggleOtherCountryFields('e', g.country);
    document.getElementById('eState').value = g.state;
  } else {
    // g.country isn't one of the supported dropdown countries -- this spot
    // was itself submitted through the "Other (not listed)" path (or has a
    // country this map hasn't formally added chip/colour support for yet).
    document.getElementById('eCountry').value = 'OTHER';
    toggleOtherCountryFields('e', 'OTHER');
    document.getElementById('eCountryOther').value = g.country;
    document.getElementById('eStateOther').value = g.state;
  }
  document.getElementById('eAddress').value = g.address || '';
  document.getElementById('eInfoFields').innerHTML = infoFieldsHtml('e', g);   // website, day pass, hours, facilities, description
  document.getElementById('ePhoto').value = g.photo || '';
  document.getElementById('eNote').value = '';
  document.getElementById('eReview').checked = false;
  document.getElementById('eTypeIndoor').checked = g.types.includes('indoor-bouldering');
  document.getElementById('eTypeTopRope').checked = g.types.includes('top-rope');
  document.getElementById('eTypeLead').checked = g.types.includes('lead-climbing');
  editPinStatus.textContent = `Current pin: ${g.lat.toFixed(4)}, ${g.lng.toFixed(4)}`;
  editPinStatus.classList.remove('set');
  // Revert only makes sense for un-edited-back-to seed spots — community
  // submissions have no "original" snapshot stored anywhere to revert to.
  const canRevert = g.edited && !g.community && (window.SEED_GYMS||[]).some(s=>s.id===id);
  document.getElementById('eRevertBtn').style.display = canRevert ? 'block' : 'none';
  checkEditFormReady();
  editModalBackdrop.classList.remove('hidden');
  // The gym page prompt opens the dialog at the hours (sec. 8.2): after the dialog's own initial focus has run.
  if(focus === 'hours') requestAnimationFrame(() => {
    const el = document.getElementById('e-hours-mon');
    if(el){ el.scrollIntoView({ block: 'center' }); el.focus({ preventScroll: true }); }
  });
}

function closeEditModal(){
  editModalBackdrop.classList.add('hidden');
  stopPlacing();
  appState.currentEditId = null;
}
function selectedEditTypes(){
  const map = {eTypeIndoor:'indoor-bouldering', eTypeTopRope:'top-rope', eTypeLead:'lead-climbing'};
  return Object.keys(map).filter(id=>document.getElementById(id).checked).map(id=>map[id]);
}
function checkEditFormReady(){
  const name = document.getElementById('eName').value.trim();
  const suburb = document.getElementById('eSuburb').value.trim();
  const {country, state} = getCountryState('e');
  const missing = [];
  if(!appState.currentEditPin) missing.push('a pin on the map');
  if(!name) missing.push('a name');
  if(!suburb) missing.push('a suburb');
  if(!country || !state) missing.push('a country and state');
  if(selectedEditTypes().length === 0) missing.push('at least one climbing type');
  if(!document.getElementById('eNote').value.trim()) missing.push('what changed and how you know');
  renderFormHint('eFormHint', missing);
  document.getElementById('eSaveBtn').disabled = missing.length > 0;
}

// --- report incorrect info flow ---
const reportModalBackdrop = document.getElementById('reportModalBackdrop');
const rMessage = document.getElementById('rMessage');
const rSubmitBtn = document.getElementById('rSubmitBtn');

export function openReportModal(id){
  const g = appState.spots.find(x=>x.id===id);
  if(!g) return;
  if(!requireSignIn('Sign in to report a problem')) return;
  appState.currentReportId = id;
  document.getElementById('reportSpotName').textContent = g.name;
  rMessage.value = '';
  rSubmitBtn.disabled = true;
  reportModalBackdrop.classList.remove('hidden');
}

function closeReportModal(){
  reportModalBackdrop.classList.add('hidden');
  appState.currentReportId = null;
}

export function initModalKeyboard(){
  document.querySelectorAll('.modal-backdrop').forEach(backdrop=>{
    new MutationObserver(()=>{
      const open = !backdrop.classList.contains('hidden');
      if(open){
        appState.lastFocused = document.activeElement;
        const first = backdrop.querySelector('.modal ' + FOCUSABLE);
        if(first) first.focus();
      } else if(appState.lastFocused && document.body.contains(appState.lastFocused)){
        appState.lastFocused.focus();
        appState.lastFocused = null;
      }
    }).observe(backdrop, {attributes:true, attributeFilter:['class']});
  });
  document.addEventListener('keydown', (e)=>{
    const open = [...document.querySelectorAll('.modal-backdrop')].filter(b=>!b.classList.contains('hidden')).pop();
    if(!open) return;
    if(e.key === 'Escape'){
      // Only ever click a control explicitly marked data-modal-close. The old selector ('.btn-cancel, .info-close')
      // matched the FIRST .btn-cancel in DOM order, which in the Pending-review and Logbook modals is a Reject /
      // Delete button rendered above the real Close -- so Escape silently rejected a spot or deleted a session.
      // DESTRUCTIVE is a second guard in case a marker is ever put on the wrong element.
      const closeBtn = open.querySelector('[data-modal-close]');
      if(closeBtn && !closeBtn.matches(DESTRUCTIVE)){ e.preventDefault(); closeBtn.click(); }
    } else if(e.key === 'Tab'){
      const items = [...open.querySelectorAll('.modal ' + FOCUSABLE)].filter(el=>el.offsetParent !== null);
      if(!items.length) return;
      const first = items[0], last = items[items.length-1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
  });
}

// "Add a gym": the top bar button, /me and the Explore empty state all go to the /add page (add-page.js).
export function startAddGym(){ navigate('/add'); }

const currentInfo = g => ({ description: g.description || null, website: g.website || null, day_pass: g.day_pass || null,
  hours: g.hours || null, facilities: Array.isArray(g.facilities) ? g.facilities : [] });

export function initForms(){
  document.getElementById('eCountry').addEventListener('change', (e)=>{ toggleOtherCountryFields('e', e.target.value); checkEditFormReady(); });

  document.getElementById('addBtn').addEventListener('click', startAddGym);

  map.on('click', (e)=>{
    if(!appState.isPlacing) return;
    const pt = {lat: e.lngLat.lat, lng: e.lngLat.lng};
    stopPlacing();
    appState.placingMode = null;
    appState.currentEditPin = pt;
    editPinStatus.textContent = `Pin set at ${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)}`;
    editPinStatus.classList.add('set');
    editModalBackdrop.classList.remove('hidden');
    checkEditFormReady();
  });
  document.getElementById('eCancelBtn').addEventListener('click', closeEditModal);

  document.getElementById('eDropPinBtn').addEventListener('click', ()=>{
    editModalBackdrop.classList.add('hidden');
    startPlacing('edit');
  });

  ['eName','eSuburb','eNote'].forEach(id=>{
    document.getElementById(id).addEventListener('input', checkEditFormReady);
  });
  ['eTypeIndoor','eTypeTopRope','eTypeLead'].forEach(id=>{
    document.getElementById(id).addEventListener('change', checkEditFormReady);
  });
  ['eCountryOther','eStateOther'].forEach(id=>{
    document.getElementById(id).addEventListener('input', checkEditFormReady);
  });

  document.getElementById('eSaveBtn').addEventListener('click', async ()=>{
    if(!appState.currentEditId || !appState.currentEditPin) return;
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    if(!requireSignIn('Sign in to submit your edit')) return;     // the session may have ended while the form was open
    const {country, state} = getCountryState('e');
    const ePhotoRaw = document.getElementById('ePhoto').value.trim();
    if(ePhotoRaw && !safeUrl(ePhotoRaw)){ showToast('Photo link must be a full http:// or https:// address'); return; }
    const info = readInfoFields('e', id => document.getElementById(id), {
      hourInputs: [...document.querySelectorAll('#eInfoFields [data-hours-day]')],
      facilityInputs: [...document.querySelectorAll('#eInfoFields [data-facility]')],
    });
    if(info.website && !safeUrl(info.website)){ showToast('Website must be a full http:// or https:// address'); document.getElementById('e-website').focus(); return; }
    const proposal = {
      spot_id: appState.currentEditId,
      name: document.getElementById('eName').value.trim(),
      suburb: document.getElementById('eSuburb').value.trim(),
      state,
      country,
      types: selectedEditTypes(),
      address: document.getElementById('eAddress').value.trim() || null,
      photo: ePhotoRaw ? safeUrl(ePhotoRaw) : null,
      // The public gym information; research `notes` are never part of an edit (approval leaves them alone).
      description: info.description, website: info.website, day_pass: info.day_pass, hours: info.hours, facilities: info.facilities,
      lat: appState.currentEditPin.lat,
      lng: appState.currentEditPin.lng,
      edit_note: document.getElementById('eNote').value.trim().slice(0, 200),
      review_requested: document.getElementById('eReview').checked
    };
    const saveBtn = document.getElementById('eSaveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';
    try{
      const {error} = await window.sb.from('pending_edits').insert(proposal);
      if(error) throw error;
      showToast('Edit submitted — a moderator will review it before it goes live.');
      saveBtn.textContent = 'Save changes';
      appState.myEditCache.delete(proposal.spot_id);   // the gym page shows "Your edit is awaiting review"
      closeEditModal();
      refreshPage();
    }catch(err){
      showToast(submitErrorMessage(err, 'Could not save — try again'));
      console.error(err);
      saveBtn.textContent = 'Save changes';
      saveBtn.disabled = false;
    }
  });

  document.getElementById('eRevertBtn').addEventListener('click', async (e)=>{
    if(!appState.currentEditId) return;
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    if(!requireSignIn('Sign in to submit your edit')) return;
    const btn = e.currentTarget;
    if(btn.disabled) return;
    btn.disabled = true;                 // one proposal per click: the seed fetch and the insert take a moment
    try{ await revertToOriginal(appState.currentEditId); }finally{ btn.disabled = false; }
  });
  async function revertToOriginal(id){
    const original = (await ensureSeedData().catch(()=>[])).find(s=>s.id===id);
    if(!original){ showToast('No original data to revert to'); return; }
    const proposal = {
      spot_id: id,
      name: original.name, suburb: original.suburb, state: original.state, country: original.country,
      types: original.types, address: original.address || null, photo: original.photo || null,
      lat: original.lat, lng: original.lng, edit_note: 'Revert to the original dataset values',
      // The seed file predates the gym-information fields: a revert keeps what the gym has now.
      ...currentInfo(appState.spots.find(s => s.id === id) || {})
    };
    try{
      const {error} = await window.sb.from('pending_edits').insert(proposal);
      if(error) throw error;
      showToast('Revert submitted — a moderator will review it before it goes live.');
      closeEditModal();
    }catch(err){
      showToast(submitErrorMessage(err, 'Could not submit revert — try again'));
      console.error(err);
    }
  }
  document.getElementById('rCancelBtn').addEventListener('click', closeReportModal);

  rMessage.addEventListener('input', ()=>{
    rSubmitBtn.disabled = !rMessage.value.trim();
  });

  rSubmitBtn.addEventListener('click', async ()=>{
    if(!appState.currentReportId || !rMessage.value.trim()) return;
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    if(!requireSignIn('Sign in to send your report')) return;
    rSubmitBtn.disabled = true;
    rSubmitBtn.textContent = 'Sending…';
    try{
      const {error} = await window.sb.from('reports').insert({
        spot_id: appState.currentReportId,
        message: rMessage.value.trim()
      });
      if(error) throw error;
      showToast('Report sent — thanks for the heads up.');
      rSubmitBtn.textContent = 'Send report';
      closeReportModal();
    }catch(err){
      showToast(submitErrorMessage(err, 'Could not send report — try again'));
      console.error(err);
      rSubmitBtn.textContent = 'Send report';
      rSubmitBtn.disabled = false;
    }
  });
}
