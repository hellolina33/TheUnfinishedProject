// Smoke tests for The Unfinished 30 / Day 04. No user data or network calls.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const base = path.resolve(process.cwd());
const folder = path.join(base, 'day-04-productivity-library');
const html = fs.readFileSync(path.join(folder,'index.html'),'utf8');
const js = fs.readFileSync(path.join(folder,'studio.js'),'utf8');
const css = fs.readFileSync(path.join(folder,'studio.css'),'utf8');
const methods = fs.readFileSync(path.join(folder,'methods.js'),'utf8');
const deck = fs.readFileSync(path.join(folder,'deck.js'),'utf8');
const data = vm.runInNewContext(methods+'\nwindow.__PRODUCTIVITY_INTERNALS.TOOLS',{window:{}});
if (data.length!==50)throw Error('Expected 50 methods, got '+data.length);
const families=['prioritise','organise','focus','decide','review'];
for (const f of families) if(data.filter(x=>x.f===f).length!==10)throw Error('Expected 10 methods in '+f);
for(const t of data){
  if(!t.id||!t.n||!t.why||!t.d||!t.src||!Array.isArray(t.solo)||!Array.isArray(t.team))throw Error('Incomplete tool '+t.id);
  if (!t.fr?.n || !t.fr.why || !t.fr.ex || !t.fr.src || !t.fr.solo.length || !t.fr.team.length || t.fr.d[0]!==t.d[0]) {
    throw Error('Incomplete French tool '+t.id);
  }
  for(const version of [t,t.fr]){
    if(!version.case?.scene || !version.case.check || !version.case.reasoning || !version.outcome || !version.pitfall || !version.exampleNote)throw Error('Incomplete worked case '+t.id);
  }
  const file=path.join(folder,'tools',t.id,'index.html');
  if(!fs.existsSync(file))throw Error('Missing share page '+t.id);
  const page=fs.readFileSync(file,'utf8');
  if(!page.includes('#/tool/'+t.id))throw Error('Share page link missing '+t.id);
}
new vm.Script(js); // Catch JS syntax regressions.
if(!css.includes('.s-slide'))throw Error('Slide styles missing');
for(const file of ['methods.js','deck.js','studio.js']){
  if(!html.includes('src="'+file+'"'))throw Error('Missing script '+file);
}
if(!html.includes('src="studio.js"'))throw Error('Studio script missing');
const catalogue=fs.readFileSync(path.join(base,'showcase','prototypes.js'),'utf8');
if(!catalogue.includes("n: 4, name: 'Productivity Library'"))throw Error('Challenge Day 04 missing');
// Test 50 methods × 2 languages × 3 ratios × 2 exports with deterministic stand-ins.
// These checks validate JS control flow, eight pages, and native shape calls.
// They are not a substitute for real binary or visual quality assurance.
let passes=0;
for(const tool of data)for(const lang of ['en','fr'])for(const ratio of ['16:9','9:10','9:16']){
  const output=[],handlers={};
  class StubPpt{
    constructor(){this.slides=[];this.ShapeType={rect:'rect',line:'line',ellipse:'ellipse'};}
    defineLayout(){}
    addSlide(){const s={text:0,shapes:0,addText(){this.text++},addShape(){this.shapes++}};this.slides.push(s);return s;}
    async writeFile({fileName}){output.push({kind:'pptx',fileName,pages:this.slides.length,shapes:this.slides.reduce((n,s)=>n+s.shapes,0)});}
  }
  class StubPdf{
    constructor(){this.pages=1;}setProperties(){}addPage(){this.pages++}
    setDrawColor(){}setLineWidth(){}line(){}setFont(){}setFontSize(){}setTextColor(){}text(){}rect(){}circle(){}setFillColor(){}
    splitTextToSize(s){return[String(s)]}
    save(fileName){output.push({kind:'pdf',fileName,pages:this.pages})}
  }
  const app={_html:'',set innerHTML(x){this._html=x},get innerHTML(){return this._html},addEventListener(name,handler){handlers[name]=handler},querySelector(){return null}};
  const context={window:{__PRODUCTIVITY_INTERNALS:{TOOLS:data},PptxGenJS:StubPpt,jspdf:{jsPDF:StubPdf},addEventListener(){}},
    document:{documentElement:{lang},getElementById(id){return id==='app'?app:null},addEventListener(){},body:{append(){}},createElement(){return {remove(){},setAttribute(){}}}},
    localStorage:{getItem(){return null},setItem(){throw Error("Unexpected browser storage write")}},
    location:{hash:'#/tool/'+tool.id,href:'https://example.com/#/tool/'+tool.id},
    navigator:{},setTimeout(){},console};
  vm.runInNewContext(deck,context,{timeout:1500});
  vm.runInNewContext(js,context,{timeout:1500});
  if(context.document.documentElement.lang!==lang || !app.innerHTML.includes(lang==='fr'?tool.fr.n:tool.n)){
    throw Error('Wrong rendered locale: '+tool.id+' '+lang);
  }
  if((app.innerHTML.match(/role="tab"/g)||[]).length!==3 || /s-detailhead[^]*?<button[^]*?<\/section>/.test(app.innerHTML.split('role="tablist"')[0])){
    throw Error('Expected three views and no duplicate presentation action');
  }
  await handlers.change({target:{id:"ratio",value:ratio}});
  for(const action of ['pptx','pdf']){
    handlers.click({target:{closest(sel){return sel==='[data-family]'?null:{dataset:{act:action}}}}});
    await new Promise(resolve=>setImmediate(resolve));
  }
  if(output.length!==2)throw Error('Missing export: '+tool.id+' '+ratio);
  for(const result of output){
    if(!result.fileName.includes('-'+lang+'-'+ratio.replace(':','x')))throw Error('Incorrect export locale filename');
    if(result.pages!==8)throw Error('Not eight pages: '+tool.id+' '+ratio+' '+result.kind);
    if(result.kind==='pptx'&&result.shapes<12)throw Error('No native shapes: '+tool.id+' '+ratio);
    passes++;
  }
}
console.log('PASS: 50 tools, 5×10 categories, 50 share pages, 300 PPTX, 300 PDF mocked outputs ('+passes+' checks).');
