/* ---------- protection report ---------- */
function drawReport(){
  const g=$("rep-grid"); g.innerHTML="";
  [["scans","رسالة فحصتها"],["caught","احتيال كشفته"],["callsClosed","مكالمة احتيال أغلقتها"],["simWins","مرة صمدت أمام المحتال"],["qr","باركود فحصته"]].forEach(([k,l])=>{ const d=el("div","rt"); d.appendChild(el("b","",String(ST[k]||0))); d.appendChild(el("span","",l)); g.appendChild(d); });
  const d=el("div","rt"); d.appendChild(el("b","",earned.length+"/"+BADGES.length)); d.appendChild(el("span","","وسام جمعته")); g.appendChild(d);
  const h=ST.quizHist||[], ch=$("rep-chart"); ch.innerHTML="";
  if(!h.length){ ch.appendChild(el("p","hint","العب «اختبار الرسائل» في تبويب تدرّب، وتظهر هنا نتائجك وكيف تتحسن.")); }
  else{
    const last=h.slice(-8); const box=el("div","bars8");
    last.forEach((v,i)=>{ const c=el("div","b8"); const bar=el("i"); bar.style.height=Math.max(6,v/6*100)+"%"; c.appendChild(el("em","",String(v))); c.appendChild(bar); c.appendChild(el("small","",i===last.length-1?"الأخيرة":"#"+(h.length-last.length+i+1))); box.appendChild(c); });
    ch.appendChild(box);
    const first=h[0], best=Math.max(...h); ch.appendChild(el("p","rep-line","نتيجتك تحسّنت من "+first+" إلى "+best+" من 6."));
  }
}

/* ---------- badges & weekly challenge ---------- */
const CH_POOL=[
  ["تم تعليق خدمات توكلنا، حدّث بياناتك: tawakkalna-update.xyz",1,"الرابط مو موقع توكلنا الرسمي."],["تم خصم 120 ريال لدى صيدلية النهدي من بطاقة مدى ****4412.",0,"إشعار عادي بدون رابط ولا طلب."],
  ["أبي منك خدمة، اشتر لي بطاقات آيتونز بـ500 وأرسل الأكواد، أنا مديرك.",1,"طلب بطاقات شحن وأكوادها حيلة معروفة."],["موعد تطعيم طفلك يوم الأحد في المركز الصحي.",0,"تذكير عادي بدون طلب."],
  ["وافق على طلب نفاذ اللي بيجيك واختر الرقم 18 عشان نكمل التحديث.",1,"لا توافق على نفاذ بطلب من أحد."],["عرض: آيفون 16 بـ 399 ريال، الكمية محدودة! iphone-deal.shop",1,"سعر خيالي ورابط غريب."],
  ["رمز الدخول 7710، لا تشاركه مع أي شخص. أبشر",0,"رسالة رمز رسمية تحذرك من مشاركته."],["حولت لك 900 بالغلط، رجعها على SA1200000000123456789012",1,"البنك هو اللي يرجّع التحويل الخاطئ."],
  ["الحين بيتصل عليك موظف الجوازات، أعطه الرقم اللي يوصلك.",1,"ولا جهة تطلب الرمز بالاتصال."],["المدرسة: غدًا إجازة بسبب الأمطار.",0,"رسالة عادية."],
  ["تبرع لحالة إنسانية عاجلة، حوّل الحين: SA9900000000123412341234",1,"تبرّع عبر منصة «إحسان» الرسمية."],["شحنتك من أرامكس في الطريق، تتبعها من https://www.aramex.com",0,"رابط الموقع الرسمي."]
];
const weekNo=()=>Math.floor(Date.now()/(7*864e5));
function chItems(){ const w=weekNo(); return [0,1,2].map(i=>CH_POOL[(w*3+i)%CH_POOL.length]); }
function drawBadges(){
  const w=weekNo(), ans=S.get("ch-"+w,{}), items=chItems(), box=$("ch-list"); box.innerHTML="";
  const X=TRX(); items.forEach((it0,i)=>{ const pi=(w*3+i)%CH_POOL.length, it=X?[X.CH[pi][0],it0[1],X.CH[pi][1]]:it0;
    const d=el("div","chi"); d.appendChild(el("p","chm",it[0]));
    if(ans[i]!==undefined){ const ok=ans[i]===it[1]; const r=el("p","chr "+(ok?"ok":"no"),L2(ok?"ch_right":"ch_wrong")+it[2]); d.appendChild(r); }
    else{ const row=el("div","chb"); [[L2("q_fraud"),1],[L2("q_safe"),0]].forEach(([l,v])=>{ const b=el("button","btn "+(v?"ans-fraud":"ans-safe"),l); b.onclick=()=>{ ans[i]=v; S.set("ch-"+w,ans); if(Object.keys(ans).length===3&&!ST.chWeeks.includes(w)){ bump("chWeeks",w); const ok=items.filter((it,j)=>ans[j]===it[1]).length; progressOut("good","أنهى تحدي الأسبوع: "+ok+" من 3"); } drawBadges(); }; row.appendChild(b); }); d.appendChild(row); }
    box.appendChild(d);
  });
  const done=Object.keys(ans).length; $("ch-prog").textContent=L2("ch_of",{d:done});
  drawProfile();
}

