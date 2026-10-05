/* ---------- guardian: share progress (not messages) with the family code ---------- */
function progressOut(lvl,label){
  try{ familyAlert(lvl,label); const {cur}=levelState(); const n=earned.filter(id=>BADGES.some(b=>b[0]===id)).length;
    familyAlert("progress","المستوى "+cur.L.n+" «"+cur.L.name+"» · "+n+" من "+BADGES.length+" وسام · "+(ST.caught||0)+" احتيال كشفه"); }catch(e){}
}

/* ---------- achievement card: drawn on a canvas, saved as PNG ---------- */
function rr(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
async function drawShareCard(){
  try{ await document.fonts.ready; }catch(e){}
  const W=1080,H=1350,c=document.createElement("canvas"); c.width=W; c.height=H; const x=c.getContext("2d");
  const F1="'Alexandria','IBM Plex Sans Arabic',sans-serif", F2="'IBM Plex Sans Arabic','Alexandria',sans-serif";
  const g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,"#0B3A28"); g.addColorStop(1,"#03130D"); x.fillStyle=g; x.fillRect(0,0,W,H);
  const rg=x.createRadialGradient(W*.85,120,10,W*.85,120,700); rg.addColorStop(0,"rgba(224,188,94,.28)"); rg.addColorStop(1,"rgba(224,188,94,0)"); x.fillStyle=rg; x.fillRect(0,0,W,H);
  x.strokeStyle="rgba(224,188,94,.55)"; x.lineWidth=4; rr(x,36,36,W-72,H-72,48); x.stroke();
  x.direction=LANGS[curLang()].dir==="rtl"?"rtl":"ltr"; x.textAlign="right";
  // brand
  x.save(); x.translate(W-215,72); x.scale(.92,.92); x.translate(-19,-26); x.fillStyle="#E0BC5E"; x.fill(new Path2D("M40 49 50 35 60 49ZM65 49 75 35 85 49ZM90 49 100 30 110 49ZM115 49 125 35 135 49ZM140 49 150 35 160 49Z")); x.fill(new Path2D("M36 48H164C166 110 142 152 100 184 58 152 34 110 36 48Z")); x.fillStyle="#F4DA94"; x.fill(new Path2D("M100 48H164C166 110 142 152 100 184Z")); x.fillStyle="#03130D"; x.fill(new Path2D("M50.5 102h9v27h-9ZM59.5 120h9v9h-9ZM68.5 102h9v27h-9ZM77.5 120h9v9h-9ZM86.5 75h9v54h-9ZM95.5 102h18v9h-18ZM95.5 120h27v9h-27ZM104.5 111h9v9h-9ZM122.5 102h27v9h-27ZM122.5 111h9v18h-9ZM131.5 120h9v9h-9ZM140.5 111h9v18h-9ZM64 102.8 67.24 106.05 64 109.29 60.76 106.05ZM120.7 84.9Q136 71.85 151.3 84.9 136 97.95 120.7 84.9Z")); x.fillStyle="#E0BC5E"; x.beginPath(); x.arc(136,84.9,4.68,0,7); x.fill(); x.restore();
  x.fillStyle="#F4DA94"; x.font="800 64px "+F1; x.fillText("فَطِن",W-250,150); x.fillStyle="#A8C5B6"; x.font="500 30px "+F2; x.fillText(L2("card_tag"),W-250,196,520);
  // name + level
  const {per,cur}=levelState(), total=earned.filter(id=>BADGES.some(b=>b[0]===id)).length;
  x.fillStyle="#EFF7F2"; x.font="800 76px "+F1; x.fillText((profile&&profile.n)||"Fatin",W-100,360,580);
  x.fillStyle="#A8C5B6"; x.font="500 34px "+F2; x.fillText(curLang()==="ar"&&profile&&profile.g==="f"?L2("card_ach_f"):L2("card_ach"),W-100,420,580);
  const cx=230, cy=330, R=120; x.lineWidth=26; x.strokeStyle="rgba(255,255,255,.1)"; x.beginPath(); x.arc(cx,cy,R,0,Math.PI*2); x.stroke();
  x.strokeStyle=cur.L.c; x.lineCap="round"; x.beginPath(); x.arc(cx,cy,R,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(.02,total/BADGES.length)); x.stroke();
  x.textAlign="center"; x.fillStyle="#F4DA94"; x.font="800 64px "+F1; x.fillText(total+"/"+BADGES.length,cx,cy+10); x.fillStyle="#A8C5B6"; x.font="500 28px "+F2; x.fillText(L2("card_medal"),cx,cy+52);
  // level banner
  x.textAlign="right"; const lg=x.createLinearGradient(100,0,W-100,0); lg.addColorStop(0,"rgba(224,188,94,.08)"); lg.addColorStop(1,"rgba(224,188,94,.26)"); x.fillStyle=lg; rr(x,100,500,W-200,130,30); x.fill();
  x.fillStyle="#A8C5B6"; x.font="500 30px "+F2; x.fillText(L2("card_lvl",{n:cur.L.n}),W-140,552); x.fillStyle=cur.L.c; x.font="800 50px "+F1; x.fillText(lvN(cur.L)[0],W-140,608);
  // medals grid: 3 rows (levels) x 5
  per.forEach((p,ri)=>{ const y=730+ri*150; p.bs.forEach((b,ci)=>{ const mx=W-190-ci*175, on=earned.includes(b[0]);
    x.beginPath(); x.arc(mx,y,52,0,Math.PI*2); if(on){ const mg=x.createRadialGradient(mx-16,y-18,6,mx,y,56); mg.addColorStop(0,"#FFF6D6"); mg.addColorStop(.5,p.L.c); mg.addColorStop(1,"#5A4512"); x.fillStyle=mg; x.fill(); }
    else { x.fillStyle="rgba(255,255,255,.05)"; x.fill(); x.setLineDash([8,8]); x.lineWidth=3; x.strokeStyle="rgba(190,230,210,.3)"; x.stroke(); x.setLineDash([]); }
    x.fillStyle=on?"#03130D":"rgba(190,230,210,.35)"; x.font="800 40px "+F1; x.textAlign="center"; x.fillText(on?"★":"·",mx,y+14); }); });
  // stats
  x.textAlign="center"; [[ST.scans||0,L2("card_scans")],[ST.caught||0,L2("card_caught")],[ST.callsClosed||0,L2("card_calls")]].forEach(([v,l],i)=>{ const sx=W-250-i*290;
    x.fillStyle="#E0BC5E"; x.font="800 70px "+F1; x.fillText(String(v),sx,1200); x.fillStyle="#A8C5B6"; x.font="500 28px "+F2; x.fillText(l,sx,1245); });
  x.fillStyle="rgba(190,230,210,.55)"; x.font="500 24px "+F2; x.fillText("عزّنا بتمكينهم · وطن يبتكر",W/2,1295);
  return c;
}
let shareBlob=null, dls=null;
(async()=>{ try{ if(window.claude&&claude.use) dls=await claude.use("downloads"); }catch(e){} })();
$("pf-share").onclick=async()=>{
  const c=await drawShareCard(); $("share-img").src=c.toDataURL("image/png"); $("share-msg").textContent=""; $("share-ov").hidden=false;
  shareBlob=await new Promise(r=>c.toBlob(r,"image/png"));
};
$("share-close").onclick=()=>{ $("share-ov").hidden=true; };
$("share-save").onclick=async()=>{
  if(!shareBlob) return; const name="fatin-"+((profile&&profile.n)||"achievement")+".png", m=$("share-msg");
  if(dls){ try{ const r=await dls.save({filename:name,data:shareBlob}); m.textContent=r.status==="saved"?"✓ حفظناها. شاركها مع أهلك وأصحابك.":""; return; }
    catch(e){ if(e&&e.code==="declined"){ m.textContent="ما انحفظت. تقدر تحاول مرة ثانية."; return; } if(e&&e.code==="rate_limited"){ m.textContent="لحظة، فيه نافذة حفظ مفتوحة."; return; } } }
  try{ const f=new File([shareBlob],name,{type:"image/png"}); if(navigator.canShare&&navigator.canShare({files:[f]})){ await navigator.share({files:[f],title:"إنجازي في فطن"}); return; } }catch(e){ if(e&&e.name==="AbortError") return; }
  try{ const a=document.createElement("a"); a.href=URL.createObjectURL(shareBlob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); m.textContent="✓ نزّلناها."; }
  catch(e){ m.textContent="اضغط مطولًا على الصورة واحفظها."; }
};

