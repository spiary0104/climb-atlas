// Bouldeer service worker — offline app shell + map/data caching.
//
// Bump CACHE_VERSION whenever a precached file's content changes so
// clients pick up the new version instead of serving stale files forever.
// v5: private Supabase reads are no longer cached (activation deleted the old v4 data cache that held them).
// v6: Bouldeer design foundations (new CSS files, icon sprite, nav.js/icons.js; css/chips.css removed).
// v7: Phase 2 Explore (explore.css, contour placeholder, list/search/sheet modules; sidebar.js + popup-html.js removed);
//     page loads are served per path whatever the query string (Explore state lives in ?c=…).
// v8: Field Guide pass (cream surfaces, deer head on START/avatar, redrawn contour, warm basemap).
// v9: Phase 3 pages (router, gym/region/log/me pages, page.css); every app route is served the one cached shell.
// v10: Phase 4 community (provenance marks and lines, edit notes, /me contributions, /mod).
// v11: Brand Pass (deer palette, object line, head lockup, seal, antler mark, favicon/app icon, paper mini maps).
// v12: Phase 5 passport (check-in sheet, stamps, /me/passport, milestone sheet, share card, START sheet).
// v13: real-phone fixes (toast in the shell, gym picker, Regions search, re-traced mascot poses with white eyes, legal
//      rebrand). Same-origin files are stale-while-revalidate, so without a bump phones kept the old deer art.
// v14: canonical link points at www.bouldeer.com (index.html).
// v15: launch readiness: privacy/terms/404 pages, legal modals removed, pinned CDN with SRI, new footer links; submit-errors.js (sign-in + DB caps).
// v16: Add a gym says what is still needed when Submit is blocked.
// v17: 'Listed by Bouldeer' provenance for imported gyms; gym-cap error message.
// v18: internal research notes are hidden on the gym page and peek card (publicNotes in provenance.js).
// v19: field-notes / fresh-stamp poses and the Explore first run (brand.js, passport.js, list.js, explore.js).
// v20: page header art on Regions and signed-out Log/Me (assets/art, page-html.js pageArtHtml).
// v21: START reads "Check in"; boulder-tag and map-attribution contrast (tokens.css, style.css).
// v22: gym information (website, hours, day pass, facilities, description; gym-info.js).
// v23: nearest-first sort, first-visit orientation, Nearby rows, START for signed-out visitors, photos chip rule.
// v24: Explore loads only its columns, pages in parallel; full gym rows on demand.
// v25: city metros (metros.js; search, filters, region/city pages, gym breadcrumb).
// v26: gym and place page titles from seo-meta.js (router title pattern shared with the crawler metadata).
// v27: cross-region metros on neighbouring region pages and in gym breadcrumbs.
// v28: orientation line rendered at start-up.
// v29: metroOf memo; fewer gym-page re-renders.
// v31: [hidden] always hides (base.css); "A newer Bouldeer is ready" prompt (sw-register.js, utils.js, main.js); open now + today's
//      hours in discovery (hours.js).
const CACHE_VERSION = 'v31';
const SHELL_CACHE = 'climbatlas-shell-' + CACHE_VERSION;
const RUNTIME_CACHE = 'climbatlas-runtime-' + CACHE_VERSION;
const TILE_CACHE = 'climbatlas-tiles-' + CACHE_VERSION;
const DATA_CACHE = 'climbatlas-data-' + CACHE_VERSION;

const SHELL_FILES = [
  './',
  'index.html',
  'about.html',
  'privacy.html',
  'terms.html',
  '404.html',
  'manifest.json',
  'css/tokens.css',
  'css/base.css',
  'css/components.css',
  'css/explore.css',
  'css/page.css',
  'css/mod.css',
  'css/passport.css',
  'css/style.css',
  'assets/icons.svg',
  'assets/contour.svg',
  'assets/boulder.svg',
  'assets/mascot/head.svg',
  'assets/mascot/stamp-head.svg',
  'assets/brand/antlers.svg',
  'icons/favicon.svg',
  'icons/icon.svg',
  'js/supabase-init.js',
  'js/auth.js',
  'js/spots-prefetch.js',
  'js/main.js',
  'js/sw-register.js',
  'js/modules/state.js',
  'js/modules/constants.js',
  'js/modules/regions.js',
  'js/modules/utils.js',
  'js/modules/icons.js',
  'js/modules/nav.js',
  'js/modules/html-safe.js',
  'js/modules/list-html.js',
  'js/modules/pin-html.js',
  'js/modules/geo.js',
  'js/modules/search-index.js',
  'js/modules/metros.js',
  'js/modules/moderation-html.js',
  'js/modules/map.js',
  'js/modules/explore.js',
  'js/modules/list.js',
  'js/modules/filters.js',
  'js/modules/search.js',
  'js/modules/sheet.js',
  'js/modules/marks.js',
  'js/modules/router.js',
  'js/modules/slug.js',
  'js/modules/seo-meta.js',
  'js/modules/page-html.js',
  'js/modules/gym-page.js',
  'js/modules/mini-map.js',
  'js/modules/region-page.js',
  'js/modules/log-page.js',
  'js/modules/me-page.js',
  'js/modules/provenance.js',
  'js/modules/gym-info.js',
  'js/modules/hours.js',
  'js/modules/community.js',
  'js/modules/mod-page.js',
  'js/modules/add-html.js',
  'js/modules/add-page.js',
  'js/modules/brand.js',
  'js/modules/passport.js',
  'js/modules/stamp-html.js',
  'js/modules/checkin.js',
  'js/modules/milestone-sheet.js',
  'js/modules/passport-page.js',
  'js/modules/share-card.js',
  'js/modules/modals.js',
  'js/modules/submit-errors.js',
  'js/modules/auth-ui.js',
  'js/modules/data-load.js',
  'js/modules/logbook.js',
  'js/modules/moderation.js',
  'js/modules/gym-picker.js'
];

