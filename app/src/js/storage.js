/* ---------- storage on the phone (localStorage) ----------
   store : plain text under its own key ("fatin-onb", "fatin-mode", "fatin-hc", …)
   S     : JSON values under "fatin-<key>" (stats, profile, language, family code, settings, …)
   Neither ever throws: in private browsing or with storage blocked, the app just doesn't remember. */
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const S={get(k,d){ try{ const v=localStorage.getItem("fatin-"+k); return v===null?d:JSON.parse(v); }catch(e){ return d; } }, set(k,v){ try{ localStorage.setItem("fatin-"+k,JSON.stringify(v)); }catch(e){} }};
