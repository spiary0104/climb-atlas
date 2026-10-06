// map.js before and after MapLibre loads (TASKS: Map performance): the `map` stand-in holds the camera, answers the list's
// questions from it and queues listeners; mapLibrary() injects the pinned script once; startMap() hands everything to the
// real map. Driven with a minimal fake DOM and a fake MapLibre.   node --test "tests/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const url = (p) => pathToFileURL(path.join(__dirname, '..', p)).href;

const scripts = [];
const mapEl = { clientWidth: 375, clientHeight: 755 };
globalThis.window = globalThis;
globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });
globalThis.location = { search: '', pathname: '/', hash: '' };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.document = {
  getElementById: (id) => (id === 'map' ? mapEl : null),
  createElement: (tag) => (tag === 'canvas' ? { getContext: () => ({}) } : { remove() { this.removed = true; } }),
  head: { appendChild: (s) => scripts.push(s) },
};

const mods = (async () => ({
  m: await import(url('js/modules/map.js')),
  geo: await import(url('js/modules/geo.js')),
}))();

const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) < eps, `${msg}: ${a} vs ${b}`);

test('before MapLibre: the world view, a flat-map scope, camera moves report moveend', async () => {
  const { m, geo } = await mods;
  assert.equal(m.map.getZoom(), m.worldZoom(), 'no saved camera: the world view, sized to the map element');
  assert.deepEqual(m.viewBounds(), geo.viewBox({ lng: -162, lat: 10, zoom: m.worldZoom() }, 375, 755));
  let moves = 0;
  m.map.on('moveend', () => moves++);
  m.map.flyTo({ center: [2.35, 48.85], zoom: 10, duration: 800 });
  assert.equal(moves, 1, 'a fly lands at once and reports moveend, as jumpTo does');
  assert.deepEqual(m.map.getCenter(), { lng: 2.35, lat: 48.85 });
  const b = m.viewBounds();
  // MapLibre's own getBounds() for this camera on a 375 x 755 map (measured in Chrome, 2026-10-06)
  near(b.west, 2.221, 1e-3, 'west'); near(b.east, 2.479, 1e-3, 'east'); near(b.south, 48.679, 1e-3, 'south'); near(b.north, 49.021, 1e-3, 'north');
  m.map.jumpTo({ center: { lng: 151.2, lat: -33.9 } });
  assert.equal(m.map.getZoom(), 10, 'a centre-only move keeps the zoom');
  m.map.fitBounds([[151.1, -34], [151.3, -33.8]], { padding: 48, maxZoom: 13 });
  near(m.map.getCenter().lng, 151.2, 1e-9, 'fitBounds centres the box');
  assert.ok(m.map.getZoom() > 9 && m.map.getZoom() <= 13, 'and fits it: ' + m.map.getZoom());
  m.map.fitBounds([[151.2, -33.9], [151.2, -33.9]], { maxZoom: 13 });
  assert.equal(m.map.getZoom(), 13, 'a single point clamps to maxZoom');
  assert.equal(moves, 4);
  m.map.resize();   // a no-op until the map exists
  assert.equal(m.map.getContainer(), mapEl);
});

test('mapLibrary(): one pinned script with SRI, retried after a failed download', async () => {
  const { m } = await mods;
  const first = m.mapLibrary();
  assert.equal(m.mapLibrary(), first, 'a second call shares the load');
  assert.equal(scripts.length, 1);
  const s = scripts[0];
  assert.match(s.src, /^https:\/\/unpkg\.com\/maplibre-gl@[\d.]+\/dist\/maplibre-gl\.js$/);
  assert.match(s.integrity, /^sha384-/); assert.equal(s.crossOrigin, 'anonymous');
  s.onerror();
  await assert.rejects(first, /Could not download MapLibre/);
  assert.ok(s.removed, 'the failed tag is removed');
  const second = m.mapLibrary();
  assert.equal(scripts.length, 2, 'the next call tries again');
  scripts[1].onload();
  await assert.rejects(second, /did not define maplibregl/, 'a script that loads but defines nothing is a failure');
});

test('startMap(): the real map starts at the held camera and takes over listeners and calls', async () => {
  const { m } = await mods;
  const made = [];
  class FakeMap {
    constructor(o) { this.o = o; this.on_ = []; this.calls = []; made.push(this); }
    on(type, fn) { this.on_.push([type, fn]); }
    once() {} addControl() {}
    getZoom() { return 11; } getCenter() { return { lng: 1, lat: 2 }; }
    flyTo(o) { this.calls.push(['flyTo', o]); } resize() { this.calls.push(['resize']); }
    getBounds() { return { getWest: () => 0, getSouth: () => 1, getEast: () => 2, getNorth: () => 3 }; }
  }
  const Control = class { on() {} };
  globalThis.maplibregl = { Map: FakeMap, NavigationControl: Control, GeolocateControl: Control };
  const seen = [];
  m.whenMap((gl) => seen.push(gl));
  const before = { center: m.map.getCenter(), zoom: m.map.getZoom() };
  await m.startMap();
  await m.startMap();
  assert.equal(made.length, 1, 'made once');
  const gl = made[0];
  assert.deepEqual(gl.o.center, [before.center.lng, before.center.lat]); assert.equal(gl.o.zoom, before.zoom);
  assert.equal(gl.o.container, 'map');
  assert.deepEqual(seen, [gl], 'whenMap callbacks run with the real map');
  assert.ok(gl.on_.filter(([t]) => t === 'moveend').length >= 1, 'earlier moveend listeners are attached');
  assert.equal(m.map.getZoom(), 11, 'calls go to the real map now');
  m.map.flyTo({ center: [5, 5], zoom: 3 }); m.map.resize();
  assert.deepEqual(gl.calls.map(c => c[0]), ['flyTo', 'resize']);
  assert.deepEqual(m.viewBounds(), { west: 0, south: 1, east: 2, north: 3 });
  let late = null; m.whenMap((x) => { late = x; });
  assert.equal(late, gl, 'whenMap after the map exists runs at once');
  const n = gl.on_.length; m.map.on('click', () => {});
  assert.equal(gl.on_.length, n + 1, 'later listeners go straight to the real map');
});
