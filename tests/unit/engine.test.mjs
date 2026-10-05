// The on-device detection engine must keep giving exactly the same verdicts.
// tests/fixtures/engine-golden.json was captured from the app before any refactoring: every message
// the app ships (examples, quiz in 10 languages, challenges, news, training scripts) plus generated
// variants for every brand. Regenerate it only for an intended change to detection.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { loadEngine } from "../helpers/load-engine.mjs";

const golden = JSON.parse(readFileSync(new URL("../fixtures/engine-golden.json", import.meta.url), "utf8"));
const E = loadEngine();
const view = r => ({ level: r.level, score: r.score, ids: [...new Set(r.ids || [])].sort(), brands: r.brands, links: r.links, reasons: r.reasons, signals: r.signals });

test("engine verdicts match the golden corpus", () => {
  const diffs = Object.entries(golden).filter(([t, exp]) => JSON.stringify(view(E.analyze(t))) !== JSON.stringify(exp)).map(([t]) => t);
  assert.equal(diffs.length, 0, "changed verdicts:\n" + diffs.slice(0, 10).join("\n"));
  assert.ok(Object.keys(golden).length > 400);
});

test("engine basics", () => {
  assert.equal(E.analyze("أبشر: تم تعليق خدماتك لعدم تحديث بياناتك. حدّثها خلال 24 ساعة: absher-sa-update.xyz").level, "danger");
  assert.equal(E.analyze("هلا، وين وصلت؟").level, "safe");
  const r = E.analyze("رمز التحقق الخاص بك 482913. لا تشاركه مع أي شخص.");
  assert.equal(r.level, "safe");
  assert.ok(E.brandNames().includes("أبشر"));
});
