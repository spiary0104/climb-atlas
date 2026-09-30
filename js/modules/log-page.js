// /log (DESIGN.md sec. 6.1, 14): the signed-in user's session diary as a page, replacing the Logbook dialog. A month
// calendar marks session days; the list is the existing logbook re-skinned. "Log a session" opens the existing dialog.
import { openAuthModal } from './auth-ui.js';
import { deleteSession, loadSessions, sessionsHtml, startLogSession } from './logbook.js';
import { calendarHtml, logPageHtml, pageSkeletonHtml } from './page-html.js';
import { currentRoute, refreshPage, registerView, setPageTitle } from './router.js';
import { appState } from './state.js';

let month = null;                     // {y, m} shown in the calendar; defaults to the current month

const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

function enter(params, view){
  setPageTitle('Log');
  if(!window.auth.user){ view.innerHTML = logPageHtml({ signedIn: false }); return; }
  if(!appState.sessionsLoaded){
    appState.sessionsLoaded = true;   // set first: a failed load must not loop through refreshPage
    view.innerHTML = pageSkeletonHtml();
    loadSessions().then(refreshPage);
    return;
  }
  if(!month){ const d = new Date(); month = { y: d.getFullYear(), m: d.getMonth() }; }
  const counts = new Map();
  for(const s of appState.sessions) counts.set(s.session_date, (counts.get(s.session_date) || 0) + 1);
  view.innerHTML = logPageHtml({ signedIn: true, count: appState.sessions.length, calendar: calendarHtml(month.y, month.m, counts, todayKey()), sessions: sessionsHtml() });
}

export function initLogPage(){
  registerView('log', { enter });
  document.getElementById('view').addEventListener('click', (e)=>{
    if(!currentRoute() || currentRoute().name !== 'log') return;
    const del = e.target.closest('.session-delete');
    if(del){ deleteSession(del.dataset.id, del); return; }
    const btn = e.target.closest('[data-page-action]');
    if(!btn) return;
    switch(btn.dataset.pageAction){
      case 'sign-in': openAuthModal(); break;
      case 'log-session': startLogSession(); break;
      case 'cal-prev': month = { y: month.m ? month.y : month.y - 1, m: (month.m + 11) % 12 }; refreshPage(); break;
      case 'cal-next': month = { y: month.m === 11 ? month.y + 1 : month.y, m: (month.m + 1) % 12 }; refreshPage(); break;
    }
  });
}