function applyTrain(){
  const set=(sel,k,attr)=>{ const n=document.querySelector(sel); if(!n) return; if(attr) n.setAttribute(attr,L2(k)); else n.textContent=L2(k); };
  [['#v-train .seg [data-pane="quiz"]',"seg_quiz"],['#v-train .seg [data-pane="sim"]',"seg_sim"],['#v-train .seg [data-pane="vib"]',"seg_vib"],
   ["#pane-quiz .eyebrow","q_eye"],["#pane-quiz h2","q_h"],["#pane-quiz .sub","q_sub"],
   ["#pane-sim .eyebrow","s_eye"],["#pane-sim h2","s_h"],["#pane-sim .sub","s_sub"],['#scen [data-scen="bank"]',"sc_bank"],['#scen [data-scen="ship"]',"sc_ship"],['#scen [data-scen="family"]',"sc_family"],
   ["#pane-vib .eyebrow","v_eye"],["#pane-vib h2","v_h"],["#pane-vib .sub","v_sub"],[".vquiz > b","vq_b"],[".vquiz > .hint","vq_hint"],["#vq-play","vq_play"],
   ["#pf-edit","pf_edit"],["#pf-share","pf_share"],["#pf-med-eye","med_eye"],["#pf-med-h","med_h"],["#ch-eye","ch_eye"],["#ch-h","ch_h"],["#ch-sub","ch_sub"],
   ["#share-save","share_save"],["#share-close","share_close"],["#medal-t","my_medals"]].forEach(([s,k])=>set(s,k));
  set("#say-in","say_ph","placeholder");
  document.querySelectorAll("#vq-ans [data-v]").forEach(b=>b.textContent=vl(b.dataset.v)[0]);
  try{ drawVibs(); }catch(e){}
  try{ if(quizStarted&&qi<QUIZ.length&&qAns.length===qi) drawQ(); }catch(e){}
  try{ if(simStarted&&simTurns.length<=1) startSim(simScen); else if(simStarted&&!simDone){ drawQuick(); } }catch(e){}
  try{ if(curTab==="badges") drawBadges(); }catch(e){}
}
hook("after","applyLang",()=>{ try{ applyTrain(); }catch(e){} });
Object.assign(T.en,{lang_note:"Main screens, training and medals are translated. The call guard and some pages are still in Arabic."});
Object.assign(T.ur,{lang_note:"اہم اسکرینیں، مشق اور تمغے ترجمہ ہو چکے ہیں۔ کال گارڈ اور کچھ صفحات ابھی عربی میں ہیں۔"});
Object.assign(T.tl,{lang_note:"Naisalin na ang pangunahing screen, ensayo at medalya. Nasa Arabic pa ang call guard at ilang pahina."});
if(T.hi){ T.hi.lang_note="मुख्य स्क्रीन, अभ्यास और पदक अनुवादित हैं। कॉल गार्ड और कुछ पेज अभी अरबी में हैं।"; T.bn.lang_note="প্রধান স্ক্রিন, অনুশীলন ও পদক অনুবাদ করা হয়েছে। কল গার্ড ও কিছু পেজ এখনো আরবিতে।";
  T.id.lang_note="Layar utama, latihan, dan medali sudah diterjemahkan. Penjaga panggilan dan beberapa halaman masih berbahasa Arab."; T.zh.lang_note="主要界面、训练和勋章已翻译。来电防护和部分页面暂为阿拉伯语。";
  T.es.lang_note="Las pantallas principales, el entrenamiento y las medallas están traducidos. El guardián de llamadas y algunas páginas siguen en árabe."; T.fr.lang_note="Les écrans principaux, l'entraînement et les médailles sont traduits. Le gardien d'appels et certaines pages restent en arabe."; }

