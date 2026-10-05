// Compares start-up cost of two builds fairly: runs alternate between them (so machine load affects both
// equally) on a simulated low-end phone (4x CPU slowdown). Usage: node tests/tools/perf-compare.mjs <rootA> <rootB> [runs]
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, blockExternal, returningUser } from "../helpers/browser.mjs";
const [A, B, n = "9"] = process.argv.slice(2);
const srvs = [await startStaticServer(A), await startStaticServer(B)]; const browser = await launch();
const med = a => { const s = [...a].sort((x, y) => x - y); return Math.round(s[Math.floor(s.length / 2)]); };
async function once(srv, lang) {
  const ctx = await browser.newContext({ locale: "ar-SA", viewport: { width: 390, height: 844 }, isMobile: true, serviceWorkers: "block" });
  await ctx.addInitScript(returningUser(lang).init); const p = await ctx.newPage(); await blockExternal(p);
  const cdp = await ctx.newCDPSession(p); await cdp.send("Performance.enable"); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await p.goto(srv.url + "/app/", { waitUntil: "load" });
  const nav = await p.evaluate(() => { const e = performance.getEntriesByType("navigation")[0]; const fcp = performance.getEntriesByName("first-contentful-paint")[0]; return { dcl: e.domContentLoadedEventEnd, load: e.loadEventEnd, fcp: fcp ? fcp.startTime : 0 }; });
  const m1 = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(x => [x.name, x.value]));
  await p.waitForTimeout(6000);
  const m2 = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(x => [x.name, x.value]));
  await ctx.close();
  return { ...nav, scriptMs: m1.ScriptDuration * 1000, startupTaskMs: m1.TaskDuration * 1000, idleTaskMsPer10s: (m2.TaskDuration - m1.TaskDuration) * 1000 / 0.6 };
}
for (const lang of ["ar", "hi"]) {
  const res = [[], []];
  for (let i = 0; i < +n; i++) for (const k of [0, 1]) res[k].push(await once(srvs[k], lang));
  const sum = r => Object.fromEntries(Object.keys(r[0]).map(k => [k, med(r.map(x => x[k]))]));
  console.log(lang, "A", JSON.stringify(sum(res[0]))); console.log(lang, "B", JSON.stringify(sum(res[1])));
}
await browser.close(); for (const s of srvs) await s.close();
