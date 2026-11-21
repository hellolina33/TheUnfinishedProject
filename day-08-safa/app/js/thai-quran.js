import { data } from './store.js';

export const normalizeThaiDigits = text => text.replace(/[๐-๙]/g, digit => String(digit.charCodeAt(0) - '๐'.charCodeAt(0)));

export const THAI_QURAN_LABEL = 'King Fahd Complex (Thai translation)';
// The source and import commit are recorded in the Safa README.
export async function thaiSurah(surah) {
  const index = await data('thai-quran/index.json');
  const group = index[surah];
  if (!group) throw new RangeError('Invalid surah');
  return (await data(`thai-quran/${group}.json`))[surah];
}

let searchIndex;
export function thaiQuranIndex() {
  if (!searchIndex) searchIndex = (async () => {
    const index = await data('thai-quran/index.json');
    const groups = new Map();
    const ids = [...new Set(Object.values(index))];
    // Bound concurrent reads when building the index on an uncached device.
    for (let i = 0; i < ids.length; i += 5) {
      await Promise.all(ids.slice(i, i + 5).map(async id => groups.set(id, await data(`thai-quran/${id}.json`))));
    }
    return Array.from({ length: 114 }, (_, i) => groups.get(index[i + 1])[i + 1]).flat();
  })().catch(error => { searchIndex = null; throw error; });
  return searchIndex;
}


// Match the exact Arabic tokens before offering a gloss. If the reader text or
// its tokenisation changes, a gloss must never move to a different word.
export function alignThaiGlosses(study, verses) {
  return verses.map(({ a }, index) => {
    const row = study[index];
    if (!row || row.arabic.length !== a.length || row.thai.length !== a.length ||
        a.some((word, j) => word !== row.arabic[j])) return null;
    return row.thai;
  });
}

export async function thaiWordStudy(surah, verses) {
  if (![1, 112, 113, 114].includes(surah)) return [];
  const chapters = await data('thai-quran/word-study.json');
  return alignThaiGlosses(chapters[surah] || [], verses);
}
