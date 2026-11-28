import { S, save, dayKey, addDays, getDay, P5, data } from '../store.js';
import { timesFor, ORDER, NAMES, AR, fmtTime, hijri, gregorian, weekday, qiblaBearing, methodAngles, flightPrayers, localToUtc, distanceKm, METHODS } from '../prayer.js';
import { $, esc, icon, pad, cityField, toast, sheet, closeSheet, download } from '../ui.js';
import { thaiSurah } from '../thai-quran.js';
import { t, L, lang, LB } from '../i18n.js';
import { upcoming, isRamadan, hijriOf } from './calendar.js';
import { hifzDue } from './plan.js';

function nextPrayer() {
  const now = Date.now(), key = dayKey(now), today = timesFor(key);
  let cur = null; for (const k of P5) if (today[k] && today[k] <= now) cur = k;
  for (const k of P5) if (today[k] && today[k] > now) return { k, t: today[k], today, cur, key };
  const tm = timesFor(addDays(key, 1));
  return { k: 'fajr', t: tm.fajr, today, cur: 'isha', key };
}

function extras() {
  let h = '';
  const ev = upcoming(1)[0];
  if (ev && ev.days <= 30) h += `<a class="card row" href="#/calendar"><span><span class="mono">${t('Hijri calendar')}</span><b>${esc(t(ev.name))}</b><span class="muted small">${ev.days === 0 ? t('Today') : t('in {n} d', { n: ev.days })}</span></span>${icon.chev}</a>`;
  const due = hifzDue().length;
  if (S.hifz.items.length) h += `<a class="card row" href="#/hifz"><span><span class="mono">${t('Memorisation')}</span><b>${due ? t('{n} portions to review', { n: due }) : t('Nothing to review today')}</b></span>${icon.chev}</a>`;
  if (S.khatm && S.khatm.page < 604) h += `<a class="card row" href="#/khatm"><span><span class="mono">${t('Khatm')}</span><b>${S.khatm.log && S.khatm.log[dayKey()] ? t('Today’s portion done') : t('Today: pages {a} to {b}', { a: S.khatm.page + 1, b: Math.min(604, S.khatm.page + Math.ceil((604 - S.khatm.page) / Math.max(1, khatmDaysLeft()))) })}</b><span class="muted small">${t('{p} of 604 pages', { p: S.khatm.page })}</span></span>${icon.chev}</a>`;
  if (S.qada.on) { const n = P5.reduce((a, p) => a + (S.qada.p[p] || 0), 0); h += `<a class="card row" href="#/qada"><span><span class="mono">${t('Make-up prayers')}</span><b>${n ? t('{n} left', { n }) : t('Nothing left to make up.')}</b></span>${icon.chev}</a>`; }
  return h;
}


