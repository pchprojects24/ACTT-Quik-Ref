/* ACTT Quick Reference — offline cache.
 * Bump the version below whenever index.html or the PDFs change so
 * returning devices pick up the new content. */
var CACHE = "actt-quik-ref-v3";
var CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== location.origin) return;

  if (req.mode === "navigate") {
    // Network-first so content updates land; cached copy keeps the app
    // working with no connectivity.
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match("./index.html");
        });
      })
    );
    return;
  }

  // Everything else (monograph PDFs, icons): cache-first, fill from network.
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});

// The page sends the monograph PDF list after registration so every
// monograph is available offline, not just the ones already opened.
// Downloads run one at a time and individual failures are skipped,
// so a dropped connection never breaks the app cache.
self.addEventListener("message", function (e) {
  var data = e.data || {};
  if (data.type !== "PREFETCH_PDFS" || !Array.isArray(data.urls)) return;
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return data.urls.reduce(function (chain, u) {
        return chain.then(function () {
          return c.match(u).then(function (hit) {
            if (hit) return;
            return fetch(u).then(function (res) {
              if (res && res.ok) return c.put(u, res);
            }).catch(function () {});
          });
        });
      }, Promise.resolve());
    })
  );
});
