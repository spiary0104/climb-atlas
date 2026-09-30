// /mod (DESIGN.md sec. 10.5): the moderation queue as a page, replacing the Pending-review dialog. One queue, oldest
// first: new gyms, edits, reports. A row opens the side panel (diff, note, corrections, reason). Keyboard: J/K move,
// Enter opens, A approves, R opens the reason field (it never rejects by itself), Escape closes the panel and does
// nothing else. Moderators only; everyone else gets a plain "moderators only" page.
import { openEditModal } from './modals.js';
import { approveEdit, approveSpot, dismissReport, rejectEdit, rejectSpot } from './moderation.js';
import { modPageHtml, modPanelHtml, modQueueHtml } from './moderation-html.js';
import { levelFor, formatRelative } from './provenance.js';
import { currentRoute, refreshPage, registerView, setPageTitle } from './router.js';
import { gymPath } from './slug.js';
import { appState } from './state.js';

let items = [];
let selected = 0;
let open = false;
let busy = false;
const contributors = new Map();      // user id -> {name, level}
let fetching = false;

const isMod = () => currentRoute() && currentRoute().name === 'mod';

function buildItems(){
  const spotById = new Map(appState.spots.map(g => [g.id, g]));
  const list = [
    ...appState.pendingSpots.map(s => ({ kind: 'spot', id: s.id, spotId: s.id, name: s.name, by: s.submitted_by, at: s.created_at, row: s })),
    ...appState.pendingEdits.map(e => { const cur = spotById.get(e.spot_id); return { kind: 'edit', id: e.id, spotId: e.spot_id, name: cur ? cur.name : e.name, by: e.submitted_by, at: e.submitted_at, row: e, current: cur || null }; }),
    ...appState.pendingReports.map(r => { const cur = spotById.get(r.spot_id); return { kind: 'report', id: r.id, spotId: r.spot_id, name: cur ? cur.name : r.spot_id, by: null, at: r.created_at, row: r }; }),
  ];
  return list.sort((a, b) => String(a.at || '').localeCompare(String(b.at || '')));
}

function whoFor(it){
  if(it.kind === 'report') return { contributor: 'From a visitor', level: null };
  if(!it.by) return { contributor: 'Not signed in', level: null };
  const c = contributors.get(it.by);
  return { contributor: (c && c.name) || 'a climber', level: c ? c.level : null };
}

// Display names and levels for everyone in the queue (profiles are public; points need the moderator RPC).
async function loadContributors(){
  const ids = [...new Set(items.map(i => i.by).filter(Boolean))].filter(id => !contributors.has(id));
  if(!ids.length || !window.sb || fetching) return;
  fetching = true;
  try{
    const [profiles, points] = await Promise.all([
      window.sb.from('profiles').select('user_id, display_name').in('user_id', ids),
      window.sb.rpc('contribution_points', { p_users: ids }),
    ]);
    const names = new Map((profiles.data || []).map(p => [p.user_id, p.display_name]));
    const pts = new Map((points.data || []).map(p => [p.user_id, Number(p.points) || 0]));
    ids.forEach(id => contributors.set(id, { name: names.get(id) || '', level: pts.has(id) ? levelFor(pts.get(id)) : null }));
  }catch(err){ console.warn('Contributor details unavailable', err); }
  fetching = false;
  if(isMod()) refreshPage();
}

function ctxFor(it, i){
  const w = whoFor(it);
  return { index: i, ...w, age: formatRelative(it.at) || '', flagged: !!(it.row && it.row.review_requested), selected: i === selected,
    href: it.spotId ? gymPath(appState.spots.find(g => g.id === it.spotId) || { id: it.spotId }) : '/' };
}

function enter(params, view){
  setPageTitle('Review');
  if(!appState.isModerator){
    view.innerHTML = `<article class="page page-empty"><h1 class="page-title">Moderators only</h1><p class="section-note">This page is for Bouldeer moderators.</p><p><a class="btn btn-secondary" href="/" data-link>Back to the map</a></p></article>`;
    return;
  }
  items = buildItems();
  selected = Math.min(selected, Math.max(0, items.length - 1));
  if(!items.length) open = false;
  const ctxs = items.map(ctxFor);
  const it = items[selected];
  view.innerHTML = modPageHtml({ queue: modQueueHtml(items, ctxs), panel: open && it ? modPanelHtml(it, ctxs[selected]) : '', count: items.length });
  loadContributors();
}

function focusRow(){
  const row = document.querySelector(`#view [data-mod-index="${Number(selected)}"]`);
  if(row) row.focus({ preventScroll: false });
}

function fieldValues(){
  const out = {};
  document.querySelectorAll('#view [data-mod-field]').forEach(el => { out[el.dataset.modField] = el.value; });
  return out;
}

async function act(action){
  const it = items[selected];
  if(!it || busy) return;
  if(action === 'close'){ open = false; refreshPage(); focusRow(); return; }
  if(action === 'edit-spot'){ openEditModal(it.spotId); return; }
  if(action === 'reject'){
    const reasonEl = document.getElementById('modReason');
    const reason = reasonEl ? reasonEl.value.trim() : '';
    // A rejection always carries a reason the contributor will see (sec. 10.5).
    if(!reason){ if(reasonEl){ reasonEl.setAttribute('aria-invalid', 'true'); reasonEl.focus(); } return; }
  }
  busy = true;
  const fields = fieldValues();
  const reason = (document.getElementById('modReason') || {}).value || '';
  if(action === 'approve') await (it.kind === 'spot' ? approveSpot(it.id, fields) : it.kind === 'edit' ? approveEdit(it.id, fields) : Promise.resolve());
  else if(action === 'reject') await (it.kind === 'spot' ? rejectSpot(it.id, reason) : rejectEdit(it.id, reason));
  else if(action === 'dismiss') await dismissReport(it.id);
  busy = false;
  refreshPage();
  focusRow();
}

export function initModPage(){
  registerView('mod', { enter });
  const view = document.getElementById('view');
  view.addEventListener('click', (e)=>{
    if(!isMod()) return;
    const row = e.target.closest('[data-mod-index]');
    if(row){ selected = Number(row.dataset.modIndex) || 0; open = true; refreshPage(); return; }
    const btn = e.target.closest('[data-mod-action]');
    if(btn) act(btn.dataset.modAction);
  });
  document.addEventListener('keydown', (e)=>{
    if(!isMod() || !appState.isModerator || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if(document.querySelector('.modal-backdrop:not(.hidden)')) return;            // a dialog owns the keyboard
    const typing = e.target.closest && e.target.closest('input, textarea, select, [contenteditable]');
    if(e.key === 'Escape'){
      if(open){ e.preventDefault(); open = false; refreshPage(); focusRow(); }    // closes the panel, nothing else
      return;
    }
    if(typing || !items.length) return;
    const key = e.key.toLowerCase();
    if(key === 'j' || key === 'k'){
      e.preventDefault();
      selected = Math.max(0, Math.min(items.length - 1, selected + (key === 'j' ? 1 : -1)));
      refreshPage(); focusRow();
    } else if(e.key === 'Enter' && !open){
      e.preventDefault(); open = true; refreshPage();
    } else if(key === 'a' && items[selected] && items[selected].kind !== 'report'){
      e.preventDefault(); act('approve');
    } else if(key === 'r' && items[selected] && items[selected].kind !== 'report'){
      e.preventDefault();
      open = true; refreshPage();
      const reason = document.getElementById('modReason');
      if(reason) reason.focus();
    }
  });
}
