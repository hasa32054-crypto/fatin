// Captures the app's observable behavior so a refactor can be compared against it:
//   engine.json  : FatinEngine.analyze() for every message the app ships plus generated variants
//   ui.json      : visible text of every view in every language
//   shots/       : screenshots of the main views (ar, en)
// Usage: node tests/tools/capture.mjs <site-root> <out-dir>
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { startStaticServer } from "../helpers/static-server.mjs";
import { launch, blockExternal, returningUser } from "../helpers/browser.mjs";

const [root, out] = process.argv.slice(2);
mkdirSync(join(out, "shots"), { recursive: true });
const srv = await startStaticServer(root);
const browser = await launch();
const LANGS = ["ar", "en", "ur", "hi", "bn", "tl", "id", "zh", "es", "fr"];
const VIEWS = ["scan", "sim", "call", "train", "more", "pats", "ask", "report", "family", "badges", "news", "settings"];

async function page(lang, vp = { width: 390, height: 844 }) {
  const ctx = await browser.newContext({ locale: "ar-SA", viewport: vp, reducedMotion: "reduce", serviceWorkers: "block" });
  await ctx.addInitScript(returningUser(lang).init);
  const p = await ctx.newPage(); p.errors = []; p.on("pageerror", e => p.errors.push(e.message));
  await blockExternal(p); await p.goto(srv.url + "/app/"); await p.waitForTimeout(1200);
  return p;
}

// ---- engine corpus ----
const p0 = await page("ar");
await p0.evaluate(async LANGS => { for (const l of LANGS) if (typeof i18nLoad === "function") await i18nLoad(l); }, LANGS); // translated quiz items
const engine = await p0.evaluate((LANGS) => {
  const texts = new Set(); const add = t => { if (typeof t === "string" && t.trim().length > 3) texts.add(t); };
  EXAMPLES.forEach(add); QUIZ.forEach(q => add(q.m));
  for (const l of LANGS) { lang = l; for (let i = 0; i < QUIZ.length; i++) add(qz(i).m); }
  lang = "ar";
  Object.values(EX_L).forEach(a => a.forEach(([, t]) => add(t)));
  (typeof CH_POOL !== "undefined" ? CH_POOL : []).forEach(it => add(Array.isArray(it) ? it[0] : it && it.m));
  NEWS.forEach(n => add(n.tryMsg));
  Object.values(SCEN).forEach(s => { add(s.open); s.script.forEach(add); s.quick.forEach(add); });
  // generated variants: each brand in common scam shapes, and ordinary safe messages
  const brands = FatinEngine.brandNames();
  const shapes = ["{b}: تم تعليق حسابك، حدّث بياناتك خلال 24 ساعة: {b}-update.xyz", "عميلنا العزيز، {b} يطلب رمز التحقق اللي وصلك الحين", "مبروك! ربحت جائزة من {b}، ادخل الرابط bit.ly/x{b}", "{b}: لديك مبلغ مسترد، أدخل بيانات بطاقتك", "رسالة من {b}: موعدك بكرة الساعة 10", "{b}: Your account is locked, verify now at http://{b}-secure.top", "رمز التحقق الخاص بك من {b} هو 482913 لا تشاركه مع أحد"];
  brands.forEach(b => shapes.forEach(s => add(s.replaceAll("{b}", b))));
  ["هلا، وين وصلت؟", "تذكير: اجتماع الأسرة يوم الجمعة", "الله يعطيك العافية على المساعدة", "Your order #1234 has shipped", "طلبك جاهز للاستلام من الفرع"].forEach(add);
  const res = {}; for (const t of [...texts].sort()) { const r = FatinEngine.analyze(t); res[t] = { level: r.level, score: r.score, ids: [...new Set(r.ids || [])].sort(), brands: r.brands, links: r.links, reasons: r.reasons, signals: r.signals }; }
  return res;
}, LANGS);
writeFileSync(join(out, "engine.json"), JSON.stringify(engine, null, 1));
console.log("engine corpus:", Object.keys(engine).length, "messages");
await p0.context().close();

// ---- visible text of every view in every language ----
const ui = {}; const errors = {};
for (const lang of LANGS) {
  const p = await page(lang); ui[lang] = {};
  for (const v of VIEWS) {
    await p.evaluate(v => { try { showTab(v); } catch (e) {} }, v); await p.waitForTimeout(250);
    ui[lang][v] = await p.evaluate(v => { const el = document.getElementById((VIEWS[v] || "v-" + v)); return el ? el.innerText.replace(/\s+/g, " ").trim() : null; }, v);
    if ((lang === "ar" || lang === "en") && ["scan", "train", "more", "family", "settings", "news"].includes(v)) await p.screenshot({ path: join(out, "shots", `${lang}-${v}.png`) });
  }
  ui[lang].chrome = await p.evaluate(() => [...document.querySelectorAll(".tab, header, .top")].map(e => e.innerText.replace(/\s+/g, " ").trim()).join(" | "));
  errors[lang] = p.errors; await p.context().close();
}
writeFileSync(join(out, "ui.json"), JSON.stringify(ui, null, 1));
console.log("ui text captured; page errors:", JSON.stringify(Object.fromEntries(Object.entries(errors).filter(([, v]) => v.length))));
await browser.close(); await srv.close();
