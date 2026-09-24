// Climb Atlas service worker — offline app shell + map/data caching.
//
// Bump CACHE_VERSION whenever a precached file's content changes so
// clients pick up the new version instead of serving stale files forever.
const CACHE_VERSION = 'v5';   // v5: private Supabase reads are no longer cached; activating v5 deletes the old v4 data cache that held them
const SHELL_CACHE = 'climbatlas-shell-' + CACHE_VERSION;
const RUNTIME_CACHE = 'climbatlas-runtime-' + CACHE_VERSION;
const TILE_CACHE = 'climbatlas-tiles-' + CACHE_VERSION;
const DATA_CACHE = 'climbatlas-data-' + CACHE_VERSION;

const SHELL_FILES = [
  './',
  'index.html',
  'about.html',
  'manifest.json',
  'css/style.css',
  'css/chips.css',
  'js/supabase-init.js',
  'js/auth.js',
  'js/main.js',
  'js/sw-register.js',
  'js/modules/state.js',
  'js/modules/constants.js',
  'js/modules/regions.js',
  'js/modules/utils.js',
  'js/modules/html-safe.js',
  'js/modules/popup-html.js',
  'js/modules/moderation-html.js',
  'js/modules/map.js',
  'js/modules/sidebar.js',
  'js/modules/modals.js',
  'js/modules/auth-ui.js',
  'js/modules/data-load.js',
  'js/modules/logbook.js',
  'js/modules/moderation.js',
  'icons/icon.svg'
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
  if (isSameOrigin || isLibraryCdn) {
    event.respondWith(staleWhileRevalidate(request, isSameOrigin ? SHELL_CACHE : RUNTIME_CACHE));
  }
  // Everything else goes straight to the network.
});
