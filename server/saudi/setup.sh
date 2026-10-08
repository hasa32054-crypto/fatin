#!/usr/bin/env bash
# تثبيت خادم فطن السعودي على Oracle Cloud (Ubuntu 22.04 أو 24.04، معالج Ampere ARM أو x86).
# الاستخدام (كأمر واحد بعد ما تدخل السيرفر):
#   curl -fsSL https://raw.githubusercontent.com/hasa32054-crypto/fatin/main/server/saudi/setup.sh -o setup.sh && sudo bash setup.sh
# خيارات:
#   --domain fatin.example.sa   اسم نطاقك (بدونه نستخدم IP.sslip.io المجاني)
#   --local-ai                  يثبّت نموذج ALLaM السعودي على السيرفر (يحتاج 8GB ذاكرة على الأقل)
set -euo pipefail

DOMAIN=""; LOCAL_AI=0
while [ $# -gt 0 ]; do case "$1" in
  --domain) DOMAIN="$2"; shift 2;;
  --local-ai) LOCAL_AI=1; shift;;
  *) echo "خيار غير معروف: $1"; exit 1;;
esac; done

say(){ printf '\n\033[1;32m==> %s\033[0m\n' "$1"; }
[ "$(id -u)" = 0 ] || { echo "شغّله بـ sudo"; exit 1; }

say "1/8 تحديث النظام وتثبيت الأدوات"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git build-essential cmake ca-certificates gnupg debian-keyring debian-archive-keyring apt-transport-https iptables-persistent unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades || true   # تحديثات الأمان تلقائية

say "2/8 Node.js 22"
if ! command -v node >/dev/null || [ "$(node -v | cut -c2- | cut -d. -f1)" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

say "3/8 Caddy (شهادة HTTPS تلقائية)"
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y && apt-get install -y caddy
fi

say "4/8 كود فطن"
id fatin >/dev/null 2>&1 || useradd --system --home /opt/fatin --shell /usr/sbin/nologin fatin
if [ -d /opt/fatin/.git ]; then git -C /opt/fatin pull --ff-only; else git clone --depth 1 https://github.com/hasa32054-crypto/fatin.git /opt/fatin; fi
cd /opt/fatin/server/saudi && npm install --omit=dev --no-audit --no-fund
mkdir -p /var/lib/fatin && chown -R fatin:fatin /var/lib/fatin && chmod 700 /var/lib/fatin
chown -R root:root /opt/fatin

say "5/8 السمع داخل المملكة: whisper.cpp"
if [ ! -x /opt/whisper.cpp/build/bin/whisper-cli ]; then
  git clone --depth 1 https://github.com/ggml-org/whisper.cpp.git /opt/whisper.cpp
  cmake -S /opt/whisper.cpp -B /opt/whisper.cpp/build -DCMAKE_BUILD_TYPE=Release
  cmake --build /opt/whisper.cpp/build -j"$(nproc)" --config Release
fi
[ -f /opt/whisper.cpp/models/ggml-large-v3-turbo-q5_0.bin ] || bash /opt/whisper.cpp/models/download-ggml-model.sh large-v3-turbo-q5_0

if [ "$LOCAL_AI" = 1 ]; then
  say "5b/8 الذكاء داخل المملكة: ALLaM (نموذج سدايا) عبر llama.cpp"
  if [ ! -x /opt/llama.cpp/build/bin/llama-server ]; then
    git clone --depth 1 https://github.com/ggml-org/llama.cpp.git /opt/llama.cpp
    cmake -S /opt/llama.cpp -B /opt/llama.cpp/build -DCMAKE_BUILD_TYPE=Release -DLLAMA_CURL=OFF
    cmake --build /opt/llama.cpp/build -j"$(nproc)" --config Release --target llama-server
  fi
  mkdir -p /opt/models
  M=/opt/models/allam-7b-instruct.gguf
  if [ ! -f "$M" ]; then
    for Q in Q4_0 Q4_K_M; do
      curl -fL -o "$M.part" "https://huggingface.co/bartowski/ALLaM-AI_ALLaM-7B-Instruct-preview-GGUF/resolve/main/ALLaM-AI_ALLaM-7B-Instruct-preview-$Q.gguf" && mv "$M.part" "$M" && break || rm -f "$M.part"
    done
  fi
  [ -f "$M" ] || { echo "ما قدرت أنزّل نموذج ALLaM. نكمل بدونه (AI_PROVIDER=cloudflare)."; LOCAL_AI=0; }
  if [ "$LOCAL_AI" = 1 ]; then
    cat > /etc/systemd/system/fatin-llm.service <<EOF
[Unit]
Description=Fatin local AI (ALLaM via llama.cpp)
After=network.target
[Service]
User=fatin
ExecStart=/opt/llama.cpp/build/bin/llama-server -m $M --host 127.0.0.1 --port 8081 -c 4096 -t $(nproc) --no-webui
Restart=always
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload && systemctl enable --now fatin-llm
  fi
fi

say "6/8 الإعدادات والمفاتيح (تنحفظ في السيرفر فقط)"
if [ ! -f /etc/fatin.env ]; then
  cp /opt/fatin/server/saudi/fatin.env.example /etc/fatin.env
  read -r -s -p "الصق مفتاح ElevenLabs (أو اضغط Enter لتخطيه): " EK </dev/tty || EK=""; echo
  [ -n "$EK" ] && sed -i "s|^ELEVENLABS_API_KEY=.*|ELEVENLABS_API_KEY=$EK|" /etc/fatin.env
fi
[ "$LOCAL_AI" = 1 ] && sed -i "s|^AI_PROVIDER=.*|AI_PROVIDER=local|" /etc/fatin.env
chown root:fatin /etc/fatin.env && chmod 640 /etc/fatin.env

say "7/8 فتح المنافذ 80 و443 (جدار Oracle الداخلي)"
for P in 80 443; do
  iptables -C INPUT -p tcp --dport $P -m state --state NEW -j ACCEPT 2>/dev/null || iptables -I INPUT 5 -p tcp --dport $P -m state --state NEW -j ACCEPT
done
netfilter-persistent save || true

say "8/8 تشغيل الخادم وHTTPS"
if [ -z "$DOMAIN" ]; then IP=$(curl -fsS https://api.ipify.org); DOMAIN="${IP//./-}.sslip.io"; fi
sed "s|{\$FATIN_DOMAIN}|$DOMAIN|" /opt/fatin/server/saudi/Caddyfile.template > /etc/caddy/Caddyfile
cp /opt/fatin/server/saudi/fatin.service /etc/systemd/system/fatin.service
systemctl daemon-reload
systemctl enable --now fatin
systemctl restart caddy
sleep 4
if curl -fsS "https://$DOMAIN/tts" >/dev/null; then OK="✓ يشتغل"; else OK="(الشهادة ممكن تاخذ دقيقة، جرّب الرابط بعد شوي)"; fi
cat <<EOF

=========================================================
 خادم فطن السعودي جاهز $OK
 الرابط:  https://$DOMAIN
 الخطوة الأخيرة: أرسل هذا الرابط لـClaude عشان يحطه في app/config.json
 حالة الخادم:   sudo systemctl status fatin
 السجل:        sudo journalctl -u fatin -n 50
 التحديث:      sudo bash /opt/fatin/server/saudi/setup.sh
=========================================================
EOF
