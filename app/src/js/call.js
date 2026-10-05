/* ---------- call guard: a live, two-way simulated call ---------- */
const CALLS={
  bank:{name:"رقم غير معروف",num:"9200 •••••",scam:true,persona:"فيصل، يدّعي إنه موظف «قسم الحماية» في البنك",goal:"رمز التحقق اللي يوصل لجوال الضحية",
    lines:["السلام عليكم، معك فيصل من قسم الحماية في البنك.","رصدنا محاولة سحب من بطاقتك بثلاثة آلاف ومئتين ريال، ولازم نوقفها الحين.","بيوصلك رمز على جوالك الحين، قوله لي عشان نوقف العملية.","بسرعة لو سمحت، العملية بتتم خلال دقيقتين."],
    faq:{who:"معك فيصل الشهري من قسم الحماية، وأنا أكلمك عشان أحمي فلوسك.",why:"عشان نلغي العملية لازم نتأكد إنك صاحب البطاقة، والرمز هو التحقق.",detail:"رقمي الوظيفي أربعة أربعة اثنين واحد، فرع العليا. يلا بسرعة الله يخليك.",verify:"لا لا تقفل! إذا قفلت العملية بتتم وتخسر المبلغ كامل، ما عندنا وقت.",refuse:"يا أخوي أنا أحاول أساعدك، فلوسك بتروح وأنت تتحمل المسؤولية.",name:"اسمي فيصل الشهري، وهذا مو وقت أسئلة، العملية تمشي!",where:"فرع العليا في الرياض. يلا الله يخليك أرسل الرمز."},
    quick:["مين معي؟","ليش تبي الرمز؟","وش رقمك الوظيفي؟","بتصل على البنك بنفسي","ما أعطي أي رمز"]},
  nafath:{name:"رقم غير معروف",num:"+966 55 ••• ••••",scam:true,persona:"شخص يدّعي إنه موظف في أبشر",goal:"موافقة الضحية على طلب نفاذ واختيار الرقم",
    lines:["هلا، معك موظف من أبشر.","حسابك فيه تحديث ناقص وبيتوقف اليوم إذا ما كملناه.","بيطلع لك طلب في نفاذ، اختر الرقم اللي أقولك عليه، ثلاثة وأربعين.","لا تقفل الخط، هذا إجراء رسمي."],
    faq:{who:"معك سلطان من الدعم الفني في أبشر.",why:"الموافقة على نفاذ تأكد هويتك عشان ما يتوقف حسابك، إجراء روتيني.",detail:"حسابك في أبشر، وإذا توقف ما تقدر تجدد ولا تسوي أي خدمة.",verify:"ما يحتاج تدخل، أنا معك الحين وأخلصها لك بدقيقة.",refuse:"براحتك، بس لا تلوم إلا نفسك إذا توقفت خدماتك اليوم.",name:"سلطان العتيبي، موظف في الدعم الفني.",where:"من مركز خدمة أبشر الرئيسي، ما يحتاج تروح مكان."},
    quick:["مين معي؟","ليش أوافق على نفاذ؟","وش الحساب اللي بيتوقف؟","بدخل أبشر بنفسي","ما أوافق على شي"]},
  family:{name:"رقم غير معروف",num:"+966 53 ••• ••••",scam:true,persona:"شخص يدّعي إنه فهد ولد عم الضحية",goal:"تحويل ألف ريال بحجة حادث",
    lines:["هلا والله، هذا أنا فهد ولد عمك، أكلمك من جوال صديقي.","صار لي حادث بسيط وأنا الحين في المستشفى.","أبيك تحول لي ألف ريال الحين للعلاج، وأرجعها لك بكرة.","لا تقول لأحد، ما أبي أهلي يخافون."],
    faq:{who:"أنا فهد! ما عرفت صوتي؟ الجوال تعبان والصوت متغير.",why:"المستشفى يبي يدفعون قبل العلاج، وأنا ما معي شي.",detail:"مستشفى خاص، ما أذكر اسمه الحين، المهم حوّل الله يخليك.",verify:"لا تتصل على رقمي القديم، جوالي خرب في الحادث.",refuse:"يعني تخليني كذا؟ والله ما توقعتها منك.",name:"وش هالسؤال الحين؟ أنا فهد! الصوت متغير بس من الجوال.",where:"مستشفى خاص، ما أذكر اسمه الحين، المهم حوّل الله يخليك."},
    quick:["مين معي؟","وش اسم أبوك؟","أي مستشفى؟","بتصل على رقمك القديم","ما أحوّل قبل أتأكد"]},
  safe:{name:"أبو خالد",num:"جهة اتصال محفوظة",scam:false,persona:"أبو خالد، صديق يعزم صاحبه على العشاء",goal:"",
    lines:["هلا والله، وش أخبارك؟","بكرة العشاء عندنا بعد المغرب، لا تتأخر.","وجب معك القهوة اللي تحبها، الشباب يسلمون عليك."],
    faq:{who:"وش فيك؟ أنا أبو خالد يا رجال، رقمي عندك.",why:"ولا شي، جمعة الشباب المعتادة.",detail:"الشباب كلهم بيجون، وعامل كبسة.",verify:"اتصل علي أي وقت، أنا موجود.",refuse:"براحتك، بس لا تفوتنا.",name:"وش فيك اليوم؟ أنا أبو خالد يا رجال.",where:"عندنا في البيت، تعرفه."},
    quick:["مين معي؟","وش المناسبة؟","مين بيجي؟","أكيد بجي","أتصل عليك بعدين"]}
};
const CALL_TYPE={
  mobileclaim:"رقم جوال عادي يقول إنه من جهة رسمية، والجهات الرسمية ما تتصل من جوالات",otp:"يطلب رمز التحقق",nafath:"يطلب موافقة في نفاذ",card:"يطلب بيانات بطاقتك",sensdata:"يطلب بياناتك الحساسة",remote:"يطلب تحكم بجوالك",
  safeacct:"يطلب نقل فلوسك لحساب ثاني",emergency:"يطلب تحويل بحجة طارئ",money:"يطلب تحويل فلوس",deposit:"يطلب رسومًا أو عربونًا",giftcard:"يطلب بطاقات شحن",
  wrongtx:"يطلب ترجيع تحويل «بالغلط»",proxy:"يطلب تحويل باسم شخص ثاني",newnum:"يتصل من رقم غريب ويدّعي إنه قريبك",imp:"يدّعي إنه من جهة رسمية",
  suspend:"يخوّفك بإيقاف حسابك",urgent:"يستعجلك",update:"يطلب تحديث بياناتك",login:"يطلب بيانات دخولك"
};
const CALL_ACT={
  warn:"انتبه. الجهات الرسمية ما تطلب بيانات بالاتصال. اسأله، ولا تعطه أي شي.",
  danger:"لا تعطه أي شي. أغلق المكالمة واتصل بالجهة من رقمها الرسمي.",
  critical:"لا تكمل المكالمة. أغلق الآن، ثم بلّغ عن الرقم."
};
const CALL_ORDER=["otp","mobileclaim","nafath","card","sensdata","remote","safeacct","emergency","giftcard","wrongtx","deposit","money","proxy","newnum","suspend","update","login","urgent","imp"];
const CAT_BANK=["otp","card","safeacct","iban"], CAT_MONEY=["money","emergency","deposit","giftcard","wrongtx","loan","prize","invest","proxy"];
const BANDS=["safe","warn","danger","critical"];
const bandOf=r=>r>=85?"critical":r>=60?"danger":r>=20?"warn":"safe";
let call=null, callMode=store.get("fatin-callmode")||"voice";
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let rec=null, micOK=null;
function setCallMode(m){ callMode=m; store.set("fatin-callmode",m);
  document.querySelectorAll("#cs-mode button").forEach(b=>b.setAttribute("aria-checked",String(b.dataset.cm===m)));
  const scr=$("callscr"); scr.classList.toggle("cm-voice",m==="voice"); scr.classList.toggle("cm-chat",m==="chat"); }
