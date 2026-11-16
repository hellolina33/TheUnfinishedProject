import { S, save, dayKey, addDays, getDay, P5, data } from '../store.js';
import { timesFor, ORDER, NAMES, AR, fmtTime, hijri, gregorian, weekday, qiblaBearing, methodAngles, flightPrayers, localToUtc, distanceKm, METHODS } from '../prayer.js';
import { $, esc, icon, pad, cityField, toast } from '../ui.js';

function nextPrayer() {
  const now = Date.now(), key = dayKey(now), today = timesFor(key);
  let cur = null; for (const k of P5) if (today[k] && today[k] <= now) cur = k;
  for (const k of P5) if (today[k] && today[k] > now) return { k, t: today[k], today, cur, key };
  const tm = timesFor(addDays(key, 1));
  return { k: 'fajr', t: tm.fajr, today, cur: 'isha', key };
}

export function render(root) {
  let timer;
  const draw = () => {
    const np = nextPrayer(), now = Date.now(), day = getDay(np.key, true), T = np.today;
    const sr = T.sunrise, ss = T.maghrib; let f = sr && ss ? (now - sr) / (ss - sr) : .5; const up = f >= 0 && f <= 1; f = Math.min(1, Math.max(0, f));
    const ang = Math.PI * (1 - f), sx = 150 + 120 * Math.cos(ang), sy = 132 - 120 * Math.sin(ang);
    const isFri = weekday(now) === 'Friday', h = +new Intl.DateTimeFormat('en-GB', { timeZone: S.loc.tz, hour: '2-digit', hourCycle: 'h23' }).format(new Date(now));
    const last = S.q.last;
    const suggest = isFri && !day.r ? `<a class="card row" href="#/quran/18"><span><span class="mono">Friday</span><b>Read Al-Kahf</b></span>${icon.chev}</a>`
      : `<a class="card row" href="#/duas/27"><span><span class="mono">${h < 15 ? 'Morning' : 'Evening'} adhkar</span><b>Words of remembrance</b></span>${icon.chev}</a>`;
    root.innerHTML = `
      <header class="vh"><div><h1>Today</h1><a class="loc mono" href="#/settings">${esc(S.loc.name)} · ${esc(METHODS[S.method].n)}</a></div>
        <div class="dates mono"><span>${esc(gregorian(now))}</span><span>${esc(hijri(now))}</span></div></header>
      ${day.pz ? `<a class="banner" href="#/track"><span class="dot"></span> Pause mode is on. Nothing to log today.</a>` : ''}
      <section class="next">
        <svg class="arc" viewBox="0 0 300 150" aria-hidden="true"><path d="M30 132A120 120 0 01270 132" class="arc-l"/><path d="M12 132H288" class="arc-h"/><circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="7" class="arc-s ${up ? '' : 'night'}"/></svg>
        <span class="mono">Next · ${NAMES[np.k]} · ${fmtTime(np.t)}</span>
        <div class="count" id="cd" aria-live="off">00:00:00</div>
        ${!day.pz && np.cur ? `<button class="btn sm ${day.p[P5.indexOf(np.cur)] ? 'line' : ''}" data-mark="${P5.indexOf(np.cur)}">${day.p[P5.indexOf(np.cur)] ? icon.check + NAMES[np.cur] + ' prayed' : 'Mark ' + NAMES[np.cur] + ' as prayed'}</button>` : ''}
      </section>
      <ul class="times">${ORDER.map(k => {
        const i = P5.indexOf(k), off = k !== 'sunrise' && S.offsets[k];
        return `<li class="${k === np.cur ? 'now' : T[k] && T[k] < now ? 'past' : ''}">
          <span class="nm">${NAMES[k]}<span class="ar" lang="ar">${AR[k]}</span>${off ? `<span class="adj mono" title="Adjusted manually">${off > 0 ? '+' : ''}${off} min</span>` : ''}</span>
          <span class="tm mono">${fmtTime(T[k])}</span>
          ${i >= 0 ? `<button class="chk ${day.p[i] ? 'on' : ''}" data-mark="${i}" ${day.pz ? 'disabled' : ''} aria-pressed="${!!day.p[i]}" aria-label="${NAMES[k]} prayed">${day.p[i] ? icon.check : ''}</button>` : '<span class="chk ghost"></span>'}</li>`;
      }).join('')}</ul>
      <a class="card row" href="#/quran/${last ? last.s + '/' + last.v : '1'}"><span><span class="mono">${last ? 'Resume reading' : 'Start reading'}</span><b>${last ? esc(last.n) + ' · ' + last.s + ':' + last.v : 'Al-Fatihah · 1:1'}</b></span>${icon.chev}</a>
      ${suggest}
      <div class="grid2">
        <a class="card tile" href="#/qibla">${icon.compass}<span><span class="mono">Qibla</span><b>${qiblaBearing(S.loc.lat, S.loc.lng).toFixed(1)}°</b></span></a>
        <a class="card tile" href="#/flight">${icon.plane}<span><span class="mono">Travel</span><b>Flight mode</b></span></a>
      </div>`;
    const tick = () => {
      const s = Math.round((np.t - Date.now()) / 1000);
      if (s <= 0) { draw(); return; }
      const el = $('#cd', root); if (el) el.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s % 3600 / 60))}:${pad(s % 60)}`;
    };
    clearInterval(timer); tick(); timer = setInterval(tick, 1000);
  };
  root.onclick = e => {
    const b = e.target.closest('[data-mark]'); if (!b) return;
    const d = getDay(dayKey(), true), i = +b.dataset.mark; d.p[i] = d.p[i] ? 0 : 1; save(); draw();
  };
  draw();
  return () => { clearInterval(timer); root.onclick = null; };
}

/* ---------- Qibla compass ---------- */
export function renderQibla(root) {
  const q = qiblaBearing(S.loc.lat, S.loc.lng);
  let heading = null, aligned = false;
  root.innerHTML = `<header class="sub"><a href="#/today" class="ib" aria-label="Back">${icon.back}</a><b>Qibla</b><span class="ib"></span></header>
    <section class="qibla">
      <div class="qdeg mono" id="qdeg">${q.toFixed(1)}°</div>
      <span class="mono">from north · ${esc(S.loc.name)}</span>
      <div class="dial" id="dial"><div class="ring" id="ring"><span class="n">N</span><span class="e">E</span><span class="s">S</span><span class="w">W</span>
        <div class="needle" style="transform:rotate(${q}deg)"><i></i></div></div><div class="hub"></div><div class="top"></div></div>
      <p class="muted" id="qmsg">Turn on the compass, hold the phone flat and rotate until the orange dot reaches the top mark.</p>
      <button class="btn" id="qgo">Turn on compass</button>
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
    msg.textContent = ok ? 'You are facing the Qibla.' : `Turn ${((q - h + 360) % 360) < 180 ? 'right' : 'left'} · ${diff.toFixed(0)}° to go`;
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
      setTimeout(() => { if (heading == null) { msg.textContent = `No compass sensor found on this device. Face ${q.toFixed(0)}° from north using any compass.`; } }, 2500);
    } catch (e) { msg.textContent = `Compass access was not granted. Face ${q.toFixed(0)}° from north using any compass.`; }
  };
  $('#qgo', root).onclick = start;
  return () => { window.removeEventListener('deviceorientationabsolute', on, true); window.removeEventListener('deviceorientation', on, true); };
}

