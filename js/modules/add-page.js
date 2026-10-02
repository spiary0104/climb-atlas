// /add (DESIGN.md sec. 10.3): the add-a-gym flow as a page, replacing the old Add-a-spot dialog. The pin is the centre
// of an interactive map under a fixed crosshair ("Use my location" jumps there). Step 1: pin, name, types; step 2:
// optional details. Sign-in is requested on submit, not on opening: the draft is kept on this device (localStorage) so
// it survives the magic-link / Google redirect back to /add. Markup and rules live in add-html.js (pure, tested).
import { addDoneHtml, addPageHtml, addStepHtml, areaFor, areaMissing, countryState, nearHtml, PIN_ZOOM, stepOneMissing } from './add-html.js';
import { openAuthModal } from './auth-ui.js';
import { ALL_TYPES } from './geo.js';
import { BASEMAP_STYLE, map as exploreMap, warmBasemap } from './map.js';
import { currentRoute, registerView, setPageTitle } from './router.js';
import { gymPath } from './slug.js';
import { appState } from './state.js';
import { submitErrorMessage } from './submit-errors.js';
import { safeUrl, showToast } from './utils.js';

const DRAFT_KEY = 'bouldeer_add_draft';
const TEXT = ['name', 'suburb', 'country', 'state', 'countryOther', 'stateOther', 'address', 'photo', 'notes'];
const AREA_FIELDS = ['suburb', 'country', 'state', 'countryOther', 'stateOther'];
const blank = () => ({ step: 1, name: '', types: [], suburb: '', country: '', state: '', countryOther: '', stateOther: '',
  address: '', photo: '', notes: '', areaEdited: false, lat: null, lng: null, zoom: null });

let draft = blank();
let pinMap = null;
let done = false;
let busy = false;

const onAdd = () => currentRoute() && currentRoute().name === 'add';
const $ = id => document.getElementById(id);

// The stored draft is re-validated field by field: only known keys, strings, known types, finite numbers.
function loadDraft(){
  const d = blank();
  try{
    const raw = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
    if(!raw || typeof raw !== 'object') return d;
    TEXT.forEach(k => { if(typeof raw[k] === 'string') d[k] = raw[k].slice(0, 500); });
    if(Array.isArray(raw.types)) d.types = ALL_TYPES.filter(t => raw.types.includes(t));
    ['lat', 'lng', 'zoom'].forEach(k => { if(Number.isFinite(raw[k])) d[k] = raw[k]; });
    d.step = raw.step === 2 ? 2 : 1;
    d.areaEdited = raw.areaEdited === true;
  }catch(err){ /* storage blocked or corrupt: start blank */ }
  return d;
}
function saveDraft(){ try{ localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }catch(err){ /* private mode: draft lives in memory */ } }
function clearDraft(){ try{ localStorage.removeItem(DRAFT_KEY); }catch(err){ /* ignore */ } }

const zoomNow = () => (pinMap ? pinMap.getZoom() : draft.zoom);

function updateNear(){
  const near = Number.isFinite(draft.lat) ? areaFor(appState.spots, draft).near : null;
  const el = $('addNear');
  if(el) el.innerHTML = Number.isFinite(draft.lat) && zoomNow() >= PIN_ZOOM ? nearHtml(draft, near, near ? gymPath(near.g) : '/') : '';
  const coords = $('addCoords');
  if(coords) coords.textContent = Number.isFinite(draft.lat) ? draft.lat.toFixed(5) + ', ' + draft.lng.toFixed(5) : '';
}

function updateHint(){
  const hint = $('addHint');
  if(!hint) return;
  const missing = stepOneMissing(draft, zoomNow());
  if(draft.step === 2) missing.push(...areaMissing(draft));      // the table needs the area; usually pre-filled
  hint.textContent = missing.length ? 'Still needed: ' + missing.join(', ') + '.' : '';
}

function renderStep(){
  const form = $('addForm');
  if(!form) return;
  form.innerHTML = done ? addDoneHtml() : addStepHtml(draft, { signedIn: !!(window.auth && window.auth.user), busy });
  updateHint();
}

// Copy the area from the nearest gym, unless the person has typed their own in step 2.
function applyArea(){
  if(draft.areaEdited || !Number.isFinite(draft.lat)) return;
  const { area } = areaFor(appState.spots, draft);
  Object.assign(draft, area ? { suburb: area.suburb, country: area.country, state: area.state } : { suburb: '', country: '', state: '' });
}

function onMove(){
  const c = pinMap.getCenter();
  Object.assign(draft, { lat: c.lat, lng: c.lng, zoom: pinMap.getZoom() });
  applyArea();
  updateNear();
  updateHint();
  saveDraft();
}

function mountPinMap(el){
  destroyPinMap();
  const c = exploreMap.getCenter();
  const center = Number.isFinite(draft.lat) ? [draft.lng, draft.lat] : [c.lng, c.lat];
  const zoom = Number.isFinite(draft.zoom) ? draft.zoom : Math.max(exploreMap.getZoom(), 3);
  pinMap = new maplibregl.Map({ container: el, style: BASEMAP_STYLE, center, zoom, dragRotate: false, pitchWithRotate: false,
    attributionControl: { compact: true }, fadeDuration: 0 });
  pinMap.touchZoomRotate.disableRotation();
  pinMap.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  pinMap.once('style.load', () => { try{ warmBasemap(pinMap); }catch(err){ console.warn('Could not warm the pin map', err); } });
  pinMap.on('moveend', onMove);
  pinMap.once('load', onMove);
}
function destroyPinMap(){ if(pinMap){ pinMap.remove(); pinMap = null; } }

