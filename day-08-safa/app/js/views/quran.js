import { S, save, data, dayKey, getDay } from '../store.js';
import { weekday } from '../prayer.js';
import { $, $$, esc, icon, pad, arNum, sheet, closeSheet, toast } from '../ui.js';
import { t, lang } from '../i18n.js';

export const RECITERS = { Alafasy_128kbps: 'Mishary Alafasy', Husary_128kbps: 'Mahmoud Al-Husary', Abdul_Basit_Murattal_192kbps: 'Abdul Basit (Murattal)', Minshawy_Murattal_128kbps: 'Al-Minshawi (Murattal)', MaherAlMuaiqly128kbps: 'Maher Al-Muaiqly' };
const TRANS = { maash: ['Rashid Maash (clear French)', 'fr'], hamidullah: ['Hamidullah (classic French)', 'frh'], itani: ['Talal Itani (clear English)', null], pickthall: ['Pickthall (classic English)', 'pk'], none: ['No translation', null] };
const trKey = () => S.q.tr === 'auto' ? (lang() === 'fr' ? 'maash' : 'itani') : S.q.tr;
const meaning = (meta, n) => lang() === 'fr' && meta.fr ? meta.fr[n - 1] : meta.s[n - 1][1];
export const verseUrl = (s, v, r = S.q.reciter) => `https://everyayah.com/data/${r}/${pad(s, 3)}${pad(v, 3)}.mp3`;
const wordUrl = (s, v, w) => `https://audio.qurancdn.com/wbw/${pad(s, 3)}_${pad(v, 3)}_${pad(w, 3)}.mp3`;
const BISM = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ';

/* ---------- Player (one audio element for the whole app) ---------- */
const audio = new Audio(); audio.preload = 'auto';
const P = { s: null, v: null, n: 0, mode: 'off', a: 0, b: 0, word: false, ui: null };
function emit() { if (P.ui) P.ui(); }
function playVerse(s, v, n) {
  P.s = s; P.v = v; if (n) P.n = n; P.word = false;
  audio.src = verseUrl(s, v); audio.playbackRate = S.q.speed;
  audio.play().catch(() => {}); const d = getDay(dayKey(), true); if (!d.r) { d.r = 1; save(); } emit();
}
function playWord(s, v, w) { P.word = true; audio.src = wordUrl(s, v, w); audio.playbackRate = Math.min(1, S.q.speed); audio.play().catch(() => {}); }
export function stopAudio() { audio.pause(); audio.removeAttribute('src'); P.s = null; P.mode = 'off'; emit(); }
audio.addEventListener('ended', () => {
  if (P.word) { P.word = false; return; }
  if (P.s == null) return;
  if (P.mode === 'verse') return playVerse(P.s, P.v);
  if (P.mode === 'range') return playVerse(P.s, P.v < P.b ? P.v + 1 : P.a);
  if (P.v < P.n) return playVerse(P.s, P.v + 1);
  stopAudio();
});
audio.addEventListener('error', () => { if (!audio.getAttribute('src')) return; toast(t('Audio needs a connection, or a download in reader settings.')); P.word = false; if (P.s != null) stopAudio(); });
audio.addEventListener('play', emit); audio.addEventListener('pause', emit);

