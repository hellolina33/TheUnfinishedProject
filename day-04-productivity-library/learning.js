window.ProductivityLearning = (() => {
  "use strict";
  const content = {
    en: {
      quick: "In one minute",
      deep: "Prepare the exercise",
      when: "Use it when",
      input: "Bring these inputs",
      avoid: "Check the assumptions",
      compare: "Choose between nearby methods",
      duration: "Duration",
      output: "What you produce",
      exercise: "Try before revealing the answer",
      question: "Which first action follows from this case?",
      reveal: "Show the reasoning",
      answer:
        "Start by checking the data and the assumptions, then choose an action you can test.",
      materials: "Workshop plan",
      materialText:
        "Use a visible shared worksheet, name a facilitator and a person to record the decision. Let participants write independently before discussing. Reserve the final five minutes for the action and review date.",
      alternatives: "Other method",
      second: "Another situation",
      secondHelp:
        "Try the same method in a different context, then compare the resulting decision.",
      kits: "Work through a situation",
      kitCopy:
        "Follow the methods in order. Keep your own answers in the open tab and download a backup of each result.",
      glossary: "Words used in the tools",
      distribution: "Resources to share",
      shareImage: "Download a public example image",
      embed: "Embed this method",
      embedCopy:
        "Copy this code to show the worksheet on a website. It loads the published guide. Personal answers remain in the visitor’s tab.",
      privacy:
        "Share the method link or the public example. Your worksheet answers are excluded.",
      pilot: "Help test the studio",
      pilotCopy:
        "Try finding a method, completing a worksheet and sending its result to someone. Record where you first got stuck. You can export your notes and decide whether to send them.",
      pilotExport: "Download test notes",
      notes: "Your test notes",
      metricHelp:
        "Session counters contain event names only. They stay in this tab and can be exported voluntarily.",
      metrics: "Download session counts",
    },
    fr: {
      quick: "En une minute",
      deep: "Préparer l’exercice",
      when: "À utiliser quand",
      input: "Prépare ces données",
      avoid: "Vérifie les hypothèses",
      compare: "Choisir entre des méthodes proches",
      duration: "Durée",
      output: "Ce que tu produis",
      exercise: "Essaie avant de lire la réponse",
      question: "Quelle première action découle de ce cas ?",
      reveal: "Afficher le raisonnement",
      answer:
        "Vérifie d’abord les données et les hypothèses, puis choisis une action que tu peux tester.",
      materials: "Déroulé de l’atelier",
      materialText:
        "Prévois un canevas partagé visible, une personne qui anime et une autre qui note la décision. Laisse chacun écrire seul avant la discussion. Garde les cinq dernières minutes pour l’action et sa date de revue.",
      alternatives: "Autre méthode",
      second: "Une autre situation",
      secondHelp:
        "Essaie la même méthode dans un autre contexte, puis compare la décision obtenue.",
      kits: "Traiter une situation de bout en bout",
      kitCopy:
        "Suis les méthodes dans l’ordre. Les réponses restent dans l’onglet ouvert. Télécharge une copie de chaque résultat.",
      glossary: "Les mots utilisés dans les outils",
      distribution: "Ressources à transmettre",
      shareImage: "Télécharger une image du cas public",
      embed: "Intégrer cette méthode",
      embedCopy:
        "Copie ce code pour montrer le canevas sur un site. Il charge le guide publié. Les réponses personnelles restent dans l’onglet du visiteur.",
      privacy:
        "Partage le lien de la méthode ou le cas public. Tes réponses au canevas sont exclues.",
      pilot: "Participer au test de l’atelier",
      pilotCopy:
        "Essaie de trouver une méthode, de remplir un canevas et de transmettre son résultat. Note le premier blocage. Tu peux exporter tes notes et décider de les envoyer.",
      pilotExport: "Télécharger les notes de test",
      notes: "Tes notes de test",
      metricHelp:
        "Les compteurs de session contiennent uniquement des noms d’événements. Ils restent dans cet onglet et peuvent être exportés à ta demande.",
      metrics: "Télécharger les compteurs de session",
    },
  };
  const secondary = {
    eisenhower: {
      en: [
        "A student has an exam on Friday, a club invitation and a course registration deadline today.",
        "Handle the registration today, schedule revision, delegate club logistics and remove optional distractions.",
      ],
      fr: [
        "Une étudiante a un examen vendredi, une invitation associative et une inscription qui ferme aujourd’hui.",
        "Règle l’inscription aujourd’hui, planifie les révisions, délègue la logistique associative et retire les distractions facultatives.",
      ],
    },
    pareto: {
      en: [
        "A support desk tags 40 calls: passwords 18, invoices 12, onboarding 6, other 4.",
        "The first two causes account for 75%. Test a password reset improvement first and compare calls per 100 users.",
      ],
      fr: [
        "Un support classe 40 appels : mots de passe 18, factures 12, prise en main 6, autres 4.",
        "Les deux premières causes représentent 75 %. Teste d’abord une amélioration de la réinitialisation et compare les appels pour 100 utilisateurs.",
      ],
    },
    rice: {
      en: [
        "Compare two quarterly ideas: A reaches 300 users, impact 2, confidence 80%, effort 3; B reaches 800, impact 1, confidence 50%, effort 4.",
        "A scores 160 and B scores 100. Confirm that the reach periods and effort units match before choosing A.",
      ],
      fr: [
        "Compare deux idées trimestrielles : A touche 300 personnes, impact 2, confiance 80 %, effort 3 ; B touche 800 personnes, impact 1, confiance 50 %, effort 4.",
        "A obtient 160 et B obtient 100. Confirme les mêmes périodes de portée et unités d’effort avant de choisir A.",
      ],
    },
    "four-ls": {
      en: [
        "A project group liked shared notes, learned a testing shortcut, lacked access to a dataset and wanted earlier feedback.",
        "Choose one change: request dataset access before the next cycle. Assign an owner and check access at the start.",
      ],
      fr: [
        "Un groupe a apprécié les notes communes, appris un raccourci de test, manqué d’accès aux données et souhaité des retours plus tôt.",
        "Retiens un changement : demander l’accès aux données avant le prochain cycle. Nomme un responsable et vérifie l’accès au démarrage.",
      ],
    },
  };
  const kits = [
    {
      id: "retro",
      en: "Prepare a 30-minute retrospective",
      fr: "Préparer une rétrospective de 30 minutes",
      ids: ["four-ls", "start-stop-continue", "eisenhower"],
    },
    {
      id: "backlog",
      en: "Prioritise a product backlog",
      fr: "Prioriser un backlog produit",
      ids: ["impact-effort", "rice", "premortem"],
    },
    {
      id: "vendors",
      en: "Choose between three suppliers",
      fr: "Choisir entre trois fournisseurs",
      ids: ["weighted", "premortem", "daci"],
    },
  ];
  const glossary = {
    en: {
      Reach: "People or events affected during one defined period.",
      Confidence: "How well the available evidence supports an estimate.",
      Effort: "Total work using a common unit such as person-months.",
      Baseline: "The observed value before a change.",
      Owner: "The person responsible for the next action.",
      WIP: "Work in progress. A limit controls how much is active at once.",
      RICE: "Reach × impact × confidence divided by effort.",
      SMART: "Specific, measurable, achievable, relevant and time-bound goals.",
      OKR: "Objectives and key results. Separate desired outcomes from work items.",
      RACI: "Responsible, accountable, consulted, informed.",
      DACI: "Driver, approver, contributors, informed.",
      MoSCoW: "Must, should, could, and will not have in this release.",
      PDCA: "Plan, do, check, act.",
      FFOM: "French name for SWOT: strengths, weaknesses, opportunities and threats.",
    },
    fr: {
      Portée: "Personnes ou événements concernés sur une période définie.",
      Confiance:
        "Degré de soutien d’une estimation par les éléments disponibles.",
      Effort: "Travail total avec une unité commune, comme les personnes-mois.",
      Référence: "Valeur observée avant un changement.",
      Responsable: "Personne chargée de la prochaine action.",
      WIP: "Travail en cours. Une limite fixe le nombre d’éléments actifs simultanément.",
      RICE: "Portée × impact × confiance, divisés par l’effort.",
      SMART:
        "Objectifs spécifiques, mesurables, atteignables, pertinents et datés.",
      OKR: "Objectifs et résultats clés. Distingue les effets recherchés des tâches.",
      RACI: "Exécute, valide, conseille, est informé.",
      DACI: "Pilote, décide, contribue, est informé.",
      MoSCoW:
        "Indispensable, souhaitable, possible, hors du périmètre de cette version.",
      PDCA: "Planifier, faire, vérifier, agir.",
      FFOM: "Forces, faiblesses, occasions et menaces, aussi appelé SWOT.",
    },
  };
  function guide(method, methods, lang, esc, link) {
    const t = (k) => content[lang][k],
      others = methods
        .filter((m) => m.f === method.f && m.id !== method.id)
        .slice(0, 2);
    return `<details class="w-learning"><summary>${t("deep")}</summary><h3>${t("input")}</h3><p>${esc(window.ProductivityDeck.fieldNames(method).join(" · "))}</p><h3>${t("materials")}</h3><p>${t("materialText")}</p><ol>${method.team.map((step, i) => `<li>${Math.floor((method.t - 5) / method.team.length) + (i < (method.t - 5) % method.team.length ? 1 : 0)} min · ${esc(step)}</li>`).join("")}<li>5 min · ${esc(method.outcome)}</li></ol><h3>${t("compare")}</h3><div class="s-table-scroll"><table class="w-table"><thead><tr><th>${t("alternatives")}</th><th>${t("duration")}</th><th>${t("output")}</th></tr></thead><tbody>${[method, ...others].map((m) => `<tr><td><a href="${link(m)}">${esc(m.n)}</a></td><td>${m.t} min</td><td>${esc(m.outcome)}</td></tr>`).join("")}</tbody></table></div></details>
  <section class="w-exercise"><h3>${t("exercise")}</h3><p>${t("question")}</p><textarea aria-label="${t("notes")}" rows="2" maxlength="2000" data-exercise="${method.id}"></textarea><details><summary>${t("reveal")}</summary><p>${esc(method.case.reasoning)}</p><p>${esc(method.ex)}</p></details></section>
  ${secondary[method.id] ? `<section class="w-secondary"><h3>${t("second")}</h3><p>${esc(secondary[method.id][lang][0])}</p><details><summary>${t("reveal")}</summary><p>${esc(secondary[method.id][lang][1])}</p></details></section>` : ""}`;
  }
  function landing(methods, lang, esc, link) {
    const t = (k) => content[lang][k];
    return `<section class="s-wrap s-section"><h2>${t("kits")}</h2><p>${t("kitCopy")}</p><div class="w-kits">${kits
      .map(
        (kit) =>
          `<article><h3><a href="${"/day-04-productivity-library/" + lang + "/kits/" + kit.id + "/"}">${kit[lang]}</a></h3><ol>${kit.ids
            .map((id) => {
              const method = methods.find((m) => m.id === id);
              return `<li><a href="${link(method)}">${esc(method.n)}</a><p>${esc(method.outcome)}</p></li>`;
            })
            .join("")}</ol></article>`,
      )
      .join("")}</div></section>
  <section class="s-wrap s-section"><h2>${t("glossary")}</h2><dl class="w-glossary">${Object.entries(
    glossary[lang],
  )
    .map(([word, meaning]) => `<div><dt>${word}</dt><dd>${meaning}</dd></div>`)
    .join("")}</dl></section>
  <section class="s-wrap s-section" id="pilot"><h2>${t("pilot")}</h2><p>${t("pilotCopy")}</p><label>${t("notes")}<textarea id="pilot-notes" rows="4" maxlength="5000"></textarea></label><div class="s-btns"><button class="s-btn outline tiny" data-pilot="notes">${t("pilotExport")}</button><button class="s-btn outline tiny" data-pilot="counts">${t("metrics")}</button></div><p>${t("metricHelp")}</p></section>`;
  }
  function kitPage(id, methods, lang, esc, link) {
    const kit = kits.find((item) => item.id === id);
    if (!kit) return "";
    return `<section class="s-wrap s-section"><h1>${kit[lang]}</h1><p>${content[lang].kitCopy}</p><ol class="w-kit-page">${kit.ids
      .map((id) => {
        const method = methods.find((m) => m.id === id);
        return `<li><h2><a href="${link(method)}">${esc(method.n)}</a></h2><p>${esc(method.outcome)}</p><p>${esc(method.pitfall)}</p></li>`;
      })
      .join(
        "",
      )}</ol><a class="s-btn orange" href="/day-04-productivity-library/downloads/kit-${id}-${lang}.zip" download>${lang === "fr" ? "Télécharger le kit" : "Download the kit"} ↓</a></section>`;
  }
  return { content, secondary, kits, glossary, guide, landing, kitPage };
})();
