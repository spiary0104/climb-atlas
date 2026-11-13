// Interface language (js/modules/i18n.js): dictionaries complete and consistent, every key the app uses exists in
// English, locale detection and the stored manual choice, English fallback, plurals, interpolation and escaping.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const store = new Map();
globalThis.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };

let I, EN, ZH;
test.before(async () => {
  I = await import('../js/modules/i18n.js');
  EN = (await import('../js/modules/i18n-en.js')).default;
  ZH = (await import('../js/modules/i18n-zh-CN.js')).default;
});
test.afterEach(async () => { store.clear(); await I.setLocale('en'); });

const placeholders = m => [...new Set((typeof m === 'object' ? Object.values(m).join(' ') : m).match(/\{\w+\}/g) || [])].sort();

test('i18n: every enabled language has exactly the English keys, the same placeholders and an "other" plural form', () => {
  const enabled = I.enabledLocales().map(l => l.code);
  assert.deepEqual(enabled, ['en', 'zh-CN'], 'only reviewed languages are enabled');
  for(const [code, d] of [['zh-CN', ZH]]){
    assert.deepEqual(Object.keys(d).sort(), Object.keys(EN).sort(), code + ' keys differ from English');
    for(const k of Object.keys(EN)){
      assert.deepEqual(placeholders(d[k]), placeholders(EN[k]), `${code} ${k}: placeholders differ`);
      if(typeof EN[k] === 'object') assert.ok(typeof d[k] === 'object' && 'other' in d[k], `${code} ${k}: plural needs "other"`);
      if(typeof d[k] === 'string') assert.ok(d[k].trim().length, `${code} ${k}: empty`);
    }
  }
  for(const [k, v] of Object.entries(EN)) if(typeof v === 'object') assert.ok('one' in v && 'other' in v, `en ${k}: plural needs one/other`);
});

test('i18n: every key the app uses (t, th, data-i18n, data-i18n-attr) exists in English', () => {
  const files = ['index.html', 'js/main.js', ...fs.readdirSync(path.join(ROOT, 'js/modules')).filter(f => f.endsWith('.js')).map(f => 'js/modules/' + f)];
  const used = new Set();
  for(const f of files){
    const s = read(f);
    for(const m of s.matchAll(/\bt[h]?\('([a-zA-Z0-9_.]+)'/g)) used.add(m[1]);
    for(const m of s.matchAll(/data-i18n="([a-zA-Z0-9_.]+)"/g)) used.add(m[1]);
    for(const m of s.matchAll(/data-i18n-attr="([^"]+)"/g)) for(const pair of m[1].split(';')) used.add(pair.split(':')[1].trim());
  }
  assert.ok(used.size > 10, 'found the keys in use');
  const missing = [...used].filter(k => k.includes('.') && !(k in EN));   // keys are always area.thing
  assert.deepEqual(missing, [], 'keys used but not defined in i18n-en.js');
});

test('i18n: browser languages map to an enabled locale; Traditional Chinese is not mapped to Simplified', () => {
  assert.equal(I.matchLocale(['zh-CN']), 'zh-CN');
  assert.equal(I.matchLocale(['zh']), 'zh-CN');
  assert.equal(I.matchLocale(['zh-Hans-SG']), 'zh-CN');
  assert.equal(I.matchLocale(['zh-TW']), 'en');
  assert.equal(I.matchLocale(['zh-Hant-HK']), 'en');
  assert.equal(I.matchLocale(['ja-JP', 'zh-CN']), 'zh-CN', 'the first enabled match in preference order');
  assert.equal(I.matchLocale(['en-GB']), 'en');
  assert.equal(I.matchLocale(['fr-FR', 'de']), 'en', 'disabled languages fall back to English');
  assert.equal(I.matchLocale([]), 'en');
});

test('i18n: a stored manual choice wins over the browser language; only manual switches are stored', async () => {
  const orig = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { value: { languages: ['zh-CN'], language: 'zh-CN' }, configurable: true });
  assert.equal(I.initialLocale(), 'zh-CN', 'first visit follows the browser');
  await I.setLocale('en');
  assert.equal(store.get(I.STORAGE_KEY), undefined, 'an automatic switch is not stored');
  await I.setLocale('en', { manual: true });
  assert.equal(store.get(I.STORAGE_KEY), 'en');
  assert.equal(I.initialLocale(), 'en', 'the manual choice survives a Chinese browser');
  store.set(I.STORAGE_KEY, 'xx'); assert.equal(I.initialLocale(), 'zh-CN', 'an unknown stored value is ignored');
  if(orig) Object.defineProperty(globalThis, 'navigator', orig); else delete globalThis.navigator;
});

test('i18n: lookup, English fallback, missing keys, plurals, interpolation and escaping', async () => {
  assert.equal(I.t('nav.explore'), 'Explore');
  assert.equal(I.t('common.gymCount', { count: 1 }), '1 gym');
  assert.equal(I.t('common.gymCount', { count: 1234 }), '1,234 gyms');
  assert.equal(await I.setLocale('zh-CN'), 'zh-CN');
  assert.equal(I.currentHtmlLang(), 'zh-Hans-CN');
  assert.equal(I.t('nav.explore'), '探索');
  assert.equal(I.t('common.gymCount', { count: 1 }), '1 家岩馆');
  assert.equal(I.t('no.such.key'), 'no.such.key', 'a missing key shows the key, never crashes');
  assert.equal(I.formatNumber(1234.5), '1,234.5');
  await I.setLocale('fr');   // disabled -> English
  assert.equal(I.currentLocale(), 'en');
  assert.equal(I.th('nav.explore'), 'Explore');
  assert.equal(I.t('common.gymCount', { count: '<b>' }), '{count} gyms'.replace('{count}', '<b>'));
  assert.equal(I.th('common.gymCount', { count: '<b>' }), '&lt;b&gt; gyms', 'th() escapes parameters too');
});

test('i18n: language picker lists enabled languages by their own names, current one selected', async () => {
  await I.setLocale('zh-CN');
  const html = I.languageOptionsHtml();
  assert.match(html, /<option value="en" lang="en">English<\/option>/);
  assert.match(html, /<option value="zh-CN" lang="zh-Hans-CN" selected>简体中文<\/option>/);
  assert.ok(!/日本語|Deutsch/.test(html), 'disabled languages are not offered');
});

test('i18n: shell wiring: pickers in the top bar and on /me, the locale cached offline, CJK faces from the system only', () => {
  const html = read('index.html');
  assert.match(html, /<select data-lang-picker aria-label="Language" data-i18n-attr="aria-label:lang.pickerAria">/);
  assert.match(read('js/modules/page-html.js'), /data-lang-picker aria-describedby="langHelp"/);
  const sw = read('sw.js');
  for(const f of ['js/modules/i18n.js', 'js/modules/i18n-en.js', 'js/modules/i18n-zh-CN.js']) assert.ok(sw.includes(`'${f}'`), f + ' not in SHELL_FILES');
  assert.match(read('css/base.css'), /:lang\(zh-Hans\)\{--font-text:"Inter", var\(--font-cjk-hans\)/);
  assert.ok(!/fonts\.googleapis\.com\/[^"]*(Noto|CJK|SC)/i.test(html), 'no downloaded CJK font');
  assert.match(read('js/main.js'), /await initI18n\(\);/);
});
