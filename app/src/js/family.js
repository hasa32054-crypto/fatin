/* ---------- family board (alerts shared by family code) + family password ---------- */
const famCode=()=>S.get("famcode","");
function newCode(){ const A="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let c=""; const r=crypto.getRandomValues(new Uint32Array(6)); r.forEach(x=>c+=A[x%A.length]); return c; }
/* the phone that creates a family code also gets a random sender key: Fatin's server then takes alerts
   for that code from this phone only, while relatives keep watching with the code alone */
const famKey=()=>S.get("famkey","");
function newFamKey(){ const b=crypto.getRandomValues(new Uint8Array(24)); return btoa(String.fromCharCode(...b)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
async function famEnsureKey(code){   // a code made before sender keys existed gets one the first time it is used
  let k=famKey(); if(k) return k;
  k=newFamKey(); S.set("famkey",k);
  if(db&&db.claimFamily&&await db.claimFamily(code,k)===false){ S.set("famclaimfail",true); drawFamily(); }
  return k;
}
async function familyAlert(lvl,label){
  const code=famCode(); if(!db||!code||!S.get("famon",true)||S.get("famclaimfail",false)) return;
  const extra=db.remote?{key:await famEnsureKey(code)}:{};   // the key goes to Fatin's server only, never into a store relatives read
  if(S.get("famclaimfail",false)) return;
  try{ await db.collection("families/"+code+"/alerts").add({lvl,label:String(label).slice(0,90),who:(profile&&profile.n)||"",at:Date.now(),...extra}); }
  catch(e){ if(e&&e.code==="forbidden"){ S.set("famclaimfail",true); drawFamily(); } }
}
familyAlert=hookable("familyAlert",familyAlert);
let famUnsub=null;
function drawFamily(){
  const noDb=!db; $("fam-nodb").hidden=!noDb;
  const code=famCode(); $("fam-code").textContent=code||"—"; $("fam-make").textContent=code?"رمز جديد":"أنشئ رمز العائلة";
  $("fam-on").checked=S.get("famon",true);
  $("fam-claim-err").hidden=!(code&&S.get("famclaimfail",false));
  $("fam-secret").value=familySecret();
}
$("fam-make").onclick=async()=>{ const key=newFamKey(); let code=newCode();
  // register the new code with its sender key; in the rare case the code is taken, pick another
  for(let i=0;i<3&&db&&db.claimFamily&&await db.claimFamily(code,key)===false;i++) code=newCode();
  S.set("famcode",code); S.set("famkey",key); S.set("famclaimfail",false); drawFamily(); bump("famShield"); };
$("fam-on").onchange=e=>S.set("famon",e.target.checked);
$("fam-secret").addEventListener("change",e=>{ S.set("secret",e.target.value.trim().slice(0,30)); if(e.target.value.trim()) bump("famShield"); $("fam-secret-ok").textContent=e.target.value.trim()?"✓ حُفظت في جهازك فقط":""; });
$("fam-watch").onclick=()=>{
  const code=($("fam-in").value||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6), list=$("fam-list");
  if(code.length<6){ list.innerHTML=""; list.appendChild(el("p","hint","اكتب رمز العائلة المكوّن من 6 خانات.")); return; }
  if(!db){ list.innerHTML=""; list.appendChild(el("p","hint","لوحة الأسرة تحتاج اتصال بخادم فطن، وما هو متاح الحين.")); return; }
  if(famUnsub) famUnsub();
  list.innerHTML=""; list.appendChild(el("p","hint","أتابع تنبيهات العائلة "+code+"…"));
  famUnsub=db.collection("families/"+code+"/alerts").orderBy("at","desc").limit(30).onSnapshot(snap=>{
    list.innerHTML="";
    if(snap.empty){ list.appendChild(el("p","r-empty","ما فيه تنبيهات للحين. لما قريبك يواجه رسالة أو مكالمة خطيرة، تظهر هنا مباشرة.")); return; }
    snap.docs.forEach(doc=>{ const x=doc.data()||{}; const row=el("div","fa "+(x.lvl==="critical"?"crit":x.lvl==="danger"?"dan":x.lvl==="good"?"good":"war"));
      const tm=new Date(+x.at||0); const clean=s=>String(s).replace(/[\u0000-\u001F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF<>]/g,""); if(x.lvl==="progress"){ if(!list.querySelector(".fa-sum")){ const sm=el("div","fa-sum"); sm.appendChild(el("span","","تقدّم "+clean(x.who||"قريبك").slice(0,30))); sm.appendChild(el("b","",clean(x.label||"").slice(0,90))); list.insertBefore(sm,list.firstChild); } return; }
      row.appendChild(el("b","",clean(x.who||"قريبك").slice(0,30)+": "+clean(x.label||"").slice(0,90)));
      row.appendChild(el("small","",tm.toLocaleString((()=>{ try{ return LANGS[lang].tts; }catch(e){ return "ar-SA"; } })(),{weekday:"short",hour:"2-digit",minute:"2-digit"}))); list.appendChild(row); });
    if(snap.docChanges().some(c=>c.type==="added")&&!snap.metadata.fromCache){ haptic([200,100,200]); }
  },()=>{ list.innerHTML=""; list.appendChild(el("p","hint","تعذّر فتح اللوحة الآن.")); });
};

