// قياس دقة محرك فطن على مجموعتي اختبار مصنّفتين يدويًا.
//   node tools/eval.mjs              ← النتائج في الطرفية
//   node tools/eval.mjs --md         ← يكتب docs/accuracy.md
// المحرك يُستخرج من app/index.html نفسه، فالقياس دائمًا على الكود المنشور.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
export function loadEngine() {
  const html = fs.readFileSync(path.join(root, "app/index.html"), "utf8");
  const a = html.indexOf("const FatinEngine = (() => {"), b = html.indexOf("/* ================= END ENGINE ================= */");
  if (a < 0 || b < 0) throw new Error("ما لقيت المحرك");
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(html.slice(a, b) + "\nthis.FatinEngine = FatinEngine;", ctx);
  return ctx.FatinEngine;
}
const read = f => fs.readFileSync(path.join(root, "tools/bench", f), "utf8").trim().split("\n").map(l => JSON.parse(l));

function score(E, rows) {
  const m = { tp: 0, fp: 0, tn: 0, fn: 0, dangerTp: 0, errors: [], byLang: {} };
  for (const r of rows) {
    const out = E.analyze(r.text), flagged = out.level === "danger" || out.level === "suspicious", scam = r.label === "scam";
    const L = m.byLang[r.lang] || (m.byLang[r.lang] = { n: 0, ok: 0 }); L.n++;
    if (scam && flagged) { m.tp++; L.ok++; if (out.level === "danger") m.dangerTp++; }
    else if (!scam && !flagged) { m.tn++; L.ok++; }
    else { if (scam) m.fn++; else m.fp++; m.errors.push({ ...r, got: out.level, score: out.score }); }
  }
  const p = m.tp / Math.max(1, m.tp + m.fp), rc = m.tp / Math.max(1, m.tp + m.fn);
  return Object.assign(m, { n: rows.length, precision: p, recall: rc, f1: 2 * p * rc / Math.max(1e-9, p + rc), fpr: m.fp / Math.max(1, m.fp + m.tn), acc: (m.tp + m.tn) / rows.length });
}
const pct = x => (100 * x).toFixed(1) + "%";

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const E = loadEngine();
  const sets = { blind: score(E, read("blind.jsonl")), holdout: score(E, read("holdout.jsonl")), dev: score(E, read("dev.jsonl")) };
  for (const [k, s] of Object.entries(sets)) {
    console.log(`\n[${k}] ${s.n} رسالة · دقة ${pct(s.acc)} · Precision ${pct(s.precision)} · Recall ${pct(s.recall)} · F1 ${pct(s.f1)} · إنذار خاطئ ${pct(s.fpr)}`);
    s.errors.forEach(e => console.log("  ✗", e.label === "scam" ? "فات احتيال" : "إنذار خاطئ", `(${e.lang}/${e.cat}, ${e.got} ${e.score})`, e.text.slice(0, 90)));
  }
  if (process.argv.includes("--md")) {
    const h = sets.blind, o = sets.holdout, d = sets.dev, today = new Date().toISOString().slice(0, 10);
    const row = (n, s) => `| ${n} | ${s.n} | ${pct(s.acc)} | ${pct(s.precision)} | ${pct(s.recall)} | ${pct(s.f1)} | ${pct(s.fpr)} |`;
    const langs = Object.entries(h.byLang).map(([l, v]) => `${l}: ${v.ok}/${v.n}`).join(" · ");
    const errs = s => s.errors.length ? s.errors.map(e => `- ${e.label === "scam" ? "**فات احتيال**" : "**إنذار خاطئ**"} (${e.lang}/${e.cat}، النتيجة ${e.got} ${e.score}): «${e.text.slice(0, 120)}»`).join("\n") : "- لا يوجد";
    fs.writeFileSync(path.join(root, "docs/accuracy.md"), `# دقة محرك فطن — تقرير قياس

> آخر قياس: ${today} · يُعاد توليده بالأمر \`node tools/eval.mjs --md\` · المحرك يعمل **داخل الجوال بدون إنترنت** (الطبقة الأولى فقط، بدون الذكاء الاصطناعي ولا قارئ الروابط).

## النتائج

| المجموعة | العدد | الدقة | Precision | Recall | F1 | الإنذار الخاطئ |
|---|---|---|---|---|---|---|
${row("**العمياء (blind) — الرقم المعتمد**", h)}
${row("المعزولة الأولى (holdout)", o)}
${row("التطوير (dev)", d)}

- **«مكشوف»** = النتيجة «انتبه» أو «خطر» (اللي يشوف فيها المستخدم تحذير).
- من الاحتيال المكشوف في المجموعة العمياء، ${h.dangerTp} من ${h.tp} صُنّفت «خطر» مباشرة.
- حسب اللغة (العمياء): ${langs}

## المنهجية (بصراحة)

1. مجموعتان كتبهما فريق فطن يدويًا، مستوحاة من أنماط الاحتيال المنتشرة في المملكة (بنوك، جهات حكومية، شحن، جوائز، أقارب، وظائف، استثمار، دعم فني) ورسائل سليمة **صعبة** (رموز تحقق حقيقية الشكل، إشعارات بنوك، روابط رسمية، محادثات عادية) بـ${new Set([...read("dev.jsonl"), ...read("holdout.jsonl"), ...read("blind.jsonl")].map(r => r.lang)).size} لغات.
2. **التطوير (dev)** استُخدمت لتحسين المحرك.
   **المعزولة الأولى (holdout)** قيست قبل التحسين: كانت الدقة **95.0%** (Recall 93.3%). بعدها اطّلعنا على أخطائها وعالجنا أنماطًا عامة (صيغ المؤنث في طلب التحويل، طلب الكتمان، رسوم التدريب، العمل عن بعد)، فرقمها الحالي **لم يعد أعمى** ونذكره للشفافية فقط.
   **العمياء (blind)** كُتبت بعد آخر تعديل وقبل تشغيل المحرك عليها، ولم يُعدَّل المحرك بناءً عليها — **هي الرقم المعتمد**.
3. الروابط والأرقام في المجموعات وهمية.
4. **حدود القياس:** العينة صغيرة ومن إعداد الفريق نفسه، فالأرقام مؤشر وليست شهادة. الخطوة التالية: قياس مستقل على رسائل حقيقية مجهولة الهوية بالتعاون مع جهة مختصة، ونتائج الاختبار الميداني (\`store/closed-test-plan.md\`).

## الأخطاء في المجموعة العمياء
${errs(h)}

## الأخطاء في المعزولة الأولى
${errs(o)}

## الأخطاء في مجموعة التطوير
${errs(d)}
`);
    console.log("\n→ docs/accuracy.md");
  }
}
