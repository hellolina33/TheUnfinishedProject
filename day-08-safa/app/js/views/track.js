import { S, save, replaceState, resetState, dayKey, addDays, getDay, P5, data } from '../store.js';
import { METHODS, NAMES, timesFor, fmtTime } from '../prayer.js';
import { $, $$, esc, icon, pad, toast, download, cityField, LOGO } from '../ui.js';
import { setLocation, locateOnce } from './onboarding.js';
import { RECITERS } from './quran.js';

let weekOff = 0;
export function renderTrack(root) {
  const draw = () => {
    const today = dayKey(), end = addDays(today, weekOff * 7), keys = Array.from({ length: 7 }, (_, i) => addDays(end, i - 6));
    const days = keys.map(k => getDay(k, false));
    const lbl = k => k === today ? 'Today' : new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' }).format(new Date(k + 'T12:00:00Z'));
    const active = days.filter(d => !d.pz), shown = active.filter(d => d.p.some(Boolean)).length, read = days.filter(d => d.r).length;
    const range = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    const cell = (k, d, j) => `<td><button class="pd ${d.pz ? 'pz' : d.p[j] ? 'on' : ''}" data-k="${k}" data-j="${j}" ${d.pz || k > today ? 'disabled' : ''} aria-pressed="${!!d.p[j]}" aria-label="${NAMES[P5[j]]}, ${lbl(k)}${d.pz ? ', paused' : ''}"></button></td>`;
    const cell2 = (k, d, f, name) => `<td><button class="pd sq ${d[f] ? 'on' : ''}" data-k="${k}" data-f="${f}" ${k > today ? 'disabled' : ''} aria-pressed="${!!d[f]}" aria-label="${name}, ${lbl(k)}"></button></td>`;
    root.innerHTML = `<header class="vh"><div><h1>Track</h1></div><a class="ib" href="#/settings" aria-label="Settings">${icon.gear}</a></header>
      <div class="pause ${S.pauseOn ? 'on' : ''}"><div><b>Pause mode</b><small>Periods, illness, hard days. Tracking freezes. Nothing is counted against you.</small></div><button class="sw" role="switch" id="pz" aria-checked="${S.pauseOn}" aria-label="Pause mode"></button></div>
      <div class="wkh"><button class="ib" id="wprev" aria-label="Previous week">${icon.back}</button><span class="mono">${range.format(new Date(keys[0] + 'T12:00:00Z'))} – ${range.format(new Date(keys[6] + 'T12:00:00Z'))}</span><button class="ib flip" id="wnext" ${weekOff >= 0 ? 'disabled' : ''} aria-label="Next week">${icon.back}</button></div>
      <table class="wk"><thead><tr><th class="l"></th>${keys.map(k => `<th class="${k === today ? 'td' : ''}">${lbl(k).slice(0, 3)}</th>`).join('')}</tr></thead>
        <tbody>${P5.map((p, j) => `<tr><th class="l">${NAMES[p]}</th>${keys.map((k, i) => cell(k, days[i], j)).join('')}</tr>`).join('')}
        <tr class="sep"><th class="l">Quran</th>${keys.map((k, i) => cell2(k, days[i], 'r', 'Quran reading')).join('')}</tr>
        <tr><th class="l">Adhkar</th>${keys.map((k, i) => cell2(k, days[i], 'a', 'Adhkar')).join('')}</tr></tbody></table>
      <p class="sumline">${active.length ? `You showed up on <b>${shown} of ${active.length}</b> days${read ? ` and opened the Quran on <b>${read}</b>` : ''}.` : 'This week is paused.'} ${days.some(d => d.pz) ? 'Paused days are left out.' : ''}</p>
      <section class="card stack">
        <label class="tog"><span>Evening check-in<small>One gentle reminder a day. Nothing else.</small></span><input type="checkbox" id="ron" ${S.rem.on ? 'checked' : ''}></label>
        <div class="row2"><label class="lbl" for="rt">Time</label><input type="time" id="rt" class="inp" value="${S.rem.t}"></div>
        <button class="btn line sm" id="rics">Add it to my calendar</button>
        <p class="muted small">A web app cannot ring while it is closed. The calendar file gives you a reliable daily reminder; the in-app notice only shows while safa. is open.</p>
      </section>
      <a class="srow" href="#/settings"><span class="st"><b>Settings</b><span class="muted small">Method, offsets, audio, backup</span></span>${icon.chev}</a>
      <a class="srow" href="#/about"><span class="st"><b>About &amp; support</b><span class="muted small">Sources, promise, Sadaqah Jariyah</span></span>${icon.chev}</a>`;
  };
  root.onclick = async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'pz') { S.pauseOn = !S.pauseOn; const d = getDay(dayKey(), true); d.pz = S.pauseOn ? 1 : 0; save(); draw(); return; }
    if (b.id === 'wprev') { weekOff--; draw(); return; }
    if (b.id === 'wnext') { weekOff = Math.min(0, weekOff + 1); draw(); return; }
    if (b.id === 'rics') {
      const [h, m] = S.rem.t.split(':'), k = dayKey().replace(/-/g, '');
      download('safa-evening-check-in.ics', ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//safa.//EN', 'BEGIN:VEVENT', `UID:safa-evening-${Date.now()}@safa`, `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d+/g, '')}`, `DTSTART;TZID=${S.loc.tz}:${k}T${h}${m}00`, 'DURATION:PT5M', 'RRULE:FREQ=DAILY', 'SUMMARY:safa. · evening check-in', 'DESCRIPTION:Evening adhkar. A few verses. Tick today.', 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:safa. · evening check-in', 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'), 'text/calendar');
      return;
    }
    if (b.dataset.k) { const d = getDay(b.dataset.k, true); if (b.dataset.f) d[b.dataset.f] = d[b.dataset.f] ? 0 : 1; else d.p[+b.dataset.j] = d.p[+b.dataset.j] ? 0 : 1; save(); draw(); }
  };
  root.onchange = async e => {
    if (e.target.id === 'rt') { S.rem.t = e.target.value || '21:00'; save(); }
    if (e.target.id === 'ron') {
      S.rem.on = e.target.checked;
      if (S.rem.on && 'Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch (err) { /* ignore */ } }
      if (S.rem.on && (!('Notification' in window) || Notification.permission !== 'granted')) toast('Notifications are off for this browser. Use the calendar reminder.');
      save();
    }
  };
  draw();
  return () => { root.onclick = null; root.onchange = null; };
}

