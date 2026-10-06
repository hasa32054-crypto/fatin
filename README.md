# فَطِن · سندك الذكي ضد الاحتيال

تطبيق بالذكاء الاصطناعي يكشف رسائل ومكالمات الاحتيال، ويحذّر كل شخص بالطريقة اللي تناسبه: بالصوت للكفيف، وبالألوان والاهتزاز للأصم، وبجملة واحدة لصاحب الإعاقة الذهنية.

- **الموقع:** https://hasa32054-crypto.github.io/fatin/
- **التطبيق:** https://hasa32054-crypto.github.io/fatin/app/ (يتثبّت على الجوال ويعمل بدون إنترنت)

## أبرز ما فيه
- فحص الرسائل في أقل من ثانية، مع تظليل الكلمات الخطيرة ومقارنة الرابط بالموقع الرسمي
- حارس المكالمات: تنبيه «أغلق المكالمة الآن» لما يطلب المتصل الرمز
- 6 أوضاع (عام، بصري، مبسّط، سمعي، لمسي، كبار السن) و10 لغات تلقائيًا
- محاكي محتال للتدريب، واختبار رسائل، و15 وسام على 3 مستويات
- لوحة الأسرة وكلمة سر العائلة، ونشرة سيبرانية بلغة بسيطة
- جولة «شاهد فطن في 60 ثانية» تتنقّل فيها بالأسهم بين كل الميزات

## الاختبار
- 99.98% كشف في 10,534 اختبار تحايل، و0% إنذار كاذب على 2,169 رسالة سليمة
- 12 من 12 حالة احتيال حقيقية منشورة

## الذكاء الاصطناعي
- **داخل تطبيق Claude:** كل الميزات تشتغل مباشرة.
- **من GitHub لكل الناس (مجاني، بدون مفتاح ولا بطاقة):** شغّل الخادم في مجلد `server` على Cloudflare (الخطوات في `server/README.md`)، وحط رابطه في `app/config.json`. يستخدم نموذج Llama 4 Scout المجاني من Cloudflare.
- **اختياري:** لو حطيت مفتاح Claude في الخادم، يستخدم Claude بدل النموذج المجاني.
- **بدون أي شي من هذا:** الفحص على الجهاز يشتغل كامل بدون إنترنت، والمحتال في التدريب يرد بنصوص جاهزة.

مسابقة «عزّنا بتمكينهم» · المسار ٠٣ «وطن يبتكر» · تعليم جدة
إعداد الطالب: حسان عبدالله الينبعاوي

## الخطة القادمة: تدريب بمكالمة حقيقية

- اتصال فعلي على جوال المستخدم من رقم تجريبي، والمحتال يتكلم بصوت مولّد بالذكاء الاصطناعي.
- الخادم يحلل المكالمة ويرسل تنبيهات فطن كإشعار على الجوال (الآيفون ما يسمح بالكتابة فوق شاشة المكالمة).
- المطلوب: حساب Twilio برقم مدفوع (تقريبًا ١–٢ دولار بالشهر + سعر الدقيقة) ويحتاج بطاقة بنكية، وإشعارات Web Push للتطبيق المثبّت.
- المكالمة تبدأ فقط بطلب المستخدم نفسه، وتقول من أول ثانية إنها تدريب من فطن.

## ترتيب النشر عند التحديث
1. **التطبيق أولًا:** ارفع مجلد `app/` والصفحة الرئيسية (GitHub Pages). النسخة الجديدة تشتغل مع الخادم القديم.
2. **ثم الخادم:** `cd server && npx wrangler deploy`. أول نشر ينشئ الـDurable Object (`FATIN_STATE`)، وبيانات الرادار والأسرة القديمة في KV تنتقل له تلقائيًا أول ما تُطلب.

التفاصيل التقنية الكاملة بالإنجليزي تحت.

---

# Technical documentation

## Architecture

```
app/src/  ──tools/build.mjs──▶  app/index.html      the app: one page, inline CSS/JS, hash-based CSP
(sources)                       app/i18n/<lang>.json one language pack per non-Arabic language, loaded on demand
                                app/sw.js            service worker; its cache name is a hash of everything it serves
                                index.html           the landing page (CSP updated in place)
                                dist/fatin-single.html  (--single) everything inlined, for running inside the Claude app
app/vendor/, app/fonts/  ◀──tools/vendor.mjs── pinned npm packages (QR libraries, fonts), self-hosted
server/worker.js         Cloudflare Worker: AI tasks, voice, family board, scam radar
shared/tables.json ──tools/sync-tables.mjs──▶ the copy inside server/worker.js (patterns, brands, languages, characters)
```