function arcDots(T, sr, ss) {
  if (!sr || !ss) return '';
  return ['fajr', 'dhuhr', 'asr', 'maghrib'].map(k => {
    const f = Math.min(1, Math.max(0, (T[k] - sr) / (ss - sr))), a = Math.PI * (1 - f);
    return `<circle cx="${(150 + 120 * Math.cos(a)).toFixed(1)}" cy="${(132 - 120 * Math.sin(a)).toFixed(1)}" r="3" class="arc-p"><title>${NAMES[k]} ${fmtTime(T[k])}</title></circle>`;
  }).join('');
}
// A prayer whose time has fully passed and is not ticked: a soft line, no red, no count.
function missed(day, T, now, np) {
  if (day.pz) return '';
  const P = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'], gone = P.filter((k, i) => !day.p[i] && P[i + 1] && T[P[i + 1]] < now && k !== np.cur);
  if (!gone.length) return '';
  return `<p class="gentle">${t('A prayer went by without a tick? You can still tick it, or make it up later, gently.')} <a href="#/qada">${t('Make-up prayers')}</a></p><div class="row2 gentle-acts">${gone.map(k => `<button class="btn line sm" data-toqada="${k}">${t('Add {p} to make-up prayers', { p: NAMES[k] })}</button>`).join('')}</div>`;
}
// After 3 empty days in a row (not paused), offer the pause once.
function pauseHint() {
  if (S.pauseOn || S.pauseHinted) return '';
  const ks = [1, 2, 3].map(n => dayKey(Date.now() - n * 86400000));
  if (!S.since || ks.some(k => k < S.since)) return '';
  if (ks.some(k => { const d = S.days[k]; return d && (d.pz || d.p.some(Boolean) || d.r); })) return '';
  return `<section class="card gentlec"><p>${t('A few quiet days. That happens. If life is heavy right now, pause mode freezes the tracking. Nothing is counted against you.')}</p><div class="row2"><a class="btn sm line" href="#/track" data-ph="1">${t('See pause mode')}</a><button class="linkbtn small" data-ph="0">${t('No thanks')}</button></div></section>`;
}
// Voluntary fasts: a quiet note the day before (Monday, Thursday, the 13th-15th of the Hijri month).
function fastNote() {
  if (!S.fastRem) return '';
  const tm = addDays(dayKey(), 1), wd = new Date(tm + 'T12:00:00Z').getUTCDay(), h = hijriOf(tm).d;
  if (isRamadan(tm)) return '';
  const why = [13, 14, 15].includes(h) ? t('a “white day” ({d} of the Hijri month)', { d: h }) : wd === 1 ? t('Monday') : wd === 4 ? t('Thursday') : '';
  return why ? `<p class="gentle">${t('Tomorrow is {w}: a voluntary fast is possible, if you wish.', { w: why })}</p>` : '';
}
// The phone changed time zone: offer to update the city.
function tzNote() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!S.loc || !tz || tz === S.loc.tz || S.tzSeen === tz) return '';
  return `<div class="card row tzbar" role="status"><span>${t('Your phone is now on {z} time. Show prayer times for where you are?', { z: esc(tz.split('/').pop().replace(/_/g, ' ')) })}</span><span class="row2"><a class="btn sm" href="#/flight">${t('Change city')}</a><button class="btn line sm" data-tzok="${esc(tz)}">${t('Keep {c}', { c: esc(S.loc.name) })}</button></span></div>`;
}
function khatmDaysLeft() { try { const st = new Date(S.khatm.start + 'T12:00:00Z'), end = st.getTime() + S.khatm.days * 86400000; return Math.max(1, Math.ceil((end - Date.now()) / 86400000)); } catch (e) { return 1; } }
function tools() {
  return `<nav class="tools" aria-label="${t('Tools')}">
    <a href="#/qibla">${icon.compass}<span>${t('Qibla')}</span></a>
    <a href="#/calendar">${icon.cal}<span>${t('Calendar')}</span></a>
    <a href="#/flight">${icon.plane}<span>${t('Travel')}</span></a></nav>`;
}
function welcome() {
  if (S.backDay === dayKey() && S.backHidden !== S.backDay) return `<section class="card welcome back"><button class="ib x" data-hide="back" aria-label="${t('Hide')}">${icon.stop}</button>
    <b>${t('Welcome back. However long it has been, the door is open.')}</b>
    <p class="quote">${t('“Allah loves those who turn back to Him.” (Quran 2:222)')}</p>
    <p class="muted small">${t('No catching up today. Just the next prayer. The rest, gently, when you want.')}</p>
    <div class="row2"><a class="btn sm" href="#/learn">${t('Refresh the basics')}</a><a class="btn sm line" href="#/duas/129">${t('A dua for forgiveness')}</a></div></section>`;
  if (S.hideWelcome) return '';
  const first = !S.since || S.since >= dayKey();
  const lvl = S.level;
  if (lvl === 'new' || lvl === 'back') return `<section class="card welcome"><button class="ib x" data-hide="welcome" aria-label="${t('Hide')}">${icon.stop}</button>
    <b>${t(lvl === 'new' ? 'Welcome. Start here, one step at a time.' : 'Welcome back. No question is a silly one here.')}</b>
    <p class="muted small">${t('Ablution, then prayer, step by step. Then Al-Fatiha word by word.')}</p>
    <a class="btn sm" href="#/learn">${t('Open First steps')}</a></section>`;
  if (first) return `<section class="card welcome"><button class="ib x" data-hide="welcome" aria-label="${t('Hide')}">${icon.stop}</button>
    <b>${t('Welcome. Take your time.')}</b>
    <p class="muted small">${t('Your times are ready. When you want, read a verse with its context, or find a dua for how you feel.')}</p>
    <div class="row2"><a class="btn sm" href="#/quran/1">${t('Read Al-Fatiha')}</a><a class="btn sm line" href="#/duas">${t('Find a dua')}</a></div></section>`;
  return '';
}
function installCard() {
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone || S.hideInstall || !S.since || S.since >= dayKey()) return '';
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && /safari/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
  if (!ios && !window.__bip) return '';
  return `<section class="card welcome"><button class="ib x" data-hide="install" aria-label="${t('Hide')}">${icon.stop}</button>
    <b>${t('Keep safa. on your home screen')}</b>
    <p class="muted small">${ios ? t('In Safari, tap Share, then “Add to Home Screen”. It opens like an app, offline, with no store.') : t('Open your browser menu, then “Install app” or “Add to Home screen”. It opens like an app, offline, with no store.')}</p>
    ${window.__bip ? `<button class="btn sm" data-install="1">${t('Install')}</button>` : ''}<button class="linkbtn small" data-hide="install">${t('Do not show again')}</button></section>`;
}
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.__bip = e; });

