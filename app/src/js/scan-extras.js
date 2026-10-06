/* ---------- messages simulation: select text → "تحقق بفطن" → system-style card ---------- */
const SIM_MSGS=[
  {from:"AbsherSA",t:EXAMPLES[0]},
  {from:"أخوي محمد",t:"وين صرت؟ العشاء الساعة 9 عند أمي، لا تتأخر"},
  {from:"SMSA",t:EXAMPLES[1]},
  {from:"البنك",t:"رمز التحقق 482913. لا تشاركه مع أي شخص."},
  {from:"+966 5x xxx xxxx",t:EXAMPLES[3]}
];
function drawSim(){
  const box=$("sim-body"); box.innerHTML="";
  SIM_MSGS.forEach(m=>{ const d=document.createElement("div"); d.className="sbub"; const sm=document.createElement("small"); sm.textContent=m.from; const p=document.createElement("p"); p.textContent=m.t; d.append(sm,p); box.appendChild(d); attachPress(p); });
}
let chkText="", pressT=null;
function attachPress(p){
  const start=()=>{ clearTimeout(pressT); pressT=setTimeout(()=>{ const r=document.createRange(); r.selectNodeContents(p); const s=getSelection(); s.removeAllRanges(); s.addRange(r); p.classList.add("pressed"); setTimeout(()=>p.classList.remove("pressed"),400); showChkFor(r); },480); };
  const stop=()=>clearTimeout(pressT);
  p.addEventListener("pointerdown",start); ["pointerup","pointerleave","pointercancel"].forEach(e=>p.addEventListener(e,stop));
  p.addEventListener("contextmenu",e=>e.preventDefault());
}
function showChkFor(range){
  const txt=range.toString().trim(); if(txt.length<3){ hideChk(); return; }
  chkText=txt;
  const rr=range.getBoundingClientRect(), dr=dev.getBoundingClientRect(), c=$("chk");
  c.hidden=false;
  const w=c.offsetWidth, h=c.offsetHeight;
  let top=rr.bottom-dr.top+10; if(top+h>dr.height-100) top=rr.top-dr.top-h-10;
  let left=rr.left-dr.left+rr.width/2-w/2; left=Math.max(10,Math.min(dr.width-w-10,left));
  c.style.top=top+"px"; c.style.left=left+"px";
}
function hideChk(){ const c=$("chk"); if(c) c.hidden=true; }
let selT=null;
document.addEventListener("selectionchange",()=>{
  clearTimeout(selT);
  selT=setTimeout(()=>{
    const s=getSelection(); if(!s||s.rangeCount===0||s.isCollapsed){ hideChk(); return; }
    const r=s.getRangeAt(0); const body=$("sim-body");
    if($("v-sim").hidden||!body.contains(r.startContainer)){ hideChk(); return; }
    // selecting any part of a bubble selects the whole message, so Fatin always checks all of it
    const sn=r.startContainer, bp=(sn.nodeType===1?sn:sn.parentElement).closest(".sbub p");
    if(bp && r.toString().trim()!==bp.textContent.trim()){
      const nr=document.createRange(); nr.selectNodeContents(bp); s.removeAllRanges(); s.addRange(nr);
      bp.classList.add("pressed"); setTimeout(()=>bp.classList.remove("pressed"),400); return; }
    showChkFor(r);
  },180);
});
$("screen").addEventListener("scroll",hideChk,{passive:true});
$("chk-copy").onclick=async()=>{ try{ await navigator.clipboard.writeText(chkText); }catch(e){} hideChk(); };
const OSC_LINE={
  danger:r=>(/رمز|بطاق|السري|كلمه المرور/.test(FatinEngine.norm(r.reasons.join(" ")))?"لا تعطِ أي بيانات أو رموز. تجاهلها.":"لا تضغط الرابط ولا تعطِ بياناتك. تجاهلها."),
  suspicious:()=>"تجاهلها حتى تتأكد من المرسل.",
  safe:()=>"ما فيها علامات احتيال. ومع ذلك لا تعطِ رموزك لأحد."
};
const OSC_WORD={danger:"خطر",suspicious:"انتبه",safe:"غير خطرة"};
let oscT=null;
$("chk-go").onclick=()=>{
  const txt=chkText; hideChk(); try{ getSelection().removeAllRanges(); }catch(e){}
  const r=FatinEngine.analyze(txt); if(r.level==="empty") return;
  const o=$("osc"); o.dataset.level=r.level;
  $("osc-i").innerHTML=r.level==="safe"?ICON.safe:(r.level==="danger"?ICON.danger:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 6v8M12 18.5h.01"/></svg>');
  $("osc-w").textContent=OSC_WORD[r.level]; $("osc-l").textContent=OSC_LINE[r.level](r);
  o.dataset.text=txt;
  o.classList.remove("on"); void o.offsetWidth; o.classList.add("on");
  if(mode==="hearing") flash(r.level); else if(mode!=="general") speak("فطن: "+OSC_WORD[r.level]+". "+$("osc-l").textContent);
  clearTimeout(oscT); oscT=setTimeout(()=>o.classList.remove("on"),9000);
};
$("osc-ok").onclick=()=>{ $("osc").classList.remove("on"); try{speechSynthesis.cancel();}catch(e){} };
$("osc-more").onclick=()=>{ const t=$("osc").dataset.text||""; $("osc").classList.remove("on"); showTab("scan"); $("msg").value=t; run(); };
drawSim();


/* ---------- pictograms ---------- */
const PIC={
  link:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/></svg>',
  code:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="3"/><path d="M7 12h.01M10.5 12h.01M14 12h.01M17.5 12h.01"/></svg>',
  money:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="19" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.6"/></svg>',
  reply:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  family:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M2.5 20c.6-3.4 2.8-5.5 5.5-5.5s4.9 2.1 5.5 5.5M14 15.3c.9-.5 1.9-.8 3-.8 2.3 0 4 1.7 4.5 4.5"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
};
function drawPicto(res){
  const box=$("picto"); box.innerHTML="";
  let items;
  if(res.level==="safe") items=[["ok","check","آمنة"],["no","code","لا تعطِ رمزك لأحد"]];
  else{
    items=[];
    const ids=res.ids||[];
    if(res.sus||ids.includes("short")) items.push(["no","link","لا تضغط الرابط"]);
    if(ids.some(i=>["otp","card","update"].includes(i))) items.push(["no","code","لا تعطِ الرمز"]);
    if(ids.some(i=>["money","ship","newnum","invest","prize"].includes(i))) items.push(["no","money","لا تحوّل فلوس"]);
    items.push(["no","reply","لا ترد"]);
    items.push(["ok","family","اسأل أهلك"]);
    items=items.slice(0,4);
  }
  items.forEach(([k,ic,t])=>{ const d=document.createElement("div"); d.className="pc "+k; d.innerHTML='<span class="pi">'+PIC[ic]+'</span><b></b>'; d.querySelector("b").textContent=t; box.appendChild(d); });
}

/* ---------- link dissection ---------- */
const LAT_BRANDS=["absher","rajhi","alrajhi","stc","smsa","aramex","saher","spl","ahli","alinma","najiz","musaned","sdaia","nafath","tawakkalna","moi","gov"];
function dissect(link){
  const wrap=$("dis-wrap"); if(!link){ wrap.hidden=true; return; }
  const u=link.u; const m=u.match(/^(https?:\/\/)?([^\/?#]+)(.*)$/i); if(!m){ wrap.hidden=true; return; }
  const proto=m[1]||"", host=m[2].toLowerCase(), path=m[3]||"";
  const parts=host.split(".");
  let n=2; if(parts.length>=3&&/^(com|gov|edu|net|org|med|sch)$/.test(parts[parts.length-2])&&parts[parts.length-1].length===2) n=3;
  const owner=parts.slice(-n).join("."), sub=parts.slice(0,-n).join("."), tld=parts[parts.length-1];
  const segs=[];
  if(proto) segs.push(["proto",proto,proto.startsWith("https")?"بداية عادية":"غير مشفّر"]);
  if(sub) segs.push(["sub",sub+".","زينة للخداع"]);
  segs.push(["own",owner,"صاحب الموقع"]);
  if(path&&path!=="/") segs.push(["path",path.length>22?path.slice(0,20)+"…":path,"الصفحة"]);
  const box=$("dis-url"); box.innerHTML="";
  segs.forEach(([k,txt,lab],i)=>{ const d=document.createElement("div"); d.className="seg-u "+k; d.innerHTML="<code></code><small></small>"; d.querySelector("code").textContent=txt; d.querySelector("small").textContent=lab; box.appendChild(d); setTimeout(()=>d.classList.add("on"),reduced?0:200+i*320); });
  $("dis-owner").textContent=owner;
  const notes=[];
  const isShort=["bit.ly","tinyurl.com","cutt.ly","t.ly","rb.gy","is.gd","shorturl.at","goo.su","tiny.cc","s.id","ow.ly"].includes(host);
  if(isShort) notes.push("رابط مختصر: يخفي العنوان الحقيقي، فما تقدر تعرف وين بيوديك.");
  const subBrand=LAT_BRANDS.find(b=>sub.includes(b)), ownBrand=LAT_BRANDS.find(b=>owner.split(".")[0].includes(b));
  if(sub&&subBrand) notes.push("«"+sub+"» في بداية الرابط مجرد زينة. الموقع الحقيقي هو «"+owner+"».");
  else if(ownBrand) notes.push("اسم الجهة مدموج داخل اسم غريب: «"+owner+"» مو الموقع الرسمي.");
  if(["xyz","top","site","online","icu","click","info","live","shop","buzz","vip","link","support","help","sbs","cfd"].includes(tld)) notes.push("النهاية «."+tld+"» غير معتادة للجهات الرسمية في السعودية.");
  if(!proto.startsWith("https")&&proto) notes.push("بدون https: الاتصال غير مشفّر.");
  const ul=$("dis-notes"); ul.innerHTML="";
  notes.forEach(t=>{const li=document.createElement("li"); li.textContent=t; ul.appendChild(li);});
  const r=document.createElement("li"); r.className="rule"; r.textContent="القاعدة: اقرأ الرابط من آخره. الجزء اللي قبل أول «/» مباشرة هو صاحب الموقع."; ul.appendChild(r);
  wrap.hidden=false;
}

