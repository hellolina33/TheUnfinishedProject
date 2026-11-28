import { S, save, data, dayKey, getDay } from '../store.js';
import { reportUrl } from '../ui.js';
import { $, $$, esc, icon, toast, download } from '../ui.js';
import { t, lang } from '../i18n.js';
const fr = () => lang() === 'fr';
const ar = () => lang() === 'ar';
export const duaTitle = c => (fr() && c.tf) || (ar() && c.ta) || (lang() === 'th' ? t(c.t) : c.t);
export const duaMeaning = x => (fr() && x.fr) || (lang() === 'th' ? t(x.en) : x.en);
const title = duaTitle;
const fold = x => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const CARE = { 'Anxiety': 'Take a breath. Allah does not burden a soul beyond what it can bear (Quran 2:286). Here are words the Prophet, peace be upon him, used in hard moments.', 'Illness & grief': 'May Allah ease what you carry. These duas are for you and for those you love.', 'Forgiveness': 'The door of forgiveness stays open (Quran 39:53). Start with one of these.' };
const FEEL = ['Anxiety', 'Sleep', 'Travel', 'Decision', 'Gratitude', 'Illness & grief', 'Forgiveness', 'Morning & evening', 'After prayer', 'Food & home', 'Mosque & prayer'];
// Plain words people type, mapped to the tags above.
const SYN = { anxieux: 'Anxiety', anxieuse: 'Anxiety', angoisse: 'Anxiety', peur: 'Anxiety', triste: 'Anxiety', tristesse: 'Anxiety', colere: 'Anxiety', inquiet: 'Anxiety', examen: 'Decision', entretien: 'Decision', choix: 'Decision', decision: 'Decision', fatigue: 'Sleep', sommeil: 'Sleep', dormir: 'Sleep', cauchemar: 'Sleep', voyage: 'Travel', avion: 'Travel', voiture: 'Travel', merci: 'Gratitude', reconnaissant: 'Gratitude', heureux: 'Gratitude', joie: 'Gratitude', malade: 'Illness & grief', maladie: 'Illness & grief', douleur: 'Illness & grief', deuil: 'Illness & grief', mort: 'Illness & grief', pardon: 'Forgiveness', peche: 'Forgiveness', culpabilite: 'Forgiveness', matin: 'Morning & evening', soir: 'Morning & evening', manger: 'Food & home', repas: 'Food & home', jeune: 'Food & home', maison: 'Food & home', mosquee: 'Mosque & prayer', ablutions: 'Mosque & prayer', priere: 'Mosque & prayer', anxious: 'Anxiety', anxiety: 'Anxiety', stress: 'Anxiety', stressed: 'Anxiety', worried: 'Anxiety', worry: 'Anxiety', afraid: 'Anxiety', fear: 'Anxiety', sad: 'Anxiety', angry: 'Anxiety', exam: 'Decision', test: 'Decision', interview: 'Decision', choice: 'Decision', decide: 'Decision', decision: 'Decision', istikhara: 'Decision', tired: 'Sleep', sleep: 'Sleep', nightmare: 'Sleep', insomnia: 'Sleep', trip: 'Travel', flight: 'Travel', plane: 'Travel', car: 'Travel', travel: 'Travel', hajj: 'Travel', umrah: 'Travel', thankful: 'Gratitude', grateful: 'Gratitude', gratitude: 'Gratitude', happy: 'Gratitude', sick: 'Illness & grief', ill: 'Illness & grief', pain: 'Illness & grief', death: 'Illness & grief', grief: 'Illness & grief', funeral: 'Illness & grief', sorry: 'Forgiveness', guilt: 'Forgiveness', sin: 'Forgiveness', repent: 'Forgiveness', morning: 'Morning & evening', evening: 'Morning & evening', eat: 'Food & home', food: 'Food & home', fasting: 'Food & home', iftar: 'Food & home', mosque: 'Mosque & prayer', wudu: 'Mosque & prayer', adhan: 'Mosque & prayer' };
let st = { q: '', feel: null };
const audio = new Audio(); audio.preload = 'none';
audio.addEventListener('error', () => { if (audio.getAttribute('src')) toast(t('Audio needs a connection.')); });

