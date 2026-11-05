/* Pure worksheet operations shared by the UI, exports and tests. */
(function (root) {
  "use strict";
  const supported = [
    "eisenhower",
    "pareto",
    "rice",
    "weighted",
    "four-ls",
    "smart",
    "okr",
    "time-blocking",
    "timeboxing",
  ];
  const clean = (v) => (typeof v === "string" ? v.slice(0, 2000) : "");
  const number = (v) => {
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    const input = String(v ?? "")
      .trim()
      .replace(/[\u00a0\u202f ]/g, "")
      .replace(",", ".");
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(input) &&
      Number.isFinite(Number(input))
      ? Number(input)
      : null;
  };
  function validDate(value) {
    return (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(value)) &&
      new Date(value).toISOString().slice(0, 10) === value
    );
  }
  function validate(value) {
    const rows = Array.isArray(value?.rows)
      ? value.rows.slice(0, 100).map((row) => ({
          title: clean(row?.title),
          group: Math.min(
            3,
            Math.max(0, Number.isInteger(row?.group) ? row.group : 0),
          ),
          owner: clean(row?.owner),
          due: validDate(row?.due) ? row.due : "",
          start: /^([01]\d|2[0-3]):[0-5]\d$/.test(row?.start || "")
            ? row.start
            : "",
          end: /^([01]\d|2[0-3]):[0-5]\d$/.test(row?.end || "") ? row.end : "",
          theme: clean(row?.theme),
          selected: row?.selected === true,
          value: clean(String(row?.value ?? "")),
          reach: clean(String(row?.reach ?? "")),
          impact: clean(String(row?.impact ?? "")),
          confidence: clean(String(row?.confidence ?? "")),
          effort: clean(String(row?.effort ?? "")),
          scores: Array.from({ length: 3 }, (_, i) =>
            clean(String(row?.scores?.[i] ?? "")),
          ),
        }))
      : [];
    return {
      rows,
      weights: Array.from({ length: 3 }, (_, i) =>
        clean(String(value?.weights?.[i] ?? [40, 35, 25][i])),
      ),
      criterion: Array.from({ length: 3 }, (_, i) =>
        clean(value?.criterion?.[i]),
      ),
      decision: clean(value?.decision),
      owner: clean(value?.owner),
      due: validDate(value?.due) ? value.due : "",
      signal: clean(value?.signal),
      baseline: clean(value?.baseline),
      target: clean(value?.target),
      source: clean(value?.source),
      period: clean(value?.period),
      unit: clean(value?.unit),
    };
  }
  const empty = () => validate({});
  function hasContent(work) {
    return Boolean(
      work &&
        (work.rows.some(
          (row) =>
            Object.values(row).some((v) => typeof v === "string" && v.trim()) ||
            row.scores.some((v) => v.trim()) ||
            row.selected,
        ) ||
          [
            "decision",
            "owner",
            "due",
            "signal",
            "baseline",
            "target",
            "source",
            "period",
            "unit",
          ].some((key) => work[key]?.trim()) ||
          work.criterion.some((v) => v.trim()) ||
          work.weights.some((v, i) => v !== ["40", "35", "25"][i])),
    );
  }
  function merge(current, incoming) {
    if (current.rows.length + incoming.rows.length > 100) throw Error("rows");
    const merged = validate(current);
    merged.rows = [...current.rows, ...incoming.rows];
    for (const key of [
      "decision",
      "owner",
      "due",
      "signal",
      "baseline",
      "target",
      "source",
      "period",
      "unit",
    ])
      if (!merged[key].trim()) merged[key] = incoming[key];
    if (!current.rows.length) {
      merged.weights = incoming.weights;
      merged.criterion = incoming.criterion;
    }
    return merged;
  }
  function sample(method) {
    const w = empty(),
      rows = method.sample;
    if (method.id === "rice") {
      w.period = method.uiLang === "fr" ? "Trimestre" : "Quarter";
      w.unit = method.uiLang === "fr" ? "Personnes-mois" : "Person-months";
    }
    if (method.id === "pareto") {
      w.period = method.uiLang === "fr" ? "Avril" : "April";
      w.unit = method.uiLang === "fr" ? "Incidents" : "Incidents";
    }
    if (["eisenhower", "four-ls"].includes(method.id))
      w.rows = rows.map((title, group) => ({ ...emptyRow(), title, group }));
    if (method.id === "pareto")
      w.rows = method.d[1].map(([title, a, b]) => ({
        ...emptyRow(),
        title,
        value: String(Math.round((b - a) * 100)),
      }));
    if (method.id === "rice")
      w.rows = method.d[1].rows.map((title, i) => ({
        ...emptyRow(),
        title,
        ...Object.fromEntries(
          ["reach", "impact", "confidence", "effort"].map((key, j) => [
            key,
            (method.sampleCells?.["c" + i + "-" + j] || "").replace(/\s*%/, ""),
          ]),
        ),
      }));
    if (method.id === "weighted") {
      w.criterion = method.d[1].rows;
      w.rows = ["A", "B", "C"].map((title, j) => ({
        ...emptyRow(),
        title,
        scores: [0, 1, 2].map(
          (i) => method.sampleCells["c" + i + "-" + (j + 1)],
        ),
      }));
    }
    if (["smart", "okr"].includes(method.id)) {
      w.decision = method.case.scene;
      w.signal = method.case.check;
      w.baseline = "48";
      w.target = "24";
    }
    if (["time-blocking", "timeboxing"].includes(method.id))
      w.rows = rows.map((title) => ({ ...emptyRow(), title }));
    w.decision = method.ex;
    w.signal = method.case.check;
    return w;
  }
  function emptyRow() {
    return validate({ rows: [{}] }).rows[0];
  }
  function calculate(method, work) {
    const rows = work.rows
      .map((row, index) => ({ ...row, index }))
      .filter((r) => r.title.trim());
    const errors = [];
    let ranked = rows.map((row) => ({ ...row })),
      detail = {};
    if (method.id === "pareto") {
      ranked = ranked.map((row) => ({ ...row, count: number(row.value) }));
      if (!ranked.length) errors.push("rows");
      if (ranked.some((r) => r.count === null || r.count < 0))
        errors.push("nonnegative");
      const total = ranked.reduce((sum, r) => sum + (r.count || 0), 0);
      detail.total = total;
      if (ranked.length && total === 0) errors.push("total");
      let cumulative = 0;
      ranked
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .forEach((row) => {
          cumulative += row.count || 0;
          row.share = total ? (row.count || 0) / total : 0;
          row.cumulative = total ? cumulative / total : 0;
        });
    }
    if (method.id === "rice") {
      ranked = ranked
        .map((row) => {
          const reach = number(row.reach),
            impact = number(row.impact),
            confidence = number(row.confidence),
            effort = number(row.effort);
          const valid =
            reach !== null &&
            reach >= 0 &&
            impact !== null &&
            impact >= 0 &&
            confidence !== null &&
            confidence >= 0 &&
            confidence <= 100 &&
            effort !== null &&
            effort > 0;
          return {
            ...row,
            score: valid ? (reach * impact * confidence) / 100 / effort : null,
          };
        })
        .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
      if (!ranked.length) errors.push("rows");
      if (ranked.some((r) => r.score === null)) errors.push("rice");
    }
    if (method.id === "weighted") {
      const weights = work.weights.map(number);
      const total = weights.reduce((sum, w) => sum + (w || 0), 0);
      if (
        weights.some((w) => w === null || w < 0) ||
        Math.abs(total - 100) > 0.001
      )
        errors.push("weights");
      ranked = ranked
        .map((row) => {
          const scores = row.scores.map(number);
          return {
            ...row,
            score:
              scores.every((n) => n !== null && n >= 1 && n <= 5) &&
              !errors.length
                ? scores.reduce((sum, n, i) => sum + (n * weights[i]) / 100, 0)
                : null,
          };
        })
        .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
      if (!ranked.length) errors.push("rows");
      if (ranked.some((r) => r.score === null)) errors.push("scores");
      detail.weights = weights;
    }
    return { ranked, errors: [...new Set(errors)], detail };
  }
  function project(method, work) {
    const { ranked, errors, detail } = calculate(method, work),
      copy = { ...method, source: method },
      values = {};
    if (!ranked.length || errors.length) return { method: copy, values };
    if (method.id === "pareto") {
      const shown =
        ranked.length > 8
          ? [
              ...ranked.slice(0, 7),
              {
                title:
                  method.uiLang === "fr" ? "Autres causes" : "Other causes",
                share: ranked.slice(7).reduce((sum, r) => sum + r.share, 0),
                count: ranked.slice(7).reduce((sum, r) => sum + r.count, 0),
              },
            ]
          : ranked;
      copy.d = ["bars", shown.map((row) => [row.title, 0, row.share])];
      copy.counts = shown.map((row) => row.count);
      copy.total = detail.total;
      copy.unit = work.unit;
      shown.forEach((r, i) => (values[i] = String(r.count)));
    } else if (["rice", "weighted"].includes(method.id)) {
      copy.d = [
        "grid",
        {
          rows: ranked.slice(0, 8).map((row) => row.title),
          cols: [
            ...(method.id === "rice"
              ? method.d[1].cols
              : work.criterion.map(
                  (c, i) =>
                    (c || method.d[1].rows[i]) + " · " + work.weights[i] + "%",
                )),
            method.uiLang === "fr" ? "Score" : "Score",
          ],
        },
      ];
      ranked
        .slice(0, 8)
        .forEach((r, i) =>
          [
            ...(method.id === "rice"
              ? [r.reach, r.impact, r.confidence + " %", r.effort]
              : r.scores),
            String(Math.round(r.score * 100) / 100),
          ].forEach((v, j) => (values["c" + i + "-" + j] = v)),
        );
    } else if (["eisenhower", "four-ls"].includes(method.id)) {
      for (let group = 0; group < 4; group++)
        values[group] = ranked
          .filter((r) => r.group === group)
          .map(
            (r) =>
              r.title +
              (r.owner ? " · " + r.owner : "") +
              (r.due ? " · " + r.due : ""),
          )
          .join("\n");
    } else ranked.forEach((r, i) => (values[i] = r.title));
    copy.resultSummary = work.decision || "";
    copy.resultRows = ranked.length;
    return { method: copy, values };
  }
  function sensitivity(method, work) {
    if (!["rice", "weighted"].includes(method.id)) return [];
    const base = calculate(method, work);
    if (base.errors.length) return [];
    return [-20, -10, 0, 10, 20].map((change) => {
      const alt = validate(work);
      if (method.id === "rice")
        alt.rows = alt.rows.map((r, i) =>
          i === base.ranked[0].index
            ? {
                ...r,
                confidence: String(
                  Math.min(
                    100,
                    Math.max(0, number(r.confidence) * (1 + change / 100)),
                  ),
                ),
              }
            : r,
        );
      else {
        const next = Math.min(
            100,
            Math.max(0, number(alt.weights[0]) + change),
          ),
          rest = number(alt.weights[1]) + number(alt.weights[2]);
        alt.weights = rest
          ? [
              String(next),
              String(((100 - next) * number(alt.weights[1])) / rest),
              String(((100 - next) * number(alt.weights[2])) / rest),
            ]
          : ["100", "0", "0"];
      }
      const result = calculate(method, alt);
      return {
        change,
        title: result.ranked[0]?.title,
        score: result.ranked[0]?.score,
      };
    });
  }
  function parseDelimited(input) {
    if (input.length > 256 * 1024) throw Error("size");
    const delimiter = input.split(/\r?\n/)[0].includes("\t")
      ? "\t"
      : input.split(/\r?\n/)[0].includes(";")
        ? ";"
        : ",";
    const rows = [];
    let row = [],
      field = "",
      quoted = false;
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (ch === '"') {
        if (quoted && input[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = !quoted;
      } else if (ch === delimiter && !quoted) {
        row.push(field);
        field = "";
      } else if ((ch === "\n" || ch === "\r") && !quoted) {
        if (ch === "\r" && input[i + 1] === "\n") i++;
        row.push(field);
        if (row.some((v) => v.trim())) rows.push(row);
        row = [];
        field = "";
      } else field += ch;
      if (rows.length > 101) throw Error("rows");
    }
    if (quoted) throw Error("quotes");
    row.push(field);
    if (row.some((v) => v.trim())) rows.push(row);
    if (rows.length > 101) throw Error("rows");
    return rows;
  }
  const csvCell = (value) =>
    '"' +
    String(value ?? "")
      .replace(/^[\s]*[=+@-]/, "'$&")
      .replace(/"/g, '""') +
    '"';
  const csv = (rows) =>
    "\ufeff" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  root.ProductivityEngine = {
    supported,
    number,
    clean,
    validate,
    empty,
    hasContent,
    emptyRow,
    sample,
    merge,
    calculate,
    project,
    sensitivity,
    parseDelimited,
    csv,
  };
})(typeof window !== "undefined" ? window : globalThis);
