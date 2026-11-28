import { S, save, dayKey, addDays, P5 } from '../store.js';
import { esc, icon, toast } from '../ui.js';
import { lang, t, applyLang, LANGUAGES, local, localField } from '../i18n.js';
import { timesFor, NAMES, fmtTime, weekday } from '../prayer.js';
import { isRamadan } from './calendar.js';
import { hifzDue } from './plan.js';
import { verseText } from './quran.js';

// One verse for everyone, changing every day.
const DAILY = [[2, 255], [2, 286], [13, 28], [94, 5], [2, 152], [2, 186], [65, 3], [39, 53], [3, 139], [2, 45], [40, 60], [29, 69], [7, 56], [17, 24], [25, 74], [14, 7], [49, 13], [20, 114], [93, 5], [21, 87], [3, 173], [9, 51], [8, 46], [11, 88], [18, 10], [55, 13], [59, 22], [112, 1], [99, 7], [3, 8]];
export const verseOfDay = () => DAILY[Math.floor(Date.parse(dayKey() + 'T12:00:00Z') / 86400000) % DAILY.length];
// What fits this moment of the day: one card, never more.
function momentCard(np) {
  const T = S.loc ? timesFor(dayKey()) : null, now = Date.now(), fri = weekday(now) === 'Friday';
  if (S.profile === 'back' && (S.visits || 0) <= 7) return link('journey/return', t('Coming back, at your pace'), icon.pathway, t('One prayer at a time. No catching up all at once.'));
  if (isRamadan()) return link('today', t('Ramadan · today'), icon.moon, T ? t('Fast begins {a} · breaks at {b}', { a: fmtTime(T.fajr), b: fmtTime(T.maghrib) }) : t('Choose a city for the fasting times'));
  if (fri) return link('quran/18', t('Friday · Jumuʿa'), icon.quran, t('Al-Kahf, salawat on the Prophet ﷺ, the hour of answered prayer'));
  const due = hifzDue().length;
  if (due) return link('hifz', t('Review today'), icon.repeat, t(due === 1 ? '1 portion to review' : '{n} portions to review', { n: due }));
  if (T && now < T.dhuhr) return link('duas/27', t('Morning remembrance'), icon.duas, t('A few minutes, in Arabic with the meaning'));
  if (T && now >= T.asr && now < T.isha) return link('duas/27', t('Evening remembrance'), icon.duas, t('A few minutes, in Arabic with the meaning'));
  if (T && now >= T.isha) return link('duas/28', t('Before sleeping'), icon.moon, t('Short duas for the night'));
  return '';
}

export const copy = local;

const link = (href, title, graphic, detail = '', extra = '') => `
  <a class="home-row" href="#/${href}">
    <span class="home-symbol" aria-hidden="true">${graphic}</span><span><strong>${esc(title)}</strong>${detail ? `<small>${esc(detail)}</small>` : ''}</span>
    ${extra || icon.chev}
  </a>`;

const group = (title, content, extra = '') => `<section class="home-group"><h2>${title}</h2>${extra}${content}</section>`;

// Every tool the app has. Two can be pinned to Home; all of them stay in the Menu.
export const TOOLS = () => ({
  duas: ['duas', t('Duas'), icon.duas],
  qibla: ['qibla', t('Qibla'), icon.compass],
  tasbih: ['tasbih', t('Tasbih'), icon.repeat],
  calendar: ['calendar', t('Calendar'), icon.cal],
  flight: ['flight', t('Travel'), icon.bag],
  track: ['track', t('Track'), icon.track],
  qada: ['qada', t('Make-up prayers'), icon.repeat],
  khatm: ['khatm', t('Khatm'), icon.book],
  ramadan: ['journey/ramadan', copy('Ramadan', 'Ramadan', 'رمضان'), icon.moon],
  ask: ['ask', t('Find'), icon.search],
});
const pins = () => (Array.isArray(S.pins) ? S.pins : ['duas', 'qibla']).filter(k => TOOLS()[k]).slice(0, 2);

// Moments that touch on grief, illness or separation never come back on Home by themselves.
export const SENSITIVE = ['bereavement', 'illness', 'separation', 'end-of-life', 'return', 'cycle', 'pregnancy'];