// A gentle, sourced verse for the day. Hope and mercy only.
const AYAT = [[94, 5], [2, 286], [65, 3], [13, 28], [39, 53], [2, 152], [3, 139], [93, 3], [12, 87], [2, 186], [20, 46], [29, 69], [40, 60], [94, 6], [65, 2], [8, 46], [2, 153], [11, 115], [28, 24], [3, 173], [7, 56], [6, 54], [42, 30], [9, 51], [57, 4], [50, 16], [2, 45], [64, 11], [16, 128], [15, 56]];
async function ayahOfDay(el) {
  if (!el) return;
  const k = dayKey(), n = (+k.replace(/-/g, '')) % AYAT.length, [s, v] = AYAT[n];
  try {
    const meta = await data('meta.json'), src = await data('quran/' + s + '.json');
    let tr = src.v[v - 1].t; if (lang() === 'fr') { const f = await data('fr/' + s + '.json'); tr = f[v - 1]; } else if (lang() === 'th') { tr = (await thaiSurah(s).catch(() => []))[v - 1] || ''; }
    const nm = lang() === 'ar' ? meta.s[s - 1][2] : meta.s[s - 1][0];
    el.innerHTML = `<span class="mono">${t('A verse for today')}</span><p class="ar" lang="ar" dir="rtl">${src.v[v - 1].a.join(' ')}</p>${lang() !== 'ar' ? `<p>« ${esc(tr)} »</p>` : ''}<a class="mono" href="#/quran/${s}/${v}">${esc(String(nm))} ${s}:${v} · ${t('Read in context')} ›</a>`;
    el.hidden = false;
  } catch (e) { /* offline and not cached: skip quietly */ }
}

