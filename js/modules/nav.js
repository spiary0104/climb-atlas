// App navigation chrome (DESIGN.md sec. 6.4 / 6.5): the desktop/tablet top bar, the mobile tab bar with START, and the Me menu.
// Wired to what exists until Phase 3 turns the areas into pages:
//   Explore -> the map and list (closes search; the mobile sheet goes to half)   Regions -> place search in browse mode
//   Log     -> the logbook dialog                                               Me      -> menu: Saved, Add a gym, Pending review, About, account
//   START   -> "Log a session" (check-in arrives in Phase 5)
// Every control is a [data-nav] button handled by one delegated listener; no inline handlers, no globals.
import { showExplore, showRegions } from './explore.js';
import { openLogbookModal, startLogSession } from './logbook.js';
import { startAddGym } from './modals.js';
import { closeSearch } from './search.js';

const meMenu = document.getElementById('meMenu');
const meControls = () => document.querySelectorAll('[data-nav="me"]');

function setMenuOpen(open){
  meMenu.classList.toggle('open', open);
  meControls().forEach(el => el.setAttribute('aria-expanded', String(open)));
  if(open){
    const first = meMenu.querySelector('button:not([disabled]):not(.init-hidden), a[href]');
    if(first) first.focus();
  }
}

const ACTIONS = {
  explore(){ showExplore(); },
  regions(){ showRegions(); },
  log(){ closeSearch(); openLogbookModal(); },
  start(){ closeSearch(); startLogSession(); },
  me(){ setMenuOpen(!meMenu.classList.contains('open')); },
  'add-gym'(){ closeSearch(); startAddGym(); },
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
  // Escape closes the menu (the topmost layer) and returns focus to the control that opened it. Dialog Escape handling stays
  // in modals.js; preventDefault tells explore.js the key is handled so the peek card stays open.
  document.addEventListener('keydown', (e)=>{
    if(e.key !== 'Escape' || !meMenu.classList.contains('open')) return;
    e.preventDefault();
    setMenuOpen(false);
    const opener = [...meControls()].find(el => el.offsetParent !== null);
    if(opener) opener.focus();
  });
}
