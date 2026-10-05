// Loads the detection engine (app/src/js/engine.js) in Node. The engine is plain JavaScript with no
// DOM or network access, so it runs here exactly as in the browser.
import { readFileSync } from "node:fs";
import vm from "node:vm";
export function loadEngine() {
  const code = readFileSync(new URL("../../app/src/js/engine.js", import.meta.url), "utf8");
  const ctx = {}; vm.createContext(ctx);
  vm.runInContext(code + "\n;this.FatinEngine = FatinEngine;", ctx);
  return ctx.FatinEngine;
}
