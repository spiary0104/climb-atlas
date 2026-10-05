// Share on the gym page (share.js): the text a climber sends with a gym link, and the Web Share -> clipboard -> toast
// fallback order. Pure where it can be; the share itself is exercised with a fake navigator.   node --test tests/share.test.js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

globalThis.window = globalThis.window || {};
globalThis.window.matchMedia = () => ({ matches: false });
// showToast writes to #toast: a tiny stand-in records the text.
const toasts = [];
globalThis.document = globalThis.document || {};
globalThis.document.getElementById = (id) => id === 'toast'
  ? { set textContent(v){ toasts.push(v); }, classList: { add(){}, remove(){} } } : null;

const mod = import('../js/modules/share.js');
const gym = { id: 'seed-1', slug: 'blochaus-marrickville', name: '  BlocHaus   Marrickville ', suburb: 'Marrickville', state: 'NSW', country: 'AU',
  types: ['indoor-bouldering'], address: '49 Fitzroy St, Marrickville NSW 2204', day_pass: 'A$28 adult', website: 'https://syd.blochaus.com.au/',
  hours: { mon: '6am–10pm', tue: '6am–10pm', wed: '6am–10pm', thu: '6am–10pm', fri: '6am–10pm', sat: '8am–8pm', sun: '8am–8pm' } };

test('gym share text: name · types · place, then the address; the canonical URL; nothing time-bound', async () => {
  const { gymShareText } = await mod;
  const s = gymShareText(gym, { region: 'NSW' });
  assert.equal(s.title, 'BlocHaus Marrickville — Bouldeer');
  assert.equal(s.text, 'BlocHaus Marrickville · Bouldering · Marrickville, NSW\n49 Fitzroy St, Marrickville NSW 2204');
  assert.equal(s.url, 'https://www.bouldeer.com/gym/blochaus-marrickville');
  // still true on another day: no "Today …" hours and no price, even when the gym has both
  assert.ok(!/today|6am|8am|A\$|day pass/i.test(s.text), 'no hours or price in the message: ' + s.text);
  const bare = gymShareText({ id: 'x', slug: 'x', name: 'X', types: ['indoor-bouldering', 'top-rope', 'lead-climbing'] }, {});
  assert.equal(bare.text, 'X · Bouldering + Top rope + Lead climbing', 'no address: one line, never an empty second line');
  assert.equal(gymShareText({ id: 'y', name: 'Y', types: [] }, {}).url, 'https://www.bouldeer.com/gym/y', 'no slug: the id path');
  assert.equal(gymShareText({ ...gym, suburb: '' }, {}).text.split('\n')[0], 'BlocHaus Marrickville · Bouldering', 'no place: no dangling separator');
});

test('gym share text is plain text with user fields normalised and capped (no control characters)', async () => {
  const { gymShareText } = await mod;
  const nasty = gymShareText({ ...gym, name: 'A\u0000B <script>alert(1)</script> ' + 'long '.repeat(40), address: 'x'.repeat(300) }, { region: 'NSW' });
  assert.ok(!/[\u0000-\u0009\u000b-\u001f]/.test(nasty.text) && !nasty.text.includes('\n\n'), 'no control characters besides the one line break');
  assert.ok(nasty.text.split('\n')[0].length < 140, 'first line capped');
  assert.ok(nasty.text.split('\n')[1].length <= 90, 'address capped');
  assert.ok(nasty.text.includes('<script>'), 'plain text is not HTML-escaped: the receiving app renders text, and escaping would show &lt; in a chat');
});

test('sharePlace: Web Share first (with the url), a dismissed sheet is silent, no Web Share copies the link and says so, nothing works -> the link is in the toast', async () => {
  const { sharePlace } = await mod;
  const payload = { title: 't', text: 'x', url: 'https://www.bouldeer.com/gym/x' };
  let got = null;
  assert.equal(await sharePlace(payload, { nav: { share: async (d) => { got = d; }, canShare: () => true } }), 'shared');
  assert.deepEqual(got, payload);
  const abort = Object.assign(new Error('x'), { name: 'AbortError' });
  toasts.length = 0;
  assert.equal(await sharePlace(payload, { nav: { share: async () => { throw abort; } } }), 'cancelled');
  assert.equal(toasts.length, 0, 'a dismissed share sheet shows nothing');
  let copied = '';
  assert.equal(await sharePlace(payload, { nav: { clipboard: { writeText: async (s) => { copied = s; } } } }), 'copied');
  assert.equal(copied, payload.url);
  assert.equal(toasts.at(-1), 'Link copied');
  // Web Share throws something else (e.g. NotAllowedError without a user gesture): fall back to the clipboard.
  assert.equal(await sharePlace(payload, { nav: { share: async () => { throw new Error('nope'); }, clipboard: { writeText: async () => {} } } }), 'copied');
  assert.equal(await sharePlace(payload, { nav: {} }), 'failed');
  assert.equal(toasts.at(-1), 'Copy this link: ' + payload.url);
  // canShare that refuses the payload skips straight to the clipboard instead of throwing.
  assert.equal(await sharePlace(payload, { nav: { share: async () => { throw new Error('should not be called'); }, canShare: () => false, clipboard: { writeText: async () => {} } } }), 'copied');
});
