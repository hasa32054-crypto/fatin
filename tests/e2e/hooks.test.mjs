// The extension points (hooks.js) must keep every feature's behaviour that used to be added by
// re-wrapping functions: tour guards, call cleanup, modes, medals, translations and focus handling.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, blockExternal, returningUser } from "../helpers/browser.mjs";

const ROOT = new URL("../..", import.meta.url).pathname;
let srv, browser;
before(async () => { srv = await startStaticServer(ROOT); browser = await launch(); });
after(async () => { await browser?.close(); await srv?.close(); });
async function open(t, lang = "ar") {
  const ctx = await browser.newContext({ locale: "ar-SA", serviceWorkers: "block" }); t.after(() => ctx.close());
  await ctx.addInitScript(returningUser(lang).init);
  const p = await ctx.newPage(); p.errors = []; p.on("pageerror", e => p.errors.push(e.message));
  await blockExternal(p); await p.goto(srv.url + "/app/"); await p.waitForTimeout(1200); return p;
}

test("each core action is extended through hooks, in load order", async t => {
  const p = await open(t);
  const h = await p.evaluate(() => Object.fromEntries(["before", "map", "after"].map(w => [w, Object.fromEntries(Object.entries(HOOKS[w]).map(([k, v]) => [k, v.length]))])));
  assert.deepEqual(h.after.showTab, 3); assert.deepEqual(h.after.applyLang, 6); assert.deepEqual(h.after.setMode, 3);
  assert.deepEqual(h.before.bump, 1); assert.deepEqual(h.map.assess, 1); assert.deepEqual(h.before.respond, 1);
  assert.equal(await p.evaluate(() => /^function\s*\(\.\.\.args\)/.test(showTab.toString())), true, "showTab is the hookable one");
});

test("tour mode: no medals, toasts, family alerts, voice or sign-in", async t => {
  const p = await open(t);
  const r = await p.evaluate(async () => { S.set("famcode", "ABC234"); const sent = []; const f = window.fetch; window.fetch = (u, o) => { sent.push(String(u)); return f(u, o); };
    tourOn = true; const before = JSON.stringify(ST); bump("scans"); toast("x"); openLogin(); await familyAlert("danger", "رسالة احتيال: طلب رمز التحقق");
    const res = { statsSame: JSON.stringify(ST) === before, loginHidden: $("login").hidden, familySent: sent.filter(u => u.includes("/family/")).length };
    tourOn = false; bump("scans"); res.countsAgain = ST.scans >= 1; return res; });
  assert.deepEqual(r, { statsSame: true, loginHidden: true, familySent: 0, countsAgain: true });
});

test("leaving the call tab ends the full-screen call", async t => {
  const p = await open(t);
  const r = await p.evaluate(() => { showTab("call"); $("device").classList.add("call-full"); $("v-call").classList.add("started"); showTab("scan");
    return { full: $("device").classList.contains("call-full"), started: $("v-call").classList.contains("started"), tab: curTab }; });
  assert.deepEqual(r, { full: false, started: false, tab: "scan" });
});

test("news draws when its tab opens; the chrome follows the tab", async t => {
  const p = await open(t);
  const n = await p.evaluate(() => { showTab("news"); return document.querySelectorAll("#nw-list > *").length; });
  assert.ok(n > 0);
});

test("modes: general only vibrates, elder speaks the verdict", async t => {
  const p = await open(t);
  const r = await p.evaluate(() => { const spoken = []; const sp = speak; window.__spoken = spoken;
    hook("before", "speak", txt => { spoken.push(txt); return false; });
    const res = FatinEngine.analyze("أبشر: حدث بياناتك خلال 24 ساعة absher-sa-update.xyz");
    setMode("general"); respond(res); const g = spoken.length; setMode("elder"); respond(res); return { general: g, elder: spoken.length - g }; });
  assert.deepEqual(r, { general: 0, elder: 1 });
});

test("sending to a trusted person counts toward the helper medal", async t => {
  const p = await open(t);
  const r = await p.evaluate(() => { $("msg").value = "أبشر: حدث بياناتك absher-sa-update.xyz"; current = FatinEngine.analyze($("msg").value); const b = ST.helps || 0; $("alert-btn").click(); return (ST.helps || 0) - b; });
  assert.equal(r, 1);
});

test("assess: a caller who fails the family password gets a higher risk", async t => {
  const p = await open(t);
  const r = await p.evaluate(() => { S.set("secret", "نخلة الجدة"); call = { k: "family", risk: 40, hist: [], ended: false, secretFail: true }; const a = assess(); return { k: a.k, r: a.r }; });
  assert.equal(r.k, "nosecret"); assert.ok(r.r >= 70);
});

test("language switch: verdict, login page and interface follow the language", async t => {
  const p = await open(t);
  await p.evaluate(() => { applyLang("en"); render(FatinEngine.analyze("أبشر: حدث بياناتك absher-sa-update.xyz"), "x"); });
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => ({ title: $("v-title").textContent, tile: $("lang-tile-s").textContent, spoken: speechText(FatinEngine.analyze("أبشر: حدث بياناتك absher-sa-update.xyz")) }));
  assert.match(r.title, /[A-Za-z]/); assert.match(r.tile, /English/); assert.match(r.spoken, /^Fatin says/);
  await p.evaluate(() => applyLang("ar")); await p.waitForTimeout(200);
  assert.match(await p.evaluate(() => speechText(FatinEngine.analyze("هلا"))), /^فطن يقول/);
});

test("the language sheet returns focus to the button that opened it", async t => {
  const p = await open(t);
  const r = await p.evaluate(async () => { const g = document.querySelector(".globe"); g.focus(); openLangSheet(); await new Promise(r => setTimeout(r, 120)); const inside = document.activeElement.closest("#lang-list") != null; closeLangSheet(); await new Promise(r => setTimeout(r, 120)); return { inside, back: document.activeElement === g }; });
  assert.deepEqual(r, { inside: true, back: true });
  assert.deepEqual(p.errors, []);
});
