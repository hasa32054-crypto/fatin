/* ---------- modes & a11y ---------- */
const MODE_PROFILE={
  visual:{name:"بصري",call:"voice",scale:1.1,hello:"أهلًا بك في فطن. بقرأ لك كل شي بالصوت، وبنبهك بالصوت والاهتزاز."},
  simple:{name:"مبسّط",call:"voice",scale:1.1,hello:"أهلًا بك في فطن. بقول لك كل شي بجملة قصيرة ورمز كبير."},
  hearing:{name:"سمعي",call:"chat",scale:1,hello:""},
  touch:{name:"لمسي",call:"chat",scale:1.05,hello:""},
  general:{name:"عام",call:"voice",scale:1,hello:""}
};
let pickedMode=store.get("fatin-onb")==="1";
function applyMode(m){
  setMode(m);
  const pf=MODE_PROFILE[m];
  try{ setCallMode(pf.call); }catch(e){}
  try{ setScale(pf.scale); }catch(e){}
}
function welcome(){
  const pf=MODE_PROFILE[mode];
  if(mode==="visual"||mode==="simple") speak(pf.hello);
  else if(mode==="hearing") flash("safe");
  else if(mode==="general") return;
  else { vibrate("safe"); flash("safe"); }
}
function setMode(m){
  try{ window.speechSynthesis&&speechSynthesis.cancel(); }catch(e){}
  mode=m; store.set("fatin-mode",m);
  dev.classList.remove("m-visual","m-simple","m-hearing","m-touch","m-elder","m-general"); dev.classList.add("m-"+m);
  document.querySelectorAll(".mode").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mode===m)));
  const t=$("mode-chip-t"); if(t) t.textContent=MODE_PROFILE[m].name;
}
setMode=hookable("setMode",setMode);
let scale=parseFloat(store.get("fatin-scale"))||1;
function setScale(s){ scale=Math.max(.9,Math.min(1.4,Math.round(s*10)/10)); dev.style.setProperty("--scale",scale); store.set("fatin-scale",scale); }
function setHC(on){ dev.classList.toggle("hc",on); $("hc").setAttribute("aria-pressed",String(on)); store.set("fatin-hc",on?"1":"0"); }
$("hc").onclick=()=>setHC(!dev.classList.contains("hc"));

/* ---------- tabs ---------- */
const SUB={scan:"سندك الذكي ضد الاحتيال",sim:"محاكاة: فطن داخل الرسائل",call:"حارس المكالمات",train:"تدرّب على كشف الاحتيال",pats:"أنماط الاحتيال في السعودية"};
// showTab lives in shell.js (the More hub's tab system)
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
document.querySelectorAll("[data-jump]").forEach(b=>b.onclick=()=>showTab("file",b.dataset.jump));
document.querySelectorAll(".go[data-tab]").forEach(b=>b.onclick=()=>showTab(b.dataset.tab));

/* ---------- counters ---------- */
let countersDone=false;
function runCounters(){
  if(countersDone||reduced) return; countersDone=true;
  document.querySelectorAll("[data-count]").forEach(el=>{
    const to=+el.dataset.count, t0=performance.now();
    const st=t=>{const p=Math.min(1,(t-t0)/1100); el.textContent=Math.round(to*(1-Math.pow(1-p,3)))+"%"; if(p<1) requestAnimationFrame(st);};
    requestAnimationFrame(st);
  });
}
function countTo(el,to,ms=900){
  if(reduced){ el.textContent=to; return; }
  const from=+el.textContent||0, t0=performance.now();
  const st=t=>{const p=Math.min(1,(t-t0)/ms); el.textContent=Math.round(from+(to-from)*(1-Math.pow(1-p,3))); if(p<1) requestAnimationFrame(st);};
  requestAnimationFrame(st);
}

/* ---------- highlighted message ---------- */
const PRI={link:5,bad:4,brand:3,okLink:2,good:1};
function paintMessage(el,raw,marks,animate){
  el.innerHTML="";
  const owner=new Array(raw.length).fill(null);
  [...marks].sort((a,b)=>PRI[a.kind]-PRI[b.kind]).forEach(m=>{ for(let i=Math.max(0,m.s);i<Math.min(raw.length,m.e);i++) owner[i]=m.kind; });
  const spans=[]; let i=0;
  while(i<raw.length){ const k=owner[i]; let j=i; while(j<raw.length&&owner[j]===k) j++;
    if(k){ const s=document.createElement("span"); s.className="m "+k; s.textContent=raw.slice(i,j); el.appendChild(s); spans.push(s); }
    else el.appendChild(document.createTextNode(raw.slice(i,j)));
    i=j; }
  if(!animate||reduced){ spans.forEach(s=>s.classList.add("on")); return; }
  spans.forEach((s,n)=>setTimeout(()=>s.classList.add("on"),120+n*140));
}

