/* ---------- نشرة فطن: cyber news in plain words (curated from sources, dated) ---------- */
let NEWS_UPDATED="3 أكتوبر 2026", NEWS_UPDATED_AT="2026-10-03";
// the bulletin date in another language: only when it is the date we know (the Arabic text stays as written)
function nwDateFor(d,lg){ try{ if(d===NEWS_UPDATED&&NEWS_UPDATED_AT) return new Date(NEWS_UPDATED_AT).toLocaleDateString(LANGS[lg].tts,{day:"numeric",month:"long",year:"numeric",timeZone:"Asia/Riyadh"}); }catch(e){} return d; }
const NW_TAGS={warn:"احذر",breach:"اختراق",dev:"تطوّر",tip:"نصيحة",upd:"حدّث جهازك"};
let NEWS=[
 {id:"sadad",tag:"warn",where:"السعودية",date:"28 سبتمبر 2026",hero:true,
  title:"فواتير «سداد» مزيفة تزيد مع موسم اليوم الوطني",
  sum:"رسائل SMS وواتساب وبريد تقول إن عليك فاتورة مستحقة، وتهددك بقطع الخدمة أو غرامة، ثم توديك لبوابة دفع مقلّدة تسرق بيانات بطاقتك.",
  mean:"المحتال يراهن على زحمة المدفوعات: تشوف كلمة «سداد» وتدفع بسرعة بدون ما تنتبه للرابط.",
  todo:["افتح تطبيق بنكك بنفسك وشوف الفواتير من هناك فقط","لا تدفع من رابط وصلك في رسالة، حتى لو فيه شعار سداد","إذا دخلت بياناتك، كلّم بنكك فورًا وأوقف البطاقة"],
  tryMsg:"سداد: لديك فاتورة مستحقة بمبلغ 287 ريال، سيتم قطع الخدمة خلال 24 ساعة. ادفع الآن لتجنب الغرامة: sadad-bill.online/pay",
  src:[["سايبركاست","https://cybersecuritycast.com/%D9%81%D9%88%D8%A7%D8%AA%D9%8A%D8%B1-%D9%86%D8%B8%D8%A7%D9%85-%D8%B3%D8%AF%D8%A7%D8%AF-%D8%A7%D9%84%D9%85%D8%B2%D9%8A%D9%81%D8%A9-%D8%AA%D8%AA%D8%B5%D8%A7%D8%B9%D8%AF-%D9%85%D8%B9-%D8%A7%D9%84/"]]},
 {id:"nafath",tag:"warn",where:"السعودية",date:"يونيو 2026",
  title:"مكالمات «تحديث نفاذ»: متصل ينتحل جهة حكومية أو دعمًا فنيًا",
  sum:"يتصل ويقول إن حسابك يحتاج «تحديث» أو «رفع مستوى الحماية»، ثم يطلب رمز التحقق. والرمز يفتح له حساباتك الحكومية كلها.",
  mean:"نفاذ بوابة لخدمات كثيرة، فخسارته أخطر من خسارة حساب واحد.",
  todo:["ما فيه جهة رسمية تطلب رمز نفاذ بالاتصال، أبدًا","أغلق المكالمة، وادخل التطبيق الرسمي بنفسك","لا توافق على طلب نفاذ ما طلبته أنت"],
  go:"call",goTxt:"جرّب حارس المكالمات",
  src:[["The Saudi Times","https://thesauditimes.net/%D9%85%D9%88%D8%AC%D8%A9-%D8%A7%D8%AD%D8%AA%D9%8A%D8%A7%D9%84-%D8%AC%D8%AF%D9%8A%D8%AF%D8%A9-%D8%AA%D8%B3%D8%AA%D9%87%D8%AF%D9%81-%D9%85%D8%B3%D8%AA%D8%AE%D8%AF%D9%85%D9%8A-%D9%86%D9%81%D8%A7%D8%B0/"]]},
 {id:"apple",tag:"upd",where:"Apple",date:"28 سبتمبر 2026",
  title:"ثغرة في فتح ملفات PDF على آيفون وماك، وApple أصدرت الإصلاح",
  sum:"ملف PDF مصمَّم بخبث قد يعطّل الجهاز. Apple قالت إن الثغرة ربما استُخدمت ضد أشخاص محددين، ونُشر بعدها كود تجريبي يُسقط الأجهزة غير المحدّثة.",
  mean:"أغلب الاختراقات تستغل أجهزة ما تحدّثت. التحديث هو أرخص حماية عندك.",
  todo:["الإعدادات ← عام ← تحديث البرنامج، وحدّث الآن","فعّل التحديث التلقائي","لا تفتح ملف PDF من رقم أو بريد ما تعرفه"],
  src:[["The Hacker News","https://thehackernews.com/2026/10/apple-coregraphics-poc-emerges-as.html"]]},
 {id:"voice",tag:"dev",where:"العالم",date:"توقعات 2026",
  title:"الصوت المستنسخ صار «ما ينفرق» عن الحقيقي",
  sum:"باحث في جامعة بافلو يقول إن ثوانٍ قليلة من صوت أي شخص تكفي اليوم لصنع نسخة مقنعة، بنبرته وتنفسه ووقفاته.",
  mean:"ممكن يتصل عليك «صوت أخوك» يطلب فلوس بشكل عاجل، وهو مو أخوك.",
  todo:["اتفقوا في العائلة على «كلمة سر» تُسأل في أي طلب فلوس","سكّر واتصل على رقمه المحفوظ عندك","لا تحوّل تحت ضغط «الحين الحين»"],
  go:"family",goTxt:"فعّل كلمة سر العائلة",
  src:[["Fortune","https://fortune.com/2025/12/27/2026-deepfakes-outlook-forecast/"]]},
 {id:"dmdc",tag:"breach",where:"أمريكا",date:"29 سبتمبر 2026",big:["3+ مليون","شخص تسربت بياناتهم"],
  title:"اختراق قاعدة بيانات البنتاغون لشؤون الأفراد",
  sum:"دخول غير مصرّح عبر ثغرة في نظام مشاركة ملفات استمر شهورًا، وكشف أسماء وأرقام ضمان اجتماعي وتواريخ ميلاد لـ2.76 مليون شخص حي ونحو 294 ألف متوفى.",
  mean:"حتى أكبر الجهات تُخترق. وبعد أي تسريب، يتصل المحتال وهو «يعرف اسمك ورقم هويتك» عشان تصدّقه.",
  todo:["معرفة المتصل لبياناتك ما تعني إنه جهة رسمية","لا تكمّل أي طلب جاك بالاتصال، ابدأ أنت من القناة الرسمية"],
  tryMsg:"معك إدارة التحقق، عندنا اسمك ورقم هويتك. لإكمال التحقق أرسل رمز التحقق اللي وصلك الآن",
  src:[["Cyber Security News","https://cybersecuritynews.com/pentagon-data-breach"]]},
 {id:"idscan",tag:"breach",where:"العالم",date:"سبتمبر 2026",big:["153 مليون","سجل رخص قيادة"],
  title:"تسريب صور ورخص قيادة من شركة لمسح الهويات",
  sum:"عُرض على الإنترنت المظلم ما يُقال إنه 153 مليون سجل من شركة IDScan، وأكدت الشركة الاختراق، والإفصاح الرسمي ذكر نحو 13 مليون شخص.",
  mean:"صورة هويتك كنز للمحتال: يفتح بها حسابات وقروض باسمك.",
  todo:["لا ترسل صورة هويتك في واتساب لأحد","إذا لازم ترسلها، اكتب عليها: «لغرض كذا فقط» وتاريخ اليوم"],
  src:[["eSecurity Planet","https://www.esecurityplanet.com/news/news-idscan-data-breach-13-million-people/"]]},
 {id:"gyazo",tag:"breach",where:"العالم",date:"سبتمبر 2026",big:["23.6 مليون","حساب مستخدم"],
  title:"اختراق Gyazo لمشاركة لقطات الشاشة",
  sum:"تسربت أسماء وإيميلات وكلمات مرور مشفّرة وبيانات جلسات دخول، مع بيانات وصفية لنحو 490 مليون صورة.",
  mean:"لو تستخدم نفس كلمة المرور في أكثر من موقع، تسريب موقع واحد يفتح الباقي.",
  todo:["كلمة مرور مختلفة لكل حساب مهم","فعّل التحقق بخطوتين في حساباتك"],
  src:[["Privacy Guides","https://www.privacyguides.org/news/2026/09/25/data-breach-roundup-sep-18-24-2026/"]]},
 {id:"otp7",tag:"tip",where:"البنك المركزي السعودي",date:"قاعدة ثابتة",
  title:"متى يوصلك رمز التحقق فعلًا؟ 7 حالات فقط",
  sum:"الدخول للحساب، الشراء من الإنترنت، التحويل، طلب منتج مالي، إضافة مستفيد، استعادة كلمة المرور، وسداد الفواتير.",
  mean:"إذا وصلك رمز وأنت ما سويت ولا وحدة منها، فأحد يحاول يدخل حسابك الحين.",
  todo:["المؤسسات المالية لا تطلب الرمز بالاتصال أو الرسائل أبدًا","رمز ما طلبته = لا تعطيه لأحد، وغيّر كلمة مرورك"],
  src:[["عاجل · عن ساما","https://ajel.sa/economy/wbkxqj"]]}
];
const NW_TERMS=[
 ["التصيّد (Phishing)","رسالة أو رابط يتنكّر في شكل جهة تعرفها، عشان تكتب بياناتك بنفسك في موقع مزيف."],
 ["الهندسة الاجتماعية","اختراق الإنسان بدل الجهاز: استعجال، خوف، أو طمع يخليك تسوي اللي يبيه المحتال."],
 ["الاستنساخ الصوتي","تقليد صوت شخص حقيقي بالذكاء الاصطناعي من ثوانٍ من كلامه."],
 ["ثغرة «يوم الصفر»","خلل في برنامج يستغله المهاجمون قبل ما يكون له إصلاح، ولذلك التحديث السريع مهم."],
 ["التحقق بخطوتين","طبقة ثانية بعد كلمة المرور. حتى لو سُرقت كلمتك، ما يدخلون بدونها."],
 ["تسريب البيانات","خروج معلومات الناس من جهة اختُرقت، وغالبًا تُباع ويستخدمها المحتالون لإقناعك."]
];
let nwFilter="all";
function nwSeen(){ return S.get("news-seen",[]); }
function nwDot(){
  const unseen=NEWS.filter(n=>n.tag==="warn"&&!nwSeen().includes(n.id)).length;
  const tab=document.querySelector('.tab[data-tab="news"]'); if(!tab) return;
  let d=tab.querySelector(".dot"); if(!unseen){ if(d) d.remove(); return; }
  if(!d){ d=el("span","dot"); tab.appendChild(d); } d.textContent=unseen; d.setAttribute("aria-label",unseen+" تحذير جديد");
}
function nwSpeak(n){ if(mode==="hearing") return; speak(NW_TAGS[n.tag]+". "+n.title+". "+n.sum+" وش تسوي؟ "+n.todo.join(". ")); }
function nwCard(n){
  const c=el("article","nw-card "+n.tag);
  const meta=el("div","nw-meta"); const tg=el("span","nw-tag "+n.tag); if(n.tag==="warn") tg.appendChild(el("i")); tg.appendChild(document.createTextNode(NW_TAGS[n.tag]));
  meta.appendChild(tg); meta.appendChild(el("small","",n.where+" · "+n.date)); c.appendChild(meta);
  c.appendChild(el("h4","",n.title));
  if(n.big){ const b=el("div","nw-big"); b.appendChild(el("b","",n.big[0])); b.appendChild(el("span","",n.big[1])); c.appendChild(b); }
  c.appendChild(el("p","",n.sum));
  const d=el("details"); d.appendChild(el("summary","","وش يعني لك؟ ووش تسوي؟"));
  d.appendChild(el("p","nw-mean",n.mean)); const ul=el("ul","nw-do"); n.todo.forEach(x=>ul.appendChild(el("li","",x))); d.appendChild(ul);
  d.addEventListener("toggle",()=>{ if(d.open){ const s=nwSeen(); if(!s.includes(n.id)){ s.push(n.id); S.set("news-seen",s); nwDot(); } const rd=S.get("news-read",[]); if(!rd.includes(n.id)){ rd.push(n.id); S.set("news-read",rd); bump("newsRead"); } } });
  c.appendChild(d);
  const a=el("div","nw-act");
  if(n.tryMsg){ const b=el("button","try","افحص مثالها في فطن"); b.type="button"; b.onclick=()=>{ showTab("scan"); $("msg").value=n.tryMsg; run(); }; a.appendChild(b); }
  if(n.go){ const b=el("button","try",n.goTxt); b.type="button"; b.onclick=()=>showTab(n.go); a.appendChild(b); }
  if(mode!=="hearing"){ const l=el("button","","🔊 اسمع"); l.type="button"; l.onclick=()=>nwSpeak(n); a.appendChild(l); }
  const q=el("button","","اسأل فطن عنه"); q.type="button"; q.onclick=()=>{ showTab("ask"); askFatin("اشرح لي ببساطة: "+n.title+". وش أسوي؟"); }; a.appendChild(q);
  n.src.forEach(([nm,u])=>{ const s=el("a","nw-src","المصدر: "+nm+" ↗"); s.href=u; s.target="_blank"; s.rel="noopener"; a.appendChild(s); });
  c.appendChild(a);
  return c;
}
function drawNews(){
  $("nw-upd-t").textContent="آخر تحديث للنشرة: "+NEWS_UPDATED;
  const warns=NEWS.filter(n=>n.tag==="warn"||n.tag==="upd").map(n=>"⚠ "+n.title);
  const tr=$("nw-tr"); tr.innerHTML=""; [...warns,...warns].forEach(x=>tr.appendChild(el("span","",x)));
  const hero=NEWS.find(n=>n.hero), hb=$("nw-hero"); hb.innerHTML="";
  const tg=el("span","nw-tag warn"); tg.appendChild(el("i")); tg.appendChild(document.createTextNode("احذر الآن · "+hero.where)); hb.appendChild(tg);
  hb.appendChild(el("h3","",hero.title)); hb.appendChild(el("p","",hero.sum));
  const ha=el("div","nw-act"); const tb=el("button","try","افحص مثالها في فطن"); tb.type="button"; tb.onclick=()=>{ showTab("scan"); $("msg").value=hero.tryMsg; run(); }; ha.appendChild(tb);
  if(mode!=="hearing"){ const l=el("button","","🔊 اسمع"); l.type="button"; l.onclick=()=>nwSpeak(hero); ha.appendChild(l); } hb.appendChild(ha);
  hb.hidden=!(nwFilter==="all"||nwFilter==="warn");
  const list=$("nw-list"); list.innerHTML="";
  NEWS.filter(n=>!n.hero&&(nwFilter==="all"||n.tag===nwFilter)).forEach(n=>list.appendChild(nwCard(n)));
  const ti=Math.floor(Date.now()/864e5)%NW_TERMS.length; $("nw-term-t").textContent=NW_TERMS[ti][0]; $("nw-term-p").textContent=NW_TERMS[ti][1];
  $("nw-note").hidden=lang==="ar";
  const s=nwSeen(); if(!s.includes(hero.id)){ s.push(hero.id); S.set("news-seen",s); } nwDot();
}
document.querySelectorAll("#nw-filters .chip").forEach(b=>b.onclick=()=>{ nwFilter=b.dataset.f; document.querySelectorAll("#nw-filters .chip").forEach(x=>x.setAttribute("aria-pressed",String(x===b))); drawNews(); });
$("nw-term-next").onclick=()=>{ const i=(NW_TERMS.findIndex(x=>x[0]===$("nw-term-t").textContent)+1)%NW_TERMS.length; $("nw-term-t").textContent=NW_TERMS[i][0]; $("nw-term-p").textContent=NW_TERMS[i][1]; };
VIEWS.news="v-news"; SUBS.news="نشرة فطن"; VIEWS.settings="v-settings"; SUBS.settings="الإعدادات"; PILL.splice(4,0,"news");
hook("after","showTab",name=>{ if(name==="news") drawNews(); });
Object.assign(T.en,{tab_news:"News"}); Object.assign(T.ur,{tab_news:"خبریں"}); Object.assign(T.tl,{tab_news:"Balita"});
if(T.hi){ T.hi.tab_news="समाचार"; T.bn.tab_news="খবর"; T.id.tab_news="Berita"; T.zh.tab_news="资讯"; T.es.tab_news="Noticias"; T.fr.tab_news="Actus"; }
I18N_TARGETS.push(['.tab[data-tab="news"]',"tab_news","label"]);
nwDot();

