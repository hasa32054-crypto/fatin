// Shared state (radar, family board) in both stores — the Durable Object and the KV fallback — plus the
// family sender key, per-address radar limits, migration from KV, response headers and upstream timeouts.
import { test } from "node:test";
import assert from "node:assert/strict";
import { durableObjects } from "../helpers/do-mock.mjs";
import { memoryKV } from "../helpers/worker-harness.mjs";

const ORIGIN = "https://hasa32054-crypto.github.io";
let n = 0;
const load = async () => (await import("../../server/worker.js?s=" + ++n));
const ctx = { waitUntil() {} };
function req(path, { method = "POST", body, ip = "1.1.1.1", origin = ORIGIN } = {}) {
  const h = { "CF-Connecting-IP": ip, "content-type": "application/json" }; if (origin) h.Origin = origin;
  return new Request("https://w.test" + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
}
async function setup({ withDO = true, seed } = {}) {
  const mod = await load(); const kv = memoryKV(); if (seed) seed(kv.store);
  const env = { FATIN_KV: kv }; if (withDO) env.FATIN_STATE = durableObjects(mod.FatinState, env);
  const call = async (path, o) => { const r = await mod.default.fetch(req(path, o), env, ctx); return { s: r.status, b: await r.json(), h: r.headers }; };
  return { mod, env, kv, call };
}
const KEY = "k".repeat(30), OTHER = "o".repeat(30);
const alert = (extra = {}) => ({ lvl: "danger", label: "رسالة احتيال: طلب رمز التحقق", who: "حسان", ...extra });

for (const withDO of [true, false]) {
  const mode = withDO ? "Durable Object" : "KV fallback";

  test(`${mode}: family sender key — owner posts, others cannot, relatives read with the code`, async () => {
    const { call } = await setup({ withDO });
    assert.equal((await call("/family/ABC234/claim", { body: { key: KEY } })).s, 200);
    assert.equal((await call("/family/ABC234/claim", { body: { key: KEY }, ip: "2.2.2.2" })).s, 200, "the owner can claim again");
    assert.equal((await call("/family/ABC234/claim", { body: { key: OTHER }, ip: "2.2.2.3" })).s, 409, "someone else cannot take it");
    assert.equal((await call("/family/ABC234", { body: alert({ key: KEY }) })).s, 200);
    const noKey = await call("/family/ABC234", { body: alert(), ip: "3.3.3.3" });
    assert.deepEqual([noKey.s, noKey.b.error], [403, "key_required"]);
    const wrong = await call("/family/ABC234", { body: alert({ key: OTHER }), ip: "3.3.3.4" });
    assert.deepEqual([wrong.s, wrong.b.error], [403, "wrong_key"]);
    const read = await call("/family/ABC234", { method: "GET", ip: "4.4.4.4" });
    assert.equal(read.s, 200); assert.equal(read.b.alerts.length, 1);
    assert.doesNotMatch(JSON.stringify(read.b), /key/i, "nothing about the key is ever returned");
    assert.equal((await call("/family/ABC234/claim", { body: { key: "short" }, ip: "5.5.5.5" })).s, 400, "malformed key");
  });

  test(`${mode}: a code from before keys keeps working, and the first keyed post takes it`, async () => {
    const { call } = await setup({ withDO, seed: s => s.set("fam:OLD234", JSON.stringify([{ lvl: "good", label: "أنهى اختبار الرسائل: 5 من 6", who: "سارة", at: Date.now() - 3600e3 }])) });
    assert.equal((await call("/family/OLD234", { method: "GET" })).b.alerts.length, 1, "old alerts are kept");
    assert.equal((await call("/family/OLD234", { body: alert() })).s, 200, "an old app without a key can still post");
    assert.equal((await call("/family/OLD234", { body: alert({ key: KEY }), ip: "2.2.2.2" })).s, 200, "the first keyed post takes the code");
    assert.equal((await call("/family/OLD234", { body: alert(), ip: "3.3.3.3" })).s, 403, "after that a key is required");
    assert.equal((await call("/family/OLD234", { method: "GET" })).b.alerts.length, 3);
  });

  test(`${mode}: radar counts, validation and migration of last week's raw reports`, async () => {
    const { call } = await setup({ withDO, seed: s => s.set("radar", JSON.stringify([{ p: "otp", at: Date.now() - 864e5 }, { p: "otp", at: Date.now() }, { p: "evil", at: Date.now() }])) });
    assert.deepEqual((await call("/radar", { method: "GET" })).b.counts, { otp: 2 });
    assert.equal((await call("/radar", { body: { p: "imp:أبشر" }, ip: "9.9.9.1" })).s, 200);
    assert.equal((await call("/radar", { body: { p: "imp:Evil" }, ip: "9.9.9.2" })).s, 400);
  });
}

test("Durable Object: simultaneous radar reports and family alerts are never lost", async () => {
  const { call } = await setup();
  await Promise.all(Array.from({ length: 120 }, (_, i) => call("/radar", { body: { p: "otp" }, ip: `10.0.${i >> 8}.${i & 255}` })));
  await call("/family/ABC234/claim", { body: { key: KEY } });
  await Promise.all(Array.from({ length: 25 }, (_, i) => call("/family/ABC234", { body: alert({ key: KEY, label: "أنهى اختبار الرسائل: " + (i % 7) + " من 6" }), ip: "11.0.0." + i })));
  const r = await call("/radar", { method: "GET", ip: "12.0.0.1" });
  assert.equal(r.b.counts.otp, 120, "every report counted");
  assert.equal((await call("/family/ABC234", { method: "GET" })).b.alerts.length, 25, "every alert kept");
});

test("radar: one address counts at most 3 reports of a pattern a day (but always gets ok)", async () => {
  const { call, env } = await setup();
  const codes = []; for (let i = 0; i < 5; i++) { codes.push((await call("/radar", { body: { p: "card" }, ip: "8.8.8.8" })).s); }
  assert.deepEqual(codes, [200, 200, 200, 200, 200]);
  await call("/radar", { body: { p: "otp" }, ip: "8.8.8.8" });
  const days = env.FATIN_STATE.objects.get("radar").data.get("days"); const today = Object.values(days).at(-1);
  assert.deepEqual(today, { card: 3, otp: 1 });
  const seen = env.FATIN_STATE.objects.get("radar").data.get("seen");
  assert.doesNotMatch(JSON.stringify(seen), /8\.8\.8\.8/, "addresses are not stored");
});

test("radar: more than 6 reports a minute from one address are refused", async () => {
  const { call } = await setup();
  const codes = []; for (let i = 0; i < 8; i++) codes.push((await call("/radar", { body: { p: "otp" }, ip: "6.6.6.6" })).s);
  assert.deepEqual(codes, [200, 200, 200, 200, 200, 200, 429, 429]);
});

test("family: 60 alerts an hour at most, and a quiet board is emptied after 14 days (the owner stays)", async () => {
  const { call, env } = await setup();
  await call("/family/CAP234/claim", { body: { key: KEY } });
  const st = env.FATIN_STATE.objects.get("fam:CAP234");
  await st.storage.put("fam", { keyHash: (await st.storage.get("fam")).keyHash, alerts: Array.from({ length: 60 }, (_, i) => ({ lvl: "good", label: "x", who: "", at: Date.now() - i * 1000 })) });
  const r = await call("/family/CAP234", { body: alert({ key: KEY }), ip: "7.7.7.7" });
  assert.deepEqual([r.s, r.b.error], [429, "too_many"]);
  assert.ok(st.storage.alarm > Date.now() + 13 * 864e5, "deletion is scheduled");
  await env.FATIN_STATE.fireAlarm("fam:CAP234");
  assert.equal((await call("/family/CAP234", { method: "GET" })).b.alerts.length, 0);
  assert.equal((await call("/family/CAP234", { body: alert(), ip: "7.7.7.8" })).s, 403, "the code still belongs to its owner");
});

test("old alerts (over 14 days) are never shown", async () => {
  const { call } = await setup({ seed: s => s.set("fam:AGE234", JSON.stringify([{ lvl: "good", label: "x", who: "", at: Date.now() - 15 * 864e5 }, { lvl: "good", label: "y", who: "", at: Date.now() }])) });
  assert.deepEqual((await call("/family/AGE234", { method: "GET" })).b.alerts.map(a => a.label), ["y"]);
});

test("security headers on every response, and no storage means an honest 503", async () => {
  const { call, mod } = await setup();
  const r = await call("/radar", { method: "GET" });
  for (const [k, v] of Object.entries({ "x-content-type-options": "nosniff", "referrer-policy": "no-referrer", "x-frame-options": "DENY" })) assert.equal(r.h.get(k), v);
  assert.match(r.h.get("content-security-policy"), /default-src 'none'/);
  const o = await mod.default.fetch(req("/ai", { method: "OPTIONS" }), {}, ctx);
  assert.equal(o.status, 204); assert.equal(o.headers.get("x-content-type-options"), "nosniff");
  const ai = await mod.default.fetch(req("/ai", { body: { task: "scan", text: "x" } }), {}, ctx);
  assert.equal(ai.headers.get("cache-control"), "no-store");
  const none = await mod.default.fetch(req("/radar", { method: "GET" }), {}, ctx);
  assert.equal(none.status, 503);
});

test("a provider that does not answer in time gives 504, not a hanging request", async () => {
  const mod = await load(); const env = { ANTHROPIC_API_KEY: "k", FATIN_KV: memoryKV(), UPSTREAM_TIMEOUT_MS: "1000" };
  const real = globalThis.fetch;
  globalThis.fetch = (u, init) => new Promise((_, rej) => init.signal.addEventListener("abort", () => rej(init.signal.reason)));
  const keepAlive = setTimeout(() => {}, 10000); // Node's AbortSignal.timeout does not keep the test process alive by itself
  try {
    const t0 = Date.now(); const r = await mod.default.fetch(req("/ai", { body: { task: "scan", text: "رسالة" } }), env, ctx);
    assert.equal(r.status, 504); assert.equal((await r.json()).error, "upstream_timeout"); assert.ok(Date.now() - t0 < 5000);
  } finally { globalThis.fetch = real; clearTimeout(keepAlive); }
});
