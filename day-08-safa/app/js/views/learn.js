// Beginner path (wudu, salat) and daily Quranic Arabic micro-lessons.
import { S, save, data, dayKey, addDays } from '../store.js';
import { $, $$, esc, icon, toast } from '../ui.js';
import { t, lang } from '../i18n.js';

/* ---------- simple line figures ---------- */
const fig = p => `<svg class="fig" viewBox="0 0 120 120" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${p}<path d="M8 112h104" stroke-width="1.5" opacity=".4"/></svg>`;
const POSE = {
  stand: fig('<circle cx="60" cy="18" r="9"/><path d="M60 27v42M60 69l-8 43M60 69l8 43M60 38l-10 18M60 38l10 18"/>'),
  takbir: fig('<circle cx="60" cy="18" r="9"/><path d="M60 27v42M60 69l-8 43M60 69l8 43M60 36l-14-4-2-14M60 36l14-4 2-14"/>'),
  ruku: fig('<circle cx="22" cy="48" r="9"/><path d="M31 52h40M71 52l-6 60M71 52l8 60M40 52l2 28M50 52l2 28"/>'),
  sujud: fig('<circle cx="22" cy="100" r="8"/><path d="M30 96l38-24M68 72l14 40M68 72l26 14v26M36 92l-6 18M44 87l-4 22"/>'),
  sit: fig('<circle cx="56" cy="34" r="9"/><path d="M56 43v36M56 79h26l6 33M56 79l-16 33h44M56 54l14 20"/>'),
  salam: fig('<circle cx="56" cy="34" r="9"/><path d="M56 43v36M56 79h26l6 33M56 79l-16 33h44M56 54l14 20M70 30l10-6"/>')
};
const ico = {
  hands: fig('<path d="M40 100V60c0-6 8-6 8 0v-24c0-6 8-6 8 0v20-28c0-6 8-6 8 0v28-20c0-6 8-6 8 0v40c0 14-8 24-20 24s-12-6-12-20z"/><path d="M30 30c2 6 2 10 0 14M90 30c-2 6-2 10 0 14"/>'),
  mouth: fig('<circle cx="60" cy="56" r="34"/><path d="M44 70c8 8 24 8 32 0M48 46h4M68 46h4M86 30l10-10"/>'),
  nose: fig('<circle cx="60" cy="56" r="34"/><path d="M60 40v22l-6 4M48 46h4M68 46h4M52 76h16"/>'),
  face: fig('<ellipse cx="60" cy="56" rx="30" ry="38"/><path d="M48 50h4M68 50h4M52 76h16M20 30c6-4 12-4 18 0M82 30c6-4 12-4 18 0"/>'),
  arm: fig('<path d="M20 90c20-6 40-10 60-30l14-14M80 60l8 10M94 46l6-6"/><path d="M30 40c4 4 4 8 0 12M44 32c4 4 4 8 0 12"/>'),
  head: fig('<circle cx="60" cy="62" r="30"/><path d="M34 46c10-14 42-14 52 0M40 24c12-8 28-8 40 0"/>'),
  ear: fig('<path d="M70 30c-20-6-34 8-30 28 2 12 12 14 12 26s14 16 20 4"/><path d="M60 50c4-6 12-4 10 4"/>'),
  feet: fig('<path d="M30 100c-4-20 2-50 10-60h14c4 16 6 40 12 52 4 8-2 12-10 12H38c-4 0-7-2-8-4zM70 100c0-20 4-50 10-60h14"/>'),
  heart: fig('<path d="M60 96L26 62c-10-10-10-26 2-34 10-6 22-2 32 10 10-12 22-16 32-10 12 8 12 24 2 34z"/>'),
  finger: fig('<path d="M54 100V40c0-6 8-6 8 0v40M62 70c0-6 8-6 8 0v10c0-6 8-6 8 0v8c0 12-6 18-16 18h-8"/><path d="M58 26v-8"/>')
};

