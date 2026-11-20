// Local-only state. Nothing here ever leaves the device.
const KEY = 'safa.app.v1';
const DEF = {
  v: 1, lang: 'auto', onboarded: false, loc: null, method: 'MWL', madhab: 'shafi',
  offsets: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }, hijriAdj: 0, h24: true,
  q: { last: null, favs: [], taf: [], dl: {}, wbw: false, flow: false, tr: 'auto', tl: false, fs: 1, reciter: 'Alafasy_128kbps', speed: 1, hide: 0 },
  d: { favs: [], tl: true },
  days: {}, pauseOn: false, rem: { on: false, t: '21:00' },
  ui: { theme: 'auto', scale: 1, hc: false, motion: false },
  fri: { on: true },
  qada: { on: false, p: { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 }, fast: 0, perDay: 1 },
  khatm: null, hifz: { items: [], perDay: 5 }, lessons: { w: {}, last: '' }, myDuas: []
};
const clone = o => JSON.parse(JSON.stringify(o));
function merge(def, got) {
  const out = clone(def);
  if (!got || typeof got !== 'object') return out;
  for (const k of Object.keys(got)) {
    if (k in def && def[k] && typeof def[k] === 'object' && !Array.isArray(def[k]) && k !== 'days' && k !== 'loc' && k !== 'khatm') out[k] = merge(def[k], got[k]);
    else out[k] = got[k];
  }
  return out;
}
function load() { try { return merge(DEF, JSON.parse(localStorage.getItem(KEY))); } catch (e) { return clone(DEF); } }
export let S = load();
export function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ } }
export function replaceState(o) { S = merge(DEF, o); save(); }
export function resetState() { S = clone(DEF); save(); }

export const P5 = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
export function dayKey(ms = Date.now()) {
  const tz = S.loc ? S.loc.tz : undefined;
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
}
export function addDays(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}
export function getDay(key, create) {
  let d = S.days[key];
  if (!d) { d = { p: [0, 0, 0, 0, 0], r: 0, a: 0, pz: 0 }; if (create) S.days[key] = d; }
  if (S.pauseOn && key === dayKey() && !d.pz) { d.pz = 1; S.days[key] = d; }
  return d;
}

// Lazy JSON loader with in-memory cache. Files are also cached by the service worker.
const mem = new Map();
export function data(path) {
  if (!mem.has(path)) mem.set(path, fetch('data/' + path).then(r => { if (!r.ok) throw new Error(path); return r.json(); }).catch(e => { mem.delete(path); throw e; }));
  return mem.get(path);
}