function nextPrayer() {
  const today = dayKey(), times = timesFor(today), now = Date.now();
  const next = P5.find(key => times[key] > now);
  if (next) return { k: next, at: times[next], tomorrow: false };
  return { k: 'fajr', at: timesFor(addDays(today, 1)).fajr, tomorrow: true };
}
export function inMinutes(ms) {
  const m = Math.max(0, Math.ceil((ms - Date.now()) / 60000));
  if (m < 1) return copy('dans moins d’une minute', 'in under a minute', 'خلال أقل من دقيقة');
  if (m < 60) return t('in {m} min', { m });
  return t('in {h} h {m}', { h: Math.floor(m / 60), m: String(m % 60).padStart(2, '0') });
}
const feature = (href, title, graphic, cover, detail = '') => `
  <a class="home-feature home-feature--${cover}" href="#/${href}">
    <img src="illustrations/covers/${cover}.webp" alt="" width="384" height="384" decoding="async">
    <span class="feature-body"><span class="feature-icon">${graphic}</span><strong>${esc(title)}</strong>${detail ? `<small>${esc(detail)}</small>` : ''}</span>
    <span class="feature-arrow">${icon.chev}</span>
  </a>`;

function resumeCard() {
  const c = [];
  const q = S.q.last;
  if (q?.s) c.push({ at: q.at || 1, html: feature(`quran/${q.s}/${q.v || 1}`, copy('Continuer ma lecture', 'Continue reading', 'متابعة القراءة'), icon.quran, 'quran',
    `${q.n || ''}${q.n ? ' · ' : ''}${copy('verset', 'verse', 'آية')} ${q.v || 1} (\u2066${q.s}:${q.v || 1}\u2069)`) });
  const j = S.journeyRecent;
  if (j?.id && !SENSITIVE.includes(j.id) && !(S.journeyDone || {})[j.id]) c.push({ at: j.at || 0, html: feature(`journey/${j.id}`, copy('Reprendre mon parcours', 'Resume my journey', 'متابعة مساري'), icon.pathway, 'learn', localField(j.title) || '') });
  const g = S.guideRecent;
  if (g?.href) c.push({ at: g.at || 0, guide: true, html: feature(g.href, copy('Reprendre le guide', 'Resume the guide', 'متابعة الدليل'), icon.prayerMat, 'prayer', localField(g.title) || '') });
  c.sort((a, b) => b.at - a.at);
  return c[0];
}

const homeCleanup = new WeakMap();

