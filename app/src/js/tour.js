/* ---------- judge tour: the whole app in about 60 seconds, without touching the user's data ---------- */
let tourOn=false, tourTimers=[], tourSaved=null;
// during the tour nothing touches the user's data or interrupts: no sign-in, onboarding, medals, family alerts, voice or toasts
["openLogin","openOnb","bump","familyAlert","speak","toast"].forEach(n=>hook("before",n,()=>!tourOn));
const tw=ms=>new Promise(r=>tourTimers.push(setTimeout(r,ms)));
function tHL(el){ document.querySelectorAll(".tour-hl").forEach(x=>x.classList.remove("tour-hl")); if(el){ el.classList.add("tour-hl"); const sc=$("screen"); const top=el.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop-90; sc.scrollTo({top:Math.max(0,top),behavior:"smooth"}); } }
const TOUR_N=9; /* steps in TOUR below */ function tStep(n,txt){ $("tour-n").textContent=n+"/"+TOUR_N; $("tour-t").textContent=txt; $("tour-fill").style.width=Math.round(100*n/TOUR_N)+"%"; }
async function typeInto(el,text,ms){ el.value=""; const step=Math.max(1,Math.ceil(text.length/(ms/30))); for(let i=0;i<text.length&&tourOn;i+=step){ el.value=text.slice(0,i+step); await tw(30); } el.value=text; }
const TOUR_MSG="عزيزي المستفيد، تم تعليق خدماتك في أبشر. حدّث بياناتك خلال 24 ساعة: absher-sa-update.xyz/login";
let tourI=0;
function tourReset(){ tourTimers.forEach(clearTimeout); tourTimers=[]; tHL(null); try{ hideCallAlert(); callStop(true); }catch(e){} try{ if(mode!=="visual") setMode("visual"); }catch(e){} }
function tourScan(){ showTab("scan"); if($("msg").value!==TOUR_MSG){ $("msg").value=TOUR_MSG; run(); } }
const TOUR=[
  {t:"فطن يحمي ذوي الإعاقة وكبار السن والعمالة من الاحتيال، بالذكاء الاصطناعي وبالطريقة اللي تناسب كل شخص.",
   f:async()=>{ showTab("scan"); $("screen").scrollTo({top:0,behavior:"smooth"}); }},
  {t:"وصلتك رسالة؟ الصقها وفطن يفحصها في أقل من ثانية.",
   f:async()=>{ showTab("scan"); tHL($("msg")); await typeInto($("msg"),TOUR_MSG,2200); await tw(400); run(); await tw(1600); tHL($("verdict")); }},
  {t:"الحكم: «خطير». ويظلّل الكلمات الخطيرة، ويقول لك وش تسوي بالضبط.",
   f:async()=>{ tourScan(); await tw(350); tHL($("verdict")); }},
  {t:"يشرّح الرابط ويقارنه بالموقع الرسمي: absher-sa-update.xyz مو أبشر. absher.sa هو الرسمي.",
   f:async()=>{ tourScan(); await tw(350); tHL($("dis-wrap")&&!$("dis-wrap").hidden?$("dis-wrap"):$("cmp-wrap")); }},
  {t:"كل إعاقة تتنبّه بطريقتها: الأصم يشوف الشاشة تتلوّن مع اهتزاز، وصاحب الإعاقة الذهنية يشوف جملة واحدة ورمز كبير، والكفيف يسمع الحكم.",
   f:async()=>{ tourScan(); $("screen").scrollTo({top:0,behavior:"smooth"}); setMode("hearing"); flash("danger"); await tw(2600); setMode("simple"); tHL($("verdict")); await tw(2800); tHL(null); setMode("visual"); }},
  {t:"حارس المكالمات: لما يطلب المتصل رمز التحقق، يهتز الجوال ويطلع لك «أغلق المكالمة الآن».",
   f:async()=>{ showTab("call"); await tw(500); try{ setCallMode("chat"); }catch(e){} callSet("bank"); $("v-call").classList.add("started"); await tw(1500); tHL($("callscr"));
     $("cs-accept").click(); await tw(2600);
     const c=CALLS[call.k]; for(let g=0;g<6&&call&&!call.ended&&!$("calert").classList.contains("critical");g++){
       if(call.hold){ await tw(1400); hideCallAlert(); call.hold=false; try{ callUI("listen"); }catch(e){} }
       if(call.i<c.lines.length){ callerSay(c.lines[call.i++]); } await tw(1700); } }},
  {t:"تدرّب بأمان: محتال افتراضي بالذكاء الاصطناعي يحاول يقنعك، وفطن يهمس لك بالنصيحة. واختبار رسائل، ولغة اهتزاز للصم المكفوفين.",
   f:async()=>{ showTab("train"); await tw(300); const sb=document.querySelector('#v-train .seg [data-pane="sim"]'); if(sb) sb.click(); }},
  {t:"نشرة فطن: أبرز موجات الاحتيال والاختراقات بلغة بسيطة، مع «وش تسوي» ومصدر كل خبر.",
   f:async()=>{ showTab("news"); }},
  {t:"15 وسام على 3 مستويات تحفّز التعلّم، ولوحة أسرة يتابع فيها ولي الأمر تقدّم قريبه وينبّهه وقت الخطر. وكله بـ10 لغات تلقائيًا.",
   f:async()=>{ if(!profile) profile={n:"ضيف فطن",g:"m"}; earned=["first","eagle","qr","news","curious","hunter","steady"]; ST.scans=Math.max(ST.scans||0,24); ST.caught=Math.max(ST.caught||0,11); ST.callsClosed=Math.max(ST.callsClosed||0,2); showTab("badges"); }}
];
function tourGo(i){
  if(!tourOn) return;
  if(i>=TOUR.length){ endTour(true); return; }
  if(i<0) i=0;
  tourReset(); tourI=i; tStep(i+1,TOUR[i].t);
  $("tour-prev").disabled=(i===0);
  $("tour-next-t").textContent=(i===TOUR.length-1)?"النهاية":"التالي";
  Promise.resolve().then(TOUR[i].f).catch(()=>{});
}
async function runTour(){
  if(tourOn) return; tourOn=true; tourTimers=[];
  tourSaved={mode, lang, earned:earned.slice(), ST:JSON.parse(JSON.stringify(ST)), msg:$("msg").value, profile, loginOpen:!$("login").hidden, onbOpen:!$("onb").hidden, callMode:(typeof callMode!=="undefined"?callMode:"voice")};
  ["login","onb","panic","qrm"].forEach(id=>{ const o=$(id); if(o) o.hidden=true; }); $("tour-end").hidden=true;
  try{ speechSynthesis.cancel(); }catch(e){}
  if(lang!=="ar") applyLang("ar");
  $("tour").hidden=false; $("msg").value="";
  tourGo(0); setTimeout(()=>{ try{ $("tour-next").focus(); }catch(e){} },80);
}
function endTour(showEnd){
  tourTimers.forEach(clearTimeout); tourTimers=[]; tourOn=false; tHL(null);
  try{ hideCallAlert(); callStop(true); }catch(e){}
  const s=tourSaved||{}; earned=s.earned||earned; if(s.ST) ST=s.ST; profile=s.profile||null; $("msg").value=s.msg||"";
  try{ setMode(s.mode||mode); setCallMode(s.callMode||"voice"); if(s.lang&&s.lang!==lang) applyLang(s.lang); }catch(e){}
  $("tour").hidden=true;
  if(showEnd){ $("tour-end").hidden=false; setTimeout(()=>$("te-try").focus(),100); }
  else afterTour();
}
function afterTour(){ $("tour-end").hidden=true; const s=tourSaved||{}; showTab("scan"); if(!profile) openLogin(); else if(s.onbOpen||store.get("fatin-onb")!=="1") openOnb(); try{ drawMedalChip(); }catch(e){} }
document.querySelectorAll(".tour-go").forEach(b=>b.addEventListener("click",runTour));
$("tour-x").onclick=()=>endTour(false);
$("te-try").onclick=afterTour; $("te-again").onclick=()=>{ $("tour-end").hidden=true; runTour(); };
$("tour-next").onclick=()=>tourGo(tourI+1); $("tour-prev").onclick=()=>tourGo(tourI-1);
document.addEventListener("keydown",e=>{ if(!tourOn) return;
  if(e.key==="Escape"){ endTour(false); return; }
  const tg=e.target, typing=tg&&(tg.tagName==="TEXTAREA"||tg.tagName==="INPUT"||tg.isContentEditable); if(typing) return;
  if(e.key==="ArrowLeft"){ e.preventDefault(); tourGo(tourI+1); } else if(e.key==="ArrowRight"){ e.preventDefault(); tourGo(tourI-1); } });

