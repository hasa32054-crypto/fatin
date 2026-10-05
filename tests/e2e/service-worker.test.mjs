// Service worker / PWA: first install, offline launch, cache poisoning, failed requests, recovery,
// updates from the two previous releases, and installability.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, cpSync, copyFileSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, launchPersistent, EXTERNAL } from "../helpers/browser.mjs";

const ROOT = new URL("../..", import.meta.url).pathname;
const FIX = new URL("../fixtures/sw/", import.meta.url).pathname;
let browser; const temps = [];
before(async () => { browser = await launch(); });
after(async () => { await browser?.close(); temps.forEach(d => rmSync(d, { recursive: true, force: true })); });

// a private copy of the site so a test can swap files, plus a switch to make the server fail
async function site(t) {
  const dir = mkdtempSync(join(tmpdir(), "fatin-sw-")); temps.push(dir);
  cpSync(join(ROOT, "app"), join(dir, "app"), { recursive: true });
  const state = { fail: null };
  const srv = await startStaticServer(dir, 0, { intercept: (url, res) => {
    if (state.fail && state.fail(url)) { res.writeHead(500, { "content-type": "text/html" }).end("<h1>500 server error</h1>"); return true; }
    return false; } });
  t.after(() => srv.close());
  return { dir, srv, state, url: srv.url + "/app/" };
}
async function ctxFor(t) { const ctx = await browser.newContext(); t.after(() => ctx.close().catch(() => {})); await ctx.route(EXTERNAL, r => r.abort()); return ctx; }
const isApp = p => p.evaluate(() => !!document.getElementById("msg")).catch(() => false);
async function install(p, url) { await p.goto(url); await p.evaluate(() => navigator.serviceWorker.ready); await p.reload(); await p.waitForTimeout(600); }

test("first install: controlled page and a full offline copy", { timeout: 90000 }, async (t) => {
  const s = await site(t); const ctx = await ctxFor(t); const p = await ctx.newPage();
  await install(p, s.url);
  const st = await p.evaluate(async () => ({ ctrl: !!navigator.serviceWorker.controller, keys: await caches.keys(), shell: !!(await caches.match("./index.html")) }));
  assert.ok(st.ctrl); assert.equal(st.keys.length, 1); assert.ok(st.shell);
  await ctx.setOffline(true); await p.goto(s.url); assert.ok(await isApp(p), "offline launch");
});

test("a 404, a JSON page, or a server error never replaces the offline app", { timeout: 90000 }, async (t) => {
  const s = await site(t); const ctx = await ctxFor(t); const p = await ctx.newPage();
  await install(p, s.url);
  await p.goto(s.url + "missing-page");          // 404
  await p.goto(s.url + "news.json");             // 200 but not the app page
  s.state.fail = u => u.pathname === "/app/"; await p.goto(s.url); s.state.fail = null; // 500 for the app itself
  await ctx.setOffline(true); await p.goto(s.url);
  assert.ok(await isApp(p), "the offline copy is still the app");
});

test("failed network request and recovery when the network returns", { timeout: 90000 }, async (t) => {
  const s = await site(t); const ctx = await ctxFor(t); const p = await ctx.newPage();
  await install(p, s.url);
  await ctx.setOffline(true); await p.goto(s.url); assert.ok(await isApp(p), "works offline");
  // a new release is published while the phone is offline
  const idx = join(s.dir, "app", "index.html"); writeFileSync(idx, readFileSync(idx, "utf8").replace("<title>", "<title>RELEASE-2 "));
  await ctx.setOffline(false); await p.goto(s.url);
  assert.match(await p.title(), /RELEASE-2/, "network-first page picks up the new release");
  await ctx.setOffline(true); await p.goto(s.url); assert.match(await p.title(), /RELEASE-2/, "and keeps it for offline use");
});