export function renderHome(root) {
  homeCleanup.get(root)?.();
  const today = dayKey();
  if (S.homeDay !== today) { S.homeDay = today; S.visits = (S.visits || 0) + 1; save(); }
  const early = S.profile === 'new' || (S.profile !== 'regular' && (S.visits || 0) <= 5);
  const learn = feature('journey/prayer', copy('Apprendre à prier', 'Learn to pray', 'تعلم الصلاة'), icon.prayerMat, 'prayer', copy('Gestes et paroles, rakʿa par rakʿa', 'Postures and words, unit by unit', 'الهيئات والأذكار ركعة ركعة'));
  const resume = resumeCard();
  const read = feature('quran/1', t('Read Al-Fatiha'), icon.quran, 'quran');
  const quick = !resume ? [learn, read] : resume.guide ? [resume.html, read] : early ? [learn, resume.html] : [resume.html, learn];
  const np = S.loc ? nextPrayer() : null;
  const tone = np && ['maghrib','isha'].includes(np.k) ? 'dusk' : '';
  const pinned = pins();
  const T = TOOLS();
  const hero = np
    ? `<a class="home-hero ${tone}" href="#/today" id="home-hero">
        <div><p>${copy('Prochaine prière', 'Next prayer', 'الصلاة القادمة')} · ${esc(S.loc.name)}</p>
          <h2>${NAMES[np.k]}${np.tomorrow ? ` <span class="tmw">${copy('demain', 'tomorrow', 'غدًا')}</span>` : ''}<bdi class="hero-time">${fmtTime(np.at)}</bdi></h2>
          <p class="hero-in" id="hero-in">${inMinutes(np.at)}</p></div>
        <img src="illustrations/covers/arch.webp" alt="" width="960" height="640" fetchpriority="high">
        <span class="hero-chev">${icon.chev}</span></a>`
    : `<a class="home-hero" href="#/today" id="home-hero"><div><p>${copy('Horaires de prière', 'Prayer times', 'مواقيت الصلاة')}</p>
        <h2>${copy('Choisis une ville', 'Choose a city', 'اختر مدينة')}</h2><p>${copy('pour afficher tes horaires', 'to see your times', 'لعرض المواقيت')}</p></div>
        <img src="illustrations/covers/arch.webp" alt="" width="960" height="640" fetchpriority="high"><span class="hero-chev">${icon.chev}</span></a>`;
  root.innerHTML = `
    <header class="home-head"><h1>safa<span>.</span></h1>
      <a class="ib home-lang" href="#/settings/lang" aria-label="${copy('Langue', 'Language', 'اللغة')}">${icon.globe}</a>
    </header>
    ${np ? `<a class="home-sticky" id="home-sticky" href="#/today" aria-hidden="true" tabindex="-1"><b>${NAMES[np.k]}</b><span class="mono">${fmtTime(np.at)}</span><span id="sticky-in">${inMinutes(np.at)}</span></a>` : ''}
    ${hero}
    ${navigator.onLine ? '' : `<p class="home-offline" role="status">${copy('Hors ligne. Les horaires, les guides et les sourates déjà ouvertes restent disponibles.', 'Offline. Prayer times, guides and surahs you already opened stay available.', 'دون اتصال. تبقى المواقيت والأدلة والسور التي فتحتها متاحة.')}</p>`}
    <div class="home-quick">${quick.join('')}</div>
    <div class="home-moment">${momentCard(np)}</div>
    <a class="home-votd card" id="votd" href="#/quran/${verseOfDay()[0]}/${verseOfDay()[1]}"><span class="mono">${t('Verse of the day')} · <bdi>${verseOfDay()[0]}:${verseOfDay()[1]}</bdi></span><p class="ar" lang="ar" dir="rtl"></p><p class="votd-tr"></p></a>
    ${group(copy('Apprendre et pratiquer', 'Learn and practise', 'تعلم ومارس'),
      link('journey', t('Through life'), icon.pathway) +
      link('learn/wudu', t('Ablution (wudu)'), icon.droplet) +
      link('journey/faq', copy('Questions fréquentes', 'Frequently asked questions', 'الأسئلة الشائعة'), icon.help))}
    <section class="home-group" id="home-pins"><h2>${copy('Raccourcis', 'Shortcuts', 'اختصارات')}</h2>
      <div id="pins-undo"></div>
      ${pinned.map(k => `<div class="pin-wrap">${link(T[k][0], T[k][1], T[k][2])}<button class="ib pin-x" data-unpin="${k}" aria-label="${esc(copy('Retirer {x} de l’accueil', 'Remove {x} from Home', 'إزالة {x} من الرئيسية').replace('{x}', T[k][1]))}">${icon.stop}</button></div>`).join('')}
      ${pinned.length < 2 ? `<a class="linkbtn small" href="#/plus">${copy('Épingler un outil depuis le menu', 'Pin a tool from the menu', 'ثبّت أداة من القائمة')}</a>` : `<a class="linkbtn small" href="#/plus">${copy('Tous les outils', 'All tools', 'كل الأدوات')}</a>`}
    </section>`;
  verseText(...verseOfDay()).then(x => { const el = root.querySelector('#votd'); if (!el) return; el.querySelector('.ar').textContent = x.a; el.querySelector('.votd-tr').textContent = x.tr || ''; }).catch(() => root.querySelector('#votd')?.remove());
  let lastUnpin = null;
  root.onclick = e => {
    const x = e.target.closest('[data-unpin]');
    if (x) {
      e.preventDefault();
      const cur = pins(); lastUnpin = [x.dataset.unpin, cur.indexOf(x.dataset.unpin)];
      S.pins = cur.filter(k => k !== x.dataset.unpin); save(); renderHome(root);
      const u = root.querySelector('#pins-undo');
      u.innerHTML = `<div class="card row undo" role="status"><span>${esc(copy('{x} retiré de l’accueil.', '{x} removed from Home.', 'أزيلت {x} من الرئيسية.').replace('{x}', TOOLS()[lastUnpin[0]][1]))}</span><button class="btn line sm" id="pin-undo">${t('Undo')}</button></div>`;
      u.querySelector('#pin-undo').onclick = () => { const p = pins(); p.splice(lastUnpin[1], 0, lastUnpin[0]); S.pins = p.slice(0, 2); save(); renderHome(root); };
      u.querySelector('#pin-undo').focus();
    }
  };
  // Minute countdown, and a compact bar once the big card scrolls out of view.
  let timer = null, io = null;
  if (np) {
    timer = setInterval(() => {
      if (!root.isConnected || !root.querySelector('#hero-in')) return clearInterval(timer);
      if (np.at <= Date.now()) { clearInterval(timer); renderHome(root); return; }
      const txt = inMinutes(np.at); root.querySelector('#hero-in').textContent = txt; const st = root.querySelector('#sticky-in'); if (st) st.textContent = txt;
    }, 20000);
    const sticky = root.querySelector('#home-sticky'), heroEl = root.querySelector('#home-hero');
    if ('IntersectionObserver' in window && sticky && heroEl) {
      io = new IntersectionObserver(([en]) => { const show = !en.isIntersecting && en.boundingClientRect.top < 0; sticky.classList.toggle('on', show); sticky.setAttribute('aria-hidden', String(!show)); sticky.tabIndex = show ? 0 : -1; });
      io.observe(heroEl);
    }
  }
  const off = () => { if (root.querySelector('#home-hero')) renderHome(root); };
  window.addEventListener('online', off); window.addEventListener('offline', off);
  homeCleanup.set(root, () => {
    clearInterval(timer);
    io?.disconnect();
    root.onclick = null;
    window.removeEventListener('online', off);
    window.removeEventListener('offline', off);
  });
  return () => { homeCleanup.get(root)?.(); homeCleanup.delete(root); };
}

