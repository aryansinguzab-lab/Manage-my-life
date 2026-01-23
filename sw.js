const cacheName = 'lifemgr-v3'; // Incremented for fresh start
const assets = [
  './',
  './index.html',
  './manifest.json',
  './dexie.js',
  './chart.js',
  './icon.png',
  './manifest.js' // Make sure your trial logic script is here!
];

self.addEventListener('install', evt => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open(cacheName).then(cache => {
      // Use cache.addAll to ensure core UI is saved
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== cacheName)
        .map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim(); // Immediately control the page
});

// Optimized Fetch Strategy
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      // If file is in cache, return it IMMEDIATELY (Instant load)
      if (cacheRes) return cacheRes;

      // Otherwise, go to network and cache the result for next time
      return fetch(evt.request).then(fetchRes => {
        return caches.open(cacheName).then(cache => {
          // Only cache successful GET requests
          if (evt.request.method === 'GET') {
            cache.put(evt.request.url, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    }).catch(() => {
      // Offline fallback
      if (evt.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
