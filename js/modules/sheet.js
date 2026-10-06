// Mobile/tablet bottom sheet (DESIGN.md sec. 7.9): the list pane becomes a paper sheet over a full-bleed map below 1024px.
// Snap points: peek (only the grabber and the "N gyms in view" line, so the map is free), half 52%, full 92% of the
// viewport. It never dismisses. The grabber and header are the drag surface; dragging down inside the list collapses the
// sheet only when the list is scrolled to the top. Panning or pinching the map puts the sheet down to peek, and tapping
// the grabber at half puts it down too (owner request 2026-10-06: the sheet blocked the map on phones). At full the tab
// bar hides and a collapse chevron appears. Non-modal (role="region"), so the map stays reachable.
export const SHEET_QUERY = '(max-width: 1023px)';
const SNAPS = { half: 0.52, full: 0.92 };
const $ = id => document.getElementById(id);
let snap = 'half';          // first open at half (owner decision 2026-09-26); pin taps drop it to peek
let minPeekPx = 0;          // raised while the pin-tap carousel is showing, so the carousel fits at peek

export const isSheetMode = () => window.matchMedia(SHEET_QUERY).matches;

function tabbarHeight(){
  const t = document.querySelector('.tabbar');
  return t && t.offsetParent !== null && !document.body.classList.contains('sheet-full') ? t.offsetHeight : 0;
}
// How far the raised START disc rises above the tab bar: peek keeps the count line clear of it.
function startRise(){
  const t = document.querySelector('.tabbar'), d = document.querySelector('.tabbar .start-disc');
  return t && d && tabbarHeight() ? Math.max(0, Math.round(t.getBoundingClientRect().top - d.getBoundingClientRect().top)) : 0;
}
// Peek shows the sheet down to the end of the count line (the sort tools are hidden there; css/explore.css).
function peekPx(){
  const count = document.querySelector('#listPane .list-count');
  const top = $('listPane').getBoundingClientRect().top;
  return count && count.offsetParent !== null ? Math.round(count.getBoundingClientRect().bottom - top) + 8 : 64;
}
// Visible height (px, above the viewport bottom) for a snap.
function visibleFor(name){
  const vh = window.innerHeight;
  if(name === 'full') return Math.round(vh * SNAPS.full);
  if(name === 'peek') return (minPeekPx ? Math.max(peekPx(), minPeekPx) : peekPx() + startRise()) + tabbarHeight();
  return Math.round(vh * SNAPS[name]) + tabbarHeight();
}

function apply(px, animate){
  const sheet = $('listPane');
  const height = Math.round(window.innerHeight * SNAPS.full);
  sheet.classList.toggle('is-dragging', !animate);
  sheet.style.setProperty('--sheet-offset', Math.max(0, height - px) + 'px');
  // The scrollable area ends at the tab bar, so the last row is reachable at every snap.
  sheet.style.setProperty('--sheet-visible', Math.max(0, px - (snap === 'full' ? 0 : tabbarHeight())) + 'px');
  // The map's control stack sits just above the sheet's peek edge (css/explore.css).
  document.documentElement.style.setProperty('--sheet-peek-offset', (visibleFor('peek') - tabbarHeight() + 8) + 'px');
}

export function setSnap(name, {focus = false} = {}){
  if(!isSheetMode()) return;
  snap = name;
  document.body.classList.toggle('sheet-full', name === 'full');
  $('listPane').dataset.snap = name;
  $('listPane').classList.toggle('is-low', name === 'peek' && !minPeekPx);   // count line only: hide sort and view
  apply(visibleFor(name), true);
  if(focus) $('gymList').focus({preventScroll: true});
}
export function setMinPeek(px){ minPeekPx = px; if(snap === 'peek') setSnap('peek'); }

function nearestSnap(px, velocity){
  const order = ['peek', 'half', 'full'];
  if(Math.abs(velocity) > 0.5){                       // a flick moves one snap in its direction
    const i = order.indexOf(snap) + (velocity < 0 ? 1 : -1);
    return order[Math.max(0, Math.min(2, i))];
  }
  return order.reduce((best, n) => Math.abs(visibleFor(n) - px) < Math.abs(visibleFor(best) - px) ? n : best, 'peek');
}

