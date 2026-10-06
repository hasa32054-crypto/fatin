// A small stand-in for Cloudflare Durable Objects in Node tests: one instance per name, in-memory
// storage (values are cloned like the real storage), blockConcurrencyWhile as a real mutex, and alarms.
export function durableObjects(Cls, env) {
  const objects = new Map();
  function instance(name) {
    if (objects.has(name)) return objects.get(name);
    const data = new Map(); let chain = Promise.resolve();
    const storage = {
      async get(k) { return data.has(k) ? structuredClone(data.get(k)) : undefined; },
      async put(k, v) { if (typeof k === "object") for (const [a, b] of Object.entries(k)) data.set(a, structuredClone(b)); else data.set(k, structuredClone(v)); },
      async delete(k) { data.delete(k); }, async deleteAll() { data.clear(); },
      alarm: null, async setAlarm(t) { this.alarm = t; }, async getAlarm() { return this.alarm; },
    };
    const ctx = { storage, blockConcurrencyWhile(fn) { const r = chain.then(fn); chain = r.catch(() => {}); return r; } };
    const o = { data, storage, obj: new Cls(ctx, env) }; objects.set(name, o); return o;
  }
  return {
    objects,
    idFromName: name => name,
    get: id => ({ fetch: (url, init) => instance(id).obj.fetch(new Request(url, init)) }),
    async fireAlarm(name) { await instance(name).obj.alarm(); },
  };
}
