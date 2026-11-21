// Khatm planner, memorisation plan, missed prayers (qada). All local.
import { S, save, data, dayKey, addDays, P5 } from '../store.js';
import { NAMES } from '../prayer.js';
import { $, $$, esc, icon, toast, sheet, closeSheet } from '../ui.js';
import { t, L } from '../i18n.js';
import { surahName } from './quran.js';

const rng = (s, a, b) => `<bdi>${s}:${a}${b !== a ? '–' + b : ''}</bdi>`;
const daysBetween = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 86400000);
const civil = (k, o) => new Intl.DateTimeFormat(L(), Object.assign({ timeZone: 'UTC' }, o)).format(new Date(Date.parse(k + 'T12:00:00Z')));

/* ---------- Khatm ---------- */
export function khatmToday(meta) {
  const K = S.khatm; if (!K) return null;
  const today = dayKey(), left = Math.max(1, K.days - daysBetween(K.start, today)), pagesLeft = 604 - K.page;
  const n = Math.max(0, Math.ceil(pagesLeft / left)), from = K.page + 1, to = Math.min(604, K.page + n);
  const sv = p => meta.pages[p - 1];
  const end = to < 604 ? (() => { const [s, v] = sv(to + 1); return v > 1 ? [s, v - 1] : [s - 1, meta.s[s - 2][3]]; })() : [114, 6];
  return { from, to, n, start: sv(from), end, left, doneToday: K.log && K.log[today] };
}
export async function renderKhatm(root) {
  const meta = await data('meta.json');
  const draw = () => {
    const K = S.khatm, x = khatmToday(meta);
    root.innerHTML = `<header class="sub"><a href="#/quran" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Khatm planner')}</b><span class="ib"></span></header>
      ${!K ? `<p class="lead pad">${t('Finish the whole Quran in the time you choose. safa. splits it into daily pages and adjusts if you miss a day.')}</p>
        <div class="seg kd">${[7, 15, 30, 60, 90].map(d => `<button data-days="${d}"><b>${t('{n} days', { n: d })}</b><small>${t('≈ {p} pages a day', { p: Math.ceil(604 / d) })}</small></button>`).join('')}</div>
        <p class="muted small pad">${t('Miss a day? The plan adjusts by itself. No debt, no catching up by hand.')}</p>
        <p class="muted small pad">${t('Based on the 604 pages of the Madinah mushaf.')}</p>`
      : K.page >= 604 ? `<section class="hero2"><div class="big">✓</div><p>${t('Khatm complete. May Allah accept it.')}</p></section><button class="btn line big" id="kreset">${t('Start a new khatm')}</button>`
      : `<section class="hero2"><span class="mono">${t('Today')}</span><div class="big">${x.n}</div><p class="muted">${t('pages · {a} to {b}', { a: x.from, b: x.to })}</p></section>
        <div class="bar"><i style="width:${(K.page / 604 * 100).toFixed(1)}%"></i></div>
        <p class="mono pad">${t('{p} of 604 pages · {d} days left', { p: K.page, d: x.left })}</p>
        <a class="card row" href="#/quran/${x.start[0]}/${x.start[1]}"><span><span class="mono">${t('Read today’s portion')}</span><b>${esc(surahName(meta, x.start[0]))} <bdi>${x.start[0]}:${x.start[1]}</bdi> → ${esc(surahName(meta, x.end[0]))} <bdi>${x.end[0]}:${x.end[1]}</bdi></b></span>${icon.chev}</a>
        <button class="btn big" id="kdone">${t('I read today’s portion')}</button>
        <p class="muted small pad">${t('Missed a day? Nothing to make up by hand. The remaining pages are spread over the days left.')}</p>
        <button class="btn line sm danger" id="kreset">${t('Stop this plan')}</button>`}`;
  };
  root.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.days) { S.khatm = { start: dayKey(), days: +b.dataset.days, page: 0, log: {} }; save(); draw(); }
    if (b.id === 'kdone') { const x = khatmToday(meta); S.khatm.page = x.to; S.khatm.log[dayKey()] = 1; save(); toast(t('Well done.')); draw(); }
    if (b.id === 'kreset') { S.khatm = null; save(); draw(); }
  };
  draw();
  return () => { root.onclick = null; };
}