const WUDU = [
  ['heart', 'Intention', 'Make the intention in your heart to purify yourself for prayer, then say “Bismillah”.', 'بِسْمِ اللَّهِ', 'Bismillah', 'In the name of Allah.'],
  ['hands', 'Hands', 'Wash both hands up to the wrists, three times, between the fingers too.'],
  ['mouth', 'Mouth', 'Take water in the right hand and rinse the mouth, three times.'],
  ['nose', 'Nose', 'Draw a little water into the nose and blow it out with the left hand, three times.'],
  ['face', 'Face', 'Wash the whole face, from the hairline to the chin and from ear to ear, three times.'],
  ['arm', 'Arms', 'Wash the right arm from the fingertips up to and including the elbow, three times. Then the left.'],
  ['head', 'Head', 'With wet hands, wipe the head once: from the front to the back of the neck and back again.'],
  ['ear', 'Ears', 'Wipe the inside of the ears with the index fingers and the back with the thumbs, once.'],
  ['feet', 'Feet', 'Wash the right foot up to and including the ankle, three times, between the toes too. Then the left.'],
  ['finger', 'Testimony', 'After wudu, say the testimony of faith (Sahih Muslim 234).', 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ', 'Ash-hadu an lā ilāha illallāhu waḥdahū lā sharīka lah, wa ash-hadu anna Muḥammadan ʿabduhū wa rasūluh', 'I bear witness that there is no god but Allah, alone, without partner, and I bear witness that Muhammad is His servant and His messenger.']
];
const SALAT = [
  ['stand', 'Stand facing the Qibla', 'Stand facing the Qibla and make the intention in your heart for the prayer you are about to pray.'],
  ['takbir', 'Opening takbir', 'Raise your hands to the shoulders or the ears and say “Allahu akbar”. Then place the right hand over the left on the chest or below the navel, as your school teaches.', 'اللَّهُ أَكْبَرُ', 'Allāhu akbar', 'Allah is the Greatest.'],
  ['stand', 'Recite', 'You may say the opening supplication, then seek refuge, say Bismillah and recite Al-Fatihah. In the first two units, add another surah, even a short one.', 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ', 'Subḥānaka-llāhumma wa bi-ḥamdik, wa tabāraka-smuk, wa taʿālā jadduk, wa lā ilāha ghayruk', 'Glory and praise be to You, O Allah. Blessed is Your name, exalted is Your majesty, and there is no god but You.'],
  ['ruku', 'Bow (ruku)', 'Say “Allahu akbar” and bow, hands on the knees, back straight. Say three times:', 'سُبْحَانَ رَبِّيَ الْعَظِيمِ', 'Subḥāna rabbiyal-ʿaẓīm', 'Glory be to my Lord, the Most Great.'],
  ['stand', 'Rise', 'Rise and say “Sami Allahu liman hamidah”. Once standing, say:', 'رَبَّنَا وَلَكَ الْحَمْدُ', 'Rabbanā wa lakal-ḥamd', 'Our Lord, to You belongs all praise.'],
  ['sujud', 'Prostrate (sujud)', 'Say “Allahu akbar” and prostrate: forehead and nose, both palms, both knees and the toes on the ground. Say three times:', 'سُبْحَانَ رَبِّيَ الْأَعْلَى', 'Subḥāna rabbiyal-aʿlā', 'Glory be to my Lord, the Most High.'],
  ['sit', 'Sit between the two prostrations', 'Say “Allahu akbar” and sit up briefly. Say:', 'رَبِّ اغْفِرْ لِي', 'Rabbi-ghfir lī', 'My Lord, forgive me.'],
  ['sujud', 'Second prostration', 'Say “Allahu akbar” and prostrate again, the same way. That completes one unit (rak‘ah).'],
  ['stand', 'Next unit', 'Stand up with “Allahu akbar” and repeat from the recitation for the second unit.'],
  ['sit', 'Sit for the testimony (tashahhud)', 'After the second unit, sit and recite:', 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ', 'At-taḥiyyātu lillāhi waṣ-ṣalawātu waṭ-ṭayyibāt, as-salāmu ʿalayka ayyuhan-nabiyyu wa raḥmatullāhi wa barakātuh, as-salāmu ʿalaynā wa ʿalā ʿibādillāhiṣ-ṣāliḥīn, ash-hadu an lā ilāha illallāh, wa ash-hadu anna Muḥammadan ʿabduhū wa rasūluh', 'Greetings, prayers and good words are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and His messenger.'],
  ['sit', 'In the last sitting', 'In the final sitting, add the prayer upon the Prophet:', 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ', 'Allāhumma ṣalli ʿalā Muḥammadin wa ʿalā āli Muḥammad, kamā ṣallayta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka ḥamīdun majīd. Allāhumma bārik ʿalā Muḥammadin wa ʿalā āli Muḥammad, kamā bārakta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka ḥamīdun majīd', 'O Allah, send prayers upon Muhammad and the family of Muhammad, as You sent prayers upon Ibrahim and the family of Ibrahim. You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim. You are Praiseworthy, Glorious.'],
  ['salam', 'Close with salam', 'Turn the head to the right and say the greeting, then to the left. The prayer is complete.', 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ', 'As-salāmu ʿalaykum wa raḥmatullāh', 'Peace and the mercy of Allah be upon you.']
];

export function renderLearnHub(root) {
  root.innerHTML = `<header class="sub"><a href="#/today" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('First steps')}</b><span class="ib"></span></header>
    <p class="lead pad">${t('New to prayer, or coming back to it? Start here. Calm, one step at a time.')} ${t('No question is a silly one here.')}</p>
    <p class="muted small pad">${t('Details differ between the four schools of law. This is a general guide. Learn alongside a teacher or the imam of your mosque.')}</p>
    <p class="care pad">${t('Afraid of getting it wrong? “Actions are judged by intentions” (Sahih al-Bukhari 1). Allah knows your heart while you learn.')}</p>
    <a class="card row" href="#/learn/wudu"><span><span class="mono">${t('Step {n}', { n: 1 })}</span><b>${t('Ablution (wudu)')}</b><span class="muted small">${t('{n} steps · about 3 minutes', { n: WUDU.length })}</span></span>${icon.chev}</a>
    <a class="card row" href="#/learn/salat"><span><span class="mono">${t('Step {n}', { n: 2 })}</span><b>${t('The prayer (salat)')}</b><span class="muted small">${t('{n} steps · a two-unit prayer · about 5 minutes', { n: SALAT.length })}</span></span>${icon.chev}</a>
    <a class="card row" href="#/quran/1"><span><span class="mono">${t('Step {n}', { n: 3 })}</span><b>${t('Learn Al-Fatihah word by word')}</b><span class="muted small">${t('Recited in every unit of prayer')}</span></span>${icon.chev}</a>
    <a class="card row" href="#/lessons"><span><span class="mono">${t('Step {n}', { n: 4 })}</span><b>${t('Five Quran words a day')}</b><span class="muted small">${t('Understand what you recite')}</span></span>${icon.chev}</a>
    <section class="card stack"><b>${t('How many units?')}</b><span class="muted small">${t('Obligatory (fard) units of each prayer.')}</span>
      <div class="units">${[['fajr', 2], ['dhuhr', 4], ['asr', 4], ['maghrib', 3], ['isha', 4]].map(([k, n]) => `<div><b>${n}</b><span>${t({ fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' }[k])}</span></div>`).join('')}</div>
      <p class="muted small">${t('In prayers of three or four units, sit for the testimony after the second unit, then stand again. In the third and fourth units, recite Al-Fatihah only.')}</p></section>
`;
  root.querySelectorAll('a.card.row').forEach((a, n) => { const k = ['wudu', 'salat', 'fatiha', 'lessons'][n]; if (S.learnDone && S.learnDone[k]) a.querySelector('.mono').insertAdjacentHTML('beforeend', ` · ✓ ${t('done')}`); });
}

// Simple phonetic reading: no special letters, spelt the way a French or English reader would say it.
export function phon(tl) {
  let x = String(tl).normalize('NFC');
  x = x.replace(/[ʿʾ‘’']/g, "'").replace(/ḥ/g, 'h').replace(/Ḥ/g, 'H').replace(/ṣ/g, 's').replace(/ḍ/g, 'd').replace(/ṭ/g, 't').replace(/ẓ/g, 'z').replace(/ā/g, 'â').replace(/ī/g, 'î').replace(/ū/g, 'û').replace(/Ā/g, 'Â');
  if (lang() === 'fr') x = x.replace(/sh/gi, m => m[0] === 'S' ? 'Ch' : 'ch').replace(/û/g, 'oû').replace(/u/g, 'ou').replace(/U/g, 'Ou').replace(/j/g, 'dj').replace(/J/g, 'Dj');
  return x.replace(/\s+/g, ' ');
}
export function renderSteps(root, which) {
  const list = which === 'wudu' ? WUDU : SALAT; S.learnPos = S.learnPos || {}; let i = Math.min(list.length - 1, S.learnPos[which] || 0);
  const draw = () => {
    const [p, title, body, ar, tl, mean] = list[i];
    root.innerHTML = `<header class="sub"><a href="#/learn" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t(which === 'wudu' ? 'Ablution (wudu)' : 'The prayer (salat)')}</b><span class="mono">${t('Step {a} of {b}', { a: i + 1, b: list.length })}</span></header>
      <div class="stepbar" aria-hidden="true">${list.map((_, j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</div>
      <section class="step">
        <div class="figw" role="img" aria-label="${esc(t(title))}">${POSE[p] || ico[p]}</div>
        <h2>${t(title)}</h2><p>${t(body)}</p>
        ${ar ? `<div class="say"><p class="ar" lang="ar" dir="rtl">${ar}</p>${lang() !== 'ar' ? `<p class="tlit">${esc(S.phon ? phon(tl) : tl)}</p><button class="linkbtn small" id="sph" aria-pressed="${!!S.phon}">${t(S.phon ? 'Show the precise transliteration' : 'Show a simple phonetic reading')}</button>` : ''}${mean && lang() !== 'ar' ? `<p class="mean">${esc(t(mean))}</p>` : ''}</div>` : ''}
      </section>
      <nav class="rnav"><button class="btn line" id="sp" ${i === 0 ? 'disabled' : ''}>${t('Previous')}</button>${i < list.length - 1 ? `<button class="btn" id="sn">${t('Next')}</button>` : `<button class="btn" id="sfin">${t('Done')}</button>`}</nav>`;
  };
  const fin = () => {
    S.learnDone = S.learnDone || {}; S.learnDone[which] = true; S.learnPos[which] = 0; save();
    const next = which === 'wudu' ? ['#/learn/salat', 'Next: the prayer'] : ['#/quran/1', 'Next: Al-Fatihah word by word'];
    root.innerHTML = `<header class="sub"><a href="#/learn" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t(which === 'wudu' ? 'Ablution (wudu)' : 'The prayer (salat)')}</b><span class="ib"></span></header>
      <section class="hero2"><div class="big">✓</div><p class="lead">${t('You are there. Come back whenever you want, as often as you need.')}</p></section>
      <a class="btn big" href="${next[0]}">${t(next[1])}</a><a class="btn line big" href="#/learn" style="margin-top:10px">${t('Back to First steps')}</a>`;
    window.scrollTo(0, 0);
  };
  root.onclick = e => { const b = e.target.closest('button'); if (!b) return; if (b.id === 'sph') { S.phon = !S.phon; save(); draw(); return; } if (b.id === 'sfin') { fin(); return; } if (b.id === 'sn') i++; if (b.id === 'sp') i--; S.learnPos[which] = i; save(); draw(); window.scrollTo(0, 0); };
  draw();
  return () => { root.onclick = null; };
}

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
    $('#lplay', root).onclick = () => { a.src = `https://audio.qurancdn.com/wbw/${String(ex.s).padStart(3, '0')}_${String(ex.v).padStart(3, '0')}_${String(ex.j + 1).padStart(3, '0')}.mp3`; a.play().catch(() => toast(t('Audio needs a connection.'))); };
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
