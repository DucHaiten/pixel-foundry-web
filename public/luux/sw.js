const VERSION = 'luux-loader-v1';
const APP = ['./', './index.html', './manifest.webmanifest', './icon.svg'];
const PACKAGE = [0, 1, 2, 3].map((n) => `https://raw.githubusercontent.com/DucHaiten/pixel-foundry-web/main/.luux/part-0${n}`);

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then(async (cache) => {
    await cache.addAll(APP);
    await Promise.all(PACKAGE.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) await cache.put(url, response);
      } catch {}
    }));
  }));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok || response.type === 'opaque') {
      const copy = response.clone();
      caches.open(VERSION).then((cache) => cache.put(event.request, copy));
    }
    return response;
  })));
});
