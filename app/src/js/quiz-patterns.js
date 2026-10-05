/* ---------- quiz ---------- */
const QUIZ=[
  {from:"STC",m:"مبروك! تم اختيار رقمك للفوز بجائزة 5000 ريال من STC. استلمها الآن: stc-prize.top",fraud:true,why:"جائزة ما اشتركت فيها، ورابط ما ينتهي بموقع STC الرسمي."},
  {from:"البنك",m:"تم خصم 45 ريال من بطاقتك مدى ****1234 لدى صيدلية. إذا لم تقم بالعملية تواصل مع البنك عبر التطبيق.",fraud:false,why:"إشعار عادي: ما فيه رابط، ولا يطلب منك رمز أو بيانات."},
  {from:"+966 5x xxx xxxx",m:"يمه هذا رقمي الجديد، جوالي خرب. حوّلي لي 500 ريال ضروري الحين",fraud:true,why:"رقم جديد يطلب فلوس بسرعة. اتصل على رقمه القديم وتأكد."},
  {from:"Absher",m:"رمز التحقق الخاص بك 482913. لا تشاركه مع أي شخص.",fraud:false,why:"رسالة رمز عادية تحذّرك من مشاركته. المهم: لا تعطيه لأحد."},
  {from:"Saher",m:"مخالفة ساهر غير مسددة. سدد الآن خلال 48 ساعة لتجنب الإيقاف: saher-pay.online",fraud:true,why:"استعجال وتهديد، والرابط مو أبشر. المخالفات تُسدد من أبشر أو تطبيق البنك."},
  {from:"خدمة العملاء",m:"وصلك رمز على جوالك؟ أرسله لي عشان نلغي العملية المشبوهة على حسابك",fraud:true,why:"يطلب رمز التحقق. البنك ما يطلبه منك أبدًا، مهما كان السبب."}
];
let quizStarted=false, qi=0, qScore=0, qAns=[];
function startQuiz(){ quizStarted=true; qi=0; qScore=0; qAns=[]; drawProg(); drawQ(); }
function drawProg(){ const p=$("prog"); p.innerHTML=""; QUIZ.forEach((_,i)=>{ const b=document.createElement("i"); if(i<qAns.length) b.className=qAns[i]?"ok":"no"; else if(i===qi) b.className="cur"; p.appendChild(b); }); }
function drawQ(){
  const q=qz(qi), box=$("quiz"); box.innerHTML="";
  const wrap=document.createElement("div"); wrap.className="qcard";
  wrap.innerHTML='<div class="qinner"><div class="qfrom"><span class="av">SMS</span><div><b></b><small>'+L2("q_of",{i:qi+1,n:QUIZ.length})+'</small></div></div><div class="msgview qmsg"></div></div>';
  wrap.querySelector("b").textContent=q.from; wrap.querySelector(".qmsg").textContent=q.m;
  const ans=document.createElement("div"); ans.className="answers";
  ans.innerHTML='<button class="btn ans-fraud" data-a="1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg>'+L2("q_fraud")+'</button><button class="btn ans-safe" data-a="0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'+L2("q_safe")+'</button>';
  box.append(wrap,ans);
  ans.querySelectorAll("button").forEach(b=>b.onclick=()=>answer(b.dataset.a==="1",wrap,ans));
  if(mode==="visual") speak(L2("q_of",{i:qi+1,n:QUIZ.length})+". "+q.from+". "+q.m+". "+L2("q_ask"));
}
function burst(host,color){
  if(reduced) return;
  const b=document.createElement("div"); b.className="burst";
  for(let i=0;i<16;i++){ const p=document.createElement("i"); const a=Math.PI*2*i/16, d=70+Math.random()*60;
    p.style.setProperty("--x",Math.cos(a)*d+"px"); p.style.setProperty("--y",Math.sin(a)*d+"px"); p.style.setProperty("--r",(Math.random()*360)+"deg");
    p.style.background=i%2?color:"var(--gold)"; b.appendChild(p); }
  host.appendChild(b); setTimeout(()=>b.remove(),1000);
}
function answer(saidFraud,wrap,ans){
  const q=qz(qi), ok=saidFraud===q.fraud;
  qAns.push(ok); if(ok) qScore++;
  ans.querySelectorAll("button").forEach(b=>b.disabled=true);
  const inner=wrap.querySelector(".qinner");
  const r=FatinEngine.analyze(q.m); paintMessage(wrap.querySelector(".qmsg"),q.m,r.marks,true);
  if(ok) burst(wrap,"var(--safe)"); else { inner.classList.add("shake"); }
  if(mode==="hearing") flash(q.fraud?"danger":"safe");
  const fb=document.createElement("div"); fb.className="feedback "+(ok?"ok":"no"); fb.setAttribute("role","status");
  fb.innerHTML='<b></b><p></p>'; fb.querySelector("b").textContent=L2(ok?"q_right":"q_close")+L2(q.fraud?"q_isf":"q_iss"); fb.querySelector("p").textContent=q.why;
  const nx=document.createElement("button"); nx.className="btn btn-main"; nx.textContent=L2(qi<QUIZ.length-1?"q_next":"q_see");
  nx.onclick=()=>{ qi++; drawProg(); if(qi<QUIZ.length) drawQ(); else finishQuiz(); $("screen").scrollTo({top:0,behavior:"smooth"}); };
  fb.appendChild(nx); ans.replaceWith(fb);
  if(mode==="visual") speak(L2(ok?"q_right":"q_close")+q.why);
  drawProg();
}
function finishQuiz(){
  const box=$("quiz"); box.innerHTML="";
  const lvl=L2(qScore===QUIZ.length?"q_gold":qScore>=4?"q_good":"q_train");
  const d=document.createElement("div"); d.className="panel result-ring";
  d.innerHTML='<div class="medal"><div><b>'+qScore+'/'+QUIZ.length+'</b><small></small></div></div><h3 style="font-size:22px"></h3><p class="sub"></p><button class="btn btn-gold">'+L2("q_again")+'</button>';
  d.querySelector("small").textContent=lvl; d.querySelector("h3").textContent=L2(qScore===QUIZ.length?"q_h_perfect":"q_h_ok");
  d.querySelector(".sub").textContent=L2("q_rem");
  d.querySelector("button").onclick=startQuiz;
  box.appendChild(d); if(qScore>=4) burst(d,"var(--green)");
  if(mode==="visual") speak(L2("q_score",{s:qScore,n:QUIZ.length})+". "+lvl);
  if(mode==="hearing") flash(qScore>=4?"safe":"suspicious");
}
finishQuiz=hookable("finishQuiz",finishQuiz);