/* ---------- Memorisation (hifz): Leitner boxes on verse ranges ---------- */
const GAP = [1, 2, 4, 8, 16, 30];
export const hifzDue = () => S.hifz.items.filter(x => x.d <= dayKey());
export async function renderHifz(root) {
  const meta = await data('meta.json');
  const draw = () => {
    const H = S.hifz, today = dayKey(), due = hifzDue();
    const last = H.items[H.items.length - 1];
    const nextS = last ? (last.b < meta.s[last.s - 1][3] ? last.s : Math.max(1, last.s - 1)) : 114;
    const nextA = last && last.b < meta.s[last.s - 1][3] ? last.b + 1 : 1;
    const nextB = Math.min(meta.s[nextS - 1][3], nextA + H.perDay - 1);
    const row = x => `<li><span><b>${esc(surahName(meta, x.s))} ${rng(x.s, x.a, x.b)}</b><span class="muted small">${t('Level {n}', { n: x.box + 1 })} · ${x.d <= today ? t('due today') : t('next on {d}', { d: civil(x.d, { day: 'numeric', month: 'short' }) })}</span></span>
      <span class="hact"><a class="btn sm" href="#/quran/${x.s}/${x.a}/coach-${x.a}-${x.b}">${t('Guided')}</a><a class="btn line sm" href="#/quran/${x.s}/${x.a}/loop-${x.a}-${x.b}">${t('Practise')}</a>${x.d <= today ? `<button class="btn sm line" data-r="0" data-id="${x.id}">${t('Hard')}</button><button class="btn sm" data-r="1" data-id="${x.id}">${t('Solid')}</button>` : ''}</span></li>`;
    root.innerHTML = `<header class="sub"><a href="#/quran" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Memorisation')}</b><span class="ib"></span></header>
      <p class="lead pad">${t('A new portion each day, and reviews spaced out so what you learn stays.')}</p>
      <section class="card stack"><span class="mono">${t('Next new portion')}</span><b>${esc(surahName(meta, nextS))} ${rng(nextS, nextA, nextB)}</b>
        ${!H.items.length ? `<p class="muted small">${t('We start with the short surahs at the end of the Quran: they are the easiest to learn and the ones you recite in prayer.')}</p>` : ''}
        <label class="lbl">${t('Verses per portion')}</label><div class="seg per">${[3, 5, 7].map(n => `<button data-per="${n}" aria-pressed="${H.perDay === n}">${n}</button>`).join('')}</div>
        <button class="btn" id="hadd" data-s="${nextS}" data-a="${nextA}" data-b="${nextB}">${t('Add this portion')}</button>
        <p class="muted small">${t('You will see it again tomorrow, then in 3 days, then in 7 days, and further apart as it settles.')}</p>
        <details><summary class="mono">${t('Choose another portion')}</summary>
          <div class="grid3"><select id="hs" class="inp">${meta.s.map((m, i) => `<option value="${i + 1}" ${i + 1 === nextS ? 'selected' : ''}>${i + 1}. ${esc(surahName(meta, i + 1))}</option>`).join('')}</select>
          <input id="ha" class="inp" type="number" min="1" value="${nextA}" aria-label="${t('From verse')}"><input id="hb" class="inp" type="number" min="1" value="${nextB}" aria-label="${t('To verse')}"></div>
          <button class="btn line sm" id="hadd2">${t('Add')}</button></details>
      </section>
      ${due.length ? `<h3 class="sect">${t('Due today · {n}', { n: due.length })}</h3><ul class="evl">${due.map(row).join('')}</ul>` : H.items.length ? `<p class="muted pad">${t('Nothing to review today.')}</p>` : ''}
      ${H.items.length > due.length ? `<h3 class="sect">${t('Later')}</h3><ul class="evl">${H.items.filter(x => x.d > today).map(row).join('')}</ul>` : ''}
      <p class="muted small pad">${t('Guided: listen to each verse three times, read it three times, then recite it from memory.')} ${t('Practise opens the reader with the portion on loop. Use “Hide” in the player to test yourself, then rate it here.')}</p>`;
  };
  const add = (s, a, b) => { S.hifz.items.push({ id: Date.now().toString(36), s, a, b, box: 0, d: dayKey(), added: dayKey() }); save(); toast(t('Added')); draw(); };
  root.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.per) { S.hifz.perDay = +b.dataset.per; save(); draw(); return; }
    if (b.id === 'hadd') add(+b.dataset.s, +b.dataset.a, +b.dataset.b);
    if (b.id === 'hadd2') { const s = +$('#hs', root).value, n = meta.s[s - 1][3], a = Math.min(n, Math.max(1, +$('#ha', root).value || 1)), c = Math.min(n, Math.max(a, +$('#hb', root).value || a)); add(s, a, c); }
    if (b.dataset.r != null) { const x = S.hifz.items.find(y => y.id === b.dataset.id); x.box = +b.dataset.r ? Math.min(GAP.length - 1, x.box + 1) : 0; x.d = addDays(dayKey(), GAP[x.box]); save(); draw(); }
  };
  root.onchange = e => { if (e.target.id === 'hper') { S.hifz.perDay = Math.max(1, Math.min(30, +e.target.value || 5)); save(); draw(); } };
  draw();
  return () => { root.onclick = null; root.onchange = null; };
}

