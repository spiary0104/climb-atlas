// Modal keyboard/focus handling, add/edit/report spot forms, Privacy/Terms info modals.
import { openAuthModal } from './auth-ui.js';
import { ensureSeedData } from './data-load.js';
import { map } from './map.js';
import { STATES_BY_COUNTRY } from './regions.js';
import { appState } from './state.js';
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

// --- add gym flow ---
const modalBackdrop = document.getElementById('modalBackdrop');
const pinStatus = document.getElementById('pinStatus');
const submitBtn = document.getElementById('submitBtn');
const placingBanner = document.getElementById('placingBanner');
const editModalBackdrop = document.getElementById('editModalBackdrop');
const editPinStatus = document.getElementById('editPinStatus');
function closeModal(){
  modalBackdrop.classList.add('hidden');
  stopPlacing();
}

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
function selectedTypes(){
  const map = {fTypeIndoor:'indoor-bouldering', fTypeTopRope:'top-rope', fTypeLead:'lead-climbing'};
  return Object.keys(map).filter(id=>document.getElementById(id).checked).map(id=>map[id]);
}
// Rather than a silently disabled Submit, list what's still missing so
// the person filling the form knows why. Cleared once nothing is.
function renderFormHint(hintId, missing){
  const el = document.getElementById(hintId);
  el.textContent = missing.length ? 'Still needed: ' + missing.join(', ') + '.' : '';
}
function checkFormReady(){
  const name = document.getElementById('fName').value.trim();
  const suburb = document.getElementById('fSuburb').value.trim();
  const {country, state} = getCountryState('f');
  const missing = [];
  if(!appState.placingPin) missing.push('a pin on the map');
  if(!name) missing.push('a name');
  if(!suburb) missing.push('a suburb');
  if(!country || !state) missing.push('a country and state');
  if(selectedTypes().length === 0) missing.push('at least one climbing type');
  renderFormHint('fFormHint', missing);
  submitBtn.disabled = missing.length > 0;
}

