// Lists text that is cut off inside its box (narrow phones, every language): elements whose text is wider or taller than the box.
// Usage: node tests/tools/clip-scan.mjs [width]
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, blockExternal, returningUser } from "../helpers/browser.mjs";
const ROOT = new URL("../..", import.meta.url).pathname;
const W = +(process.argv[2] || 360);
const srv = await startStaticServer(ROOT); const b = await launch();
let total = 0;
for (const lang of ["ar", "en", "ur", "hi", "bn", "tl", "id", "zh", "es", "fr"]) {
  const ctx = await b.newContext({ locale: "ar-SA", viewport: { width: W, height: 780 }, serviceWorkers: "block" }); await ctx.addInitScript(returningUser(lang).init);
  const p = await ctx.newPage(); await blockExternal(p); await p.goto(srv.url + "/app/"); await p.waitForTimeout(2000);
  const found = new Set();
  for (const v of ["scan", "sim", "call", "train", "more", "pats", "ask", "report", "family", "badges", "news", "settings"]) {
    await p.evaluate(v => showTab(v), v); await p.waitForTimeout(300);
    for (const x of await p.evaluate(() => { const out = [];
      for (const e of document.querySelectorAll(".tab, .tab *, #device button, #device small, #device label, #device .chip, #device em, #device b")) {
        if (!e.getClientRects().length || e.closest("[hidden]")) continue; const cs = getComputedStyle(e);
        if (!/hidden|clip/.test(cs.overflow + cs.overflowX) && cs.textOverflow !== "ellipsis") continue;
        if (e.scrollWidth > e.clientWidth + 1 && e.textContent.trim()) out.push((e.className || e.tagName) + ": " + e.textContent.trim().slice(0, 40)); }
      return out; })) found.add(v + " · " + x);
  }
  total += found.size; console.log(`${lang}: ${found.size}` + (found.size ? "\n  " + [...found].join("\n  ") : ""));
  await ctx.close();
}
console.log("total", total); await b.close(); await srv.close();
