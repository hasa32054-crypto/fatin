// فحص أمني آلي لفطن — يشتغل قبل كل نشر:  node tools/security-check.mjs
// يغطي: أسرار مكشوفة، مصادر خارجية، CSP، معالجات inline، حماية SSRF في قارئ الروابط،
// رفض المواقع الغريبة، حدود الطلبات، ترويسات الأمان، حذف بيانات الأسرة، وحقن البيانات في الرادار.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
let fail = 0, pass = 0;
const ok = (c, name) => { if (c) { pass++; console.log("  ✓ " + name); } else { fail++; console.log("  ✗ " + name); } };

console.log("\n[1] الملفات المنشورة");
const pub = ["index.html", "app/index.html", "privacy.html", "terms.html", "security.html", "app/sw.js", "app/manifest.webmanifest", "app/config.json"];
const files = Object.fromEntries(pub.map(f => [f, fs.readFileSync(path.join(root, f), "utf8")]));
const all = Object.values(files).join("\n") + fs.readFileSync(path.join(root, "server/worker.js"), "utf8");
ok(!/sk-ant-[A-Za-z0-9_-]{20,}|sk_[a-f0-9]{40,}|xi-api-key"\s*:\s*"[a-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY/.test(all), "ما فيه مفاتيح أو أسرار في الكود");
for (const f of ["index.html", "app/index.html"]) {
  const s = files[f];
  ok(/<meta http-equiv="Content-Security-Policy"/.test(s), f + ": فيه سياسة CSP");
  ok(!/<script[^>]+src="https?:/i.test(s) && !/<link[^>]+href="https?:\/\/(?!hasa32054)[^"]+\.css/i.test(s) && !/fonts\.googleapis|cdnjs\.|jsdelivr/.test(s), f + ": بدون سكربتات أو خطوط من مواقع خارجية");
  ok(!/\son(click|load|error|input|change|submit|keydown|mouseover)="/i.test(s), f + ": بدون معالجات أحداث inline");
  const csp = (s.match(/Content-Security-Policy" content="([^"]+)/) || [])[1] || "";
  ok(!/script-src[^;]*'unsafe-(inline|eval)'/.test(csp), f + ": CSP يمنع السكربتات غير الموثوقة (بدون unsafe-inline/eval)");
  ok(/object-src 'none'/.test(csp) && /base-uri 'self'/.test(csp), f + ": CSP يمنع object وbase");
  // كل سكربت inline لازم بصمته في CSP
  const crypto = await import("node:crypto");
  const hs = [...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => "'sha256-" + crypto.createHash("sha256").update(m[1]).digest("base64") + "'");
  ok(hs.every(h => csp.includes(h)), f + ": كل السكربتات الداخلية لها بصمة في CSP (" + hs.length + ")");
}
ok(!/fonts\.(googleapis|gstatic)|cdnjs|jsdelivr/.test(files["app/sw.js"]), "service worker يخزّن ملفات فطن فقط");
ok(/^https:\/\//.test(JSON.parse(files["app/config.json"]).server), "الخادم في config.json مشفّر (https)");
ok(/fatin-consent/.test(files["app/index.html"]) && /function consentOK/.test(files["app/index.html"]), "التطبيق ما يستخدم الخادم إلا بعد الموافقة");

console.log("\n[2] الخادم (worker.js) بطلبات وهمية");
const src = fs.readFileSync(path.join(root, "server/worker.js"), "utf8");
const tmp = path.join(root, "tools", ".worker-test.mjs");
fs.writeFileSync(tmp, src + "\nexport { readLink, safeUrl, privateHost };\n");
const W = await import(pathToFileURL(tmp).href + "?t=" + Date.now());
fs.unlinkSync(tmp);
const kv = new Map();
const env = { FATIN_KV: { get: async k => kv.get(k) ?? null, put: async (k, v) => kv.set(k, v), delete: async k => kv.delete(k) } };
const ctx = { waitUntil: p => p };
const O = "https://hasa32054-crypto.github.io";
let fetched = [];
globalThis.fetch = async u => { fetched.push(String(u)); return new Response("<title>ok</title>", { headers: { "content-type": "text/html" } }); };
const call = (p, init = {}, ip = "9.9.9.9") => W.default.fetch(new Request("https://w" + p, { ...init, headers: { Origin: O, "CF-Connecting-IP": ip, ...(init.headers || {}) } }), env, ctx);
const bad = ["http://127.0.0.1/", "http://localhost/", "http://169.254.169.254/latest/meta-data/", "http://10.0.0.1/", "http://192.168.1.1/", "http://172.16.0.5/", "http://[::1]/", "http://2130706433/", "http://0x7f000001/", "http://0177.0.0.1/", "http://metadata.internal/", "file:///etc/passwd", "gopher://x/", "https://u:p@example.com/", "https://example.com:6379/", "http://100.64.0.1/"];
for (const u of bad) { fetched = []; const r = await call("/link", { method: "POST", body: JSON.stringify({ url: u }) }, "8.8." + bad.indexOf(u) + ".1"); ok(r.status === 400 && fetched.length === 0, "SSRF مرفوض: " + u); }
globalThis.fetch = async u => { u = String(u); fetched.push(u); if (u.startsWith("https://redir.example")) return new Response(null, { status: 302, headers: { location: "http://127.0.0.1:80/admin" } }); return new Response("x", { headers: { "content-type": "text/html" } }); };
fetched = []; let r = await call("/link", { method: "POST", body: JSON.stringify({ url: "https://redir.example/" }) }, "7.7.7.1"); let j = await r.json();
ok(j.error === "blocked_target" && !fetched.some(u => u.includes("127.0.0.1")), "تحويل لعنوان داخلي مرفوض");
r = await W.default.fetch(new Request("https://w/link", { method: "POST", headers: { Origin: "https://evil.example" }, body: '{"url":"https://example.com"}' }), env, ctx);
ok(r.status === 403, "موقع غريب ما يقدر يستخدم الخادم");
for (const p of ["/tts", "/ai", "/stt", "/radar"]) { r = await W.default.fetch(new Request("https://w" + p, { method: "POST", headers: { Origin: "https://evil.example" }, body: "{}" }), env, ctx); ok(r.status === 403 || r.status === 503, "مرفوض من موقع غريب: " + p); }
let codes = []; for (let i = 0; i < 100; i++) codes.push((await call("/family/AAA" + String(i).padStart(3, "0"), {}, "6.6.6.6")).status);
ok(codes.includes(429), "تخمين رموز العائلة يتوقف (حد الطلبات)");
r = await call("/radar", { method: "POST", body: JSON.stringify({ p: "<img src=x onerror=alert(1)>", l: "x" }) }, "5.5.5.5");
ok(r.status === 400, "الرادار يرفض الحقن (يقبل أنماط محددة فقط)");
kv.set("fam:ABC123", "[]"); r = await call("/family/ABC123", { method: "DELETE" }, "4.4.4.4");
ok(r.status === 200 && !kv.has("fam:ABC123"), "حذف تنبيهات الأسرة يشتغل");
const h = r.headers;
ok(h.get("x-content-type-options") === "nosniff" && h.get("strict-transport-security") && h.get("referrer-policy") === "no-referrer" && h.get("cache-control") === "no-store", "ترويسات الأمان موجودة");
ok(!/console\.log\([^)]*(text|ip|body|audio)/i.test(src), "الخادم ما يسجّل نصوص أو أصوات أو IP");

console.log("\n[3] الواجهة المفتوحة /v1 والمحرك");
r = await call("/v1/check", { method: "POST", body: JSON.stringify({ text: "أرسل رمز التحقق اللي وصلك" }) }, "7.7.7.7");
const v1 = await r.json();
ok(r.status === 200 && v1.verdict === "danger" && r.headers.get("access-control-allow-origin") === "*", "/v1/check يفحص ومفتوح للجهات (CORS *)");
ok(!kv.size || ![...kv.values()].some(v => String(v).includes("رمز التحقق اللي وصلك")), "/v1/check ما يحفظ النص");
ok(!r.headers.get("set-cookie"), "/v1 بدون كوكيز");
r = await call("/v1/link", { method: "POST", body: JSON.stringify({ url: "http://127.0.0.1/admin" }) }, "7.7.7.8");
ok(r.status === 400, "/v1/link يرفض العناوين الداخلية (SSRF)");
r = await call("/v1/check", { method: "POST", body: JSON.stringify({ text: "x" }), headers: { "content-type": "application/json", Authorization: "Bearer not-a-real-partner-key" } }, "7.7.7.9");
ok(r.status === 200, "مفتاح شريك غير صحيح ما يعطي صلاحيات (يعامل كطلب عادي)");
const { execFileSync } = await import("node:child_process");
let synced = true; try { execFileSync(process.execPath, [path.join(root, "tools/build-sdk.mjs"), "--check"], { stdio: "pipe" }); } catch (e) { synced = false; }
ok(synced, "المحرك في الخادم والحزمة مطابق للتطبيق");

console.log("\n" + (fail ? "✗ " + fail + " فشل، " : "✓ ") + pass + " نجح");
process.exit(fail ? 1 : 0);