**Frontend.** A single-page PWA written as classic scripts. Sources live in `app/src/` (`index.html` template, `css/`, `html/app.html`, `js/` modules, `i18n/`, `sw.js`); `tools/build.mjs` stitches them together with `@@include`, computes CSP hashes and writes the served files. Never edit `app/index.html`, `app/i18n/*` or `app/sw.js` by hand: CI fails if they differ from a fresh build (`npm run build:check`).

- `js/engine.js` – `FatinEngine`, the on-phone detector (patterns, brand/URL look-alikes, scoring). It runs offline and sends nothing.
- `js/hooks.js` – `hook(when, name, fn)` / `hookable(name, core)`: later modules extend earlier functions through explicit before/map/after hooks instead of re-wrapping globals.
- `js/config.js` – timings and endpoints in one place (`CONFIG`).
- `js/api-client.js` – the only code that talks to the Fatin server (`/ai`, `/tts`, `/stt`, `/radar`, `/family`).
- `js/privacy.js`, `js/privacy-ui.js` – redaction before anything leaves the phone, and the two cloud switches.
- `js/a11y.js` – dialog focus management (focus in, Tab trap, Escape, focus return).
- `js/ui-translate.js` – maps remaining Arabic interface strings to the chosen language (`UI_TR` from the language pack, `UI_PAT` for strings with numbers or names).
- Arabic is built into the page; the nine other languages (en, ur, hi, bn, tl, id, zh, es, fr) are fetched from `app/i18n/` when chosen and cached by the service worker.

**Backend.** `server/worker.js` is one Cloudflare Worker:

| Route | Purpose |
|---|---|
| `POST /ai` | A named task (`scan`, `ocr`, `ask`, `sim`, `call`) with its data. The server writes the prompt; the client cannot send instructions or roles. Workers AI (free) by default, Claude when `ANTHROPIC_API_KEY` is set. |
| `GET/POST /tts` | Natural voice (Azure or ElevenLabs). Only the fixed training lines are cached (30 days). |
| `POST /stt` | Speech to text for practice calls (Workers AI Whisper). |
| `GET/POST /radar` | Daily count of reports per known scam pattern; no message text. At most 3 reports per address per pattern per day count. |
| `GET/POST /family/<CODE>`, `POST /family/<CODE>/claim` | Family alert board. The phone that creates a code claims it with a random sender key (stored as a SHA-256 hash); only that phone can post, anyone with the code can read. Alerts are fixed shapes, kept 14 days. |

Radar and family state live in a **Durable Object** (`FatinState`, SQLite-backed), so simultaneous writes are never lost; without the binding the worker falls back to KV (works, but concurrent writes can be lost). Legacy KV data is migrated into the Durable Object on first access.

**Data flow.** Message → `FatinEngine` on the phone (instant verdict, works offline) → if cloud AI is on and the message has nothing sensitive, the redacted text goes to `/ai` for a second opinion → the verdict is shown, spoken or vibrated depending on the user's mode. Family alerts and radar reports carry only fixed alert types and pattern ids.

## Privacy

- The first check always runs on the phone. Cloud features (AI, natural voice) have switches in **Settings → Privacy** and can be turned off.
- Before text leaves the phone, verification codes, card numbers (Luhn-checked), IBANs, CVVs, passwords and Saudi ID numbers are masked; a message containing them is checked on the phone only unless the user explicitly sends it.
- The user's name, mode and progress stay in `localStorage` on the phone. A personal Claude key, if entered, is kept in `sessionStorage` only (gone when the tab closes).
- The server stores: radar counts per pattern per day; family alerts (type, time, first name) for 14 days; cached audio for fixed training lines. It does not store message text, AI replies or IP addresses; the per-minute limiter is in memory, and radar de-duplication keeps a truncated hash of address + pattern with a salt that is replaced every day.
- Pages send no referrer, and fonts and libraries are self-hosted, so no third-party CDN sees the visit.

## Security

- **CSP** on both pages: inline scripts allowed only by SHA-256 hash (no `unsafe-inline`/`unsafe-eval` for scripts), `connect-src` limited to the site, the Fatin server and `api.anthropic.com` (in-Claude mode), `object-src 'none'`, `frame-src 'none'`, `base-uri 'self'`, `form-action 'self'`. Inline styles are still allowed (`style-src 'unsafe-inline'`) because the app sets styles from script.
- **Worker:** strict Origin check on writes (`ALLOWED_ORIGIN`), per-IP rate limits (Cloudflare Rate Limiting bindings `RL_*`, with an in-memory fallback), body size limits, allow-listed task names and alert shapes, daily caps (`DAILY_CAP`, `TTS_DAILY_CAP`, `STT_DAILY_CAP`), upstream timeouts (`UPSTREAM_TIMEOUT_MS`), security headers on every response, and generic error bodies.
- **Secrets** are Worker secrets only (`wrangler secret put …`), never in `wrangler.toml` or the repo. `npm run check:secrets` scans the tree in CI.

## Configuration

