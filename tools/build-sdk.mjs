// يبني «حزمة فطن» من المحرك الموجود في التطبيق (مصدر واحد للحقيقة):
//   1) sdk/fatin-engine.js  ← مكتبة تشتغل بدون إنترنت في أي موقع أو تطبيق (متصفح أو Node)
//   2) server/worker.js     ← ينسخ نفس المحرك بين علامتي <ENGINE> عشان واجهة /v1/check تعطي نفس نتيجة التطبيق
// التشغيل: node tools/build-sdk.mjs        (والفحص بدون كتابة: --check)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "app/index.html"), "utf8");
const a = html.indexOf("const FatinEngine = (() => {"), b = html.indexOf("/* ================= END ENGINE ================= */");
if (a < 0 || b < 0) throw new Error("ما لقيت المحرك في app/index.html");
const engine = html.slice(a, b).trim();
const hash = crypto.createHash("sha256").update(engine).digest("hex").slice(0, 10);
const version = "1.0." + hash;

const sdk = `/*! Fatin Engine ${version} — محرك فطن لكشف رسائل الاحتيال (يعمل داخل الجهاز بدون إنترنت)
 * © 2026 حسان عبدالله الينبعاوي. جميع الحقوق محفوظة. الاستخدام في جهات أو تطبيقات أخرى بإذن كتابي من المالك.
 * فطن مشروع طالب مستقل، وليس تابعًا لأي جهة حكومية أو بنك.
 *
 * الاستخدام:
 *   <script src="fatin-engine.js"></script>   ثم   Fatin.check("نص الرسالة")
 *   أو في Node:  const Fatin = require("./fatin-engine.js")
 * النتيجة: { verdict: "safe"|"suspicious"|"danger", score: 0-100, reasons: [..], signals: [..], links: [..], brands: [..], version }
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Fatin = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
${engine}
  const VERSION = ${JSON.stringify(version)};
  function check(text) {
    const r = FatinEngine.analyze(String(text == null ? "" : text).slice(0, 4000));
    return { verdict: r.level === "empty" ? "safe" : r.level, score: r.score, reasons: r.reasons, signals: r.ids, links: r.links, brands: r.brands, lookalike: r.compare || null, version: VERSION };
  }
  return { check, analyze: FatinEngine.analyze, normalize: FatinEngine.norm, brands: FatinEngine.brandNames, version: VERSION };
});
`;

const wpath = path.join(root, "server/worker.js");
let worker = fs.readFileSync(wpath, "utf8");
const block = `// <ENGINE> — منسوخ آليًا من app/index.html بالأمر node tools/build-sdk.mjs. لا تعدّله هنا.\nconst ENGINE_VERSION = ${JSON.stringify(version)};\n${engine}\n// </ENGINE>`;
const re = /\/\/ <ENGINE>[\s\S]*?\/\/ <\/ENGINE>/;
if (!re.test(worker)) throw new Error("worker.js ما فيه علامة <ENGINE>");
const newWorker = worker.replace(re, () => block);
const sdkPath = path.join(root, "sdk/fatin-engine.js");
const oldSdk = fs.existsSync(sdkPath) ? fs.readFileSync(sdkPath, "utf8") : "";

if (process.argv.includes("--check")) {
  const ok = newWorker === worker && oldSdk === sdk;
  console.log(ok ? "✓ المحرك في الحزمة والخادم مطابق للتطبيق (" + version + ")" : "✗ المحرك تغيّر: شغّل node tools/build-sdk.mjs");
  process.exit(ok ? 0 : 1);
}
fs.mkdirSync(path.dirname(sdkPath), { recursive: true });
fs.writeFileSync(sdkPath, sdk);
fs.writeFileSync(wpath, newWorker);
console.log("✓ sdk/fatin-engine.js و server/worker.js ←", version);