document.querySelectorAll("#cs-mode button").forEach(b=>b.onclick=()=>{ if(call&&!call.ended&&!$("cs-in").hidden) setCallMode(b.dataset.cm); });
async function ensureMic(){
  if(!SR&&!FATIN.server) return "nosr";
  try{ if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){ const st=await navigator.mediaDevices.getUserMedia({audio:true}); st.getTracks().forEach(t=>t.stop()); } return "ok"; }
  catch(e){ return "blocked"; }
}
function micUI(on,txt){ $("cs-mic").classList.toggle("on",on); $("mic-state").textContent=txt||(on?"أسمعك… تكلّم":"اضغط المايك وتكلّم"); }
function stopListen(){ if(rec){ try{ rec.onend=null; rec.abort(); }catch(e){} rec=null; } if(STT.active&&STT.stop){ try{ STT.stop(); }catch(e){} } micUI(false,""); }
/* ---------- hearing you: record a short answer and let Fatin's server write it down ----------
   iPhone (especially the home-screen app) blocks the browser's own recogniser, so there we record the
   voice ourselves, stop when you go quiet, and send a small WAV to /stt (free Whisper on Cloudflare). */
const STT={active:false,stop:null,forced:false};
function useServerSTT(){ return !!FATIN.server&&PRIVACY.cloudVoice()&&(IS_IOS||!SR||STT.forced); }   // off with the natural-voice setting
function wavFrom(chunks,rate){
  let n=0; chunks.forEach(c=>n+=c.length); const all=new Float32Array(n); let o=0; chunks.forEach(c=>{ all.set(c,o); o+=c.length; });
  const ratio=rate/16000, len=Math.floor(all.length/ratio), pcm=new Int16Array(len);
  for(let i=0;i<len;i++){ const a=Math.floor(i*ratio), b=Math.min(all.length,Math.floor((i+1)*ratio)); let sum=0,c=0; for(let j=a;j<b;j++){ sum+=all[j]; c++; } const v=Math.max(-1,Math.min(1,c?sum/c:0)); pcm[i]=v<0?v*0x8000:v*0x7FFF; }
  const buf=new ArrayBuffer(44+pcm.length*2), dv=new DataView(buf); const w=(p,t)=>{ for(let i=0;i<t.length;i++) dv.setUint8(p+i,t.charCodeAt(i)); };
  w(0,"RIFF"); dv.setUint32(4,36+pcm.length*2,true); w(8,"WAVE"); w(12,"fmt "); dv.setUint32(16,16,true); dv.setUint16(20,1,true); dv.setUint16(22,1,true);
  dv.setUint32(24,16000,true); dv.setUint32(28,32000,true); dv.setUint16(32,2,true); dv.setUint16(34,16,true); w(36,"data"); dv.setUint32(40,pcm.length*2,true);
  new Int16Array(buf,44).set(pcm); return new Blob([buf],{type:"audio/wav"});
}
async function recordAnswer(){
  try{ if(navigator.audioSession) navigator.audioSession.type="play-and-record"; }catch(e){}
  const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}});
  const ctx=new (window.AudioContext||window.webkitAudioContext)(); try{ await ctx.resume(); }catch(e){}
  const src=ctx.createMediaStreamSource(stream), proc=ctx.createScriptProcessor(4096,1,1), mute=ctx.createGain(); mute.gain.value=0;
  const chunks=[]; let speech=false, quiet=0, total=0, floor=0, nf=0;
  return await new Promise(resolve=>{
    let done=false;
    const stop=()=>{ if(done) return; done=true; try{ proc.disconnect(); src.disconnect(); mute.disconnect(); }catch(e){} stream.getTracks().forEach(t=>t.stop());
      const rate=ctx.sampleRate; try{ ctx.close(); }catch(e){} try{ if(navigator.audioSession) navigator.audioSession.type="playback"; }catch(e){}
      resolve({chunks,rate,speech}); };
    STT.stop=stop;
    proc.onaudioprocess=e=>{ if(done) return; const d=e.inputBuffer.getChannelData(0); chunks.push(new Float32Array(d));
      let sum=0; for(let i=0;i<d.length;i++) sum+=d[i]*d[i]; const rms=Math.sqrt(sum/d.length), dt=d.length/ctx.sampleRate; total+=dt;
      if(total<.35){ floor=(floor*nf+rms)/(nf+1); nf++; return; }               // learn the room's background level
      const th=Math.max(.012,floor*2.6);
      if(rms>th){ speech=true; quiet=0; } else quiet+=dt;
      const lvl=Math.min(1,rms/(th*3)); $("cs-mic").style.setProperty("--lvl",lvl.toFixed(2));
      if((speech&&quiet>1.2)||total>15||(!speech&&total>8)) stop(); };
    src.connect(proc); proc.connect(mute); mute.connect(ctx.destination);
  });
}
async function serverListen(){
  if(STT.active) return; STT.active=true; clearTimeout(call.idle); $("cs-mic").classList.remove("nudge");
  try{ speechSynthesis.cancel(); }catch(e){}
  micUI(true,"أسمعك… تكلّم، وأوقف لما تخلص");
  let rec0;
  try{ rec0=await recordAnswer(); }
  catch(e){ STT.active=false; micUI(false,""); micOK="blocked"; micFallback(); return; }
  if(!call||call.ended||call.hold){ STT.active=false; micUI(false,""); return; }
  if(!rec0.speech){ STT.active=false; micUI(false,"ما سمعت شي. اضغط المايك وتكلّم"); $("cs-mic").classList.add("nudge"); return; }
  micUI(false,"لحظة… أكتب كلامك"); $("cs-mic").classList.add("busy");
  let text="";
  try{ const ctl=new AbortController(), to=setTimeout(()=>ctl.abort(),CONFIG.STT_TIMEOUT_MS);
    const r=await fetch(FATIN.server+"/stt?lang="+encodeURIComponent(voiceLang()),{method:"POST",headers:{"content-type":"audio/wav"},body:wavFrom(rec0.chunks,rec0.rate),signal:ctl.signal});
    clearTimeout(to); if(r.ok){ const j=await r.json(); text=String(j.text||"").trim(); } }
  catch(e){}
  $("cs-mic").classList.remove("busy"); STT.active=false;
  if(!call||call.ended||call.hold) return;
  if(text){ micUI(false,""); $("mic-heard").textContent=""; callUserSays(text); }
  else { micUI(false,"ما قدرت أفهم الكلام. اضغط المايك وجرّب مرة ثانية، أو اكتب ردّك"); $("cs-mic").classList.add("nudge"); }
}
const IS_IOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&(navigator.maxTouchPoints||0)>1);
const SR_ERR={"no-speech":"ما سمعت شي. اضغط المايك وتكلّم","audio-capture":"المايك مو شغال. تأكد إن ما فيه تطبيق ثاني يستخدمه","network":"الإنترنت ضعيف، اكتب ردّك تحت","aborted":""};
function listen(fromTap){
  if(!call||call.ended||call.hold||callMode!=="voice"||micOK!=="ok"||call.busy) return false;
  if(useServerSTT()){
    if(fromTap){ serverListen(); return true; }
    stopListen(); micUI(false,"اضغط المايك وتكلّم"); $("cs-mic").classList.add("nudge"); clearTimeout(call.idle);
    call.idle=setTimeout(()=>{ if(!STT.active&&call&&!call.ended&&!call.hold&&!call.busy) waitForUser(); },20000); return true; }
  // iPhone only opens the mic from a tap: wait for the person to press the mic
  if(IS_IOS&&!fromTap){ stopListen(); micUI(false,"اضغط المايك وتكلّم"); $("cs-mic").classList.add("nudge"); clearTimeout(call.idle); call.idle=setTimeout(()=>{ if(!rec&&call&&!call.ended&&!call.hold&&!call.busy) waitForUser(); },20000); return true; }
  $("cs-mic").classList.remove("nudge");
  try{ if(navigator.audioSession) navigator.audioSession.type="play-and-record"; }catch(e){}
  try{ VOICE.el&&VOICE.el.pause(); }catch(e){}
  stopListen(); clearTimeout(call.idle);
  let finalTxt="";
  try{
    rec=new SR(); rec.lang="ar-SA"; rec.interimResults=true; rec.continuous=false; rec.maxAlternatives=1;
    rec.onresult=e=>{ let t=""; for(let i=e.resultIndex;i<e.results.length;i++){ t+=e.results[i][0].transcript; if(e.results[i].isFinal) finalTxt+=e.results[i][0].transcript; } $("mic-heard").textContent=t; };
    let err="";
    rec.onerror=e=>{ err=e.error||""; if(err==="service-not-allowed"&&FATIN.server){ STT.forced=true; err="__srv"; return; } if(err==="not-allowed"||err==="service-not-allowed"){ micOK="blocked"; micFallback(); } };
    rec.onend=()=>{ rec=null; const t=(finalTxt||$("mic-heard").textContent||"").trim(); $("mic-heard").textContent="";
      micUI(false,t?"":(SR_ERR[err]!==undefined&&SR_ERR[err]!==""?SR_ERR[err]:"ما وصلني كلام. اضغط المايك وتكلّم"));
      try{ if(navigator.audioSession) navigator.audioSession.type="auto"; }catch(e){}
      if(!call||call.ended||call.hold) return; if(err==="__srv"){ micUI(false,"اضغط المايك وتكلّم"); $("cs-mic").classList.add("nudge"); return; }
      if(t) callUserSays(t); else if(IS_IOS) $("cs-mic").classList.add("nudge"); else waitForUser(); };
    rec.start(); micUI(true);
    return true;
  }catch(e){ return false; }
}
function micFallback(){
  setCallMode("chat");
  const n=$("cs-note"); n.hidden=false;
  if(IS_IOS&&SR&&!FATIN.inClaude&&!FATIN.server){ n.textContent="الآيفون يحتاج «الإملاء» عشان يسمعك: الإعدادات ← عام ← لوحة المفاتيح ← فعّل «الإملاء». وحوّلناها لك الحين شات، والمتصل يتكلم بصوته."; return; }
  n.textContent=SR?(FATIN.inClaude?"المايك مقفل هنا، لأن تطبيق Claude يمنعه داخل الصفحات. حوّلناها لك شات، والمتصل يتكلم بصوته. المكالمة الصوتية تشتغل في نسخة فطن على GitHub Pages.":"المايك مقفل أو ما سمحت له، فحوّلناها لك شات، والمتصل يتكلم بصوته. تقدر تسمح للمايك من إعدادات المتصفح وتجرّب مرة ثانية."):"متصفحك ما يدعم التعرّف على الكلام. حوّلناها لك شات. جرّب Chrome أو Safari.";
}

