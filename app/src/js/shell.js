/* ---------- sign-in & rotating greeting ---------- */
const GREET={
  m:["هلا والله يا {n}","أرحب يا {n}","أهلًا وسهلًا يا {n}","مرحبا يا {n}","حيّاك الله يا {n}","يا هلا ومرحبا يا {n}","نوّرت يا {n}","هلا بك يا {n}"],
  f:["هلا والله يا {n}","أرحبي يا {n}","أهلًا وسهلًا يا {n}","مرحبا يا {n}","حيّاكِ الله يا {n}","يا هلا ومرحبا يا {n}","نوّرتِ يا {n}","هلا بكِ يا {n}"],
  en:["Welcome back, {n}","Hello, {n}","Good to see you, {n}","Hi {n}, stay safe today"],ur:["خوش آمدید، {n}","السلام علیکم، {n}","سلامت رہیں، {n}"],tl:["Mabuhay, {n}!","Kumusta, {n}!","Maligayang pagbabalik, {n}!"]
};
let profile=S.get("profile",null);
function pickGreeting(){
  const list=lang==="ar"?GREET[(profile&&profile.g)==="f"?"f":"m"]:GREET[lang];
  let i=S.get("greetIdx",-1); i=(i+1)%list.length; S.set("greetIdx",i);
  return list[i];
}
let greetLine="";
function drawGreeting(){
  const g=$("greet"); if(!g) return;
  if(!profile){ g.hidden=true; return; }
  if(!greetLine||g.dataset.lang!==lang){ greetLine=pickGreeting(); g.dataset.lang=lang; }
  g.hidden=false; g.textContent=greetLine.replace("{n}",profile.n);
  try{ drawMedalChip(); }catch(e){}
}
function openLogin(){ $("login").hidden=false; setTimeout(()=>$("li-name").focus(),300); }
openLogin=hookable("openLogin",openLogin);
function closeLogin(){ const o=$("login"); o.classList.add("gone"); setTimeout(()=>{ o.hidden=true; o.classList.remove("gone"); },500); }
document.querySelectorAll("#li-g button").forEach(b=>b.onclick=()=>{ document.querySelectorAll("#li-g button").forEach(x=>x.setAttribute("aria-pressed",String(x===b))); });
$("li-form").addEventListener("submit",e=>{
  e.preventDefault();
  const n=$("li-name").value.replace(/[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF<>{}\[\]"'`\\\/=;:&$%#@*^|~]/g,"").trim().replace(/\s+/g," ").slice(0,30); // a name is letters only: no markup, no hidden direction tricks
  const gb=document.querySelector('#li-g button[aria-pressed="true"]');
  if(!n){ $("li-err").textContent=lang==="ar"?"اكتب اسمك عشان نرحب فيك.":(LI_T[lang]||LI_T.en)[12]; $("li-name").focus(); return; }
  if(!gb){ $("li-err").textContent=lang==="ar"?"اختر: رجل أو امرأة، عشان نخاطبك صح.":(LI_T[lang]||LI_T.en)[13]; return; }
  profile={n,g:gb.dataset.g}; S.set("profile",profile); greetLine=""; drawGreeting(); closeLogin(); try{ if(curTab==="badges") drawProfile(); }catch(e){}
  if(store.get("fatin-onb")!=="1"||store.get("fatin-dis-asked")!=="1"){ if(store.get("fatin-dis-asked")!=="1") pickedMode=false; openOnb(); }
});
$("li-nafath").onclick=()=>{ $("li-naf-info").hidden=!$("li-naf-info").hidden; };
function startFlow(){ if(!profile) openLogin(); else if(store.get("fatin-onb")!=="1"||store.get("fatin-dis-asked")!=="1"){ if(store.get("fatin-dis-asked")!=="1") pickedMode=false; openOnb(); } }
$("logout").onclick=()=>{ profile=null; S.set("profile",null); $("li-name").value=""; document.querySelectorAll("#li-g button").forEach(x=>x.setAttribute("aria-pressed","false")); drawGreeting(); openLogin(); };

/* ---------- tabs: the More hub and its pages ---------- */
const VIEWS={scan:"v-scan",sim:"v-sim",call:"v-call",train:"v-train",more:"v-more",pats:"v-pats",ask:"v-ask",report:"v-report",family:"v-family",badges:"v-badges"};
const PILL=["scan","sim","call","train","more"];
const SUBS={scan:"سندك الذكي ضد الاحتيال",sim:"محاكاة: فطن داخل الرسائل",call:"حارس المكالمات",train:"تدرّب على كشف الاحتيال",more:"المزيد",pats:"أنماط الاحتيال في السعودية",ask:"اسأل فطن",report:"تقرير حمايتك",family:"لوحة الأسرة",badges:"ملفي الشخصي"};
let curTab="scan";
// the app's tab system: the five tabs at the bottom and the More hub's pages
function showTab(name,jump){
  if(!VIEWS[name]) name="scan"; curTab=name;
  Object.entries(VIEWS).forEach(([k,id])=>{ const v=$(id); if(!v) return; const on=k===name; if(on&&v.hidden){ v.hidden=false; v.style.animation="none"; void v.offsetWidth; v.style.animation=""; } else if(!on) v.hidden=true; });
  const pk=PILL.includes(name)?name:"more";
  document.querySelectorAll(".tab").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.tab===pk)));
  const rtl=LANGS[lang].dir==="rtl", pill=$("pill"); pill.style.right=rtl?"6px":"auto"; pill.style.left=rtl?"auto":"6px";
  pill.style.transform="translateX("+((rtl?-1:1)*100*PILL.indexOf(pk))+"%)";
  $("bar-sub").textContent=(name==="scan"&&t("sub_scan"))||SUBS[name];
  const sc=$("screen"); sc.scrollTo({top:0});
  if(name==="train"&&!quizStarted) startQuiz();
  if(name!=="sim") hideChk();
  if(name!=="call") callStop(true);
  if(name==="report") drawReport();
  if(name==="badges") drawBadges();
  if(name==="family") drawFamily();
}
showTab=hookable("showTab",showTab);
/* ---------- QR: scan with the camera or upload from this device (named) ---------- */
const QS_T={"ar":{"h":"امسح الباركود","sub":"صوّر الباركود بالكاميرا، أو ارفع صورة أو لقطة شاشة فيها الباركود.","cam":"امسح بالكاميرا","up":"ارفع من {d}","x":"إلغاء","d":{"iphone":"الآيفون","ipad":"الآيباد","android":"جوال الأندرويد","tablet":"الجهاز اللوحي","mac":"الماك","pc":"الكمبيوتر","chromebook":"الكروم بوك","device":"جهازك"}},"en":{"h":"Scan a QR code","sub":"Scan it with the camera, or upload a photo or screenshot that has the code.","cam":"Scan with camera","up":"Upload from {d}","x":"Cancel","d":{"iphone":"iPhone","ipad":"iPad","android":"your Android phone","tablet":"your tablet","mac":"Mac","pc":"computer","chromebook":"Chromebook","device":"your device"}},"ur":{"h":"کیو آر کوڈ اسکین کریں","sub":"کیمرے سے اسکین کریں، یا کوڈ والی تصویر یا اسکرین شاٹ اپ لوڈ کریں۔","cam":"کیمرے سے اسکین کریں","up":"{d} سے اپ لوڈ کریں","x":"منسوخ","d":{"iphone":"آئی فون","ipad":"آئی پیڈ","android":"اینڈرائیڈ فون","tablet":"ٹیبلٹ","mac":"میک","pc":"کمپیوٹر","chromebook":"کروم بک","device":"اپنے آلے"}},"hi":{"h":"QR कोड स्कैन करें","sub":"कैमरे से स्कैन करें, या कोड वाली फ़ोटो या स्क्रीनशॉट अपलोड करें।","cam":"कैमरे से स्कैन करें","up":"{d} से अपलोड करें","x":"रद्द करें","d":{"iphone":"iPhone","ipad":"iPad","android":"Android फ़ोन","tablet":"टैबलेट","mac":"Mac","pc":"कंप्यूटर","chromebook":"Chromebook","device":"अपने डिवाइस"}},"bn":{"h":"QR কোড স্ক্যান করুন","sub":"ক্যামেরা দিয়ে স্ক্যান করুন, অথবা কোডসহ ছবি বা স্ক্রিনশট আপলোড করুন।","cam":"ক্যামেরা দিয়ে স্ক্যান","up":"{d} থেকে আপলোড","x":"বাতিল","d":{"iphone":"iPhone","ipad":"iPad","android":"Android ফোন","tablet":"ট্যাবলেট","mac":"Mac","pc":"কম্পিউটার","chromebook":"Chromebook","device":"আপনার ডিভাইস"}},"tl":{"h":"I-scan ang QR code","sub":"I-scan gamit ang camera, o mag-upload ng larawan o screenshot na may code.","cam":"I-scan gamit ang camera","up":"I-upload mula sa {d}","x":"Kanselahin","d":{"iphone":"iPhone","ipad":"iPad","android":"Android phone","tablet":"tablet","mac":"Mac","pc":"computer","chromebook":"Chromebook","device":"device mo"}},"id":{"h":"Pindai kode QR","sub":"Pindai dengan kamera, atau unggah foto atau tangkapan layar yang berisi kode.","cam":"Pindai dengan kamera","up":"Unggah dari {d}","x":"Batal","d":{"iphone":"iPhone","ipad":"iPad","android":"ponsel Android","tablet":"tablet","mac":"Mac","pc":"komputer","chromebook":"Chromebook","device":"perangkatmu"}},"fr":{"h":"Scanner un QR code","sub":"Scanne-le avec la caméra, ou importe une photo ou une capture qui contient le code.","cam":"Scanner avec la caméra","up":"Importer depuis {d}","x":"Annuler","d":{"iphone":"l'iPhone","ipad":"l'iPad","android":"le téléphone Android","tablet":"la tablette","mac":"le Mac","pc":"l'ordinateur","chromebook":"le Chromebook","device":"ton appareil"}},"es":{"h":"Escanear código QR","sub":"Escanéalo con la cámara, o sube una foto o captura que tenga el código.","cam":"Escanear con la cámara","up":"Subir desde {d}","x":"Cancelar","d":{"iphone":"el iPhone","ipad":"el iPad","android":"el móvil Android","tablet":"la tableta","mac":"el Mac","pc":"el ordenador","chromebook":"el Chromebook","device":"tu dispositivo"}},"zh":{"h":"扫描二维码","sub":"用相机扫描，或上传带有二维码的图片或截图。","cam":"用相机扫描","up":"从{d}上传","x":"取消","d":{"iphone":"iPhone","ipad":"iPad","android":"安卓手机","tablet":"平板","mac":"Mac","pc":"电脑","chromebook":"Chromebook","device":"你的设备"}}};
function devKind(){ const u=navigator.userAgent||"", tp=navigator.maxTouchPoints||0;
  if(/iPhone|iPod/.test(u)) return "iphone"; if(/iPad/.test(u)||(/Macintosh/.test(u)&&tp>1)) return "ipad";
  if(/Android/.test(u)) return /Mobile/.test(u)?"android":"tablet"; if(/CrOS/.test(u)) return "chromebook";
  if(/Macintosh|Mac OS X/.test(u)) return "mac"; if(/Windows|Linux|X11/.test(u)) return "pc"; return "device"; }
