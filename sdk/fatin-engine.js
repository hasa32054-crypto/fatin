/*! Fatin Engine 1.0.bf04288543 — محرك فطن لكشف رسائل الاحتيال (يعمل داخل الجهاز بدون إنترنت)
 * © 2026 حسان عبدالله الينبعاوي. جميع الحقوق محفوظة. الاستخدام في جهات أو تطبيقات أخرى بإذن كتابي من المالك.
 * فطن مشروع طالب مستقل، وليس تابعًا لأي جهة حكومية أو بنك.
 *
 * الاستخدام:
 *   <script src="fatin-engine.js"></script>   ثم   Fatin.check("نص الرسالة")
 *   أو في Node:  const Fatin = require("./fatin-engine.js")
 * النتيجة: { verdict: "safe"|"suspicious"|"danger", score: 0-100, reasons: [..], signals: [..], links: [..], brands: [..], version }
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Fatin = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
const FatinEngine = (() => {
  const AR="٠١٢٣٤٥٦٧٨٩", FA="۰۱۲۳۴۵۶۷۸۹";
  function normMap(raw){
    let t="", map=[];
    for(let i=0;i<raw.length;i++){
      let c=raw[i];
      if(/\s/.test(c) && raw[i-1]==="ـ" && raw[i+1]==="ـ") continue;
      if(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED\u200B-\u200F\u2060-\u2064\uFEFF\u00AD\uFE0F\uFE0E]/.test(c)) continue;
      if(c==="\n"||c==="\r"||c==="\t") c=" ";
      const cp=raw.codePointAt(i);
      if(cp>0xFFFF){ const pair=raw.slice(i,i+2); if(/\p{Extended_Pictographic}/u.test(pair)){ t+=" "; map.push(i); } else { t+=pair; map.push(i); map.push(i); } i++; continue; }
      if(/\p{Extended_Pictographic}/u.test(c)){ t+=" "; map.push(i); continue; }
      if(c>="！"&&c<="～") c=String.fromCharCode(c.charCodeAt(0)-0xFEE0);
      else if(/[À-ɏ]/.test(c)) c=c.normalize("NFD").replace(/[̀-ͯ]/g,"")||c;
      if(/[أإآٱ]/.test(c)) c="ا"; else if(c==="ة") c="ه"; else if(c==="ى") c="ي"; else if(c==="ؤ") c="و"; else if(c==="ئ") c="ي";
      else { let k=AR.indexOf(c); if(k<0) k=FA.indexOf(c); if(k<0){ const b=c.charCodeAt(0); if(b>=0x09E6&&b<=0x09EF) k=b-0x09E6; else if(b>=0x0966&&b<=0x096F) k=b-0x0966; } if(k>=0) c=String(k); else { const l=c.toLowerCase(); if(l.length===1) c=l; } }
      t+=c; map.push(i);
    }
    // join letters spaced out to dodge filters: "ر ق م  ا ل ب ط ا ق ه" / "c a r d" / "ر.ق.م"
    const re=/(?<![\p{L}\p{M}])\p{L}(?:[ .\-_*|·][\p{L}\p{M}]){2,}(?![\p{L}\p{M}])/gu; let m, out="", omap=[], last=0;
    while((m=re.exec(t))){
      out+=t.slice(last,m.index); omap.push(...map.slice(last,m.index));
      for(let j=0;j<m[0].length;j++){ const ch=m[0][j]; if(j%2===1) continue; out+=ch; omap.push(map[m.index+j]); }
      last=m.index+m[0].length;
    }
    if(last){ out+=t.slice(last); omap.push(...map.slice(last,t.length)); t=out; map=omap; }
    { let o2="", m2=[]; for(let j=0;j<t.length;j++){ if(/\s/.test(t[j]) && /\s$/.test(o2)) continue; o2+=t[j]; m2.push(map[j]); } t=o2; map=m2; }
    map.push(raw.length);
    return {t,map};
  }
  const norm = s => normMap(s||"").t;

  const OFFICIAL = ["gov.sa","netflix.com","paypal.com","revolut.com","usps.com","royalmail.com","ups.com","e-zpassny.com","trezor.io","ledger.com","binance.com","coinbase.com","whatsapp.com","shahid.mbc.net","nusuk.sa","icloud.com","edu.sa","med.sa","absher.sa","najiz.sa","musaned.com.sa","alrajhibank.com.sa","alahli.com","alinma.com","bankalbilad.com","riyadbank.com","sab.com","stc.com.sa","splonline.com.sa","spl.com.sa","aramex.com","smsaexpress.com","nafath.sa","ejar.sa","ehsan.sa","sehhaty.sa","tawakkalna.sa","google.com","youtube.com","youtu.be","goo.gl","apple.com","microsoft.com","amazon.sa","amazon.com","noon.com","neom.com","aramco.com","sabic.com","tamara.co","tabby.ai","stcpay.com.sa","dhl.com","fedex.com","jahez.net","hungerstation.com","x.com","snapchat.com","instagram.com","whatsapp.com","linkedin.com","wikipedia.org","sch.sa","qiyas.sa","madrasati.sa","qiwa.sa","muqeem.sa","sadad.com","bsf.sa","anb.com.sa","saib.com.sa","bankaljazira.com","stcbank.com.sa","urpay.com.sa","mobily.com.sa","zain.com","jarir.com","extra.com","live.com","github.com","hasa32054-crypto.github.io"];
  const SHORT = ["bit.ly","tinyurl.com","cutt.ly","t.ly","rb.gy","is.gd","shorturl.at","goo.su","tiny.cc","s.id","ow.ly","shorturl.asia"];
  const LAT = ["nflix","paypa","revolu","usps","trezor","ledger","binanc","coinbas","icloud","nusuk","ehsan","neom","aramco","tamara","tabby","cchi","sehhaty","ejar","musaned","qiwa","absher","saher","nafath","smsa","aramex","dhl","spl","stc","mobily","zain","netflix","shahid","snap","insta","whatsapp","apple","google","jawazat","moi","najiz","zatca","gov","alrajhi","rajhi","alahli","alinma","albilad","nwc","se-","hajj","refund","citizen"];
  const BAD_TLD = ["xyz","top","site","online","icu","click","info","live","shop","buzz","vip","cc","tk","ml","ga","cf","gq","sbs","cfd","rest","lol","link","support","help"];
  // typo-squatting: a domain one letter away from an official one (alrajhibamk, abshar) or written with look-alike letters (paypa1, alahIi, rn→m)
  let _typoT=null; const typoT=()=>_typoT||(_typoT=[...new Set(OFFICIAL.concat(BRANDS.map(b=>b[2]).filter(Boolean)).map(d=>d.split(".")[0]).filter(x=>x.length>=4&&!/^(gov|edu|med)$/.test(x)))]);
  const skel=x=>x.toLowerCase().replace(/rn/g,"m").replace(/vv/g,"w").replace(/[1l|]/g,"i").replace(/0/g,"o").replace(/5/g,"s").replace(/3/g,"e").replace(/-/g,"");
  function near1(a,b){ if(a===b) return true; const la=a.length, lb=b.length; if(Math.abs(la-lb)>1) return false; let i=0; while(i<la&&i<lb&&a[i]===b[i]) i++;
    if(la===lb) return a.slice(i+1)===b.slice(i+1)||(a[i]===b[i+1]&&a[i+1]===b[i]&&a.slice(i+2)===b.slice(i+2));
    return la>lb?a.slice(i+1)===b.slice(i):a.slice(i)===b.slice(i+1); }
  function typoOf(host,raw){ const labs=host.split(".").slice(0,-1); const rawLabs=(raw||host).split(".");
    for(let k=0;k<labs.length;k++){ const lab=labs[k], rl=rawLabs[k]||lab; if(lab.length<4) continue;
      for(const t of typoT()){ if(lab===t) continue; if(skel(rl)===skel(t)||skel(lab)===skel(t)||(t.length>=6&&near1(lab,t))) return t; } }
    return null; }
  // [normalized key, display name, official domain or ""]
  const BRANDS = [["iqama","مقيم",""],["muqeem","مقيم",""],["stc pay","STC Pay","stcpay.com.sa"],["ابشر","أبشر","absher.sa"],["absher","أبشر","absher.sa"],["ناجز","ناجز","najiz.sa"],["توكلنا","توكلنا",""],["نفاذ","نفاذ",""],["مساند","مساند","musaned.com.sa"],["سداد","سداد",""],["الراجحي","الراجحي","alrajhibank.com.sa"],["الاهلي","الأهلي","alahli.com"],["الانماء","الإنماء","alinma.com"],["البلاد","البلاد","bankalbilad.com"],["stc","STC","stc.com.sa"],["سمسا","سمسا","smsaexpress.com"],["smsa","سمسا","smsaexpress.com"],["ارامكس","أرامكس","aramex.com"],["aramex","أرامكس","aramex.com"],["سبل","سبل","splonline.com.sa"],["البريد السعودي","البريد السعودي","splonline.com.sa"],["الجوازات","الجوازات","absher.sa"],["المرور","المرور","absher.sa"],["ساهر","ساهر","absher.sa"],["الزكاه","الزكاة",""],["بنك","البنك",""],["البنك","البنك",""],["نيوم","نيوم","neom.com"],["neom","نيوم","neom.com"],["ارامكو","أرامكو","aramco.com"],["تمارا","تمارا","tamara.co"],["تابي","تابي","tabby.ai"],["احسان","إحسان","ehsan.sa"],["مجلس الضمان الصحي","مجلس الضمان الصحي","cchi.gov.sa"],["وزاره العدل","وزارة العدل","moj.gov.sa"],["امازون","أمازون","amazon.sa"],["نون","نون","noon.com"],["صحتي","صحتي","sehhaty.sa"],["ايجار","إيجار","ejar.sa"],["مقيم","مقيم","muqeem.sa"],["netflix","Netflix","netflix.com"],["نتفليكس","Netflix","netflix.com"],["paypal","PayPal","paypal.com"],["revolut","Revolut","revolut.com"],["usps","USPS","usps.com"],["royal mail","Royal Mail","royalmail.com"],["fedex","FedEx","fedex.com"],["e-?zpass","E-ZPass","e-zpassny.com"],["trezor","Trezor","trezor.io"],["ledger (live|wallet|nano|stax)","Ledger","ledger.com"],["binance","Binance","binance.com"],["coinbase","Coinbase","coinbase.com"],["apple id","Apple","apple.com"],["icloud","Apple","apple.com"],["microsoft","Microsoft","microsoft.com"],["shahid","شاهد","shahid.mbc.net"],["نسك","نسك","nusuk.sa"],["nusuk","نسك","nusuk.sa"]];

  const RULES = [
    {id:"otp",w:60,re:/(يطلع لك|يوصلك|بيجيك|بيوصلك|بيطلع لك) (رقم|كود|رمز).{0,40}(قولي|قله|قوليه|عطني|ارسل|وش هو|زود)|(تعطيني|تعطيه|عطني|اعطني|تقولي|ترسل لي).{0,15}(الكود|الرمز|الرقم) اللي (وصلك|يوصلك|جاك|بيجيك)|(ارسل|ارسله|ارسلها|زودنا|زودني|زودهم|تزويدنا|يرجي تزويد|شاركنا|ابعث|ابعثه|عطني|اعطني|اعطنا|قول لي|قل لي|اكتب لي).{0,30}(الرمز|رمز|الكود|كود|otp)|(الرمز|رمز|الكود|كود).{0,40}(ارسله|ارسلي|ابعثه|زودنا|زودني|عطني|اعطني|قوله|قوليه|تقوله|ترسله)/,
     txt:"يطلب منك رمز التحقق. الجهات الرسمية ما تطلبه منك أبدًا."},
    {id:"card",w:60,neg:1,re:/رقم البطاقه|بيانات البطاقه|cvv|الرقم السري|كلمه المرور|الرقم الخلفي|تاريخ الانتهاء|رقم الحساب والرمز/,
     txt:"يطلب بيانات بطاقتك أو كلمة المرور."},
    {id:"suspend",w:25,re:/(ايقاف|تعليق|تجميد|اغلاق|حظر|حجب|الغاء).{0,15}(بطاقه|حسابك|بطاقتك|خدماتك|اشتراكك|هويتك|الحساب|الخدمه)|سيتم (ايقاف|تعليق|حظر|الغاء|تجميد)|تم (ايقاف|تعليق|تجميد) (حسابك|خدماتك|بطاقتك)|سيتم (فصل|قطع) الخدمه|(حذف|الغاء) حسابك|حسابك (سيحذف|سيتم حذفه)|فشل (تجديد|الدفع)|(ستلغي|سيتم الغاء) (تاشيرتك|اقامتك)|اقامتك منتهيه/,
     txt:"يخوّفك بإيقاف حسابك أو خدماتك."},
    {id:"urgent",w:15,re:/خلال \d+ ?(ساعه|ساعات|دقيقه|دقائق)|فورا|عاجل|اخر فرصه|قبل فوات|ينتهي اليوم|تنتهي اليوم|بشكل عاجل|الحين ضروري|ضروري الحين|اسرع/,
     txt:"يستعجلك عشان ما تفكّر. هذي حيلة معروفة."},
    {id:"prize",w:30,re:/مبروك.{0,30}(ربحت|فزت|جائزه|هديه|سحب|تم اختيار)|تهانينا.{0,30}(ربحت|فزت|جائزه)|ربحت|فزت ب|جائزه|السحب علي|تم اختيارك|تم اختيار رقمك|هديه مجانيه|استلم هديتك|استلمها|كاش باك مجاني/,
     txt:"يوعدك بجائزة أو هدية ما اشتركت فيها."},
    {id:"update",w:25,re:/(?<!تم )(تحديث|حدث|تاكيد|اكد|توثيق|استكمال|تفعيل).{0,12}(بياناتك|البيانات|المعلومات|معلوماتك|حسابك|هويتك|العنوان|عنوانك)/,
     txt:"يطلب منك تحديث بياناتك عبر رابط."},
    {id:"ship",w:25,neg:1,re:/(شحنتك|طردك|الطرد|الشحنه|شحنه|طلبك).{0,50}(رسوم|دفع|سداد|ادفع|ريال)|رسوم جمركيه|رسوم توصيل|معلقه (في|بسبب)/,
     txt:"يطلب رسوم شحنة. شركات الشحن ما تطلب الدفع برابط في رسالة."},
    {id:"invest",w:30,re:/(عائد|ربح|ارباح)\D{0,15}\d+ ?%|تضمن لك|لايكات|متابعات.{0,20}ريال|كل مهمه|مهام بسيطه|دخل يومي|ربح يومي|استثمر.{0,40}(اربح|ارباح|ضعف)|راتب يومي|بدون خبره.{0,20}(ريال|راتب|دخل)|استثمار مضمون|ارباح مضمونه|ضاعف (فلوسك|مبلغك)|عمل من المنزل.{0,25}(ريال|دخل|ربح)|بدون راس مال/,
     txt:"يوعدك بأرباح سهلة ومضمونة."},
    {id:"newnum",w:45,re:/(رقمي الجديد|غيرت رقمي|هذا رقمي|جوالي خرب|جوالي ضاع|ضاع جوالي|خرب جوالي|من جوال (صديقي|خويي|واحد))[^]{0,90}(احتاج|محتاج|حول|حولي|حوللي|ريال|ضروري|ارسل لي)/,
     txt:"شخص يقول إنه قريبك برقم جديد ويطلب فلوس. اتصل على رقمه القديم وتأكد قبل أي تحويل."},
    {id:"newnum",w:20,re:/رقمي الجديد|غيرت رقمي|هذا رقمي|جوالي خرب|جوالي ضاع|ضاع جوالي|خرب جوالي|من جوال (صديقي|خويي|واحد)/,
     txt:"شخص يقول إنه قريبك برقم جديد. تأكد بالاتصال على رقمه القديم."},
    {id:"secret",w:40,re:/(حول|حولي|ارسل|ارسلي|ادفع|ادفعي)[^]{0,90}(لا تقول|لا تقولين|لا تقولي|لا تخبر|لا تخبري|لا تعلم|لا تعلمين|بيني وبينك|محد يدري|لا احد يدري)|(لا تقول|لا تقولين|لا تخبر|لا تخبري|بيني وبينك)[^]{0,90}(حول|حولي|ارسل|ارسلي)|(في ورطه|بمصيبه|في مصيبه|في مشكله كبيره)[^]{0,80}(حول|حولي|ارسل|ارسلي|فلوس)/,
     txt:"يستعجلك تحوّل فلوس ويطلب تخبّي الموضوع عن أهلك. هذي حيلة «القريب في ورطة» — اتصل عليه أو على أهله بنفسك."},
    {id:"money",w:20,neg:1,re:/حول لي|حولي لي|حوللي|حولي على|حولي الحين|حولي بسرعه|تحويل مبلغ|ارسل مبلغ|ارسلي مبلغ|سدد الان|ادفع الان|ادفع الحين|سلفني/,
     txt:"يطلب منك تحويل أو دفع فلوس."},
    {id:"sensdata",w:50,neg:1,re:/(ارسل|ارسلي|زود|زودني|زودنا|ابعث|اعط|عط|قولي|قل لي|ادخل|صور).{0,25}(صوره هويتك|صوره الهويه|رقم حسابك|بياناتك البنكيه|رقم الهويه|رقم هويتك|الايبان|بيانات حسابك|بيانات بطاقتك|كلمه السر)/,
     txt:"يطلب بيانات حساسة مثل الهوية أو الحساب البنكي."},
    {id:"emergency",w:40,re:/(المستشفي|حادث|طاح|الطوارئ|توقيف|السجن|الشرطه).{0,50}(حول|ارسل مبلغ|ادفع)|(حول|ارسل).{0,30}(للعلاج|للمستشفي|عشان يطلع)/,
     txt:"يخوّفك بطارئ لقريبك عشان تحوّل بسرعة. اتصل على قريبك مباشرة وتأكد."},
    {id:"proxy",w:25,re:/(من طرف|يقول).{0,20}(تحول|حول|ترسل)/,
     txt:"شخص يطلب تحويل باسم شخص ثاني تعرفه. تأكد من صاحب الطلب نفسه."},
    {id:"toogood",w:15,re:/الكميه محدوده|عرض حصري|بسعر (خيالي|رمزي)|ورثت|ورث مبلغ|مبلغ كبير.{0,30}(باسمك|لك)/,
     txt:"عرض أو مبلغ أحلى من الواقع. هذي علامة احتيال شائعة."},
    {id:"safeacct",w:55,re:/حساب (الامان|امن|امان|مؤقت|الحمايه)|(حولها|حول فلوسك|انقل فلوسك|انقلها).{0,30}حساب/,
     txt:"يطلب تنقل فلوسك لـ«حساب آمن». البنك ما يطلب هذا أبدًا."},
    {id:"nafath",w:60,re:/نفاذ.{0,45}(اختر الرقم|اختار الرقم|وافق|موافقه|اضغط|ادخل رقم|الرقم اللي)|(وافق|اختر الرقم|اضغط موافقه).{0,30}نفاذ|(ادخل|اكتب) رقم نفاذ/,
     txt:"يطلب موافقة في نفاذ. الموافقة تعطي المحتال دخول لحساباتك الحكومية."},
    {id:"remote",w:60,re:/anydesk|any desk|teamviewer|team viewer|اني ديسك|تيم فيور|شارك (معي |لي )?الشاشه|مشاركه الشاشه|حمل (تطبيق|برنامج).{0,25}(نحميك|نصلح|التحكم|الدعم)/,
     txt:"يطلب تحكم بجوالك عن بُعد. لا تحمّل أي تطبيق يطلبه منك أحد."},
    {id:"wrongtx",w:55,re:/(حولت لك|حولت لكم|حولنا لك|تحويل).{0,30}(بالغلط|بالخطا)|(بالغلط|بالخطا).{0,40}(رجع|ترجع|ارجع)/,
     txt:"يقول حوّل لك بالغلط ويبيك ترجعه. هذي حيلة معروفة، والبنك هو اللي يرجّع."},
    {id:"giftcard",w:55,re:/(بطاقات|بطاقه|كروت).{0,20}(ايتونز|itunes|قوقل بلاي|google play|ستيم|steam|سوا)|(ايتونز|itunes|ستيم|steam|قوقل بلاي).{0,40}(الاكواد|الكود|كود|اكواد)/,
     txt:"يطلب بطاقات شحن وأكوادها. هذي طريقة سرقة شائعة، حتى لو قال إنه مديرك."},
    {id:"deposit",w:30,re:/عربون|(ادفع|سداد|سدد|حول|تحويل) رسوم|ادفع (رسوم )?(الحجز|الملف)|رسوم (الملف|الحجز|الدراسه|التدريب|الدوره|الاشتراك|التسجيل|التفعيل)|سدد الرسوم|حول رسوم|ادفع الرسوم|مبلغ الحجز|قبل الايداع/,
     txt:"يطلب عربون أو رسوم قبل ما تستلم أي شي."},
    {id:"loan",w:20,re:/(قرض|تمويل).{0,30}(بدون كفيل|بدون تحويل راتب|سمه|موافقه فوريه|يصلك خلال)|سداد مديونيات/,
     txt:"يعرض قرضًا سهلًا بشروط غير واقعية."},
    {id:"iban",w:15,re:/\bsa\d{10,}|\bsa\d\d(?: ?\d{4}){4,5}/,
     txt:"فيه رقم حساب يطلب التحويل له مباشرة."},
    {id:"charity",w:15,re:/(تبرع|تبرعك|ساهم).{0,40}(حول|الحساب|الرابط|عاجل)|حاله انسانيه عاجله/,
     txt:"طلب تبرع عاجل لحساب أو رابط غير موثّق. تبرّع عبر المنصات الرسمية مثل «إحسان»."},
    {id:"login",w:20,re:/سجل دخولك|سجل بياناتك|ادخل بياناتك|اكد بياناتك|اكد بيانات|تحقق من حسابك|وثق حسابك|اكد هويتك|حدث طريقه الدفع|ادخل علي الرابط|اضغط هنا|حدث بياناتك|حدثها/,
     txt:"يطلب منك تسجيل دخول أو إدخال بيانات عبر رابط."},
    {id:"social",w:10,re:/wa\.me|t\.me|تيليجرام|telegram|تواصل معنا (على|عبر) (الواتس|واتساب)/,
     txt:"يحاول ينقلك لمحادثة خاصة خارج القنوات الرسمية."}
  ];
  // English, Urdu and Filipino patterns for the many expats targeted in Saudi Arabia (same ids, so reasons translate)
  const MULTI = [
    {id:"otp",w:60,ml:1,re:/\b(send|share|tell|give|forward)( me| us)?( the| your| that)? ?(verification |otp |sms |6.digit )?(code|otp|pin)\b|code (you|that you) (received|got)|(کوڈ|کود|او ٹی پی).{0,25}(بھیج|بتا|دے)|(بھیجیں|بتائیں|دیں).{0,20}(کوڈ|کود)|(ibigay|ipadala|i-send|sabihin).{0,20}(code|otp)/},
    {id:"card",w:60,neg:1,re:/card number|\bcvv\b|expiry date|card details|atm pin|کارڈ.{0,20}(نمبر|تفصیل)|numero ng card/},
    {id:"nafath",w:60,re:/nafath.{0,40}(approve|select|number|choose|accept)/},
    {id:"giftcard",w:55,re:/(itunes|google play|steam|apple) (gift )?(cards?|codes?)/},
    {id:"sensdata",w:50,re:/(send|share|provide).{0,20}(iqama|passport|id) (copy|number|photo)|(iban|bank account) (number|details)/},
    {id:"prize",w:30,re:/congratulations.{0,40}(won|winner|prize|selected)|you (have )?won|\bprize\b|lucky draw|selected (as|to) win|انعام|جیت گئے|nanalo|panalo|premyo/},
    {id:"suspend",w:25,re:/\b(suspended|blocked|deactivated|frozen)\b|will be (closed|blocked|cancell?ed|suspended)|iqama.{0,30}(expired|cancel|deport)|\bdeport|بلاک|معطل|بند کر|na-?block|isasara|suspendido/},
    {id:"update",w:25,re:/(update|verify|confirm|validate) (your )?(details|account|information|iqama|id|data)|(تصدیق|اپڈیٹ).{0,15}(کریں|کرو)|i-?update|i-?verify/},
    {id:"ship",w:25,neg:1,re:/(parcel|package|shipment|delivery).{0,60}(fee|pay|customs|sar|riyal)|customs fee|پارسل|bayad sa (parcel|padala)/},
    {id:"urgent",w:15,re:/\burgent|immediately|within \d+ ?(hours?|hrs|minutes?|mins)|last chance|today only|فوری|ngayon din|agad/},
    {id:"money",w:20,re:/transfer (me|money|the amount)|send (me )?money|pay (now|the fee)|(رقم|پیسے).{0,20}(بھیج|ٹرانسفر)|magpadala ng pera|magbayad|bayaran/},
    {id:"invest",w:30,re:/guaranteed (profit|return|income)|daily (income|profit|salary)|earn \d+.{0,15}(daily|per day|a day)|work from home.{0,30}(sar|riyal|earn)/},
    {id:"login",w:20,re:/\blog ?in\b|click (here|the link|below)|verify now|tap the link|i-?click|کلک کریں|لنک پر/},
    {id:"newnum",w:25,re:/(this is|it'?s) my new number|new number.{0,20}(mom|dad|brother|sister)/},
    {id:"remote",w:60,re:/anydesk|teamviewer|share (your )?screen/},
    {id:"wrongtx",w:55,re:/(sent|transferred) .{0,25}(by mistake|wrongly|accidentally)/},
    // Hindi, Bengali, Indonesian, Chinese, Spanish, French (same ids, so reasons translate)
    {id:"otp",w:60,neg:1,ml:1,re:/(कोड|ओटीपी|otp).{0,25}(भेज|बता|दे दो|दीजिए|शेयर कर)|(কোড|ওটিপি|otp).{0,25}(পাঠান|পাঠাও|বলুন|দিন)|(kirim|kirimkan|berikan|sebutkan|bagikan).{0,20}(kode|otp)|(验证码|动态码|校验码)[^，。,.]{0,12}(发给|告诉|提供|报给|给我)|(把|将).{0,6}(验证码)|(env[ií]a(me|nos)?|dime|d[ée]me|comp[aá]rteme|facil[ií]ta(me|nos)?).{0,20}(c[oó]digo|otp|pin)|(envoyez|envoie|donnez|communiquez|transmettez|dites)(-moi|-nous)?.{0,20}(code|otp)/},
    {id:"card",w:60,neg:1,ml:1,re:/कार्ड.{0,10}(नंबर|नम्बर|विवरण)|सीवीवी|কার্ড.{0,10}(নম্বর|নাম্বার|তথ্য)|nomor kartu|data kartu|卡号|银行卡.{0,8}(密码|信息)|安全码|n[uú]mero de (la )?tarjeta|datos de (la )?tarjeta|num[ée]ro de (la |votre )?carte|cryptogramme/},
    {id:"prize",w:30,re:/(आप|तुम).{0,20}(जीत|विजेता)|इनाम|लॉटरी|(জিতেছেন|বিজয়ী|পুরস্কার|লটারি)|selamat.{0,40}(menang|pemenang|hadiah)|anda (telah )?memenangkan|中奖|获奖|奖品|大奖|has ganado|ha(s)? sido (seleccionad|elegid)|premio|vous avez gagn[ée]|gagnant|loterie/},
    {id:"suspend",w:25,re:/(बंद|ब्लॉक|निलंबित).{0,10}(हो जाएगा|कर दिया|किया जाएगा|हो गया)|(বন্ধ|ব্লক|স্থগিত).{0,10}(হয়ে যাবে|করা হবে|হয়েছে|করা হয়েছে)|(akan )?(diblokir|dinonaktifkan|ditutup|dibekukan)|(冻结|封停|停用|注销|封号)|(ser[aá] |ha sido )?(suspendid|bloquead)[ao]|(sera |a [ée]t[ée] )?(suspendu|bloqu[ée]|d[ée]sactiv[ée])|expuls/},
    {id:"update",w:25,re:/(अपडेट|सत्यापित|वेरिफाई).{0,10}(करें|करो|कीजिए)|(আপডেট|যাচাই|ভেরিফাই).{0,10}(করুন|করো)|(perbarui|verifikasi|konfirmasi).{0,15}(data|akun|identitas)|(更新|验证|核实|完善).{0,6}(信息|资料|账户|身份)|(actualiza|verifica|confirma).{0,12}(tus |sus )?(datos|cuenta|informaci[oó]n)|(mettez [àa] jour|v[ée]rifiez|confirmez).{0,15}(vos |votre )?(donn[ée]es|compte|informations|identit[ée])/},
    {id:"ship",w:25,re:/(पार्सल|पैकेज|डिलीवरी).{0,40}(शुल्क|फीस|फ़ीस|भुगतान)|(পার্সেল|প্যাকেজ|ডেলিভারি).{0,40}(ফি|চার্জ|শুল্ক)|(paket|kiriman).{0,40}(biaya|bayar|bea cukai)|(包裹|快递).{0,20}(费用|关税|运费|支付)|(paquete|env[ií]o).{0,40}(aduana|tasa|pagar|paga)|colis.{0,40}(frais|douane|payez|payer)/},
    {id:"urgent",w:15,re:/तुरंत|फौरन|अभी तुरंत|এখনই|জরুরি|অবিলম্বে|segera|sekarang juga|dalam \d+ jam|立即|马上|立刻|尽快|\d+ ?小时内|urgente|inmediatamente|de inmediato|en \d+ horas|imm[ée]diatement|d[eè]s maintenant|sous \d+ ?h/},
    {id:"money",w:20,re:/पैसे.{0,10}(भेज|ट्रांसफर)|भुगतान करें|টাকা.{0,10}(পাঠান|ট্রান্সফার)|পেমেন্ট করুন|(transfer|kirim) (uang|dana)|bayar sekarang|(转账|汇款|打款|付款)|transfi[eé]re|haz (una )?transferencia|paga (ahora|ya)|(faites|effectuez) (un )?virement|payez (maintenant|imm)/},
    {id:"login",w:20,re:/(क्लिक|टैप) करें|লিংকে ক্লিক|ক্লিক করুন|klik (di sini|tautan|link)|点击.{0,6}(链接|领取|这里)|haz clic|pulsa (aqu[ií]|el enlace)|cliquez (ici|sur le lien)/},
    {id:"sensdata",w:50,re:/(आधार|पासपोर्ट|इकामा).{0,15}(नंबर|फोटो|कॉपी).{0,15}(भेज|दें)|(পাসপোর্ট|ইকামা).{0,15}(নম্বর|ছবি).{0,15}(পাঠান|দিন)|(kirim|kirimkan).{0,15}(foto )?(paspor|ktp|iqama)|(身份证|护照).{0,8}(号码|照片|发给)|(env[ií]a(me)?).{0,15}(pasaporte|dni|iqama)|(envoyez|envoie)(-moi)?.{0,15}(passeport|iqama|pi[eè]ce d'identit[ée])/},
    {id:"remote",w:60,re:/远程(控制|协助)|屏幕共享|共享屏幕|comparte (tu )?pantalla|partagez (votre )?[ée]cran|bagikan layar/},
    {id:"wrongtx",w:55,re:/गलती से.{0,20}(भेज|ट्रांसफर)|ভুল করে.{0,20}(পাঠ|ট্রান্সফার)|(salah|keliru) (transfer|kirim)|(转错|打错|误转)|por error.{0,20}(transfer|envi)|(transf[ée]r|envoy)[ée]?.{0,20}par erreur/},
    {id:"invest",w:30,re:/गारंटी.{0,10}(मुनाफा|लाभ|कमाई)|রোজ.{0,15}আয়|untung (pasti|dijamin)|keuntungan harian|(稳赚|保本|日赚|高回报)|ganancias? garantizad|gana \d+.{0,10}(al d[ií]a|diarios)|(profit|gain|rendement)s? garanti/}
  ];
  // v2: broader Arabic lexicon (normalized text). Same ids reuse their reason text.
  const RULES2 = [
    {id:"otp",w:60,re:/(رمز|كود|الرمز|الكود|رقم التحقق|رمز التحقق|الرقم المرسل|الرمز المرسل|الكود المرسل)[^.؟?!]{0,45}(اقراه لي|اقرالي|رجعه|رجعيه|ارجعه|رجعه لي|ابعثه|ارسله|عطنيه|قوله لي|قولي اياه|دزه|اعطني اياه|تعطيني اياه|ارسله لي)|(اعطني|عطني|تعطيني|ارسل لي|ارسلي لي|قول لي|قولي|اقرا لي|ابعث لي|رجع لي|ممكن تعطيني|تقدر تعطيني)[^.؟?!]{0,25}(الرمز|الكود|رمز|كود|الرقم اللي)|(تاكيد|ادخال|ادخل|اكتب)(?:[^.]|(?<=\d)\.(?=\d)){0,25}(الرمز المرسل|الكود المرسل|الرمز اللي وصلك|الكود اللي وصلك)/},
    {id:"card",w:60,neg:1,re:/(رقم|بيانات|معلومات|تفاصيل) (بطاقتك|البطاقه|الفيزا|بطاقه مدي|بطاقه الصراف)|ادخال (رقم )?بطاقتك|رقم بطاقتك/},
    {id:"suspend",w:30,re:/قبل الترحيل|والا (الابعاد|الترحيل)|ترحيلك|مخالفه هروب|بلاغ هروب|صحح وضعك|حسابك (المعلق|الموقوف|المجمد)/},
    {id:"suspend",w:20,re:/(قطع|فصل|ايقاف|توقف|توقيف|حذف|ترحيل|ابعاد|تجميد|ستتوقف|سيتوقف|يتوقف|موقوفه|موقوف|معلق|المعلق|تعليق|تتعطل|سيغلق|اغلاق)(?:[^.]|(?<=\d)\.(?=\d)){0,25}(الخط|التيار|الخدمه|الكهرباء|حسابك|محفظتك|ملفاتك|جدولك|رقمك|الرقم|شريحتك|الاقامه|اقامتك|بطاقتك|عن منزلك|عن بيتك|حسابك المعلق)|والا (الابعاد|الترحيل|يتعلق|يتم ايقاف|سيتم)|قبل الترحيل|لتفادي (التجميد|الايقاف|الحذف|الفقدان|القطع|الغرامه)|لتجنب (فقدان|الايقاف|القطع|الغرامه|التجميد|الحذف)|قبل (الحذف|الايقاف|القطع|المضاعفه|التجميد)|المضاعفه|تتضاعف الغرامه|مخالفه هروب|صحح وضعك/},
    {id:"prize",w:30,re:/مبرو+ك(?:[^.]|(?<=\d)\.(?=\d)){0,40}(رقمك|ربحت|فزت|فاز|جايزه|جائزه|\d[\d,]* ?ريال)|(فاز|فزت|ربحت|تربح|اربح|الفايز|الفائز|انت المختار|المختار اليوم|رقمك)(?:[^.]|(?<=\d)\.(?=\d)){0,40}(\d[\d,]* ?(ريال|الف|دولار)|جايزه|جائزه|جوائز|السحب|مكافاه|مكافاتك)|(سحب|مسابقه)(?:[^.]|(?<=\d)\.(?=\d)){0,40}\d[\d,]{3,} ?ريال|تاهلت للسحب|للتاهل للسحب/},
    {id:"urgent",w:15,re:/علي وشك الانتهاء|اوشك[تا]? علي الانتهاء|قبل انتهاء|ينتهي خلال|تنتهي خلال|باقي \d+ ?(ساعه|ساعات|دقيقه|دقايق|مقاعد|مقعد)|خلال (ساعتين|ساعه|دقيقتين|يومين)|قبل ما تروح|قبل فوات|الفرصه الاخيره|عرض لفتره محدوده/},
    {id:"invest",w:30,re:/عمله رقميه|عملات رقميه|تعدين|بينانس|توصيات|قناه التوصيات|ضاعف|يتضاعف|اضعاف|x\d+ ?(اسبوعيا|شهريا|يوميا)|ارباحك يوميا|ايداع اولي|ارباح يوميه|ارباح مضمونه|بدون حد|بترتفع \d+|قبل الادراج|الربح من الاسهم|اسهم ارامكو.{0,30}(ايداع|ارباح|حول)/},
    {id:"money",w:20,neg:1,re:/(ادفع|سدد|حول|تحويل|ايداع|اودع|دفع)(?:[^.]|(?<=\d)\.(?=\d)){0,30}\d[\d,.]* ?(ريال|ر\.?س|sar)|\d[\d,.]* ?(ريال|ر\.?س|sar)(?:[^.]|(?<=\d)\.(?=\d)){0,25}(رسوم|تدفعها|ادفع|سدد|حوله|حولها)|بتحويل (سريع|مبلغ|\d)|تقدر تحول لي|تحول لي|حول اي مبلغ|للتحويل المباشر|التحويل المباشر/},
    {id:"deposit",w:30,neg:1,re:/(رسوم|عربون|ايداع|دفعه|مبلغ)(?:[^.]|(?<=\d)\.(?=\d)){0,30}(الملف|العقد|الفيزا|التاشيره|المعامله|التجهيز|تجهيز|الزي|التسجيل|الحجز|المقعد|التامين|التوظيف|الاصدار|تفعيل)|(لتاكيد|لاصدار|لتثبيت|تثبيت|ثبت)(?:[^.]|(?<=\d)\.(?=\d)){0,30}(حجزك|مقعدك|العقد|الفيزا|طلبك|التاشيره)|ثبت حجزك|رسوم (رمزيه|تجهيز|معامله)|ارسل (جواز السفر|الجواز) ورسوم/},
    {id:"fakejob",w:30,re:/(وظيفه|توظف|توظيف|مطلوب|قبولك|عقد عمل|نوظف|دوام|من المنزل|عن بعد|راتب)[^]{0,80}(رسوم|ادفع|حول|عربون|ايداع)|(تم قبولك)(?:[^.]|(?<=\d)\.(?=\d)){0,60}(ادفع|رسوم|حول)/},
    {id:"refund",w:30,re:/((?<!تم )استرداد|(?<!تم )استرجاع|كاش ?باك|cashback|نقاطك|نقاط|مكافاتك|مكافاه|قسايم|قسائم|قسيمه|ارباحك|المبلغ الزايد|مستحقاتك)(?:[^.]|(?<=\d)\.(?=\d)){0,60}(الرابط|اضغط|فعل الاسترداد|ادخل|بطاقتك|نقدا|امسح)|امسح (رمز |كود )?(qr|الباركود|الكود)(?:[^.]|(?<=\d)\.(?=\d)){0,40}(لاستلام|استرداد|للدفع|لتفعيل|لاسترداد)/},
    {id:"techsup",w:45,re:/(جهازك|ايفونك|جوالك|حاسوبك|كمبيوترك)(?:[^.]|(?<=\d)\.(?=\d)){0,30}(مصاب|فيروس|اختراق|نشاط غريب|سيتوقف عن)|فيروس خطير|دعم فني (مايكروسوفت|ابل|قوقل|سامسونج|ويندوز)|فني من (ابل|مايكروسوفت|قوقل|سامسونج)|(نزل|حمل|ثبت)(?:[^.]|(?<=\d)\.(?=\d)){0,25}(تطبيق|اداه|برنامج)(?:[^.]|(?<=\d)\.(?=\d)){0,30}(عن بعد|مساعده|الدعم|لنصلح|نصلح)|(اداه|برنامج|تطبيق) (الدعم|المساعده) عن بعد/},
    {id:"blackmail",w:55,re:/(صورك|فيديوهاتك|محادثاتك|مقاطعك)(?:[^.]|(?<=\d)\.(?=\d)){0,60}(ننشر|بننشر|سننشر|نفضحك|نرسلها|بنرسلها)|(والا|او) (بننشر|سننشر|ننشرها|بنفضحك)|(تم اختراقه|اخترقنا)[^]{0,60}(حول|ادفع|بيتكوين|عمله)/},
    {id:"romance",w:40,re:/(حبيبي|حبيبتي|حياتي|اشتقت لك|يا عمري|موقع الزواج)[^]{0,90}(تحول|حول|رسوم|تذكره|تدفع|الجمارك)/},
    {id:"charity",w:35,re:/(ارمله|جمعيه خيريه|جمعيه لكفاله|جمعيتنا|تبرعك|تبرع|زكاه مالك|زكاتك|عايله محتاجه|عائله محتاجه|كفاله|الايتام|ايتام|محتاجه|معيلها|عمليه ضروري)[^]{0,90}(حول|الحساب|للتحويل|بالخاص|التحويل|الايبان|ايبان|iban|sa\d\d)/},
    {id:"bill",w:30,re:/(فاتوره|فاتورتك|مخالفه|مخالفات|غرامه|رسوم|اشتراكك)(?:[^.]|(?<=\d)\.(?=\d)){0,60}(متاخره|مستحقه|غير مسدده|لم تسدد|سدد|ادفع|للسداد|السداد)(?:[^.]|(?<=\d)\.(?=\d)){0,60}(الرابط|اضغط|فورا|والا|بخصم|المضاعفه|لتجنب|لتفادي|قبل (الحذف|الايقاف|القطع)|سيتم)/},
    {id:"fraudalert",w:35,re:/(محاوله|عمليه|طلب|شراء|سحب|دفع|تغيير رقم|تفعيل|اشتراك|خدمه)[^]{0,70}(اذا (ماهو|مو|لم يكن|ما كان|ما كنت) انت|اذا ما كنت|للالغاء|للرفض|لالغاء|الغ الطلب|الغ فورا|لايقافها|للايقاف)[^]{0,40}(الرابط|اضغط|هنا|ادخل|عبر|فورا)/},
    {id:"fakesupport",w:40,re:/(دعم|الدعم الفني|خدمه العملاء|فريق)(?:[^.]|(?<=\d)\.(?=\d)){0,20}(ابشر|نفاذ|البنك|stc|توكلنا|مدي|الراجحي|الاهلي)(?:[^.]|(?<=\d)\.(?=\d)){0,15}(علي|عبر|في) (واتساب|الواتس|تيليجرام)|(ابشر|نفاذ|البنك|توكلنا)(?:[^.]|(?<=\d)\.(?=\d)){0,20}(علي|عبر) (واتساب|الواتس)/},
    {id:"update",w:25,neg:1,re:/(?<!تم )(ربط|ربطها|بصمه الوجه|جدد التسجيل|ارفع التوثيق|التوثيق|اكمل الربط|تحديث بيانات|حدث بيانات|تاكيد الاستحقاق|تاكيد رقم الجوال)(?:[^.]|(?<=\d)\.(?=\d)){0,40}(الرابط|اضغط|هنا)/},
    {id:"login",w:20,re:/ادخل بياناتك|سجل بياناتك|اعد ادخال|ادخل معلوماتك|عبر الرابط|من الرابط|الرابط المرفق|الرابط التالي|هذا الرابط|اضغط الرابط|اضغط هنا|انقر/},
    {id:"social",w:15,re:/(تواصل|راسلنا|راسل|كلمنا|كلم المندوب|تواصل مع المندوب)(?:[^.]|(?<=\d)\.(?=\d)){0,20}(واتساب|واتس|الواتس|بالخاص|الخاص)|التفاصيل بالخاص|بالخاص|واتساب ?0?5\d/},
    {id:"remote",w:60,re:/(عن بعد)(?:[^.]|(?<=\d)\.(?=\d)){0,30}(نزل|حمل|ثبت)|(نزل|حمل|ثبت)(?:[^.]|(?<=\d)\.(?=\d)){0,30}عن بعد/},
    {id:"wrongtx",w:55,re:/(حولت|حولنا|ارسلت|تحويل|7awwalt)(?:[^.]|(?<=\d)\.(?=\d)){0,40}(غلط|بالغلط|بالخطا|ghalat)/},
    {id:"loan",w:25,re:/(تمويل|قرض)(?:[^.]|(?<=\d)\.(?=\d)){0,40}(يوصلك|سجل بياناتك|رقم حسابك)|(تمويل|قرض)(?:[^.]|(?<=\d)\.(?=\d)){0,40}(بدون كفيل|بدون تحويل راتب|بدون دفعه|موافقه فوريه|يوصلك المبلغ|خلال ساعه)/},
    {id:"nafath",w:60,re:/(اختيار|اختر|اختار|اختاري|اضغط علي) (الرقم|رقم) ?\d{1,3}|نفاذ(?:[^.]|(?<=\d)\.(?=\d)){0,60}(وثق طلب|التفويض|تاكيد رقم الجوال والرمز|اختر)/},
    {id:"newnum",w:25,re:/حسابي (تعلق|انقفل|اتسكر)|انت الوحيد اللي اثق/},
    {id:"replybait",w:30,re:/(رد|ردي|الرد|ارسل|اكتب)( ب| بكلمه| بـ| برقم)? ?[«"'(]?(نعم|موافق|تم|1|y|yes)[»"')]?[^]{0,40}(رابط|الرابط|لنرسل|عشان ارسل|لارسال|للتفاصيل|لتفعيل)|ردبكلمه|ما يفتح الا بعد ما ترد/},
    {id:"otp",w:60,re:/(ارسال|الرد ب|ترسل|تبعث|ادخل|اكتب|نحتاج)[^.]{0,20}(رمز|الرمز|كود|الكود)[^.]{0,20}(الذي سيصل|اللي بيوصلك|اللي يوصلك|اللي راح يوصلك|سيصلك|سيصل|الذي وصلك|اللي وصلك|الذي وصل|المرسل لك|الواصل)|الرمز الذي سيصل|الرد برمز|(اضغط \d|اتصال الي)[^.]{0,30}(ادخل|اكتب) (رمز|الرمز)/},
    {id:"authority",w:45,re:/(غسيل اموال|حكم تنفيذ|قضيه ضدك|بلاغ ضدك|امر قبض|مطلوب للتحقيق|حكم قضايي)[^]{0,90}(تواصل|ادفع|سدد|حول|المحامي|الرقم|قبل)/},
    {id:"illegal",w:40,re:/تصاريح? حج مضمون|تصريح حج[^.]{0,30}(بدون|مضمون|سعر)|بدون (الحاجه ل|موافقه )?(كفيل|الكفيل)[^.]{0,40}(تجديد|نقل|رسوم|تواصل)|نقل كفاله بدون|تاشيره (عمل )?حره|(تجديد الاقامه|تجديد اقامه)[^.]{0,40}بدون/},
    {id:"invest",w:30,re:/(لايك|لايكات|تقييم|تقيم|تقييمات)[^]{0,60}(ريال|ر\.س)|(\d+ ?ريال)[^.]{0,20}(علي كل|لكل) (لايك|تقييم|مهمه)|(تشحن|اشحن) رصيدك|(ترجع|يرجع) لك \d|(اكتتاب|طرح)[^]{0,80}(حساب الوسيط|يتحول|احجز لك)|مجموعه المهام|المهمه المميزه/},
    {id:"emergency",w:40,re:/(محجوز|موقوف|بالمركز|بالسجن)[^]{0,60}(الكفاله|فلوس|حول|المحامي)|(جوال صديقي|رقم صديقي|صديق ولدك|جوال خويي)[^]{0,90}(حول|تحول|يحتاج|ريال)/},
    {id:"ship",w:25,re:/(الجمرك|التخليص الجمركي|الافراج|الجمارك)[^.]{0,40}(رسوم|تدفع|ادفع|دفع)/},
    {id:"deposit",w:30,re:/(رسوم|مبلغ) فتح (ملف|حساب)|رسوم الافراج/},
    {id:"toogood",w:30,re:/تركه قدرها|ترك تركه|بدون وريث|نقل الارث|سعر افضل من البنك|اعلي من البنك/},
    {id:"urgent",w:15,re:/اليوم فقط|خلال اليوم|ضروري|لا تتاخر|الاماكن محدوده|قبل اغلاق/},
    {id:"fraudalert",w:35,re:/(اذا لم تقم|اذا ماهو انت|ما سويتها|اذا ما سويت)[^]{0,70}(اتصل|كلمنا|تواصل)[^]{0,25}(05\d{8}|01\d{7,8}|\+?9665)/},
    {id:"refund",w:30,re:/(صرف|دفعه استثنائيه|مبلغ الدعم|مستحقاتك)[^.]{0,40}(لاستلامها|لاستلامه|استلام المبلغ|رابط التحقق)/},
    {id:"invest",w:30,re:/(rial|riyal)[^.]{0,20}(kel|kul|fe|fi) (osboo3|yom|shahr)|kalmni 3la (wts|whats)|(arba7|ribh)[^.]{0,20}(madmoon|mathmoon|yawmy)/},
    {id:"replybait",w:30,re:/(rid|rd|reply)( b)? ?\(?(yes|na3am|1)\)?[^.]{0,30}(rabit|alrabit|link)/},
    // Arabizi (Arabic written in Latin letters)
    {id:"otp",w:60,re:/(ersel|arsel|ersal|ab3ath|3teni|a3teeni|rajje3|raje3|goli|gooli)(?:[^.]|(?<=\d)\.(?=\d)){0,25}(el )?(ramz|ramez|code|kod|rmz)/},
    {id:"suspend",w:25,re:/9af|eqaf|eyqaf|ta3l[ie]+q|tajmeed|maw[q2]oof/},
    {id:"bill",w:30,re:/(fatora|fatoora|fatura|mokhalafa|m5alafa|gharama)(?:[^.]|(?<=\d)\.(?=\d)){0,40}(mst7qa|mosta7a|edfa3|sadded|adfa3)/},
    {id:"login",w:20,re:/(el )?rabe?t|edfa3|sadded|sadid/},
    {id:"wrongtx",w:55,re:/(7awwalt|7awalt|hawwalt)(?:[^.]|(?<=\d)\.(?=\d)){0,30}(ghalat|bel ?ghalat|5ata)|rajje3ha/},
    // off-channel contact: official senders use no-reply messages and their own apps
    {id:"shipaddr",w:35,re:/(تسليم|توصيل|ايصال) (الطرد|طردك|الشحنه|شحنتك|الطلب|طلبك)[^]{0,50}(بسبب|لعدم|نظرا ل)[^]{0,15}(العنوان|عنوان|بيانات التوصيل)|(عنوان|العنوان) (غير مكتمل|ناقص|غير صحيح)[^]{0,60}(الرابط|اضغط|حدث|تحديث|اكد|تاكيد|ادفع)/},
    {id:"shipaddr",w:35,re:/(package|parcel|shipment|delivery)[^]{0,80}(cannot|could not|can'?t|unable to) be delivered|(undeliverable|incomplete|missing|invalid) address|(confirm|update|verify) your (shipping |delivery )?address[^]{0,25}(link|here|below|at)/},
    {id:"bill",w:30,re:/unpaid (toll|bill|invoice|fine|balance)|toll (evasion|notice|services?)|late fees?[^]{0,60}(increased|dmv|added|apply)|reported to the dmv/},
    {id:"newnum",w:25,re:/\b(hi|hey|hello) (mom|mum|mama|dad|mother|father)\b[^]{0,80}(new|work|other|temporary|friend'?s) (phone|number|mobile)|text me (here|on this)|(this is|it'?s|save) my new number|(dropped|broke|lost|smashed|cracked) my (actual |old )?phone|phone (is )?(completely )?unresponsive/},
    {id:"illegal",w:40,re:/(تصريح|تصاريح) (حج |عمره )?(مضمون|مضمونه|مؤكد|مكفول)|حج بدون تصريح|(حمله|حملات|باقه|باقات|عروض) (حج|الحج)[^]{0,80}(واتساب|الواتس|احجز|اسعار مخفضه|سعر مخفض|خصم|قبل اكتمال)/},
    {id:"urgent",w:15,re:/قبل اكتمال العدد|العدد محدود|المقاعد محدوده|اخر فرصه|within \d+ ?(hours?|hrs)/},
    {id:"replyask",w:15,re:/(رد|ردي|ردوا|راسلنا|راسلونا|تواصل معنا|تواصلوا معنا|كلمنا|كلمونا|اتصل بنا|اتصل علي الرقم|اتصل على الرقم|اتصل علي|اتصل على|ارسل لنا|ابعث لنا|ارسل كلمه|ارسل رقم)(?:[^.]|(?<=\d)\.(?=\d)){0,20}(برساله|بالرقم|الرقم|واتساب|الواتس|الواتساب|هنا|للمتابعه|نعم|\d{8,})|(reply|respond|text back|contact us|call us|whatsapp us|message us)[^.]{0,25}(this message|on whatsapp|whatsapp|to continue|now|\d{8,})/},
    {id:"authority",w:30,re:/(تم رفع|رفع|تسجيل|سجلت|سجل)? ?(بلاغ|قضيه|دعوي|شكوي) (ضدك|مسجله|بحقك|عليك)|لديك قضيه|عليك قضيه/},
    {id:"refund",w:25,re:/(لديك|يوجد|تم اعتماد|اعتماد|لك) (مبلغ مسترد|استرداد|مستحقات مستردة|تعويض)|لاستلام (المبلغ|مبلغك|المستحقات|التعويض)/},
    {id:"update",w:20,re:/(?<!تم )(?<!تم ال)(فعل|اعد تفعيل|اعاده تفعيل|لاعاده تفعيل|جدد) (حسابك|بطاقتك|خدماتك|هويتك|اشتراكك)/},
    {id:"suspend",w:20,re:/لتجنب (الحرمان|الايقاف|الحظر|الغرامه|الاحاله|قطع|ايقاف)|قبل الاحاله|انتهت صلاحيه (هويتك|اقامتك|حسابك|بطاقتك)[^.]{0,40}(فعل|حدث|جدد|اضغط|الرابط|رد|اتصل)/}
  ];
  const MULTI2 = [
    {id:"newnum",w:25,re:/میرا نیا نمبر|نیا نمبر|मेरा नया नंबर|नया नंबर|আমার নতুন নম্বর|নতুন নম্বর|bago kong number|bagong number ko|nomor baru (aku|saya|ku)|ini nomor baru|我的新号码|新号码|换号|mi (nuevo )?n[uú]mero( nuevo)?|nuevo n[uú]mero|mon nouveau num[ée]ro|nouveau num[ée]ro|my new number|new number/},
    {id:"money",w:20,re:/بھیج دیں|ریال بھیج|بھیجیں|पैसे भेज|भेज दें|रियाल भेज|পাঠাও|পাঠান|টাকা পাঠ|pa-?transfer|pakipadala|tolong transfer|transfer (sar|rp|uang)|请?转\d|转给我|请转|transferir|transfiere|transfi[eé]reme|virer|vire-moi|payez|pague|paga|send (it )?back|return the money|send me sar/},
    {id:"invest",w:30,re:/منافع کی گارنٹی|گارنٹی|سرمایہ کاری|मुनाफ़े की गारंटी|गारंटी|निवेश|লাভ নিশ্চিত|বিনিয়োগ|guaranteed|investment|保证收益|保证|投资|ganancia garantizada|garantizad|inversi[oó]n|garanti|investissement|گھر بیٹھے|घर बैठे|ঘরে বসে|kerja dari rumah|在家赚钱|desde casa|[àa] domicile|work from home|(telegram|ٹیلیگرام|टेलीग्राम|টেলিগ্রাম|电报|t\.me)[^]{0,60}(روزانہ|रोज़|রোজ|প্রতিদিন|per hari|每天|al d[ií]a|par jour|daily|per day|a day)|(روزانہ|रोज़|প্রতিদিন|per hari|每天|al d[ií]a|par jour|daily|per day)[^]{0,40}(telegram|ٹیلیگرام|टेलीग्राम|টেলিগ্রামে|电报|t\.me|task|ٹاسک|टास्क|টাস্ক|tugas|任务|tareas|t[aâ]ches)/},
    {id:"deposit",w:30,re:/(visa|ویزا|वीज़ा|वीजा|ভিসা|签证)[^]{0,60}(fee|فیس|फीस|ফি|biaya|费|frais|tarifa|cuota)|processing fee|پروسیسنگ فیس|प्रोसेसिंग फीस|প্রসেসিং ফি|biaya proses|ایڈوانس|एडवांस|অগ্রিম|(transfer|send|pay)[^.]{0,25}(deposit|advance|booking fee|registration fee|activation fee)|activation fee|手续费|comisi[oó]n|frais de (dossier|traitement)|reserve before|book before/},
    {id:"prize",w:30,re:/(won|ganó|gano|gagn[ée]|赢得|中了|جیت|जीत|জিত|nanalo|menang)[^]{0,30}\d|sorteo|tirage|抽奖/},
    {id:"wrongtx",w:55,re:/(accidentally|mistakenly|by mistake|wrongly)[^.]{0,20}(sent|transferred)|namali ako ng send|غلطی سے|गलती से|ভুল করে/},
    {id:"otp",w:60,re:/pakisend[^.]{0,25}(code|otp)|(code|otp)[^.]{0,30}(natanggap mo|na natanggap)|6-digit code[^.]{0,40}(send|share|forward|natanggap)/},
    {id:"nafath",w:60,re:/نفاذ[^]{0,60}(منظور|approve)|nafath[^]{0,60}(approve|pending)/},
    {id:"fraudalert",w:35,re:/(if (this|it) (wasn'?t|was not) you|not you\?|didn'?t make this)[^]{0,40}(cancel|click|here|link|tap|http)/},
    {id:"techsup",w:45,re:/(virus|infected|hacked)[^.]{0,40}(call|download|install)|(download|install)[^.]{0,30}(support|remote) (app|tool)/},
    {id:"charity",w:35,re:/(donat|charity|orphan)[^]{0,60}(transfer|send|account|iban)/},
    {id:"fakejob",w:30,re:/(job|hiring|recruit|employment|نوکری|ملازمت|नौकरी|চাকরি|trabaho|pekerjaan|工作|empleo|emploi)[^]{0,80}(fee|فیس|फीस|ফি|bayad|biaya|费|tarifa|frais)/}
,
    {id:"replybait",w:30,re:/(reply|respond|text|answer|responde|r[eé]pondez|balas|ketik|回复|জবাব|جواب|लिखें|reply po)[^.]{0,6}["«(]?(yes|y|1|s[ií]|oui|ya|ok|是|হ্যাঁ|ہاں|हाँ)\b[^]{0,50}(link|details|enlace|lien|tautan|链接|detalle|d[ée]tail|para sa detalye|লিংক|لنک|जुड़ने|recibir)|reply (yes|y) (to|for)|(yes|हाँ|ہاں)\s*(लिखें|लिखो|لکھیں)/},
    {id:"safeacct",w:55,re:/safe account|secure account|سلامت (اکاؤنٹ|کھاتے)|محفوظ (اکاؤنٹ|کھاتے)|सुरक्षित खाते|নিরাপদ অ্যাকাউন্ট|安全账户|cuenta segura|compte s[ée]curis[ée]|rekening aman/},
    {id:"authority",w:45,re:/money laundering|arrest warrant|منی لانڈرنگ|मनी लॉन्ड्रिंग|মানি লন্ডারিং|গ্রেফতার|गिरफ्तार|گرفتاری|洗钱|pencucian uang|lavado de dinero|blanchiment/},
    {id:"illegal",w:40,re:/pakka permit|guaranteed (hajj )?permit|permit (available|guaranteed)|without (sponsor|kafeel)/},
    {id:"invest",w:30,re:/(like|likes|review|reviews|লাইক|लाइक|لائک|点赞|评价|i-?like)[^]{0,60}(sar|riyal|rial|里亚尔|रियाल|রিয়াল|ریال)|(sar|riyal|里亚尔)[^.]{0,15}(per|each|every|bawat|每单|每个)|(sar|riyal|rial|रियाल|রিয়াল|ریال)[^]{0,60}(like|likes|लाइक|লাইক|لائک|点赞)|daily pay|pago diario|paiement quotidien|每天|日结|(task|tasks|ٹاسک|टास्क|টাস্ক|tugas)[^]{0,60}(deposit|ڈپازٹ|डिपॉजिट|ডিপোজিট|setor|充值|lagbe)|(protidin|rozana|roz|araw-araw)[^.]{0,30}(riyal|rial|sar)|kikita ka/},
    {id:"newnum",w:20,re:/friend'?s (phone|number)|using a friend|lost (my|mine)|dost ka number|phone (kharab|kho gaya)|mera naya number|দোস্তের নম্বর|bago kong numero/},
    {id:"money",w:20,re:/send [\d,]+ (sar |riyal )?to|to this account|bhej do|bhejo|bhej dein|bhej dijiye|भेज दीजिए|भेज दो|transfer kar|ٹرانسفر کر|(is|ye) account (mein|me)|STC Pay (नंबर|number|نمبر)/},
    {id:"otp",w:60,re:/(kode|otp)[^.]{0,70}(dikirim ke saya|kirim ke saya|kirimkan ke saya)/},
    {id:"sensdata",w:50,re:/(اقامہ|کارڈ|پاسپورٹ|کارڈ کی)[^.]{0,30}(تصویر|نمبر)[^.]{0,15}بھیج|(iqama|passport|id) (number|photo|copy)[^.]{0,20}(send|bhej)/},
    {id:"bill",w:30,re:/(fine|violation|toll|penalty|multa|amende|罚款|জরিমানা|जुर्माना|جرمانہ)[^.]{0,80}(pay|scan|paga|payez|支付|পরিশোধ|भुगतान|ادا)|\d+% discount before/},
    {id:"toogood",w:30,re:/next of kin|inheritance|barrister|unclaimed (fund|inheritance)|বেশি রেটে|better rate|بہتر ریٹ|बेहतर रेट|আগে টাকা দিন/},
    {id:"urgent",w:15,re:/紧急|don'?t call|can'?t talk|before \d+ ?(pm|am)|turant|abhi/},
    {id:"deposit",w:30,re:/placement fee|prothome[^.]{0,20}deposit|first deposit|initial deposit/}
  ];
  // negation: "the bank will never ask for your PIN", "no payment required", "don't share"
  const NEG_NEAR=/((^|[\s,،.:])(لا|لن|ما|ابدا|never|don'?t|do not|not|huwag|jangan|nunca|jamais|ne|no)\s+([^\s]+\s+){0,1}$)|((不要|请勿|切勿|勿|别|千万不要|无需|无须|不需要|不用)[^。，,.]{0,3}$)|((न|ना|मत|নয়|না|نہ|مت)\s+$)/;
  const SAFE_ASK=/ما في (اي )?(دفعه|رسوم)|لا (يوجد|توجد|في) (اي )?(دفعه|رسوم)|بدون (اي )?(دفعه|رسوم)|تم خصم|দেবেন না|না দিন|न दें|नहीं माँगता|نہیں مانگتا|نہ بتائیں|প্রতারণা|(لن|لا|ما) (نطلب|يطلب|تطلب|يطلبون|نسالك|يسالك|يلزم)|لن يطلب|ابدا لا|لا نطلب|الدفع تم|تم (استلام )?الدفع|تم الدفع|مدفوع مسبقا|بدون رسوم|لا توجد رسوم|never ask|will never|won'?t ask|no payment|no fees?|nothing to pay|already paid|ne (vous )?demander|nunca (te )?(pediremos|pedimos)|jangan|不要|千万|کبھی نہیں|কখনো|huwag|never/;
  const TXT2={
    shipaddr:"يقول إن شحنتك تعثّرت بسبب العنوان ويبيك «تأكده» من رابط. شركات الشحن تتابع معك من تطبيقها الرسمي.",
    replyask:"يطلب منك ترد عليه أو تتواصل معه برقم أو واتساب. الجهات الرسمية ترسل رسائل بدون رد، وتخدمك من تطبيقها الرسمي.",
    bill:"فاتورة أو مخالفة «متأخرة» مع تهديد ورابط دفع. ادفع فواتيرك من التطبيق الرسمي فقط.",
    techsup:"يدّعي إن جهازك فيه فيروس أو مشكلة ويبيك تحمّل برنامج أو تتصل. الشركات ما تتواصل معك بهذي الطريقة.",
    blackmail:"ابتزاز: يهددك بنشر صور أو بيانات إذا ما دفعت. لا تدفع، واحفظ الأدلة، وبلّغ عبر «كلنا أمن».",
    romance:"علاقة عاطفية عبر الإنترنت تنتهي بطلب فلوس. هذي من أشهر طرق الاحتيال.",
    refund:"يوعدك باسترداد أو نقاط أو كاش باك عبر رابط. هذا طُعم لسرقة بيانات بطاقتك.",
    fakejob:"وظيفة تطلب منك رسوم قبل ما تبدأ. الوظائف الحقيقية ما تطلب فلوس.",
    fraudalert:"يقول فيه عملية على حسابك ويبيك تلغيها من رابط. ألغِ أي شي من تطبيق البنك الرسمي فقط.",
    fakesupport:"دعم فني «رسمي» على واتساب. الجهات الرسمية ما تقدم الدعم من أرقام واتساب شخصية.",
    replybait:"يطلب منك ترد بكلمة عشان يرسل لك رابط. هذي حيلة عشان يتجاوز حماية الروابط في جوالك.",
    authority:"ينتحل جهة أمنية أو قضائية ويهددك بقضية عشان تدفع. الجهات الرسمية ما تطلب الدفع بالجوال.",
    illegal:"يعرض خدمة رسمية (تصريح، إقامة، كفالة) من خارج القنوات الرسمية. هذا احتيال ومخالف للنظام."
  };
  const AWARE=/(طرق|اساليب|انواع) الاحتيال|مثل رسايل|مثل رسائل|احذروا|انتبهوا|توعيه|ورشه|محاضره|beware of|watch out|scam alert|awareness|سے ہوشیار|सावधान रहें|সতর্কতা|waspada|注意|cuidado con|attention aux|ingat kayo/;
  const REQ_IDS=new Set(["shipaddr","replyask","replybait","illegal","fakesupport","otp","card","sensdata","money","deposit","login","giftcard","remote","safeacct","nafath","wrongtx","update","ship","bill","fraudalert","techsup"]);
  const PRESS_IDS=new Set(["authority","loan","suspend","urgent","prize","invest","toogood","refund","newnum","emergency","blackmail","romance","fakejob","charity","proxy"]);
  const LINK_CTA=/الرابط|اضغط|انقر|click|tap here|link|lien|enlace|tautan|链接|点击|लिंक|লিংক|لنک|i-?click/;
  const AUTH=/بنك|البنك|ابشر|الجوازات|المرور|ساهر|الكهرباء|stc|موبايلي|زين|البريد|امازون|نون|ابل|مايكروسوفت|قوقل|الضمان|حساب المواطن|التعليم|الجامعه|جامعتك|وزاره|هيئه|منصه|مدي|urpay|stc pay|نفاذ|سداد|فيدكس|fedex|dhl|aramex|ارامكس|سمسا|bank|absher|amazon|apple|microsoft|google|netflix|post|customs|ministry|police/;
  function sentenceAround(t,i,j){ let a=i, b=j||i; while(a>0 && !/[.!؟?\n。]/.test(t[a-1])) a--; while(b<t.length && !/[.!؟?\n。]/.test(t[b])) b++; return t.slice(a,b); }
  function liveMatch(re,t,neg,ml,idn){
    const g=new RegExp(re.source,"g"); let m, out=[];
    while((m=g.exec(t))){ if(!m[0].length){g.lastIndex++;continue;}
      const before=t.slice(Math.max(0,m.index-18),m.index);
      if(NEG_NEAR.test(before)) continue;
      if(ml && /^(otp|card)$/.test(idn) && /(^|\s)(نہ|نہیں|न|नहीं|মত|না|নয়|don'?t|not|never|huwag|jangan|tidak|no|ne|pas|nunca|jamais)(\s|$)|不要|请勿|勿|别/.test(m[0])) continue;
      if(/(الخصم|خصم|كوبون|برومو|discount|promo|coupon)/.test(t.slice(m.index,m.index+m[0].length+18)) && /كود|code|كوبون/.test(m[0])) continue;
      if(neg && SAFE_ASK.test(sentenceAround(t,m.index,m.index+m[0].length)) && !/(^|\s)(لي|لنا)(\s|$)|\bme\b|\bus\b/.test(m[0])) continue;
      out.push(m); if(out.length>=4) break; }
    return out;
  }
  const SAFE_HINT = /لا (تشارك|تعطي|ترسل|تفصح)[^\s]*( [^\s.،]+){0,4}|لن نطلب|لا نطلب|do not share|don't share|never share|never ask|ہرگز شیئر نہ|huwag ibahagi|(शेयर|साझा) न करें|किसी को न (बताएं|बताएँ|दें)|শেয়ার করবেন না|কাউকে (বলবেন|দেবেন) না|jangan (bagikan|berikan|beritahu)|(请勿|不要|切勿)(告诉|泄露|分享|透露|提供)|no (lo |la )?compartas|no (lo |la )?comparta|nunca (te )?pediremos|ne (le |la )?(partagez|communiquez|donnez)|ne vous demanderons jamais/;

  function findLinks(raw){
    const out=[]; const re=/((?:https?:\/\/)?(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s،]*)?)/gi; let m;
    while((m=re.exec(raw))){
      const u=m[1].replace(/[).,!؟?]+$/,"");
      const host=u.replace(/^https?:\/\//i,"").replace(/^www\./i,"").split(/[\/?#]/)[0].toLowerCase();
      if(/[a-z]/.test(host)) out.push({u,host,rawHost:u.replace(/^https?:\/\//i,"").replace(/^www\./i,"").split(/[\/?#]/)[0],http:/^http:\/\//i.test(u),s:m.index,e:m.index+u.length});
    }
    const ipre=/https?:\/\/\d{1,3}(\.\d{1,3}){3}\S*/gi; let ip;
    while((ip=ipre.exec(raw))) out.push({u:ip[0],host:ip[0].replace(/^https?:\/\//,"").split("/")[0],http:/^http:/i.test(ip[0]),ip:true,s:ip.index,e:ip.index+ip[0].length});
    return out;
  }
  const isOfficial = h => OFFICIAL.some(d => h===d || h.endsWith("."+d));

  function analyze(raw){
    raw = String(raw||""); if(raw.length>4000) raw=raw.slice(0,4000); // a giant paste can't freeze the phone
    const {t,map}=normMap(raw);
    const hits=[], marks=[], ids=[], wts={}; let score=0, ruleScore=0, sus=null;
    if(!t.trim()) return {level:"empty",score:0,reasons:[],marks:[],brands:[],links:[],compare:null,signals:0,ids:[],sus:null};
    const span=(a,b,kind)=>marks.push({s:map[a],e:map[b-1]+1,kind});
    const safeHint = SAFE_HINT.test(t);
    if(safeHint){ const g=new RegExp(SAFE_HINT.source,"g"); let m; while((m=g.exec(t))) span(m.index,m.index+m[0].length,"good"); }
    const TXT=Object.assign(Object.fromEntries(RULES.map(r=>[r.id,r.txt])),TXT2);
    const OTP_ASK=/(ارسله|ابعثه|زودنا|تزويدنا|عطني|اعطني|قوله|اقراه لي|رجعه|تعطيني|ارسل لي|ابعث لي|قولي|send|tell|give|بھیج|ibigay|pakisend|भेज|পাঠান|kirim|发给|告诉我|env[ií]a|envoyez|ersel|arsel)/;
    for(const r of [...RULES,...RULES2,...MULTI,...MULTI2]){
      if(ids.includes(r.id)) continue;
      if(r.id==="otp" && safeHint && !OTP_ASK.test(t)) continue;
      const ms=liveMatch(r.re,t,r.neg,r.ml||MULTI.includes(r)||MULTI2.includes(r),r.id); if(!ms.length) continue;
      score+=r.w; ruleScore+=r.w; hits.push(TXT[r.id]||""); ids.push(r.id); wts[r.id]=r.w;
      ms.forEach(m=>span(m.index,m.index+m[0].length,"bad"));
    }
    const brands=[];
    for(const [k,name,dom] of BRANDS){
      const g=new RegExp("(^|[^\\u0600-\\u06FFa-z])("+k+")(?=$|[^\\u0600-\\u06FFa-z])","g"); let m;
      while((m=g.exec(t))){ const st=m.index+m[1].length; if(!brands.find(b=>b.name===name)) brands.push({name,dom,s:st,e:st+m[2].length}); }
    }
    // clean copy for link hunting: drop invisible chars, fold full-width / Arabic-Indic digits / look-alike letters, glue links split by spaces or line breaks
    const zw=/[​-‏‪-‮⁠-⁩﻿­]/, HG={"а":"a","е":"e","о":"o","р":"p","с":"c","х":"x","у":"y","і":"i","ј":"j","ѕ":"s","ԁ":"d","ɡ":"g","ո":"n","ν":"v","ο":"o","α":"a","ε":"e","ι":"i","κ":"k","ρ":"p","τ":"t","Ι":"i","Ο":"o","А":"a","Е":"e","О":"o","Р":"p","С":"c","Х":"x"};
    const TLDS=new Set(["com","net","org","sa","gov","edu","co","me","io","ly","app","info","site","online","top","xyz","live","shop","store","vip","click","link","help","support","sbs","cfd","icu","buzz","cc","tk","ml","ga","cf","gq","rest","lol","pro","biz","us","uk","in","pk","bd","ph","id","cn","es","fr","ae","eg","ru","de","tv","ws","to","gd","is","gy","gl","im","at","be","ch","nl","it","pl","ro","tr","vn","kz","su","nu","li","la","so","ai","sh","fm","am","cutt","page","dev","cloud","delivery","services","world","today","life","asia","mobi","network"]);
    let clean="", zm=[], hgAt=[], spDot=false;
    const tokBefore=()=>{ const m=clean.match(/[a-z0-9\-.:\/@]+$/i); return m?m[0]:""; };
    const wantGlue=(i)=>{ // i = first non-space index after a dot
      const nx=(raw.slice(i).match(/^[^\s،,]+/)||[""])[0].replace(/[​-‏﻿⁠]/g,""); if(!/^[a-z0-9][a-z0-9\-]*(\.[a-z0-9\-]+)*(\/\S*)?$/i.test(nx)) return false;
      const pv=tokBefore(); if(/https?:\/\/[\d.]+$/i.test(pv) && /^\d/.test(nx)) return true; if(!/[a-z]/i.test(pv)) return false;
      const first=nx.split(/[\/.]/)[0].toLowerCase(), more=/[\/.]/.test(nx), strongPrev=/https?:|www\.|-|\d/i.test(pv);
      return spDot || (strongPrev && (more || TLDS.has(first))) || (TLDS.has(first) && /\//.test(nx));
    };
    for(let i=0;i<raw.length;i++){ let c=raw[i];
      if(zw.test(c)) continue;
      if(c>="！"&&c<="～") c=String.fromCharCode(c.charCodeAt(0)-0xFEE0);
      const ad="٠١٢٣٤٥٦٧٨٩".indexOf(c), fd="۰۱۲۳۴۵۶۷۸۹".indexOf(c); if(ad>=0) c=String(ad); else if(fd>=0) c=String(fd);
      if(HG[c] && (/[a-z]/i.test(raw[i-1]||"")||/[a-z]/i.test(raw[i+1]||"")||/[a-z.]/i.test(clean.slice(-1)))){ c=HG[c]; hgAt.push(clean.length); }
      if(c==="["&&raw.slice(i,i+3)==="[.]"){ clean+="."; zm.push(i); i+=2; continue; }
      if(/\s/.test(c)){ // "domain . com" or "https://www.\n\nsite.top"
        let j=i; while(j<raw.length&&/\s/.test(raw[j])) j++;
        if(raw[j]==="." && /[a-z0-9]$/i.test(clean) && /[a-z]/i.test(raw.slice(j+1).replace(/^\s+/,"")[0]||"")){ spDot=true; i=j-1; continue; }
        if(clean.endsWith(".") && /[a-z0-9]\.$/i.test(clean) && wantGlue(j)){ spDot=false; i=j-1; continue; }
        spDot=false;
      }
      clean+=c; zm.push(i); } zm.push(raw.length);
    const links=findLinks(clean).map(l=>Object.assign(l,{cs:l.s,ce:l.e,s:zm[l.s],e:zm[l.e-1]+1})); let officialOnly=links.length>0, compare=null;
    for(const l of links){
      const tld=l.host.split(".").pop(); let tq=null;
      if(/^(wa\.me|t\.me)$/.test(l.host)){ officialOnly=false; marks.push({s:l.s,e:l.e,kind:"link"}); continue; }
      if(isOfficial(l.host)){ marks.push({s:l.s,e:l.e,kind:"okLink"}); continue; }
      if(OFFICIAL.some(d=>l.host.includes(d+"."))||/@/.test(l.u)){ score+=35; ids.push("lookalike"); }
      if(hgAt.some(k=>k>=l.cs&&k<l.ce)){ score+=45; if(!ids.includes("lookalike")) ids.push("lookalike"); hits.push("الرابط فيه حروف مزيفة تشبه الإنجليزية (من لغة ثانية) عشان يخدعك."); }
      officialOnly=false;
      if(!sus) sus={u:l.u,host:l.host,http:l.http};
      marks.push({s:l.s,e:l.e,kind:"link"});
      if(SHORT.includes(l.host)){ score+=25; ids.push("short"); hits.push("رابط مختصر يخفي وجهته الحقيقية ("+l.host+")."); }
      else if(l.ip){ score+=30; ids.push("ip"); hits.push("الرابط رقم IP بدل اسم موقع، وهذا مريب جدًا."); }
      else if(brands.length){
        const byHost=BRANDS.find(x=>x[2]&&x[2].split(".")[0].length>=4&&l.host.includes(x[2].split(".")[0]));
        const before=brands.filter(x=>map[x.s]<=l.s).sort((a,c)=>map[c.s]-map[a.s])[0];
        const b=byHost?{name:byHost[1],dom:byHost[2]}:(before||brands.find(x=>x.dom)||brands[0]);
        score+=40; ids.push("imp"); hits.push("ينتحل اسم «"+b.name+"» لكن الرابط مو موقعه الرسمي ("+l.host+").");
        if(!compare && b.dom) compare={brand:b.name,fake:l.host,official:b.dom};
        brands.forEach(b=>marks.push({s:map[b.s],e:map[b.e-1]+1,kind:"brand"}));
      }
      else if((tq=typoOf(l.host,l.rawHost))){ score+=45; ids.push("lookalike"); hits.push("الرابط ("+l.host+") يشبه موقع «"+tq+"» الرسمي بس فيه حرف متغيّر. هذي حيلة تقليد مشهورة."); }
      else if(LAT.some(b=>l.host.includes(b))){ score+=35; ids.push("lookalike"); hits.push("الرابط ("+l.host+") يقلّد اسم جهة معروفة، لكنه مو موقعها الرسمي."); }
      else if(BAD_TLD.includes(tld)){ score+=25; ids.push("badlink"); hits.push("الرابط ("+l.host+") ينتهي بنهاية غير معتادة للجهات الرسمية."); }
      else if(/\d/.test(l.host.split(".")[0]) || (l.host.match(/-/g)||[]).length>=1){ score+=20; ids.push("badlink"); hits.push("الرابط ("+l.host+") شكله غير موثوق."); }
      else { score+=10; ids.push("link"); hits.push("فيه رابط لموقع غير معروف ("+l.host+"). لا تفتحه إلا إذا كنت متأكد."); }
      if(l.http) score+=5;
    }
    if(!compare){ // a short link that hides a brand still gets a comparison
      const b=brands.find(b=>b.dom), l=links.find(l=>!isOfficial(l.host)&&!/^(wa\.me|t\.me)$/.test(l.host));
      if(b&&l) compare={brand:b.name,fake:l.host,official:b.dom};
    }
    if(officialOnly && links.length){ ids.push("official"); score-=15; hits.push("الرابط يبدو لموقع رسمي، ومع ذلك افتح التطبيق الرسمي بنفسك بدل الرابط."); }
    if(safeHint && score<25){ ids.push("safehint"); } if(safeHint && score<25) hits.push("الرسالة تحذّرك من مشاركة الرمز، وهذا أسلوب الجهات الرسمية.");
    // context that makes a signal harmless: an inquiry line with an official/unified number, or an action the customer asked for
    const drop=(id)=>{ const k=ids.indexOf(id); if(k<0) return; const w=wts[id]||0; ids.splice(k,1); score-=w; ruleScore-=w; const tx=TXT[id]; const hi=hits.indexOf(tx); if(hi>=0) hits.splice(hi,1); };
    if(ids.includes("replyask") && (/للاستفسار|لاي استفسار|للبلاغات|للاستعلام|الرقم الموحد|خدمه العملاء علي|for (inquiries|enquiries|questions)/.test(t) || /(confirm|cancel|stop|unsubscribe|للتاكيد|للالغاء|لالغاء الاشتراك)/.test(t)) && !/(05\d{8}|\+?9665\d{8})/.test(t.replace(/\s/g,""))) drop("replyask");
    if(/بناء علي طلبك|بناء على طلبك|حسب طلبك|at your request|as you requested/.test(t) && !links.some(l=>!isOfficial(l.host)))drop("suspend");
    { const req=ids.some(i=>REQ_IDS.has(i)), press=ids.some(i=>PRESS_IDS.has(i));
      const linky=links.some(l=>!isOfficial(l.host)) || LINK_CTA.test(t) || ids.includes("replyask"), auth=brands.length>0 || AUTH.test(t);
      if(req&&press) score+=15;
      if((req||press)&&linky&&auth) score+=10;
      if(req&&press&&linky) score+=5;
      if(AWARE.test(t) && !links.some(l=>!isOfficial(l.host)) && !OTP_ASK.test(t)) score=Math.min(score,20);
      if(officialOnly && links.length && !ids.some(i=>["otp","card","nafath","remote"].includes(i))) score=Math.min(score,40); }
    score=Math.max(0,Math.min(100,score));
    const level = score>=60?"danger":score>=25?"suspicious":"safe";
    const signals = hits.length;
    if(!hits.length) hits.push("ما لقيت علامات احتيال واضحة.");
    return {level,score,reasons:[...new Set(hits)].slice(0,5),marks,brands:brands.map(b=>b.name),links:links.map(l=>l.host),compare,signals,ids,sus};
  }
  return {analyze,norm,brandNames:()=>[...new Set(BRANDS.map(b=>b[1]))]};
})();
  const VERSION = "1.0.bf04288543";
  function check(text) {
    const r = FatinEngine.analyze(String(text == null ? "" : text).slice(0, 4000));
    return { verdict: r.level === "empty" ? "safe" : r.level, score: r.score, reasons: r.reasons, signals: r.ids, links: r.links, brands: r.brands, lookalike: r.compare || null, version: VERSION };
  }
  return { check, analyze: FatinEngine.analyze, normalize: FatinEngine.norm, brands: FatinEngine.brandNames, version: VERSION };
});
