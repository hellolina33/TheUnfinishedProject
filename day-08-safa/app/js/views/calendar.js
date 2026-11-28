// Hijri calendar (Umm al-Qura, with a local moon-sighting offset) and key dates.
import { S, save, dayKey, addDays } from '../store.js';
import { $, $$, esc, icon, download } from '../ui.js';
import { t, L, LB } from '../i18n.js';

const fmtNum = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', { timeZone: 'UTC', day: 'numeric', month: 'numeric', year: 'numeric' });
const keyMs = k => Date.parse(k + 'T12:00:00Z');
// Hijri parts of a civil day 'YYYY-MM-DD', shifted by the user's sighting offset.
export function hijriOf(k) {
  const p = Object.fromEntries(fmtNum.formatToParts(new Date(keyMs(k) + (S.hijriAdj || 0) * 86400000)).map(x => [x.type, x.value]));
  return { d: +p.day, m: +p.month, y: parseInt(p.year, 10) };
}
const monthName = (m, y) => {
  // Find any day of that Hijri month and let Intl name it in the UI language.
  try { return new Intl.DateTimeFormat(LB(), { calendar: 'islamic-umalqura', month: 'long', timeZone: 'UTC' }).format(new Date(monthStart(y, m) + (S.hijriAdj || 0) * 86400000 + 5 * 86400000)); } catch (e) { return String(m); }
};
function monthStart(y, m) {
  // Search around a rough estimate (354.37 days per Hijri year, epoch 622-07-16).
  let ms = Date.UTC(622, 6, 16) + ((y - 1) * 354.367 + (m - 1) * 29.53) * 86400000;
  let k = new Date(ms).toISOString().slice(0, 10);
  for (let i = 0; i < 60; i++) { const h = hijriOf(k); if (h.y === y && h.m === m && h.d === 1) return keyMs(k); k = addDays(k, h.y < y || (h.y === y && h.m < m) ? 1 : -1); }
  return keyMs(k);
}
export const EVENTS = [
  [1, 1, 'Islamic New Year'], [1, 10, 'Day of Ashura'], [9, 1, 'First day of Ramadan'], [9, 21, 'Last ten nights of Ramadan begin'],
  [10, 1, 'Eid al-Fitr'], [12, 1, 'First ten days of Dhul-Hijjah'], [12, 9, 'Day of Arafah'], [12, 10, 'Eid al-Adha']
];
export function upcoming(n = 6) {
  const out = []; let k = dayKey();
  for (let i = 0; i < 400 && out.length < n; i++, k = addDays(k, 1)) {
    const h = hijriOf(k), e = EVENTS.find(x => x[0] === h.m && x[1] === h.d);
    if (e) out.push({ k, h, name: e[2], days: i });
  }
  return out;
}
const civil = (k, o) => new Intl.DateTimeFormat(L(), Object.assign({ timeZone: 'UTC' }, o)).format(new Date(keyMs(k)));

