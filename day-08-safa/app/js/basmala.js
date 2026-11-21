// The opening is read separately from the numbered verses, except in Al-Fatiha.
export const hasBasmala = surah => surah !== 1 && surah !== 9;
export const BASMALA_TRANSLITERATION = 'Bismillāhi r-raḥmāni r-raḥīm';

const transliteration = ['Bismi', 'Allāhi', 'ar-Raḥmāni', 'ar-Raḥīm'];
const meanings = {
  fr: ['Au nom', 'd’Allah', 'le Tout Miséricordieux', 'le Très Miséricordieux'],
  en: ['In the name', 'of Allah', 'the Most Compassionate', 'the Most Merciful'],
};

export function basmalaWordIndex(words, opening, index) {
  if (!opening?.length) return -1;
  const start = words.findIndex((_, i) => opening.every((word, j) => word === words[i + j]));
  return start !== -1 && index >= start && index < start + opening.length ? index - start : -1;
}

export function basmalaWord(index, language, thai) {
  return { roman: transliteration[index], meaning: language === 'th' ? thai?.[index] || '' : meanings[language]?.[index] || '' };
}
