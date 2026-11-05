/* Session-only editors. Dynamic values remain text or validated numbers. */
window.ProductivityWorkspace = (() => {
  "use strict";
  const E = window.ProductivityEngine;
  const words = {
    en: {
      title: "Item",
      owner: "Owner",
      date: "Review date",
      add: "Add an item",
      remove: "Remove",
      example: "Try the worked example",
      blank: "Start with an empty worksheet",
      paretoScale: "Measured value",
      paretoCumulative: "Cumulative share",
      paretoThreshold: "80% reference",
      answer: "Answer",
      timeScale: "Relative duration",
      totalLabel: "Total",
      start: "Start time",
      end: "End time",
      value: "Value",
      reach: "Reach",
      impact: "Impact",
      confidence: "Confidence (%)",
      effort: "Effort",
      score: "Score",
      result: "Your result",
      decision: "Decision / next action",
      signal: "Evidence to check",
      source: "Measurement source",
      baseline: "Starting value",
      target: "Target value",
      period: "Measurement period",
      unit: "Unit",
      calculate: "Review my result",
      empty: "Add a named item to get started.",
      rows: "Add at least one named item.",
      nonnegative: "Use a number of zero or greater for each value.",
      total: "The total must be greater than zero.",
      rice: "Enter reach and impact of zero or greater, confidence from 0 to 100, and effort greater than zero.",
      weights: "Weights must be zero or greater and add up to 100%.",
      scores: "Use scores from 1 to 5 for every criterion.",
      weight: "Weight (%)",
      criterion: "Criterion",
      sensitivity: "What would change the winner?",
      sensitivityHelp:
        "RICE varies the leading option’s confidence by ±10% and ±20%. Weighted scoring shifts the first criterion by ±10 or ±20 percentage points and rescales the rest.",
      change: "Change",
      winner: "Leading option",
      group: "Column",
      theme: "Theme",
      selected: "Select for the action plan",
      table: "Results table",
      complete: "Before you share",
      next: "Write a decision, name an owner and choose a review date.",
      csv: "Import a table",
      csvHint:
        "Paste CSV, semicolon-separated values or a table copied from a spreadsheet. First row must contain headers. Review the columns before applying.",
      preview: "Preview columns",
      apply: "Replace table with these rows",
      notes: "Reading notes",
      export: "Use this result",
      markdown: "Copy summary",
      csvOut: "Download CSV",
      calendar: "Download calendar",
      onePdf: "Result PDF",
      onePpt: "Result PowerPoint",
      memo: "Method memo",
      reading: "Readable slide view",
      worksheet: "Your worksheet",
      transfer: "Open selected actions in Eisenhower",
      transferHelp:
        "Your existing Eisenhower tasks will be kept. The selected actions will be added.",
      task: "Task",
      tooMany: "Use at most 100 rows.",
      saved: "Changes stay in this tab. Download a backup before leaving.",
      copyFail: "Copy failed. Download the text instead.",
      text: "Download summary",
      mapping:
        "Map the columns to the fields. Leave a field unmapped to keep it empty.",
      skip: "Not used",
      missing: "Choose a title column.",
      units: "Use the same period and effort unit for every option.",
      scenario: "Worked example",
      column: "Column",
      chartLimit:
        "The slide chart shows up to eight groups. Additional Pareto causes are grouped into the last bar. Tables and CSV keep all rows.",
    },
    fr: {
      title: "Élément",
      owner: "Responsable",
      date: "Date de revue",
      add: "Ajouter un élément",
      remove: "Retirer",
      example: "Essayer le cas pratique",
      blank: "Commencer un canevas vierge",
      paretoScale: "Measured value",
      paretoCumulative: "Cumulative share",
      paretoThreshold: "80% reference",
      answer: "Answer",
      timeScale: "Relative duration",
      paretoScale: "Valeur mesurée",
      paretoCumulative: "Part cumulée",
      paretoThreshold: "Repère à 80 %",
      answer: "Réponse",
      timeScale: "Durée relative",
      totalLabel: "Total",
      start: "Début",
      end: "Fin",
      value: "Valeur",
      reach: "Portée",
      impact: "Impact",
      confidence: "Confiance (%)",
      effort: "Effort",
      score: "Score",
      result: "Ton résultat",
      decision: "Décision / prochaine action",
      signal: "Signe de réussite à vérifier",
      source: "Source de mesure",
      baseline: "Valeur de départ",
      target: "Valeur cible",
      period: "Période de mesure",
      unit: "Unité",
      calculate: "Vérifier mon résultat",
      empty: "Ajoute un élément nommé pour commencer.",
      rows: "Ajoute au moins un élément nommé.",
      nonnegative:
        "Utilise un nombre supérieur ou égal à zéro pour chaque valeur.",
      total: "Le total doit être supérieur à zéro.",
      rice: "Saisis une portée et un impact positifs ou nuls, une confiance entre 0 et 100 et un effort supérieur à zéro.",
      weights:
        "Les poids doivent être positifs ou nuls et leur somme doit atteindre 100 %.",
      scores: "Utilise des notes de 1 à 5 pour chaque critère.",
      weight: "Poids (%)",
      criterion: "Critère",
      sensitivity: "Qu’est-ce qui changerait le choix ?",
      sensitivityHelp:
        "RICE fait varier la confiance de la première option de ±10 % et ±20 %. La matrice pondérée déplace le premier poids de ±10 ou ±20 points et rééquilibre les autres.",
      change: "Variation",
      winner: "Première option",
      group: "Colonne",
      theme: "Thème",
      selected: "Retenir pour le plan d’action",
      table: "Tableau des résultats",
      complete: "Avant de partager",
      next: "Écris une décision, nomme un responsable et choisis une date de revue.",
      csv: "Importer un tableau",
      csvHint:
        "Colle un CSV, des valeurs séparées par des points-virgules ou un tableau copié depuis un tableur. La première ligne doit contenir les en-têtes. Vérifie les colonnes avant de continuer.",
      preview: "Vérifier les colonnes",
      apply: "Remplacer le tableau par ces lignes",
      notes: "Notes de lecture",
      export: "Réutiliser ce résultat",
      markdown: "Copier le résumé",
      csvOut: "Télécharger le CSV",
      calendar: "Télécharger le calendrier",
      onePdf: "PDF du résultat",
      onePpt: "PowerPoint du résultat",
      memo: "Fiche mémo",
      reading: "Lecture accessible des diapositives",
      worksheet: "Ton canevas",
      transfer: "Ouvrir les actions retenues dans Eisenhower",
      transferHelp:
        "Tes tâches Eisenhower existantes seront conservées. Les actions sélectionnées seront ajoutées.",
      task: "Tâche",
      tooMany: "Utilise au maximum 100 lignes.",
      saved:
        "Les changements restent dans cet onglet. Télécharge une copie avant de partir.",
      copyFail: "La copie a échoué. Télécharge le texte.",
      text: "Télécharger le résumé",
      mapping:
        "Associe les colonnes aux champs. Un champ non associé restera vide.",
      skip: "Ignorer",
      missing: "Choisis une colonne de titre.",
      units:
        "Utilise la même période et la même unité d’effort pour toutes les options.",
      scenario: "Cas pratique",
      column: "Colonne",
      chartLimit:
        "Le graphique de présentation affiche au plus huit groupes. Les causes Pareto supplémentaires sont regroupées dans la dernière barre. Le tableau et le CSV gardent toutes les lignes.",
    },
  };
  const fmt = (v, lang) =>
    v === null
      ? "—"
      : new Intl.NumberFormat(lang, { maximumFractionDigits: 2 }).format(v);
  function fields(method) {
    if (method.id === "pareto") return ["title", "value"];
    if (method.id === "rice")
      return ["title", "reach", "impact", "confidence", "effort"];
    if (method.id === "weighted")
      return ["title", "score0", "score1", "score2"];
    if (["time-blocking", "timeboxing"].includes(method.id))
      return ["title", "owner", "due", "start", "end"];
    return ["title", "group", "owner", "due"];
  }
  function labels(method) {
    return window.ProductivityDeck.fieldNames(method);
  }
  function result(method, work, lang, esc) {
    const t = (k) => words[lang][k] || k,
      { ranked, errors, detail } = E.calculate(method, work);
    if (!ranked.length) return "<p>" + t("empty") + "</p>";
    const headers =
      method.id === "pareto"
        ? [t("title"), t("value"), "%", "∑ %"]
        : ["rice", "weighted"].includes(method.id)
          ? [t("title"), t("score")]
          : [t("title"), t("group"), t("owner"), t("date")];
    const cell = (row) =>
      method.id === "pareto"
        ? [
            row.title,
            fmt(row.count, lang),
            fmt(row.share * 100, lang),
            fmt(row.cumulative * 100, lang),
          ]
        : ["rice", "weighted"].includes(method.id)
          ? [row.title, fmt(row.score, lang)]
          : [row.title, labels(method)[row.group] || "", row.owner, row.due];
    let html =
      '<div class="s-table-scroll"><table class="w-table"><thead><tr>' +
      headers.map((h) => '<th scope="col">' + esc(h) + "</th>").join("") +
      "</tr></thead><tbody>" +
      ranked
        .map(
          (row) =>
            "<tr>" +
            cell(row)
              .map((v) => "<td>" + esc(v) + "</td>")
              .join("") +
            "</tr>",
        )
        .join("") +
      "</tbody></table></div>";
    if (method.id === "four-ls")
      html +=
        "<p>" +
        ranked
          .filter((r) => r.selected)
          .map((r) => esc((r.theme ? r.theme + " · " : "") + r.title))
          .join(" / ") +
        "</p>";
    if (method.id === "pareto")
      html +=
        "<p>" + t("totalLabel") + " · " + fmt(detail.total, lang) + "</p>";
    if (ranked.length > 8) html += "<p>" + t("chartLimit") + "</p>";
    if (errors.length)
      html +=
        '<div role="status" class="w-validation">' +
        errors.map((key) => "<p>" + t(key) + "</p>").join("") +
        "</div>";
    if (!errors.length && ["rice", "weighted"].includes(method.id))
      html +=
        "<details><summary>" +
        t("sensitivity") +
        "</summary><p>" +
        t("sensitivityHelp") +
        '</p><table class="w-table"><thead><tr><th>' +
        t("change") +
        "</th><th>" +
        t("winner") +
        "</th><th>" +
        t("score") +
        "</th></tr></thead><tbody>" +
        E.sensitivity(method, work)
          .map(
            (row) =>
              "<tr><td>" +
              row.change +
              "%</td><td>" +
              esc(row.title) +
              "</td><td>" +
              fmt(row.score, lang) +
              "</td></tr>",
          )
          .join("") +
        "</tbody></table></details>";
    if (
      !errors.length &&
      ["eisenhower", "pareto", "four-ls"].includes(method.id)
    ) {
      const project = E.project(method, work),
        D = window.ProductivityDeck;
      html =
        D.svg(
          D.framework(
            project.method,
            project.values,
            [0.15, 0.15, 8.7, 5.2],
            t,
          ),
          9,
          5.5,
          esc,
          method.n,
        ) +
        " " +
        html;
    }
    const missing = ["decision", "owner", "due"].filter(
      (key) => !work[key]?.trim(),
    );
    if (missing.length)
      html +=
        '<p class="w-completeness">' +
        t("complete") +
        " · " +
        missing.map((key) => t(key === "due" ? "date" : key)).join(" · ") +
        "</p>";
    return html;
  }
  function plan(method, work, lang, esc) {
    const t = (k) => words[lang][k] || k;
    const keys = [
      "decision",
      "owner",
      "due",
      "signal",
      ...(["smart", "okr"].includes(method.id)
        ? ["baseline", "target", "source"]
        : []),
    ];
    return (
      '<fieldset class="w-plan"><legend>' +
      t("complete") +
      "</legend><p>" +
      t("next") +
      "</p>" +
      keys
        .map(
          (key) =>
            "<label>" +
            t(key === "due" ? "date" : key) +
            '<input data-work="' +
            key +
            '" ' +
            (key === "due" ? 'type="date"' : 'maxlength="2000"') +
            ' value="' +
            esc(work[key]) +
            '"></label>',
        )
        .join("") +
      "</fieldset>"
    );
  }
  function render(method, work, lang, esc) {
    const t = (k) => words[lang][k] || k,
      groups = labels(method),
      fieldsList = fields(method);
    const input = (key, value, attrs = "") =>
      "<input " +
      attrs +
      ' data-work="' +
      key +
      '" value="' +
      esc(value) +
      '">';
    const title = (key) =>
      key === "due"
        ? t("date")
        : key.startsWith("score")
          ? work.criterion[+key.at(-1)] || groups[+key.at(-1)]
          : t(key);
    const grid = work.rows
      .map(
        (row, i) =>
          '<fieldset class="w-row"><legend>' +
          t("title") +
          " " +
          (i + 1) +
          "</legend>" +
          fieldsList
            .map(
              (key) =>
                "<label>" +
                esc(title(key)) +
                (key === "group"
                  ? '<select data-work="rows.' +
                    i +
                    '.group">' +
                    groups
                      .map(
                        (g, j) =>
                          '<option value="' +
                          j +
                          '" ' +
                          (row.group === j ? "selected" : "") +
                          ">" +
                          esc(g) +
                          "</option>",
                      )
                      .join("") +
                    "</select>"
                  : input(
                      "rows." +
                        i +
                        "." +
                        (key.startsWith("score")
                          ? "scores." + key.at(-1)
                          : key),
                      key.startsWith("score")
                        ? row.scores[+key.at(-1)]
                        : row[key],
                      key === "due"
                        ? 'type="date"'
                        : ["start", "end"].includes(key)
                          ? 'type="time"'
                          : key === "title" || key === "owner"
                            ? 'maxlength="2000"'
                            : 'inputmode="decimal"',
                    )) +
                "</label>",
            )
            .join("") +
          (method.id === "four-ls"
            ? "<label>" +
              t("theme") +
              input("rows." + i + ".theme", row.theme, 'maxlength="2000"') +
              "</label>"
            : "") +
          '<label class="w-select"><input type="checkbox" data-work="rows.' +
          i +
          '.selected" ' +
          (row.selected ? "checked" : "") +
          ">" +
          t("selected") +
          '</label><button class="s-btn outline tiny" data-work-act="remove" data-index="' +
          i +
          '">' +
          t("remove") +
          " " +
          (i + 1) +
          "</button></fieldset>",
      )
      .join("");
    const quantitative = ["rice", "pareto", "weighted"].includes(method.id);
    return (
      '<section class="w-editor"><div class="s-viewtoolbar"><h3>' +
      t("worksheet") +
      '</h3><div><button class="s-btn outline tiny" data-work-act="sample">' +
      t("example") +
      '</button><button class="s-btn outline tiny" data-work-act="blank">' +
      t("blank") +
      "</button></div></div>" +
      (quantitative
        ? '<div class="w-measures"><label>' +
          t("period") +
          input("period", work.period, 'maxlength="200"') +
          "</label><label>" +
          t("unit") +
          input("unit", work.unit, 'maxlength="200"') +
          "</label></div><p>" +
          t("units") +
          "</p>"
        : "") +
      (method.id === "weighted"
        ? '<div class="w-weights">' +
          work.weights
            .map(
              (v, i) =>
                "<label>" +
                t("criterion") +
                " " +
                (i + 1) +
                input(
                  "criterion." + i,
                  work.criterion[i] || groups[i],
                  'maxlength="200"',
                ) +
                t("weight") +
                input("weights." + i, v, 'inputmode="decimal"') +
                "</label>",
            )
            .join("") +
          "</div>"
        : "") +
      '<div class="w-rows">' +
      grid +
      '</div><button class="s-btn outline tiny" data-work-act="add" ' +
      (work.rows.length >= 100 ? "disabled" : "") +
      ">" +
      t("add") +
      '</button><button class="s-btn orange tiny" data-work-act="update">' +
      t("calculate") +
      "</button>" +
      (quantitative
        ? '<details class="w-csv"><summary>' +
          t("csv") +
          "</summary><p>" +
          t("csvHint") +
          '</p><textarea id="work-csv" maxlength="262144" rows="4"></textarea><button class="s-btn outline tiny" data-work-act="csv-preview">' +
          t("preview") +
          '</button><div id="work-csv-preview"></div></details>'
        : "") +
      '<section class="w-result" tabindex="-1"><h3>' +
      t("result") +
      '</h3><div id="work-results">' +
      result(method, work, lang, esc) +
      "</div></section>" +
      plan(method, work, lang, esc) +
      '<p role="status" id="work-status">' +
      t("saved") +
      "</p></section>"
    );
  }
  return { words, fields, render, result, fmt, plan };
})();
