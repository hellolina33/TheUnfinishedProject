// Recitation player. One <audio> element, one verse file at a time (everyayah),
// but the user only ever sees one surah timeline that starts at 0:00.
import { S, save, data, dayKey, getDay } from './store.js';
import { t, lang } from './i18n.js';
import { toast } from './ui.js';
import { hasBasmala } from './basmala.js';
export { hasBasmala };

// Only reciters with word-level timings (quran-align, CC BY 4.0).
export const RECITERS = {
  Alafasy_128kbps: 'Mishary Alafasy', Husary_64kbps: 'Mahmoud Al-Husary', Abdul_Basit_Murattal_64kbps: 'Abdul Basit (Murattal)',
  Minshawy_Murattal_128kbps: 'Al-Minshawi (Murattal)', 'Abdurrahmaan_As-Sudais_192kbps': 'Abdurrahman As-Sudais',
  'Saood_ash-Shuraym_128kbps': 'Saud Ash-Shuraym', 'Abu_Bakr_Ash-Shaatree_128kbps': 'Abu Bakr Ash-Shatri'
};
if (!RECITERS[S.q.reciter]) { S.q.reciter = 'Alafasy_128kbps'; save(); }
const pad = (n, l = 3) => String(n).padStart(l, '0');
export const verseUrl = (s, v, r = S.q.reciter) => `https://everyayah.com/data/${r}/${pad(s)}${pad(v)}.mp3`;
const wordUrl = (s, v, w) => `https://audio.qurancdn.com/wbw/${pad(s)}_${pad(v)}_${pad(w)}.mp3`;

const audio = new Audio(); audio.preload = 'auto';
// P.v = 0 means the basmala prelude (verse 1:1 of the same reciter) before surahs other than 1 and 9.
export const P = { sleep: 0, s: null, v: null, n: 0, name: '', mode: 'off', a: 0, b: 0, word: false, durs: null, real: {}, tim: null, listeners: new Set(), seekTo: 0 };
const emit = () => P.listeners.forEach(f => { try { f(); } catch (e) { /* view gone */ } });
export const onChange = f => { P.listeners.add(f); return () => P.listeners.delete(f); };

export async function loadSurah(s, name, n) {
  if (P.s === s && P.durs && P.rk === S.q.reciter) return;
  if (P.v != null && P.s !== s) stop();
  P.s = s; P.name = name; P.n = n; P.real = {}; P.rk = S.q.reciter; P.durs = null; P.tim = null;
  try {
    const d = await data('timing/durations.json');
    P.durs = (d[S.q.reciter] || d.Alafasy_128kbps)[s - 1].map(x => x * 100);
    P.basDur = (d[S.q.reciter] || d.Alafasy_128kbps)[0][0] * 100;
  } catch (e) { P.durs = Array(n).fill(8000); P.basDur = 6000; }
  try { P.tim = await data(`timing/${S.q.reciter}/${s}.json`); P.basTim = hasBasmala(s) ? (await data(`timing/${S.q.reciter}/1.json`))[0] : null; } catch (e) { P.tim = null; }
}
const vd = v => v === 0 ? (P.real[0] || P.basDur) : (P.real[v] || P.durs[v - 1]);
export function totalMs() { if (!P.durs) return 0; let x = hasBasmala(P.s) ? vd(0) : 0; for (let v = 1; v <= P.n; v++) x += vd(v); return x; }
export function startOf(v) { let x = hasBasmala(P.s) && v > 0 ? vd(0) : 0; for (let i = 1; i < v; i++) x += vd(i); return x; }
export function posMs() { return P.v == null ? 0 : startOf(P.v) + audio.currentTime * 1000; }
export const isPlaying = () => P.v != null && !audio.paused && !P.word;
export const isWordPlaying = () => P.word && !audio.paused;
export const currentTime = () => audio.currentTime * 1000;

function src(v) { return v === 0 ? verseUrl(1, 1) : verseUrl(P.s, v); }
export function playVerse(v, offsetMs = 0) {
  clearTimeout(gapT); P.gap = false;
  P.v = v; P.word = false; P.seekTo = offsetMs / 1000;
  audio.src = src(v); audio.playbackRate = S.q.speed;
  audio.play().catch(() => {});
  if (v >= 1) { S.q.heard = { s: P.s, v, n: P.name, at: Date.now() }; const d = getDay(dayKey(), true); if (!d.r) d.r = 1; save(); }
  meta(); emit();
}
/* Play modes, like a classic Quran app.
   S.q.pm: 'stop' (stop at the end of the surah or group), 'next' (surah after surah), 'repeat' (repeat the surah or group).
   S.q.grp: 0 = verse after verse, otherwise play this many verses from where you start (a group). */
