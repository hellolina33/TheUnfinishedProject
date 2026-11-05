/* Original Day 04 layouts. The same drawing instructions drive all three renderers. */
window.ProductivityDeck = (() => {
  "use strict";
  const ink = "161713", paper = "FFFDF9", orange = "FF5A32", muted = "51534D", rule = "D6D6CE", tint = "F0EDE4";
  const sizes = {"16:9":[12.8,7.2],"9:10":[8.1,9],"9:16":[7.2,12.8]};
  const spec = ratio => sizes[ratio] || sizes["16:9"];
  const list = (count, fn) => Array.from({length:count}, (_,i) => fn(i));
  const fieldNames = method => {
    const [kind, data] = method.d;
    if (kind === "matrix") return data.q;
    if (kind === "grid") return data.rows;
    if (kind === "tree") return data.kids;
    if (kind === "bars") return data.map(row => row[0]);
    return data;
  };
  const text = (content,x,y,w,h,size,bold=false,color=ink) =>
    ({type:"text",content:String(content ?? ""),x,y,w,h,size,bold,color});
  const box = (x,y,w,h,fill,stroke) => ({type:"box",x,y,w,h,fill,stroke});
  const line = (x,y,x2,y2,color=rule) => ({type:"line",x,y,x2,y2,color});
  const editable = (label,x,y,w,h) => ({...text(label,x,y,w,h,11,false,muted),type:"placeholder"});
  const number = n => String(n+1).padStart(2,"0");

  function framework(method, values, area, t, blank=false) {
    const [x,y,w,h] = area;
    const [kind,data] = method.d;
    const labels = fieldNames(method);
    const out = [];
    const portrait = h>w*.85;
    const cell = (label,value,left,top,width,height,index) => {
      const gap = Math.min(.16,height*.08);
      const labelH = height*.30;
      out.push(box(left,top,width,height,paper,rule));
      out.push(text(label,left+gap,top+gap,width-gap*2,labelH,14,true));
      if (value) out.push(text(value,left+gap,top+labelH+gap*1.25,width-gap*2,height-labelH-gap*2,13));
      else if (blank) {
        out.push(editable(t("answer"),left+gap,top+labelH+gap*1.25,width-gap*2,height-labelH-gap*2));
        out.push(line(left+gap,top+height*.69,left+width-gap,top+height*.69));
        if (height>1.05) out.push(line(left+gap,top+height*.85,left+width-gap,top+height*.85));
      }
      if (index!==undefined) out.push(box(left,top,.045,height,index===0?orange:rule));
    };
    if(method.id==="pareto" && !blank){
      const chartTop=y+.52, bottom=y+h-1.08, chartH=bottom-chartTop;
      const left=x+.43, right=x+w-.42, step=(right-left)/data.length;
      out.push(text(t("paretoScale"),x,y,w*.48,.28,11,true),text(t("paretoCumulative"),x+w*.54,y,w*.46,.28,11,true,muted));
      [0,.2,.4,.6,.8,1].forEach(fraction=>{
        const yy=bottom-chartH*fraction;
        out.push(line(left,yy,right,yy,fraction===.8?muted:rule));
        out.push(text(Math.round(100*fraction),x,yy-.07,.36,.19,8,false,muted));
      });
      const points=[];
      let total=0;
      data.forEach(([label,start,end],i)=>{
        const count=end-start;
        total+=count;
        const xx=left+i*step;
        const barH=chartH*count;
        out.push(box(xx+step*.23,bottom-barH,step*.54,barH,i<2?orange:tint));
        out.push(text(Math.round(100*count),xx+step*.25,bottom-.24,step*.48,.20,9,true));
        out.push(text(label,xx+.04,bottom+.14,step-.08,.54,11,true));
        points.push([xx+step*.50,bottom-chartH*total,total]);
      });
      points.forEach(([xx,yy,share],i)=>{
        if(i) out.push(line(points[i-1][0],points[i-1][1],xx,yy,ink));
        out.push(box(xx-.033,yy-.033,.066,.066,ink));
        out.push(text(Math.round(share*100)+" %",xx+.08,yy-.23,Math.min(.55,right+.42-xx-.08),.20,9,true));
      });
      out.push(line(left,bottom+.84,left+.27,bottom+.84,muted),text(t("paretoThreshold"),left+.37,bottom+.75,right-left-.37,.22,9,false,muted));
      return out;
    }
    if (kind==="bars" && !blank) {

      const rows = data.map(([label,start,end],index)=>({label,start,end,index}));
      const labelW=w*(portrait?.36:.28), plotW=w-labelW-.52, rh=h/(rows.length+1);
      const labelSize=portrait?12:14;
      out.push(text(t("timeScale"),x+labelW,y,plotW,.28,11,true,muted));
      rows.forEach(({label,start,end,index},i)=>{
        const yy=y+rh*(i+1);
        const value=values[index];
        const barY=yy+rh*.12, barH=rh*.42;
        out.push(text(label,x,yy,labelW-.12,rh*.8,labelSize,true));
        out.push(box(x+labelW,barY,plotW,barH,tint));
        out.push(box(x+labelW+plotW*start,barY,plotW*(end-start),barH,i?muted:orange));
        if (value) out.push(text(value,x+labelW,yy+rh*.57,plotW,rh*.38,10));
      });
      return out;
    }
    if (kind==="grid") {
      const rh=h/(labels.length+1), labelW=w*.21, cw=(w-labelW)/data.cols.length;
      data.cols.forEach((label,j)=>{
        const left=x+labelW+j*cw;
        out.push(box(left,y,cw,rh,tint,rule),text(label,left+.10,y+.13,cw-.20,rh-.22,12,true));
      });
      labels.forEach((label,i)=>{
        const yy=y+rh*(i+1), legacy=values[i];
        out.push(box(x,yy,labelW,rh,tint,rule),text(label,x+.10,yy+.12,labelW-.20,rh-.22,12,true));
        data.cols.forEach((_,j)=>{
          const xx=x+labelW+j*cw;
          const value=values["c"+i+"-"+j] || "";
          out.push(box(xx,yy,cw,rh,paper,rule));
          if(value) out.push(text(value,xx+.10,yy+.14,cw-.20,rh-.24,12));
          else if(blank && !legacy) out.push(editable(t("answer"),xx+.10,yy+.14,cw-.20,rh-.24));
        });
        if (legacy && !data.cols.some((_,j)=>values["c"+i+"-"+j])) {
          out.push(box(x+labelW,yy,w-labelW,rh,paper,rule),text(legacy,x+labelW+.10,yy+.14,w-labelW-.20,rh-.24,13));
        }
      });
      return out;
    }
    const gap=.10;
    let top=y, space=h;
    if (kind==="matrix") {
      out.push(text(data.y,x,y,w*.48,.27,11,true,muted),text(data.x,x+w*.52,y,w*.48,.27,11,true,muted));
      top+=.34; space-=.34;
    }
    if (kind==="tree") {
      out.push(box(x,top,w,.52,tint,rule),text(data.root,x+.14,top+.11,w-.28,.32,14,true));
      top+=.68; space-=.68;
    }
    const cols=kind==="matrix"?2:portrait?(labels.length>5?2:1):Math.min(labels.length,kind==="columns"&&labels.length<=4?4:3);
    const rows=Math.ceil(labels.length/cols), cw=(w-gap*(cols-1))/cols, rh=(space-gap*(rows-1))/rows;
    labels.forEach((label,i)=>{
      const prefix=["flow","timeline","cycle","steps"].includes(kind)?number(i)+"   ":"";
      cell(prefix+label,values[i],x+(i%cols)*(cw+gap),top+Math.floor(i/cols)*(rh+gap),cw,rh,i);
    });
    return out;
  }

  function compose(method, ratio, values, t, category) {
    const [w,h]=spec(ratio), wide=w>h, tall=ratio==="9:16";
    const m=wide?.66:.43, width=w-2*m, end=h-.68;
    const title=(label,heading)=>[
      text(label.toUpperCase(),m,.92,width,.26,11,true,muted),
      text(heading,m,1.24,width,wide?1.05:1.35,wide?38:32,true)
    ];
    const stepList=(steps,area,cols)=>{
      const [x,y,w,h]=area, gap=.18, cw=(w-gap*(cols-1))/cols;
      const rows=Math.ceil(steps.length/cols), rh=h/rows;
      return steps.flatMap((step,i)=>{
        const xx=x+i%cols*(cw+gap), yy=y+Math.floor(i/cols)*rh;
        return [
          line(xx,yy,xx+cw,yy),
          box(xx,yy+.10,.38,.34,orange),
          text(number(i),xx+.065,yy+.15,.27,.20,10,true),
          text(step,xx+.53,yy+.12,cw-.53,rh-.20,wide?18:17)
        ];
      });
    };
    const frame=(i,items)=>[
      box(0,0,w,h,paper),box(m,.34,.51,.07,orange),
      text("THE UNFINISHED 30  /  "+t("day"),m,.49,width-1,.23,9,true,muted),
      text(number(i)+" / 08",w-m-.52,.49,.52,.23,9,true,muted),
      ...items,line(m,end,w-m,end),
      text(method.n+"  ·  Salah Khenissi",m,end+.12,width,.31,9,true,muted)
    ];
    const y=wide?2.39:2.75, available=end-y-.16;
    const {scene,check,headlines=[]}=method.case;
    const compact=tall?6.1:wide?4.25:4.55;
    const cover=[
      box(0,.82,w,end-.83,ink),
      text(category.toUpperCase()+"  /  "+method.t+" min",m,1.25,width,.35,13,true,orange),
      text(method.n,m,wide?1.85:2.15,wide?width*.83:width,tall?2.7:2.2,wide?60:51,true,paper),
      line(m,compact,w-m,compact,muted),
      text(method.why,m,compact+.25,width,wide?1.4:1.7,wide?26:25,false,paper)
    ];
    const briefing=[
      ...title(t("caseLabel"),headlines[0]||t("caseContext")),
      box(m,y,width,wide?1.6:2.15,tint),
      text(scene,m+.24,y+.24,width-.48,wide?1.16:1.65,wide?24:23,true),
      ...stepList([t("whenPrompt"),t("successPrompt")],[m,y+(wide?1.86:2.48),width,available-(wide?1.86:2.48)],wide?2:1)
    ];
    const exampleW=wide?width*.64:width, exampleTop=wide?y:y+1.45;
    const resultX=wide?m+exampleW+.22:m, resultW=wide?width-exampleW-.22:width;
    const example=[
      ...title(t("caseLabel"),headlines[2]||t("decisionChapter")),
      box(resultX,y,resultW,wide?available:1.24,tint),
      text(t("caseDecision").toUpperCase(),resultX+.16,y+.15,resultW-.32,.24,11,true,muted),
      text(method.exampleNote,resultX+.16,y+.47,resultW-.32,wide?available-.62:.61,wide?20:17,true),
      ...framework(method,method.sampleCells||method.sample,[m,exampleTop,exampleW,end-exampleTop-.18],t)
    ];
    const action=[
      ...title(t("practice"),t("applyTitle")),
      ...stepList(method.solo,[m,y,width,available-.75],wide||(!tall&&method.solo.length>4)?2:1),
      box(m,end-.71,width,.51,tint),
      text(t("nextPrompt"),m+.13,end-.58,width-.26,.28,12,true)
    ];
    const workshop=[
      ...title(t("asTeam"),t("teamTitle")),
      ...stepList(method.team,[m,y,width,available-1.00],wide?2:1),
      box(m,end-.94,width,.74,ink),
      text(t("teamOutput"),m+.15,end-.81,width-.30,.45,17,true,paper)
    ];
    const follow=[
      ...title(t("reviewChapter"),headlines[3]||t("reviewTitle")),
      box(m,y,width,wide?1.44:1.93,tint),
      text(t("reviewEvidence").toUpperCase(),m+.19,y+.15,width-.38,.24,11,true,muted),
      text(check,m+.19,y+.48,width-.38,wide?.76:1.19,wide?20:19,true),
      ...stepList([t("nextPrompt"),t("ownerPrompt"),t("reviewPrompt")],[m,y+(wide?1.72:2.2),width,available-(wide?1.72:2.2)],wide?3:1)
    ];
    const mapTop=method.id==="pareto"?y+.54:y;
    const map=[
      ...title(t("method"),headlines[1]||t("methodMap")),
      ...(method.id==="pareto"?[text(t("paretoTrap"),m,y,width,.43,14,true)]:[]),
      ...framework(method,{},[m,mapTop,width,end-mapTop-.16],t)
    ];
    return [
      cover,briefing,map,action,
      [...title(t("canvas"),t("canvasTitle")),...framework(method,values,[m,y,width,available],t,true)],
      example,workshop,follow
    ].map((items,i)=>frame(i,items));
  }

  let measure;
  function fit(item) {
    if (!measure && typeof document.createElement==="function") measure=document.createElement("canvas").getContext?.("2d");
    const width=item.w*72*.96, height=item.h*72;
    const chars = word => Array.from(word);
    for(let size=item.size;size>=5;size--){
      if (measure) measure.font=(item.bold?"bold ":"")+size+"px Arial";
      const length = value => measure?measure.measureText(value).width:value.length*size*.52;
      const lines=item.content.split(/\r?\n/).flatMap(paragraph=>{
        const rows=[];
        let row="";
        for(const word of paragraph.split(/\s+/)){
          if(length(row+" "+word)>width && row){rows.push(row);row=""}
          if(length(word)>width){
            for(const char of chars(word)){
              if(length(row+char)>width && row){rows.push(row);row=""}
              row+=char;
            }
          }else row+=(row?" ":"")+word;
        }
        return [...rows,row];
      });
      const leading=size*1.18;
      if(lines.length*leading<=height) return {lines,size,leading};
      if(size===5){
        const clipped=lines.slice(0,Math.max(1,Math.floor(height/leading)));
        let last=clipped.at(-1);
        while(last && length(last+"…")>width)last=last.slice(0,-1);
        clipped[clipped.length-1]=last+"…";
        return {lines:clipped,size,leading};
      }
    }
  }

  function svg(items,w,h,escape,label) {
    const u=n=>(n*72).toFixed(2);
    const content=items.map(i=>{
      if(i.type==="placeholder")return "";
      if(i.type==="box")return '<rect x="'+u(i.x)+'" y="'+u(i.y)+'" width="'+u(i.w)+'" height="'+u(i.h)+'" fill="#'+i.fill+'"'+(i.stroke?' stroke="#'+i.stroke+'"':'')+'/>';
      if(i.type==="line")return '<line x1="'+u(i.x)+'" y1="'+u(i.y)+'" x2="'+u(i.x2)+'" y2="'+u(i.y2)+'" stroke="#'+i.color+'"/>';
      const {lines,size,leading}=fit(i);
      return '<text fill="#'+i.color+'" font-family="Arial" font-size="'+size+'" font-weight="'+(i.bold?700:400)+'">'+lines.map((row,j)=>'<tspan x="'+u(i.x)+'" y="'+(i.y*72+size*.88+j*leading)+'">'+escape(row)+'</tspan>').join("")+'</text>';
    }).join("");
    return '<svg viewBox="0 0 '+u(w)+' '+u(h)+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+escape(label)+'">'+content+'</svg>';
  }

  function addPptx(slide, shape, items, lang) {
    items.forEach(i=>{
      if(i.type==="box") {
        slide.addShape(shape.rect,{x:i.x,y:i.y,w:i.w,h:i.h,fill:{color:i.fill},line:i.stroke?{color:i.stroke,width:.6}:{transparency:100}});
      } else if(i.type==="line") {
        slide.addShape(shape.line,{x:Math.min(i.x,i.x2),y:Math.min(i.y,i.y2),w:Math.abs(i.x2-i.x),h:Math.abs(i.y2-i.y),flipV:(i.x2-i.x)*(i.y2-i.y)<0,line:{color:i.color,width:.75}});
      } else if(i.content) {
        const {lines,size,leading}=fit(i);
        slide.addText(lines.join("\n"),{x:i.x,y:i.y,w:i.w,h:i.h,fontFace:"Arial",fontSize:size,color:i.color,bold:i.bold,margin:0,lang:lang==="fr"?"fr-FR":"en-US",valign:"top",lineSpacing:leading,wrap:false});
      }
    });
  }

  function addPdf(pdf,items) {
    items.forEach(i=>{
      if(i.type==="box") {
        pdf.setFillColor("#"+i.fill);
        if(i.stroke) pdf.setDrawColor("#"+i.stroke);
        pdf.setLineWidth(.009);
        pdf.rect(i.x,i.y,i.w,i.h,i.stroke?"FD":"F");
      } else if(i.type==="line") {
        pdf.setDrawColor("#"+i.color);
        pdf.setLineWidth(.013);
        pdf.line(i.x,i.y,i.x2,i.y2);
      } else if(i.type==="text" && i.content) {
        const {lines,size,leading}=fit(i);
        pdf.setFont("helvetica",i.bold?"bold":"normal");
        pdf.setFontSize(size);
        pdf.setTextColor("#"+i.color);
        lines.forEach((row,j)=>pdf.text(row.replace(/→/g,">").replace(/↑/g,"").replace(/≤/g,"<="),i.x,i.y+(size*.88+j*leading)/72));
      }
    });
  }

  return {spec,fieldNames,framework,compose,svg,addPptx,addPdf};
})();