let view = null;
export function renderCalendar(root) {
  const draw = () => {
    const today = dayKey(), th = hijriOf(today);
    if (!view) view = { y: th.y, m: th.m };
    const start = monthStart(view.y, view.m); let k = new Date(start).toISOString().slice(0, 10);
    const days = []; for (let i = 0; i < 31; i++) { const h = hijriOf(k); if (h.m !== view.m) break; days.push([k, h]); k = addDays(k, 1); }
    const lead = (new Date(keyMs(days[0][0])).getUTCDay() + 6) % 7;
    const wd = Array.from({ length: 7 }, (_, i) => civil(addDays('2024-01-01', i), { weekday: 'narrow' }));
    const up = upcoming(6);
    { let k2 = today; for (let i = 0; i < 31; i++, k2 = addDays(k2, 1)) { const h = hijriOf(k2); if (h.d === 13) { up.unshift({ k: k2, h, name: 'White days begin (voluntary fasting)', days: i }); break; } } }
    up.sort((a, b) => a.days - b.days);
    root.innerHTML = `<header class="sub"><a href="#/today" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Hijri calendar')}</b><span class="ib"></span></header>
      <div class="calh"><button class="ib" id="cprev" aria-label="${t('Previous month')}">${icon.back}</button>
        <div><b>${esc(monthName(view.m, view.y))} ${view.y}</b><span class="mono">${esc(civil(days[0][0], { day: 'numeric', month: 'short' }))} – ${esc(civil(days[days.length - 1][0], { day: 'numeric', month: 'short', year: 'numeric' }))}</span></div>
        <button class="ib flip" id="cnext" aria-label="${t('Next month')}">${icon.back}</button></div>
      <p class="muted small">${t('Big number: Hijri day. Small number: day of the usual calendar.')}</p>
      <div class="calg" role="grid">${wd.map(w => `<span class="mono">${esc(w)}</span>`).join('')}${'<span></span>'.repeat(lead)}${days.map(([dk, h]) => {
        const ev = EVENTS.find(x => x[0] === h.m && x[1] === h.d), white = h.d >= 13 && h.d <= 15;
        return `<span class="cd ${dk === today ? 'today' : ''} ${ev ? 'ev' : ''} ${white ? 'white' : ''}" title="${ev ? esc(t(ev[2])) : white ? esc(t('White day')) : ''}"><b>${h.d}</b><small>${esc(civil(dk, { day: 'numeric' }))}</small></span>`;
      }).join('')}</div>
      <p class="muted small"><span class="dot"></span> ${t('Key date')} · <span class="wd"></span> ${t('White days (13–15): voluntary fasting')}</p>
      <h3 class="sect">${t('Coming up')}</h3>
      <ul class="evl">${up.map(e => `<li><span><b>${esc(t(e.name))}</b><span class="muted small">${esc(e.h.d + ' ' + monthName(e.h.m, e.h.y) + ' ' + e.h.y)} · ${esc(civil(e.k, { weekday: 'long', day: 'numeric', month: 'long' }))}</span></span><span class="evr"><span class="mono">${e.days === 0 ? t('Today') : t('in {n} d', { n: e.days })}</span><button class="linkbtn small" data-ics="${e.k}|${esc(t(e.name))}">${t('Add to calendar')}</button></span></li>`).join('')}</ul>
      <section class="card stack"><b>${t('Moon sighting')}</b><p class="muted small">${t('Dates follow the Umm al-Qura calendar. Your country may announce the month a day earlier or later. Shift it here.')}</p>
        <div class="seg">${[-2, -1, 0, 1, 2].map(n => `<button data-adj="${n}" aria-pressed="${(S.hijriAdj || 0) === n}">${n > 0 ? '+' : ''}${n}</button>`).join('')}</div></section>`;
  };
  root.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.ics) { const [k, nm] = b.dataset.ics.split('|'), d = k.replace(/-/g, ''), nx = addDays(k, 1).replace(/-/g, ''); download(`safa-${d}.ics`, ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//safa.//EN', 'BEGIN:VEVENT', `UID:safa-${d}-${Date.now()}@safa`, `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d+/g, '')}`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${nx}`, `SUMMARY:${nm.replace(/[,;]/g, ' ')}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'), 'text/calendar'); return; }
    if (b.id === 'cprev') { view.m--; if (view.m < 1) { view.m = 12; view.y--; } draw(); }
    if (b.id === 'cnext') { view.m++; if (view.m > 12) { view.m = 1; view.y++; } draw(); }
    if (b.dataset.adj != null) { S.hijriAdj = +b.dataset.adj; save(); view = null; draw(); }
  };
  view = null; draw();
  return () => { root.onclick = null; };
}
// Ramadan, by the same Hijri calendar the app shows (with the sighting offset).
export const isRamadan = (k = dayKey()) => hijriOf(k).m === 9;