export async function renderList(root, section) {
  if (section === 'favorites') { st.feel = '__fav'; st.q = ''; }
  const D = await data('duas.json');
  const h = +new Intl.DateTimeFormat('en-GB', { timeZone: S.loc?.tz || Intl.DateTimeFormat().resolvedOptions().timeZone, hour: '2-digit', hourCycle: 'h23' }).format(new Date());
  const row = c => `<a class="srow" href="#/duas/${c.id}"><span class="st"><b>${esc(title(c))}</b>${!ar() && c.ta ? `<span class="arn" lang="ar">${esc(c.ta)}</span>` : ''}<span class="muted small">${t(c.d.length > 1 ? '{n} invocations' : '{n} invocation', { n: c.d.length })}</span></span>${icon.chev}</a>`;
  root.innerHTML = `<header class="vh"><div><h1>${t('Duas')}</h1><p class="sub2">${t('From Hisnul Muslim, the most widely used collection of duas.')}</p></div></header>
    <div class="searchf">${icon.search}<input id="ds" class="inp" type="search" placeholder="${t('How do you feel? anxious, travelling…')}" value="${esc(st.q)}" autocomplete="off" aria-label="${t('Search duas by feeling or situation')}"></div>
    <div class="chips wrapc">${FEEL.map(f => `<button class="chip" data-feel="${esc(f)}" aria-pressed="${st.feel === f}">${esc(t(f))}</button>`).join('')}<button class="chip" data-feel="__fav" aria-pressed="${st.feel === '__fav'}">${t('Favourites')}</button></div>
    <div id="dl"></div>`;
  const mine = `<a class="card row" href="#/mydua"><span><span class="mono">${t('Personal')}</span><b>${t('My duas')}</b><span class="muted small">${S.myDuas.length ? t('{n} saved', { n: S.myDuas.length }) : t('Write your own, with a gentle reminder')}</span></span>${icon.chev}</a>`;
  const out = $('#dl', root);
  const draw = () => {
    const q = fold(st.q.trim());
    let list = D, head = '';
    if (st.feel === '__fav') { const f = new Set(S.d.favs); list = D.filter(c => c.d.some(x => f.has(x.id))); if (!list.length) { out.innerHTML = `<p class="muted pad">${t('No favourites yet. Tap the star on any dua.')}</p>`; return; } }
    else if (st.feel) { list = D.filter(c => c.g.includes(st.feel)); if (CARE[st.feel]) head = `<p class="care pad">${t(CARE[st.feel])}</p>`; }
    else if (q) {
      const tag = SYN[q] || Object.keys(SYN).filter(k => k.startsWith(q) && q.length > 2).map(k => SYN[k])[0];
      list = D.filter(c => (tag && c.g.includes(tag)) || fold(title(c)).includes(q) || (q.length > 3 && c.d.some(x => fold(duaMeaning(x)).includes(q))));
      if (!list.length) { out.innerHTML = `<p class="muted pad">${t('Nothing found. Try “sleep”, “travel” or “anxious”.')}</p>`; return; }
    } else {
      const sug = h < 15 ? [[27, 'Morning', 'Words of remembrance'], [1, 'On waking', 'When you wake up']] : [[27, 'Evening', 'Words of remembrance'], [28, 'Tonight', 'Before sleeping']];
      head = `<p class="mono pad">${t('For this moment of the day')}</p><div class="grid2">${sug.map(([id, k, tt]) => `<a class="card tile col" href="#/duas/${id}"><span class="mono">${t(k)}</span><b>${t(tt)}</b></a>`).join('')}</div>${mine}<p class="mono pad">${t('All chapters · {n}', { n: D.length })}</p>`;
      const seen = new Set(), groups = MOMENTS.map(g => [g, D.filter(c => c.g[0] === g)]).concat([['Other', D.filter(c => !MOMENTS.includes(c.g[0]))]]);
      out.innerHTML = head + groups.filter(([, l]) => l.length).map(([g, l]) => `<h3 class="dgrp">${esc(t(g))}</h3>` + l.filter(c => !seen.has(c.id) && seen.add(c.id)).map(row).join('')).join('');
      return;
    }
    out.innerHTML = head + list.map(row).join('');
  };
  let tm; $('#ds', root).oninput = e => { st.q = e.target.value; st.feel = null; $$('[data-feel]', root).forEach(x => x.setAttribute('aria-pressed', false)); clearTimeout(tm); tm = setTimeout(draw, 140); };
  root.onclick = e => { const b = e.target.closest('[data-feel]'); if (!b) return; st.feel = st.feel === b.dataset.feel ? null : b.dataset.feel; st.q = ''; $('#ds', root).value = ''; $$('[data-feel]', root).forEach(x => x.setAttribute('aria-pressed', x.dataset.feel === st.feel)); draw(); };
  draw();
  return () => { root.onclick = null; };
}

