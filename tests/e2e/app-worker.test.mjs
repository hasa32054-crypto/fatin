// End to end: the real app in Chromium talking to the real worker code (server/worker.js) with
// in-memory Cloudflare bindings. Covers the AI tasks, radar, family board, voice cache flags and QR.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, blockExternal, returningUser } from "../helpers/browser.mjs";
import { workerHarness } from "../helpers/worker-harness.mjs";

const ROOT = new URL("../..", import.meta.url).pathname;
let srv, browser, h, page; const errors = [];

before(async () => {
  srv = await startStaticServer(ROOT); browser = await launch();
  h = await workerHarness();
  const today = Math.floor(Date.now() / 864e5);
  h.store.set("radar:days", JSON.stringify({ [today]: { otp: 3, "imp:أبشر": 2 } }));
  const ctx = await browser.newContext({ locale: "ar-SA", viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  await ctx.addInitScript(returningUser("ar").init);
  page = await ctx.newPage(); page.on("pageerror", e => errors.push(e.message));
  await page.route(/googleapis|gstatic|cdnjs|jsdelivr/, r => r.abort());
  await h.attach(page);
  await page.goto(srv.url + "/app/"); await page.waitForTimeout(2500);
});
after(async () => { await browser?.close(); await srv?.close(); });

test("radar shows the server's aggregated counts", async () => {
  const rows = await page.evaluate(() => [...document.querySelectorAll("#radar-list .rrow")].map(r => r.querySelector("b").textContent + "=" + r.querySelector("em").textContent));
  assert.ok(rows.includes("طلب رمز التحقق=3") && rows.includes("انتحال «أبشر»=2"), String(rows));
  assert.equal(h.seen.filter(s => s.path === "/radar").length, 1, "radar fetched once at start");
});

test("scan: two layers, sent as a server task (no prompt, no raw messages)", async () => {
  await page.evaluate(async () => { $("msg").value = "البنك: تم إيقاف بطاقتك، أرسل الرمز الآن على 0551234567"; await run(); });
  const s = h.last("/ai");
  assert.equal(s.body.task, "scan"); assert.equal(s.body.messages, undefined); assert.equal(s.status, 200);
  assert.equal(await page.textContent("#ai-note"), "✓ تم الفحص بطبقتين");
});

test("radar report posts a known pattern and the count refreshes at once", async () => {
  await page.evaluate(() => $("radar-add").click()); await page.waitForTimeout(1200);
  const s = h.last("/radar"); assert.equal(s.status, 200); assert.equal(s.body.p, "otp");
  assert.equal(await page.evaluate(() => radarMap.otp && radarMap.otp.n), 4);
});

test("Ask Fatin goes through the server task", async () => {
  await page.evaluate(() => askFatin("كيف أعرف الرسالة المزيفة؟")); await page.waitForTimeout(800);
  const s = h.last("/ai"); assert.equal(s.body.task, "ask"); assert.equal(s.body.history.at(-1).role, "user"); assert.equal(s.status, 200);
  assert.ok((await page.textContent("#ask-chat")).includes("لا تعطِ"));
});

test("simulator and call characters reply through the server", async () => {
  const sim = await page.evaluate(() => roleLine(st => SIM_AI(scn("bank"), [{ role: "assistant", content: "هلا" }, { role: "user", content: "مين معي؟" }], st), false, st => ({ task: "sim", scenario: "bank", turns: [{ role: "assistant", content: "هلا" }, { role: "user", content: "مين معي؟" }], strict: st, lang: curLang() })));
  assert.ok(sim && sim.reply.includes("عطني الرمز") && sim.outcome === "continue"); assert.equal(h.last("/ai").body.task, "sim");
  const cl = await page.evaluate(() => roleLine(st => CALL_AI(CALLS.bank, [{ who: "caller", t: "السلام عليكم" }, { who: "me", t: "مين؟" }], st, false), true, st => ({ task: "call", call: "bank", hist: [{ who: "caller", t: "السلام عليكم" }, { who: "me", t: "مين؟" }], strict: st, accused: false })));
  assert.ok(cl && cl.reply.includes("عطني الرمز")); assert.equal(h.last("/ai").body.task, "call");
});

test("family alert is accepted and stored unchanged", async () => {
  await page.evaluate(async () => { S.set("famcode", "ABC234"); await familyAlert("danger", "رسالة احتيال: طلب رمز التحقق"); });
  assert.equal(h.last("/family/ABC234").status, 200);
});

test("voice: only scripted lines ask to be cached", async () => {
  await page.evaluate(async () => { await cloudAudio(SCEN.bank.open, "caller"); await cloudAudio("أهلًا حسان، هذا جواب من الذكاء الاصطناعي", "fatin"); });
  const tts = h.seen.filter(x => x.path === "/tts" && x.method === "POST");
  assert.equal(tts.length, 2); assert.equal(tts[0].body.cache, true); assert.equal(tts[1].body.cache, undefined);
  assert.ok(tts.every(t => t.status === 200));
});

test("QR: a safe link has no one-tap open; the domain and advice are shown", async () => {
  await page.evaluate(() => showQR({ data: "https://www.absher.sa/portal", res: { level: "safe", score: 0, reasons: ["ما لقيت علامات احتيال واضحة."], ids: [] } })); await page.waitForTimeout(400);
  const qr = await page.evaluate(() => ({ links: document.querySelectorAll("#qrm-acts a").length, why: $("qrm-why").textContent }));
  assert.equal(qr.links, 0); assert.ok(qr.why.includes("absher.sa") && qr.why.includes("اكتب عنوان الموقع الرسمي"), qr.why);
  await page.evaluate(() => hideQR());
});

test("no worker 5xx and no page errors", () => {
  assert.deepEqual(h.seen.filter(x => x.status >= 500), []);
  assert.deepEqual(errors, []);
});
