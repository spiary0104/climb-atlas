// Check-in -> stamp -> passport (DESIGN.md sec. 11.1; owner decisions 2026-09-27):
//   * Phones (coarse pointer) ask for location when "Check in" is tapped: within 500 m checks in directly; farther is
//     refused with the distance. Desktop, or location denied/unavailable, asks the person to confirm "I'm here".
//   * The check-in sheet: gym, date, an optional 140-character note (no photo), "Stamp it". The row is inserted into
//     `checkins` (RLS: own rows; the server pins who/when, refuses a repeat within 12 hours and adds the climbed mark).
//   * The stamp lands (320 ms, static under reduced motion), then one passport sentence and Log this session · Share ·
//     Done. When the sheet closes, the milestone sheet shows if this check-in earned one (once per session).
// START on phones opens a small sheet: "Check in at <gym>" (the gym page or selected gym) or "nearby", and "Log a session".
import { openAuthModal } from './auth-ui.js';
import { COUNTRY_LABELS } from './constants.js';
import { distanceKm, formatDistance } from './geo.js';
import { startLogSession } from './logbook.js';
import { markAdded } from './marks.js';
import { showMilestones } from './milestone-sheet.js';
import { homeFromLocale, milestonesFor, passportLine } from './passport.js';
import { currentRoute, refreshPage } from './router.js';
import { shareCard } from './share-card.js';
import { checkinSheetHtml, niceDate, stampedHtml } from './stamp-html.js';
import { appState } from './state.js';
import { showToast } from './utils.js';

export const GEOFENCE_KM = 0.5;
const REPEAT_MS = 12 * 60 * 60 * 1000;
const $ = id => document.getElementById(id);
const backdrop = $('checkinModalBackdrop');
const body = $('checkinBody');
let current = null;          // {g, mode, distance, checkin, milestones}
const countryName = c => COUNTRY_LABELS[c] || c;

const missingTable = err => !!err && (err.code === 'PGRST205' || err.code === '42P01' || /does not exist|schema cache/i.test(err.message || ''));

// The signed-in person's check-ins, newest first. Fails soft: before the migration exists, check-in says so.
export async function loadCheckins(){
  appState.checkins = [];
  if(!window.sb || !window.auth.user){ appState.checkinsLoaded = true; return; }
  try{
    const { data, error } = await window.sb.from('checkins').select('id, spot_id, checked_at, note').order('checked_at', { ascending: false }).limit(2000);
    if(error) throw error;
    appState.checkins = data || [];
    appState.checkinsAvailable = true;
  }catch(err){
    appState.checkinsAvailable = !missingTable(err);
    if(!missingTable(err)) console.warn('Check-ins unavailable', err);
  }
  appState.checkinsLoaded = true;
}

export const checkedInRecently = (spotId, now = Date.now()) =>
  (appState.checkins || []).some(c => c.spot_id === spotId && now - Date.parse(c.checked_at) < REPEAT_MS);

const coarsePointer = () => window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
function locate(){
  return new Promise(resolve => {
    if(!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }), () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  });
}

function open(html){ body.innerHTML = html; backdrop.classList.remove('hidden'); }

export async function startCheckin(spotId){
  const g = appState.spots.find(s => s.id === spotId);
  if(!g) return;
  if(!window.auth.user){ showToast('Sign in to check in and collect stamps'); openAuthModal(); return; }
  if(!window.sb){ showToast('Supabase is not configured — see README.md'); return; }
  if(!appState.checkinsLoaded) await loadCheckins();
  if(appState.checkinsAvailable === false){ showToast('Check-ins are not switched on yet'); return; }
  if(checkedInRecently(g.id)){ showToast('Already checked in here today'); return; }
  let mode = 'confirm', distance = '';
  if(coarsePointer()){
    const here = await locate();
    if(here){
      const km = distanceKm(here, g);
      if(km > GEOFENCE_KM){ showToast(`You’re ${formatDistance(km)} from ${g.name}. Check in when you get there.`); return; }
      mode = 'near'; distance = formatDistance(km);
    }
  }
  current = { g, mode, distance };
  open(checkinSheetHtml(g, { mode, distance, date: niceDate(new Date().toISOString()) }));
}