/* ---------- render verdict ---------- */
function render(res,raw,opts={}){
  current=res;
  const L=LEVELS[res.level];
  $("verdict").dataset.level=res.level;
  const t=$("v-title"); t.textContent=L.title; t.classList.remove("stamp"); void t.offsetWidth; t.classList.add("stamp");
  $("v-sub").textContent=opts.example?"مثال · اضغط أي مثال أو الصق رسالتك":(res.ai?"بعد طبقتين من الفحص":"فحص سريع على جهازك");
  $("v-simple").textContent=res.simple||L.simple;
  $("g-fg").style.strokeDashoffset=String(326.7*(1-Math.max(2,res.score)/100));
  countTo($("g-num"),res.score);
  paintMessage($("msgview"),raw.slice(0,1200),res.marks||[],!opts.example);
  const c=res.compare;
  $("cmp-wrap").hidden=!c;
  if(c){ $("cmp-fake").textContent=c.fake; $("cmp-real").textContent=c.official; $("cmp-real-l").textContent="موقع «"+c.brand+"» الرسمي"; }
  const ul=$("reasons"); ul.innerHTML="";
  res.reasons.forEach(r=>{const li=document.createElement("li");li.textContent=r;ul.appendChild(li);});
  drawPicto(res); dissect(res.level==="safe"?null:res.sus); radarLine();
  $("alert-btn").hidden=res.level==="safe"; $("report").hidden=res.level==="safe";
  $("trust-box").hidden=true;
  // how-decided panel
  const r=lastRule||res;
  $("l1-v").textContent=r.score; $("l1-v").style.color="var(--"+(r.level==="danger"?"danger":r.level==="suspicious"?"warn":"safe")+")";
  $("l1-s").textContent=r.signals?("لقطت "+r.signals+" "+(r.signals===1?"علامة":"علامات")+" احتيال"):"ما لقطت علامات معروفة";
  if(lastAI&&LEVELS[lastAI.level]){
    const a=lastAI; $("l2-v").textContent=Math.round(Number(a.score)||0); $("l2-v").style.color="var(--"+(a.level==="danger"?"danger":a.level==="suspicious"?"warn":"safe")+")";
    $("l2-s").textContent="حكمه: "+LEVELS[a.level].word;
    $("agree").textContent = a.level===r.level ? "✓ الطبقتان متفقتان، والحكم مؤكد." : (RANK[a.level]>RANK[r.level]? "الذكاء الاصطناعي رأى خطرًا أكبر، فأخذ فطن بالأحوط." : "القواعد رأت خطرًا أكبر، فأخذ فطن بالأحوط.");
  } else { $("l2-v").textContent="—"; $("l2-v").style.color=""; $("l2-s").textContent=sample?"يفهم سياق الرسالة واللهجة":"غير مفعّل في هذا العرض"; $("agree").textContent="الحكم الحالي من قواعد فطن السريعة."; }
}
render=hookable("render",render);

/* ---------- respond ---------- */
function speechText(res){
  const L=LEVELS[res.level];
  let s="فطن يقول: الرسالة "+L.word+". "+(res.simple||L.simple);
  if(mode!=="simple"&&res.level!=="safe") s+=" السبب: "+res.reasons.slice(0,2).join(" ");
  return s;
}
speechText=hookable("speechText",speechText);
/* pick the most natural Arabic voice the device offers */
function arVoices(){
  try{
    const vs=speechSynthesis.getVoices().filter(v=>/^ar\b|^ar[-_]/i.test(v.lang));
    const sc=v=>(/natural|neural|online|premium|enhanced|siri/i.test(v.name)?6:0)+(/google/i.test(v.name)?3:0)+(/sa$/i.test(v.lang)?2:0)+(/hamed|majed|maged|tarik|zariyah|laila|hoda|naayf/i.test(v.name)?1:0)+(v.localService?0:1);
    return vs.sort((a,b)=>sc(b)-sc(a));
  }catch(e){ return []; }
}
function utter(text,opt={}){
  const u=new SpeechSynthesisUtterance(text); u.lang="ar-SA";
  const base=parseFloat($("rate").value)||1.1;
  u.rate=Math.min(1.6,base*(opt.rate||1)); u.pitch=opt.pitch||1;
  const vs=arVoices(); const v=vs[Math.min(opt.voice||0,Math.max(0,vs.length-1))]; if(v) u.voice=v;
  return u;
}
utter=hookable("utter",utter);
