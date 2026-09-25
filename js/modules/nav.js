// App navigation chrome (DESIGN.md sec. 6.4 / 6.5): the desktop/tablet top bar, the mobile tab bar with START, and the Me menu.
// Phase 1 wires the five areas to what exists today; Phase 3 turns them into real pages:
//   Explore -> the map (closes the list drawer and the menu)      Regions -> the region list in the list pane
//   Log     -> the logbook dialog                                  Me      -> menu: Saved, Add a gym, Pending review, About, account
//   START   -> "Log a session" (check-in arrives in Phase 5)
// Every control is a [data-nav] button handled by one delegated listener; no inline handlers, no globals.
import { openLogbookModal, startLogSession } from './logbook.js';
import { startAddGym } from './modals.js';

const DRAWER_QUERY = '(max-width: 760px)';       // matches the drawer breakpoint in css/style.css

const sidebar = document.getElementById('sidebar');
const meMenu = document.getElementById('meMenu');

const isDrawerMode = () => window.matchMedia(DRAWER_QUERY).matches;
const meControls = () => document.querySelectorAll('[data-nav="me"]');
const regionControls = () => document.querySelectorAll('[data-nav="regions"]');

function setMenuOpen(open){
  meMenu.classList.toggle('open', open);
  meControls().forEach(el => el.setAttribute('aria-expanded', String(open)));
  if(open){
    const first = meMenu.querySelector('button:not([disabled]):not(.init-hidden), a[href]');
    if(first) first.focus();
  }
}

function setDrawerOpen(open){
  sidebar.classList.toggle('open', open);
}

// Keep aria-expanded on the Regions controls true to the drawer, whoever opened or closed it (sidebar.js also does).
// (Only in drawer mode: on wide screens the list pane is always visible, so there is nothing to expand.)
function syncRegionControls(){
  const drawer = isDrawerMode();
  const open = drawer && sidebar.classList.contains('open');
  regionControls().forEach(el => drawer ? el.setAttribute('aria-expanded', String(open)) : el.removeAttribute('aria-expanded'));
}

function showRegions(){
  if(isDrawerMode()) setDrawerOpen(!sidebar.classList.contains('open'));
  const list = document.getElementById('stateChips');
  if(list){
    list.scrollIntoView({block:'start'});
    const first = list.querySelector('.region-header');
    if(first && !isDrawerMode()) first.focus({preventScroll:true});
  }
}

const ACTIONS = {
  explore(){ setDrawerOpen(false); },
  regions(){ showRegions(); },
  log(){ setDrawerOpen(false); openLogbookModal(); },
  start(){ setDrawerOpen(false); startLogSession(); },
  me(){ setMenuOpen(!meMenu.classList.contains('open')); },
  'add-gym'(){ setDrawerOpen(false); startAddGym(); },
};

export function initNavigation(){
  document.addEventListener('click', (e)=>{
    const control = e.target.closest('[data-nav]');
    if(control && ACTIONS[control.dataset.nav]){
      if(control.dataset.nav !== 'me') setMenuOpen(false);
      ACTIONS[control.dataset.nav]();
      return;
    }
    // Any other click inside the menu (Saved, About, Sign in/out) completes the action and closes it; a click outside closes it.
    if(meMenu.classList.contains('open') && (!e.target.closest('#meMenu') || e.target.closest('#meMenu button, #meMenu a'))){
      setMenuOpen(false);
    }
  });
  // Escape closes the menu (the topmost layer) and returns focus to the control that opened it. Dialog Escape handling stays in modals.js.
  document.addEventListener('keydown', (e)=>{
    if(e.key !== 'Escape' || !meMenu.classList.contains('open')) return;
    setMenuOpen(false);
    const opener = [...meControls()].find(el => el.offsetParent !== null);
    if(opener) opener.focus();
  });
  new MutationObserver(syncRegionControls).observe(sidebar, {attributes:true, attributeFilter:['class']});
  window.matchMedia(DRAWER_QUERY).addEventListener('change', ()=>{ if(!isDrawerMode()) setDrawerOpen(false); syncRegionControls(); });
  syncRegionControls();
}
