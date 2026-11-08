const CACHE = 'fx-replay-v3';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const LIB = 'https://cdn.jsdelivr.net/npm/lightweight-charts@4.2.0/dist/lightweight-charts.standalone.production.js';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).then(() => fetch(LIB).then(r => c.put(LIB, r)).catch(() => {}))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const same = new URL(e.request.url).origin === location.origin;
  if (!same && e.request.url !== LIB) return; // let data APIs (e.g. Binance) go straight to the network
  const save = r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; };
  if (same) e.respondWith(fetch(e.request).then(save).catch(() => caches.match(e.request).then(h => h || caches.match('./index.html'))));
  else e.respondWith(caches.match(e.request).then(h => h || fetch(e.request).then(save)));
});