function callUI(state){
  const scr=$("callscr"); scr.classList.toggle("ringing",state==="ring"); scr.classList.toggle("talking",state==="talk");
  $("cs-in").hidden=state!=="ring"; const live=state==="talk"||state==="listen"||state==="hold";
  $("cs-on").hidden=!live; $("cs-talk").hidden=!live;
}
function setRisk(r){
  const box=$("cs-risk"); box.dataset.band=bandOf(r);
  $("cr-fill").style.width=Math.max(2,r)+"%"; $("cr-num").textContent=Math.round(r)+"%";
}
function callSet(k){
  callStop(true);
  document.querySelectorAll("#call-scen .chip").forEach(c=>c.classList.toggle("on",c.dataset.call===k));
  const c=CALLS[k];
  call={k,i:0,transcript:"",hist:[],risk:0,alertBand:"safe",firstDangerTurn:-1,turn:0,idle:null,next:null,timer:null,ended:false,hold:false,busy:false,fillers:0,lastType:null};
  $("cs-name").textContent=c.name; $("cs-num").textContent=c.num; $("cs-kind").textContent={mobile:"رقم جوال",landline:"هاتف أرضي",official:"رقم موحّد",tollfree:"رقم مجاني"}[numKind(c.num)]||""; $("cs-kind").hidden=!$("cs-kind").textContent; $("cs-state").textContent="مكالمة واردة…";
  $("cs-cap").innerHTML='<p class="cs-hint"></p>'; $("cs-cap").firstChild.textContent=capHint();
  $("cs-result").hidden=true; $("cs-note").hidden=true; $("cs-mode").hidden=false; $("cs-guard-t").textContent="فطن جاهز يسمع معك"; setRisk(0); setCallMode(callMode); micUI(false,"ردّ على المتصل");
  const q=$("cs-quick"); q.innerHTML=""; c.quick.forEach(t=>{ const b=document.createElement("button"); b.type="button"; b.className="chip"; b.textContent=t; b.onclick=()=>callUserSays(t); q.appendChild(b); });
  callUI("ring");
}
function callStop(silent){
  if(!call) return; call.ended=true; clearInterval(call.timer); clearTimeout(call.next); clearTimeout(call.idle); stopListen();
  try{ speechSynthesis.cancel(); }catch(e){}
  hideCallAlert();
  if(silent) callUI("idle");
}
callStop=hookable("callStop",callStop);
function capLine(cls,text){
  const cap=$("cs-cap"); const h=cap.querySelector(".cs-hint"); if(h) h.remove();
  const p=document.createElement("p"); p.className=cls;
  if(cls==="them"){
    const m=(FatinEngine.analyze(text).marks||[]).filter(x=>x.kind==="bad"||x.kind==="link").sort((a,b)=>a.s-b.s);
    let i=0; m.forEach(x=>{ if(x.s<i) return; p.appendChild(document.createTextNode(text.slice(i,x.s))); const mk=document.createElement("mark"); mk.textContent=text.slice(x.s,x.e); p.appendChild(mk); i=x.e; });
    p.appendChild(document.createTextNode(text.slice(i)));
  } else p.textContent=text;
  cap.appendChild(p); cap.scrollTop=cap.scrollHeight;
}
function callerVoice(text,cb){
  let done=false; const fin=()=>{ if(done) return; done=true; $("callscr").classList.remove("talking"); cb&&cb(); };
  $("callscr").classList.add("talking");
  const est=700+text.length*62;
  // the caller is silent only when the person picked «شات»; if the mic was blocked he still talks
  if(callMode==="chat"&&callType==="chat"){ call.next=setTimeout(fin,500+text.length*18); return; }
  if(mode==="hearing"||mode==="touch"){ call.next=setTimeout(fin,est); return; }
  const emo=call.emo||""; call.emo="";
  try{ say(text,{role:"caller",rate:emo==="angry"?1.14:1.08,pitch:emo==="angry"?1.05:.95,voice:0,emotion:emo,onend:fin}); call.next=setTimeout(fin,est+9000); }
  catch(e){ call.next=setTimeout(fin,est); }
}
function assess(){
  const c=CALLS[call.k]; const res=FatinEngine.analyze(call.transcript);
  const ids=res.ids||[];
  let r=res.score;
  const nt=FatinEngine.norm(call.transcript);
  const claim=((res.brands||[]).length>0&&/معك|موظف|من (البنك|ابشر)/.test(nt))||/قسم الحمايه|من البنك|من ابشر|من نفاذ|من الوزاره|من الشرطه|من الجوازات|جهه حكوميه|جهه رسميه/.test(nt);
  const kind=numKind(c.num);
  let mobileClaim=false;
  if(claim&&c.scam){
    if(kind==="mobile"){ r+=30; mobileClaim=true; if(!ids.includes("mobileclaim")) ids.unshift("mobileclaim"); }
    else if(kind==="official"||kind==="tollfree"||kind==="landline"){ r+=5; }   // could be real: only what he asks for raises the alarm
    else { r+=20; }
    if(!ids.includes("imp")) ids.push("imp");
  }
  const dangerNow=ids.some(i=>CAT_BANK.includes(i)||CAT_MONEY.includes(i)||["nafath","sensdata","remote"].includes(i));
  if(dangerNow&&call.firstDangerTurn<0) call.firstDangerTurn=call.turn;
  if(call.firstDangerTurn>=0) r+=10*Math.max(0,call.turn-call.firstDangerTurn);
  if(!c.scam) r=Math.min(r,15);
  r=Math.max(call.risk,Math.min(100,r));
  call.risk=r; setRisk(r);
  const k=CALL_ORDER.find(x=>ids.includes(x));
  const cat=ids.some(i=>CAT_BANK.includes(i))?"bank":ids.some(i=>CAT_MONEY.includes(i))?"money":"personal";
  return {r,band:bandOf(r),k,cat,res,mobileClaim};
}
assess=hookable("assess",assess);
/* what kind of number is calling: Saudi mobiles start with 5; banks and government use unified 9200 / 800 numbers */
function numKind(num){
  const t=String(num||""); if(/جهة اتصال|محفوظ/.test(t)) return "contact";
  const d=t.replace(/[^\d•]/g,"").replace(/^00/,"").replace(/^966/,"").replace(/^0/,"");
  if(/^5/.test(d)) return "mobile";
  if(/^(9200|920)/.test(d)) return "official";
  if(/^800/.test(d)) return "tollfree";
  if(/^1[1-7]/.test(d)) return "landline";
  return "unknown";
}
function maybeAlert(a,after){
  if(BANDS.indexOf(a.band)>BANDS.indexOf(call.alertBand)){ call.alertBand=a.band;
    if(a.band==="warn"){ showSoftAlert(a); return false; }   // no real danger yet: a quiet note, the call goes on
    showCallAlert(a); return true; }
  return false;
}
function showSoftAlert(a){
  const el=$("csoft"); $("csoft-t").textContent="فطن: انتبه بهدوء";
  $("csoft-s").textContent=(CALL_TYPE[a.k]||"كلام يحتاج انتباه")+(a.mobileClaim&&a.k!=="mobileclaim"?"، ومن رقم جوال عادي":"")+". لا تعطه أي بيانات.";
  el.hidden=false; void el.offsetWidth; el.classList.add("on");
  try{ haptic([40]); }catch(e){}
  if(mode==="hearing"||mode==="touch") flash("suspicious");
  clearTimeout(showSoftAlert.t); showSoftAlert.t=setTimeout(()=>{ el.classList.remove("on"); setTimeout(()=>{ el.hidden=true; },400); },6500);
}
function callerSay(text,after){
  if(!call||call.ended) return;
  call.turn++; call.transcript+=" "+text; call.hist.push({who:"caller",t:text});
  try{ const cc=CALLS[call.k]; if(callMode==="voice"&&cc.lines[call.i]) voicePrefetch(cc.lines[call.i],"caller"); }catch(e){}
  capLine("them",text);
  const a=assess();
  $("cs-guard-t").textContent=a.band==="safe"?"فطن يسمع معك":a.band==="warn"?"فطن رصد علامة مريبة":a.band==="danger"?"فطن رصد خطر احتيال":"خطر عالي: أغلق المكالمة";
  callerVoice(text,()=>{
    if(!call||call.ended) return;
    if(call.closing){ setTimeout(()=>{ if(call&&!call.ended) callEnd("survived"); },400); return; }
    if(maybeAlert(a)) return;
    if(!(callMode==="voice"&&listen())) waitForUser();
  });
}
function waitForUser(){
  if(!call||call.ended||call.hold) return;
  clearTimeout(call.idle);
  const c=CALLS[call.k];
  if(call.i<2&&call.i<c.lines.length){ call.idle=setTimeout(()=>{ if(!call||call.ended||call.hold||call.busy) return; callerSay(c.lines[call.i++]); },900); return; }
  // after the opening, the caller only talks when you do. Silence for a minute (15s on a voice call) gets "hello?"
  call.idle=setTimeout(()=>{
    if(!call||call.ended||call.hold||call.busy) return;
    call.fillers=(call.fillers||0)+1;
    if(call.fillers===1) callerSay("ألو؟ انت موجود؟");
    else if(call.fillers===2) callerSay("ألو... تسمعني؟");
    else { callerSay(c.scam?"شكلك مو مهتم، مع السلامة.":"طيب أشوفك بكرة إن شاء الله، مع السلامة."); setTimeout(()=>{ if(call&&!call.ended) callEnd(c.scam?(call.risk>=60?"survived":"done"):"done"); },2500); }
  }, callMode==="chat"?60000:15000);
}
const INTENTS=[
  ["comply",/\d{4,}|تفضل الرمز|الرمز هو|تم التحويل|حولت لك|وافقت|اخترت الرقم|خذ الرمز|ابشر بحول|طيب بحول/],
  ["verify",/بتصل|اتصل|بكلم|بدخل|ادخل|بنفسي|رقمك القديم|التطبيق|الفرع|اقفل|بقفل/],
  ["refuse",/ما (اعطي|اوافق|احول|ابي)|مستحيل|ابد|لن |^لا\b|لا ما/],
  ["who",/مين|من معي|اسمك|من انت/],
  ["name",/اسم ابوك|اسم امك|اسم جدك|وش اسم|اسمك الكامل/],
  ["where",/اي مستشفي|وين انت|وين|اي فرع|فرع/],
  ["detail",/رقمك|وظيفي|وش الحساب|مين بيجي/],
  ["why",/ليش|ليه|لماذا|وش السبب|المناسبه|عشان وش/]
];
const ACCUSE=/كذاب|كذب|تكذب|نصاب|تنصب|نصبت|محتال|احتيال|حرامي|سارق|حرام عليك|ما اصدقك|ما صدقتك/;
const ANGRY=["وش كذاب؟! أنا أكلمك من جهة رسمية وأنت تتهمني؟","لا لا، لا تتهمني! أنا أحاول أساعدك وأنت تكلمني كذا؟","يا أخي احترم نفسك شوي! أنا موظف وأسوي شغلي."];
const GIVEUP=["طيب أخوي، شكرًا لك… مع السلامة.","خلاص أخوي، شكرًا لوقتك. مع السلامة.","أوكي، الظاهر ما تبي تتعاون. شكرًا لك، مع السلامة."];
const CALL_AI=(c,hist,strict,accused)=>`مهمتك: كتابة سطر حوار واحد لشخصية في مكالمة ضمن تمرين توعوي داخل تطبيق «فطن» السعودي. المتدرب يعرف مسبقًا إنه تمرين، والهدف إنه يتعلم يكشف المحتال بنفسه، فلازم الشخصية تكون واقعية.
الشخصية: ${c.persona}.
${c.scam?`هدف الشخصية: ${c.goal}. الشخصية هي اللي اتصلت وعندها خطة، فهي اللي تقود المكالمة دايم.
- كل سطر لازم يقرّب من الهدف: ${hist.filter(h=>h.who==="caller").length<2?"الحين ابنِ الثقة بسرعة واذكر المشكلة المزعومة، وبعدها مباشرة اطلب الهدف.":"الحين اطلب الهدف بشكل صريح ومباشر في نفس السطر."}
- ممنوع تسأل الطرف الثاني «وش عندك؟» أو «كيف أخدمك؟» أو «وش تبي؟» أو تنتظره يطلب شي، وممنوع تتصرف كموظف خدمة عملاء.
${accused?"- الطرف الثاني اتهمك الحين بالكذب أو النصب: انفعل وانزعج بشكل واضح في أول السطر (مثل: «وش كذاب؟! أنا أكلمك من البنك وأنت تتهمني؟»)، بدون شتايم ولا كلام بذيء، وبعدها كمّل الضغط.\n":""}- إذا شك فيك أو قال «كذاب» أو «نصاب»: لا تنسحب ولا تعتذر. أنكر بثقة، وأعطِ تفاصيل مزيفة مقنعة، وصعّد الضغط (مثل: الحساب بيتجمد، العملية بتنخصم خلال دقايق)، وارجع اطلب الهدف.
- إذا سأل عن اسمك أو فرعك: أعطِ جواب مقنع مزيف وكمّل للهدف في نفس السطر.
- إذا قال إنه بيتصل بالجهة بنفسه: حاول تمنعه بحجة الوقت.
- ما تذكر أي رابط أو رقم حقيقي.`:`صديق طيب، ما يطلب أي بيانات أو فلوس أبدًا.`}
${ROLE_RULES(strict,true)}
المكالمة حتى الآن:
${hist.map(h=>(h.who==="caller"?"الشخصية: ":"الطرف الثاني: ")+h.t).join("\n")}
أعد JSON فقط: {"reply":"سطر الشخصية"}`;
async function callUserSays(text){
  text=(text||"").trim(); if(!text||!call||call.ended||call.busy) return;
  clearTimeout(call.idle); clearTimeout(call.next); stopListen(); try{ speechSynthesis.cancel(); }catch(e){}
  $("callscr").classList.remove("talking"); $("cs-text").value="";
  capLine("me",text); call.hist.push({who:"me",t:text}); call.fillers=0;
  const c=CALLS[call.k], nt=FatinEngine.norm(text);
  const intent=(INTENTS.find(([,re])=>re.test(nt))||[null])[0];
  if(intent==="comply"&&c.scam){ callEnd("lose"); return; }
  const accused=c.scam&&ACCUSE.test(nt);
  call.uTurns=(call.uTurns||0)+1; if(accused) call.accused=(call.accused||0)+1;
  // he dragged it out and gave nothing: the scammer gives up, says thanks and hangs up
  if(c.scam&&(call.uTurns>=7||call.accused>=3||(call.accused>=2&&call.uTurns>=5))){
    call.busy=true; await wait(700); call.busy=false; if(!call||call.ended) return;
    call.closing=true; call.emo="annoyed"; callerSay(GIVEUP[Math.floor(Math.random()*GIVEUP.length)]); return; }
  call.busy=true;
  let reply=null;
  if(sample&&PRIVACY.cloudAI()){
    const hist=call.hist.slice(-12).map(h=>({who:h.who,t:PRIVACY.redact(h.t)}));   // a said code or card number is masked before it leaves the phone
    const r=await roleLine(strict=>CALL_AI(c,hist,strict,accused),true,strict=>({task:"call",call:call.k,hist,strict,accused:!!accused})); if(r) reply=r.reply.slice(0,240);
  } else await wait(500);
  call.busy=false;
  if(!call||call.ended) return;
  const fromAI=!!reply;
  if(!reply){
    if(intent&&c.faq[intent]) reply=c.faq[intent];
    else if(call.i<c.lines.length) reply=pickD(call.k,true)+" "+c.lines[call.i++];
    else reply=c.scam?"يا أخوي الوقت يمشي، خلنا نخلص بسرعة.":"تمام، أشوفك بكرة إن شاء الله.";
  }
  if(accused&&!fromAI) reply=ANGRY[Math.floor(Math.random()*ANGRY.length)]+" "+reply;
  if(intent==="verify"&&c.scam) call.verified=true;
  if(accused) call.emo="angry";
  callerSay(reply);
}
callUserSays=hookable("callUserSays",callUserSays);
function hideSoftAlert(){ const el=$("csoft"); if(!el) return; clearTimeout(showSoftAlert.t); el.classList.remove("on"); el.hidden=true; }
function hideCallAlert(){ const a=$("calert"); a.classList.remove("on"); a.classList.remove("critical"); }
function showCallAlert(a){
  call.hold=true; clearTimeout(call.idle); stopListen(); callUI("hold");
  try{ speechSynthesis.cancel(); }catch(e){}
  const el=$("calert"); el.classList.toggle("critical",a.band==="critical");
  el.dataset.level=a.band==="warn"?"suspicious":"danger";
  $("ca-score").textContent="الخطر "+Math.round(a.r)+"%";
  $("ca-i").innerHTML=a.band==="warn"?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 6v8M12 18.5h.01"/></svg>':ICON.danger;
  const what=a.cat==="bank"?"بياناتك البنكية":a.cat==="money"?"أموالك":"بياناتك الشخصية";
  if(a.band==="critical"){ $("ca-t").textContent="أغلق المكالمة الآن"; $("ca-type").textContent="محتال يريد سرقة "+what; }
  else { $("ca-t").textContent=a.band==="danger"?"خطر احتيال":"انتبه"; $("ca-type").textContent=CALL_TYPE[a.k]||"كلام مريب في المكالمة"; }
  $("ca-act").textContent=CALL_ACT[a.band];
  const btns=$("ca-btns"); btns.innerHTML="";
  const mk=(cls,txt,fn)=>{ const b=document.createElement("button"); b.className="btn "+cls; b.textContent=txt; b.onclick=fn; btns.appendChild(b); };
  const resume=()=>{ hideCallAlert(); call.hold=false; callUI("listen"); if(!(callMode==="voice"&&listen())) waitForUser(); };
  if(a.band==="critical"){ mk("btn-gold","بلّغ",()=>{ current=a.res; callEnd("win"); sheet(true); }); mk("btn-ghost","تجاهل",resume); }
  else if(a.band==="danger"){ mk("btn-alert","أغلق المكالمة",()=>callEnd("win")); mk("btn-gold","بلّغ",()=>{ current=a.res; callEnd("win"); sheet(true); }); mk("btn-ghost","تجاهل",resume); }
  else { mk("btn-ghost","تجاهل",resume); mk("btn-ghost","وش أسأله؟",()=>{ $("ca-act").textContent="اسأله: «وش اسمك الكامل؟ ومن أي فرع؟» ثم قل له إنك بتتصل بالجهة بنفسك."; }); mk("btn-alert","أغلق",()=>callEnd("win")); }
  el.classList.remove("on"); void el.offsetWidth; el.classList.add("on");
  haptic(a.band==="critical"?[700,200,700,200,700,400,700,200,700]:VIB[a.band==="warn"?"suspicious":"danger"]);
  if(mode==="hearing"||mode==="touch") flash(a.band==="warn"?"suspicious":"danger");
  else { try{ say("تنبيه من فطن: "+$("ca-t").textContent+". "+$("ca-type").textContent+".",{role:"fatin",rate:1.02,voice:1,queue:true}); }catch(e){} }
}
showCallAlert=hookable("showCallAlert",showCallAlert);
$("ca-big").onclick=()=>callEnd("win");
function callEnd(how){
  if(!call) return; hideSoftAlert(); const k=call.k, risk=call.risk; callStop(false); callUI("idle"); $("cs-in").hidden=true; $("cs-mode").hidden=true;
  $("cs-state").textContent="انتهت المكالمة";
  const c=CALLS[k];
  const r=$("cs-result"); r.hidden=false;
  let t;
  if(how==="lose") t=["lose","أعطيت المحتال اللي يبيه","في الواقع كان بيسرق "+(k==="family"?"فلوسك":k==="nafath"?"دخولك لحساباتك الحكومية":"حسابك البنكي")+". تذكّر: لما فطن يقول «خطر»، أغلق فورًا."];
  else if(how==="declined") t=["win","رفضت المكالمة","رقم غريب ما تعرفه؟ رفضه تصرف آمن، ولو كان مهم بيرسل رسالة."];
  else if(!c.scam) t=["win","✓ مكالمة سليمة","فطن ما لقى أي طلب مريب، وما أزعجك بتنبيه."];
  else if(how==="survived") t=["win","صمدت! المحتال قفل بنفسه","طوّلت معه وما أعطيته شي، فيئس وقفل. هذا بالضبط اللي يخلّي المحتال يتركك. مؤشر الخطر وصل "+Math.round(risk)+"%."];
  else if(how==="win") t=["win","أحسنت! أغلقت قبل ما يوصل لك","مؤشر الخطر كان "+Math.round(risk)+"%. التصرف الصح دايمًا: أغلق واتصل بالجهة بنفسك."];
  else t=["win","أنهيت المكالمة","تصرف آمن. لو اتصل مرة ثانية، لا تعطه أي بيانات."];
  r.className="cs-result "+t[0]; r.innerHTML="<b></b><span></span>"; r.querySelector("b").textContent=t[1]; r.querySelector("span").textContent=t[2];
  const again=document.createElement("button"); again.className="btn btn-ghost"; again.style.marginTop="10px"; again.textContent="مكالمة ثانية"; again.onclick=()=>{ const ks=Object.keys(CALLS); callSet(ks[(ks.indexOf(k)+1)%ks.length]); }; r.appendChild(again);
  if(t[0]==="win"&&c.scam) burst($("callscr"),"var(--safe)");
  if(mode==="visual") speak(t[1]+". "+t[2]); else if(mode!=="simple"){ flash(t[0]==="win"?"safe":"danger"); if(mode==="touch") vibrate(t[0]==="win"?"safe":"danger"); }
}
callEnd=hookable("callEnd",callEnd);
$("cs-accept").onclick=async()=>{ callRingOff(); if(!call||call.ended) return;
  try{ const a=VOICE.el||(VOICE.el=new Audio()); a.setAttribute("playsinline",""); if(!VOICE.busy){ a.onended=null; a.onerror=null; a.onplaying=null; a.src=SILENT_WAV; const p=a.play(); p&&p.then&&p.then(()=>{ VOICE.unlocked=true; }).catch(()=>{}); } }catch(e){}
  $("cs-note").hidden=true;
  if(callMode==="voice"){ micOK=await ensureMic(); if(micOK!=="ok") micFallback(); }
  if(!call||call.ended) return;
  call.t0=Date.now(); $("cs-guard-t").textContent="فطن يسمع معك";
  $("cs-mode").hidden=true;
  call.timer=setInterval(()=>{ const s=Math.floor((Date.now()-call.t0)/1000); $("cs-state").textContent=String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0"); },500);
  callUI("listen"); call.next=setTimeout(()=>{ const c=CALLS[call.k]; callerSay(c.lines[call.i++]); },500); };
$("cs-decline").onclick=()=>{ callRingOff(); return callEnd("declined"); };
$("cs-end").onclick=()=>callEnd(call&&call.risk>=60?"win":"done");
$("cs-say").addEventListener("submit",e=>{ e.preventDefault(); callUserSays($("cs-text").value); });
$("cs-mic").onclick=()=>{ if(!call||call.ended) return; if(STT.active){ if(STT.stop) STT.stop(); return; } if(rec){ try{ rec.stop(); }catch(e){} return; } try{ speechSynthesis.cancel(); }catch(e){} $("callscr").classList.remove("talking"); clearTimeout(call.next);
  if(micOK!=="ok"){ ensureMic().then(r=>{ micOK=r; if(r==="ok") listen(true); else micFallback(); }); } else listen(true); };
document.querySelectorAll("#call-scen .chip").forEach(c=>c.onclick=()=>callSet(c.dataset.call));
(()=>{ const w=$("cs-wave"); for(let i=0;i<24;i++){ const s=document.createElement("i"); s.style.animationDelay=(i%6)*.12+"s"; w.appendChild(s);} })();
try{ speechSynthesis.onvoiceschanged=()=>{}; }catch(e){}
callSet("bank");

(function(){ const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&(navigator.maxTouchPoints||0)>1);
  const st=(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone;
  if(!ios||!st) return;
  const fix=()=>{ const portrait=innerHeight>=innerWidth; const sh=portrait?Math.max(screen.height,screen.width):Math.min(screen.height,screen.width);
    const gap=Math.round(sh-innerHeight); document.documentElement.style.setProperty("--ios-gap",(gap>8&&gap<90?gap:0)+"px"); };
  fix(); addEventListener("resize",fix); addEventListener("orientationchange",()=>setTimeout(fix,350));
})();

/* ---------- one tap: paste the copied message and check it ---------- */
$("paste-btn").onclick=async()=>{
  let t="";
  try{ if(navigator.clipboard&&navigator.clipboard.readText) t=(await navigator.clipboard.readText()||"").trim(); }catch(e){}
  if(t){ $("msg").value=t.slice(0,4000); run(); return; }
  $("msg").focus();
  $("ai-note").textContent=IS_IOS?"اضغط مطوّل داخل الخانة واختر «لصق»، بعدها «افحص الرسالة».":"ما لقيت نص منسوخ. انسخ الرسالة أول، أو اضغط مطوّل داخل الخانة واختر «لصق».";
};
/* ---------- Android: «Share → فطن» from any app opens here with the message ---------- */
(()=>{ try{
  const q=new URLSearchParams(location.search); if(!q.has("share")) return;
  const t=[q.get("title"),q.get("text"),q.get("url")].filter(Boolean).join("\n").trim().slice(0,4000);
  history.replaceState(null,"",location.pathname);
  if(!t) return;
  // after the start-up example is placed, put the shared message in its spot
  const go=()=>{ $("msg").value=t; if(profile&&store.get("fatin-onb")==="1"){ showTab("scan"); setTimeout(run,350); } };
  setTimeout(go,900);
}catch(e){} })();
/* ---------- chat practice: a notification first, then the messages app ---------- */
function notifDing(){ try{ const ctx=new (window.AudioContext||window.webkitAudioContext)(); ctx.resume&&ctx.resume(); const t=ctx.currentTime+.02;
  [[0,1319],[.12,1760]].forEach(([o,f])=>{ const os=ctx.createOscillator(), g=ctx.createGain(); os.type="sine"; os.frequency.value=f;
    g.gain.setValueAtTime(0,t+o); g.gain.linearRampToValueAtTime(.18,t+o+.01); g.gain.exponentialRampToValueAtTime(.001,t+o+.5); os.connect(g); g.connect(ctx.destination); os.start(t+o); os.stop(t+o+.55); });
  setTimeout(()=>{ try{ ctx.close(); }catch(e){} },1200); }catch(e){} try{ haptic([60,80,60]); }catch(e){} }
function chatStart(key){
  const c=CALLS[key], scr=$("callscr"), os=callOS();
  scr.dataset.os=os; scr.classList.add("chatv","lock"); scr.classList.remove("open");
  let lg="ar"; try{ lg=curLang(); }catch(e){}
  const now=new Date(), loc=lg==="ar"?"ar-SA-u-nu-arab":undefined;
  try{ $("cn-time").textContent=now.toLocaleTimeString(loc,{hour:"numeric",minute:"2-digit",hour12:false}).replace(/\s?[صم]$/,""); $("cn-date").textContent=now.toLocaleDateString(loc,{weekday:"long",day:"numeric",month:"long",calendar:"gregory"}); }catch(e){}
  $("cn-from").textContent=$("cn-name").textContent=c.name; $("cn-num").textContent=c.num;
  $("cn-prev").textContent=(c.lines&&c.lines[0])||"";
  const b=$("cn-banner"); b.classList.remove("in");
  try{ document.querySelector(".screen").scrollTop=0; }catch(e){}
  $("device").classList.add("call-full");
  clearTimeout(chatStart.t); chatStart.t=setTimeout(()=>{ b.classList.add("in"); notifDing(); },900);
}
$("cn-banner").onclick=()=>{ const scr=$("callscr"); if(!scr.classList.contains("lock")) return;
  scr.classList.remove("lock"); scr.classList.add("open"); try{ $("cs-accept").onclick(); }catch(e){}
  setTimeout(()=>{ try{ $("cs-text").focus({preventScroll:true}); }catch(e){} },700); };
$("cn-back").onclick=()=>{ if(call&&!call.ended) $("cs-end").click(); else { callExitFull(); $("v-call").classList.remove("started"); callStop(true); } };
hook("before","callExitFull",()=>{ clearTimeout(chatStart.t); $("callscr").classList.remove("chatv","lock","open"); });
/* ---------- call simulation: choose, start, full-screen ring for voice ---------- */
let callType=store.get("fatin-calltype")||"voice", ringStop=null;
function setCallType(t){ callType=t; store.set("fatin-calltype",t); document.querySelectorAll(".cst-type").forEach(b=>b.setAttribute("aria-checked",String(b.dataset.ct===t))); }
document.querySelectorAll(".cst-type").forEach(b=>b.onclick=()=>setCallType(b.dataset.ct));
setCallType(callType);
function callOS(){ const k=devKind(); return (k==="iphone"||k==="ipad"||k==="mac")?"ios":"android"; }
function ringtone(){
  let stop=false, ctx=null, iv=null; const os=callOS();
  try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){}
  const burst=()=>{ if(stop) return;
    if(ctx&&mode!=="hearing"&&mode!=="touch"){ const t0=ctx.currentTime;
      // a short marimba-like phrase on iPhone, a brighter chime on Android (both original, not the phones' own tones)
      const notes=os==="ios"?[[0,659],[.14,988],[.28,880],[.42,988],[.56,659],[.70,988],[.84,880],[.98,988]]:[[0,784],[.22,1047],[.44,1319],[.66,1047],[1.0,784],[1.22,1047],[1.44,1319]];
      notes.forEach(([o,f])=>{ const osc=ctx.createOscillator(), g=ctx.createGain(); osc.frequency.value=f; osc.type=os==="ios"?"sine":"triangle";
        g.gain.setValueAtTime(0,t0+o); g.gain.linearRampToValueAtTime(.16,t0+o+.01); g.gain.exponentialRampToValueAtTime(.0008,t0+o+(os==="ios"?.28:.36));
        osc.connect(g); g.connect(ctx.destination); osc.start(t0+o); osc.stop(t0+o+.4); }); }
    try{ navigator.vibrate&&navigator.vibrate([400,200,400]); }catch(e){} };
  burst(); iv=setInterval(burst,2600);
  return ()=>{ stop=true; clearInterval(iv); try{ navigator.vibrate&&navigator.vibrate(0); }catch(e){} try{ ctx&&ctx.close(); }catch(e){} };
}
function callRingOff(){ if(ringStop){ ringStop(); ringStop=null; } }
function callExitFull(){ callRingOff(); $("device").classList.remove("call-full"); delete $("callscr").dataset.os; }
callExitFull=hookable("callExitFull",callExitFull);
$("call-go").onclick=()=>{
  const k=(document.querySelector("#call-scen .chip.on")||{}).dataset; const key=(k&&k.call)||"bank";
  setCallMode(callType); callSet(key); $("v-call").classList.add("started");
  if(callType==="voice"){ try{ document.querySelector(".screen").scrollTop=0; }catch(e){} $("callscr").dataset.os=callOS(); $("device").classList.add("call-full"); ringStop=ringtone(); setTimeout(()=>{ try{ $("cs-accept").focus({preventScroll:true}); }catch(e){} },80); }
  else chatStart(key);
  try{ const c0=CALLS[key]; if(c0&&c0.lines&&c0.lines[0]&&!(callType==="chat")) voicePrefetch(c0.lines[0],"caller"); }catch(e){}
};
// scenario chips only pick the scenario now; the call starts with «ابدأ»
document.querySelectorAll("#call-scen .chip").forEach(c=>c.onclick=()=>{ document.querySelectorAll("#call-scen .chip").forEach(x=>x.classList.toggle("on",x===c)); });
hook("before","callEnd",()=>{ callRingOff(); });
hook("after","callEnd",()=>{ const r=$("cs-result"); if(r&&!r.hidden){ const again=r.querySelector("button"); if(again){ again.textContent="مكالمة ثانية"; again.onclick=()=>{ callExitFull(); $("v-call").classList.remove("started"); callStop(true); $("screen").scrollTo({top:0}); }; } } });
hook("before","callStop",()=>{ callRingOff(); });
hook("after","callStop",silent=>{ if(silent) $("device").classList.remove("call-full"); });

/* =====================================================================
   FATIN · feature pack: languages, sign-in & greeting, QR, More hub,
   Ask Fatin, protection report, family board + family password,
   badges & weekly challenge, "got scammed?" plan, classroom mode, elder mode
   ===================================================================== */

