// Smoke tests for The Unfinished 30 / Day 04. No user data or network calls.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const base = path.resolve(process.cwd());
const folder = path.join(base, 'day-04-productivity-library');
const html = fs.readFileSync(path.join(folder,'index.html'),'utf8');
const js = fs.readFileSync(path.join(folder,'studio.js'),'utf8');
const css = fs.readFileSync(path.join(folder,'studio.css'),'utf8');
const start = html.indexOf('var TOOLS = ');
const end = html.indexOf('/* ---------- helpers ---------- */');
if (start<0||end<=start)throw Error('Canonical dataset missing');
const data = vm.runInNewContext(html.slice(start,end)+'\nTOOLS');
if (data.length!==50)throw Error('Expected 50 methods, got '+data.length);
const families=['prioritise','organise','focus','decide','review'];
for (const f of families) if(data.filter(x=>x.f===f).length!==10)throw Error('Expected 10 methods in '+f);
for(const t of data){
  if(!t.id||!t.n||!t.why||!t.d||!t.src||!Array.isArray(t.solo)||!Array.isArray(t.team))throw Error('Incomplete tool '+t.id);
  const file=path.join(folder,'tools',t.id,'index.html');
  if(!fs.existsSync(file))throw Error('Missing share page '+t.id);
  const page=fs.readFileSync(file,'utf8');
  if(!page.includes('#/tool/'+t.id))throw Error('Share page link missing '+t.id);
}
new vm.Script(js); // Catch JS syntax regressions.
if(!css.includes('.s-slide'))throw Error('Slide styles missing');
if(!html.includes('window.__PRODUCTIVITY_INTERNALS={TOOLS:TOOLS}'))throw Error('Missing data handoff');
if(!html.includes('src="studio.js"'))throw Error('Studio script missing');
const main=fs.readFileSync(path.join(base,'index.html'),'utf8');
if(!main.includes("n: 4, name: 'Productivity Library'"))throw Error('Challenge Day 04 missing');
// Test 50 methods × 3 ratios × 2 exports with deterministic stand-ins.
// These checks validate JS control flow, eight pages, and native shape calls.
// They are not a substitute for real binary or visual quality assurance.
let passes=0;
for(const tool of data)for(const ratio of ['16:9','9:10','9:16']){
  const output=[],handlers={};
  class StubPpt{
    constructor(){this.slides=[];this.ShapeType={rect:'rect',line:'line',ellipse:'ellipse'};}
    defineLayout(){}
    addSlide(){const s={text:0,shapes:0,addText(){this.text++},addShape(){this.shapes++}};this.slides.push(s);return s;}
    async writeFile({fileName}){output.push({kind:'pptx',fileName,pages:this.slides.length,shapes:this.slides.reduce((n,s)=>n+s.shapes,0)});}
  }
  class StubPdf{
    constructor(){this.pages=1;}addPage(){this.pages++}
    setDrawColor(){}setLineWidth(){}line(){}setFont(){}setFontSize(){}setTextColor(){}text(){}rect(){}circle(){}setFillColor(){}
    splitTextToSize(s){return[String(s)]}
    save(fileName){output.push({kind:'pdf',fileName,pages:this.pages})}
  }
  const app={_html:'',set innerHTML(x){this._html=x},get innerHTML(){return this._html},addEventListener(name,handler){handlers[name]=handler},querySelector(){return {disabled:false}}};
  const context={window:{__PRODUCTIVITY_INTERNALS:{TOOLS:data},PptxGenJS:StubPpt,jspdf:{jsPDF:StubPdf},addEventListener(){}},
    document:{getElementById(id){return id==='app'?app:null},addEventListener(){},body:{append(){}},createElement(){return {remove(){},setAttribute(){}}}},
    localStorage:{getItem(){return JSON.stringify({ratio})},setItem(){}},
    location:{hash:'#/tool/'+tool.id,href:'https://example.com/#/tool/'+tool.id},
    navigator:{},setTimeout(){},console};
  vm.runInNewContext(js,context,{timeout:1500});
  for(const action of ['pptx','pdf']){
    handlers.click({target:{closest(sel){return sel==='[data-family]'?null:{dataset:{act:action}}}}});
    await new Promise(resolve=>setImmediate(resolve));
  }
  if(output.length!==2)throw Error('Missing export: '+tool.id+' '+ratio);
  for(const result of output){
    if(result.pages!==8)throw Error('Not eight pages: '+tool.id+' '+ratio+' '+result.kind);
    if(result.kind==='pptx'&&result.shapes<12)throw Error('No native shapes: '+tool.id+' '+ratio);
    passes++;
  }
}
console.log('PASS: 50 tools, 5×10 categories, 50 share pages, 150 PPTX, 150 PDF mocked outputs ('+passes+' checks).');
