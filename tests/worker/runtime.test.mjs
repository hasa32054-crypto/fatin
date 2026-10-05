// Real-runtime race test: the worker runs in Cloudflare's local runtime (`wrangler dev`, workerd) and
// receives many simultaneous writes. With the Durable Object every radar report and family alert must
// survive. The KV-only fallback is measured too (it loses writes; that is why the Durable Object exists).
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";

const DIR = new URL("../fixtures/wrangler/", import.meta.url).pathname;
const WRANGLER = new URL("../../node_modules/.bin/wrangler", import.meta.url).pathname;
const freePort = () => new Promise(r => { const s = createServer().listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => r(p)); }); });

async function startWorker(t, config) {
  const port = await freePort(), state = mkdtempSync(join(tmpdir(), "fatin-wd-"));
  const proc = spawn(WRANGLER, ["dev", "-c", config, "--port", String(port), "--ip", "127.0.0.1", "--persist-to", state, "--log-level", "error"],
    { cwd: DIR, env: { ...process.env, WRANGLER_SEND_METRICS: "false", CI: "1" }, stdio: ["ignore", "pipe", "pipe"] });
  let log = ""; proc.stdout.on("data", d => log += d); proc.stderr.on("data", d => log += d);
  t.after(() => { proc.kill("SIGTERM"); rmSync(state, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 120; i++) { try { const r = await fetch(base + "/"); if (r.ok) return base; } catch (e) {} await new Promise(r => setTimeout(r, 500)); }
  throw new Error("wrangler dev did not start:\n" + log.slice(-2000));
}
const H = ip => ({ "content-type": "application/json", Origin: "https://site.test", "CF-Connecting-IP": ip });
async function race(base) {
  const rs = await Promise.all(Array.from({ length: 150 }, (_, i) => fetch(base + "/radar", { method: "POST", headers: H(`10.0.${i >> 8}.${i & 255}`), body: JSON.stringify({ p: "otp" }) })));
  for (const r of rs) { assert.equal(r.status, 200); await r.arrayBuffer(); }
  const radar = (await (await fetch(base + "/radar", { headers: { "CF-Connecting-IP": "9.9.9.9" } })).json()).counts.otp;
  assert.equal((await fetch(base + "/family/RACE23/claim", { method: "POST", headers: H("8.8.8.1"), body: JSON.stringify({ key: "k".repeat(30) }) })).status, 200);
  const fs = await Promise.all(Array.from({ length: 25 }, (_, i) => fetch(base + "/family/RACE23", { method: "POST", headers: H("11.0.0." + i), body: JSON.stringify({ lvl: "good", label: "أنهى اختبار الرسائل: 3 من 6", who: "x", key: "k".repeat(30) }) })));
  for (const r of fs) { assert.equal(r.status, 200); await r.arrayBuffer(); }
  const family = (await (await fetch(base + "/family/RACE23", { headers: { "CF-Connecting-IP": "9.9.9.8" } })).json()).alerts.length;
  return { radar, family };
}

test("Durable Object: 150 simultaneous radar reports and 25 simultaneous family alerts all survive", { timeout: 180000 }, async t => {
  const base = await startWorker(t, "with-state.toml");
  const r = await race(base);
  assert.deepEqual(r, { radar: 150, family: 25 });
});

test("KV fallback (no Durable Object): measured, for the record", { timeout: 180000 }, async t => {
  const base = await startWorker(t, "kv-only.toml");
  const r = await race(base);
  t.diagnostic(`KV-only kept ${r.radar}/150 radar reports and ${r.family}/25 family alerts`);
  assert.ok(r.radar >= 1 && r.family >= 1);
});
