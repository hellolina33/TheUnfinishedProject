import { S, save, dayKey, getDay } from './store.js';
import { $, icon, toast, closeSheet } from './ui.js';
import * as onboarding from './views/onboarding.js';
import { render as renderToday, renderQibla, renderFlight } from './views/today.js';
import { renderList as quranList, renderReader } from './views/quran.js';
import { renderList as duaList, renderChapter } from './views/duas.js';
import { renderTrack, renderSettings, renderAbout } from './views/track.js';

const view = $('#view'), tabbar = $('#tabbar');
const TABS = [['today', 'Today'], ['quran', 'Quran'], ['duas', 'Duas'], ['track', 'Track']];
tabbar.innerHTML = TABS.map(([k, l]) => `<a href="#/${k}" data-tab="${k}">${icon[k]}${l}</a>`).join('');

let cleanup = null, token = 0;
async function route() {
  const my = ++token;
  if (typeof cleanup === 'function') { try { cleanup(); } catch (e) { /* ignore */ } } cleanup = null; closeSheet();
  view.onclick = null; view.onchange = null;
  if (!S.onboarded || !S.loc) {
    tabbar.hidden = true; document.body.className = 'bare';
    onboarding.render(view, () => { location.hash = '#/today'; route(); });
    return;
  }
  const [name = 'today', a, b] = location.hash.replace(/^#\/?/, '').split('/');
  const tab = { today: 'today', qibla: 'today', flight: 'today', quran: 'quran', duas: 'duas', track: 'track', settings: 'track', about: 'track' }[name] || 'today';
  const immersive = (name === 'quran' && a) || name === 'qibla';
  document.body.className = (immersive ? 'dark bare' : '');
  document.querySelector('meta[name=theme-color]').content = immersive ? '#080808' : '#ecebe7';
  tabbar.hidden = !!immersive;
  tabbar.querySelectorAll('a').forEach(x => x.dataset.tab === tab ? x.setAttribute('aria-current', 'page') : x.removeAttribute('aria-current'));
  let c;
  try {
    if (name === 'qibla') c = renderQibla(view);
    else if (name === 'flight') c = renderFlight(view);
    else if (name === 'quran') c = a ? await renderReader(view, a, b) : await quranList(view);
    else if (name === 'duas') c = a ? await renderChapter(view, a) : await duaList(view);
    else if (name === 'track') c = renderTrack(view);
    else if (name === 'settings') c = renderSettings(view);
    else if (name === 'about') c = renderAbout(view);
    else c = renderToday(view);
  } catch (e) {
    console.error(e);
    view.innerHTML = `<p class="muted pad">This screen could not load. If you are offline, open it once with a connection and it will stay available.</p><a class="btn line sm" href="#/today">Back to Today</a>`;
  }
  if (my !== token) { if (typeof c === 'function') c(); return; }
  cleanup = c;
  if (!(name === 'quran' && a)) window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
route();

// Recompute Today when the app comes back to the foreground (new day, new prayer).
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.onboarded && /^#?\/?(today)?$/.test(location.hash.replace('#/', ''))) route(); });

// Evening check-in: only while the app is open. The calendar file is the reliable path.
setInterval(async () => {
  if (!S.onboarded || !S.rem.on || !S.loc) return;
  const now = new Intl.DateTimeFormat('en-GB', { timeZone: S.loc.tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()), k = dayKey();
  if (now < S.rem.t || S.rem.last === k || getDay(k).pz) return;
  S.rem.last = k; save();
  const body = 'Evening adhkar. A few verses. Tick today.';
  try { const reg = await navigator.serviceWorker.getRegistration(); if (reg && Notification.permission === 'granted') { reg.showNotification('safa.', { body, icon: 'icons/icon-192.png', tag: 'safa-evening' }); return; } } catch (e) { /* fall through */ }
  toast(body);
}, 30000);

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