const tracking = () => S.trackOn ?? Object.values(S.days || {}).some(d => d && d.p && d.p.some(Boolean));
const adjusted = () => Object.values(S.offsets || {}).some(Boolean);
export function render(root) {
  let timer;
  { const today = dayKey(); if (S.lastSeen && S.lastSeen < today) { const gap = (Date.parse(today) - Date.parse(S.lastSeen)) / 86400000; if (gap >= 10) S.backDay = today; } if (S.lastSeen !== today) { S.lastSeen = today; save(); } }
  const draw = () => {
    const np = nextPrayer(), now = Date.now(), day = getDay(np.key, true), T = np.today;
    const sr = T.sunrise, ss = T.maghrib; let f = sr && ss ? (now - sr) / (ss - sr) : .5; const up = f >= 0 && f <= 1; f = Math.min(1, Math.max(0, f));
    const ang = Math.PI * (1 - f), sx = 150 + 120 * Math.cos(ang), sy = 132 - 120 * Math.sin(ang);
    const isFri = weekday(now) === 'Friday', h = +new Intl.DateTimeFormat('en-GB', { timeZone: S.loc.tz, hour: '2-digit', hourCycle: 'h23' }).format(new Date(now));
    const last = S.q.last;
    const suggest = isFri && S.fri.on && !day.k ? `<a class="card row" href="#/quran/18"><span><span class="mono">${t('Friday')}</span><b>${t('Read Al-Kahf')}</b></span>${icon.chev}</a>`
      : `<a class="card row" href="#/duas/27"><span><span class="mono">${t(h < 15 ? 'Morning adhkar' : 'Evening adhkar')}</span><b>${t('Words of remembrance')}</b></span>${icon.chev}</a>`;
    const trk = tracking() && !day.pz;
    root.innerHTML = `
      <header class="vh"><div><h1>${t('Today')}</h1><p class="dates2">${esc(gregorian(now))} · <a href="#/calendar" class="hijri-link">${esc(hijri(now))}</a></p><a class="loc mono" href="#/setup" aria-label="${esc(t('Change city'))}: ${esc(S.loc.name)}">${esc(S.loc.name)}${adjusted() ? ' · ' + t('adjusted') : ''} · ${t('change')}</a></div>
</header>
      ${S.homeLoc ? `<div class="card row travel-bar" role="status"><span>${t('Times for {c}, for now.', { c: esc(S.loc.name) })}</span><button class="btn line sm" id="tback">${t('Back to {c}', { c: esc(S.homeLoc.name) })}</button></div>` : ''}
      ${tzNote()}
      ${welcome()}
      ${day.pz ? `<div class="card row paused-bar" role="status"><span><span class="dot"></span> ${t('Tracking paused')}</span><button class="btn line sm" id="tresume">${t('Resume tracking')}</button></div>` : ''}
      ${isRamadan() ? `<section class="card ramadan"><span class="mono">${t('Ramadan')}</span><div class="rmd"><div><small>${t('Fast begins (Fajr)')}</small><b class="mono">${fmtTime(T.fajr)}</b></div><div><small>${t('Fast breaks (Maghrib)')}</small><b class="mono">${fmtTime(T.maghrib)}</b></div></div><div class="row2"><a class="btn line sm" href="#/duas/68">${t('Dua for breaking the fast')}</a><button class="btn line sm" id="zakat">${t('Zakat al-fitr')}</button></div><p class="muted small">${t('Some calendars show an imsak a few minutes before Fajr, as a precaution. The fast itself begins at Fajr.')}</p></section>` : ''}
      <section class="next">
        <svg class="arc" viewBox="0 0 300 150" aria-hidden="true"><path d="M30 132A120 120 0 01270 132" class="arc-l"/><path d="M12 132H288" class="arc-h"/>${arcDots(T, sr, ss)}<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="7" class="arc-s ${up ? '' : 'night'}"><title>${t('Now')}</title></circle></svg>
        <span class="nextp">${t(np.t > T.isha && np.k === 'fajr' ? '{p} tomorrow at {t}' : '{p} at {t}', { p: NAMES[np.k], t: fmtTime(np.t) })}</span>
        <div class="count words" id="cd" aria-live="off"></div>
        ${trk && np.cur ? `<button class="btn sm line" data-mark="${P5.indexOf(np.cur)}">${day.p[P5.indexOf(np.cur)] ? icon.check + t('{p} prayed', { p: NAMES[np.cur] }) : t('{p} prayed?', { p: NAMES[np.cur] })}</button>` : ''}
      </section>
      <ul class="times">${ORDER.map(k => {
        const i = P5.indexOf(k), off = k !== 'sunrise' && S.offsets[k];
        const label = isFri && k === 'dhuhr' ? t("Jumu'a") : NAMES[k];
        return `<li class="${k === np.k && T[k] > now ? 'upnext' : ''} ${k === np.cur ? 'now' : T[k] && T[k] < now ? 'past' : ''} ${i >= 0 ? 'pr' : 'mark'}" ${i >= 0 && trk ? `data-mark="${i}"` : ''}>
          <span class="nm">${label}<span class="ar" lang="ar">${isFri && k === 'dhuhr' ? 'الجمعة' : AR[k]}</span>${off ? `<span class="adj mono" title="${t('Adjusted manually')}">${off > 0 ? '+' : ''}${off} min</span>` : ''}</span>
          <span class="tm mono">${fmtTime(T[k])}${i >= 0 && (S.iqama || {})[k] ? `<small class="iq">${t('iqama {t}', { t: fmtTime(T[k] + S.iqama[k] * 60000) })}</small>` : ''}</span>
          ${i >= 0 ? (trk ? `<button class="chk ${day.p[i] ? 'on' : ''}" data-mark="${i}" role="checkbox" aria-checked="${!!day.p[i]}" aria-label="${t('{p} prayed?', { p: NAMES[k] })}">${day.p[i] ? icon.check : ''}</button>` : '') : `<span class="sunr mono">${t('sunrise')}</span>`}</li>`;
      }).join('')}</ul>
      ${(() => { const nf = timesFor(addDays(dayKey(), 1)).fajr, night = nf - T.maghrib; return `<p class="nightl mono">${t('Middle of the night {a} · last third from {b}', { a: fmtTime(T.maghrib + night / 2), b: fmtTime(T.maghrib + night * 2 / 3) })}</p>`; })()}
      <details class="method-d"><summary class="linkbtn small">${t('Times when voluntary prayer is discouraged')}</summary><p class="muted small">${t('For most scholars: from after Fajr until about 15 minutes after sunrise ({a}), a few minutes before Dhuhr when the sun is at its highest, and from after Asr until sunset ({b}). Make-up prayers and prayers with a reason differ by school.', { a: fmtTime(T.sunrise + 15 * 60000), b: fmtTime(T.maghrib) })}</p></details>
      <details class="method-d"><summary class="linkbtn small">${t('How these times are computed')}</summary><p class="muted small">${esc(METHODS[S.method].n)}${S.madhab === 'hanafi' ? ' · ' + t('Hanafi Asr') : ''}. ${adjusted() ? t('A personal adjustment is on: {x}.', { x: P5.filter(k => S.offsets[k]).map(k => `${NAMES[k]} ${S.offsets[k] > 0 ? '+' : ''}${S.offsets[k]} min`).join(', ') }) : t('No personal adjustment.')} <a href="#/settings/times">${t('Change')}</a></p></details>
      ${trk ? missed(day, T, now, np) : ''}
      ${pauseHint()}
      ${fastNote()}
      ${tools()}
      <a class="card row" href="#/quran/${last ? last.s + '/' + last.v : '1'}"><span><span class="mono">${t(last ? 'Resume reading' : 'Start reading')}</span><b>${last ? esc(last.n) + ' · ' + last.s + ':' + last.v : 'Al-Fatihah · 1:1'}</b></span>${icon.chev}</a>
      ${suggest}
      <section class="card ayah" id="ayah" hidden></section>
      ${extras()}
      ${installCard()}
      <div class="foot2"><button class="btn line sm" id="tacts">${t('Actions')}</button></div>`;
    const tick = () => {
      const s = Math.round((np.t - Date.now()) / 1000);
      if (s <= 0) { draw(); return; }
      const el = $('#cd', root); if (!el) return;
      const mm = Math.ceil(s / 60), h = Math.floor(mm / 60), m = mm % 60;
      const txt = mm >= 60 ? t('in {h} h {m}', { h, m: pad(m) }) : s >= 60 ? t('in {m} min', { m: mm }) : t('in under a minute');
      if (el.textContent !== txt) el.textContent = txt;
    };
    clearInterval(timer); tick(); timer = setInterval(tick, 15000);
    ayahOfDay($('#ayah', root));
  };
  const share = async () => { const T = timesFor(dayKey()); const txt = `${S.loc.name} · ${gregorian(Date.now())}\n` + ORDER.map(k => `${NAMES[k]} ${fmtTime(T[k])}`).join('\n') + `\n\nsafa. · ${location.origin}${location.pathname.replace(/app\/.*$/, '')}`; try { if (navigator.share) await navigator.share({ text: txt }); else { await navigator.clipboard.writeText(txt); toast(t('Copied')); } } catch (err) { /* cancelled */ } };
  const ics = () => {
    const T = timesFor(dayKey()), st = ms => new Date(ms).toISOString().replace(/[-:]|\.\d+/g, '');
    const ev = P5.map(k => ['BEGIN:VEVENT', `UID:safa-${k}-${dayKey()}@safa`, `DTSTAMP:${st(Date.now())}`, `DTSTART:${st(T[k])}`, 'DURATION:PT15M', `SUMMARY:${NAMES[k]} · safa.`, 'END:VEVENT'].join('\r\n'));
    download(`safa-${dayKey()}.ics`, ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//safa.//EN', ...ev, 'END:VCALENDAR'].join('\r\n'), 'text/calendar');
  };
  const other = () => {
    const el = sheet(`<h3>${t('Times for another city')}</h3><p class="muted small">${t('For a trip. Your usual city comes back in one tap.')}</p><div id="ocity"></div>`, { label: t('Times for another city') });
    cityField($('#ocity', el), { placeholder: t('Type a city'), onPick: c => {
      if (!S.homeLoc) S.homeLoc = S.loc;
      S.loc = { name: c[0], country: c[1], iso2: c[2], lat: c[3], lng: c[4], tz: c[5] }; save(); closeSheet(); draw();
    } });
    $('#ocity input', el)?.focus();
  };
  const actions = () => {
    const el = sheet(`<h3>${t('Actions')}</h3><div class="acts">
      <button data-a="share">${t('Share today’s times')}</button>
      <button data-a="ics">${t('Add today’s prayers to my calendar')}</button>
      <button data-a="city">${t('Times for another city')}</button>
      <button data-a="trk" role="switch" aria-checked="${tracking()}">${tracking() ? t('Tracking on · turn off') : t('Tracking off · turn on')}</button>
      <a href="#/track">${t('A hard day? Pause mode')}</a>
      <button data-close>${t('Cancel')}</button></div>`, { label: t('Actions') });
    el.onclick = async ev => {
      const b = ev.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a; closeSheet();
      if (a === 'share') await share(); else if (a === 'ics') ics(); else if (a === 'city') other();
      else if (a === 'trk') { S.trackOn = !tracking(); save(); draw(); toast(S.trackOn ? t('Tracking on. Tick each prayer.') : t('Tracking off. Times only.')); }
      $('#tacts', root)?.focus();
    };
  };
  root.onclick = async e => {
    const tq = e.target.closest('[data-toqada]'); if (tq) { S.qada.p[tq.dataset.toqada] = (S.qada.p[tq.dataset.toqada] || 0) + 1; S.qada.started = true; save(); tq.disabled = true; tq.textContent = t('Added. Make it up when you can.'); return; }
    const tz = e.target.closest('[data-tzok]'); if (tz) { S.tzSeen = tz.dataset.tzok; save(); tz.closest('.tzbar').remove(); return; }
    if (e.target.id === 'zakat') {
      const el = sheet(`<h3>${t('Zakat al-fitr')}</h3><p class="muted small">${t('One portion per person in the household, given before the Eid prayer. The amount is set by your mosque or local authority.')}</p><div class="grid2"><label class="lbl">${t('People')}<input class="inp" id="zn" type="number" min="1" value="${S.zakat?.n || 1}" inputmode="numeric"></label><label class="lbl">${t('Amount per person')}<input class="inp" id="za" type="number" min="0" step="0.5" value="${S.zakat?.a ?? ''}" inputmode="decimal"></label></div><p class="big2" id="zt" role="status"></p>`, { label: t('Zakat al-fitr') });
      const up = () => { const n = Math.max(1, +$('#zn', el).value || 1), a = Math.max(0, +$('#za', el).value || 0); S.zakat = { n, a }; save(); $('#zt', el).textContent = a ? t('Total: {x}', { x: (n * a).toLocaleString(L(), { maximumFractionDigits: 2 }) }) : ''; };
      el.oninput = up; up(); return;
    }
    if (e.target.id === 'tacts') { actions(); return; }
    if (e.target.id === 'tback') { S.loc = S.homeLoc; S.homeLoc = null; save(); draw(); return; }
    if (e.target.id === 'tresume') { S.pauseOn = false; S.pauseUntil = null; const d0 = getDay(dayKey(), true); d0.pz = 0; save(); draw(); toast(t('Tracking resumed.')); return; }
    const ph = e.target.closest('[data-ph]'); if (ph) { S.pauseHinted = true; save(); if (ph.dataset.ph === '0') draw(); return; }
    const hb = e.target.closest('[data-hide]'); if (hb) { if (hb.dataset.hide === 'back') S.backHidden = S.backDay; else if (hb.dataset.hide === 'welcome') S.hideWelcome = true; else S.hideInstall = true; save(); draw(); return; }
    if (e.target.closest('[data-install]') && window.__bip) { try { window.__bip.prompt(); await window.__bip.userChoice; } catch (err) { /* ignore */ } window.__bip = null; draw(); return; }
    const b = e.target.closest('[data-mark]'); if (!b) return;
    const d = getDay(dayKey(), true), i = +b.dataset.mark; d.p[i] = d.p[i] ? 0 : 1; save(); draw();
    toast(d.p[i] ? t('May Allah accept it.') : t('Unticked.'));
  };
  draw();
  const wake = () => draw(); window.addEventListener('focus', wake);
  return () => { clearInterval(timer); root.onclick = null; window.removeEventListener('focus', wake); };
}

/* ---------- Qibla compass ---------- */
// Where the sun is now (approximate, enough to orient yourself).
function sunPos(lat, lng, ms) {
  const r = Math.PI / 180, d = (ms - 946728000000) / 86400000, g = (357.529 + 0.98560028 * d) * r, q = 280.459 + 0.98564736 * d;
  const Lm = (q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * r, e = (23.439 - 0.00000036 * d) * r;
  const ra = Math.atan2(Math.cos(e) * Math.sin(Lm), Math.cos(Lm)), dec = Math.asin(Math.sin(e) * Math.sin(Lm));
  const gmst = (18.697374558 + 24.06570982441908 * d) % 24, ha = ((gmst * 15 + lng) * r) - ra, la = lat * r;
  const alt = Math.asin(Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(ha));
  const az = (Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(la) - Math.tan(dec) * Math.cos(la)) / r + 180) % 360;
  return { az, alt: alt / r };
}
export function renderQibla(root) {
  const q = qiblaBearing(S.loc.lat, S.loc.lng);
  let heading = null, aligned = false, voice = false, lastSay = ['', 0];
  const say = txt => { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.lang = LB(); speechSynthesis.speak(u); } catch (e) { /* unsupported */ } };
  const hasSensor = typeof DeviceOrientationEvent !== 'undefined' && (('ontouchstart' in window) || navigator.maxTouchPoints > 0);
  root.innerHTML = `<header class="sub"><a href="#/today" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Qibla')}</b><span class="ib"></span></header>
    <section class="qibla">
      <p class="mono qdeg-top">${t('{d}° from north · {c}', { d: q.toLocaleString(L(), { maximumFractionDigits: 1 }), c: esc(S.loc.name) })}</p>
      ${(() => { const sp = sunPos(S.loc.lat, S.loc.lng, Date.now()); if (sp.alt < 5) return ''; const df = Math.round(((q - sp.az + 540) % 360) - 180); return `<p class="qsun">☀ ${Math.abs(df) < 5 ? t('The Qibla is roughly towards the sun right now.') : t(df > 0 ? 'Without a compass: face the sun, then turn {d}° to your right.' : 'Without a compass: face the sun, then turn {d}° to your left.', { d: Math.abs(df) })}</p>`; })()}
      <p class="qhint">${t('The orange dot shows the Qibla, with north at the top. For live guidance, turn on the compass, hold the phone flat and turn until the dot reaches the top mark.')}</p>
      <div class="dial" id="dial"><div class="ring" id="ring"><span class="n">N</span><span class="e">E</span><span class="s">S</span><span class="w">W</span>
        <div class="needle" style="transform:rotate(${q}deg)"><i></i></div></div><div class="hub"></div><div class="top"></div></div>
      <p class="qmsg" id="qmsg" aria-live="polite"></p><p class="qacc" id="qacc" hidden>${t('Low accuracy. Move the phone in a figure 8 a few times, away from metal.')}</p>
      ${hasSensor ? `<button class="btn" id="qgo">${t('Turn on compass')}</button><p class="muted small">${t('Your phone will ask to use its orientation sensor. It stays on the phone.')}</p>` : `<p class="muted">${t('This device has no compass. Face {d}° from north using any compass, or open safa. on your phone.', { d: q.toLocaleString(L(), { maximumFractionDigits: 0 }) })}</p>`}
      ${'speechSynthesis' in window ? `<button class="chip" id="qvoice" aria-pressed="false">${t('Voice guidance')}</button>` : ''}
      <p class="muted small center">${t('Makkah · {d} km from you', { d: Math.round(distanceKm([S.loc.lat, S.loc.lng], [21.4225, 39.8262])).toLocaleString(L()) })}</p>
      <p class="muted small center">${t('Keep away from magnets, phone cases with magnets and car dashboards: they can mislead the compass.')}</p>
      <p class="mono qdeg2" id="qhead" aria-live="off"></p>
    </section>`;
  const ring = $('#ring', root), msg = $('#qmsg', root);
  const on = e => {
    let h = null;
    if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
    else if (e.absolute && e.alpha != null) h = 360 - e.alpha;
    if (h == null) return;
    if (typeof e.webkitCompassAccuracy === 'number') $('#qacc', root).hidden = !(e.webkitCompassAccuracy < 0 || e.webkitCompassAccuracy > 25);
    else if (!e.absolute && typeof e.webkitCompassHeading !== 'number') $('#qacc', root).hidden = false;
    heading = h; ring.style.transform = `rotate(${-h}deg)`;
    $('#qhead', root).textContent = t('Phone heading: {h}° · Qibla: {q}°', { h: Math.round(h), q: Math.round(q) });
    const diff = Math.abs(((q - h + 540) % 360) - 180), ok = diff < 4;
    $('#dial', root).classList.toggle('ok', ok);
    msg.textContent = ok ? t('You are facing the Qibla.') : t(((q - h + 360) % 360) < 180 ? 'Turn right · {d}° to go' : 'Turn left · {d}° to go', { d: diff.toFixed(0) });
    if (ok && !aligned && navigator.vibrate) navigator.vibrate(25);
    aligned = ok;
    if (voice) { const st = ok ? 'ok' : ((q - h + 360) % 360) < 180 ? 'r' : 'l', now = Date.now(); if (st !== lastSay[0] && now - lastSay[1] > 2500) { lastSay = [st, now]; say(t(st === 'ok' ? 'You are facing the Qibla.' : st === 'r' ? 'Turn right' : 'Turn left')); } }
  };
  const start = async () => {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const r = await DeviceOrientationEvent.requestPermission(); if (r !== 'granted') throw new Error('denied');
      }
      window.addEventListener('deviceorientationabsolute', on, true); window.addEventListener('deviceorientation', on, true);
      $('#qgo', root).hidden = true;
      setTimeout(() => { if (heading == null) { msg.textContent = t('No compass sensor found on this device. Face {d}° from north using any compass.', { d: q.toFixed(0) }); } }, 2500);
    } catch (e) { msg.textContent = t('Compass access was not granted. Face {d}° from north using any compass.', { d: q.toFixed(0) }); }
  };
  if ($('#qgo', root)) $('#qgo', root).onclick = start;
  if ($('#qvoice', root)) $('#qvoice', root).onclick = e => { voice = !voice; e.currentTarget.setAttribute('aria-pressed', voice); lastSay = ['', 0]; if (voice) { say(t('Voice guidance on.')); if (heading == null && $('#qgo', root) && !$('#qgo', root).hidden) start(); } else speechSynthesis.cancel(); };
  return () => { try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } window.removeEventListener('deviceorientationabsolute', on, true); window.removeEventListener('deviceorientation', on, true); };
}

