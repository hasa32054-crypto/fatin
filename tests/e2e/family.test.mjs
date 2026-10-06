// The family board as a safety feature: only the phone that owns a code can post alerts to it,
// relatives read with the code alone, old codes keep working, and alerts are never lost.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, returningUser } from "../helpers/browser.mjs";
import { workerHarness } from "../helpers/worker-harness.mjs";

const ROOT = new URL("../..", import.meta.url).pathname;
const LANGS = ["ar", "en", "ur", "hi", "bn", "tl", "id", "zh", "es", "fr"];
let srv, browser, phones = 0;
before(async () => { srv = await startStaticServer(ROOT); browser = await launch(); });
after(async () => { await browser?.close(); await srv?.close(); });
async function phone(t, h, { lang = "ar", init = "" } = {}) {
  const ctx = await browser.newContext({ locale: "ar-SA", serviceWorkers: "block" }); t.after(() => ctx.close());
  await ctx.addInitScript(returningUser(lang).init); if (init) await ctx.addInitScript(init);
  const p = await ctx.newPage(); p.errors = []; p.on("pageerror", e => p.errors.push(e.message));
  await p.route(/googleapis|gstatic|cdnjs|jsdelivr/, r => r.abort()); await h.attach(p, undefined, { ip: "10.1." + (++phones) + ".1" });
  await p.goto(srv.url + "/app/"); await p.waitForFunction(() => typeof db !== "undefined" && db && db.remote, null, { timeout: 8000 });
  return p;
}
const direct = (h, path, body, ip = "66.0.0.1") => h.fetch(new Request("https://w" + path, { method: body ? "POST" : "GET", headers: { Origin: "http://localhost", "content-type": "application/json", "CF-Connecting-IP": ip }, body: body && JSON.stringify(body) }));

test("creating a code registers this phone as its owner; its alerts arrive, a stranger's are refused", async t => {
  const h = await workerHarness(); const p = await phone(t, h);
  await p.evaluate(async () => { showTab("family"); await $("fam-make").onclick(); });
  const { code, key } = await p.evaluate(() => ({ code: S.get("famcode"), key: S.get("famkey") }));
  assert.match(code, /^[A-Z0-9]{6}$/); assert.ok(key.length >= 22);
  assert.equal(h.last("/family/" + code + "/claim").status, 200);
  await p.evaluate(() => familyAlert("danger", "رسالة احتيال: طلب رمز التحقق")); await p.waitForTimeout(300);
  const post = h.last("/family/" + code); assert.equal(post.status, 200); assert.equal(post.body.key, key);
  const stranger = await direct(h, "/family/" + code, { lvl: "critical", label: "ضغط «انخدعت؟» ويحتاج مساعدتك", who: "ماما" });
  assert.equal(stranger.status, 403, "someone who only knows the code cannot post");
  const list = await (await direct(h, "/family/" + code)).json();
  assert.ok(list.alerts.some(a => a.lvl === "danger" && a.label === "رسالة احتيال: طلب رمز التحقق"), "the owner's alert is there");
  assert.ok(!list.alerts.some(a => a.lvl === "critical"), "the stranger's alert is not");
  assert.doesNotMatch(JSON.stringify(list), new RegExp(key));
});

test("relatives watch with the code alone and see every alert, even two sent at once", async t => {
  const h = await workerHarness(); const owner = await phone(t, h);
  await owner.evaluate(async () => { await $("fam-make").onclick(); });
  const code = await owner.evaluate(() => S.get("famcode"));
  await owner.waitForTimeout(400);
  const before = (await (await direct(h, "/family/" + code)).json()).alerts.length;   // creating the code already sent medal alerts
  await owner.evaluate(() => progressOut("good", "أنهى اختبار الرسائل: 6 من 6")); await owner.waitForTimeout(500);   // two alerts at once
  assert.equal((await (await direct(h, "/family/" + code)).json()).alerts.length, before + 2, "both simultaneous alerts kept");
  const watcher = await phone(t, h);
  await watcher.evaluate(c => { showTab("family"); $("fam-in").value = c; $("fam-watch").click(); }, code); await watcher.waitForTimeout(800);
  const rows = await watcher.evaluate(() => [...document.querySelectorAll("#fam-list .fa, #fam-list .fa-sum")].map(e => e.innerText));
  assert.ok(rows.some(r => r.includes("أنهى اختبار الرسائل: 6 من 6")) && rows.some(r => r.includes("المستوى")), JSON.stringify(rows));
  assert.ok(h.seen.filter(s => s.path === "/family/" + code && s.method === "GET").every(s => !s.body), "watching sends no key");
});

test("a code from before sender keys: the owner's updated app takes it on its first alert", async t => {
  const h = await workerHarness();
  const p = await phone(t, h, { init: `localStorage.setItem("fatin-famcode", JSON.stringify("OLD234"));` });
  await p.evaluate(() => familyAlert("danger", "رسالة احتيال: طلب رمز التحقق")); await p.waitForTimeout(400);
  assert.ok(await p.evaluate(() => S.get("famkey", "").length >= 22));
  assert.equal(h.last("/family/OLD234").status, 200);
  assert.equal((await direct(h, "/family/OLD234", { lvl: "danger", label: "رسالة احتيال: طلب رمز التحقق" })).status, 403);
});

test("if another phone already took the code, alerts stop and the person is told to make a new code", async t => {
  const h = await workerHarness();
  await direct(h, "/family/TAK234/claim", { key: "x".repeat(30) });
  const p = await phone(t, h, { init: `localStorage.setItem("fatin-famcode", JSON.stringify("TAK234"));` });
  await p.evaluate(() => familyAlert("danger", "رسالة احتيال: طلب رمز التحقق")); await p.waitForTimeout(400);
  await p.evaluate(() => showTab("family")); await p.waitForTimeout(200);
  assert.equal(await p.evaluate(() => $("fam-claim-err").hidden), false);
  const posts = h.seen.filter(s => s.path === "/family/TAK234" && s.method === "POST").length;
  await p.evaluate(() => familyAlert("danger", "رسالة احتيال: طلب رمز التحقق")); await p.waitForTimeout(300);
  assert.equal(h.seen.filter(s => s.path === "/family/TAK234" && s.method === "POST").length, posts, "no more alerts to a code it does not own");
  await p.evaluate(async () => { await $("fam-make").onclick(); });
  assert.equal(await p.evaluate(() => $("fam-claim-err").hidden), true, "a new code clears the warning");
  assert.deepEqual(p.errors, []);
});

test("medal and progress alerts are accepted in every language", async t => {
  const h = await workerHarness();
  for (const lang of LANGS) {
    const p = await phone(t, h, { lang });
    await p.evaluate(async () => { await $("fam-make").onclick(); });
    const code = await p.evaluate(() => S.get("famcode"));
    await p.waitForTimeout(400); const n0 = h.seen.length;
    await p.evaluate(() => progressOut("good", "حصل على وسام «" + md(BADGES[3])[0] + "»")); await p.waitForTimeout(400);
    const posts = h.seen.slice(n0).filter(s => s.path === "/family/" + code && s.method === "POST");
    assert.equal(posts.length, 2, lang); assert.ok(posts.every(s => s.status === 200), lang + ": " + JSON.stringify(posts.map(s => [s.status, s.body.label])));
  }
});
