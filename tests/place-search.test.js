// Multilingual place search (place-names.js, search-index.js) and verified gym aliases.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
globalThis.window = globalThis.window || {};
globalThis.window.matchMedia = globalThis.window.matchMedia || (() => ({ matches: false }));

const load = () => Promise.all([import('../js/modules/search-index.js'), import('../js/modules/place-names.js'), import('../js/modules/regions.js')]);
const g = (id, name, country, state, suburb, extra = {}) => ({ id, name, country, state, suburb, lat: 30 + id.length / 10, lng: 104 + id.length / 10, types: [], ...extra });
const spots = [
  g('a1', 'Panda Climbing', 'CN', 'CHENGDU', 'Wuhou', { name_local: '熊猫攀岩' }),
  g('a2', 'Yanxuan Climbing', 'CN', 'CHENGDU', 'Jinjiang'),
  g('b1', 'Banana Climbing (Shangdi)', 'CN', 'BEIJING', 'Haidian', { name_local: '香蕉攀岩(上地店)' }),
  g('c1', 'Seoul Boulders', 'KR', 'SEOUL', 'Mapo', { lat: 37.55, lng: 126.92 }),
  g('d1', 'Tokyo Wall', 'JP', 'TOKYO', 'Shibuya'),
  g('e1', 'Berlin Block', 'DE', 'BERLIN', 'Mitte'),
  g('f1', 'Aliased Gym', 'AU', 'NSW', 'Newtown', { aliases: ['Rock Palace', '岩石宫殿'] }),
];
const opts = { countryLabels: { CN: 'China', KR: 'South Korea', JP: 'Japan', DE: 'Germany', AU: 'Australia' } };
const labels = (r, kind) => r[kind].map(e => e.label);

test('place names: every code is a known country, every CN region has a Chinese name, and nothing is empty', async () => {
  const [, N, R] = await load();
  const countries = new Set(['AU', 'US', 'JP', 'CA', 'NZ', 'CN', 'GB', 'DE', 'FR', 'SE', 'NL', 'IT', 'BE', 'KR', 'ES', 'PT', 'AT', 'CH', 'PL', 'DK', 'FI', 'IE', 'NO', 'MX', 'BR', 'HU', 'GR', 'CZ', 'IS', 'RO', 'HR', 'RU', 'BG', 'AR', 'PH', 'CO', 'CL', 'VE', 'IN', 'IL', 'ID', 'TW', 'ZA', 'EC', 'VN', 'LT', 'RS', 'BO', 'IR', 'EE', 'MY', 'TH', 'UA', 'SK', 'CY', 'PA', 'PE', 'TR', 'LV', 'SG', 'BA', 'AD', 'AE', 'GE', 'LU', 'SI', 'KZ', 'CR', 'BY', 'UY', 'SA', 'HK', 'EG', 'KE', 'QA', 'AM', 'LB', 'JO', 'NP', 'GT', 'ME', 'MN', 'OM', 'PY', 'MO']);
  for(const [c, names] of Object.entries(N.COUNTRY_NAMES)){ assert.ok(countries.has(c), c); assert.ok(names.length && names.every(n => n.trim() === n && n)); }
  assert.ok(Object.keys(N.COUNTRY_NAMES).length >= 80);
  const cn = R.STATES_BY_COUNTRY.CN.map(([code]) => code).sort();
  assert.deepEqual(Object.keys(N.CN_CITY_NAMES).sort(), cn, 'every CN region has exactly one Chinese name');
  assert.equal(N.CN_CITY_NAMES.CHENGDU, '成都'); assert.equal(N.CN_CITY_NAMES.XIAN, '西安'); assert.equal(N.CN_CITY_NAMES.BEIJING, '北京');
  assert.ok(Object.values(N.CN_CITY_NAMES).every(v => /^\p{Script=Han}+$/u.test(v)));
});

test('search: 成都 and Chengdu both surface the Chengdu city/region; partial CJK matches', async () => {
  const [S] = await load();
  const idx = S.buildSearchIndex(spots, opts);
  for(const q of ['成都', 'Chengdu', 'chengdu', '成']){
    const r = S.querySearchIndex(idx, q);
    assert.ok(r.city.some(e => e.label === 'Chengdu') || r.region.some(e => e.state === 'CHENGDU'), q);
  }
  assert.ok(S.querySearchIndex(idx, '成都').region.some(e => e.state === 'CHENGDU'), 'the region entry (not only a metro alias)');
  assert.ok(S.querySearchIndex(idx, '北京').region.some(e => e.state === 'BEIJING'));
  assert.ok(!S.querySearchIndex(idx, '上海').region.length, 'a city without gyms is not invented');
});

test('search: countries by native and Chinese names; 서울 finds Seoul; 香蕉攀岩 and Banana Climbing find the gym', async () => {
  const [S] = await load();
  const idx = S.buildSearchIndex(spots, opts);
  const country = q => labels(S.querySearchIndex(idx, q), 'country');
  assert.deepEqual(country('中国'), ['China']); assert.deepEqual(country('中國'), ['China']); assert.deepEqual(country('china'), ['China']);
  assert.deepEqual(country('日本'), ['Japan']); assert.deepEqual(country('japan'), ['Japan']);
  assert.deepEqual(country('韩国'), ['South Korea']); assert.deepEqual(country('한국'), ['South Korea']); assert.deepEqual(country('대한민국'), ['South Korea']);
  assert.deepEqual(country('Deutschland'), ['Germany']); assert.deepEqual(country('德国'), ['Germany']); assert.deepEqual(country('Österreich'), []);
  assert.ok(S.querySearchIndex(idx, '서울').city.some(e => e.label === 'Seoul'));
  for(const q of ['香蕉攀岩', 'Banana Climbing', '攀岩', '上地']) assert.ok(S.querySearchIndex(idx, q).gym.some(e => e.id === 'b1'), q);
});

test('search: a gym is found by its verified aliases when the row carries them (CJK-aware), and not otherwise', async () => {
  const [S] = await load();
  const idx = S.buildSearchIndex(spots, opts);
  for(const q of ['Rock Palace', 'palace', '岩石宫殿', '宫殿']) assert.ok(S.querySearchIndex(idx, q).gym.some(e => e.id === 'f1'), q);
  assert.equal(S.querySearchIndex(idx, 'Rock Palace').gym[0].label, 'Aliased Gym', 'the shown name stays the real name');
  assert.ok(!idx.gyms.some(e => 'aliases' in e), 'aliases are search words only, not stored on the entry');
  const none = S.buildSearchIndex(spots.map(({ aliases, ...rest }) => rest), opts);
  assert.ok(!S.querySearchIndex(none, 'Rock Palace').gym.length);
  assert.doesNotThrow(() => S.buildSearchIndex([{ ...spots[0], aliases: 'not-an-array' }, { ...spots[1], aliases: [null, 5, 'ok'] }], opts));
});

test('aliases are not read from production yet: LIST_COLUMNS has no aliases; the migration is prepared', () => {
  assert.ok(!/aliases/.test(fs.readFileSync(__dirname + '/../js/modules/data-load.js', 'utf8').match(/LIST_COLUMNS = '[^']*'/)[0]));
  const sql = fs.readFileSync(__dirname + '/../supabase/migrations/20261114000100_gym_aliases.sql', 'utf8');
  assert.match(sql, /add column if not exists aliases text\[\] not null default '\{\}'/);
  assert.match(sql, /<= 10/); assert.match(sql, /between 1 and 120/); assert.match(sql, /x <> btrim\(x\)/);
});
