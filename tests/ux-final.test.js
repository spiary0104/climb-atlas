'use strict';
// Final-stage UX follow-ups (audit 2026-10-03): nearest-first list, the photos chip rule, first-visit orientation, Nearby
// rows, START for a signed-out visitor.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
globalThis.window = globalThis.window || {};
globalThis.window.matchMedia = () => ({ matches: false });
const page = import('../js/modules/page-html.js');
const listHtml = import('../js/modules/list-html.js');

test('list: nearest first by default, to the visitor when located and to the area centre otherwise (never alphabetical by default)', () => {
  const src = read('js/modules/list.js');
  assert.match(src, /export const effectiveSort = \(\) => appState\.sortBy \|\| 'distance';/);
  assert.match(src, /if\(appState\.userLocation\) return appState\.userLocation;/);
  assert.match(src, /b\.east < b\.west \? b\.east \+ 360 : b\.east/, 'the centre works across the antimeridian');
  assert.match(src, /appState\.userLocation \? 'Nearest to you' : 'Nearest to centre'/);
  assert.ok(!/option\[value="distance"\]'\)\.hidden = !appState\.userLocation/.test(src), 'the option is no longer hidden until located');
});

test('filters: "Has photos" is offered only once 5% of gyms have a photo, and stays while it is on', () => {
  const src = read('js/modules/filters.js');
  assert.match(src, /export const PHOTO_FILTER_MIN = 0\.05;/);
  assert.match(src, /const photosHidden = !appState\.showPhotosOnly && photoShare\(\) < PHOTO_FILTER_MIN;/);
  assert.match(read('index.html'), /<fieldset class="filter-section" id="filterSheetPhotos">/);
});

test('orientation: one escaped line with live counts, an About link and a dismiss button; once per device', async () => {
  const { introHtml } = await listHtml;
  const html = introHtml(2348, 84);
  assert.match(html, /<strong>Bouldeer<\/strong> maps 2,348 climbing gyms in 84 countries, researched gym by gym and kept current by climbers\./);
  assert.match(html, /href="\/about\.html"/); assert.match(html, /data-intro-close aria-label="Dismiss"/);
  assert.ok(!/mascot/.test(read('js/modules/list-html.js')), 'no character in the list builders');
  const src = read('js/modules/list.js');
  assert.match(src, /export const INTRO_KEY = 'bouldeer_intro_seen';/);
  assert.match(src, /seen = localStorage\.getItem\(INTRO_KEY\) === '1'; localStorage\.setItem\(INTRO_KEY, '1'\);/);
  assert.match(read('index.html'), /<div class="explore-intro" id="exploreIntro" hidden><\/div>/);
});

test('gym page: Nearby is dense rows while no nearby gym has a photo, photo cards once one does', async () => {
  const { gymPageHtml } = await page;
  const g = { id: 'a', name: 'A', suburb: 'S', state: 'NSW', country: 'AU', lat: 0, lng: 0, types: [] };
  const n = (id, photo) => ({ g: { ...g, id, name: 'Gym ' + id, photo }, ctx: { href: '/gym/' + id, region: 'NSW', distance: '1 km away' } });
  const rows = gymPageHtml(g, { nearby: [n('b'), n('c')] });
  assert.match(rows, /<div class="page-list nearby-list"><a class="page-row"/); assert.ok(!/card-strip/.test(rows));
  assert.match(rows, /1 km away/, 'distance stays visible in rows');
  const cards = gymPageHtml(g, { nearby: [n('b', 'https://example.com/p.jpg'), n('c')] });
  assert.match(cards, /<div class="card-strip">/);
});

test('START: a signed-out visitor is told what check-in is and offered sign-in; the signed-in actions are separate', () => {
  const html = read('index.html'), src = read('js/modules/checkin.js');
  assert.match(html, /<p class="sub" id="startSignedOut" hidden>Check in at a gym to collect a stamp in your passport/);
  assert.match(html, /id="startSignedOutActions" hidden><button type="button" class="btn btn-secondary btn-block" data-start-action="signin">Sign in to start<\/button>/);
  assert.match(src, /\$\('startSignedOut'\)\.hidden = \$\('startSignedOutActions'\)\.hidden = signedIn;/);
  assert.match(src, /if\(btn\.dataset\.startAction === 'signin'\) openAuthModal\(\);/);
  assert.ok(!/mark spots as climbed/.test(html), 'sign-in copy says gyms, and names check-ins');
  assert.match(read('css/passport.css'), /\.start-actions\[hidden\]\{display:none;\}/, 'the hidden action group really hides (display:flex would win otherwise)');
});