function locate(){
  if(!navigator.geolocation){ showToast('Location is not available in this browser'); return; }
  navigator.geolocation.getCurrentPosition(
    pos => { if(pinMap) pinMap.jumpTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: Math.max(pinMap.getZoom(), 16) }); },
    () => showToast("Couldn't get your location — move the map instead"),
    { enableHighAccuracy: true, timeout: 10000 });
}

function focusFirstMissing(){
  const zoomOk = zoomNow() >= PIN_ZOOM;
  const el = !zoomOk ? document.querySelector('#view [data-add-map] canvas')
    : !draft.name.trim() ? $('add-name') : !draft.types.length ? document.querySelector('#view [data-add-type]') : null;
  if(el) el.focus();
}

async function submit(){
  if(busy) return;
  if(stepOneMissing(draft, zoomNow()).length){
    if(draft.step !== 1){ draft.step = 1; renderStep(); }
    updateHint(); focusFirstMissing(); return;
  }
  if(areaMissing(draft).length){
    draft.step = 2; renderStep(); saveDraft();
    const s = $('add-suburb'); if(s) s.focus();
    return;
  }
  const photo = draft.photo.trim();
  if(photo && !safeUrl(photo)){ showToast('Photo link must be a full http:// or https:// address'); return; }
  const user = window.auth && window.auth.user;
  if(!user){ saveDraft(); showToast('Sign in to submit — your draft stays on this device'); openAuthModal(); return; }
  if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
  busy = true; renderStep();
  try{
    // A friendlier message in front of the RLS limit (10 a day), which is the real enforcement.
    const dayAgo = new Date(Date.now() - 24*60*60*1000).toISOString();
    const { count, error: countError } = await window.sb.from('spots').select('id', { count: 'exact', head: true }).eq('submitted_by', user.id).gte('created_at', dayAgo);
    if(!countError && count >= 10){ showToast("You've reached today's limit of 10 submissions — try again tomorrow."); return; }
    const { country, state } = countryState(draft);
    const { error } = await window.sb.from('spots').insert({
      id: 'community-' + (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now()),
      name: draft.name.trim(), suburb: draft.suburb.trim(), state, country, types: draft.types.slice(),
      address: draft.address.trim() || null, notes: draft.notes.trim() || null, photo: photo ? safeUrl(photo) : null,
      lat: draft.lat, lng: draft.lng, submitted_by: user.id, community: true, edited: false, status: 'pending',
    });
    if(error) throw error;
    done = true;
    const { lat, lng, zoom } = draft;
    draft = { ...blank(), lat, lng, zoom };
    clearDraft();
    appState.myCommunity = null;          // /me reloads the submissions list
  }catch(err){
    const rlsRejected = /row-level security|permission denied/i.test((err && err.message) || '');
    showToast(rlsRejected ? "Couldn't save — you may have reached today's submission limit." : submitErrorMessage(err, 'Could not save — try again'));
    console.error(err);
  }finally{
    busy = false;
    if(onAdd()) renderStep();
  }
}

function enter(params, view){
  setPageTitle('Add a gym');
  view.innerHTML = addPageHtml();
  mountPinMap(view.querySelector('[data-add-map]'));
  renderStep();
  updateNear();
}

function leave(){
  saveDraft();
  destroyPinMap();
  done = false;
}

export function initAddPage(){
  draft = loadDraft();
  registerView('add', { enter, leave });
  const view = $('view');
  const onField = (e) => {
    if(!onAdd()) return;
    const f = e.target.closest('[data-add-field]');
    const t = e.target.closest('[data-add-type]');
    if(f){
      const key = f.dataset.addField;
      if(!TEXT.includes(key)) return;
      draft[key] = f.value;
      if(AREA_FIELDS.includes(key)) draft.areaEdited = true;
      if(key === 'country' && e.type === 'change'){ draft.state = ''; renderStep(); $('add-country').focus(); }
    } else if(t){
      draft.types = ALL_TYPES.filter(x => (x === t.dataset.addType ? t.checked : draft.types.includes(x)));
    } else return;
    updateNear();
    updateHint();
    saveDraft();
  };
  view.addEventListener('input', onField);
  view.addEventListener('change', onField);
  view.addEventListener('submit', (e) => { if(onAdd() && e.target.id === 'addForm'){ e.preventDefault(); submit(); } });
  view.addEventListener('click', (e) => {
    if(!onAdd()) return;
    const btn = e.target.closest('[data-add-action]');
    if(!btn) return;
    const action = btn.dataset.addAction;
    if(action === 'locate') locate();
    else if(action === 'details'){ draft.step = 2; renderStep(); saveDraft(); const s = $('add-suburb'); if(s) s.focus(); }
    else if(action === 'back'){ draft.step = 1; renderStep(); saveDraft(); const n = $('add-name'); if(n) n.focus(); }
    else if(action === 'another'){ done = false; draft.step = 1; renderStep(); const n = $('add-name'); if(n) n.focus(); }
  });
}
