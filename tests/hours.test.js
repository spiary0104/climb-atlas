// js/modules/hours.js: parsing a gym's published day strings, its time zone, and open / closed / unknown at a given moment.
// "Wrong is worse than unknown": every shape that is not plainly understood must come back null / 'unknown'.
//   node --test "tests/*.test.js"
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const mod = import('../js/modules/hours.js');
const r = (open, close) => ({ open, close });
const H = (h, m = 0) => h * 60 + m;

test('parseDay: 12-hour times, with and without minutes, any dash, spaces, "to", either case', async () => {
  const { parseDay } = await mod;
  const day = [r(H(6), H(22))];
  for (const s of ['6am–10pm', '6am-10pm', '6am—10pm', '6 am - 10 pm', '6am to 10pm', '6AM–10PM', '6a.m.-10p.m.', ' 6am – 10pm ', '6:00am-10:00pm', '6h-22h']) {
    assert.deepEqual(parseDay(s), day, JSON.stringify(s));
  }
  assert.deepEqual(parseDay('7:30am-9:30pm'), [r(H(7, 30), H(21, 30))]);
  assert.deepEqual(parseDay('6.30am-9.30pm'), [r(H(6, 30), H(21, 30))]);
  assert.deepEqual(parseDay('12pm-8pm'), [r(H(12), H(20))], 'noon is 12pm');
  assert.deepEqual(parseDay('12am-6am'), [r(0, H(6))], 'midnight is 12am');
});

test('parseDay: 24-hour clock in the forms gyms use', async () => {
  const { parseDay } = await mod;
  const day = [r(H(6), H(22))];
  for (const s of ['06:00–22:00', '6:00-22:00', '0600-2200', '06.00-22.00', '6-22', '06-22']) assert.deepEqual(parseDay(s), day, s);
  assert.deepEqual(parseDay('00:00-24:00'), [r(0, 1440)]);
});

test('parseDay: several ranges split by comma, slash, ampersand, "and" or a space', async () => {
  const { parseDay } = await mod;
  const split = [r(H(7), H(12)), r(H(16), H(22))];
  for (const s of ['7am–12pm, 4pm–10pm', '7am-12pm / 4pm-10pm', '7am-12pm & 4pm-10pm', '7am-12pm and 4pm-10pm', '7am-12pm; 4pm-10pm', '7am-12pm 4pm-10pm']) assert.deepEqual(parseDay(s), split, s);
  assert.deepEqual(parseDay('9:00-12:00 14:00-18:00'), [r(H(9), H(12)), r(H(14), H(18))]);
  assert.deepEqual(parseDay('4pm-10pm, 7am-12pm'), split, 'sorted');
});

test('parseDay: closed and around the clock', async () => {
  const { parseDay } = await mod;
  for (const s of ['Closed', 'closed', 'CLOSED', 'Closed all day', '—', '-', '–']) assert.deepEqual(parseDay(s), [], s);
  for (const s of ['24 hours', '24 Hours', '24h', '24 hrs', 'Open 24 hours', 'open 24h', '24/7', '24 hours daily']) assert.deepEqual(parseDay(s), [r(0, 1440)], s);
});

test('parseDay: a range that passes midnight closes after 1440', async () => {
  const { parseDay } = await mod;
  assert.deepEqual(parseDay('6pm-2am'), [r(H(18), H(26))]);
  assert.deepEqual(parseDay('18:00-02:00'), [r(H(18), H(26))]);
  assert.deepEqual(parseDay('6am-12am'), [r(H(6), 1440)], 'closing at 12am is the end of the day');
});

test('parseDay: a bare start takes the end\'s am/pm when that keeps start before end, else the other', async () => {
  const { parseDay } = await mod;
  assert.deepEqual(parseDay('9-5pm'), [r(H(9), H(17))]);
  assert.deepEqual(parseDay('11-2pm'), [r(H(11), H(14))]);
  assert.deepEqual(parseDay('6-10pm'), [r(H(18), H(22))], 'both in the evening, as written');
});

