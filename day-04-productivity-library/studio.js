(function day4Studio(){
  "use strict";
  const c=window.__PRODUCTIVITY_INTERNALS;
  if(!c||!Array.isArray(c.TOOLS))return;
  const tools=c.TOOLS, app=document.getElementById("app"), names={prioritise:"Prioritise",organise:"Organise",focus:"Focus",decide:"Decide",review:"Review"},frnames={prioritise:"Prioriser",organise:"S'organiser",focus:"Se concentrer",decide:"Décider",review:"Faire le bilan"};
  const L={
    en:{home:"Home",all:"All 50 tools",find:"Find my tools",try:"Try Pareto",lead:"Find the right framework. Make it yours. Walk away with an editable deck.",sub:"A free toolbox for students, makers and managers. No account. Your work stays on your device.",who:"Who is it for?",need:"What do you want to do?",time:"How much time do you have?",me:"Just me",team:"My team",both:"Either",short:"Under 15 min",medium:"15–60 min",long:"More than 60 min",more:"More preferences",freq:"How often?",once:"Once",regular:"Regularly",style:"Working style",casual:"Informal",structured:"Structured",formal:"Formal",rec:"Recommended for you",search:"Search by method or problem…",why:"Why it works",learn:"Learn",practice:"Try it",slides:"8 slides",alone:"On your own",asTeam:"With a team",example:"Worked example",src:"Source & attribution",status:"Attribution to be verified against the original publications.",canvas:"Your working canvas",hint:"Edit your own answers. Saved only on this device.",filled:"See example",blank:"Blank canvas",download:"Export answers",import:"Import answers",reset:"Clear",format:"Slide format",pptx:"Editable PowerPoint",pdf:"PDF (8 pages)",fullscreen:"Full screen",share:"Share",previous:"Previous",next:"Next",back:"All methods",nothing:"No method matched. Adjust the filters.",take:"Take back control",copy:"Copy link",downloadApp:"Download app HTML",goBack:"The Unfinished 30",tip:"Practice with a concrete decision, then review what changed."},
    fr:{home:"Accueil",all:"Les 50 outils",find:"Trouver mes outils",try:"Essayer Pareto",lead:"Trouve la bonne méthode. Adapte-la. Repars avec un PowerPoint modifiable.",sub:"Une boîte à outils gratuite pour les étudiants et les managers. Aucun compte. Tes réponses restent sur ton appareil.",who:"Pour qui ?",need:"Quel est ton besoin ?",time:"Combien de temps as-tu ?",me:"Moi",team:"Mon équipe",both:"Les deux",short:"Moins de 15 min",medium:"15 à 60 min",long:"Plus d'une heure",more:"Plus de préférences",freq:"Fréquence",once:"Une fois",regular:"Régulièrement",style:"Type d'animation",casual:"Informel",structured:"Structuré",formal:"Formel",rec:"Recommandés pour toi",search:"Rechercher un outil ou un problème…",why:"Pourquoi ça marche",learn:"Comprendre",practice:"Utiliser",slides:"8 diapositives",alone:"Seul",asTeam:"Avec une équipe",example:"Exemple rempli",src:"Source et attribution",status:"Attribution à vérifier dans les sources originales.",canvas:"Ton canevas",hint:"Écris tes réponses. Elles restent sur cet appareil.",filled:"Exemple",blank:"Canevas vierge",download:"Exporter mes réponses",import:"Importer",reset:"Effacer",format:"Format",pptx:"PowerPoint modifiable",pdf:"PDF (8 pages)",fullscreen:"Plein écran",share:"Partager",previous:"Précédente",next:"Suivante",back:"Tous les outils",nothing:"Aucun résultat. Modifie les filtres.",take:"Reprends le contrôle",copy:"Copier le lien",downloadApp:"Télécharger le HTML",goBack:"The Unfinished 30",tip:"Teste avec une vraie décision, puis évalue le résultat."}
  };
  Object.assign(L.en, {
  "brand": "Productivity Studio",
  "day": "Day 04",
  "challenge": "day 4 of 30, one free prototype a day",
  "madeBy": "Made by",
  "language": "Switch to French",
  "skip": "Skip to content",
  "credit": "50 frameworks to use and adapt. Original layouts by Salah Khenissi.",
  "explore": "Explore",
  "paretoArt": "Illustration of the Pareto principle",
  "paretoIndex": "Tool 02 of 50 / Pareto",
  "paretoLead": "Find the few causes that matter most.",
  "headline": "50 tools.",
  "headline2": "Less chaos.",
  "methods": "Methods",
  "families": "Families",
  "slidesEach": "Slides per tool",
  "formats": "Formats",
  "free": "Free · local storage",
  "findIt": "Find a method",
  "quizTitle": "What do you need to solve?",
  "quizSub": "Three questions to narrow the list.",
  "tryIt": "Try a method",
  "startHere": "Start with these three.",
  "fitsTime": "Fits your time",
  "fitsAudience": "Fits the audience",
  "recommendations": "Recommendations",
  "otherMatches": "Other matches",
  "library": "Reference library",
  "maxDuration": "Maximum duration",
  "anyDuration": "Any duration",
  "anyStyle": "Any style",
  "allFamilies": "All families",
  "of50": "of 50",
  "readSource": "Read source",
  "timing": "Workshop timing",
  "timingBefore": "Allow about",
  "timingAfter": "minutes per team step, with time at the end to agree on the decision.",
  "placeholder": "Write your answer…",
  "viewMine": "My answers",
  "preview": "Both files use the selected format.",
  "helpful": "Was this helpful?",
  "yes": "Yes",
  "notYet": "Not yet",
  "thanks": "Thanks for the feedback.",
  "copied": "Link copied.",
  "offline": "An internet connection is required to load the export library.",
  "pptxWorking": "Building editable PowerPoint…",
  "pdfWorking": "Building PDF…",
  "pptxDone": "Eight editable slides downloaded.",
  "pdfDone": "Eight PDF pages downloaded.",
  "pptxError": "PowerPoint export failed.",
  "pdfError": "PDF export failed.",
  "htmlError": "HTML download unavailable.",
  "invalid": "This file does not contain valid answers for this method.",
  "answer": "Answer",
  "rowNote": "Row note",
  "cumulative": "Share of incidents and cumulative total",
  "timeScale": "Relative duration",
  "problem": "When to use it",
  "method": "The framework",
  "whenPrompt": "Which situation are you trying to change?",
  "successPrompt": "What would tell you that it improved?",
  "soloTitle": "Run it on your own",
  "canvasTitle": "Fill in your working canvas",
  "exampleTitle": "See the framework in use",
  "examplePrompt": "Read the entries in order and identify what you would change in your own situation.",
  "teamTitle": "Guide the team through it",
  "nextStep": "Next step",
  "reviewTitle": "Leave with a decision and a review date",
  "nextPrompt": "Action · Write the first concrete change you will make.",
  "ownerPrompt": "Owner · Name who will do it and by when.",
  "reviewPrompt": "Review · Choose a date and a sign that it worked."
});
  Object.assign(L.fr, {
  "brand": "Atelier de productivité",
  "day": "Jour 04",
  "challenge": "jour 4 sur 30, un prototype gratuit par jour",
  "madeBy": "Créé par",
  "language": "Passer en anglais",
  "skip": "Aller au contenu",
  "credit": "50 méthodes à utiliser et à adapter. Mises en page originales de Salah Khenissi.",
  "explore": "Découvrir",
  "paretoArt": "Illustration du principe de Pareto",
  "paretoIndex": "Outil 02 sur 50 / Pareto",
  "paretoLead": "Repère les quelques causes qui pèsent le plus.",
  "headline": "50 outils.",
  "headline2": "Moins de chaos.",
  "methods": "Méthodes",
  "families": "Familles",
  "slidesEach": "Diapositives par outil",
  "formats": "Formats",
  "free": "Gratuit · stockage local",
  "findIt": "Choisir une méthode",
  "quizTitle": "Quel problème veux-tu résoudre ?",
  "quizSub": "Trois questions pour affiner la liste.",
  "tryIt": "Tester une méthode",
  "startHere": "Commence par ces trois méthodes.",
  "fitsTime": "Adapté au temps disponible",
  "fitsAudience": "Adapté aux participants",
  "recommendations": "Recommandations",
  "otherMatches": "Autres méthodes adaptées",
  "library": "Bibliothèque de méthodes",
  "maxDuration": "Durée maximale",
  "anyDuration": "Toutes les durées",
  "anyStyle": "Tous les styles",
  "allFamilies": "Toutes les familles",
  "of50": "sur 50",
  "readSource": "Lire la source",
  "timing": "Durée de l’atelier",
  "timingBefore": "Prévois environ",
  "timingAfter": "minutes par étape en équipe et un temps final pour décider.",
  "placeholder": "Écris ta réponse…",
  "viewMine": "Mes réponses",
  "preview": "Les deux fichiers utilisent le format choisi.",
  "helpful": "Cette méthode t’a aidé ?",
  "yes": "Oui",
  "notYet": "Pas encore",
  "thanks": "Merci pour ton retour.",
  "copied": "Lien copié.",
  "offline": "Une connexion est nécessaire pour charger la bibliothèque d’export.",
  "pptxWorking": "Création du PowerPoint modifiable…",
  "pdfWorking": "Création du PDF…",
  "pptxDone": "Huit diapositives modifiables téléchargées.",
  "pdfDone": "Huit pages PDF téléchargées.",
  "pptxError": "Échec de l’export PowerPoint.",
  "pdfError": "Échec de l’export PDF.",
  "htmlError": "Le téléchargement HTML a échoué.",
  "invalid": "Ce fichier ne contient pas de réponses valides pour cette méthode.",
  "answer": "Réponse",
  "rowNote": "Note de ligne",
  "cumulative": "Part des incidents et total cumulé",
  "timeScale": "Durée relative",
  "problem": "Quand l’utiliser",
  "method": "La méthode",
  "whenPrompt": "Quelle situation veux-tu faire évoluer ?",
  "successPrompt": "À quoi verras-tu qu’elle s’est améliorée ?",
  "soloTitle": "Applique la méthode seul",
  "canvasTitle": "Complète ton canevas",
  "exampleTitle": "Observe la méthode en pratique",
  "examplePrompt": "Lis les entrées dans l’ordre et repère ce que tu adapterais à ta situation.",
  "teamTitle": "Anime la séance en équipe",
  "nextStep": "Prochaine étape",
  "reviewTitle": "Décide d’une action et d’une date de bilan",
  "nextPrompt": "Action · Note le premier changement concret.",
  "ownerPrompt": "Responsable · Note qui agit et pour quand.",
  "reviewPrompt": "Bilan · Fixe une date et un signe de réussite."
});
  Object.assign(L.en,{
  "guide": "Method guide",
  "guideHint": "See when it helps, with a worked case.",
  "worksheetTab": "My worksheet",
  "worksheetHint": "Work through your own situation.",
  "presentation": "Presentation",
  "presentationHint": "Preview and download the deck.",
  "openWorksheet": "Open my worksheet",
  "caseContext": "Situation",
  "caseDecision": "Decision",
  "caseCheck": "How to check the result",
  "caseLabel": "Worked case · illustrative data",
  "exportTitle": "Download this deck",
  "deckNav": "Slide contents",
  "overview": "Overview",
  "caseBrief": "The situation",
  "methodMap": "Framework diagram",
  "soloChapter": "Instructions",
  "worksheetChapter": "Working sheet",
  "decisionChapter": "Worked decision",
  "teamChapter": "Team exercise",
  "reviewChapter": "Measure the result",
  "reference": "Worked-case reference",
  "applyTitle": "From first input to a decision",
  "teamOutput": "Agree on a result before leaving",
  "reviewEvidence": "What to measure in this case",
  "yourNextMove": "Record your next move",
  "checkFirst": "Check before deciding",
  "paretoScale": "Number of incidents",
  "paretoThreshold": "80% reference",
  "paretoCumulative": "Cumulative share",
  "paretoTrap": "Count each incident once. If severity varies, repeat the analysis using impact instead of frequency.",
  "caseInNumbers": "Concentration of incidents"
});
  Object.assign(L.fr,{
  "guide": "Guide de la méthode",
  "guideHint": "Vois quand l’appliquer, avec un cas pratique.",
  "worksheetTab": "Mon canevas",
  "worksheetHint": "Applique la méthode à ta situation.",
  "presentation": "Présentation",
  "presentationHint": "Parcours et télécharge le support.",
  "openWorksheet": "Ouvrir mon canevas",
  "caseContext": "Situation",
  "caseDecision": "Décision",
  "caseCheck": "Comment vérifier le résultat",
  "caseLabel": "Cas pratique · données fictives",
  "exportTitle": "Télécharger la présentation",
  "deckNav": "Sommaire des diapositives",
  "overview": "Vue d’ensemble",
  "caseBrief": "La situation",
  "methodMap": "Schéma de la méthode",
  "soloChapter": "Mode d’emploi",
  "worksheetChapter": "Canevas de travail",
  "decisionChapter": "Décision expliquée",
  "teamChapter": "Atelier en équipe",
  "reviewChapter": "Mesurer le résultat",
  "reference": "Repère du cas pratique",
  "applyTitle": "Des premières données à la décision",
  "teamOutput": "Convenez d’un résultat avant de terminer",
  "reviewEvidence": "Quoi mesurer dans ce cas",
  "yourNextMove": "Note ta prochaine action",
  "checkFirst": "À vérifier avant de décider",
  "paretoScale": "Nombre d’incidents",
  "paretoThreshold": "Repère à 80 %",
  "paretoCumulative": "Part cumulée",
  "paretoTrap": "Compte chaque incident une seule fois. Si la gravité varie, refais le classement en mesurant l’impact.",
  "caseInNumbers": "Concentration des incidents"
});
  Object.assign(L.en,{
  "leaveWith": "What you’ll produce",
  "watchFor": "What to watch for",
  "caseReasoning": "How to read the example",
  "dataView": "Read the example data",
  "entry": "Entry",
  "filterReset": "Reset filters",
  "catalogueIntro": "Find a tool by problem, time available or the kind of result you need.",
  "exampleStart": "Open this example in the worksheet",
  "practiceHeading": "Put the method into practice",
  "workedCase": "Worked case",
  "fiction": "Illustrative data",
  "anyAudience": "Any audience",
  "soloOrTeam": "Solo or team"
});
  Object.assign(L.fr,{
  "leaveWith": "Ce que tu obtiens",
  "watchFor": "Point de vigilance",
  "caseReasoning": "Comment lire l’exemple",
  "dataView": "Lire les données de l’exemple",
  "entry": "Entrée",
  "filterReset": "Réinitialiser les filtres",
  "catalogueIntro": "Choisis un outil selon ton problème, le temps disponible ou le résultat attendu.",
  "exampleStart": "Voir cet exemple dans le canevas",
  "practiceHeading": "Appliquer la méthode",
  "workedCase": "Cas pratique",
  "fiction": "Données fictives",
  "anyAudience": "Tous les publics",
  "soloOrTeam": "Seul ou en équipe"
});
  let stored={};try{stored=JSON.parse(localStorage.getItem("u30studio")||"{}")||{}}catch(e){}
  const s={lang:["en","fr"].includes(stored.lang)?stored.lang:(document.documentElement.lang==="fr"?"fr":"en"),need:stored.need||"prioritise",who:stored.who||"both",time:stored.time||"medium",freq:stored.freq||"regular",fm:stored.fm||"structured",ratio:stored.ratio||"16:9",answers:stored.answers||{},family:"all",query:"",audience:"all",duration:"all",difficulty:"all",tab:"learn",current:0,example:false,id:""};
  const deck=window.ProductivityDeck;
  const t=k=>L[s.lang][k]||k, esc=x=>String(x==null?"":x).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])), byId=id=>localizedTools().find(x=>x.id===id), family=k=>s.lang==="fr"?frnames[k]:names[k];
  const save=()=>{try{localStorage.setItem("u30studio",JSON.stringify({lang:s.lang,need:s.need,who:s.who,time:s.time,freq:s.freq,fm:s.fm,ratio:s.ratio,answers:s.answers}))}catch(e){}};
  const link=x=>"#/tool/"+encodeURIComponent(x.id);
  function localizedTools(){
    return tools.map((x,i)=>({...x,...(s.lang==="fr"?x.fr:{}),number:i+1}));
  }
  const fieldNames=deck.fieldNames;
  function answers(x){return s.answers[x.id]||{}}
  function diagram(x,values={},blank=false){
    const w=9,h=5.5;
    return deck.svg(deck.framework(x,values,[.15,.13,w-.30,h-.26],t,blank),w,h,esc,x.n);
  }
  function header(){
    return `<div class="s-challenge"><div class="s-wrap">
      <span><a href="https://the-unfinished-30.vercel.app/">The Unfinished 30</a> · ${t("challenge")}</span>
      <span>${t("madeBy")} <a href="https://www.linkedin.com/in/salahkhenissi/">Salah Khenissi</a></span>
    </div></div>
    <header class="s-wrap"><div class="s-top">
      <a class="s-brand" href="#/">${t("brand")}</a>
      <nav class="s-nav" aria-label="${t("brand")}"><a href="#/">${t("home")}</a><a href="#/all">${t("all")}</a><button data-act="lang" aria-label="${t("language")}">${s.lang==="en"?"FR":"EN"}</button></nav>
    </div></header>`;
  }
  function footer(){return `<footer class="s-wrap"><div class="s-bottombar"><p>${t("credit")}</p><div class="s-btns"><a class="s-btn outline tiny" href="https://www.linkedin.com/in/salahkhenissi/" target="_blank" rel="noopener">LinkedIn ↗</a><button class="s-btn outline tiny" data-act="html">${t("downloadApp")}</button></div></div></footer>`}
  function quiz(){const choices=(key,values)=>'<div class="s-opts">'+values.map(z=>'<label class="s-opt"><input type="radio" name="'+key+'" value="'+esc(z[0])+'" '+(s[key]===z[0]?"checked":"")+'><span>'+esc(z[1])+"</span></label>").join("")+"</div>";
    return '<form id="studio-quiz"><div class="s-quiz"><div class="s-field"><span class="s-label">01 / '+t("need")+"</span>"+choices("need",Object.keys(names).map(x=>[x,family(x)]))+'</div><div class="s-field"><span class="s-label">02 / '+t("who")+"</span>"+choices("who",[["me",t("me")],["team",t("team")],["both",t("both")]])+'</div><div class="s-field"><span class="s-label">03 / '+t("time")+"</span>"+choices("time",[["short",t("short")],["medium",t("medium")],["long",t("long")]])+'</div></div><details class="s-advanced"><summary>'+t("more")+'</summary><div class="s-advancedgrid"><div class="s-field"><span class="s-label">'+t("freq")+"</span>"+choices("freq",[["once",t("once")],["regular",t("regular")]])+'</div><div class="s-field"><span class="s-label">'+t("style")+"</span>"+choices("fm",[["casual",t("casual")],["structured",t("structured")],["formal",t("formal")]])+'</div></div></details><div class="s-btns"><button class="s-btn orange" type="submit">'+t("find")+' →</button><a class="s-btn outline" href="#/all">'+t("all")+"</a></div></form>"
  }
  function sketch(x){
    return deck.svg(deck.motif(x,[0,0,3.4,1.36]),3.4,1.36,esc,"");
  }
  function card(x,reason=""){
    return `<a class="s-card" href="${link(x)}">
      <div class="s-cardtop"><span>${family(x.f)}</span><span>${x.t} min</span></div>
      <div class="s-cardvisual" aria-hidden="true">${sketch(x)}</div>
      <h3>${esc(x.n)}</h3><p>${esc(x.why)}</p>
      <div class="s-cardbottom"><span>${t(x.m==="solo"?"alone":x.m==="team"?"asTeam":"soloOrTeam")}</span><span>${t("explore")} ↗</span></div>
      ${reason?`<div class="s-rec">${esc(reason)}</div>`:""}</a>`;
  }
  function art(){let x=byId("pareto");return '<div class="s-art" aria-label="'+t("paretoArt")+'"><div class="s-arthead"><span>'+t("paretoIndex")+'</span><span>'+t("both")+'</span></div><div class="s-artbody"><div><div class="s-artbig">80<br>/ 20<span style="color:#ff5a32">.</span></div><p>'+t("paretoLead")+'</p></div><div>'+diagram(x)+"</div></div></div>"}
  function home(){return '<div class="s-wrap"><section class="s-hero"><div><div class="s-kicker">THE UNFINISHED 30 / '+t("day")+'</div><h1>'+t("headline")+'<br><span class="s-serif">'+t("headline2")+'</span></h1><p class="s-lead">'+t("lead")+'</p><p class="s-sub">'+t("sub")+'</p><div class="s-btns"><a class="s-btn orange" href="#/tool/pareto">'+t("try")+' ↗</a><a class="s-btn outline" href="#/all">'+t("all")+'</a></div></div>'+art()+'</section><div class="s-statline"><span><b>50</b> '+t("methods")+'</span><span><b>5</b> '+t("families")+'</span><span><b>8</b> '+t("slidesEach")+'</span><span><b>3</b> '+t("formats")+'</span><span>'+t("free")+'</span></div></div><section class="s-wrap s-section" id="find"><div class="s-sectionhead"><div><div class="s-kicker">'+t("findIt")+'</div><h2>'+t("quizTitle")+'</h2></div><p>'+t("quizSub")+'</p></div>'+quiz()+'</section><section class="s-wrap s-section" style="padding-top:0"><div class="s-sectionhead"><div><div class="s-kicker">'+t("tryIt")+'</div><h2>'+t("startHere")+'</h2></div></div><div class="s-grid">'+["pareto","eisenhower","pomodoro"].map(i=>card(byId(i))).join("")+"</div></section>"}
  function scored(x){let n=x.f===s.need?8:0,why=[];let max=s.time==="short"?15:s.time==="medium"?60:1e4;if(x.t<=max){n+=3;why.push(t("fitsTime"))}else n-=5;if(s.who==="me"&&x.m!=="team"||s.who==="team"&&x.m!=="solo"){n+=4;why.push(t("fitsAudience"))}else if(s.who!=="both")n-=7;if(s.who==="both"&&x.m==="both")n+=2;if(s.freq==="regular"&&x.rec)n++;if(s.fm===x.fm)n+=2;return {n,why:why.join(" · ")}}
  function results(){let list=localizedTools().filter(x=>x.f===s.need&&(s.who==="both"||s.who==="team"&&x.m!=="solo"||s.who==="me"&&x.m!=="team")).map(x=>({x,s:scored(x)})).sort((a,b)=>b.s.n-a.s.n);return '<section class="s-wrap s-section"><div class="s-kicker">'+t("recommendations")+'</div><h1 style="font-size:clamp(44px,6vw,75px);margin:20px 0">'+t("rec")+'</h1><p class="s-visual-note">'+family(s.need)+' · '+t(s.who)+' · '+t(s.time)+'</p><div class="s-grid" style="margin-top:22px">'+list.slice(0,3).map(z=>card(z.x,z.s.why)).join("")+'</div><div class="s-sectionhead" style="margin-top:60px"><h2>'+t("otherMatches")+'</h2></div><div class="s-grid">'+list.slice(3).map(z=>card(z.x)).join("")+"</div></section>"}
  const normalize=value=>value.normalize("NFD").replace(/\p{M}/gu,"").toLowerCase();
  const hasFilters=()=>Boolean(s.query||[s.family,s.audience,s.duration,s.difficulty].some(value=>value!=="all"));
  function filtered(){
    const words=normalize(s.query).trim().split(/\s+/).filter(Boolean);
    return localizedTools().filter(x=>{
      if(s.family!=="all"&&s.family!==x.f)return false;
      if(s.audience==="solo"&&x.m==="team"||s.audience==="team"&&x.m==="solo")return false;
      if(s.duration!=="all"&&x.t>Number(s.duration))return false;
      if(s.difficulty!=="all"&&x.fm!==s.difficulty)return false;
      const search=normalize([x.n,x.why,x.outcome,x.case.scene,x.ex,family(x.f),tools[x.number-1].n].join(" "));
      return words.every(word=>search.includes(word));
    });
  }
  function cards(items){
    return items.length?items.map(x=>card(x)).join(""):`<div class="s-empty">${t("nothing")}</div>`;
  }
  function updateCatalogue(){
    const items=filtered();
    document.getElementById("cards").innerHTML=cards(items);
    document.getElementById("counter").textContent=items.length+" / 50";
    app.querySelector('[data-act="reset-filters"]').disabled=!hasFilters();
    app.querySelectorAll("[data-family]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.family===s.family)));
  }
  function all(){
    const items=filtered();
    return `<section class="s-wrap s-section s-catalogue">
      <div class="s-kicker">${t("library")}</div>
      <h1>${t("all")}<span class="s-title-dot">.</span></h1><p class="s-catalogueintro">${t("catalogueIntro")}</p>
      <div class="s-toolbar">
        <input id="search-tools" type="search" class="s-search" aria-label="${t("search")}" placeholder="${t("search")}" value="${esc(s.query)}">
        <select class="s-select" id="audience" aria-label="${t("who")}"><option value="all">${t("anyAudience")}</option><option value="solo">${t("alone")}</option><option value="team">${t("asTeam")}</option></select>
        <select class="s-select" id="duration" aria-label="${t("maxDuration")}"><option value="all">${t("anyDuration")}</option>${[15,30,60].map(min=>`<option value="${min}">≤ ${min} min</option>`).join("")}</select>
        <select class="s-select" id="difficulty" aria-label="${t("style")}"><option value="all">${t("anyStyle")}</option>${["casual","structured","formal"].map(style=>`<option value="${style}">${t(style)}</option>`).join("")}</select>
      </div>
      <div class="s-cataloguebar">
        <div class="s-filters">${[["all",t("allFamilies")],...Object.keys(names).map(k=>[k,family(k)])].map(([key,label])=>`<button class="s-filter" data-family="${key}" aria-pressed="${s.family===key}">${label}</button>`).join("")}</div>
        <div class="s-cataloguecount"><span id="counter" aria-live="polite">${items.length} / 50</span><button class="s-btn outline tiny" data-act="reset-filters" ${hasFilters()?"":"disabled"}>${t("filterReset")}</button></div>
      </div>
      <div class="s-grid" id="cards">${cards(items)}</div>
    </section>`;
  }
  const VERIFIED_LINKS={"pareto":"https://asq.org/quality-resources/pareto","pomodoro":"https://www.pomodorotechnique.com/","smart":"https://openurl.ebsco.com/contentitem/edb%3A6043491","cynefin":"https://thecynefin.co/team/dave-snowden/","rice":"https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/","gtd":"https://gettingthingsdone.com/","pdca":"https://asq.org/quality-resources/pdca-cycle"};
  function sourceUrl(x){return VERIFIED_LINKS[x.id]||null}
  function sampleTable(x){
    const labels=fieldNames(x), grid=x.d[0]==="grid";
    const headers=grid?x.d[1].cols:[t("entry")];
    const cells=i=>grid?headers.map((_,j)=>x.sampleCells?.["c"+i+"-"+j]||""):[x.sample[i]];
    return `<details class="s-sampledata"><summary>${t("dataView")}</summary>
      <div class="s-table-scroll"><table><thead><tr><td></td>${headers.map(label=>`<th scope="col">${esc(label)}</th>`).join("")}</tr></thead>
      <tbody>${labels.map((label,i)=>`<tr><th scope="row">${esc(label)}</th>${cells(i).map(value=>`<td>${esc(value)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    </details>`;
  }
  function learn(x){
    const steps=(title,items)=>`<section><h3>${title}</h3><ol class="s-steps">${items.map((step,i)=>`<li><b aria-hidden="true">${String(i+1).padStart(2,"0")}</b><span>${esc(step)}</span></li>`).join("")}</ol></section>`;
    return `<div class="s-guide">
      <section class="s-guideintro">
        <div><h2>${t("leaveWith")}</h2><p>${esc(x.outcome)}</p></div>
        <div><h3>${t("watchFor")}</h3><p>${esc(x.pitfall)}</p></div>
      </section>
      <section class="s-workedcase" aria-labelledby="worked-case">
        <div class="s-caseheading"><div><span class="s-kicker">${t("fiction")}</span><h2 id="worked-case">${t("workedCase")}</h2></div>
          <button class="s-btn outline tiny" data-act="example-workspace">${t("exampleStart")} →</button></div>
        <p class="s-casescene">${esc(x.case.scene)}</p>
        <div class="s-casebody">
          <div class="s-casevisual">${diagram(x,x.sampleCells||x.sample)}${sampleTable(x)}</div>
          <div class="s-case">
            <section><h3>${t("caseReasoning")}</h3><p>${esc(x.case.reasoning)}</p></section>
            <section><h3>${t("caseDecision")}</h3><p>${esc(x.ex)}</p></section>
            <section><h3>${t("caseCheck")}</h3><p>${esc(x.case.check)}</p></section>
          </div>
        </div>
      </section>
      <section class="s-guidepractice"><h2>${t("practiceHeading")}</h2><div class="s-guidesteps">
        ${steps(t("alone"),x.solo)}${steps(t("asTeam"),x.team)}
        <p class="s-workshoptime"><strong>${t("timing")}</strong> · ${t("timingBefore")} ${Math.max(2,Math.round(x.t/Math.max(1,x.team.length)))} ${t("timingAfter")}</p>
      </div><div class="s-btns"><button class="s-btn orange" data-act="tab" data-val="practice">${t("openWorksheet")} →</button></div></section>
      <details class="s-attribution"><summary>${t("src")}</summary><p>${esc(x.src)}${sourceUrl(x)?` · <a href="${esc(sourceUrl(x))}" target="_blank" rel="noopener noreferrer">${t("readSource")} ↗</a>`:""}</p><p>${t("status")}</p></details>
    </div>`;
  }
  function worksheet(x){
    const labels=fieldNames(x),values=answers(x),grid=x.d[0]==="grid";
    const input=(label,key)=>`<div><label for="input-${key}">${esc(label)}</label><textarea id="input-${key}" data-field="${key}" rows="2" maxlength="240" placeholder="${t("placeholder")}">${esc(values[key]||"")}</textarea></div>`;
    const fields=labels.map((label,i)=>{
      if(!grid) return input(label,i);
      return `<fieldset><legend>${esc(label)}</legend>${x.d[1].cols.map((col,j)=>input(col,"c"+i+"-"+j)).join("")}${values[i]?input(t("rowNote"),i):""}</fieldset>`;
    }).join("");
    return `<div class="s-canvaslayout"><div class="s-canvaspaper">
      <div class="s-viewtoolbar"><span class="s-kicker">${t("canvas")}</span><button class="s-btn outline tiny" data-act="example">${s.example?t("viewMine"):t("filled")}</button></div>
      <div id="diagram">${diagram(x,s.example?(x.sampleCells||x.sample):values,!s.example)}</div><p class="s-source">${s.example?t("fiction"):t("tip")}</p>
    </div><aside class="s-panel"><div class="s-worksheet"><h3>${t("canvas")}</h3><p class="s-smallnote">${t("hint")}</p>${fields}
      <div class="s-btns"><button class="s-btn outline tiny" data-act="json">${t("download")}</button><button class="s-btn outline tiny" data-act="import">${t("import")}</button><button class="s-btn outline tiny" data-act="clear">${t("reset")}</button></div>
      <input id="import-file" type="file" accept="application/json" hidden></div></aside></div>`;
  }
  function slideContent(x,n){
    const [w,h]=deck.spec(s.ratio);
    return `<div class="s-slide" data-ratio="${s.ratio}" id="slide-canvas">${deck.svg(deck.compose(x,s.ratio,answers(x),t,family(x.f))[n],w,h,esc,x.n+" · "+(n+1)+" / 8")}</div>`;
  }
  const chapters=["overview","caseBrief","methodMap","soloChapter","worksheetChapter","decisionChapter","teamChapter","reviewChapter"];
  function slides(x){
    const chaptersHtml=chapters.map((key,i)=>`<button class="s-chapter" data-act="slide" data-val="${i}" aria-current="${s.current===i?"step":"false"}"><span>${String(i+1).padStart(2,"0")}</span>${t(key)}</button>`).join("");
    return `<div class="s-deckworkspace">
      <div class="s-deckstage">
        <div class="s-viewtoolbar"><div><label class="s-kicker" for="ratio">${t("format")}</label>
          <select class="s-select" id="ratio">${["16:9","9:10","9:16"].map(v=>`<option value="${v}" ${s.ratio===v?"selected":""}>${v}</option>`).join("")}</select></div>
          <div><button class="s-btn outline tiny" data-act="fullscreen">${t("fullscreen")}</button><button class="s-btn outline tiny" data-act="share">${t("share")}</button></div>
        </div>
        <div class="s-viewframe" id="viewframe" tabindex="-1">${slideContent(x,s.current)}</div>
        <div class="s-viewnav"><button class="s-btn outline tiny" data-act="previous" ${s.current===0?"disabled":""}>← ${t("previous")}</button>
          <strong class="s-count" aria-live="polite">${s.current+1} / 8 · ${t(chapters[s.current])}</strong>
          <button class="s-btn outline tiny" data-act="next" ${s.current===7?"disabled":""}>${t("next")} →</button></div>
      </div>
      <aside class="s-deckaside">
        <nav aria-label="${t("deckNav")}"><h3>${t("deckNav")}</h3><div class="s-chapters">${chaptersHtml}</div></nav>
        <section class="s-deckexports"><h3>${t("exportTitle")}</h3>
          <p id="export-status" class="s-status" role="status">${t("preview")}</p>
          <button class="s-btn orange" data-act="pptx">${t("pptx")} ↓</button>
          <button class="s-btn outline" data-act="pdf">${t("pdf")} ↓</button>
        </section>
      </aside>
    </div>`;
  }
  const views=[["learn","guide"],["practice","worksheetTab"],["slides","presentation"]];
  function detail(x){
    return `<div class="s-wrap">
      <div class="s-breadcrumb"><a href="#/all">← ${t("back")}</a><span>/</span><span>${family(x.f)}</span></div>
      <section class="s-detailhead"><div>
        <div class="s-kicker">${t("brand")} / ${String(x.number).padStart(2,"0")} ${t("of50")}</div>
        <h1>${esc(x.n)}<span class="s-title-dot">.</span></h1><p>${esc(x.why)}</p>
        <div class="s-detailmeta"><span class="s-badge">${family(x.f)}</span><span class="s-badge">${x.t} min</span><span class="s-badge">${t(x.m==="solo"?"alone":x.m==="team"?"asTeam":"soloOrTeam")}</span></div>
      </div></section>
      <div class="s-tabbar" role="tablist" aria-label="${esc(x.n)}">
        ${views.map(([key,label],i)=>`<button id="method-tab-${key}" role="tab" class="s-tab" data-act="tab" data-val="${key}" aria-controls="tabpanel" aria-selected="${s.tab===key}" tabindex="${s.tab===key?0:-1}"><span class="s-tab-index">0${i+1}</span><span>${t(label)}<small>${t(label==="worksheetTab"?"worksheetHint":label+"Hint")}</small></span></button>`).join("")}
      </div>
      <div id="tabpanel" role="tabpanel" aria-labelledby="method-tab-${s.tab}" tabindex="0">${s.tab==="learn"?learn(x):s.tab==="practice"?worksheet(x):slides(x)}</div>
    </div>`;
  }
  function currentRoute(){let hash=(location.hash||document.body?.dataset?.route||"").replace(/^#\/?/,"");if(hash.indexOf("tool/")===0)return {v:"tool",id:hash.slice(5).split("?")[0]};if(hash==="all")return {v:"all"};if(hash.startsWith("results"))return {v:"results"};return {v:"home"}}
  function render(){document.documentElement.lang=s.lang;let route=currentRoute();s.id=route.id||"";let x=byId(s.id);app.innerHTML='<div class="studio"><a class="s-screenreader" href="#studio-main">'+t("skip")+'</a>'+header()+'<main id="studio-main" tabindex="-1">'+(route.v==="tool"&&x?detail(x):route.v==="all"?all():route.v==="results"?results():home())+'</main>'+footer()+'</div>';document.title=(x?x.n+" · ":"")+t("brand")+" / "+t("day")+" · The Unfinished 30";if(route.v==="tool"){let pane=document.getElementById("tabpanel");if(pane&&typeof pane.insertAdjacentHTML==="function"){pane.insertAdjacentHTML("afterend",'<section class="s-section" style="padding:32px 0"><span class="s-kicker">'+t("helpful")+'</span><div class="s-btns"><button class="s-btn outline tiny" data-act="feedback" data-val="yes">'+t("yes")+'</button><button class="s-btn outline tiny" data-act="feedback" data-val="no">'+t("notYet")+'</button></div></section>')}}for(const key of ["audience","duration","difficulty"]){const control=document.getElementById(key);if(control)control.value=s[key]}let v=document.getElementById("viewframe");if(v){let touch=0;v.addEventListener("touchstart",e=>touch=e.changedTouches[0].screenX,{passive:true});v.addEventListener("touchend",e=>{if(Math.abs(e.changedTouches[0].screenX-touch)>40){moveSlide(e.changedTouches[0].screenX<touch?1:-1)}},{passive:true})}}
  function notify(v){let a=document.getElementById("export-status");if(a)a.textContent=v;else{let el=document.createElement("div");el.className="s-toast";el.textContent=v;el.setAttribute("role","status");document.body.append(el);setTimeout(()=>el.remove(),2800)}}
  function download(name,value,type){let url=URL.createObjectURL(new Blob([value],{type:type||"text/plain"}));let a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
  function loadLibrary(url,test){return new Promise((resolve,reject)=>{if(test())return resolve();let tag=document.createElement("script");tag.src=url;tag.onload=()=>test()?resolve():reject(new Error("Library did not load"));tag.onerror=()=>reject(new Error("offline"));document.head.appendChild(tag)})}
  async function exportDeck(x,kind){
    const b=app.querySelector('[data-act="'+kind+'"]');
    if(b?.disabled) return;
    if(b)b.disabled=true;
    const lang=s.lang, ratio=s.ratio, translate=key=>L[lang][key]||key;
    const pages=deck.compose(x,ratio,answers(x),translate,family(x.f));
    const [width,height]=deck.spec(ratio);
    const file="day04-"+x.id+"-"+lang+"-"+ratio.replace(":","x");
    notify(t(kind+"Working"));
    try{
      if(kind==="pptx"){
        await loadLibrary("https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js",()=>!!(window.PptxGenJS||window.pptxgen));
        const Pptx=window.PptxGenJS||window.pptxgen, pptx=new Pptx();
        pptx.defineLayout({name:"DAY04",width,height});
        pptx.layout="DAY04";
        pptx.author="Salah Khenissi";
        pptx.title=x.n;
        pptx.lang=lang==="fr"?"fr-FR":"en-US";
        pages.forEach(page=>deck.addPptx(pptx.addSlide(),pptx.ShapeType,page,lang));
        await pptx.writeFile({fileName:file+".pptx"});
      }else{
        await loadLibrary("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js",()=>!!window.jspdf?.jsPDF);
        const orientation=width>height?"landscape":"portrait";
        const pdf=new window.jspdf.jsPDF({orientation,unit:"in",format:[width,height]});
        pdf.setProperties({title:x.n,author:"Salah Khenissi"});
        pages.forEach((page,i)=>{
          if(i)pdf.addPage([width,height],orientation);
          deck.addPdf(pdf,page);
        });
        pdf.save(file+".pdf");
      }
      notify(t(kind+"Done"));
      track(kind+"_download");
    }catch(error){
      notify(t(kind+"Error")+(error.message==="offline"?" "+t("offline"):""));
    }finally{
      if(b)b.disabled=false;
    }
  }
  function feedback(kind){try{let saved=JSON.parse(localStorage.getItem("u30studio-feedback")||"{}");saved[s.id]=kind;localStorage.setItem("u30studio-feedback",JSON.stringify(saved))}catch(e){}notify(t("thanks"));track("feedback_"+kind)}
  function track(name){try{if(typeof window.va==="function")window.va("event",{name:"day04_"+name})}catch(e){}}
  async function copyUrl(){try{if(navigator.share)await navigator.share({title:t("brand"),url:location.href});else{await navigator.clipboard.writeText(location.href);notify(t("copied"))}}catch(e){}}
  async function downloadHtml(){
    try{
      const base=new URL(document.body.dataset.base||"./",location.href);
      const files=["index.html","studio.css","methods.js","deck.js","studio.js"];
      const [page,style,...scripts]=await Promise.all(files.map(async file=>{
        const res=await fetch(new URL(file,base));
        if(!res.ok) throw Error(file);
        return res.text();
      }));
      let html=page.replace('<link rel="stylesheet" href="studio.css">',()=>"<style>"+style+"</style>");
      html=html.replace('<html lang="en">','<html lang="'+s.lang+'">');
      files.slice(2).forEach((file,i)=>{
        html=html.replace('<script src="'+file+'" defer></'+'script>',()=>"<script>"+scripts[i].replace(/<\/script/gi,"<\\/script")+"</"+"script>");
      });
      download("productivity-studio-day04-"+s.lang+".html",html,"text/html");
    }catch(e){notify(t("htmlError"))}
  }
  app.addEventListener("submit",e=>{if(e.target.id!=="studio-quiz")return;e.preventDefault();save();track("quiz_completed");location.hash="#/results"});
  app.addEventListener("click",e=>{
    let f=e.target.closest("[data-family]");if(f){s.family=f.dataset.family;updateCatalogue();return}
    let b=e.target.closest("[data-act]");if(!b){if(e.target.closest(".s-screenreader")){e.preventDefault();document.getElementById("studio-main").focus()}return}let act=b.dataset.act,x=byId(s.id);
    if(act==="lang"){s.lang=s.lang==="en"?"fr":"en";save();render();app.querySelector('[data-act="lang"]')?.focus()}
    if(act==="tab"){s.tab=b.dataset.val;render();document.getElementById("method-tab-"+s.tab)?.focus()}
    if(act==="reset-filters"){
      Object.assign(s,{family:"all",query:"",audience:"all",duration:"all",difficulty:"all"});
      render();
      document.getElementById("search-tools")?.focus();
    }
    if(act==="example-workspace"){
      s.tab="practice";
      s.example=true;
      render();
      document.getElementById("method-tab-practice")?.focus();
    }
    if(act==="slide"){
      s.current=+b.dataset.val;
      render();
      if(matchMedia("(max-width: 820px)").matches){
        const frame=document.getElementById("viewframe");
        frame?.focus({preventScroll:true});
        frame?.scrollIntoView({block:"start"});
      }else app.querySelector('[data-act="slide"][aria-current="step"]')?.focus();
    }
    if(act==="next")moveSlide(1,"next");
    if(act==="previous")moveSlide(-1,"previous");
    if(act==="example"){s.example=!s.example;render()}
    if(act==="clear"){s.answers[s.id]={};save();render()}
    if(act==="json")download(x.id+"-answers.json",JSON.stringify({toolId:x.id,values:answers(x),savedAt:new Date().toISOString()},null,2),"application/json");
    if(act==="import")document.getElementById("import-file")?.click();
    if(act==="fullscreen")document.getElementById("slide-canvas")?.requestFullscreen?.();
    if(act==="share")copyUrl();
    if(act==="html")downloadHtml();
    if(act==="feedback")feedback(b.dataset.val);
    if(act==="pptx")exportDeck(x,"pptx");
    if(act==="pdf")exportDeck(x,"pdf");
  });
  app.addEventListener("input",e=>{let z=e.target;if(z.id==="search-tools"){s.query=z.value;updateCatalogue()}if(z.hasAttribute("data-field")){let a=s.answers[s.id]||(s.answers[s.id]={});a[z.dataset.field]=z.value;s.example=false;save();let d=document.getElementById("diagram");if(d)d.innerHTML=diagram(byId(s.id),a,true);const toggle=app.querySelector('[data-act="example"]');if(toggle)toggle.textContent=t("filled");const hint=app.querySelector(".s-canvaspaper .s-source");if(hint)hint.textContent=t("tip")}});
  app.addEventListener("change",async e=>{let z=e.target;if(z.type==="radio"){s[z.name]=z.value;save()}if(z.id==="ratio"){s.ratio=z.value;save();render()}if(z.id==="audience"||z.id==="duration"||z.id==="difficulty"){s[z.id]=z.value;updateCatalogue()}if(z.id==="import-file"&&z.files[0]){try{let obj=JSON.parse(await z.files[0].text());if(obj.toolId!==s.id||!obj.values||Array.isArray(obj.values)||typeof obj.values!=="object")throw Error("invalid");
    const method=byId(s.id),count=fieldNames(method).length,cols=method.d[0]==="grid"?method.d[1].cols.length:0;
    const keys=Array.from({length:count},(_,i)=>[String(i),...Array.from({length:cols},(_,j)=>"c"+i+"-"+j)]).flat();
    s.answers[s.id]=Object.fromEntries(Object.entries(obj.values).filter(([key,value])=>keys.includes(key)&&typeof value==="string").map(([key,value])=>[key,value.slice(0,240)]));s.example=false;save();render()}catch(e){notify(t("invalid"))}}});
  window.addEventListener("hashchange",()=>{s.tab="learn";s.current=0;s.example=false;render()});
  function moveSlide(delta,focus){
    const index=Math.max(0,Math.min(7,s.current+delta));
    if(index===s.current)return;
    s.current=index;
    render();
    if(focus){
      const button=app.querySelector(focus==='slide'?'[aria-current="step"]':'[data-act="'+focus+'"]');
      (button?.disabled?app.querySelector('[aria-current="step"]'):button)?.focus({preventScroll:true});
    }
  }
  document.addEventListener("keydown",e=>{
    const tab=e.target.closest('[role="tab"]');
    const delta=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;
    if(tab && (delta || ["Home","End"].includes(e.key))){
      e.preventDefault();
      const index=views.findIndex(([key])=>key===s.tab);
      s.tab=views[e.key==="Home"?0:e.key==="End"?2:(index+delta+views.length)%views.length][0];
      render();
      document.getElementById("method-tab-"+s.tab)?.focus();
    }else if(delta && s.tab==="slides" && e.target.closest(".s-deckworkspace") && !e.target.matches("select,input,textarea")){
      e.preventDefault();
      moveSlide(delta,e.target.dataset.act==="slide"?"slide":delta>0?"next":"previous");
    }
  });
  render();
})();
