/* ---------- outside Claude: a free Fatin server (config.json) or the user's own key ---------- */
const FATIN={server:"",inClaude:false,model:CONFIG.OWN_KEY_MODEL};
const fatinConfig=(async()=>{ try{ const r=await fetch("config.json",{cache:"no-store"}); if(r.ok){ const c=await r.json(); if(c&&typeof c.server==="string"&&(/^https:\/\/[a-z0-9.-]+(\/[\w.-]*)*$/i.test(c.server.trim())||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(c.server.trim()))) FATIN.server=c.server.trim().replace(/\/$/,""); } }catch(e){} })();
// an AI key typed on this phone is kept for this session only (sessionStorage), never saved permanently
function ownKey(){ try{ return sessionStorage.getItem("fatin-ai-key")||""; }catch(e){ return ""; } }
function fileToB64(f){ return new Promise((ok,no)=>{ const r=new FileReader(); r.onload=()=>ok(String(r.result).split(",")[1]||""); r.onerror=no; r.readAsDataURL(f); }); }
function mergeTurns(ms){ const out=[]; ms.forEach(m=>{ const last=out[out.length-1]; if(last&&last.role===m.role&&typeof last.content==="string"&&typeof m.content==="string") last.content+="\n\n"+m.content; else out.push({role:m.role,content:m.content}); }); if(out.length&&out[0].role!=="user") out.unshift({role:"user",content:"."}); return out; }
/* the Fatin server writes the prompt itself: the app sends only the task and its data */
async function serverTask(task){
  const r=await fetch(FATIN.server+"/ai",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(task)});
  if(r.status===429) throw {code:"rate_limited"}; if(!r.ok) throw {code:"unavailable"};
  const j=await r.json(); return String(j.text||"");
}
async function apiCall(messages,maxTokens){
  const k=ownKey(); if(!k) throw {code:"not_granted"};
  const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"x-api-key":k,"anthropic-version":"2023-06-01","content-type":"application/json","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:FATIN.model,max_tokens:maxTokens,messages})});
  if(r.status===401||r.status===403) throw {code:"bad_key"}; if(r.status===429) throw {code:"rate_limited"}; if(!r.ok) throw {code:"unavailable"};
  const j=await r.json(); return (j.content||[]).filter(c=>c.type==="text").map(c=>c.text).join("");
}
function makeRemoteSample(){
  const toMsgs=async(input,opts)=>{ let ms=typeof input==="string"?[{role:"user",content:input}]:input.map(m=>({role:m.role,content:String(m.content)}));
    ms=mergeTurns(ms);
    if(opts&&opts.images){ const fs=Array.isArray(opts.images)?opts.images:[opts.images]; const last=ms[ms.length-1]; const blocks=[];
      for(const f of fs) blocks.push({type:"image",source:{type:"base64",media_type:f.type||"image/png",data:await fileToB64(f)}});
      blocks.push({type:"text",text:String(last.content)}); last.content=blocks; }
    return ms; };
  // opts.task: what the server needs to write this prompt itself (used whenever a Fatin server is set)
  const viaServer=async(opts)=>{ const task=Object.assign({},opts.task);
    if(task.task==="ocr"){ const f=Array.isArray(opts.images)?opts.images[0]:opts.images; task.image={media_type:f.type||"image/png",data:await fileToB64(f)}; }
    return serverTask(task); };
  const s=async(input,opts={})=>({text:FATIN.server&&opts.task?await viaServer(opts):await apiCall(await toMsgs(input,opts),700),truncated:false});
  s.json=async(input,opts={})=>{ const inp=typeof input==="string"?input+"\n\nأعد JSON صالحًا فقط، بدون أي نص قبله أو بعده.":input;
    const t=FATIN.server&&opts.task?await viaServer(opts):await apiCall(await toMsgs(inp,opts),700); const m=t.match(/\{[\s\S]*\}/); if(!m) throw {code:"bad_json"}; return JSON.parse(m[0]); };
  s.limits=async()=>({images:{mediaTypes:["image/png","image/jpeg","image/webp","image/gif"]}});
  s.remote=true; return s;
}
function remoteSampleIfAny(){ return (FATIN.server||ownKey())?makeRemoteSample():null; }
// the task data travels only to Fatin's own server, never to the in-Claude sampler
function aiOpts(opts,task){ return sample&&sample.remote?Object.assign({},opts,{task}):opts; }
function makeRemoteDB(){
  const kicks={}; // a new report shows at once instead of on the next poll
  const poll=(url,pick,cb,every)=>{ let stop=false, t=null; const tick=async()=>{ clearTimeout(t); if(stop) return; if(document.hidden){ t=setTimeout(tick,every); return; } try{ const r=await fetch(url,{cache:"no-store"}); if(r.ok){ const j=await r.json(); const docs=(pick(j)||[]).map((x,i)=>({id:String(i),exists:true,data:()=>x}));
        cb({docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:{fromCache:false,hasPendingWrites:false}}); } }catch(e){} if(!stop){ clearTimeout(t); t=setTimeout(tick,every); } }; kicks[url]=tick; tick(); return ()=>{ stop=true; clearTimeout(t); if(kicks[url]===tick) delete kicks[url]; }; };
  // the radar arrives as counts per pattern ({p, n}); family alerts as a short list
  const radarDocs=j=>j.counts?Object.entries(j.counts).map(([p,n])=>({p,n,at:+j.at||Date.now()})):j.reports;
  const col=path=>{ const fam=path.match(/^families\/([A-Z0-9]{6})\/alerts$/), ep=path==="reports"?"/radar":fam?"/family/"+fam[1]:null;
    const q={where(){return q},orderBy(){return q},limit(){return q},
      onSnapshot(cb){ if(!ep) return ()=>{}; return path==="reports"?poll(FATIN.server+ep,radarDocs,cb,CONFIG.RADAR_POLL_MS):poll(FATIN.server+ep,j=>j.alerts,cb,CONFIG.FAMILY_POLL_MS); },
      async add(data){ if(!ep) throw {code:"invalid_argument"}; const r=await fetch(FATIN.server+ep,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(data)}); if(!r.ok) throw {code:r.status===403?"forbidden":r.status===429?"rate_limited":"unavailable"}; const k=kicks[FATIN.server+ep]; if(k) setTimeout(k,300); return {id:""}; }};
    return q; };
  // true: this phone owns the code; false: another phone does; null: could not reach the server (tried again on the next alert)
  const claimFamily=async(code,key)=>{ try{ const r=await fetch(FATIN.server+"/family/"+code+"/claim",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({key})}); return r.status===409?false:r.ok?true:null; }catch(e){ return null; } };
  return {collection:col,remote:true,claimFamily};
}
function aiFieldSync(){ const f=document.getElementById("ai-field"); if(!f) return; f.hidden=FATIN.inClaude||!!FATIN.server; const st=document.getElementById("ai-status"); if(st) st.textContent=ownKey()?"✓ فيه مفتاح لهذي الجلسة.":""; }

