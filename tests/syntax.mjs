// Syntax check for every JavaScript file and every inline <script> in the served HTML pages.
// Usage: node tests/syntax.mjs   (exit code 1 on any error)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { execFileSync } from "node:child_process";
import vm from "node:vm";

const ROOT = new URL("..", import.meta.url).pathname;
const SKIP = new Set(["node_modules", ".git", ".wrangler", ".wrangler-dry", "dist", "test-results"]);
const files = [];
(function walk(d) { for (const f of readdirSync(d)) { if (SKIP.has(f)) continue; const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else files.push(p); } })(ROOT);

let errors = 0, checked = 0;
const fail = (where, msg) => { errors++; console.error("✗ " + where + ": " + msg); };
for (const f of files) {
  const ext = extname(f), rel = relative(ROOT, f);
  if (ext === ".mjs" || ext === ".js" && (rel.startsWith("server/") || rel.startsWith("tools/") || rel.startsWith("tests/"))) {
    try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); checked++; } catch (e) { fail(rel, String(e.stderr).split("\n").slice(0, 4).join(" ")); }
  } else if (ext === ".js") {
    // browser scripts (classic scripts, not modules); app/src/js/* are fragments of one script, checked via the built HTML
    if (rel.startsWith("app/src/js/")) continue;
    try { new vm.Script(readFileSync(f, "utf8"), { filename: rel }); checked++; } catch (e) { fail(rel, e.message); }
  } else if (ext === ".json" || ext === ".webmanifest") {
    try { JSON.parse(readFileSync(f, "utf8")); checked++; } catch (e) { fail(rel, e.message); }
  }
}
for (const page of ["index.html", "app/index.html"]) {
  const html = readFileSync(join(ROOT, page), "utf8");
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g; let m, i = 0;
  while ((m = re.exec(html))) { i++; try { new vm.Script(m[1], { filename: page + "#script" + i }); checked++; } catch (e) { fail(page + " script " + i, e.message); } }
}
if (errors) { console.error(errors + " syntax error(s)"); process.exit(1); }
console.log("syntax OK: " + checked + " files/scripts checked");