test('parseDay: anything else is null, never a guess', async () => {
  const { parseDay } = await mod;
  const bad = [
    'By appointment', 'Mon-Fri', 'call us', 'Varies', 'Open', 'Dawn to dusk', '', '   ',
    '6am-10',            // the end could be am or pm
    '6-10',              // bare hours could be 12-hour: not understood
    '6am-',              // half a range
    '10am-10am',         // no duration
    '25:00-26:00', '13pm-10pm', '6am-10pm-11pm', '0am-5am', '12:60-13:00',
    '<script>alert(1)</script>', '6am-10pm<img src=x onerror=alert(1)>', '9am-5pm (kids until 4)',
    'x'.repeat(100),
  ];
  assert.ok(bad.length >= 6);
  for (const s of bad) assert.equal(parseDay(s), null, JSON.stringify(s));
  for (const v of [null, undefined, 42, {}, [], true]) assert.equal(parseDay(v), null, String(v));
});

test('hasParseableHours: one readable day is enough; none (or no hours) is not', async () => {
  const { hasParseableHours } = await mod;
  assert.equal(hasParseableHours({ hours: { mon: '6am-10pm' } }), true);
  assert.equal(hasParseableHours({ hours: { mon: 'by appointment', tue: 'Closed' } }), true);
  assert.equal(hasParseableHours({ hours: { mon: 'by appointment' } }), false);
  for (const g of [{}, { hours: null }, { hours: {} }, { hours: 'mon 6am-10pm' }, null]) assert.equal(hasParseableHours(g), false);
});

test('gymTimeZone: country table, state tables where a country spans zones, and null where unknown', async () => {
  const { gymTimeZone: z } = await mod;
  assert.equal(z({ country: 'GB', state: 'ENGLAND' }), 'Europe/London');
  assert.equal(z({ country: 'JP' }), 'Asia/Tokyo');
  assert.equal(z({ country: 'CN', state: 'SHANGHAI' }), 'Asia/Shanghai');
  assert.equal(z({ country: 'CN', state: 'CHENGDU' }), 'Asia/Shanghai', 'all of China is one zone');
  assert.equal(z({ country: 'AU', state: 'NSW' }), 'Australia/Sydney');
  assert.equal(z({ country: 'AU', state: 'WA' }), 'Australia/Perth');
  assert.equal(z({ country: 'AU', state: 'QLD' }), 'Australia/Brisbane');
  assert.equal(z({ country: 'US', state: 'NY' }), 'America/New_York');
  assert.equal(z({ country: 'US', state: 'CA' }), 'America/Los_Angeles');
  assert.equal(z({ country: 'US', state: 'WA' }), 'America/Los_Angeles', 'WA is Washington in the US, Western Australia in AU');
  assert.equal(z({ country: 'CA', state: 'BC', lat: 49.28, lng: -123.12 }), 'America/Vancouver');
  assert.equal(z({ country: 'CA', state: 'ON', lat: 43.65, lng: -79.38 }), 'America/Toronto');
  assert.equal(z({ country: 'RU', state: 'MOSKVA' }), 'Europe/Moscow');
  assert.equal(z({ country: 'RU', state: 'YEKATERINBURG' }), 'Asia/Yekaterinburg');
  assert.equal(z({ country: 'BR', state: 'SAO_PAULO' }), 'America/Sao_Paulo');
  assert.equal(z({ country: 'MX', state: 'CIUDAD_DE_MEXICO' }), 'America/Mexico_City');
  assert.equal(z({ country: 'ID', state: 'BALI' }), 'Asia/Makassar');
  assert.equal(z({ country: 'ID', state: 'DKI_JAKARTA' }), 'Asia/Jakarta');
  assert.equal(z({ country: 'ES', state: 'CANARIAS' }), 'Atlantic/Canary');
  assert.equal(z({ country: 'ES', state: 'MADRID' }), 'Europe/Madrid');
  // states that straddle a zone boundary are decided by position
  assert.equal(z({ country: 'US', state: 'TN', lat: 36.16, lng: -86.78 }), 'America/Chicago', 'Nashville');
  assert.equal(z({ country: 'US', state: 'TN', lat: 35.96, lng: -83.92 }), 'America/New_York', 'Knoxville');
  assert.equal(z({ country: 'US', state: 'TX', lat: 30.27, lng: -97.74 }), 'America/Chicago', 'Austin');
  assert.equal(z({ country: 'US', state: 'TX', lat: 31.76, lng: -106.49 }), 'America/Denver', 'El Paso');
  assert.equal(z({ country: 'US', state: 'TN' }), null, 'a split state with no coordinates is unknown');
  // unknown
  assert.equal(z({ country: 'ZZ' }), null);
  assert.equal(z({ country: 'BR', state: 'AMAZONAS' }), null, 'a state of a multi-zone country that is not in the table');
  assert.equal(z({ country: 'AU', state: 'XX' }), null);
  assert.equal(z({}), null); assert.equal(z(null), null);
});

