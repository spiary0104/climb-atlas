// Mobile/tablet bottom sheet (DESIGN.md sec. 7.9): the list pane becomes a paper sheet over a full-bleed map below 1024px.
// Snap points (visible height as a share of the viewport): peek 18%, half 52%, full 92%. It never dismisses. The grabber
// and header are the drag surface; dragging down inside the list collapses the sheet only when the list is scrolled to the
// top. At full the tab bar hides and a collapse chevron appears. Non-modal (role="region"), so the map stays reachable.
export const SHEET_QUERY = '(max-width: 1023px)';
const SNAPS = { peek: 0.18, half: 0.52, full: 0.92 };
const $ = id => document.getElementById(id);
let snap = 'peek';
let minPeekPx = 0;          // raised while the pin-tap carousel is showing, so the carousel fits at peek

export const isSheetMode = () => window.matchMedia(SHEET_QUERY).matches;

function tabbarHeight(){
  const t = document.querySelector('.tabbar');
  return t && t.offsetParent !== null && !document.body.classList.contains('sheet-full') ? t.offsetHeight : 0;
}
// Visible height (px, above the viewport bottom) for a snap.
function visibleFor(name){
  const vh = window.innerHeight;
  if(name === 'full') return Math.round(vh * SNAPS.full);
  const base = Math.round(vh * SNAPS[name]) + tabbarHeight();
  return name === 'peek' ? Math.max(base, minPeekPx + tabbarHeight()) : base;
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
  // Tapping the grabber cycles peek -> half -> full -> half (keyboard users get the same via the Enter key).
  $('sheetGrabber').addEventListener('click', ()=> setSnap(snap === 'peek' ? 'half' : snap === 'half' ? 'full' : 'half'));
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
