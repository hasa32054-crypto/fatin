// Privacy: what leaves the phone, what is masked, and the switches that keep everything on the phone.
// Every check looks at the real requests the app makes to the (in-process) Fatin worker.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, returningUser } from "../helpers/browser.mjs";
import { workerHarness } from "../helpers/worker-harness.mjs";

const ROOT = new URL("../..", import.meta.url).pathname;
let srv, browser;
before(async () => { srv = await startStaticServer(ROOT); browser = await launch(); });
after(async () => { await browser?.close(); await srv?.close(); });
async function open(t, { lang = "ar", init = "" } = {}) {
  const ctx = await browser.newContext({ locale: "ar-SA", viewport: { width: 390, height: 844 }, serviceWorkers: "block" }); t.after(() => ctx.close());
  await ctx.addInitScript(returningUser(lang).init); if (init) await ctx.addInitScript(init);
  const p = await ctx.newPage(); p.errors = []; p.on("pageerror", e => p.errors.push(e.message));
  await p.route(/googleapis|gstatic|cdnjs|jsdelivr/, r => r.abort());
  const h = await workerHarness(); await h.attach(p);
  await p.goto(srv.url + "/app/"); await p.waitForTimeout(1800);
  return { p, h, ai: () => h.seen.filter(s => s.path === "/ai"), tts: () => h.seen.filter(s => s.path === "/tts" && s.method === "POST") };
}
const OTP_MSG = "البنك: رمز التحقق الخاص بك 482913 لا تشاركه. حدّث بياناتك الآن: bank-sa-verify.top";

test("a message with a code stays on the phone; sending it is the person's choice, masked", async t => {
  const { p, ai } = await open(t);
  await p.evaluate(async m => { $("msg").value = m; await run(); }, OTP_MSG);
  assert.equal(ai().length, 0, "nothing sent automatically");
  assert.equal(await p.evaluate(() => !$("priv-note").hidden), true);
  assert.match(await p.textContent("#priv-note-t"), /فحصناها في جوالك فقط/);
  const scans = await p.evaluate(() => ST.scans);
  await p.click("#priv-send"); await p.waitForTimeout(600);
  assert.equal(ai().length, 1);
  const sent = ai()[0].body.text;
  assert.ok(sent.includes("[رمز]") && !sent.includes("482913"), sent);
  assert.ok(sent.includes("bank-sa-verify.top"), "the link the AI needs is kept");
  assert.equal(await p.evaluate(() => ST.scans), scans, "the scan is not counted twice");
  assert.equal(await p.textContent("#ai-note"), "✓ تم الفحص بطبقتين");
  assert.deepEqual(p.errors, []);
});

test("an ordinary message is checked by the AI as before", async t => {
  const { p, ai } = await open(t);
  await p.evaluate(async () => { $("msg").value = "أبشر: تم تعليق خدماتك، حدّث بياناتك خلال 24 ساعة: absher-sa-update.xyz"; await run(); });
  assert.equal(ai().length, 1); assert.equal(ai()[0].body.text, "أبشر: تم تعليق خدماتك، حدّث بياناتك خلال 24 ساعة: absher-sa-update.xyz");
  assert.equal(await p.evaluate(() => $("priv-note").hidden), true);
});

test("cloud AI off: scan, photo, Ask Fatin and the simulator send nothing", async t => {
  const { p, ai } = await open(t);
  await p.evaluate(() => { showTab("settings"); $("cloud-ai").click(); });
  assert.equal(await p.evaluate(() => S.get("cloud-ai", true)), false);
  await p.evaluate(async () => { $("msg").value = "أبشر: حدث بياناتك absher-sa-update.xyz"; await run(); });
  assert.equal(await p.evaluate(() => current.level), "danger", "the on-phone verdict still works");
  assert.equal(await p.evaluate(() => $("photo-wrap").hidden), true);
  await p.evaluate(() => askFatin("كيف أعرف المحتال؟")); await p.waitForTimeout(700);
  assert.ok((await p.textContent("#ask-chat")).length > 20, "Ask Fatin answers from its own knowledge");
  await p.evaluate(() => { showTab("sim"); startSim("bank"); }); await p.waitForFunction(() => !simBusy && simTurns.length > 0);
  await p.evaluate(async () => { await userSays("مين معي؟"); }); await p.waitForTimeout(900);
  assert.ok(await p.evaluate(() => simTurns.filter(t => t.role === "assistant").length >= 2), "the simulator replied from its own script");
  assert.equal(ai().length, 0);
});

