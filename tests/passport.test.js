// Passport rules (js/modules/passport.js, pure): stamps per city, stats, the passport line, milestones, grade ordering.
//   node --test "tests/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const mod = import('../js/modules/passport.js');
const gym = (id, suburb, country = 'AU', state = 'NSW') => ({ id, name: 'Gym ' + id, suburb, state, country });
const spots = [gym('a', 'Alexandria'), gym('b', 'Alexandria'), gym('c', 'Newtown'), gym('d', 'Shibuya', 'JP', '13'), gym('e', 'Mitte', 'DE', 'BE'),
  gym('f', 'Marrickville'), gym('g', 'Glebe'), gym('h', 'Ultimo')];
const byId = new Map(spots.map(s => [s.id, s]));
let n = 0;
const ci = (spot_id, day) => ({ id: 'c' + (++n), spot_id, checked_at: `2026-${day}T10:00:00Z`, note: null });

test('stamps: one per city (suburb within region and country), distinct gyms counted, most recent first; unknown gyms ignored', async () => {
  const { stamps, passportStats, statsLine } = await mod;
  const rows = [ci('a', '01-02'), ci('b', '01-05'), ci('a', '02-01'), ci('c', '03-01'), ci('zz-deleted', '03-02')];
  const s = stamps(rows, byId);
  assert.deepEqual(s.map(x => [x.city, x.gyms, x.visits]), [['Newtown', 1, 1], ['Alexandria', 2, 3]]);
  assert.equal(s[1].first, '2026-01-02T10:00:00Z', 'the city stamp carries its first date');
  assert.equal(statsLine(passportStats(rows, byId)), '3 gyms · 2 cities · 1 country');
  assert.equal(statsLine(passportStats([ci('a', '01-01')], byId)), '1 gym · 1 city · 1 country');
  assert.deepEqual(stamps([], byId), []);
});

test('passport line: first stamp, first gym in a country, first gym in a city (with the year count), nth visit, nth gym', async () => {
  const { passportLine } = await mod;
  const name = c => ({ JP: 'Japan', DE: 'Germany' })[c] || c;
  const one = ci('a', '01-01');
  assert.equal(passportLine([one], one, byId, name), 'Your first stamp.');
  const two = ci('d', '02-01');
  assert.equal(passportLine([one, two], two, byId, name), 'Your first gym in Japan.');
  const three = ci('c', '03-01');
  assert.equal(passportLine([one, two, three], three, byId, name), 'Your first gym in Newtown, your 3rd city this year.');
  const four = ci('a', '04-01');
  assert.equal(passportLine([one, two, three, four], four, byId, name), 'Your 2nd visit here.');
  const five = ci('b', '05-01');
  assert.equal(passportLine([one, two, three, four, five], five, byId, name), 'Your 4th gym.');
  assert.equal(passportLine([one], { id: 'x', spot_id: 'nope', checked_at: '2026-01-01' }, byId), '', 'unknown gym: no line');
});

test('milestones: first stamp; every 5th distinct gym; first stamp abroad, then first gym in each new country; never for home', async () => {
  const { milestonesFor } = await mod;
  const name = c => ({ JP: 'Japan', DE: 'Germany', AU: 'Australia' })[c] || c;
  const first = ci('a', '01-01');
  assert.deepEqual(milestonesFor([first], first, byId, { home: 'AU', countryName: name }).map(m => m.kind), ['first']);
  const jp = ci('d', '01-02');
  const abroad = milestonesFor([first, jp], jp, byId, { home: 'AU', countryName: name });
  assert.deepEqual(abroad.map(m => [m.kind, m.title]), [['abroad', 'First stamp abroad']]);
  const de = ci('e', '01-03');
  assert.deepEqual(milestonesFor([first, jp, de], de, byId, { home: 'AU', countryName: name }).map(m => m.title), ['First gym in Germany']);
  // home unknown: any new country after the first is "First gym in ..."
  assert.deepEqual(milestonesFor([first, jp], jp, byId, { countryName: name }).map(m => m.title), ['First gym in Japan']);
  // a first check-in abroad whose home is elsewhere, then home: home never earns a country milestone
  const jpFirst = ci('d', '02-01'), home = ci('a', '02-02');
  assert.deepEqual(milestonesFor([jpFirst, home], home, byId, { home: 'AU', countryName: name }).map(m => m.kind), []);
  // the 5th distinct gym (repeat visits do not count); the 6th earns nothing
  const five = ['a', 'b', 'c', 'f', 'g'].map((id, i) => ci(id, '03-0' + (i + 1)));
  assert.deepEqual(milestonesFor(five, five[4], byId, { home: 'AU' }).map(m => [m.kind, m.title]), [['gyms', '5 gyms']]);
  const again = ci('a', '03-09');
  assert.deepEqual(milestonesFor([...five, again], again, byId, { home: 'AU' }), [], 'a repeat visit earns nothing');
  const sixth = ci('h', '03-10');
  assert.deepEqual(milestonesFor([...five, sixth], sixth, byId, { home: 'AU' }), []);
  for (const m of milestonesFor([first], first, byId)) assert.equal(m.pose, 'topped-out');
});

test('grades: V-scale and YDS rank within their system; a new highest SENT grade earns the dyno milestone; nothing else does', async () => {
  const { gradeRank, newTopGrade } = await mod;
  assert.ok(gradeRank('VB', 'v-scale') < gradeRank('V0', 'v-scale'));
  assert.ok(gradeRank('V4-', 'v-scale') < gradeRank('V4', 'v-scale') && gradeRank('V4', 'v-scale') < gradeRank('V4+', 'v-scale') && gradeRank('V4+', 'v-scale') < gradeRank('V5', 'v-scale'));
  assert.ok(gradeRank('5.10a', 'yds') < gradeRank('5.10d', 'yds') && gradeRank('5.10d', 'yds') < gradeRank('5.11a', 'yds'));
  assert.ok(gradeRank(' v6 ', 'v-scale') === 6, 'case and spaces are tolerated');
  for (const bad of ['V99', 'hard', '', '6a', null]) assert.equal(gradeRank(bad, 'v-scale'), null, String(bad));
  assert.equal(gradeRank('V3', 'font'), null, 'unknown systems do not rank');
  const v = (grade, sent = true) => ({ grade, grade_system: 'v-scale', sent });
  assert.equal(newTopGrade([], [v('V5')]), null, 'the first logged grade is not a milestone');
  assert.deepEqual(newTopGrade([v('V3'), v('V5', false)], [v('V4'), v('V2')]), { kind: 'grade', title: 'First V4', sentence: 'A new highest grade in your log.', pose: 'dyno' });
  assert.equal(newTopGrade([v('V5')], [v('V5'), v('V4')]), null, 'equal is not new');
  assert.equal(newTopGrade([v('V3')], [v('V6', false)]), null, 'an unsent attempt is not a send');
  assert.equal(newTopGrade([v('V3')], [{ grade: '5.12a', grade_system: 'yds', sent: true }]), null, 'a first YDS grade does not beat a V grade');
});

test('helpers: ordinals and the home country from the browser locale', async () => {
  const { ordinal, homeFromLocale } = await mod;
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 101, 111].map(ordinal), ['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '101st', '111th']);
  assert.equal(homeFromLocale('en-AU'), 'AU');
  assert.equal(homeFromLocale('de_DE'), 'DE');
  assert.equal(homeFromLocale('zh-Hant-TW'), 'TW');
  assert.equal(homeFromLocale('en'), '');
  assert.equal(homeFromLocale(undefined), '');
});