export const GROUPS = [0, 1, 2, 3, 5, 10, 15, 20, 30, 50];
const pm = () => S.q.pm || 'next', grp = () => S.q.grp || 0;
function setGroup(v) { const a = Math.max(1, v); P.gA = a; P.gB = grp() ? Math.min(P.n, a + grp() - 1) : 0; }
export function playFrom(v) { P.mode = 'off'; setGroup(v); playVerse(v === 1 && hasBasmala(P.s) ? 0 : v); }
export function setMode(m, g) { if (m) S.q.pm = m; if (g != null) S.q.grp = g; save(); if (P.v != null && P.mode === 'off') setGroup(P.v || 1); emit(); }
// Move to another surah: loads its timings, then plays it from the start if asked.
export async function gotoSurah(s2, play) {
  if (s2 < 1 || s2 > 114) return false;
  let m; try { m = await data('meta.json'); } catch (e) { return false; }
  const row = m.s[s2 - 1], nm = lang() === 'ar' ? row[2] : row[0];
  if (P.v != null) { audio.pause(); P.v = null; }
  await loadSurah(s2, nm, row[3]);
  P.auto = true;
  if (play) playFrom(1); else emit();
  return true;
}
export function loopVerse(v) { if (P.sleep === 'end') P.sleep = 0; P.mode = 'verse'; playVerse(v); }
export function loopRange(a, b) { if (P.sleep === 'end') P.sleep = 0; P.mode = 'range'; P.a = a; P.b = b; playVerse(a); }
export function toggle() { if (P.v == null) return playFrom(1); if (audio.paused) audio.play().catch(() => {}); else audio.pause(); }
/* Sleep timer: minutes from now, or 'end' to stop at the end of the surah (loops end too). */
export function setSleep(x) { P.sleep = x === 'end' ? 'end' : x ? Date.now() + x * 60000 : 0; if (x === 'end' && P.mode !== 'off') P.mode = 'off'; emit(); }
export const sleepLeft = () => P.sleep === 'end' ? 'end' : P.sleep ? Math.max(0, P.sleep - Date.now()) : 0;
export function stop() { clearTimeout(gapT); P.gap = false; audio.pause(); audio.removeAttribute('src'); P.v = null; P.mode = 'off'; P.word = false; emit(); }
export function seek(ms) {
  if (!P.durs) return;
  let v = hasBasmala(P.s) ? 0 : 1, acc = 0;
  while (v <= P.n && acc + vd(v) <= ms) { acc += vd(v); v++; }
  if (v > P.n) { v = P.n; acc = startOf(v); }
  if (v === P.v && audio.getAttribute('src')) { audio.currentTime = Math.max(0, (ms - acc) / 1000); emit(); return; }
  P.mode = P.mode === 'verse' ? 'off' : P.mode; playVerse(v, ms - acc);
}
export function next() { if (P.v != null && P.v < P.n) playVerse(P.v + 1); }
export function prev() { if (P.v == null) return; if (audio.currentTime > 2 || P.v <= 1) audio.currentTime = 0; else playVerse(P.v - 1); }
export function setReciter(r) { S.q.reciter = r; save(); }
export function setSpeed(x) { S.q.speed = x; audio.playbackRate = x; save(); emit(); }
export function playWord(s, v, w) {
  if (isPlaying()) return false;
  P.word = true; audio.src = wordUrl(s, v, w); audio.playbackRate = Math.min(1, S.q.speed); audio.play().catch(() => {}); return true;
}

audio.addEventListener('loadedmetadata', () => {
  if (P.word || P.v == null) return;
  if (Number.isFinite(audio.duration) && audio.duration > 0) P.real[P.v] = audio.duration * 1000;
  if (P.seekTo) { try { audio.currentTime = P.seekTo; } catch (e) { /* ignore */ } P.seekTo = 0; }
  meta(); emit();
});
export const __ended = () => audio.dispatchEvent(new Event('ended')); // for automated checks
// A silence before each repetition, so the listener can recite it back.
let gapT = 0;
function again(f) { const g = +S.q.gap || 0; clearTimeout(gapT); if (!g) return f(); P.gap = true; emit(); gapT = setTimeout(() => { P.gap = false; if (P.v != null) f(); }, g * 1000); }
export function setGap(g) { S.q.gap = g; save(); emit(); }
audio.addEventListener('ended', () => {
  if (P.word) { P.word = false; emit(); return; }
  if (P.v == null) return;
  P.ends = (P.ends || 0) + 1;
  if (P.mode === 'verse') return again(() => playVerse(P.v));
  if (P.mode === 'range') return P.v < P.b ? playVerse(P.v + 1) : again(() => playVerse(P.a));
  // A group of verses ends: stop, or start the group again.
  if (P.gB && P.v >= P.gB && P.sleep !== 'end') { if (pm() === 'repeat') return again(() => playVerse(P.gA === 1 && hasBasmala(P.s) ? 0 : P.gA)); P.v = null; emit(); position(); return; }
  if (P.v < P.n) return playVerse(P.v + 1);
  // End of the surah.
  if (P.sleep === 'end') { P.sleep = 0; P.v = null; emit(); position(); return; }
  if (pm() === 'repeat') { setGroup(1); return again(() => playVerse(hasBasmala(P.s) ? 0 : 1)); }
  if (pm() === 'next' && P.s < 114) { gotoSurah(P.s + 1, true); return; }
  P.v = null; emit(); position();
});
audio.addEventListener('error', () => {
  if (!audio.getAttribute('src')) return;
  toast(t('Audio needs a connection, or a download in reader settings.'));
  P.word = false; if (P.v != null) stop();
});
['play', 'pause'].forEach(e => audio.addEventListener(e, () => { emit(); position(); }));
audio.addEventListener('timeupdate', () => { position(); if (typeof P.sleep === 'number' && P.sleep && Date.now() >= P.sleep) { P.sleep = 0; audio.pause(); toast(t('Sleep timer: recitation stopped.')); emit(); } });

