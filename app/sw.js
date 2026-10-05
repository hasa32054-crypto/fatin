/* Fatin service worker: the app works offline after the first visit. */
const CACHE = "fatin-v25";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  // the page itself: network first so updates arrive, cache when offline.
  // Only a good same-origin page replaces the offline copy (never a 404 or a server error page).
  if (req.mode === "navigate") { e.respondWith(fetch(req).then(r => { if (r.ok && r.type === "basic" && !r.redirected && (r.headers.get("content-type") || "").includes("text/html")) { const cp = r.clone(); caches.open(CACHE).then(c => c.put("./index.html", cp)); } return r; }).catch(() => caches.match("./index.html"))); return; }
  // settings and the bulletin: always ask the network first
  if (url.origin === location.origin && /\/(config|news)\.json$/.test(url.pathname)) { e.respondWith(fetch(req).catch(() => caches.match(req))); return; }
  // fonts and the two libraries (QR): cache after first use
  const okHost = url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/.test(url.host);
  if (!okHost) return;
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r && (r.ok || r.type === "opaque")) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
