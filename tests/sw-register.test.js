// Behavioural tests for js/sw-register.js (classic script): runs the real source in a vm sandbox with a fake window,
// service-worker container and registration, and checks when `bouldeer:sw-updated` is dispatched.   node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SRC = fs.readFileSync(path.join(ROOT, 'js', 'sw-register.js'), 'utf8');

function emitter() {
  const l = {};
  return { on: (t, f) => { (l[t] = l[t] || []).push(f); }, emit: (t, e) => (l[t] || []).forEach((f) => f(e)), count: (t) => (l[t] || []).length };
}
function fakeWorker() {
  const e = emitter();
  return { state: 'installing', addEventListener: e.on, setState(s) { this.state = s; e.emit('statechange', {}); } };
}

// controller: whether the page is already controlled by a worker (false on the very first visit)
function load({ controller, installingAtRegister = null }) {
  const win = emitter(), doc = emitter(), reg = emitter();
  const events = [];
  const updates = [];
  reg.installing = installingAtRegister;
  const sandbox = {
    window: { addEventListener: win.on, dispatchEvent: (e) => { events.push(e.type); return true; } },
    document: { addEventListener: doc.on, visibilityState: 'hidden' },
    CustomEvent: class { constructor(type) { this.type = type; } },
    console: { warn() {} },
    navigator: { serviceWorker: { controller: controller ? {} : null, register: async () => registration } },
  };
  const registration = {
    addEventListener: reg.on,
    get installing() { return reg.installing; },
    update: async () => { updates.push(1); },
  };
  vm.createContext(sandbox);
  vm.runInContext(SRC, sandbox);
  return {
    events, updates, sandbox,
    async boot() { win.emit('load', {}); await new Promise((r) => setImmediate(r)); },
    foundUpdate(worker) { reg.installing = worker; reg.emit('updatefound', {}); },
    visible(state) { sandbox.document.visibilityState = state; doc.emit('visibilitychange', {}); },
    docListeners: () => doc.count('visibilitychange'),
  };
}

test('first install (no controller yet) shows nothing', async () => {
  const app = load({ controller: false });
  await app.boot();
  const w = fakeWorker();
  app.foundUpdate(w);
  w.setState('installed');
  w.setState('activating');
  w.setState('activated');
  assert.deepEqual(app.events, []);
});

test('an update with an existing controller dispatches bouldeer:sw-updated once the new worker is installed, not before', async () => {
  const app = load({ controller: true });
  await app.boot();
  const w = fakeWorker();
  app.foundUpdate(w);
  assert.deepEqual(app.events, [], 'found but still installing');
  w.setState('installed');
  assert.deepEqual(app.events, ['bouldeer:sw-updated']);
});

test('one update, one event: later state changes and a second sighting of the same worker do not dispatch again', async () => {
  const app = load({ controller: true });
  await app.boot();
  const w = fakeWorker();
  app.foundUpdate(w);
  app.foundUpdate(w);              // updatefound fired twice for the same worker
  w.setState('installed');
  w.setState('activating');
  w.setState('activated');
  w.setState('installed');         // even a repeated state
  assert.equal(app.events.length, 1);
});

test('a later deploy (a different worker) announces again', async () => {
  const app = load({ controller: true });
  await app.boot();
  const a = fakeWorker(); app.foundUpdate(a); a.setState('installed');
  const b = fakeWorker(); app.foundUpdate(b); b.setState('installed');
  assert.equal(app.events.length, 2);
});

test('an update already installing when registration resolves is still announced (reg.installing at register time)', async () => {
  const w = fakeWorker();
  const app = load({ controller: true, installingAtRegister: w });
  await app.boot();
  w.setState('installed');
  assert.equal(app.events.length, 1);
});

test('returning to the tab asks for the newest sw.js; hiding it does not', async () => {
  const app = load({ controller: true });
  await app.boot();
  app.visible('hidden');
  assert.equal(app.updates.length, 0);
  app.visible('visible');
  assert.equal(app.updates.length, 1);
  assert.equal(app.docListeners(), 1, 'one visibilitychange listener');
});

test('the registrar never reloads the page itself', () => {
  assert.ok(!/location\.reload|location\.href\s*=|location\.assign/.test(SRC), 'sw-register.js must not reload');
});

test('main.js turns the event into a toast whose only reload is the Refresh action', () => {
  const main = fs.readFileSync(path.join(ROOT, 'js', 'main.js'), 'utf8');
  assert.match(main, /addEventListener\('bouldeer:sw-updated'[\s\S]*?showActionToast\('Bouldeer has finished a climb, please refresh the page', 'Refresh', \(\) => location\.reload\(\)\)/);
  assert.equal((main.match(/location\.reload/g) || []).length, 1, 'location.reload appears once, inside the Refresh callback');
  assert.ok(!/serviceWorker/.test(main), 'main.js stays out of the registration');
});
