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
  const [slug, constants, metros, regions, seo] = await Promise.all([load('slug.js'), load('constants.js'), load('metros.js'), load('regions.js'), load('seo-meta.js')]);
  // map.js builds the map at import, so its stateLabel rule is repeated here (code -> display name, else the code).
  const stateLabel = (cc, state) => { const e = (regions.STATES_BY_COUNTRY[cc] || []).find(([code]) => code === state); return e ? e[1] : state; };
  return { slug, COUNTRY_LABELS: constants.COUNTRY_LABELS, metroOf: metros.metroOf, stateLabel, placeSeo: seo.placeSeo };
}

const xmlEscape = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// rows: approved spots ({slug, country, state, suburb}). Returns {urls: [{path, type}], skipped: {...}}; deterministic order.
async function collectUrls(rows) {
  const { slug, COUNTRY_LABELS, metroOf } = await loadRules();
  const skipped = { noSlug: 0, unknownCountry: 0, noRegion: 0, noCity: 0, singleGymArea: 0 };
  const gyms = new Set(), countries = new Set(), regions = new Set(), metros = new Set(), areaCounts = new Map();
  for (const g of rows) {
    const cc = String(g.country || '').toUpperCase();
    if (g.slug) gyms.add(slug.gymPath(g)); else skipped.noSlug++;
    // Place pages only exist for countries with a label (region-page.js: !COUNTRY_LABELS[cc] -> not found), and only
    // for a non-empty path segment (an empty one cannot match the router's [^/]+).
    if (!COUNTRY_LABELS[cc]) { skipped.unknownCountry++; continue; }
    countries.add(slug.countryPath(cc));
    // A metro page (metros.js) exists once a gym falls inside it; it shares the city URL tier and wins over a suburb.
    const metro = Number.isFinite(g.lat) && Number.isFinite(g.lng) ? metroOf(g) : null;
    if (metro) metros.add(slug.metroPath(metro));
    if (!slug.regionSegment(g.state)) { skipped.noRegion++; continue; }
    regions.add(slug.regionPath(cc, g.state));
    if (!slug.citySegment(g.suburb)) { skipped.noCity++; continue; }
    const area = slug.cityPath(cc, g.state, g.suburb);
    areaCounts.set(area, (areaCounts.get(area) || 0) + 1);
  }
  // Suburb/area pages only with 2+ gyms (a single-gym area page repeats its gym page); metro pages always.
  const cities = new Set(metros);
  for (const [area, n] of areaCounts) { if (n >= 2) cities.add(area); else if (!metros.has(area)) skipped.singleGymArea++; }
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

// Titles and descriptions for every place page (country, region, metro, suburb), plus the country and region display
// names, for the link-preview function (api/seo.mjs reads api/_places.json). Same builders as the app (seo-meta.js).
async function buildPlaces(rows) {
  const { slug, COUNTRY_LABELS, metroOf, stateLabel, placeSeo } = await loadRules();
  const countries = {}, regions = {}, counts = new Map(), meta = new Map();
  // Keyed by kind + path: a metro and a suburb can share a URL (Sydney), and their counts must not mix.
  const bump = (path, info) => { const k = (info.metro ? 'metro|' : 'place|') + path; counts.set(k, (counts.get(k) || 0) + 1); if (!meta.has(k)) meta.set(k, { path, info }); };
  for (const g of rows) {
    const cc = String(g.country || '').toUpperCase();
    if (!COUNTRY_LABELS[cc]) continue;
    const country = COUNTRY_LABELS[cc];
    countries[cc] = country;
    bump(slug.countryPath(cc), { kind: 'country', name: country });
    if (!slug.regionSegment(g.state)) continue;
    const region = stateLabel(cc, g.state);
    regions[cc + ':' + g.state] = region;
    bump(slug.regionPath(cc, g.state), { kind: 'region', name: region, within: country });
    const m = Number.isFinite(g.lat) && Number.isFinite(g.lng) ? metroOf(g) : null;
    if (m) bump(slug.metroPath(m), { kind: 'city', name: m.name, within: stateLabel(cc, m.state) + ', ' + country, metro: true });
    if (slug.citySegment(g.suburb)) bump(slug.cityPath(cc, g.state, g.suburb), { kind: 'city', name: String(g.suburb).trim(), within: region + ', ' + country });
  }
  const places = {};
  // Suburbs first, then metros, so a metro page wins over a suburb with the same URL (region-page.js resolves metros first).
  const entries = [...meta.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
  for (const [k, { path, info }] of [...entries.filter(([k]) => k.startsWith('place|')), ...entries.filter(([k]) => k.startsWith('metro|'))]) {
    const { title, description } = placeSeo({ ...info, count: counts.get(k) });
    places[path] = { title, description };
  }
  return { generated: 'scripts/build-sitemap.js', countries, regions, places };
}

module.exports = { ORIGIN, STATIC_PAGES, xmlEscape, collectUrls, buildSitemap, buildPlaces };
