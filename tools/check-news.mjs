// Checks app/news.json before it is published. Same rules the app applies when it loads the file.
// Usage: node tools/check-news.mjs [path]   (exit code 0 = valid)
import { readFileSync } from "node:fs";

const TAGS = ["warn", "breach", "dev", "tip", "upd"];
const GO = ["call", "family", "scan", "train", "pats", "ask", "panic"];
const str = (v, min, max) => typeof v === "string" && v.trim().length >= min && v.length <= max;

export function checkNews(d) {
  const err = [];
  if (!d || typeof d !== "object") return ["not an object"];
  if (!str(d.updated, 3, 40)) err.push("updated: short Arabic date text required, e.g. «3 أكتوبر 2026»");
  if (!str(d.updatedAt, 10, 40) || isNaN(Date.parse(d.updatedAt))) err.push("updatedAt: ISO date-time required");
  const it = d.items;
  if (!Array.isArray(it) || it.length < 5 || it.length > 12) { err.push("items: 5 to 12 news items"); return err; }
  if (it.filter(n => n && n.hero === true).length !== 1) err.push("exactly one item must have hero:true");
  const ids = new Set();
  it.forEach((n, i) => {
    const p = `items[${i}]`;
    if (!n || typeof n !== "object") { err.push(p + " not an object"); return; }
    if (!/^[a-z0-9-]{2,40}$/.test(n.id || "")) err.push(p + ".id: lowercase latin letters, digits, dashes");
    if (ids.has(n.id)) err.push(p + ".id duplicated"); ids.add(n.id);
    if (!TAGS.includes(n.tag)) err.push(p + ".tag must be one of " + TAGS.join(","));
    if (n.hero && n.tag !== "warn") err.push(p + ": the hero item must be tag warn");
    if (!str(n.where, 2, 30)) err.push(p + ".where");
    if (!str(n.date, 3, 30)) err.push(p + ".date");
    if (!str(n.title, 10, 110)) err.push(p + ".title 10-110 chars");
    if (!str(n.sum, 30, 400)) err.push(p + ".sum 30-400 chars");
    if (!str(n.mean, 15, 300)) err.push(p + ".mean 15-300 chars");
    if (!Array.isArray(n.todo) || n.todo.length < 2 || n.todo.length > 4 || !n.todo.every(t => str(t, 5, 160))) err.push(p + ".todo: 2-4 short steps");
    if (!Array.isArray(n.src) || n.src.length < 1 || n.src.length > 3 || !n.src.every(s => Array.isArray(s) && str(s[0], 2, 60) && /^https:\/\/[^\s"'<>]+$/.test(s[1] || ""))) err.push(p + ".src: 1-3 [name, https URL] pairs");
    if (n.tryMsg != null && !str(n.tryMsg, 15, 300)) err.push(p + ".tryMsg 15-300 chars");
    if (n.hero && !str(n.tryMsg, 15, 300)) err.push(p + ": the hero item needs tryMsg (an example scam message to test)");
    if (n.go != null && (!GO.includes(n.go) || !str(n.goTxt, 4, 40))) err.push(p + ".go must be one of " + GO.join(",") + " with goTxt");
    if (n.big != null && !(Array.isArray(n.big) && n.big.length === 2 && str(n.big[0], 1, 20) && str(n.big[1], 3, 80))) err.push(p + ".big: [number text, short label]");
    const extra = Object.keys(n).filter(k => !["id","tag","where","date","hero","title","sum","mean","todo","tryMsg","src","go","goTxt","big"].includes(k));
    if (extra.length) err.push(p + " unknown keys: " + extra.join(","));
  });
  return err;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const path = process.argv[2] || new URL("../app/news.json", import.meta.url).pathname;
  let d; try { d = JSON.parse(readFileSync(path, "utf8")); } catch (e) { console.error("JSON error: " + e.message); process.exit(1); }
  const err = checkNews(d);
  if (err.length) { console.error("news.json is NOT valid:\n- " + err.join("\n- ")); process.exit(1); }
  console.log(`news.json OK: ${d.items.length} items, updated ${d.updated}`);
}