// --- edit spot flow ---
export async function openEditModal(id){
  const g = appState.spots.find(x=>x.id===id);
  if(!g) return;
  // Only an edited seed spot can be reverted, and only the seed file knows
  // its original values -- pull it in for that case alone.
  if(g.edited && !g.community) await ensureSeedData().catch(()=>{});
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
  document.getElementById('eNotes').value = g.notes || '';
  document.getElementById('ePhoto').value = g.photo || '';
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

// --- info modals: privacy / terms (About is now a standalone page, about.html) ---
const infoModals = {
  openPrivacy: 'privacyModalBackdrop',
  openTerms: 'termsModalBackdrop'
};

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

export function initForms(){
  document.getElementById('fCountry').addEventListener('change', (e)=>{ toggleOtherCountryFields('f', e.target.value); checkFormReady(); });
  document.getElementById('eCountry').addEventListener('change', (e)=>{ toggleOtherCountryFields('e', e.target.value); checkEditFormReady(); });

  // Signed-in only (per the RLS policy in schema.sql), and a client-side
  // pre-check against the same rolling-24h/10-submission cap so someone
  // who's already hit it gets told before filling out the whole form,
  // not after. The actual limit is enforced server-side either way --
  // this is just a nicer UX in front of it, and fails open (opens the
  // form) if the count query itself errors.
  document.getElementById('addBtn').addEventListener('click', async ()=>{
    const user = window.auth.user;
    if(!user){ showToast('Sign in to add a location'); openAuthModal(); return; }
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    const dayAgo = new Date(Date.now() - 24*60*60*1000).toISOString();
    const {count, error} = await window.sb.from('spots')
      .select('id', {count:'exact', head:true})
      .eq('submitted_by', user.id)
      .gte('created_at', dayAgo);
    if(!error && count >= 10){
      showToast("You've reached today's limit of 10 submissions — try again tomorrow.");
      return;
    }
    appState.placingPin = null;
    submitBtn.disabled = true;
    pinStatus.textContent = 'No pin dropped yet — click "Drop pin" then tap the map.';
    pinStatus.classList.remove('set');
    ['fName','fSuburb','fAddress','fNotes','fPhoto','fCountryOther','fStateOther'].forEach(id=>document.getElementById(id).value='');
    ['fTypeIndoor','fTypeTopRope','fTypeLead'].forEach(id=>document.getElementById(id).checked=false);
    document.getElementById('fCountry').value = 'AU';
    toggleOtherCountryFields('f', 'AU');
    checkFormReady();
    modalBackdrop.classList.remove('hidden');
  });

  document.getElementById('cancelBtn').addEventListener('click', closeModal);

  document.getElementById('dropPinBtn').addEventListener('click', ()=>{
    modalBackdrop.classList.add('hidden');
    startPlacing('add');
  });

  map.on('click', (e)=>{
    if(!appState.isPlacing) return;
    const pt = {lat: e.lngLat.lat, lng: e.lngLat.lng};
    const mode = appState.placingMode;
    stopPlacing();
    appState.placingMode = null;
    if(mode === 'edit'){
      appState.currentEditPin = pt;
      editPinStatus.textContent = `Pin set at ${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)}`;
      editPinStatus.classList.add('set');
      editModalBackdrop.classList.remove('hidden');
      checkEditFormReady();
    } else {
      appState.placingPin = pt;
      pinStatus.textContent = `Pin set at ${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)}`;
      pinStatus.classList.add('set');
      modalBackdrop.classList.remove('hidden');
      checkFormReady();
    }
  });

  ['fName','fSuburb'].forEach(id=>{
    document.getElementById(id).addEventListener('input', checkFormReady);
  });
  ['fTypeIndoor','fTypeTopRope','fTypeLead'].forEach(id=>{
    document.getElementById(id).addEventListener('change', checkFormReady);
  });
  ['fCountryOther','fStateOther'].forEach(id=>{
    document.getElementById(id).addEventListener('input', checkFormReady);
  });

  document.getElementById('submitBtn').addEventListener('click', async ()=>{
    if(!appState.placingPin) return;
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    const user = window.auth.user;
    if(!user){ showToast('Sign in to add a location'); closeModal(); openAuthModal(); return; }
    const {country, state} = getCountryState('f');
    const fPhotoRaw = document.getElementById('fPhoto').value.trim();
    if(fPhotoRaw && !safeUrl(fPhotoRaw)){ showToast('Photo link must be a full http:// or https:// address'); return; }
    const gym = {
      id: 'community-' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now()),
      name: document.getElementById('fName').value.trim(),
      suburb: document.getElementById('fSuburb').value.trim(),
      state,
      country,
      types: selectedTypes(),
      address: document.getElementById('fAddress').value.trim() || null,
      notes: document.getElementById('fNotes').value.trim() || null,
      photo: fPhotoRaw ? safeUrl(fPhotoRaw) : null,
      lat: appState.placingPin.lat,
      lng: appState.placingPin.lng,
      submitted_by: user.id,
      community: true,
      edited: false,
      status: 'pending'
    };
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';
    try{
      const {error} = await window.sb.from('spots').insert(gym);
      if(error) throw error;
      showToast('Submitted — a moderator will review it before it appears on the map.');
      submitBtn.textContent = 'Add to map';
      closeModal();
    }catch(err){
      // The RLS policy (schema.sql) is the real enforcement of the sign-in +
      // 10/day rules -- this is just a clearer message for the rare case the
      // client-side pre-check missed (a race, or its own query erroring).
      const rlsRejected = /row-level security|permission denied/i.test(err.message||'');
      showToast(rlsRejected ? "Couldn't save — you may have reached today's submission limit." : 'Could not save — try again');
      console.error(err);
      submitBtn.textContent = 'Add to map';
      submitBtn.disabled = false;
    }
  });
  document.getElementById('eCancelBtn').addEventListener('click', closeEditModal);

  document.getElementById('eDropPinBtn').addEventListener('click', ()=>{
    editModalBackdrop.classList.add('hidden');
    startPlacing('edit');
  });

  ['eName','eSuburb'].forEach(id=>{
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
    const {country, state} = getCountryState('e');
    const ePhotoRaw = document.getElementById('ePhoto').value.trim();
    if(ePhotoRaw && !safeUrl(ePhotoRaw)){ showToast('Photo link must be a full http:// or https:// address'); return; }
    const proposal = {
      spot_id: appState.currentEditId,
      name: document.getElementById('eName').value.trim(),
      suburb: document.getElementById('eSuburb').value.trim(),
      state,
      country,
      types: selectedEditTypes(),
      address: document.getElementById('eAddress').value.trim() || null,
      notes: document.getElementById('eNotes').value.trim() || null,
      photo: ePhotoRaw ? safeUrl(ePhotoRaw) : null,
      lat: appState.currentEditPin.lat,
      lng: appState.currentEditPin.lng
    };
    const saveBtn = document.getElementById('eSaveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';
    try{
      const {error} = await window.sb.from('pending_edits').insert(proposal);
      if(error) throw error;
      showToast('Edit submitted — a moderator will review it before it goes live.');
      saveBtn.textContent = 'Save changes';
      closeEditModal();
    }catch(err){
      showToast('Could not save — try again');
      console.error(err);
      saveBtn.textContent = 'Save changes';
      saveBtn.disabled = false;
    }
  });

  document.getElementById('eRevertBtn').addEventListener('click', async ()=>{
    if(!appState.currentEditId) return;
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
    const id = appState.currentEditId;
    const original = (await ensureSeedData().catch(()=>[])).find(s=>s.id===id);
    if(!original){ showToast('No original data to revert to'); return; }
    const proposal = {
      spot_id: id,
      name: original.name, suburb: original.suburb, state: original.state, country: original.country,
      types: original.types, address: original.address || null, notes: original.notes || null, photo: original.photo || null,
      lat: original.lat, lng: original.lng
    };
    try{
      const {error} = await window.sb.from('pending_edits').insert(proposal);
      if(error) throw error;
      showToast('Revert submitted — a moderator will review it before it goes live.');
      closeEditModal();
    }catch(err){
      showToast('Could not submit revert — try again');
      console.error(err);
    }
  });
  document.getElementById('rCancelBtn').addEventListener('click', closeReportModal);

  rMessage.addEventListener('input', ()=>{
    rSubmitBtn.disabled = !rMessage.value.trim();
  });

  rSubmitBtn.addEventListener('click', async ()=>{
    if(!appState.currentReportId || !rMessage.value.trim()) return;
    if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
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
      showToast('Could not send report — try again');
      console.error(err);
      rSubmitBtn.textContent = 'Send report';
      rSubmitBtn.disabled = false;
    }
  });
}

export function initInfoModals(){
  Object.keys(infoModals).forEach(btnId=>{
    document.getElementById(btnId).addEventListener('click', ()=>{
      document.getElementById(infoModals[btnId]).classList.remove('hidden');
    });
  });
  document.querySelectorAll('.info-close').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.target.closest('.modal-backdrop').classList.add('hidden');
    });
  });
  ['privacyModalBackdrop','termsModalBackdrop','pendingModalBackdrop'].forEach(id=>{
    document.getElementById(id).addEventListener('click', (e)=>{
      if(e.target.id === id) e.target.classList.add('hidden');
    });
  });
}
