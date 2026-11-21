// Sourced answers: finds and quotes passages from the Quran translations and Hisnul Muslim.
// It never writes an answer of its own and refuses to give rulings.
import { S, save, data } from '../store.js';
import { $, esc, icon } from '../ui.js';
import { t, lang } from '../i18n.js';
import { surahName, contextSheet } from './quran.js';

const STOP = new Set(('a an the of to in on for and or is are was be it this that what how why when who do does did can i my me we you your with from about there their them his her allah god ' +
  'le la les un une des de du d l et ou est sont a au aux en pour par sur que qui quoi comment pourquoi quand je j me mon ma mes tu te ton ta tes il elle on nous vous ils elles ce cet cette ces dans avec se sa son ses y ne pas plus dieu allah ' +
  'في من على إلى عن ما ماذا كيف لماذا هل أن إن هو هي هم أنا نحن الله').split(' '));
const DISTRESS = /(suicid|me tuer|mourir|en finir|plus envie de vivre|kill myself|end my life|want to die|انتحار)/;
const RULING = /\b(halal|haram|allowed|permitted|forbidden|ruling|fatwa|permis|interdit|autoris|licite|illicite|obligatoire|obligatory|حلال|حرام|يجوز|حكم|فتوى)/i;
// A few bridges between everyday words and the vocabulary of the translations.
const SYN = {
  fr: { stress: 'angoisse inquiet', anxiete: 'angoisse crainte', triste: 'tristesse affliger', patience: 'patient endurance', pardon: 'pardon repent', parents: 'pere mere', mere: 'mere parents', mariage: 'epouse epoux', argent: 'biens richesse', mort: 'mort trepas', paradis: 'jardin paradis', enfer: 'feu enfer', priere: 'priere salat', jeune: 'jeune ramadan', aumone: 'aumone zakat' },
  en: { stress: 'grief distress fear', anxiety: 'fear grief', sad: 'grief sorrow', parents: 'father mother parents', marriage: 'wives spouse', money: 'wealth property', heaven: 'garden paradise', hell: 'fire', fasting: 'fast', charity: 'charity zakah' }
};
const fold = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ًͯ-ْٰ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/[’']/g, ' ');
const terms = q => { let w = fold(q).split(/[^a-z0-9ء-ي]+/).filter(x => x.length > 2 && !STOP.has(x)); const syn = SYN[lang()] || {}; w = w.concat(...w.map(x => (syn[x] || '').split(' ').filter(Boolean))); return [...new Set(w)]; };
const stem = x => x.length > 5 ? x.slice(0, x.length - 2) : x;


// Everyday spellings that should land on the right place.
const ALIAS = { fatiha: 1, fatihah: 1, fatiaha: 1, fateha: 1, baqara: 2, baqarah: 2, bakara: 2, kahf: 18, kahef: 18, yasin: 36, yassine: 36, yaseen: 36, rahman: 55, waqia: 56, waqiah: 56, mulk: 67, ikhlas: 112, falaq: 113, nas: 114 };
const PRAYER = { fajr: 'fajr', sobh: 'fajr', subh: 'fajr', dhuhr: 'dhuhr', dohr: 'dhuhr', zuhr: 'dhuhr', duhr: 'dhuhr', thuhr: 'dhuhr', asr: 'asr', maghrib: 'maghrib', maghreb: 'maghrib', isha: 'isha', icha: 'isha', ishaa: 'isha' };
const GUIDES = [[/(wudu|woudou|wudhu|ablution)/, '#/learn/wudu', 'Ablution (wudu)'], [/(qibla|kibla|qiblah)/, '#/qibla', 'Qibla'], [/(priere|prier|salat|salah|pray)/, '#/journey/prayer', 'Learn to pray'], [/(ramadan|jeune|fast)/, '#/journey/ramadan', 'Ramadan'], [/(voyage|travel|avion|flight)/, '#/flight', 'Travel'], [/(rattrap|qada|make.?up)/, '#/qada', 'Make-up prayers']];
const bare = x => fold(x).replace(/^(al|an|as|ash|at|ad|ar|az)[- ]?/, '').replace(/[^a-z]/g, '');
function recents() { return S.recentQ || []; }
function remember(q) { if (q.length < 3) return; S.recentQ = [q, ...recents().filter(x => x !== q)].slice(0, 6); save(); }

let last = '';
export async function renderAsk(root) {
  const drawRecent = () => { const r = recents(); const el = $('#arec', root); if (!el) return; el.innerHTML = r.length ? `<span class="mono">${t('Recent searches')}</span>${r.map(x => `<button class="chip" data-ex="${esc(x)}">${esc(x)}</button>`).join('')}<button class="linkbtn small" id="aclear">${t('Clear')}</button>` : ''; };
  root.innerHTML = `<header class="sub"><a href="#/plus" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Find')}</b><span class="ib"></span></header>
    <p class="lead pad">${t('One search for the Quran, duas, questions and guides. Answers are quoted with their reference. safa. never invents an answer or gives a ruling.')}</p>
    <form id="af" class="searchf">${icon.search}<input id="aq" class="inp" type="search" placeholder="${t('e.g. 2:255, fatiha, patience')}" value="${esc(last)}" autocomplete="off" aria-label="${t('Your question')}"></form>
    <div class="chips wrapc" id="arec"></div>
    <div class="chips wrapc" id="aex">${['patience in hardship', 'my parents', 'anxiety', 'forgiveness', 'gratitude', 'death of a loved one'].map(x => `<button class="chip" data-ex="${esc(t(x))}">${esc(t(x))}</button>`).join('')}</div>
    <div id="ao"></div>`;
  drawRecent();
  root.onclick = e => {
    const cx = e.target.closest('[data-ctxv]'); if (cx) { const [s, v] = cx.dataset.ctxv.split(':').map(Number); contextSheet(s, v); return; }
    if (e.target.id === 'aclear') { S.recentQ = []; save(); drawRecent(); $('#aq', root).focus(); return; }
    const b = e.target.closest('[data-ex]'); if (!b) return; $('#aq', root).value = b.dataset.ex; run(true);
  };
  const out = $('#ao', root);
  const run = async (commit) => {
    const q = $('#aq', root).value.trim(); last = q; if (q.length < 2) { out.innerHTML = ''; return; }
    if (commit) { remember(q); drawRecent(); }
    out.innerHTML = `<p class="muted pad">${t('Searching…')}</p>`;
    const T = terms(q).map(stem);
    const J = await data('journey.json').catch(() => null);
    const pk = o => (o && (o[lang()] || o.en)) || '';
    // Exact places first: a reference like 2:255, a surah name, a prayer, a guide.
    const top = [];
    const metaX = await data('meta.json');
    const refm = q.match(/^\s*(\d{1,3})\s*[:.,]\s*(\d{1,3})\s*$/);
    if (refm) { const s = +refm[1], v = +refm[2]; if (s >= 1 && s <= 114 && v >= 1 && v <= metaX.s[s - 1][3]) {
      let tr = ''; try { if (lang() === 'fr') tr = (await data('fr/' + s + '.json'))[v - 1]; else if (lang() === 'en') tr = (await data('quran/' + s + '.json')).v[v - 1].t; } catch (e) { /* offline */ }
      top.push(`<button class="chip fav-ctx" data-ctxv="${s}:${v}">${t('Read in context')}</button>`); top.push(`<a class="quote exact" href="#/quran/${s}/${v}"><span class="mono">${t('Quran')} · ${esc(surahName(metaX, s))} <bdi>${s}:${v}</bdi></span>${tr ? `<p>« ${esc(tr)} »</p>` : ''}</a>`); } }
    const words = fold(q).split(/[^a-z0-9]+/).filter(Boolean);
    const sNum = words.map(w => ALIAS[w.replace(/^(al|an|as|ash|at|ad|ar|az)/, '')] || ALIAS[w]).find(Boolean) || (() => { const b = bare(q); if (b.length < 3) return 0; const i = metaX.s.findIndex(m => bare(m[0]) === b || bare(m[1]) === b); return i + 1; })();
    if (sNum && !refm) top.push(`<a class="card row" href="#/quran/${sNum}"><span><span class="mono">${t('Quran')} · ${t('Surah')} ${sNum}</span><b>${esc(surahName(metaX, sNum))}</b></span>${icon.chev}</a>`);
    const pr = words.map(w => PRAYER[w]).find(Boolean);
    if (pr) top.push(`<a class="card row" href="#/journey/prayer/${pr}"><span><span class="mono">${t('Guide')}</span><b>${t('How to pray {p}', { p: pr[0].toUpperCase() + pr.slice(1) })}</b></span>${icon.chev}</a>`);
    for (const [re, href, label] of GUIDES) if (re.test(fold(q)) && !(pr && href === '#/journey/prayer')) top.push(`<a class="card row" href="${href}"><span><span class="mono">${t('Guide')}</span><b>${esc(t(label))}</b></span>${icon.chev}</a>`);
    const sc2 = txt => { const f = fold(txt); let n = 0; for (const w of T) if (f.includes(w)) n++; return T.length ? n / T.length : 0; };
    const faqs = J && T.length ? J.faq.map(f => [sc2(pk(f.question) + ' ' + pk(f.answer)), f]).filter(x => x[0] >= .5).sort((a, b) => b[0] - a[0]).slice(0, 3) : [];
    const facts = J && T.length ? J.facts.map(f => [sc2(pk(f.title) + ' ' + pk(f.body)), f]).filter(x => x[0] >= .5).sort((a, b) => b[0] - a[0]).slice(0, 3) : [];
    const meta = metaX, all = await data({ fr: 'search_fr.json', ar: 'search_ar.json', en: 'search.json' }[lang()]), D = await data('duas.json');
    const starts = [0]; meta.s.forEach(m => starts.push(starts[starts.length - 1] + m[3]));
    const score = txt => { const f = fold(txt); let sc = 0, hit = 0; for (const w of T) if (f.includes(w)) { hit++; sc += 1 + (f.split(w).length - 2) * .2; } return hit ? sc * hit / T.length : 0; };
    const vs = []; for (let i = 0; i < all.length; i++) { const sc = score(all[i]); if (sc > 0) vs.push([sc, i]); }
    vs.sort((a, b) => b[0] - a[0]);
    const ds = []; for (const c of D) for (const x of c.d) { const txt = ((lang() === 'fr' && x.fr) || x.en) + ' ' + ((lang() === 'fr' && c.tf) || c.t); const sc = score(txt); if (sc > 0) ds.push([sc, c, x]); }
    ds.sort((a, b) => b[0] - a[0]);
    const ref = i => { let s = 1; while (starts[s] <= i) s++; return [s, i - starts[s - 1] + 1]; };
    const GR = { sahih2: 'Sahih · in Al-Bukhari or Muslim', sahih_alb: 'Sahih · graded by Al-Albani', hasan: 'Hasan', quran: 'Quran', ref: 'Source cited, grade not shown' };
    if (DISTRESS.test(fold(q))) { out.innerHTML = `<div class="note care">${t('<b>You are not alone.</b> If you are thinking about ending your life or are in danger, call now: 3114 in France (free, 24/7), or your local emergency number. Talking to someone helps.')}</div><a class="card row" href="#/duas/34"><span><b>${t('Duas for anxiety and sorrow')}</b></span>${icon.chev}</a>`; return; }
    const help = false ? `<div class="note care">${t('<b>You are not alone.</b> If you are thinking about ending your life or are in danger, call now: 3114 in France (free, 24/7), or your local emergency number. Talking to someone helps.')}</div>` : '';
    out.innerHTML = help + (RULING.test(q) ? `<div class="note">${t('<b>This looks like a question about a ruling.</b> safa. does not give rulings. Here are related texts; for the ruling itself, ask a person of knowledge or a recognised fatwa body.')}</div>` : '')
      + (top.length ? `<h3 class="sect">${t('Best match')}</h3>` + top.join('') : '')
      + (vs.length || ds.length || top.length || faqs.length || facts.length ? '' : `<p class="muted pad">${t('No passage found. Try other words, or fewer: “patience”, “parents”, “fear”. For a personal question, a person of knowledge will help you better.')}</p><div class="chips wrapc pad"><span class="mono">${t('Browse instead')}</span><a class="chip" href="#/duas">${t('Duas')}</a><a class="chip" href="#/journey/faq">${t('Questions')}</a><a class="chip" href="#/journey/facts">${t('100 essentials')}</a><a class="chip" href="#/quran">${t('Quran')}</a></div>`)
      + (faqs.length ? `<h3 class="sect">${t('Questions')}</h3>` + faqs.map(([, f]) => `<a class="card row" href="#/journey/faq/${f.id}"><span><span class="mono">FAQ</span><b>${esc(pk(f.question))}</b></span>${icon.chev}</a>`).join('') : '')
      + (facts.length ? `<h3 class="sect">${t('Guides')}</h3>` + facts.map(([, f]) => `<a class="card row" href="#/journey/facts/${f.id}"><span><span class="mono">${t('Essential')} ${f.id}</span><b>${esc(pk(f.title))}</b></span>${icon.chev}</a>`).join('') : '')
      + (vs.length ? `<h3 class="sect">${t('From the Quran')}</h3>` + vs.slice(0, 6).map(([, i]) => { const [s, v] = ref(i); return `<a class="quote" href="#/quran/${s}/${v}"><p ${lang() === 'ar' ? 'lang="ar" dir="rtl" class="ar"' : ''}>« ${esc(all[i])} »</p><span class="mono">${esc(surahName(meta, s))} ${s}:${v} · ${t('Translation: {x}', { x: lang() === 'fr' ? 'Rashid Maash' : lang() === 'ar' ? t('Arabic text') : 'Talal Itani' })}</span></a>`; }).join('') : '')
      + (ds.length ? `<h3 class="sect">${t('From Hisnul Muslim')}</h3>` + ds.slice(0, 4).map(([, c, x]) => `<a class="quote" href="#/duas/${c.id}"><p class="ar" lang="ar" dir="rtl">${esc(x.ar.slice(0, 220))}${x.ar.length > 220 ? '…' : ''}</p>${lang() !== 'ar' ? `<p>« ${esc(((lang() === 'fr' && x.fr) || x.en).slice(0, 260))} »</p>` : ''}<span class="mono">${esc((lang() === 'fr' && c.tf) || (lang() === 'ar' && c.ta) || c.t)}${x.ref ? ' · ' + esc(x.ref) : ''}${x.gr ? ' · ' + t(GR[x.gr] || '') : ''}</span></a>`).join('') : '')
      + `<p class="muted small pad">${t('Results are matched on words, not understood by an AI. Read each passage in its context before drawing any conclusion.')}</p>`;
  };
  $('#af', root).onsubmit = e => { e.preventDefault(); run(true); $('#aq', root).blur(); };
  let tm, tc; $('#aq', root).oninput = () => { clearTimeout(tm); clearTimeout(tc); const v0 = $('#aq', root).value.trim(); tm = setTimeout(() => { if ($('#aq', root)) run(false); }, /^\d{1,3}\s*[:.,]\s*\d{1,3}$/.test(v0) ? 0 : 400); tc = setTimeout(() => { const el = $('#aq', root); if (!el) return; const v = el.value.trim(); if (v.length >= 3) { remember(v); drawRecent(); } }, 2500); };
  if (last) run(); $('#aq', root).focus({ preventScroll: true });
}
