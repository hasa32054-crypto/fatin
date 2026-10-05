/* ---------- extension points ----------
   Core actions (showTab, applyLang, setMode, render, callEnd, …) are made hookable once, right where they
   are defined: name=hookable("name",name). Features then add behaviour with hook() instead of re-wrapping
   the function, so every extension of an action is listed in one place (HOOKS) and runs in a known order:
     hook("before",name,fn)  runs first, in the order added; returning false skips the action
     hook("map",name,fn)     receives the action's result (and its arguments) and returns the result to use
     hook("after",name,fn)   runs after the action, in the order added, with the same arguments */
const HOOKS={before:{},map:{},after:{}};
function hook(when,name,fn){ (HOOKS[when][name]||(HOOKS[when][name]=[])).push(fn); }
function hookable(name,core){
  return function(...args){
    for(const f of HOOKS.before[name]||[]) if(f.apply(this,args)===false) return;
    let r=core.apply(this,args);
    for(const f of HOOKS.map[name]||[]) r=f.call(this,r,...args);
    for(const f of HOOKS.after[name]||[]) f.apply(this,args);
    return r;
  };
}
