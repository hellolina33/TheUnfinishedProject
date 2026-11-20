import { S, save, dayKey, addDays, getDay, P5, data } from '../store.js';
import { timesFor, ORDER, NAMES, AR, fmtTime, hijri, gregorian, weekday, qiblaBearing, methodAngles, flightPrayers, localToUtc, distanceKm, METHODS } from '../prayer.js';
import { $, esc, icon, pad, cityField, toast } from '../ui.js';
import { t, L } from '../i18n.js';
import { upcoming } from './calendar.js';
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


function khatmDaysLeft() { try { const st = new Date(S.khatm.start + 'T12:00:00Z'), end = st.getTime() + S.khatm.days * 86400000; return Math.max(1, Math.ceil((end - Date.now()) / 86400000)); } catch (e) { return 1; } }
function tools() {
  return `<nav class="tools" aria-label="${t('Tools')}">
    <a href="#/learn">${icon.learn}<span>${t('First steps')}</span></a>
    <a href="#/qibla">${icon.compass}<span>${t('Qibla')}</span></a>
    <a href="#/calendar">${icon.cal}<span>${t('Calendar')}</span></a>
    <a href="#/flight">${icon.plane}<span>${t('Travel')}</span></a></nav>`;
}
function welcome() {
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
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return `<section class="card welcome"><button class="ib x" data-hide="install" aria-label="${t('Hide')}">${icon.stop}</button>
    <b>${t('Keep safa. on your home screen')}</b>
    <p class="muted small">${ios ? t('In Safari, tap Share, then “Add to Home Screen”. It opens like an app, offline, with no store.') : t('Open your browser menu, then “Install app” or “Add to Home screen”. It opens like an app, offline, with no store.')}</p>
    ${window.__bip ? `<button class="btn sm" data-install="1">${t('Install')}</button>` : ''}</section>`;
}
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); window.__bip = e; });

export function render(root) {
  let timer;
  const draw = () => {
    const np = nextPrayer(), now = Date.now(), day = getDay(np.key, true), T = np.today;
    const sr = T.sunrise, ss = T.maghrib; let f = sr && ss ? (now - sr) / (ss - sr) : .5; const up = f >= 0 && f <= 1; f = Math.min(1, Math.max(0, f));
    const ang = Math.PI * (1 - f), sx = 150 + 120 * Math.cos(ang), sy = 132 - 120 * Math.sin(ang);
    const isFri = weekday(now) === 'Friday', h = +new Intl.DateTimeFormat('en-GB', { timeZone: S.loc.tz, hour: '2-digit', hourCycle: 'h23' }).format(new Date(now));
    const last = S.q.last;
    const suggest = isFri && S.fri.on && !day.k ? `<a class="card row" href="#/quran/18"><span><span class="mono">${t('Friday')}</span><b>${t('Read Al-Kahf')}</b></span>${icon.chev}</a>`
      : `<a class="card row" href="#/duas/27"><span><span class="mono">${t(h < 15 ? 'Morning adhkar' : 'Evening adhkar')}</span><b>${t('Words of remembrance')}</b></span>${icon.chev}</a>`;
    root.innerHTML = `
      <header class="vh"><div><h1>${t('Today')}</h1><a class="loc mono" href="#/settings">${esc(S.loc.name)} · ${esc(METHODS[S.method].n)}</a></div>
        <div class="dates mono"><span>${esc(gregorian(now))}</span><span>${esc(hijri(now))}</span></div></header>
      ${welcome()}
      ${day.pz ? `<a class="banner" href="#/track"><span class="dot"></span> ${t('Pause mode is on. Nothing to log today.')}</a>` : ''}
      <section class="next">
        <svg class="arc" viewBox="0 0 300 150" aria-hidden="true"><path d="M30 132A120 120 0 01270 132" class="arc-l"/><path d="M12 132H288" class="arc-h"/><circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="7" class="arc-s ${up ? '' : 'night'}"/></svg>
        <span class="nextp">${t('{p} at {t}', { p: NAMES[np.k], t: fmtTime(np.t) })}</span>
        <div class="count words" id="cd" aria-live="off"></div>
        ${!day.pz && np.cur ? `<button class="btn sm line" data-mark="${P5.indexOf(np.cur)}">${day.p[P5.indexOf(np.cur)] ? icon.check + t('{p} prayed', { p: NAMES[np.cur] }) : t('{p} prayed?', { p: NAMES[np.cur] })}</button>` : ''}
      </section>
      <ul class="times">${ORDER.map(k => {
        const i = P5.indexOf(k), off = k !== 'sunrise' && S.offsets[k];
        return `<li class="${k === np.cur ? 'now' : T[k] && T[k] < now ? 'past' : ''} ${i >= 0 ? 'pr' : 'mark'}" ${i >= 0 && !day.pz ? `data-mark="${i}"` : ''}>
          <span class="nm">${NAMES[k]}<span class="ar" lang="ar">${AR[k]}</span>${off ? `<span class="adj mono" title="${t('Adjusted manually')}">${off > 0 ? '+' : ''}${off} min</span>` : ''}</span>
          <span class="tm mono">${fmtTime(T[k])}</span>
          ${i >= 0 ? `<button class="chk ${day.p[i] ? 'on' : ''}" data-mark="${i}" ${day.pz ? 'disabled' : ''} aria-pressed="${!!day.p[i]}" aria-label="${t('{p} prayed?', { p: NAMES[k] })}">${day.p[i] ? icon.check : ''}</button>` : `<span class="sunr mono">${t('sunrise')}</span>`}</li>`;
      }).join('')}</ul>
      ${tools()}
      <a class="card row" href="#/quran/${last ? last.s + '/' + last.v : '1'}"><span><span class="mono">${t(last ? 'Resume reading' : 'Start reading')}</span><b>${last ? esc(last.n) + ' · ' + last.s + ':' + last.v : 'Al-Fatihah · 1:1'}</b></span>${icon.chev}</a>
      ${suggest}
      ${extras()}
      ${installCard()}`;
    const tick = () => {
      const s = Math.round((np.t - Date.now()) / 1000);
      if (s <= 0) { draw(); return; }
      const el = $('#cd', root); if (!el) return;
      const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
      const txt = s >= 3600 ? t('in {h} h {m}', { h, m: pad(m) }) : s >= 60 ? t('in {m} min', { m: m + (s % 60 ? 1 : 0) }) : t('in {s} s', { s });
      if (el.textContent !== txt) el.textContent = txt;
    };
    clearInterval(timer); tick(); timer = setInterval(tick, 1000);
  };
  root.onclick = async e => {
    const hb = e.target.closest('[data-hide]'); if (hb) { if (hb.dataset.hide === 'welcome') S.hideWelcome = true; else S.hideInstall = true; save(); draw(); return; }
    if (e.target.closest('[data-install]') && window.__bip) { try { window.__bip.prompt(); await window.__bip.userChoice; } catch (err) { /* ignore */ } window.__bip = null; draw(); return; }
    const b = e.target.closest('[data-mark]'); if (!b) return;
    const d = getDay(dayKey(), true), i = +b.dataset.mark; d.p[i] = d.p[i] ? 0 : 1; save(); draw();
    toast(d.p[i] ? t('May Allah accept it.') : t('Unticked.'));
  };
  draw();
  return () => { clearInterval(timer); root.onclick = null; };
}

