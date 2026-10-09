// يحدّث بصمات السكربتات الداخلية في CSP بعد أي تعديل:  node tools/csp-hash.mjs app/index.html index.html
import fs from "node:fs"; import crypto from "node:crypto";
for (const f of process.argv.slice(2)) {
  let s = fs.readFileSync(f, "utf8");
  const hs = [...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => "'sha256-" + crypto.createHash("sha256").update(m[1]).digest("base64") + "'");
  const n = s.replace(/(script-src 'self')((?: 'sha256-[^']+')*)/, (_, a) => a + (hs.length ? " " + hs.join(" ") : ""));
  if (n === s) { console.log(f + ": بدون تغيير"); continue; }
  fs.writeFileSync(f, n); console.log(f + ": " + hs.length + " بصمات");
}
