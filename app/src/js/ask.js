/* ---------- Ask Fatin ---------- */
const KB=[
  [/بنك|البنك|bank/,"البنك ما يتصل ولا يرسل يطلب رمز التحقق أو الرقم السري أبدًا. لو أحد طلبه منك باسم البنك، أغلق واتصل بالبنك من الرقم اللي على بطاقتك.","Your bank never calls or texts asking for your verification code or PIN. If someone does, hang up and call the number on your card."],
  [/نفاذ|nafath/,"نفاذ هو تطبيق الدخول الحكومي الموحد. لا توافق على أي طلب نفاذ إلا إذا كنت أنت اللي بدأت الدخول للتو في موقع أو تطبيق رسمي. لو أحد قالك «اختر الرقم كذا»، هذا محتال.","Nafath is the national sign-in app. Only approve a request if you just started signing in yourself. If someone tells you which number to pick, it's a scam."],
  [/شحن|شحنه|طرد|parcel|delivery/,"شركات الشحن ما تطلب الدفع برابط في رسالة. تتبّع شحنتك من التطبيق الرسمي لشركة الشحن، ولا تدفع من أي رابط.","Couriers don't ask for payment through text links. Track your parcel in the courier's official app and never pay from a link."],
  [/رابط|الرسمي|link|official|website/,"اقرأ الرابط من آخره: الجزء اللي قبل أول «/» هو صاحب الموقع. الجهات الحكومية تنتهي بـ gov.sa، وأبشر هو absher.sa. وإذا شكّيت، لا تفتح الرابط وافتح التطبيق الرسمي بنفسك.","Read a link from its end: the part right before the first '/' is the real owner. Government sites end in gov.sa. When in doubt, open the official app yourself."],
  [/انخدعت|انسرق|سرقوا|اعطيت|scammed|gave/,"اهدأ وتصرّف بسرعة: كلّم بنكك وأوقف البطاقة، غيّر كلمات المرور، وبلّغ عبر «كلنا أمن». اضغط زر «انخدعت؟» وأنا أمشي معك خطوة خطوة.","Stay calm and act fast: call your bank to freeze your card, change your passwords, and report it. Tap 'Got scammed?' and I'll guide you step by step."],
  [/ساهر|مخالف|fine|violation/,"المخالفات تُسدد من أبشر أو تطبيق بنكك، مو من روابط في رسائل. أي رسالة تقول «سدد خلال 24 ساعة» برابط غريب احتيال.","Traffic fines are paid in Absher or your bank app, never through links in messages."],
  [/رقم جديد|رقمي الجديد|new number|قريب/,"إذا أحد قال «هذا رقمي الجديد» وطلب فلوس، اتصل على رقمه القديم أو اسأله سؤال ما يعرفه إلا هو، أو اطلب «كلمة سر العائلة».","If someone says 'this is my new number' and asks for money, call their old number or ask your family password."],
  [/صوت|مقلد|deepfake|voice/,"المحتالين يقدرون يقلدون صوت قريبك بالذكاء الاصطناعي. اتفقوا في العائلة على «كلمة سر» تطلبونها في أي مكالمة فيها طلب فلوس. تقدر تحفظها في «لوحة الأسرة».","Scammers can clone a relative's voice with AI. Agree on a family password and ask for it whenever a call asks for money."],
  [/باركود|qr/,"الباركود ممكن يكون ملصق مزيف فوق الأصلي، خصوصًا في المواقف. صوّره بفطن قبل ما تدفع، وأنا أقولك وين يوديك.","A QR code can be a fake sticker over the real one, especially at parking meters. Scan it with Fatin before you pay."],
  [/واتساب|whatsapp|كود/,"كود واتساب يوصلك بس لما تسجل دخول بنفسك. أي أحد يطلبه منك يبي يسرق حسابك. وفعّل «التحقق بخطوتين» من إعدادات واتساب.","A WhatsApp code only comes when you sign in yourself. Anyone asking for it wants your account. Turn on two-step verification."]
];
const ASK_SUG={ar:["هل البنك يتصل يطلب الرمز؟","وش هو نفاذ؟ ومتى أوافق؟","وصلني رابط شحنة، وش أسوي؟","كيف أعرف الرابط الرسمي؟","المحتال يقدر يقلد صوت أخوي؟"],en:["Does my bank ever ask for my code?","What is Nafath and when do I approve?","I got a parcel fee link. What now?","How do I spot an official link?"],ur:["کیا بینک کوڈ مانگتا ہے؟","نفاذ کیا ہے؟","پارسل فیس کا لنک آیا ہے، کیا کروں؟"],tl:["Humihingi ba ng code ang bangko?","Ano ang Nafath?","May link para sa bayad sa parcel, ano'ng gagawin?"]};
function drawAskSug(){ const q=$("ask-sug"); q.innerHTML=""; (ASK_SUG[lang]||ASK_SUG.ar).forEach(s=>{ const b=el("button","chip",s); b.type="button"; b.onclick=()=>askFatin(s); q.appendChild(b); }); $("ask-in").placeholder=t("ask_ph")||"اسأل فطن أي سؤال عن الاحتيال…"; }
const askHist=[];
/* AI answers come as light markdown: show **key words** in bold, drop the other marks, never inject HTML */
function richInto(node,txt){
  const lines=String(txt).replace(/\r/g,"").split("\n").map(l=>l.replace(/^\s*#{1,6}\s*/,"").replace(/^\s*[-*•]\s+/,"• ").replace(/^\s*(\d+)[.)]\s+/,"$1. ")).filter((l,i,a)=>l.trim()||(i>0&&a[i-1].trim()));
  lines.forEach((ln,i)=>{ if(i) node.appendChild(document.createElement("br"));
    ln.split(/(\*\*[^*]+\*\*|__[^_]+__)/).forEach(part=>{ if(!part) return; const m=part.match(/^(\*\*|__)(.+)\1$/);
      if(m){ node.appendChild(el("b","",m[2])); } else node.appendChild(document.createTextNode(part.replace(/[*_`]{1,3}/g,""))); }); });
}
function askAdd(cls,txt){ const box=$("ask-chat"); const d=el("div","cm "+cls); if(cls==="them"){ const sm=el("small","","فطن"); d.appendChild(sm); richInto(d,txt); } else d.appendChild(document.createTextNode(txt)); box.appendChild(d); box.scrollTop=box.scrollHeight; return d; }
const ABOUT_FATIN={
 ar:"أنا **فطن**، من تطوير شاب سعودي: الطالب حسان عبدالله الينبعاوي من ثانوية الموهوبين التقنية بجدة، بهدف حماية **ذوي الإعاقة وكبار السن** من الاحتيال. وما أتبع لأي وزارة أو جهة حكومية أو بنك، فلو أحد كلّمك باسمي وطلب بياناتك فهو محتال.",
 en:"I'm **Fatin**, developed by a young Saudi: student Hassan Abdullah Alyenbawi from the Gifted Technical Secondary School in Jeddah, to protect **people with disabilities and the elderly** from scams. I'm not part of any ministry, government body or bank, so anyone who contacts you in my name asking for your details is a scammer.",
 ur:"میں **فطن** ہوں، جسے ایک سعودی نوجوان، جدہ کے طالب علم حسان عبداللہ الینبعاوی نے **معذور افراد اور بزرگوں** کو دھوکہ دہی سے بچانے کے لیے بنایا۔ میں کسی وزارت، سرکاری ادارے یا بینک کا حصہ نہیں ہوں۔",
 hi:"मैं **फ़तिन** हूँ, जिसे जेद्दा के सऊदी छात्र हसन अब्दुल्ला अलयनबावी ने **दिव्यांगों और बुज़ुर्गों** को धोखाधड़ी से बचाने के लिए बनाया है। मैं किसी मंत्रालय, सरकारी संस्था या बैंक का हिस्सा नहीं हूँ।",
 bn:"আমি **ফাতিন**, জেদ্দার সৌদি ছাত্র হাসান আব্দুল্লাহ আলইয়ানবাওয়ি **প্রতিবন্ধী ও বয়স্কদের** প্রতারণা থেকে রক্ষা করতে আমাকে তৈরি করেছেন। আমি কোনো মন্ত্রণালয়, সরকারি সংস্থা বা ব্যাংকের অংশ নই।",
 tl:"Ako si **Fatin**, ginawa ng isang batang Saudi, ang estudyanteng si Hassan Abdullah Alyenbawi mula sa Jeddah, para protektahan ang **mga may kapansanan at matatanda** laban sa scam. Hindi ako bahagi ng anumang ministeryo, ahensya ng gobyerno o bangko.",
 id:"Saya **Fatin**, dikembangkan oleh pemuda Saudi, pelajar Hassan Abdullah Alyenbawi dari Jeddah, untuk melindungi **penyandang disabilitas dan lansia** dari penipuan. Saya bukan bagian dari kementerian, instansi pemerintah, atau bank mana pun.",
 fr:"Je suis **Fatin**, développé par un jeune Saoudien, l'élève Hassan Abdullah Alyenbawi de Djeddah, pour protéger **les personnes handicapées et les personnes âgées** contre les arnaques. Je ne fais partie d'aucun ministère, organisme public ou banque.",
 es:"Soy **Fatin**, desarrollado por un joven saudí, el estudiante Hassan Abdullah Alyenbawi de Yeda, para proteger a **las personas con discapacidad y a los mayores** de las estafas. No pertenezco a ningún ministerio, organismo público ni banco.",
 zh:"我是 **Fatin**，由吉达的沙特学生哈桑·阿卜杜拉·延巴维开发，用来保护**残障人士和老年人**免受诈骗。我不属于任何部委、政府机构或银行。"
};
async function askFatin(q){
  q=(q||"").trim(); if(!q) return; try{ bump("asks"); }catch(e){} $("ask-in").value=""; askAdd("me",q); askHist.push({role:"user",content:q});
  if(PRIVACY.find(q).length) askAdd("priv","🔒 لا تكتب رموزك أو أرقام بطاقتك لأحد، حتى لفطن. ما نرسلها لأي مكان.");
  const typing=askAdd("typing",""); typing.innerHTML="<i></i><i></i><i></i>";
  let a=null;
  { const ql=q.toLowerCase();
    if(/(مين|من|وش|ايش|أي)\s*((الجهة|اللي)\s*)*(طو[ّ]?رك|طورتك|سو[ّ]?اك|سوتك|صنعك|صممك|برمجك|اخترعك|ورا\s*فطن|وراك)|(من|مين)\s*(انت|أنت)\s*[؟?]?\s*$|(انت|أنت|فطن)\s*(تابع|تتبع|من)\s*(ل|لأي|لاي|ل?وزار|ل?جه|ل?حكوم|الحكوم|الوزار|الجه)|who\s+(made|created|built|developed|owns|is behind)\s+(you|fatin)|who are you|are you (from|part of|owned by|run by)|is fatin (from|part of|owned by|run by)/.test(ql)) a=ABOUT_FATIN[lang]||ABOUT_FATIN.ar; }
  if(!a && sample && PRIVACY.cloudAI()){
    try{ const sys=`أنت «فطن»، مساعد توعية ضد الاحتيال لذوي الإعاقة وكبار السن والعمالة في السعودية. أجب بلغة المستخدم (${LANGS[lang].name}) بجملتين أو ثلاث بسيطة جدًا، بدون مصطلحات تقنية. انصح دائمًا بالتأكد من الجهة الرسمية بنفسه، ولا تطلب أي بيانات. إذا كان السؤال خارج الأمان الرقمي فوجّهه بلطف. حقائق عنك لا تخالفها أبدًا: فطن مشروع طالب سعودي، حسان عبدالله الينبعاوي من ثانوية الموهوبين التقنية بجدة، طوّره لمسابقة «عزّنا بتمكينهم» بهدف حماية ذوي الإعاقة وكبار السن من الاحتيال. فطن ليس تابعًا لأي وزارة أو جهة حكومية أو بنك أو شركة، ولا تدّعِ ذلك أبدًا ولا تخترع معلومات عن نفسك. التنسيق: اكتب نصًا عاديًا، وضع الكلمة أو العبارة الأهم فقط بين **نجمتين** (مرة أو مرتين في الجواب كله)، بدون عناوين أو قوائم أو أي رموز ثانية.`;
      const hist=askHist.slice(-8).map(m=>({role:m.role,content:PRIVACY.redact(m.content)}));   // sensitive numbers never leave the phone
      const r=await sample([{role:"user",content:sys},...hist],aiOpts({modelTier:"quick",cache:false},{task:"ask",lang,history:hist})); a=(r&&r.text||"").trim().slice(0,700); }
    catch(e){ if(["not_granted","sampling_disabled","not_declared","capability_disabled","capability_removed"].includes(e&&e.code)) sample=null; }
  } else await wait(500);
  if(!a){ const nq=FatinEngine.norm(q); const hit=KB.find(([re])=>re.test(nq)); a=hit?(lang==="ar"?hit[1]:hit[2]):(lang==="ar"?"ما عندي جواب جاهز لهذا السؤال. القاعدة الذهبية: لا تعطِ رمزًا أو بيانات أو فلوس لأحد يتواصل معك، وتأكد من الجهة بنفسك.":"Golden rule: never give a code, data or money to someone who contacted you. Check with the organization yourself."); }
  typing.remove(); askAdd("them",a); askHist.push({role:"assistant",content:a});
  if(mode==="visual") speak(a.replace(/[*_#`]/g,""));
}
$("ask-form").addEventListener("submit",e=>{ e.preventDefault(); askFatin($("ask-in").value); });