// Hosts whose responses are map tiles/sprites/glyphs -- worth caching
// aggressively (cache-first) since a tile for a given coordinate never
// changes, and this is what makes "view a previously-visited part of the
// map while offline" actually work.
const TILE_HOSTS = ['basemaps.cartocdn.com'];

// The live Supabase project this app reads spot/mark data from -- see
// js/supabase-init.js. Matched by hostname suffix so this doesn't need
// updating if the project URL's path ever changes.
const SUPABASE_HOST_SUFFIX = '.supabase.co';

// The ONLY Supabase response that may be cached: the public read of approved spots
// (GET /rest/v1/spots?...&status=eq.approved, paged with offset/limit). Under RLS that result is identical for every
// visitor. Everything else under /rest/ is per-user or moderator-only (marks, sessions, session_climbs, moderators,
// pending_edits, reports, pending spots, a submitter's own rows...) and must never be written to Cache Storage: the
// Cache API keys on the URL alone, not on the Authorization header, so a cached private response would later be served
// to a different user or after sign-out on a shared device.
function isPublicSpotsRead(url) {
  return url.pathname === '/rest/v1/spots'
    && url.searchParams.get('status') === 'eq.approved'
    && !url.searchParams.has('submitted_by');
}

// Belt and braces for the DATA cache only (the static/CDN caches legitimately hold responses such as Google Fonts CSS that
// say "private"): a Supabase response that declares itself private / uncacheable is never stored, whatever the URL.
function isStorable(response) {
  if (!response || !response.ok) return false;
  const cc = (response.headers && response.headers.get('Cache-Control')) || '';
  const directives = cc.toLowerCase().split(',').map((d) => d.trim().split('=')[0]);
  return !directives.includes('no-store') && !directives.includes('private');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const keep = new Set([SHELL_CACHE, RUNTIME_CACHE, TILE_CACHE, DATA_CACHE]);
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => name.startsWith('climbatlas-') && !keep.has(name))
          .map((name) => caches.delete(name))
      ))
      .then(() => purgeNonPublicData())
      .then(() => self.clients.claim())
  );
});

async function purgeNonPublicData() {
  const cache = await caches.open(DATA_CACHE);
  const requests = await cache.keys();
  await Promise.all(requests.filter((req) => !isPublicSpotsRead(new URL(req.url))).map((req) => cache.delete(req)));
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await networkPromise) || Response.error();
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

// Page loads: Explore keeps its state in the query string (?c=lng,lat,z&t=…), which changes on every pan, and every app
// route (/gym/…, /in/…, /log, /me) is the same index.html shell rendered by the router. So app routes share ONE cached
// shell (keyed '/'), whatever the path or query, and other pages (about.html) are cached per path. Without this an
// offline reload of /?c=… or of a gym page never visited online would find nothing.
const APP_ROUTE = /^\/(?:index\.html)?$|^\/(?:gym|in|log|me|mod|add)(?:\/|$)/;
async function navigation(request) {
  const cache = await caches.open(SHELL_CACHE);
  const url = new URL(request.url);
  const key = new Request(url.origin + (APP_ROUTE.test(url.pathname) ? '/' : url.pathname));
  const cached = await cache.match(key);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(key, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await networkPromise) || Response.error();
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (isStorable(response)) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // never cache writes (spot submissions, marks, etc.)

  const url = new URL(request.url);

  // Map basemap tiles/sprites/glyphs: cache-first, they're immutable per URL.
  if (TILE_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(request, TILE_CACHE));
    return;
  }

  // Supabase reads. Only the public approved-spots list is cached (network-first, last-seen copy offline).
  // Every other Supabase request -- private tables, moderator queues, auth -- is not intercepted at all, so it
  // goes straight to the network and is never stored.
  if (url.hostname.endsWith(SUPABASE_HOST_SUFFIX)) {
    if (isPublicSpotsRead(url)) event.respondWith(networkFirst(request, DATA_CACHE));
    return;
  }

  // Same-origin app shell + third-party library CDNs (unpkg/jsdelivr/fonts):
  // stale-while-revalidate so the app still boots offline but self-heals
  // the next time it's online.
  const isSameOrigin = url.origin === self.location.origin;
  const isLibraryCdn = ['unpkg.com', 'cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com']
    .includes(url.hostname);
  if (isSameOrigin && request.mode === 'navigate') {
    event.respondWith(navigation(request));
    return;
  }
  if (isSameOrigin || isLibraryCdn) {
    event.respondWith(staleWhileRevalidate(request, isSameOrigin ? SHELL_CACHE : RUNTIME_CACHE));
  }
  // Everything else goes straight to the network.
});
