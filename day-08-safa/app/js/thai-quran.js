import { data } from './store.js';

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
