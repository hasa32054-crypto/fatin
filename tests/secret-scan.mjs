// Fails if a credential is committed: API keys, tokens, private keys. Scans every file git tracks or would add
// (the working tree minus .gitignore, which includes the built app). Exit code 1 on any finding.
// Usage: node tests/secret-scan.mjs
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
export const RULES = [
  ["Anthropic API key", /sk-ant-(?:api|admin)\d{2}-[A-Za-z0-9_-]{40,}/],
  ["Anthropic API key (other form)", /sk-ant-[A-Za-z0-9_-]{60,}/],
  ["ElevenLabs API key", /\bsk_[a-f0-9]{48}\b/],
  ["OpenAI API key", /\bsk-(?:proj-)?[A-Za-z0-9]{40,}\b/],
  ["GitHub token", /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{60,}\b/],
  ["AWS access key", /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["Slack token", /\bxox[abposr]-[A-Za-z0-9-]{10,}\b/],
  ["Stripe key", /\b(?:sk|rk)_live_[A-Za-z0-9]{20,}\b/],
  ["Private key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/],
  ["Cloudflare API token in config", /\b(?:CLOUDFLARE_API_TOKEN|CF_API_TOKEN)\s*[=:]\s*["']?[A-Za-z0-9_-]{30,}/],
  ["Secret assigned in wrangler.toml [vars]", /^\s*(?:ELEVENLABS_API_KEY|ANTHROPIC_API_KEY)\s*=\s*"[^"]{8,}"/m],
];
export function scanText(text) {
  const out = [];
  for (const [name, re] of RULES) {
    const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"); let m;
    while ((m = g.exec(text))) out.push({ name, line: text.slice(0, m.index).split("\n").length, match: m[0] });
  }
  return out;
}
const SKIP = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|pdf|zip)$/i;
if (import.meta.url === "file://" + process.argv[1]) {
  const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean);
  const findings = [];
  for (const f of files) {
    if (SKIP.test(f) || f === "tests/secret-scan.mjs") continue;
    let st; try { st = statSync(ROOT + f); } catch (e) { continue; }   // deleted in the working tree
    if (!st.isFile() || st.size > 5e6) continue;
    for (const x of scanText(readFileSync(ROOT + f, "utf8"))) findings.push(`${f}:${x.line}  ${x.name}  ${x.match.slice(0, 12)}…`);
  }
  if (findings.length) { console.error("Possible secrets found:\n  " + findings.join("\n  ")); process.exit(1); }
  console.log(`secret scan: ${files.length} files, no secrets found`);
}