let qsLast=null;
function openQS(){ let lg="ar"; try{ lg=lang; }catch(e){} const T=QS_T[lg]||QS_T.ar;
  $("qs-h").textContent=T.h; $("qs-sub").textContent=T.sub; $("qs-cam").textContent=T.cam; $("qs-x").textContent=T.x;
  $("qs-up").textContent=T.up.replace("{d}",T.d[devKind()]||T.d.device);
  const touch=(window.matchMedia&&matchMedia("(pointer:coarse)").matches)||(navigator.maxTouchPoints||0)>0;
  $("qs-cam-l").hidden=!touch;
  qsLast=document.activeElement; $("qs").hidden=false; setTimeout(()=>{ const b=touch?$("qs-cam-in"):$("qs-up-in"); try{ b.focus(); }catch(e){} },60); }
function closeQS(){ $("qs").hidden=true; try{ qsLast&&qsLast.focus(); }catch(e){} }
function qsPick(inp){ const f=inp.files&&inp.files[0]; closeQS(); if(!f){ inp.value=""; return; }
  try{ const dt=new DataTransfer(); dt.items.add(f); $("qr-file").files=dt.files; $("qr-file").dispatchEvent(new Event("change")); }
  catch(e){ $("qr-file").click(); }
  inp.value=""; }
