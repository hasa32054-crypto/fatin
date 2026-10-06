/* ---------- one voice for all of Fatin: a natural AI voice from the Fatin server when it is set up, otherwise the best voice on the device ---------- */
const VOICE={cloud:null,el:null,cache:new Map(),seq:0,unlocked:false,busy:false,next:null};
const CLOUD_LANGS=/^(ar|en|hi|tl|id|fr|es|zh)$/;
function voiceLang(){ try{ return lang||"ar"; }catch(e){ return "ar"; } }
const _ssCancel=(()=>{ try{ return speechSynthesis.cancel.bind(speechSynthesis); }catch(e){ return ()=>{}; } })();
function cloudStop(){ VOICE.seq++; VOICE.busy=false; VOICE.next=null; const a=VOICE.el; if(a){ try{ a.onended=null; a.onerror=null; a.onplaying=null; a.pause(); }catch(e){} } }
try{ speechSynthesis.cancel=function(){ cloudStop(); _ssCancel(); }; }catch(e){}
/* iPhone only plays sound that starts from a tap: the first tap anywhere opens both voices */
const SILENT_WAV="data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA";
function audioPlayback(){ try{ if(navigator.audioSession) navigator.audioSession.type="playback"; }catch(e){} }   // loud speaker, even after the mic was used
function voiceUnlock(){ if(VOICE.unlocked||VOICE.unlocking) return; VOICE.unlocking=true;
  try{ const a=VOICE.el||(VOICE.el=new Audio()); a.setAttribute("playsinline",""); a.muted=false;
    if(!VOICE.busy){ a.onended=null; a.onerror=null; a.onplaying=null; a.src=SILENT_WAV; const p=a.play(); if(p&&p.then) p.then(()=>{ VOICE.unlocked=true; VOICE.unlocking=false; }).catch(()=>{ VOICE.unlocking=false; }); else { VOICE.unlocked=true; VOICE.unlocking=false; } }
    else VOICE.unlocking=false; }catch(e){ VOICE.unlocking=false; }
  // wake the phone's own voice silently (an empty line), and not at all while the AI voice is in use
  try{ if(!VOICE.ssOK&&VOICE.cloud!==true&&!VOICE.busy){ VOICE.ssOK=true; const u=new SpeechSynthesisUtterance(""); u.volume=0; speechSynthesis.speak(u); } }catch(e){} }
["touchend","click","keydown"].forEach(t=>addEventListener(t,voiceUnlock,{capture:true,passive:true}));
async function cloudOK(){ if(!PRIVACY.cloudVoice()) return false; if(VOICE.cloud!==null) return VOICE.cloud; try{ await fatinConfig; }catch(e){}
  if(!FATIN.server||!navigator.onLine) return false;
  try{ const r=await fetch(FATIN.server+"/tts",{cache:"no-store"}); const j=await r.json(); VOICE.cloud=!!(j&&j.ok); if(j&&Array.isArray(j.langs)&&j.langs.length) VOICE.langs=j.langs; }catch(e){ VOICE.cloud=false; }
  return VOICE.cloud; }
/* only the training scripts' own lines may be cached by the server; AI replies, names and results never are */
function scriptedLine(text){
  let lg="ar"; try{ lg=curLang(); }catch(e){} if(!scriptedLine.sets) scriptedLine.sets={};
  let set=scriptedLine.sets[lg];
  if(!set){ set=scriptedLine.sets[lg]=new Set(); const walk=o=>{ if(typeof o==="string") set.add(o.replace(/\s+/g," ").trim()); else if(o&&typeof o==="object") Object.values(o).forEach(walk); };
    try{ walk(SCEN); walk(CALLS); walk(DEFLECT); const X=TRX(); if(X) walk(X); }catch(e){} }
  return set.has(String(text).replace(/\s+/g," ").trim());
}
async function cloudAudio(text,role,emotion){ if(!PRIVACY.cloudVoice()||PRIVACY.find(text).length) return null;   // a line with a code or card number is spoken by the phone itself
  const k=role+"|"+voiceLang()+"|"+(emotion||"")+"|"+text; if(VOICE.cache.has(k)) return VOICE.cache.get(k);
  if(VOICE.pending&&VOICE.pending[k]) return VOICE.pending[k];
  VOICE.pending=VOICE.pending||{};
  const job=(async()=>{
  for(let attempt=0;attempt<2;attempt++){
  const ctl=new AbortController(), to=setTimeout(()=>ctl.abort(),CONFIG.TTS_TIMEOUT_MS);
  try{ const r=await fetch(FATIN.server+"/tts",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({text,role,lang:voiceLang(),emotion:emotion||undefined,cache:scriptedLine(text)||undefined}),signal:ctl.signal});
    if(!r.ok){ if(r.status===503){ VOICE.cloud=false; return null; } if(attempt||r.status===400||r.status===403) return null; await new Promise(z=>setTimeout(z,500)); continue; }   // only "no voice set up" turns it off; anything else falls back for this line only
    const b=await r.blob(); if(!b.size) return null; const u=URL.createObjectURL(b);
    if(VOICE.cache.size>60){ const f=VOICE.cache.keys().next().value; URL.revokeObjectURL(VOICE.cache.get(f)); VOICE.cache.delete(f); }
    VOICE.cache.set(k,u); return u; }
  catch(e){ if(attempt||(e&&e.name==="AbortError")) return null; } finally{ clearTimeout(to); }
  }
  return null; })();
  VOICE.pending[k]=job; try{ return await job; } finally{ delete VOICE.pending[k]; } }
