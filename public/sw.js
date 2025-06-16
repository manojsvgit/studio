// public/sw.js
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Add caching for essential assets if needed
  // event.waitUntil(
  //   caches.open('walmartchain-cache-v1').then((cache) => {
  //     return cache.addAll([
  //       '/',
  //       // Add other paths to cache initially
  //     ]);
  //   })
  // );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Clean up old caches
  // event.waitUntil(
  //   caches.keys().then((cacheNames) => {
  //     return Promise.all(
  //       cacheNames.map((cacheName) => {
  //         if (cacheName !== 'walmartchain-cache-v1') {
  //           return caches.delete(cacheName);
  //         }
  //       })
  //     );
  //   })
  // );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Basic network-first strategy
  event.respondWith(
    fetch(event.request).catch(() => {
      // If network fails, try to serve from cache or a fallback offline page
      // return caches.match(event.request).then((response) => {
      //   return response || caches.match('/offline.html'); // Example offline page
      // });
      return new Response("Network error occurred and no offline page configured.", {
        status: 408,
        headers: { 'Content-Type': 'text/plain' },
      });
    })
  );
});