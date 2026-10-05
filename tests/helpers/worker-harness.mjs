// Runs the real Cloudflare Worker code (server/worker.js) inside Node for end-to-end tests:
// the browser's requests to the Fatin server are routed to worker.fetch() with in-memory bindings.
//   const h = await workerHarness();   h.env (bindings), h.seen (requests), h.store (KV map)
//   await h.attach(page, "https://fatin.example.workers.dev")
import { durableObjects } from "./do-mock.mjs";
let n = 0;
export function memoryKV() {
  const store = new Map(); let writes = 0;
  return { store, get writes() { return writes; },
    async get(k, type) { const v = store.get(k); return v == null ? null : type === "json" ? JSON.parse(v) : v; },
    async put(k, v) { writes++; store.set(k, v); }, async delete(k) { store.delete(k); } };
}
// a scripted model: answers by task, recognised from the prompt the server wrote
export const scriptedAI = {
  calls: [],
  async run(model, input) {
    scriptedAI.calls.push({ model, input });
    if (model.includes("whisper")) return { text: "ما أعطي الرمز" };
    const p = input.messages.map(m => typeof m.content === "string" ? m.content : m.content.map(c => c.text || "").join("\n")).join("\n");
    if (p.includes('"level"')) return { response: '{"level":"danger","score":90,"reasons":["يطلب رمز التحقق"],"simple":"لا ترد"}' };
    if (p.includes("outcome")) return { response: '{"reply":"يا أخوي العملية بتتم الحين، عطني الرمز","tip":"استعجال","outcome":"continue"}' };
    if (p.includes("سطر الشخصية")) return { response: '{"reply":"أنا من البنك، عطني الرمز بسرعة"}' };
    if (p.includes("اقرأ النص")) return { response: '{"text":"نص من الصورة"}' };
    return { response: "لا تعطِ **الرمز** لأحد." };
  },
};
export async function workerHarness(extraEnv = {}) {
  const W = (await import("../../server/worker.js?h=" + ++n));
  const edge = new Map();
  globalThis.caches = { default: { async match(k) { const r = edge.get(String(k)); return r ? r.clone() : undefined; }, async put(k, r) { edge.set(String(k), r); } } };
  globalThis.fetch = async () => new Response(new Uint8Array(3000).fill(7), { status: 200, headers: { "content-type": "audio/mpeg" } }); // voice provider
  const kv = memoryKV();
  const env = { AI: scriptedAI, FATIN_KV: kv, ELEVENLABS_API_KEY: "test-key", ALLOW_LOCALHOST: "1", ...extraEnv };
  if (!("FATIN_STATE" in extraEnv)) env.FATIN_STATE = durableObjects(W.FatinState, env);   // like production: radar and family in the Durable Object
  else if (!extraEnv.FATIN_STATE) delete env.FATIN_STATE;
  const seen = [];
  const ctx = { waits: [], waitUntil(p) { this.waits.push(p); } };
  return {
    worker: W, env, seen, store: kv.store, kv, edge, ctx,
    async fetch(req) { return W.default.fetch(req, env, ctx); },
    async attach(page, base = "https://fatin.hasa32054.workers.dev", { ip = "10.0.0.1" } = {}) {   // each simulated phone can have its own address
      await page.route(url => url.href.startsWith(base), async route => {
        const rq = route.request(); const body = rq.postDataBuffer(); const u = new URL(rq.url());
        const headers = { ...rq.headers(), "cf-connecting-ip": ip, ...(body ? { "content-length": String(body.length) } : {}) };
        const res = await W.default.fetch(new Request(rq.url(), { method: rq.method(), headers, body: body && rq.method() !== "GET" ? body : undefined }), env, ctx);
        let parsed = null; if (body && (rq.headers()["content-type"] || "").includes("json")) { try { parsed = JSON.parse(body.toString()); } catch (e) {} }
        seen.push({ path: u.pathname, search: u.search, method: rq.method(), status: res.status, body: parsed });
        await route.fulfill({ status: res.status, headers: Object.fromEntries(res.headers), body: Buffer.from(await res.arrayBuffer()) });
      });
    },
    last(path, method = "POST") { return [...seen].reverse().find(s => s.path === path && s.method === method); },
  };
}
