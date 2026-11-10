// Local-script names (name_local) beside the English name, and searching by them.
const test = require('node:test');
const assert = require('node:assert');

// constants.js reads window.matchMedia at import time; the builders themselves are DOM-free.
globalThis.window = globalThis.window || {};
globalThis.window.matchMedia = globalThis.window.matchMedia || (() => ({ matches: false }));

const load = () => Promise.all([import('../js/modules/list-html.js'), import('../js/modules/page-html.js'), import('../js/modules/search-index.js')]);
const banana = { id: 'seed-637', name: 'Banana Climbing (Shangdi)', name_local: '香蕉攀岩(上地店)', country: 'CN', state: 'BEIJING',
  suburb: 'Haidian', lat: 40.03, lng: 116.31, types: ['indoor-bouldering'], address: '58 Dongbeiwang West Rd', address_local: '北京市海淀区东北旺西路58号' };

test('the local name shows with the English name in rows, cards, carousel, peek and the gym page, tagged with its language', async () => {
  const [L, P] = await load();
  for (const html of [L.rowHtml(banana), L.cardHtml(banana), L.carouselCardHtml(banana), L.peekHtml(banana), P.pageCardHtml(banana, { href: '/gym/x' }), P.pageRowHtml(banana, { href: '/gym/x' })]) {
    assert.match(html, /Banana Climbing \(Shangdi\)/);
    assert.match(html, /<span class="local-name [^"]*" lang="zh-Hans">香蕉攀岩\(上地店\)<\/span>/);
  }
  assert.match(L.rowHtml(banana), /aria-label="Banana Climbing \(Shangdi\), 香蕉攀岩\(上地店\), /, 'screen readers hear both names');
  const page = P.gymPageHtml(banana, {});
  assert.match(page, /<h1 class="page-title">Banana Climbing \(Shangdi\)<span class="local-name local-name--block local-name--title" lang="zh-Hans">香蕉攀岩\(上地店\)<\/span><\/h1>/);
  assert.match(page, /<p class="panel-row local-address" lang="zh-Hans">北京市海淀区东北旺西路58号<\/p>/);
});

test('no local name, the same text as the name, or only spaces renders nothing extra; the value is escaped', async () => {
  const [L, P] = await load();
  for (const g of [{ ...banana, name_local: null }, { ...banana, name_local: '  ' }, { ...banana, name_local: banana.name }]) {
    assert.doesNotMatch(L.rowHtml(g) + L.peekHtml(g) + P.gymPageHtml(g, {}), /local-name/);
  }
  assert.match(L.rowHtml({ ...banana, name_local: '<b>x</b>' }), /&lt;b&gt;x&lt;\/b&gt;/);
  assert.match(L.rowHtml({ ...banana, country: 'KR', name_local: '서울숲클라이밍' }), /lang="ko"/);
  assert.doesNotMatch(L.rowHtml({ ...banana, country: 'FR', name_local: 'Escalade' }), /lang=/, 'no guessed language outside the table');
});

test('search finds a gym by any part of its Chinese name, and shows the name in the result line', async () => {
  const [, , S] = await load();
  assert.deepEqual(S.cjkStarts('香蕉攀岩(上地店)'), ['香蕉攀岩', '蕉攀岩', '攀岩', '岩', '上地店', '地店', '店']);
  const idx = S.buildSearchIndex([banana, { id: 'b', name: 'Blochaus', country: 'AU', state: 'NSW', suburb: 'Marrickville', lat: -33.9, lng: 151.1 }]);
  for (const q of ['攀岩', '香蕉', '上地店', 'banana', 'haidian']) assert.deepEqual(S.querySearchIndex(idx, q).gym.map(e => e.id), ['seed-637'], q);
  assert.deepEqual(S.querySearchIndex(idx, 'bloc').gym.map(e => e.id), ['b']);
  assert.match(S.querySearchIndex(idx, '攀岩').gym[0].secondary, /^香蕉攀岩\(上地店\) · Haidian/);
});
