// The check-in sheet flow in checkin.js, driven with a minimal fake DOM and a fake Supabase client whose insert resolves
// when the test says so. Covers the pre-merge audit crash: closing the sheet while "Stamp it" is saving threw
// "Cannot set properties of null (setting 'checkin')" and lost the stamp/milestone.   node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..');
const url = (p) => pathToFileURL(path.join(ROOT, p)).href;

// Everything the flow does not assert on is a universal stub; elements looked up by id are small fakes with a class
// list, click handlers and the form fields the sheet reads.
const stub = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'then' ? undefined : stub()), apply: () => stub(), set: () => true });
const els = new Map();
let focused = null;   // the last fake element that received focus()
function el(id) {
  if (!els.has(id)) {
    const classes = new Set(/Backdrop$/.test(id) ? ['hidden'] : []);
    const handlers = {};
    els.set(id, {
      id, handlers, value: '', checked: false, disabled: false, textContent: '', innerHTML: '', dataset: {}, style: {},
      classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c), contains: (c) => classes.has(c), toggle: (c, on) => (on ?? !classes.has(c)) ? classes.add(c) : classes.delete(c) },
      addEventListener: (type, fn) => { (handlers[type] = handlers[type] || []).push(fn); },
      removeEventListener() {}, setAttribute() {}, removeAttribute() {}, getAttribute: () => null, focus() {},
      // [data-ci-action="x"] resolves to a focusable fake while the current markup contains that control
      querySelector(sel) {
        const m = /^\[data-ci-action="(\w+)"\]$/.exec(sel);
        return m && this.innerHTML.includes(`data-ci-action="${m[1]}"`) ? { action: m[1], focus() { focused = this; } } : null;
      },
      querySelectorAll: () => [], closest: () => null, contains: () => false, appendChild() {},
    });
  }
  return els.get(id);
}
globalThis.window = globalThis;
globalThis.document = new Proxy({}, { get: (t, k) => (k === 'getElementById' ? el : stub()) });
globalThis.sessionStorage = { getItem: () => null, setItem() {} };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.maplibregl = stub(); globalThis.Supercluster = stub();
globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });   // desktop: the "I'm here" confirm path
globalThis.location = { pathname: '/', search: '', hash: '', origin: 'http://localhost', href: 'http://localhost/' };
globalThis.history = { pushState() {}, replaceState() {} };
Object.defineProperty(globalThis, 'navigator', { value: { language: 'en-GB' }, configurable: true });

const unhandled = [];
process.on('unhandledRejection', (e) => unhandled.push(String(e)));
const tick = () => new Promise((r) => setImmediate(r));
const hidden = (id) => el(id).classList.contains('hidden');
const click = (target) => el('checkinModalBackdrop').handlers.click.forEach((f) => f({ target: { closest: () => target } }));
const stampBtn = () => ({ dataset: { ciAction: 'stamp' }, disabled: false, textContent: 'Stamp it' });

const modules = (async () => {
  const checkin = await import(url('js/modules/checkin.js'));
  const { appState } = await import(url('js/modules/state.js'));
  checkin.initCheckin();
  (await import(url('js/modules/milestone-sheet.js'))).initMilestoneSheet();
  appState.spots = ['One', 'Two', 'Three'].map((n, i) => ({ id: 'g' + i, name: 'Plain Gym ' + n, suburb: 'Suburb ' + n, state: 'NSW', country: 'AU', lat: -33.9, lng: 151.2, types: ['indoor-bouldering'] }));
  appState.checkins = []; appState.checkinsLoaded = true; appState.checkinsAvailable = true;
  window.auth = { user: { id: 'u1' } };
  return { checkin, appState };
})();

// A fake client whose next insert waits for release(result).
function deferredInsert() {
  let release;
  const pending = new Promise((r) => { release = r; });
  window.sb = { from: () => ({ insert: () => ({ select: () => ({ single: () => pending }) }) }) };
  return (spotId) => release({ data: { id: 'c-' + spotId, spot_id: spotId, checked_at: new Date().toISOString(), note: null }, error: null });
}
async function openAndStamp(checkin, spotId) {
  const release = deferredInsert();
  await checkin.startCheckin(spotId);
  assert.equal(hidden('checkinModalBackdrop'), false, 'the sheet opened');
  el('ciHere').checked = true;
  click(stampBtn());
  return release;
}

test('closing the sheet while the stamp is saving: no crash, the check-in stands, the milestone still shows', async () => {
  const { checkin, appState } = await modules;
  const release = await openAndStamp(checkin, 'g0');
  el('checkinClose').handlers.click.forEach((f) => f());          // closed mid-save
  assert.equal(hidden('checkinModalBackdrop'), true);
  assert.equal(hidden('milestoneModalBackdrop'), true, 'no milestone before the check-in exists');
  release('g0'); await tick(); await tick();
  assert.deepEqual(unhandled, [], 'no uncaught error');
  assert.deepEqual(appState.checkins.map((c) => c.spot_id), ['g0'], 'the saved check-in is kept');
  assert.ok(!/class="stamp"/.test(el('checkinBody').innerHTML), 'the closed sheet is not re-filled with a stamp');
  assert.equal(hidden('milestoneModalBackdrop'), false, 'the first-stamp milestone still shows');
  assert.match(el('milestoneBody').innerHTML, /First stamp|first/i);
});

