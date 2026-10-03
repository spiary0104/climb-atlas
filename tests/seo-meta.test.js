// Titles and descriptions for gym and place pages (js/modules/seo-meta.js): patterns, hostile input, length caps.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

const mod = import('../js/modules/seo-meta.js');
const safe = import('../js/modules/html-safe.js');

const blochaus = { name: 'BlocHaus Marrickville', suburb: 'Marrickville', types: ['indoor-bouldering'], address: '2/5 Fisher St, Marrickville NSW 2204' };

test('gym: title and description follow the pattern (bouldering-only vs mixed)', async () => {
  const { gymSeo, fullTitle } = await mod;
  const a = gymSeo(blochaus, { region: 'NSW', country: 'Australia' });
  assert.equal(a.title, 'BlocHaus Marrickville · Bouldering gym in Marrickville, NSW, Australia');
  assert.equal(fullTitle(a.title), 'BlocHaus Marrickville · Bouldering gym in Marrickville, NSW, Australia · Bouldeer');
  assert.match(a.description, /^BlocHaus Marrickville is a bouldering gym in Marrickville, NSW, Australia\. Address: 2\/5 Fisher St/);
  assert.ok(a.description.endsWith('community-sourced climbing map.'));
  const b = gymSeo({ name: 'Rock Up', suburb: 'Leeds', types: ['indoor-bouldering', 'top-rope', 'lead-climbing'] }, { region: 'England', country: 'United Kingdom' });
  assert.equal(b.title, 'Rock Up · Climbing gym in Leeds, England, United Kingdom');
  assert.match(b.description, /Climbing here: bouldering, top rope and lead climbing\./);
  assert.ok(!/Address:/.test(b.description), 'no address, no address sentence');
});

test('gym: missing fields degrade without "undefined", "null" or dangling separators', async () => {
  const { gymSeo } = await mod;
  for (const g of [{}, { name: 'Solo' }, { name: 'X', suburb: null, types: null, address: null }]) {
    const r = gymSeo(g, {});
    assert.doesNotMatch(r.title + r.description, /undefined|null|, ,|,\.|\s{2,}/);
    assert.ok(r.title.length > 3 && r.description.length > 20);
  }
  assert.equal(gymSeo({ name: 'Solo' }, {}).title, 'Solo · Climbing gym');
  assert.equal(gymSeo({ name: 'A', types: ['made-up'] }, {}).title, 'A · Climbing gym');
});

test('gym: hostile and overlong user-submitted values are normalised and capped; escapeHtml makes them inert', async () => {
  const { gymSeo, clean } = await mod;
  const { escapeHtml } = await safe;
  const evil = '"><script>alert(1)</script>\n\t<img src=x onerror=alert(2)>';
  const r = gymSeo({ name: evil, suburb: evil, address: evil, types: ['indoor-bouldering'] }, { region: evil, country: evil });
  assert.doesNotMatch(r.title + r.description, /[\r\n\t]/, 'control characters are collapsed');
  const html = `<title>${escapeHtml(r.title)}</title><meta name="description" content="${escapeHtml(r.description)}">`;
  assert.doesNotMatch(html.replace(/^<title>|<\/title><meta name="description" content="|">$/g, ''), /[<>"]/, 'nothing breaks out of the tags or the attribute');
  const long = gymSeo({ name: 'N'.repeat(500), suburb: 'S'.repeat(500), address: 'A'.repeat(500), types: ['top-rope'] }, { region: 'R'.repeat(500), country: 'C'.repeat(500) });
  assert.ok(long.title.length < 400 && long.description.length <= 200, `lengths ${long.title.length}/${long.description.length}`);
  assert.equal(clean('  a \u0000 b\u2028c  '), 'a b c');
  assert.equal(clean(null), '');
  assert.ok(clean('word '.repeat(100), 30).endsWith('…'));
});

test('gym: a title that would be too long drops the region', async () => {
  const { gymSeo } = await mod;
  const r = gymSeo({ name: 'The Very Long Named Climbing Collective of Tyneside', suburb: 'Newcastle upon Tyne', types: ['top-rope'] }, { region: 'Tyne and Wear', country: 'United Kingdom' });
  assert.equal(r.title, 'The Very Long Named Climbing Collective of Tyneside · Newcastle upon Tyne, United Kingdom');
});

test('place: country, region and city titles and descriptions, with counts', async () => {
  const { placeSeo } = await mod;
  assert.deepEqual(placeSeo({ kind: 'country', name: 'Australia', count: 1204 }), {
    title: 'Climbing gyms in Australia',
    description: '1,204 climbing gyms in Australia: bouldering, top rope and lead. Browse them on Bouldeer, the community-sourced climbing map.',
  });
  assert.equal(placeSeo({ kind: 'region', name: 'New South Wales', within: 'Australia', count: 1 }).title, 'Climbing gyms in New South Wales, Australia');
  assert.match(placeSeo({ kind: 'region', name: 'New South Wales', within: 'Australia', count: 1 }).description, /^1 climbing gym in New South Wales, Australia:/);
  assert.equal(placeSeo({ kind: 'city', name: 'Marrickville', within: 'New South Wales, Australia', count: 3 }).title, 'Climbing gyms in Marrickville, New South Wales, Australia');
  assert.match(placeSeo({ kind: 'city', name: 'X' }).description, /^Climbing gyms in X:/, 'unknown count: no number');
  const hostile = placeSeo({ kind: 'city', name: '<b>"x"</b>\n', within: '<i>', count: 2 });
  assert.doesNotMatch(hostile.title, /[\r\n]/);
});
