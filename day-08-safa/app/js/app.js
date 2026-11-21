import { S, save, dayKey, getDay } from './store.js';
import { $, icon, toast, closeSheet } from './ui.js';
import { t, applyLang } from './i18n.js';
import * as onboarding from './views/onboarding.js';
import { render as renderToday, renderQibla, renderFlight } from './views/today.js';
import { renderList as quranList, renderReader } from './views/quran.js';
import { renderList as duaList, renderChapter } from './views/duas.js';
import { renderTrack, renderSettings, renderAbout } from './views/track.js';
import { renderMyDuas } from './views/duas.js';
import { renderCalendar } from './views/calendar.js';
import { renderLearnHub, renderSteps, renderLessons } from './views/learn.js';
import { renderKhatm, renderHifz, renderQada } from './views/plan.js';
import { renderAsk } from './views/ask.js';
import { copy, renderHome, renderPlus } from './views/home.js';
import { renderJourney } from './views/journey.js';
import * as PL from './player.js';
import { applyUi } from './a11y.js';

const view = $('#view'), tabbar = $('#tabbar');
const SHORT = { today: 'today', quran: 'quran', qibla: 'qibla' };
const homeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5v10H3zM9 20.5v-7h6v7"/></svg>';
const moreIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>';
const drawTabs = () => {
  const tabs = [
    ['home', copy('Accueil', 'Home', 'الرئيسية'), homeIcon],
    ['today', copy('Prier', 'Pray', 'الصلاة'), icon.today],
    ['quran', t('Quran'), icon.quran],
    ['journey', copy('Apprendre', 'Learn', 'التعلم'), icon.learn],
    ['plus', copy('Plus', 'More', 'المزيد'), moreIcon],
  ];
  tabbar.innerHTML = tabs.map(([key, label, graphic]) => `<a href="#/${key}" data-tab="${key}">${graphic}<span>${label}</span></a>`).join('');
  tabbar.setAttribute('aria-label', t('Main'));
};
applyLang(); applyUi(); drawTabs();
window.addEventListener('safa:lang', event => {
  const active = tabbar.querySelector('[aria-current]')?.dataset.tab;
  drawTabs();
  if (event.detail?.tabsOnly && active) tabbar.querySelector(`[data-tab="${active}"]`)?.setAttribute('aria-current', 'page');
  else route();
});

