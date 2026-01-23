const cacheName = 'lifemgr-v10'; // Jump to v10 to force a change
const assets = [
  './',
  './index.html',
  './manifest.json',
  './manifest.js',
  './dexie.js',
  './chart.js',
  './icon.png'
];

self.addEventListener('install', evt => {
  self.skipWaiting(); // Kill the old version immediately
  evt.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assets))
  );
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim(); // Take control of the page NOW
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      // Return cache, but also update the cache in the background (Stale-While-Revalidate)
      const fetchResult = fetch(evt.request).then(fetchRes => {
        return caches.open(cacheName).then(cache => {
          if (evt.request.method === 'GET') {
            cache.put(evt.request.url, fetchRes.clone());
          }
          return fetchRes;
        });
      });
      return cacheRes || fetchResult;
    })
  );
});
