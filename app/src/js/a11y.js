/* Dialogs for keyboard and screen-reader users: when one opens, focus moves into it; Tab stays inside it;
   Escape closes the ones that had no keyboard way out; when it closes, focus goes back where it was. */
const DIALOGS=[ // topmost first
  ["tour-end"],["share-ov"],["qrm","qrm-card"],["lang-sheet",null,1],["priv-sheet",null,1],["sheet",null,1],["qs"],["panic"],["class"],["onb"],["login"]];
const dlgOpen=([id,,sheet])=>{ const e=$(id); return !!e&&(sheet?e.classList.contains("on"):!e.hidden); };
function topDialog(){ const d=DIALOGS.find(dlgOpen); return d?$(d[0]):null; }
const FOCUSABLE='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const focusables=box=>[...box.querySelectorAll(FOCUSABLE)].filter(e=>!e.closest("[hidden]")&&e.getClientRects().length);
const dlgOpener=new Map();
function dlgWatch([id,target,sheet]){
  const box=$(id); if(!box) return; let was=dlgOpen([id,0,sheet]);
  new MutationObserver(()=>{ const now=dlgOpen([id,0,sheet]); if(now===was) return; was=now;
    if(now){ const a=document.activeElement; if(a&&a!==document.body&&!box.contains(a)) dlgOpener.set(id,a);
      // after the dialog's own code has had its chance to place focus (some already do)
      setTimeout(()=>{ if(!dlgOpen([id,0,sheet])||box.contains(document.activeElement)) return;
        const t=(target&&$(target))||box; if(!t.hasAttribute("tabindex")) t.setAttribute("tabindex","-1"); t.classList.add("dlg-focus"); t.focus({preventScroll:true}); },90); }
    else { const o=dlgOpener.get(id); dlgOpener.delete(id); const a=document.activeElement;
      if(o&&o.isConnected&&o.getClientRects().length&&(!a||a===document.body||box.contains(a))&&!topDialog()) setTimeout(()=>{ try{ o.focus({preventScroll:true}); }catch(e){} },60); }
  }).observe(box,{attributes:true,attributeFilter:sheet?["class"]:["hidden"]});
}
DIALOGS.forEach(dlgWatch);
window.addEventListener("keydown",e=>{
  const top=topDialog(); if(!top) return;
  if(e.key==="Escape"){
    if(top.id==="panic"){ $("pn-close").click(); }
    else if(top.id==="tour-end"){ afterTour(); }
    return; }
  if(e.key!=="Tab") return;
  const f=focusables(top); if(!f.length){ e.preventDefault(); return; }
  const a=document.activeElement, i=f.indexOf(a);
  if(i<0){ e.preventDefault(); (e.shiftKey?f[f.length-1]:f[0]).focus(); }
  else if(!e.shiftKey&&i===f.length-1){ e.preventDefault(); f[0].focus(); }
  else if(e.shiftKey&&i===0){ e.preventDefault(); f[f.length-1].focus(); }
},true);
