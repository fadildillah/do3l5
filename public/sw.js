const CACHE_NAME = "do3l5-v2";
const STATIC_ASSETS = ["/", "/upload"];

// Install: pre-cache shell pages
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: purge old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: strategy depends on request type
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API routes and Next.js RSC/Prefetch requests entirely — always go to network
  if (
    request.url.includes("/api/") ||
    request.headers.has("RSC") ||
    request.headers.has("Next-Router-Prefetch") ||
    request.url.includes("?_rsc=")
  ) {
    return;
  }

  // Navigation requests (HTML pages): NETWORK-FIRST
  // Always try the network so the user sees fresh data.
  // Fall back to cache only when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  // Static assets (JS, CSS, images, fonts): CACHE-FIRST
  // These are typically hashed by Next.js and safe to serve from cache.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});

// Listen for CACHE_BUST messages from the client.
// After a mutation (create/edit/delete), the client sends a list of URLs
// to purge so the next navigation always hits the network.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CACHE_BUST") {
    const urls = event.data.urls || [];
    caches.open(CACHE_NAME).then((cache) => {
      urls.forEach((url) => {
        // Delete the exact URL and any request that matches it
        cache.delete(new Request(url)).catch(() => { });
        // Also try with the origin prefix for absolute matching
        if (!url.startsWith("http")) {
          cache.delete(new Request(self.registration.scope.replace(/\/$/, "") + url)).catch(() => { });
        }
      });
    });
  }
});