/* ---------- Qibla compass ---------- */
export function renderQibla(root) {
  const q = qiblaBearing(S.loc.lat, S.loc.lng);
  let heading = null, aligned = false;
  root.innerHTML = `<header class="sub"><a href="#/today" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Qibla')}</b><span class="ib"></span></header>
    <section class="qibla">
      <div class="qdeg mono" id="qdeg">${q.toFixed(1)}°</div>
      <span class="mono">${t('from north · {c}', { c: esc(S.loc.name) })}</span>
      <div class="dial" id="dial"><div class="ring" id="ring"><span class="n">N</span><span class="e">E</span><span class="s">S</span><span class="w">W</span>
        <div class="needle" style="transform:rotate(${q}deg)"><i></i></div></div><div class="hub"></div><div class="top"></div></div>
      <p class="muted" id="qmsg">${t('Turn on the compass, hold the phone flat and rotate until the orange dot reaches the top mark.')}</p>
      <button class="btn" id="qgo">${t('Turn on compass')}</button>
    </section>`;
  const ring = $('#ring', root), msg = $('#qmsg', root);
  const on = e => {
    let h = null;
    if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
    else if (e.absolute && e.alpha != null) h = 360 - e.alpha;
    if (h == null) return;
    heading = h; ring.style.transform = `rotate(${-h}deg)`;
    const diff = Math.abs(((q - h + 540) % 360) - 180), ok = diff < 4;
    $('#dial', root).classList.toggle('ok', ok);
    msg.textContent = ok ? t('You are facing the Qibla.') : t(((q - h + 360) % 360) < 180 ? 'Turn right · {d}° to go' : 'Turn left · {d}° to go', { d: diff.toFixed(0) });
    if (ok && !aligned && navigator.vibrate) navigator.vibrate(25);
    aligned = ok;
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
  $('#qgo', root).onclick = start;
  return () => { window.removeEventListener('deviceorientationabsolute', on, true); window.removeEventListener('deviceorientation', on, true); };
}

/* ---------- Flight & travel ---------- */
let F = null;
export function renderFlight(root) {
  if (!F) { const d = new Date(Date.now() + 86400000); F = { from: [S.loc.name, S.loc.country, S.loc.iso2, S.loc.lat, S.loc.lng, S.loc.tz], to: null, dep: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T10:00`, dur: null }; }
  root.innerHTML = `<header class="sub"><a href="#/today" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Flight &amp; travel')}</b><span class="ib"></span></header>
    <section class="form">
      <label class="lbl">${t('From')}</label><div id="ff"></div>
      <label class="lbl">${t('To')}</label><div id="ft"></div>
      <label class="lbl" for="fdep">${t('Take-off · local time at departure')}</label><input id="fdep" class="inp" type="datetime-local" value="${F.dep}">
      <div class="grid2"><div><label class="lbl" for="fh">${t('Hours')}</label><input id="fh" class="inp" type="number" min="0" max="20" inputmode="numeric"></div><div><label class="lbl" for="fm">${t('Minutes')}</label><input id="fm" class="inp" type="number" min="0" max="59" inputmode="numeric"></div></div>
    </section>
    <section id="fout"></section>
    <section class="note">${t("<b>Travelling.</b> Most scholars allow shortening four-unit prayers to two (Qasr) and combining Dhuhr with Asr, and Maghrib with Isha (Jam\'). Conditions differ between schools. Ask someone of knowledge.")}</section>
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
}
