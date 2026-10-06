/* ---------- "got scammed?" recovery plan ---------- */
const GAVE=[["otp","رمز تحقق"],["card","بيانات بطاقة"],["money","حوّلت فلوس"],["nafath","وافقت على نفاذ"],["app","حمّلت تطبيق"],["pass","كلمة مرور"],["none","ما أعطيت شي بس ضغطت رابط"]];
function planFor(g){
  const s=[];
  if(g.has("card")||g.has("otp")||g.has("money")) s.push(["اتصل ببنكك الحين","من الرقم المكتوب على بطاقتك أو من تطبيق البنك، واطلب إيقاف البطاقة والعمليات."]);
  if(g.has("money")) s.push(["اطلب اعتراض التحويل","قل للبنك إنه احتيال واطلب بلاغ اعتراض بأسرع وقت. كل دقيقة مهمة."]);
  if(g.has("nafath")) s.push(["أمّن نفاذ وأبشر","ادخل من التطبيقات الرسمية، غيّر كلمة المرور، وراجع آخر العمليات والأجهزة."]);
  if(g.has("otp")) s.push(["غيّر كلمة مرور الحساب","الحساب اللي وصله الرمز. وإذا كان رمز واتساب فعّل «التحقق بخطوتين»."]);
  if(g.has("app")) s.push(["احذف التطبيق وافصل النت","احذف التطبيق اللي حمّلته، وخل شخص تثق فيه يفحص جوالك."]);
  if(g.has("pass")) s.push(["غيّر كلمة المرور في كل مكان","خصوصًا لو تستخدم نفس الكلمة في أكثر من حساب."]);
  if(g.has("none")) s.push(["لا تكتب أي شي في الصفحة","سكّر الصفحة، وامسح سجل المتصفح، وراقب حساباتك هالأيام."]);
  s.push(["بلّغ عبر «كلنا أمن»","وأرفق لقطة شاشة للرسالة أو رقم المتصل."]);
  s.push(["نبّه أسرتك","عشان ما ينخدعون بنفس الطريقة، ويساعدونك."]);
  s.push(["انتبه لمحتال ثاني","أي أحد يتصل يقول «بنرجع فلوسك مقابل رسوم» هو محتال ثاني."]);
  return s;
}
function openPanic(){
  bump("panic"); const o=$("panic"); o.hidden=false; requestAnimationFrame(()=>o.classList.add("on"));
  $("pn-step1").hidden=false; $("pn-step2").hidden=true;
  const box=$("pn-gave"); box.innerHTML=""; GAVE.forEach(([k,l])=>{ const b=el("button","chip",l); b.type="button"; b.dataset.k=k; b.setAttribute("aria-pressed","false"); b.onclick=()=>{ b.setAttribute("aria-pressed",String(b.getAttribute("aria-pressed")!=="true")); b.classList.toggle("on"); }; box.appendChild(b); });
  if(mode==="visual") speak("لا تخاف، بمشي معك خطوة خطوة. وش أعطيت المحتال؟");
  familyAlert("critical","ضغط «انخدعت؟» ويحتاج مساعدتك");
}
$("pn-go").onclick=()=>{
  const g=new Set([...document.querySelectorAll('#pn-gave [aria-pressed="true"]')].map(b=>b.dataset.k)); if(!g.size) g.add("none");
  const steps=planFor(g), ol=$("pn-steps"); ol.innerHTML="";
  steps.forEach(([h,d],i)=>{ const li=el("li","pn-s"); const cb=el("button","pn-cb"); cb.setAttribute("aria-label","تم"); cb.innerHTML=ICON.safe; const tx=el("div"); tx.appendChild(el("b","",h)); tx.appendChild(el("span","",d));
    cb.onclick=()=>{ li.classList.toggle("done"); const n=ol.querySelectorAll(".done").length; $("pn-prog").textContent=n+" من "+steps.length; if(n===steps.length){ $("pn-done").hidden=false; if(mode==="visual") speak("أحسنت. سويت كل الخطوات الصح."); } else $("pn-done").hidden=true; const nx=li.nextElementSibling; if(nx&&li.classList.contains("done")&&mode==="visual") speak(nx.querySelector("b").textContent+". "+nx.querySelector("span").textContent); };
    li.append(cb,tx); ol.appendChild(li); });
  $("pn-prog").textContent="0 من "+steps.length; $("pn-done").hidden=true;
  $("pn-step1").hidden=true; $("pn-step2").hidden=false;
  if(mode==="visual") speak("الخطوة الأولى: "+steps[0][0]+". "+steps[0][1]);
};
$("pn-close").onclick=()=>{ const o=$("panic"); o.classList.remove("on"); setTimeout(()=>o.hidden=true,300); try{ speechSynthesis.cancel(); }catch(e){} };
$("pn-trust").onclick=()=>{ $("pn-close").click(); showTab("scan"); setTimeout(()=>{ if(current) showTrust(); $("trust-box").scrollIntoView({block:"center"}); },200); };

/* ---------- classroom mode ---------- */
const CLASS=[...QUIZ.map(q=>[q.from,q.m,q.fraud,q.why]),
  ["Nafath","معك موظف أبشر، بيطلع لك طلب في نفاذ، اختر الرقم 43 عشان نكمل التحديث",true,"لا توافق على نفاذ بطلب من أحد يتصل عليك."],
  ["Bank","السلام عليكم، حولت لك 1500 ريال بالغلط، رجعها على هالحساب SA44200000012345",true,"البنك هو اللي يرجّع التحويل الخاطئ، مو أنت."],
  ["Absher","أبشر: تم تجديد هويتك الوطنية بنجاح. للتفاصيل: https://www.absher.sa",false,"رابط أبشر الرسمي، وما يطلب شي."],
  ["المدير","أنا مديرك في اجتماع، اشتر بطاقات آيتونز بـ1000 وأرسل الأكواد بسرعة",true,"طلب بطاقات شحن وأكوادها حيلة معروفة."]];
