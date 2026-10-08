/**
 * خادم فطن السعودي — يشغّل نفس كود worker.js حرفيًا، لكن على سيرفر داخل المملكة (Oracle Cloud، منطقة جدة).
 *
 * - التخزين (لوحة الأسرة، الرادار، كاش الصوت، كاش الروابط): ملفات على قرص السيرفر في المملكة.
 * - السمع (تحويل كلام المستخدم لنص): whisper.cpp محليًا على السيرفر، فالتسجيل ما يطلع من المملكة.
 * - الذكاء الاصطناعي: AI_PROVIDER = local (نموذج ALLaM السعودي عبر llama.cpp على السيرفر)
 *                                   أو cloudflare (يحوّل للخادم الحالي) أو anthropic (مفتاح Claude).
 * - الصوت: الجمل الثابتة تنحفظ على القرص هنا، والجمل الجديدة تتولد من ElevenLabs (نص التطبيق فقط، بدون بيانات المستخدم).
 * - قارئ الروابط: يتحقق من عنوان IP الفعلي وقت الاتصال (ضد DNS rebinding) ويرفض أي عنوان داخلي.
 * - السجلات: الوقت والمسار والحالة فقط. بدون IP، بدون نصوص، بدون صوت.
 */
import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import dns from "node:dns";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Agent, fetch as ufetch } from "undici";

const here = path.dirname(fileURLToPath(import.meta.url));
const ENV = { ...process.env };
const PORT = +ENV.PORT || 8787;
const DATA = ENV.DATA_DIR || "/var/lib/fatin";
const KV_DIR = path.join(DATA, "kv");
fs.mkdirSync(KV_DIR, { recursive: true, mode: 0o700 });

// ---------- شبكة آمنة: كل اتصال خارجي يُفحص عنوانه الفعلي ----------
const PRIVATE4 = [[0, 8], [10, 8], [100.64, 10], [127, 8], [169.254, 16], [172.16, 12], [192.168, 16], [198.18, 15], [224, 4], [240, 4]];
function ip4ToInt(ip) { return ip.split(".").reduce((a, x) => (a << 8) + (+x), 0) >>> 0; }
function cidr4(ip, base, bits) {
  const b = String(base).split(".").map(Number); while (b.length < 4) b.push(0);
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ip4ToInt(ip) & mask) === (ip4ToInt(b.join(".")) & mask);
}
export function privateIP(ip) {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return PRIVATE4.some(([b, n]) => cidr4(ip, b, n));
  const v = ip.toLowerCase();
  if (v.startsWith("::ffff:")) return privateIP(v.slice(7));
  return v === "::" || v === "::1" || /^(fc|fd)/.test(v) || /^fe[89ab]/.test(v) || v.startsWith("64:ff9b:") || v.startsWith("2001:db8");
}
const LOCAL_OK = new Set(["127.0.0.1", "localhost"]);   // نموذج الذكاء المحلي فقط (llama.cpp)
const allowLocal = host => LOCAL_OK.has(host) && ENV.LLM_URL && new URL(ENV.LLM_URL).hostname === host;
export function guardedLookup(host, opts, cb) {
  if (typeof opts === "function") { cb = opts; opts = {}; }
  dns.lookup(host, { ...opts, all: true }, (err, addrs) => {
    if (err) return cb(err);
    if (!allowLocal(host) && addrs.some(a => privateIP(a.address))) { const e = new Error("blocked private address"); e.code = "EBLOCKED"; return cb(e); }
    if (opts.all) return cb(null, addrs);
    cb(null, addrs[0].address, addrs[0].family);
  });
}
const agent = new Agent({ connect: { lookup: guardedLookup, timeout: 8000 }, headersTimeout: 15000, bodyTimeout: 20000 });
globalThis.fetch = (u, o = {}) => ufetch(u, { ...o, dispatcher: agent });

// ---------- التخزين على القرص (بديل Cloudflare KV) ----------
const fileOf = k => path.join(KV_DIR, crypto.createHash("sha256").update(k).digest("hex"));
const KV = {
  async get(k, type) {
    try {
      const meta = JSON.parse(await fsp.readFile(fileOf(k) + ".json", "utf8"));
      if (meta.exp && Date.now() > meta.exp) { this.delete(k); return null; }
      const buf = await fsp.readFile(fileOf(k));
      if (type === "arrayBuffer") return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      return buf.toString("utf8");
    } catch (e) { return null; }
  },
  async put(k, v, opt = {}) {
    const f = fileOf(k), tmp = f + "." + process.pid + ".tmp";
    const data = typeof v === "string" ? v : Buffer.from(v instanceof ArrayBuffer ? new Uint8Array(v) : v);
    await fsp.writeFile(tmp, data, { mode: 0o600 }); await fsp.rename(tmp, f);
    await fsp.writeFile(f + ".json", JSON.stringify({ exp: opt.expirationTtl ? Date.now() + opt.expirationTtl * 1000 : 0 }), { mode: 0o600 });
  },
  async delete(k) { await fsp.rm(fileOf(k), { force: true }); await fsp.rm(fileOf(k) + ".json", { force: true }); },
};
// تنظيف الملفات المنتهية كل ساعة (لوحة الأسرة 14 يوم، الصوت 30 يوم، الروابط 6 ساعات)
async function sweep() {
  try {
    for (const f of await fsp.readdir(KV_DIR)) if (f.endsWith(".json")) {
      const p = path.join(KV_DIR, f);
      try { const m = JSON.parse(await fsp.readFile(p, "utf8")); if (m.exp && Date.now() > m.exp) { await fsp.rm(p, { force: true }); await fsp.rm(p.slice(0, -5), { force: true }); } } catch (e) {}
    }
  } catch (e) {}
}
setInterval(sweep, 3600_000).unref(); sweep();

