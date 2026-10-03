// Sitemap builder (pure apart from loading the app's own URL rules). Mirrors exactly the URLs the app routes to:
//   /  /in  /in/{cc}  /in/{cc}/{region}  /in/{cc}/{region}/{city}  /gym/{slug}  + the static pages.
// URL segments come from js/modules/slug.js and the country gate from js/modules/constants.js COUNTRY_LABELS, the same
// modules region-page.js uses, so the sitemap cannot drift from what the router renders. Tested offline (tests/sitemap.test.js).
'use strict';
const path = require('path');
const { pathToFileURL } = require('url');

const ORIGIN = 'https://www.bouldeer.com';
const STATIC_PAGES = ['/', '/in', '/about', '/privacy', '/terms'];
const ROOT = path.resolve(__dirname, '..', '..');

// The app modules are ES modules; constants.js reads window.matchMedia at import time (reduced motion), so give it a stub.
async function loadRules() {
  if (typeof globalThis.window === 'undefined') globalThis.window = { matchMedia: () => ({ matches: false }) };
  const load = f => import(pathToFileURL(path.join(ROOT, 'js', 'modules', f)).href);
  const [slug, constants] = await Promise.all([load('slug.js'), load('constants.js')]);
  return { slug, COUNTRY_LABELS: constants.COUNTRY_LABELS };
}

const xmlEscape = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// rows: approved spots ({slug, country, state, suburb}). Returns {urls: [{path, type}], skipped: {...}}; deterministic order.
async function collectUrls(rows) {
  const { slug, COUNTRY_LABELS } = await loadRules();
  const skipped = { noSlug: 0, unknownCountry: 0, noRegion: 0, noCity: 0 };
  const gyms = new Set(), countries = new Set(), regions = new Set(), cities = new Set();
  for (const g of rows) {
    const cc = String(g.country || '').toUpperCase();
    if (g.slug) gyms.add(slug.gymPath(g)); else skipped.noSlug++;
    // Place pages only exist for countries with a label (region-page.js: !COUNTRY_LABELS[cc] -> not found), and only
    // for a non-empty path segment (an empty one cannot match the router's [^/]+).
    if (!COUNTRY_LABELS[cc]) { skipped.unknownCountry++; continue; }
    countries.add(slug.countryPath(cc));
    if (!slug.regionSegment(g.state)) { skipped.noRegion++; continue; }
    regions.add(slug.regionPath(cc, g.state));
    if (!slug.citySegment(g.suburb)) { skipped.noCity++; continue; }
    cities.add(slug.cityPath(cc, g.state, g.suburb));
  }
  const sorted = set => [...set].sort();
  const urls = [
    ...STATIC_PAGES.map(p => ({ path: p, type: 'static' })),
    ...sorted(countries).map(p => ({ path: p, type: 'country' })),
    ...sorted(regions).map(p => ({ path: p, type: 'region' })),
    ...sorted(cities).map(p => ({ path: p, type: 'city' })),
    ...sorted(gyms).map(p => ({ path: p, type: 'gym' })),
  ];
  return { urls, skipped };
}

async function buildSitemap(rows, { origin = ORIGIN } = {}) {
  const { urls, skipped } = await collectUrls(rows);
  const counts = {};
  for (const u of urls) counts[u.type] = (counts[u.type] || 0) + 1;
  const body = urls.map(u => `  <url><loc>${xmlEscape(origin + u.path)}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  return { xml, counts, total: urls.length, skipped };
}

module.exports = { ORIGIN, STATIC_PAGES, xmlEscape, collectUrls, buildSitemap };
