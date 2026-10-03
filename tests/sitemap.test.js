// sitemap.xml builder (scripts/lib/sitemap.js), the committed sitemap.xml, robots.txt and the /about canonical. Offline.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { buildSitemap, collectUrls, xmlEscape, STATIC_PAGES } = require('../scripts/lib/sitemap');

const ROOT = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const locs = xml => [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map(m => m[1]);

const ROWS = [
  { slug: 'blochaus-marrickville', country: 'AU', state: 'NSW', suburb: 'Marrickville' },
  { slug: 'vertikal-marrickville', country: 'AU', state: 'NSW', suburb: 'Marrickville' },
  { slug: 'rocksports-sydney', country: 'AU', state: 'NSW', suburb: 'Sydney' },
  { slug: 'depot-leeds', country: 'GB', state: 'ENG', suburb: 'Île de Leeds & Co' },
  { slug: 'no-region', country: 'AU', state: '', suburb: 'Nowhere' },
  { slug: 'no-city', country: 'AU', state: 'VIC', suburb: '' },
  { slug: 'free-text-country', country: 'ZZ', state: 'X', suburb: 'Y' },
  { slug: 'a&b<c>', country: 'JP', state: 'Tokyo', suburb: '' },
  { country: 'AU', state: 'NSW', suburb: 'Sydney' },
];

test('builder: every URL the app routes to, absolute on www.bouldeer.com, no duplicates', async () => {
  const { xml, counts, total, skipped } = await buildSitemap(ROWS);
  const u = locs(xml);
  assert.equal(u.length, total);
  assert.equal(new Set(u).size, u.length, 'no duplicate URLs');
  assert.ok(u.every(x => x.startsWith('https://www.bouldeer.com/')));
  for (const p of STATIC_PAGES) assert.ok(u.includes('https://www.bouldeer.com' + p), p);
  assert.ok(!u.some(x => /about\.html|privacy\.html|terms\.html|index\.html/.test(x)), 'clean static URLs only');
  for (const p of ['/in/au', '/in/au/nsw', '/in/au/nsw/marrickville', '/in/au/nsw/sydney', '/in/gb/eng', '/gym/blochaus-marrickville']) {
    assert.ok(u.includes('https://www.bouldeer.com' + p), p);
  }
  // Suburb/area pages only with 2+ gyms (owner decision 2026-10-04): Marrickville and Sydney have two, Leeds one.
  assert.ok(!u.includes('https://www.bouldeer.com/in/gb/eng/ile-de-leeds-co'), 'a single-gym area page is left out');
  assert.equal(counts.static, 5);
  assert.equal(counts.country, 3);   // AU, GB, JP (ZZ has no label: its place pages 404)
  assert.equal(counts.gym, 8);       // the row without a slug is skipped
  assert.deepEqual(skipped, { noSlug: 1, unknownCountry: 1, noRegion: 1, noCity: 2, singleGymArea: 1 });
});

test('builder: never emits a URL the router could not match (empty segments, unknown countries)', async () => {
  const { matchRoute } = await import('../js/modules/router.js');
  const { urls } = await collectUrls(ROWS);
  for (const { path: p, type } of urls) {
    assert.ok(!p.includes('//') && (p === '/' || !p.endsWith('/')), p);
    const want = { country: 'country', region: 'region', city: 'city', gym: 'gym' }[type];
    if (want) assert.equal(matchRoute(p).name, want, p);
  }
  assert.ok(!urls.some(x => x.path.startsWith('/in/zz')), 'no page for a country the app has no label for');
});

test('builder: valid XML shape, markup characters escaped', async () => {
  const { xml } = await buildSitemap(ROWS);
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">\n/);
  assert.ok(xml.endsWith('</urlset>\n'));
  assert.equal((xml.match(/<url>/g) || []).length, (xml.match(/<\/url>/g) || []).length);
  assert.doesNotMatch(xml.replace(/<\/?(?:url|loc|urlset)[^>]*>|<\?xml[^>]*\?>/g, ''), /[<>]/, 'no raw < or > outside the tags');
  assert.ok(!/&(?!amp;|lt;|gt;|quot;|apos;)/.test(xml), 'no bare ampersand');
  assert.equal(xmlEscape(`a&b<c>"d"'e'`), 'a&amp;b&lt;c&gt;&quot;d&quot;&apos;e&apos;');
  assert.ok(locs(xml).some(l => l.endsWith('/gym/a%26b%3Cc%3E')), 'slug is URL-encoded by the app rule');
});

test('builder: deterministic (input order does not matter)', async () => {
  const a = await buildSitemap(ROWS), b = await buildSitemap([...ROWS].reverse());
  assert.equal(a.xml, b.xml);
});

test('committed sitemap.xml: well-formed, within protocol limits, includes the static pages and gym pages', () => {
  const xml = read('sitemap.xml');
  const u = locs(xml);
  assert.ok(u.length >= 1000 && u.length <= 50000, 'sitemap protocol allows at most 50,000 URLs: ' + u.length);
  assert.ok(Buffer.byteLength(xml) < 50 * 1024 * 1024);
  assert.equal(new Set(u).size, u.length);
  assert.ok(u.every(x => /^https:\/\/www\.bouldeer\.com\/[^\s<>"]*$/.test(x)));
  for (const p of ['/', '/in', '/about', '/privacy', '/terms']) assert.ok(u.includes('https://www.bouldeer.com' + p), p);
  assert.ok(u.some(x => x.includes('/gym/')) && u.some(x => /\/in\/[a-z]{2}$/.test(x)));
});

test('robots.txt points at the sitemap and keeps its existing rules', () => {
  const r = read('robots.txt');
  assert.ok(r.split(/\r?\n/).includes('Sitemap: https://www.bouldeer.com/sitemap.xml'));
  assert.match(r, /User-agent: \*\r?\nDisallow: \/js\/data\.js\r?\nDisallow: \/docs\/\r?\nDisallow: \/supabase\//);
  assert.match(r, /User-agent: GPTBot[\s\S]*Disallow: \/\r?\n/);
  assert.ok(!/^Disallow: \/sitemap\.xml/m.test(r));
});

test('static pages: canonicals are the clean URLs that vercel.json serves (about, privacy, terms)', () => {
  const vercel = JSON.parse(read('vercel.json'));
  for (const [page, file] of [['about', 'about.html'], ['privacy', 'privacy.html'], ['terms', 'terms.html']]) {
    assert.ok(vercel.rewrites.some(r => r.source === '/' + page && r.destination === '/' + file), `${page} rewrite`);
    assert.ok(!vercel.redirects.some(r => r.source === '/' + page), `${page} is not redirected`);
    assert.match(read(file), new RegExp(`<link rel="canonical" href="https://www\\.bouldeer\\.com/${page}">`));
  }
});
