// Personal logbook: loading sessions, the session list markup for the /log page (log-page.js), and the "Log a session"
// dialog (opened from /log and from START).
import { showMilestones } from './milestone-sheet.js';
import { newTopGrade } from './passport.js';
import { firstRunArt } from './brand.js';
import { MOODS, TYPE_LABELS } from './constants.js';
import { icon } from './icons.js';
import { refreshPage } from './router.js';
import { appState } from './state.js';
import { escapeHtml, showToast } from './utils.js';

// --- logbook: private per-user climbing diary (sessions + the climbs logged within each) ---
export async function loadSessions(){
  appState.sessions = [];
  const user = window.auth.user;
  if(!user || !window.sb) return;
  try{
    const {data, error} = await window.sb.from('sessions')
      .select('*, session_climbs(*)')
      .eq('user_id', user.id)
      .order('session_date', {ascending:false});
    if(error) throw error;
    appState.sessions = data || [];
    appState.sessionsLoaded = true;
  }catch(err){
    console.error('Failed to load sessions', err);
  }
}

function spotLabel(spotId){
  if(!spotId) return 'No specific gym';
  const g = appState.spots.find(s=>s.id===spotId) || (window.SEED_GYMS||[]).find(s=>s.id===spotId);
  return g ? g.name : 'Unknown gym';
}

// The /log page's session list (dense, newest first). Delete is .btn-danger and never a close control.
export function sessionsHtml(sessions = appState.sessions){
  if(!sessions.length){
    // First run by definition: the list holds every session this person has logged.
    return '<div class="empty-state">' + firstRunArt('log') + '<p class="empty-title">No sessions yet</p><p>Log your first session to start your diary.</p></div>';
  }
  return sessions.map(s=>{
    const climbs = s.session_climbs || [];
    const chips = climbs.map(c=>`<span class="climb-chip ${c.sent?'sent':''}">${escapeHtml(TYPE_LABELS[c.climb_type]||c.climb_type)} ${escapeHtml(c.grade)}${c.attempts>1?` ×${escapeHtml(c.attempts)}`:''}</span>`).join('');
    return `<div class="session-item" data-id="${escapeHtml(s.id)}">
        <div class="pending-kind"><span class="tnum">${escapeHtml(s.session_date)}</span> · ${moodHtml(s.mood)} · ${escapeHtml(spotLabel(s.spot_id))}</div>
        ${chips ? `<div class="climb-chips">${chips}</div>` : '<div class="pending-notes">No climbs logged this session.</div>'}
        ${s.notes ? `<div class="pending-notes">${escapeHtml(s.notes)}</div>` : ''}
        <div class="pending-actions">
          <button type="button" class="btn btn-tertiary btn-sm btn-danger session-delete" data-id="${escapeHtml(s.id)}">Delete</button>
        </div>
      </div>`;
  }).join('');
}

// Mood: icon + text label from a fixed table; an unknown stored value shows nothing rather than raw text.
function moodHtml(mood){
  const m = MOODS[mood];
  return m ? `<span class="mood">${icon(m.icon, {size:'sm'})}${escapeHtml(m.label)}</span>` : '';
}

// --- logbook: "Log a session" form ---
const addSessionModalBackdrop = document.getElementById('addSessionModalBackdrop');
const sClimbsList = document.getElementById('sClimbsList');

function populateGymSelect(){
  if(appState.gymSelectPopulated) return;
  const sel = document.getElementById('sGym');
  const sorted = appState.spots.slice().sort((a,b)=>a.name.localeCompare(b.name));
  sorted.forEach(g=>{
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = `${g.name} — ${g.suburb}`;
    sel.appendChild(opt);
  });
  appState.gymSelectPopulated = true;
}

function renderClimbRows(){
  sClimbsList.innerHTML = appState.draftClimbs.map((c, i)=>`
      <div class="climb-row" data-index="${i}">
        <select class="climb-type" data-field="climb_type">
          <option value="indoor-bouldering" ${c.climb_type==='indoor-bouldering'?'selected':''}>Boulder</option>
          <option value="top-rope" ${c.climb_type==='top-rope'?'selected':''}>Top rope</option>
          <option value="lead-climbing" ${c.climb_type==='lead-climbing'?'selected':''}>Lead</option>
        </select>
        <input type="text" class="climb-grade" data-field="grade" placeholder="Grade, e.g. V2" value="${escapeHtml(c.grade||'')}">
        <input type="number" class="climb-attempts" data-field="attempts" min="1" value="${Number(c.attempts)||1}" title="Attempts">
        <label class="climb-sent"><input type="checkbox" data-field="sent" ${c.sent?'checked':''}> Sent</label>
        <button type="button" class="btn btn-tertiary btn-icon btn-sm remove-climb-btn" title="Remove this climb" aria-label="Remove this climb">${icon('x', {size:'sm'})}</button>
      </div>`).join('');
}