$("qs-cam-in").addEventListener("change",e=>qsPick(e.target));
$("qs-up-in").addEventListener("change",e=>qsPick(e.target));
$("qs-x").onclick=closeQS;
$("qs").addEventListener("click",e=>{ if(e.target.id==="qs") closeQS(); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&!$("qs").hidden) closeQS(); });
/* floating "ask Fatin" button, like a support chat: on every page, opens the chat, back returns where you were */
let askFrom=null;
function fabSync(){ const f=$("ask-fab"); if(!f) return;
  let tb=false; try{ tb=tourOn; }catch(e){} const busy=tb||curTab==="ask"||["login","onb","panic","tour-end"].some(id=>{ const o=$(id); return o&&!o.hidden; });
  if(f.hidden!==busy) f.hidden=busy;
  const FAB_T={ar:"اسأل فطن",en:"Ask Fatin",ur:"فطن سے پوچھیں",hi:"फ़तिन से पूछें",bn:"ফাতিনকে জিজ্ঞাসা করুন",tl:"Tanungin si Fatin",id:"Tanya Fatin",fr:"Demander à Fatin",es:"Pregunta a Fatin",zh:"问 Fatin"};
  let lg="ar"; try{ lg=lang; }catch(e){} const tx=FAB_T[lg]||FAB_T.ar;
  if($("ask-fab-t").textContent!==tx) $("ask-fab-t").textContent=tx; if(f.getAttribute("aria-label")!==tx) f.setAttribute("aria-label",tx);
  const narrow=($("device").clientWidth||innerWidth)<520; f.classList.toggle("mini",narrow||curTab==="call"||curTab==="sim"); }