/* ---------- Surah list ---------- */
let listState = { tab: 'surahs', q: '' };
export async function renderList(root) {
  const meta = await data('meta.json');
  const starts = [0]; meta.s.forEach(m => starts.push(starts[starts.length - 1] + m[3]));
  const row = (n) => { const m = meta.s[n - 1]; return `<a class="srow" href="#/quran/${n}"><span class="num mono">${n}</span><span class="st"><b>${esc(m[0])}</b><span class="muted small">${esc(meaning(meta, n))} · ${t('{n} verses', { n: m[3] })} · ${t(m[4] ? 'Medinan' : 'Meccan')}</span></span><span class="ar" lang="ar">${m[2]}</span></a>`; };
  root.innerHTML = `<header class="vh"><div><h1>${t('Quran')}</h1></div></header>
    <div class="searchf">${icon.search}<input id="qs" class="inp" type="search" placeholder="${t('Surah, 2:255, or a word')}" value="${esc(listState.q)}" autocomplete="off" aria-label="${t('Search the Quran')}"></div>
    <div class="chips" role="tablist">${[['surahs', 'Surahs'], ['juz', 'Juz'], ['favs', 'Favourites']].map(([k, l]) => `<button class="chip" role="tab" data-tab="${k}" aria-selected="${listState.tab === k}">${t(l)}</button>`).join('')}</div>
    <div id="ql"></div>`;
  const out = $('#ql', root);
  const draw = async () => {
    const q = listState.q.trim();
    if (q) {
      const ref = q.match(/^(\d{1,3})\s*[:.\s]\s*(\d{1,3})$/), ql = q.toLowerCase().replace(/[^a-z0-9 ]/g, '');
      let html = '';
      if (ref && +ref[1] >= 1 && +ref[1] <= 114 && +ref[2] >= 1 && +ref[2] <= meta.s[+ref[1] - 1][3]) html += `<a class="card row" href="#/quran/${+ref[1]}/${+ref[2]}"><span><span class="mono">${t('Go to verse')}</span><b>${esc(meta.s[+ref[1] - 1][0])} · ${+ref[1]}:${+ref[2]}</b></span>${icon.chev}</a>`;
      const hits = meta.s.map((m, i) => i + 1).filter(n => String(n) === q || (ql.length > 1 && (meta.s[n - 1][0].toLowerCase().replace(/[^a-z0-9 ]/g, '').includes(ql) || meaning(meta, n).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(ql))));
      html += hits.map(row).join('');
      out.innerHTML = html || `<p class="muted pad">${t('Searching…')}</p>`;
      if (q.length >= 3 && !ref) {
        try {
          const all = await data(lang() === 'fr' ? 'search_fr.json' : 'search.json'); if (listState.q.trim() !== q) return;
          const fold = x => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’]/g, "'"), needle = fold(q), res = [];
          for (let i = 0; i < all.length && res.length < 40; i++) if (fold(all[i]).includes(needle)) res.push(i);
          const rx = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
          html += res.length ? `<p class="mono pad">${t('Verses · {n}', { n: res.length + (res.length === 40 ? '+' : '') })}</p>` + res.map(i => { let s = 1; while (starts[s] <= i) s++; const v = i - starts[s - 1] + 1; return `<a class="hit" href="#/quran/${s}/${v}"><span class="mono">${esc(meta.s[s - 1][0])} ${s}:${v}</span><span>${esc(all[i]).replace(rx, '<mark>$1</mark>')}</span></a>`; }).join('') : '';
        } catch (e) { /* offline before first cache: names only */ }
      }
      out.innerHTML = html || `<p class="muted pad">${t('Nothing found. Try a surah name, a verse like 2:255, or a word.')}</p>`;
      return;
    }
    if (listState.tab === 'juz') { out.innerHTML = meta.juz.map((j, i) => `<a class="srow" href="#/quran/${j[0]}/${j[1]}"><span class="num mono">${i + 1}</span><span class="st"><b>Juz ${i + 1}</b><span class="muted small">${t('Starts at {s}', { s: esc(meta.s[j[0] - 1][0]) + ' ' + j[0] + ':' + j[1] })}</span></span>${icon.chev}</a>`).join(''); return; }
    if (listState.tab === 'favs') { out.innerHTML = S.q.favs.length ? S.q.favs.map(k => { const [s, v] = k.split(':').map(Number); return `<a class="srow" href="#/quran/${s}/${v}"><span class="num mono">${icon.star}</span><span class="st"><b>${esc(meta.s[s - 1][0])} ${s}:${v}</b></span>${icon.chev}</a>`; }).join('') : `<p class="muted pad">${t('No favourites yet. Open a verse menu and tap Favourite.')}</p>`; return; }
    const last = S.q.last, fri = weekday(Date.now()) === 'Friday';
    out.innerHTML = (last ? `<a class="card row" href="#/quran/${last.s}/${last.v}"><span><span class="mono">${t('Resume')}</span><b>${esc(last.n)} · ${last.s}:${last.v}</b></span>${icon.chev}</a>` : `<a class="card row" href="#/quran/1"><span><span class="mono">${t('Start here')}</span><b>${t('Al-Fatihah · The Opener')}</b></span>${icon.chev}</a>`)
      + (fri ? `<a class="card row" href="#/quran/18"><span><span class="mono">${t('Friday')}</span><b>${t('Al-Kahf · The Cave')}</b></span>${icon.chev}</a>` : '')
      + meta.s.map((m, i) => row(i + 1)).join('');
  };
  let tm; $('#qs', root).oninput = e => { listState.q = e.target.value; clearTimeout(tm); tm = setTimeout(draw, 160); };
  root.onclick = e => { const b = e.target.closest('[data-tab]'); if (!b) return; listState.tab = b.dataset.tab; listState.q = ''; $('#qs', root).value = ''; $$('[data-tab]', root).forEach(x => x.setAttribute('aria-selected', x === b)); draw(); };
  draw();
  return () => { root.onclick = null; };
}

