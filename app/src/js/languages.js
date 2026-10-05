/* ---------- small helpers ---------- */
const el=(tag,cls,txt)=>{ const e=document.createElement(tag); if(cls) e.className=cls; if(txt!==undefined) e.textContent=txt; return e; };
function setLabel(node,txt){ if(!node) return; const tn=[...node.childNodes].reverse().find(n=>n.nodeType===3&&n.textContent.trim()); if(tn) tn.textContent=txt; else node.appendChild(document.createTextNode(txt)); }

/* ---------- languages ---------- */
const LANGS={ar:{name:"العربية",dir:"rtl",tts:"ar-SA"},en:{name:"English",dir:"ltr",tts:"en-US"},ur:{name:"اردو",dir:"rtl",tts:"ur-PK"},tl:{name:"Filipino",dir:"ltr",tts:"fil-PH"}};
const T={
 en:{tab_scan:"Check",tab_sim:"Messages",tab_call:"Call",tab_train:"Train",tab_more:"More",sub_scan:"Your smart shield against scams",
  h_scan:"Check any message<br>before you tap",sub_scan2:"SMS, WhatsApp or email",lbl_msg:"The message you received",ph_msg:"Paste the message here…",btn_scan:"Check message",btn_qr:"Scan QR",
  safe_t:"Looks safe",safe_s:"No clear danger. Still, never share your codes.",suspicious_t:"Suspicious",suspicious_s:"Careful. Don't tap any link until you're sure.",danger_t:"Danger",danger_s:"Don't tap the link, don't reply, and don't give any code.",
  word_safe:"safe",word_suspicious:"suspicious",word_danger:"dangerous",v_example:"Example · tap an example or paste your message",v_quick:"Quick check on your device",v_two:"After two layers of checking",g_lbl:"risk",
  sec_msg:"Your message, and what Fatin caught",lg1:"Danger",lg2:"Impersonated name",lg3:"Safety sign",sec_dis:"Link dissection",dis_owner:"The real owner of the link",sec_cmp:"Compare the link",cmp_fake:"Link in the message",cmp_real:"Official site of «{b}»",how:"How did Fatin decide?",
  btn_listen:"Listen",btn_report:"Report",btn_trust:"Send to someone I trust",p_link:"Don't tap the link",p_code:"Don't give the code",p_money:"Don't send money",p_reply:"Don't reply",p_family:"Ask your family",p_ok:"Safe",p_nocode:"Never share your code",
  speak_pre:"Fatin says: the message is ",speak_why:" Reason: ",panic:"Got scammed?",ex_label:"Examples:",qr_title_d:"Danger: close the link",qr_title_s:"Suspicious link",qr_title_ok:"Looks safe",qr_sub:"What's inside this QR code:",qr_close:"Close the link",qr_open:"Open the link",qr_none:"No QR code found. Try a clearer photo.",
  ask_ph:"Ask Fatin anything…",lang_note:"Main screens are translated. Training screens stay in Arabic for now."},
 ur:{tab_scan:"چیک",tab_sim:"پیغامات",tab_call:"کال",tab_train:"مشق",tab_more:"مزید",sub_scan:"دھوکے کے خلاف آپ کی سمارٹ ڈھال",
  h_scan:"کسی بھی پیغام کو<br>کلک سے پہلے چیک کریں",sub_scan2:"ایس ایم ایس، واٹس ایپ یا ای میل",lbl_msg:"آپ کو موصول پیغام",ph_msg:"پیغام یہاں پیسٹ کریں…",btn_scan:"پیغام چیک کریں",btn_qr:"کیو آر اسکین",
  safe_t:"محفوظ لگتا ہے",safe_s:"کوئی واضح خطرہ نہیں۔ پھر بھی اپنا کوڈ کسی کو نہ دیں۔",suspicious_t:"مشکوک",suspicious_s:"محتاط رہیں۔ یقین سے پہلے کسی لنک پر کلک نہ کریں۔",danger_t:"خطرہ",danger_s:"لنک پر کلک نہ کریں، جواب نہ دیں، کوئی کوڈ نہ دیں۔",
  word_safe:"محفوظ ہے",word_suspicious:"مشکوک ہے",word_danger:"خطرناک ہے",v_example:"مثال · کوئی مثال دبائیں یا اپنا پیغام پیسٹ کریں",v_quick:"آپ کے فون پر فوری جانچ",v_two:"دو مرحلوں کی جانچ کے بعد",g_lbl:"خطرہ",
  sec_msg:"آپ کا پیغام اور فطن نے کیا پکڑا",lg1:"خطرہ",lg2:"نقلی نام",lg3:"حفاظتی علامت",sec_dis:"لنک کا تجزیہ",dis_owner:"لنک کا اصل مالک",sec_cmp:"لنک کا موازنہ",cmp_fake:"پیغام میں لنک",cmp_real:"«{b}» کی سرکاری ویب سائٹ",how:"فطن نے فیصلہ کیسے کیا؟",
  btn_listen:"سنیں",btn_report:"رپورٹ",btn_trust:"کسی بھروسے والے کو بھیجیں",p_link:"لنک نہ کھولیں",p_code:"کوڈ نہ دیں",p_money:"پیسے نہ بھیجیں",p_reply:"جواب نہ دیں",p_family:"گھر والوں سے پوچھیں",p_ok:"محفوظ",p_nocode:"کوڈ کسی کو نہ دیں",
  speak_pre:"فطن کہتا ہے: یہ پیغام ",speak_why:" وجہ: ",panic:"دھوکہ ہو گیا؟",ex_label:"مثالیں:",qr_title_d:"خطرہ: لنک بند کریں",qr_title_s:"مشکوک لنک",qr_title_ok:"محفوظ لگتا ہے",qr_sub:"اس کیو آر کوڈ کے اندر:",qr_close:"لنک بند کریں",qr_open:"لنک کھولیں",qr_none:"کیو آر کوڈ نہیں ملا۔ صاف تصویر لیں۔",
  ask_ph:"فطن سے کچھ بھی پوچھیں…",lang_note:"اہم اسکرینوں کا ترجمہ ہو گیا ہے۔ مشق کی اسکرینیں ابھی عربی میں ہیں۔"},
 tl:{tab_scan:"Suriin",tab_sim:"Mensahe",tab_call:"Tawag",tab_train:"Ensayo",tab_more:"Iba pa",sub_scan:"Ang matalinong panangga mo laban sa scam",
  h_scan:"Suriin ang anumang mensahe<br>bago mag-click",sub_scan2:"SMS, WhatsApp o email",lbl_msg:"Ang mensaheng natanggap mo",ph_msg:"I-paste dito ang mensahe…",btn_scan:"Suriin ang mensahe",btn_qr:"I-scan ang QR",
  safe_t:"Mukhang ligtas",safe_s:"Walang malinaw na panganib. Pero huwag ibigay ang code mo kanino man.",suspicious_t:"Kahina-hinala",suspicious_s:"Mag-ingat. Huwag i-click ang link hangga't hindi sigurado.",danger_t:"Panganib",danger_s:"Huwag i-click ang link, huwag sumagot, at huwag magbigay ng code.",
  word_safe:"ligtas",word_suspicious:"kahina-hinala",word_danger:"mapanganib",v_example:"Halimbawa · pumili ng halimbawa o i-paste ang mensahe mo",v_quick:"Mabilis na pagsusuri sa phone mo",v_two:"Pagkatapos ng dalawang antas ng pagsusuri",g_lbl:"panganib",
  sec_msg:"Ang mensahe mo at ang nakita ni Fatin",lg1:"Panganib",lg2:"Ginayang pangalan",lg3:"Ligtas na senyales",sec_dis:"Pagsusuri ng link",dis_owner:"Tunay na may-ari ng link",sec_cmp:"Ihambing ang link",cmp_fake:"Link sa mensahe",cmp_real:"Opisyal na site ng «{b}»",how:"Paano nagpasya si Fatin?",
  btn_listen:"Pakinggan",btn_report:"I-report",btn_trust:"Ipadala sa pinagkakatiwalaan ko",p_link:"Huwag i-click ang link",p_code:"Huwag ibigay ang code",p_money:"Huwag magpadala ng pera",p_reply:"Huwag sumagot",p_family:"Tanungin ang pamilya",p_ok:"Ligtas",p_nocode:"Huwag ibahagi ang code",
  speak_pre:"Sabi ni Fatin: ang mensahe ay ",speak_why:" Dahilan: ",panic:"Na-scam ka?",ex_label:"Halimbawa:",qr_title_d:"Panganib: isara ang link",qr_title_s:"Kahina-hinalang link",qr_title_ok:"Mukhang ligtas",qr_sub:"Laman ng QR code na ito:",qr_close:"Isara ang link",qr_open:"Buksan ang link",qr_none:"Walang nakitang QR code. Kumuha ng mas malinaw na larawan.",
  ask_ph:"Magtanong kay Fatin…",lang_note:"Naisalin na ang pangunahing screen. Nasa Arabic pa ang mga ensayo."}
};
const R={
 en:{shipaddr:"Says your parcel is stuck over the address and asks you to 'confirm' it via a link. Couriers follow up in their official app.",replyask:"Asks you to reply or contact them by number or WhatsApp. Official senders use no-reply messages.",otp:"Asks for your verification code. Official bodies never ask for it.",card:"Asks for your card details or password.",suspend:"Threatens to suspend your account or services.",urgent:"Rushes you so you don't think. A known trick.",prize:"Promises a prize you never entered for.",update:"Asks you to update your details through a link.",ship:"Asks for a delivery fee. Couriers don't collect payment through text links.",invest:"Promises easy, guaranteed profit.",newnum:"Claims to be a relative on a new number. Call their old number to check.",money:"Asks you to transfer or pay money.",social:"Tries to move you to a private chat.",nafath:"Asks you to approve a Nafath request. That opens your government accounts.",remote:"Wants to control your phone remotely. Don't install anything.",wrongtx:"Says money reached you by mistake. Only your bank should reverse it.",giftcard:"Asks for gift cards and their codes.",deposit:"Asks for a deposit or fee before you receive anything.",loan:"Offers an easy loan on unrealistic terms.",iban:"Includes an account number to transfer to directly.",charity:"Urgent donation request to an unverified account.",login:"Asks you to log in or enter details through a link.",sensdata:"Asks for sensitive data like your ID or bank account.",emergency:"Uses a fake emergency to make you send money fast.",proxy:"Asks for money on behalf of someone you know.",toogood:"An offer that's too good to be true.",safeacct:"Asks you to move your money to a 'safe account'. Banks never do this.",short:"A shortened link that hides where it really goes.",ip:"The link is a raw IP address. Very suspicious.",imp:"Uses a known organization's name, but the link isn't its official site.",lookalike:"The link imitates a known name but isn't the official site.",badlink:"The link looks untrustworthy.",link:"Contains a link to an unknown site. Don't open it unless you're sure.",official:"The link looks official. Still, open the official app yourself.",safehint:"It warns you not to share the code, as official senders do.",none:"No clear scam signs found."},
 ur:{shipaddr:"کہتا ہے پارسل پتے کی وجہ سے رکا ہے اور لنک سے پتہ تصدیق کرنے کو کہتا ہے۔",replyask:"جواب دینے یا نمبر/واٹس ایپ پر رابطے کا کہتا ہے۔ سرکاری پیغامات کا جواب نہیں دیا جاتا۔",otp:"آپ سے تصدیقی کوڈ مانگ رہا ہے۔ سرکاری ادارے کبھی کوڈ نہیں مانگتے۔",card:"آپ کے کارڈ کی تفصیلات یا پاس ورڈ مانگ رہا ہے۔",suspend:"آپ کا اکاؤنٹ یا سروس بند کرنے کی دھمکی دے رہا ہے۔",urgent:"آپ کو جلدی پر مجبور کر رہا ہے تاکہ آپ سوچیں نہیں۔",prize:"ایسے انعام کا وعدہ جس میں آپ نے حصہ ہی نہیں لیا۔",update:"لنک کے ذریعے معلومات اپڈیٹ کرنے کا کہہ رہا ہے۔",ship:"ڈلیوری فیس مانگ رہا ہے۔ کوریئر کمپنیاں لنک سے ادائیگی نہیں مانگتیں۔",invest:"آسان اور یقینی منافع کا وعدہ۔",newnum:"نئے نمبر سے رشتہ دار ہونے کا دعویٰ۔ پرانے نمبر پر فون کر کے تصدیق کریں۔",money:"رقم بھیجنے یا ادائیگی کا کہہ رہا ہے۔",social:"آپ کو نجی چیٹ پر لے جانے کی کوشش۔",nafath:"نفاذ کی درخواست منظور کرنے کا کہہ رہا ہے۔ اس سے آپ کے سرکاری اکاؤنٹس کھل جاتے ہیں۔",remote:"آپ کا فون دور سے کنٹرول کرنا چاہتا ہے۔ کوئی ایپ انسٹال نہ کریں۔",wrongtx:"کہتا ہے غلطی سے پیسے بھیجے۔ صرف بینک واپس کرے۔",giftcard:"گفٹ کارڈ اور ان کے کوڈ مانگ رہا ہے۔",deposit:"کچھ ملنے سے پہلے ایڈوانس یا فیس مانگ رہا ہے۔",loan:"غیر حقیقی شرائط پر آسان قرض کی پیشکش۔",iban:"براہ راست رقم بھیجنے کے لیے اکاؤنٹ نمبر دیا گیا ہے۔",charity:"غیر تصدیق شدہ اکاؤنٹ کے لیے فوری عطیہ کی درخواست۔",login:"لنک کے ذریعے لاگ ان یا معلومات مانگ رہا ہے۔",sensdata:"شناختی یا بینک اکاؤنٹ جیسی حساس معلومات مانگ رہا ہے۔",emergency:"جھوٹی ایمرجنسی بتا کر جلدی رقم منگوا رہا ہے۔",proxy:"کسی جاننے والے کے نام پر رقم مانگ رہا ہے۔",toogood:"ایسی پیشکش جو حقیقت سے بہت اچھی ہے۔",safeacct:"رقم 'محفوظ اکاؤنٹ' میں منتقل کرنے کا کہہ رہا ہے۔ بینک ایسا کبھی نہیں کہتا۔",short:"مختصر لنک جو اصل منزل چھپاتا ہے۔",ip:"لنک میں ویب سائٹ کے نام کی جگہ آئی پی نمبر ہے۔",imp:"کسی مشہور ادارے کا نام استعمال کر رہا ہے مگر لنک اس کی سرکاری ویب سائٹ نہیں۔",lookalike:"لنک کسی مشہور نام کی نقل ہے، سرکاری ویب سائٹ نہیں۔",badlink:"لنک ناقابل اعتماد لگتا ہے۔",link:"نامعلوم ویب سائٹ کا لنک۔ یقین کے بغیر نہ کھولیں۔",official:"لنک سرکاری لگتا ہے، پھر بھی خود سرکاری ایپ کھولیں۔",safehint:"یہ کوڈ شیئر نہ کرنے کی تنبیہ کرتا ہے، جیسے سرکاری ادارے کرتے ہیں۔",none:"دھوکے کی کوئی واضح علامت نہیں ملی۔"},
 tl:{otp:"Hinihingi ang iyong verification code. Hindi ito hinihingi ng opisyal na ahensya.",card:"Hinihingi ang detalye ng card o password mo.",suspend:"Nananakot na isasara ang account o serbisyo mo.",urgent:"Minamadali ka para hindi ka makapag-isip.",prize:"Nangangako ng premyo na hindi ka naman sumali.",update:"Pinapa-update ang detalye mo sa isang link.",ship:"Humihingi ng bayad sa delivery. Hindi naniningil ang courier sa link sa text.",invest:"Nangangako ng madali at siguradong kita.",newnum:"Nagpapanggap na kamag-anak sa bagong numero. Tawagan ang luma niyang numero.",money:"Pinapapadala o pinapabayad ka ng pera.",social:"Inililipat ka sa pribadong chat.",nafath:"Pinapa-approve ang Nafath request. Mabubuksan nito ang iyong mga government account.",remote:"Gustong kontrolin ang phone mo. Huwag mag-install ng kahit ano.",wrongtx:"Sinasabing napadala sa iyo ang pera nang mali. Bangko lang ang dapat magbalik nito.",giftcard:"Humihingi ng gift card at mga code nito.",deposit:"Humihingi ng deposito o bayad bago ka makatanggap.",loan:"Nag-aalok ng madaling loan na hindi makatotohanan.",iban:"May account number para direktang padalhan.",charity:"Agarang hiling ng donasyon sa hindi beripikadong account.",login:"Pinapa-login ka o pinapalagay ng detalye sa isang link.",sensdata:"Humihingi ng sensitibong datos gaya ng ID o bank account.",emergency:"Gumagamit ng pekeng emergency para mabilis kang magpadala.",proxy:"Humihingi ng pera para sa taong kilala mo raw.",toogood:"Alok na sobrang ganda para maging totoo.",safeacct:"Pinapalipat ang pera mo sa 'safe account'. Hindi ito ginagawa ng bangko.",short:"Pinaikling link na nagtatago kung saan talaga ito pupunta.",ip:"IP address ang link sa halip na pangalan ng website.",imp:"Ginagaya ang kilalang ahensya pero hindi opisyal na site ang link.",lookalike:"Ginagaya ng link ang kilalang pangalan pero hindi ito opisyal.",badlink:"Mukhang hindi mapagkakatiwalaan ang link.",link:"May link sa hindi kilalang site. Huwag buksan kung hindi sigurado.",official:"Mukhang opisyal ang link. Buksan pa rin ang opisyal na app mismo.",safehint:"Binabalaan kang huwag ibahagi ang code, gaya ng opisyal na mensahe.",none:"Walang malinaw na palatandaan ng scam."}
};
const EX_L={
 en:[["Fake Absher","Dear customer, your Absher account is suspended. Verify your details within 24 hours: absher-verify.top"],["Parcel fee","Your parcel is on hold. Pay 9.50 SAR customs fee now: smsa-ksa.delivery/pay"],["Code request","Hi, this is the bank security team. Please send me the code you received to cancel the transaction."],["Iqama threat","Your iqama will be cancelled and you will be deported. Pay the fine immediately: jawazat-fine.site"],["Safe message","Your OTP is 482913. Do not share it with anyone."]],
 ur:[["اقامہ بلاک","آپ کا اقامہ بلاک کر دیا گیا ہے، فوری تصدیق کریں: iqama-check.xyz"],["کوڈ مانگنا","بینک سے بات کر رہا ہوں، آپ کو جو کوڈ ملا ہے وہ بتائیں"],["پارسل فیس","Your parcel is on hold. Pay 9.50 SAR customs fee now: smsa-ksa.delivery/pay"],["محفوظ پیغام","آپ کا او ٹی پی 4821 ہے۔ ہرگز شیئر نہ کریں۔"]],
 tl:[["Premyo","Mabuhay! Nanalo ka ng 5,000 SAR. I-click ang link: prize-ksa.top"],["Bayad sa parcel","Ang iyong parcel ay naka-hold. Magbayad ng 12 SAR ngayon din: spl-delivery.info"],["Iqama","Your iqama will be cancelled and you will be deported. Pay the fine immediately: jawazat-fine.site"],["Ligtas","Salamat sa pagbili! Ang iyong order ay darating bukas."]]
};
let lang=S.get("lang","ar");
const t=k=>(lang!=="ar"&&((T[lang]&&T[lang][k])||(T.en&&T.en[k])))||null;
const AR_DEFAULTS={};
const I18N_TARGETS=[
  ['.tab[data-tab="scan"]',"tab_scan","label"],['.tab[data-tab="sim"]',"tab_sim","label"],['.tab[data-tab="call"]',"tab_call","label"],['.tab[data-tab="train"]',"tab_train","label"],['.tab[data-tab="more"]',"tab_more","label"],
  ['#v-scan .radar h2',"h_scan","html"],['#v-scan .radar .sub',"sub_scan2","text"],['label[for="msg"]',"lbl_msg","text"],['#msg',"ph_msg","ph"],['#scan',"btn_scan","label"],['#qr-btn',"btn_qr","label"],
  ['#verdict .sec-l',"sec_msg","label"],['#dis-wrap .sec-l',"sec_dis","text"],['.dis-owner small',"dis_owner","text"],['#cmp-wrap .sec-l',"sec_cmp","text"],['.cmp.fake small',"cmp_fake","text"],
  ['#how summary',"how","label"],['#speak',"btn_listen","label"],['#report',"btn_report","label"],['#alert-btn',"btn_trust","label"],['#panic-btn',"panic","label"],
  ['.legend span:nth-child(1)',"lg1","label"],['.legend span:nth-child(2)',"lg2","label"],['.legend span:nth-child(3)',"lg3","label"]
];
function applyLang(l){
  lang=LANGS[l]?l:"ar"; S.set("lang",lang);
  dev.setAttribute("dir",LANGS[lang].dir); dev.setAttribute("lang",lang); document.documentElement.lang=lang;
  I18N_TARGETS.forEach(([sel,key,kind])=>{ const n=document.querySelector(sel); if(!n) return;
    if(!(sel in AR_DEFAULTS)) AR_DEFAULTS[sel]=kind==="html"?n.innerHTML:kind==="ph"?n.placeholder:(([...n.childNodes].reverse().find(x=>x.nodeType===3&&x.textContent.trim())||{}).textContent||n.textContent);
    const v=t(key)||AR_DEFAULTS[sel];
    if(kind==="html") n.innerHTML=v; else if(kind==="ph") n.placeholder=v; else if(kind==="label") setLabel(n,v); else n.textContent=v; });
  document.querySelectorAll("[data-lang]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.lang===lang)));
  $("lang-note").textContent=t("lang_note")||"";
  document.querySelectorAll(".lang-cur-t").forEach(n=>n.textContent=LANGS[lang].name);
  drawExamples(); drawGreeting();
  try{ $("bar-sub").textContent=t("sub_scan")||SUB.scan; }catch(e){}
  if(current&&lastRaw) render(current,lastRaw,{example:lastExample});
  showTab(curTab);
}
applyLang=hookable("applyLang",applyLang);
// a language that is not built in is fetched once; the interface is applied again as soon as it arrives
hook("before","applyLang",l=>{ if(!i18nHas(l)) i18nLoad(l).then(ok=>{ if(ok&&lang===l) applyLang(l); }); });
function drawExamples(){
  const box=document.querySelector("#v-scan .examples"); if(!box) return;
  if(!box.dataset.ar) box.dataset.ar=box.innerHTML;
  if(lang==="ar"){ box.innerHTML=box.dataset.ar; box.querySelectorAll("[data-ex]").forEach(c=>c.onclick=()=>{$("msg").value=EXAMPLES[+c.dataset.ex]; run();}); return; }
  box.innerHTML=""; (EX_L[lang]||[]).forEach(([lab,txt])=>{ const b=el("button","chip",lab); b.onclick=()=>{ $("msg").value=txt; run(); }; box.appendChild(b); });
}
/* translate the verdict after every render */
let lastRaw="", lastExample=false;
hook("before","render",(res,raw,opts={})=>{ lastRaw=raw; lastExample=!!opts.example; });
hook("after","render",(res,raw,opts={})=>{
  if(lang==="ar") return;
  const lv=res.level; $("v-title").textContent=t(lv+"_t"); $("v-simple").textContent=t(lv+"_s");
  $("v-sub").textContent=opts.example?t("v_example"):(res.ai?t("v_two"):t("v_quick"));
  const ids=[...new Set(res.ids||[])]; const ul=$("reasons"); ul.innerHTML="";
  const rs=ids.map(i=>((R[lang]||R.en)[i]||R.en[i])).filter(Boolean).slice(0,5); (rs.length?rs:[(R[lang]||R.en).none]).forEach(r=>ul.appendChild(el("li","",r)));
  if(res.compare) $("cmp-real-l").textContent=t("cmp_real").replace("{b}",res.compare.brand);
  document.querySelectorAll("#picto .pc b").forEach(b=>{ const m={"لا تضغط الرابط":"p_link","لا تعطِ الرمز":"p_code","لا تحوّل فلوس":"p_money","لا ترد":"p_reply","اسأل أهلك":"p_family","آمنة":"p_ok","لا تعطِ رمزك لأحد":"p_nocode"}[b.textContent]; if(m) b.textContent=t(m); });
});
// spoken verdict and voice in the chosen language
hook("map","speechText",(arText,res)=>{
  if(lang==="ar") return arText;
  const ids=[...new Set(res.ids||[])]; let s=t("speak_pre")+t("word_"+res.level)+". "+t(res.level+"_s");
  if(res.level!=="safe"){ const rs=ids.map(i=>((R[lang]||R.en)[i]||R.en[i])).filter(Boolean).slice(0,2); if(rs.length) s+=t("speak_why")+rs.join(" "); }
  return s;
});
hook("map","utter",u=>{
  if(lang==="ar") return u;
  u.lang=LANGS[lang].tts;
  try{ const vs=speechSynthesis.getVoices().filter(v=>v.lang&&v.lang.toLowerCase().startsWith(lang==="tl"?"fil":lang)); const v=vs.find(v=>/natural|neural|online|premium|enhanced|siri|google/i.test(v.name))||vs[0]; u.voice=v||null; }catch(e){}
  return u;
});

