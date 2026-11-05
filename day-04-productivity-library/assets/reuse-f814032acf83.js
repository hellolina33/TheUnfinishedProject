window.ProductivityReuse = (() => {
  "use strict";
  const E = window.ProductivityEngine;
  function matrix(method, work, lang, values = {}) {
    const t = (k) => window.ProductivityWorkspace.words[lang][k] || k;
    if (!work || !E.supported.includes(method.id) || !work.rows.length) {
      const names = window.ProductivityDeck.fieldNames(method);
      if (method.d[0] === "grid") {
        const notes = names.some((_, i) => values[i]);
        return [
          [
            t("title"),
            ...method.d[1].cols,
            ...(notes ? [lang === "fr" ? "Notes de ligne" : "Row notes"] : []),
          ],
          ...names.map((label, i) => [
            label,
            ...method.d[1].cols.map((_, j) => values["c" + i + "-" + j] || ""),
            ...(notes ? [values[i] || ""] : []),
          ]),
        ];
      }
      return [
        [t("title"), t("value")],
        ...names.map((label, i) => [label, values[i] || ""]),
      ];
    }
    const { ranked } = E.calculate(method, work);
    if (method.id === "pareto")
      return [
        [
          t("title"),
          t("value"),
          lang === "fr" ? "Part" : "Share",
          lang === "fr" ? "Cumul" : "Cumulative",
        ],
        ...ranked.map((r) => [r.title, r.count, r.share, r.cumulative]),
      ];
    if (method.id === "rice")
      return [
        [
          t("title"),
          t("reach"),
          t("impact"),
          t("confidence"),
          t("effort"),
          t("score"),
        ],
        ...ranked.map((r) => [
          r.title,
          r.reach,
          r.impact,
          r.confidence,
          r.effort,
          r.score,
        ]),
      ];
    if (method.id === "weighted")
      return [
        [
          t("title"),
          ...work.criterion.map((c, i) => c || method.d[1].rows[i]),
          t("score"),
        ],
        ...ranked.map((r) => [r.title, ...r.scores, r.score]),
      ];
    return [
      [t("title"), t("group"), t("owner"), t("date")],
      ...ranked.map((r) => [
        r.title,
        window.ProductivityDeck.fieldNames(method)[r.group] || "",
        r.owner,
        r.due,
      ]),
    ];
  }
  function markdown(method, work, values, lang) {
    const t = (k) => window.ProductivityWorkspace.words[lang][k] || k;
    const table = matrix(method, work, lang, values);
    const escape = (v) =>
      String(v ?? "")
        .replace(/\|/g, "\\|")
        .replace(/\r?\n/g, " / ");
    return (
      "# " +
      method.n +
      "\n\n" +
      method.outcome +
      "\n\n" +
      table
        .map(
          (row, i) =>
            "| " +
            row.map(escape).join(" | ") +
            " |" +
            (i === 0 ? "\n| " + row.map(() => "---").join(" | ") + " |" : ""),
        )
        .join("\n") +
      (work
        ? "\n\n" +
          ["decision", "owner", "due", "signal"]
            .map(
              (key) =>
                "**" +
                t(key === "due" ? "date" : key) +
                "** " +
                (work[key] || ""),
            )
            .join("\n\n")
        : "") +
      "\n"
    );
  }
  function ics(work) {
    const esc = (v) =>
      String(v)
        .replace(/\\/g, "\\\\")
        .replace(/\r?\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
    const rows = [
      ...(work?.rows || []),
      { title: work?.decision, due: work?.due },
    ].filter((r) => r.title && /^\d{4}-\d{2}-\d{2}$/.test(r.due));
    const today = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d+/, "");
    const fold = (line) => {
      const chunks = [];
      let current = "";
      for (const ch of line) {
        if (new TextEncoder().encode(current + ch).length > 70) {
          chunks.push(current);
          current = " " + ch;
        } else current += ch;
      }
      chunks.push(current);
      return chunks.join("\r\n");
    };
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Productivity Studio//EN",
      ...rows.flatMap((r, i) => [
        "BEGIN:VEVENT",
        "UID:" + crypto.randomUUID() + "@productivity-studio",
        "DTSTAMP:" + today,
        ...(r.start
          ? [
              "DTSTART:" +
                r.due.replace(/-/g, "") +
                "T" +
                r.start.replace(":", "") +
                "00",
              ...(r.end && r.end > r.start
                ? [
                    "DTEND:" +
                      r.due.replace(/-/g, "") +
                      "T" +
                      r.end.replace(":", "") +
                      "00",
                  ]
                : []),
            ]
          : ["DTSTART;VALUE=DATE:" + r.due.replace(/-/g, "")]),
        "SUMMARY:" + esc(r.title),
        "DESCRIPTION:" + esc(r.owner || ""),
        "END:VEVENT",
      ]),
      "END:VCALENDAR",
    ]
      .map(fold)
      .join("\r\n");
  }
  function onePage(method, work, values, t, lang, memo = false) {
    const D = window.ProductivityDeck,
      width = 8.27,
      height = 11.69,
      items = [];
    const text = (content, x, y, w, h, size, bold = false) => ({
      type: "text",
      content,
      x,
      y,
      w,
      h,
      size,
      bold,
      color: "161713",
    });
    items.push(
      { type: "box", x: 0, y: 0, w: width, h: height, fill: "FFFDF9" },
      text(method.n, 0.55, 0.45, 7.17, 1.0, 30, true),
    );
    if (memo) {
      items.push(
        text(method.why, 0.55, 1.55, 7.17, 0.8, 18, true),
        text(
          method.solo.map((s, i) => i + 1 + ". " + s).join("\n"),
          0.55,
          2.55,
          7.17,
          2.7,
          16,
        ),
        text(method.pitfall, 0.55, 5.5, 7.17, 1.2, 15, true),
        ...D.framework(
          method,
          method.sampleCells || method.sample,
          [0.55, 7, 7.17, 3.4],
          t,
        ),
      );
    } else {
      const projected =
        work &&
        E.supported.includes(method.id) &&
        work.rows.some((row) => row.title)
          ? E.project(method, work)
          : { method, values };
      items.push(
        text(work?.decision || method.outcome, 0.55, 1.55, 7.17, 1.2, 19, true),
        ...D.framework(
          projected.method,
          projected.values,
          [0.55, 3, 7.17, 5.8],
          t,
          !work,
        ),
        text(
          work
            ? [work.owner, work.due, work.signal].filter(Boolean).join("\n")
            : "",
          0.55,
          9.1,
          7.17,
          1.5,
          14,
        ),
      );
    }
    items.push(
      text(
        "Productivity Studio · " + (memo ? method.src : method.n),
        0.55,
        11,
        7.17,
        0.3,
        9,
      ),
    );
    return { items, width, height };
  }
  return { matrix, markdown, ics, onePage };
})();
