// Profiles what the app does while idle (nothing touched for 8 s). Usage: node tests/tools/idle-profile.mjs <root> [lang]
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, blockExternal, returningUser } from "../helpers/browser.mjs";
const [root, lang = "ar"] = process.argv.slice(2);
const srv = await startStaticServer(root); const b = await launch();
const ctx = await b.newContext({ locale: "ar-SA", viewport: { width: 390, height: 844 }, isMobile: true, serviceWorkers: "block" });
await ctx.addInitScript(returningUser(lang).init);
const p = await ctx.newPage(); await blockExternal(p); await p.goto(srv.url + "/app/"); await p.waitForTimeout(3000);
const cdp = await ctx.newCDPSession(p); await cdp.send("Profiler.enable"); await cdp.send("Profiler.setSamplingInterval", { interval: 200 });
await cdp.send("Tracing.start", { categories: "devtools.timeline", transferMode: "ReturnAsStream" }).catch(() => {});
await cdp.send("Profiler.start"); await p.waitForTimeout(8000); const { profile } = await cdp.send("Profiler.stop");
const self = new Map(); const byId = new Map(profile.nodes.map(n => [n.id, n]));
const dt = profile.timeDeltas; profile.samples.forEach((id, i) => { const n = byId.get(id); const k = n.callFrame.functionName || "(" + (n.callFrame.url ? "anon" : n.callFrame.functionName || "native") + ")"; self.set(k, (self.get(k) || 0) + (dt[i] || 0)); });
const total = [...self.values()].reduce((a, b) => a + b, 0) / 1000;
console.log("sampled JS+idle ms:", Math.round(total));
console.log([...self.entries()].filter(([k]) => k !== "(idle)" && k !== "(program)").sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => (v / 1000).toFixed(1) + "ms  " + k).join("\n"));
const anim = await p.evaluate(() => document.getAnimations().filter(a => a.playState === "running").map(a => (a.effect && a.effect.target ? (a.effect.target.id || a.effect.target.className) : "?") + ":" + (a.animationName || a.constructor.name)).slice(0, 30));
console.log("running animations:", anim.length, JSON.stringify(anim));
await b.close(); await srv.close();