const MODE_NAMES={en:["General","Visual","Simple","Hearing","Touch","Elderly"],ur:["عام","بصری","آسان","سماعت","لمس","بزرگ"],hi:["सामान्य","दृष्टि","सरल","श्रवण","स्पर्श","बुज़ुर्ग"],bn:["সাধারণ","দৃষ্টি","সহজ","শ্রবণ","স্পর্শ","প্রবীণ"],tl:["Pangkalahatan","Paningin","Simple","Pandinig","Haplos","Nakatatanda"],id:["Umum","Visual","Sederhana","Pendengaran","Sentuhan","Lansia"],zh:["通用","视觉","简明","听觉","触觉","长者"],es:["General","Visual","Sencillo","Auditivo","Táctil","Mayores"],fr:["Général","Visuel","Simple","Auditif","Tactile","Aînés"]};
const MODE_KEYS=["general","visual","simple","hearing","touch","elder"];
function modeName(m){ const lg=curLang(); return lg!=="ar"&&MODE_NAMES[lg]?MODE_NAMES[lg][MODE_KEYS.indexOf(m)]:(MODE_PROFILE[m]||{}).name; }
function applyChrome(){
  try{ const t0=$("mode-chip-t"); if(t0) t0.textContent=modeName(mode); }catch(e){}
  try{ document.querySelectorAll(".back").forEach(n=>setLabel(n,curLang()==="ar"?"المزيد":(t("tab_more")||"More"))); }catch(e){}
  try{ if(curLang()!=="ar"&&curTab!=="scan") $("bar-sub").textContent=t("sub_scan")||""; }catch(e){}
}
hook("after","applyLang",applyChrome); hook("after","setMode",applyChrome); hook("after","showTab",applyChrome);
// leaving the call tab ends the full-screen call and goes back to the setup
hook("before","showTab",n=>{ if(n!=="call"){ callExitFull(); $("v-call").classList.remove("started"); } });
function capHint(){ return (mode==="hearing"||mode==="touch")?"كلام المكالمة يظهر هنا مكتوبًا، عشان تقرأه بدون ما تسمعه.":"كلام المكالمة يظهر هنا مكتوبًا أول بأول، وفطن يحلله معك."; }
try{ const h0=document.querySelector("#cs-cap .cs-hint"); if(h0) h0.textContent=capHint(); }catch(e){}
hook("after","setMode",()=>{ const h0=document.querySelector("#cs-cap .cs-hint"); if(h0) h0.textContent=capHint(); });

