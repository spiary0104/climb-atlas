// Gym page visitor info, provenance line, Copy address and the Amap link (js/modules/visit-html.js).
const test = require('node:test');
const assert = require('node:assert');
const store = new Map();
globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
globalThis.window = globalThis.window || {};
globalThis.window.matchMedia = globalThis.window.matchMedia || (() => ({ matches: false }));

const load = () => Promise.all([import('../js/modules/visit-html.js'), import('../js/modules/i18n.js'), import('../js/modules/page-html.js')]);
const gym = { id: 'g1', name: 'Panda Climbing', name_local: '熊猫攀岩', country: 'CN', state: 'CHENGDU', suburb: 'Wuhou', lat: 30.5728, lng: 104.0668,
  address: '388 Tianren Rd', address_local: '天仁路388号天府凯德L5-15号', types: ['indoor-bouldering'] };
const full = { booking: 'WeChat mini-program', payment: 'WeChat Pay, Alipay', english_help: '一些员工会说英语', id_required: 'Passport', shoe_hire: 'Yes, 15 RMB', note: 'Bring socks' };

test('visitor info: no data is one "not confirmed yet" line naming the facts, no rows and no source', async () => {
  const [V, I] = await load(); await I.setLocale('en');
  const html = V.visitorHtml(gym);
  assert.equal((html.match(/not confirmed yet/g) || []).length, 1);
  for(const l of ['Booking', 'payment', 'English help', 'ID', 'shoe hire']) assert.ok(html.includes(l), l);
  assert.ok(!/visitor-row|visitor-source|Other visitor details/.test(html));
  await I.setLocale('zh-CN');
  assert.match(V.visitorHtml(gym), /预约、付款、英文服务、证件和租鞋：尚未确认/);
  await I.setLocale('en');
});

test('visitor info: partial data shows only the present fields plus one "other details" line; full data has no such line', async () => {
  const [V, I] = await load(); await I.setLocale('en');
  const html = V.visitorHtml({ ...gym, visitor: { booking: 'Walk in', note: 'Quiet on weekdays' } });
  assert.ok(html.includes('Walk in') && html.includes('Quiet on weekdays'));
  assert.ok(!/Not confirmed yet/.test(html) && !html.includes('>Payment<'));
  assert.equal((html.match(/Other visitor details not confirmed yet/g) || []).length, 1);
  const all = V.visitorHtml({ ...gym, visitor: full });
  assert.ok(!/Other visitor details|Not confirmed yet/.test(all));
  // a visitor object with only a note still leaves the five facts unconfirmed
  assert.equal((V.visitorHtml({ ...gym, visitor: { note: 'x' } }).match(/Other visitor details/g) || []).length, 1);
});

test('visitor info: stored text is shown verbatim, escaped, and tagged with the local language only when it is in that script', async () => {
  const [V, I] = await load(); await I.setLocale('zh-CN');
  const html = V.visitorHtml({ ...gym, visitor: { ...full, booking: '<img src=x onerror=alert(1)>' } });
  assert.ok(html.includes('一些员工会说英语') && html.includes('WeChat Pay, Alipay'), 'not translated, not rewritten');
  assert.ok(!html.includes('<img') && html.includes('&lt;img'), 'escaped');
  assert.ok(html.includes('<dd lang="zh-Hans">一些员工会说英语</dd>'), 'CJK text tagged');
  assert.ok(html.includes('<dd>WeChat Pay, Alipay</dd>'), 'Latin text untagged');
  assert.ok(html.includes('到访须知') && html.includes('租鞋'), 'labels follow the interface language');
  assert.ok(V.visitorHtml({ ...gym, country: 'AU', visitor: full }).indexOf('lang=') === -1, 'no tag outside a local-language country');
  await I.setLocale('en');
});

test('visitor info: provenance line links the source through safeUrl and formats the date; unsafe or incomplete provenance never links', async () => {
  const [V, I] = await load(); await I.setLocale('en');
  const src = { ...gym, visitor: full, info_source: 'https://example.com/visit?a=1&b=2', info_source_kind: 'official-site', info_checked_on: '2026-11-01' };
  const html = V.visitorHtml(src);
  assert.match(html, /Source: <a class="link" href="https:\/\/example\.com\/visit\?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">official site<\/a>, checked Nov 1, 2026/);
  assert.match(V.visitorHtml({ ...src, info_source_kind: 'official-social' }), />official account<\/a>/);
  const bad = V.visitorHtml({ ...src, info_source: 'javascript:alert(1)' });
  assert.ok(!/href="javascript|<a class="link"/.test(bad) && bad.includes('official site, checked'));
  assert.ok(!/Source:/.test(V.visitorHtml({ ...src, info_checked_on: null })));
  assert.ok(!/Source:/.test(V.visitorHtml({ ...src, info_source_kind: 'x' })));
  await I.setLocale('zh-CN');
  assert.match(V.visitorHtml(src), /来源：<a [^>]*>官方网站<\/a>，核实于 2026年11月1日/);
  await I.setLocale('en');
});

test('copy address: the local address when there is one, else the address; nothing to copy shows no button', async () => {
  const [V] = await load();
  assert.equal(V.copyableAddress(gym), '天仁路388号天府凯德L5-15号');
  assert.equal(V.copyableAddress({ ...gym, address_local: '  ' }), '388 Tianren Rd');
  assert.equal(V.copyableAddress({ ...gym, address_local: null, address: '' }), '');
  assert.ok(V.addressActionsHtml({ ...gym, country: 'AU' }).includes('data-page-action="copy-address"'));
  assert.ok(!V.addressActionsHtml({ ...gym, country: 'AU' }).includes('amap'));
  assert.equal(V.addressActionsHtml({ ...gym, country: 'AU', address_local: null, address: '' }), '');
});

test('Amap link: China only, WGS-84 coordinates flagged coordinate=wgs84 (no client conversion), local name URL-encoded', async () => {
  const [V] = await load();
  const url = V.amapUrl(gym);
  const u = new URL(url);
  assert.equal(u.origin + u.pathname, 'https://uri.amap.com/marker');
  assert.equal(u.searchParams.get('position'), '104.066800,30.572800', 'lng,lat as stored');
  assert.equal(u.searchParams.get('coordinate'), 'wgs84');
  assert.equal(u.searchParams.get('name'), '熊猫攀岩');
  assert.ok(url.includes('name=' + encodeURIComponent('熊猫攀岩')));
  assert.equal(new URL(V.amapUrl({ ...gym, name_local: '' })).searchParams.get('name'), 'Panda Climbing', 'falls back to the English name');
  assert.equal(new URL(V.amapUrl({ ...gym, name_local: 'A&B #1' })).searchParams.get('name'), 'A&B #1', 'special characters survive encoding');
  assert.equal(V.amapUrl({ ...gym, country: 'JP' }), '');
  assert.equal(V.amapUrl({ ...gym, lat: undefined }), '');
  const html = V.addressActionsHtml(gym);
  assert.match(html, /<a class="btn btn-secondary btn-sm" href="https:\/\/uri\.amap\.com\/marker\?[^"]*" target="_blank" rel="noopener noreferrer">/);
});

test('gym page: visitor info and the address actions sit in the page, and Directions is unchanged', async () => {
  const [, I, P] = await load(); await I.setLocale('en');
  const html = P.gymPageHtml({ ...gym, visitor: full }, {});
  assert.ok(html.includes('id="visitorTitle"') && html.includes('Copy address') && html.includes('Open in Amap'));
  assert.ok(html.includes('https://www.google.com/maps/dir/?api=1&amp;destination='), 'directions link kept');
});
