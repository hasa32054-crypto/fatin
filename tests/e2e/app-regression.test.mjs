// Behaviour that must never break: every view in every language, the offline/fallback paths,
// the in-Claude AI path, and phone/desktop layout.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, blockExternal, returningUser } from "../helpers/browser.mjs";

const ROOT = new URL("../..", import.meta.url).pathname;
const LANGS = ["ar", "en", "ur", "hi", "bn", "tl", "id", "zh", "es", "fr"];
const VIEWS = ["scan", "sim", "call", "train", "more", "pats", "ask", "report", "family", "badges", "news", "settings"];
let srv, browser;
before(async () => { srv = await startStaticServer(ROOT); browser = await launch(); });
after(async () => { await browser?.close(); await srv?.close(); });

async function open(lang, opts = {}) {
  const ctx = await browser.newContext({ locale: "ar-SA", viewport: { width: 390, height: 844 }, serviceWorkers: "block", ...opts });
  await ctx.addInitScript(returningUser(lang).init);
  const p = await ctx.newPage(); p.errors = []; p.on("pageerror", e => p.errors.push(e.message));
  await blockExternal(p); await p.goto(srv.url + "/app/"); await p.waitForTimeout(1500);
  return p;
}

for (const lang of LANGS) test("every view renders without errors: " + lang, async () => {
  const p = await open(lang);
  assert.equal(await p.evaluate(() => lang), lang);
  assert.equal(await p.evaluate(() => $("device").dir), lang === "ar" || lang === "ur" ? "rtl" : "ltr");
  for (const v of VIEWS) {
    await p.evaluate(v => showTab(v), v); await p.waitForTimeout(150);
    const txt = await p.evaluate(v => { const el = document.getElementById(VIEWS[v]); return el && !el.hidden ? el.innerText.trim().length : 0; }, v);
    assert.ok(txt > 20, `${lang}/${v} shows content (${txt} chars)`);
  }
  assert.deepEqual(p.errors, []);
  await p.context().close();
});

test("server unreachable: the scan still gives the on-phone verdict", async () => {
  const p = await open("ar");
  const r = await p.evaluate(async () => { $("msg").value = "أبشر: حدث بياناتك خلال 24 ساعة absher-sa-update.xyz"; await run(); return { lvl: current.level, note: $("ai-note").textContent }; });
  assert.equal(r.lvl, "danger");
  assert.deepEqual(p.errors, []);
  await p.context().close();
});

test("in-Claude AI path gets the app's own prompts and no server task data", async () => {
  const p = await open("ar");
  const calls = await p.evaluate(async () => { const calls = []; const f = async (input, opts) => { calls.push(opts); return { text: "x" }; };
    f.json = async (input, opts) => { calls.push(Object.assign({ prompt: String(input).slice(0, 12) }, opts)); return { level: "danger", score: 80, reasons: ["r"] }; };
    sample = f; await run(); await roleLine(s => "p", false, s => ({ task: "sim" })); return calls; });
  assert.ok(calls.length >= 2);
  assert.ok(calls.every(c => !("task" in c)), JSON.stringify(calls));
  assert.ok(calls[0].prompt.startsWith("أنت \"فطن\""));
  await p.context().close();
});

for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1280, 800]]) test(`no horizontal page overflow at ${w}px`, async () => {
  const p = await open("ar", { viewport: { width: w, height: h } });
  for (const v of ["scan", "train", "more", "news", "family"]) {
    await p.evaluate(v => showTab(v), v); await p.waitForTimeout(120);
    const o = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
    assert.ok(o.sw <= o.iw, `${v} at ${w}px: scrollWidth ${o.sw} > ${o.iw}`);
  }
  await p.context().close();
});
