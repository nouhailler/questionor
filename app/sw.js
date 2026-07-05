/* Service worker — La question du jour
   Précache complet : l'app fonctionne 100% hors-ligne après la 1re visite. */

const CACHE = 'qdj-v1';

const ASSETS = [
  '.',
  'index.html',
  'css/styles.css',
  'js/app.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];
for (let i = 1; i <= 16; i++) {
  ASSETS.push('data/q' + String(i).padStart(2, '0') + '.json');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // On ne gère que les requêtes de même origine ; les polices Google passent au réseau.
  if (url.origin !== self.location.origin) return;

  // Navigation : réseau d'abord, repli sur l'app en cache (offline).
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('index.html'))
    );
    return;
  }

  // Autres assets : cache d'abord, réseau en repli (et on met en cache au passage).
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});