function addClimbRow(){
  appState.draftClimbs.push({climb_type:'indoor-bouldering', grade:'', attempts:1, sent:true});
  renderClimbRows();
}

function openAddSessionModal(spotId){
  populateGymSelect();
  document.getElementById('sDate').value = new Date().toISOString().slice(0,10);
  document.getElementById('sMood').value = 'good';
  document.getElementById('sGym').value = spotId && appState.spots.some(s => s.id === spotId) ? spotId : '';
  document.getElementById('sNotes').value = '';
  appState.draftClimbs = [];
  addClimbRow();
  addSessionModalBackdrop.classList.remove('hidden');
}

// START (mobile tab bar) and the /log page: "Log a session". Signed-in only, like the logbook itself.
// opts.spotId: pre-select the gym ("Log this session" after a check-in, sec. 11.1).
export function startLogSession(opts = {}){
  if(!window.auth.user){ showToast('Sign in to log a session'); return; }
  openAddSessionModal(opts.spotId);
}

function closeAddSessionModal(){
  addSessionModalBackdrop.classList.add('hidden');
}

// Delete a session (the /log page's Delete buttons).
export async function deleteSession(id, btn){
  if(btn) btn.disabled = true;
  try{
    const {error} = await window.sb.from('sessions').delete().eq('id', id);
    if(error) throw error;
    showToast('Session deleted');
  }catch(err){
    showToast('Could not delete — try again');
    console.error(err);
  }
  await loadSessions();
  refreshPage();
}

export function initLogbook(){
  addSessionModalBackdrop.addEventListener('click', (e)=>{
    if(e.target === addSessionModalBackdrop) closeAddSessionModal();
  });

  sClimbsList.addEventListener('input', (e)=>{
    const row = e.target.closest('.climb-row');
    if(!row) return;
    const i = Number(row.dataset.index);
    const field = e.target.dataset.field;
    if(!field) return;
    if(field === 'attempts') appState.draftClimbs[i][field] = Math.max(1, Number(e.target.value)||1);
    else if(field === 'sent') appState.draftClimbs[i][field] = e.target.checked;
    else appState.draftClimbs[i][field] = e.target.value;
  });
  sClimbsList.addEventListener('click', (e)=>{
    if(!e.target.closest('.remove-climb-btn')) return;
    const row = e.target.closest('.climb-row');
    appState.draftClimbs.splice(Number(row.dataset.index), 1);
    renderClimbRows();
  });
  document.getElementById('sAddClimbBtn').addEventListener('click', addClimbRow);
  document.getElementById('sCancelBtn').addEventListener('click', closeAddSessionModal);

  document.getElementById('sSaveBtn').addEventListener('click', async ()=>{
    const date = document.getElementById('sDate').value;
    if(!date){ showToast('Pick a date first'); return; }
    const saveBtn = document.getElementById('sSaveBtn');
    saveBtn.disabled = true;
    try{
      const {data: session, error: e1} = await window.sb.from('sessions').insert({
        user_id: window.auth.user.id,
        spot_id: document.getElementById('sGym').value || null,
        session_date: date,
        mood: document.getElementById('sMood').value,
        notes: document.getElementById('sNotes').value.trim() || null
      }).select().single();
      if(e1) throw e1;
      const climbRows = appState.draftClimbs.filter(c=>c.grade.trim());
      if(climbRows.length){
        const {error: e2} = await window.sb.from('session_climbs').insert(climbRows.map(c=>({
          session_id: session.id,
          climb_type: c.climb_type,
          grade: c.grade.trim(),
          grade_system: c.climb_type === 'indoor-bouldering' ? 'v-scale' : 'yds',
          attempts: c.attempts,
          sent: c.sent
        })));
        if(e2) throw e2;
      }
      showToast('Session saved');
      closeAddSessionModal();
      const before = (appState.sessions || []).filter(s => s.id !== session.id).flatMap(s => s.session_climbs || []);
      await loadSessions();
      refreshPage();
      // A new highest sent grade (sec. 12.3): the dyno milestone, once per session like every milestone.
      const top = newTopGrade(before, climbRows.map(c => ({ grade: c.grade.trim(), grade_system: c.climb_type === 'indoor-bouldering' ? 'v-scale' : 'yds', sent: c.sent })));
      if(top) showMilestones([top], { title: top.title, place: 'Bouldeer logbook', date: new Date().toISOString(), seed: top.title });
    }catch(err){
      showToast('Could not save session — try again');
      console.error(err);
    }
    saveBtn.disabled = false;
  });
}
