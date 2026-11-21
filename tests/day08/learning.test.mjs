import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { PATHS, FAQ_TOPICS, PATH_THEMES, resumeLearning } from '../../day-08-safa/app/js/views/learning-paths.js';

const app = new URL('../../day-08-safa/app/', import.meta.url);
const content = JSON.parse(readFileSync(new URL('data/journey.json', app)));
const shell = readFileSync(new URL('sw.js', app), 'utf8');

test('Every learning step has a sourced fact and a valid Safa destination', () => {
  const facts = new Map(content.facts.map(fact => [fact.id, fact]));
  const faq = new Set(content.faq.map(item => item.id));
  const moments = new Set(content.moments.map(moment => moment.id));
  assert.equal(new Set(PATHS.map(path => path.id)).size, PATHS.length);
  for (const path of PATHS) {
    assert.ok(path.steps.length);
    assert.ok(path.title.every(Boolean) && path.intro.every(Boolean));
    for (const step of path.steps) {
      assert.ok(facts.get(step.fact)?.sources.length, `${path.id} / ${step.fact}`);
      const [screen, section, arg] = step.to.split('/');
      if (screen === 'quran') assert.ok(existsSync(new URL(`data/quran/${section}.json`, app)));
      else if (screen === 'learn') assert.equal(section, 'wudu');
      else {
        assert.equal(screen, 'journey');
        assert.ok(moments.has(section) || section === 'prayer' || (section === 'facts' && facts.has(Number(arg))) || (section === 'faq' && faq.has(Number(arg))), step.to);
      }
      if (step.check) assert.ok(step.check.options[step.check.correct]?.every(Boolean));
    }
  }
});

test('The FAQ groups every question and ships its illustrations for offline use', () => {
  const grouped = FAQ_TOPICS.flatMap(topic => topic.ids).sort((a,b)=>a-b);
  assert.deepEqual(grouped, content.faq.map(item => item.id).sort((a,b)=>a-b));
  for (const image of [...PATHS, ...FAQ_TOPICS, { image:'covers/courtyard' }].map(item=>item.image)) {
    const path = `illustrations/${image}.webp`;
    assert.ok(existsSync(new URL(path,app)),path);
    assert.ok(shell.includes(`'${path}'`),path);
  }
  for (const file of ['learning.css','js/views/learning-paths.js']) assert.ok(shell.includes(`'${file}'`));
});


test('Expanded paths preserve previously completed lessons and resume at the extension', () => {
  const oldFirstFacts = {
    'first-prayer': [11, 16, 12],
    'quran-start': [3, 32, 33],
    daily: [61, 63, 62],
    ramadan: [72, 74, 76],
    returning: [46, 34, 50],
  };
  const themes = new Set(PATH_THEMES.map(([theme]) => theme));
  for (const path of PATHS) {
    assert.ok(themes.has(path.theme), path.id);
    const previous = oldFirstFacts[path.id];
    if (!previous) continue;
    assert.deepEqual(path.steps.slice(0,3).map(step => step.fact), previous);
    assert.ok(path.steps.length > previous.length);
    assert.deepEqual(resumeLearning(path, { current:2, completed:[0,1,2], at:50 }).completed, [0,1,2]);
    assert.equal(resumeLearning(path, { current:2, completed:[0,1,2], at:50 }).current, 3);
    assert.equal(resumeLearning(path, { current:1, completed:[0], at:50 }).current, 1);
    assert.equal(resumeLearning(path, { current:2, completed:[0,1,2], total:path.steps.length, at:50 }).current, 2);
  }
});

test('Each learning step has substantial reading, practice and Thai content', async () => {
  const { PATHS } = await import('../../day-08-safa/app/js/views/learning-paths.js');
  const { LESSON_READING, LEGACY_PRACTICE } = await import('../../day-08-safa/app/js/views/lesson-reading.js');
  const { TH } = await import('../../day-08-safa/app/js/i18n-th.js');
  let count = 0;
  for (const path of PATHS) {
    assert.equal(LESSON_READING[path.id].length, path.steps.length, path.id);
    for (const [i, step] of path.steps.entries()) {
      count++;
      const reading = LESSON_READING[path.id][i];
      assert.ok(reading.every(paragraph => paragraph.length >= 125), step.title[1]);
      assert.match(TH[reading[1]], /[\u0e00-\u0e7f]/, step.title[1]);
      assert.ok(step.practice || LEGACY_PRACTICE[path.id]?.[i], step.title[1]);
    }
  }
  assert.equal(count, 46);
});

