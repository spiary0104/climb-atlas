// App navigation chrome (DESIGN.md sec. 6.4 / 6.5): the desktop/tablet top bar and the mobile tab bar with START.
//   Explore -> the map and list (from a page: back to the Explore view that was left)   Regions -> /in
//   Log     -> /log                                                                     Me      -> /me
//   START   -> "Log a session" (check-in arrives in Phase 5)                            Add a gym -> the add dialog
// Every control is a [data-nav] button handled by one delegated listener; no inline handlers, no globals.
// The active area is marked by router.js (aria-current).
import { showExplore } from './explore.js';
import { startLogSession } from './logbook.js';
import { startAddGym } from './modals.js';
import { navigate } from './router.js';
import { closeSearch } from './search.js';

const ACTIONS = {
  explore(){ showExplore(); },
  regions(){ closeSearch(); navigate('/in'); },
  log(){ closeSearch(); navigate('/log'); },
  start(){ closeSearch(); startLogSession(); },
  me(){ closeSearch(); navigate('/me'); },
  'add-gym'(){ closeSearch(); startAddGym(); },
};

export function initNavigation(){
  document.addEventListener('click', (e)=>{
    const control = e.target.closest('[data-nav]');
    if(control && ACTIONS[control.dataset.nav]) ACTIONS[control.dataset.nav]();
  });
}