const MOMENTS = ['Morning & evening', 'Mosque & prayer', 'After prayer', 'Sleep', 'Food & home', 'Travel', 'Anxiety', 'Illness & grief', 'Forgiveness', 'Gratitude', 'Decision'];
export async function renderChapter(root, id, one) {
  const D = await data('duas.json'), c = D.find(x => x.id === +id);
  if (!c) { location.hash = '#/duas'; return; }
  const counts = {};
  const focusI = one ? Math.min(c.d.length, Math.max(1, +one)) - 1 : -1;
  root.innerHTML = `<header class="sub"><a href="#/duas" class="ib" aria-label="${t('Back')}">${icon.back}</a><b class="clip">${esc(title(c))}</b><button class="chip" id="dtl" aria-pressed="${S.d.tl}">${t('Transliteration')}</button></header>
    ${c.d.length > 1 ? `<div class="row2 pad"><button class="btn line sm" id="done1">${t('One at a time')}</button></div>` : ''}
    <div class="dlist ${S.d.tl ? '' : 'notl'}" id="dd">${c.d.map((x, i) => `<article class="dua" data-i="${i}" ${focusI >= 0 && i !== focusI ? 'hidden' : ''}>
      <div class="dh"><span class="mono">${i + 1} / ${c.d.length}</span><span><button class="ib dplay" data-play="${x.id}" aria-label="${t('Listen to this dua')}">${icon.play}</button><button class="ib dfav ${S.d.favs.includes(x.id) ? 'on' : ''}" data-fav="${x.id}" aria-pressed="${S.d.favs.includes(x.id)}" aria-label="${t('Favourite')}">${icon.star}</button></span></div>
      <p class="ar" lang="ar" dir="rtl">${esc(String(x.ar).trim().replace(/^\((.*)\)\.?$/s, '$1'))}</p>
      ${!ar() && ((fr() && x.tf) || x.tl) ? `<p class="tlit">${esc((fr() && x.tf) || x.tl)}</p>` : ''}
      ${ar() ? '' : `<span class="mono senslbl">${t('Meaning')}</span><p class="en" lang="${lang() === 'th' ? 'th' : fr() && x.fr ? 'fr' : 'en'}">${esc(duaMeaning(x))}</p>${lang() === 'th' ? `<p class="small muted">${t('This dua translation is being reviewed.')}</p>` : fr() && !x.fr ? `<p class="mono">${t('English only')}</p>` : ''}`}
      <div class="df"><span class="dsrc"><span class="badge mono">${x.ref ? esc(t('Reported by {r}', { r: x.ref })) : esc(t('Hisnul Muslim · ch. {n}', { n: c.id }))}</span>${gradeBadge(x)}</span>${x.n > 1 ? `<button class="counter mono" data-count="${i}" aria-label="${t('Count repetitions')}">0 / ${x.n}</button>` : ''}</div>
      <div class="dx"><button class="linkbtn small" data-mine="${i}">+ ${t('Add to My duas')}</button><button class="linkbtn small" data-share="${i}">${t('Share')}</button><button class="linkbtn small" data-img="${i}">${t('Share as image')}</button><a class="linkbtn small" href="${reportUrl('Dua ' + c.id + '.' + (i + 1))}" target="_blank" rel="noopener">${t('Report an error')}</a></div>
    </article>`).join('')}
    ${focusI >= 0 && c.d.length > 1 ? `<button class="btn line sm" id="dall">${t('See the whole chapter ({n} duas)', { n: c.d.length })}</button>` : ''}
    <p class="endsur">${t('May Allah accept your duas.')}</p>
    ${D.findIndex(z => z.id === c.id) < D.length - 1 ? `<a class="btn line sm" href="#/duas/${D[D.findIndex(z => z.id === c.id) + 1].id}">${t('Next chapter')}: ${esc(title(D[D.findIndex(z => z.id === c.id) + 1]))} ›</a>` : ''}
    <p class="muted small pad">${t("Text from Hisnul Muslim (the Fortress of the Muslim) by Sa'id al-Qahtani, the most widely used collection of duas. Sources marked “being reviewed” are waiting for a check by a person of knowledge.")}</p></div>`;
  const dd = $('#dd', root);
  if ($('#dall', root)) $('#dall', root).onclick = e => { dd.querySelectorAll('article[hidden]').forEach(x => { x.hidden = false; }); e.target.remove(); };
  // One dua per screen, with its counter; next one when done.
  let oi = 0;
  const showOne = () => { const arts = $$('article.dua', dd); arts.forEach((a, i) => { a.hidden = i !== oi; }); $('#onebar', root)?.remove(); root.insertAdjacentHTML('beforeend', `<div class="onebar" id="onebar"><button class="btn line sm" id="oprev" ${oi ? '' : 'disabled'}>‹ ${t('Previous')}</button><span class="mono">${oi + 1} / ${arts.length}</span><button class="btn sm" id="onext">${oi < arts.length - 1 ? t('Next') + ' ›' : t('Finish')}</button></div>`); window.scrollTo(0, 0); };
  if ($('#done1', root)) $('#done1', root).onclick = () => { dd.classList.add('onemode'); showOne(); };
  root.addEventListener('click', e => {
    const cdone = e.target.closest('[data-count]'); if (cdone && dd.classList.contains('onemode') && cdone.classList.contains('done')) setTimeout(() => $('#onext', root)?.click(), 700);
    if (e.target.id === 'oprev') { oi = Math.max(0, oi - 1); showOne(); }
    if (e.target.id === 'onext') { const n = $$('article.dua', dd).length; if (oi < n - 1) { oi++; showOne(); } else { $('#onebar', root)?.remove(); dd.classList.remove('onemode'); $$('article.dua', dd).forEach(a => { a.hidden = false; }); toast(t('May Allah accept your duas.')); } }
  });
  $('#dtl', root).onclick = e => { S.d.tl = !S.d.tl; save(); dd.classList.toggle('notl', !S.d.tl); e.target.setAttribute('aria-pressed', S.d.tl); };
  dd.onclick = async e => {
    const gb = e.target.closest('[data-grade]'); if (gb) { const g = GRADES[gb.dataset.grade]; toast(g ? t(g[1]) + (gb.dataset.grade.startsWith('sahih') ? ' · ' + t('Sahih means authentic.') : '') : t('No source matched yet. Check it with a person of knowledge.')); return; }
    const im = e.target.closest('[data-img]'); if (im) { shareImage(c.d[+im.dataset.img], title(c)); return; }
    const sh = e.target.closest('[data-share]');
    if (sh) { const x = c.d[+sh.dataset.share], txt = `${x.ar}\n\n${duaMeaning(x)}\n— ${x.ref || 'Hisnul Muslim'}\n\nsafa. · ${location.origin}${location.pathname}#/duas/${c.id}/${+sh.dataset.share + 1}`; try { if (navigator.share) await navigator.share({ text: txt }); else { await navigator.clipboard.writeText(txt); toast(t('Copied')); } } catch (err) { /* cancelled */ } return; }
    const cb = e.target.closest('[data-count]');
    if (cb && navigator.vibrate) navigator.vibrate(12);
    if (cb) { const i = +cb.dataset.count, n = c.d[i].n; counts[i] = (counts[i] || 0) >= n ? 0 : (counts[i] || 0) + 1; cb.textContent = `${counts[i]} / ${n}`; cb.classList.toggle('done', counts[i] >= n); if (counts[i] >= n && navigator.vibrate) navigator.vibrate(30); return; }
    const mb = e.target.closest('[data-mine]');
    if (mb) { const x = c.d[+mb.dataset.mine]; S.myDuas.push({ id: Date.now().toString(36), title: title(c), ar: x.ar, text: duaMeaning(x), ref: x.ref || '', time: '' }); save(); toast(t('Added to my duas')); return; }
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

export const GRADES = { sahih2: ['Sahih', 'In Sahih al-Bukhari or Sahih Muslim'], sahih_alb: ['Sahih', 'Graded sahih by Al-Albani'], hasan: ['Hasan', 'Graded hasan'], quran: ['Quran', 'Verse of the Quran'], ref: ['Source cited', 'Collection cited; grade not shown here'] };
function gradeBadge(x) {
  const g = GRADES[x.gr];
  if (!g) return `<button class="grade none" data-grade="none" aria-label="${esc(t('No source matched yet. Check it with a person of knowledge.'))}">${t('Source being reviewed')}</button>`;
  return `<button class="grade ${x.gr}" data-grade="${x.gr}" aria-label="${esc(t(g[1]))}">${t(g[0])}${x.gr.startsWith('sahih') ? ' · ' + t('authentic') : ''}</button>`;
}

/* ---------- My duas ---------- */
export function renderMyDuas(root, id) {
  const ics = d => {
    const [h, m] = d.time.split(':'), k = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    download(`safa-dua-${d.id}.ics`, ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//safa.//EN', 'BEGIN:VEVENT', `UID:safa-dua-${d.id}@safa`, `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d+/g, '')}`, `DTSTART;TZID=${S.loc?.tz || Intl.DateTimeFormat().resolvedOptions().timeZone}:${k}T${h}${m}00`, 'DURATION:PT5M', 'RRULE:FREQ=DAILY', `SUMMARY:${d.title.replace(/[\n,;]/g, ' ')}`, `DESCRIPTION:${(d.text || '').slice(0, 300).replace(/[\n,;]/g, ' ')}`, 'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${d.title.replace(/[\n,;]/g, ' ')}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'), 'text/calendar');
  };
  const list = () => {
    root.innerHTML = `<header class="sub"><a href="#/duas" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('My duas')}</b><a class="ib" href="#/mydua/new" aria-label="${t('New dua')}">${icon.plus}</a></header>
      ${S.myDuas.length ? S.myDuas.map(d => `<article class="dua"><div class="dh"><b>${esc(d.title)}</b><a class="btn line sm" href="#/mydua/${d.id}">${t('Edit')}</a></div>
        ${d.ar ? `<p class="ar" lang="ar" dir="rtl">${esc(d.ar)}</p>` : ''}${d.text ? `<p class="en">${esc(d.text)}</p>` : ''}
        <div class="df"><span class="badge mono">${esc(d.ref || t('Personal'))}</span>${d.time ? `<button class="btn line sm" data-ics="${d.id}">${t('Daily reminder {t}', { t: d.time })}</button>` : ''}</div></article>`).join('')
      : `<p class="muted pad">${t('Nothing yet. Write a dua in your own words, or tap + on any dua in Hisnul Muslim.')}</p><p class="muted small pad">${t('Ideas: for your parents, for your health, for a decision, for someone who left.')}</p><a class="btn big" href="#/mydua/new">${t('New dua')}</a>`}
      <p class="muted small pad lockline">${icon.lock} ${t('Your duas stay on this phone. Nobody else can see them.')}</p>`;
    root.onclick = e => { const b = e.target.closest('[data-ics]'); if (b) ics(S.myDuas.find(x => x.id === b.dataset.ics)); };
  };
  const edit = () => {
    const d = id === 'new' ? { id: Date.now().toString(36), title: '', ar: '', text: '', ref: '', time: '' } : S.myDuas.find(x => x.id === id);
    if (!d) { location.hash = '#/mydua'; return; }
    root.innerHTML = `<header class="sub"><a href="#/mydua" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t(id === 'new' ? 'New dua' : 'Edit')}</b><span class="ib"></span></header>
      <form class="form" id="mf">
        <label class="lbl" for="mt">${t('Title')}</label><input id="mt" class="inp" required maxlength="80" value="${esc(d.title)}" placeholder="${t('e.g. For my parents')}">
        <label class="lbl" for="mx">${t('Your words')}</label><textarea id="mx" class="inp ta" rows="5" maxlength="2000">${esc(d.text)}</textarea>
        <label class="lbl" for="ma">${t('Arabic (optional)')}</label><textarea id="ma" class="inp ta ar" dir="rtl" lang="ar" rows="3" maxlength="2000">${esc(d.ar)}</textarea>
        <label class="lbl" for="mtime">${t('Daily reminder (optional)')}</label><input id="mtime" class="inp" type="time" value="${esc(d.time)}">
        <button class="btn big" type="submit">${t('Save')}</button>
        ${id !== 'new' ? `<button class="btn line sm danger" type="button" id="mdel">${t('Delete')}</button>` : ''}
      </form>`;
    $('#mf', root).onsubmit = e => {
      e.preventDefault();
      Object.assign(d, { title: $('#mt', root).value.trim() || t('My dua'), text: $('#mx', root).value.trim(), ar: $('#ma', root).value.trim(), time: $('#mtime', root).value });
      if (id === 'new') S.myDuas.push(d); save(); toast(t('Saved')); location.hash = '#/mydua';
    };
    const del = $('#mdel', root); if (del) del.onclick = () => { S.myDuas = S.myDuas.filter(x => x.id !== d.id); save(); location.hash = '#/mydua'; };
  };
  if (id) edit(); else list();
  return () => { root.onclick = null; };
}

/* A clean square image: Arabic, meaning, source. Shared as a file when the phone allows it. */
export async function shareImage(x, ttl) {
  try {
    await document.fonts.ready;
    const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'); g.fillStyle = '#ecebe7'; g.fillRect(0, 0, W, H);
    const wrap = (txt, font, max, dir) => { g.font = font; g.direction = dir; const words = String(txt).split(/\s+/), lines = []; let cur = ''; for (const w of words) { const n = cur ? cur + ' ' + w : w; if (g.measureText(n).width > max && cur) { lines.push(cur); cur = w; } else cur = n; } if (cur) lines.push(cur); return lines; };
    const ar = String(x.ar).trim().replace(/^\((.*)\)\.?$/s, '$1'), mean = x.meaning ?? duaMeaning(x);
    let arSize = 58, arL; do { arL = wrap(ar, `${arSize}px 'Amiri Quran','Amiri','Geeza Pro',serif`, W - 160, 'rtl'); arSize -= 4; } while (arL.length * arSize * 1.9 > 560 && arSize > 30);
    let mSize = 34, mL; do { mL = wrap(mean, `400 ${mSize}px 'Inter Tight',system-ui,sans-serif`, W - 160, 'ltr'); mSize -= 2; } while (mL.length * mSize * 1.45 > 420 && mSize > 20);
    g.fillStyle = '#e85d2a'; g.font = "500 26px 'JetBrains Mono',monospace"; g.direction = 'ltr'; g.textAlign = 'left'; g.fillText(String(ttl).toUpperCase().slice(0, 48), 80, 110);
    g.fillStyle = '#111110'; g.textAlign = 'right'; g.direction = 'rtl'; g.font = `${arSize + 4}px 'Amiri Quran','Amiri','Geeza Pro',serif`;
    const tot = arL.length * (arSize + 4) * 1.9 + 20 + mL.length * (mSize + 2) * 1.45;
    let y = Math.max(230, Math.round((H - tot) / 2)); arL.forEach(l => { g.fillText(l, W - 80, y); y += (arSize + 4) * 1.9; });
    g.direction = 'ltr'; g.textAlign = 'left'; g.font = `400 ${mSize + 2}px 'Inter Tight',system-ui,sans-serif`; g.fillStyle = '#2a2a28'; y += 20;
    mL.forEach(l => { g.fillText(l, 80, y); y += (mSize + 2) * 1.45; });
    g.fillStyle = '#5c5b57'; g.font = "400 24px 'JetBrains Mono',monospace"; g.fillText((x.foot || (x.ref ? t('Reported by {r}', { r: x.ref }) : 'Hisnul Muslim')).slice(0, 60), 80, H - 120);
    g.fillStyle = '#111110'; g.font = "600 40px 'Inter Tight',system-ui,sans-serif"; g.fillText('safa.', 80, H - 64);
    const blob = await new Promise(r => cv.toBlob(r, 'image/png')), file = new File([blob], x.file || 'safa-dua.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], text: 'safa.' });
    else { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = x.file || 'safa-dua.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast(t('Image saved')); }
  } catch (e) { if (e && e.name !== 'AbortError') toast(t('Could not create the image here.')); }
}
