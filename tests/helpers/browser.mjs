// Launches Chromium for tests. In CI Playwright's own Chromium is used; locally a preinstalled one can be
// pointed to with CHROMIUM_PATH (or the managed path below when it exists).
import { chromium } from "playwright";
import { existsSync } from "node:fs";

export function chromiumPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  if (existsSync("/opt/pw-browsers/chromium")) return "/opt/pw-browsers/chromium";
  return undefined;
}
export const launch = (opts = {}) => chromium.launch({ executablePath: chromiumPath(), ...opts });
export const launchPersistent = (dir, opts = {}) => chromium.launchPersistentContext(dir, { executablePath: chromiumPath(), ...opts });
// third-party hosts are never needed by the tests (and are blocked in some sandboxes)
export const EXTERNAL = /googleapis|gstatic|cdnjs|jsdelivr|workers\.dev|anthropic\.com|elevenlabs|microsoft\.com/;
export async function blockExternal(page) { await page.route(EXTERNAL, r => r.abort()); }
// a returning user who already finished sign-in and onboarding, in the given language
export function returningUser(lang = "ar") {
  return { origins: [] , init: `try{ localStorage.setItem("fatin-onb","1"); localStorage.setItem("fatin-dis-asked","1");
    localStorage.setItem("fatin-profile", JSON.stringify({n:"حسان",g:"m"})); localStorage.setItem("fatin-lang", JSON.stringify(${JSON.stringify(lang)})); }catch(e){}` };
}