/* ---------- Flight & travel ---------- */
let F = null;
export function renderFlight(root) {
  if (!F) { const d = new Date(Date.now() + 86400000); F = { from: [S.loc.name, S.loc.country, S.loc.iso2, S.loc.lat, S.loc.lng, S.loc.tz], to: null, dep: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T10:00`, dur: null }; }
  root.innerHTML = `<header class="sub"><a href="#/today" class="ib" aria-label="Back">${icon.back}</a><b>Flight &amp; travel</b><span class="ib"></span></header>
    <section class="form">
      <label class="lbl">From</label><div id="ff"></div>
      <label class="lbl">To</label><div id="ft"></div>
      <label class="lbl" for="fdep">Take-off · local time at departure</label><input id="fdep" class="inp" type="datetime-local" value="${F.dep}">
      <div class="grid2"><div><label class="lbl" for="fh">Hours</label><input id="fh" class="inp" type="number" min="0" max="20" inputmode="numeric"></div><div><label class="lbl" for="fm">Minutes</label><input id="fm" class="inp" type="number" min="0" max="59" inputmode="numeric"></div></div>
    </section>
    <section id="fout"></section>
    <section class="note"><b>Travelling.</b> Most scholars allow shortening four-unit prayers to two (Qasr) and combining Dhuhr with Asr, and Maghrib with Isha (Jam'). Conditions differ between schools. Ask someone of knowledge.</section>
    <p class="muted small pad">Estimate only. Straight great-circle route, constant speed, sea-level horizon: at cruising altitude sunset comes a few minutes later. Uses your method (${esc(METHODS[S.method].n)}).</p>`;
  const out = $('#fout', root);
  const setDur = () => { if (F.from && F.to && F.dur == null) { const km = distanceKm([F.from[3], F.from[4]], [F.to[3], F.to[4]]); F.dur = Math.round((km / 850 * 60 + 35) / 5) * 5; } $('#fh', root).value = F.dur != null ? Math.floor(F.dur / 60) : ''; $('#fm', root).value = F.dur != null ? F.dur % 60 : ''; };
  const run = () => {
    if (!F.from || !F.to) { out.innerHTML = '<p class="muted pad">Pick your arrival city to see the prayers during the flight.</p>'; return; }
    if (!F.dur || !F.dep) { out.innerHTML = '<p class="muted pad">Add a take-off time and a duration.</p>'; return; }
    const u = localToUtc(F.dep, F.from[5]), end = u + F.dur * 60000;
    const ev = flightPrayers([F.from[3], F.from[4]], [F.to[3], F.to[4]], u, F.dur, methodAngles());
    const ft = (ms, tz) => new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short' }).format(new Date(ms)) + ' ' + fmtTime(ms, tz);
    const note = { fajr: 'Fajr begins.', sunrise: 'Sunrise. Fajr time ends.', dhuhr: 'Dhuhr begins.', asr: 'Asr begins.', maghrib: 'Sunset. Maghrib begins.', isha: 'Isha begins.' };
    out.innerHTML = `<p class="mono pad">${esc(F.from[0])} ${ft(u, F.from[5])} → ${esc(F.to[0])} ${ft(end, F.to[5])}</p>
      <ol class="rail">${ev.map(([k, t, p]) => `<li class="${k === 'sunrise' ? '' : 'p'}"><div class="rh"><b>${NAMES[k]}</b><span class="ar" lang="ar">${AR[k]}</span></div>
        <div class="rt mono"><span><b>${ft(t, F.from[5])}</b> ${esc(F.from[0])}</span><span><b>${ft(t, F.to[5])}</b> ${esc(F.to[0])}</span></div>
        <div class="muted small">${note[k]} ${Math.floor((t - u) / 3600000)} h ${pad(Math.round((t - u) % 3600000 / 60000))} after take-off.</div></li>`).join('') || '<li><div class="rh"><b>None in flight</b></div><div class="muted small">No prayer time begins during this flight. Check the prayer due at take-off and the next one on landing.</div></li>'}</ol>`;
  };
  const fi = cityField($('#ff', root), { placeholder: 'Departure city', value: F.from ? F.from[0] : '', onPick: c => { F.from = c; F.dur = null; setDur(); run(); } });
  cityField($('#ft', root), { placeholder: 'Arrival city', value: F.to ? F.to[0] : '', onPick: c => { F.to = c; F.dur = null; setDur(); run(); } });
  fi.addEventListener('input', () => { if (!fi.value) F.from = null; });
  $('#fdep', root).oninput = e => { F.dep = e.target.value; run(); };
  const dur = () => { F.dur = (+$('#fh', root).value || 0) * 60 + (+$('#fm', root).value || 0); run(); };
  $('#fh', root).oninput = dur; $('#fm', root).oninput = dur;
  setDur(); run(); data('cities.json').catch(() => {});
}