/* ---------- Reader ---------- */
export async function renderReader(root, sN, vN) {
  const s = Math.min(114, Math.max(1, +sN || 1));
  root.innerHTML = `<p class="muted pad">${t('Loading…')}</p>`;
  let meta, sur, pk = null;
  try { meta = await data('meta.json'); sur = await data(`quran/${s}.json`); const tf = TRANS[trKey()]; if (tf && tf[1]) pk = await data(`${tf[1]}/${s}.json`); }
  catch (e) { root.innerHTML = `<header class="sub"><a href="#/quran" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Quran')}</b><span class="ib"></span></header><p class="muted pad">${t('This surah is not saved on this device yet. Connect once and it will stay available offline.')}</p>`; return; }
  const m = meta.s[s - 1], V = sur.v, n = V.length;
  let startV = Math.min(n, Math.max(1, +vN || 1)), opened = startV;
  if (!S.q.dl) S.q.dl = {};
  const cls = () => `reader ${S.q.wbw ? 'wbw' : ''} ${S.q.flow && !S.q.wbw ? 'flow' : ''} ${S.q.tl ? 'tl' : ''} ${trKey() === 'none' ? 'notr' : ''} h${S.q.hide} fs${S.q.fs}`;
  const verse = (x, i) => {
    const v = i + 1, fav = S.q.favs.includes(s + ':' + v);
    return `<article class="vs" id="v${v}" data-v="${v}"><div class="vhd"><span class="mono">${s}:${v}</span>${fav ? `<span class="favd">${icon.star}</span>` : ''}<button class="ib vmenu" data-menu="${v}" aria-label="${t('Verse {v} options', { v })}">${icon.more}</button></div>
      <p class="ar" lang="ar" dir="rtl">${x.a.map((w, j) => `<button class="w" data-w="${j}">${w}${x.w ? `<span class="g"><i>${esc(x.w[j][0])}</i><em>${esc(x.w[j][1])}</em></span>` : ''}</button>`).join(' ')} <button class="vend" data-menu="${v}" aria-label="${t('Verse {v} options', { v })}">۝${arNum(v)}</button></p>
      <p class="tlit">${esc(x.l)}</p><p class="tr">${esc(pk ? pk[i] : x.t)}</p></article>`;
  };
  root.innerHTML = `<header class="sub rbar"><a href="#/quran" class="ib" aria-label="${t('Back to list')}">${icon.back}</a><div class="rt"><b>${esc(m[0])}</b><span class="mono">${esc(meaning(meta, s))} · ${n} vv</span></div>
      <button class="chip" id="twbw" aria-pressed="${S.q.wbw}">${t('Word by word')}</button><button class="ib" id="rset" aria-label="${t('Reader settings')}">${icon.gear}</button></header>
    <div class="${cls()}" id="rd">${s !== 1 && s !== 9 ? `<p class="bism ar" lang="ar" dir="rtl">${BISM}</p>` : ''}${V.map(verse).join('')}
      <nav class="rnav">${s > 1 ? `<a class="btn line sm" href="#/quran/${s - 1}">‹ ${esc(meta.s[s - 2][0])}</a>` : '<span></span>'}${s < 114 ? `<a class="btn line sm" href="#/quran/${s + 1}">${esc(meta.s[s][0])} ›</a>` : ''}</nav></div>
    <div class="player" id="pl"></div>`;
  const rd = $('#rd', root), pl = $('#pl', root);
  const setLast = v => { S.q.last = { s, v, n: m[0] }; save(); };
  const drawPlayer = (info) => {
    const on = P.s === s, playing = on && !audio.paused && !P.word;
    $$('.vs.playing', rd).forEach(x => x.classList.remove('playing'));
    if (on) { const el = $('#v' + P.v, rd); if (el) { el.classList.add('playing'); if (playing) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } }
    const label = info || (on ? `${s}:${P.v}${P.mode === 'verse' ? t(' · looping verse') : P.mode === 'range' ? t(' · loop {a}–{b}', { a: P.a, b: P.b }) : ''}` : t(S.q.hide ? 'Tap a hidden word to reveal it' : 'Tap a word to hear it'));
    pl.innerHTML = `<button class="pbtn" id="pp" aria-label="${t(playing ? 'Pause' : 'Play')}">${playing ? icon.pause : icon.play}</button><span class="plabel mono">${esc(label)}</span>
      <button class="chip" id="psp" aria-label="${t('Playback speed')}">${S.q.speed}×</button><button class="chip" id="phd" aria-pressed="${S.q.hide > 0}" aria-label="${t('Hide words to test your memory')}">${t(['Hide', 'Hide ⅓', 'Hide ½', 'Hide all'][S.q.hide])}</button>${on ? `<button class="ib" id="pst" aria-label="${t('Stop')}">${icon.stop}</button>` : ''}`;
  };
  P.ui = () => drawPlayer();
  drawPlayer();
  const refresh = () => { rd.className = cls(); $('#twbw', root).setAttribute('aria-pressed', S.q.wbw); $$('.w.rev', rd).forEach(w => w.classList.remove('rev')); drawPlayer(); };

  const tafsir = async v => {
    const el = sheet(`<h3>${t('Context &amp; tafsir · {k}', { k: s + ':' + v })}</h3><div class="sbody" id="tf"><p class="muted">${t('Loading…')}</p></div>`, { dark: true, label: 'Tafsir' });
    try {
      const tf = await data(`tafsir/${s}.json`);
      $('#tf', el).innerHTML = `<p class="ar" lang="ar" dir="rtl">${V[v - 1].a.join(' ')}</p>
        ${lang() === 'fr' ? `<p class="muted small">${t('Explanations are in English for now.')}</p>` : ''}
        ${tf.m[v] ? `<span class="mono">${t('Explanation · Al-Mukhtasar')}</span><p lang="en">${esc(tf.m[v])}</p>` : `<p class="muted">${t('No short explanation for this verse.')}</p>`}
        ${tf.a[v] ? `<span class="mono">${t('Circumstances of revelation · Al-Wahidi')}</span><p lang="en">${esc(tf.a[v])}</p>` : ''}`;
    } catch (e) { $('#tf', el).innerHTML = `<p class="muted">${t('Not saved on this device yet. Connect once to keep it offline.')}</p>`; }
  };
  const menu = v => {
    const k = s + ':' + v, fav = S.q.favs.includes(k);
    const el = sheet(`<h3>${esc(m[0])} · ${s}:${v}</h3><div class="acts">
        <button data-a="play">${icon.play}${t('Play from here')}</button>
        <button data-a="loop">${icon.play}${t('Loop this verse')}</button>
        <div class="looprow"><span>${t('Loop from {v} to', { v })}</span><select id="lto" class="inp" aria-label="${t('Last verse of the loop')}">${V.slice(v - 1).map((_, i) => `<option value="${v + i}" ${i === Math.min(4, n - v) ? 'selected' : ''}>${v + i}</option>`).join('')}</select><button class="btn sm" data-a="range">${t('Start')}</button></div>
        <button data-a="taf">${icon.book}${t('Context &amp; tafsir')}</button>
        <button data-a="fav">${icon.star}${t(fav ? 'Remove from favourites' : 'Add to favourites')}</button>
        <button data-a="copy">${icon.quran}${t('Copy verse')}</button></div>`, { dark: true, label: t('Verse {v} options', { v }) });
    el.onclick = e => {
      const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
      if (a === 'play') { P.mode = 'off'; playVerse(s, v, n); }
      if (a === 'loop') { P.mode = 'verse'; playVerse(s, v, n); }
      if (a === 'range') { P.mode = 'range'; P.a = v; P.b = +$('#lto', el).value; playVerse(s, v, n); }
      if (a === 'fav') { S.q.favs = fav ? S.q.favs.filter(x => x !== k) : [...S.q.favs, k]; save(); const vh = $('#v' + v + ' .vhd', rd), d = $('.favd', vh); if (fav && d) d.remove(); else if (!fav) vh.querySelector('.mono').insertAdjacentHTML('afterend', `<span class="favd">${icon.star}</span>`); toast(t(fav ? 'Removed' : 'Saved to favourites')); }
      if (a === 'copy') { const txt = `${V[v - 1].a.join(' ')}\n\n${pk ? pk[v - 1] : V[v - 1].t}\n— ${t('Quran')} ${s}:${v}`; (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast(t('Copied')), () => toast(t('Copy is not available here'))); }
      setLast(v); closeSheet(); if (a === 'taf') tafsir(v);
    };
  };
  const settings = () => {
    const key = S.q.reciter + '|' + s;
    const el = sheet(`<h3>${t('Reader')}</h3><div class="sbody">
        <label class="tog"><span>${t('Word by word')}<small>${t('Arabic, transliteration and meaning under each word')}${lang() === 'fr' ? '. ' + t('Word meanings are in English for now.') : ''}</small></span><input type="checkbox" id="swbw" ${S.q.wbw ? 'checked' : ''}></label>
        <label class="tog"><span>${t('Mushaf flow')}<small>${t('Continuous Arabic, no translation')}</small></span><input type="checkbox" id="sflow" ${S.q.flow ? 'checked' : ''}></label>
        <label class="tog"><span>${t('Verse transliteration')}</span><input type="checkbox" id="stl" ${S.q.tl ? 'checked' : ''}></label>
        <label class="lbl" for="str">${t('Translation')}</label><select id="str" class="inp">${Object.entries(TRANS).map(([k, l]) => `<option value="${k}" ${trKey() === k ? 'selected' : ''}>${t(l[0])}</option>`).join('')}</select>
        <label class="lbl">${t('Arabic size')}</label><div class="seg">${[0, 1, 2, 3].map(i => `<button data-fs="${i}" aria-pressed="${S.q.fs === i}" style="font-size:${14 + i * 4}px">ع</button>`).join('')}</div>
        <label class="lbl" for="srec">${t('Reciter')}</label><select id="srec" class="inp">${Object.entries(RECITERS).map(([k, l]) => `<option value="${k}" ${S.q.reciter === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <button class="btn line" id="sdl">${t(S.q.dl[key] ? 'Audio saved for offline ✓' : "Save this surah's audio for offline")}</button>
        <p class="muted small">${t('Text, translation and tafsir are stored on the device. Audio streams unless you save it.')}</p></div>`, { dark: true, label: t('Reader settings') });
    el.onchange = async e => {
      const id = e.target.id;
      if (id === 'swbw') { S.q.wbw = e.target.checked; if (S.q.wbw) S.q.flow = false; }
      if (id === 'sflow') { S.q.flow = e.target.checked; if (S.q.flow) S.q.wbw = false; }
      if (id === 'stl') S.q.tl = e.target.checked;
      if (id === 'srec') { S.q.reciter = e.target.value; if (P.s != null) stopAudio(); }
      if (id === 'str') { S.q.tr = e.target.value; save(); closeSheet(); const h = `#/quran/${s}/${S.q.last && S.q.last.s === s ? S.q.last.v : 1}`; if (location.hash === h) window.dispatchEvent(new Event('hashchange')); else location.hash = h; return; }
      save(); refresh(); if (id === 'swbw' || id === 'sflow') { $('#swbw', el).checked = S.q.wbw; $('#sflow', el).checked = S.q.flow; }
    };
    el.onclick = async e => {
      const f = e.target.closest('[data-fs]'); if (f) { S.q.fs = +f.dataset.fs; save(); refresh(); $$('[data-fs]', el).forEach(x => x.setAttribute('aria-pressed', x === f)); return; }
      if (e.target.id === 'sdl' && !S.q.dl[key]) {
        const btn = e.target; btn.disabled = true;
        try {
          const c = await caches.open('safa-audio'); let ok = 0;
          for (let v = 1; v <= n; v++) { const u = verseUrl(s, v); if (!(await c.match(u))) { const r = await fetch(u, { mode: 'no-cors' }); await c.put(u, r); } ok++; btn.textContent = t('Saving… {a} / {b}', { a: ok, b: n }); }
          S.q.dl[key] = n; save(); btn.textContent = t('Audio saved for offline ✓');
        } catch (err) { btn.disabled = false; btn.textContent = t('Could not save. Check your connection and retry.'); }
      }
    };
  };

  rd.onclick = e => {
    const mb = e.target.closest('[data-menu]'); if (mb) { menu(+mb.dataset.menu); return; }
    const w = e.target.closest('.w'); if (!w) return;
    const v = +w.closest('.vs').dataset.v, j = +w.dataset.w, x = V[v - 1];
    if (S.q.hide && !w.classList.contains('rev') && getComputedStyle(w).filter !== 'none') { w.classList.add('rev'); return; }
    $$('.w.on', rd).forEach(y => y.classList.remove('on')); w.classList.add('on'); setLast(v);
    if (P.s != null && !audio.paused && !P.word) return;
    playWord(s, v, j + 1); drawPlayer(x.w ? `${x.w[j][0]} · ${x.w[j][1]}` : `${s}:${v}`);
  };
  let lp; rd.addEventListener('pointerdown', e => { const vs = e.target.closest('.vs'); if (!vs) return; lp = setTimeout(() => { lp = null; menu(+vs.dataset.v); }, 550); });
  const cancel = () => { if (lp) clearTimeout(lp); }; rd.addEventListener('pointerup', cancel); rd.addEventListener('pointermove', cancel); rd.addEventListener('pointercancel', cancel);
  rd.addEventListener('contextmenu', e => { if (e.target.closest('.vs')) e.preventDefault(); });
  pl.onclick = e => {
    const id = (e.target.closest('button') || {}).id;
    if (id === 'pp') { if (P.s === s && !P.word) { audio.paused ? audio.play().catch(() => {}) : audio.pause(); } else { P.mode = 'off'; playVerse(s, S.q.last && S.q.last.s === s ? S.q.last.v : 1, n); } }
    if (id === 'psp') { const sp = [0.75, 1, 1.25, 1.5]; S.q.speed = sp[(sp.indexOf(S.q.speed) + 1) % sp.length]; audio.playbackRate = S.q.speed; save(); drawPlayer(); }
    if (id === 'phd') { S.q.hide = (S.q.hide + 1) % 4; save(); refresh(); }
    if (id === 'pst') stopAudio();
  };
  $('#twbw', root).onclick = () => { S.q.wbw = !S.q.wbw; if (S.q.wbw) S.q.flow = false; save(); refresh(); };
  $('#rset', root).onclick = settings;

  let st; const onScroll = () => { clearTimeout(st); st = setTimeout(() => {
    for (const el of $$('.vs', rd)) { const r = el.getBoundingClientRect(); if (r.bottom > 150) { const v = +el.dataset.v; if (!S.q.last || S.q.last.s !== s || S.q.last.v !== v) { setLast(v); if (Math.abs(v - opened) >= 2) { const d = getDay(dayKey(), true); if (!d.r) { d.r = 1; save(); } } } break; } }
  }, 300); };
  window.addEventListener('scroll', onScroll, { passive: true });
  setLast(startV);
  if (startV > 1) requestAnimationFrame(() => { const el = $('#v' + startV, rd); if (el) { el.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70); } }); else window.scrollTo(0, 0);
  return () => { window.removeEventListener('scroll', onScroll); P.ui = null; closeSheet(); if (P.s != null || P.word) stopAudio(); };
}
