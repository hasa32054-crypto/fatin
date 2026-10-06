// Web security of the served pages: a strict Content-Security-Policy that breaks nothing, no third-party
// requests (fonts and libraries are self-hosted), no inline event handlers, and the QR library loads lazily.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, returningUser } from "../helpers/browser.mjs";
import { workerHarness } from "../helpers/worker-harness.mjs";

const ROOT = new URL("../..", import.meta.url).pathname;
let srv, browser;
before(async () => { srv = await startStaticServer(ROOT); browser = await launch(); });
after(async () => { await browser?.close(); await srv?.close(); });

async function watched(t, path, { lang = "ar", viewport = { width: 390, height: 844 } } = {}) {
  const ctx = await browser.newContext({ locale: "ar-SA", viewport, serviceWorkers: "block" }); t.after(() => ctx.close());
  await ctx.addInitScript(returningUser(lang).init);
  await ctx.addInitScript(() => { window.__csp = []; document.addEventListener("securitypolicyviolation", e => window.__csp.push(e.violatedDirective + " " + e.blockedURI)); });
  const p = await ctx.newPage(); const h = await workerHarness(); await h.attach(p);
  const hosts = new Set(), cspConsole = [], errors = [];
  p.on("request", r => { const u = new URL(r.url()); if (!["data:", "blob:"].includes(u.protocol)) hosts.add(u.origin); });
  p.on("console", m => { if (/Content Security Policy/i.test(m.text())) cspConsole.push(m.text().slice(0, 200)); });
  p.on("pageerror", e => errors.push(e.message));
  await p.goto(srv.url + path); await p.waitForTimeout(1500);
  return { p, hosts, cspConsole, errors };
}
const allowed = o => o === srv.url || o === "https://fatin.hasa32054.workers.dev";

test("app: the main flows run under the policy with no violations and no third-party hosts", async t => {
  const w = await watched(t, "/app/");
  await w.p.evaluate(async () => {
    $("msg").value = "أبشر: حدث بياناتك خلال 24 ساعة absher-sa-update.xyz"; await run();
    showTab("news"); showTab("train"); showTab("more"); showTab("ask"); await askFatin("وش أسوي لو وصلني رمز؟");
    await cloudAudio(SCEN.bank.open, "caller");
    await loadJsQR();                       // QR reading library (self-hosted)
    applyLang("hi"); await i18nLoad("hi"); applyLang("ar");
  });
  await w.p.waitForTimeout(500);
  assert.deepEqual(await w.p.evaluate(() => window.__csp), []);
  assert.deepEqual(w.cspConsole, []); assert.deepEqual(w.errors, []);
  assert.deepEqual([...w.hosts].filter(o => !allowed(o)), [], "only this site and the Fatin server");
  assert.equal(await w.p.evaluate(() => typeof window.jsQR), "function");
});

test("app: the QR-drawing library loads only where its QR code is shown", async t => {
  const phone = await watched(t, "/app/");
  assert.equal(await phone.p.evaluate(() => typeof window.QRCode), "undefined", "not on a phone");
  const desk = await watched(t, "/app/", { viewport: { width: 1440, height: 900 } });
  await desk.p.waitForTimeout(800);
  assert.equal(await desk.p.evaluate(() => typeof window.QRCode), "function", "loaded on a wide screen");
  assert.ok(await desk.p.evaluate(() => !!document.querySelector("#qr img, #qr canvas")), "QR code drawn");
  assert.deepEqual(await desk.p.evaluate(() => window.__csp), []);
});

test("landing page: policy holds, QR drawn, no third-party hosts", async t => {
  const w = await watched(t, "/", { viewport: { width: 1280, height: 900 } });
  assert.deepEqual(await w.p.evaluate(() => window.__csp), []); assert.deepEqual(w.cspConsole, []); assert.deepEqual(w.errors, []);
  assert.deepEqual([...w.hosts].filter(o => !allowed(o)), []);
  assert.ok(await w.p.evaluate(() => !!document.querySelector("#qr-app img, #qr-app canvas")));
});

test("both pages declare a strict policy and no-referrer; no inline handlers or javascript: URLs", () => {
  for (const page of ["app/index.html", "index.html"]) {
    const html = readFileSync(ROOT + page, "utf8");
    const policy = (html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)">/) || [])[1] || "";
    assert.match(policy, /script-src 'self'( 'sha256-[A-Za-z0-9+/=]+')+;/, page + " script-src");
    assert.doesNotMatch(policy, /unsafe-eval|'unsafe-inline'[^;]*;\s*style|script-src[^;]*unsafe-inline/, page);
    assert.match(policy, /object-src 'none'/); assert.match(policy, /base-uri 'self'/);
    assert.match(html, /<meta name="referrer" content="no-referrer">/);
    assert.doesNotMatch(html, /\son[a-z]+="/i, page + " inline event handler");
    assert.doesNotMatch(html, /href="javascript:/i);
    assert.doesNotMatch(html, /googleapis|gstatic|cdnjs|jsdelivr/, page + " third-party asset");
  }
});
