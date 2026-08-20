// Service Worker for Shofar Cadenza PWA
const CACHE_NAME = 'cadenza-gold-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let the browser handle standard audio and API streaming directly
  if (event.request.url.includes('cloudinary.com') || event.request.url.includes('firebaseio.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => caches.match('/'));
    })
  );
});