$("ai-save").onclick=async()=>{ const k=$("ai-key").value.trim(), st=$("ai-status");
  if(!/^sk-ant-[A-Za-z0-9_\-]{20,}$/.test(k)){ st.textContent="المفتاح لازم يبدأ بـ sk-ant- . انسخه كامل من موقع Claude Console."; return; }
  try{ sessionStorage.setItem("fatin-ai-key",k); }catch(e){ st.textContent="ما قدرت أحفظ المفتاح في هذا المتصفح."; return; }
  st.textContent="أجرّب المفتاح…";
  try{ const t=await apiCall([{role:"user",content:"رد بكلمة واحدة: تمام"}],10); sample=makeRemoteSample(); $("ai-key").value=""; st.textContent="✓ اشتغل. الذكاء الاصطناعي مفعّل لين تقفل فطن."; photoOK=true; privacySync(); }
  catch(e){ st.textContent=e&&e.code==="bad_key"?"المفتاح غير صحيح أو موقوف.":e&&e.code==="rate_limited"?"ضغط كثير على الحساب، جرّب بعد شوي.":"ما قدرت أوصل لـClaude من هذا المتصفح. جرّب لاحقًا."; } };
$("ai-del").onclick=()=>{ try{ sessionStorage.removeItem("fatin-ai-key"); }catch(e){} if(sample&&sample.remote&&!FATIN.server) sample=null; $("ai-status").textContent="انحذف المفتاح من هذا الجوال."; };