/* Lock screen / notification controls show the surah, not the verse file. */
function meta() {
  if (!('mediaSession' in navigator) || P.v == null) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title: `${P.name}${P.v ? ' · ' + P.s + ':' + P.v : ''}`, artist: RECITERS[S.q.reciter] || '', album: 'safa.', artwork: [{ src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }] });
  } catch (e) { /* unsupported */ }
}
let lastPos = 0;
function position() {
  if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
  const now = Date.now(); if (now - lastPos < 900 && !audio.paused) return; lastPos = now;
  try {
    const d = totalMs() / 1000;
    if (P.v == null || !d) { navigator.mediaSession.setPositionState(); return; }
    navigator.mediaSession.setPositionState({ duration: d, position: Math.min(d, posMs() / 1000), playbackRate: S.q.speed || 1 });
  } catch (e) { /* unsupported */ }
}
if ('mediaSession' in navigator) {
  const h = (a, f) => { try { navigator.mediaSession.setActionHandler(a, f); } catch (e) { /* unsupported */ } };
  h('play', () => audio.play()); h('pause', () => audio.pause());
  h('previoustrack', prev); h('nexttrack', next);
  h('seekto', e => seek(e.seekTime * 1000));
  h('seekbackward', e => seek(Math.max(0, posMs() - (e.seekOffset || 10) * 1000)));
  h('seekforward', e => seek(Math.min(totalMs(), posMs() + (e.seekOffset || 10) * 1000)));
}

/* Word progress for the colour sweep: returns [ [wordIndex, 0..1], ... ] for the current verse. */
export function wordProgress(nWords) {
  const tms = audio.currentTime * 1000, out = new Float32Array(nWords);
  const flat = P.v === 0 ? P.basTim : (P.tim && P.tim[P.v - 1]);
  if (flat && flat.length) {
    let lastEnd = 0;
    for (let i = 0; i < flat.length; i += 4) {
      const a = flat[i], b = flat[i + 1], s0 = flat[i + 2], e0 = flat[i + 3], span = b - a;
      for (let w = a; w < b && w < nWords; w++) {
        const ws = s0 + (e0 - s0) * (w - a) / span, we = s0 + (e0 - s0) * (w - a + 1) / span;
        out[w] = tms >= we ? 1 : tms <= ws ? 0 : (tms - ws) / (we - ws);
      }
      lastEnd = Math.max(lastEnd, e0);
    }
    // Words the aligner could not place: fill once the time has passed the previous word.
    for (let w = 1; w < nWords; w++) if (out[w] === 0 && out[w - 1] === 1 && tms > lastEnd) out[w] = 1;
    return out;
  }
  const d = (P.real[P.v] || vd(P.v)) || 1, f = Math.min(1, tms / d);
  for (let w = 0; w < nWords; w++) out[w] = Math.max(0, Math.min(1, f * nWords - w));
  return out;
}

/* Offline audio */
// Saved files are skipped, so a paused download picks up where it stopped.
export async function saveAudio(list, onStep, ctl = {}) {
  const c = await caches.open('safa-audio'); let i = 0;
  for (const [s, v] of list) {
    if (ctl.stop) { const e = new Error('paused'); e.paused = true; throw e; }
    const u = verseUrl(s, v);
    if (!(await c.match(u))) { const r = await fetch(u, { mode: 'no-cors' }); await c.put(u, r); }
    i++; if (onStep) onStep(i, list.length);
  }
}
export async function countSaved(list) {
  try { const c = await caches.open('safa-audio'); const keys = new Set((await c.keys()).map(r => r.url)); return list.filter(([s, v]) => keys.has(verseUrl(s, v))).length; } catch (e) { return 0; }
}
export function fmt(ms) { ms = Math.max(0, ms | 0); const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s % 60).padStart(2, '0'); }
