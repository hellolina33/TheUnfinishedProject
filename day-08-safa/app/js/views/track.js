import { S, save, replaceState, resetState, dayKey, addDays, getDay, P5, data } from '../store.js';
import { METHODS, NAMES, timesFor, fmtTime } from '../prayer.js';
import { $, $$, esc, icon, pad, toast, download, cityField, LOGO, countryName, reportUrl, sheet, closeSheet } from '../ui.js';
import { setLocation, locateOnce } from './onboarding.js';
import { RECITERS } from './quran.js';
import { t, L, lang, applyLang } from '../i18n.js';
import * as SY from '../sync.js';
import { applyUi } from '../a11y.js';

let weekOff = 0;
export function renderTrack(root) {
  const draw = () => {
    const today = dayKey(), end = addDays(today, weekOff * 7), keys = Array.from({ length: 7 }, (_, i) => addDays(end, i - 6));
    const days = keys.map(k => getDay(k, false));
    const lbl = k => k === today ? t('Today') : new Intl.DateTimeFormat(L(), { weekday: 'short', timeZone: 'UTC' }).format(new Date(k + 'T12:00:00Z'));
    const since = S.since || today, live = keys.map(k => k >= since);
    const active = days.filter((d, i) => live[i] && !d.pz), shown = active.filter(d => d.p.some(Boolean)).length, read = days.filter((d, i) => live[i] && d.r).length;
    const range = new Intl.DateTimeFormat(L(), { day: 'numeric', month: 'short', timeZone: 'UTC' });
    const cell = (k, d, j) => k < since ? '<td></td>' : `<td><button class="pd ${d.pz ? 'pz' : d.p[j] ? 'on' : ''}" data-k="${k}" data-j="${j}" ${d.pz || k > today ? 'disabled' : ''} aria-pressed="${!!d.p[j]}" aria-label="${NAMES[P5[j]]}, ${lbl(k)}${d.pz ? t(', paused') : ''}"></button></td>`;
    const cell2 = (k, d, f, name) => k < since ? '<td></td>' : `<td><button class="pd sq ${d[f] ? 'on' : ''}" data-k="${k}" data-f="${f}" ${k > today ? 'disabled' : ''} aria-pressed="${!!d[f]}" aria-label="${name}, ${lbl(k)}"></button></td>`;
    root.innerHTML = `<header class="vh"><div><h1>${t('Track')}</h1></div><a class="ib" href="#/settings" aria-label="${t('Settings')}">${icon.gear}</a></header>
      <div class="pause ${S.pauseOn ? 'on' : ''}"><div><b>${t('Pause mode')}</b><small>${t('Periods, illness, hard days. Tracking freezes. Nothing is counted against you.')}${S.pauseOn && S.pauseUntil ? ' ' + t('Until {d}.', { d: S.pauseUntil.split('-').reverse().slice(0, 2).join('/') }) : ''}</small></div><button class="sw" role="switch" id="pz" aria-checked="${S.pauseOn}" aria-label="${t('Pause mode')}"></button></div>
      <div class="wkh"><button class="ib" id="wprev" aria-label="${t('Previous week')}">${icon.back}</button><span class="mono">${range.format(new Date(keys[0] + 'T12:00:00Z'))} – ${range.format(new Date(keys[6] + 'T12:00:00Z'))}</span><button class="ib flip" id="wnext" ${weekOff >= 0 ? 'disabled' : ''} aria-label="${t('Next week')}">${icon.back}</button></div>
      <table class="wk"><thead><tr><th class="l"></th>${keys.map(k => `<th class="${k === today ? 'td' : ''}">${lbl(k).replace('.', '').slice(0, 3)}</th>`).join('')}</tr></thead>
        <tbody>${P5.map((p, j) => `<tr><th class="l">${NAMES[p]}</th>${keys.map((k, i) => cell(k, days[i], j)).join('')}</tr>`).join('')}
        <tr class="sep"><th class="l">${t('Quran')}</th>${keys.map((k, i) => cell2(k, days[i], 'r', t('Quran reading'))).join('')}</tr>
        <tr><th class="l">${t('Adhkar')}</th>${keys.map((k, i) => cell2(k, days[i], 'a', t('Adhkar'))).join('')}</tr></tbody></table>
      <p class="sumline">${!active.length && days.some(d => d.pz) ? t('This week is paused.') : shown ? t(shown === 1 ? 'You prayed on <b>1</b> day this week' : 'You prayed on <b>{a}</b> days this week', { a: shown }) + (read ? t(read === 1 ? ' and opened the Quran on <b>1</b>' : ' and opened the Quran on <b>{n}</b>', { n: read }) : '') + '.' : read ? t('You opened the Quran on <b>{n}</b> days this week.', { n: read }) : t('Each day is a fresh start. Tick a prayer when you want to.')} ${days.some(d => d.pz) ? t('Paused days are left out.') : ''}</p>
      <p class="muted small legend">${t('Circles: the five prayers. Squares: Quran opened, adhkar read.')}</p>
      <details class="daytxt"><summary class="linkbtn small">${t('Read the week as text')}</summary><ul>${keys.map((k, i) => { if (k < since || k > today) return ''; const d = days[i], n = d.p.filter(Boolean).length, bits = []; if (d.pz) bits.push(t('paused')); else { if (n) bits.push(t(n === 1 ? '1 prayer ticked' : '{n} prayers ticked', { n })); if (d.r) bits.push(t('Quran opened')); if (d.a) bits.push(t('adhkar read')); } return `<li><b>${esc(new Intl.DateTimeFormat(L(), { weekday: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(k + 'T12:00:00Z')))}</b> · ${bits.length ? bits.join(' · ') : t('nothing logged')}</li>`; }).join('')}</ul></details>
      <section class="card stack">
        <label class="tog"><span>${t('Evening check-in')}<small>${t('One gentle reminder a day. Nothing else.')}</small></span><input type="checkbox" id="ron" ${S.rem.on ? 'checked' : ''}></label>
        <div class="row2"><label class="lbl" for="rt">${t('Time')}</label><input type="time" id="rt" class="inp" value="${S.rem.t}"></div>
        <button class="btn line sm" id="rics">${t('Add it to my calendar')}</button>
        <p class="muted small">${t('A web app cannot ring while it is closed. The calendar file gives you a reliable daily reminder; the in-app notice only shows while safa. is open.')}</p>
      </section>
      <a class="srow" href="#/qada"><span class="st"><b>${t('Make-up prayers')}</b><span class="muted small">${t('Missed prayers and fasts, at your pace')}</span></span>${icon.chev}</a>
      <a class="srow" href="#/settings"><span class="st"><b>${t('Settings')}</b><span class="muted small">${t('Method, offsets, audio, backup')}</span></span>${icon.chev}</a>
      <a class="srow" href="#/about"><span class="st"><b>${t('About &amp; support')}</b><span class="muted small">${t('Sources, promise, Sadaqah Jariyah')}</span></span>${icon.chev}</a>`;
  };
  root.onclick = async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'pz') {
      if (S.pauseOn) { S.pauseOn = false; S.pauseUntil = null; const d = getDay(dayKey(), true); d.pz = 0; save(); draw(); return; }
      const el = sheet(`<h3>${t('Pause mode')}</h3><p class="muted small">${t('Tracking freezes. Nothing is counted against you. Prayer times stay visible.')}</p><div class="acts">${[[0, t('Until I turn it off')], [3, t('For 3 days')], [7, t('For 7 days')], [10, t('For 10 days')]].map(([n, l]) => `<button data-pd="${n}">${l}</button>`).join('')}</div>`, { label: t('Pause mode') });
      el.onclick = e2 => { const x = e2.target.closest('[data-pd]'); if (!x) return; const n = +x.dataset.pd; S.pauseOn = true; S.pauseUntil = n ? addDays(dayKey(), n - 1) : null; getDay(dayKey(), true).pz = 1; save(); closeSheet(); draw(); toast(n ? t('Paused until {d}. Take care of yourself.', { d: S.pauseUntil.split('-').reverse().slice(0, 2).join('/') }) : t('Paused. Take care of yourself.')); };
      return;
    }
    if (b.id === 'wprev') { weekOff--; draw(); return; }
    if (b.id === 'wnext') { weekOff = Math.min(0, weekOff + 1); draw(); return; }
    if (b.id === 'rics') {
      const [h, m] = S.rem.t.split(':'), k = dayKey().replace(/-/g, '');
      download('safa-evening-check-in.ics', ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//safa.//EN', 'BEGIN:VEVENT', `UID:safa-evening-${Date.now()}@safa`, `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d+/g, '')}`, `DTSTART;TZID=${S.loc.tz}:${k}T${h}${m}00`, 'DURATION:PT5M', 'RRULE:FREQ=DAILY', 'SUMMARY:' + t('safa. · evening check-in'), 'DESCRIPTION:' + t('Evening adhkar. A few verses. Tick today.'), 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + t('safa. · evening check-in'), 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'), 'text/calendar');
      return;
    }
    if (b.dataset.k) { const d = getDay(b.dataset.k, true); if (b.dataset.f) d[b.dataset.f] = d[b.dataset.f] ? 0 : 1; else d.p[+b.dataset.j] = d.p[+b.dataset.j] ? 0 : 1; save(); draw(); }
  };
  root.onchange = async e => {
    if (e.target.id === 'rt') { S.rem.t = e.target.value || '21:00'; save(); }
    if (e.target.id === 'ron') {
      S.rem.on = e.target.checked;
      if (S.rem.on && 'Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch (err) { /* ignore */ } }
      if (S.rem.on && (!('Notification' in window) || Notification.permission !== 'granted')) toast(t('Notifications are off for this browser. Use the calendar reminder.'));
      save();
    }
  };
  draw();
  return () => { root.onclick = null; root.onchange = null; };
}

export function renderSettings(root) {
  const draw = async () => {
    let est = ''; try { const e = await navigator.storage.estimate(); est = t('{n} MB used on this device', { n: (e.usage / 1048576).toLocaleString(L(), { maximumFractionDigits: 1 }) }); } catch (e) { /* not supported */ }
    const dl = Object.keys(S.q.dl || {});
    root.innerHTML = `<header class="sub"><a href="#/track" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Settings')}</b><span class="ib"></span></header>
      <nav class="chips wrapc stoc" aria-label="${t('Sections')}"><button class="chip" data-go="st1">${t('Language')}</button><button class="chip" data-go="st2">${t('Place')}</button><button class="chip" data-go="st3">${t('Prayer times')}</button><button class="chip" data-go="st4">${t('Offline')}</button><button class="chip" data-go="st5">${t('Display &amp; accessibility')}</button><button class="chip" data-go="st6">${t('Friday')}</button><button class="chip" data-go="st7">${t('Sync between devices')}</button><button class="chip" data-go="st8">${t('Backup')}</button></nav>
      <section class="form">
        <h3 id="st1">${t('Language')}</h3>
        <div class="seg lang">${[['auto', t('Automatic') + ' (' + ({ fr: 'FR', en: 'EN', ar: 'ع' }[lang()]) + ')'], ['en', 'English'], ['fr', 'Français'], ['ar', 'العربية']].map(([k, l]) => `<button data-lang="${k}" aria-pressed="${(S.lang || 'auto') === k}">${l}</button>`).join('')}</div>
        <h3 id="st2">${t('Place')}</h3>
        <p class="muted small">${t('Now: <b>{c}</b>, {p}. Stored on this device only.', { c: esc(S.loc.name), p: esc(countryName(S.loc.iso2, S.loc.country)) })}</p>
        <div id="scity"></div><button class="btn line sm" id="sgeo">${t('Use my location once')}</button>
        <h3 id="st3">${t('Prayer times')}</h3>
        <label class="lbl" for="smeth">${t('Calculation method')}</label>
        <select id="smeth" class="inp">${Object.entries(METHODS).map(([k, m]) => `<option value="${k}" ${S.method === k ? 'selected' : ''}>${esc(m.n)} · ${esc(m.d)}</option>`).join('')}</select>
        <label class="lbl" for="smad">${t('Asr')}</label>
        <select id="smad" class="inp"><option value="shafi" ${S.madhab === 'shafi' ? 'selected' : ''}>${t("Standard · Shafi'i, Maliki, Hanbali")}</option><option value="hanafi" ${S.madhab === 'hanafi' ? 'selected' : ''}>${t('Hanafi')}</option></select>
        <p class="muted small">${t('Hanafi: Asr starts later. Not sure? Keep Standard, or ask your mosque.')}</p>
        <label class="lbl">${t('Match your mosque · minutes')}</label>
        <div class="offs">${P5.map(p => `<div class="off"><span>${NAMES[p]}</span><button data-off="${p}" data-d="-1" aria-label="${t('{p} minus one minute', { p: NAMES[p] })}">−</button><b class="mono">${S.offsets[p] > 0 ? '+' : ''}${S.offsets[p]}</b><button data-off="${p}" data-d="1" aria-label="${t('{p} plus one minute', { p: NAMES[p] })}">+</button><span class="mono muted">${fmtTime(timesFor(dayKey())[p])}</span></div>`).join('')}</div>
        <label class="lbl" for="shij">${t('Hijri date adjustment')}</label>
        <select id="shij" class="inp">${[-2, -1, 0, 1, 2].map(n => `<option value="${n}" ${S.hijriAdj === n ? 'selected' : ''}>${t(Math.abs(n) === 1 ? '{n} day' : '{n} days', { n: (n > 0 ? '+' : '') + n })}</option>`).join('')}</select>
        <label class="tog"><span>${t('24-hour clock')}</span><input type="checkbox" id="s24" ${S.h24 ? 'checked' : ''}></label>
        <button class="btn line sm" id="sics">${t('Add 30 days of prayer times to my calendar')}</button>
        <h3 id="st4">${t('Offline')}</h3>
        <p class="muted small">${esc(est)}</p>
        <button class="btn line sm" id="sall">${t('Save the whole Quran text for offline')} · ≈ 25 MB</button>
        <p class="muted small">${t('Saved audio: {x}', { x: dl.length ? dl.map(k => { const [r, s] = k.split('|'); return t('surah {s} · {r}', { s, r: esc(RECITERS[r] || r) }); }).join(', ') : t('none') })}</p>
        ${dl.length ? `<button class="btn line sm" id="sclr">${t('Delete saved audio')}</button>` : ''}
        <h3 id="st5">${t('Display &amp; accessibility')}</h3>
        <label class="lbl">${t('Theme')}</label><div class="seg lang">${[['auto', t('Automatic')], ['light', t('Light')], ['dark', t('Dark')]].map(([k, l]) => `<button data-theme="${k}" aria-pressed="${S.ui.theme === k}">${l}</button>`).join('')}</div>
        <label class="lbl">${t('Text size')}</label><div class="seg lang">${[[0.9, 'A−'], [1, 'A'], [1.15, 'A+'], [1.3, 'A++']].map(([k, l]) => `<button data-scale="${k}" aria-pressed="${S.ui.scale === k}" aria-label="${t('Text size')} ${Math.round(k * 100)}%">${l}</button>`).join('')}</div>
        <p class="preview">${t('Preview: the words you read here change size.')}</p>
        <label class="tog"><span>${t('High contrast')}</span><input type="checkbox" id="shc" ${S.ui.hc ? 'checked' : ''}></label>
        <label class="tog"><span>${t('Reduce motion')}</span><input type="checkbox" id="srm" ${S.ui.motion ? 'checked' : ''}></label>
        <h3 id="st6">${t('Friday')}</h3>
        <label class="tog"><span>${t('Al-Kahf reminder')}<small>${t('A card on Friday until you open Al-Kahf.')}</small></span><input type="checkbox" id="sfri" ${S.fri.on ? 'checked' : ''}></label>
        <button class="btn line sm" id="sfics">${t('Add a weekly Friday reminder to my calendar')}</button>
        <h3 id="st7">${t('Sync between devices')}</h3>
        <p class="muted small">${t('No account and no server. Create an encrypted file protected by a passphrase, send it to your other device any way you like, and merge it there. Nobody can read it without the passphrase, not even us.')}</p>
        <p class="muted small warn">${t('Write your passphrase down somewhere safe. If you forget it, nobody can open the file, not even safa.')}</p>
        <input id="spass" class="inp" type="password" minlength="8" autocomplete="new-password" placeholder="${t('Passphrase (8 characters or more)')}" aria-label="${t('Passphrase')}">
        <div class="grid2"><button class="btn line sm" id="ssync">${t('Create sync file')}</button><label class="btn line sm">${t('Merge a sync file')}<input type="file" id="smerge" accept=".safa,application/json" hidden></label></div>
        <h3 id="st8">${t('Backup')}</h3>
        <p class="muted small">${t('No account, so no cloud. Keep a file and restore it on any device.')} ${/iphone|ipad/i.test(navigator.userAgent) ? t('On iPhone, Safari can clear the data of a web app you have not opened for weeks: export a backup from time to time.') : ''}</p>
        <p class="muted small">${t('The backup is encrypted with the passphrase above. Without it, nobody can read the file, not even you.')}</p>
        <div class="grid2"><button class="btn line sm" id="sexp">${t('Export backup')}</button><label class="btn line sm">${t('Import backup')}<input type="file" id="simp" accept=".safa,application/json,.json" hidden></label></div>
        <button class="linkbtn small" id="sexp2">${t('Export a readable copy (not encrypted)')}</button>
        <button class="btn line sm danger" id="srst">${t('Erase everything on this device')}</button>
      </section>`;
    cityField($('#scity', root), { placeholder: t('Change city'), onPick: c => { setLocation(c); toast(t('City set · {c}', { c: c[0] })); draw(); } });
  };
  let armed = 0;
  root.onclick = async e => {
    const go = e.target.closest('[data-go]'); if (go) { const h = document.getElementById(go.dataset.go); if (h) { h.scrollIntoView({ block: 'start' }); window.scrollBy(0, -64); } return; }
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.theme) { S.ui.theme = b.dataset.theme; save(); applyUi(); draw(); return; }
    if (b.dataset.scale) { S.ui.scale = +b.dataset.scale; save(); applyUi(); draw(); return; }
    if (b.id === 'sfics') { download('safa-friday-al-kahf.ics', ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//safa.//EN', 'BEGIN:VEVENT', `UID:safa-friday-${Date.now()}@safa`, `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d+/g, '')}`, `DTSTART;TZID=${S.loc.tz}:${(() => { const d = new Date(); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7)); return d.toISOString().slice(0, 10).replace(/-/g, ''); })()}T090000`, 'DURATION:PT10M', 'RRULE:FREQ=WEEKLY;BYDAY=FR', 'SUMMARY:' + t('Friday · Al-Kahf'), 'DESCRIPTION:' + t('Read Al-Kahf. Send blessings on the Prophet.'), 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + t('Friday · Al-Kahf'), 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'), 'text/calendar'); return; }
    if (b.id === 'ssync') {
      const pass = $('#spass', root).value; if (pass.length < 8) { toast(t('Choose a passphrase of 8 characters or more.')); $('#spass', root).focus(); return; }
      b.disabled = true; const txt = await SY.seal(pass), name = `safa-sync-${dayKey()}.safa`; b.disabled = false;
      try { const f = new File([txt], name, { type: 'application/octet-stream' }); if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'safa.' }); return; } } catch (err) { /* fall back to download */ }
      download(name, txt, 'application/octet-stream'); toast(t('Sync file created. Open it on your other device.')); return;
    }
    if (b.dataset.lang) { S.lang = b.dataset.lang; if (S.q.tr !== 'none') S.q.tr = 'auto'; save(); applyLang(); window.dispatchEvent(new Event('safa:lang')); return; }
    if (b.dataset.off) { const p = b.dataset.off; S.offsets[p] = Math.max(-30, Math.min(30, (S.offsets[p] || 0) + +b.dataset.d)); save(); const y = window.scrollY; await draw(); window.scrollTo(0, y); return; }
    if (b.id === 'sgeo') { b.textContent = t('Locating…'); try { await locateOnce(); toast(t('Location set · {c}', { c: S.loc.name })); } catch (err) { toast(t('Location unavailable.')); } draw(); return; }
    if (b.id === 'sexp') {
      const pass = $('#spass', root).value; if (pass.length < 8) { toast(t('Type a passphrase of 8 characters or more above, to encrypt your backup.')); $('#spass', root).focus(); return; }
      b.disabled = true; const txt = await SY.seal(pass); b.disabled = false; download(`safa-backup-${dayKey()}.safa`, txt, 'application/octet-stream'); toast(t('Encrypted backup saved. Keep your passphrase.')); return;
    }
    if (b.id === 'sexp2') { download(`safa-backup-${dayKey()}.json`, JSON.stringify({ app: 'safa.', exported: new Date().toISOString(), state: S }, null, 2)); return; }
    if (b.id === 'sclr') { try { await caches.delete('safa-audio'); } catch (err) { /* ignore */ } S.q.dl = {}; save(); toast(t('Saved audio deleted')); draw(); return; }
    if (b.id === 'srst') { if (Date.now() - armed < 4000) { resetState(); try { await caches.delete('safa-audio'); } catch (err) { /* ignore */ } location.hash = '#/today'; location.reload(); } else { armed = Date.now(); b.textContent = t('Tap again to erase everything. Export a backup first if you want to keep it.'); } return; }
    if (b.id === 'sall') {
      b.disabled = true; let ok = 0;
      try { for (let s = 1; s <= 114; s++) { await Promise.all([fetch(`data/quran/${s}.json`), fetch(`data/tafsir/${s}.json`), fetch(`data/${lang() === 'fr' ? 'fr' : 'pk'}/${s}.json`)]); ok++; b.textContent = t('Saving… {n} / 114', { n: ok }); } await fetch(lang() === 'fr' ? 'data/search_fr.json' : 'data/search.json'); b.textContent = t('Whole Quran saved for offline ✓'); }
      catch (err) { b.disabled = false; b.textContent = t('Stopped at {n} / 114. Tap to retry.', { n: ok }); }
      return;
    }
    if (b.id === 'sics') {
      const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//safa.//EN', 'X-WR-CALNAME:safa. prayer times'], stamp = new Date().toISOString().replace(/[-:]|\.\d+/g, '');
      const u = ms => new Date(ms).toISOString().replace(/[-:]|\.\d+/g, '');
      for (let i = 0; i < 30; i++) { const k = addDays(dayKey(), i), tt = timesFor(k); for (const p of P5) if (tt[p]) lines.push('BEGIN:VEVENT', `UID:safa-${k}-${p}@safa`, `DTSTAMP:${stamp}`, `DTSTART:${u(tt[p])}`, `DTEND:${u(tt[p] + 600000)}`, `SUMMARY:${NAMES[p]}`, 'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${NAMES[p]}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT'); }
      lines.push('END:VCALENDAR'); download('safa-prayer-times.ics', lines.join('\r\n'), 'text/calendar'); return;
    }
  };
  root.onchange = async e => {
    const id = e.target.id;
    if (id === 'smeth') S.method = e.target.value;
    if (id === 'smad') S.madhab = e.target.value;
    if (id === 'shij') S.hijriAdj = +e.target.value;
    if (id === 's24') S.h24 = e.target.checked;
    if (id === 'shc') { S.ui.hc = e.target.checked; save(); applyUi(); }
    if (id === 'srm') { S.ui.motion = e.target.checked; save(); applyUi(); }
    if (id === 'sfri') { S.fri.on = e.target.checked; save(); }
    if (id === 'smerge') {
      const pass = $('#spass', root).value; if (!pass) { toast(t('Type the passphrase first.')); e.target.value = ''; return; }
      try { SY.merge(await SY.open(await e.target.files[0].text(), pass)); toast(t('Merged. Nothing on this device was lost.')); draw(); }
      catch (err) { toast(t('Could not open this file. Check the passphrase.')); }
      e.target.value = ''; return;
    }
    if (id === 'simp') {
      try {
        const txt = await e.target.files[0].text(), o = JSON.parse(txt); let st;
        if (o && o.safa === 'sync') { const pass = $('#spass', root).value; if (!pass) { toast(t('Type the passphrase first.')); e.target.value = ''; return; } st = await SY.open(txt, pass); }
        else { if (!o || o.app !== 'safa.') throw new Error('bad'); st = o.state; }
        if (!st || !st.loc) throw new Error('bad'); replaceState(st); toast(t('Backup restored'));
      } catch (err) { toast(t('Could not open this file. Check the passphrase.')); }
      e.target.value = '';
    }
    if (['smeth', 'smad', 'shij', 's24', 'simp'].includes(id)) { save(); draw(); }
  };
  draw(); data('cities.json').catch(() => {});
  return () => { root.onclick = null; root.onchange = null; };
}

