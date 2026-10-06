/* ---------- boot of the feature pack ---------- */
drawAskSug(); drawElder(); checkBadges();
// a language that is not built in is applied once, when its pack is here; until then the screen stays hidden
// behind the splash (at most 1.5 s, then the built-in English fallback is used and the pack follows)
if(i18nHas(lang)) applyLang(lang);
else { const root=document.documentElement, l=lang; let done=false; root.classList.add("i18n-wait");
  const show=()=>{ if(done) return; done=true; if(lang===l) applyLang(l); root.classList.remove("i18n-wait"); };
  i18nLoad(l).then(show,show); setTimeout(show,1500); }

/* ---------- boot ---------- */
setMode(mode); setScale(scale); setHC(store.get("fatin-hc")==="1");
drawPats();
$("msg").value=EXAMPLES[0];
{ const r=FatinEngine.analyze(EXAMPLES[0]); lastRule=r; render(r,EXAMPLES[0],{example:true}); }
// the "open Fatin on your phone" QR code only shows on wide screens: its library loads when it is on screen
try{ const box=$("qr"); const draw=()=>loadVendor("qrcode.min.js","QRCode").then(Q=>{ if(!box.firstChild) new Q(box,{text:SITE_URL,width:160,height:160,colorDark:"#03130D",colorLight:"#F3F8F5",correctLevel:Q.CorrectLevel.M}); },()=>{ box.textContent="فطن"; });
  if("IntersectionObserver" in window){ const io=new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting)){ io.disconnect(); draw(); } }); io.observe(box); } else draw(); }catch(e){}


const firstTime=store.get("fatin-onb")!=="1";
setTimeout(()=>{
  const s=$("splash"); s.classList.add("gone");
  setTimeout(()=>{ s.hidden=true; },500);
  startFlow();
}, reduced?50:1900);

(async()=>{
  try{
    let s=null; if(window.claude&&claude.use) s=await claude.use("sample");
    if(s) FATIN.inClaude=true; else { await fatinConfig; s=remoteSampleIfAny(); }
    aiFieldSync(); if(!s) return;
    sample=s;
    if(current&&!lastAI) $("l2-s").textContent="يفهم سياق الرسالة واللهجة";
    const caps=await s.limits().catch(()=>null);
    if(caps&&caps.images){ photoOK=true; privacySync(); if(caps.images.mediaTypes) $("photo").accept=caps.images.mediaTypes.join(","); }
  }catch(e){}
})();
initRadar();
