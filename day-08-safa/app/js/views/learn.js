// Beginner path (wudu, salat) and daily Quranic Arabic micro-lessons.
import { S, save, data, dayKey, addDays } from '../store.js';
import { $, $$, esc, icon, toast } from '../ui.js';
import { t, lang } from '../i18n.js';

// Local illustrations are shared across languages; the enclosing label is translated.
const illustration = (key, title) => `<img class="learn-illustration" src="illustrations/${S.journeyFigure === 'woman' && ['stand','takbir','recite','ruku','rise','sujud','sit','tashahhud','salam'].includes(key) ? 'women/' : ''}${key}.webp" alt="" aria-hidden="true" width="484" height="363" decoding="async" fetchpriority="high">`;

const WUDU = [
  ['intention', 'Intention', 'Make the intention in your heart to purify yourself for prayer, then say “Bismillah”.', 'بِسْمِ اللَّهِ', 'Bismillah', 'In the name of Allah.'],
  ['hands', 'Hands', 'Wash both hands up to the wrists, three times, between the fingers too.'],
  ['mouth', 'Mouth', 'Take water in the right hand and rinse the mouth, three times.'],
  ['nose', 'Nose', 'Draw a little water into the nose and blow it out with the left hand, three times.'],
  ['face', 'Face', 'Wash the whole face, from the hairline to the chin and from ear to ear, three times.'],
  ['arms', 'Arms', 'Wash the right arm from the fingertips up to and including the elbow, three times. Then the left.'],
  ['head', 'Head', 'With wet hands, wipe the head once: from the front to the back of the neck and back again.'],
  ['ears', 'Ears', 'Wipe the inside of the ears with the index fingers and the back with the thumbs, once.'],
  ['feet', 'Feet', 'Wash the right foot up to and including the ankle, three times, between the toes too. Then the left.'],
  ['testimony', 'Testimony', 'After wudu, say the testimony of faith (Sahih Muslim 234).', 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ', 'Ash-hadu an lā ilāha illallāhu waḥdahū lā sharīka lah, wa ash-hadu anna Muḥammadan ʿabduhū wa rasūluh', 'I bear witness that there is no god but Allah, alone, without partner, and I bear witness that Muhammad is His servant and His messenger.']
];
export const SALAT = [
  ['stand', 'Stand facing the Qibla', 'Stand facing the Qibla and make the intention in your heart for the prayer you are about to pray.'],
  ['takbir', 'Opening takbir', 'Raise your hands to the shoulders or the ears and say “Allahu akbar”. Then place the right hand over the left on the chest or below the navel, as your school teaches.', 'اللَّهُ أَكْبَرُ', 'Allāhu akbar', 'Allah is the Greatest.'],
  ['recite', 'Recite', 'You may say the opening supplication, then seek refuge, say Bismillah and recite Al-Fatihah. In the first two units, add another surah, even a short one.', 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ', 'Subḥānaka-llāhumma wa bi-ḥamdik, wa tabāraka-smuk, wa taʿālā jadduk, wa lā ilāha ghayruk', 'Glory and praise be to You, O Allah. Blessed is Your name, exalted is Your majesty, and there is no god but You.'],
  ['ruku', 'Bow (ruku)', 'Say “Allahu akbar” and bow, hands on the knees, back straight. Say three times:', 'سُبْحَانَ رَبِّيَ الْعَظِيمِ', 'Subḥāna rabbiyal-ʿaẓīm', 'Glory be to my Lord, the Most Great.'],
  ['rise', 'Rise', 'Rise and say “Sami Allahu liman hamidah”. Once standing, say:', 'رَبَّنَا وَلَكَ الْحَمْدُ', 'Rabbanā wa lakal-ḥamd', 'Our Lord, to You belongs all praise.'],
  ['sujud', 'Prostrate (sujud)', 'Say “Allahu akbar” and prostrate: forehead and nose, both palms, both knees and the toes on the ground. Say three times:', 'سُبْحَانَ رَبِّيَ الْأَعْلَى', 'Subḥāna rabbiyal-aʿlā', 'Glory be to my Lord, the Most High.'],
  ['sit', 'Sit between the two prostrations', 'Say “Allahu akbar” and sit up briefly. Say:', 'رَبِّ اغْفِرْ لِي', 'Rabbi-ghfir lī', 'My Lord, forgive me.'],
  ['sujud', 'Second prostration', 'Say “Allahu akbar” and prostrate again, the same way. That completes one unit (rak‘ah).'],
  ['stand', 'Next unit', 'Stand up with “Allahu akbar” and repeat from the recitation for the second unit.'],
  ['tashahhud', 'Sit for the testimony (tashahhud)', 'After the second unit, sit and recite:', 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ', 'At-taḥiyyātu lillāhi waṣ-ṣalawātu waṭ-ṭayyibāt, as-salāmu ʿalayka ayyuhan-nabiyyu wa raḥmatullāhi wa barakātuh, as-salāmu ʿalaynā wa ʿalā ʿibādillāhiṣ-ṣāliḥīn, ash-hadu an lā ilāha illallāh, wa ash-hadu anna Muḥammadan ʿabduhū wa rasūluh', 'Greetings, prayers and good words are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and His messenger.'],
  ['tashahhud', 'In the last sitting', 'In the final sitting, add the prayer upon the Prophet:', 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ', 'Allāhumma ṣalli ʿalā Muḥammadin wa ʿalā āli Muḥammad, kamā ṣallayta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka ḥamīdun majīd. Allāhumma bārik ʿalā Muḥammadin wa ʿalā āli Muḥammad, kamā bārakta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka ḥamīdun majīd', 'O Allah, send prayers upon Muhammad and the family of Muhammad, as You sent prayers upon Ibrahim and the family of Ibrahim. You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim. You are Praiseworthy, Glorious.'],
  ['salam', 'Close with salam', 'Turn the head to the right and say the greeting, then to the left. The prayer is complete.', 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ', 'As-salāmu ʿalaykum wa raḥmatullāh', 'Peace and the mercy of Allah be upon you.']
];

// My first week: seven small steps, one a day, ticked by hand.
const WEEK = [['Day 1', 'See your prayer times and tick one prayer', '#/today'], ['Day 2', 'Learn the ablution, step by step', '#/learn/wudu'], ['Day 3', 'Walk through the prayer once', '#/learn/salat'],
  ['Day 4', 'Read Al-Fatihah word by word', '#/quran/1'], ['Day 5', 'Read the morning or evening adhkar', '#/duas/27'], ['Day 6', 'Learn your first five Quran words', '#/lessons'], ['Day 7', 'Pray one prayer with the guided mode', '#/learn/salat/guided']];
function weekCard() {
  const w = S.week1 || [], done = WEEK.filter((_, i) => w[i]).length;
  return `<section class="card stack week" id="wk"><span class="mono">${t('My first week')}</span><b>${t(done === WEEK.length ? 'Your first week is done. Keep the steps that help you.' : 'Seven small steps. One a day, or at your pace.')}</b>
    <ol>${WEEK.map(([d, x, h], i) => `<li class="${w[i] ? 'ok' : ''}"><button class="chk ${w[i] ? 'on' : ''}" data-wk="${i}" role="checkbox" aria-checked="${!!w[i]}" aria-label="${esc(t(x))}">${w[i] ? icon.check : ''}</button><a href="${h}"><span class="mono">${t(d)}</span>${t(x)}</a></li>`).join('')}</ol></section>`;
}
export function renderLearnHub(root) {
  root.innerHTML = `<header class="sub"><a href="#/today" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('First steps')}</b><span class="ib"></span></header>
    <a class="card stack" href="#/journey"><b>${t('Through life')}</b><span class="muted small">${t('100 essentials · 24 life moments · 32 questions')}</span></a>
    <a class="card stack" href="#/journey/prayer"><b>${t('Every rakah: words and recitation')}</b><span class="muted small">${t('Al-Fatihah, surahs, aloud or quiet')}</span></a>
    <p class="lead pad">${t('New to prayer, or coming back to it? Start here. Calm, one step at a time.')} ${t('No question is a silly one here.')}</p>
    <p class="muted small pad">${t('Details differ between the four schools of law. This is a general guide. Learn alongside a teacher or the imam of your mosque.')}</p>
    <p class="care pad">${t('Afraid of getting it wrong? “Actions are judged by intentions” (Sahih al-Bukhari 1). Allah knows your heart while you learn.')}</p>
    <a class="card row" href="#/learn/wudu"><span><span class="mono">${t('Step {n}', { n: 1 })}</span><b>${t('Ablution (wudu)')}</b><span class="muted small">${t('{n} steps · about 3 minutes', { n: WUDU.length })}</span></span>${icon.chev}</a>
    <a class="card row" href="#/learn/salat"><span><span class="mono">${t('Step {n}', { n: 2 })}</span><b>${t('The prayer (salat)')}</b><span class="muted small">${t('{n} steps · a two-unit prayer · about 5 minutes', { n: SALAT.length })}</span></span>${icon.chev}</a>
    <a class="card row" href="#/quran/1"><span><span class="mono">${t('Step {n}', { n: 3 })}</span><b>${t('Learn Al-Fatihah word by word')}</b><span class="muted small">${t('Recited in every unit of prayer')}</span></span>${icon.chev}</a>
    <a class="card row" href="#/lessons"><span><span class="mono">${t('Step {n}', { n: 4 })}</span><b>${t('Five Quran words a day')}</b><span class="muted small">${t('Understand what you recite')}</span></span>${icon.chev}</a>
    ${weekCard()}
    <section class="card stack"><b>${t('How many units?')}</b><span class="muted small">${t('Obligatory (fard) units of each prayer.')}</span>
      <div class="units">${[['fajr', 2], ['dhuhr', 4], ['asr', 4], ['maghrib', 3], ['isha', 4]].map(([k, n]) => `<div><b>${n}</b><span>${t({ fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' }[k])}</span></div>`).join('')}</div>
      <p class="muted small">${t('In prayers of three or four units, sit for the testimony after the second unit, then stand again. In the third and fourth units, recite Al-Fatihah only.')}</p></section>
    <h3 class="sect">${t('Go further')}</h3>
    <a class="srow" href="#/hifz"><span class="st"><b>${t('Memorise')}</b><span class="muted small">${t('Short portions, spaced reviews')}</span></span>${icon.chev}</a>
    <a class="srow" href="#/ask"><span class="st"><b>${t('Find a verse or a dua')}</b><span class="muted small">${t('A verse or a dua by topic')}</span></span>${icon.chev}</a>
    <a class="srow" href="#/duas/27"><span class="st"><b>${t('Morning adhkar')}</b><span class="muted small">${t('Words of remembrance')}</span></span>${icon.chev}</a>
`;
  root.onclick = e => { const b = e.target.closest('[data-wk]'); if (!b) return; S.week1 = S.week1 || []; const i = +b.dataset.wk; S.week1[i] = !S.week1[i]; save(); const c = $('#wk', root); if (c) c.outerHTML = weekCard(); if (S.week1[i]) toast(t('One step. That counts.')); };
  root.querySelectorAll('a.card.row').forEach((a, n) => { const k = ['wudu', 'salat', 'fatiha', 'lessons'][n]; if (S.learnDone && S.learnDone[k]) a.querySelector('.mono').insertAdjacentHTML('beforeend', ` · ✓ ${t('done')}`); });
}

// Simple phonetic reading: no special letters, spelt the way a French or English reader would say it.
export function phon(tl) {
  let x = String(tl).normalize('NFC');
  x = x.replace(/[ʿʾ‘’']/g, "'").replace(/ḥ/g, 'h').replace(/Ḥ/g, 'H').replace(/ṣ/g, 's').replace(/ḍ/g, 'd').replace(/ṭ/g, 't').replace(/ẓ/g, 'z').replace(/ā/g, 'â').replace(/ī/g, 'î').replace(/ū/g, 'û').replace(/Ā/g, 'Â');
  if (lang() === 'fr') x = x.replace(/sh/gi, m => m[0] === 'S' ? 'Ch' : 'ch').replace(/û/g, 'oû').replace(/u/g, 'ou').replace(/U/g, 'Ou').replace(/j/g, 'dj').replace(/J/g, 'Dj');
  return x.replace(/\s+/g, ' ');
}
// Guided prayer: the screen stays on and moves to the next step on its own. Seconds per step (salat only).
const GDUR = [8, 6, 45, 12, 8, 12, 8, 12, 6, 30, 25, 8];
let wakeLock = null;
const wakeOn = async () => { try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { /* not allowed */ } };
function wakeOff() { try { if (wakeLock) wakeLock.release(); } catch (e) { /* ignore */ } wakeLock = null; try { speechSynthesis.cancel(); } catch (e) { /* ignore */ } }
export function renderSteps(root, which, mode) {
  const list = which === 'wudu' ? WUDU : SALAT; S.learnPos = S.learnPos || {}; let i = Math.min(list.length - 1, S.learnPos[which] || 0);
  let guided = which === 'salat' && mode === 'guided', gT = 0, gEnd = 0, gPaused = false, gLeft = 0, voice = !!S.guideVoice;
  if (guided) { i = 0; wakeOn(); }
  const say = () => { if (!voice || !('speechSynthesis' in window)) return; try { speechSynthesis.cancel(); const [, ti, bo] = list[i]; const u = new SpeechSynthesisUtterance(t(ti) + '. ' + t(bo)); u.lang = lang() === 'fr' ? 'fr-FR' : lang() === 'ar' ? 'ar' : 'en-GB'; u.rate = .95; speechSynthesis.speak(u); } catch (e) { /* unsupported */ } };
  const startStep = () => { clearInterval(gT); if (!guided) return; gEnd = Date.now() + GDUR[i] * 1000; gPaused = false; say();
    gT = setInterval(() => { if (gPaused) return; const left = Math.max(0, gEnd - Date.now()), el = $('#gleft', root); if (el) { el.textContent = Math.ceil(left / 1000) + ' s'; const b = $('#gbar', root); if (b) b.style.width = (100 - left / (GDUR[i] * 10)) + '%'; }
      if (!left) { if (i < list.length - 1) { i++; draw(); startStep(); } else { clearInterval(gT); fin(); } } }, 250); };
  const draw = () => {
    const [p, title, body, ar, tl, mean] = list[i];
    root.innerHTML = `<header class="sub"><a href="#/learn" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t(which === 'wudu' ? 'Ablution (wudu)' : 'The prayer (salat)')}</b><span class="mono">${t('Step {a} of {b}', { a: i + 1, b: list.length })}</span></header>
      <div class="stepbar" aria-hidden="true">${list.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</div>
      ${which === 'salat' ? `<div class="j-figure-switch"><span>${t('Illustration')}</span><button class="chip" data-learn-figure="man" aria-pressed="${S.journeyFigure !== 'woman'}">${t('Man')}</button><button class="chip" data-learn-figure="woman" aria-pressed="${S.journeyFigure === 'woman'}">${t('Woman')}</button></div><a class="linkbtn small" href="#/journey/prayer">${t('Every rakah: words and recitation')} ↗</a>` : ''}
      <section class="step">
        <div class="figw" role="img" aria-label="${esc(t(title))}">${illustration(p, title)}</div>
        <h2>${t(title)}</h2><p>${t(body)}</p>
        ${ar ? `<div class="say"><p class="ar" lang="ar" dir="rtl">${ar}</p>${lang() !== 'ar' ? `<p class="tlit">${esc(S.phon ? phon(tl) : tl)}</p><button class="linkbtn small" id="sph" aria-pressed="${!!S.phon}">${t(S.phon ? 'Show the precise transliteration' : 'Show a simple phonetic reading')}</button>` : ''}${mean && lang() !== 'ar' ? `<p class="mean">${esc(t(mean))}</p>` : ''}</div>` : ''}
      </section>
      ${guided ? `<div class="guide"><div class="gtrack"><i id="gbar"></i></div><div class="row2"><span class="mono" id="gleft"></span><button class="chip" id="gpause" aria-pressed="${gPaused}">${t(gPaused ? 'Resume' : 'Pause')}</button><button class="chip" id="gvoice" aria-pressed="${voice}">${t('Read aloud')}</button></div><p class="muted small">${t('The screen stays on. Each step moves on by itself. Pause whenever you need.')}</p></div>` : which === 'salat' ? `<a class="btn line sm" href="#/learn/salat/guided">${t('Pray with me (guided mode)')}</a>` : ''}
      <nav class="rnav"><button class="btn line" id="sp" ${i === 0 ? 'disabled' : ''}>${t('Previous')}</button>${i < list.length - 1 ? `<button class="btn" id="sn">${t('Next')}</button>` : `<button class="btn" id="sfin">${t('Done')}</button>`}</nav>`;
  };
  const fin = () => {
    clearInterval(gT); wakeOff(); if (guided) { S.week1 = S.week1 || []; S.week1[6] = true; }
    S.learnDone = S.learnDone || {}; S.learnDone[which] = true; S.learnPos[which] = 0; save();
    const next = which === 'wudu' ? ['#/learn/salat', 'Next: the prayer'] : ['#/quran/1', 'Next: Al-Fatihah word by word'];
    root.innerHTML = `<header class="sub"><a href="#/learn" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t(which === 'wudu' ? 'Ablution (wudu)' : 'The prayer (salat)')}</b><span class="ib"></span></header>
      <section class="hero2"><div class="big">✓</div><p class="lead">${t('You are there. Come back whenever you want, as often as you need.')}</p></section>
      <a class="btn big" href="${next[0]}">${t(next[1])}</a><a class="btn line big" href="#/learn" style="margin-top:10px">${t('Back to First steps')}</a>`;
    window.scrollTo(0, 0);
  };
  root.onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.learnFigure) { S.journeyFigure = b.dataset.learnFigure; save(); draw(); return; } if (b.id === 'sph') { S.phon = !S.phon; save(); draw(); return; }
    if (b.id === 'gpause') { gPaused = !gPaused; if (gPaused) gLeft = gEnd - Date.now(); else gEnd = Date.now() + gLeft; b.setAttribute('aria-pressed', gPaused); b.textContent = t(gPaused ? 'Resume' : 'Pause'); return; }
    if (b.id === 'gvoice') { voice = !voice; S.guideVoice = voice; save(); b.setAttribute('aria-pressed', voice); if (voice) say(); else speechSynthesis.cancel(); return; }
    if (b.id === 'sfin') { fin(); return; } if (b.id === 'sn') i++; if (b.id === 'sp') i--; if (!guided) S.learnPos[which] = i; save(); draw(); startStep(); window.scrollTo(0, 0); };
  draw(); startStep();
  return () => { root.onclick = null; clearInterval(gT); wakeOff(); };
}

// Keep the sound of each word you study, so “Listen” works offline next time.
const keepAudio = u => { try { caches.open('safa-audio').then(c => c.match(u).then(r => r || fetch(u, { mode: 'no-cors' }).then(x => c.put(u, x)))).catch(() => {}); } catch (e) { /* no cache API */ } };
/* ---------- Five words a day (Leitner boxes, local only) ---------- */
const GAP = [0, 1, 3, 7, 16, 35];
const bare = w => w.normalize('NFKD').replace(/[ً-ٰٟۖ-ۭ]/g, '').replace(/[ٱأإآ]/g, 'ا').replace(/[^ء-ي]/g, '');
const clean = s => String(s || '').replace(/[,.;:!?«»“”]+$/g, '').trim();
export async function renderLessons(root) {
  const V = await data('vocab.json'), L = S.lessons, today = dayKey();
  const meaningOf = w => clean(lang() === 'fr' ? (w.fr || w.en) : w.en);
  const total = 77429; // words in the Quran
  const known = () => Object.entries(L.w).filter(([, x]) => x.b >= 2).reduce((a, [i]) => a + V[i].n, 0);
  const due = () => Object.entries(L.w).filter(([, x]) => x.d <= today).map(([i]) => +i);
  const fresh = () => { const out = []; for (let i = 0; i < V.length && out.length < 5; i++) if (!L.w[i]) out.push(i); return out; };
  let queue = null, pos = 0, shown = false, exCache = {};
  const example = async i => {
    if (exCache[i]) return exCache[i];
    const w = V[i]; let [s, v, j] = w.x;
    // Prefer an example from the surah you read last, when the word appears there.
    if (S.q.last) { try { const sur = await data(`quran/${S.q.last.s}.json`), b = bare(w.a); for (let k = 0; k < sur.v.length; k++) { const idx = sur.v[k].a.findIndex(x => bare(x) === b); if (idx >= 0) { s = S.q.last.s; v = k + 1; j = idx; break; } } } catch (e) { /* offline */ } }
    const sur = await data(`quran/${s}.json`).catch(() => null);
    let tr = null; try { tr = lang() === 'fr' ? (await data(`fr/${s}.json`))[v - 1] : lang() === 'en' && sur ? sur.v[v - 1].t : null; } catch (e) { /* offline */ }
    return (exCache[i] = { s, v, j, words: sur ? sur.v[v - 1].a : null, tr });
  };
  const home = () => {
    const d = due().length, k = known();
    root.innerHTML = `<header class="sub"><a href="#/quran" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Quranic Arabic')}</b><span class="ib"></span></header>
      ${k ? `<section class="hero2"><span class="mono">${t('You recognise')}</span><div class="big">${Math.max(1, Math.round(k / total * 100))}%</div><p class="muted">${t('of the words in the Quran, counting each time they appear.')}</p></section>`
        : `<section class="hero2"><span class="mono">${t('Five words a day')}</span><p class="lead">${t('A few very frequent words make up a large part of the Quran. Start with five, about two minutes.')}</p></section>`}
      <p class="pad">${t('Five minutes a day. The most frequent words first, each shown in a verse.')}</p>
      <button class="btn big" id="lgo">${d ? t('Start · {n} to review + 5 new', { n: Math.min(d, 15) }) : t('Start · 5 new words · 2 min')}</button>
      ${Object.keys(L.w).length ? `<p class="muted small pad">${t('{n} words started. {k} words known.', { n: Object.keys(L.w).length, k: Object.values(L.w).filter(x => x.b >= 2).length })}</p>` : ''}
      <p class="muted small pad">${t('Meanings come from the word-by-word data. They give the sense in context, not a full dictionary entry.')}</p>`;
    $('#lgo', root).onclick = () => { queue = [...due().slice(0, 15), ...fresh()]; pos = 0; shown = false; card(); };
  };
  const card = async () => {
    if (pos >= queue.length) { L.last = today; S.learnDone = S.learnDone || {}; S.learnDone.lessons = true; save(); root.innerHTML = `<header class="sub"><a href="#/quran" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Quranic Arabic')}</b><span class="ib"></span></header><section class="hero2"><div class="big">✓</div><p>${t('Done for today. See you tomorrow.')}</p></section><a class="btn line big" href="#/lessons">${t('Back')}</a>`; return; }
    const i = queue[pos], w = V[i], ex = await example(i);
    root.innerHTML = `<header class="sub"><a href="#/lessons" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Quranic Arabic')}</b><span class="mono">${pos + 1}/${queue.length}</span></header>
      <div class="stepbar" aria-hidden="true">${queue.map((_, j) => `<i class="${j <= pos ? 'on' : ''}"></i>`).join('')}</div>
      <section class="lcard"><span class="mono">${t('Appears {n} times', { n: w.n })}</span>
        <p class="lw ar" lang="ar" dir="rtl">${w.a}</p>
        <button class="btn line sm" id="lplay">${icon.play}${t('Listen')}</button>
        ${ex.words ? `<p class="lex ar" lang="ar" dir="rtl">${ex.words.map((x, k) => k === ex.j ? `<mark>${x}</mark>` : x).join(' ')}</p><a class="mono" href="#/quran/${ex.s}/${ex.v}">${ex.s}:${ex.v}</a>` : ''}
        ${shown ? `<p class="lm">${esc(meaningOf(w)) || '—'}</p>${ex.tr ? `<p class="lext">« ${esc(ex.tr)} »</p>` : ''}` : ''}
      </section>
      ${shown ? `<div class="grid2"><button class="btn line" data-r="0">${t('Not yet')}</button><button class="btn" data-r="1">${t('I knew it')}</button></div>` : `<button class="btn big" id="lshow">${t('Show the meaning')}</button>`}`;
    const a = new Audio(); a.preload = 'none';
    $('#lplay', root).onclick = () => { a.src = `https://audio.qurancdn.com/wbw/${String(ex.s).padStart(3, '0')}_${String(ex.v).padStart(3, '0')}_${String(ex.j + 1).padStart(3, '0')}.mp3`; keepAudio(a.src); a.play().catch(() => toast(t('Audio needs a connection.'))); };
    root.onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.id === 'lshow') { shown = true; card(); }
      if (b.dataset.r != null) {
        const x = L.w[i] || { b: 0, d: today }; x.b = +b.dataset.r ? Math.min(GAP.length - 1, x.b + 1) : 0; x.d = addDays(today, GAP[x.b] || 1); L.w[i] = x; save();
        pos++; shown = false; card();
      }
    };
  };
  home();
  return () => { root.onclick = null; };
}