export function renderSettings(root) {
  const draw = async () => {
    let est = ''; try { const e = await navigator.storage.estimate(); est = `${(e.usage / 1048576).toFixed(1)} MB used on this device`; } catch (e) { /* not supported */ }
    const dl = Object.keys(S.q.dl || {});
    root.innerHTML = `<header class="sub"><a href="#/track" class="ib" aria-label="Back">${icon.back}</a><b>Settings</b><span class="ib"></span></header>
      <section class="form">
        <h3>Place</h3>
        <p class="muted small">Now: <b>${esc(S.loc.name)}</b>, ${esc(S.loc.country)}. Stored on this device only.</p>
        <div id="scity"></div><button class="btn line sm" id="sgeo">Use my location once</button>
        <h3>Prayer times</h3>
        <label class="lbl" for="smeth">Calculation method</label>
        <select id="smeth" class="inp">${Object.entries(METHODS).map(([k, m]) => `<option value="${k}" ${S.method === k ? 'selected' : ''}>${esc(m.n)} · ${esc(m.d)}</option>`).join('')}</select>
        <label class="lbl" for="smad">Asr</label>
        <select id="smad" class="inp"><option value="shafi" ${S.madhab === 'shafi' ? 'selected' : ''}>Standard · Shafi'i, Maliki, Hanbali</option><option value="hanafi" ${S.madhab === 'hanafi' ? 'selected' : ''}>Hanafi</option></select>
        <label class="lbl">Match your mosque · minutes</label>
        <div class="offs">${P5.map(p => `<div class="off"><span>${NAMES[p]}</span><button data-off="${p}" data-d="-1" aria-label="${NAMES[p]} minus one minute">−</button><b class="mono">${S.offsets[p] > 0 ? '+' : ''}${S.offsets[p]}</b><button data-off="${p}" data-d="1" aria-label="${NAMES[p]} plus one minute">+</button><span class="mono muted">${fmtTime(timesFor(dayKey())[p])}</span></div>`).join('')}</div>
        <label class="lbl" for="shij">Hijri date adjustment</label>
        <select id="shij" class="inp">${[-2, -1, 0, 1, 2].map(n => `<option value="${n}" ${S.hijriAdj === n ? 'selected' : ''}>${n > 0 ? '+' : ''}${n} day${Math.abs(n) === 1 ? '' : 's'}</option>`).join('')}</select>
        <label class="tog"><span>24-hour clock</span><input type="checkbox" id="s24" ${S.h24 ? 'checked' : ''}></label>
        <button class="btn line sm" id="sics">Add 30 days of prayer times to my calendar</button>
        <h3>Offline</h3>
        <p class="muted small">${esc(est)}</p>
        <button class="btn line sm" id="sall">Save the whole Quran text for offline</button>
        <p class="muted small">Saved audio: ${dl.length ? dl.map(k => { const [r, s] = k.split('|'); return `surah ${s} · ${esc(RECITERS[r] || r)}`; }).join(', ') : 'none'}</p>
        ${dl.length ? '<button class="btn line sm" id="sclr">Delete saved audio</button>' : ''}
        <h3>Backup</h3>
        <p class="muted small">No account, so no cloud. Keep a file and restore it on any device.</p>
        <div class="grid2"><button class="btn line sm" id="sexp">Export backup</button><label class="btn line sm">Import backup<input type="file" id="simp" accept="application/json,.json" hidden></label></div>
        <button class="btn line sm danger" id="srst">Erase everything on this device</button>
      </section>`;
    cityField($('#scity', root), { placeholder: 'Change city', onPick: c => { setLocation(c); toast('City set · ' + c[0]); draw(); } });
  };
  let armed = 0;
  root.onclick = async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.off) { const p = b.dataset.off; S.offsets[p] = Math.max(-30, Math.min(30, (S.offsets[p] || 0) + +b.dataset.d)); save(); const y = window.scrollY; await draw(); window.scrollTo(0, y); return; }
    if (b.id === 'sgeo') { b.textContent = 'Locating…'; try { await locateOnce(); toast('Location set · ' + S.loc.name); } catch (err) { toast('Location unavailable.'); } draw(); return; }
    if (b.id === 'sexp') { download(`safa-backup-${dayKey()}.json`, JSON.stringify({ app: 'safa.', exported: new Date().toISOString(), state: S }, null, 2)); return; }
    if (b.id === 'sclr') { try { await caches.delete('safa-audio'); } catch (err) { /* ignore */ } S.q.dl = {}; save(); toast('Saved audio deleted'); draw(); return; }
    if (b.id === 'srst') { if (Date.now() - armed < 4000) { resetState(); try { await caches.delete('safa-audio'); } catch (err) { /* ignore */ } location.hash = '#/today'; location.reload(); } else { armed = Date.now(); b.textContent = 'Tap again to erase everything'; } return; }
    if (b.id === 'sall') {
      b.disabled = true; let ok = 0;
      try { for (let s = 1; s <= 114; s++) { await Promise.all([fetch(`data/quran/${s}.json`), fetch(`data/tafsir/${s}.json`), fetch(`data/pk/${s}.json`)]); ok++; b.textContent = `Saving… ${ok} / 114`; } await fetch('data/search.json'); b.textContent = 'Whole Quran saved for offline ✓'; }
      catch (err) { b.disabled = false; b.textContent = `Stopped at ${ok} / 114. Tap to retry.`; }
      return;
    }
    if (b.id === 'sics') {
      const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//safa.//EN', 'X-WR-CALNAME:safa. prayer times'], stamp = new Date().toISOString().replace(/[-:]|\.\d+/g, '');
      const u = ms => new Date(ms).toISOString().replace(/[-:]|\.\d+/g, '');
      for (let i = 0; i < 30; i++) { const k = addDays(dayKey(), i), t = timesFor(k); for (const p of P5) if (t[p]) lines.push('BEGIN:VEVENT', `UID:safa-${k}-${p}@safa`, `DTSTAMP:${stamp}`, `DTSTART:${u(t[p])}`, `DTEND:${u(t[p] + 600000)}`, `SUMMARY:${NAMES[p]}`, 'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${NAMES[p]}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT'); }
      lines.push('END:VCALENDAR'); download('safa-prayer-times.ics', lines.join('\r\n'), 'text/calendar'); return;
    }
  };
  root.onchange = async e => {
    const id = e.target.id;
    if (id === 'smeth') S.method = e.target.value;
    if (id === 'smad') S.madhab = e.target.value;
    if (id === 'shij') S.hijriAdj = +e.target.value;
    if (id === 's24') S.h24 = e.target.checked;
    if (id === 'simp') {
      try { const o = JSON.parse(await e.target.files[0].text()); if (!o || o.app !== 'safa.' || !o.state || !o.state.loc) throw new Error('bad'); replaceState(o.state); toast('Backup restored'); }
      catch (err) { toast('This file is not a safa. backup.'); }
    }
    if (['smeth', 'smad', 'shij', 's24', 'simp'].includes(id)) { save(); draw(); }
  };
  draw(); data('cities.json').catch(() => {});
  return () => { root.onclick = null; root.onchange = null; };
}