let ci=0, cRight=0, cVotes=[0,0];
function openClass(){ ci=0; cRight=0; const o=$("class"); o.hidden=false; requestAnimationFrame(()=>o.classList.add("on")); drawClass(); try{ document.documentElement.requestFullscreen&&o.requestFullscreen&&o.requestFullscreen().catch(()=>{}); }catch(e){} }
function closeClass(){ const o=$("class"); o.classList.remove("on"); setTimeout(()=>o.hidden=true,300); try{ document.fullscreenElement&&document.exitFullscreen(); }catch(e){} }
function drawClass(){
  const st=$("cl-stage"); st.innerHTML=""; cVotes=[0,0];
  if(ci>=CLASS.length){
    const d=el("div","cl-end"); d.appendChild(el("h2","","أحسنتم يا أبطال!")); d.appendChild(el("p","","الفصل كشف الصح في "+cRight+" من "+CLASS.length+" رسائل.")); d.appendChild(el("p","cl-rule","القاعدة: لا رمز، لا بيانات، لا فلوس لأي أحد يتواصل معك. وتأكد من الجهة بنفسك."));
    const again=el("button","btn btn-gold","حصة جديدة"); again.onclick=()=>{ ci=0; cRight=0; drawClass(); }; d.appendChild(again); st.appendChild(d);
    bump("classDone"); burst(d,"var(--gold)"); $("cl-count").textContent=""; return;
  }
  const [from,m,fraud,why]=CLASS[ci]; $("cl-count").textContent="رسالة "+(ci+1)+" من "+CLASS.length;
  const card=el("div","cl-card"); card.appendChild(el("small","","من: "+from)); const mv=el("p","cl-msg"); mv.textContent=m; card.appendChild(mv); st.appendChild(card);
  const votes=el("div","cl-votes");
  [["احتيال","fraud"],["سليمة","safe"]].forEach(([l,k],i)=>{ const b=el("button","cl-v "+k); b.appendChild(el("span","",l)); const n=el("b","","0"); b.appendChild(n); b.onclick=()=>{ cVotes[i]++; n.textContent=cVotes[i]; b.animate&&b.animate([{transform:"scale(1.06)"},{transform:"none"}],{duration:200}); }; votes.appendChild(b); });
  st.appendChild(votes);
  const rv=el("button","btn btn-gold cl-reveal","اكشف الجواب"); rv.onclick=()=>{
    const r=FatinEngine.analyze(m); paintMessage(mv,m,r.marks,true);
    const majority=cVotes[0]===cVotes[1]?null:(cVotes[0]>cVotes[1]);
    if(majority===fraud) cRight++;
    const res=el("div","cl-res "+(fraud?"no":"ok")); res.appendChild(el("b","",fraud?"احتيال!":"رسالة سليمة")); res.appendChild(el("span","",why));
    if(majority!==null) res.appendChild(el("em","",majority===fraud?"الفصل جاوب صح 👏":"الأغلبية ما انتبهت، وهذا مكان التعلّم"));
    rv.replaceWith(res); const nx=el("button","btn btn-main cl-next","الرسالة التالية"); nx.onclick=()=>{ ci++; drawClass(); }; st.appendChild(nx);
    if(fraud) burst(res,"var(--danger)"); else burst(res,"var(--safe)");
  };
  st.appendChild(rv);
}
$("cl-close").onclick=closeClass;
document.addEventListener("keydown",e=>{ if($("class").hidden) return; if(e.key==="Escape") closeClass(); if(e.key==="ArrowLeft"||e.key===" "){ const b=document.querySelector(".cl-next,.cl-reveal"); b&&b.click(); } });

/* ---------- elder mode ---------- */
MODE_PROFILE.elder={name:"كبار السن",call:"voice",scale:1.3,hello:"أهلًا بك في فطن. زرين بس: افحص رسالة، واتصل بولدك إذا احتجت."};
$("eld-check").onclick=()=>{ const v=$("msg").value.trim(); if(v) run(); else { $("msg").focus(); $("msg").scrollIntoView({block:"center",behavior:"smooth"}); if(mode==="visual"||mode==="elder") speak("الصق الرسالة في المربع، واضغط افحص."); } };
function drawElder(){ const n=trustNumber(); const a=$("eld-call"); const tx=$("eld-call-t"); if(n){ a.href="tel:+"+n; tx.textContent="اتصل بولدي/بنتي"; $("eld-num").textContent="+"+n; } else { a.removeAttribute("href"); tx.textContent="أضف رقم ولدك/بنتك"; $("eld-num").textContent="من «الإعدادات» تحت"; } }
$("eld-call").addEventListener("click",e=>{ if(!$("eld-call").getAttribute("href")){ e.preventDefault(); showTab("settings"); $("trust-num").focus(); $("trust-num").scrollIntoView({block:"center"}); } });
$("trust-num").addEventListener("change",drawElder);
hook("after","setMode",()=>{ try{ drawElder(); }catch(e){} });
// general mode only vibrates; elder mode always speaks the verdict (the usual response is skipped)
hook("before","respond",res=>{ if(mode==="general"){ vibrate(res.level); return false; } if(mode==="elder"){ vibrate(res.level); speak(speechText(res)); return false; } });

