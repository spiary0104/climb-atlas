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
  assert.equal((bare.match(/Not confirmed yet/g) || []).length, 9, 'day pass, hours and facilities and the six visitor facts say so when unknown');
  await I.setLocale('zh-CN');
  const zh = P.gymPageHtml(g, { history: { count: 2, last: '2026-09-01' }, metroLink: { name: '上海', total: 22, href: '/x' } });
  for(const s of ['导航', '收藏', '去过', '基本信息', '设施', '租鞋', '咖啡厅', '上海的全部 22 家攀岩馆', '2 次攀岩', '2026年9月1日']) assert.ok(zh.includes(s), s);
  assert.ok(zh.includes('RMB 88 / 单次') && zh.includes('10:00–22:00'), 'gym-supplied day pass and hours are shown exactly as stored');
  assert.ok(zh.includes('Test &lt;Gym&gt;'), 'gym names are not translated, and stay escaped');
  const zhBare = P.gymPageHtml({ ...g, day_pass: '', hours: null, facilities: [] }, {});
  assert.equal((zhBare.match(/尚未确认/g) || []).length, 9);
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

// ===== PR 2C: forms, dialogs, check-in, passport, log, add, moderation, account ==========================================
test('i18n 2C: ordinals, passport sentences, stamp dates and error messages follow the language', async () => {
  const P = await import('../js/modules/passport.js');
  const ST = await import('../js/modules/stamp-html.js');
  const SE = await import('../js/modules/submit-errors.js');
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 101].map(P.ordinal), ['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '101st']);
  assert.equal(ST.niceDate('2026-09-12T10:00:00'), '12 Sep 2026');
  assert.equal(ST.stampDate('2026-09-12T10:00:00'), '12 SEP 2026');
  assert.equal(P.statsLine({ gyms: 1, cities: 4, countries: 2 }), '1 gym · 4 cities · 2 countries');
  assert.equal(SE.submitErrorMessage({ message: 'Daily edit limit reached' }, 'x'), 'You’ve reached today’s limit of 20 edits. Try again tomorrow.');
  await I.setLocale('zh-CN');
  assert.equal(P.ordinal(3), '第3');
  assert.equal(P.statsLine({ gyms: 11, cities: 4, countries: 2 }), '11 家岩馆 · 4 个城市 · 2 个国家和地区');
  assert.equal(ST.niceDate('2026-09-12T10:00:00'), '2026年9月12日');
  assert.match(SE.submitErrorMessage({ message: 'new row violates check constraint "spots_name_len_check"' }, 'x'), /名称太长（最多 200 个字符）/);
  assert.equal(SE.submitErrorMessage({ message: 'boom' }, I.t('common.saveFailed')), '保存失败，请重试', 'unknown database text never reaches the screen');
  const g = (id, country, suburb) => ({ id, name: 'Gym ' + id, suburb, state: 'X', country });
  const spotById = new Map([g('a', 'AU', 'Sydney'), g('b', 'AU', 'Sydney'), g('c', 'JP', 'Tokyo')].map(s => [s.id, s]));
  const all = [{ id: 1, spot_id: 'a', checked_at: '2026-01-01T00:00:00Z' }, { id: 2, spot_id: 'b', checked_at: '2026-01-02T00:00:00Z' }];
  assert.equal(P.passportLine(all, all[0], spotById), '这是你的第一枚印章。');
  assert.equal(P.passportLine(all, all[1], spotById), '这是你的第2家攀岩馆。');
  await I.setLocale('en');
  assert.equal(P.passportLine(all, all[1], spotById), 'Your 2nd gym.');
});

test('i18n 2C: calendar month and weekday names, add-page and moderation wording come from the dictionaries', async () => {
  const page = await import('../js/modules/page-html.js');
  const add = await import('../js/modules/add-html.js');
  const mod = await import('../js/modules/moderation-html.js');
  const cal = () => page.calendarHtml(2026, 8, new Map([['2026-09-26', 2]]), '2026-09-26');
  assert.match(cal(), />September 2026</);
  assert.match(cal(), /aria-label="September 26, 2 sessions"/);
  await I.setLocale('zh-CN');
  assert.match(cal(), />2026年9月</);
  assert.match(cal(), /aria-label="9月26日、2 次攀岩"/);
  assert.match(cal(), /<th scope="col" abbr="星期一">一<\/th>/);
  assert.equal(add.stepOneMissing({ name: '', types: [] }, 3).join('|'), '标记（请放大到街道级别）|名称|至少一种攀岩类型');
  assert.match(add.addStepHtml({ step: 1, name: '', types: [] }, { signedIn: false }), /提交审核/);
  assert.match(mod.modQueueHtml([], []), /没有待审核的内容/);
  assert.match(mod.modPageHtml({ queue: '', panel: '', count: 3 }), /3 项待处理/);
  await I.setLocale('en');
});

