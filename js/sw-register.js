// Registers the offline-caching service worker (sw.js) and tells the app when a newer one has taken over.
// Classic script with no dependencies: an update is announced as a `bouldeer:sw-updated` event on window (main.js turns it
// into the "A newer Bouldeer is ready" toast). It never reloads the page itself.
(function () {
  if (!('serviceWorker' in navigator)) return;

  const watched = new WeakSet();    // workers whose statechange we already follow (updatefound + reg.installing can both see one)
  const announced = new WeakSet();  // workers already announced: one update, one event

  function announce(worker) {
    if (announced.has(worker)) return;
    announced.add(worker);
    window.dispatchEvent(new CustomEvent('bouldeer:sw-updated'));
  }

  function watch(worker) {
    if (!worker || watched.has(worker)) return;
    watched.add(worker);
    worker.addEventListener('statechange', () => {
      // `installed` with an existing controller is an update; the very first install has no controller yet.
      if (worker.state === 'installed' && navigator.serviceWorker.controller) announce(worker);
    });
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => watch(registration.installing));
      watch(registration.installing);   // an update that began before this handler was attached
      // A phone left open for days never re-checks on its own: ask for the newest sw.js whenever the tab comes back.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update().catch(() => {});
      });
    }).catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
})();
