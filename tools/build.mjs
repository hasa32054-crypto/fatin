// Builds the served app from the sources in app/src.
//
//   node tools/build.mjs            write app/index.html and app/i18n/*.json
//   node tools/build.mjs --check    fail if the committed output is not what the sources build (CI)
//   node tools/build.mjs --single   write dist/fatin-single.html: one self-contained file for the Claude app
//                                   (all languages inlined, no service worker or page security policy)
//
// app/src/index.html lists the sources with "@@include <path>" lines. Each include is replaced by the file's
// text, in order, so the JavaScript modules end up in the same <script> blocks and run in the same order as
// one file (function hoisting and shared globals behave exactly as before they were split).
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "app", "src");
const args = new Set(process.argv.slice(2));
const sha = (s, n = 12) => createHash("sha256").update(s).digest("hex").slice(0, n);

function expand(template) {
  return template.split("\n").map(line => {
    const m = line.match(/^@@include (\S+)$/);
    if (!m) return line;
    const file = join(SRC, m[1]);
    if (!existsSync(file)) throw new Error("missing include: " + m[1]);
    return readFileSync(file, "utf8").replace(/\n$/, "");
  }).join("\n");
}

// language packs: app/src/i18n/<lang>.json → app/i18n/<lang>.json (compact)
function packs() {
  const out = {};
  for (const f of readdirSync(join(SRC, "i18n")).filter(f => f.endsWith(".json")).sort())
    out[f.replace(/\.json$/, "")] = JSON.stringify(JSON.parse(readFileSync(join(SRC, "i18n", f), "utf8")));
  return out;
}

// Content-Security-Policy for a page: scripts only from this site plus the exact inline scripts of the
// page (by hash, so no 'unsafe-inline' and no eval); network only to this site, the Fatin server named
// in app/config.json, and api.anthropic.com for the optional own-key mode.
function serverOrigin() {
  try { const c = JSON.parse(readFileSync(join(ROOT, "app", "config.json"), "utf8")); return c.server ? new URL(c.server).origin : ""; } catch (e) { return ""; }
}
export function csp(html, { connect = [] } = {}) {
  const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => `'sha256-${createHash("sha256").update(m[1]).digest("base64")}'`);
  return [
    "default-src 'self'", `script-src 'self' ${hashes.join(" ")}`.trim(), "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:", "font-src 'self'", "media-src 'self' data: blob:", ["connect-src 'self'", ...connect].join(" "),
    "worker-src 'self'", "manifest-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-src 'none'",
  ].join("; ");
}
const CSP_META = /<meta http-equiv="Content-Security-Policy" content="[^"]*">/;
function withCsp(html, opts) { if (!CSP_META.test(html)) throw new Error("page has no CSP meta tag"); return html.replace(CSP_META, () => `<meta http-equiv="Content-Security-Policy" content="${csp(html, opts)}">`); }

export function buildApp({ single = false } = {}) {
  const langPacks = packs();
  const version = sha(Object.entries(langPacks).map(([k, v]) => k + v).join("\n"));
  let html = expand(readFileSync(join(SRC, "index.html"), "utf8")).replace('"@@I18N_VERSION@@"', JSON.stringify(version));
  // the font faces are inlined (no extra render-blocking request); their files stay in app/fonts
  html = html.replace("@@fonts-css", readFileSync(join(ROOT, "app", "fonts", "fonts.css"), "utf8").trim().replace(/url\(([^)]+)\)/g, "url(fonts/$1)"));
  const out = {};
  if (single) {
    const inline = "{" + Object.entries(langPacks).map(([k, v]) => JSON.stringify(k) + ":" + v).join(",") + "}";
    html = html.replace("I18N_INLINE=null", "I18N_INLINE=" + inline).replace(CSP_META, "");   // the Claude app sets its own policy
    out["dist/fatin-single.html"] = html;
    return out;
  }
  out["app/index.html"] = withCsp(html, { connect: [serverOrigin(), "https://api.anthropic.com"].filter(Boolean) });
  out["index.html"] = withCsp(readFileSync(join(ROOT, "index.html"), "utf8"), {});   // the landing page keeps its own source
  for (const [k, v] of Object.entries(langPacks)) out[`app/i18n/${k}.json`] = v + "\n";
  // the service worker's cache name is a hash of everything the app serves (page, packs, fonts, libraries, icons, manifest)
  const served = [out["app/index.html"], ...Object.values(langPacks)];
  for (const d of ["app/fonts", "app/vendor", "app/icons"]) for (const f of readdirSync(join(ROOT, d)).sort()) served.push(d + "/" + f, readFileSync(join(ROOT, d, f)));
  served.push(readFileSync(join(ROOT, "app/manifest.webmanifest")));
  const h = createHash("sha256"); for (const x of served) h.update(x); 
  out["app/sw.js"] = readFileSync(join(SRC, "sw.js"), "utf8").replace("@@VERSION@@", h.digest("hex").slice(0, 12));
  return out;
}

// run as a command (node tools/build.mjs …); importing this file only exposes buildApp and csp
if (import.meta.url === `file://${process.argv[1]}`) {
const outputs = buildApp({ single: args.has("--single") });
if (args.has("--check")) {
  const stale = Object.entries(outputs).filter(([path, text]) => !existsSync(join(ROOT, path)) || readFileSync(join(ROOT, path), "utf8") !== text).map(([p]) => p);
  // nothing in app/i18n that the sources do not produce
  const extra = existsSync(join(ROOT, "app/i18n")) ? readdirSync(join(ROOT, "app/i18n")).map(f => "app/i18n/" + f).filter(p => !(p in outputs)) : [];
  if (stale.length || extra.length) { console.error("Out of date (run: npm run build): " + [...stale, ...extra].join(", ")); process.exit(1); }
  console.log("build output is up to date: " + Object.keys(outputs).length + " files");
} else {
  for (const [path, text] of Object.entries(outputs)) { mkdirSync(dirname(join(ROOT, path)), { recursive: true }); writeFileSync(join(ROOT, path), text); }
  console.log("built: " + Object.keys(outputs).join(", "));
}
}
