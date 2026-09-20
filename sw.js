// Climb Atlas service worker — offline app shell + map/data caching.
//
// Bump CACHE_VERSION whenever a precached file's content changes so
// clients pick up the new version instead of serving stale files forever.
const CACHE_VERSION = 'v2';
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
  'js/supabase-init.js',
  'js/auth.js',
  'js/app.js',
  'icons/icon.svg',
  'icons/favicon.svg',
  'icons/icon-192.png'
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
      .then(() => self.clients.claim())
  );
});

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
    if (response && response.ok) cache.put(request, response.clone());
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

  // Supabase data reads (spots, marks, etc.): try the network for freshness,
  // fall back to the last-seen response when offline.
  if (url.hostname.endsWith(SUPABASE_HOST_SUFFIX) && url.pathname.startsWith('/rest/')) {
    // Only the public approved-spots read is worth keeping offline. Per-user
    // tables (marks, sessions, moderator queue) are private and must not sit
    // in Cache Storage after sign-out on a shared device.
    const isPublicSpotsRead = /\/rest\/v1\/spots\b/.test(url.pathname) && /status=eq\.approved/.test(url.search) && !/submitted_by=/.test(url.search);
    if (isPublicSpotsRead) event.respondWith(networkFirst(request, DATA_CACHE));
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
  // Everything else (e.g. Supabase auth calls) goes straight to the network.
});
