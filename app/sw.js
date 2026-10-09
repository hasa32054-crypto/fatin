/* Fatin service worker: the app works offline after the first visit. */
const CACHE = "fatin-v27";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png",
  "../fonts/fonts.css", "../fonts/Alexandria.woff", "../fonts/IBMPlexSansArabic-Regular.woff", "../fonts/IBMPlexSansArabic-Medium.woff", "../fonts/IBMPlexSansArabic-SemiBold.woff", "../vendor/qrcode.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  // the page itself: network first so updates arrive, cache when offline
  if (req.mode === "navigate") { e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", cp)); return r; }).catch(() => caches.match("./index.html"))); return; }
  // settings and the bulletin: always ask the network first
  if (url.origin === location.origin && /\/(config|news)\.json$/.test(url.pathname)) { e.respondWith(fetch(req).catch(() => caches.match(req))); return; }
  // our own files (fonts, QR libraries, icons): cache after first use. Nothing from other sites.
  const okHost = url.origin === location.origin;
  if (!okHost) return;
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
