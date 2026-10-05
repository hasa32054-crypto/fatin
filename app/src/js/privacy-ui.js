/* ---------- privacy controls: the two switches in Settings and the privacy sheet ---------- */
let privOpener=null;
function openPrivacy(){ privOpener=document.activeElement; $("priv-sheet").classList.add("on"); $("priv-scrim").classList.add("on"); setTimeout(()=>{ try{ $("priv-done").focus({preventScroll:true}); $("priv-sheet").scrollTop=0; }catch(e){} },60); }
function closePrivacy(){ $("priv-sheet").classList.remove("on"); $("priv-scrim").classList.remove("on"); if(privOpener&&privOpener.focus) setTimeout(()=>privOpener.focus(),60); }
function privacySync(){
  $("cloud-ai").checked=PRIVACY.cloudAI(); $("cloud-voice").checked=PRIVACY.cloudVoice();
  // reading a photo needs the AI: its button only shows when the AI is on and available
  $("photo-wrap").hidden=!(sample&&PRIVACY.cloudAI()&&photoOK);
}
let photoOK=false;   // set at start-up when the AI can read images
$("cloud-ai").addEventListener("change",e=>{ S.set("cloud-ai",e.target.checked); privacySync(); });
$("cloud-voice").addEventListener("change",e=>{ S.set("cloud-voice",e.target.checked); VOICE.cloud=e.target.checked?null:VOICE.cloud; privacySync(); });
$("priv-open").onclick=openPrivacy; $("priv-why").onclick=openPrivacy;
$("priv-done").onclick=closePrivacy; $("priv-scrim").onclick=closePrivacy;
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&$("priv-sheet").classList.contains("on")){ e.stopImmediatePropagation(); closePrivacy(); } },true);
try{ const mo=new MutationObserver(syncSheets); mo.observe($("priv-sheet"),{attributes:true,attributeFilter:["class"]}); syncSheets(); }catch(e){}
privacySync();
