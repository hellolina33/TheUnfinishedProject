import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('day-08-safa/app');
const d=JSON.parse(fs.readFileSync(path.join(root,'data/journey.json'),'utf8'));
test('The collection delivers 100 numbered references across ten equally sized themes',()=>{
 assert.deepEqual(d.facts.map(f=>f.id),Array.from({length:100},(_,i)=>i+1));
 assert.equal(d.categories.length,10);
 for(const c of d.categories)assert.equal(d.facts.filter(f=>f.category===c.id).length,10,c.id);
});
test('All facts, life moments and FAQ have actual content in three languages',()=>{
 for(const item of [...d.facts,...d.moments,...d.faq])for(const field of ['title','body','question','answer','intro'])if(item[field])for(const l of ['fr','en','ar'])assert.ok(item[field][l]?.trim(),`${item.id} ${field} ${l}`);
 for(const q of d.faq)assert.ok(q.answer||q.facts?.length);
 assert.equal(d.faq.length,32);assert.equal(d.moments.length,24);
});
test('Reading references and life journeys never point to missing records',()=>{
 const ids=new Set(d.sources.map(s=>s.id));assert.equal(ids.size,d.sources.length);
 for(const item of [...d.facts,...d.faq])for(const id of item.sources)assert.ok(ids.has(id),id);
 for(const m of d.moments){assert.equal(m.phases.length,3);for(const id of m.phases.flat())assert.ok(d.facts[id-1],id);assert.ok(fs.existsSync(path.join(root,`illustrations/life/${m.image}.webp`)));}
 for(const f of d.faq)for(const id of f.facts||[])assert.ok(d.facts[id-1]);
 for(const s of d.sources)assert.equal(new URL(s.url).protocol,'https:');
});
test('Scripture verse references exist in the Quran data shipped by Safa',()=>{
 for(const s of d.sources.filter(x=>x.id.startsWith('q'))){const [surah,verse]=s.id.slice(1).split('.').map(Number);const q=JSON.parse(fs.readFileSync(path.join(root,`data/quran/${surah}.json`),'utf8'));if(verse)assert.ok(q.v[verse-1],s.id);}
});
test('The offline shell contains every added illustration and every file exists',()=>{
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');const shell=sw.match(/const SHELL = \[([\s\S]*?)\];/)[1];
 const files=[...shell.matchAll(/'([^']+)'/g)].map(x=>x[1]);
 for(const f of files)assert.ok(fs.existsSync(path.join(root,f)),f);
 for(const folder of ['life','women'])for(const f of fs.readdirSync(path.join(root,'illustrations',folder)))assert.ok(files.includes(`illustrations/${folder}/${f}`),f);
 assert.ok(files.includes('data/journey.json'));assert.ok(files.includes('js/views/journey.js'));
});
