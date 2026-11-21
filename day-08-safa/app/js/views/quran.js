import { S, save, data, dayKey, getDay } from '../store.js';
import { weekday } from '../prayer.js';
import { $, $$, esc, icon, arNum, sheet, closeSheet, toast, reportUrl, download } from '../ui.js';
import { t, lang, L } from '../i18n.js';
import * as PL from '../player.js';
import { thaiSurah, thaiQuranIndex, THAI_QURAN_LABEL, normalizeThaiDigits } from '../thai-quran.js';
import { tajweed, RULES } from '../tajweed.js';
export { RECITERS } from '../player.js';
// Popular names people search for.
const NICK = [[/ฟาติ[หฮะ]+/, 1, 0, 'Al-Fatihah'], [/บะเกาะเราะฮ์/, 2, 0, 'Al-Baqarah'], [/กะฮ์ฟ/, 18, 0, 'Al-Kahf'], [/ยาซีน/, 36, 0, 'Ya-Sin'], [/อิคลาศ/, 112, 0, 'Al-Ikhlas'], [/kurs/, 2, 255, 'Ayat al-Kursi'], [/^ya ?s(ee|i)n/, 36, 0, 'Ya-Sin'], [/mulk/, 67, 0, 'Al-Mulk'], [/kahf/, 18, 0, 'Al-Kahf'], [/rahman/, 55, 0, 'Ar-Rahman'], [/waqi/, 56, 0, "Al-Waqi'ah"], [/ikhlas/, 112, 0, 'Al-Ikhlas'], [/falaq/, 113, 0, 'Al-Falaq'], [/^(an ?)?nas$/, 114, 0, 'An-Nas'], [/amana ?r/, 2, 285, 'Amana ar-Rasul'], [/fatiha/, 1, 0, 'Al-Fatihah'], [/sajda/, 32, 0, 'As-Sajdah'], [/maryam/, 19, 0, 'Maryam'], [/yusuf|joseph/, 12, 0, 'Yusuf']];

const TRANS = {
  maash: ['Rashid Maash (clear French)', 'fr'], hamidullah: ['Hamidullah (classic French)', 'frh'],
  itani: ['Talal Itani (clear English)', null], pickthall: ['Pickthall (classic English)', 'pk'],
  thai: [THAI_QURAN_LABEL, null], muyassar: ['Al-Muyassar (Arabic explanation)', 'taf:ar-muyassar'], none: ['No translation', null]
};
const trName = () => { const x = TRANS[trKey()]; return x ? t(x[0]) : ''; };
export const trKey = () => S.q.tr === 'auto' ? ({ fr: 'maash', ar: 'none', en: 'itani', th: 'thai' }[lang()]) : S.q.tr;
export const meaning = (meta, n) => lang() === 'fr' && meta.fr ? meta.fr[n - 1] : lang() === 'ar' ? meta.s[n - 1][0] : lang() === 'th' ? t(meta.s[n - 1][1]) : meta.s[n - 1][1];
export const surahName = (meta, n) => lang() === 'ar' ? meta.s[n - 1][2] : meta.s[n - 1][0];
// Tafsir sources: key -> [label, file prefix, language]
export const TAFSIRS = {
  'fr-mukhtasar': ['Al-Mukhtasar (French)', 'taf/fr-mukhtasar', 'fr'], 'en-mukhtasar': ['Al-Mukhtasar (English)', 'tafsir', 'en'],
  'en-ibnkathir': ['Ibn Kathir (English, abridged)', 'taf/en-ibnkathir', 'en'], 'en-jalalayn': ['Al-Jalalayn (English)', 'taf/en-jalalayn', 'en'],
  'ar-muyassar': ['Al-Muyassar (Arabic)', 'taf/ar-muyassar', 'ar'], 'ar-mukhtasar': ['Al-Mukhtasar (Arabic)', 'taf/ar-mukhtasar', 'ar'],
  'th-mukhtasar': ['Al-Mukhtasar (Thai)', 'quranenc', 'th'],
  'ar-saadi': ['As-Saadi (Arabic)', 'taf/ar-saadi', 'ar'], 'asbab': ['Circumstances of revelation · Al-Wahidi', 'tafsir', 'en']
};
// Tajweed colour names and a one-line meaning.
const TJN = { qalqala: 'Qalqala', iqlab: 'Iqlab', idgham: 'Idgham', ikhfa: "Ikhfa'", ghunna: 'Ghunna' };
const TJD = { qalqala: 'An echo, a light bounce, on ق ط ب ج د when they carry a sukun or end the verse.', iqlab: 'The noon sound becomes a hidden meem before ب, with a nasal sound.', idgham: 'The noon (or meem) merges into the next letter: ي ن م و with a nasal sound, ل ر without.', ikhfa: 'The noon (or meem before ب) is half hidden, with a nasal sound held for two counts.', ghunna: 'Noon or meem with shadda: hold the nasal sound for two counts.' };
// One-line presentation of each source.
const TDESC = {
  'fr-mukhtasar': 'Short, modern explanation by the Tafsir Center for Quranic Studies.', 'en-mukhtasar': 'Short, modern explanation by the Tafsir Center for Quranic Studies.', 'ar-mukhtasar': 'Short, modern explanation by the Tafsir Center for Quranic Studies.',
  'en-ibnkathir': 'Classic 14th-century tafsir. Explains verses with other verses and hadith.', 'en-jalalayn': 'Concise 15th-century tafsir by Al-Mahalli and As-Suyuti.',
  'ar-muyassar': 'Simple Arabic explanation from the King Fahd Complex.', 'ar-saadi': '20th-century tafsir by As-Saadi, clear and focused on lessons.',
  'th-mukhtasar': 'Short, modern explanation by the Tafsir Center for Quranic Studies.',
  'asbab': 'What was happening when the verse came down, by Al-Wahidi (11th century).'
};
export async function tafsirText(k, s, v) {
  const src = TAFSIRS[k]; if (!src) return '';
  if (src[1] === 'quranenc') {
    const response = await fetch(`https://quranenc.com/api/v1/translation/aya/thai_mokhtasar/${s}/${v}`, { referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(7000) });
    if (!response.ok) throw new Error('Thai tafsir unavailable');
    const { result } = await response.json();
    return [result?.translation, result?.footnotes].filter(Boolean).join('\n');
  }
  const d = await data(`${src[1]}/${s}.json`);
  if (src[1] === 'tafsir') return (k === 'asbab' ? d.a : d.m)[v] || '';
  const i = d.m[v]; return i == null ? '' : d.t[i];
}
const defaultTafsirs = () => ({ fr: ['fr-mukhtasar'], ar: ['ar-muyassar'], en: ['en-mukhtasar'], th: ['th-mukhtasar'] }[lang()]);
const SAJDA = new Set(['7:206', '13:15', '16:50', '17:109', '19:58', '22:18', '22:77', '25:60', '27:26', '32:15', '38:24', '41:38', '53:62', '84:21', '96:19']);
const BISM = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ';