/* ---------- screen reader polish ---------- */
// 1) decorative icons are silent
function hideDecor(root){ (root||document).querySelectorAll("svg:not([aria-hidden]):not([role='img'])").forEach(s=>{ s.setAttribute("aria-hidden","true"); s.setAttribute("focusable","false"); }); }
hideDecor(); try{ new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{ if(n.nodeType===1){ if(n.tagName==="svg"&&!n.hasAttribute("aria-hidden")) n.setAttribute("aria-hidden","true"); else hideDecor(n); } }))).observe(document.getElementById("device"),{childList:true,subtree:true}); }catch(e){}
// 2) closed sheets disappear from the screen reader and the keyboard
function syncSheets(){ document.querySelectorAll(".sheet").forEach(s=>{ const on=s.classList.contains("on"); s.inert=!on; if(on) s.removeAttribute("aria-hidden"); else s.setAttribute("aria-hidden","true"); }); }
syncSheets(); try{ const mo=new MutationObserver(syncSheets); document.querySelectorAll(".sheet").forEach(s=>mo.observe(s,{attributes:true,attributeFilter:["class"]})); }catch(e){}
// 3) the verdict is announced short: verdict, what to do, the main reason
hook("after","render",res=>{ setTimeout(()=>{ try{ const r=document.querySelector("#reasons li, .reasons li"); $("sr-live").textContent=""; $("sr-live").textContent=$("v-title").textContent+". "+$("v-simple").textContent+(r&&res.level!=="safe"?" "+r.textContent:""); }catch(e){} },150); });
// 4) language sheet: focus moves in, and back out where it came from
let langOpener=null;
hook("before","openLangSheet",()=>{ langOpener=document.activeElement; });
hook("after","openLangSheet",()=>{ setTimeout(()=>{ const b=document.querySelector('#lang-list [aria-pressed="true"]')||document.querySelector("#lang-list button"); if(b) b.focus(); },60); });
hook("after","closeLangSheet",()=>{ if(langOpener&&langOpener.focus) setTimeout(()=>langOpener.focus(),60); });
document.querySelectorAll(".globe").forEach(b=>b.onclick=openLangSheet); $("lang-scrim").onclick=closeLangSheet; $("lang-done").onclick=closeLangSheet;
// 5) Escape closes whatever is open on top
document.addEventListener("keydown",e=>{ if(e.key!=="Escape") return;
  if($("lang-sheet").classList.contains("on")) closeLangSheet();
  else if($("sheet").classList.contains("on")) sheet(false);
  else if(!$("share-ov").hidden) $("share-ov").hidden=true;
  else { try{ hideQR(); }catch(x){} } });

