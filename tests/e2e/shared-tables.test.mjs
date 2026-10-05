// The app and the server must agree on the tables in shared/tables.json. The server's copy is generated
// (tools/sync-tables.mjs); this test reads the same tables from the running app and compares.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, blockExternal, returningUser } from "../helpers/browser.mjs";

const ROOT = new URL("../..", import.meta.url).pathname;
const T = JSON.parse(readFileSync(ROOT + "shared/tables.json", "utf8"));
let srv, browser, app;
before(async () => {
  srv = await startStaticServer(ROOT); browser = await launch();
  const ctx = await browser.newContext({ locale: "ar-SA", serviceWorkers: "block" }); await ctx.addInitScript(returningUser("ar").init);
  const p = await ctx.newPage(); await blockExternal(p); await p.goto(srv.url + "/app/"); await p.waitForTimeout(1200);
  app = await p.evaluate(async () => {
    const who = {};
    for (const l of LANG_ORDER) { await i18nLoad(l); applyLang(l); for (const k of Object.keys(SCEN)) (who[k] ||= {})[l] = scn(k).who; }
    applyLang("ar");
    return { patterns: PAT_ORDER.filter(p => p !== "imp"), brands: FatinEngine.brandNames(), langOrder: LANG_ORDER, langs: Object.fromEntries(LANG_ORDER.map(k => [k, [LANGS[k].name, LANGS[k].en]])),
      simWho: who, callChars: Object.fromEntries(Object.entries(CALLS).map(([k, c]) => [k, { scam: c.scam, persona: c.persona, goal: c.goal }])) };
  });
});
after(async () => { await browser?.close(); await srv?.close(); });

test("radar patterns", () => assert.deepEqual([...app.patterns].sort(), [...T.patterns].sort()));
test("brands: every brand the app can report is known to the server", () => {
  assert.deepEqual([...new Set([...app.brands, "جهة رسمية"])].sort(), [...T.brands].sort());
});
test("languages", () => { assert.deepEqual(app.langOrder.sort(), Object.keys(T.langs).sort()); assert.deepEqual(app.langs, T.langs); });
test("training characters in every language", () => assert.deepEqual(app.simWho, T.simWho));
test("call characters", () => assert.deepEqual(app.callChars, T.callChars));
test("family alert shapes are the ones the app sends", () => {
  const src = readFileSync(ROOT + "app/index.html", "utf8");
  for (const start of T.famStarts) assert.ok(src.includes(JSON.stringify(start).slice(1, -1).replace(/\(/g, "(")) || src.includes(start), "app sends: " + start);
  for (const lvl of T.famLevels) assert.ok(src.includes(`"${lvl}"`), "level used by the app: " + lvl);
});