const LINKS = [["adhan-js by Batoul Apps", "https://github.com/batoulapps/adhan-js"], ["quran-json", "https://github.com/risan/quran-json"], ["fawazahmed0/quran-api", "https://github.com/fawazahmed0/quran-api"], ["AleaToir3/hisnul-muslim-api-json", "https://github.com/AleaToir3/hisnul-muslim-api-json"], ["spa5k/tafsir_api", "https://github.com/spa5k/tafsir_api"], ["everyayah.com", "https://everyayah.com"], ["hisnmuslim.com", "https://www.hisnmuslim.com"], ["city-timezones", "https://github.com/kevinroberts/city-timezones"]];
export function renderAbout(root) {
  root.innerHTML = `<header class="sub"><a href="#/track" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('About')}</b><span class="ib"></span></header>
    <section class="about">
      <div class="onb-logo sm">${LOGO}</div><h2>safa<i>.</i></h2><p class="lead">${t('The silent spiritual instrument.')}</p>
      <h3>${t('The promise')}</h3>
      <ul class="plain">${['No ads. Ever.', 'No account. No analytics. No tracker.', 'Your place, your prayers and your reading stay on this device.', 'No pop-up will ever stand between you and the Qibla, the times or the Quran.', 'No streak to lose. No guilt.'].map(x => `<li>${t(x)}</li>`).join('')}</ul>
      <p class="muted small">${t('safa. is a tool, not a religious authority. Times are calculations and can differ by a minute or two from your mosque. For rulings, ask a person of knowledge.')}</p>
      <h3>${t('Support · Sadaqah Jariyah')}</h3>
      <p>${t('Everything here is free, with nothing locked. Sadaqah Jariyah is a good deed that keeps giving after it is done. The simplest one here: share safa. with one person it could help.')}</p>
      <div class="row2"><button class="btn sm" id="ashare">${t('Share safa.')}</button><a class="btn sm line" href="${reportUrl('feedback')}" target="_blank" rel="noopener">${t('Give feedback or report an error')}</a></div>
      <h3>${t('Sources')}</h3>
      <ul class="plain small">
        <li>${t(`<b>Prayer times, Qibla:</b> adhan-js by Batoul Apps (MIT), computed on device.`)}</li>
        <li>${t(`<b>Quran text:</b> Uthmani Hafs text from the Noble Qur'an Encyclopedia, via quran-json (CC BY 4.0).`)}</li>
        <li>${t(`<b>Word-by-word meanings and word audio:</b> Quran.com / Quranic Arabic Corpus data.`)}</li>
        <li>${t(`<b>Translations:</b> Rashid Maash and Muhammad Hamidullah (French), Talal Itani (ClearQuran) and M. M. Pickthall (English), via fawazahmed0/quran-api.`)}</li>
        <li>${t(`<b>French duas:</b> La Citadelle du Musulman, French text and transliteration via AleaToir3/hisnul-muslim-api-json.`)}</li>
        <li>${t(`<b>Explanation:</b> Al-Mukhtasar, Tafsir Center for Quranic Studies. <b>Circumstances of revelation:</b> Al-Wahidi. Both via spa5k/tafsir_api.`)}</li>
        <li>${t(`<b>Recitations:</b> streamed from everyayah.com.`)}</li>
        <li>${t(`<b>Duas:</b> Hisnul Muslim by Sa'id bin Ali bin Wahf al-Qahtani, text and audio from hisnmuslim.com.`)}</li>
        <li>${t(`<b>Cities:</b> city-timezones (MIT).`)}</li>
      </ul>
      <p><a href="../${lang() === 'fr' ? 'confidentialite' : 'privacy'}/" target="_blank" rel="noopener">${t('What safa. keeps, and what it never keeps')}</a></p>
      <p class="muted small">${t('Open the sources:')} ${LINKS.map(([n, u]) => `<a href="${u}" target="_blank" rel="noopener">${n}</a>`).join(' · ')}</p>
      <p class="mono">${t('Version 1.1 · made by Salah, as part of The Unfinished 30. safa. stays online after the challenge.')}</p>
    </section>`;
  const sb = $('#ashare', root); if (sb) sb.onclick = async () => { const url = location.origin + location.pathname.replace(/app\/.*$/, ''); const txt = t('safa. Prayer times, the Quran word by word with context, and duas. No ads, no account, no guilt.'); try { if (navigator.share) await navigator.share({ title: 'safa.', text: txt, url }); else { await navigator.clipboard.writeText(txt + ' ' + url); toast(t('Copied')); } } catch (e) { /* cancelled */ } };
}
