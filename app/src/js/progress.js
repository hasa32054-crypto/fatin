/* ---------- stats, badges, toast ---------- */
const STAT0={newsRead:0,asks:0,famShield:0,since:0,scans:0,caught:0,dissect:0,qr:0,callsClosed:0,simWins:0,quizBest:0,quizHist:[],chWeeks:[],classDone:0,helps:0,panic:0};
let ST=Object.assign({},STAT0,S.get("stats",{})); if(!ST.since){ ST.since=Date.now(); S.set("stats",ST); }
const MEDAL_LEVELS=[
  {n:1,name:"المستكشف",sub:"أول خطواتك ضد المحتالين",c:"#CD8B4E"},
  {n:2,name:"الحارس",sub:"صرت تحمي نفسك وأهلك",c:"#C9D3DC"},
  {n:3,name:"أسطورة فطن",sub:"ما يمر عليك محتال",c:"#E0BC5E"}
];
const BADGES=[
  ["first","الشرارة الأولى","فحصت أول رسالة",s=>s.scans>=1,1],
  ["eagle","عين الصقر","كشفت أول رسالة احتيال",s=>s.caught>=1,1],
  ["qr","حارس الباركود","فحصت باركود قبل ما تدفع",s=>s.qr>=1,1],
  ["news","قارئ النشرة","قرأت 3 أخبار في نشرة فطن",s=>(s.newsRead||0)>=3,1],
  ["curious","الفضولي الذكي","سألت فطن أول سؤال",s=>(s.asks||0)>=1,1],
  ["hunter","صياد المحتالين","كشفت 10 رسائل احتيال",s=>s.caught>=10,2],
  ["reader","مشرّح الروابط","شرّحت 5 روابط مزيفة",s=>s.dissect>=5,2],
  ["steady","صامد كالجبل","هزمت المحتال في المحاكي",s=>s.simWins>=1,2],
  ["call","كاشف المكالمات","أغلقت مكالمة احتيال",s=>s.callsClosed>=1,2],
  ["shield","درع العائلة","فعّلت لوحة الأسرة أو كلمة سر العائلة",s=>(s.famShield||0)>=1,2],
  ["gold","الفَطِن الذهبي","6 من 6 في اختبار الرسائل",s=>s.quizBest>=6,3],
  ["challenge","بطل التحدي","أنهيت تحدي أسبوع كامل",s=>s.chWeeks.length>=1,3],
  ["teacher","معلّم الأجيال","أكملت حصة توعية للفصل",s=>s.classDone>=1,3],
  ["helper","فزعة الوطن","بلّغت أو نبّهت غيرك 3 مرات",s=>s.helps>=3,3],
  ["legend","أسطورة فطن","جمعت كل الأوسمة الـ14",s=>BADGES.filter(b=>b[0]!=="legend").every(b=>earned.includes(b[0])),3]
];
let earned=S.get("badges",[]);
function bump(k,v=1){ if(Array.isArray(ST[k])) ST[k].push(v); else ST[k]=(ST[k]||0)+v; S.set("stats",ST); checkBadges(); }
bump=hookable("bump",bump);
function setMax(k,v){ if(v>(ST[k]||0)){ ST[k]=v; S.set("stats",ST); } checkBadges(); }
function checkBadges(){
  for(let k=0;k<2;k++) BADGES.forEach(([id,name,,test])=>{ if(!earned.includes(id)&&test(ST)){ earned.push(id); S.set("badges",earned); toast(L2("new_medal")+md(BADGES.find(b=>b[0]===id))[0]); try{ drawMedalChip(); }catch(e){} progressOut("good","حصل على وسام «"+name+"»"); } });
}
function toast(msg){
  const tt=$("toast"); tt.textContent=msg; tt.classList.remove("on"); void tt.offsetWidth; tt.classList.add("on");
  burst(tt,"var(--gold)"); clearTimeout(tt._t); tt._t=setTimeout(()=>tt.classList.remove("on"),2600);
  if(mode==="visual") setTimeout(()=>speak(msg),300); else haptic([80,60,80]);
}
toast=hookable("toast",toast);

/* ---------- hooks into the existing flows ---------- */
function afterScan(res){
  bump("scans"); if(res.level!=="safe") bump("caught"); if(res.level!=="safe"&&res.sus) bump("dissect");
  if(res.level==="danger") familyAlert("danger","رسالة احتيال: "+((R.en&&false)||patternLabel(res)));
}
function patternLabel(res){ try{ const pt=patternOf(res); return pt?pt.l:"رسالة خطيرة"; }catch(e){ return "رسالة خطيرة"; } }
hook("after","finishQuiz",()=>{ bump("quizHist",qScore); setMax("quizBest",qScore); progressOut("good","أنهى اختبار الرسائل: "+qScore+" من 6"); });
hook("after","endSim",win=>{ if(win) bump("simWins"); else familyAlert("danger","انخدع في محاكي المحتال (تدريب)"); });
let callEndRisk=0; // the risk when the call ended: closing a risky call earns the medal
hook("before","callEnd",()=>{ callEndRisk=call?call.risk:0; });
hook("after","callEnd",how=>{ if(how==="win"&&callEndRisk>=60) bump("callsClosed"); });
hook("before","showCallAlert",a=>{ if(familySecret()&&call&&call.k==="family"&&a.band!=="safe"){ CALL_ACT.warn="انتبه. اطلب منه «كلمة سر العائلة». الصوت ممكن ينقلد بالذكاء الاصطناعي، كلمة السر لا."; } });
hook("after","showCallAlert",a=>{ if(a.band==="critical") familyAlert("critical","مكالمة احتيال: "+$("ca-type").textContent); });
hook("after","showTrust",()=>{ bump("helps"); });

/* ---------- family password vs. voice cloning (call guard) ---------- */
function familySecret(){ return (S.get("secret","")||"").trim(); }
INTENTS.unshift(["secret",/كلمه السر|كلمه سر|الكلمه السريه|كلمة السر/]);
Object.assign(CALLS.family.faq,{secret:"كلمة سر؟ وش هالكلام الحين! أنا فهد، حوّل بس الله يخليك."});
Object.assign(CALLS.bank.faq,{secret:"أي كلمة سر؟ أنا موظف البنك، أعطني الرمز بس."});
Object.assign(CALLS.nafath.faq,{secret:"ما عندنا شي اسمه كلمة سر، وافق على نفاذ وخلصنا."});
Object.defineProperty(CALLS.safe.faq,"secret",{get(){ const w=familySecret(); return w?("ههه أكيد، كلمة السر «"+w+"». وش فيك؟"):"وش كلمة السر؟ ما اتفقنا على شي يا رجال."; },enumerable:true,configurable:true});
CALLS.family.quick.splice(1,0,"وش كلمة سر العائلة؟");
CALL_TYPE.nosecret="ما عرف «كلمة سر العائلة»: غالبًا صوت مقلّد";
hook("map","assess",a=>{
  if(call&&call.secretFail&&!call.secretDone&&CALLS[call.k].scam){ call.secretDone=true; const r=Math.min(100,call.risk+30); call.risk=r; setRisk(r); a.r=r; a.band=bandOf(r); a.k="nosecret"; }
  return a;
});
hook("before","callUserSays",text=>{
  const nt=FatinEngine.norm(text||"");
  if(call&&!call.ended&&/كلمه السر|كلمه سر|الكلمه السريه/.test(nt)&&CALLS[call.k].scam) call.secretFail=true;
});

