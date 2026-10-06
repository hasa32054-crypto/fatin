// Lists visible text whose colour contrast with its background is below WCAG AA (4.5:1, or 3:1 for large text).
// Usage: node tests/tools/contrast-scan.mjs [lang] [mode]
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, blockExternal, returningUser } from "../helpers/browser.mjs";
import { contrastScan } from "../helpers/a11y.mjs";
const ROOT = new URL("../..", import.meta.url).pathname;
const [lang = "ar", mode = ""] = process.argv.slice(2);
const srv = await startStaticServer(ROOT); const b = await launch();
const ctx = await b.newContext({ locale: "ar-SA", viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
await ctx.addInitScript(returningUser(lang).init); if (mode) await ctx.addInitScript(m => localStorage.setItem("fatin-mode", JSON.stringify(m)), mode);
const p = await ctx.newPage(); await blockExternal(p); await p.goto(srv.url + "/app/"); await p.waitForTimeout(2000);
const all = new Set();
for (const v of ["scan", "sim", "call", "train", "more", "pats", "ask", "report", "family", "badges", "news", "settings"]) {
  await p.evaluate(v => showTab(v), v); await p.waitForTimeout(350);
  for (const x of await p.evaluate(contrastScan)) all.add(v + " · " + x);
}
console.log([...all].join("\n") || "none"); console.log("total", all.size);
await b.close(); await srv.close();
