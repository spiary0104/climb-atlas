'use strict';
// Gym information (migration 20261004000100, DESIGN.md sec. 8.2): pure rules, gym page rendering, edit/mod wiring.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
// constants.js reads window.matchMedia at import time; the builders themselves are DOM-free.
globalThis.window = globalThis.window || {};
globalThis.window.matchMedia = () => ({ matches: false });
const gi = import('../js/modules/gym-info.js');
const page = import('../js/modules/page-html.js');
const mod = import('../js/modules/moderation-html.js');

const base = { id: 'seed-1', name: 'Test Gym', suburb: 'Newtown', state: 'NSW', country: 'AU', lat: -33.9, lng: 151.18, types: ['indoor-bouldering'], address: '1 Chalk St' };
const HOSTILE = '"><img src=x onerror=alert(1)>';

test('cleanHours / cleanFacilities / websiteLabel keep only valid, known values', async () => {
  const { cleanHours, cleanFacilities, websiteLabel, todayKey } = await gi;
  assert.deepEqual(cleanHours({ mon: ' 6am-10pm ', tue: '', funday: 'x', sun: 9 }), { mon: '6am-10pm' });
  assert.equal(cleanHours({}), null); assert.equal(cleanHours('Mon 9-5'), null); assert.equal(cleanHours(['mon']), null);
  assert.equal(cleanHours({ mon: 'x'.repeat(60) }).mon.length, 40);
  assert.deepEqual(cleanFacilities(['yoga', 'casino', 'cafe', 'cafe']), ['cafe', 'yoga'], 'known keys, once, display order');
  assert.deepEqual(cleanFacilities('cafe'), []);
  assert.equal(websiteLabel('https://www.example.com/gym?x=1'), 'example.com');
  assert.equal(websiteLabel('javascript:alert(1)'), ''); assert.equal(websiteLabel('example.com'), '');
  assert.equal(todayKey(new Date(2026, 9, 5)), 'mon'); assert.equal(todayKey(new Date(2026, 9, 4)), 'sun');
});

test('gym page: a minimum gym shows no empty rows, and the one prompt names every field the edit form can take', async () => {
  const { gymPageHtml } = await page;
  const html = gymPageHtml(base, {});
  assert.ok(!/essentials-row|facility-chip|id="aboutTitle"/.test(html), 'no empty Essentials rows, Facilities or About');
  assert.match(html, /data-edit-focus="hours"[^>]*>Add the hours, website, day-pass price or a photo\.<\/button>/);
  assert.match(html, /class="essentials-address"/, 'the address and map are always there');
});

