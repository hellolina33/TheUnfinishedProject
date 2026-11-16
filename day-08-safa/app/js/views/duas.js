import { S, save, data, dayKey, getDay } from '../store.js';
import { $, $$, esc, icon, toast } from '../ui.js';

const FEEL = ['Anxiety', 'Sleep', 'Travel', 'Decision', 'Gratitude', 'Illness & grief', 'Forgiveness', 'Morning & evening', 'After prayer', 'Food & home', 'Mosque & prayer'];
// Plain words people type, mapped to the tags above.
const SYN = { anxious: 'Anxiety', anxiety: 'Anxiety', stress: 'Anxiety', stressed: 'Anxiety', worried: 'Anxiety', worry: 'Anxiety', afraid: 'Anxiety', fear: 'Anxiety', sad: 'Anxiety', angry: 'Anxiety', exam: 'Decision', test: 'Decision', interview: 'Decision', choice: 'Decision', decide: 'Decision', decision: 'Decision', istikhara: 'Decision', tired: 'Sleep', sleep: 'Sleep', nightmare: 'Sleep', insomnia: 'Sleep', trip: 'Travel', flight: 'Travel', plane: 'Travel', car: 'Travel', travel: 'Travel', hajj: 'Travel', umrah: 'Travel', thankful: 'Gratitude', grateful: 'Gratitude', gratitude: 'Gratitude', happy: 'Gratitude', sick: 'Illness & grief', ill: 'Illness & grief', pain: 'Illness & grief', death: 'Illness & grief', grief: 'Illness & grief', funeral: 'Illness & grief', sorry: 'Forgiveness', guilt: 'Forgiveness', sin: 'Forgiveness', repent: 'Forgiveness', morning: 'Morning & evening', evening: 'Morning & evening', eat: 'Food & home', food: 'Food & home', fasting: 'Food & home', iftar: 'Food & home', mosque: 'Mosque & prayer', wudu: 'Mosque & prayer', adhan: 'Mosque & prayer' };
let st = { q: '', feel: null };
const audio = new Audio(); audio.preload = 'none';
audio.addEventListener('error', () => { if (audio.getAttribute('src')) toast('Audio needs a connection.'); });

export async function renderList(root) {
  const D = await data('duas.json');
  const h = +new Intl.DateTimeFormat('en-GB', { timeZone: S.loc.tz, hour: '2-digit', hourCycle: 'h23' }).format(new Date());
  const row = c => `<a class="srow" href="#/duas/${c.id}"><span class="st"><b>${esc(c.t)}</b><span class="muted small">${c.d.length} ${c.d.length > 1 ? 'invocations' : 'invocation'}</span></span>${icon.chev}</a>`;
  root.innerHTML = `<header class="vh"><div><h1>Duas</h1><span class="mono">Hisnul Muslim · Fortress of the Muslim</span></div></header>
    <div class="searchf">${icon.search}<input id="ds" class="inp" type="search" placeholder="How do you feel? anxious, travelling…" value="${esc(st.q)}" autocomplete="off" aria-label="Search duas by feeling or situation"></div>
    <div class="chips scroll">${FEEL.map(f => `<button class="chip" data-feel="${esc(f)}" aria-pressed="${st.feel === f}">${esc(f)}</button>`).join('')}<button class="chip" data-feel="__fav" aria-pressed="${st.feel === '__fav'}">Favourites</button></div>
    <div id="dl"></div>`;
  const out = $('#dl', root);
  const draw = () => {
    const q = st.q.trim().toLowerCase();
    let list = D, head = '';
    if (st.feel === '__fav') { const f = new Set(S.d.favs); list = D.filter(c => c.d.some(x => f.has(x.id))); if (!list.length) { out.innerHTML = '<p class="muted pad">No favourites yet. Tap the star on any dua.</p>'; return; } }
    else if (st.feel) list = D.filter(c => c.g.includes(st.feel));
    else if (q) {
      const tag = SYN[q] || Object.keys(SYN).filter(k => k.startsWith(q) && q.length > 2).map(k => SYN[k])[0];
      list = D.filter(c => (tag && c.g.includes(tag)) || c.t.toLowerCase().includes(q) || (q.length > 3 && c.d.some(x => x.en.toLowerCase().includes(q))));
      if (!list.length) { out.innerHTML = '<p class="muted pad">Nothing found. Try “sleep”, “travel” or “anxious”.</p>'; return; }
    } else {
      const sug = h < 15 ? [[27, 'Morning', 'Words of remembrance'], [1, 'On waking', 'When you wake up']] : [[27, 'Evening', 'Words of remembrance'], [28, 'Tonight', 'Before sleeping']];
      head = `<div class="grid2">${sug.map(([id, k, t]) => `<a class="card tile col" href="#/duas/${id}"><span class="mono">${k}</span><b>${t}</b></a>`).join('')}</div><p class="mono pad">All chapters · ${D.length}</p>`;
    }
    out.innerHTML = head + list.map(row).join('');
  };
  let t; $('#ds', root).oninput = e => { st.q = e.target.value; st.feel = null; $$('[data-feel]', root).forEach(x => x.setAttribute('aria-pressed', false)); clearTimeout(t); t = setTimeout(draw, 140); };
  root.onclick = e => { const b = e.target.closest('[data-feel]'); if (!b) return; st.feel = st.feel === b.dataset.feel ? null : b.dataset.feel; st.q = ''; $('#ds', root).value = ''; $$('[data-feel]', root).forEach(x => x.setAttribute('aria-pressed', x.dataset.feel === st.feel)); draw(); };
  draw();
  return () => { root.onclick = null; };
}