test('a new sheet opened for another gym while the first is saving is not overwritten by the first stamp', async () => {
  const { checkin, appState } = await modules;
  const releaseFirst = await openAndStamp(checkin, 'g1');
  el('checkinClose').handlers.click.forEach((f) => f());
  deferredInsert();                                                 // the second sheet's (never-resolved) client
  await checkin.startCheckin('g2');
  const second = el('checkinBody').innerHTML;
  assert.match(second, /Plain Gym Three/);
  releaseFirst('g1'); await tick(); await tick();
  assert.deepEqual(unhandled, []);
  assert.equal(el('checkinBody').innerHTML, second, 'the open sheet still shows the second gym');
  assert.equal(hidden('checkinModalBackdrop'), false);
  assert.ok(appState.checkins.some((c) => c.spot_id === 'g1'), 'the first check-in is kept');
});

test('left open, the sheet lands the stamp as before', async () => {
  const { checkin } = await modules;
  el('checkinClose').handlers.click.forEach((f) => f());
  const { appState } = await modules;
  appState.checkins = [];
  const release = await openAndStamp(checkin, 'g2');
  release('g2'); await tick(); await tick();
  assert.deepEqual(unhandled, []);
  assert.match(el('checkinBody').innerHTML, /class="stamp"/);
  assert.match(el('checkinBody').innerHTML, /data-ci-action="done"/);
  assert.equal(focused && focused.action, 'done', 'keyboard focus moves to Done after the focused "Stamp it" is replaced');
});

// The server names the reason (20260927090000_checkins.sql); only the matching message is shown, never a guessed limit.
test('refusals: each server reason gets its own message; an ineligible gym is not reported as the daily limit', async () => {
  const { checkin, appState } = await modules;
  const cases = [
    ['this gym is not open for check-ins', /isn’t open for check-ins any more/],
    ['daily check-in limit reached', /30 check-ins in 24 hours/],
    ['already checked in here today', /Already checked in here today/],
    ['new row violates row-level security policy for table "checkins"', /^Could not check in — try again$/],
  ];
  const quiet = console.error; console.error = () => {};
  try {
    for (const [message, expected] of cases) {
      el('checkinClose').handlers.click.forEach((f) => f());
      appState.checkins = [];
      window.sb = { from: () => ({ insert: () => ({ select: () => ({ single: async () => ({ data: null, error: { message } }) }) }) }) };
      await checkin.startCheckin('g0');
      el('ciHere').checked = true;
      const btn = stampBtn();
      click(btn); await tick(); await tick();
      assert.match(el('toast').textContent, expected, message);
      if (!/limit/.test(message)) assert.doesNotMatch(el('toast').textContent, /limit|30 check-ins/i, 'no limit wording for: ' + message);
      assert.equal(btn.disabled, false, 'the open sheet can try again');
      assert.equal(appState.checkins.length, 0);
    }
  } finally { console.error = quiet; }
  assert.deepEqual(unhandled, []);
});

test('START names what it does, and the check-in, milestone and START sheets are phone bottom sheets clear of the home indicator', () => {
  const fs = require('node:fs');
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const start = /<button[^>]*class="start-btn"[^>]*>/.exec(html)[0];
  const name = /aria-label="([^"]*)"/.exec(start)[1];
  assert.match(name, /check in/i); assert.match(name, /log a session/i);
  assert.ok(/\blog\b/i.test(name), 'the visible label "Log" is part of the accessible name (WCAG 2.5.3)');
  const css = fs.readFileSync(path.join(ROOT, 'css', 'passport.css'), 'utf8').replace(/\r\n/g, '\n');
  const from = css.indexOf('@media (max-width:767px){\n  #checkinModalBackdrop,#milestoneModalBackdrop,#startModalBackdrop{align-items:flex-end;}');
  assert.ok(from >= 0, 'a phone rule anchors all three sheets to the bottom edge');
  const phone = css.slice(from, css.indexOf('\n}', from));
  for (const part of ['.modal.checkin-modal,.modal.milestone-modal,.modal.start-modal{', 'border-radius:var(--radius-xl) var(--radius-xl) 0 0', 'env(safe-area-inset-bottom)', 'max-width:var(--size-sheet-max)', '#startModalBackdrop.hidden .modal{transform:translateY(100%);}'])
    assert.ok(phone.includes(part), 'phone sheet rule lacks ' + part);
});