const MD_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7"/></svg>';
const LOCK_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>';
function levelState(){ const per=MEDAL_LEVELS.map(L=>{ const bs=BADGES.filter(b=>b[4]===L.n); return {L,bs,got:bs.filter(b=>earned.includes(b[0])).length}; });
  let cur=per.find(x=>x.got<x.bs.length)||per[per.length-1]; return {per,cur}; }
function drawMedalChip(){ const c=$("medal-chip"); if(!c) return; c.hidden=!profile; $("medal-n").textContent=earned.filter(id=>BADGES.some(b=>b[0]===id)).length; }
function drawProfile(){
  const P=profile||{n:"—",g:"m"}, lg=curLang();
  $("pf-av").textContent=(P.n||"؟").trim().charAt(0);
  $("pf-name").textContent=P.n;
  $("pf-meta").textContent=L2(P.g==="f"?"sister":"brother")+" · "+(lg==="ar"?"وضع ":"")+modeName(mode)+" · "+LANGS[lg].name;
  const since=new Date(ST.since||Date.now()); let ds; try{ ds=since.toLocaleDateString(LANGS[lg].tts||"ar-SA",{day:"numeric",month:"long",year:"numeric"}); }catch(e){ ds=since.toDateString(); }
  $("pf-since").textContent=L2("since")+" "+ds;
  const st=$("pf-stats"); st.innerHTML=""; const total=earned.filter(id=>BADGES.some(b=>b[0]===id)).length;
  [[ST.scans||0,L2("st_scans")],[ST.caught||0,L2("st_caught")],[total+"/"+BADGES.length,L2("st_medals")],[ST.callsClosed||0,L2("st_calls")]].forEach(([v,l])=>{ const d=el("div"); d.appendChild(el("b","",String(v))); d.appendChild(el("span","",l)); st.appendChild(d); });
  const {per,cur}=levelState(), pl=$("pf-level"); pl.innerHTML="";
  const ring=el("div","pf-ring"); ring.style.setProperty("--p",Math.round(100*cur.got/cur.bs.length)); ring.style.setProperty("--c",cur.L.c); ring.appendChild(el("span","",cur.got+"/"+cur.bs.length)); pl.appendChild(ring);
  const tx=el("div"); tx.appendChild(el("small","",L2("lvl_of",{n:cur.L.n}))); tx.appendChild(el("b","",lvN(cur.L)[0])); tx.appendChild(el("small","",cur.got===cur.bs.length?L2("lvl_done"):L2("lvl_left",{n:cur.bs.length-cur.got}))); pl.appendChild(tx);
  const box=$("pf-levels"); box.innerHTML="";
  per.forEach((x,i)=>{ const open=i===0||per[i-1].got===per[i-1].bs.length||x.got>0, LN=lvN(x.L);
    const lv=el("div","lv"+(open?"":" locked")); lv.style.setProperty("--lc",x.L.c);
    const hd=el("div","lv-h"); const b=el("b"); const n=el("i","",String(x.L.n)); b.appendChild(n); b.appendChild(document.createTextNode(LN[0])); hd.appendChild(b); hd.appendChild(el("small","",open?L2("lv_got",{g:x.got,sub:LN[1]}):L2("lv_locked",{n:i}))); lv.appendChild(hd);
    const g=el("div","lv-g"); const tip=el("p","md-tip","");
    x.bs.forEach(bb=>{ const [name,desc]=md(bb), on=earned.includes(bb[0]); const m=el("button","md"+(on?" on":"")); m.type="button"; const ic=el("span","mi"); ic.innerHTML=on||open?MD_ICON:LOCK_ICON; m.appendChild(ic); m.appendChild(el("small","",name));
      m.setAttribute("aria-label",name+": "+desc+". "+L2(on?"got":"notyet"));
      m.onclick=()=>{ tip.textContent=(on?"✓ ":"🔒 ")+name+": "+desc; if(mode==="visual") speak(tip.textContent); }; g.appendChild(m); });
    lv.appendChild(g); lv.appendChild(tip); box.appendChild(lv); });
  drawMedalChip();
}