test("Ask Fatin and the simulator mask codes and card numbers before sending", async t => {
  const { p, ai } = await open(t);
  await p.evaluate(() => askFatin("وصلني رقم بطاقتي 4111 1111 1111 1111 في رسالة، وش أسوي؟")); await p.waitForTimeout(700);
  assert.match(await p.textContent("#ask-chat"), /لا تكتب رموزك أو أرقام بطاقتك/);
  const ask = ai().at(-1).body; assert.equal(ask.task, "ask");
  assert.ok(ask.history.at(-1).content.includes("[رقم بطاقة]") && !JSON.stringify(ask).includes("4111"), JSON.stringify(ask.history));
  // giving a code ends the round on the phone ("you gave your code"): nothing is sent
  await p.evaluate(() => { showTab("sim"); startSim("bank"); }); await p.waitForFunction(() => !simBusy && simTurns.length > 0);
  await p.evaluate(async () => { await userSays("تفضل الرمز: 4821"); }); await p.waitForTimeout(900);
  assert.equal(ai().filter(x => x.body.task === "sim").length, 0);
  // a password (no digits) does go to the character, masked
  await p.evaluate(() => { startSim("ship"); }); await p.waitForFunction(() => !simBusy && simTurns.length > 0);
  await p.evaluate(async () => { await userSays("كلمة المرور: Saqr@Home وش تبي فيها؟"); }); await p.waitForTimeout(900);
  const sims = ai().filter(x => x.body.task === "sim");
  assert.ok(sims.length >= 1, "the simulator asked the AI");
  const body = JSON.stringify(sims.at(-1).body);
  assert.ok(!body.includes("Saqr@Home") && body.includes("[كلمة مرور]"), body.slice(0, 300));
});

test("voice: the natural-voice switch and sensitive lines", async t => {
  const { p, tts } = await open(t);
  await p.evaluate(async () => { await cloudAudio("رمز التحقق 482913", "fatin"); });
  assert.equal(tts().length, 0, "a line with a code is never sent to the voice service");
  await p.evaluate(async () => { await cloudAudio(SCEN.bank.open, "caller"); });
  assert.equal(tts().length, 1);
  await p.evaluate(() => { showTab("settings"); $("cloud-voice").click(); });
  await p.evaluate(async () => { await cloudAudio(SCEN.ship.open, "caller"); });
  assert.equal(tts().length, 1, "voice off: nothing sent");
  assert.equal(await p.evaluate(() => useServerSTT()), false, "and no cloud speech-to-text");
});

test("the privacy sheet opens from Settings, closes with Escape and returns focus; it is translated", async t => {
  for (const lang of ["ar", "en", "hi"]) {
    const { p } = await open(t, { lang });
    await p.evaluate(() => showTab("settings")); await p.waitForTimeout(400);
    await p.focus("#priv-open"); await p.click("#priv-open"); await p.waitForTimeout(250);
    assert.equal(await p.evaluate(() => $("priv-sheet").classList.contains("on")), true);
    const h = (await p.textContent("#priv-h")).trim();
    if (lang === "ar") assert.match(h, /خصوصيتك في فطن/); else assert.doesNotMatch(h, /[؀-ۿ]/, lang + ": " + h);
    await p.keyboard.press("Escape"); await p.waitForTimeout(200);
    assert.equal(await p.evaluate(() => $("priv-sheet").classList.contains("on")), false);
    assert.equal(await p.evaluate(() => document.activeElement.id), "priv-open");
  }
});

test("an AI key typed on the phone lives for the session only; an old saved key is removed", async t => {
  const { p } = await open(t, { init: `try{ localStorage.setItem("fatin-ai-key","sk-ant-old-saved-key-0000000000000000"); }catch(e){}` });
  assert.equal(await p.evaluate(() => localStorage.getItem("fatin-ai-key")), null);
  await p.evaluate(() => sessionStorage.setItem("fatin-ai-key", "sk-ant-test"));
  assert.equal(await p.evaluate(() => ownKey()), "sk-ant-test");
  assert.equal(await p.evaluate(() => localStorage.getItem("fatin-ai-key")), null);
});