/* ---------- Shared: verse text, context, compare, notes ---------- */
export async function verseText(s, v) {
  const src = await data(`quran/${s}.json`); const x = src.v[v - 1]; let tr = x.t;
  const tf = TRANS[trKey()];
  try { if (trKey() === 'thai') tr = (await thaiSurah(s))[v - 1]; else if (tf && tf[1] && !tf[1].startsWith('taf:')) tr = (await data(`${tf[1]}/${s}.json`))[v - 1]; else if (trKey() === 'none') tr = ''; } catch (e) { if (trKey() === 'thai') tr = ''; }
  return { a: x.a.join(' '), tr, n: src.v.length };
}
const vblock = (meta, s, v, x, on) => `<div class="cblk ${on ? 'on' : ''}"><span class="mono"><bdi>${s}:${v}</bdi>${on ? '' : ''}</span><p class="ar" lang="ar" dir="rtl">${x.a}</p>${x.tr && lang() !== 'ar' ? `<p class="trq">${esc(x.tr)}</p>` : ''}</div>`;
// Three verses before and after, read without leaving where you are.
export async function contextSheet(s, v) {
  const meta = await data('meta.json'); const n = meta.s[s - 1][3];
  const from = Math.max(1, v - 3), to = Math.min(n, v + 3);
  const el = sheet(`<h3>${t('Read in context')} · ${esc(surahName(meta, s))} <bdi>${s}:${v}</bdi></h3><div class="sbody" id="ctxb"><p class="muted">${t('Loading…')}</p></div><a class="btn line sm" href="#/quran/${s}/${v}">${t('Open in the reader')}</a>`, { dark: document.body.classList.contains('dark'), label: t('Read in context') });
  const parts = []; for (let i = from; i <= to; i++) parts.push(vblock(meta, s, i, await verseText(s, i), i === v));
  const box = el.querySelector('#ctxb'); if (box) { box.innerHTML = parts.join(''); box.querySelector('.cblk.on')?.scrollIntoView({ block: 'center' }); }
  el.addEventListener('click', e => { if (e.target.closest('a[href^="#/quran/"]')) closeSheet(); });
}
// Pinned verses, side by side (stacked on a phone).
export async function compareSheet() {
  const meta = await data('meta.json'), pins = S.q.pins || [];
  const el = sheet(`<h3>${t('Compare verses')}</h3><div class="sbody cmpv" id="cmpb"><p class="muted">${t('Loading…')}</p></div><button class="btn line sm" id="cmpclr">${t('Unpin all')}</button>`, { dark: document.body.classList.contains('dark'), label: t('Compare verses') });
  const parts = []; for (const k of pins) { const [s, v] = k.split(':').map(Number); parts.push(`<div class="cmpcol">${vblock(meta, s, v, await verseText(s, v), false).replace(`<bdi>${s}:${v}</bdi>`, `${esc(surahName(meta, s))} <bdi>${s}:${v}</bdi>`)}<div class="row2"><a class="linkbtn small" href="#/quran/${s}/${v}">${t('Open in the reader')}</a><button class="linkbtn small" data-unpin="${k}">${t('Unpin')}</button></div></div>`); }
  const box = el.querySelector('#cmpb'); if (box) box.innerHTML = parts.join('') || `<p class="muted">${t('No pinned verse yet. Open a verse menu and tap Pin to compare.')}</p>`;
  el.onclick = e => {
    if (e.target.closest('a[href^="#/quran/"]')) { closeSheet(); return; }
    const u = e.target.closest('[data-unpin]'); if (u) { S.q.pins = (S.q.pins || []).filter(x => x !== u.dataset.unpin); save(); u.closest('.cmpcol').remove(); window.dispatchEvent(new Event('safa:pins')); return; }
    if (e.target.id === 'cmpclr') { S.q.pins = []; save(); closeSheet(); window.dispatchEvent(new Event('safa:pins')); }
  };
}
export async function exportNotes(kind) {
  const meta = await data('meta.json'), notes = Object.entries(S.q.notes || {}).sort((a, b) => { const [s1, v1] = a[0].split(':').map(Number), [s2, v2] = b[0].split(':').map(Number); return s1 - s2 || v1 - v2; });
  if (kind === 'md') {
    const lines = [`# ${t('My notes on the Quran')} · safa.`, ''];
    for (const [k, x] of notes) { const [s, v] = k.split(':').map(Number); lines.push(`## ${meta.s[s - 1][0]} ${s}:${v}`, '', x.text, '', `_${new Date(x.at).toLocaleDateString(L())}_`, ''); }
    download(`safa-notes-${dayKey()}.md`, lines.join('\n'), 'text/markdown'); return;
  }
  const w = document.createElement('div'); w.className = 'printnotes';
  w.innerHTML = `<h1>${t('My notes on the Quran')}</h1>` + (await Promise.all(notes.map(async ([k, x]) => { const [s, v] = k.split(':').map(Number); const vt = await verseText(s, v).catch(() => ({ a: '', tr: '' })); return `<section><h2>${esc(meta.s[s - 1][0])} ${s}:${v}</h2><p class="ar" lang="ar" dir="rtl">${vt.a}</p><p><i>${esc(vt.tr || '')}</i></p><p>${esc(x.text).replace(/\n/g, '<br>')}</p></section>`; }))).join('');
  document.body.appendChild(w); document.documentElement.classList.add('print-notes'); setTimeout(() => { window.print(); document.documentElement.classList.remove('print-notes'); w.remove(); }, 80);
}

/* ---------- Surah list ---------- */
let listState = { tab: 'surahs', q: '' };
export async function renderList(root, section) {
  if (section === 'favorites') { listState.tab = 'favs'; listState.q = ''; }
  const meta = await data('meta.json');
  const starts = [0]; meta.s.forEach(m => starts.push(starts[starts.length - 1] + m[3]));
  const row = (n) => { const m = meta.s[n - 1]; return `<a class="srow ${S.q.seen && S.q.seen[n] ? 'seen' : ''}" href="#/quran/${n}" aria-label="${esc(t('Surah {n}', { n }) + ', ' + surahName(meta, n) + ', ' + meaning(meta, n) + ', ' + t('{n} verses', { n: m[3] }))}"><span class="num mono">${n}</span><span class="st"><b>${esc(surahName(meta, n))}</b><span class="muted small">${esc(meaning(meta, n))} · ${t('{n} verses', { n: m[3] })} · ${t(m[4] ? 'Medinan' : 'Meccan')}</span></span>${lang() === 'ar' ? '' : `<span class="ar" lang="ar">${m[2]}</span>`}</a>`; };
  root.innerHTML = `<header class="vh"><div><h1>${t('Quran')}</h1></div></header>
    <nav class="tools tools2" aria-label="${t('Tools')}"><a href="#/khatm">${icon.book}<span>${t('Finish the Quran')}<small>${t('A plan, pages per day')}</small></span></a><a href="#/hifz">${icon.repeat}<span>${t('Memorise')}<small>${t('Short portions, spaced reviews')}</small></span></a><a href="#/lessons">${icon.letter}<span>${t('Arabic')}<small>${t('5 Quran words a day')}</small></span></a><a href="#/ask">${icon.search}<span>${t('Find')}<small>${t('A verse or a dua by topic')}</small></span></a></nav>
    <div class="searchf">${icon.search}<input id="qs" class="inp" type="search" placeholder="${t('Surah, Ayat al-Kursi, 2:255 or a word')}" value="${esc(listState.q)}" autocomplete="off" aria-label="${t('Search the Quran')}"></div>
    <div class="chips" role="tablist">${[['surahs', 'Surahs'], ['juz', 'Juz'], ['favs', 'Favourites'], ['notes', 'Notes']].map(([k, l]) => `<button class="chip" role="tab" data-tab="${k}" aria-selected="${listState.tab === k}">${t(l)}</button>`).join('')}</div>
    <div id="ql"></div>`;
  const out = $('#ql', root);
  const draw = async () => {
    const q = listState.q.trim();
    if (q) {
      const numberQuery = normalizeThaiDigits(q);
      const ref = numberQuery.match(/^(\d{1,3})\s*[:.\s]\s*(\d{1,3})$/), ql = q.toLowerCase().replace(/[^a-z0-9 \u0621-\u064A\u0e00-\u0e7f]/g, '');
      let html = '';
      const nick = NICK.find(([re]) => re.test(q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')));
      if (nick) html += `<a class="card row" href="#/quran/${nick[1]}${nick[2] ? '/' + nick[2] : ''}"><span><span class="mono">${t('Go to verse')}</span><b>${esc(nick[3])} · ${nick[1]}${nick[2] ? ':' + nick[2] : ''}</b></span>${icon.chev}</a>`;
      if (ref && +ref[1] >= 1 && +ref[1] <= 114 && +ref[2] >= 1 && +ref[2] <= meta.s[+ref[1] - 1][3]) html += `<a class="card row" href="#/quran/${+ref[1]}/${+ref[2]}"><span><span class="mono">${t('Go to verse')}</span><b>${esc(meta.s[+ref[1] - 1][0])} · ${+ref[1]}:${+ref[2]}</b></span>${icon.chev}</a>`;
      const hits = meta.s.map((m, i) => i + 1).filter(n => String(n) === numberQuery || (ql.length > 1 && ((sq => sq.includes(ql.replace(/ /g, '').replace(/h$/, '')))(meta.s[n - 1][0].toLowerCase().replace(/[^a-z0-9]/g, '')) || meta.s[n - 1][2].replace(/[\u064B-\u0652\u0670]/g, '').includes(ql) || meaning(meta, n).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(ql))));
      html += hits.map(row).join('');
      out.innerHTML = html || `<p class="muted pad">${t('Searching…')}</p>`;
      if (q.length >= 3 && !ref) {
        try {
          const all = lang() === 'th' ? await thaiQuranIndex() : await data({ fr: 'search_fr.json', ar: 'search_ar.json', en: 'search.json' }[lang()]); if (listState.q.trim() !== q) return;
          const fold = x => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u064B-\u0652\u0670]/g, '').replace(/[’]/g, "'").replace(/[أإآٱ]/g, 'ا'), needle = fold(q), res = [];
          for (let i = 0; i < all.length && res.length < 40; i++) if (fold(all[i]).includes(needle)) res.push(i);
          const rx = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
          html += res.length ? `<p class="mono pad">${t('Verses · {n}', { n: res.length + (res.length === 40 ? '+' : '') })}</p>` + res.map(i => { let s = 1; while (starts[s] <= i) s++; const v = i - starts[s - 1] + 1; return `<a class="hit" href="#/quran/${s}/${v}"><span class="mono">${esc(meta.s[s - 1][0])} ${s}:${v}</span><span>${esc(all[i]).replace(rx, '<mark>$1</mark>')}</span></a>`; }).join('') : '';
        } catch (e) { /* offline before first cache: names only */ }
      }
      out.innerHTML = html || `<p class="muted pad">${t('Nothing found. Try a surah name, a verse like 2:255, or a word.')}</p>`;
      return;
    }
    if (listState.tab === 'juz') { out.innerHTML = meta.juz.map((j, i) => `<a class="srow" href="#/quran/${j[0]}/${j[1]}"><span class="num mono">${i + 1}</span><span class="st"><b>${t('Juz {n}', { n: i + 1 })}</b><span class="muted small">${t('Starts at {s}', { s: esc(meta.s[j[0] - 1][0]) + ' ' + j[0] + ':' + j[1] })}</span></span>${icon.chev}</a>`).join(''); return; }
    if (listState.tab === 'favs') { out.innerHTML = S.q.favs.length ? S.q.favs.map(k => { const [s, v] = k.split(':').map(Number); return `<a class="srow" href="#/quran/${s}/${v}"><span class="num mono">${icon.star}</span><span class="st"><b>${esc(meta.s[s - 1][0])} ${s}:${v}</b></span>${icon.chev}</a>`; }).join('') : `<p class="muted pad">${t('No favourites yet. Open a verse menu and tap Favourite.')}</p>`; return; }
    if (listState.tab === 'notes') {
      const ns = Object.entries(S.q.notes || {}).sort((a, b) => b[1].at - a[1].at);
      out.innerHTML = ns.length ? `<div class="row2 pad"><button class="btn line sm" data-exp="md">${t('Export as Markdown')}</button><button class="btn line sm" data-exp="pdf">${t('Print or save as PDF')}</button></div>` + ns.map(([k, x]) => { const [s, v] = k.split(':').map(Number); return `<a class="srow note-row" href="#/quran/${s}/${v}"><span class="num mono">${icon.guide}</span><span class="st"><b>${esc(surahName(meta, s))} <bdi>${s}:${v}</bdi></b><span class="muted small">${esc(x.text.slice(0, 140))}${x.text.length > 140 ? '…' : ''}</span></span>${icon.chev}</a>`; }).join('') + `<p class="muted small pad">${t('Notes stay on this device and travel with your encrypted backup.')}</p>` : `<p class="muted pad">${t('No notes yet. Open a verse menu and tap Note.')}</p>`;
      return;
    }
    const last = S.q.last, fri = weekday(Date.now()) === 'Friday';
    const marks = (S.q.marks || []).filter(Boolean);
    out.innerHTML = (last ? `<a class="card row" href="#/quran/${last.s}/${last.v}"><span><span class="mono">${t('Resume')}</span><b>${esc(last.n)} · ${last.s}:${last.v}</b></span>${icon.chev}</a>` : `<a class="card row" href="#/quran/1"><span><span class="mono">${t('Start here')}</span><b>${t('Al-Fatihah · The Opener')}</b></span>${icon.chev}</a>`)
      + (marks.length ? `<div class="marks">${marks.map(m => `<a class="mark" href="#/quran/${m.s}/${m.v}">${icon.bookmark}<span><b>${esc(m.name)}</b><small>${esc(surahName(meta, m.s))} · <bdi>${m.s}:${m.v}</bdi></small></span></a>`).join('')}</div>` : '')
      + (fri && !getDay(dayKey(), false).k ? `<a class="card row" href="#/quran/18"><span><span class="mono">${t('Friday')}</span><b>${t('Al-Kahf · The Cave')}</b></span>${icon.chev}</a>` : '')
      + meta.s.map((m, i) => row(i + 1)).join('');
  };
  let tm; $('#qs', root).oninput = e => { listState.q = e.target.value; clearTimeout(tm); tm = setTimeout(draw, 160); };
  root.onclick = e => { const x = e.target.closest('[data-exp]'); if (x) { exportNotes(x.dataset.exp); return; } const b = e.target.closest('[data-tab]'); if (!b) return; listState.tab = b.dataset.tab; listState.q = ''; $('#qs', root).value = ''; $$('[data-tab]', root).forEach(x => x.setAttribute('aria-selected', x === b)); draw(); };
  await draw(); if (listState.y && !listState.q) window.scrollTo(0, listState.y);
  return () => { listState.y = window.scrollY; root.onclick = null; };
}