/* ---------- Flight & travel ---------- */
let F = null, FMODE = 'dest';
export function renderFlight(root) {
  if (FMODE === 'dest') {
    root.innerHTML = `<header class="sub"><a href="#/plus" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Travelling')}</b><span class="ib"></span></header>
      <div class="seg tseg" role="tablist"><button role="tab" aria-selected="true" data-fm="dest">${t('At my destination')}</button><button role="tab" aria-selected="false" data-fm="air">${t('On the way')}</button></div>
      <section class="card stack"><b>${t('Prayer times where you are going')}</b><p class="muted small">${t('Pick the city. Today shows its times, and your usual city comes back in one tap.')}</p><div id="dcity"></div></section>
      ${S.homeLoc ? `<p class="gentle">${t('About {k} km from {c}.', { k: Math.round(distanceKm([S.homeLoc.lat, S.homeLoc.lng], [S.loc.lat, S.loc.lng])).toLocaleString(L()), c: esc(S.homeLoc.name) })} ${t('Most schools allow shortening and combining prayers beyond a travel distance of roughly 80 km; the exact distance and duration differ. Ask someone of knowledge.')}</p>` : ''}
      ${S.homeLoc ? `<div class="card row travel-bar"><span>${t('Times for {c}, for now.', { c: esc(S.loc.name) })}</span><button class="btn line sm" id="dback">${t('Back to {c}', { c: esc(S.homeLoc.name) })}</button></div>` : ''}
      <section class="card stack"><b>${t('I am taking a plane')}</b><p class="muted small">${t('See which prayers fall during the flight, in both time zones.')}</p><button class="btn line sm" data-fm="air">${t('Prayers during a flight')}</button></section>
      <section class="note">${t('<b>Travelling.</b> Most scholars allow shortening and combining prayers when travelling. Conditions differ between schools: ask someone of knowledge.')}</section>`;
    cityField($('#dcity', root), { placeholder: t('Type a city'), onPick: c => { if (!S.homeLoc) S.homeLoc = S.loc; S.loc = { name: c[0], country: c[1], iso2: c[2], lat: c[3], lng: c[4], tz: c[5] }; save(); location.hash = '#/today'; } });
    root.onclick = e => { const b = e.target.closest('[data-fm]'); if (b) { FMODE = b.dataset.fm; renderFlight(root); return; } if (e.target.id === 'dback') { S.loc = S.homeLoc; S.homeLoc = null; save(); renderFlight(root); } };
    return () => { root.onclick = null; };
  }
  if (!F) { const d = new Date(Date.now() + 86400000); F = { from: [S.loc.name, S.loc.country, S.loc.iso2, S.loc.lat, S.loc.lng, S.loc.tz], to: null, dep: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T10:00`, dur: null }; }
  root.innerHTML = `<header class="sub"><a href="#/plus" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Travelling')}</b><span class="ib"></span></header>
    <div class="seg tseg" role="tablist"><button role="tab" aria-selected="false" data-fm="dest">${t('At my destination')}</button><button role="tab" aria-selected="true" data-fm="air">${t('On the way')}</button></div>
    <section class="form">
      <label class="lbl">${t('From (your city by default)')}</label><div id="ff"></div>
      <label class="lbl">${t('To')}</label><div id="ft"></div>
      <label class="lbl" for="fdep">${t('Take-off · local time at departure')}</label><input id="fdep" class="inp" type="datetime-local" value="${F.dep}">
      <p class="lbl">${t('Flight duration')}</p><div class="grid2"><div><label class="lbl" for="fh">${t('Hours')}</label><input id="fh" class="inp" type="number" min="0" max="20" inputmode="numeric"></div><div><label class="lbl" for="fm">${t('Minutes')}</label><input id="fm" class="inp" type="number" min="0" max="59" inputmode="numeric"></div></div>
    </section>
    <section id="fout"></section>
    <section class="note">${t('<b>Travelling.</b> Most scholars allow shortening and combining prayers when travelling. Conditions differ between schools: ask someone of knowledge.')}</section>
    <p class="muted small pad">${t('Estimate only. Straight great-circle route, constant speed, sea-level horizon: at cruising altitude sunset comes a few minutes later. Uses your method ({m}).', { m: esc(METHODS[S.method].n) })}</p>`;
  const out = $('#fout', root);
  const setDur = () => { if (F.from && F.to && F.dur == null) { const km = distanceKm([F.from[3], F.from[4]], [F.to[3], F.to[4]]); F.dur = Math.round((km / 850 * 60 + 35) / 5) * 5; } $('#fh', root).value = F.dur != null ? Math.floor(F.dur / 60) : ''; $('#fm', root).value = F.dur != null ? F.dur % 60 : ''; };
  const run = () => {
    if (!F.from || !F.to) { out.innerHTML = `<p class="muted pad">${t('Pick your arrival city to see the prayers during the flight.')}</p>`; return; }
    if (!F.dur || !F.dep) { out.innerHTML = `<p class="muted pad">${t('Add a take-off time and a duration.')}</p>`; return; }
    const u = localToUtc(F.dep, F.from[5]), end = u + F.dur * 60000;
    const ev = flightPrayers([F.from[3], F.from[4]], [F.to[3], F.to[4]], u, F.dur, methodAngles());
    const ft = (ms, tz) => new Intl.DateTimeFormat(L(), { timeZone: tz, weekday: 'short' }).format(new Date(ms)) + ' ' + fmtTime(ms, tz);
    const note = { fajr: 'Fajr begins.', sunrise: 'Sunrise. Fajr time ends.', dhuhr: 'Dhuhr begins.', asr: 'Asr begins.', maghrib: 'Sunset. Maghrib begins.', isha: 'Isha begins.' };
    out.innerHTML = `<p class="mono pad">${esc(F.from[0])} ${ft(u, F.from[5])} → ${esc(F.to[0])} ${ft(end, F.to[5])}</p>
      <ol class="rail">${ev.map(([k, tt, p]) => `<li class="${k === 'sunrise' ? '' : 'p'}"><div class="rh"><b>${NAMES[k]}</b><span class="ar" lang="ar">${AR[k]}</span></div>
        <div class="rt mono"><span><b>${ft(tt, F.from[5])}</b> ${esc(F.from[0])}</span><span><b>${ft(tt, F.to[5])}</b> ${esc(F.to[0])}</span></div>
        <div class="muted small">${t(note[k])} ${t('{h} h {m} after take-off.', { h: Math.floor((tt - u) / 3600000), m: pad(Math.round((tt - u) % 3600000 / 60000)) })}</div></li>`).join('') || `<li><div class="rh"><b>${t('None in flight')}</b></div><div class="muted small">${t('No prayer time begins during this flight. Check the prayer due at take-off and the next one on landing.')}</div></li>`}</ol>`;
  };
  const fi = cityField($('#ff', root), { placeholder: t('Departure city'), value: F.from ? F.from[0] : '', onPick: c => { F.from = c; F.dur = null; setDur(); run(); } });
  cityField($('#ft', root), { placeholder: t('Arrival city'), value: F.to ? F.to[0] : '', onPick: c => { F.to = c; F.dur = null; setDur(); run(); } });
  fi.addEventListener('input', () => { if (!fi.value) F.from = null; });
  $('#fdep', root).oninput = e => { F.dep = e.target.value; run(); };
  const dur = () => { F.dur = (+$('#fh', root).value || 0) * 60 + (+$('#fm', root).value || 0); run(); };
  $('#fh', root).oninput = dur; $('#fm', root).oninput = dur;
  setDur(); run(); data('cities.json').catch(() => {});
  root.onclick = e => { const b = e.target.closest('[data-fm]'); if (b) { FMODE = b.dataset.fm; renderFlight(root); } };
  return () => { root.onclick = null; };
}
