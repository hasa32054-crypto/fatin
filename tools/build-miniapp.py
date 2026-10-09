#!/usr/bin/env python3
"""يبني حزمة «فطن» المصغّرة للتطبيقات الشاملة (مثل توكلنا): store/fatin-miniapp.zip
   python3 tools/build-miniapp.py
- نفس التطبيق، بوضع التضمين (بدون أزرار التثبيت وبدون Service Worker)، وكل الملفات محلية داخل الحزمة.
- يضيف <script src="twkhelper.js"> — الملف تعطيه منصة توكلنا للشريك، ويُوضع بجانب index.html قبل الرفع.
"""
import hashlib, base64, re, zipfile, pathlib, json
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "app/index.html").read_text(encoding="utf-8")
html = html.replace('<html lang="ar" dir="rtl"', '<html lang="ar" dir="rtl" data-embed="1"', 1)
if 'data-embed="1"' not in html:
    html = re.sub(r"<html\b", '<html data-embed="1"', html, count=1)
html = html.replace('href="../fonts/', 'href="fonts/').replace('src="../vendor/', 'src="vendor/')
html = re.sub(r'<link rel="manifest"[^>]*>\s*', "", html)
html = html.replace("<head>", '<head>\n<script src="twkhelper.js"></script>', 1)
# recompute the CSP fingerprints for the rewritten page (twkhelper.js is covered by 'self')
hs = ["'sha256-" + base64.b64encode(hashlib.sha256(m.encode("utf-8")).digest()).decode() + "'" for m in re.findall(r"<script>([\s\S]*?)</script>", html)]
html = re.sub(r"(script-src 'self')((?: 'sha256-[^']+')*)", lambda m: m.group(1) + " " + " ".join(hs), html, count=1)
files = {"index.html": html.encode("utf-8")}
for sub in ["icons", "../fonts", "../vendor"]:
    d = (root / "app" / sub).resolve()
    for f in sorted(d.iterdir()):
        if f.is_file():
            files[(d.name + "/" + f.name)] = f.read_bytes()
for f in ["config.json", "news.json"]:
    files[f] = (root / "app" / f).read_bytes()
files["README-miniapp.txt"] = ("Fatin mini-app package\n"
    "- Put Tawakkalna's twkhelper.js (from the partner portal) next to index.html before uploading.\n"
    "- Reads only the first name and gender through the SDK, to greet the person (stays on the device).\n"
    "- Host messages (postMessage): see docs/integration.md\n"
    "Independent student project by Hassan Abdullah Alyenbawi. Not affiliated with any government body or bank.\n").encode()
out = root / "store/fatin-miniapp.zip"
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for name, data in sorted(files.items()):
        zi = zipfile.ZipInfo("fatin-miniapp/" + name, date_time=(2026, 1, 1, 0, 0, 0)); zi.compress_type = zipfile.ZIP_DEFLATED
        z.writestr(zi, data)
print("✓", out.relative_to(root), round(out.stat().st_size / 1024), "KB,", len(files), "files")