`app/config.json` – `{ "server": "https://<worker>.workers.dev" }`. The build adds this origin to the CSP, so **rebuild after changing it** (`npm run build`).

Worker bindings (`server/wrangler.toml`):

| Binding | Required | Notes |
|---|---|---|
| `AI` | yes | Workers AI |
| `FATIN_KV` | yes | set `id` to your KV namespace id |
| `FATIN_STATE` | recommended | Durable Object, class `FatinState`, migration `v1` (`new_sqlite_classes`) |
| `RL_AI`, `RL_TTS`, `RL_STT`, `RL_WRITE`, `RL_RADAR`, `RL_READ` | recommended | Rate Limiting; `namespace_id` must be unique in your account |

Worker variables and secrets (all optional):

| Name | Kind | Default / purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | secret | use Claude instead of the free model |
| `MODEL`, `FREE_MODEL` | var | model ids |
| `DAILY_CAP` | var | 400 Claude requests a day |
| `ALLOWED_ORIGIN` | var | `https://hasa32054-crypto.github.io` (comma-separated list allowed) |
| `ALLOW_LOCALHOST` | var | `1` to allow `http://localhost` during development |
| `UPSTREAM_TIMEOUT_MS` | var | 25000 for AI, 20000 for voice |
| `AZURE_TTS_KEY` (secret), `AZURE_TTS_REGION`, `AZURE_VOICE_CALLER`, `AZURE_VOICE_FATIN` | | Azure voice |
| `ELEVENLABS_API_KEY` (secret), `VOICE_CALLER`, `VOICE_FATIN`, `TTS_MODEL` | | ElevenLabs voice |
| `TTS_DAILY_CAP`, `STT_DAILY_CAP` | var | 1500 each |

## Deployment

Order matters: **app first, then worker.** The new app works with the previous worker; the new worker then takes over and migrates stored state.

1. `npm ci && npm test` – everything green.
2. Commit the built files (`app/index.html`, `app/i18n/`, `app/sw.js`, `index.html`) with their sources; GitHub Pages serves the repo root.
3. Wait for Pages to publish, then deploy the worker:
   ```
   cd server
   npx wrangler kv namespace create fatin-data     # first time only; put the id in wrangler.toml
   npx wrangler secret put ANTHROPIC_API_KEY        # optional
   npx wrangler deploy                              # applies the Durable Object migration v1
   ```
4. Check: `curl https://<worker>/` returns `{"service":"fatin","ok":true}`; open the app, run a scan, open the family board.

Deploying from the Cloudflare dashboard by pasting `worker.js` also works (see `server/README.md`), but then the Durable Object and Rate Limiting bindings are not created, and the worker uses its KV and in-memory fallbacks.

## Local development

```
npm ci
npm run build            # after any change under app/src or app/config.json
npx serve .              # or any static server; open /app/
cd server && npx wrangler dev   # local worker (set ALLOW_LOCALHOST=1 in server/.dev.vars)
```
Other tools: `npm run sync` (after editing `shared/tables.json`), `npm run vendor` (after bumping a vendored package), `npm run build:single` (single-file build for the Claude app), `node tools/check-news.mjs` (bulletin, see `tools/NEWS-UPDATE.md`).

## Testing

| Command | What it covers |
|---|---|
| `npm run build:check`, `vendor:check`, `check:sync` | built and vendored files match their sources |
| `npm run check:syntax`, `check:news`, `check:secrets` | every script parses; the bulletin is valid; no credentials in the tree |
| `npm run test:unit` | detection engine against golden results, privacy redaction, secret scanner |
| `npm run test:worker` | worker routes, validation, limits, state store; a real-runtime race (`wrangler dev`) with 150 simultaneous radar reports and 25 family alerts |
| `npm run test:e2e` | Playwright/Chromium: every view in all 10 languages, offline and service-worker updates, privacy, CSP, family flow against the real worker code, prompt parity, accessibility (focus, contrast, text size, untranslated text) |
| `npm run deploy:dry` | the worker bundles and its bindings are valid |

`npm test` runs all of them except the dry run. Tests use Playwright's Chromium (`npx playwright install chromium`), or set `CHROMIUM_PATH`. Diagnostic tools that are not tests live in `tests/tools/` (performance, contrast, clipping, untranslated-text scans, screenshots).

**CI** (`.github/workflows/ci.yml`) runs the checks, the deploy dry run, unit and worker tests, and the browser tests on every push and pull request; any failure fails the run.

## License

Copyright © 2026 حسان عبدالله الينبعاوي. All rights reserved. See [LICENSE](LICENSE). Third-party components keep their own licenses: `app/vendor/LICENSES.txt` (qrcodejs, MIT; jsQR, Apache-2.0) and `app/fonts/OFL.txt` (Alexandria and IBM Plex Sans Arabic, SIL Open Font License 1.1).