let cleanup = null, token = 0;
let lastRoute = location.hash;
const scrollPositions = new Map();
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
async function route() {
  const my = ++token;
  if (typeof cleanup === 'function') { try { cleanup(); } catch (e) { /* ignore */ } } cleanup = null; closeSheet();
  view.onclick = null; view.onchange = null;
  const current = location.hash;
  if (lastRoute !== current) {
    scrollPositions.set(lastRoute, window.scrollY);
    lastRoute = current;
  }
  const [name, a, b, c3] = current.replace(/^#\/?/, '').split('/');
  if (!S.since && S.loc) {
    const days = Object.keys(S.days).sort();
    S.since = days[0] || dayKey();
    save();
  }

  const tab = {
    today: 'today', qibla: 'today', setup: 'today', quran: 'quran', khatm: 'quran', hifz: 'quran',
    journey: 'journey', learn: 'journey', lessons: 'journey', ask: 'journey',
    plus: 'plus', flight: 'plus', calendar: 'plus', duas: 'plus', mydua: 'plus', track: 'plus',
    qada: 'plus', settings: 'plus', about: 'plus',
  }[name] || 'home';
  document.body.className = name === 'qibla' ? 'dark' : '';
  applyUi();
  if (name === 'qibla') document.querySelector('meta[name=theme-color]').content = '#080808';
  tabbar.hidden = false;
  drawMini();
  for (const anchor of tabbar.querySelectorAll('a')) {
    if (anchor.dataset.tab === tab) anchor.setAttribute('aria-current', 'page');
    else anchor.removeAttribute('aria-current');
  }
  let c;
  try {
    const needsCity = ['today', 'qibla', 'track'].includes(name);
    if (name === 'welcome' || name === 'setup' || (needsCity && !S.loc)) {
      const destination = needsCity ? current : '#/today';
      c = onboarding.render(view, () => {
        if (location.hash === destination) route();
        else location.hash = destination;
      }, { startAtCity: name === 'setup' || needsCity });
    } else if (name === 'plus') c = renderPlus(view, a);
    else if (name === 'qibla') c = renderQibla(view);
    else if (name === 'flight') c = renderFlight(view);
    else if (name === 'quran') c = a && a !== 'favorites' ? await renderReader(view, a, b, c3) : await quranList(view, a);
    else if (name === 'calendar') c = renderCalendar(view);
    else if (name === 'journey') c = await renderJourney(view, a, b);
    else if (name === 'learn') c = a ? renderSteps(view, a, b) : renderLearnHub(view);
    else if (name === 'lessons') c = await renderLessons(view);
    else if (name === 'khatm') c = await renderKhatm(view);
    else if (name === 'hifz') c = await renderHifz(view);
    else if (name === 'qada') c = renderQada(view);
    else if (name === 'ask') c = await renderAsk(view);
    else if (name === 'mydua') c = renderMyDuas(view, a);
    else if (name === 'duas') c = a && a !== 'favorites' ? await renderChapter(view, a) : await duaList(view, a);
    else if (name === 'track') c = renderTrack(view);
    else if (name === 'settings') c = await renderSettings(view);
    else if (name === 'about') c = renderAbout(view);
    else if (name === 'today') c = renderToday(view);
    else c = renderHome(view);
  } catch (e) {
    console.error(e);
    const message = navigator.onLine
      ? copy('Cet écran n’a pas pu se charger.', 'This screen could not load.', 'تعذر تحميل هذه الصفحة.')
      : copy('Ce contenu n’est pas encore disponible hors ligne.', 'This content is not yet available offline.', 'هذا المحتوى غير متاح بعد دون اتصال.');
    view.innerHTML = `<p class="pad" role="alert">${message}</p><div class="row2 pad"><button class="btn sm" id="route-retry">${t('Try again')}</button><a class="btn line sm" href="#/home">${copy('Accueil','Home','الرئيسية')}</a></div>`;
    view.querySelector('#route-retry').onclick = route;
  }
  if (my !== token) return;
  cleanup = c;
  const heading = view.querySelector('h1, header.sub b, .onb h2');
  if (heading && document.activeElement?.closest('#view, #tabbar')) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
  if (!(name === 'quran' && a && a !== 'favorites') && !(name === 'journey' && a === 'facts' && b) && !(name === 'plus' && a === 'favorites')) {
    window.scrollTo(0, scrollPositions.get(current) || 0);
  }
}
// Mini player: recitation keeps going while you browse other tabs.
const mini = document.createElement('div'); mini.id = 'mini'; mini.hidden = true; document.body.appendChild(mini);
function drawMini() {
  const inReader = /^#\/quran\/\d+/.test(location.hash);
  if (PL.P.v == null || PL.P.word || inReader) { mini.hidden = true; document.body.classList.remove('hasmini'); return; }
  mini.hidden = false; document.body.classList.add('hasmini');
  mini.innerHTML = `<a href="#/quran/${PL.P.s}/${Math.max(1, PL.P.v)}"><span class="mono">${t('Now reciting')}</span><b>${PL.P.name} · ${PL.P.s}:${PL.P.v || 1}</b></a><button class="pbtn sm" id="mpp" aria-label="${t(PL.isPlaying() ? 'Pause' : 'Play')}">${PL.isPlaying() ? icon.pause : icon.play}</button><button class="ib" id="mst" aria-label="${t('Stop')}">${icon.stop}</button>`;
}
mini.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.id === 'mpp') PL.toggle(); if (b.id === 'mst') PL.stop(); });
PL.onChange(drawMini);
// Links from the landing can carry ?lang=ar (or fr, en) for a first visit.
{ const q = new URLSearchParams(location.search).get('lang'); if (!S.onboarded && ['fr', 'en', 'ar'].includes(q)) { S.lang = q; save(); applyLang(); drawTabs(); } }
window.addEventListener('hashchange', route);
route();

// Recompute Today when the app comes back to the foreground (new day, new prayer).
document.addEventListener('visibilitychange', () => { if (!document.hidden && ['', '#/home', '#/today'].includes(location.hash)) route(); });

// Evening check-in: only while the app is open. The calendar file is the reliable path.
setInterval(async () => {
  if (!S.onboarded || !S.rem.on || !S.loc) return;
  const now = new Intl.DateTimeFormat('en-GB', { timeZone: S.loc.tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()), k = dayKey();
  if (now < S.rem.t || S.rem.last === k || getDay(k).pz) return;
  S.rem.last = k; save();
  const body = t('Evening adhkar. A few verses. Tick today.');
  try { const reg = await navigator.serviceWorker.getRegistration(); if (reg && Notification.permission === 'granted') { reg.showNotification('safa.', { body, icon: 'icons/icon-192.png', tag: 'safa-evening' }); return; } } catch (e) { /* fall through */ }
  toast(body);
}, 30000);

if ('serviceWorker' in navigator) {
  const warm = () => { const c = navigator.serviceWorker.controller; if (c) c.postMessage('warm'); };
  window.addEventListener('load', () => setTimeout(() => ('requestIdleCallback' in window ? requestIdleCallback(warm, { timeout: 8000 }) : warm()), 2500));
  navigator.serviceWorker.addEventListener('controllerchange', () => setTimeout(warm, 3000));
}
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').then(reg => {
  reg.addEventListener('updatefound', () => { const w = reg.installing; if (!w) return; w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) {
    const b = document.createElement('button'); b.className = 'updbar'; b.textContent = t('A new version of safa. is ready · Reload'); b.onclick = () => location.reload(); document.body.appendChild(b); } }); });
}).catch(() => {}));
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