export function renderPlus(root, section) {
  const T = TOOLS(), pinned = pins();
  const tool = k => `<div class="pin-wrap">${link(T[k][0], T[k][1], T[k][2])}<button class="ib pin-t" data-pin="${k}" aria-pressed="${pinned.includes(k)}" aria-label="${esc(copy('Épingler {x} sur l’accueil', 'Pin {x} to Home', 'تثبيت {x} في الرئيسية').replace('{x}', T[k][1]))}">${icon.star}</button></div>`;
  root.innerHTML = `<section class="home-plus"><h1>${copy('Menu', 'Menu', 'القائمة')}</h1>
    ${group(copy('Préférences', 'Preferences', 'التفضيلات'), link('settings', t('Settings'), icon.gear, copy('Langue, affichage, horaires, rappels, hors-ligne, données', 'Language, display, times, reminders, offline, data', 'اللغة والعرض والمواقيت والتذكير ودون اتصال والبيانات')) +
      link('setup', copy('Changer de ville', 'Change city', 'تغيير المدينة'), icon.today, S.loc ? S.loc.name : ''))}
    ${group(t('Tools'), Object.keys(T).map(tool).join(''), `<p class="muted small" id="pin-msg" role="status">${copy('Touche l’étoile pour épingler deux outils sur l’accueil.', 'Tap the star to pin two tools to Home.', 'اضغط النجمة لتثبيت أداتين في الرئيسية.')}</p>`)}
    <section id="favorites" class="home-group"><h2>${copy('Mes favoris', 'My favourites', 'مفضلتي')}</h2>
      ${link('favorites', copy('Tous mes favoris', 'All my favourites', 'كل مفضلتي'), icon.bookmark, copy('Versets, douas et guides mis de côté', 'Verses, duas and saved guides', 'آيات وأدعية وأدلة محفوظة'))}
    </section>
    ${group(copy('Aide', 'Help', 'مساعدة'), link('welcome', copy('Revoir le guide de démarrage', 'Review the getting-started guide', 'مراجعة دليل البدء'), icon.guide) + link('journey/sources', t('Our sources and method'), icon.info) + `<button class="home-row sharea" id="shareapp"><span class="home-symbol" aria-hidden="true">${icon.share}</span><span><strong>${t('Share safa.')}</strong><small>${t('A ready-made message for WhatsApp')}</small></span>${icon.chev}</button>` + link('about', t('About'), icon.info))}</section>`;
  root.onclick = e => {
    if (e.target.closest('#shareapp')) { const url = location.origin + location.pathname.replace(/app\/.*$/, ''); const txt = t('I use safa. for prayer times, the Quran with its meaning and duas. Free, no account, no ads, works offline: {u}', { u: url }); (async () => { try { if (navigator.share) await navigator.share({ text: txt }); else { await navigator.clipboard.writeText(txt); toast(t('Message copied')); } } catch (err) { /* cancelled */ } })(); return; }
    const b = e.target.closest('[data-pin]'); if (!b) return;
    e.preventDefault();
    let p = pins(); const k = b.dataset.pin;
    if (p.includes(k)) p = p.filter(x => x !== k);
    else { if (p.length >= 2) p.shift(); p.push(k); }
    S.pins = p; save();
    root.querySelectorAll('[data-pin]').forEach(x => x.setAttribute('aria-pressed', p.includes(x.dataset.pin)));
    root.querySelector('#pin-msg').textContent = p.length ? copy('Sur l’accueil : ', 'On Home: ', 'في الرئيسية: ') + p.map(x => T[x][1]).join(', ') : copy('Aucun raccourci sur l’accueil.', 'No shortcut on Home.', 'لا اختصارات في الرئيسية.');
  };
  if (section === 'favorites') requestAnimationFrame(() => root.querySelector('#favorites')?.scrollIntoView());
  return () => { root.onclick = null; };
}
