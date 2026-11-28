import { S, save, dayKey, getDay } from './store.js';
import { $, icon, toast, closeSheet } from './ui.js';
import { t, applyLang, uiLanguage } from './i18n.js';
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
import { renderJourney, renderFavorites } from './views/journey.js';
import * as PL from './player.js';
import { applyUi } from './a11y.js';

const view = $('#view'), tabbar = $('#tabbar');
const SHORT = { today: 'today', quran: 'quran', qibla: 'qibla' };
const drawTabs = () => {
  const tabs = [
    ['home', copy('Accueil', 'Home', 'الرئيسية'), icon.home],
    ['today', copy('Prier', 'Pray', 'الصلاة'), icon.today],
    ['quran', t('Quran'), icon.quran],
    ['journey', copy('Apprendre', 'Learn', 'التعلم'), icon.learn],
    ['plus', copy('Menu', 'Menu', 'القائمة'), icon.more],
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
let enteredRoute;
let entrance;
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
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
    plus: 'plus', favorites: 'plus', flight: 'plus', calendar: 'plus', duas: 'plus', mydua: 'plus', track: 'plus',
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
  view.dataset.screen = tab;
  let c;
  try {
    const needsCity = ['qibla', 'track'].includes(name);
    if (name === 'welcome' || name === 'setup' || (needsCity && !S.loc)) {
      const destination = needsCity ? current : '#/today';
      c = onboarding.render(view, () => {
        if (location.hash === destination) route();
        else location.hash = destination;
      }, { startAtCity: name === 'setup' || needsCity });
    } else if (name === 'today' && !S.loc) c = renderNoCity(view);
    else if (name === 'plus') c = renderPlus(view, a);
    else if (name === 'favorites') c = await renderFavorites(view, a);
    else if (name === 'qibla') c = renderQibla(view);
    else if (name === 'flight') c = renderFlight(view);
    else if (name === 'quran') c = a && a !== 'favorites' && a !== 'hizb' ? await renderReader(view, a, b, c3) : await quranList(view, a);
    else if (name === 'calendar') c = renderCalendar(view);
    else if (name === 'journey') c = await renderJourney(view, a, b);
    else if (name === 'learn') c = a ? renderSteps(view, a, b) : renderLearnHub(view);
    else if (name === 'lessons') c = await renderLessons(view);
    else if (name === 'khatm') c = await renderKhatm(view);
    else if (name === 'hifz') c = await renderHifz(view);
    else if (name === 'qada') c = renderQada(view);
    else if (name === 'ask') c = await renderAsk(view);
    else if (name === 'mydua') c = renderMyDuas(view, a);
    else if (name === 'duas') c = a && a !== 'favorites' ? await renderChapter(view, a, b) : await duaList(view, a);
    else if (name === 'track') c = renderTrack(view);
    else if (name === 'settings') c = await renderSettings(view, a);
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
    // Back online: try again by itself, once.
    if (!navigator.onLine) window.addEventListener('online', () => { if (location.hash === current) route(); }, { once: true });
  }
  if (my !== token) { if (typeof c === 'function') { try { c(); } catch (e) { /* stale screen */ } } return; }
  cleanup = c;
  if (enteredRoute !== current) {
    entrance?.cancel();
    if (!motionPreference.matches && !document.documentElement.classList.contains('rm') && view.animate) {
      entrance = view.animate(
        [{ opacity: .66, translate: '0 7px' }, { opacity: 1, translate: '0 0' }],
        { duration: 210, easing: 'cubic-bezier(.2,.75,.25,1)' }
      );
    }
    enteredRoute = current;
  }
  decorateToggles(view);
  { const h = view.querySelector('h1, header.sub b, .onb h2'); const name2 = h ? h.textContent.trim() : ''; document.title = name2 && !/^safa\.?$/.test(name2) ? `${name2} · safa.` : 'safa.'; }
  const heading = view.querySelector('h1, header.sub b, .onb h2');
  if (heading && document.activeElement?.closest('#view, #tabbar')) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
  if (!(name === 'quran' && a && a !== 'favorites') && !(name === 'journey' && (a === 'facts' || a === 'faq') && b) && !(name === 'plus' && a === 'favorites')) {
    window.scrollTo(0, scrollPositions.get(current) || 0);
  }
}
// Every switch shows its state in words, not only by position or colour.
function decorateToggles(root) {
  root.querySelectorAll('label.tog input[type=checkbox]').forEach(inp => {
    let st = inp.parentElement.querySelector('.tstate');
    if (!st) { st = document.createElement('span'); st.className = 'tstate mono'; st.setAttribute('aria-hidden', 'true'); inp.before(st); }
    st.textContent = inp.checked ? copy('Activé', 'On', 'مفعل') : copy('Désactivé', 'Off', 'متوقف');
  });
}
document.addEventListener('change', e => { if (e.target.matches?.('label.tog input[type=checkbox]')) decorateToggles(e.target.closest('label').parentElement); });
new MutationObserver(() => { document.querySelectorAll('.sheet-wrap').forEach(decorateToggles); }).observe(document.body, { childList: true });
// Prayer tab without a city: the guide stays reachable here.
function renderNoCity(root) {
  root.innerHTML = `<header class="vh"><div><h1>${copy('Prier', 'Pray', 'الصلاة')}</h1></div></header>
    <section class="card stack"><b>${copy('Choisis ta ville pour afficher tes horaires.', 'Choose your city to see your prayer times.', 'اختر مدينتك لعرض مواقيتك.')}</b>
      <p class="muted small">${t('Used on this device to compute prayer times and the Qibla. It is never sent anywhere.')}</p>
      <a class="btn" href="#/setup">${t('Set my city')}</a></section>
    <h2 class="sect">${copy('En attendant', 'Meanwhile', 'وفي الأثناء')}</h2>
    <div class="home-quick">
      <a class="home-row" href="#/journey/prayer"><span class="home-symbol" aria-hidden="true">${icon.prayerMat}</span><span><strong>${copy('Apprendre à prier', 'Learn to pray', 'تعلم الصلاة')}</strong><small>${copy('Gestes et paroles, rakʿa par rakʿa', 'Postures and words, unit by unit', 'الهيئات والأذكار ركعة ركعة')}</small></span>${icon.chev}</a>
      <a class="home-row" href="#/learn/wudu"><span class="home-symbol" aria-hidden="true">${icon.droplet}</span><span><strong>${t('Ablution (wudu)')}</strong></span>${icon.chev}</a>
    </div>`;
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
{ const url = new URL(location.href); const q = url.searchParams.get('lang'); if (uiLanguage(q)) { S.lang = q; save(); url.searchParams.delete('lang'); history.replaceState(history.state, '', url); applyLang(); drawTabs(); } }
window.addEventListener('hashchange', route);
// Ctrl+K (or Cmd+K) opens the search from any screen.
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (location.hash !== '#/ask') location.hash = '#/ask'; else document.querySelector('#aq')?.focus(); } });
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
    const b = document.createElement('button'); b.className = 'updbar'; b.setAttribute('role', 'status'); b.textContent = t('A new version of safa. is ready · Reload'); b.onclick = () => location.reload(); document.body.appendChild(b); } }); });
}).catch(() => {}));
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
