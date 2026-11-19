// Sourced answers: finds and quotes passages from the Quran translations and Hisnul Muslim.
// It never writes an answer of its own and refuses to give rulings.
import { S, data } from '../store.js';
import { $, esc, icon } from '../ui.js';
import { t, lang } from '../i18n.js';
import { surahName } from './quran.js';

const STOP = new Set(('a an the of to in on for and or is are was be it this that what how why when who do does did can i my me we you your with from about there their them his her allah god ' +
  'le la les un une des de du d l et ou est sont a au aux en pour par sur que qui quoi comment pourquoi quand je j me mon ma mes tu te ton ta tes il elle on nous vous ils elles ce cet cette ces dans avec se sa son ses y ne pas plus dieu allah ' +
  'في من على إلى عن ما ماذا كيف لماذا هل أن إن هو هي هم أنا نحن الله').split(' '));
const RULING = /\b(halal|haram|allowed|permitted|forbidden|ruling|fatwa|permis|interdit|autoris|licite|illicite|obligatoire|obligatory|حلال|حرام|يجوز|حكم|فتوى)/i;
// A few bridges between everyday words and the vocabulary of the translations.
const SYN = {
  fr: { stress: 'angoisse inquiet', anxiete: 'angoisse crainte', triste: 'tristesse affliger', patience: 'patient endurance', pardon: 'pardon repent', parents: 'pere mere', mere: 'mere parents', mariage: 'epouse epoux', argent: 'biens richesse', mort: 'mort trepas', paradis: 'jardin paradis', enfer: 'feu enfer', priere: 'priere salat', jeune: 'jeune ramadan', aumone: 'aumone zakat' },
  en: { stress: 'grief distress fear', anxiety: 'fear grief', sad: 'grief sorrow', parents: 'father mother parents', marriage: 'wives spouse', money: 'wealth property', heaven: 'garden paradise', hell: 'fire', fasting: 'fast', charity: 'charity zakah' }
};
const fold = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ًͯ-ْٰ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/[’']/g, ' ');
const terms = q => { let w = fold(q).split(/[^a-z0-9ء-ي]+/).filter(x => x.length > 2 && !STOP.has(x)); const syn = SYN[lang()] || {}; w = w.concat(...w.map(x => (syn[x] || '').split(' ').filter(Boolean))); return [...new Set(w)]; };
const stem = x => x.length > 5 ? x.slice(0, x.length - 2) : x;

let last = '';
export async function renderAsk(root) {
  root.innerHTML = `<header class="sub"><a href="#/quran" class="ib" aria-label="${t('Back')}">${icon.back}</a><b>${t('Sourced answers')}</b><span class="ib"></span></header>
    <p class="lead pad">${t('Ask a question. safa. answers only with quoted verses and duas, with their reference. It never invents an answer or gives a ruling.')}</p>
    <form id="af" class="searchf">${icon.search}<input id="aq" class="inp" type="search" placeholder="${t('e.g. patience in hardship')}" value="${esc(last)}" autocomplete="off" aria-label="${t('Your question')}"></form>
    <div id="ao"></div>`;
  const out = $('#ao', root);
  const run = async () => {
    const q = $('#aq', root).value.trim(); last = q; if (q.length < 3) { out.innerHTML = ''; return; }
    out.innerHTML = `<p class="muted pad">${t('Searching…')}</p>`;
    const T = terms(q).map(stem);
    const meta = await data('meta.json'), all = await data({ fr: 'search_fr.json', ar: 'search_ar.json', en: 'search.json' }[lang()]), D = await data('duas.json');
    const starts = [0]; meta.s.forEach(m => starts.push(starts[starts.length - 1] + m[3]));
    const score = txt => { const f = fold(txt); let sc = 0, hit = 0; for (const w of T) if (f.includes(w)) { hit++; sc += 1 + (f.split(w).length - 2) * .2; } return hit ? sc * hit / T.length : 0; };
    const vs = []; for (let i = 0; i < all.length; i++) { const sc = score(all[i]); if (sc > 0) vs.push([sc, i]); }
    vs.sort((a, b) => b[0] - a[0]);
    const ds = []; for (const c of D) for (const x of c.d) { const txt = ((lang() === 'fr' && x.fr) || x.en) + ' ' + ((lang() === 'fr' && c.tf) || c.t); const sc = score(txt); if (sc > 0) ds.push([sc, c, x]); }
    ds.sort((a, b) => b[0] - a[0]);
    const ref = i => { let s = 1; while (starts[s] <= i) s++; return [s, i - starts[s - 1] + 1]; };
    const GR = { sahih2: 'Sahih · in Al-Bukhari or Muslim', sahih_alb: 'Sahih · graded by Al-Albani', hasan: 'Hasan', quran: 'Quran', ref: 'Source cited, grade not shown' };
    out.innerHTML = (RULING.test(q) ? `<div class="note">${t('<b>This looks like a question about a ruling.</b> safa. does not give rulings. Here are related texts; for the ruling itself, ask a person of knowledge or a recognised fatwa body.')}</div>` : '')
      + (vs.length || ds.length ? '' : `<p class="muted pad">${t('No passage found. Try other words, or fewer.')}</p>`)
      + (vs.length ? `<h3 class="sect">${t('From the Quran')}</h3>` + vs.slice(0, 6).map(([, i]) => { const [s, v] = ref(i); return `<a class="quote" href="#/quran/${s}/${v}"><p ${lang() === 'ar' ? 'lang="ar" dir="rtl" class="ar"' : ''}>« ${esc(all[i])} »</p><span class="mono">${esc(surahName(meta, s))} ${s}:${v} · ${t('Translation: {x}', { x: lang() === 'fr' ? 'Rashid Maash' : lang() === 'ar' ? t('Arabic text') : 'Talal Itani' })}</span></a>`; }).join('') : '')
      + (ds.length ? `<h3 class="sect">${t('From Hisnul Muslim')}</h3>` + ds.slice(0, 4).map(([, c, x]) => `<a class="quote" href="#/duas/${c.id}"><p class="ar" lang="ar" dir="rtl">${esc(x.ar.slice(0, 220))}${x.ar.length > 220 ? '…' : ''}</p>${lang() !== 'ar' ? `<p>« ${esc(((lang() === 'fr' && x.fr) || x.en).slice(0, 260))} »</p>` : ''}<span class="mono">${esc((lang() === 'fr' && c.tf) || (lang() === 'ar' && c.ta) || c.t)}${x.ref ? ' · ' + esc(x.ref) : ''}${x.gr ? ' · ' + t(GR[x.gr] || '') : ''}</span></a>`).join('') : '')
      + `<p class="muted small pad">${t('Results are matched on words, not understood by an AI. Read each passage in its context before drawing any conclusion.')}</p>`;
  };
  $('#af', root).onsubmit = e => { e.preventDefault(); run(); };
  let tm; $('#aq', root).oninput = () => { clearTimeout(tm); tm = setTimeout(run, 400); };
  if (last) run(); else $('#aq', root).focus();
}
