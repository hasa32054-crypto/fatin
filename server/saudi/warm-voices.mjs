/**
 * تجهيز الأصوات مسبقًا — يولّد كل جمل المتصل الثابتة (فهد) مرة وحدة وتنحفظ على قرص السيرفر في جدة.
 * بعدها أي مستخدم يسمعها من السيرفر السعودي مباشرة، بدون انتظار وبدون ما يُطلب ElevenLabs.
 *
 * التشغيل (على سيرفر Oracle بعد ما يشتغل فطن):
 *   node warm-voices.mjs                      ← يقرأ ../../app/index.html ويرسل للخادم المحلي
 *   node warm-voices.mjs --dry                ← يعرض الجمل والعدد فقط
 *   SERVER=https://fatin.example.sa node warm-voices.mjs
 *
 * يُرسل نص التطبيق نفسه فقط (جمل التدريب)، ولا يُرسل أي بيانات مستخدم.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const APP = process.env.APP_HTML || path.join(here, "..", "..", "app", "index.html");
const SERVER = (process.env.SERVER || "http://127.0.0.1:" + (process.env.PORT || 8787)).replace(/\/$/, "");
const DRY = process.argv.includes("--dry");
const html = fs.readFileSync(APP, "utf8");

/** يقتطع قيمة «const NAME=…;» بموازنة الأقواس، مع تجاهل ما داخل النصوص */
export function literal(src, name) {
  const at = src.indexOf("const " + name + "=");
  if (at < 0) throw new Error("ما لقيت " + name + " في التطبيق");
  let i = src.indexOf("=", at) + 1, depth = 0, q = null;
  const start = i;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (q) { if (ch === "\\") i++; else if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { q = ch; continue; }
    if (ch === "{" || ch === "[") depth++;
    else if (ch === "}" || ch === "]") { depth--; if (depth === 0) return vm.runInNewContext("(" + src.slice(start, i + 1) + ")"); }
  }
  throw new Error("قيمة " + name + " ما انقفلت");
}

export function collect(src) {
  const CALLS = literal(src, "CALLS"), SCEN = literal(src, "SCEN");
  const GIVEUP = literal(src, "GIVEUP"); // جمل الغضب تنضاف قبل رد متغير، فما تنفع تنحفظ لحالها
  const jobs = new Map(); // المفتاح يمنع التكرار
  const add = (text, emotion = "") => { text = String(text || "").trim(); if (text && text.length <= 300) jobs.set(emotion + "|" + text, { text, role: "caller", lang: "ar", emotion: emotion || undefined }); };
  for (const c of Object.values(CALLS)) { (c.lines || []).forEach(t => add(t)); Object.values(c.faq || {}).forEach(t => add(t)); }
  for (const s of Object.values(SCEN)) { add(s.open); (s.script || []).forEach(t => add(t)); }
  GIVEUP.forEach(t => add(t, "annoyed"));
  return [...jobs.values()];
}

async function main() {
  const jobs = collect(html);
  console.log("جمل ثابتة:", jobs.length, DRY ? "(عرض فقط)" : "→ " + SERVER);
  if (DRY) { jobs.forEach((j, n) => console.log(String(n + 1).padStart(3), j.emotion || "-", j.text)); return; }
  let ok = 0, fail = 0;
  for (const j of jobs) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const r = await fetch(SERVER + "/tts", { method: "POST", headers: { "content-type": "application/json", origin: "https://hasa32054-crypto.github.io" }, body: JSON.stringify(j) });
        if (r.ok) { await r.arrayBuffer(); ok++; break; }
        if (r.status === 429) { await new Promise(z => setTimeout(z, 8000)); continue; }
        fail++; console.warn("رفض", r.status, j.text.slice(0, 40)); break;
      } catch (e) { if (attempt === 2) { fail++; console.warn("ما وصل:", e.message); } else await new Promise(z => setTimeout(z, 2000)); }
    }
    await new Promise(z => setTimeout(z, 1200)); // بهدوء عشان ما نتجاوز حد الطلبات
  }
  console.log("تم:", ok, "نجحت،", fail, "ما نجحت");
}
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
