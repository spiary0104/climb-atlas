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

test('i18n Explore: label tables follow the language (countries, types, continents, moods), hours and distance wording', async () => {
  globalThis.window = globalThis.window || {}; globalThis.window.matchMedia = () => ({ matches: false });
  const C = await import('../js/modules/constants.js');
  const H = await import('../js/modules/hours.js');
  const G = await import('../js/modules/geo.js');
  for(const code of Object.keys(C.COUNTRY_LABELS)) assert.ok(('country.' + code) in EN && ('country.' + code) in ZH, 'country.' + code);
  for(const k of Object.keys(C.TYPE_LABELS)) assert.ok(C.TYPE_LABELS[k] && !C.TYPE_LABELS[k].startsWith('type.'), k);
  assert.equal(C.COUNTRY_LABELS.CN, 'China'); assert.equal(C.REGION_LABELS.asia, 'Asia'); assert.equal(C.MOODS.great.label, 'Great');
  assert.equal(H.statusLine({ state: 'closed', next: { day: 'sat', open: 600, inDays: 3 } }).text, 'Closed · opens Sat 10am');
  assert.equal(G.formatDistance(4.26), '4.3 km');
  await I.setLocale('zh-CN');
  assert.equal(C.COUNTRY_LABELS.CN, '中国'); assert.equal(C.COUNTRY_LABELS.KR, '韩国'); assert.equal(C.TYPE_LABELS['top-rope'], '顶绳');
  assert.equal(C.REGION_LABELS['north-america'], '北美洲'); assert.equal(C.countryEnglish('JP'), 'Japan');
  assert.equal(H.statusLine({ state: 'open', until: 22 * 60 }).text, '营业中 · 22:00打烊');
  assert.equal(H.statusLine({ state: 'open', h24: true }).text, '24 小时营业');
  assert.equal(H.statusLine({ state: 'closed', next: { day: 'sat', open: 390, inDays: 3 } }).text, '已打烊 · 周六 6:30开门');
  assert.equal(H.statusLine({ state: 'closed', next: { day: 'sat', open: 360, inDays: 1 } }).text, '已打烊 · 明天 6:00开门');
  assert.equal(G.formatDistance(0.35), '350 米'); assert.equal(G.formatDistance(12.7), '13 公里');
  assert.equal(I.t('explore.inView', { count: 84 }), '家岩馆在地图范围内');
  assert.equal(I.t('filters.showCount', { count: 1204 }), '显示 1,204 家岩馆');
});

test('i18n pages (PR 2B): gym page, region pages, provenance and share follow the language; gym data stays as stored', async () => {
  globalThis.window = globalThis.window || {}; globalThis.window.matchMedia = () => ({ matches: false });
  const P = await import('../js/modules/page-html.js');
  const GI = await import('../js/modules/gym-info.js');
  const PR = await import('../js/modules/provenance.js');
  const SH = await import('../js/modules/share.js');
  const g = { id: 'g1', name: 'Test <Gym>', suburb: 'Xuhui', types: ['indoor-bouldering'], lat: 31.2, lng: 121.4, day_pass: 'RMB 88 / 单次', hours: { mon: '10:00–22:00' }, facilities: ['shoe-hire', 'cafe'] };
  const en = P.gymPageHtml(g, { history: { count: 2, last: '2026-09-01' }, metroLink: { name: 'Shanghai', total: 22, href: '/in/cn/shanghai/shanghai' } });
  assert.match(en, />Directions</); assert.match(en, /All 22 gyms in Shanghai/); assert.match(en, /2 sessions · last on Sep 1, 2026/);
  const bare = P.gymPageHtml({ ...g, day_pass: '', hours: null, facilities: [] }, {});
  assert.equal((bare.match(/Not confirmed yet/g) || []).length, 3, 'day pass, hours and facilities say so when unknown');
  await I.setLocale('zh-CN');
  const zh = P.gymPageHtml(g, { history: { count: 2, last: '2026-09-01' }, metroLink: { name: '上海', total: 22, href: '/x' } });
  for(const s of ['导航', '收藏', '去过', '基本信息', '设施', '租鞋', '咖啡厅', '上海的全部 22 家攀岩馆', '2 次攀岩', '2026年9月1日']) assert.ok(zh.includes(s), s);
  assert.ok(zh.includes('RMB 88 / 单次') && zh.includes('10:00–22:00'), 'gym-supplied day pass and hours are shown exactly as stored');
  assert.ok(zh.includes('Test &lt;Gym&gt;'), 'gym names are not translated, and stay escaped');
  const zhBare = P.gymPageHtml({ ...g, day_pass: '', hours: null, facilities: [] }, {});
  assert.equal((zhBare.match(/尚未确认/g) || []).length, 3);
  assert.ok(!/Not confirmed|Day pass|Facilities|Directions/.test(zhBare), 'no English left on the gym page chrome');
  assert.equal(GI.facilityLabel('shoe-hire'), '租鞋'); assert.equal(GI.dayLabel('sat'), '周六');
  assert.equal(P.regionMeta({ gyms: 28, cities: 1, areas: 6 }), '28 家岩馆 · 1 个城市 · 6 个其他区域');
  assert.equal(PR.provenanceLine({ submitted_by: 'u' }, { added_by: 'mika', contributors: 3, last_edited: '2026-09-23T12:00:00Z' }, new Date('2026-10-03T12:00:00Z')).text, '社区已核实 · 由mika添加 · 最近修改：10 天前 · 3 位贡献者');
  assert.match(SH.gymShareText({ name: 'A', suburb: 'B', types: ['indoor-bouldering'] }, { region: 'C' }).text, /A · 抱石 · B, C/);
  assert.equal(P.regionSearchResultsHtml('zzz', []).includes('没有与“zzz”匹配'), true);
  await I.setLocale('en');
  assert.equal(P.regionMeta({ gyms: 1, cities: 0, areas: 3 }), '1 gym · 3 areas');
  assert.equal(PR.formatRelative('2026-10-02T00:00:00Z', new Date('2026-10-03T12:00:00Z')), 'yesterday');
});

test('i18n SEO: seo-meta.js has no imports and stays English without a translator (api/seo.mjs runs with no locale)', async () => {
  const S = await import('../js/modules/seo-meta.js');
  assert.ok(!/^\s*import\b/m.test(read('js/modules/seo-meta.js')), 'api/seo.mjs loads it from a data: URL: no imports');
  await I.setLocale('zh-CN');
  const g = { name: 'Block', suburb: 'Xuhui', types: ['indoor-bouldering'] };
  assert.equal(S.gymSeo(g, { region: 'Shanghai', country: 'China' }).title, 'Block · Bouldering gym in Xuhui, Shanghai, China', 'no translator: English even when the app is in Chinese');
  assert.equal(S.placeSeo({ kind: 'country', name: 'China', count: 3 }).title, 'Climbing gyms in China');
  assert.equal(S.gymSeo(g, { region: '上海', country: '中国', tr: I.t }).title, 'Block · Xuhui, 上海, 中国的抱石馆');
  assert.equal(S.placeSeo({ kind: 'country', name: '中国', count: 3, tr: I.t }).title, '中国的攀岩馆');
  await I.setLocale('en');
  assert.equal(S.gymSeo(g, { region: 'Shanghai', country: 'China', tr: I.t }).title, 'Block · Bouldering gym in Xuhui, Shanghai, China');
});
