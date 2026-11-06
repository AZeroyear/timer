/* Minimal service worker: lets the app open offline once it has been loaded.
 * Pages use network-first so a new deploy is picked up on the next visit;
 * other same-origin files are served from cache and refreshed in the background. */
const CACHE = 'loopy-timer-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));

          return res;
        })
        .catch(() =>
          caches.match(request).then((hit) => hit || caches.match('/')),
        ),
    );

    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((res) => {
          if (res.ok) cache.put(request, res.clone());

          return res;
        })
        .catch(() => cached);

      return cached || network;
    }),
  );
});