/* ---------- Missed prayers (qada) ---------- */
const QMAX = 29220; // 80 years of one daily prayer: a ceiling against typing slips.
export function renderQada(root) {
  let undo = null, note = '';
  const draw = () => {
    const Q = S.qada, total = P5.reduce((a, p) => a + (Q.p[p] || 0), 0);
    const days = total ? Math.ceil(total / Math.max(1, Q.perDay)) : 0;
    const any = total || Q.fast;
    root.innerHTML = `<header class="sub"><a href="#/plus" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Make-up prayers')}</b><span class="ib"></span></header>
      <p class="lead pad">${t('Making up is coming back. Here, privately and at your pace, you can note prayers to make up. No judgement. Every one you make up counts.')}</p>
      <p class="muted small pad">${t('Tap − each time you make one up. Tap a number to type it.')}</p>
      ${undo ? `<div class="card row undo" role="status"><span>${t('Counters reset to zero.')}</span><button class="btn line sm" id="qundo">${t('Undo')}</button></div>` : ''}
      ${note ? `<p class="card small" role="status">${note}</p>` : ''}
      <label class="tog card"><span>${t('Show on Today')}<small>${t('A small card with what is left.')}</small></span><input type="checkbox" id="qon" ${Q.on ? 'checked' : ''}></label>
      <ul class="times qd">${P5.map(p => `<li><span class="nm">${NAMES[p]}</span><span class="qctl"><button class="ib" data-p="${p}" data-d="-1" aria-label="${t('One made up')}">${icon.minus}</button><input class="mono qn" type="number" inputmode="numeric" min="0" max="${QMAX}" data-qn="${p}" value="${Q.p[p] || 0}" aria-label="${NAMES[p]}"><button class="ib" data-p="${p}" data-d="1" aria-label="${t('Add one to make up')}">${icon.plus}</button></span></li>`).join('')}
        <li><span class="nm">${t('Fasting days')}</span><span class="qctl"><button class="ib" data-f="-1" aria-label="${t('One made up')}">${icon.minus}</button><input class="mono qn" type="number" inputmode="numeric" min="0" max="${QMAX}" data-qn="fast" value="${Q.fast || 0}" aria-label="${t('Fasting days')}"><button class="ib" data-f="1" aria-label="${t('Add one to make up')}">${icon.plus}</button></span></li></ul>
      <section class="card stack"><label class="lbl">${t('Make-up prayers per day')}</label><div class="seg per">${[1, 2, 5, 10].map(n => `<button data-qper="${n}" aria-pressed="${Q.perDay === n}">${n}</button>`).join('')}</div>
        <p>${total ? t('{n} prayers left. At this pace, done in about {d} days, around {date}.', { n: total.toLocaleString(L()), d: days.toLocaleString(L()), date: civil(addDays(dayKey(), days), { day: 'numeric', month: 'long', year: 'numeric' }) }) : (Q.started ? t('Nothing left to make up.') : t('Nothing noted yet. Add prayers with +, or estimate from years below.'))}</p>
        <details ${total ? '' : 'open'}><summary class="mono">${t('Estimate from missed years')}</summary><div class="row2"><input id="qy" class="inp" type="number" min="0" max="80" step="0.5" placeholder="${t('Years')}" inputmode="decimal"><button class="btn line sm" id="qest">${t('Add to each prayer')}</button></div><p class="muted small">${t('Adds 365 per year to each of the five prayers, up to 80 years. Adjust by hand after.')}</p></details></section>
      ${any ? `<section class="card stack"><b>${t('Start over')}</b><p class="muted small">${t('Sets the counters back to zero. You can undo right after.')}</p><button class="btn line sm danger" id="qreset">${t('Reset make-up prayers')}</button></section>` : ''}
      <p class="muted small pad">${t('How to make up prayers, and which ones, differs between schools. Ask a person of knowledge.')}</p>`;
  };
  const snap = () => JSON.parse(JSON.stringify({ p: S.qada.p, fast: S.qada.fast, started: S.qada.started }));
  root.onclick = e => {
    const b = e.target.closest('button'); if (!b) return; const Q = S.qada;
    note = '';
    if (b.dataset.qper) { Q.perDay = +b.dataset.qper; save(); draw(); return; }
    if (b.dataset.p) { Q.p[b.dataset.p] = Math.min(QMAX, Math.max(0, (Q.p[b.dataset.p] || 0) + +b.dataset.d)); Q.started = true; Q.updated = Date.now(); undo = null; save(); draw(); }
    if (b.dataset.f) { Q.fast = Math.min(QMAX, Math.max(0, (Q.fast || 0) + +b.dataset.f)); Q.updated = Date.now(); undo = null; save(); draw(); }
    if (b.id === 'qest') {
      const raw = +$('#qy', root).value || 0, y = Math.min(80, Math.max(0, raw));
      if (!y) return;
      if (raw > 80) note = t('Estimate capped at 80 years.');
      P5.forEach(p => { Q.p[p] = Math.min(QMAX, (Q.p[p] || 0) + Math.round(y * 365)); });
      Q.started = true; undo = null; save(); draw();
    }
    if (b.id === 'qreset') {
      const el = sheet(`<h3>${t('Reset make-up prayers')}</h3><p class="muted small">${t('Choose what goes back to zero.')}</p><div class="acts"><button data-qr="p">${t('The five prayers')}</button><button data-qr="all">${t('Prayers and fasting days')}</button><button data-close>${t('Cancel')}</button></div>`, { label: t('Reset make-up prayers') });
      el.onclick = e2 => {
        const x = e2.target.closest('[data-qr]'); if (!x) return;
        undo = snap();
        P5.forEach(p => { Q.p[p] = 0; });
        if (x.dataset.qr === 'all') Q.fast = 0;
        Q.started = false; Q.updated = Date.now(); save(); closeSheet(); draw();
        root.querySelector('#qundo')?.focus();
      };
    }
    if (b.id === 'qundo' && undo) { Object.assign(Q, { p: undo.p, fast: undo.fast, started: undo.started }); undo = null; save(); draw(); toast(t('Counters restored.')); }
  };
  root.onchange = e => {
    if (e.target.id === 'qon') { S.qada.on = e.target.checked; save(); }
    if (e.target.dataset.qn) {
      const k = e.target.dataset.qn, n = Math.min(QMAX, Math.max(0, Math.round(+e.target.value || 0)));
      if (k === 'fast') S.qada.fast = n; else { S.qada.p[k] = n; S.qada.started = true; }
      S.qada.updated = Date.now(); undo = null; note = ''; save(); draw();
    }
  };
  // Clamp values saved by older versions (no ceiling before).
  P5.forEach(p => { if ((S.qada.p[p] || 0) > QMAX) S.qada.p[p] = QMAX; }); if ((S.qada.fast || 0) > QMAX) S.qada.fast = QMAX;
  draw();
  return () => { root.onclick = null; root.onchange = null; };
}
