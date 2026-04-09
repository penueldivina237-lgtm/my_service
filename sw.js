/* Minimal PWA service worker for offline-friendly navigation */

const CACHE_NAME = 'divine-pwa-v3';

// Use relative URLs so this works on GitHub Pages subpaths.
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icons/icon.svg',
  './assets/images/image1.jpeg',
  './assets/images/image2.jpeg',
  './assets/images/image_04.png',
  './assets/images/Image_06.png',
  './assets/images/portfolio-main.png',
  './public/service-summary.html',
  './public/core-expertise.html',
  './public/faq.html',
  './public/request-consultation.html',
  './public/inside.html',
  './public/estimator.html',
  './public/video.html',
  './public/booking-success.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
          return undefined;
        })
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle GET requests.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // For top-level navigations: network-first, fall back to cached index.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
          return response;
        } catch (err) {
          const cache = await caches.open(CACHE_NAME);
          return (
            (await cache.match(request)) ||
            (await cache.match('./index.html')) ||
            Response.error()
          );
        }
      })()
    );
    return;
  }

  // For same-origin static assets: cache-first.
  if (sameOrigin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;

        const response = await fetch(request);
        // Cache successful responses.
        if (response && response.ok) cache.put(request, response.clone());
        return response;
      })()
    );
  }
});
