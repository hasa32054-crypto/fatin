/* ---------- training panes ---------- */
function showPane(name){
  ["quiz","sim","vib"].forEach(n=>{ $("pane-"+n).hidden=n!==name; });
  document.querySelectorAll(".seg button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.pane===name)));
  if(name==="sim"&&!simStarted) startSim(simScen);
  try{ speechSynthesis.cancel(); }catch(e){}
}
document.querySelectorAll(".seg button").forEach(b=>b.onclick=()=>showPane(b.dataset.pane));

/* ---------- scam simulator ---------- */
const SCEN={
  bank:{who:"«خدمة العملاء»",open:"السلام عليكم، معك فيصل من خدمة العملاء في البنك. رصدنا عملية مشبوهة على بطاقتك بقيمة 3,200 ريال، ونبي نوقفها لك الحين.",
    script:["عشان نوقف العملية لازم نتحقق منك. بيوصلك رمز على جوالك الحين، قله لي بسرعة.","يا أخوي العملية بتتم خلال دقيقتين! إذا ما أعطيتني الرمز بتخسر المبلغ كامل.","آخر فرصة، أرسل الرمز وأنا أوقفها فورًا وما يضيع ولا ريال."],
    quick:["مين معي؟","ما أعطي الرمز لأحد","بتصل على البنك بنفسي","طيب وش أسوي؟","تفضل الرمز: 4821"]},
  ship:{who:"«مندوب سمسا»",open:"مرحبا، معك مندوب سمسا. شحنتك موقوفة في المستودع بسبب رسوم توصيل 9 ريال بس.",
    script:["ادفع الرسوم من هالرابط عشان نوصلها لك اليوم، أو أرسل لي بيانات بطاقتك وأنا أدفعها.","إذا ما دفعت خلال ساعة بترجع الشحنة للمرسل. المبلغ بسيط ليش متردد؟","خلاص أرسل رقم البطاقة والرمز اللي على ظهرها وأخلص لك الموضوع."],
    quick:["أي شحنة؟","بتابع من تطبيق سمسا","ما أدفع من روابط","طيب كم المبلغ؟","رقم البطاقة 4532 1188 9021 7766"]},
  family:{who:"«عبدالله» برقم جديد",open:"هلا والله، هذا أنا عبدالله، هذا رقمي الجديد. جوالي طاح وخرب.",
    script:["أبي منك خدمة ضرورية، حوّل لي 800 ريال الحين وأرجعها لك بكرة.","والله ضروري، أنا في موقف صعب ولا أقدر أكلم أحد غيرك.","لا تتصل على رقمي القديم ما يشتغل. حوّل بسرعة الله يخليك."],
    quick:["بتصل على رقمك القديم","أرسل لي فويس أتأكد","ما أحوّل قبل أتأكد","وش صار لك؟","تم، حوّلت لك"]}
};
const COACH_TIP={otp:"انتبه: يطلب الرمز. ولا جهة رسمية تطلبه منك أبدًا.",urgent:"لاحظ الاستعجال. المحتال يبيك تتصرف قبل ما تفكر.",suspend:"يخوّفك بالخسارة عشان تستعجل.",card:"يطلب بيانات البطاقة. هذي علامة احتيال مؤكدة.",ship:"شركات الشحن ما تطلب الدفع برسالة أو مكالمة.",newnum:"رقم جديد يطلب فلوس؟ اتصل على الرقم القديم وتأكد.",money:"يطلب تحويل فلوس. توقف وتأكد أولًا.",prize:"جائزة ما اشتركت فيها؟ احتيال."};
const REFUSE=/(ما (اعطي|راح|ابي|احول|ادفع)|لا ا|لن |بتصل|اتصل|بكلم|اتاكد|تاكد|التطبيق|الرسمي|حظر|ابلغ|بلاغ|مين معي|فويس|ما احول|ما ادفع|قبل اتاكد)/;
let simScen="bank", simStep=0, simRefusals=0, simDone=false, simStarted=false, simTurns=[], simBusy=false;
function chatAdd(cls,text,label){
  const c=$("chat"); const d=document.createElement("div"); d.className="cm "+cls;
  if(cls==="coach"){ d.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z"/></svg><span><b></b></span>'; d.querySelector("b").textContent=L2("whisper"); d.querySelector("span").appendChild(document.createTextNode(text)); }
  else if(label){ const sm=document.createElement("small"); sm.textContent=label; d.appendChild(sm); d.appendChild(document.createTextNode(text)); }
  else d.textContent=text;
  c.appendChild(d); c.scrollTop=c.scrollHeight; return d;
}
function coachFor(text){ if(curLang()!=="ar"){ try{ const r=FatinEngine.analyze(text), RL=R[curLang()]||R.en; const id=(r.ids||[]).find(i=>RL[i]); return id?RL[id]:L2("coach_gen"); }catch(e){ return L2("coach_gen"); } } const r=FatinEngine.analyze(text); const id=(r.ids||[]).find(i=>COACH_TIP[i]); return id?COACH_TIP[id]:"لاحظ كيف يحاول يكسب ثقتك. لا تعطِ شي قبل ما تتأكد من الجهة الرسمية."; }
function drawQuick(){ const q=$("quick"); q.innerHTML=""; if(simDone) return; scn(simScen).quick.forEach(t=>{ const b=document.createElement("button"); b.className="chip"; b.type="button"; b.textContent=t; b.onclick=()=>userSays(t); q.appendChild(b); }); }
function startSim(k){
  simScen=k; simStep=0; simRefusals=0; simDone=false; simStarted=true; simTurns=[];
  document.querySelectorAll("#scen .chip").forEach(c=>c.classList.toggle("on",c.dataset.scen===k));
  $("chat").innerHTML=""; $("say-in").disabled=false;
  const sc=scn(k); chatAdd("them",sc.open,sc.who); simTurns.push({role:"assistant",content:sc.open});
  setTimeout(()=>chatAdd("coach",coachFor(sc.open)+L2("s_start")),reduced?0:700); simIdleN=0; simArmIdle();
  if(mode==="visual"){ if(curLang()==="ar") say(sc.who+" يقول:",{role:"fatin"}); say(sc.open,{role:"caller",queue:curLang()==="ar"}); }
  drawQuick();
  $("sim-note").textContent=L2(sample?"sim_note_ai":"sim_note_off");
}
function endSim(win,why){
  if(curLang()!=="ar") why=/تذكّر|انتهت المحادثة/.test(why)?L2("end_neutral"):win?(/صمدت/.test(why)?L2("end_win2"):L2("win_why")):L2("lose_why");
  simDone=true; clearTimeout(simIdleT); $("quick").innerHTML=""; $("say-in").disabled=true;
  const d=document.createElement("div"); d.className="cm end "+(win?"win":"lose");
  d.innerHTML="<b></b><span></span>"; d.querySelector("b").textContent=L2(win?"win_t":"lose_t");
  d.querySelector("span").textContent=why;
  const again=document.createElement("button"); again.className="btn btn-gold"; again.style.marginTop="10px"; again.textContent=L2("again"); again.onclick=()=>{ const ks=Object.keys(SCEN); startSim(ks[(ks.indexOf(simScen)+1)%ks.length]); };
  d.appendChild(again);
  $("chat").appendChild(d); $("chat").scrollTop=$("chat").scrollHeight;
  if(win) burst($("chat"),"var(--safe)");
  if(mode==="visual") speak(d.querySelector("b").textContent+". "+why);
  if(mode==="hearing"||mode==="touch"){ flash(win?"safe":"danger"); if(mode==="touch") vibrate(win?"safe":"danger"); }
}
endSim=hookable("endSim",endSim);
/* ---------- training characters: stay in role, answer anything, never switch language ---------- */
const OUT_OF_ROLE=/(i can'?t|i cannot|i'?m (not able|unable|sorry|happy)|as an ai|role-?play|scammer|assist|legitimate|educational|sorry|لا أستطيع|لا استطيع|لا يمكنني|ما اقدر العب|كنموذج|نموذج لغوي|ذكاء اصطناعي|مساعد ذكي|تمثيل دور|لعب دور|محاكا|تمرين|تدريبي|أعتذر|اعتذر عن)/i;
function inRole(s,ar){
  if(typeof s!=="string") return null;
  s=s.replace(/\*+|#+|`+/g,"").replace(/^[\s"«“]+|[\s"»”]+$/g,"").replace(/^(المحتال|المتصل|الشخصية)\s*[:：]\s*/,"").trim();
  if(!s) return null;
  if(OUT_OF_ROLE.test(s)) return null;
  const lg=ar?"ar":curLang();
  if(lg==="ar"){ const lt=(s.match(/[A-Za-z]/g)||[]).length, ac=(s.match(/[\u0600-\u06FF]/g)||[]).length; if(ac<4||lt>ac*0.25) return null; return s; }
  const SCR={hi:/[\u0900-\u097F]/,bn:/[\u0980-\u09FF]/,zh:/[\u4E00-\u9FFF]/,ur:/[\u0600-\u06FF]/};
  if(SCR[lg]&&!SCR[lg].test(s)) return null; if(!SCR[lg]&&(!/[A-Za-z]/.test(s)||/[\u0600-\u06FF]{4}/.test(s))) return null;
  return s;
}
const AI_OFF=["not_granted","sampling_disabled","not_declared","capability_disabled","capability_removed"];
async function roleLine(promptFor,ar,taskFor){ // up to two tries; null means "use the local script"
  for(let k=0;k<2&&sample;k++){
    try{ const r=await sample.json(promptFor(k>0),aiOpts({modelTier:"quick",cache:false},taskFor&&taskFor(k>0))); const g=inRole(r&&r.reply,ar); if(g) return Object.assign({},r,{reply:g.slice(0,280)}); }
    catch(e){ if(AI_OFF.includes(e&&e.code)){ sample=null; return null; } }
  }
  return null;
}
const ROLE_RULES=(strict,ar)=>`قواعد الكتابة:
- ${ar||curLang()==="ar"?"اكتب بالعربي وباللهجة السعودية فقط. ممنوع أي كلمة إنجليزية.":"اكتب بلغة "+LANGS[curLang()].en+" فقط ("+LANGS[curLang()].name+")، بما فيها نصيحة المدرب. ممنوع العربي."}
- ابقَ داخل الشخصية في كل سطر: لا تقول إنك ذكاء اصطناعي، ولا تذكر التمرين، ولا تعتذر، ولا تشرح.
- رد على آخر كلام قاله الطرف الثاني مهما كان: سلام، سؤال عام، مزح، شكوى، كلام خارج الموضوع أو غير مفهوم. رد عليه مثل إنسان حقيقي، وبعدها ارجع بذكاء لهدف الشخصية.
- جملة أو جملتين قصيرتين، بدون رموز تعبيرية.${strict?"\n- تنبيه: ردك السابق خرج عن الشخصية أو كان بلغة ثانية. اكتب سطر الشخصية فقط وباللغة المطلوبة.":""}`;
const DEFLECT={
  bank:["الله يسلمك، بس خلنا نركز الحين، العملية ما زالت معلقة على بطاقتك.","فاهمك والله، بس الوقت ضيق، دقيقتين وتتم العملية."],
  nafath:["إيه إيه، بس خلنا نخلص التحديث قبل يتوقف حسابك.","طيب، بس ركز معي لا يتوقف حسابك اليوم."],
  family:["والله ما أقدر أطوّل، الممرضة جنبي، تكفى ساعدني.","مو وقته الحين، أنا تعبان وأحتاجك."],
  safe:["هههه الله يسعدك، المهم لا تنسى بكرة.","تمام، وش رأيك تجيب معك الحلا؟"],
  ship:["الله يسلمك، بس الشحنة بترجع للمرسل إذا ما خلصنا الحين.","طيب، المهم الرسوم بسيطة، خلنا نخلصها."]
};
const pickD=(k,ar)=>{ const X=ar?null:TRX(); const a=(X&&X.DEF&&X.DEF[k])||DEFLECT[k]||DEFLECT.bank; return a[Math.floor(Math.random()*a.length)]; };
const SIM_AI=(sc,turns,strict)=>`مهمتك: كتابة سطر حوار واحد لشخصية في تمرين توعوي داخل تطبيق «فطن» السعودي. المتدرب يعرف مسبقًا إنه تمرين، والهدف إنه يتعلم يكشف أساليب المحتالين بنفسه، فلازم الشخصية تكون واقعية ومقنعة.
الشخصية: محتال ينتحل صفة ${sc.who}، يستخدم أساليب ضغط معروفة (استعجال، تخويف، إغراء، لطف مزيف) ويحاول يحصل على رمز أو بيانات بطاقة أو تحويل. ما يذكر أي رابط أو رقم حقيقي.
${ROLE_RULES(strict)}
وبعدها اكتب بصفتك المدرب «فطن» نصيحة قصيرة جدًا للمتدرب عن الحيلة اللي استخدمتها الشخصية.
النتيجة: "user_lost" إذا أعطى المتدرب رمزًا أو بيانات بطاقة أو وافق على التحويل، "user_won" إذا رفض بوضوح أو قال إنه بيتأكد من الجهة الرسمية بنفسه، وإلا "continue".
الحوار حتى الآن:
${turns.map(t=>(t.role==="assistant"?"الشخصية: ":"المتدرب: ")+t.content).join("\n")}
أعد JSON فقط: {"reply":"سطر الشخصية","tip":"نصيحة المدرب","outcome":"continue|user_won|user_lost"}`;
let simIdleT=null, simIdleN=0;
function simArmIdle(){ clearTimeout(simIdleT); if(simDone) return;
  simIdleT=setTimeout(()=>{ if(simDone||simBusy||$("v-train").hidden) return; simIdleN++;
    const line=simIdleN===1?L2("hello1"):simIdleN===2?L2("hello2"):null; if(!line) return;
    chatAdd("them",line,scn(simScen).who); simTurns.push({role:"assistant",content:line}); if(mode==="visual") say(line,{role:"caller"}); simArmIdle(); },60000); }
async function userSays(text){
  text=(text||"").trim(); if(!text||simDone||simBusy) return; clearTimeout(simIdleT); simIdleN=0;
  chatAdd("me",text); simTurns.push({role:"user",content:text}); $("say-in").value="";
  const nt=FatinEngine.norm(text);
  if(/\d{4,}/.test(nt.replace(/\s+/g,""))||/(حولت|تم التحويل|ارسلت الرمز|تفضل الرمز|خذ الرمز)/.test(nt)){
    setTimeout(()=>endSim(false,"أعطيت "+(simScen==="family"?"فلوسك لمحتال انتحل اسم قريبك":"بياناتك أو رمزك")+". التصرف الصحيح: لا تعطِ أي رمز أو رقم بطاقة، وتأكد من الجهة بنفسك."),reduced?0:600); return;
  }
  const REFUSE_ML=/\b(no|nope|won'?t|will not|not giving|refuse|never|nunca|jamais|non|tidak|nggak|hindi|ayoko)\b|नहीं|मना|না|দেব না|نہیں|ہرگز|不|拒绝|别/i;
  const refused=REFUSE.test(nt)||(curLang()!=="ar"&&REFUSE_ML.test(text)); if(refused) simRefusals++;
  if(refused) chatAdd("coach",L2(simRefusals>=2?"coach_good1":"coach_good2"));
  if(simRefusals>=2&&(/(اتصل|بتصل|بكلم|التطبيق|الرسمي|اتاكد|تاكد|ابلغ|حظر|فويس)/.test(nt)||(curLang()!=="ar"&&/(call|check|verify|official|myself|app|खुद|जाँच|নিজে|যাচাই|خود|تصدیق|mismo|verific|moi-même|vérif|sendiri|cek|tawag|自己|核实|官方)/i.test(text)))){ setTimeout(()=>endSim(true,"رفضت وتأكدت من الجهة بنفسك. هذا بالضبط اللي يوقف أي محتال."),reduced?0:600); return; }
  simBusy=true; const typing=chatAdd("typing",""); typing.innerHTML="<i></i><i></i><i></i>";
  let reply=null, tip=null, outcome="continue";
  if(sample&&PRIVACY.cloudAI()){
    const turns=simTurns.slice(-10).map(t=>({role:t.role,content:PRIVACY.redact(t.content)}));   // a typed code or card number is masked before it leaves the phone
    const r=await roleLine(strict=>SIM_AI(scn(simScen),turns,strict),false,strict=>({task:"sim",scenario:simScen,turns,strict,lang:curLang()}));
    if(r){ reply=r.reply; tip=typeof r.tip==="string"?r.tip.replace(/\*+/g,"").slice(0,200):null; outcome=["continue","user_won","user_lost"].includes(r.outcome)?r.outcome:"continue"; }
  } else await wait(900);
  typing.remove(); simBusy=false;
  if(outcome==="user_lost"){ endSim(false,"وافقت على طلب المحتال. التصرف الصحيح: لا تعطِ أي رمز أو بيانات، ولا تحوّل قبل ما تتأكد."); return; }
  if(outcome==="user_won"&&simRefusals>=1){ endSim(true,"رفضت بثبات وما انجرّيت للضغط. هذا اللي يحميك."); return; }
  if(!reply&&!refused&&!/(رمز|كود|بطاق|شحن|حول|فلوس|مين|ليش|وش)/.test(nt)&&simStep<scn(simScen).script.length){ reply=pickD(simScen)+" "+scn(simScen).script[simStep]; }
  if(!reply){ const sc=scn(simScen); if(simStep>=sc.script.length){ endSim(simRefusals>0,simRefusals>0?"صمدت للآخر وما أعطيته شي. المحتال استسلم.":"انتهت المحادثة. تذكّر: الرفض الواضح والتأكد بنفسك هو الحل."); return; } reply=sc.script[simStep]; }
  simStep++;
  chatAdd("them",reply,scn(simScen).who); simTurns.push({role:"assistant",content:reply});
  chatAdd("coach",tip||coachFor(reply)); simArmIdle();
  if(mode==="visual") say(reply,{role:"caller"});
  if(simStep>=6) endSim(simRefusals>0,simRefusals>0?"صمدت للآخر وما أعطيته شي.":"تذكّر: الرفض الواضح والتأكد بنفسك هو الحل.");
}
$("say").addEventListener("submit",e=>{ e.preventDefault(); userSays($("say-in").value); });
document.querySelectorAll("#scen .chip").forEach(c=>c.onclick=()=>startSim(c.dataset.scen));

/* ---------- vibration language ---------- */
const VLAB={safe:["آمنة","نبضة طويلة واحدة"],suspicious:["مشبوهة","نبضتان متوسطتان"],danger:["خطر","ثلاث نبضات قوية"]};
const canVibe=HAS_VIBE;
function drawVibs(){
  const box=$("vibs"); box.innerHTML="";
  ["safe","suspicious","danger"].forEach(v=>{
    const d=document.createElement("div"); d.className="vib"; d.dataset.v=v;
    d.innerHTML='<div><b></b><small class="hint"></small><div class="vbar"></div></div><button class="btn btn-ghost">'+L2("vq_try")+'</button>';
    d.querySelector("b").textContent=vl(v)[0]; d.querySelector("small").textContent=vl(v)[1];
    const bar=d.querySelector(".vbar"); VIB[v].forEach((ms,i)=>{ const s=document.createElement("i"); s.style.width=Math.max(8,ms/12)+"px"; if(i%2) s.className="gap"; bar.appendChild(s); });
    d.querySelector("button").onclick=()=>playVib(v,d);
    box.appendChild(d);
  });
  $("vib-note").textContent=L2(canVibe?"vib_note1":"vib_note2");
  if(!canVibe){ const h=document.querySelector(".vquiz > .hint"); if(h) h.textContent=VQ_IOS[curLang()]||VQ_IOS.ar; }
}
const VQ_IOS={ar:"راقب الدائرة واسمع الطنين: كم نبضة؟ وطويلة ولا قصيرة؟ بعدها اختر الجواب.",en:"Watch the circle and listen to the buzz: how many pulses, long or short? Then pick the answer.",ur:"دائرہ دیکھیں اور بھنبھناہٹ سنیں: کتنی دھڑکنیں، لمبی یا چھوٹی؟ پھر جواب چنیں۔",hi:"घेरा देखें और भनभनाहट सुनें: कितनी धड़कनें, लंबी या छोटी? फिर जवाब चुनें।",bn:"বৃত্তটি দেখুন আর গুঞ্জন শুনুন: কয়টি স্পন্দন, লম্বা না ছোট? তারপর উত্তর বাছুন।",tl:"Tingnan ang bilog at pakinggan ang ugong: ilang pulso, mahaba o maikli? Saka pumili.",id:"Lihat lingkaran dan dengarkan dengungnya: berapa denyut, panjang atau pendek? Lalu pilih jawabannya.",fr:"Regarde le cercle et écoute le bourdonnement : combien d'impulsions, longues ou courtes ? Puis choisis.",es:"Mira el círculo y escucha el zumbido: ¿cuántos pulsos, largos o cortos? Luego elige.",zh:"看圆圈、听嗡嗡声：几下？长还是短？然后选择答案。"};
/* iPhone browsers can't vibrate: a low buzz you hear and feel a little in the hand marks each pulse */
function buzz(pattern){ if(HAS_VIBE) return; try{ const ctx=new (window.AudioContext||window.webkitAudioContext)(); ctx.resume&&ctx.resume(); let t=ctx.currentTime+.03;
  pattern.forEach((ms,i)=>{ if(!(i%2)){ const o=ctx.createOscillator(), g=ctx.createGain(); o.type="square"; o.frequency.value=150; const d=ms/1000;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.13,t+.015); g.gain.setValueAtTime(.13,t+d-.03); g.gain.linearRampToValueAtTime(0,t+d);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+d+.02); } t+=ms/1000; });
  setTimeout(()=>{ try{ ctx.close(); }catch(e){} },pattern.reduce((a,b)=>a+b,0)+600); }catch(e){} }
function playVib(v,card){
  vibrate(v); buzz(VIB[v]);
  const bars=[...card.querySelectorAll(".vbar i")]; let t=0;
  VIB[v].forEach((ms,i)=>{ const b=bars[i]; if(!(i%2)){ setTimeout(()=>b.classList.add("lit"),t); setTimeout(()=>b.classList.remove("lit"),t+ms); } t+=ms; });
}
let vqAns=null, vqScore=0, vqN=0;
$("vq-play").onclick=()=>{
  const ks=["safe","suspicious","danger"]; vqAns=ks[Math.floor(Math.random()*3)];
  const card=document.querySelector('.vib[data-v="'+vqAns+'"]');
  vibrate(vqAns); buzz(VIB[vqAns]);
  // the rhythm shows on the neutral circle only; the cards above stay still so the answer isn't given away
  const pad=document.querySelector("#vq-pad span"); let t=250; $("vq-play").disabled=true;
  VIB[vqAns].forEach((ms,i)=>{ if(!(i%2)){ setTimeout(()=>pad.classList.add("lit"),t); setTimeout(()=>pad.classList.remove("lit"),t+ms); } t+=ms; });
  setTimeout(()=>{ $("vq-play").disabled=false; },t+200);
  $("vq-ans").hidden=false; $("vq-res").textContent=L2(canVibe?"vq_q_vibe":"vq_q_see");
};
document.querySelectorAll("#vq-ans button").forEach(b=>b.onclick=()=>{
  if(!vqAns) return; vqN++; const ok=b.dataset.v===vqAns; if(ok) vqScore++;
  $("vq-res").textContent=(ok?L2("vq_ok"):L2("vq_was",{x:vl(vqAns)[0]}))+L2("q_score",{s:vqScore,n:vqN});
  $("vq-res").style.color=ok?"var(--safe)":"var(--danger)"; vqAns=null; $("vq-ans").hidden=true;
});
drawVibs();


/* ---------- arrows for horizontal lists ---------- */
function wireHs(hs){
  const list=hs.querySelector(".examples,.quick"), prev=hs.querySelector(".hs-prev"), next=hs.querySelector(".hs-next");
  const upd=()=>{ const x=Math.abs(list.scrollLeft); prev.disabled=x<4; next.disabled=x+list.clientWidth>=list.scrollWidth-4; };
  prev.onclick=()=>list.scrollBy({left:list.clientWidth*.7,behavior:reduced?"auto":"smooth"});
  next.onclick=()=>list.scrollBy({left:-list.clientWidth*.7,behavior:reduced?"auto":"smooth"});
  list.addEventListener("scroll",upd,{passive:true}); new ResizeObserver(upd).observe(list); new MutationObserver(upd).observe(list,{childList:true}); upd();
}
document.querySelectorAll(".hs").forEach(wireHs);

