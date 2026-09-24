// Personal logbook: sessions list + "Log a session" form.
import { MOOD_EMOJI, TYPE_LABELS } from './constants.js';
import { appState } from './state.js';
import { escapeHtml, showToast } from './utils.js';

// --- logbook: private per-user climbing diary (sessions + the climbs logged within each) ---
async function loadSessions(){
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
  }catch(err){
    console.error('Failed to load sessions', err);
  }
}

function spotLabel(spotId){
  if(!spotId) return 'No specific gym';
  const g = appState.spots.find(s=>s.id===spotId) || (window.SEED_GYMS||[]).find(s=>s.id===spotId);
  return g ? g.name : 'Unknown gym';
}

function renderLogbookList(){
  const list = document.getElementById('logbookList');
  if(!appState.sessions.length){
    list.innerHTML = '<div class="empty-state">No sessions logged yet — click "Log a session" to start your diary.</div>';
    return;
  }
  list.innerHTML = appState.sessions.map(s=>{
    const climbs = s.session_climbs || [];
    const chips = climbs.map(c=>`<span class="climb-chip ${c.sent?'sent':''}">${escapeHtml(TYPE_LABELS[c.climb_type]||c.climb_type)} ${escapeHtml(c.grade)}${c.attempts>1?` ×${escapeHtml(c.attempts)}`:''}</span>`).join('');
    return `<div class="session-item" data-id="${escapeHtml(s.id)}">
        <div class="pending-kind">${escapeHtml(s.session_date)} · ${escapeHtml(MOOD_EMOJI[s.mood]||'')} ${escapeHtml(spotLabel(s.spot_id))}</div>
        ${chips ? `<div class="climb-chips">${chips}</div>` : '<div class="pending-notes">No climbs logged this session.</div>'}
        ${s.notes ? `<div class="pending-notes">${escapeHtml(s.notes)}</div>` : ''}
        <div class="pending-actions">
          <button class="btn-danger session-delete" data-id="${escapeHtml(s.id)}">Delete</button>
        </div>
      </div>`;
  }).join('');
}

const logbookModalBackdrop = document.getElementById('logbookModalBackdrop');
async function openLogbookModal(){
  if(!window.auth.user){ showToast('Sign in to use your logbook'); return; }
  await loadSessions();
  renderLogbookList();
  logbookModalBackdrop.classList.remove('hidden');
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
        <button type="button" class="remove-climb-btn" title="Remove">✕</button>
      </div>`).join('');
}

function addClimbRow(){
  appState.draftClimbs.push({climb_type:'indoor-bouldering', grade:'', attempts:1, sent:true});
  renderClimbRows();
}

function openAddSessionModal(){
  populateGymSelect();
  document.getElementById('sDate').value = new Date().toISOString().slice(0,10);
  document.getElementById('sMood').value = 'good';
  document.getElementById('sGym').value = '';
  document.getElementById('sNotes').value = '';
  appState.draftClimbs = [];
  addClimbRow();
  logbookModalBackdrop.classList.add('hidden');
  addSessionModalBackdrop.classList.remove('hidden');
}

function closeAddSessionModal(){
  addSessionModalBackdrop.classList.add('hidden');
  logbookModalBackdrop.classList.remove('hidden');
}

export function initLogbook(){
  logbookModalBackdrop.addEventListener('click', (e)=>{
    if(e.target === logbookModalBackdrop) logbookModalBackdrop.classList.add('hidden');
  });
  document.getElementById('logbookBtn').addEventListener('click', openLogbookModal);

  document.getElementById('logbookList').addEventListener('click', async (e)=>{
    const btn = e.target.closest('.session-delete');
    if(!btn) return;
    btn.disabled = true;
    try{
      const {error} = await window.sb.from('sessions').delete().eq('id', btn.dataset.id);
      if(error) throw error;
      showToast('Session deleted');
    }catch(err){
      showToast('Could not delete — try again');
      console.error(err);
    }
    await loadSessions();
    renderLogbookList();
  });
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
  document.getElementById('addSessionBtn').addEventListener('click', openAddSessionModal);
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
      showToast('Session saved ✓');
      closeAddSessionModal();
      await loadSessions();
      renderLogbookList();
    }catch(err){
      showToast('Could not save session — try again');
      console.error(err);
    }
    saveBtn.disabled = false;
  });
}
