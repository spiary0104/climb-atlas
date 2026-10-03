// Real-phone test fixes (2026-09-28): the Log a session climb row, the gym picker, the Regions page search, the display
// name save, and the /me tab counts. Pure builders and CSS rules only (the flows are checked in the browser).
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

globalThis.window = globalThis.window || {};              // constants.js reads the reduced-motion preference on import
globalThis.window.matchMedia = () => ({ matches: false });

const ROOT = path.resolve(__dirname, '..');
const read =(f) => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\r\n/g, '\n');
const url = (p) => pathToFileURL(path.join(ROOT, p)).href;
const modules = (async () => ({
  picker: await import(url('js/modules/gym-picker.js')),
  page: await import(url('js/modules/page-html.js')),
  prov: await import(url('js/modules/provenance.js')),
}))();
const HOSTILE = ['<img src=x onerror=alert(1)>', '"><script>alert(1)</script>', "' onmouseover='alert(1)"];
// Tag-level: a real <script>/<img> element or a real on* attribute. Escaped TEXT may legitimately read "onerror=".
const leaks = (html) => [...html.matchAll(/<([a-zA-Z][\w-]*)((?:\s+[^\s=>]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/g)]
  .some(([, tag, attrs]) => /^(script|img|iframe)$/i.test(tag)
    || [...attrs.replace(/"[^"]*"|'[^']*'/g, '""').matchAll(/\s([^\s=>]+)/g)].some(([, name]) => /^on/i.test(name)));

// ----- 1. the climb row --------------------------------------------------------------------------------------------
// Specificity [ids, classes+attributes+pseudo-classes, elements]; :not()/:is() count as their most specific argument.
function specificity(sel){
  let s = sel, best = [0, 0, 0];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const max = (list) => list.map(specificity).sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2])[0];
  s = s.replace(/:(not|is)\(([^()]*)\)/g, (m, fn, args) => { best = add(best, max(args.split(','))); return ' '; });
  const ids = (s.match(/#[\w-]+/g) || []).length;
  const cls = (s.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) || []).length;
  const els = (s.replace(/\[[^\]]+\]/g, '').match(/(^|[\s>+~(])[a-z][\w-]*/gi) || []).length;
  return add(best, [ids, cls, els]);
}
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

test('climb row: its control rules outrank the shared .field input rule, so attempts no longer spans the row', () => {
  const components = read('css/components.css'), style = read('css/style.css'), html = read('index.html');
  const field = '.field input:not([type="checkbox"]):not([type="radio"])';
  assert.ok(components.includes(field + ',.field select,.field textarea{\n  width:100%;'), 'the shared field rule this guards against');
  for (const sel of ['.climb-rows .climb-row input.climb-attempts', '.climb-rows .climb-row :is(select, input[type="text"], input[type="number"])']){
    assert.ok(style.includes(sel + '{'), 'missing ' + sel);
    assert.ok(cmp(specificity(sel), specificity(field)) >= 0, `${sel} ${specificity(sel)} < ${specificity(field)}`);
  }
  assert.ok(html.indexOf('css/style.css') > html.indexOf('css/components.css'), 'style.css comes later, so a tie goes to the climb row');
  assert.match(style, /\.climb-row\{\n  display:flex;flex-wrap:wrap;/, 'the row wraps onto two lines inside the 380px dialog');
  assert.match(style, /\.climb-rows \.climb-row input\.climb-attempts\{flex:none;width:calc\(var\(--size-touch-min\) \+ var\(--space-5\)\);\}/);
  assert.equal(specificity('.field input:not([type="checkbox"]):not([type="radio"])').join(), '0,3,1', 'helper sanity');
});

test('Log a session: Date and Mood share one height; iOS drops the date input\'s native box (real-phone test 2026-09-29)', () => {
  const css = read('css/components.css');
  assert.ok(css.includes('.field select,.field input[type="date"]{height:var(--size-control-md);}'), 'one fixed height for single-line pickers');
  const ios = css.slice(css.indexOf('@supports (-webkit-touch-callout: none){'));
  assert.ok(ios.length > 0, 'an iOS-only block');
  const block = ios.slice(0, ios.indexOf('\n}'));
  assert.ok(block.includes('.field input[type="date"]{-webkit-appearance:none;appearance:none;'), block);
  assert.ok(block.includes('::-webkit-date-and-time-value{margin:0;text-align:left;}'), 'iOS centres the value otherwise');
  const html = read('index.html');
  assert.match(html, /<div class="field field-row">\s*<div>\s*<label for="sDate">Date<\/label>\s*<input id="sDate" type="date">[\s\S]*?<select id="sMood">/, 'the pair this guards');
});

// ----- 2/3. the gym picker -----------------------------------------------------------------------------------------
const COUNTRIES = ['AU', 'DE', 'JP', 'US', 'GB'];
const spots = Array.from({ length: 2500 }, (_, i) => ({
  id: 'g' + i, name: (i === 7 ? 'Boulderwelt Hamburg' : i === 8 ? 'Blochaus Marrickville' : 'Climbing Hall ' + i),
  suburb: i === 8 ? 'Marrickville' : i === 7 ? 'Hamburg' : 'Town ' + (i % 40), state: i === 8 ? 'NSW' : 'X', country: COUNTRIES[i % 5], lat: 0, lng: 0,
}));
const stateLabel = (c, s) => (s === 'NSW' ? 'New South Wales' : s);

test('gym picker: search by name, city, region or country; ranked; capped; an empty state', async () => {
  const { picker } = await modules;
  const idx = picker.buildPickerIndex(spots, { stateLabel });
  assert.equal(idx.gyms.length, 2500);
  assert.equal(picker.queryGyms(idx, 'boulderwelt').items[0].id, 'g7', 'by name');
  assert.equal(picker.queryGyms(idx, 'marrick').items[0].id, 'g8', 'by city (suburb)');
  assert.ok(picker.queryGyms(idx, 'new south').items.some((e) => e.id === 'g8'), 'by region label');
  assert.equal(picker.queryGyms(idx, 'Hamburg').items[0].id, 'g7', 'a name match ranks first');
  const japan = picker.queryGyms(idx, 'japan');
  assert.equal(japan.total, 500, 'by country name');
  assert.equal(japan.items.length, picker.PICKER_LIMIT, 'never renders the whole dataset');
  assert.deepEqual(picker.queryGyms(idx, '   ').items, []);
  assert.equal(picker.queryGyms(idx, 'zzzz nothing').total, 0);
  const html = picker.pickerResultsHtml('zzzz', picker.queryGyms(idx, 'zzzz'));
  assert.match(html, /No gyms match “zzzz”/, 'empty state names the query');
  const chosen = japan.items[3].id;
  const many = picker.pickerResultsHtml('japan', japan, chosen);
  assert.match(many, /Showing 50 of 500/);
  assert.equal((many.match(/role="option"/g) || []).length, 50);
  assert.match(many, /id="sGymOptions" role="listbox"/);
  assert.match(many, new RegExp(`data-gym-id="${chosen}" aria-selected="true"`), 'the selected gym is marked');
  assert.equal((many.match(/aria-selected="true"/g) || []).length, 1);
});

test('gym picker: browsing starts collapsed and renders no gyms until a country opens; hostile names stay text', async () => {
  const { picker } = await modules;
  const idx = picker.buildPickerIndex(spots, { stateLabel });
  const browse = picker.pickerBrowseHtml(idx, '');
  assert.ok(!/<details[^>]* open/.test(browse), 'every continent and country starts collapsed');
  assert.ok(!browse.includes('Climbing Hall'), 'no gym rows until a country is opened');
  assert.match(browse, /data-gym-id="" aria-current="true"/, '"No specific gym" is the current choice by default');
  assert.equal((browse.match(/class="picker-group"/g) || []).length, 4, 'one group per continent present (AU, DE+GB, JP, US)');
  const de = picker.gymsInCountry(idx, 'DE');
  assert.equal(de.length, 500);
  assert.match(picker.pickerGymsHtml(de.slice(0, 3), de[1].id), new RegExp(`data-gym-id="${de[1].id}" aria-current="true"`));
  for (const h of HOSTILE){
    const hidx = picker.buildPickerIndex([{ id: h, name: h, suburb: h, state: h, country: h, lat: 0, lng: 0 }], { stateLabel });
    const outs = [picker.pickerResultsHtml(h, { items: hidx.gyms, total: 1 }, h), picker.pickerBrowseHtml(hidx, h),
      picker.pickerGymsHtml(hidx.gyms, h), picker.pickerCurrentHtml(hidx.gyms[0], true), picker.pickerResultsHtml(h, { items: [], total: 0 })];
    for (const o of outs) assert.ok(!leaks(o), 'markup leaked: ' + o.slice(0, 120));
  }
  assert.match(picker.pickerCurrentHtml(null), /No specific gym[\s\S]*Choose a gym/);
  assert.match(picker.pickerCurrentHtml(idx.byId.get('g7'), false), /Boulderwelt Hamburg[\s\S]*aria-expanded="false"[\s\S]*Change/);
});

test('Regions page: a search field, continents collapsed, results escaped, an empty state', async () => {
  const { page } = await modules;
  const html = page.regionsIndexHtml([{ title: 'Asia', items: [{ label: 'Japan', href: '/in/jp', count: 2 }] }, { title: 'Europe', items: [{ label: 'Germany', href: '/in/de', count: 3 }] }], 5);
  assert.match(html, /<input class="input" type="search" id="regionSearch"/);
  assert.equal((html.match(/<details class="page-section region-continent">/g) || []).length, 2, 'every continent is a collapsed disclosure');
  assert.ok(!/<details[^>]* open/.test(html));
  assert.match(html, /<summary[^>]*>[\s\S]*<h2 class="section-title">Asia<\/h2>[\s\S]*1 country · 2 gyms/, 'the summary keeps the heading and says what is inside');
  assert.equal(page.regionSearchResultsHtml('', []), '');
  assert.match(page.regionSearchResultsHtml('xyz', []), /No places or gyms match “xyz”/);
  const hits = page.regionSearchResultsHtml('ja', [{ kind: 'country', label: 'Japan', secondary: '', href: '/in/jp', count: 2 }, { kind: 'gym', label: 'B-Pump', secondary: 'Tokyo', href: '/gym/b-pump', count: 0 }]);
  assert.match(hits, /href="\/in\/jp" data-link>[\s\S]*Japan[\s\S]*Country[\s\S]*2 gyms/);
  assert.match(hits, /href="\/gym\/b-pump"[\s\S]*Gym · Tokyo/);
  for (const h of HOSTILE){
    assert.ok(!leaks(page.regionSearchResultsHtml(h, [{ kind: 'city', label: h, secondary: h, href: h, count: 1 }])));
    assert.ok(!leaks(page.regionSearchResultsHtml(h, [])));
    assert.ok(!leaks(page.regionsIndexHtml([{ title: h, items: [{ label: h, href: h, count: 1 }] }], 1).replace(page.pageArtHtml('regions-wall'), '')), 'hostile names add no tags (the fixed header art aside)');
  }
});

// ----- 4. the display name ------------------------------------------------------------------------------------------
test('display name: the save failure says what actually happened; before the profiles table exists the form is off', async () => {
  const { prov, page } = await modules;
  const missing = { code: 'PGRST205', message: "Could not find the table 'public.profiles' in the schema cache" };
  assert.equal(prov.isMissingTable(missing), true);
  assert.equal(prov.isMissingTable({ code: '42P01', message: 'relation "profiles" does not exist' }), true);
  assert.equal(prov.isMissingTable({ code: '42501', message: 'new row violates row-level security policy' }), false);
  assert.match(prov.displayNameSaveMessage(missing), /aren’t switched on yet/);
  assert.match(prov.displayNameSaveMessage({ code: '23514', message: 'violates check constraint "profiles_display_name_check"' }), /2 to 40 characters/);
  assert.match(prov.displayNameSaveMessage({ code: '42501', message: 'new row violates row-level security policy for table "profiles"' }), /Sign in again/);
  assert.match(prov.displayNameSaveMessage({ message: 'JWT expired' }), /Sign in again/);
  assert.equal(prov.displayNameSaveMessage(new Error('network down')), 'Could not save — try again.');
  const base = { displayName: 'Mika', points: 3, level: 1, contributor: false, submissions: [] };
  const on = page.meContributionsHtml({ ...base, profilesAvailable: true });
  assert.ok(!/ disabled/.test(on) && /Shown as “added by …”/.test(on), 'normally editable');
  const off = page.meContributionsHtml({ ...base, profilesAvailable: false });
  assert.match(off, /id="displayName"[^>]* disabled>/);
  assert.match(off, /class="btn btn-secondary" disabled>Save/);
  assert.match(off, /Display names aren’t switched on yet/);
});

// ----- 5. the /me tab counts ---------------------------------------------------------------------------------------
test('/me tabs: "Saved" and "Climbed" are separate from their counts, the counts are the list lengths, and CSS spaces them', async () => {
  const { page } = await modules;
  const item = (id) => ({ g: { id, name: 'Gym ' + id, suburb: 'X', types: ['indoor-bouldering'], lat: 0, lng: 0 }, ctx: { href: '/gym/' + id, region: 'NSW' } });
  const html = page.mePageHtml({ signedIn: true, section: 'saved', saved: [item('a')], climbed: [item('b'), item('c')], isModerator: false, pendingCount: 0, community: null });
  assert.match(html, /<a class="tab" href="\/me\/saved" data-link aria-current="page">Saved <span class="tnum">1<\/span><\/a>/);
  assert.match(html, /<a class="tab" href="\/me\/climbed" data-link>Climbed <span class="tnum">2<\/span><\/a>/);
  assert.match(read('css/page.css'), /\.me-tabs \.tab\{gap:var\(--space-1\);/, 'flex tabs drop the space between label and count: a token gap restores it');
});