test('Thai localization covers the reference library and preserves placeholders', async () => {
  const { missing } = await import('../../day-08-safa/app/js/i18n.js');
  const { fr, ar, th } = missing();
  for (const key of new Set([...Object.keys(fr), ...Object.keys(ar)])) assert.ok(th[key], key);
  const markers = text => (text.match(/\{\w+\}|<\/?[a-z]+\s*\/?>/g) || []).sort();
  for (const [source, translation] of Object.entries(th)) {
    assert.ok(translation.trim());
    assert.deepEqual(markers(translation), markers(source), source);
  }
  const dataRoot = new URL('../../day-08-safa/app/data/', import.meta.url);
  const read = path => JSON.parse(readFileSync(new URL(path, dataRoot), 'utf8'));
  const { facts, categories, moments, faq } = read('journey.json');
  const fields = [
    ...facts.flatMap(x => [x.title, x.body]),
    ...categories.map(x => x.title),
    ...moments.flatMap(x => [x.title, x.intro]),
    ...faq.flatMap(x => [x.question, x.answer]),
  ];
  for (const { en } of fields.filter(Boolean)) if (en) assert.match(th[en], /[\u0e00-\u0e7f]/, en);
  for (const chapter of read('duas.json')) {
    assert.ok(th[chapter.t], chapter.t);
    for (const dua of chapter.d) if (dua.en) assert.ok(th[dua.en], dua.en);
  }
});

test('The published Thai Quran aligns with all 6,236 existing verse references', () => {
  const dataRoot = new URL('../../day-08-safa/app/data/', import.meta.url);
  const read = path => JSON.parse(readFileSync(new URL(path, dataRoot), 'utf8'));
  const index = read('thai-quran/index.json');
  const groups = Object.fromEntries([...new Set(Object.values(index))].map(id => [id, read(`thai-quran/${id}.json`)]));
  const verses = read('meta.json').s.map((chapter, i) => {
    const id = i + 1;
    const lines = groups[index[id]][id];
    assert.equal(lines.length, chapter[3], id);
    assert.ok(lines.every(line => /[\u0e00-\u0e7f]/.test(line)), id);
    return lines.length;
  });
  assert.equal(verses.reduce((a,b) => a+b), 6236);
});

test('The Quran list can get the weekday before any city is configured', async () => {
  const { weekday, gregorian, fmtTime } = await import('../../day-08-safa/app/js/prayer.js');
  const { S } = await import('../../day-08-safa/app/js/store.js');
  assert.equal(S.loc, null);
  assert.match(weekday(Date.now()), /day$/);
  assert.ok(gregorian(Date.now()));
  assert.match(fmtTime(Date.now()), /\d{2}:\d{2}/);
});

test('Thai word study aligns all 87 glosses with the exact Arabic words', async () => {
  const { alignThaiGlosses } = await import('../../day-08-safa/app/js/thai-quran.js');
  const read = path => JSON.parse(readFileSync(new URL('data/' + path, app), 'utf8'));
  const study = read('thai-quran/word-study.json');
  const chapters = Object.entries(study);
  assert.deepEqual(chapters.map(([s]) => Number(s)), [1, 112, 113, 114]);
  let total = 0;
  for (const [s, rows] of chapters) {
    const { v } = read(`quran/${s}.json`);
    assert.equal(rows.length, v.length);
    const aligned = alignThaiGlosses(rows, v);
    for (const glosses of aligned) {
      assert.ok(glosses);
      assert.ok(glosses.every(value => /[\u0e00-\u0e7f]/.test(value)));
      total += glosses.length;
    }
  }
  assert.equal(total, 87);
  const first = study[1][0];
  assert.deepEqual(alignThaiGlosses([first], [{ a: [...first.arabic].reverse() }]), [null]);
  assert.deepEqual(alignThaiGlosses([], [{ a: first.arabic }]), [null]);
  assert.ok(shell.includes("'data/thai-quran/word-study.json'"));
});

test('Basmala word study keeps the 112 preludes and the two numbered occurrences distinct', async () => {
  const { hasBasmala, basmalaWordIndex, basmalaWord, BASMALA_TRANSLITERATION } = await import('../../day-08-safa/app/js/basmala.js');
  const read = path => JSON.parse(readFileSync(new URL('data/' + path, app), 'utf8'));
  const preludeChapters = Array.from({ length: 114 }, (_, i) => i + 1).filter(hasBasmala);
  assert.equal(preludeChapters.length, 112);
  assert.ok(!hasBasmala(1));
  assert.ok(!hasBasmala(9));
  assert.ok(hasBasmala(27));
  const opening = read('quran/1.json').v[0].a;
  const letter = read('quran/27.json').v[29].a;
  const thai = read('thai-quran/word-study.json')[1][0].thai;
  assert.equal(opening.length, 4);
  assert.deepEqual(opening.map((_, j) => basmalaWordIndex(opening, opening, j)), [0, 1, 2, 3]);
  assert.deepEqual(letter.map((_, j) => basmalaWordIndex(letter, opening, j)), [-1, -1, -1, -1, 0, 1, 2, 3]);
  assert.equal(basmalaWordIndex([...opening].reverse(), opening, 0), -1);
  assert.equal(basmalaWord(0, 'th', thai).meaning, thai[0]);
  assert.equal(basmalaWord(1, 'fr').meaning, 'd’Allah');
  assert.match(BASMALA_TRANSLITERATION, /^Bismillāhi/);
  assert.ok(shell.includes("'js/basmala.js'"));
});
