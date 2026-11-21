import { S, save, dayKey, addDays, P5 } from '../store.js';
import { esc, icon } from '../ui.js';
import { lang, t, applyLang } from '../i18n.js';
import { timesFor, NAMES, fmtTime } from '../prayer.js';

export const copy = (fr, en, ar) => ({ fr, en, ar })[lang()];

const link = (href, title, graphic, detail = '') => `
  <a class="home-row" href="#/${href}">
    ${graphic}<span><strong>${esc(title)}</strong>${detail ? `<small>${esc(detail)}</small>` : ''}</span>
    ${icon.chev}
  </a>`;

const cover = key => `<img class="home-thumb" src="illustrations/covers/${key}.webp" alt="" width="64" height="64">`;
const group = (title, content) => `<section class="home-group"><h2>${title}</h2>${content}</section>`;

function prayerSummary() {
  if (!S.loc) return {
    label: copy('Horaires de prière', 'Prayer times', 'مواقيت الصلاة'),
    detail: copy('Choisis une ville pour afficher tes horaires.', 'Choose a city to see your times.', 'اختر مدينة لعرض المواقيت.'),
    route: 'setup',
    action: copy('Configurer mes horaires', 'Set my prayer times', 'ضبط مواقيتي'),
  };
  const today = dayKey();
  const times = timesFor(today);
  const next = P5
    .find(key => times[key] > Date.now());
  const time = next ? times[next] : timesFor(addDays(today, 1)).fajr;
  return {
    label: `${NAMES[next || 'fajr']} · ${fmtTime(time)}`,
    detail: `${copy('Prochaine prière', 'Next prayer', 'الصلاة القادمة')} · ${S.loc.name}`,
    route: 'today',
    action: copy('Voir les horaires', 'See prayer times', 'عرض المواقيت'),
  };
}

export function renderHome(root) {
  const prayer = prayerSummary();
  const recent = S.q.last;
  const continueRoute = recent?.s ? `quran/${recent.s}/${recent.v || 1}` : 'quran/1';
  const journey = S.journeyRecent;
  const favorites = (S.q.favs || []).length > 0 || (S.d.favs || []).length > 0;
  root.innerHTML = `
    <header class="home-head"><h1>safa<span>.</span></h1>
      <label class="home-language"><span class="visually-hidden">${copy('Langue', 'Language', 'اللغة')}</span>
      <select id="home-language" class="inp">${[['fr','Français'],['en','English'],['ar','العربية']].map(([id, label]) =>
        `<option value="${id}" ${lang() === id ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
    </header>
    <section class="home-hero">
      <div><p>${esc(prayer.detail)}</p><h2>${esc(prayer.label)}</h2>
        <a class="btn" href="#/${prayer.route}">${prayer.action}</a></div>
      <img src="illustrations/covers/morning.webp" alt="" width="140" height="165">
    </section>
    <div class="home-quick">
      ${link('journey/prayer', copy('Apprendre à prier', 'Learn to pray', 'تعلم الصلاة'), cover('prayer'), copy('Gestes et paroles, rakʿa par rakʿa', 'Postures and words, unit by unit', 'الهيئات والأذكار ركعة ركعة'))}
      ${link(continueRoute, recent ? copy('Continuer ma lecture', 'Continue reading', 'متابعة القراءة') : t('Read Al-Fatiha'), cover('quran'), recent ? `${recent.s}:${recent.v || 1}` : '')}
    </div>
    ${group(copy('Apprendre et pratiquer', 'Learn and practise', 'تعلم ومارس'),
      link(journey ? `journey/${journey.id}` : 'journey', journey ? copy('Reprendre mon parcours', 'Resume my journey', 'متابعة مساري') : t('Through life'), cover('learn'), journey?.title?.[lang()]) +
      link('learn/wudu', t('Ablution (wudu)'), cover('wudu')) +
      link('journey/faq', copy('Questions fréquentes', 'Frequently asked questions', 'الأسئلة الشائعة'), icon.learn))}
    ${group(t('Tools'), link('duas', t('Duas'), icon.duas) + link('qibla', t('Qibla'), icon.compass) +
      (favorites ? link('plus/favorites', copy('Mes favoris', 'My favourites', 'مفضلتي'), icon.quran) : ''))}
    <p class="home-offline">${copy('Les guides et les textes essentiels sont disponibles hors ligne après leur mise en cache. L’audio se télécharge séparément.', 'Guides and essential texts are available offline after caching. Audio is downloaded separately.', 'تتاح الأدلة والنصوص الأساسية دون اتصال بعد حفظها. ينزل الصوت بشكل مستقل.')}</p>`;
  root.querySelector('#home-language').onchange = event => {
    S.lang = event.target.value;
    save();
    applyLang();
    window.dispatchEvent(new Event('safa:lang'));
  };
}

export function renderPlus(root, section) {
  root.innerHTML = `<section class="home-plus"><h1>${copy('Plus', 'More', 'المزيد')}</h1>
    ${group(t('Tools'), link('duas', t('Duas'), icon.duas) + link('qibla', t('Qibla'), icon.compass) +
      link('calendar', t('Calendar'), icon.cal) + link('flight', t('Travel'), cover('travel')) +
      link('track', t('Track'), icon.track) +
      link('journey/ramadan', copy('Ramadan', 'Ramadan', 'رمضان'), '<img class="home-thumb" src="illustrations/life/ramadan.webp" alt="" width="64" height="64">') +
      link('ask', t('Find'), icon.search))}
    ${group(t('Settings'), link('settings', t('Settings'), icon.gear || icon.today) +
      link('setup', copy('Configurer les horaires', 'Set prayer times', 'ضبط المواقيت'), icon.today) +
      link('welcome', copy('Revoir le guide de démarrage', 'Review the getting-started guide', 'مراجعة دليل البدء'), icon.learn) +
      link('about', t('About'), icon.learn))}
    <section id="favorites" class="home-group"><h2>${copy('Mes favoris', 'My favourites', 'مفضلتي')}</h2>
      ${link('quran/favorites', copy('Favoris du Coran', 'Quran favourites', 'مفضلة القرآن'), icon.quran)}
      ${link('duas/favorites', copy('Douas favorites', 'Favourite duas', 'الأدعية المفضلة'), icon.duas)}
    </section></section>`;
  if (section === 'favorites') requestAnimationFrame(() => root.querySelector('#favorites')?.scrollIntoView());
}
