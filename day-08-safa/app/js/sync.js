// End-to-end encrypted sync file. AES-GCM with a key derived from a passphrase (PBKDF2, 250k rounds).
// Nothing is uploaded: the file travels however the user chooses (AirDrop, message, drive).
import { S, save, replaceState } from './store.js';

const enc = new TextEncoder(), dec = new TextDecoder();
const b64 = u => btoa(String.fromCharCode(...new Uint8Array(u)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function key(pass, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export async function seal(pass) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const body = enc.encode(JSON.stringify({ app: 'safa.', at: new Date().toISOString(), state: S }));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(pass, salt), body);
  return JSON.stringify({ safa: 'sync', v: 1, kdf: 'PBKDF2-SHA256-250000', salt: b64(salt), iv: b64(iv), data: b64(ct) });
}
export async function open(text, pass) {
  const o = JSON.parse(text); if (o.safa !== 'sync') throw new Error('format');
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(o.iv) }, await key(pass, unb64(o.salt)), unb64(o.data));
  return JSON.parse(dec.decode(pt)).state;
}
const uniq = (a, f) => { const m = new Map(); a.forEach(x => m.set(f(x), x)); return [...m.values()]; };
// Merge another device's state into this one. Nothing on this device is lost.
export function merge(o) {
  if (!o || typeof o !== 'object') throw new Error('state');
  const M = JSON.parse(JSON.stringify(S));
  for (const [k, d] of Object.entries(o.days || {})) {
    const m = M.days[k] || { p: [0, 0, 0, 0, 0], r: 0, a: 0, pz: 0 };
    M.days[k] = { p: m.p.map((x, i) => x || (d.p || [])[i] ? 1 : 0), r: m.r || d.r ? 1 : 0, a: m.a || d.a ? 1 : 0, pz: m.pz || d.pz ? 1 : 0, k: m.k || d.k ? 1 : 0, paper: m.paper || d.paper ? 1 : 0 };
  }
  M.q.favs = [...new Set([...(M.q.favs || []), ...((o.q && o.q.favs) || [])])];
  M.d.favs = [...new Set([...(M.d.favs || []), ...((o.d && o.d.favs) || [])])];
  M.myDuas = uniq([...(o.myDuas || []), ...(M.myDuas || [])], x => x.id);
  M.hifz.items = uniq([...((o.hifz && o.hifz.items) || []), ...M.hifz.items], x => x.s + ':' + x.a + '-' + x.b);
  for (const [i, w] of Object.entries((o.lessons && o.lessons.w) || {})) { const m = M.lessons.w[i]; if (!m || w.b > m.b) M.lessons.w[i] = w; }
  M.q.notes = Object.assign({}, (o.q && o.q.notes) || {}, M.q.notes || {});
  for (const [k, x] of Object.entries((o.q && o.q.notes) || {})) if (!M.q.notes[k] || x.at > M.q.notes[k].at) M.q.notes[k] = x;
  M.q.marks = [0, 1, 2].map(i => (M.q.marks || [])[i] || ((o.q && o.q.marks) || [])[i] || null);
  M.journeySaved = [...new Set([...(M.journeySaved || []), ...(o.journeySaved || [])])];
  if (o.khatm && (!M.khatm || (o.khatm.page || 0) > (M.khatm.page || 0))) M.khatm = o.khatm;
  if (o.qada && o.qada.updated && (!M.qada.updated || o.qada.updated > M.qada.updated)) M.qada = o.qada;
  if (!M.loc && o.loc) { M.loc = o.loc; M.method = o.method; M.onboarded = true; }
  replaceState(M);
}
