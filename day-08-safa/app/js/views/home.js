import { S, save, dayKey, addDays, P5 } from '../store.js';
import { esc, icon } from '../ui.js';
import { lang, t, applyLang } from '../i18n.js';
import { timesFor, NAMES, fmtTime } from '../prayer.js';

export const copy = (fr, en, ar) => ({ fr, en, ar })[lang()];

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
// The illustration follows the time of day: morning light, then dusk for Maghrib and Isha.
function cover(k) {
  if (k === 'maghrib' || k === 'isha') return ['prayer', 'dusk'];
  if (k === 'asr') return ['prayer', ''];
  return ['morning', ''];
}

function resumeCard() {
  const c = [];
  const q = S.q.last;
  if (q?.s) c.push({ at: q.at || 1, html: link(`quran/${q.s}/${q.v || 1}`, copy('Continuer ma lecture', 'Continue reading', 'متابعة القراءة'), icon.quran,
    `${q.n || ''}${q.n ? ' · ' : ''}${copy('verset', 'verse', 'آية')} ${q.v || 1} (\u2066${q.s}:${q.v || 1}\u2069)`) });
  const j = S.journeyRecent;
  if (j?.id && !SENSITIVE.includes(j.id) && !(S.journeyDone || {})[j.id]) c.push({ at: j.at || 0, html: link(`journey/${j.id}`, copy('Reprendre mon parcours', 'Resume my journey', 'متابعة مساري'), icon.pathway, j.title?.[lang()] || '') });
  const g = S.guideRecent;
  if (g?.href) c.push({ at: g.at || 0, html: link(g.href, copy('Reprendre le guide', 'Resume the guide', 'متابعة الدليل'), icon.prayerMat, g.title?.[lang()] || '') });
  c.sort((a, b) => b.at - a.at);
  return c[0]?.html || '';
}

export function renderHome(root) {
  const today = dayKey();
  if (S.homeDay !== today) { S.homeDay = today; S.visits = (S.visits || 0) + 1; save(); }
  const early = (S.visits || 0) <= 5;
  const learn = link('journey/prayer', copy('Apprendre à prier', 'Learn to pray', 'تعلم الصلاة'), icon.prayerMat, copy('Gestes et paroles, rakʿa par rakʿa', 'Postures and words, unit by unit', 'الهيئات والأذكار ركعة ركعة'));
  const resume = resumeCard();
  const quick = early ? [learn, resume || link('quran/1', t('Read Al-Fatiha'), icon.quran)] : [resume || learn, resume ? learn : link('quran/1', t('Read Al-Fatiha'), icon.quran)];
  const np = S.loc ? nextPrayer() : null;
  const [img, tone] = cover(np?.k);
  const pinned = pins();
  const T = TOOLS();
  const hero = np
    ? `<a class="home-hero ${tone}" href="#/today" id="home-hero">
        <div><p>${copy('Prochaine prière', 'Next prayer', 'الصلاة القادمة')} · ${esc(S.loc.name)}</p>
          <h2>${NAMES[np.k]}${np.tomorrow ? ` <span class="tmw">${copy('demain', 'tomorrow', 'غدًا')}</span>` : ''} · <span class="mono">${fmtTime(np.at)}</span></h2>
          <p class="hero-in" id="hero-in">${inMinutes(np.at)}</p></div>
        <img src="illustrations/covers/${img}.webp" alt="" width="140" height="165">
        <span class="hero-chev">${icon.chev}</span></a>`
    : `<a class="home-hero" href="#/today" id="home-hero"><div><p>${copy('Horaires de prière', 'Prayer times', 'مواقيت الصلاة')}</p>
        <h2>${copy('Choisis une ville', 'Choose a city', 'اختر مدينة')}</h2><p>${copy('pour afficher tes horaires', 'to see your times', 'لعرض المواقيت')}</p></div>
        <img src="illustrations/covers/morning.webp" alt="" width="140" height="165"><span class="hero-chev">${icon.chev}</span></a>`;
  root.innerHTML = `
    <header class="home-head"><h1>safa<span>.</span></h1>
      <label class="home-language">${icon.globe}<span class="visually-hidden">${copy('Langue', 'Language', 'اللغة')}</span>
      <select id="home-language" class="inp">${[['fr','Français'],['en','English'],['ar','العربية']].map(([id, label]) =>
        `<option value="${id}" ${lang() === id ? 'selected' : ''}>${label}</option>`).join('')}</select>${icon.down}</label>
    </header>
    ${np ? `<a class="home-sticky" id="home-sticky" href="#/today" aria-hidden="true" tabindex="-1"><b>${NAMES[np.k]}</b><span class="mono">${fmtTime(np.at)}</span><span id="sticky-in">${inMinutes(np.at)}</span></a>` : ''}
    ${hero}
    ${navigator.onLine ? '' : `<p class="home-offline" role="status">${copy('Hors ligne. Les horaires, les guides et les sourates déjà ouvertes restent disponibles.', 'Offline. Prayer times, guides and surahs you already opened stay available.', 'دون اتصال. تبقى المواقيت والأدلة والسور التي فتحتها متاحة.')}</p>`}
    <div class="home-quick">${quick.join('')}</div>
    ${group(copy('Apprendre et pratiquer', 'Learn and practise', 'تعلم ومارس'),
      link('journey', t('Through life'), icon.pathway) +
      link('learn/wudu', t('Ablution (wudu)'), icon.droplet) +
      link('journey/faq', copy('Questions fréquentes', 'Frequently asked questions', 'الأسئلة الشائعة'), icon.help))}
    <section class="home-group" id="home-pins"><h2>${copy('Raccourcis', 'Shortcuts', 'اختصارات')}</h2>
      <div id="pins-undo"></div>
      ${pinned.map(k => `<div class="pin-wrap">${link(T[k][0], T[k][1], T[k][2])}<button class="ib pin-x" data-unpin="${k}" aria-label="${esc(copy('Retirer {x} de l’accueil', 'Remove {x} from Home', 'إزالة {x} من الرئيسية').replace('{x}', T[k][1]))}">${icon.stop}</button></div>`).join('')}
      ${pinned.length < 2 ? `<a class="linkbtn small" href="#/plus">${copy('Épingler un outil depuis le menu', 'Pin a tool from the menu', 'ثبّت أداة من القائمة')}</a>` : `<a class="linkbtn small" href="#/plus">${copy('Tous les outils', 'All tools', 'كل الأدوات')}</a>`}
    </section>`;
  root.querySelector('#home-language').onchange = event => {
    S.lang = event.target.value;
    save();
    applyLang();
    window.dispatchEvent(new Event('safa:lang'));
  };
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
  return () => { clearInterval(timer); io?.disconnect(); root.onclick = null; window.removeEventListener('online', off); window.removeEventListener('offline', off); };
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
    ${group(copy('Aide', 'Help', 'مساعدة'), link('welcome', copy('Revoir le guide de démarrage', 'Review the getting-started guide', 'مراجعة دليل البدء'), icon.guide) + link('about', t('About'), icon.info))}</section>`;
  root.onclick = e => {
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
