/* ---------- onboarding ---------- */
let slide=0, obTimer=null, obI=0;
const DEMO=[
  {l:"danger",t:"خطير",parts:[["أبشر: "],["تم تعليق خدماتك","bad"],[" حدّثها "],["خلال 24 ساعة","bad"],[": "],["absher-sa-update.xyz","bad link"]]},
  {l:"safe",t:"آمنة",parts:[["رمز التحقق 482913. "],["لا تشاركه مع أي شخص.","good"]]},
  {l:"danger",t:"خطير",parts:[["شحنتك معلقة. "],["ادفع رسوم 12 ريال","bad"],[": "],["bit.ly/3smsa","bad link"]]}
];
async function obLoop(){
  if($("onb").hidden) return;
  const d=DEMO[obI%DEMO.length]; obI++;
  const b=$("ob-bubble"), v=$("ob-v"), beam=$("ob-beam");
  b.classList.add("out"); v.classList.add("out"); await wait(400);
  b.innerHTML=""; d.parts.forEach(([t,c])=>{const s=document.createElement("span"); s.textContent=t; if(c) s.className="w "+c; b.appendChild(s);});
  v.dataset.l=d.l; $("ob-i").innerHTML=ICON[d.l]; $("ob-t").textContent=d.t;
  b.classList.remove("out"); await wait(500);
  beam.classList.remove("run"); void beam.offsetWidth; beam.classList.add("run");
  for(const w of b.querySelectorAll(".w")){ await wait(380); w.classList.add("on"); }
  await wait(400); v.classList.remove("out");
  obTimer=setTimeout(obLoop,2800);
}
function goSlide(n){
  slide=Math.max(0,Math.min(2,n));
  $("track").style.transform="translateX("+(slide*100/3)+"%)";
  document.querySelectorAll("#dots i").forEach((d,i)=>d.classList.toggle("on",i===slide));
  $("onb-next").textContent=slide===2?(pickedMode?"ابدأ مع فطن":"اختر إجابتك أولًا"):"التالي";
  $("onb-next").disabled=slide===2&&!pickedMode;
}
function closeOnb(){ if(!pickedMode){ pickedMode=true; applyMode("general"); } store.set("fatin-dis-asked","1"); store.set("fatin-onb","1"); const o=$("onb"); o.classList.add("gone"); clearTimeout(obTimer); setTimeout(()=>{o.hidden=true;o.classList.remove("gone");},500); welcome(); }
function openOnb(){ const o=$("onb"); o.hidden=false; if(!pickedMode){ document.querySelectorAll(".onb-modes .mode").forEach(b=>b.setAttribute("aria-pressed","false")); disAnswer(null); } else disAnswer(mode==="general"?"no":"yes"); goSlide(store.get("fatin-dis-asked")==="1"?0:2); clearTimeout(obTimer); obI=0; obLoop(); }
openOnb=hookable("openOnb",openOnb);
function disAnswer(v){
  document.querySelectorAll(".dis-btn").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.dis===v)));
  $("onb-modes").hidden=v!=="yes"; $("onb-sub").hidden=v!=="yes";
}
document.querySelectorAll(".dis-btn").forEach(b=>b.onclick=()=>{
  const v=b.dataset.dis; disAnswer(v);
  if(v==="no"){ pickedMode=true; applyMode("general"); }
  else { if(mode==="general"){ pickedMode=false; document.querySelectorAll(".onb-modes .mode").forEach(x=>x.setAttribute("aria-pressed","false")); } setTimeout(()=>{ const m=$("onb-modes"); m.scrollIntoView({block:"nearest",behavior:"smooth"}); },60); }
  goSlide(2);
});
$("onb-next").onclick=()=>{ if(slide<2) goSlide(slide+1); else closeOnb(); };
$("onb-skip").onclick=closeOnb;
$("replay-onb").onclick=openOnb;
$("mode-chip").onclick=()=>{ showTab("settings"); const d=$("mode-field"); setTimeout(()=>{ $("screen").scrollTo({top:d.offsetTop-70,behavior:reduced?"auto":"smooth"}); },80); };
(()=>{ let x0=null; const s=$("slides");
  s.addEventListener("pointerdown",e=>{x0=e.clientX;});
  s.addEventListener("pointerup",e=>{ if(x0===null) return; const dx=e.clientX-x0; x0=null; if(Math.abs(dx)>50) goSlide(slide+(dx>0?1:-1)); });
})();

/* ---------- wiring ---------- */
document.querySelectorAll(".mode").forEach(b=>b.addEventListener("click",()=>{
  const inOnb=!!b.closest(".onb-modes");
  if(inOnb){ pickedMode=true; goSlide(2); }
  applyMode(b.dataset.mode);
  if(inOnb) return;
  if(b.dataset.mode==="visual") speak("الوضع البصري. فطن بيقرأ لك النتيجة بالصوت.");
  if(b.dataset.mode==="hearing") flash(current?current.level:"safe");
  if(b.dataset.mode==="touch") vibrate("safe");
}));
$("scan").onclick=run;
document.querySelectorAll("[data-ex]").forEach(c=>c.onclick=()=>{$("msg").value=EXAMPLES[+c.dataset.ex]; run();});
$("speak").onclick=()=>{ if(current) speak(speechText(current)); };
$("alert-btn").onclick=showTrust;
$("copy-trust").onclick=async()=>{
  const t=$("trust-text").textContent;
  try{ await navigator.clipboard.writeText(t); $("copy-trust").textContent="تم النسخ"; }
  catch(e){ const r=document.createRange(); r.selectNodeContents($("trust-text")); const s=getSelection(); s.removeAllRanges(); s.addRange(r); $("copy-trust").textContent="حدّد وانسخ"; }
  setTimeout(()=>$("copy-trust").textContent="نسخ",2000);
};
$("trust-num").value=store.get("fatin-trust")||"";
$("trust-num").addEventListener("change",()=>{store.set("fatin-trust",$("trust-num").value); if(!$("trust-box").hidden) showTrust();});
const savedRate=store.get("fatin-rate"); if(savedRate&&["0.9","1.1","1.3"].includes(savedRate)) $("rate").value=savedRate;
$("rate").addEventListener("change",()=>store.set("fatin-rate",$("rate").value));
$("photo").addEventListener("change",e=>fromPhoto(e.target.files&&e.target.files[0]));
$("msg").addEventListener("keydown",e=>{ if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)) run(); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape") sheet(false); });
try{ speechSynthesis&&speechSynthesis.getVoices(); }catch(e){}


