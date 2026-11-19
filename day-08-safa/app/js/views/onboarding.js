import { S, save, data } from '../store.js';
import { METHODS, methodFor, nearestCity } from '../prayer.js';
import { $, esc, LOGO, cityField, toast } from '../ui.js';
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
      <div class="onb-top"><div class="onb-logo">${LOGO}</div><h1>safa<i>.</i></h1><div class="langsw" role="group" aria-label="Language"><button class="chip" data-l="en" aria-pressed="${lang() === 'en'}">EN</button><button class="chip" data-l="fr" aria-pressed="${lang() === 'fr'}">FR</button><button class="chip" data-l="ar" aria-pressed="${lang() === 'ar'}">ع</button></div></div>
      <div><p class="onb-tag">${t('Clear time.<br>Clear soul<i>.</i>')}</p>
      <ul class="onb-list"><li>${t('No ads')}</li><li>${t('No account, no tracking')}</li><li>${t('Works offline')}</li></ul></div>
      <button class="btn big" id="go">${t('Set my city')}</button>
    </section>`;
    $('#go', root).onclick = step2;
    root.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { S.lang = b.dataset.l; save(); applyLang(); step1(); });
  };
  const step2 = () => {
    root.innerHTML = `<section class="onb onb2">
      <div><span class="mono">${t('Step 2 of 2')}</span><h2>${t('Where do you pray?')}</h2>
      <p class="muted">${t('Used on this device to compute prayer times and the Qibla. It is never sent anywhere.')}</p></div>
      <div class="onb-form">
        <button class="btn line big" id="geo">${t('Use my location once')}</button>
        <div class="or mono">${t('or')}</div>
        <div id="city"></div>
        <div id="picked" hidden>
          <label class="lbl" for="meth">${t('Calculation method')}</label>
          <select id="meth" class="inp">${Object.entries(METHODS).map(([k, m]) => `<option value="${k}">${esc(m.n)} · ${esc(m.d)}</option>`).join('')}</select>
          <p class="muted small">${t('Pre-selected for your country. You can change it any time.')}</p>
        </div>
      </div>
      <button class="btn big" id="done" disabled>${t("Show today's times")}</button>
    </section>`;
    const picked = () => { $('#picked', root).hidden = false; $('#meth', root).value = S.method; $('#done', root).disabled = false; };
    const inp = cityField($('#city', root), { placeholder: t('Type your city'), onPick: c => { setLocation(c); picked(); } });
    $('#geo', root).onclick = async e => {
      e.target.textContent = t('Locating…');
      try { await locateOnce(); inp.value = S.loc.name; picked(); e.target.textContent = t('Location set · {c}', { c: S.loc.name }); }
      catch (err) { e.target.textContent = t('Use my location once'); toast(t('Location unavailable. Type your city instead.')); inp.focus(); }
    };
    $('#meth', root).onchange = e => { S.method = e.target.value; save(); };
    $('#done', root).onclick = () => { S.onboarded = true; save(); done(); };
    data('cities.json').catch(() => {});
  };
  step1();
}
