// Tajweed colours, computed from the Uthmani (KFGQPC Hafs) spelling of each verse.
// The script already encodes the rules: open tanween and a noon written without sukun mean the
// noon sound is merged or hidden; a small meem means iqlab; a sukun on ق ط ب ج د means qalqala.
// Five families, like most Quran apps: qalqala, iqlab, idgham, ikhfa, ghunna.
export const RULES = ['qalqala', 'iqlab', 'idgham', 'ikhfa', 'ghunna'];

const HARAKA = /[ً-ِٖٗٞ]/;   // vowels and all tanween
const OPEN_TANWEEN = /[ٖٗٞ]/;           // tanween written "open": not pronounced clearly
const SHADDA = 'ّ';
const SUKUN = /[ْۡ]/;
const SMALL_MEEM = /[ۭۢ]/;
const IKHFA = 'تثجدذزسشصضطظفقك';
const QALQALA = 'قطبجد';
const MARK = /\p{M}/u;

// Split a word into clusters: one base letter and the marks written on it.
function clusters(word) {
  const out = [];
  for (const ch of word) {
    if (MARK.test(ch) && out.length) out[out.length - 1].m += ch;
    else out.push({ b: ch, m: '' });
  }
  return out;
}
const isLetter = c => /[ء-يٱ]/.test(c.b);
// Letters that are written but not pronounced here: the alef after a fathatan, a bare alef maqsura, a bare waw or ya of spelling.
const silent = c => (c.b === 'ا' || c.b === 'ى' || c.b === 'ٱ') && !HARAKA.test(c.m) && !c.m.includes(SHADDA);

/**
 * @param {string[]} words the verse, word by word
 * @param {boolean} stop  true when the reader stops after this verse (qalqala on the last letter)
 * @returns {string[]} the same words as HTML, with <span class="tj tj-rule"> around coloured letters
 */
export function tajweed(words, stop = true) {
  const W = words.map(clusters), tag = W.map(w => w.map(() => null));
  const flat = []; W.forEach((w, i) => w.forEach((c, j) => flat.push([i, j, c])));
  const nextLetter = k => { for (let x = k + 1; x < flat.length; x++) { const c = flat[x][2]; if (!isLetter(c) || silent(c)) continue; return c; } return null; };
  let lastLetter = -1; flat.forEach(([, , c], k) => { if (isLetter(c)) lastLetter = k; });
  flat.forEach(([i, j, c], k) => {
    if (!isLetter(c)) return;
    const b = c.b, m = c.m;
    let rule = null;
    if ((b === 'ن' || b === 'م') && m.includes(SHADDA)) rule = 'ghunna';
    else if (QALQALA.includes(b) && (SUKUN.test(m) || (stop && k === lastLetter))) rule = 'qalqala';
    else if (SMALL_MEEM.test(m)) rule = 'iqlab';
    else if (OPEN_TANWEEN.test(m) || (b === 'ن' && !HARAKA.test(m) && !SUKUN.test(m) && !m.includes(SHADDA) && k !== lastLetter)) {
      const n = nextLetter(k);
      if (n) {
        if (n.b === 'ب') rule = 'iqlab';
        else if ('ينمولر'.includes(n.b)) rule = 'idgham';
        else if (IKHFA.includes(n.b)) rule = 'ikhfa';
      }
    } else if (b === 'م' && !HARAKA.test(m) && !SUKUN.test(m) && k !== lastLetter) {
      const n = nextLetter(k);
      if (n && n.b === 'ب') rule = 'ikhfa';         // ikhfa shafawi
      else if (n && n.b === 'م') rule = 'idgham';   // idgham shafawi
    }
    tag[i][j] = rule;
  });
  return W.map((w, i) => {
    let html = '', open = null;
    w.forEach((c, j) => {
      const r = tag[i][j];
      if (r !== open) { if (open) html += '</span>'; if (r) html += `<span class="tj tj-${r}">`; open = r; }
      html += c.b + c.m;
    });
    if (open) html += '</span>';
    return html;
  });
}
