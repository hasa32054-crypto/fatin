/* Fatin service worker: the app works offline after the first visit.
   Built by tools/build.mjs: CACHE is a hash of every file the app serves, so any change to the app,
   its fonts, libraries or language packs gets a fresh cache and the old one is removed. */
const CACHE = "fatin-@@VERSION@@";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png",
  "./fonts/ibm-plex-sans-arabic-arabic-400-normal.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// only a good answer from this site is ever kept
const keep = r => r && r.ok && r.type === "basic" && !r.redirected;
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // the Fatin server and anything else outside the site: straight to the network
  // the page itself: network first so updates arrive, cache when offline.
  // Only a good same-origin page replaces the offline copy (never a 404 or a server error page).
  if (req.mode === "navigate") { e.respondWith(fetch(req).then(r => { if (keep(r) && (r.headers.get("content-type") || "").includes("text/html")) { const cp = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", cp)); } return r; }).catch(() => caches.match("./index.html"))); return; }
  // settings and the bulletin: network first, the last good copy when offline
  if (/\/(config|news)\.json$/.test(url.pathname)) { e.respondWith(fetch(req).then(r => { if (keep(r)) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => caches.match(req))); return; }
  // everything else on the site (fonts, libraries, language packs, icons): from the cache, fetched once
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (keep(r)) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; })));
});