/* ---------- patterns ---------- */
const PATS=[
  {t:"انتحال أبشر والجهات الحكومية",s:"تعليق خدمات · تحديث بيانات",ex:"تم تعليق خدماتك في أبشر، حدّث بياناتك: absher-sa-update.xyz",sign:"الرابط ما ينتهي بـ absher.sa أو gov.sa.",act:"افتح تطبيق أبشر بنفسك، لا تضغط الرابط.",i:0},
  {t:"مخالفات ساهر الوهمية",s:"سدد الآن · خلال 48 ساعة",ex:"مخالفة ساهر غير مسددة، سدد الآن: saher-pay.online",sign:"تهديد بالإيقاف ورابط دفع خارجي.",act:"المخالفات تُسدد من أبشر أو تطبيق بنكك.",i:4},
  {t:"رسوم الشحن والطرود",s:"سمسا · أرامكس · البريد",ex:"شحنتك معلقة بسبب رسوم 12 ريال: bit.ly/…",sign:"مبلغ صغير ورابط مختصر.",act:"تتبّع شحنتك من تطبيق الشركة الرسمي.",i:1},
  {t:"طلب رمز التحقق",s:"خدمة عملاء مزيّفة",ex:"وصلك رمز؟ أرسله لي عشان نوقف العملية",sign:"أي أحد يطلب الرمز = احتيال.",act:"الرمز لك وحدك. لا تعطيه لأي أحد.",i:2},
  {t:"إيقاف البطاقة البنكية",s:"تحديث بيانات · رقم البطاقة",ex:"تم إيقاف بطاقتك، أدخل رقمها والرمز السري هنا",sign:"يطلب رقم البطاقة أو الرقم السري.",act:"كلّم بنكك من الرقم المكتوب على البطاقة.",i:null},
  {t:"الجوائز والمسابقات",s:"مبروك · ربحت · تم اختيارك",ex:"مبروك! ربحت 10,000 ريال، استلمها من الرابط",sign:"جائزة ما اشتركت فيها.",act:"تجاهلها واحذفها.",i:null},
  {t:"«هذا رقمي الجديد»",s:"انتحال قريب أو صديق",ex:"يمه هذا رقمي الجديد، حوّلي لي 500 ريال ضروري",sign:"رقم غريب يطلب فلوس بسرعة.",act:"اتصل على رقمه القديم وتأكد بصوته.",i:3},
  {t:"وظائف واستثمار وهمي",s:"دخل يومي · أرباح مضمونة",ex:"دخل يومي 800 ريال من المنزل بدون رأس مال",sign:"ربح سهل ومضمون ونقلك لواتساب.",act:"ما فيه ربح مضمون. لا تحوّل أي مبلغ.",i:null}
];
function drawPats(){
  const box=$("pats");
  PATS.forEach((p,n)=>{
    const d=document.createElement("details"); d.className="pat";
    d.innerHTML='<summary><span class="pi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/></svg></span><span><b></b><small></small></span></summary><div class="pat-body"><div class="ex"></div><div class="sign"><b>علامته:</b><span class="sg"></span></div><div class="sign"><b>تصرّف:</b><span class="ac"></span></div></div>';
    d.querySelector("summary b").textContent=p.t; d.querySelector("summary small").textContent=p.s;
    d.querySelector(".ex").textContent="«"+p.ex+"»"; d.querySelector(".sg").textContent=p.sign; d.querySelector(".ac").textContent=p.act;
    if(p.i!==null){ const b=document.createElement("button"); b.className="btn btn-ghost"; b.textContent="جرّب مثالها في فطن"; b.onclick=()=>{ showTab("scan"); $("msg").value=EXAMPLES[p.i]; run(); }; d.querySelector(".pat-body").appendChild(b); }
    box.appendChild(d);
  });
}