// How the "no hardcoded English" guard works. A scan for "any English word" would be brittle (class names, dev-only
// console text, gym data), so it is two narrow checks that fail the moment a former hardcoded string comes back:
//   1. a curated list of the strings these builders used to contain (every one is now a dictionary entry) must not appear
//      inside any quoted/template string of the builder files;
//   2. in index.html, every text-bearing element of the dialogs (edit, report, sign-in, check-in, START, log) must carry
//      data-i18n, so a new English label added there without a key is caught.
// Add a string to FORMER when a new key replaces literal text in a builder; no entry is needed for new code that already
// uses t()/th(). (Gym data, user text, the legal pages and console messages are out of scope.)
const FORMER = ['Sign in to', 'Still needed', 'Could not save', 'Could not send', 'Could not delete', 'Could not check in', 'Check in at ', 'Check in nearby',
  'Log a session', 'Session saved', 'Session deleted', 'No sessions yet', 'No specific gym', 'Choose a gym', 'Add a climb', 'Stamp it', 'Stamping', 'Your first stamp',
  'Your first gym', 'Recent check-ins', 'Find a gym', 'Show all', 'Submit for review', 'Submitting…', 'Step 1 of 2', 'Step 2 of 2', 'Use my location',
  'Moderators only', 'Nothing to review', 'Double-check', 'Reject</', 'Approve</', 'Edit approved', 'Gym approved', 'Report dismissed', 'Display name',
  'Your contributions', 'In review', 'Not accepted', 'Signed out', 'First stamp', 'Share card', 'Continue with Google', 'Send magic link', 'Check your email',
  'Enter your email', 'finished a climb', 'Report sent', 'Edit submitted', 'Save changes', 'Send report', 'Unknown gym', 'Previous month', 'Next month',
  'Notes (optional)', 'Photo link', 'items waiting', 'item waiting', 'fields unchanged', 'Supabase is not configured'];
const BUILDERS = ['logbook', 'log-page', 'gym-picker', 'checkin', 'passport', 'passport-page', 'stamp-html', 'milestone-sheet', 'share-card', 'auth-ui', 'modals',
  'submit-errors', 'add-page', 'add-html', 'moderation-html', 'mod-page', 'moderation', 'me-page', 'page-html', 'marks'].map(f => 'js/modules/' + f + '.js').concat(['js/main.js']);
const noComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');

test('i18n 2C guard: the former hardcoded English of the builders is gone (it lives in the dictionaries)', () => {
  const hits = [];
  for(const f of BUILDERS){
    for(const line of noComments(read(f)).split('\n')){
      if(/^\s*import\b|console\.|new Error/.test(line)) continue;
      for(const m of line.matchAll(/(['"`])((?:\\.|(?!\1).)*?)\1/g)) for(const w of FORMER) if(m[2].includes(w)) hits.push(f + ': ' + w);
    }
  }
  assert.deepEqual(hits, [], 'hardcoded English is back: use t()/th() and add the key to both dictionaries');
  for(const w of ['Sign in to save', 'Check in at', 'Log a session', 'Moderators only', 'Submit for review']) assert.ok(Object.values(EN).some(v => String(v).includes(w)), w + ' is a dictionary entry');
});

test('i18n 2C guard: every text element in the dialogs of index.html is translatable (data-i18n)', () => {
  const html = read('index.html').replace(/\r\n/g, '\n');
  const dialogs = html.slice(html.indexOf('id="editModalBackdrop"'), html.indexOf('id="filterSheetBackdrop"'));
  const SKIP = /id="(editPinStatus|reportSpotName)"/;           // filled from JS (coordinates, the gym's own name)
  const bad = [];
  for(const m of dialogs.matchAll(/<(label|button|h2|p|span|legend|div)\b([^>]*)>([^<]*[A-Za-z]{3}[^<]*)</g)){
    if(/data-i18n/.test(m[2]) || SKIP.test(m[2])) continue;
    bad.push(m[1] + ' ' + m[3].trim().slice(0, 40));
  }
  assert.deepEqual(bad, [], 'untranslatable text in the dialogs');
});

test('i18n 2C: the language switch re-renders in place: log/passport/mod/add pages are rebuilt on bouldeer:locale (main.js refreshPage)', () => {
  assert.match(read('js/main.js'), /window\.addEventListener\('bouldeer:locale'[\s\S]*?refreshPage\(\);/);
  assert.match(read('js/modules/modals.js'), /addEventListener\('bouldeer:locale', localizeCountrySelect\)/, 'the edit form country list follows the language');
});
