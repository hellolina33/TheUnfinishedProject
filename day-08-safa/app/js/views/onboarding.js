import { S, save, data, dayKey } from '../store.js';
import { METHODS, methodFor, nearestCity, timesFor, NAMES, fmtTime } from '../prayer.js';
import { $, esc, LOGO, cityField, toast, icon, countryName } from '../ui.js';
import { t, lang, applyLang } from '../i18n.js';

export function setLocation(c, coords) {
  S.loc = { name: c[0], country: c[1], iso2: c[2], lat: coords ? coords.lat : c[3], lng: coords ? coords.lng : c[4], tz: coords ? (Intl.DateTimeFormat().resolvedOptions().timeZone || c[5]) : c[5] };
  S.method = methodFor(c[2]); save();
}
export function locateOnce() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('no-geo'));
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const cities = await data('cities.json');
        const lat = +pos.coords.latitude.toFixed(3), lng = +pos.coords.longitude.toFixed(3);
        setLocation(nearestCity(cities, lat, lng), { lat, lng }); resolve();
      } catch (e) { reject(e); }
    }, reject, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
  });
}

export function render(root, done) {
  const step1 = () => {
    root.innerHTML = `<section class="onb">
      <div class="onb-top"><div class="onb-logo">${LOGO}</div><h1>safa<i>.</i></h1><div class="langsw" role="group" aria-label="Language"><button class="chip" data-l="en" aria-pressed="${lang() === 'en'}">EN</button><button class="chip" data-l="fr" aria-pressed="${lang() === 'fr'}">FR</button><button class="chip" data-l="ar" aria-pressed="${lang() === 'ar'}" lang="ar">عربي</button></div></div>
      <div><span class="mono">${t('Step 1 of 2')}</span><p class="onb-tag">${t('Clear time.<br>Clear soul<i>.</i>')}</p>
      <ul class="onb-feat"><li>${icon.today}<span>${t('Prayer times for your city')}</span></li><li>${icon.quran}<span>${t('The Quran word by word, with the context of each verse')}</span></li><li>${icon.duas}<span>${t('Authentic duas for every moment')}</span></li></ul>
      <p class="onb-promise">${icon.lock}<span>${t('No ads. No account. Everything stays on your phone. Works offline.')}</span></p>
      <p class="muted small">${t('New to prayer, or coming back? We go step by step.')}</p></div>
      <div><button class="btn big" id="go">${t('Set my city')}</button><p class="muted small center">${t('Then your times for today. Language can be changed later in Settings.')}</p></div>
    </section>`;
    $('#go', root).onclick = step2;
    root.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { S.lang = b.dataset.l; save(); applyLang(); step1(); });
  };
  const step2 = () => {
    root.innerHTML = `<section class="onb onb2">
      <div><span class="mono">${t('Step 2 of 2')}</span><h2>${t('Where are you?')}</h2>
      <p class="onb-promise">${icon.lock}<span>${t('Used on this device to compute prayer times and the Qibla. It is never sent anywhere.')}</span></p></div>
      <div class="onb-form">
        <button class="btn big" id="geo">${t('Use my location once')}</button>
        <div class="or mono">${t('or')}</div>
        <div id="city"></div>
        <div id="picked" hidden>
          <p class="picked mono" id="pk"></p><p class="nextpv" id="npv"></p>
          <label class="lbl" for="meth">${t('Calculation method')}</label>
          <select id="meth" class="inp">${Object.entries(METHODS).map(([k, m]) => `<option value="${k}">${esc(m.n)}</option>`).join('')}</select>
          <p class="muted small">${t('The one usually used in your country is already chosen. Not sure? Keep it. You can change it any time.')}</p>
          <label class="tog"><span>${t('I follow the Hanafi school')}<small>${t('Asr starts later. Leave off if you are not sure.')}</small></span><input type="checkbox" id="hanafi" ${S.madhab === 'hanafi' ? 'checked' : ''}></label>
          <label class="lbl">${t('Where are you with prayer? (optional)')}</label>
          <div class="seg lvl">${[['new', 'I am starting'], ['back', 'I am coming back'], ['reg', 'I already pray']].map(([k, l]) => `<button type="button" data-lvl="${k}" aria-pressed="${S.level === k}">${t(l)}</button>`).join('')}</div>
        </div>
      </div>
      <div><button class="btn big" id="done" disabled>${t("Show today's times")}</button><p class="muted small center" id="hint">${t('Choose a city first.')}</p><p class="muted small center">${t('Reminders: add your times to your phone calendar from Settings, whenever you want.')}</p></div>
    </section>`;
    const picked = () => { $('#picked', root).hidden = false; $('#meth', root).value = S.method; $('#done', root).disabled = false; $('#hint', root).hidden = true; $('#pk', root).textContent = `${S.loc.name} · ${countryName(S.loc.iso2, S.loc.country)}`; try { const T = timesFor(dayKey()), now = Date.now(), k = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].find(x => T[x] > now); $('#npv', root).textContent = k ? t('Next prayer: {p} at {t}', { p: NAMES[k], t: fmtTime(T[k]) }) : ''; } catch (e) { /* ignore */ } };
    root.addEventListener('click', e => { const b = e.target.closest('[data-lvl]'); if (!b) return; S.level = S.level === b.dataset.lvl ? null : b.dataset.lvl; save(); root.querySelectorAll('[data-lvl]').forEach(x => x.setAttribute('aria-pressed', x.dataset.lvl === S.level)); });
    const inp = cityField($('#city', root), { placeholder: t('Type your city'), onPick: c => { setLocation(c); picked(); } });
    $('#geo', root).onclick = async e => {
      e.target.textContent = t('Locating…'); const slow = setTimeout(() => { $('#hint', root).textContent = t('Taking a while? You can also type your city below.'); }, 5000);
      try { await locateOnce(); clearTimeout(slow); inp.value = S.loc.name; picked(); e.target.textContent = t('Location set · {c}', { c: S.loc.name }); e.target.classList.add('ok'); }
      catch (err) { clearTimeout(slow); e.target.textContent = t('Use my location once'); $('#hint', root).textContent = t('Location unavailable. Type your city instead.'); inp.focus(); }
    };
    $('#meth', root).onchange = e => { S.method = e.target.value; save(); };
    $('#hanafi', root).onchange = e => { S.madhab = e.target.checked ? 'hanafi' : 'shafi'; save(); };
    $('#done', root).onclick = () => { S.onboarded = true; if (!S.since) S.since = dayKey(); save(); location.hash = S.level === 'new' ? '#/learn' : '#/today'; done(); };
    data('cities.json').catch(() => {});
  };
  step1();
}
