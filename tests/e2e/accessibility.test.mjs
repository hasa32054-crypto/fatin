// Accessibility: dialogs work from the keyboard, the page language follows the chosen language,
// no interface text is left in Arabic for other languages, text is at least 12px and colours meet WCAG AA.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, blockExternal, returningUser } from "../helpers/browser.mjs";
import { contrastScan, arabicScan } from "../helpers/a11y.mjs";

const ROOT = new URL("../..", import.meta.url).pathname;
const VIEWS = ["scan", "sim", "call", "train", "more", "pats", "ask", "report", "family", "badges", "news", "settings"];
// Arabic that stays Arabic in every language: the user's name and the brand names the app quotes
const NAMES = new Set(["حسان", "أبشر", "فطن"]);
let srv, browser;
before(async () => { srv = await startStaticServer(ROOT); browser = await launch(); });
after(async () => { await browser?.close(); await srv?.close(); });

async function open(lang, opts = {}) {
  const ctx = await browser.newContext({ locale: "ar-SA", viewport: { width: 390, height: 844 }, serviceWorkers: "block", ...opts });
  await ctx.addInitScript(returningUser(lang).init);
  const p = await ctx.newPage(); p.errors = []; p.on("pageerror", e => p.errors.push(e.message));
  await blockExternal(p); await p.goto(srv.url + "/app/"); await p.waitForTimeout(1600);
  return p;
}
const inside = (p, id) => p.evaluate(id => document.getElementById(id).contains(document.activeElement), id);
const active = p => p.evaluate(() => { const a = document.activeElement; return a ? a.id || a.className || a.tagName : null; });

test("dialogs: focus moves in, Tab stays inside, Escape closes, focus returns", async () => {
  const p = await open("ar");
  await p.evaluate(() => showTab("scan"));
  // the panic screen ("انخدعت؟"), opened from its button
  await p.focus("#panic-btn"); await p.keyboard.press("Enter"); await p.waitForTimeout(400);
  assert.equal(await p.evaluate(() => $("panic").hidden), false);
  assert.ok(await inside(p, "panic"), "focus moved into the panic screen, got " + await active(p));
  for (let i = 0; i < 25; i++) { await p.keyboard.press(i % 5 === 4 ? "Shift+Tab" : "Tab"); assert.ok(await inside(p, "panic"), "Tab left the panic screen at step " + i + ": " + await active(p)); }
  await p.keyboard.press("Escape"); await p.waitForTimeout(500);
  assert.equal(await p.evaluate(() => $("panic").hidden), true, "Escape closes the panic screen");
  assert.equal(await p.evaluate(() => document.activeElement.id), "panic-btn", "focus returns to the button that opened it");

  // the language sheet
  await p.evaluate(() => showTab("settings")); await p.waitForTimeout(300);
  await p.focus("#lang-field .lang-cur"); await p.keyboard.press("Enter"); await p.waitForTimeout(400);
  assert.ok(await inside(p, "lang-sheet"));
  for (let i = 0; i < 15; i++) { await p.keyboard.press("Tab"); assert.ok(await inside(p, "lang-sheet"), "Tab left the language sheet: " + await active(p)); }
  await p.keyboard.press("Escape"); await p.waitForTimeout(400);
  assert.equal(await p.evaluate(() => $("lang-sheet").classList.contains("on")), false);
  assert.ok(await p.evaluate(() => document.activeElement.classList.contains("lang-cur")), "focus returns to the language button");

  // the classroom screen
  await p.evaluate(() => { $("panic-btn").focus(); openClass(); }); await p.waitForTimeout(400);
  assert.ok(await inside(p, "class"));
  for (let i = 0; i < 10; i++) { await p.keyboard.press("Tab"); assert.ok(await inside(p, "class")); }
  await p.keyboard.press("Escape"); await p.waitForTimeout(500);
  assert.equal(await p.evaluate(() => $("class").hidden), true);

  // every modal overlay is announced as a dialog with a name
  const named = await p.evaluate(() => ["panic", "login", "onb", "class", "qrm-card", "share-ov", "tour-end", "lang-sheet", "priv-sheet", "sheet", "qs"].map(id => {
    const e = $(id); const lab = e.getAttribute("aria-labelledby"); return [id, /dialog/.test(e.getAttribute("role")) && e.getAttribute("aria-modal") === "true" && !!(e.getAttribute("aria-label") || (lab && $(lab)))]; }));
  for (const [id, ok] of named) assert.ok(ok, id + " is a named modal dialog");
  assert.deepEqual(p.errors, []);
  await p.context().close();
});

