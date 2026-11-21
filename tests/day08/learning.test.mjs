import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { PATHS, FAQ_TOPICS } from '../../day-08-safa/app/js/views/learning-paths.js';

const app = new URL('../../day-08-safa/app/', import.meta.url);
const content = JSON.parse(readFileSync(new URL('data/journey.json', app)));
const shell = readFileSync(new URL('sw.js', app), 'utf8');

test('Every learning step has a sourced fact and a valid Safa destination', () => {
  const facts = new Map(content.facts.map(fact => [fact.id, fact]));
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
        assert.ok(moments.has(section) || section === 'prayer' || (section === 'facts' && facts.has(Number(arg))));
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
