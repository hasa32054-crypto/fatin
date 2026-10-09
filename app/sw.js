/* Fatin service worker: the app works offline after the first visit. */
const CACHE = "fatin-v28";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png",
  "../fonts/fonts.css", "../fonts/Alexandria.woff", "../fonts/IBMPlexSansArabic-Regular.woff", "../fonts/IBMPlexSansArabic-Medium.woff", "../fonts/IBMPlexSansArabic-SemiBold.woff", "../vendor/qrcode.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== "fatin-share").map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  // «Share → Fatin» from WhatsApp and other apps: text comes back as ?share=1&text=…, a voice note is kept for a moment and opened with &audio=1
  if (req.method === "POST" && new URL(req.url).searchParams.has("share")) {
    e.respondWith((async () => {
      const base = new URL("./", self.registration.scope), q = new URLSearchParams({ share: "1" });
      try {
        const f = await req.formData();
        for (const k of ["title", "text", "url"]) { const v = f.get(k); if (typeof v === "string" && v) q.set(k, v.slice(0, 4000)); }
        const a = f.get("audio");
        if (a && typeof a === "object" && a.size && a.size < 25e6) { const c = await caches.open("fatin-share"); await c.put("shared-audio", new Response(a, { headers: { "content-type": a.type || "audio/ogg" } })); q.set("audio", "1"); }
      } catch (err) {}
      return Response.redirect(base.href + "?" + q.toString(), 303);
    })());
    return;
  }
  if (req.method !== "GET") return;
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