for (const old of ["sw-v24.js", "sw-v25.js"]) test("update from " + old + " keeps the app working offline", { timeout: 90000 }, async (t) => {
  const s = await site(t); copyFileSync(join(FIX, old), join(s.dir, "app", "sw.js"));
  const ctx = await ctxFor(t); const p = await ctx.newPage(); const errors = []; p.on("pageerror", e => errors.push(e.message));
  await install(p, s.url);
  const before = await p.evaluate(async () => (await caches.keys()).join());
  copyFileSync(join(ROOT, "app", "sw.js"), join(s.dir, "app", "sw.js"));   // publish the current release
  await p.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update()); await p.waitForTimeout(1500); await p.reload(); await p.waitForTimeout(600);
  const now = await p.evaluate(async () => ({ keys: (await caches.keys()).join(), ctrl: !!navigator.serviceWorker.controller }));
  assert.notEqual(now.keys, before, "the old cache was replaced"); assert.ok(now.ctrl);
  await p.goto(s.url + "missing-page"); await ctx.setOffline(true); await p.goto(s.url);
  assert.ok(await isApp(p), "offline after update"); assert.deepEqual(errors, []);
});

test("the app stays installable", { timeout: 90000 }, async (t) => {
  const s = await site(t); const dir = mkdtempSync(join(tmpdir(), "fatin-prof-")); temps.push(dir);
  const ctx = await launchPersistent(dir); t.after(() => ctx.close().catch(() => {})); await ctx.route(EXTERNAL, r => r.abort());
  const p = ctx.pages()[0] || await ctx.newPage(); await install(p, s.url);
  const cdp = await ctx.newCDPSession(p); const r = await cdp.send("Page.getInstallabilityErrors");
  assert.deepEqual(r.installabilityErrors.map(e => e.errorId), []);
  const m = await p.evaluate(async () => (await fetch("manifest.webmanifest")).json());
  assert.equal(m.display, "standalone"); assert.ok(m.icons.some(i => i.purpose === "maskable"));
});

test("offline after the first visit: the chosen language and the news still work", { timeout: 90000 }, async t => {
  const s = await site(t); const ctx = await ctxFor(t);
  await ctx.addInitScript(() => { try { localStorage.setItem("fatin-onb", "1"); localStorage.setItem("fatin-dis-asked", "1"); localStorage.setItem("fatin-profile", JSON.stringify({ n: "حسان", g: "m" })); localStorage.setItem("fatin-lang", JSON.stringify("hi")); } catch (e) {} });
  const p = await ctx.newPage(); await install(p, s.url); await p.waitForTimeout(800);
  await ctx.setOffline(true); await p.goto(s.url); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => ({ hi: !!(TR2.hi && i18nHas("hi")), sub: $("bar-sub").textContent, newsFromFile: NEWS_UPDATED }));
  assert.ok(r.hi, "Hindi pack served from the cache"); assert.doesNotMatch(r.sub, /[؀-ۿ]/, "interface in Hindi: " + r.sub);
  const news = JSON.parse(readFileSync(join(ROOT, "app", "news.json"), "utf8"));
  assert.equal(r.newsFromFile, news.updated, "the bulletin's last copy is available offline");
});

test("the cache only ever holds this site's successful responses", { timeout: 90000 }, async t => {
  const s = await site(t); const ctx = await ctxFor(t); const p = await ctx.newPage(); await install(p, s.url);
  await p.goto(s.url + "no-such-file.js").catch(() => {}); await p.evaluate(() => fetch("no-such.json").catch(() => {}));
  await p.goto(s.url); await p.waitForTimeout(500);
  const urls = await p.evaluate(async () => { const out = []; for (const k of await caches.keys()) for (const r of await (await caches.open(k)).keys()) out.push(r.url); return out; });
  assert.ok(urls.length >= 8);
  assert.ok(urls.every(u => u.startsWith(s.srv.url)), "same origin only");
  assert.ok(!urls.some(u => /no-such/.test(u)), "no failed responses");
});

test("the cache name is a hash of what the app serves", () => {
  const sw = readFileSync(join(ROOT, "app", "sw.js"), "utf8");
  const m = sw.match(/const CACHE = "fatin-([0-9a-f]{12})";/); assert.ok(m, "versioned cache name");
  assert.doesNotMatch(sw, /@@VERSION@@/);
  assert.match(sw, /if \(url\.origin !== location\.origin\) return;/, "nothing from other sites is cached");
});
