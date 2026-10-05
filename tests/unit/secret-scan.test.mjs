// The secret scan must catch real-looking keys (built here at run time, so this file holds none) and ignore the app's own key check.
import { test } from "node:test";
import assert from "node:assert/strict";
import { scanText } from "../secret-scan.mjs";

const r = (n, chars = "aB3dE5fG7h") => Array.from({ length: n }, (_, i) => chars[i % chars.length]).join("");
test("finds planted credentials", () => {
  const planted = [
    ["Anthropic API key", "sk-ant-" + "api03-" + r(90)],
    ["ElevenLabs API key", "sk_" + r(48, "0123456789abcdef")],
    ["GitHub token", "gh" + "p_" + r(36)],
    ["AWS access key", "AK" + "IA" + "ABCDEFGHIJKLMNOP"],
    ["Private key", "-----BEGIN " + "PRIVATE KEY-----"],
    ["Secret assigned in wrangler.toml [vars]", "[vars]\nELEVENLABS_API_KEY = \"" + r(20) + "\""],
  ];
  for (const [name, text] of planted) assert.ok(scanText("x\n" + text + "\n").some(f => f.name === name), name);
});
test("ignores the app's key format check and short test placeholders", () => {
  assert.deepEqual(scanText('if(!/^sk-ant-[A-Za-z0-9_\\-]{20,}$/.test(k))'), []);
  assert.deepEqual(scanText('sessionStorage.setItem("fatin-ai-key", "sk-ant-test")'), []);
  assert.deepEqual(scanText('wrangler secret put ELEVENLABS_API_KEY'), []);
});
