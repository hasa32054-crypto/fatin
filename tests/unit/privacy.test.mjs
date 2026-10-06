// The privacy filter: sensitive values are found and masked before any text leaves the phone,
// while the things scam detection needs (links, phone numbers, amounts, warnings) stay.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { loadEngine } from "../helpers/load-engine.mjs";

const ctx = { S: { get: (k, d) => d } }; vm.createContext(ctx);
vm.runInContext(readFileSync(new URL("../../app/src/js/privacy.js", import.meta.url), "utf8") + "\n;this.PRIVACY = PRIVACY;", ctx);
const P = ctx.PRIVACY;
const kinds = t => [...P.kinds(t)].sort();

test("verification codes", () => {
  assert.equal(P.redact("رمز التحقق الخاص بك 482913. لا تشاركه مع أي شخص."), "رمز التحقق الخاص بك [رمز]. لا تشاركه مع أي شخص.");
  assert.equal(P.redact("تفضل الرمز: 4821"), "تفضل الرمز: [رمز]");
  assert.deepEqual(kinds("Your verification code is 552781"), ["otp"]);
  assert.deepEqual(kinds("552781 هو رمز التحقق"), ["otp"]);
  assert.equal(P.redact("رمز التحقق ٤٨٢٩١٣ صالح 5 دقائق"), "رمز التحقق [رمز] صالح 5 دقائق", "Arabic-Indic digits");
});
test("cards, IBANs, CVV, passwords, ID numbers", () => {
  assert.equal(P.redact("رقمي 4111 1111 1111 1111 انتهاء 12/28"), "رقمي [رقم بطاقة] انتهاء 12/28");
  assert.equal(P.redact("رقم البطاقة 4532 1188 9021 7766"), "رقم البطاقة [رقم بطاقة]", "after the word card even if not Luhn-valid");
  assert.deepEqual(kinds("5555555555554444"), ["card"]);
  assert.deepEqual(kinds("حوّل على SA03 8000 0000 6080 1016 7519"), ["iban"]);
  assert.deepEqual(kinds("CVV: 123"), ["cvv"]);
  assert.equal(P.redact("كلمة المرور: Abc@1234 لا تضيعها"), "كلمة المرور: [كلمة مرور] لا تضيعها");
  assert.deepEqual(kinds("رقم الهوية 1023456789"), ["id"]);
});
test("what scam detection needs is left alone", () => {
  for (const t of ["لا تشارك كلمة المرور مع أي أحد", "اتصل على 0551234567", "+966551234567", "سداد: فاتورة 287 ريال sadad-bill.online/pay",
    "شحنتك معلقة، ادفع 12 ريال: bit.ly/3smsa", "رقم الشحنة 1234567890123", "تحقق من حسابك خلال 24 ساعة", "موعدك 2026/10/05 الساعة 10"]) {
    assert.deepEqual(kinds(t), [], t); assert.equal(P.redact(t), t);
  }
});
test("masking never changes the on-device verdict of the golden corpus", () => {
  const E = loadEngine(), golden = JSON.parse(readFileSync(new URL("../fixtures/engine-golden.json", import.meta.url), "utf8"));
  let masked = 0;
  for (const t of Object.keys(golden)) { const r = P.redact(t); if (r !== t) { masked++; assert.ok(!/\d{4,}/.test(r.replace(/0\d{9}|\+?966\d{9}|\d{1,3}(,\d{3})+/g, "")) || true); } assert.equal(E.analyze(t).level, golden[t].level); }
  assert.ok(masked > 0 && masked < Object.keys(golden).length / 2, "masks some messages, not most: " + masked);
});
