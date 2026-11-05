window.ProductivitySearch = (() => {
  "use strict";
  const aliases = {
    eisenhower:
      "eisenower eisenhauer urgence importance urgent important priority priorities priorite priorites to do liste tâches taches",
    pareto:
      "80/20 80 20 causes incidents défauts defauts frequency fréquence frequence chart diagramme calculateur calcul",
    "eat-the-frog": "procrastination éviter eviter difficult difficile hardest",
    abcde: "classement tâches taches conséquences consequences",
    "ivy-lee": "six demain tomorrow daily",
    rule135: "1 3 5 journée journee day capacity",
    moscow: "must should could wont périmètre perimetre scope exigences",
    "impact-effort":
      "prioritize prioritise prioritization prioritisation backlog effort impact valeur cost prioritiser prioriser priorité priorite",
    rice: "prioritize prioritise prioritization prioritisation backlog product produit scoring score calculateur prioriser priorisation reach impact confidence effort",
    "kano-grid":
      "client clients satisfaction fonctionnalités fonctionnalites feature",
    gtd: "getting things done inbox boîte boite engagements",
    "two-minute": "2 minutes deux minutes rapide quick",
    "time-blocking":
      "agenda calendar calendrier bloquer blocs planning planifier",
    "personal-kanban": "tâches taches board tableau encours wip",
    kanban: "équipe equipe workflow flux goulot blocage wip",
    "bullet-journal": "bujo journal cahier notes",
    para: "fichiers dossiers rangement projets resources ressources archive",
    smart: "objectif goal mesurable échéance echeance",
    okr: "objective objectifs résultats resultats key results",
    raci: "responsabilités responsabilites responsable rôles roles accountable",
    pomodoro: "25 minutes timer minuteur concentration focus",
    "deep-work": "concentration distraction interruption travail profond",
    shutdown: "fin journée journee arrêt arret clôture cloture",
    "maker-manager": "agenda réunions reunions création creation manager maker",
    ultradian: "fatigue repos rythme énergie energie",
    timeboxing: "temps limite durée duree timebox planning",
    parkinson: "deadline délai delai durée duree travail",
    implementation: "si alors if then déclencheur declencheur",
    "habit-stack": "habit habitude routine coffee café cafe",
    chain: "habitude routine streak chaîne chaine jours",
    "five-whys": "5 why pourquoi cause racine incident problème probleme",
    "six-hats": "6 chapeaux de bono réflexion reflexion discussion",
    premortem: "pré mortem pre mortem risque risques failure échec echec",
    101010: "10 10 10 décision decision horizons",
    regret: "regrets décision decision avenir futur",
    "second-order": "conséquences consequences indirect effets",
    weighted:
      "weighted pondérée ponderee poids notation critères criteres options fournisseur calculateur",
    swot: "ffom forces faiblesses opportunités opportunites menaces strengths weaknesses",
    cynefin: "incertitude complexité complexite compliqué complique chaos",
    daci: "décideur decideur arbitrage approbation rôles roles",
    "weekly-review": "bilan semaine weekly revue engagements",
    "start-stop-continue":
      "rétro retro rétrospective retrospective atelier commencer arrêter arreter continuer compte rendu workshop",
    retro:
      "rétro rétrospective retrospective bilan sprint atelier compte rendu workshop",
    "four-ls":
      "4l 4 l 4ls quatre l liked learned lacked longed for rétrospective retrospective sprint bilan atelier compte rendu workshop",
    "after-action":
      "aar après apres action retour expérience experience compte rendu atelier incident",
    "plus-delta": "plus delta bilan feedback atelier compte rendu",
    pdca: "plan do check act amélioration amelioration cycle qualité qualite",
    "daily-highlight": "priorité priorite jour highlight journée journee",
    "energy-audit": "énergie energie fatigue motivation planning",
    kaizen: "amélioration amelioration continue friction progrès progres",
  };
  const normalize = (s) =>
    String(s ?? "")
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[’']/g, " ");
  function close(a, b) {
    if (Math.abs(a.length - b.length) > 1 || a.length < 5 || b.length < 5)
      return false;
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const row = [i];
      for (let j = 1; j <= b.length; j++)
        row[j] = Math.min(
          row[j - 1] + 1,
          previous[j] + 1,
          previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        );
      previous = row;
    }
    return previous[b.length] <= 1;
  }
  function match(method, query) {
    const q = normalize(query).trim().slice(0, 200),
      terms = q
        .split(/\s+/)
        .filter(
          (term) =>
            term &&
            ![
              "comment",
              "how",
              "to",
              "a",
              "an",
              "the",
              "mon",
              "mes",
              "ma",
              "les",
              "le",
              "la",
              "des",
              "de",
              "du",
              "un",
              "une",
              "pour",
              "for",
              "my",
              "en",
            ].includes(term),
        );
    if (!q || !terms.length) return { score: 1, kind: "all" };
    const names = normalize(
        method.n + " " + (method.fr?.n || "") + " " + method.id,
      ),
      alias = normalize(aliases[method.id] || "");
    const text = normalize(
      [
        method.why,
        method.outcome,
        method.case?.scene,
        method.ex,
        method.fr?.why,
        method.fr?.case?.scene,
      ].join(" "),
    );
    const tokens = (names + " " + alias).split(/\W+/).filter(Boolean);
    if (
      !terms.every(
        (term) =>
          (names + " " + alias + " " + text).includes(term) ||
          tokens.some((token) => close(term, token)),
      )
    )
      return null;
    const score =
      names === q
        ? 100
        : names.includes(q)
          ? 60
          : alias.includes(q)
            ? 40
            : terms.reduce(
                (sum, term) =>
                  sum +
                  (names.includes(term)
                    ? 15
                    : alias.includes(term)
                      ? 8
                      : tokens.some((token) => close(term, token))
                        ? 4
                        : 1),
                0,
              );
    return {
      score,
      kind: names.includes(q) ? "name" : alias.includes(q) ? "need" : "related",
    };
  }
  return { aliases, normalize, match };
})();