function startDrag(startY){
  const startPx = visibleFor(snap);
  let lastY = startY, lastT = performance.now(), v = 0, px = startPx;
  $('listPane').classList.remove('is-low');           // the sort tools come back as the sheet rises
  const move = (y) => {
    const now = performance.now();
    v = (y - lastY) / Math.max(1, now - lastT);        // px/ms, positive = downwards
    lastY = y; lastT = now;
    px = Math.max(visibleFor('peek'), Math.min(visibleFor('full'), startPx + (startY - y)));
    apply(px, false);
  };
  const end = () => { setSnap(nearestSnap(px, v)); };
  return { move, end };
}

export function initSheet(){
  const sheet = $('listPane');
  const handle = $('sheetHandle');
  // Pointer drag on the grabber/header.
  handle.addEventListener('pointerdown', (e)=>{
    if(!isSheetMode() || e.target.closest('button, select, a, input')) return;
    handle.setPointerCapture(e.pointerId);
    const d = startDrag(e.clientY);
    const onMove = ev => d.move(ev.clientY);
    const onUp = () => { handle.removeEventListener('pointermove', onMove); handle.removeEventListener('pointerup', onUp); handle.removeEventListener('pointercancel', onUp); d.end(); };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  });
  // Tapping the grabber: peek -> half, half -> peek (put it down), full -> half (keyboard users get the same via Enter).
  $('sheetGrabber').addEventListener('click', ()=> setSnap(snap === 'peek' ? 'half' : snap === 'half' ? 'peek' : 'half'));
  // Panning or pinching the map puts the sheet down so the map gets the screen; a plain tap (a pin) is left to explore.js.
  const mapEl = $('map');
  let mapDown = null;
  mapEl.addEventListener('pointerdown', (e)=>{ mapDown = isSheetMode() && snap !== 'peek' ? {x: e.clientX, y: e.clientY} : null; }, {passive: true});
  mapEl.addEventListener('pointermove', (e)=>{
    if(!mapDown) return;
    if(!e.buttons){ mapDown = null; return; }          // the press ended where we did not see it: hover is not a pan
    if(Math.hypot(e.clientX - mapDown.x, e.clientY - mapDown.y) < 10) return;
    mapDown = null;
    setSnap('peek');
  }, {passive: true});
  const mapUp = () => { mapDown = null; };
  window.addEventListener('pointerup', mapUp, true);    // the map may capture the pointer, so listen on the window
  window.addEventListener('pointercancel', mapUp, true);
  $('sheetClose').addEventListener('click', ()=> setSnap('half'));
  // Touch inside the list: dragging down at scrollTop 0 moves the sheet instead of scrolling (sec. 7.9 drag rule).
  const list = $('gymList');
  let touch = null;
  list.addEventListener('touchstart', (e)=>{
    if(!isSheetMode() || e.touches.length !== 1) return;
    touch = { y: e.touches[0].clientY, drag: null };
  }, {passive: true});
  list.addEventListener('touchmove', (e)=>{
    if(!touch) return;
    const y = e.touches[0].clientY;
    if(!touch.drag){
      if(y - touch.y > 6 && list.scrollTop <= 0 && snap !== 'peek') touch.drag = startDrag(touch.y);
      else if(Math.abs(y - touch.y) > 6){ touch = null; return; }
      else return;
    }
    e.preventDefault();
    touch.drag.move(y);
  }, {passive: false});
  const endTouch = () => { if(touch && touch.drag) touch.drag.end(); touch = null; };
  list.addEventListener('touchend', endTouch);
  list.addEventListener('touchcancel', endTouch);

  const mq = window.matchMedia(SHEET_QUERY);
  const sync = () => {
    if(mq.matches){ setSnap(snap); }
    else {
      document.body.classList.remove('sheet-full');
      sheet.style.removeProperty('--sheet-offset');
      sheet.style.removeProperty('--sheet-visible');
      delete sheet.dataset.snap;
    }
  };
  mq.addEventListener('change', sync);
  window.addEventListener('resize', ()=>{ if(mq.matches) apply(visibleFor(snap), true); });
  sync();
}