/* the bulletin refreshes itself: news.json next to the app is updated every 12 hours; checked before use, else the built-in news stay */
function nwValid(d){
  const S=(v,a,b)=>typeof v==="string"&&v.trim().length>=a&&v.length<=b, TG=Object.keys(NW_TAGS), GO=["call","family","scan","train","pats","ask","panic"];
  if(!d||!S(d.updated,3,40)||!Array.isArray(d.items)||d.items.length<5||d.items.length>12) return false;
  if(d.items.filter(n=>n&&n.hero===true).length!==1) return false;
  const ids=new Set();
  return d.items.every(n=>n&&/^[a-z0-9-]{2,40}$/.test(n.id||"")&&!ids.has(n.id)&&ids.add(n.id)&&TG.includes(n.tag)&&(!n.hero||(n.tag==="warn"&&S(n.tryMsg,15,300)))
    &&S(n.where,2,30)&&S(n.date,3,30)&&S(n.title,10,110)&&S(n.sum,30,400)&&S(n.mean,15,300)
    &&Array.isArray(n.todo)&&n.todo.length>=2&&n.todo.length<=4&&n.todo.every(t=>S(t,5,160))
    &&Array.isArray(n.src)&&n.src.length>=1&&n.src.length<=3&&n.src.every(x=>Array.isArray(x)&&S(x[0],2,60)&&/^https:\/\/[^\s"'<>]+$/.test(x[1]||""))
    &&(n.tryMsg==null||S(n.tryMsg,15,300))&&(n.go==null||(GO.includes(n.go)&&S(n.goTxt,4,40)))
    &&(n.big==null||(Array.isArray(n.big)&&n.big.length===2&&S(n.big[0],1,20)&&S(n.big[1],3,80))));
}
(async function nwLoad(){
  try{ const r=await fetch("news.json",{cache:"no-store"}); if(!r.ok) return; const d=await r.json(); if(!nwValid(d)) return;
    NEWS=d.items; NEWS_UPDATED=d.updated; NEWS_UPDATED_AT=d.updatedAt||null; nwDot(); if(typeof curTab!=="undefined"&&curTab==="news") drawNews(); }catch(e){}
})();


/* reasons for the v2 engine signals, every language */
(function(){ const N={
 en:{bill:"An 'overdue' bill or fine with a threat and a pay link. Pay bills only in the official app.",techsup:"Claims your device has a virus or problem and wants you to install something or call. Real companies don't reach out like this.",blackmail:"Blackmail: threatens to publish photos or data unless you pay. Don't pay, keep evidence, and report it.",romance:"An online romance that ends with a request for money. A very common scam.",refund:"Promises a refund, points or cashback through a link. It's bait to steal your card.",fakejob:"A job that asks you to pay fees first. Real jobs never charge you.",fraudalert:"Says there's a transaction on your account and asks you to cancel it via a link. Cancel only in your bank's app.",fakesupport:"'Official' support on WhatsApp. Official bodies don't help you from personal WhatsApp numbers."},
 ur:{bill:"جرمانہ یا 'واجب الادا' بل، دھمکی اور ادائیگی کا لنک۔ بل صرف سرکاری ایپ سے ادا کریں۔",techsup:"کہتا ہے آپ کے فون میں وائرس ہے اور کچھ انسٹال کرائے۔ اصل کمپنیاں ایسے رابطہ نہیں کرتیں۔",blackmail:"بلیک میل: پیسے نہ دینے پر تصاویر شائع کرنے کی دھمکی۔ ادائیگی نہ کریں اور رپورٹ کریں۔",romance:"آن لائن محبت جو پیسوں کے مطالبے پر ختم ہوتی ہے۔",refund:"لنک کے ذریعے ریفنڈ یا پوائنٹس کا وعدہ۔ یہ کارڈ چرانے کا جال ہے۔",fakejob:"نوکری جس میں پہلے فیس مانگی جائے۔ اصل نوکری پیسے نہیں مانگتی۔",fraudalert:"کہتا ہے اکاؤنٹ پر لین دین ہوئی، لنک سے منسوخ کریں۔ صرف بینک ایپ استعمال کریں۔",fakesupport:"واٹس ایپ پر 'سرکاری' سپورٹ۔ سرکاری ادارے ذاتی نمبروں سے مدد نہیں کرتے۔"},
 hi:{bill:"'बकाया' बिल या जुर्माना, धमकी और भुगतान लिंक। बिल सिर्फ़ आधिकारिक ऐप से भरें।",techsup:"कहता है फ़ोन में वायरस है और कुछ इंस्टॉल कराना चाहता है। असली कंपनियाँ ऐसे संपर्क नहीं करतीं।",blackmail:"ब्लैकमेल: पैसे न देने पर फ़ोटो फैलाने की धमकी। भुगतान न करें, रिपोर्ट करें।",romance:"ऑनलाइन प्यार जो पैसे माँगने पर ख़त्म होता है।",refund:"लिंक से रिफ़ंड, पॉइंट या कैशबैक का वादा। यह कार्ड चुराने का जाल है।",fakejob:"नौकरी जो पहले फीस माँगे। असली नौकरी पैसे नहीं माँगती।",fraudalert:"कहता है खाते पर लेनदेन हुआ, लिंक से रद्द करें। सिर्फ़ बैंक ऐप इस्तेमाल करें।",fakesupport:"WhatsApp पर 'आधिकारिक' सपोर्ट। सरकारी संस्थाएँ निजी नंबरों से मदद नहीं करतीं।"},
 bn:{bill:"'বকেয়া' বিল বা জরিমানা, হুমকি ও পেমেন্ট লিংক। বিল শুধু অফিসিয়াল অ্যাপে দিন।",techsup:"বলে ফোনে ভাইরাস আছে, কিছু ইনস্টল করতে বলে। আসল কোম্পানি এভাবে যোগাযোগ করে না।",blackmail:"ব্ল্যাকমেইল: টাকা না দিলে ছবি প্রকাশের হুমকি। টাকা দেবেন না, রিপোর্ট করুন।",romance:"অনলাইন প্রেম যা টাকা চাওয়ায় শেষ হয়।",refund:"লিংকে রিফান্ড বা ক্যাশব্যাকের প্রতিশ্রুতি। এটা কার্ড চুরির ফাঁদ।",fakejob:"চাকরি যা আগে ফি চায়। আসল চাকরি টাকা চায় না।",fraudalert:"বলে অ্যাকাউন্টে লেনদেন হয়েছে, লিংকে বাতিল করতে। শুধু ব্যাংকের অ্যাপ ব্যবহার করুন।",fakesupport:"WhatsApp-এ 'অফিসিয়াল' সাপোর্ট। সরকারি সংস্থা ব্যক্তিগত নম্বর থেকে সাহায্য করে না।"},
 tl:{bill:"'Overdue' na bill o multa na may banta at link para magbayad. Sa opisyal na app lang magbayad.",techsup:"Sinasabing may virus ang phone mo at pinapa-install ka. Hindi ganito kumontak ang totoong kumpanya.",blackmail:"Blackmail: ilalabas daw ang mga larawan kung hindi ka magbabayad. Huwag magbayad at i-report.",romance:"Online na pag-ibig na nauuwi sa paghingi ng pera.",refund:"Nangangako ng refund o cashback sa link. Pain ito para manakaw ang card mo.",fakejob:"Trabahong humihingi muna ng bayad. Hindi naniningil ang totoong trabaho.",fraudalert:"May transaksyon daw sa account mo at ipa-cancel sa link. Sa app ng bangko lang mag-cancel.",fakesupport:"'Opisyal' na support sa WhatsApp. Hindi tumutulong ang ahensya mula sa personal na numero."},
 id:{bill:"Tagihan atau denda 'tertunggak' dengan ancaman dan tautan bayar. Bayar hanya lewat aplikasi resmi.",techsup:"Mengaku HP Anda kena virus dan menyuruh pasang aplikasi. Perusahaan asli tidak menghubungi begini.",blackmail:"Pemerasan: mengancam menyebar foto jika tidak bayar. Jangan bayar, laporkan.",romance:"Asmara online yang berujung permintaan uang.",refund:"Menjanjikan refund atau cashback lewat tautan. Ini umpan untuk mencuri kartu Anda.",fakejob:"Lowongan yang minta biaya dulu. Pekerjaan asli tidak memungut biaya.",fraudalert:"Mengaku ada transaksi di akun Anda dan minta dibatalkan lewat tautan. Batalkan hanya di aplikasi bank.",fakesupport:"Dukungan 'resmi' di WhatsApp. Lembaga resmi tidak membantu dari nomor pribadi."},
 zh:{bill:"所谓“逾期”账单或罚款，附带威胁和付款链接。只在官方应用缴费。",techsup:"声称您的设备中毒，让您安装软件或打电话。正规公司不会这样联系您。",blackmail:"敲诈：不付钱就公开照片或资料。不要付款，保留证据并举报。",romance:"网恋最后变成要钱，这是常见骗局。",refund:"通过链接承诺退款、积分或返现，是盗取银行卡的诱饵。",fakejob:"先收费的工作。真正的工作不会向您收钱。",fraudalert:"声称账户有交易，让您通过链接取消。只在银行官方应用中操作。",fakesupport:"WhatsApp 上的“官方”客服。官方机构不会用私人号码提供帮助。"},
 es:{bill:"Una factura o multa 'vencida' con amenaza y enlace de pago. Paga solo en la app oficial.",techsup:"Dice que tu equipo tiene un virus y quiere que instales algo o llames. Las empresas reales no contactan así.",blackmail:"Chantaje: amenaza con publicar fotos si no pagas. No pagues y denúncialo.",romance:"Un romance en línea que termina pidiendo dinero.",refund:"Promete reembolso o cashback por un enlace. Es un cebo para robar tu tarjeta.",fakejob:"Un empleo que cobra tarifas por adelantado. Los empleos reales no cobran.",fraudalert:"Dice que hay una operación en tu cuenta y que la canceles por un enlace. Cancela solo en la app del banco.",fakesupport:"Soporte 'oficial' por WhatsApp. Los organismos oficiales no ayudan desde números personales."},
 fr:{bill:"Une facture ou amende 'impayée' avec menace et lien de paiement. Payez uniquement dans l'appli officielle.",techsup:"Prétend que votre appareil a un virus et veut vous faire installer un logiciel. Les vraies entreprises ne contactent pas ainsi.",blackmail:"Chantage : menace de publier des photos si vous ne payez pas. Ne payez pas, signalez-le.",romance:"Une romance en ligne qui finit par une demande d'argent.",refund:"Promet un remboursement ou cashback via un lien. C'est un appât pour voler votre carte.",fakejob:"Un emploi qui demande des frais d'avance. Un vrai emploi ne fait jamais payer.",fraudalert:"Dit qu'une opération a eu lieu et vous demande d'annuler via un lien. Annulez seulement dans l'appli de la banque.",fakesupport:"Support 'officiel' sur WhatsApp. Les organismes officiels n'aident pas depuis des numéros personnels."}};
 Object.keys(N).forEach(k=>{ if(R[k]) Object.assign(R[k],N[k]); }); })();
$("pf-edit").onclick=()=>{ $("li-name").value=(profile&&profile.n)||""; document.querySelectorAll("#li-g button").forEach(x=>x.setAttribute("aria-pressed",String(!!profile&&x.dataset.g===profile.g))); openLogin(); };
hook("after","applyLang",()=>{ try{ $("lang-tile-s").textContent=LANGS[lang].name+" · 10 لغات"; if(curTab==="badges") drawProfile(); }catch(e){} });

