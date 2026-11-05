(function day4Studio() {
  "use strict";
  const c = window.__PRODUCTIVITY_INTERNALS;
  if (!c || !Array.isArray(c.TOOLS)) return;
  const tools = c.TOOLS,
    app = document.getElementById("app"),
    names = {
      prioritise: "Prioritise",
      organise: "Organise",
      focus: "Focus",
      decide: "Decide",
      review: "Review",
    },
    frnames = {
      prioritise: "Prioriser",
      organise: "S'organiser",
      focus: "Se concentrer",
      decide: "Décider",
      review: "Faire le bilan",
    };
  const L = {
    en: {
      home: "Home",
      all: "All 50 tools",
      find: "Find my tools",
      try: "Try Pareto",
      lead: "Find the right framework. Make it yours. Walk away with an editable deck.",
      sub: "A free toolbox for students, makers and managers. No account. Your work stays on your device.",
      who: "Who is it for?",
      need: "What do you want to do?",
      time: "How much time do you have?",
      me: "Just me",
      team: "My team",
      both: "Either",
      short: "Under 15 min",
      medium: "15–60 min",
      long: "More than 60 min",
      more: "More preferences",
      freq: "How often?",
      once: "Once",
      regular: "Regularly",
      style: "Working style",
      casual: "Informal",
      structured: "Structured",
      formal: "Formal",
      rec: "Recommended for you",
      search: "Search by method or problem…",
      why: "Why it works",
      learn: "Learn",
      practice: "Try it",
      slides: "8 slides",
      alone: "On your own",
      asTeam: "With a team",
      example: "Worked example",
      src: "Source & attribution",
      status: "Attribution to be verified against the original publications.",
      canvas: "Your working canvas",
      hint: "Edit your own answers. Saved only on this device.",
      filled: "See example",
      blank: "Blank canvas",
      download: "Export answers",
      import: "Import answers",
      reset: "Clear",
      format: "Slide format",
      pptx: "Editable PowerPoint",
      pdf: "PDF (8 pages)",
      fullscreen: "Full screen",
      share: "Share method link",
      previous: "Previous",
      next: "Next",
      back: "All methods",
      nothing: "No method matched. Adjust the filters.",
      take: "Take back control",
      copy: "Copy link",
      downloadApp: "Download app HTML",
      goBack: "The Unfinished 30",
      tip: "Practice with a concrete decision, then review what changed.",
    },
    fr: {
      home: "Accueil",
      all: "Les 50 outils",
      find: "Trouver mes outils",
      try: "Essayer Pareto",
      lead: "Trouve la bonne méthode. Adapte-la. Repars avec un PowerPoint modifiable.",
      sub: "Une boîte à outils gratuite pour les étudiants et les managers. Aucun compte. Tes réponses restent sur ton appareil.",
      who: "Pour qui ?",
      need: "Quel est ton besoin ?",
      time: "Combien de temps as-tu ?",
      me: "Moi",
      team: "Mon équipe",
      both: "Les deux",
      short: "Moins de 15 min",
      medium: "15 à 60 min",
      long: "Plus d'une heure",
      more: "Plus de préférences",
      freq: "Fréquence",
      once: "Une fois",
      regular: "Régulièrement",
      style: "Type d'animation",
      casual: "Informel",
      structured: "Structuré",
      formal: "Formel",
      rec: "Recommandés pour toi",
      search: "Rechercher un outil ou un problème…",
      why: "Pourquoi ça marche",
      learn: "Comprendre",
      practice: "Utiliser",
      slides: "8 diapositives",
      alone: "Seul",
      asTeam: "Avec une équipe",
      example: "Exemple rempli",
      src: "Source et attribution",
      status: "Attribution à vérifier dans les sources originales.",
      canvas: "Ton canevas",
      hint: "Écris tes réponses. Elles restent sur cet appareil.",
      filled: "Exemple",
      blank: "Canevas vierge",
      download: "Exporter mes réponses",
      import: "Importer",
      reset: "Effacer",
      format: "Format",
      pptx: "PowerPoint modifiable",
      pdf: "PDF (8 pages)",
      fullscreen: "Plein écran",
      share: "Partager la méthode",
      previous: "Précédente",
      next: "Suivante",
      back: "Tous les outils",
      nothing: "Aucun résultat. Modifie les filtres.",
      take: "Reprends le contrôle",
      copy: "Copier le lien",
      downloadApp: "Télécharger le HTML",
      goBack: "The Unfinished 30",
      tip: "Teste avec une vraie décision, puis évalue le résultat.",
    },
  };
  Object.assign(L.en, {
    brand: "Productivity Studio",
    day: "Day 04",
    challenge: "day 4 of 30, one free prototype a day",
    madeBy: "Made by",
    language: "Switch to French",
    skip: "Skip to content",
    credit:
      "50 frameworks to use and adapt. Original layouts by Salah Khenissi.",
    explore: "Explore",
    paretoArt: "Illustration of the Pareto principle",
    paretoIndex: "Tool 02 of 50 / Pareto",
    paretoLead: "Find the few causes that matter most.",
    headline: "50 tools.",
    headline2: "Less chaos.",
    methods: "Methods",
    families: "Families",
    slidesEach: "Slides per tool",
    formats: "Formats",
    free: "Free · local storage",
    findIt: "Find a method",
    quizTitle: "What do you need to solve?",
    quizSub: "Three questions to narrow the list.",
    tryIt: "Try a method",
    startHere: "Start with these three.",
    fitsTime: "Fits your time",
    fitsAudience: "Fits the audience",
    recommendations: "Recommendations",
    otherMatches: "Other matches",
    library: "Reference library",
    maxDuration: "Maximum duration",
    anyDuration: "Any duration",
    anyStyle: "Any style",
    allFamilies: "All families",
    of50: "of 50",
    readSource: "Read source",
    timing: "Workshop timing",
    timingBefore: "Allow about",
    timingAfter:
      "minutes per team step, with time at the end to agree on the decision.",
    placeholder: "Write your answer…",
    viewMine: "My answers",
    preview: "Both files use the selected format.",
    helpful: "Was this helpful?",
    yes: "Yes",
    notYet: "Not yet",
    thanks: "Thanks for the feedback.",
    copied: "Link copied.",
    offline: "An internet connection is required to load the export library.",
    pptxWorking: "Building editable PowerPoint…",
    pdfWorking: "Building PDF…",
    pptxDone: "Eight editable slides downloaded.",
    pdfDone: "Eight PDF pages downloaded.",
    pptxError: "PowerPoint export failed.",
    pdfError: "PDF export failed.",
    htmlError: "HTML download unavailable.",
    invalid: "This file does not contain valid answers for this method.",
    answer: "Answer",
    rowNote: "Row note",
    cumulative: "Share of incidents and cumulative total",
    timeScale: "Relative duration",
    problem: "When to use it",
    method: "The framework",
    whenPrompt: "Which situation are you trying to change?",
    successPrompt: "What would tell you that it improved?",
    soloTitle: "Run it on your own",
    canvasTitle: "Fill in your working canvas",
    exampleTitle: "See the framework in use",
    examplePrompt:
      "Read the entries in order and identify what you would change in your own situation.",
    teamTitle: "Guide the team through it",
    nextStep: "Next step",
    reviewTitle: "Leave with a decision and a review date",
    nextPrompt: "Action · Write the first concrete change you will make.",
    ownerPrompt: "Owner · Name who will do it and by when.",
    reviewPrompt: "Review · Choose a date and a sign that it worked.",
  });
  Object.assign(L.fr, {
    brand: "Atelier de productivité",
    day: "Jour 04",
    challenge: "jour 4 sur 30, un prototype gratuit par jour",
    madeBy: "Créé par",
    language: "Passer en anglais",
    skip: "Aller au contenu",
    credit:
      "50 méthodes à utiliser et à adapter. Mises en page originales de Salah Khenissi.",
    explore: "Découvrir",
    paretoArt: "Illustration du principe de Pareto",
    paretoIndex: "Outil 02 sur 50 / Pareto",
    paretoLead: "Repère les quelques causes qui pèsent le plus.",
    headline: "50 outils.",
    headline2: "Moins de chaos.",
    methods: "Méthodes",
    families: "Familles",
    slidesEach: "Diapositives par outil",
    formats: "Formats",
    free: "Gratuit · stockage local",
    findIt: "Choisir une méthode",
    quizTitle: "Quel problème veux-tu résoudre ?",
    quizSub: "Trois questions pour affiner la liste.",
    tryIt: "Tester une méthode",
    startHere: "Commence par ces trois méthodes.",
    fitsTime: "Adapté au temps disponible",
    fitsAudience: "Adapté aux participants",
    recommendations: "Recommandations",
    otherMatches: "Autres méthodes adaptées",
    library: "Bibliothèque de méthodes",
    maxDuration: "Durée maximale",
    anyDuration: "Toutes les durées",
    anyStyle: "Tous les styles",
    allFamilies: "Toutes les familles",
    of50: "sur 50",
    readSource: "Lire la source",
    timing: "Durée de l’atelier",
    timingBefore: "Prévois environ",
    timingAfter: "minutes par étape en équipe et un temps final pour décider.",
    placeholder: "Écris ta réponse…",
    viewMine: "Mes réponses",
    preview: "Les deux fichiers utilisent le format choisi.",
    helpful: "Cette méthode t’a aidé ?",
    yes: "Oui",
    notYet: "Pas encore",
    thanks: "Merci pour ton retour.",
    copied: "Lien copié.",
    offline:
      "Une connexion est nécessaire pour charger la bibliothèque d’export.",
    pptxWorking: "Création du PowerPoint modifiable…",
    pdfWorking: "Création du PDF…",
    pptxDone: "Huit diapositives modifiables téléchargées.",
    pdfDone: "Huit pages PDF téléchargées.",
    pptxError: "Échec de l’export PowerPoint.",
    pdfError: "Échec de l’export PDF.",
    htmlError: "Le téléchargement HTML a échoué.",
    invalid:
      "Ce fichier ne contient pas de réponses valides pour cette méthode.",
    answer: "Réponse",
    rowNote: "Note de ligne",
    cumulative: "Part des incidents et total cumulé",
    timeScale: "Durée relative",
    problem: "Quand l’utiliser",
    method: "La méthode",
    whenPrompt: "Quelle situation veux-tu faire évoluer ?",
    successPrompt: "À quoi verras-tu qu’elle s’est améliorée ?",
    soloTitle: "Applique la méthode seul",
    canvasTitle: "Complète ton canevas",
    exampleTitle: "Observe la méthode en pratique",
    examplePrompt:
      "Lis les entrées dans l’ordre et repère ce que tu adapterais à ta situation.",
    teamTitle: "Anime la séance en équipe",
    nextStep: "Prochaine étape",
    reviewTitle: "Décide d’une action et d’une date de bilan",
    nextPrompt: "Action · Note le premier changement concret.",
    ownerPrompt: "Responsable · Note qui agit et pour quand.",
    reviewPrompt: "Bilan · Fixe une date et un signe de réussite.",
  });
  Object.assign(L.en, {
    guide: "Method guide",
    guideHint: "See when it helps, with a worked case.",
    worksheetTab: "My worksheet",
    worksheetHint: "Work through your own situation.",
    presentation: "Presentation",
    presentationHint: "Preview and download the deck.",
    openWorksheet: "Open my worksheet",
    caseContext: "Situation",
    caseDecision: "Decision",
    caseCheck: "How to check the result",
    caseLabel: "Worked case · illustrative data",
    exportTitle: "Download this deck",
    deckNav: "Slide contents",
    overview: "Overview",
    caseBrief: "The situation",
    methodMap: "Framework diagram",
    soloChapter: "Instructions",
    worksheetChapter: "Working sheet",
    decisionChapter: "Worked decision",
    teamChapter: "Team exercise",
    reviewChapter: "Measure the result",
    reference: "Worked-case reference",
    applyTitle: "From first input to a decision",
    teamOutput: "Agree on a result before leaving",
    reviewEvidence: "What to measure in this case",
    yourNextMove: "Record your next move",
    checkFirst: "Check before deciding",
    paretoScale: "Number of incidents",
    paretoThreshold: "80% reference",
    paretoCumulative: "Cumulative share",
    paretoTrap:
      "Count each incident once. If severity varies, repeat the analysis using impact instead of frequency.",
    caseInNumbers: "Concentration of incidents",
  });
  Object.assign(L.fr, {
    guide: "Guide de la méthode",
    guideHint: "Vois quand l’appliquer, avec un cas pratique.",
    worksheetTab: "Mon canevas",
    worksheetHint: "Applique la méthode à ta situation.",
    presentation: "Présentation",
    presentationHint: "Parcours et télécharge le support.",
    openWorksheet: "Ouvrir mon canevas",
    caseContext: "Situation",
    caseDecision: "Décision",
    caseCheck: "Comment vérifier le résultat",
    caseLabel: "Cas pratique · données fictives",
    exportTitle: "Télécharger la présentation",
    deckNav: "Sommaire des diapositives",
    overview: "Vue d’ensemble",
    caseBrief: "La situation",
    methodMap: "Schéma de la méthode",
    soloChapter: "Mode d’emploi",
    worksheetChapter: "Canevas de travail",
    decisionChapter: "Décision expliquée",
    teamChapter: "Atelier en équipe",
    reviewChapter: "Mesurer le résultat",
    reference: "Repère du cas pratique",
    applyTitle: "Des premières données à la décision",
    teamOutput: "Convenez d’un résultat avant de terminer",
    reviewEvidence: "Quoi mesurer dans ce cas",
    yourNextMove: "Note ta prochaine action",
    checkFirst: "À vérifier avant de décider",
    paretoScale: "Nombre d’incidents",
    paretoThreshold: "Repère à 80 %",
    paretoCumulative: "Part cumulée",
    paretoTrap:
      "Compte chaque incident une seule fois. Si la gravité varie, refais le classement en mesurant l’impact.",
    caseInNumbers: "Concentration des incidents",
  });
  Object.assign(L.en, {
    leaveWith: "What you’ll produce",
    watchFor: "What to watch for",
    caseReasoning: "How to read the example",
    dataView: "Read the example data",
    entry: "Entry",
    filterReset: "Reset filters",
    catalogueIntro:
      "Find a tool by problem, time available or the kind of result you need.",
    exampleStart: "Open this example in the worksheet",
    practiceHeading: "Put the method into practice",
    workedCase: "Worked case",
    fiction: "Illustrative data",
    anyAudience: "Any audience",
    soloOrTeam: "Solo or team",
  });
  Object.assign(L.fr, {
    leaveWith: "Ce que tu obtiens",
    watchFor: "Point de vigilance",
    caseReasoning: "Comment lire l’exemple",
    dataView: "Lire les données de l’exemple",
    entry: "Entrée",
    filterReset: "Réinitialiser les filtres",
    catalogueIntro:
      "Choisis un outil selon ton problème, le temps disponible ou le résultat attendu.",
    exampleStart: "Voir cet exemple dans le canevas",
    practiceHeading: "Appliquer la méthode",
    workedCase: "Cas pratique",
    fiction: "Données fictives",
    anyAudience: "Tous les publics",
    soloOrTeam: "Seul ou en équipe",
  });
  Object.assign(L.en, {
    localEmpty: "Your answers are saved in this browser as you type.",
    localSaved: "Saved in this browser.",
    localUnavailable:
      "Local saving is unavailable. Download a backup before leaving.",
    seeWorksheetSlide: "Preview my answers on the slide",
    seeBlankWorksheet: "Preview the worksheet in the deck",
    manageAnswers: "Manage my answers",
    backupHelp:
      "Keep a backup to reopen these answers in this method later or in another browser.",
    backupDownload: "Download a backup",
    backupOpen: "Open a backup",
    clearAnswers: "Delete my answers…",
    clearConfirm: "Delete the answers for this worksheet?",
    clearDetails:
      "This removes the answers saved for this method in this browser. You can keep a backup before deleting.",
    clearNow: "Delete answers",
    clearDone: "Your worksheet is empty.",
    cancel: "Cancel",
    importReview: "Choose how to open this backup",
    importReviewHelp:
      "Fill empty fields to keep your current answers. Replace all uses only the answers in the file.",
    importBlank: "Fill empty fields",
    importReplace: "Replace all answers",
    importDone: "Backup opened.",
    importWrong:
      "This backup belongs to a different method. Open it from that method’s worksheet.",
    importEmpty: "This backup has no answers to restore.",
    importNoNew:
      "Your existing answers were kept. The backup had no new answers for empty fields.",
    backupStarted: "Backup download started.",
    livePreview: "Live preview",
    myEntries: "Your answers",
    restoreAnswers: "Restore answers",
    restoreHelp: "This will fill the worksheet with the answers in the backup.",
  });
  Object.assign(L.fr, {
    localEmpty:
      "Tes réponses se sauvegardent dans ce navigateur pendant la saisie.",
    localSaved: "Enregistré dans ce navigateur.",
    localUnavailable:
      "La sauvegarde locale est indisponible. Télécharge une copie avant de quitter.",
    seeWorksheetSlide: "Voir mes réponses sur la diapo",
    seeBlankWorksheet: "Voir la diapo du canevas",
    manageAnswers: "Gérer mes réponses",
    backupHelp:
      "Garde une copie pour rouvrir ces réponses dans cette méthode plus tard ou dans un autre navigateur.",
    backupDownload: "Télécharger une copie",
    backupOpen: "Ouvrir une copie",
    clearAnswers: "Effacer mes réponses…",
    clearConfirm: "Effacer les réponses de ce canevas ?",
    clearDetails:
      "Cela supprime les réponses à cette méthode enregistrées dans ce navigateur. Tu peux garder une copie avant de les effacer.",
    clearNow: "Effacer les réponses",
    clearDone: "Ton canevas est vide.",
    cancel: "Annuler",
    importReview: "Choisis comment ouvrir cette copie",
    importReviewHelp:
      "Remplis les champs vides pour garder tes réponses. Remplacer tout utilise uniquement les réponses du fichier.",
    importBlank: "Remplir les champs vides",
    importReplace: "Remplacer toutes les réponses",
    importDone: "Copie ouverte.",
    importWrong:
      "Cette copie appartient à une autre méthode. Ouvre-la depuis le canevas de cette méthode.",
    importEmpty: "Cette copie ne contient aucune réponse à restaurer.",
    importNoNew:
      "Tes réponses sont conservées. La copie ne contient aucune réponse à ajouter dans les champs vides.",
    backupStarted: "Téléchargement de la copie lancé.",
    livePreview: "Aperçu en direct",
    myEntries: "Tes réponses",
    restoreAnswers: "Restaurer les réponses",
    restoreHelp: "Les réponses de la copie seront ajoutées au canevas.",
  });
  Object.assign(L.en, {
    navFind: "Find a method",
    navLibrary: "Library",
    navSources: "Sources",
    navHelp: "Help",
    downloadApp: "Download HTML",
    headline: "Pick a method.",
    headline2: "Put it to work.",
    lead: "Choose a method, work through an example, and turn your answers into a presentation.",
    sub: "Free to use. Open the site or download the complete app as a single HTML file.",
    try: "Try the Eisenhower Matrix",
    heroMatrix: "One list, four decisions",
    heroMatrixHint: "Decide what to do, schedule, delegate or drop.",
    landingStart: "Three ways to get started",
    startGuide: "Read a worked case",
    startGuideCopy:
      "See the data, the reasoning behind the decision and what to measure next.",
    startCanvas: "Fill in your worksheet",
    startCanvasCopy:
      "Enter your own situation. Download a copy if you want to return to it later.",
    startDeck: "Prepare a presentation",
    startDeckCopy:
      "Preview the eight slides and choose an editable PowerPoint or a PDF.",
    quizSub: "Choose one answer for each of the five questions.",
    who: "Who will use the result?",
    me: "Just me",
    team: "My team",
    boss: "My manager",
    partners: "My partners",
    client: "My client",
    fitsAudience: "Suited to the audience",
    fitsStyle: "Matches your working style",
    fitsRepeat: "Useful for recurring work",
    sourceTitle: "What the library is based on",
    sourceIntro:
      "The method pages point to published works and practitioner references. Each guide separates its source note from the studio’s explanation and example.",
    sourcesSelection: "A selection of published references",
    sourceLink: "Read the reference",
    sourceCreditTitle: "Examples, diagrams and rights",
    sourceCredit:
      "The worked cases are fictional. The explanations, worksheets and slide layouts were created for this project. Published method names identify their references. This app contains no consulting firm templates, slides or internal data.",
    sourceCaution:
      "Some methods have disputed origins. The guide flags attribution uncertainty where applicable.",
    codeNotices: "Open-source library notices",
    helpTitle: "Questions and help",
    helpIntro:
      "Find out how to keep a worksheet, work offline or report an issue.",
    faqFreeQ: "Is the app free?",
    faqFreeA:
      "Yes. The site, the HTML file and the worksheet, PowerPoint and PDF downloads are free. You do not need an account.",
    faqPrivacyQ: "What happens to my answers?",
    faqPrivacyA:
      "Your answers stay in the open tab while you work. The app does not save them to browser storage or send them to a server. Reloading or closing the tab ends the session. Use Manage my answers in the worksheet to download or reopen a backup.",
    faqOfflineQ: "How do I use it offline?",
    faqOfflineA:
      "Download the HTML file and open it in a browser. It includes all 50 methods, the recommender, the worksheets and the PowerPoint and PDF export tools. Download a separate backup to keep your own answers.",
    faqFilesQ: "Which file should I download?",
    faqFilesA:
      "Choose HTML for the complete app, a worksheet backup to resume your answers, PowerPoint for editable slides, or PDF to share a fixed copy.",
    faqRightsQ: "Where do the examples and templates come from?",
    faqRightsA:
      "The cases use fictional data and the layouts were drawn for this project. Method guides link to their references where available. If you see a source or credit that should be corrected, tell us which method and section are affected.",
    supportTitle: "Need help with a method or a file?",
    supportCopy:
      "Share the method name, the step where you got stuck and your browser. Keep personal worksheet answers out of the message.",
    supportContact: "Contact Salah on LinkedIn",
    supportReport: "Report a problem on GitHub",
    localEmpty: "Answers stay in this tab until you close or reload it.",
    localSaved: "In this tab only. Download a backup to keep these answers.",
    clearDetails:
      "This removes the answers for this method from the current session. You can download a backup before deleting.",
    legacyTitle: "Answers from an earlier version",
    legacyHelp:
      "An earlier version saved answers in this browser. You can reopen the methods and download backups, then remove the old browser data here.",
    legacyRemove: "Remove old browser data…",
    legacyConfirm: "Remove the old saved data from this browser?",
    legacyDone:
      "Old browser data removed. Open answers stay in this tab until you leave.",
    legacyFailed: "This browser did not allow the old data to be removed.",
    htmlPreparing: "Preparing the offline HTML…",
    htmlReady: "Your offline HTML download started.",
    editorialTitle: "How a guide is made",
    editorialSource:
      "Trace the method to a published reference and flag uncertain attributions.",
    editorialCase:
      "Write a fictional scenario, explain the decision and define a way to check it.",
    editorialDeck:
      "Build an editable worksheet and test the presentation in three formats.",
    rightsReference: "WIPO guidance on copyright",
    otherMatches: "Other methods in this family",
    recommendationHelp:
      "Tools in the selected family are ranked using your audience, time, frequency and working style.",
  });
  Object.assign(L.fr, {
    navFind: "Trouver une méthode",
    navLibrary: "Bibliothèque",
    navSources: "Sources",
    navHelp: "Aide",
    downloadApp: "Télécharger le HTML",
    headline: "Choisis un outil.",
    headline2: "Passe à la pratique.",
    lead: "Choisis une méthode, suis un cas pratique et transforme tes réponses en présentation.",
    sub: "Gratuit. Utilise le site ou télécharge l’application complète dans un seul fichier HTML.",
    try: "Essayer la matrice d’Eisenhower",
    heroMatrix: "Une liste, quatre décisions",
    heroMatrixHint: "Décide quoi faire, planifier, déléguer ou retirer.",
    landingStart: "Trois façons de commencer",
    startGuide: "Lire un cas pratique",
    startGuideCopy:
      "Découvre les données, le raisonnement derrière la décision et ce qu’il faut mesurer ensuite.",
    startCanvas: "Remplir ton canevas",
    startCanvasCopy:
      "Saisis ta propre situation. Télécharge une copie pour y revenir plus tard.",
    startDeck: "Préparer une présentation",
    startDeckCopy:
      "Parcours les huit diapositives et choisis un PowerPoint modifiable ou un PDF.",
    quizSub: "Choisis une réponse pour chacune des cinq questions.",
    who: "À qui servira le résultat ?",
    me: "Moi",
    team: "Mon équipe",
    boss: "Mon responsable",
    partners: "Mes partenaires",
    client: "Mon client",
    fitsAudience: "Adapté au public choisi",
    fitsStyle: "Adapté à ta façon de travailler",
    fitsRepeat: "Utile pour un travail récurrent",
    sourceTitle: "Sur quoi repose la bibliothèque",
    sourceIntro:
      "Les fiches renvoient à des publications et à des références de praticiens. Chaque guide distingue sa note de source de l’explication et de l’exemple rédigés pour l’atelier.",
    sourcesSelection: "Quelques références publiées",
    sourceLink: "Consulter la référence",
    sourceCreditTitle: "Exemples, schémas et droits",
    sourceCredit:
      "Les cas pratiques sont fictifs. Les explications, canevas et mises en page ont été créés pour ce projet. Les noms des méthodes publiées permettent d’identifier leurs références. L’application ne contient aucun modèle, support de présentation ou jeu de données interne de cabinet de conseil.",
    sourceCaution:
      "L’origine de certaines méthodes est discutée. Le guide signale les incertitudes d’attribution lorsque c’est pertinent.",
    codeNotices: "Mentions des bibliothèques open source",
    helpTitle: "Questions fréquentes et aide",
    helpIntro:
      "Apprends à conserver un canevas, à travailler hors ligne ou à signaler un problème.",
    faqFreeQ: "L’application est-elle gratuite ?",
    faqFreeA:
      "Oui. Le site, le fichier HTML et les téléchargements de canevas, PowerPoint et PDF sont gratuits. Aucun compte n’est requis.",
    faqPrivacyQ: "Que deviennent mes réponses ?",
    faqPrivacyA:
      "Tes réponses restent dans l’onglet ouvert pendant que tu travailles. L’application ne les enregistre pas dans le stockage du navigateur et ne les transmet pas à un serveur. Actualiser ou fermer l’onglet termine la session. Dans le canevas, utilise Gérer mes réponses pour télécharger ou rouvrir une copie.",
    faqOfflineQ: "Comment utiliser l’application hors ligne ?",
    faqOfflineA:
      "Télécharge le fichier HTML et ouvre-le dans un navigateur. Il contient les 50 méthodes, le questionnaire, les canevas et les outils d’export PowerPoint et PDF. Télécharge une copie séparée pour conserver tes propres réponses.",
    faqFilesQ: "Quel fichier choisir ?",
    faqFilesA:
      "Choisis le HTML pour l’application complète, une copie du canevas pour reprendre tes réponses, le PowerPoint pour modifier les diapositives ou le PDF pour partager une version fixe.",
    faqRightsQ: "D’où viennent les exemples et les modèles ?",
    faqRightsA:
      "Les cas utilisent des données fictives et les mises en page ont été dessinées pour ce projet. Les guides renvoient à leurs références lorsqu’un lien est disponible. Pour une correction de source ou d’attribution, indique la méthode et la section concernées.",
    supportTitle: "Besoin d’aide sur une méthode ou un fichier ?",
    supportCopy:
      "Indique la méthode, l’étape qui bloque et ton navigateur. Garde tes réponses personnelles dans ton canevas.",
    supportContact: "Contacter Salah sur LinkedIn",
    supportReport: "Signaler un problème sur GitHub",
    localEmpty:
      "Tes réponses restent dans cet onglet jusqu’à sa fermeture ou son actualisation.",
    localSaved:
      "Dans cet onglet uniquement. Télécharge une copie pour garder tes réponses.",
    clearDetails:
      "Cela efface les réponses à cette méthode dans la session actuelle. Tu peux télécharger une copie avant de les effacer.",
    legacyTitle: "Réponses d’une version précédente",
    legacyHelp:
      "Une ancienne version a enregistré des réponses dans ce navigateur. Tu peux rouvrir les méthodes et télécharger des copies, puis supprimer les anciennes données du navigateur ici.",
    legacyRemove: "Supprimer les anciennes données…",
    legacyConfirm:
      "Supprimer les anciennes données enregistrées dans ce navigateur ?",
    legacyDone:
      "Anciennes données supprimées. Les réponses ouvertes restent dans cet onglet jusqu’à ton départ.",
    legacyFailed:
      "Ce navigateur n’a pas autorisé la suppression des anciennes données.",
    htmlPreparing: "Préparation du fichier HTML hors ligne…",
    htmlReady: "Le téléchargement du fichier HTML hors ligne a commencé.",
    editorialTitle: "Comment une fiche est préparée",
    editorialSource:
      "Relier la méthode à une référence publiée et signaler les attributions incertaines.",
    editorialCase:
      "Écrire un scénario fictif, expliquer la décision et prévoir comment la vérifier.",
    editorialDeck:
      "Créer un canevas modifiable et tester la présentation dans trois formats.",
    rightsReference: "Repères de l’OMPI sur le droit d’auteur",
    otherMatches: "Autres méthodes de cette famille",
    recommendationHelp:
      "Les outils de la famille choisie sont classés selon le public, le temps, la fréquence et la façon de travailler.",
  });
  let legacy = {},
    hasLegacy = false;
  try {
    const previous = localStorage.getItem("u30studio");
    hasLegacy = Boolean(previous || localStorage.getItem("u30studio-feedback"));
    if (previous) legacy = JSON.parse(previous) || {};
  } catch (e) {}
  const router = window.ProductivityRouter;
  const localeInUrl = router.lang();
  const s = {
    lang: localeInUrl || (document.documentElement.lang === "fr" ? "fr" : "en"),
    need: "prioritise",
    who: "me",
    time: "medium",
    freq: "regular",
    fm: "structured",
    ratio: "16:9",
    answers: { ...legacy.answers },
    work: {},
    family: "all",
    query: "",
    audience: "all",
    duration: "all",
    difficulty: "all",
    deliverable: "all",
    deliverable: "all",
    tab: "learn",
    current: 0,
    example: false,
    id: "",
  };
  const deck = window.ProductivityDeck;
  const t = (k) => L[s.lang][k] || k,
    esc = (x) =>
      String(x == null ? "" : x).replace(
        /[&<>"']/g,
        (ch) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[ch],
      ),
    byId = (id) => localizedTools().find((x) => x.id === id),
    family = (k) => (s.lang === "fr" ? frnames[k] : names[k]);
  const link = (x) => router.url({ v: "tool", id: x.id }, s.lang);
  const asset = (file) =>
    new URL(
      window.ProductivityRelease?.assets?.[file] || file,
      new URL(
        /^https?:$/.test(location.protocol || "")
          ? router.root
          : document.body.dataset.base || "./",
        location.href,
      ),
    );
  function localizedTools() {
    return tools.map((x, i) => ({
      ...x,
      ...(s.lang === "fr" ? x.fr : {}),
      number: i + 1,
      uiLang: s.lang,
      publicURL:
        "https://the-unfinished-30.vercel.app" +
        router.root +
        s.lang +
        "/" +
        (s.lang === "fr" ? "outils/" : "tools/") +
        x.id +
        "/",
    }));
  }
  const fieldNames = deck.fieldNames;
  function answers(x) {
    return s.answers[x.id] || {};
  }
  const sessionCounts = {};
  const count = (event) => {
    sessionCounts[event] = (sessionCounts[event] || 0) + 1;
  };
  const hasAnswer = (value) =>
    typeof value === "string" && Boolean(value.trim());
  const engine = window.ProductivityEngine,
    workspace = window.ProductivityWorkspace,
    reuse = window.ProductivityReuse;
  const wt = (key) => workspace.words[s.lang][key] || key;
  const hasWork = (x) => engine.hasContent(s.work[x.id]);
  const hasAnswers = (x) =>
    Object.values(answers(x)).some(hasAnswer) || hasWork(x);
  const workFor = (x) => s.work[x.id] || (s.work[x.id] = engine.empty());
  function projected(x) {
    return hasWork(x) &&
      engine.supported.includes(x.id) &&
      s.work[x.id].rows.some((row) => row.title.trim())
      ? engine.project(x, s.work[x.id])
      : {
          method: { ...x, resultSummary: s.work[x.id]?.decision || "" },
          values: answers(x),
        };
  }
  let unsaved = false,
    copiedRows = null,
    dirtyMethods = new Set();
  const markUsed = () => {
    dirtyMethods.add(s.id);
    unsaved = true;
  };
  window.addEventListener("beforeunload", (e) => {
    if (unsaved) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  const savedStatus = (x) => t(hasAnswers(x) ? "localSaved" : "localEmpty");
  let pendingBackup = null,
    backupSequence = 0;
  function diagram(x, values = {}, blank = false) {
    const w = 9,
      h = 5.5;
    return deck.svg(
      deck.framework(x, values, [0.15, 0.13, w - 0.3, h - 0.26], t, blank),
      w,
      h,
      esc,
      x.n,
    );
  }
  const logo =
    '<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><rect width="32" height="32" fill="#161713"/><path d="M6 6h8v8H6zm0 12h8v8H6zm12 0h8v8h-8z" fill="#fffdfa"/><path d="M18 6h8v8h-8z" fill="#ff5a32"/></svg>';
  const navigation = [
    ["", "home"],
    ["find", "navFind"],
    ["all", "navLibrary"],
    ["sources", "navSources"],
    ["help", "navHelp"],
  ];
  function header(route) {
    const selected =
      route.section ||
      { home: "", all: "all", tool: "all", results: "find" }[route.v];
    return `<div class="s-challenge"><div class="s-wrap">
      <span><a href="https://the-unfinished-30.vercel.app/">The Unfinished 30</a> · ${t("challenge")}</span>
      <span>${t("madeBy")} <a href="https://www.linkedin.com/in/salahkhenissi/">Salah Khenissi</a></span>
    </div></div>
    <header class="s-wrap"><div class="s-top">
      <a class="s-brand" href="#/">${logo}<span>${t("brand")}</span></a>
      <nav class="s-nav" aria-label="${t("brand")}">${navigation.map(([key, label]) => `<a href="#/${key}" ${key === selected ? 'aria-current="location"' : ""}>${t(label)}</a>`).join("")}</nav>
      <div class="s-headeractions"><button class="s-btn outline tiny" data-act="lang" aria-label="${t("language")}">${s.lang === "en" ? "FR" : "EN"}</button><button class="s-btn orange tiny" data-act="html">${t("downloadApp")} ↓</button></div>
    </div></header>`;
  }
  function footer() {
    return `<footer class="s-wrap"><div class="s-bottombar">
      <div><a class="s-brand" href="#/">${logo}<span>${t("brand")}</span></a><p>${t("credit")}</p></div>
      <nav class="s-footerlinks" aria-label="${t("navHelp")}"><a href="#/sources">${t("navSources")}</a><a href="#/help">${t("navHelp")}</a><a href="https://www.linkedin.com/in/salahkhenissi/" target="_blank" rel="noopener">${t("supportContact")} ↗</a></nav>
    </div></footer>`;
  }
  const audiences = ["me", "team", "boss", "partners", "client"];
  function quiz() {
    const questions = [
      ["need", "need", Object.keys(names), family],
      ["who", "who", audiences, t],
      ["time", "time", ["short", "medium", "long"], t],
      ["freq", "freq", ["once", "regular"], t],
      ["fm", "style", ["casual", "structured", "formal"], t],
    ];
    return `<form id="studio-quiz"><div class="s-quiz">${questions
      .map(
        ([key, label, values, display], i) => `
      <fieldset class="s-field"><legend><span>0${i + 1}</span> ${t(label)}</legend>
      <div class="s-opts">${values.map((value) => `<label class="s-opt"><input type="radio" name="${key}" value="${value}" ${s[key] === value ? "checked" : ""}><span>${display(value)}</span></label>`).join("")}</div></fieldset>${i === 1 ? `<button class="s-btn outline tiny" type="submit">${s.lang === "fr" ? "Voir une première sélection" : "Get an initial selection"}</button>` : ""}`,
      )
      .join("")}
      </div><div class="s-btns"><button class="s-btn orange" type="submit">${t("find")} →</button><a class="s-btn outline" href="#/all">${t("all")}</a></div></form>`;
  }
  function sketch(x) {
    return deck.svg(deck.motif(x, [0, 0, 3.4, 1.36]), 3.4, 1.36, esc, "");
  }
  function card(x, reason = "") {
    return `<a class="s-card" href="${link(x)}">
      <div class="s-cardtop"><span>${family(x.f)}</span><span>${x.t} min</span></div>
      <div class="s-cardvisual" aria-hidden="true">${sketch(x)}</div>
      <h3>${esc(x.n)}</h3><p>${esc(x.why)}</p>
      <div class="s-cardbottom"><span>${t(x.m === "solo" ? "alone" : x.m === "team" ? "asTeam" : "soloOrTeam")}</span><span>${t("explore")} ↗</span></div>
      ${reason ? `<div class="s-rec">${esc(reason)}</div>` : ""}</a>`;
  }
  function art() {
    const x = byId("eisenhower");
    return `<figure class="s-matrix-hero"><figcaption><span class="s-kicker">${esc(x.n)}</span><h2>${t("heroMatrix")}</h2><p>${t("heroMatrixHint")}</p></figcaption>${diagram(x, x.sampleCells || x.sample)}</figure>`;
  }
  function landingSupport() {
    const refs = [
      ["pareto", "ASQ"],
      ["rice", "Intercom"],
      ["gtd", "David Allen Company"],
      ["pdca", "ASQ"],
    ];
    const faq = ["Free", "Privacy", "Offline", "Files", "Rights"];
    return `<section class="s-wrap s-section s-landingsection" id="sources" tabindex="-1">
      <div class="s-sectionhead"><h2>${t("sourceTitle")}</h2><p>${t("sourceIntro")}</p></div>
      <div class="s-editorial"><h3>${t("editorialTitle")}</h3><ol>${["Source", "Case", "Deck"].map((key) => `<li>${t("editorial" + key)}</li>`).join("")}</ol></div>
      <div class="s-reference-list"><h3>${t("sourcesSelection")}</h3><ul>${refs
        .map(
          ([id, publisher]) => `
        <li><a href="#/tool/${id}">${esc(byId(id).n)}</a><a href="${esc(VERIFIED_LINKS[id])}" target="_blank" rel="noopener" aria-label="${t("sourceLink")} · ${esc(byId(id).n)}">${esc(publisher)} ↗</a></li>`,
        )
        .join("")}</ul></div>
      <div class="s-rights"><h3>${t("sourceCreditTitle")}</h3><p>${t("sourceCredit")}</p><p>${t("sourceCaution")}</p><p><a href="https://www.wipo.int/en/web/copyright/protection" target="_blank" rel="noopener">${t("rightsReference")} ↗</a></p><button class="s-btn outline tiny" data-act="notices">${t("codeNotices")} ↓</button></div>
    </section>
    <section class="s-wrap s-section s-landingsection" id="help" tabindex="-1">
      <div class="s-sectionhead"><h2>${t("helpTitle")}</h2><p>${t("helpIntro")}</p></div>
      <div class="s-faq">${faq.map((key) => `<details><summary>${t("faq" + key + "Q")}</summary><p>${t("faq" + key + "A")}</p></details>`).join("")}</div>
      ${hasLegacy ? `<section class="s-helpbox"><h3>${t("legacyTitle")}</h3><p>${t("legacyHelp")}</p><button class="s-btn outline tiny" data-act="remove-legacy">${t("legacyRemove")}</button></section>` : ""}
      <section class="s-helpbox"><h3>${t("supportTitle")}</h3><p>${t("supportCopy")}</p><div class="s-btns"><a class="s-btn outline tiny" href="https://www.linkedin.com/in/salahkhenissi/" target="_blank" rel="noopener">${t("supportContact")} ↗</a><a class="s-btn outline tiny" href="https://github.com/hellolina33/TheUnfinishedProject/issues" target="_blank" rel="noopener">${t("supportReport")} ↗</a></div></section>
    </section>`;
  }
  function home() {
    return `<div class="s-wrap"><section class="s-hero"><div>
      <div class="s-kicker">THE UNFINISHED 30 / ${t("day")}</div>
      <h1>${t("headline")}<br><span class="s-serif">${t("headline2")}</span></h1>
      <p class="s-lead">${t("lead")}</p><p class="s-sub">${t("sub")}</p>
      <div class="s-btns"><a class="s-btn orange" href="#/tool/eisenhower">${t("try")} →</a><a class="s-btn outline" href="#/tool/eisenhower?view=practice">${s.lang === "fr" ? "Remplir un outil" : "Fill a worksheet"}</a><a class="s-btn outline" href="#/find">${t("navFind")}</a></div>
    </div>${art()}</section>
    <div class="s-statline"><span><b>50</b> ${t("methods")}</span><span><b>5</b> ${t("families")}</span><span><b>8</b> ${t("slidesEach")}</span><span><b>3</b> ${t("formats")}</span></div></div>
    <section class="s-wrap s-section s-landingsection" id="find" tabindex="-1"><div class="s-sectionhead"><div><div class="s-kicker">${t("navFind")}</div><h2>${t("quizTitle")}</h2></div><p>${t("quizSub")}</p></div>${quiz()}</section>
    <section class="s-wrap s-section s-landingsection"><h2>${t("landingStart")}</h2><ol class="s-startpath">${["Guide", "Canvas", "Deck"].map((key, i) => `<li><span>0${i + 1}</span><h3><a href="#/tool/eisenhower?view=${["learn", "practice", "slides"][i]}">${t("start" + key)}</a></h3><p>${t("start" + key + "Copy")}</p></li>`).join("")}</ol>
      <div class="s-sectionhead"><h2>${t("startHere")}</h2></div><div class="s-grid">${["eisenhower", "pareto", "pomodoro"].map((id) => card(byId(id))).join("")}</div></section>
    ${window.ProductivityLearning.landing(localizedTools(), s.lang, esc, link)}${landingSupport()}`;
  }
  function audienceFit(x) {
    if (s.who === "me") return x.m !== "team" && x.out.includes("me");
    if (s.who === "team") return x.m !== "solo";
    if (s.who === "boss") return x.out.includes("manager");
    if (s.who === "client") return x.out.includes("clients");
    return (
      x.m !== "solo" && (x.out.includes("clients") || x.out.includes("manager"))
    );
  }
  function scored(x) {
    let n = 0;
    const why = [];
    const limit = { short: 15, medium: 60, long: Infinity }[s.time];
    if (x.t <= limit) {
      n += 3;
      why.push(t("fitsTime"));
    } else n -= 5;
    if (audienceFit(x)) {
      n += 6;
      why.push(t("fitsAudience"));
    }
    if (x.fm === s.fm) {
      n += 2;
      why.push(t("fitsStyle"));
    }
    if (s.freq === "regular" && x.rec) {
      n++;
      why.push(t("fitsRepeat"));
    }
    if (s.freq === "once" && !x.rec) n++;
    return { n, why: why.join(" · ") };
  }
  function results() {
    const limit = { short: 15, medium: 60, long: Infinity }[s.time];
    const familyTools = localizedTools()
      .filter((x) => x.f === s.need)
      .map((x) => ({ x, s: scored(x) }))
      .sort((a, b) => b.s.n - a.s.n);
    const fits = (entry) => audienceFit(entry.x) && entry.x.t <= limit;
    const matches = familyTools.filter(fits),
      alternatives = familyTools.filter((entry) => !fits(entry));
    const fallback =
      s.lang === "fr"
        ? "Aucune méthode de cette famille ne respecte à la fois ce public et ce temps. Ajuste ta recherche ou compare les alternatives ci-dessous."
        : "No method in this family meets both the audience and time constraints. Adjust your choices or compare the alternatives below.";
    const reason = (x) =>
      [
        s.lang === "fr" ? "Alternative" : "Alternative",
        ...(x.t > limit
          ? [
              s.lang === "fr"
                ? "plus de temps nécessaire"
                : "requires more time",
            ]
          : []),
        ...(!audienceFit(x)
          ? [s.lang === "fr" ? "public à adapter" : "audience needs adaptation"]
          : []),
      ].join(" · ");
    return `<section class="s-wrap s-section"><div class="s-kicker">${t("recommendations")}</div><h1>${t("rec")}</h1><p class="s-visual-note">${family(s.need)} · ${t(s.who)} · ${t(s.time)}</p><p>${t("recommendationHelp")}</p><div class="s-btns"><a class="s-btn outline tiny" href="#/find">${t("navFind")}</a></div>
      ${matches.length ? `<div class="s-grid">${matches.map((entry) => card(entry.x, entry.s.why)).join("")}</div>` : `<p class="w-no-match" role="status">${fallback}</p>`}
      ${alternatives.length ? `<h2>${s.lang === "fr" ? "Alternatives à comparer" : "Alternatives to compare"}</h2><div class="s-grid">${alternatives.map((entry) => card(entry.x, reason(entry.x))).join("")}</div>` : ""}</section>`;
  }
  const normalize = (value) =>
    value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const hasFilters = () =>
    Boolean(
      s.query ||
        [s.family, s.audience, s.duration, s.difficulty, s.deliverable].some(
          (value) => value !== "all",
        ),
    );
  function filtered() {
    const search = window.ProductivitySearch;
    return localizedTools()
      .filter((x) => {
        if (s.family !== "all" && s.family !== x.f) return false;
        if (
          (s.audience === "solo" && x.m === "team") ||
          (s.audience === "team" && x.m === "solo")
        )
          return false;
        if (s.duration !== "all" && x.t > Number(s.duration)) return false;
        if (s.difficulty !== "all" && x.fm !== s.difficulty) return false;
        if (
          s.deliverable === "score" &&
          !["rice", "weighted", "pareto"].includes(x.id)
        )
          return false;
        if (s.deliverable === "workshop" && x.m === "solo") return false;
        if (
          s.deliverable === "plan" &&
          !["organise", "review", "focus"].includes(x.f)
        )
          return false;
        return search.match({ ...tools[x.number - 1], ...x }, s.query);
      })
      .sort(
        (a, b) =>
          (search.match(b, s.query)?.score || 0) -
          (search.match(a, s.query)?.score || 0),
      );
  }
  function cards(items) {
    return items.length
      ? items
          .map((x) =>
            card(
              x,
              s.query
                ? (s.lang === "fr"
                    ? {
                        name: "Nom de méthode correspondant",
                        need: "Besoin correspondant",
                        related: "Formulation proche",
                      }
                    : {
                        name: "Matching method name",
                        need: "Matching need",
                        related: "Related wording",
                      })[window.ProductivitySearch.match(x, s.query)?.kind] ||
                    ""
                : "",
            ),
          )
          .join("")
      : `<div class="s-empty">${t("nothing")}<p>Eisenhower · Pareto · RICE · 4Ls</p><button class="s-btn outline tiny" data-act="reset-filters">${t("filterReset")}</button></div>`;
  }
  function updateCatalogue() {
    const items = filtered();
    document.getElementById("cards").innerHTML = cards(items);
    document.getElementById("counter").textContent = items.length + " / 50";
    if (/^https?:$/.test(location.protocol)) {
      const url = new URL(location.href);
      for (const [key, value] of Object.entries({
        q: s.query,
        family: s.family,
        audience: s.audience,
        duration: s.duration,
        difficulty: s.difficulty,
        deliverable: s.deliverable,
      })) {
        if (value && value !== "all") url.searchParams.set(key, value);
        else url.searchParams.delete(key);
      }
      history.replaceState(null, "", url);
    }
    app.querySelector('[data-act="reset-filters"]').disabled = !hasFilters();
    app
      .querySelectorAll("[data-family]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.family === s.family),
        ),
      );
  }
  function all() {
    const items = filtered();
    return `<section class="s-wrap s-section s-catalogue">
      <div class="s-kicker">${t("library")}</div>
      <h1>${t("all")}<span class="s-title-dot">.</span></h1><p class="s-catalogueintro">${t("catalogueIntro")}</p>
      <div class="s-toolbar">
        <input id="search-tools" type="search" class="s-search" aria-label="${t("search")}" placeholder="${t("search")}" value="${esc(s.query)}">
        <select class="s-select" id="audience" aria-label="${t("who")}"><option value="all">${t("anyAudience")}</option><option value="solo">${t("alone")}</option><option value="team">${t("asTeam")}</option></select>
        <select class="s-select" id="duration" aria-label="${t("maxDuration")}"><option value="all">${t("anyDuration")}</option>${[15, 30, 60].map((min) => `<option value="${min}">≤ ${min} min</option>`).join("")}</select>
        <select class="s-select" id="difficulty" aria-label="${t("style")}"><option value="all">${t("anyStyle")}</option>${["casual", "structured", "formal"].map((style) => `<option value="${style}">${t(style)}</option>`).join("")}</select>
      <select class="s-select" id="deliverable" aria-label="${s.lang === "fr" ? "Résultat attendu" : "Expected result"}">${[
        ["all", s.lang === "fr" ? "Tous les résultats" : "All outputs"],
        ["score", s.lang === "fr" ? "Obtenir un score" : "Calculate a score"],
        [
          "workshop",
          s.lang === "fr" ? "Préparer un atelier" : "Run a workshop",
        ],
        ["plan", s.lang === "fr" ? "Préparer un plan" : "Build a plan"],
      ]
        .map(([id, label]) => `<option value="${id}">${label}</option>`)
        .join("")}</select></div>
      <div class="s-cataloguebar">
        <div class="s-filters">${[["all", t("allFamilies")], ...Object.keys(names).map((k) => [k, family(k)])].map(([key, label]) => `<button class="s-filter" data-family="${key}" aria-pressed="${s.family === key}">${label}</button>`).join("")}</div>
        <div class="s-cataloguecount"><span id="counter" aria-live="polite">${items.length} / 50</span><button class="s-btn outline tiny" data-act="reset-filters" ${hasFilters() ? "" : "disabled"}>${t("filterReset")}</button></div>
      </div>
      <div class="w-suggestions">${(s.lang === "fr" ? ["urgent important", "prioriser backlog", "compte rendu atelier", "80/20"] : ["urgent important", "product backlog", "retrospective workshop", "80/20"]).map((query) => `<button class="s-btn outline tiny" data-query="${esc(query)}">${esc(query)}</button>`).join("")}</div><div class="s-grid" id="cards">${cards(items)}</div>
    </section>`;
  }
  const VERIFIED_LINKS = {
    pareto: "https://asq.org/quality-resources/pareto",
    pomodoro: "https://www.pomodorotechnique.com/",
    smart: "https://openurl.ebsco.com/contentitem/edb%3A6043491",
    cynefin: "https://thecynefin.co/team/dave-snowden/",
    rice: "https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/",
    gtd: "https://gettingthingsdone.com/what-is-gtd/",
    pdca: "https://asq.org/quality-resources/pdca-cycle",
  };
  function sourceUrl(x) {
    return x.reference?.url || VERIFIED_LINKS[x.id] || null;
  }
  function sampleTable(x) {
    const labels = fieldNames(x),
      grid = x.d[0] === "grid";
    const headers = grid ? x.d[1].cols : [t("entry")];
    const cells = (i) =>
      grid
        ? headers.map((_, j) => x.sampleCells?.["c" + i + "-" + j] || "")
        : [x.sample[i]];
    return `<details class="s-sampledata"><summary>${t("dataView")}</summary>
      <div class="s-table-scroll"><table><thead><tr><td></td>${headers.map((label) => `<th scope="col">${esc(label)}</th>`).join("")}</tr></thead>
      <tbody>${labels
        .map(
          (label, i) =>
            `<tr><th scope="row">${esc(label)}</th>${cells(i)
              .map((value) => `<td>${esc(value)}</td>`)
              .join("")}</tr>`,
        )
        .join("")}</tbody></table></div>
    </details>`;
  }
  function learn(x) {
    const steps = (title, items) =>
      `<section><h3>${title}</h3><ol class="s-steps">${items.map((step, i) => `<li><b aria-hidden="true">${String(i + 1).padStart(2, "0")}</b><span>${esc(step)}</span></li>`).join("")}</ol></section>`;
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
          <div class="s-casevisual">${diagram(x, x.sampleCells || x.sample)}${sampleTable(x)}</div>
          <div class="s-case">
            <section><h3>${t("caseReasoning")}</h3><p>${esc(x.case.reasoning)}</p></section>
            <section><h3>${t("caseDecision")}</h3><p>${esc(x.ex)}</p></section>
            <section><h3>${t("caseCheck")}</h3><p>${esc(x.case.check)}</p></section>
          </div>
        </div>
      </section>
      ${window.ProductivityLearning.guide(x, localizedTools(), s.lang, esc, link)}
      <section class="s-guidepractice"><h2>${t("practiceHeading")}</h2><div class="s-guidesteps">
        ${steps(t("alone"), x.solo)}${steps(t("asTeam"), x.team)}
        <p class="s-workshoptime"><strong>${t("timing")}</strong> · ${t("timingBefore")} ${Math.max(2, Math.round(x.t / Math.max(1, x.team.length)))} ${t("timingAfter")}</p>
      </div><div class="s-btns"><button class="s-btn orange" data-act="tab" data-val="practice">${t("openWorksheet")} →</button></div></section>
      ${window.ProductivityDistribution.panel(x, s.lang, esc, new URL(link(x), location.href).href)}
      <details class="s-attribution"><summary>${t("src")}</summary><p>${esc(x.src)}${sourceUrl(x) ? ` · <a href="${esc(sourceUrl(x))}" target="_blank" rel="noopener noreferrer">${t("readSource")} ↗</a>` : ""}</p><p>${x.reference?.status === "linked-primary" ? (s.lang === "fr" ? "Référence primaire liée. Les exemples et schémas de cette fiche sont des adaptations originales." : "Primary reference linked. The examples and diagrams in this guide are original adaptations.") : t("status")}</p></details>
    </div>`;
  }
  function worksheet(x) {
    const labels = fieldNames(x),
      values = answers(x),
      grid = x.d[0] === "grid",
      interactive = engine.supported.includes(x.id);
    const input = (label, key) =>
      `<div><label for="input-${key}">${esc(label)}</label><textarea id="input-${key}" data-field="${key}" rows="2" maxlength="2000" placeholder="${t("placeholder")}">${esc(values[key] || "")}</textarea></div>`;
    const fields = labels
      .map((label, i) => {
        if (!grid) return input(label, i);
        return `<fieldset><legend>${esc(label)}</legend>${x.d[1].cols.map((col, j) => input(col, "c" + i + "-" + j)).join("")}${values[i] ? input(t("rowNote"), i) : ""}</fieldset>`;
      })
      .join("");
    return `${interactive ? workspace.render(x, workFor(x), s.lang, esc) : ""}<div class="s-canvaslayout ${interactive ? (Object.keys(values).length ? "w-legacy w-has-legacy" : "w-legacy") : ""}"><div class="s-canvaspaper">
      <div class="s-viewtoolbar"><span class="s-kicker">${t("livePreview")}</span><button class="s-btn outline tiny" data-act="example">${s.example ? t("viewMine") : t("filled")}</button></div>
      <div id="diagram">${diagram(x, s.example ? x.sampleCells || x.sample : values, !s.example)}</div><p class="s-source">${s.example ? t("fiction") : t("tip")}</p>
    </div><aside class="s-panel"><div class="s-worksheet"><h3>${interactive ? wt("export") : t("myEntries")}</h3><p class="s-smallnote" id="worksheet-save" role="status">${savedStatus(x)}</p>${interactive ? (Object.keys(values).length ? `<details class="w-old-notes"><summary>${s.lang === "fr" ? "Notes d’un ancien canevas" : "Notes from an earlier worksheet"}</summary>${fields}</details>` : "") : fields}
      <button class="s-btn orange s-worksheet-primary" data-act="worksheet-slides">${t(hasAnswers(x) ? "seeWorksheetSlide" : "seeBlankWorksheet")} →</button>
      <details class="s-answer-management" id="answer-management">
        <summary>${t("manageAnswers")}</summary>
        <p>${t("backupHelp")}</p>
        <div class="s-backup-actions">
          <button class="s-btn outline tiny" data-act="json" ${hasAnswers(x) ? "" : "disabled"}>${t("backupDownload")}</button>
          <button class="s-btn outline tiny" data-act="import">${t("backupOpen")}</button>
        </div>
        <button class="s-delete-link" data-act="clear" ${hasAnswers(x) ? "" : "disabled"}>${t("clearAnswers")}</button>
        <input id="import-file" type="file" accept=".json,application/json" hidden>
      </details>
      <p class="s-smallnote" id="worksheet-message" role="status"></p>
      ${reusePanel(x)}
      <dialog class="s-answer-dialog" id="answer-dialog" aria-labelledby="answer-dialog-title"></dialog>
    </div></aside></div>`;
  }
  function stableFields(x) {
    const output = {};
    x.fieldIds.forEach((id, i) => {
      if (answers(x)[i]) output[id] = answers(x)[i];
      x.columnIds?.forEach((col, j) => {
        const value = answers(x)["c" + i + "-" + j];
        if (value) output[id + "/" + col] = value;
      });
    });
    return output;
  }
  function syncWorksheet(x) {
    const filled = hasAnswers(x);
    const status = document.getElementById("worksheet-save");
    const message = savedStatus(x);
    if (status.textContent !== message) status.textContent = message;
    app.querySelector('[data-act="json"]').disabled = !filled;
    app.querySelector('[data-act="clear"]').disabled = !filled;
    app.querySelector('[data-act="worksheet-slides"]').textContent =
      t(filled ? "seeWorksheetSlide" : "seeBlankWorksheet") + " →";
  }
  function worksheetMessage(key) {
    const status = document.getElementById("worksheet-message");
    if (status) status.textContent = key ? t(key) : "";
  }
  function afterWorksheetChange(key) {
    s.example = false;
    render();
    const details = document.getElementById("answer-management");
    details.open = true;
    details.querySelector("summary").focus({ preventScroll: true });
    worksheetMessage(key);
  }
  function openAnswerDialog(kind, name = "") {
    const dialog = document.getElementById("answer-dialog");
    const deleting = kind === "delete";
    const filled = hasAnswers(byId(s.id));
    dialog.innerHTML = `<h3 id="answer-dialog-title">${t(deleting ? "clearConfirm" : filled ? "importReview" : "restoreAnswers")}</h3>
      <p>${t(deleting ? "clearDetails" : filled ? "importReviewHelp" : "restoreHelp")}</p>${name ? `<p class="s-backup-file">${esc(name)}</p>` : ""}
      <div class="s-dialog-actions"><button class="s-btn outline tiny" data-act="cancel-answer" autofocus>${t("cancel")}</button>
      ${
        deleting
          ? `<button class="s-btn tiny s-danger" data-act="confirm-clear">${t("clearNow")}</button>`
          : `<button class="s-btn orange tiny" data-act="import-blank">${filled && pendingBackup?.work ? (s.lang === "fr" ? "Garder et ajouter les lignes" : "Keep and add rows") : t(filled ? "importBlank" : "restoreAnswers")}</button>
        ${filled ? `<button class="s-btn outline tiny" data-act="import-replace">${t("importReplace")}</button>` : ""}`
      }
      </div>`;
    dialog.addEventListener(
      "close",
      () => {
        pendingBackup = null;
      },
      { once: true },
    );
    dialog.showModal();
  }
  async function reviewBackup(input, x) {
    const sequence = ++backupSequence,
      file = input.files[0];
    if (!file) return;
    input.value = "";
    pendingBackup = null;
    try {
      if (file.size > 256 * 1024) throw Error("invalid");
      const obj = JSON.parse(await file.text());
      if (obj.schemaVersion && ![1, 2, 3].includes(obj.schemaVersion))
        throw Error("invalid");
      if (!input.isConnected || sequence !== backupSequence) return;
      if (!obj || typeof obj.toolId !== "string") throw Error("invalid");
      if (obj.toolId !== x.id) {
        worksheetMessage("importWrong");
        return;
      }
      if (
        !obj.values ||
        Array.isArray(obj.values) ||
        typeof obj.values !== "object"
      )
        throw Error("invalid");
      if (
        obj.schemaVersion === 3 &&
        obj.fields &&
        typeof obj.fields === "object"
      ) {
        obj.values = {};
        x.fieldIds.forEach((id, i) => {
          if (typeof obj.fields[id] === "string")
            obj.values[i] = obj.fields[id];
          x.columnIds?.forEach((col, j) => {
            if (typeof obj.fields[id + "/" + col] === "string")
              obj.values["c" + i + "-" + j] = obj.fields[id + "/" + col];
          });
        });
      }
      if (
        obj.workspace &&
        (typeof obj.workspace !== "object" ||
          Array.isArray(obj.workspace) ||
          obj.workspace.rows?.length > 100)
      )
        throw Error("invalid");
      const cols = x.d[0] === "grid" ? x.d[1].cols.length : 0;
      const keys = fieldNames(x).flatMap((_, i) => [
        String(i),
        ...Array.from({ length: cols }, (_, j) => "c" + i + "-" + j),
      ]);
      if (
        keys.some(
          (key) =>
            typeof obj.values[key] === "string" &&
            obj.values[key].length > 2000,
        )
      )
        throw Error("invalid");
      const values = Object.fromEntries(
        keys
          .filter((key) => hasAnswer(obj.values[key]))
          .map((key) => [key, obj.values[key]]),
      );
      const work =
        [2, 3].includes(obj.schemaVersion) && obj.workspace
          ? engine.validate(obj.workspace)
          : null;
      if (!Object.keys(values).length && !engine.hasContent(work)) {
        worksheetMessage("importEmpty");
        return;
      }
      pendingBackup = { id: x.id, values, work };
      worksheetMessage("");
      openAnswerDialog("import", file.name);
    } catch (e) {
      if (input.isConnected) worksheetMessage("invalid");
    }
  }
  function applyBackup(x, replace) {
    if (pendingBackup?.id !== x.id) return;
    const incoming = pendingBackup.values,
      importedWork = pendingBackup.work;
    const current = answers(x);
    const additions = Object.entries(incoming).filter(
      ([key]) => !hasAnswer(current[key]),
    );
    if (!replace && !additions.length && !importedWork) {
      document.getElementById("answer-dialog").close();
      worksheetMessage("importNoNew");
      return;
    }
    let nextWork = null;
    try {
      if (importedWork)
        nextWork = replace
          ? importedWork
          : engine.merge(workFor(x), importedWork);
    } catch (error) {
      const message = document.createElement("p");
      message.setAttribute("role", "alert");
      message.textContent = wt("tooMany");
      document.getElementById("answer-dialog").append(message);
      return;
    }
    s.answers[x.id] = replace
      ? incoming
      : { ...current, ...Object.fromEntries(additions) };
    if (nextWork) s.work[x.id] = nextWork;
    pendingBackup = null;
    markUsed();

    afterWorksheetChange("importDone");
  }
  function reusePanel(x) {
    return `${!engine.supported.includes(x.id) ? workspace.plan(x, workFor(x), s.lang, esc) : ""}<details class="w-reuse"><summary>${wt("export")}</summary><p>${window.ProductivityLearning.content[s.lang].privacy}</p><div class="s-btns">
      ${["markdown", "text", "csvOut", "calendar", "onePdf", "onePpt", "memo"].map((key) => `<button class="s-btn outline tiny" data-reuse="${key}">${wt(key)}</button>`).join("")}
      <button class="s-btn outline tiny" data-act="share">${t("share")}</button>${x.id !== "eisenhower" ? `<button class="s-btn outline tiny" data-work-act="transfer">${wt("transfer")}</button>` : ""}
      </div><p class="s-smallnote">${wt("saved")}</p></details>`;
  }
  function slideContent(x, n) {
    const [w, h] = deck.spec(s.ratio);
    return `<div class="s-slide" data-ratio="${s.ratio}" id="slide-canvas">${deck.svg(deck.compose(projected(x).method, s.ratio, projected(x).values, t, family(x.f))[n], w, h, esc, x.n + " · " + (n + 1) + " / 8")}</div>`;
  }
  const chapters = [
    "overview",
    "caseBrief",
    "methodMap",
    "soloChapter",
    "worksheetChapter",
    "decisionChapter",
    "teamChapter",
    "reviewChapter",
  ];
  function slides(x) {
    const chaptersHtml = chapters
      .map(
        (key, i) =>
          `<button class="s-chapter" data-act="slide" data-val="${i}" aria-current="${s.current === i ? "step" : "false"}"><span>${String(i + 1).padStart(2, "0")}</span>${t(key)}</button>`,
      )
      .join("");
    return `<div class="s-deckworkspace">
      <div class="s-deckstage">
        <div class="s-viewtoolbar"><div><label class="s-kicker" for="ratio">${t("format")}</label>
          <select class="s-select" id="ratio">${["16:9", "9:10", "9:16"].map((v) => `<option value="${v}" ${s.ratio === v ? "selected" : ""}>${v}</option>`).join("")}</select></div>
          <div><button class="s-btn outline tiny" data-act="fullscreen">${t("fullscreen")}</button><button class="s-btn outline tiny" data-act="share">${t("share")}</button></div>
        </div>
        <div class="s-viewframe" id="viewframe" tabindex="-1">${slideContent(x, s.current)}</div>${s.reading ? readableSlides(x) : ""}
        <div class="s-viewnav"><button class="s-btn outline tiny" data-act="previous" ${s.current === 0 ? "disabled" : ""}>← ${t("previous")}</button>
          <strong class="s-count" aria-live="polite">${s.current + 1} / 8 · ${t(chapters[s.current])}</strong>
          <button class="s-btn outline tiny" data-act="next" ${s.current === 7 ? "disabled" : ""}>${t("next")} →</button></div>
      </div>
      <aside class="s-deckaside">
        <nav aria-label="${t("deckNav")}"><h3>${t("deckNav")}</h3><div class="s-chapters">${chaptersHtml}</div></nav>
        <section class="s-deckexports"><button class="s-btn outline tiny" data-work-act="read-slides">${wt("reading")}</button><h3>${t("exportTitle")}</h3>
          <p id="export-status" class="s-status" role="status">${t("preview")}</p>
          <button class="s-btn orange" data-act="pptx">${t("pptx")} ↓</button>
          <button class="s-btn outline" data-act="pdf">${t("pdf")} ↓</button>
        </section>
      </aside>
    </div>`;
  }
  function readableSlides(x) {
    const pages = deck.compose(
      projected(x).method,
      s.ratio,
      projected(x).values,
      t,
      family(x.f),
    );
    return `<div class="w-reading">${pages
      .map(
        (page, i) =>
          `<section><h3>${i + 1}. ${t(chapters[i])}</h3>${page
            .filter((item) => item.type === "text" && item.size > 9)
            .map((item) => `<p>${esc(item.content)}</p>`)
            .join("")}</section>`,
      )
      .join("")}</div>`;
  }
  const views = [
    ["learn", "guide"],
    ["practice", "worksheetTab"],
    ["slides", "presentation"],
  ];
  function detail(x) {
    return `<div class="s-wrap">
      <div class="s-breadcrumb"><a href="#/all">← ${t("back")}</a><span>/</span><span>${family(x.f)}</span></div>
      <section class="s-detailhead"><div>
        <div class="s-kicker">${t("brand")} / ${String(x.number).padStart(2, "0")} ${t("of50")}</div>
        <h1>${esc(x.n)}<span class="s-title-dot">.</span></h1><p>${esc(x.why)}</p>
        <div class="s-detailmeta"><span class="s-badge">${family(x.f)}</span><span class="s-badge">${x.t} min</span><span class="s-badge">${t(x.m === "solo" ? "alone" : x.m === "team" ? "asTeam" : "soloOrTeam")}</span></div>
      </div></section>
      <div class="s-tabbar" role="tablist" aria-label="${esc(x.n)}">
        ${views.map(([key, label], i) => `<button id="method-tab-${key}" role="tab" class="s-tab" data-act="tab" data-val="${key}" aria-controls="tabpanel" aria-selected="${s.tab === key}" tabindex="${s.tab === key ? 0 : -1}"><span class="s-tab-index">0${i + 1}</span><span>${t(label)}<small>${t(label === "worksheetTab" ? "worksheetHint" : label + "Hint")}</small></span></button>`).join("")}
      </div>
      <div id="tabpanel" role="tabpanel" aria-labelledby="method-tab-${s.tab}" tabindex="0">${s.tab === "learn" ? learn(x) : s.tab === "practice" ? worksheet(x) : slides(x)}</div>
    </div>`;
  }
  const currentRoute = router.route;
  function render() {
    document.documentElement.lang = s.lang;
    let route = currentRoute();
    router.sync(route, s.lang);
    s.id = route.id || "";
    let x = byId(s.id);
    app.innerHTML =
      '<div class="studio"><a class="s-screenreader" href="#studio-main">' +
      t("skip") +
      "</a>" +
      header(route) +
      '<main id="studio-main" tabindex="-1">' +
      (route.v === "kit"
        ? window.ProductivityLearning.kitPage(
            route.id,
            localizedTools(),
            s.lang,
            esc,
            link,
          )
        : route.v === "tool" && x
          ? detail(x)
          : route.v === "all"
            ? all()
            : route.v === "results"
              ? results()
              : home()) +
      "</main>" +
      footer() +
      "</div>";
    document.title =
      (x ? x.n + " · " : "") +
      t("brand") +
      " / " +
      t("day") +
      " · The Unfinished 30";
    for (const key of ["audience", "duration", "difficulty", "deliverable"]) {
      const control = document.getElementById(key);
      if (control) control.value = s[key];
    }
    let v = document.getElementById("viewframe");
    if (v) {
      let touch = 0;
      v.addEventListener(
        "touchstart",
        (e) => (touch = e.changedTouches[0].screenX),
        { passive: true },
      );
      v.addEventListener(
        "touchend",
        (e) => {
          if (Math.abs(e.changedTouches[0].screenX - touch) > 40) {
            moveSlide(e.changedTouches[0].screenX < touch ? 1 : -1);
          }
        },
        { passive: true },
      );
    }
  }
  function notify(v) {
    let a = document.getElementById("export-status");
    if (a) a.textContent = v;
    else {
      let el = document.createElement("div");
      el.className = "s-toast";
      el.textContent = v;
      el.setAttribute("role", "status");
      document.body.append(el);
      setTimeout(() => el.remove(), 2800);
    }
  }
  function download(name, value, type) {
    let url = URL.createObjectURL(
      new Blob([value], { type: type || "text/plain" }),
    );
    let a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const libraries = new Map();
  function loadLibrary(url, test) {
    if (libraries.has(url)) return libraries.get(url);
    const promise = new Promise((resolve, reject) => {
      if (test()) return resolve();
      let tag = document.createElement("script");
      tag.src = asset(url);
      tag.onload = () =>
        test() ? resolve() : reject(new Error("Library did not load"));
      tag.onerror = () => reject(new Error("offline"));
      document.head.appendChild(tag);
    });
    libraries.set(url, promise);
    promise.catch(() => libraries.delete(url));
    return promise;
  }
  async function exportDeck(x, kind) {
    const b = app.querySelector('[data-act="' + kind + '"]');
    if (b?.disabled) return;
    if (hasWork(x) && engine.calculate(x, s.work[x.id]).errors.length) {
      notify(wt("rice"));
      return;
    }
    if (b) b.disabled = true;
    const lang = s.lang,
      ratio = s.ratio,
      translate = (key) => L[lang][key] || key;
    const pages = deck.compose(
      projected(x).method,
      ratio,
      projected(x).values,
      translate,
      family(x.f),
    );
    if (
      pages.some((page) =>
        page.some((item) => item.type === "text" && deck.fit(item).clipped),
      ) &&
      !window.confirm(
        s.lang === "fr"
          ? "Certains textes dépassent la place disponible. Le CSV et le résumé gardent le texte complet. Télécharger cette présentation avec des textes abrégés ?"
          : "Some text exceeds the available space. CSV and the summary keep the full text. Download this presentation with shortened text?",
      )
    ) {
      if (b) b.disabled = false;
      return;
    }
    const [width, height] = deck.spec(ratio);
    const file = "day04-" + x.id + "-" + lang + "-" + ratio.replace(":", "x");
    notify(t(kind + "Working"));
    try {
      if (kind === "pptx") {
        await loadLibrary(
          "vendor/pptxgen.bundle.js",
          () => !!(window.PptxGenJS || window.pptxgen),
        );
        const Pptx = window.PptxGenJS || window.pptxgen,
          pptx = new Pptx();
        pptx.defineLayout({ name: "DAY04", width, height });
        pptx.layout = "DAY04";
        pptx.author = "Salah Khenissi";
        pptx.title = x.n;
        pptx.lang = lang === "fr" ? "fr-FR" : "en-US";
        pages.forEach((page) =>
          deck.addPptx(pptx.addSlide(), pptx.ShapeType, page, lang),
        );
        await pptx.writeFile({ fileName: file + ".pptx" });
      } else {
        await loadLibrary(
          "vendor/jspdf.umd.min.js",
          () => !!window.jspdf?.jsPDF,
        );
        const orientation = width > height ? "landscape" : "portrait";
        const pdf = new window.jspdf.jsPDF({
          orientation,
          unit: "in",
          format: [width, height],
        });
        pdf.setProperties({ title: x.n, author: "Salah Khenissi" });
        pages.forEach((page, i) => {
          if (i) pdf.addPage([width, height], orientation);
          deck.addPdf(pdf, page);
        });
        pdf.save(file + ".pdf");
      }
      count("download_" + kind);
      notify(t(kind + "Done"));
    } catch (error) {
      notify(
        t(kind + "Error") +
          (error.message === "offline" ? " " + t("offline") : ""),
      );
    } finally {
      if (b) b.disabled = false;
    }
  }
  async function copyUrl() {
    const x = byId(s.id),
      state = x
        ? { v: "tool", id: x.id, view: s.tab, slide: s.current, ratio: s.ratio }
        : currentRoute();
    const url = new URL(
      router.url(state, s.lang),
      "https://the-unfinished-30.vercel.app",
    ).href;
    try {
      count("share_link");
      if (navigator.share)
        await navigator.share({ title: x?.n || t("brand"), url });
      else {
        await navigator.clipboard.writeText(url);
        notify(t("copied"));
      }
    } catch (e) {
      if (e.name !== "AbortError") notify(t("htmlError"));
    }
  }
  const vendorFiles = [
    "vendor/pptxgen.bundle.js",
    "vendor/jspdf.umd.min.js",
    "vendor/NOTICES.txt",
  ];
  async function assetText(file) {
    const response = await fetch(asset(file));
    if (!response.ok) throw Error(file);
    return response.text();
  }
  const inlineScript = (code) =>
    "<script>" + code.replace(/<\/script/gi, "<\\/script") + "</" + "script>";
  async function downloadHtml() {
    const embedded = document.getElementById("offline-notices");
    if (embedded) {
      const root = document.documentElement.cloneNode(true);
      root.querySelector("#app").replaceChildren();
      download(
        "productivity-studio-day04-" + s.lang + ".html",
        "<!doctype html>\n" + root.outerHTML,
        "text/html",
      );
      return;
    }
    const lang = s.lang;
    if (/^https?:$/.test(location.protocol)) {
      try {
        const html = await assetText(
          "downloads/productivity-studio-" + lang + ".html",
        );
        download("productivity-studio-" + lang + ".html", html, "text/html");
        count("download_html");
        return;
      } catch (e) {
        notify(t("htmlError"));
        return;
      }
    }
    notify(t("htmlPreparing"));
    try {
      const files = [
        "index.html",
        "studio.css",
        "methods.js",
        "deck.js",
        "studio.js",
        ...vendorFiles,
      ];
      const [page, style, methods, deck, studio, pptx, pdf, notices] =
        await Promise.all(files.map(assetText));
      let html = page.replace(
        '<link rel="stylesheet" href="studio.css">',
        () => "<style>" + style + "</style>",
      );
      html = html.replace('<html lang="en">', '<html lang="' + lang + '">');
      html = html.replace(
        '<script src="methods.js" defer></' + "script>",
        () =>
          inlineScript(pptx) +
          inlineScript(pdf) +
          '<script type="text/plain" id="offline-notices">' +
          notices +
          "</" +
          "script>" +
          inlineScript(methods),
      );
      html = html.replace('<script src="deck.js" defer></' + "script>", () =>
        inlineScript(deck),
      );
      html = html.replace('<script src="studio.js" defer></' + "script>", () =>
        inlineScript(studio),
      );
      download(
        "productivity-studio-day04-" + lang + ".html",
        html,
        "text/html",
      );
      notify(t("htmlReady"));
    } catch (e) {
      notify(t("htmlError"));
    }
  }
  async function downloadNotices() {
    try {
      const content =
        document.getElementById("offline-notices")?.textContent ||
        (await assetText(vendorFiles[2]));
      download("productivity-studio-notices.txt", content, "text/plain");
    } catch (e) {
      notify(t("htmlError"));
    }
  }
  function removeLegacy() {
    if (!window.confirm(t("legacyConfirm"))) return;
    try {
      localStorage.removeItem("u30studio");
      localStorage.removeItem("u30studio-feedback");
      hasLegacy = false;
      render();
      focusSection();
      notify(t("legacyDone"));
    } catch (e) {
      notify(t("legacyFailed"));
    }
  }
  function focusSection() {
    const section = currentRoute().section;
    if (section) {
      const target = document.getElementById(section);
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "start" });
    } else window.scrollTo(0, 0);
  }
  function updateWorkResult(x) {
    const target = document.getElementById("work-results");
    if (target) target.innerHTML = workspace.result(x, workFor(x), s.lang, esc);
    const status = document.getElementById("work-status");
    if (status) status.textContent = wt("saved");
  }
  function workRefresh(x, focus) {
    render();
    const target = focus
      ? app.querySelector(focus)
      : document.querySelector(".w-result");
    target?.focus?.({ preventScroll: true });
  }
  app.addEventListener("input", (e) => {
    const path = e.target.dataset.work;
    if (!path) return;
    const x = byId(s.id),
      w = workFor(x),
      parts = path.split(".");
    if (parts[0] === "rows") {
      const row = w.rows[+parts[1]];
      if (!row) return;
      const val =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
      if (parts[2] === "scores") row.scores[+parts[3]] = val;
      else row[parts[2]] = parts[2] === "group" ? Number(val) : val;
    } else if (parts.length === 2) w[parts[0]][+parts[1]] = e.target.value;
    else w[path] = e.target.value;
    markUsed();
    updateWorkResult(x);
    if (document.getElementById("worksheet-save")) syncWorksheet(x);
  });
  app.addEventListener("click", async (e) => {
    const button = e.target.closest("[data-work-act],[data-reuse]");
    if (!button) return;
    const x = byId(s.id);
    if (!x) return;
    const w = workFor(x),
      act = button.dataset.workAct;
    if (button.dataset.reuse) {
      await exportResult(x, button.dataset.reuse);
      return;
    }
    if (act === "add" && w.rows.length < 100) {
      w.rows.push(engine.emptyRow());
      markUsed();
      workRefresh(x, '[data-work="rows.' + (w.rows.length - 1) + '.title"]');
    }
    if (act === "remove") {
      w.rows.splice(+button.dataset.index, 1);
      markUsed();
      workRefresh(x, '[data-work-act="add"]');
    }
    if (act === "update") {
      s.work[x.id] = engine.validate(w);
      count("calculate");
      updateWorkResult(x);
      const result = document.querySelector(".w-result");
      result?.focus();
      result?.scrollIntoView({ block: "start" });
    }
    if (act === "sample" || act === "blank") {
      if (hasWork(x) && !window.confirm(t("clearConfirm"))) return;
      s.work[x.id] = act === "sample" ? engine.sample(x) : engine.empty();
      markUsed();
      workRefresh(x, '[data-work-act="add"]');
    }
    if (act === "read-slides") {
      s.reading = !s.reading;
      render();
    }
    if (act === "transfer") {
      const selected = w.rows.filter((row) => row.selected && row.title.trim());
      if (!selected.length) {
        notify(wt("selected"));
        return;
      }
      if (!window.confirm(wt("transferHelp"))) return;
      const destination = workFor(byId("eisenhower"));
      if (destination.rows.length + selected.length > 100) {
        notify(wt("tooMany"));
        return;
      }
      destination.rows.push(
        ...selected.map((row) => ({
          ...engine.emptyRow(),
          title: row.title,
          owner: row.owner,
          due: row.due,
          group: 0,
        })),
      );
      dirtyMethods.add("eisenhower");
      markUsed();
      navigate({ v: "tool", id: "eisenhower", view: "practice" });
    }
    if (act === "csv-preview") {
      try {
        copiedRows = engine.parseDelimited(
          document.getElementById("work-csv").value,
        );
        if (copiedRows.length < 2) throw Error("rows");
        const heads = copiedRows[0];
        document.getElementById("work-csv-preview").innerHTML =
          "<p>" +
          wt("mapping") +
          "</p>" +
          workspace
            .fields(x)
            .map(
              (key, i) =>
                "<label>" +
                esc(key) +
                '<select data-map="' +
                key +
                '"><option value="">' +
                wt("skip") +
                "</option>" +
                heads
                  .map(
                    (h, j) =>
                      '<option value="' +
                      j +
                      '" ' +
                      (i === j ? "selected" : "") +
                      ">" +
                      esc(h) +
                      "</option>",
                  )
                  .join("") +
                "</select></label>",
            )
            .join("") +
          "<p>" +
          esc(copiedRows[1].join(" · ")) +
          '</p><button class="s-btn orange tiny" data-work-act="csv-apply">' +
          wt("apply") +
          "</button>";
      } catch (error) {
        notify(wt(error.message === "rows" ? "tooMany" : "missing"));
      }
    }
    if (act === "csv-apply" && copiedRows) {
      const mapping = Object.fromEntries(
        [...app.querySelectorAll("[data-map]")].map((select) => [
          select.dataset.map,
          select.value,
        ]),
      );
      if (mapping.title === "") {
        notify(wt("missing"));
        return;
      }
      if (w.rows.some((r) => r.title) && !window.confirm(t("clearConfirm")))
        return;
      s.work[x.id] = engine.validate({
        ...w,
        rows: copiedRows
          .slice(1)
          .map((row) =>
            Object.fromEntries(
              Object.entries(mapping)
                .filter(([, col]) => col !== "")
                .map(([key, col]) => [key, row[Number(col)] || ""]),
            ),
          )
          .map((row) => ({
            ...row,
            scores: [row.score0, row.score1, row.score2],
          })),
      });
      copiedRows = null;
      markUsed();
      workRefresh(x);
    }
  });
  async function exportResult(x, kind) {
    const w = s.work[x.id],
      markdown = reuse.markdown(x, w, answers(x), s.lang),
      name = x.id + "-" + s.lang;
    try {
      if (
        w &&
        ["onePdf", "onePpt"].includes(kind) &&
        engine.calculate(x, w).errors.length
      ) {
        notify(wt("rows"));
        return;
      }
      if (kind === "markdown") {
        try {
          await navigator.clipboard.writeText(markdown);
          notify(t("copied"));
        } catch (e) {
          download(name + ".md", markdown, "text/markdown");
        }
      } else if (kind === "text")
        download(name + ".md", markdown, "text/markdown");
      else if (kind === "csvOut")
        download(
          name + ".csv",
          engine.csv(reuse.matrix(x, w, s.lang, answers(x))),
          "text/csv",
        );
      else if (kind === "calendar") {
        if (!w?.rows.some((row) => row.due) && !w?.due) {
          notify(wt("date"));
          return;
        }
        download(name + ".ics", reuse.ics(w), "text/calendar");
      } else {
        const page = reuse.onePage(
          x,
          w,
          answers(x),
          t,
          s.lang,
          kind === "memo",
        );
        if (
          page.items.some(
            (item) => item.type === "text" && deck.fit(item).clipped,
          ) &&
          !window.confirm(
            s.lang === "fr"
              ? "Le résultat contient du texte trop long. Utilise le CSV pour le conserver intégralement. Continuer avec une version abrégée ?"
              : "The result contains long text. CSV keeps the full text. Continue with a shortened version?",
          )
        )
          return;
        if (kind === "onePpt") {
          await loadLibrary(
            "vendor/pptxgen.bundle.js",
            () => !!(window.PptxGenJS || window.pptxgen),
          );
          const Presentation = window.PptxGenJS || window.pptxgen,
            ppt = new Presentation();
          ppt.defineLayout({
            name: "RESULT",
            width: page.width,
            height: page.height,
          });
          ppt.layout = "RESULT";
          deck.addPptx(ppt.addSlide(), ppt.ShapeType, page.items, s.lang);
          await ppt.writeFile({ fileName: name + "-result.pptx" });
        } else {
          await loadLibrary(
            "vendor/jspdf.umd.min.js",
            () => !!window.jspdf?.jsPDF,
          );
          const pdf = new window.jspdf.jsPDF({
            unit: "in",
            format: [page.width, page.height],
          });
          deck.addPdf(pdf, page.items);
          pdf.save(name + "-" + (kind === "memo" ? "memo" : "result") + ".pdf");
        }
      }
    } catch (e) {
      notify(t("pdfError"));
    }
  }
  app.addEventListener("click", async (e) => {
    const pilot = e.target.closest("[data-pilot]");
    if (pilot) {
      const notes = document.getElementById("pilot-notes")?.value || "";
      download(
        "studio-test-" + s.lang + ".json",
        JSON.stringify(
          pilot.dataset.pilot === "notes"
            ? {
                tasks: [
                  "Find a method",
                  "Complete a worksheet",
                  "Transmit the result",
                ],
                notes,
              }
            : { counts: sessionCounts },
          null,
          2,
        ),
        "application/json",
      );
    }
    const share = e.target.closest("[data-distribute]");
    if (share) {
      const x = byId(s.id);
      if (!x) return;
      try {
        const url = new URL(link(x), location.href).href,
          blob = await window.ProductivityDistribution.image(x, s.lang, url);
        if (blob)
          download(x.id + "-" + s.lang + "-example.png", blob, "image/png");
        count("share_example");
      } catch (error) {
        notify(t("htmlError"));
      }
    }
  });
  app.addEventListener("submit", (e) => {
    if (e.target.id !== "studio-quiz") return;
    e.preventDefault();
    count("recommendation");
    navigate({ v: "results" });
  });
  let catalogueScroll = 0;
  function navigate(route, push = true) {
    if (currentRoute().v === "all") catalogueScroll = window.scrollY;
    pendingBackup = null;
    s.tab = route.view || "learn";
    s.current = route.slide || 0;
    if (route.ratio) s.ratio = route.ratio;
    s.example = false;
    if (/^https?:$/.test(location.protocol)) {
      if (push) history.pushState(null, "", router.url(route, s.lang));
      render();
      focusSection();
      if (route.v === "all") {
        updateCatalogue();
        window.scrollTo(0, catalogueScroll);
      }
    } else location.hash = router.url(route, s.lang);
  }
  app.addEventListener("click", (e) => {
    const anchor = e.target.closest("a");
    if (
      !anchor ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      anchor.target ||
      anchor.hasAttribute("download")
    )
      return;
    const href = anchor.getAttribute("href");
    if (href?.startsWith("#/")) {
      e.preventDefault();
      const [path, query] = href.slice(2).split("?");
      navigate(
        path.startsWith("tool/")
          ? {
              v: "tool",
              id: path.slice(5),
              view: new URLSearchParams(query || "").get("view"),
            }
          : ["all", "results"].includes(path)
            ? { v: path }
            : { v: "home", section: path || undefined },
      );
    } else if (href?.startsWith(router.root)) {
      e.preventDefault();
      const target = new URL(href, location.href),
        match = target.pathname.match(/\/(?:tools|outils)\/([^/]+)\/$/);
      const kit = target.pathname.match(/\/kits\/([^/]+)\/$/);
      navigate(
        kit
          ? { v: "kit", id: kit[1] }
          : match
            ? { v: "tool", id: decodeURIComponent(match[1]) }
            : { v: "all" },
      );
    }
  });
  window.addEventListener("popstate", () => {
    s.lang = router.lang();
    s.tab = currentRoute().view || "learn";
    render();
    focusSection();
    if (currentRoute().v === "all") {
      updateCatalogue();
      window.scrollTo(0, catalogueScroll);
    }
  });
  app.addEventListener("click", (e) => {
    const suggestion = e.target.closest("[data-query]");
    if (suggestion) {
      s.query = suggestion.dataset.query;
      document.getElementById("search-tools").value = s.query;
      updateCatalogue();
      document.getElementById("search-tools").focus();
      return;
    }
    let f = e.target.closest("[data-family]");
    if (f) {
      s.family = f.dataset.family;
      updateCatalogue();
      return;
    }
    let b = e.target.closest("[data-act]");
    if (!b) {
      if (e.target.closest(".s-screenreader")) {
        e.preventDefault();
        document.getElementById("studio-main").focus();
      }
      return;
    }
    let act = b.dataset.act,
      x = byId(s.id);
    if (act === "lang") {
      s.lang = s.lang === "en" ? "fr" : "en";
      if (/^https?:$/.test(location.protocol))
        history.replaceState(null, "", router.url(currentRoute(), s.lang));
      render();
      app.querySelector('[data-act="lang"]')?.focus();
    }
    if (act === "tab") {
      s.tab = b.dataset.val;
      render();
      document.getElementById("method-tab-" + s.tab)?.focus();
    }
    if (act === "reset-filters") {
      Object.assign(s, {
        family: "all",
        query: "",
        audience: "all",
        duration: "all",
        difficulty: "all",
        deliverable: "all",
      });
      render();
      document.getElementById("search-tools")?.focus();
    }
    if (act === "example-workspace") {
      count("example");
      s.tab = "practice";
      s.example = true;
      render();
      document.getElementById("method-tab-practice")?.focus();
    }
    if (act === "slide") {
      s.current = +b.dataset.val;
      render();
      if (matchMedia("(max-width: 820px)").matches) {
        const frame = document.getElementById("viewframe");
        frame?.focus({ preventScroll: true });
        frame?.scrollIntoView({ block: "start" });
      } else
        app.querySelector('[data-act="slide"][aria-current="step"]')?.focus();
    }
    if (act === "next") moveSlide(1, "next");
    if (act === "previous") moveSlide(-1, "previous");
    if (act === "example") {
      s.example = !s.example;
      render();
    }
    if (act === "worksheet-slides") {
      s.tab = "slides";
      s.current = 4;
      render();
      document.getElementById("method-tab-slides")?.focus();
    }
    if (act === "clear" && hasAnswers(x)) openAnswerDialog("delete");
    if (act === "cancel-answer")
      document.getElementById("answer-dialog")?.close();
    if (act === "confirm-clear") {
      delete s.answers[x.id];
      delete s.work[x.id];
      markUsed();

      afterWorksheetChange("clearDone");
    }
    if (act === "import-blank" || act === "import-replace")
      applyBackup(x, act === "import-replace");
    if (act === "json" && hasAnswers(x)) {
      download(
        x.id + "-answers.json",
        JSON.stringify(
          {
            schemaVersion: 3,
            toolId: x.id,
            fields: stableFields(x),
            values: answers(x),
            workspace: s.work[x.id] || null,
            savedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
        "application/json",
      );
      dirtyMethods.delete(x.id);
      unsaved = dirtyMethods.size > 0;
      worksheetMessage("backupStarted");
    }
    if (act === "import") document.getElementById("import-file")?.click();
    if (act === "fullscreen")
      document.getElementById("slide-canvas")?.requestFullscreen?.();
    if (act === "share") copyUrl();
    if (act === "html") downloadHtml();
    if (act === "notices") downloadNotices();
    if (act === "remove-legacy") removeLegacy();
    if (act === "pptx") exportDeck(x, "pptx");
    if (act === "pdf") exportDeck(x, "pdf");
  });
  app.addEventListener("input", (e) => {
    let z = e.target;
    if (z.id === "search-tools") {
      s.query = z.value;
      updateCatalogue();
    }
    if (z.hasAttribute("data-field")) {
      let a = s.answers[s.id] || (s.answers[s.id] = {});
      a[z.dataset.field] = z.value;
      markUsed();
      s.example = false;
      syncWorksheet(byId(s.id));
      let d = document.getElementById("diagram");
      if (d) d.innerHTML = diagram(byId(s.id), a, true);
      const toggle = app.querySelector('[data-act="example"]');
      if (toggle) toggle.textContent = t("filled");
      const hint = app.querySelector(".s-canvaspaper .s-source");
      if (hint) hint.textContent = t("tip");
    }
  });
  app.addEventListener("change", async (e) => {
    let z = e.target;
    if (z.type === "radio") {
      s[z.name] = z.value;
    }
    if (z.id === "ratio") {
      s.ratio = z.value;
      render();
    }
    if (
      z.id === "audience" ||
      z.id === "duration" ||
      z.id === "difficulty" ||
      z.id === "deliverable"
    ) {
      s[z.id] = z.value;
      updateCatalogue();
    }
    if (z.id === "import-file") await reviewBackup(z, byId(s.id));
  });
  window.addEventListener("hashchange", () => {
    const route = currentRoute();
    s.tab = route.view || "learn";
    s.current = 0;
    s.example = false;
    render();
    focusSection();
  });
  function moveSlide(delta, focus) {
    const index = Math.max(0, Math.min(7, s.current + delta));
    if (index === s.current) return;
    s.current = index;
    render();
    if (focus) {
      const button = app.querySelector(
        focus === "slide"
          ? '[aria-current="step"]'
          : '[data-act="' + focus + '"]',
      );
      (button?.disabled
        ? app.querySelector('[aria-current="step"]')
        : button
      )?.focus({ preventScroll: true });
    }
  }
  document.addEventListener("keydown", (e) => {
    const tab = e.target.closest('[role="tab"]');
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (tab && (delta || ["Home", "End"].includes(e.key))) {
      e.preventDefault();
      const index = views.findIndex(([key]) => key === s.tab);
      s.tab =
        views[
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? 2
              : (index + delta + views.length) % views.length
        ][0];
      render();
      document.getElementById("method-tab-" + s.tab)?.focus();
    } else if (
      delta &&
      s.tab === "slides" &&
      e.target.closest(".s-deckworkspace") &&
      !e.target.matches("select,input,textarea")
    ) {
      e.preventDefault();
      moveSlide(
        delta,
        e.target.dataset.act === "slide"
          ? "slide"
          : delta > 0
            ? "next"
            : "previous",
      );
    }
  });
  const publicFilters = new URLSearchParams(location.search || "");
  const allowedFilters = {
    family: ["all", ...Object.keys(names)],
    audience: ["all", "solo", "team"],
    duration: ["all", "15", "30", "60"],
    difficulty: ["all", "casual", "structured", "formal"],
    deliverable: ["all", "score", "workshop", "plan"],
  };
  for (const key of Object.keys(allowedFilters))
    if (allowedFilters[key].includes(publicFilters.get(key)))
      s[key] = publicFilters.get(key);
  if (publicFilters.has("q")) s.query = publicFilters.get("q").slice(0, 200);
  const initial = currentRoute();
  s.tab = initial.view || "learn";
  s.current = initial.slide || 0;
  if (initial.ratio) s.ratio = initial.ratio;
  render();
  if (currentRoute().section) focusSection();
})();
