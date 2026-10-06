/* ---------- community radar (patterns only, never message text) ---------- */
const PAT_LABEL={shipaddr:"تأكيد عنوان الشحنة",otp:"طلب رمز التحقق",card:"طلب بيانات البطاقة",ship:"رسوم شحن وهمية",newnum:"«رقمي الجديد»",prize:"جائزة وهمية",invest:"استثمار أو وظيفة وهمية",suspend:"تهديد بإيقاف الحساب",update:"تحديث بيانات عبر رابط",money:"طلب تحويل مبلغ",short:"رابط مختصر مشبوه",badlink:"رابط غير موثوق",ip:"رابط برقم IP"};
const PAT_ORDER=["imp","shipaddr","otp","card","ship","newnum","prize","invest","suspend","update","money","short","badlink","ip"];
function patternOf(res){
  if(!res||res.level==="safe"||res.level==="empty") return null;
  const ids=res.ids||[]; const k=PAT_ORDER.find(x=>ids.includes(x)); if(!k) return null;
  if(k==="imp"){ const b=(res.brands||[])[0]||"جهة رسمية"; return {p:"imp:"+b,l:"انتحال «"+b+"»"}; }
  return {p:k,l:PAT_LABEL[k]};
}
function plural(n){ return n===1?"بلاغ واحد":n===2?"بلاغين":n<=10?n+" بلاغات":n+" بلاغًا"; }
let db=null, radarMap={};
function radarLine(){
  const el=$("radar-line"); const pt=patternOf(current);
  const x=pt&&radarMap[pt.p];
  if(!db||!x){ el.hidden=true; return; }
  el.textContent="رادار فطن: هذا النمط وصله "+plural(x.n)+" هذا الأسبوع."; el.hidden=false;
}
function drawRadar(){
  const box=$("radar-list"); if(!box) return; box.innerHTML="";
  const rows=Object.values(radarMap).sort((a,b)=>b.n-a.n).slice(0,6);
  if(!rows.length){ const e=document.createElement("p"); e.className="r-empty"; e.textContent="ما فيه بلاغات هذا الأسبوع. لما تبلّغ عن رسالة احتيال من شاشة «افحص»، يظهر نمطها هنا عشان يحمي غيرك."; box.appendChild(e); return; }
  const max=rows[0].n;
  rows.forEach(r=>{ const d=document.createElement("div"); d.className="rrow"; d.innerHTML='<b></b><em></em><div class="t"><i></i></div>'; d.querySelector("b").textContent=r.l; d.querySelector("em").textContent=r.n; d.querySelector("i").style.width=Math.max(6,100*r.n/max)+"%"; box.appendChild(d); });
}
async function initRadar(){
  try{
    let d=null; if(window.claude&&claude.use) d=await claude.use("db");
    if(!d){ await fatinConfig; if(FATIN.server) d=makeRemoteDB(); }
    if(!d) return;
    db=d; $("radar-sec").hidden=false; drawRadar();
    const since=Date.now()-7*864e5;
    db.collection("reports").where("at",">=",since).limit(1000).onSnapshot(snap=>{
      const m={};
      const okBrands=new Set(FatinEngine.brandNames()), now=Date.now()+6e4;
      snap.docs.forEach(doc=>{ const x=doc.data(); if(!x||typeof x.p!=="string"||!(+x.at<=now)) return; // shared data is untrusted: accept only known pattern keys and build the label here
        const p=x.p; let l=null;
        if(p.startsWith("imp:")){ const b=p.slice(4); if(okBrands.has(b)) l="انتحال «"+b+"»"; } else if(PAT_ORDER.includes(p)) l=PAT_LABEL[p];
        const c=x.n==null?1:Math.max(0,Math.min(1e5,Math.floor(+x.n)||0)); // one report per doc, or a server count
        if(!l||!c) return; (m[p]=m[p]||{n:0,l}).n+=c; });
      radarMap=m; drawRadar(); radarLine();
    },()=>{ db=null; $("radar-sec").hidden=true; $("radar-box").hidden=true; $("radar-line").hidden=true; });
  }catch(e){}
}
$("radar-add").onclick=async()=>{
  const pt=patternOf(current), msg=$("radar-msg");
  if(!db){ msg.textContent="الرادار غير متاح في هذا العرض."; return; }
  if(!pt){ msg.textContent="ما لقيت نمط احتيال واضح نسجّله."; return; }
  $("radar-add").disabled=true; msg.textContent="أسجّل النمط…";
  try{ await db.collection("reports").add({p:pt.p,l:pt.l,at:Date.now()}); msg.textContent="✓ أضفنا «"+pt.l+"» لرادار فطن. فزعتك تحمي غيرك."; }
  catch(e){ msg.textContent = e&&e.code==="invalid_argument" ? "التبليغ للرادار متاح لأصحاب صلاحية المساهمة. في نسخة المتاجر يقدر يبلّغ الجميع." : "تعذّر التسجيل الآن. جرّب بعد شوي."; }
  finally{ setTimeout(()=>{$("radar-add").disabled=false;},1500); }
};