// A gym that crosses midnight: Fri 6pm-2am, Sat 10am-2am, Sun closed, Mon 6am-10pm; London in January keeps UTC.
const LONDON = { id: 'l', country: 'GB', state: 'ENGLAND', lat: 51.5, lng: -0.1, hours: { fri: '18:00-02:00', sat: '10:00-02:00', sun: 'Closed', mon: '6am-10pm', tue: '6am-10pm', wed: '6am-10pm', thu: '6am-10pm' } };
const at = (iso) => new Date(iso);   // 2027-01-08 is a Friday

test('status: a midnight-crossing gym is open before midnight, still open in the small hours, and closed once it shuts', async () => {
  const { status, statusLine } = await mod;
  // Fri 21:00: inside Friday's 6pm-2am
  let s = status(LONDON, at('2027-01-08T21:00:00Z'), { userLocation: null });
  assert.deepEqual(s, { state: 'open', until: H(2) });
  assert.equal(statusLine(s).text, 'Open · until 2am');
  // Sat 01:00: Friday's tail (the previous day's hours) still counts
  s = status(LONDON, at('2027-01-09T01:00:00Z'), { userLocation: null });
  assert.deepEqual(s, { state: 'open', until: H(2) });
  // Sat 03:00: closed; Saturday opens at 10am
  s = status(LONDON, at('2027-01-09T03:00:00Z'), { userLocation: null });
  assert.deepEqual(s, { state: 'closed', next: { day: 'sat', open: H(10), inDays: 0 } });
  assert.equal(statusLine(s).text, 'Closed · opens 10am');
  // Fri 12:00: closed until 6pm today
  s = status(LONDON, at('2027-01-08T12:00:00Z'), { userLocation: null });
  assert.deepEqual(s, { state: 'closed', next: { day: 'fri', open: H(18), inDays: 0 } });
  // Sun (closed all day) 12:00 but Saturday's tail ended at 2am: closed, next Monday 6am
  s = status(LONDON, at('2027-01-10T12:00:00Z'), { userLocation: null });
  assert.deepEqual(s, { state: 'closed', next: { day: 'mon', open: H(6), inDays: 1 } });
  assert.equal(statusLine(s).text, 'Closed · opens tomorrow 6am');
});

test('status: the boundary minutes (opens at 6pm sharp, closes at 2am sharp)', async () => {
  const { status } = await mod;
  assert.equal(status(LONDON, at('2027-01-08T17:59:00Z'), { userLocation: null }).state, 'closed');
  assert.equal(status(LONDON, at('2027-01-08T18:00:00Z'), { userLocation: null }).state, 'open');
  assert.equal(status(LONDON, at('2027-01-09T01:59:00Z'), { userLocation: null }).state, 'open');
  assert.equal(status(LONDON, at('2027-01-09T02:00:00Z'), { userLocation: null }).state, 'closed');
});

test('status: a gym is judged in its own zone: Sydney and New York at the same instant', async () => {
  const { status, statusLine } = await mod;
  const week = (t) => Object.fromEntries(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => [d, t]));
  const sydney = { country: 'AU', state: 'NSW', lat: -33.87, lng: 151.21, hours: week('6am–10pm') };
  const newYork = { country: 'US', state: 'NY', lat: 40.71, lng: -74.0, hours: week('6am–10pm') };
  // Sydney moved to daylight time on 4 Oct 2026 (UTC+11): 22:00Z on Sunday is 09:00 Monday there, 18:00 Sunday in New York (EDT)
  const nine = at('2026-10-04T22:00:00Z');
  assert.deepEqual(status(sydney, nine, { userLocation: null }), { state: 'open', until: H(22) });
  assert.deepEqual(status(newYork, nine, { userLocation: null }), { state: 'open', until: H(22) });
  // 23:30 Sydney time (12:30Z Monday) is 08:30 in New York
  const late = at('2026-10-05T12:30:00Z');
  const syd = status(sydney, late, { userLocation: null });
  assert.equal(syd.state, 'closed');
  assert.equal(statusLine(syd).text, 'Closed · opens tomorrow 6am');
  assert.deepEqual(status(newYork, late, { userLocation: null }), { state: 'open', until: H(22) });
  // 01:00 Tuesday Sydney (14:00Z Monday): closed there, open (10:00 EDT) in New York
  const same = at('2026-10-05T14:00:00Z');
  assert.equal(status(sydney, same, { userLocation: null }).state, 'closed');
  assert.equal(status(newYork, same, { userLocation: null }).state, 'open');
});

