/* installable app: offline cache + an "add to home screen" button where the browser offers one */
if("serviceWorker" in navigator){ addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{})); }
let fatinInstall=null;
addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); fatinInstall=e; const b=document.getElementById("pwa-install"); if(b) b.hidden=false; });
document.addEventListener("DOMContentLoaded",()=>{
  const b=document.createElement("button"); b.id="pwa-install"; b.hidden=true; b.textContent="📲 ثبّت فطن على جوالك";
  b.style.cssText="position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:9999;border:none;border-radius:999px;padding:12px 20px;font:700 15px Alexandria,sans-serif;background:#E0BC5E;color:#03130D;box-shadow:0 10px 30px rgba(0,0,0,.5);cursor:pointer";
  b.onclick=async()=>{ if(!fatinInstall) return; fatinInstall.prompt(); await fatinInstall.userChoice; fatinInstall=null; b.hidden=true; };
  document.body.appendChild(b);
  const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone;
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  if(ios&&!standalone&&!localStorage.getItem("fatin-ios-hint")){
    const t=document.createElement("div"); t.id="ios-hint"; t.style.cssText="position:fixed;left:12px;right:12px;bottom:calc(172px + env(safe-area-inset-bottom,0px));z-index:9999;background:#0F3B2A;color:#EFF7F2;border:1px solid #E0BC5E;border-radius:18px;padding:12px 14px;font:500 14px 'IBM Plex Sans Arabic',sans-serif;direction:rtl;box-shadow:0 10px 30px rgba(0,0,0,.5)";
    t.innerHTML='<b style="color:#F4DA94">ثبّت فطن كتطبيق:</b> اضغط زر المشاركة <span aria-hidden="true">⬆️</span> تحت، ثم «إضافة إلى الشاشة الرئيسية».<br><button style="margin-top:8px;border:none;background:#E0BC5E;color:#03130D;border-radius:10px;padding:6px 14px;font-weight:700">تمام</button>';
    t.querySelector("button").onclick=()=>{ localStorage.setItem("fatin-ios-hint","1"); t.remove(); };
    const busy=()=>["login","onb","qs","tour","tour-end","panic"].some(id=>{ const e=document.getElementById(id); return e&&!e.hidden; });
    const place=()=>{ if(!document.getElementById("ios-hint")) return; t.style.display=busy()?"none":"block"; };
    t.style.display="none"; document.body.appendChild(t); place();
    // shown again whenever one of those screens opens or closes (no polling)
    try{ const mo=new MutationObserver(place); ["login","onb","qs","tour","tour-end","panic"].forEach(id=>{ const e=document.getElementById(id); if(e) mo.observe(e,{attributes:true,attributeFilter:["hidden"]}); }); }catch(e){}
  }
});
