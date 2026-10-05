/* ---------- QR scanning ---------- */
/* third-party scripts are served by Fatin itself (app/vendor, see tools/vendor.mjs) and loaded only when a feature needs them */
const vendorP={};
function loadVendor(file,global){ if(window[global]) return Promise.resolve(window[global]);
  return vendorP[file]||(vendorP[file]=new Promise((res,rej)=>{ const sc=document.createElement("script"); sc.src="vendor/"+file;
    sc.onload=()=>window[global]?res(window[global]):rej(new Error(file)); sc.onerror=()=>{ delete vendorP[file]; rej(new Error(file)); }; document.head.appendChild(sc); })); }
function loadJsQR(){ return loadVendor("jsQR.min.js","jsQR"); }
async function decodeQR(file){
  const bmp=await createImageBitmap(file);
  if("BarcodeDetector" in window){ try{ const d=new BarcodeDetector({formats:["qr_code"]}); const r=await d.detect(bmp); if(r&&r[0]&&r[0].rawValue) return r[0].rawValue; }catch(e){} }
  const qr=await loadJsQR();
  const scale=Math.min(1,1400/Math.max(bmp.width,bmp.height)); const w=Math.round(bmp.width*scale), h=Math.round(bmp.height*scale);
  const cv=document.createElement("canvas"); cv.width=w; cv.height=h; const cx=cv.getContext("2d"); cx.drawImage(bmp,0,0,w,h);
  const img=cx.getImageData(0,0,w,h); const code=qr(img.data,w,h,{inversionAttempts:"attemptBoth"}); return code?code.data:null;
}
$("qr-file").addEventListener("change",async e=>{
  const f=e.target.files&&e.target.files[0]; e.target.value=""; if(!f) return;
  showQR({loading:true});
  let data=null; try{ data=await decodeQR(f); }catch(err){ data=null; }
  if(!data){ showQR({none:true}); return; }
  const res=qrAnalyze(data); bump("qr");
  showQR({data,res});
});
/* a QR that leads to a payment page on an unofficial site is treated as danger */
function qrAnalyze(data){
  const res=FatinEngine.analyze(data);
  if(res.sus){
    if(/pay|payment|parking|park|checkout|bill|fine|mawaqif|wallet|سداد|دفع|موقف/i.test(data)){ res.score=Math.max(res.score,80); res.level="danger"; res.ids=[...(res.ids||[]),"qrpay"]; res.reasons=["باركود يوديك لصفحة دفع في موقع غير رسمي. ادفع من التطبيق الرسمي فقط.",...res.reasons].slice(0,5); }
    else if(res.level==="safe"){ res.score=Math.max(res.score,30); res.level="suspicious"; }
  }
  return res;
}
R.en.qrpay="This QR leads to a payment page on an unofficial site. Pay only in the official app."; R.ur.qrpay="یہ کیو آر غیر سرکاری سائٹ کے ادائیگی صفحے پر لے جاتا ہے۔ صرف سرکاری ایپ سے ادائیگی کریں۔"; R.tl.qrpay="Dadalhin ka ng QR na ito sa bayaran sa hindi opisyal na site. Magbayad lang sa opisyal na app.";
function showQR(o){
  const m=$("qrm"), card=$("qrm-card"); m.hidden=false; requestAnimationFrame(()=>m.classList.add("on"));
  card.dataset.level=o.res?o.res.level:"none";
  $("qrm-i").innerHTML=o.res?(o.res.level==="safe"?ICON.safe:o.res.level==="danger"?ICON.danger:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 6v8M12 18.5h.01"/></svg>'):'<span class="dot"></span>';
  const title=$("qrm-t"), sub=$("qrm-sub"), url=$("qrm-url"), ul=$("qrm-why"), acts=$("qrm-acts");
  ul.innerHTML=""; acts.innerHTML=""; url.textContent=""; $("qrm-own").hidden=true;
  const close=el("button","btn btn-ghost",t("qr_close")||"إغلاق"); close.onclick=hideQR;
  if(o.loading){ title.textContent="فطن يقرأ الباركود…"; sub.textContent=""; return; }
  if(o.none){ title.textContent=t("qr_none")||"ما لقيت باركود في الصورة. صوّره أوضح وقريب."; sub.textContent=""; acts.appendChild(close); return; }
  const lv=o.res.level;
  title.textContent=lv==="danger"?(t("qr_title_d")||"خطر: أغلق الرابط"):lv==="suspicious"?(t("qr_title_s")||"رابط مشبوه: لا تدفع منه"):(t("qr_title_ok")||"يبدو آمنًا");
  sub.textContent=t("qr_sub")||"اللي داخل الباركود:"; url.textContent=o.data.slice(0,300);
  const reasons=lang==="ar"?o.res.reasons:[...new Set(o.res.ids||[])].map(i=>((R[lang]||R.en)[i]||R.en[i])).filter(Boolean);
  reasons.slice(0,3).forEach(r=>ul.appendChild(el("li","",r)));
  if(o.res.sus){ const host=o.res.sus.host.split("."); let n=2; if(host.length>=3&&/^(com|gov|edu|net|org|med|sch)$/.test(host[host.length-2])&&host[host.length-1].length===2) n=3; $("qrm-own-v").textContent=host.slice(-n).join("."); $("qrm-own").hidden=false; }
  if(lv==="safe"&&/^https?:\/\//i.test(o.data)){ // no one-tap open: a scam link the rules missed must not be one tap away
    let host=""; try{ host=new URL(o.data).hostname.replace(/^www\./,""); }catch(e){}
    ul.appendChild(el("li","",(lang==="ar"?"الموقع: ":"Site: ")+(host||"—")+(lang==="ar"?". لا تفتحه من الباركود: افتح التطبيق الرسمي أو اكتب عنوان الموقع الرسمي بنفسك.":". Don't open it from the QR code: open the official app, or type the official website address yourself.")));
    close.className="btn btn-main"; close.textContent="تمام"; }
  else { close.className="btn btn-alert"; close.textContent=t("qr_close")||"أغلق الرابط"; }
  acts.prepend(close);
  if(lv!=="safe"){ const rp=el("button","btn btn-gold","بلّغ"); rp.onclick=()=>{ current=o.res; hideQR(); sheet(true); }; acts.appendChild(rp); }
  vibrate(lv); if(mode==="hearing"||mode==="touch") flash(lv); else if(mode!=="general") speak((lang==="ar"?"فطن: ":"")+title.textContent+". "+(reasons[0]||""));
}
function hideQR(){ const m=$("qrm"); m.classList.remove("on"); setTimeout(()=>{ m.hidden=true; },300); try{ speechSynthesis.cancel(); }catch(e){} }
$("qrm").addEventListener("click",e=>{ if(e.target.id==="qrm") hideQR(); });