test('status: around the clock, and a run that carries over midnight into the next day', async () => {
  const { status, statusLine } = await mod;
  const all = { country: 'GB', state: 'X', hours: Object.fromEntries(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => [d, '24 hours'])) };
  const s = status(all, at('2027-01-08T03:00:00Z'), { userLocation: null });
  assert.deepEqual(s, { state: 'open', h24: true });
  assert.equal(statusLine(s).text, 'Open 24 hours');
  const carry = { country: 'GB', state: 'X', hours: { fri: '6pm-12am', sat: '12am-3am', mon: '6am-10pm', tue: '6am-10pm', wed: '6am-10pm', thu: '6am-10pm', sun: 'Closed' } };
  assert.deepEqual(status(carry, at('2027-01-08T23:00:00Z'), { userLocation: null }), { state: 'open', until: H(3) }, 'Friday 12am close continues with Saturday from 12am');
});

test('status: unknown when today is missing or unreadable, or the small hours cannot be judged; never a guess', async () => {
  const { status } = await mod;
  const fri = at('2027-01-08T12:00:00Z');
  assert.equal(status({ country: 'GB', hours: { mon: '6am-10pm' } }, fri, { userLocation: null }).state, 'unknown', 'no entry for Friday');
  assert.equal(status({ country: 'GB', hours: { fri: 'by appointment' } }, fri, { userLocation: null }).state, 'unknown');
  assert.equal(status({ country: 'GB', hours: { fri: '<script>alert(1)</script>' } }, fri, { userLocation: null }).state, 'unknown');
  for (const g of [{ country: 'GB' }, { country: 'GB', hours: null }, { country: 'GB', hours: {} }, null, undefined]) assert.equal(status(g, fri, { userLocation: null }).state, 'unknown');
  // 03:00 Friday, Thursday unreadable: yesterday's tail cannot be ruled out, so not "closed"
  const small = { country: 'GB', hours: { thu: 'varies', fri: '6am-10pm' } };
  assert.equal(status(small, at('2027-01-08T03:00:00Z'), { userLocation: null }).state, 'unknown');
  assert.equal(status(small, at('2027-01-08T12:00:00Z'), { userLocation: null }).state, 'open', 'inside today\'s hours, yesterday does not matter');
  // a day ahead that is unreadable: closed, but no next opening is named past it
  const gap = { country: 'GB', hours: { fri: '6am-10pm', sat: 'ask at the desk' } };
  assert.deepEqual(status(gap, at('2027-01-08T23:00:00Z'), { userLocation: null }), { state: 'closed' });
});

test('status: a gym with no zone in the table uses the browser zone only within 300 km of the located visitor', async () => {
  const { status } = await mod;
  const noon = new Date(2027, 0, 8, 12, 0);          // Friday 12:00 in whatever zone this process runs in
  const gym = (lat, lng) => ({ country: 'ZZ', state: 'X', lat, lng, hours: { fri: '9am-5pm', thu: '9am-5pm', sat: '9am-5pm' } });
  const here = { lat: 10, lng: 10 };
  assert.deepEqual(status(gym(10.5, 10.5), noon, { userLocation: here }), { state: 'open', until: H(17) }, '~78 km away');
  assert.deepEqual(status(gym(12.0, 10.0), noon, { userLocation: here }).state, 'open', '~222 km away');
  assert.equal(status(gym(13.5, 10.0), noon, { userLocation: here }).state, 'unknown', '~390 km away');
  assert.equal(status(gym(10.5, 10.5), noon, { userLocation: null }).state, 'unknown', 'visitor not located');
  assert.equal(status(gym(null, null), noon, { userLocation: here }).state, 'unknown', 'gym without coordinates');
  // a gym that has a zone ignores the visitor entirely
  const london = { ...LONDON, hours: { fri: '9am-5pm', thu: '9am-5pm' } };
  assert.equal(status(london, at('2027-01-08T12:00:00Z'), { userLocation: { lat: -33, lng: 151 } }).state, 'open');
});

