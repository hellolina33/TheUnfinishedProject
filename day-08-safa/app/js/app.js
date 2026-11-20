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
import * as PL from './player.js';
import { applyUi } from './a11y.js';

const view = $('#view'), tabbar = $('#tabbar');
const SHORT = { today: 'today', quran: 'quran', qibla: 'qibla' };
const TABS = [['today', 'Today'], ['quran', 'Quran'], ['duas', 'Duas'], ['track', 'Track']];
const drawTabs = () => { tabbar.innerHTML = TABS.map(([k, l]) => `<a href="#/${k}" data-tab="${k}">${icon[k]}${t(l)}</a>`).join(''); tabbar.setAttribute('aria-label', t('Main')); };
applyLang(); applyUi(); drawTabs();
window.addEventListener('safa:lang', () => { drawTabs(); route(); });

let cleanup = null, token = 0;
async function route() {
  const my = ++token;
  if (typeof cleanup === 'function') { try { cleanup(); } catch (e) { /* ignore */ } } cleanup = null; closeSheet();
  view.onclick = null; view.onchange = null;
  if (!S.onboarded || !S.loc) {
    tabbar.hidden = true; document.body.className = 'bare'; mini.hidden = true;
    onboarding.render(view, () => { route(); });
    return;
  }
  if (!S.since) { const ks = Object.keys(S.days).sort(); S.since = ks[0] || dayKey(); save(); }
  const [name = 'today', a, b, c3] = location.hash.replace(/^#\/?/, '').split('/');
  const tab = { today: 'today', qibla: 'today', flight: 'today', calendar: 'today', learn: 'today', quran: 'quran', khatm: 'quran', hifz: 'quran', lessons: 'quran', ask: 'quran', duas: 'duas', mydua: 'duas', track: 'track', qada: 'track', settings: 'track', about: 'track' }[name] || 'today';
  const immersive = (name === 'quran' && a) || name === 'qibla';
  document.body.className = name === 'qibla' ? 'dark bare' : immersive ? 'bare' : '';
  applyUi(); if (name === 'qibla') document.querySelector('meta[name=theme-color]').content = '#080808';
  tabbar.hidden = !!immersive; drawMini();
  tabbar.querySelectorAll('a').forEach(x => x.dataset.tab === tab ? x.setAttribute('aria-current', 'page') : x.removeAttribute('aria-current'));
  let c;
  try {
    if (name === 'qibla') c = renderQibla(view);
    else if (name === 'flight') c = renderFlight(view);
    else if (name === 'quran') c = a ? await renderReader(view, a, b, c3) : await quranList(view);
    else if (name === 'calendar') c = renderCalendar(view);
    else if (name === 'learn') c = a ? renderSteps(view, a) : renderLearnHub(view);
    else if (name === 'lessons') c = await renderLessons(view);
    else if (name === 'khatm') c = await renderKhatm(view);
    else if (name === 'hifz') c = await renderHifz(view);
    else if (name === 'qada') c = renderQada(view);
    else if (name === 'ask') c = await renderAsk(view);
    else if (name === 'mydua') c = renderMyDuas(view, a);
    else if (name === 'duas') c = a ? await renderChapter(view, a) : await duaList(view);
    else if (name === 'track') c = renderTrack(view);
    else if (name === 'settings') c = renderSettings(view);
    else if (name === 'about') c = renderAbout(view);
    else c = renderToday(view);
  } catch (e) {
    console.error(e);
    view.innerHTML = `<p class="muted pad">${t('This screen could not load. If you are offline, open it once with a connection and it will stay available.')}</p><div class="row2 pad"><button class="btn sm" onclick="location.reload()">${t('Try again')}</button><a class="btn line sm" href="#/today">${t('Back to Today')}</a></div>`;
  }
  if (my !== token) { if (typeof c === 'function') c(); return; }
  cleanup = c;
  if (!(name === 'quran' && a)) window.scrollTo(0, 0);
}
// Mini player: recitation keeps going while you browse other tabs.
const mini = document.createElement('div'); mini.id = 'mini'; mini.hidden = true; document.body.appendChild(mini);
function drawMini() {
  const inReader = /^#\/quran\/\d+/.test(location.hash);
  if (PL.P.v == null || PL.P.word || inReader || !S.onboarded) { mini.hidden = true; document.body.classList.remove('hasmini'); return; }
  mini.hidden = false; document.body.classList.add('hasmini');
  mini.innerHTML = `<a href="#/quran/${PL.P.s}/${Math.max(1, PL.P.v)}"><span class="mono">${t('Now reciting')}</span><b>${PL.P.name} · ${PL.P.s}:${PL.P.v || 1}</b></a><button class="pbtn sm" id="mpp" aria-label="${t(PL.isPlaying() ? 'Pause' : 'Play')}">${PL.isPlaying() ? icon.pause : icon.play}</button><button class="ib" id="mst" aria-label="${t('Stop')}">${icon.stop}</button>`;
}
mini.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.id === 'mpp') PL.toggle(); if (b.id === 'mst') PL.stop(); });
PL.onChange(drawMini);
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
  const body = t('Evening adhkar. A few verses. Tick today.');
  try { const reg = await navigator.serviceWorker.getRegistration(); if (reg && Notification.permission === 'granted') { reg.showNotification('safa.', { body, icon: 'icons/icon-192.png', tag: 'safa-evening' }); return; } } catch (e) { /* fall through */ }
  toast(body);
}, 30000);

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
