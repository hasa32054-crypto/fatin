/* ---------- privacy: what leaves the phone, and never the sensitive parts ----------
   The first check (FatinEngine) runs on the phone and sends nothing. The cloud features are optional:
     cloud AI    : the AI check of a message, photo reading, Ask Fatin and the training characters
     cloud voice : the natural voice and writing down what is said in a practice call
   Before any text leaves the phone, codes, card numbers, IBANs, CVVs, passwords and ID numbers are
   masked; a message that contains them is checked on the phone only unless the person asks. */
const PRIVACY={
  cloudAI(){ return S.get("cloud-ai",true)!==false; },
  cloudVoice(){ return S.get("cloud-voice",true)!==false; },
  // [kind, pattern, group holding the sensitive value (0 = the whole match), extra test]
  RULES:[
    // order matters: when two rules overlap, the earlier one wins (an IBAN can contain a card-like digit run)
    ["iban",/\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{4}){3,7}(?:[ ]?[A-Z0-9]{1,3})?\b/gi,0,v=>/^(SA|AE|KW|BH|QA|OM|EG|JO|GB|DE|FR|ES|TR|PK)/i.test(v)],
    ["card",/(?<![\d])(?:\d[ -]?){12,18}\d(?![\d])/g,0,v=>luhn(v.replace(/\D/g,""))],
    ["card",/(?:بطاقة|البطاقة|بطاقتي|card)[^\d\n]{0,16}((?:\d[ -]?){12,18}\d)(?![\d])/gi,1],   // after the word "card", even if the number is not a valid one
    ["cvv",/(?:cvv2?|cvc|الرمز السري للبطاقة|رمز الأمان)[^\d\n]{0,12}(\d{3,4})(?!\d)/gi,1],
    ["password",/(?:password|passcode|كلمة المرور|كلمة السر|الرقم السري|باسورد|كلمة مرور)\s*(?:[:：=]|هي|is)\s*(\S{3,})/gi,1],
    ["otp",/(?:رمز|الرمز|كود|الكود|otp|pin|code|verification|تحقق|التحقق|التفعيل|passcode)[^\d\n]{0,24}(\d{4,8})(?!\d)/gi,1],
    ["otp",/(?<!\d)(\d{4,8})(?!\d)[^\d\n]{0,12}(?:هو رمز|رمز التحقق|is your (?:code|otp|verification))/gi,1],
    ["id",/(?<![\d+])[12]\d{9}(?!\d)/g,0],
  ],
  MASK:{card:"[رقم بطاقة]",iban:"[رقم حساب]",cvv:"[رمز البطاقة]",password:"[كلمة مرور]",otp:"[رمز]",id:"[رقم هوية]"},
  // where the sensitive values are: [{kind,start,end}] on the text as written (Arabic-Indic digits included)
  find(text){
    const t=String(text||""), norm=t.replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d));
    const hits=[];
    for(const [kind,re,g,ok] of PRIVACY.RULES){ re.lastIndex=0; let m;
      while((m=re.exec(norm))){ const v=m[g]; if(!v) continue; const start=m.index+(g?m[0].indexOf(v):0), end=start+v.length;
        if(ok&&!ok(v)) continue; if(hits.some(h=>start<h.end&&end>h.start)) continue; hits.push({kind,start,end}); } }
    return hits.sort((a,b)=>a.start-b.start);
  },
  kinds(text){ return [...new Set(PRIVACY.find(text).map(h=>h.kind))]; },
  redact(text){ const t=String(text||""); let out="", at=0; for(const h of PRIVACY.find(t)){ out+=t.slice(at,h.start)+PRIVACY.MASK[h.kind]; at=h.end; } return out+t.slice(at); },
  // one plain sentence naming what was found, for the note under the result
  LABEL:{card:"رقم بطاقة",iban:"رقم حساب بنكي",cvv:"رمز أمان البطاقة",password:"كلمة مرور",otp:"رمز تحقق",id:"رقم هوية أو إقامة"},
};
function luhn(d){ if(d.length<13||d.length>19||/^(\d)\1+$/.test(d)) return false; let s=0; for(let i=0;i<d.length;i++){ let n=+d[d.length-1-i]; if(i%2){ n*=2; if(n>9) n-=9; } s+=n; } return s%10===0; }
// the AI key typed on this phone (only for copies of Fatin without a server) lives for this session only
try{ localStorage.removeItem("fatin-ai-key"); }catch(e){}