export function renderAbout(root) {
  root.innerHTML = `<header class="sub"><a href="#/track" class="ib" aria-label="Back">${icon.back}</a><b>About</b><span class="ib"></span></header>
    <section class="about">
      <div class="onb-logo sm">${LOGO}</div><h2>safa<i>.</i></h2><p class="lead">The silent spiritual instrument.</p>
      <h3>The promise</h3>
      <ul class="plain"><li>No ads. Ever.</li><li>No account. No analytics. No tracker.</li><li>Your place, your prayers and your reading stay on this device.</li><li>No pop-up will ever stand between you and the Qibla, the times or the Quran.</li><li>No streak to lose. No guilt.</li></ul>
      <h3>Support · Sadaqah Jariyah</h3>
      <p>Everything here is free. Contributions are not open yet: there is nothing to pay and nothing locked. If safa. helps you, share it with one person. That is the support for now.</p>
      <h3>Sources</h3>
      <ul class="plain small">
        <li><b>Prayer times, Qibla:</b> adhan-js by Batoul Apps (MIT), computed on device.</li>
        <li><b>Quran text:</b> Uthmani Hafs text from the Noble Qur'an Encyclopedia, via quran-json (CC BY 4.0).</li>
        <li><b>Word-by-word meanings and word audio:</b> Quran.com / Quranic Arabic Corpus data.</li>
        <li><b>Translations:</b> Talal Itani (ClearQuran) and M. M. Pickthall, via fawazahmed0/quran-api.</li>
        <li><b>Explanation:</b> Al-Mukhtasar, Tafsir Center for Quranic Studies. <b>Circumstances of revelation:</b> Al-Wahidi. Both via spa5k/tafsir_api.</li>
        <li><b>Recitations:</b> streamed from everyayah.com.</li>
        <li><b>Duas:</b> Hisnul Muslim by Sa'id bin Ali bin Wahf al-Qahtani, text and audio from hisnmuslim.com.</li>
        <li><b>Cities:</b> city-timezones (MIT).</li>
      </ul>
      <p class="muted small">safa. is a tool, not a religious authority. Times are calculations and can differ by a minute or two from your mosque. For rulings, ask a person of knowledge.</p>
      <p class="mono">Version 1.0 · a prototype from The Unfinished 30</p>
    </section>`;
}