test("tour end screen: Escape continues into the app", async () => {
  const p = await open("en");
  await p.evaluate(() => { $("tour-end").hidden = false; $("te-try").focus(); }); await p.waitForTimeout(200);
  await p.keyboard.press("Escape"); await p.waitForTimeout(300);
  assert.equal(await p.evaluate(() => $("tour-end").hidden), true);
  await p.context().close();
});

test("sign-in: focus stays inside until the user is signed in", async () => {
  const ctx = await browser.newContext({ locale: "ar-SA", viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  const p = await ctx.newPage(); await blockExternal(p); await p.goto(srv.url + "/app/"); await p.waitForTimeout(2500);
  await p.evaluate(() => { if ($("login").hidden) openLogin(); }); await p.waitForTimeout(500);
  assert.equal(await p.evaluate(() => document.activeElement.id), "li-name", "the name field is ready to type in");
  for (let i = 0; i < 20; i++) { await p.keyboard.press("Tab"); assert.ok(await inside(p, "login"), "Tab left sign-in: " + await active(p)); }
  await ctx.close();
});

test("the page language follows the chosen language", async () => {
  const p = await open("fr");
  assert.equal(await p.evaluate(() => document.documentElement.lang), "fr");
  await p.evaluate(() => applyLang("ar")); assert.equal(await p.evaluate(() => document.documentElement.lang), "ar");
  // the layout keeps its own direction on #device; the page itself stays as built
  assert.equal(await p.evaluate(() => $("device").getAttribute("dir")), "rtl");
  await p.context().close();
});

for (const lang of ["en", "hi", "bn", "tl", "id", "zh", "es", "fr"]) test("no Arabic interface text left: " + lang, async () => {
  const p = await open(lang);
  const left = [];
  for (const v of VIEWS) { await p.evaluate(v => showTab(v), v); await p.waitForTimeout(250); for (const t of await p.evaluate(arabicScan, ["view"])) left.push(v + ": " + t); }
  for (const [o, fn] of [["panic", "openPanic()"], ["onb", "openOnb()"], ["login", "openLogin()"]]) {
    await p.evaluate(fn => eval(fn), fn); await p.waitForTimeout(400);
    for (const t of await p.evaluate(arabicScan, ["#" + o])) left.push(o + ": " + t);
    await p.evaluate(o => { $(o).hidden = true; }, o);
  }
  // only names may remain, inside translated sentences
  const bad = left.filter(x => (x.split(": ").slice(1).join(": ").match(/[؀-ۿ]+/g) || []).some(w => !NAMES.has(w)));
  assert.deepEqual(bad, []);
  assert.deepEqual(p.errors, []);
  await p.context().close();
});

for (const lang of ["ar", "en"]) test("text is at least 12px and meets WCAG AA contrast: " + lang, async () => {
  const p = await open(lang);
  for (const v of VIEWS) {
    await p.evaluate(v => showTab(v), v); await p.waitForTimeout(600);   // after the tab colour transition (.3s)
    assert.deepEqual(await p.evaluate(contrastScan), [], v + ": contrast");
    const small = await p.evaluate(() => { const out = []; const w = document.createTreeWalker(document.getElementById("device"), NodeFilter.SHOW_TEXT); let n;
      while ((n = w.nextNode())) { const e = n.parentElement; if (!n.nodeValue.trim() || !e || e.closest("[hidden],[aria-hidden=true],.dot,.av") || !e.getBoundingClientRect().width) continue;
        const px = parseFloat(getComputedStyle(e).fontSize); if (px < 12) out.push(px + "px " + n.nodeValue.trim().slice(0, 30)); }
      return [...new Set(out)]; });
    assert.deepEqual(small, [], v + ": text smaller than 12px");
  }
  await p.context().close();
});