test('gym page: hours (today emphasised), day pass, website, facilities and description render only when present, escaped', async () => {
  const { gymPageHtml } = await page;
  const { essentialsRowsHtml } = await gi;
  const g = { ...base, description: 'Big hall <b>', website: 'https://www.climb.example/', day_pass: 'A$28 & up', facilities: ['shop', 'cafe', 'bogus'],
    hours: { mon: '6am-10pm', sat: '8am-8pm', sun: 'Closed' } };
  const html = gymPageHtml(g, {});
  assert.ok(!/contribute-prompt/.test(html), 'no prompt once practical info exists');
  assert.match(html, /<h2 class="section-title" id="aboutTitle">About<\/h2><p class="prose">Big hall &lt;b&gt;<\/p>/);
  assert.match(html, /<li class="facility-chip">Café<\/li><li class="facility-chip">Shop<\/li><\/ul>/, 'known facilities only, in order');
  assert.match(html, /<a class="link" href="https:\/\/www\.climb\.example\/" target="_blank" rel="noopener noreferrer">climb\.example<\/a>/);
  assert.match(html, /A\$28 &amp; up/);
  const rows = essentialsRowsHtml(g, { today: 'sat' });
  assert.match(rows, /<summary>Today: 8am-8pm<\/summary>/); assert.match(rows, /<tr class="is-today"><th scope="row">Saturday<\/th><td>8am-8pm<\/td><\/tr>/);
  assert.match(essentialsRowsHtml(g, { today: 'tue' }), /<summary>Opening hours<\/summary>/, 'no hours for today: a neutral summary');
  // hostile values stay text; a javascript: website never becomes a link
  const bad = gymPageHtml({ ...base, description: HOSTILE, day_pass: HOSTILE, website: 'javascript:alert(1)', hours: { mon: HOSTILE } }, {});
  assert.ok(!/<img src=x|href="javascript/i.test(bad), 'escaped text only, no tag, no javascript: link');
  // legacy: a genuine line in research notes still shows when there is no description; research remarks never do
  assert.match(gymPageHtml({ ...base, notes: 'America’s first indoor climbing gym, opened 1987.' }, {}), /id="aboutTitle"/);
  assert.ok(!/id="aboutTitle"/.test(gymPageHtml({ ...base, notes: 'Sourced from climbing-gyms.com. Pin from OpenStreetMap node/1 (Nominatim).' }, {})));
});

test('forms: the shared fields carry the database caps; /add keeps to the quick facts; edits never send research notes', async () => {
  const { infoFieldsHtml, readInfoFields, LIMITS } = await gi;
  const e = infoFieldsHtml('e', { website: HOSTILE, facilities: ['cafe'], hours: { mon: 'x' } });
  assert.ok(!/<img src=x/.test(e) && /value="&quot;&gt;&lt;img/.test(e), 'the hostile value is escaped inside the attribute'); assert.match(e, /data-facility="cafe" checked/); assert.match(e, /id="e-hours-mon"[^>]*value="x"/);
  const add = infoFieldsHtml('add', {}, { hoursAndFacilities: false, data: 'data-add-field' });
  assert.ok(!/data-hours-day|data-facility/.test(add)); assert.match(add, /id="add-website" data-add-field="website"/); assert.match(add, /data-add-field="description"/);
  const el = (value, extra = {}) => ({ value, ...extra });
  const els = { 'e-website': el(' https://gym.example '), 'e-day-pass': el('A$20'), 'e-description': el('d'.repeat(700)) };
  const out = readInfoFields('e', id => els[id] || null, { hourInputs: [el(' 9-5 ', { dataset: { hoursDay: 'mon' } }), el('', { dataset: { hoursDay: 'tue' } })],
    facilityInputs: [el('', { checked: true, dataset: { facility: 'yoga' } }), el('', { checked: false, dataset: { facility: 'cafe' } })] });
  assert.deepEqual(out, { website: 'https://gym.example/', day_pass: 'A$20', description: 'd'.repeat(LIMITS.description), hours: { mon: '9-5' }, facilities: ['yoga'] });
  const modals = read('js/modules/modals.js'), moderation = read('js/modules/moderation.js'), addPage = read('js/modules/add-page.js');
  assert.ok(!/eNotes|notes: document/.test(modals), 'the edit form no longer reads or sends notes');
  assert.ok(!/notes: pe\.notes/.test(moderation), 'approving an edit never overwrites the research notes');
  assert.match(moderation, /description: pe\.description \?\? null, website: pe\.website \?\? null/);
  assert.ok(!/notes: draft/.test(addPage) && /description: draft\.description/.test(addPage));
  assert.ok(!/id="eNotes"/.test(read('index.html')) && /<div id="eInfoFields"><\/div>/.test(read('index.html')));
});

test('moderation diff: gym-information changes are listed in readable form; jsonb key order is not a change', async () => {
  const { diffRowsHtml } = await mod;
  const current = { ...base, hours: { sun: 'Closed', mon: '9-5' }, facilities: [] };
  const proposed = { ...base, hours: { mon: '9-5', sun: 'Closed' }, facilities: ['cafe'], website: 'https://gym.example', day_pass: 'A$20' };
  const { rows } = diffRowsHtml(current, proposed);
  assert.ok(!/>Hours</.test(rows), 'same hours in a different key order');
  assert.match(rows, /<th scope="row">Facilities<\/th><td><\/td><td>Café<\/td>/);
  assert.match(rows, /<th scope="row">Website<\/th>/); assert.match(rows, /<th scope="row">Day pass<\/th><td><\/td><td>A\$20<\/td>/);
  assert.match(diffRowsHtml(null, { ...base, hours: { mon: '9-5', sun: 'Closed' } }).rows, /Mon 9-5 · Sun Closed/);
});
