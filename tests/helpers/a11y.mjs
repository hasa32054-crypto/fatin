// In-page checks shared by the accessibility test and the scanning tools (each runs inside page.evaluate).

// Visible text in the current view whose colour contrast with its background is below WCAG AA (4.5:1, or 3:1 for large text).
// Backgrounds are resolved by walking up to the first opaque colour; text over images or gradients is skipped.
// The selected tab is measured against the sliding green pill behind it, which is a sibling element.
export const contrastScan = () => {
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [r, g, b, a]; };
  const lum = ([r, g, b]) => { const f = v => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const mix = (top, bot) => { const a = top[3]; return [0, 1, 2].map(i => top[i] * a + bot[i] * (1 - a)).concat(1); };
  const bgOf = e => { const layers = []; for (let n = e; n; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.backgroundImage !== "none") return null; const c = parse(cs.backgroundColor); if (c && c[3] > 0) { layers.push(c); if (c[3] >= 1) break; } }
    let out = [255, 255, 255, 1]; for (let i = layers.length - 1; i >= 0; i--) out = mix(layers[i], out); return out; };
  const out = [], w = document.createTreeWalker(document.getElementById(VIEWS[curTab]).closest("#device") || document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { const e = n.parentElement, t = n.nodeValue.trim(); if (!t || !e || e.closest("[hidden],[aria-hidden=true],.splash")) continue;
    const r = e.getBoundingClientRect(); if (!r.width || r.bottom < 0) continue; const cs = getComputedStyle(e); if (cs.visibility === "hidden" || +cs.opacity === 0) continue;
    const fg = parse(cs.color), bg = e.closest('.tab[aria-selected="true"]') && !e.closest(".dot") ? [19, 145, 88, 1] : bgOf(e);; if (!fg || !bg) continue; const f = mix(fg, bg);
    const L1 = lum(f), L2 = lum(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const px = parseFloat(cs.fontSize), large = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700);
    if (ratio < (large ? 3 : 4.5)) out.push(`${ratio.toFixed(2)} ${px}px ${e.tagName.toLowerCase()}.${String(e.className).split(" ")[0]} "${t.slice(0, 40)}" ${cs.color} on rgb(${bg.slice(0, 3).map(Math.round)})`); }
  return [...new Set(out)];
};

// Arabic text left visible in the current view or in the given overlays when another language is chosen.
// Sample messages, the Arabic-only bulletin and the bilingual language labels are Arabic on purpose.
export const arabicScan = (roots) => {
  const skip = "[hidden],textarea,.msgview,.qmsg,.bubble,.ex,.sbub,#nw-list,#nw-hero,#nw-tr,#nw-note,.nw-term,#lang-field,.onb .art,.onb-top .badge,.cl-stage";
  const out = [];
  for (const root of roots.map(r => r === "view" ? document.getElementById(VIEWS[curTab]) : document.querySelector(r)).filter(Boolean)) {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const el = n.parentElement; if (!el || el.closest(skip) || !el.getBoundingClientRect().width) continue;
      const t = n.nodeValue.trim(); if (/[\u0600-\u06FF]{2,}/.test(t)) out.push(t); } }
  return [...new Set(out)];
};
