const cacheName = 'lifemgr-v5'; // Increased version
const assets = [
  './',
  './index.html',
  './manifest.json',
  './manifest.js',
  './dexie.js',
  './chart.js',
  './icon.png'
];

// Install: Cache everything immediately
self.addEventListener('install', evt => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('Caching shell assets');
      return cache.addAll(assets);
    })
  );
});

// Activate: Delete old versions of the app
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== cacheName)
        .map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// Fetch: Serve from Cache first for speed
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      // Return cached file if found, else fetch from network
      return cacheRes || fetch(evt.request).then(fetchRes => {
        return caches.open(cacheName).then(cache => {
          // Dynamically cache new requests (like images/fonts)
          if (evt.request.method === 'GET') {
            cache.put(evt.request.url, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    }).catch(() => {
      // Fallback if network and cache fail (Offline)
      if (evt.request.url.indexOf('.html') > -1) {
        return caches.match('./index.html');
      }
    })
  );
});
