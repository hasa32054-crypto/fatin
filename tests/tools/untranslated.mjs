// Lists Arabic text still visible in each view when another language is chosen (Urdu is skipped: it uses Arabic script).
// Usage: node tests/tools/untranslated.mjs [lang...]
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, blockExternal, returningUser } from "../helpers/browser.mjs";
const ROOT = new URL("../..", import.meta.url).pathname;
const langs = process.argv.slice(2).length ? process.argv.slice(2) : ["en", "hi", "bn", "tl", "id", "zh", "es", "fr"];
const srv = await startStaticServer(ROOT); const b = await launch();
for (const lang of langs) {
  const ctx = await b.newContext({ locale: "ar-SA", viewport: { width: 390, height: 844 }, serviceWorkers: "block" }); await ctx.addInitScript(returningUser(lang).init);
  const p = await ctx.newPage(); await blockExternal(p); await p.goto(srv.url + "/app/"); await p.waitForTimeout(2200);
  const out = {};
  for (const v of ["scan", "sim", "call", "train", "more", "pats", "ask", "report", "family", "badges", "news", "settings"]) {
    await p.evaluate(v => showTab(v), v); await p.waitForTimeout(350);
    out[v] = await p.evaluate(() => { const view = document.getElementById(VIEWS[curTab]); const w = document.createTreeWalker(view, NodeFilter.SHOW_TEXT); const found = []; let n;
      while ((n = w.nextNode())) { const el = n.parentElement; if (!el || el.closest("[hidden],.msgview,.qmsg,textarea,#nw-list,#nw-hero,#nw-tr,.bubble,.ex") ) continue; const r = el.getBoundingClientRect(); if (!r.width) continue;
        const t = n.nodeValue.trim(); if (/[؀-ۿ]{2,}/.test(t) && !/^(حسان|العربية)$/.test(t)) found.push(t.slice(0, 70)); }
      return [...new Set(found)]; });
  }
  if (process.env.DUMP) { const all = [...new Set(Object.values(out).flat())]; console.log(JSON.stringify(all)); }
  const total = Object.values(out).reduce((a, x) => a + x.length, 0);
  console.log(`\n=== ${lang}: ${total} Arabic fragments`); for (const [v, f] of Object.entries(out)) if (f.length) console.log(`  ${v} (${f.length}): ` + f.slice(0, 6).map(x => JSON.stringify(x)).join(" | "));
  await ctx.close();
}
await b.close(); await srv.close();
