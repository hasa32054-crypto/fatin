// The tables the app and the server must agree on live in shared/tables.json (brands, radar patterns,
// training characters, languages, family alert shapes). The server is one file (so it can be pasted in
// the Cloudflare dashboard), so this writes the tables into its generated block.
//   node tools/sync-tables.mjs          update server/worker.js
//   node tools/sync-tables.mjs --check  fail if server/worker.js is out of date (CI)
// The app side is checked against the same file by tests/e2e/shared-tables.test.mjs.
import { readFileSync, writeFileSync } from "node:fs";
const ROOT = new URL("..", import.meta.url).pathname;
const tables = JSON.parse(readFileSync(ROOT + "shared/tables.json", "utf8"));
const file = ROOT + "server/worker.js", src = readFileSync(file, "utf8");
const re = /(\/\* @@shared-tables:[^\n]*\*\/\n)const TABLES = [\s\S]*?;\n(\/\* @@shared-tables-end \*\/)/;
if (!re.test(src)) { console.error("server/worker.js has no @@shared-tables block"); process.exit(1); }
const out = src.replace(re, (_, a, b) => a + "const TABLES = " + JSON.stringify(tables) + ";\n" + b);
if (process.argv.includes("--check")) {
  if (out !== src) { console.error("server/worker.js tables are out of date: run npm run sync"); process.exit(1); }
  console.log("server tables match shared/tables.json");
} else { writeFileSync(file, out); console.log("server/worker.js tables updated from shared/tables.json"); }