/* get the caller's next line ready while he's still talking, so it starts at once */
function voicePrefetch(text,role){ try{ if(!text||VOICE.cloud===false) return; cloudOK().then(ok=>{ if(ok&&(!VOICE.langs||VOICE.langs.includes(voiceLang()))) cloudAudio(text,role||"caller").catch(()=>{}); }); }catch(e){} }
/* say(text,{role:"caller"|"fatin",rate,pitch,voice,onend}) */
function say(text,opt={}){
  // queue:true waits for the line being spoken (Fatin's warning after the caller's sentence)
  if(opt.queue&&VOICE.busy){ VOICE.next=()=>say(text,{...opt,queue:false}); return; }
  const done=()=>{ if(my!==VOICE.seq) return; VOICE.busy=false; const f=opt.onend; opt.onend=null; f&&f(); const n=VOICE.next; VOICE.next=null; n&&n(); };
  cloudStop(); _ssCancel(); const my=VOICE.seq; VOICE.busy=true;
  const local=()=>{ if(my!==VOICE.seq) return; audioPlayback(); try{ if(!("speechSynthesis" in window)) return done(); const u=utter(text,opt); u.onend=done; u.onerror=done; speechSynthesis.speak(u); }catch(e){ done(); } };
  cloudOK().then(ok=>{ if(my!==VOICE.seq) return; if(!ok) return local();
    if(VOICE.langs?!VOICE.langs.includes(voiceLang()):!CLOUD_LANGS.test(voiceLang())) return local();
    cloudAudio(text,opt.role||"fatin",opt.emotion).then(src=>{ if(my!==VOICE.seq) return; if(!src) return (opt.role==="caller"&&VOICE.cloud)?done():local();
      const a=VOICE.el||(VOICE.el=new Audio()); a.setAttribute("playsinline",""); audioPlayback();
      // one voice at a time: once the AI voice has started, a hiccup ends the line instead of handing it to the phone's voice
      let started=false; a.onplaying=()=>{ started=true; };
      const finish=()=>{ a.onended=null; a.onerror=null; a.onplaying=null; done(); };
      a.onended=finish; a.onerror=()=>{ a.onerror=null; a.onended=null; if(started||VOICE.cloud) finish(); else local(); }; a.src=src;
      const sp=parseFloat(($("rate")||{}).value)||1.1; a.playbackRate=Math.max(.8,Math.min(1.4,(sp/1.1)*(opt.rate||1)));
      try{ a.preservesPitch=true; a.webkitPreservesPitch=true; }catch(e){}
      const p=a.play(); p&&p.catch(err=>{ if(my!==VOICE.seq) return; a.onended=null; a.onerror=null; if(started) return finish(); if(err&&err.name==="AbortError") return; if(VOICE.cloud&&opt.role==="caller") return finish(); local(); }); }); });
}
function speak(text){ say(text,{role:"fatin"}); }
speak=hookable("speak",speak);
function flash(level){
  const f=$("flash"); f.dataset.level=level; $("flash-t").textContent=LEVELS[level].flash;
  f.classList.remove("on"); void f.offsetWidth; f.classList.add("on");
  if(mode!=="touch") vibrate(level);
  setTimeout(()=>f.classList.remove("on"),level==="safe"?1100:2000);
}
const VIB={safe:[600],suspicious:[300,200,300],danger:[700,200,700,200,700]};
const HAS_VIBE=typeof navigator.vibrate==="function";
const hapticEl=(()=>{ try{ const l=document.createElement("label"); l.setAttribute("aria-hidden","true"); l.style.cssText="position:fixed;left:-20px;top:0;width:1px;height:1px;opacity:0;overflow:hidden;pointer-events:none";
  const i=document.createElement("input"); i.type="checkbox"; i.setAttribute("switch",""); i.tabIndex=-1; l.appendChild(i); document.body.appendChild(l); return l; }catch(e){ return null; } })();
function haptic(pattern){
  try{ if(HAS_VIBE&&navigator.vibrate(pattern)) return true; }catch(e){}
  if(!hapticEl) return false;
  let t=0; pattern.forEach((ms,i)=>{ if(i%2===0){ const n=Math.max(1,Math.min(8,Math.round(ms/110))); for(let k=0;k<n;k++) setTimeout(()=>{ try{ hapticEl.click(); }catch(e){} },t+k*110); } t+=ms; });
  return false;
}
function vibrate(level){ return haptic(VIB[level]); }
function respond(res){ vibrate(res.level); if(mode==="touch"||mode==="hearing") flash(res.level); else speak(speechText(res)); }
respond=hookable("respond",respond);

