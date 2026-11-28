// High five (/me), rest day (/log) and pin drop (/add) poses, 2026-11-28: when each shows.   node --test tests/
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
globalThis.window = globalThis.window || {};
globalThis.window.matchMedia = globalThis.window.matchMedia || (() => ({ matches: false }));
const read = f => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

test('high five: only with an approved contribution and the per-device flag unset', async () => {
  const { showHighFive } = await import('../js/modules/provenance.js');
  assert.equal(showHighFive({ points: 15, gyms: 1, edits: 0 }, false), true, 'one approved gym');
  assert.equal(showHighFive({ points: 5, gyms: 0, edits: 1 }, false), true, 'one approved edit');
  assert.equal(showHighFive({ points: 0, gyms: 0, edits: 0, submissions: [{ status: 'pending' }] }, false), false, 'pending submissions are not approved');
  assert.equal(showHighFive({ points: null, gyms: 0, edits: 0 }, false), false, 'points unavailable');
  assert.equal(showHighFive({ points: 15, gyms: 1, edits: 0 }, true), false, 'flag set: shown before');
  assert.equal(showHighFive(null, false), false);
  assert.equal(showHighFive({}, false), false);
});

test('high five: /me wiring (flag key per user, set when shown, kept for the visit, storage failure stays away)', () => {
  const me = read('js/modules/me-page.js');
  assert.match(me, /const HF_KEY = 'bouldeer_highfive_';/);
  assert.match(me, /localStorage\.getItem\(HF_KEY \+ id\) === '1'/);
  assert.match(me, /catch\(err\)\{ return true; \}/, 'unreadable storage: treated as seen');
  assert.match(me, /!showHighFive\(c, hfSeen\(user\.id\)\) \|\| !hfMark\(user\.id\)/, 'the flag is written when the card is first shown; a failed write keeps it away');
  assert.match(me, /highFive: highFiveFor\(window\.auth\.user, community\)/);
  assert.match(me, /leave\(\)\{ hfShownFor = null; \}/, 'leaving /me ends the visit');
});

test('rest day: only when sessions exist and none is dated in the last 7 days', async () => {
  const { isQuietWeek } = await import('../js/modules/page-html.js');
  const today = '2026-11-28';
  assert.equal(isQuietWeek([], today), false, 'no sessions at all: the first-run art covers it');
  assert.equal(isQuietWeek(['2026-11-28'], today), false, 'today');
  assert.equal(isQuietWeek(['2026-11-22'], today), false, 'six days ago is inside the week');
  assert.equal(isQuietWeek(['2026-11-21'], today), true, 'seven days ago is outside');
  assert.equal(isQuietWeek(['2026-10-01', '2026-11-21'].values(), today), true, 'any iterable of dates');
  assert.equal(isQuietWeek(['2026-10-01', '2026-11-26'], today), false, 'one recent session is enough');
  assert.equal(isQuietWeek(['2026-12-02'], today), false, 'a future date counts as recent');
  assert.equal(isQuietWeek(['2026-02-20'], '2026-03-01'), true, 'month boundary');
  assert.equal(isQuietWeek(['2026-02-23'], '2026-03-01'), false, 'month boundary, inside the week');
  assert.equal(isQuietWeek(['2026-11-01'], 'bad'), false);
  const lp = read('js/modules/log-page.js');
  assert.match(lp, /rest: isQuietWeek\(counts\.keys\(\), todayKey\(\)\)/, '/log passes the session dates and local today');
});

test('pin drop: the /add confirmation, one character, none while the form is open', async () => {
  const add = await import('../js/modules/add-html.js');
  const done = add.addDoneHtml();
  assert.match(done, /pin-drop\.svg/);
  assert.equal((done.match(/<img/g) || []).length, 1);
  assert.ok(!/mascot/.test(add.addPageHtml()) && !/mascot/.test(add.addStepHtml({ step: 1, types: [] }, {})));
});

test('new poses are plain traced vectors, viewBox set, no raster or script', () => {
  for (const f of ['high-five', 'rest-day', 'pin-drop']) {
    const svg = read('assets/mascot/' + f + '.svg');
    assert.match(svg, /^<svg[^>]*viewBox="[-0-9. ]+"/, f);
    assert.ok(!/<script|\son[a-z]+=|javascript:|href=|<image|<foreignObject/i.test(svg), f + ' is plain vector shapes');
    assert.ok(svg.length < 120000, f + ' stays small');
  }
});
