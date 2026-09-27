// /me/passport (DESIGN.md sec. 11.3): the stat line, one stamp per city (most recent first) and the recent check-ins;
// tapping a stamp filters the rows to that city. Empty: the traveller and "Your first stamp is one check-in away."
// Markup is stamp-html.js (pure); rules are passport.js (pure).
import { openAuthModal } from './auth-ui.js';
import { loadCheckins } from './checkin.js';
import { cityKey, passportStats, stamps, statsLine } from './passport.js';
import { pageSkeletonHtml } from './page-html.js';
import { refreshPage, registerView, setPageTitle, currentRoute } from './router.js';
import { gymPath } from './slug.js';
import { niceDate, passportPageHtml } from './stamp-html.js';
import { appState } from './state.js';

const ROW_LIMIT = 60;
let filter = '';

function enter(params, view){
  setPageTitle('Passport');
  if(!appState.loaded){ view.innerHTML = pageSkeletonHtml(); return; }
  if(!window.auth.user){ view.innerHTML = passportPageHtml({ signedIn: false }); return; }
  if(!appState.checkinsLoaded){
    view.innerHTML = pageSkeletonHtml();
    loadCheckins().then(() => { if(currentRoute() && currentRoute().name === 'passport') refreshPage(); });
    return;
  }
  const spotById = new Map(appState.spots.map(s => [s.id, s]));
  const all = stamps(appState.checkins, spotById);
  if(filter && !all.some(s => s.key === filter)) filter = '';
  const rows = appState.checkins
    .map(c => ({ c, g: spotById.get(c.spot_id) }))
    .filter(x => x.g && (!filter || cityKey(x.g) === filter))
    .slice(0, ROW_LIMIT)
    .map(({ c, g }) => ({ g, ctx: { href: gymPath(g), city: g.suburb, date: niceDate(c.checked_at), note: c.note || '' } }));
  const current = all.find(s => s.key === filter);
  view.innerHTML = passportPageHtml({
    signedIn: true,
    stats: statsLine(passportStats(appState.checkins, spotById)),
    stamps: all,
    rows,
    filter,
    filterLabel: current ? current.city : '',
  });
}

export function initPassportPage(){
  registerView('passport', { enter, leave(){ filter = ''; } });
  document.getElementById('view').addEventListener('click', (e) => {
    const r = currentRoute();
    if(!r || r.name !== 'passport') return;
    const cityBtn = e.target.closest('[data-passport-city]');
    if(cityBtn){ const k = cityBtn.dataset.passportCity; filter = k && k !== filter ? k : ''; refreshPage(); return; }
    if(e.target.closest('[data-page-action="sign-in"]')) openAuthModal();
  });
}
