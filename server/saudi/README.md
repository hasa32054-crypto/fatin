# خادم فطن السعودي (استضافة داخل المملكة)

نفس خادم فطن الحالي حرفيًا (`server/worker.js`)، لكن يشتغل على سيرفر في **مركز بيانات Oracle في جدة** بدل Cloudflare.

## وش يصير داخل المملكة؟

| الجزء | بعد النقل |
|---|---|
| لوحة الأسرة، رادار البلاغات، كاش الروابط | على قرص السيرفر في جدة |
| سماع كلامك في المكالمة التدريبية | whisper.cpp على السيرفر في جدة. التسجيل ما يطلع من المملكة ويُحذف فورًا |
| قارئ الروابط | يفتح الروابط من جدة، مع حماية من العناوين الداخلية |
| الذكاء الاصطناعي | `local`: نموذج **ALLaM** السعودي (من سدايا) على السيرفر. أو `cloudflare` مؤقتًا |
| صوت فهد وسارة | يتولد من ElevenLabs أول مرة (نص التطبيق فقط، بدون بياناتك)، وبعدها ينحفظ ويُرسل من جدة |
| الموقع والتطبيق | GitHub Pages (ملفات ثابتة بدون بيانات مستخدمين) |

## الخطوات (مرة وحدة، حوالي 30 دقيقة)

### 1) افتح حساب Oracle Cloud (يحتاج بطاقة للتحقق فقط)
1. ادخل <https://www.oracle.com/cloud/free/> واضغط **Start for free**.
2. في **Home Region** اختر **Saudi Arabia West (Jeddah)**. ⚠️ ما تقدر تغيّرها بعدين.
3. كمّل التسجيل. البطاقة للتحقق، والخدمات المجانية (Always Free) ما تنخصم.

### 2) أنشئ السيرفر
1. من القائمة: **Compute ← Instances ← Create instance**.
2. الاسم: `fatin`.
3. **Image**: Canonical Ubuntu 24.04.
4. **Shape**: اضغط Change shape ← **Ampere** ← `VM.Standard.A1.Flex` ← 4 OCPU و 24 GB (كلها ضمن المجاني).
   - لو طلع «Out of capacity»: جرّب بعد ساعات، أو حوّل الحساب لـ Pay As You Go (يظل مجاني ضمن الحدود ويعطيك أولوية).
5. **SSH keys**: اختر Generate a key pair ونزّل المفتاح الخاص (`.key`) واحفظه عندك.
6. اضغط **Create**، وانسخ **Public IP address** لما يجهز.

### 3) افتح المنافذ في الشبكة
1. في صفحة السيرفر: **Subnet** ← **Default Security List** ← **Add Ingress Rules**.
2. Source CIDR: `0.0.0.0/0` · Destination port: `80,443` ← Add.

### 4) ثبّت فطن بأمر واحد
من جهازك (ويندوز: PowerShell، ماك: Terminal):
```
ssh -i path/to/your.key ubuntu@PUBLIC_IP
```
وبعد ما تدخل:
```
curl -fsSL https://raw.githubusercontent.com/hasa32054-crypto/fatin/main/server/saudi/setup.sh -o setup.sh && sudo bash setup.sh --local-ai
```
- يسألك عن مفتاح ElevenLabs: الصقه (ما يظهر وأنت تكتب، طبيعي).
- `--local-ai` يثبّت نموذج ALLaM السعودي (حجمه حوالي 4GB). بدونه يستخدم الذكاء الحالي مؤقتًا.
- في الآخر يطلع لك رابط مثل `https://1-2-3-4.sslip.io`. **أرسله لـClaude** عشان يربط التطبيق فيه.

### 5) (لاحقًا) نطاق سعودي
لما تحجز نطاق مثل `fatin.sa`، وجّه سجل A للـIP وشغّل:
```
sudo bash /opt/fatin/server/saudi/setup.sh --domain api.fatin.sa
```

## التشغيل اليومي
- الحالة: `sudo systemctl status fatin`
- السجل (بدون أي بيانات مستخدمين): `sudo journalctl -u fatin -n 50`
- تحديث الكود: نفس أمر التثبيت `sudo bash /opt/fatin/server/saudi/setup.sh`
- **تجهيز صوت فهد مسبقًا** (بعد التثبيت، ومرة كل شهر): `cd /opt/fatin/server/saudi && node warm-voices.mjs`
  يولّد جمل المكالمات التدريبية الثابتة (حوالي 57 جملة) وتنحفظ على قرص السيرفر في جدة، فتشتغل فورًا من داخل المملكة. لعرضها بدون إرسال: `node warm-voices.mjs --dry`

## الأمان المطبّق
- HTTPS تلقائي (Caddy + Let's Encrypt) وترويسات أمان.
- الخادم يشتغل بمستخدم بدون صلاحيات، وما يقدر يكتب إلا في `/var/lib/fatin` (systemd hardening).
- المفاتيح في `/etc/fatin.env` بصلاحية 640، ما توصل للتطبيق أبدًا.
- قارئ الروابط يتحقق من عنوان IP الفعلي وقت الاتصال، ويرفض العناوين الداخلية (حماية SSRF وDNS rebinding).
- حد طلبات لكل مستخدم، وقبول الطلبات من موقع فطن فقط.
- تحديثات أمان Ubuntu تلقائية.
- السجلات: الوقت والمسار والحالة فقط.

## السرعة المتوقعة (Ampere 4 أنوية)
- السمع (whisper large-v3-turbo): 2–5 ثواني لجملة قصيرة.
- ALLaM 7B: تحليل رسالة 10–20 ثانية. لو تبي أسرع للمكالمات خلّ `AI_PROVIDER=cloudflare` في `/etc/fatin.env` وأعد التشغيل: `sudo systemctl restart fatin`.