export async function renderChapter(root, id) {
  const D = await data('duas.json'), c = D.find(x => x.id === +id);
  if (!c) { location.hash = '#/duas'; return; }
  const counts = {};
  root.innerHTML = `<header class="sub"><a href="#/duas" class="ib" aria-label="Back">${icon.back}</a><b class="clip">${esc(c.t)}</b><button class="chip" id="dtl" aria-pressed="${S.d.tl}">Transliteration</button></header>
    <div class="dlist ${S.d.tl ? '' : 'notl'}" id="dd">${c.d.map((x, i) => `<article class="dua" data-i="${i}">
      <div class="dh"><span class="mono">${i + 1} / ${c.d.length}</span><span><button class="ib dplay" data-play="${x.id}" aria-label="Listen">${icon.play}</button><button class="ib dfav ${S.d.favs.includes(x.id) ? 'on' : ''}" data-fav="${x.id}" aria-pressed="${S.d.favs.includes(x.id)}" aria-label="Favourite">${icon.star}</button></span></div>
      <p class="ar" lang="ar" dir="rtl">${esc(x.ar)}</p>
      ${x.tl ? `<p class="tlit">${esc(x.tl)}</p>` : ''}
      <p class="en">${esc(x.en)}</p>
      <div class="df"><span class="badge mono">${esc(x.ref || 'Hisnul Muslim · ch. ' + c.id)}</span>${x.n > 1 ? `<button class="counter mono" data-count="${i}" aria-label="Count repetitions">0 / ${x.n}</button>` : ''}</div>
    </article>`).join('')}
    <p class="muted small pad">Text from Hisnul Muslim by Sa'id al-Qahtani. Source references are matched automatically and still need review by a person of knowledge.</p></div>`;
  const dd = $('#dd', root);
  $('#dtl', root).onclick = e => { S.d.tl = !S.d.tl; save(); dd.classList.toggle('notl', !S.d.tl); e.target.setAttribute('aria-pressed', S.d.tl); };
  dd.onclick = e => {
    const cb = e.target.closest('[data-count]');
    if (cb) { const i = +cb.dataset.count, n = c.d[i].n; counts[i] = (counts[i] || 0) >= n ? 0 : (counts[i] || 0) + 1; cb.textContent = `${counts[i]} / ${n}`; cb.classList.toggle('done', counts[i] >= n); if (counts[i] >= n && navigator.vibrate) navigator.vibrate(30); return; }
    const fb = e.target.closest('[data-fav]');
    if (fb) { const k = +fb.dataset.fav, on = S.d.favs.includes(k); S.d.favs = on ? S.d.favs.filter(x => x !== k) : [...S.d.favs, k]; save(); fb.classList.toggle('on', !on); fb.setAttribute('aria-pressed', !on); return; }
    const pb = e.target.closest('[data-play]');
    if (pb) {
      const u = `https://www.hisnmuslim.com/audio/ar/${pb.dataset.play}.mp3`;
      if (audio.getAttribute('src') === u && !audio.paused) { audio.pause(); pb.innerHTML = icon.play; return; }
      $$('.dplay', dd).forEach(b => b.innerHTML = icon.play); audio.src = u; audio.play().then(() => { pb.innerHTML = icon.pause; }).catch(() => {});
      audio.onended = () => { pb.innerHTML = icon.play; };
      if (c.id === 27) { const d = getDay(dayKey(), true); if (!d.a) { d.a = 1; save(); } }
    }
  };
  window.scrollTo(0, 0);
  return () => { audio.pause(); audio.removeAttribute('src'); };
}
