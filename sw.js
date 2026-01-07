const cacheName = 'lifemgr-v2'; // Incremented version
const assets = [
  './',
  './index.html',
  './manifest.json',
  './dexie.js',
  './chart.js',
  './icon.png',
  // Add CSS or other critical UI files here
];

// Install: Cache core assets
self.addEventListener('install', evt => {
  self.skipWaiting(); // Force the new service worker to become active
  evt.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== cacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// Fetch: Network falling back to Cache (with dynamic caching)
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request).then(fetchRes => {
        // Dynamically cache new resources (like external fonts or API images)
        return caches.open(cacheName).then(cache => {
          cache.put(evt.request.url, fetchRes.clone());
          return fetchRes;
        });
      });
    }).catch(() => {
      // Fallback if both fail (useful for returning index.html on 404/offline)
      if (evt.request.url.indexOf('.html') > -1) {
        return caches.match('./index.html');
      }
    })
  );
});