hook("after","showTab",()=>fabSync());
$("ask-fab").onclick=()=>{ askFrom=curTab; showTab("ask"); setTimeout(()=>{ const i=$("ask-in"); if(i) i.focus(); },120); };
{ const back=document.querySelector('#v-ask .back'); if(back) back.addEventListener("click",e=>{ if(askFrom&&askFrom!=="ask"&&askFrom!=="more"){ e.stopImmediatePropagation(); const t=askFrom; askFrom=null; showTab(t); } else askFrom=null; },true); }
// the button follows the tab, the language, the overlays and the screen width: updated on those events, not polled
hook("after","applyLang",()=>fabSync());
try{ const mo=new MutationObserver(()=>fabSync()); ["login","onb","panic","tour","tour-end"].forEach(id=>{ const o=$(id); if(o) mo.observe(o,{attributes:true,attributeFilter:["hidden"]}); }); }catch(e){}
addEventListener("resize",()=>fabSync(),{passive:true});
fabSync();
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{ const g=b.dataset.go; if(g==="panic") openPanic(); else if(g==="class") openClass(); else if(g==="qr") openQS(); else if(g==="lang"){ openLangSheet(); } else showTab(g); });
document.querySelectorAll("[data-lang]").forEach(b=>b.onclick=()=>applyLang(b.dataset.lang));

