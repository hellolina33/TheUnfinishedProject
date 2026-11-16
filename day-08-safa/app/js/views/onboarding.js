import { S, save, data } from '../store.js';
import { METHODS, methodFor, nearestCity } from '../prayer.js';
import { $, esc, LOGO, cityField, toast } from '../ui.js';

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
      <div class="onb-top"><div class="onb-logo">${LOGO}</div><h1>safa<i>.</i></h1></div>
      <div><p class="onb-tag">Clear time.<br>Clear soul<i>.</i></p>
      <ul class="onb-list"><li>No ads</li><li>No account, no tracking</li><li>Works offline</li></ul></div>
      <button class="btn big" id="go">Set my city</button>
    </section>`;
    $('#go', root).onclick = step2;
  };
  const step2 = () => {
    root.innerHTML = `<section class="onb onb2">
      <div><span class="mono">Step 2 of 2</span><h2>Where do you pray?</h2>
      <p class="muted">Used on this device to compute prayer times and the Qibla. It is never sent anywhere.</p></div>
      <div class="onb-form">
        <button class="btn line big" id="geo">Use my location once</button>
        <div class="or mono">or</div>
        <div id="city"></div>
        <div id="picked" hidden>
          <label class="lbl" for="meth">Calculation method</label>
          <select id="meth" class="inp">${Object.entries(METHODS).map(([k, m]) => `<option value="${k}">${esc(m.n)} · ${esc(m.d)}</option>`).join('')}</select>
          <p class="muted small">Pre-selected for your country. You can change it any time.</p>
        </div>
      </div>
      <button class="btn big" id="done" disabled>Show today's times</button>
    </section>`;
    const picked = () => { $('#picked', root).hidden = false; $('#meth', root).value = S.method; $('#done', root).disabled = false; };
    const inp = cityField($('#city', root), { placeholder: 'Type your city', onPick: c => { setLocation(c); picked(); } });
    $('#geo', root).onclick = async e => {
      e.target.textContent = 'Locating…';
      try { await locateOnce(); inp.value = S.loc.name; picked(); e.target.textContent = 'Location set · ' + S.loc.name; }
      catch (err) { e.target.textContent = 'Use my location once'; toast('Location unavailable. Type your city instead.'); inp.focus(); }
    };
    $('#meth', root).onchange = e => { S.method = e.target.value; save(); };
    $('#done', root).onclick = () => { S.onboarded = true; save(); done(); };
    data('cities.json').catch(() => {});
  };
  step1();
}
