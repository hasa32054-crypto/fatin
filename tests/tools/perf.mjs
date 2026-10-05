// Measures app start-up cost on a simulated low-end phone (4x CPU slowdown).
// Usage: node tests/tools/perf.mjs <site-root> [runs]   → prints a JSON summary (median of runs)
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, blockExternal, returningUser } from "../helpers/browser.mjs";

const [root, runsArg] = process.argv.slice(2); const RUNS = +runsArg || 5;
const srv = await startStaticServer(root); const browser = await launch();
const med = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
async function once(lang) {
  const ctx = await browser.newContext({ locale: "ar-SA", viewport: { width: 390, height: 844 }, isMobile: true, serviceWorkers: "block" });
  await ctx.addInitScript(returningUser(lang).init);
  const p = await ctx.newPage(); await blockExternal(p);
  const cdp = await ctx.newCDPSession(p); await cdp.send("Performance.enable"); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  let bytes = 0, reqs = 0; p.on("response", async r => { if (r.url().startsWith(srv.url)) { reqs++; try { bytes += (await r.body()).length; } catch (e) {} } });
  await p.goto(srv.url + "/app/", { waitUntil: "load" });
  const nav = await p.evaluate(() => { const n = performance.getEntriesByType("navigation")[0]; return { dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd }; });
  const m1 = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(x => [x.name, x.value]));
  await p.waitForTimeout(10000); // idle: background timers and observers only
  const m2 = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(x => [x.name, x.value]));
  await ctx.close();
  return { dcl: nav.dcl, load: nav.load, scriptMs: m1.ScriptDuration * 1000, taskMs: m1.TaskDuration * 1000, heapMB: m1.JSHeapUsedSize / 1048576, idleTaskMs10s: (m2.TaskDuration - m1.TaskDuration) * 1000, bytes, reqs };
}
const out = {};
for (const lang of ["ar", "hi"]) {
  const rs = []; for (let i = 0; i < RUNS; i++) rs.push(await once(lang));
  out[lang] = Object.fromEntries(Object.keys(rs[0]).map(k => [k, Math.round(med(rs.map(r => r[k])) * 10) / 10]));
}
console.log(JSON.stringify(out, null, 1));
await browser.close(); await srv.close();
