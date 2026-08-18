/* Service worker for EduCenter — enables the app shell to open offline and
 * caches static assets while they're in use. Lesson videos are NOT cached here;
 * offline playback is handled by the IndexedDB download manager instead. */
const STATIC_CACHE = "educenter-static-v1";
const SHELL_CACHE = "educenter-shell-v1";
const MAX_STATIC_ITEMS = 60;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all(
      [STATIC_CACHE, SHELL_CACHE].map((name) =>
        caches
          .open(name)
          .then((cache) => cache.keys())
          .then((keys) => {
            if (keys.length > MAX_STATIC_ITEMS) {
              return Promise.all(
                keys
                  .slice(0, keys.length - MAX_STATIC_ITEMS)
                  .map((key) => cacheDelete(name, key))
              );
            }
            return Promise.resolve();
          })
      )
    ).then(() => self.clients.claim())
  );
});

function cacheDelete(cacheName, request) {
  return caches.open(cacheName).then((cache) => cache.delete(request));
}

async function trimCache(cache, keep) {
  const keys = await cache.keys();
  if (keys.length <= keep) return;
  for (const key of keys.slice(0, keys.length - keep)) {
    await cache.delete(key);
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Only handle same-origin requests. Cross-origin (Supabase storage, Google
  // Meet, external links) is left to the network.
  if (url.origin !== self.location.origin) return;

  // Page navigations: network-first, fall back to the last cached shell so the
  // app opens offline.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE);
        try {
          const response = await fetch(request);
          if (response.ok) {
            await trimCache(cache, 20);
            await cache.put("/", response.clone());
          }
          return response;
        } catch (error) {
          const cached = await cache.match("/");
          if (cached) return cached;
          throw error;
        }
      })()
    );
    return;
  }

  // Static assets (hashed JS/CSS/images/fonts): stale-while-revalidate.
  if (request.destination === "script" || request.destination === "style") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone()).then(() => trimCache(cache, MAX_STATIC_ITEMS));
            }
            return response;
          })
          .catch(() => undefined);
        return cached || (await network);
      })()
    );
    return;
  }

  if (request.destination === "image" || request.destination === "font") {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const cachePromise = caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, response.clone()).then(() =>
                  trimCache(cache, MAX_STATIC_ITEMS)
                );
              });
              event.waitUntil(cachePromise);
            }
            return response;
          })
      )
    );
  }
});