/* ---------- Reader ---------- */
export async function renderReader(root, sN, vN, extra) {
  const s = Math.min(114, Math.max(1, +sN || 1));
  root.innerHTML = `<p class="muted pad">${t('Loading…')}</p>`;
  let meta, sur, pk = null, wfr = null;
  try {
    meta = await data('meta.json'); sur = await data(`quran/${s}.json`);
    const tf = TRANS[trKey()];
    if (trKey() === 'thai') pk = await thaiSurah(s).catch(() => null);
    else if (tf && tf[1] && tf[1].startsWith('taf:')) { const d = await data(`taf/${tf[1].slice(4)}/${s}.json`); pk = sur.v.map((_, i) => d.m[i + 1] != null ? d.t[d.m[i + 1]] : ''); }
    else if (tf && tf[1]) pk = await data(`${tf[1]}/${s}.json`);
    if (lang() === 'fr') wfr = await data(`wfr/${s}.json`).catch(() => null);
  } catch (e) { root.innerHTML = `<header class="sub"><a href="#/quran" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Quran')}</b><span class="ib"></span></header><p class="muted pad">${t('This surah is not saved on this device yet. Connect once and it will stay available offline.')}</p>`; return; }
  const m = meta.s[s - 1], V = sur.v, n = V.length, name = surahName(meta, s);
  const startV = Math.min(n, Math.max(1, +vN || 1)); let opened = startV;
  if (!S.q.dl) S.q.dl = {};
  await PL.loadSurah(s, name, n);
  const fat = s !== 1 && s !== 9 ? (await data('quran/1.json')).v[0] : null;
  const gloss = (x, i, j) => { if (lang() === 'ar') return ''; if (wfr && wfr[i]) return wfr[i][j]; return x.w ? (lang() === 'th' ? '' : x.w[j][1]) : ''; };
  const translationAt = i => pk ? pk[i] : trKey() === 'thai' ? '' : V[i].t;
  const translationLanguage = { thai: 'th', maash: 'fr', hamidullah: 'fr', itani: 'en', pickthall: 'en', muyassar: 'ar' }[trKey()] || lang();
  const cls = () => `reader ${S.q.book && !S.q.wbw && !S.q.flow ? 'book' : ''} tfs${S.q.tfs ?? 1} ${S.q.wbw ? 'wbw' : ''} ${S.q.flow && !S.q.wbw ? 'flow' : ''} ${S.q.tl ? 'tl' : ''} ${trKey() === 'none' ? 'notr' : ''} h${S.q.hide} fs${S.q.fs}`;
  const words = (arr, x, i) => { const tj = S.q.tj !== false ? tajweed(arr) : arr; return arr.map((w, j) => `<button class="w" data-w="${j}" aria-label="${esc(x && x.w ? x.w[j][0] : w)}"><span class="wa">${tj[j]}</span>${x && x.w ? `<span class="g"><i>${esc(x.w[j][0])}</i>${gloss(x, i, j) ? `<em>${esc(gloss(x, i, j))}</em>` : ''}</span>` : ''}</button>`).join(' '); };
  const verse = (x, i) => {
    const v = i + 1, fav = S.q.favs.includes(s + ':' + v);
    return `<article class="vs" id="v${v}" data-v="${v}"><div class="vhd"><span class="mono" aria-label="${t('Verse {v}', { v })}">${t('Verse {v}', { v })} · ${s}:${v}</span>${fav ? `<span class="favd">${icon.star}</span>` : ''}${(S.q.pins || []).includes(s + ':' + v) ? `<span class="pind" title="${t('Pinned')}">⌖</span>` : ''}${(S.q.marks || []).some(m => m && m.s === s && m.v === v) ? `<span class="markd">${icon.bookmark}</span>` : ''}<button class="ib vmenu" data-menu="${v}" aria-label="${t('Verse {v} options', { v })}">${icon.more}</button></div>
      <p class="ar" lang="ar" dir="rtl">${words(x.a, x, i)} <button class="vend" data-menu="${v}" aria-label="${t('Verse {v} options', { v })}">۝${arNum(v)}</button></p>
      ${SAJDA.has(s + ':' + v) ? `<p class="sajda">۩ ${t('Verse of prostration')}</p>` : ''}
      <p class="tlit">${esc(x.l)}</p><p class="tr" data-n="${v}" lang="${translationLanguage}" ${trKey() === 'muyassar' ? 'dir="rtl"' : ''}>${esc(translationAt(i))}</p>
      ${S.q.notes && S.q.notes[s + ':' + v] ? `<div class="vnote"><span class="mono">${t('My note')}</span><p>${esc(S.q.notes[s + ':' + v].text)}</p><button class="linkbtn small" data-note="${v}">${t('Edit')}</button></div>` : ''}
      <div class="vact"><button class="chip ctx" data-ctx="${v}">${icon.book}${t('Context')}</button><button class="chip" data-note="${v}">${icon.guide}${t('Note')}</button></div></article>`;
  };
  root.innerHTML = `<header class="sub rbar"><a href="#/quran" class="ib" aria-label="${t('Back to list')}">${icon.back}</a><div class="rt"><b>${esc(name)} <span class="arn" lang="ar">${m[2]}</span></b><span class="mono">${esc(meaning(meta, s))} · ${t('{n} verses', { n })}</span></div>
      <button class="ib reader-options" id="rset" aria-label="${t('Reading options')}" title="${t('Reading options')}">${icon.sliders}</button></header>
    <div class="${cls()}" id="rd">${S.q.tj !== false ? (S.q.tjSeen ? `<button class="linkbtn small tjlink" id="tjleg">${t('Tajweed colours: what they mean')}</button>` : `<button class="tjleg" id="tjleg" aria-label="${t('Tajweed colours: what they mean')}">${RULES.map(r => `<span class="tj-${r}">${t(TJN[r])}</span>`).join('')}</button>`) : ''}<div id="hidebar"></div><div id="pinbar"></div>${!vN && S.q.last && S.q.last.s === s && S.q.last.v > 1 ? `<a class="resume" href="#/quran/${s}/${S.q.last.v}">${t('You stopped at verse {v}', { v: S.q.last.v })} · <b>${t('Go there')}</b></a>` : ''}${trKey() !== 'none' && lang() !== 'ar' ? `<p class="trsrc mono">${t('Translation of the meaning')} · <button class="linkbtn small" id="trcred">${esc(trName())} ⓘ</button></p>` : ''}${trKey() === 'thai' && !pk ? `<p class="muted pad" role="status">${t('Thai translation source could not load. The Arabic text is still available.')}</p>` : ''}${fat ? `<p class="bism ar" id="v0" lang="ar" dir="rtl">${(S.q.tj !== false ? tajweed(fat.a) : fat.a).map((w, j) => `<span class="w" data-w="${j}"><span class="wa">${w}</span></span>`).join(' ')}</p>` : ''}${V.map(verse).join('')}
      <p class="endsur" dir="auto">${t('End of the surah. May Allah make it light for you and accept it.')}</p>
      <nav class="rnav">${s > 1 ? `<a class="btn line sm" href="#/quran/${s - 1}">‹ ${esc(surahName(meta, s - 1))}</a>` : '<span></span>'}${s < 114 ? `<a class="btn line sm" href="#/quran/${s + 1}">${esc(surahName(meta, s + 1))} ›</a>` : ''}</nav></div>
    <div class="player ${S.q.pfull ? 'full' : ''}" id="pl">
      <div class="prow pseekrow"><span class="mono ptime" id="pt0">0:00</span><input type="range" id="pseek" min="0" max="1000" value="0" step="1" aria-label="${t('Position in the surah')}"><span class="mono ptime" id="pt1">${PL.fmt(PL.totalMs())}</span></div>
      <div class="prow pctl"><button class="ib" id="psprev" aria-label="${t('Previous surah')}" ${s <= 1 ? 'disabled' : ''}>${icon.sprev}</button><button class="ib" id="pprev" aria-label="${t('Previous verse')}">${icon.vprev}</button><button class="pbtn" id="pp" aria-label="${t('Play')}">${icon.play}</button><button class="ib" id="pnext" aria-label="${t('Next verse')}">${icon.vnext}</button><button class="ib" id="psnext" aria-label="${t('Next surah')}" ${s >= 114 ? 'disabled' : ''}>${icon.snext}</button><button class="ib pmore" id="pmore" aria-expanded="${!!S.q.pfull}" aria-label="${t('More audio settings')}">${icon.sliders}</button></div>
      <p class="pinfo mono"><span class="plabel" id="plab"></span> <span class="pvr" id="pvr" aria-live="off"></span></p>
      <div class="pchips"><button class="chip" id="pmode" aria-label="${t('Play mode')}"></button><button class="chip" id="psp" aria-label="${t('Playback speed')}">${t('Speed')} ${S.q.speed}×</button><button class="chip" id="prc" aria-label="${t('Change reciter')}"><span id="prcn">${esc(PL.RECITERS[S.q.reciter])}</span> ▾</button><button class="chip" id="psl" aria-label="${t('Sleep timer')}">${t('Timer')}</button></div>
    </div>`;
  const rd = $('#rd', root), pl = $('#pl', root), seekEl = $('#pseek', pl);
  // The player lives outside the scrolling view, so it always stays at the bottom of the screen.
  document.querySelectorAll('body > .player').forEach(x => x.remove()); document.body.appendChild(pl);
  if (!S.seenWordHint) { S.seenWordHint = true; save(); setTimeout(() => toast(t('Tip: tap an Arabic word to see its meaning and hear it.')), 600); }
  const setLast = v => { S.q.last = { s, v, n: name, at: Date.now() }; S.q.seen = S.q.seen || {}; S.q.seen[s] = 1; save(); };
  if (s === 1) { S.learnDone = S.learnDone || {}; if (!S.learnDone.fatiha) { S.learnDone.fatiha = true; save(); } }

  /* colour sweep */
  let litV = null, raf = 0, dragging = false, userScroll = 0;
  const clearLit = () => { if (litV == null) return; const el = $('#v' + litV, rd); if (el) { el.classList.remove('playing'); $$('.wa', el).forEach(w => w.style.removeProperty('--p')); } litV = null; };
  const frame = () => {
    raf = 0;
    if (PL.P.s !== s || PL.P.v == null) { clearLit(); return; }
    const v = PL.P.v, el = $('#v' + v, rd);
    if (litV !== v) {
      clearLit(); litV = v;
      if (el) { el.classList.add('playing'); if (Date.now() - userScroll > 4000) el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
    }
    if (el) { const ws = $$('.wa', el), pr = PL.wordProgress(ws.length); ws.forEach((w, i) => w.style.setProperty('--p', (pr[i] * 100).toFixed(1) + '%')); }
    const tot = PL.totalMs(), pos = PL.posMs();
    if (!dragging) { seekEl.value = tot ? Math.round(pos / tot * 1000) : 0; seekEl.setAttribute('aria-valuetext', `${PL.fmt(pos)} / ${PL.fmt(tot)}`); }
    $('#pt0', pl).textContent = PL.fmt(pos); $('#pt1', pl).textContent = PL.fmt(tot);
    { const on = PL.P.s === s && PL.P.v != null; const vr = on ? Math.max(0, PL.startOf(PL.P.v + 1) - pos) : 0; $('#pvr', pl).textContent = on && PL.P.v > 0 ? t('Verse {v} · {r} left in this verse · {a} left in the surah', { v: PL.P.v, r: PL.fmt(Math.min(vr, PL.startOf(PL.P.v + 1) - PL.startOf(PL.P.v))), a: PL.fmt(tot - pos) }) : ''; }
    if (PL.isPlaying()) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const drawPlayer = info => {
    const on = PL.P.s === s && PL.P.v != null, playing = on && PL.isPlaying();
    $('#pp', pl).innerHTML = playing ? icon.pause : icon.play; $('#pp', pl).setAttribute('aria-label', t(playing ? 'Pause' : 'Play'));
    $('#plab', pl).textContent = info || (on ? (PL.P.v === 0 ? t('Basmala') : `${s}:${PL.P.v}`) + (PL.P.mode === 'verse' ? t(' · looping verse') : PL.P.mode === 'range' ? t(' · loop {a}–{b}', { a: PL.P.a, b: PL.P.b }) : '') : (S.q.hide ? t('Tap a hidden word to reveal it') : ''));
    $('#psp', pl).textContent = t('Speed') + ' ' + S.q.speed + '×';
    $('#prcn', pl).textContent = PL.RECITERS[S.q.reciter];
    $('#pmode', pl).textContent = modeLabel();
    const sl = PL.sleepLeft(); $('#psl', pl).textContent = sl === 'end' ? t('Stops at the end') : sl ? t('Stops in {m} min', { m: Math.ceil(sl / 60000) }) : t('Timer'); $('#psl', pl).setAttribute('aria-pressed', !!sl);
    if (PL.P.gap && on) $('#plab', pl).textContent = t('Your turn: recite…');
    const hbEl = $('#hidebar', root); if (hbEl) hbEl.innerHTML = S.q.hide ? `<div class="card row hidebar"><span>${t(['', 'A third of the words are hidden.', 'Half of the words are hidden.', 'All words are hidden.'][S.q.hide])}</span><button class="btn line sm" id="unhide">${t('Back to normal reading')}</button></div>` : '';
    kick();
  };
  const off = PL.onChange(() => { if (PL.P.auto && PL.P.s !== s) { PL.P.auto = false; location.hash = '#/quran/' + PL.P.s; return; } drawPlayer(); });
  drawPlayer();
  const refresh = () => {
    const anchor = $$('.vs', rd).find(el => el.getBoundingClientRect().top >= 60) ;
    rd.className = cls(); $$('.w.rev', rd).forEach(w => w.classList.remove('rev')); drawPlayer();
    if (anchor) requestAnimationFrame(() => { anchor.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70); });
  };

  seekEl.addEventListener('input', () => { dragging = true; $('#pt0', pl).textContent = PL.fmt(seekEl.value / 1000 * PL.totalMs()); });
  seekEl.addEventListener('change', () => { dragging = false; PL.seek(seekEl.value / 1000 * PL.totalMs()); });

  const tafsir = async v => {
    let sel = (S.q.taf && S.q.taf.length ? S.q.taf : defaultTafsirs()).filter(k => TAFSIRS[k]).slice(0, 2), cmp = sel.length > 1;
    const el = sheet(`<h3>${t('Context &amp; tafsir · {k}', { k: s + ':' + v })}</h3>
      <div class="chips scroll" id="tfc">${Object.entries(TAFSIRS).map(([k, l]) => `<button class="chip" data-tk="${k}" aria-pressed="${sel.includes(k)}">${esc(t(l[0]))}</button>`).join('')}</div>
      <div class="tfbar"><span class="muted small">${t('Swipe the list for more sources.')}</span><button class="chip" id="tcmp" aria-pressed="${sel.length > 1}">${t('Compare two')}</button></div><div class="sbody" id="tf"></div>${v < n ? `<button class="btn line sm" data-nextv="${v + 1}">${t('Next verse')} ›</button>` : ''}`, { dark: document.body.classList.contains('dark'), label: t('Tafsir') });
    const draw = async () => {
      const box = $('#tf', el); box.innerHTML = `<p class="ar" lang="ar" dir="rtl">${V[v - 1].a.join(' ')}</p><p class="muted">${t('Loading…')}</p>`;
      const parts = await Promise.all(sel.map(async k => { try { return [k, await tafsirText(k, s, v)]; } catch (e) { return [k, null]; } }));
      box.innerHTML = `<div class="qblk"><span class="mono">${t('Quran')} · ${s}:${v}</span><p class="ar" lang="ar" dir="rtl">${V[v - 1].a.join(' ')}</p>${lang() !== 'ar' ? `<p class="trq">« ${esc(translationAt(v - 1))} »</p>` : ''}</div><p class="legend2 small">${t('Solid line: the Quran. Dotted line: explanation by scholars.')}</p>` + parts.map(([k, x]) => `<section class="tfs"><span class="mono">${esc(t(TAFSIRS[k][0]))}${TAFSIRS[k][2] !== lang() ? ` · <em class="lng">${t({ en: 'in English', ar: 'in Arabic', fr: 'in French', th: 'in Thai' }[TAFSIRS[k][2]])}</em>` : ''}</span>${TDESC[k] ? `<p class="tdesc">${t(TDESC[k])}</p>` : ''}${k === 'th-mukhtasar' ? `<p class="small"><a href="https://quranenc.com/th/browse/thai_mokhtasar/${s}" target="_blank" rel="noopener noreferrer">QuranEnc · Al-Mukhtasar · v1.0.0</a></p>` : ''}${x == null ? `<p class="muted">${t('Not saved on this device yet. Connect once to keep it offline.')}</p>` : x ? `<div class="tfx ${x.length > 420 ? 'clamp' : ''}"><p lang="${TAFSIRS[k][2]}" ${TAFSIRS[k][2] === 'ar' ? 'dir="rtl"' : ''}>${esc(x).replace(/\n+/g, '</p><p>')}</p></div>${x.length > 420 ? `<button class="linkbtn small" data-more>${t('Read more')}</button>` : ''}` : `<p class="muted">${t('No text from this source for this verse.')}</p>`}</section>`).join('');
    };
    el.onclick = e => {
      const nv = e.target.closest('[data-nextv]'); if (nv) { closeSheet(); setLast(+nv.dataset.nextv); tafsir(+nv.dataset.nextv); return; }
      const mo = e.target.closest('[data-more]'); if (mo) { mo.previousElementSibling.classList.remove('clamp'); mo.remove(); return; }
      if (e.target.closest('#tcmp')) { cmp = !cmp; if (!cmp) sel = sel.slice(0, 1); $('#tcmp', el).setAttribute('aria-pressed', cmp); S.q.taf = sel; save(); $$('[data-tk]', el).forEach(x => x.setAttribute('aria-pressed', sel.includes(x.dataset.tk))); draw(); if (cmp) toast(t('Pick a second source to compare.')); return; }
      const b = e.target.closest('[data-tk]'); if (!b) return; const k = b.dataset.tk;
      if (!cmp) sel = [k]; else { sel = sel.includes(k) ? sel.filter(x => x !== k) : [...sel, k].slice(-2); if (!sel.length) sel = [k]; }
      S.q.taf = sel; save(); $$('[data-tk]', el).forEach(x => x.setAttribute('aria-pressed', sel.includes(x.dataset.tk))); draw();
    };
    draw();
  };
  const rerenderVerse = v => { const el = $('#v' + v, rd); if (!el) return; const y0 = el.getBoundingClientRect().top; el.outerHTML = verse(V[v - 1], v - 1); const n2 = $('#v' + v, rd); if (n2) window.scrollBy(0, n2.getBoundingClientRect().top - y0); };
  const drawPins = () => { const b = $('#pinbar', root); if (!b) return; const n = (S.q.pins || []).length; b.innerHTML = n ? `<div class="card row pinbar"><span>${t(n === 1 ? '1 pinned verse' : '{n} pinned verses', { n })}</span><button class="btn line sm" id="cmpgo">${t('Compare')}</button></div>` : ''; };
  const noteSheet = v => {
    const k = s + ':' + v, cur = (S.q.notes || {})[k];
    const el = sheet(`<h3>${t('My note')} · <bdi>${s}:${v}</bdi></h3><p class="muted small">${t('Private. Stays on this device and in your encrypted backup.')}</p><textarea id="ntext" class="inp ntext" rows="6" maxlength="4000" aria-label="${t('My note')}">${esc(cur ? cur.text : '')}</textarea><div class="row2"><button class="btn sm" id="nsave">${t('Save')}</button>${cur ? `<button class="btn line sm danger" id="ndel">${t('Delete')}</button>` : ''}</div>`, { dark: document.body.classList.contains('dark'), label: t('My note') });
    el.querySelector('#ntext').focus();
    el.onclick = e => {
      if (e.target.id === 'nsave') { const txt = el.querySelector('#ntext').value.trim(); S.q.notes = S.q.notes || {}; if (txt) S.q.notes[k] = { text: txt, at: Date.now() }; else delete S.q.notes[k]; save(); closeSheet(); rerenderVerse(v); toast(txt ? t('Note saved') : t('Note deleted')); }
      if (e.target.id === 'ndel') { delete S.q.notes[k]; save(); closeSheet(); rerenderVerse(v); toast(t('Note deleted')); }
    };
  };
  const markSheet = v => {
    const marks = [0, 1, 2].map(i => (S.q.marks || [])[i] || null), dn = [t('Khatm'), t('Memorisation'), t('Reading')];
    const el = sheet(`<h3>${t('Named bookmarks')}</h3><p class="muted small">${t('Up to three, for parallel readings. Choose a slot for {k}.', { k: s + ':' + v })}</p>${marks.map((m, i) => `<div class="mslot"><input class="inp" data-mn="${i}" value="${esc(m ? m.name : dn[i])}" aria-label="${t('Bookmark name')}"><span class="muted small">${m ? `${esc(m.n || '')} <bdi>${m.s}:${m.v}</bdi>` : t('Empty')}</span><button class="btn sm" data-ms="${i}">${t('Put here')}</button>${m ? `<button class="linkbtn small" data-mx="${i}">${t('Clear')}</button>` : ''}</div>`).join('')}`, { dark: document.body.classList.contains('dark'), label: t('Named bookmarks') });
    el.onclick = e => {
      const a = e.target.closest('[data-ms]'), x = e.target.closest('[data-mx]'); if (!a && !x) return;
      const m = [0, 1, 2].map(i => (S.q.marks || [])[i] || null);
      if (a) { const i = +a.dataset.ms; m[i] = { name: el.querySelector(`[data-mn="${i}"]`).value.trim() || dn[i], s, v, n: name }; toast(t('Bookmark set: {n}', { n: m[i].name })); }
      if (x) m[+x.dataset.mx] = null;
      S.q.marks = m; save(); closeSheet(); rerenderVerse(v);
    };
  };
  const onPins = () => drawPins(); window.addEventListener('safa:pins', onPins);
  const menu = v => {
    const k = s + ':' + v, fav = S.q.favs.includes(k);
    const el = sheet(`<h3>${esc(name)} · ${s}:${v}</h3><div class="acts">
        <button data-a="play">${icon.play}${t('Play from here')}</button>
        <button data-a="loop">${icon.repeat}${t('Loop this verse')}</button>
        <div class="looprow"><span>${t('Loop from {v} to', { v })}</span><select id="lto" class="inp" aria-label="${t('Last verse of the loop')}">${V.slice(v - 1).map((_, i) => `<option value="${v + i}" ${i === Math.min(4, n - v) ? 'selected' : ''}>${v + i}</option>`).join('')}</select><button class="btn sm" data-a="range">${t('Start')}</button></div>
        <button data-a="taf">${icon.book}${t('Context &amp; tafsir')}</button>
        <button data-a="fav">${icon.star}${t(fav ? 'Remove from favourites' : 'Add to favourites')}</button>
        <button data-a="note">${icon.guide}${t(S.q.notes && S.q.notes[k] ? 'Edit my note' : 'Write a note')}</button>
        <button data-a="mark">${icon.bookmark}${t('Set a named bookmark')}</button>
        <button data-a="pin">⌖ ${t((S.q.pins || []).includes(k) ? 'Unpin' : 'Pin to compare')}</button>
        <button data-a="share">${icon.plane}${t('Share this verse')}</button>
        <button data-a="copy">${icon.quran}${t('Copy verse')}</button>
        <a class="rep" href="${reportUrl('Quran ' + s + ':' + v)}" target="_blank" rel="noopener">${t('Report an error in this verse')}</a></div>`, { dark: document.body.classList.contains('dark'), label: t('Verse {v} options', { v }) });
    el.onclick = async e => {
      const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
      if (a === 'play') { PL.P.mode = 'off'; PL.playVerse(v); }
      if (a === 'loop') PL.loopVerse(v);
      if (a === 'range') PL.loopRange(v, +$('#lto', el).value);
      if (a === 'fav') { S.q.favs = fav ? S.q.favs.filter(x => x !== k) : [...S.q.favs, k]; save(); const vh = $('#v' + v + ' .vhd', rd), d = $('.favd', vh); if (fav && d) d.remove(); else if (!fav) vh.querySelector('.mono').insertAdjacentHTML('afterend', `<span class="favd">${icon.star}</span>`); toast(t(fav ? 'Removed' : 'Saved to favourites')); }
      if (a === 'share') { const txt = `${V[v - 1].a.join(' ')}\n\n${pk ? pk[v - 1] : V[v - 1].t}\n— ${t('Quran')} ${s}:${v}\n\nsafa. · ${location.origin}${location.pathname.replace(/app\/.*$/, '')}`; try { if (navigator.share) await navigator.share({ text: txt }); else { await navigator.clipboard.writeText(txt); toast(t('Copied')); } } catch (err) { /* cancelled */ } }
      if (a === 'copy') { const txt = `${V[v - 1].a.join(' ')}\n\n${pk ? pk[v - 1] : V[v - 1].t}\n— ${t('Quran')} ${s}:${v}`; (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast(t('Copied: Arabic, translation and reference.')), () => toast(t('Copy is not available here'))); }
      if (a === 'share') { setLast(v); closeSheet(); return; }
      setLast(v); closeSheet(); if (a === 'taf') tafsir(v);
      if (a === 'note') noteSheet(v);
      if (a === 'mark') markSheet(v);
      if (a === 'pin') { const p = S.q.pins || []; S.q.pins = p.includes(k) ? p.filter(x => x !== k) : [...p, k].slice(-4); save(); rerenderVerse(v); drawPins(); toast(S.q.pins.includes(k) ? t('Pinned. Pin another verse to compare.') : t('Unpinned')); }
    };
  };
  function modeLabel() { const m = S.q.pm || 'next', g = S.q.grp || 0; return t({ stop: 'Stop at the end', next: 'Surah after surah', repeat: 'Repeat' }[m]) + (g ? ' · ' + t(g === 1 ? '1 verse' : '{n} verses', { n: g }) : ''); }
  const modes = () => {
    const m = S.q.pm || 'next', g = S.q.grp || 0;
    const el = sheet(`<h3>${t('Play mode')}</h3>
      <p class="mono">${t('Surah options')}</p><div class="acts radio">${[['stop', 'Stop at the end of the surah or group'], ['next', 'Play surah after surah'], ['repeat', 'Repeat the surah or group']].map(([k, l]) => `<button data-pm="${k}" role="radio" aria-checked="${m === k}"><span>${t(l)}</span><i class="rdo"></i></button>`).join('')}</div>
      <p class="mono">${t('Grouped verses')}</p><div class="acts radio">${PL.GROUPS.map(n => `<button data-grp="${n}" role="radio" aria-checked="${g === n}"><span>${n ? t(n === 1 ? 'Play the next verse only' : 'Play the next {n} verses', { n }) : t('Verse after verse')}</span><i class="rdo"></i></button>`).join('')}</div>
      <p class="muted small">${t('A group starts at the verse you play. Then it stops, or starts again if you chose Repeat.')}</p>`, { dark: document.body.classList.contains('dark'), label: t('Play mode') });
    el.onclick = e => {
      const a = e.target.closest('[data-pm]'), b = e.target.closest('[data-grp]'); if (!a && !b) return;
      PL.setMode(a ? a.dataset.pm : null, b ? +b.dataset.grp : null);
      $$('[data-pm]', el).forEach(x => x.setAttribute('aria-checked', x.dataset.pm === (S.q.pm || 'next'))); $$('[data-grp]', el).forEach(x => x.setAttribute('aria-checked', +x.dataset.grp === (S.q.grp || 0)));
      drawPlayer();
    };
  };
  const reciters = () => {
    const el = sheet(`<h3>${t('Reciter')}</h3><p class="muted small">${t('Every reciter here follows the text word by word: the colour moves with the voice.')}</p><div class="acts">${Object.entries(PL.RECITERS).map(([k, l]) => `<button data-rc="${k}" aria-pressed="${S.q.reciter === k}">${S.q.reciter === k ? icon.check : ''}${esc(l)}</button>`).join('')}</div>`, { dark: document.body.classList.contains('dark'), label: t('Reciter') });
    el.onclick = async e => { const b = e.target.closest('[data-rc]'); if (!b) return; const was = PL.P.s === s && PL.P.v != null ? PL.P.v : null; S.q.reciter = b.dataset.rc; save(); PL.stop(); closeSheet(); await PL.loadSurah(s, name, n); drawPlayer(); if (was != null) PL.playVerse(was); };
  };
  const settings = async () => {
    const key = S.q.reciter + '|' + s;
    const durs = await data('timing/durations.json').catch(() => null);
    const kbps = +(S.q.reciter.match(/(\d+)kbps/) || [0, 128])[1];
    const mb = list => durs ? Math.round(list.reduce((a, [ss, vv]) => a + (durs[S.q.reciter][ss - 1][vv - 1] || 0), 0) / 10 * kbps / 8 / 1024) : '?';
    const juzOf = () => { let j = 0; meta.juz.forEach((x, i) => { if (x[0] < s || (x[0] === s && x[1] <= 1)) j = i; }); return j; };
    const range = (a, b) => { const out = []; for (let ss = a[0]; ss <= b[0]; ss++) for (let vv = ss === a[0] ? a[1] : 1; vv <= (ss === b[0] ? b[1] : meta.s[ss - 1][3]); vv++) out.push([ss, vv]); return out; };
    const surahList = range([s, 1], [s, n]); const ji = juzOf();
    const juzList = range(meta.juz[ji], ji < 29 ? (meta.juz[ji + 1][1] > 1 ? [meta.juz[ji + 1][0], meta.juz[ji + 1][1] - 1] : [meta.juz[ji + 1][0] - 1, meta.s[meta.juz[ji + 1][0] - 2][3]]) : [114, 6]);
    const allList = range([1, 1], [114, 6]);
    let ctl = {};
    const saved = await PL.countSaved(allList);
    const el = sheet(`<h3>${t('Reader')}</h3><div class="sbody">
        <h4 class="shd">${t('Text')}</h4>
        <label class="tog"><span>${t('Word by word')}<small>${t('Arabic, transliteration and meaning under each word')}${lang() === 'fr' ? ' · ' + t('French meanings by Dr Usama Nonnenmacher') : ''}</small></span><input type="checkbox" id="swbw" ${S.q.wbw ? 'checked' : ''}></label>
        <label class="tog"><span>${t('Mushaf flow')}<small>${t('Continuous Arabic, no translation')}</small></span><input type="checkbox" id="sflow" ${S.q.flow ? 'checked' : ''}></label>
        <label class="tog"><span>${t('Read like a book')}<small>${t('The translation as continuous text, without verse breaks')}</small></span><input type="checkbox" id="sbook" ${S.q.book ? 'checked' : ''}></label>
        <label class="tog"><span>${t('Verse transliteration')}</span><input type="checkbox" id="stl" ${S.q.tl ? 'checked' : ''}></label>
        <label class="tog"><span>${t('Tajweed colours')}<small>${t('Qalqala, iqlab, idgham, ikhfa, ghunna')}</small></span><input type="checkbox" id="stj" ${S.q.tj !== false ? 'checked' : ''}></label>
        <label class="lbl" for="str">${t('Translation')}</label><select id="str" class="inp">${Object.entries(TRANS).map(([k, l]) => `<option value="${k}" ${trKey() === k ? 'selected' : ''}>${t(l[0])}</option>`).join('')}</select>
        <label class="lbl">${t('Translation size')}</label><div class="seg">${[0, 1, 2, 3].map(i => `<button data-tfs="${i}" aria-pressed="${(S.q.tfs ?? 1) === i}" style="font-size:${12 + i * 3}px">A</button>`).join('')}</div>
        <label class="lbl">${t('Arabic size')}</label><div class="seg">${[0, 1, 2, 3].map(i => `<button data-fs="${i}" aria-pressed="${S.q.fs === i}" style="font-size:${14 + i * 4}px">ع</button>`).join('')}</div>
        <h4 class="shd">${t('Listening')}</h4>
        <label class="lbl" for="srec">${t('Reciter')}</label><select id="srec" class="inp">${Object.entries(PL.RECITERS).map(([k, l]) => `<option value="${k}" ${S.q.reciter === k ? 'selected' : ''}>${l}</option>`).join('')}</select><p class="muted small">${t('Every reciter here follows the text word by word: the colour moves with the voice.')}</p>
        <label class="lbl">${t('Speed')}</label><div class="seg">${[0.75, 1, 1.25, 1.5].map(x => `<button data-spd="${x}" aria-pressed="${S.q.speed === x}">${x}×</button>`).join('')}</div>
        <button class="btn line sm" id="smode">${t('Play mode')} · ${esc(modeLabel())}</button>
        <label class="lbl">${t('Silence before each repetition')}</label><div class="seg">${[0, 3, 5, 10].map(x => `<button data-gap="${x}" aria-pressed="${(+S.q.gap || 0) === x}">${x ? x + ' s' : t('None')}</button>`).join('')}</div>
        <p class="muted small">${t('When a verse or group repeats, a pause lets you recite it back.')}</p>
        <h4 class="shd">${t('Memorise')}</h4>
        <label class="lbl">${t('Hide words to test your memory')}</label><div class="seg">${[0, 1, 2, 3].map(i => `<button data-hide="${i}" aria-pressed="${S.q.hide === i}">${t(['None', '⅓', '½', 'All'][i])}</button>`).join('')}</div>
        <a class="btn line sm" href="#/hifz">${t('Memorisation plan')}</a>
        <h4 class="shd">${t('Offline audio')}</h4>
        <p class="muted small">${t('{a} of {b} verses already saved for this reciter.', { a: saved.toLocaleString(), b: allList.length.toLocaleString() })}</p>
        <button class="btn line" data-dl="surah">${S.q.dl[key] ? t('Audio saved for offline ✓') : t('Save this surah · {n} MB', { n: mb(surahList) })}</button>
        <button class="btn line" data-dl="juz">${t('Save juz {j} · {n} MB', { j: ji + 1, n: mb(juzList) })}</button>
        <button class="btn line" data-dl="all">${t('Save the whole Quran…')}</button>
        <div id="dlconfirm"></div>
        <button class="btn line sm" id="stest">${t('Test the audio')}</button>
        <p class="muted small">${t('Listening uses about 1 MB per minute of mobile data, unless the surah is saved.')}</p><p class="muted small">${t('Text, translation and tafsir are stored on the device. Audio streams unless you save it.')}</p></div>`, { dark: document.body.classList.contains('dark'), label: t('Reader settings'), opener: $('#rset', root) });
    el.onchange = async e => {
      const id = e.target.id;
      if (id === 'swbw') { S.q.wbw = e.target.checked; if (S.q.wbw) S.q.flow = false; }
      if (id === 'sflow') { S.q.flow = e.target.checked; if (S.q.flow) { S.q.wbw = false; S.q.book = false; } }
      if (id === 'sbook') { S.q.book = e.target.checked; if (S.q.book) { S.q.wbw = false; S.q.flow = false; } }
      if (id === 'stl') S.q.tl = e.target.checked;
      if (id === 'stj') { S.q.tj = e.target.checked; save(); closeSheet(); window.dispatchEvent(new Event('hashchange')); return; }
      if (id === 'srec') { S.q.reciter = e.target.value; save(); PL.stop(); await PL.loadSurah(s, name, n); drawPlayer(); return; }
      if (id === 'str') { S.q.tr = e.target.value; save(); closeSheet(); window.dispatchEvent(new Event('hashchange')); return; }
      if (id === 'swbw' && S.q.wbw) S.q.book = false; save(); refresh(); if (['swbw', 'sflow', 'sbook'].includes(id)) { $('#swbw', el).checked = S.q.wbw; $('#sflow', el).checked = S.q.flow; $('#sbook', el).checked = S.q.book; }
    };
    el.onclick = async e => {
      const f = e.target.closest('[data-fs]'); if (f) { S.q.fs = +f.dataset.fs; save(); refresh(); $$('[data-fs]', el).forEach(x => x.setAttribute('aria-pressed', x === f)); return; }
      if (e.target.id === 'stest') { PL.playFrom(1); closeSheet(); return; }
      const tz = e.target.closest('[data-tfs]'); if (tz) { S.q.tfs = +tz.dataset.tfs; save(); refresh(); $$('[data-tfs]', el).forEach(x => x.setAttribute('aria-pressed', x === tz)); return; }
      const sp = e.target.closest('[data-spd]'); if (sp) { PL.setSpeed(+sp.dataset.spd); $$('[data-spd]', el).forEach(x => x.setAttribute('aria-pressed', x === sp)); return; }
      const gp = e.target.closest('[data-gap]'); if (gp) { PL.setGap(+gp.dataset.gap); $$('[data-gap]', el).forEach(x => x.setAttribute('aria-pressed', x === gp)); return; }
      const hd = e.target.closest('[data-hide]'); if (hd) { S.q.hide = +hd.dataset.hide; save(); refresh(); $$('[data-hide]', el).forEach(x => x.setAttribute('aria-pressed', x === hd)); return; }
      if (e.target.id === 'smode') { closeSheet(); modes(); return; }
      if (e.target.id === 'dlpause') { ctl.stop = true; return; }
      if (e.target.id === 'dlno') { $('#dlconfirm', el).innerHTML = ''; return; }
      const d = e.target.closest('[data-dl]'); if (!d || d.disabled) return;
      if (d.dataset.dl === 'all' && !d.dataset.ok) {
        $('#dlconfirm', el).innerHTML = `<div class="card stack"><p>${t('The whole Quran with {r}: about {n} MB, {m} still to download. Wi-Fi recommended.', { r: esc(PL.RECITERS[S.q.reciter]), n: mb(allList), m: (allList.length - saved).toLocaleString() + ' ' + t('verses') })}</p><div class="row2"><button class="btn sm" data-dl="all" data-ok="1">${t('Download')}</button><button class="btn line sm" id="dlno">${t('Cancel')}</button></div></div>`;
        return;
      }
      const list = { surah: surahList, juz: juzList, all: allList }[d.dataset.dl]; d.disabled = true;
      ctl = {}; if (d.dataset.dl !== 'surah') { d.insertAdjacentHTML('afterend', `<button class="btn line sm" id="dlpause">${t('Pause the download')}</button>`); }
      try {
        await PL.saveAudio(list, (i, tot) => { d.textContent = t('Saving… {a} / {b}', { a: i, b: tot }); }, ctl);
        $('#dlpause', el)?.remove();
        if (d.dataset.dl === 'surah') S.q.dl[key] = n; else if (d.dataset.dl === 'all') { for (let ss = 1; ss <= 114; ss++) S.q.dl[S.q.reciter + '|' + ss] = meta.s[ss - 1][3]; } else { new Set(juzList.map(x => x[0])).forEach(ss => { if (juzList.filter(x => x[0] === ss).length === meta.s[ss - 1][3]) S.q.dl[S.q.reciter + '|' + ss] = meta.s[ss - 1][3]; }); }
        save(); d.textContent = t('Audio saved for offline ✓');
      } catch (err) { $('#dlpause', el)?.remove(); d.disabled = false; d.textContent = err.paused ? t('Paused. Tap to resume where it stopped.') : t('Could not save. Check your connection and retry.'); }
    };
  };

  rd.onclick = e => {
    const nb = e.target.closest('[data-note]'); if (nb) { noteSheet(+nb.dataset.note); return; }
    if (e.target.id === 'cmpgo') { compareSheet(); return; }
    if (e.target.id === 'unhide') { S.q.hide = 0; save(); refresh(); return; }
    if (e.target.id === 'trcred') { sheet(`<h3>${t('Translation')}</h3><div class="sbody"><p><b>${esc(trName())}</b></p><p class="muted small">${t('A translation conveys the meaning; it is not the Quran itself. The Arabic text is the Uthmani script (King Fahd Complex, Hafs).')}</p>${trKey() === 'thai' ? `<p class="muted small"><a href="https://tanzil.net/trans/" rel="noopener noreferrer" target="_blank">Tanzil · ${esc(t(THAI_QURAN_LABEL))}</a></p>` : ''}<p class="muted small">${t('Change the translation in Reading options, under Text.')}</p></div>`, { dark: document.body.classList.contains('dark'), label: t('Translation'), opener: e.target }); return; }
    if (e.target.closest('#tjleg') && !S.q.tjSeen) { S.q.tjSeen = true; save(); }
    if (e.target.closest('#tjleg')) { sheet(`<h3>${t('Tajweed colours')}</h3><div class="sbody">${RULES.map(r => `<p><b class="tj-${r}">${t(TJN[r])}</b> · ${t(TJD[r])}</p>`).join('')}<p class="muted small">${t('Colours are computed from the Uthmani script, not checked by a teacher. Learn tajweed with a teacher. Report any mistake.')}</p><p class="muted small">${t('Turn the colours off in Aa.')}</p></div>`, { dark: document.body.classList.contains('dark'), label: t('Tajweed colours') }); return; }
    const mb = e.target.closest('[data-menu]'); if (mb) { menu(+mb.dataset.menu); return; }
    const cb = e.target.closest('[data-ctx]'); if (cb) { setLast(+cb.dataset.ctx); tafsir(+cb.dataset.ctx); return; }
    const w = e.target.closest('button.w'); if (!w) return;
    const v = +w.closest('.vs').dataset.v, j = +w.dataset.w, x = V[v - 1];
    if (S.q.hide && !w.classList.contains('rev') && getComputedStyle(w.querySelector('.wa')).filter !== 'none') { w.classList.add('rev'); return; }
    $$('.w.on', rd).forEach(y => y.classList.remove('on')); w.classList.add('on');
    setLast(v);
    // The word panel opens silently; listening is its own explicit button.
    const wp = sheet(`<div class="wpanel"><p class="ar wbig" lang="ar" dir="rtl">${x.a[j]}</p>${x.w ? `<p class="mono">${esc(x.w[j][0])}</p>${gloss(x, v - 1, j) ? `<p>${esc(gloss(x, v - 1, j))}</p>` : lang() === 'th' ? `<p class="small muted">${t('No Thai word-by-word gloss is available for this verse.')}</p>` : ''}` : ''}<p class="muted small">${esc(name)} · ${s}:${v} · ${t('word {n}', { n: j + 1 })}</p>
      <div class="row2"><button class="btn" id="wlisten">${icon.play} ${t('Listen to this word')}</button><button class="btn line" id="wfrom">${t('Play the verse')}</button></div></div>`, { dark: document.body.classList.contains('dark'), label: t('Word'), opener: w });
    wp.onclick = ev => { if (ev.target.closest('#wlisten')) { if (!PL.playWord(s, v, j + 1)) toast(t('Pause the recitation first.')); } if (ev.target.closest('#wfrom')) { closeSheet(); PL.P.mode = 'off'; PL.playVerse(v); } };
  };
  let lp; rd.addEventListener('pointerdown', e => { const vs = e.target.closest('.vs'); if (!vs) return; lp = setTimeout(() => { lp = null; menu(+vs.dataset.v); }, 550); });
  const cancel = () => { if (lp) clearTimeout(lp); }; rd.addEventListener('pointerup', cancel); rd.addEventListener('pointermove', cancel); rd.addEventListener('pointercancel', cancel);
  rd.addEventListener('contextmenu', e => { if (e.target.closest('.vs')) e.preventDefault(); });
  pl.onclick = e => {
    const id = (e.target.closest('button') || {}).id;
    if (id === 'pp') { if (PL.P.s === s && PL.P.v != null) PL.toggle(); else PL.playFrom(S.q.last && S.q.last.s === s ? S.q.last.v : 1); }
    if (id === 'pprev') PL.prev(); if (id === 'pnext') PL.next();
    if (id === 'psp') { const sp = [0.75, 1, 1.25, 1.5]; PL.setSpeed(sp[(sp.indexOf(S.q.speed) + 1) % sp.length]); }
    if (id === 'pmore') { S.q.pfull = !S.q.pfull; save(); pl.classList.toggle('full', S.q.pfull); $('#pmore', pl).setAttribute('aria-expanded', S.q.pfull); }
    if (id === 'prc') reciters();
    if (id === 'pmode') modes();
    if (id === 'psprev' || id === 'psnext') { const s2 = s + (id === 'psnext' ? 1 : -1), was = PL.P.s === s && PL.P.v != null && PL.isPlaying(); if (was) PL.gotoSurah(s2, true); else location.hash = '#/quran/' + s2; }
    if (id === 'psl') {
      const el = sheet(`<h3>${t('Sleep timer')}</h3><p class="muted small">${t('The recitation stops on its own. Useful at night.')}</p><div class="acts">${[[15, t('In 15 minutes')], [30, t('In 30 minutes')], ['end', t('At the end of the surah')], [0, t('No timer')]].map(([k, l]) => `<button data-sl="${k}">${l}</button>`).join('')}</div>`, { dark: document.body.classList.contains('dark'), label: t('Sleep timer') });
      el.onclick = e => { const b = e.target.closest('[data-sl]'); if (!b) return; const k = b.dataset.sl; PL.setSleep(k === 'end' ? 'end' : +k); closeSheet(); drawPlayer(); if (k !== '0') toast(k === 'end' ? t('The recitation will stop at the end of the surah.') : t('The recitation will stop in {m} minutes.', { m: k })); };
    }
  };
  $('#rset', root).onclick = settings;

  let st; const onScroll = () => { clearTimeout(st); st = setTimeout(() => {
    if (PL.isPlaying()) return;
    for (const el of $$('.vs', rd)) { const r = el.getBoundingClientRect(); if (r.bottom > 150) { const v = +el.dataset.v; if (!S.q.last || S.q.last.s !== s || S.q.last.v !== v) setLast(v); break; } }
  }, 300); };
  const onUser = () => { userScroll = Date.now(); };
  window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('touchmove', onUser, { passive: true }); window.addEventListener('wheel', onUser, { passive: true });
  if (vN || !S.q.last || S.q.last.s !== s) setLast(startV);
  if (s === 18 && weekday(Date.now()) === 'Friday') { getDay(dayKey(), true).k = 1; save(); }
  if (startV > 1) { const go = () => { const el = $('#v' + startV, rd); if (el && location.hash.startsWith('#/quran/' + s + '/')) { el.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70); } }; requestAnimationFrame(go); (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 60)); } else window.scrollTo(0, 0);
  // Memorisation sessions open the reader with a loop: #/quran/s/v/loop-a-b
  const lm = (extra || '').match(/^loop-(\d+)-(\d+)$/); if (lm) { PL.loopRange(+lm[1], +lm[2]); }
  // Guided memorisation: listen ×3, read ×3, recite from memory, verse by verse. #/quran/s/a/coach-a-b
  const cm = (extra || '').match(/^coach-(\d+)-(\d+)$/); let coachOff = null;
  if (cm) {
    const A = +cm[1], B = Math.min(n, +cm[2]), hide0 = S.q.hide; let cv = A, ph = 0, reads = 0, base = 0;
    const box = document.createElement('section'); box.className = 'coach'; box.setAttribute('aria-live', 'polite'); rd.prepend(box);
    const go = v => { const el = $('#v' + v, rd); if (el) { el.scrollIntoView({ block: 'center' }); } };
    const cdraw = () => {
      const steps = [t('Listen ×3'), t('Read ×3'), t('Recite from memory')];
      box.innerHTML = `<div class="ch"><span class="mono">${t('Guided memorisation')} · ${s}:${cv} (${cv - A + 1}/${B - A + 1})</span><a class="linkbtn small" href="#/hifz">${t('Stop')}</a></div>
        <ol class="csteps">${steps.map((x, i) => `<li class="${i < ph ? 'ok' : i === ph ? 'on' : ''}">${x}</li>`).join('')}</ol>
        ${ph === 0 ? `<button class="btn" id="c0">${PL.P.mode === 'verse' && PL.P.v === cv && PL.isPlaying() ? t('Listening… {n}/3', { n: Math.min(3, (PL.P.ends || 0) - base + 1) }) : t('Listen to verse {v} three times', { v: cv })}</button><button class="linkbtn small" id="cskip">${t('Skip listening')}</button>` : ''}
        ${ph === 1 ? `<p class="small">${t('Read it aloud, looking at the text.')}</p><button class="btn" id="c1">${t('I read it · {n}/3', { n: reads })}</button>` : ''}
        ${ph === 2 ? `<p class="small">${t('The words are hidden. Recite, then tap a word to check it.')}</p><div class="row2"><button class="btn" id="c2">${cv < B ? t('I know it · next verse') : t('I know it · finish')}</button><button class="btn line" id="c3">${t('Again')}</button></div>` : ''}
        ${ph === 3 ? `<p>${t('Portion done. May Allah make it firm in your heart.')}</p><a class="btn" href="#/hifz">${t('Back to memorisation')}</a>` : ''}`;
    };
    const setPh = x => { ph = x; if (x === 2) { S.q.hide = 3; } else S.q.hide = 0; refresh(); go(cv); cdraw(); };
    box.addEventListener('click', e => {
      const id = (e.target.closest('button') || {}).id;
      if (id === 'c0') { base = PL.P.ends || 0; PL.loopVerse(cv); cdraw(); }
      if (id === 'cskip') { PL.stop(); setPh(1); }
      if (id === 'c1') { reads++; if (reads >= 3) setPh(2); else cdraw(); }
      if (id === 'c2') { reads = 0; if (cv < B) { cv++; setPh(0); } else { S.q.hide = hide0; save(); refresh(); ph = 3; cdraw(); } }
      if (id === 'c3') { reads = 0; setPh(0); }
    });
    const unsub = PL.onChange(() => { if (ph === 0 && PL.P.mode === 'verse' && PL.P.v === cv) { if ((PL.P.ends || 0) - base >= 3) { PL.stop(); setPh(1); } else cdraw(); } });
    coachOff = () => { unsub(); S.q.hide = hide0; save(); };
    setPh(0);
  }
  if (PL.P.s === s && PL.P.v != null) kick();
  drawPins();
  return () => {
    window.removeEventListener('safa:pins', onPins);
    if (coachOff) { coachOff(); } off(); cancelAnimationFrame(raf); pl.remove(); window.removeEventListener('scroll', onScroll); window.removeEventListener('touchmove', onUser); window.removeEventListener('wheel', onUser); closeSheet();
    // Keep reciting when leaving the screen only if the user goes to another tab; the mini control lives in the tab bar.
  };
}