test('status reads appState.userLocation by default', async () => {
  const { status } = await mod;
  const { appState } = await import('../js/modules/state.js');
  const noon = new Date(2027, 0, 8, 12, 0);
  const gym = { country: 'ZZ', lat: 10.2, lng: 10.2, hours: { fri: '9am-5pm', thu: '9am-5pm' } };
  assert.equal(status(gym, noon).state, 'unknown');
  appState.userLocation = { lat: 10, lng: 10 };
  try { assert.equal(status(gym, noon).state, 'open'); } finally { appState.userLocation = null; }
});

test('todayLabel: the gym\'s own text for its own today, "Closed today", or nothing', async () => {
  const { todayLabel } = await mod;
  assert.equal(todayLabel(LONDON, at('2027-01-08T12:00:00Z'), { userLocation: null }), 'Today 18:00-02:00');
  assert.equal(todayLabel(LONDON, at('2027-01-10T12:00:00Z'), { userLocation: null }), 'Closed today');
  assert.equal(todayLabel({ ...LONDON, hours: { mon: '6am-10pm' } }, at('2027-01-08T12:00:00Z'), { userLocation: null }), '', 'no entry for today');
  assert.equal(todayLabel({ country: 'GB' }, at('2027-01-08T12:00:00Z')), '');
  // unreadable text is shown as published (callers escape it)
  assert.equal(todayLabel({ country: 'GB', hours: { fri: 'by appointment' } }, at('2027-01-08T12:00:00Z'), { userLocation: null }), 'Today by appointment');
  // the gym's day, not the visitor's: 23:30 Friday in New York is already Saturday in London
  const ny = { country: 'US', state: 'NY', hours: { fri: '6am-10pm', sat: '8am-8pm' } };
  assert.equal(todayLabel(ny, at('2027-01-09T04:30:00Z'), { userLocation: null }), 'Today 6am-10pm', '23:30 Friday in New York');
});

test('gymDayKey: the gym\'s weekday, null when its clock is unknown', async () => {
  const { gymDayKey } = await mod;
  assert.equal(gymDayKey(LONDON, at('2027-01-08T12:00:00Z'), { userLocation: null }), 'fri');
  assert.equal(gymDayKey({ country: 'AU', state: 'NSW' }, at('2027-01-08T20:00:00Z'), { userLocation: null }), 'sat', '07:00 Saturday in Sydney');
  assert.equal(gymDayKey({ country: 'ZZ' }, at('2027-01-08T12:00:00Z'), { userLocation: null }), null);
});

test('formatMinutes and statusLine wording', async () => {
  const { formatMinutes, statusLine } = await mod;
  assert.deepEqual([0, 360, 390, 600, 720, 780, 1320, 1350, 1440, 1560].map(formatMinutes), ['12am', '6am', '6:30am', '10am', '12pm', '1pm', '10pm', '10:30pm', '12am', '2am']);
  assert.deepEqual(statusLine({ state: 'open', until: H(22) }), { state: 'open', text: 'Open · until 10pm' });
  assert.deepEqual(statusLine({ state: 'open', until: 0 }), { state: 'open', text: 'Open · until midnight' });
  assert.deepEqual(statusLine({ state: 'closed', next: { day: 'mon', open: H(6), inDays: 0 } }), { state: 'closed', text: 'Closed · opens 6am' });
  assert.deepEqual(statusLine({ state: 'closed', next: { day: 'tue', open: H(6, 30), inDays: 1 } }), { state: 'closed', text: 'Closed · opens tomorrow 6:30am' });
  assert.deepEqual(statusLine({ state: 'closed', next: { day: 'thu', open: H(10), inDays: 3 } }), { state: 'closed', text: 'Closed · opens Thu 10am' });
  assert.deepEqual(statusLine({ state: 'closed' }), { state: 'closed', text: 'Closed' });
  assert.equal(statusLine({ state: 'unknown' }), null);
  assert.equal(statusLine(null), null);
});

test('filtering many gyms is cheap: a clock is formatted once per zone and minute, not once per gym', async () => {
  const { status } = await mod;
  const now = new Date();
  const g = { country: 'DE', state: 'X', hours: Object.fromEntries(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => [d, '6am-10pm'])) };
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < 20000; i++) status({ ...g, hours: g.hours }, now, { userLocation: null });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  assert.ok(ms < 400, '20,000 status() calls took ' + ms.toFixed(0) + ' ms');
});