async function stamp(btn){
  const { g, mode } = current;
  const here = $('ciHere');
  if(mode === 'confirm' && here && !here.checked){
    here.setAttribute('aria-invalid', 'true'); here.focus();
    showToast('Confirm you’re at the gym to check in');
    return;
  }
  const note = ($('ciNote').value || '').trim().slice(0, 140) || null;
  btn.disabled = true; btn.textContent = 'Stamping…';
  const { data, error } = await window.sb.from('checkins').insert({ spot_id: g.id, note }).select('id, spot_id, checked_at, note').single();
  if(error){
    btn.disabled = false; btn.textContent = 'Stamp it';
    if(missingTable(error)){ appState.checkinsAvailable = false; showToast('Check-ins are not switched on yet'); }
    else if(/already checked in/i.test(error.message || '')) showToast('Already checked in here today');
    else if(/row-level security|permission/i.test(error.message || '')) showToast('Could not check in: you may have reached today’s limit');
    else { showToast('Could not check in — try again'); console.error(error); }
    return;
  }
  appState.checkins.unshift(data);
  markAdded(g.id, 'climbed');                 // the server added the climbed mark with the check-in
  const spotById = new Map(appState.spots.map(s => [s.id, s]));
  current.checkin = data;
  current.milestones = milestonesFor(appState.checkins, data, spotById, { home: homeFromLocale(navigator.language), countryName });
  body.innerHTML = stampedHtml(g, data, passportLine(appState.checkins, data, spotById, countryName));
  const svg = body.querySelector('.stamp');
  if(svg) svg.classList.add('stamp--landing');
  refreshPage();                              // the gym page now reads "Checked in today"
}

const cardFor = c => ({ title: c.g.name, place: [c.g.suburb, countryName(c.g.country)].filter(Boolean).join(', '), date: c.checkin.checked_at, seed: c.g.id });

function close(){
  backdrop.classList.add('hidden');
  const done = current;
  current = null;
  if(done && done.checkin) showMilestones(done.milestones, cardFor(done));
}

// ----- START (phones): check in here / log a session -----
const startBackdrop = $('startModalBackdrop');
function contextGym(){
  const r = currentRoute();
  if(r && r.name === 'gym') return appState.bySlug.get(r.params.slug) || appState.spots.find(s => s.id === r.params.slug) || null;
  if(appState.selectedId) return appState.spots.find(s => s.id === appState.selectedId) || null;
  return null;
}
export function openStartSheet(){
  const g = contextGym();
  $('startCheckinLabel').textContent = g ? 'Check in at ' + g.name : 'Check in nearby';
  startBackdrop.dataset.spotId = g ? g.id : '';
  startBackdrop.classList.remove('hidden');
}
async function checkInNearby(){
  const here = await locate();
  if(!here){ showToast('Open a gym’s page to check in there'); return; }
  let best = null;
  for(const s of appState.spots){ const d = distanceKm(here, s); if(!best || d < best.d) best = { s, d }; }
  if(!best || best.d > GEOFENCE_KM){ showToast('No gym within 500 m. Open a gym’s page to check in.'); return; }
  startCheckin(best.s.id);
}

export function initCheckin(){
  backdrop.addEventListener('click', (e) => {
    if(e.target === backdrop) return close();
    const btn = e.target.closest('[data-ci-action]');
    if(!btn || !current) return;
    switch(btn.dataset.ciAction){
      case 'cancel': case 'done': close(); break;
      case 'stamp': stamp(btn); break;
      case 'log': { const id = current.g.id; close(); startLogSession({ spotId: id }); break; }
      case 'share': shareCard(cardFor(current)); break;
    }
  });
  body.addEventListener('input', (e) => {
    if(e.target.id === 'ciNote') $('ciCount').textContent = e.target.value.length + ' / 140';
    if(e.target.id === 'ciHere') e.target.removeAttribute('aria-invalid');
  });
  $('checkinClose').addEventListener('click', close);
  startBackdrop.addEventListener('click', (e) => {
    if(e.target === startBackdrop){ startBackdrop.classList.add('hidden'); return; }
    const btn = e.target.closest('[data-start-action]');
    if(!btn) return;
    const id = startBackdrop.dataset.spotId;
    startBackdrop.classList.add('hidden');
    if(btn.dataset.startAction === 'log') startLogSession();
    else if(btn.dataset.startAction === 'checkin') (id ? startCheckin(id) : checkInNearby());
  });
  $('startClose').addEventListener('click', () => startBackdrop.classList.add('hidden'));
}