// ---------- السمع: whisper.cpp محليًا ----------
function run(cmd, args, ms) {
  return new Promise((ok, no) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] }); let out = "", err = "";
    const t = setTimeout(() => { p.kill("SIGKILL"); no(new Error("timeout")); }, ms);
    p.stdout.on("data", d => out += d); p.stderr.on("data", d => err += d);
    p.on("close", c => { clearTimeout(t); c === 0 ? ok(out) : no(new Error("exit " + c + " " + err.slice(-200))); });
    p.on("error", e => { clearTimeout(t); no(e); });
  });
}
async function whisper(b64, lang) {
  const bin = ENV.WHISPER_BIN || "/opt/whisper.cpp/build/bin/whisper-cli";
  const model = ENV.WHISPER_MODEL || "/opt/whisper.cpp/models/ggml-large-v3-turbo-q5_0.bin";
  const f = path.join(os.tmpdir(), "fatin-" + crypto.randomUUID() + ".wav");
  await fsp.writeFile(f, Buffer.from(b64, "base64"), { mode: 0o600 });
  try {
    const out = await run(bin, ["-m", model, "-f", f, "-l", lang || "ar", "-nt", "-np", "-t", String(Math.max(2, os.cpus().length))], 40000);
    return out.replace(/\s+/g, " ").trim();
  } finally { fsp.rm(f, { force: true }); }   // التسجيل يُحذف فورًا
}

// ---------- الذكاء الاصطناعي ----------
async function chat(messages, maxTokens) {
  const flat = messages.map(m => ({ role: m.role, content: typeof m.content === "string" ? m.content : (m.content || []).filter(p => p.type === "text").map(p => p.text).join("\n") }));
  const provider = ENV.AI_PROVIDER || "cloudflare";
  if (provider === "local") {
    const r = await fetch(ENV.LLM_URL || "http://127.0.0.1:8081/v1/chat/completions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: flat, max_tokens: maxTokens, temperature: 0.3 }) });
    if (!r.ok) throw new Error("llm " + r.status);
    const j = await r.json(); return { response: j.choices?.[0]?.message?.content || "" };
  }
  if (provider === "cloudflare") {   // مرحلة انتقالية: الخادم الحالي يرد، والباقي هنا داخل المملكة
    const r = await fetch((ENV.UPSTREAM || "https://fatin.hasa32054.workers.dev") + "/ai", { method: "POST", headers: { "content-type": "application/json", origin: "https://hasa32054-crypto.github.io" }, body: JSON.stringify({ messages: messages.filter(m => m.role !== "system"), max_tokens: maxTokens }) });
    if (!r.ok) throw new Error("upstream " + r.status);
    const j = await r.json(); return { response: j.text || "" };
  }
  throw new Error("no_ai");
}
const AI = {
  async run(model, input) {
    if (/whisper/.test(model)) {
      if (input.audio && typeof input.audio === "string") return { text: await whisper(input.audio, input.language) };
      if (Array.isArray(input.audio)) return { text: await whisper(Buffer.from(input.audio).toString("base64"), "ar") };
      throw new Error("audio");
    }
    return chat(input.messages || [], input.max_tokens || 600);
  },
};

const worker = (await import(path.join(here, "..", "worker.js"))).default;
const env = { ...ENV, FATIN_KV: KV, AI };
if ((ENV.AI_PROVIDER || "cloudflare") !== "anthropic") delete env.ANTHROPIC_API_KEY;   // المفتاح يُستخدم فقط إذا اخترته صراحة
const ctx = { waitUntil: p => Promise.resolve(p).catch(() => {}) };

// ---------- خادم HTTP (خلف Caddy) ----------
const MAX_BODY = 4 * 1024 * 1024;
const server = http.createServer(async (req, res) => {
  const t0 = Date.now();
  try {
    const chunks = []; let n = 0;
    for await (const c of req) { n += c.length; if (n > MAX_BODY) { res.writeHead(413).end(); return; } chunks.push(c); }
    const h = new Headers();
    for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string" && !/^(cf-connecting-ip|x-real-ip|host|connection|content-length|transfer-encoding)$/i.test(k)) h.set(k, v);
    // عنوان المستخدم: من Caddy فقط (اللي على نفس السيرفر)، وما يُكتب في أي سجل
    const fromProxy = /^(127\.0\.0\.1|::1|::ffff:127\.0\.0\.1)$/.test(req.socket.remoteAddress || "");
    const ip = fromProxy ? String(req.headers["x-real-ip"] || "").split(",")[0].trim() : req.socket.remoteAddress;
    if (ip) h.set("X-Real-IP", ip);
    const body = ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks);
    const r = await worker.fetch(new Request("https://fatin.local" + req.url, { method: req.method, headers: h, body }), env, ctx);
    const out = Buffer.from(await r.arrayBuffer());
    const hdr = {}; r.headers.forEach((v, k) => hdr[k] = v);
    res.writeHead(r.status, hdr).end(req.method === "HEAD" ? undefined : out);
    if (ENV.LOG !== "off") console.log(new Date().toISOString(), req.method, req.url.split("?")[0], r.status, (Date.now() - t0) + "ms");
  } catch (e) {
    if (!res.headersSent) res.writeHead(500, { "content-type": "application/json" }).end('{"error":"server"}');
    console.error(new Date().toISOString(), "error", req.method, (req.url || "").split("?")[0], e.code || e.name);
  }
});
server.listen(PORT, ENV.HOST || "127.0.0.1", () => console.log("fatin-saudi listening on", (ENV.HOST || "127.0.0.1") + ":" + PORT, "| ai:", ENV.AI_PROVIDER || "cloudflare"));
