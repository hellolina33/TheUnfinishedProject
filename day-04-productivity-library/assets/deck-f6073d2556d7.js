/* Original Day 04 layouts. The same drawing instructions drive all three renderers. */
window.ProductivityDeck = (() => {
  "use strict";
  const ink = "161713",
    paper = "FFFDF9",
    orange = "FF5A32",
    muted = "51534D",
    rule = "D6D6CE",
    tint = "F0EDE4";
  const sizes = { "16:9": [12.8, 7.2], "9:10": [8.1, 9], "9:16": [7.2, 12.8] };
  const spec = (ratio) => sizes[ratio] || sizes["16:9"];
  const list = (count, fn) => Array.from({ length: count }, (_, i) => fn(i));
  const fieldNames = (method) => {
    const [kind, data] = method.d;
    if (kind === "matrix") return data.q;
    if (kind === "grid") return data.rows;
    if (kind === "tree") return data.kids;
    if (kind === "bars") return data.map((row) => row[0]);
    return data;
  };
  const text = (content, x, y, w, h, size, bold = false, color = ink) => ({
    type: "text",
    content: String(content ?? ""),
    x,
    y,
    w,
    h,
    size,
    bold,
    color,
  });
  const box = (x, y, w, h, fill, stroke) => ({
    type: "box",
    x,
    y,
    w,
    h,
    fill,
    stroke,
  });
  const line = (x, y, x2, y2, color = rule) => ({
    type: "line",
    x,
    y,
    x2,
    y2,
    color,
  });
  const editable = (label, x, y, w, h) => ({
    ...text(label, x, y, w, h, 11, false, muted),
    type: "placeholder",
  });
  const aligned = (
    content,
    x,
    y,
    w,
    h,
    size,
    bold = false,
    color = ink,
    align = "left",
    vertical = false,
  ) => ({ ...text(content, x, y, w, h, size, bold, color), align, vertical });
  const arrow = (x, y, x2, y2) => [
    line(x, y, x2, y2, muted),
    ...(x === x2
      ? [
          line(x2 - 0.045, y2 + 0.07, x2, y2, muted),
          line(x2 + 0.045, y2 + 0.07, x2, y2, muted),
        ]
      : [
          line(x2 - 0.07, y2 - 0.045, x2, y2, muted),
          line(x2 - 0.07, y2 + 0.045, x2, y2, muted),
        ]),
  ];
  const number = (n) => String(n + 1).padStart(2, "0");

  // A compact sketch of the method's structure, usable at thumbnail and cover sizes.
  function motif(method, [x, y, w, h], dark = false) {
    const [shape, data] = method.d,
      n = fieldNames(method).length;
    const kind = method.id === "second-order" ? "flow" : shape;
    const base = dark ? "31332E" : tint,
      edge = dark ? "8C8E86" : muted;
    const tile = (a, b, c, d, fill = base, stroke) =>
      box(x + a * w, y + b * h, c * w, d * h, fill, stroke);
    const segment = (a, b, c, d, color = edge) =>
      line(x + a * w, y + b * h, x + c * w, y + d * h, color);
    if (kind === "matrix") {
      return list(4, (i) =>
        tile(
          0.12 + (i % 2) * 0.4,
          0.12 + Math.floor(i / 2) * 0.39,
          0.37,
          0.35,
          i === 1 ? orange : base,
          edge,
        ),
      );
    }
    if (kind === "grid") {
      const cols = data.cols.length,
        rows = data.rows.length;
      return list(rows + 1, (i) =>
        list(cols + 1, (j) =>
          tile(
            0.08 + (j * 0.84) / (cols + 1),
            0.11 + (i * 0.78) / (rows + 1),
            0.84 / (cols + 1),
            0.78 / (rows + 1),
            i === 0 || j === 0 ? base : i === 1 && j === 1 ? orange : undefined,
            edge,
          ),
        ),
      ).flat();
    }
    if (kind === "bars") {
      const step = 0.82 / n;
      if (method.id === "pareto") {
        let cumulative = 0,
          last;
        const bars = [],
          trend = [];
        data.forEach(([, start, end], i) => {
          const x = 0.09 + step * (i + 0.5),
            height = (end - start) * 1.13;
          bars.push(
            tile(
              x - step * 0.28,
              0.87 - height,
              step * 0.56,
              height,
              i < 2 ? orange : base,
              edge,
            ),
          );
          cumulative += end - start;
          const next = [x, 0.87 - cumulative * 0.72];
          if (last) trend.push(segment(...last, ...next));
          trend.push(
            tile(next[0] - 0.013, next[1] - 0.022, 0.026, 0.044, edge),
          );
          last = next;
        });
        return [segment(0.08, 0.87, 0.92, 0.87), ...bars, ...trend];
      }
      return data.flatMap(([, start, end], i) => [
        tile(0.08, 0.14 + (i * 0.76) / n, 0.84, 0.44 / n),
        tile(
          0.08 + 0.84 * start,
          0.14 + (i * 0.76) / n,
          0.84 * (end - start),
          0.44 / n,
          i === 0 ? orange : edge,
        ),
      ]);
    }
    if (kind === "tree") {
      const step = 0.8 / n;
      return [
        segment(0.5, 0.33, 0.5, 0.53),
        segment(0.1 + step / 2, 0.53, 0.9 - step / 2, 0.53),
        tile(0.35, 0.11, 0.3, 0.24, orange),
        ...list(n, (i) => [
          segment(0.1 + step * (i + 0.5), 0.53, 0.1 + step * (i + 0.5), 0.65),
          tile(0.1 + step * i + 0.02, 0.65, step - 0.04, 0.22, base, edge),
        ]).flat(),
      ];
    }
    if (kind === "cycle") {
      const points = list(n, (i) => [
        0.5 + 0.35 * Math.sin((i * 2 * Math.PI) / n),
        0.5 - 0.36 * Math.cos((i * 2 * Math.PI) / n),
      ]);
      return [
        ...points.map((p, i) => segment(...p, ...points[(i + 1) % n])),
        ...points.map(([a, b], i) =>
          tile(a - 0.035, b - 0.065, 0.07, 0.13, i === 0 ? orange : base, edge),
        ),
      ];
    }
    if (kind === "columns") {
      const step = 0.84 / n;
      return list(n, (i) => [
        tile(0.08 + i * step, 0.15, step - 0.025, 0.7, base, edge),
        tile(
          0.08 + i * step,
          0.15,
          step - 0.025,
          0.14,
          i === 0 ? orange : edge,
        ),
      ]).flat();
    }
    const step = 0.84 / n,
      yLine = kind === "timeline" ? 0.69 : 0.51;
    return [
      segment(0.08 + step / 2, yLine, 0.92 - step / 2, yLine),
      ...list(n, (i) => {
        const offset = 0.08 + step * i;
        return kind === "timeline"
          ? [
              segment(offset + step / 2, 0.36, offset + step / 2, 0.69),
              tile(
                offset + 0.025,
                0.25,
                step - 0.05,
                0.14,
                i === 0 ? orange : base,
                edge,
              ),
            ]
          : [
              tile(
                offset + 0.023,
                0.39,
                step - 0.046,
                0.24,
                i === 0 ? orange : base,
                edge,
              ),
            ];
      }).flat(),
    ];
  }

  function framework(method, values, area, t, blank = false) {
    const [x, y, w, h] = area;
    const [kind, data] = method.d;
    const labels = fieldNames(method);
    const out = [];
    const portrait = h > w * 0.85;
    const cell = (label, value, left, top, width, height, index) => {
      const gap = Math.min(0.16, height * 0.08);
      const labelH = height * 0.3;
      out.push(box(left, top, width, height, paper, rule));
      out.push(
        text(label, left + gap, top + gap, width - gap * 2, labelH, 14, true),
      );
      if (value)
        out.push(
          text(
            value,
            left + gap,
            top + labelH + gap * 1.25,
            width - gap * 2,
            height - labelH - gap * 2,
            13,
          ),
        );
      else if (blank) {
        out.push(
          editable(
            t("answer"),
            left + gap,
            top + labelH + gap * 1.25,
            width - gap * 2,
            height - labelH - gap * 2,
          ),
        );
        out.push(
          line(
            left + gap,
            top + height * 0.69,
            left + width - gap,
            top + height * 0.69,
          ),
        );
        if (height > 1.05)
          out.push(
            line(
              left + gap,
              top + height * 0.85,
              left + width - gap,
              top + height * 0.85,
            ),
          );
      }
      if (index !== undefined)
        out.push(
          box(
            left,
            top,
            0.045,
            height,
            index === (method.id === "eisenhower" ? 1 : 0) ? orange : rule,
          ),
        );
    };
    if (method.id === "pareto" && !blank) {
      const chartTop = y + 0.28,
        bottom = y + h - 1.12,
        chartH = bottom - chartTop;
      const left = x + 0.78,
        right = x + w - 0.78,
        step = (right - left) / data.length;
      const totalCount = method.total || 100;
      const fmt = (value) =>
        new Intl.NumberFormat(method.uiLang === "fr" ? "fr" : "en", {
          maximumSignificantDigits: 4,
        }).format(value);
      out.push(
        aligned(
          method.unit || t("paretoScale"),
          x,
          chartTop,
          0.25,
          chartH,
          10,
          true,
          muted,
          "center",
          true,
        ),
        aligned(
          t("paretoCumulative"),
          x + w - 0.25,
          chartTop,
          0.25,
          chartH,
          10,
          true,
          muted,
          "center",
          true,
        ),
        line(left, chartTop, left, bottom, muted),
        line(right, chartTop, right, bottom, muted),
      );
      [0, 0.2, 0.4, 0.6, 0.8, 1].forEach((fraction) => {
        const yy = bottom - chartH * fraction;
        out.push(line(left, yy, right, yy, fraction === 0 ? muted : rule));
        if (fraction === 0.8) {
          for (let xx = left; xx < right; xx += 0.13)
            out.push(line(xx, yy, Math.min(right, xx + 0.075), yy, muted));
        }
        out.push(
          aligned(
            fmt(totalCount * fraction),
            x + 0.3,
            yy - 0.08,
            0.36,
            0.2,
            9,
            false,
            muted,
            "right",
          ),
        );
        out.push(
          text(
            Math.round(fraction * 100) + "%",
            right + 0.1,
            yy - 0.08,
            0.39,
            0.2,
            9,
            false,
            muted,
          ),
        );
      });
      const points = [];
      let total = 0;
      data.forEach(([label, start, end], i) => {
        const fraction = end - start;
        total += fraction;
        const xx = left + i * step,
          barH = chartH * fraction;
        out.push(
          box(
            xx + step * 0.2,
            bottom - barH,
            step * 0.6,
            barH,
            i < 2 ? orange : tint,
          ),
        );
        out.push(
          aligned(
            fmt(method.counts ? method.counts[i] : 100 * fraction),
            xx + step * 0.22,
            barH > 0.32 ? bottom - barH + 0.07 : bottom - barH - 0.19,
            step * 0.56,
            0.19,
            9,
            true,
            ink,
            "center",
          ),
        );
        out.push(
          aligned(
            label,
            xx + 0.02,
            bottom + 0.13,
            step - 0.04,
            0.42,
            11,
            true,
            ink,
            "center",
          ),
        );
        points.push([xx + step * 0.5, bottom - chartH * total, total]);
      });
      points.forEach(([xx, yy, share], i) => {
        if (i) out.push(line(points[i - 1][0], points[i - 1][1], xx, yy, ink));
        out.push(box(xx - 0.03, yy - 0.03, 0.06, 0.06, ink));
        out.push(
          aligned(
            Math.round(share * 100) + "%",
            xx - 0.28,
            yy - 0.22,
            0.56,
            0.19,
            9,
            true,
            ink,
            "center",
          ),
        );
      });
      out.push(
        aligned(
          t("paretoCategories"),
          left,
          bottom + 0.61,
          right - left,
          0.24,
          9,
          false,
          muted,
          "center",
        ),
      );
      out.push(
        line(left, bottom + 0.96, left + 0.27, bottom + 0.96, muted),
        text(
          t("paretoThreshold"),
          left + 0.37,
          bottom + 0.87,
          right - left - 0.37,
          0.22,
          9,
          false,
          muted,
        ),
      );
      return out;
    }
    if (kind === "matrix") {
      const left = x + 1.25,
        right = x + w - 0.08,
        top = y + 0.22,
        bottom = y + h - 0.86;
      const gap = 0.12,
        cw = (right - left - gap) / 2,
        rh = (bottom - top - gap) / 2;
      out.push(
        ...arrow(left - 0.13, bottom, left - 0.13, top - 0.07),
        ...arrow(left, bottom + 0.1, right + 0.02, bottom + 0.1),
        aligned(
          data.y,
          x,
          top,
          0.25,
          bottom - top,
          11,
          true,
          muted,
          "center",
          true,
        ),
        aligned(
          data.yHigh,
          x + 0.28,
          top + 0.06,
          0.78,
          0.38,
          9,
          false,
          muted,
          "right",
        ),
        aligned(
          data.yLow,
          x + 0.28,
          bottom - 0.4,
          0.78,
          0.38,
          9,
          false,
          muted,
          "right",
        ),
        text(
          data.xLow,
          left,
          bottom + 0.2,
          (right - left) / 2,
          0.23,
          9,
          false,
          muted,
        ),
        aligned(
          data.xHigh,
          left + (right - left) / 2,
          bottom + 0.2,
          (right - left) / 2,
          0.23,
          9,
          false,
          muted,
          "right",
        ),
        aligned(
          data.x,
          left,
          y + h - 0.27,
          right - left,
          0.25,
          11,
          true,
          muted,
          "center",
        ),
      );
      labels.forEach((label, i) =>
        cell(
          label,
          values[i],
          left + (i % 2) * (cw + gap),
          top + Math.floor(i / 2) * (rh + gap),
          cw,
          rh,
          i,
        ),
      );
      return out;
    }
    if (kind === "bars" && !blank) {
      const rows = data.map(([label, start, end], index) => ({
        label,
        start,
        end,
        index,
      }));
      const labelW = w * (portrait ? 0.36 : 0.28),
        plotW = w - labelW - 0.52,
        rh = h / (rows.length + 1);
      const labelSize = portrait ? 12 : 14;
      out.push(
        text(t("timeScale"), x + labelW, y, plotW, 0.28, 11, true, muted),
      );
      rows.forEach(({ label, start, end, index }, i) => {
        const yy = y + rh * (i + 1);
        const value = values[index];
        const barY = yy + rh * 0.12,
          barH = rh * 0.42;
        out.push(text(label, x, yy, labelW - 0.12, rh * 0.8, labelSize, true));
        out.push(box(x + labelW, barY, plotW, barH, tint));
        out.push(
          box(
            x + labelW + plotW * start,
            barY,
            plotW * (end - start),
            barH,
            i ? muted : orange,
          ),
        );
        if (value)
          out.push(
            text(value, x + labelW, yy + rh * 0.57, plotW, rh * 0.38, 10),
          );
      });
      return out;
    }
    if (kind === "grid") {
      const rh = h / (labels.length + 1),
        labelW = w * 0.21,
        cw = (w - labelW) / data.cols.length;
      data.cols.forEach((label, j) => {
        const left = x + labelW + j * cw;
        out.push(
          box(left, y, cw, rh, tint, rule),
          text(label, left + 0.1, y + 0.13, cw - 0.2, rh - 0.22, 12, true),
        );
      });
      labels.forEach((label, i) => {
        const yy = y + rh * (i + 1),
          legacy = values[i];
        out.push(
          box(x, yy, labelW, rh, tint, rule),
          text(label, x + 0.1, yy + 0.12, labelW - 0.2, rh - 0.22, 12, true),
        );
        data.cols.forEach((_, j) => {
          const xx = x + labelW + j * cw;
          const value = values["c" + i + "-" + j] || "";
          out.push(box(xx, yy, cw, rh, paper, rule));
          if (value)
            out.push(text(value, xx + 0.1, yy + 0.14, cw - 0.2, rh - 0.24, 12));
          else if (blank && !legacy)
            out.push(
              editable(t("answer"), xx + 0.1, yy + 0.14, cw - 0.2, rh - 0.24),
            );
        });
        if (legacy && !data.cols.some((_, j) => values["c" + i + "-" + j])) {
          out.push(
            box(x + labelW, yy, w - labelW, rh, paper, rule),
            text(
              legacy,
              x + labelW + 0.1,
              yy + 0.14,
              w - labelW - 0.2,
              rh - 0.24,
              13,
            ),
          );
        }
      });
      return out;
    }
    const chain = method.id === "second-order";
    const sequence =
      chain || ["flow", "timeline", "cycle", "steps"].includes(kind);
    const gap = sequence ? 0.23 : 0.1;
    let top = y,
      space = h;
    if (kind === "tree") {
      out.push(
        box(x, top, w, 0.52, tint, rule),
        text(data.root, x + 0.14, top + 0.11, w - 0.28, 0.32, 14, true),
      );
      top += 0.82;
      space -= 0.82;
    }
    const cols =
      kind === "matrix"
        ? 2
        : kind === "tree" && !chain
          ? labels.length
          : portrait
            ? labels.length > 5
              ? 2
              : 1
            : Math.min(
                labels.length,
                kind === "columns" && labels.length <= 4 ? 4 : 3,
              );
    const rows = Math.ceil(labels.length / cols),
      cw = (w - gap * (cols - 1)) / cols,
      rh = (space - gap * (rows - 1)) / rows;
    if (kind === "tree") {
      const junction = top - 0.15;
      out.push(line(x + w / 2, y + 0.52, x + w / 2, junction, muted));
      if (chain)
        out.push(
          line(x + w / 2, junction, x + cw / 2, junction, muted),
          line(x + cw / 2, junction, x + cw / 2, top, muted),
        );
      else {
        out.push(line(x + cw / 2, junction, x + w - cw / 2, junction, muted));
        labels.forEach((_, i) => {
          const center = x + (cw + gap) * i + cw / 2;
          out.push(line(center, junction, center, top, muted));
        });
      }
    }
    labels.forEach((label, i) => {
      const left = x + (i % cols) * (cw + gap),
        yy = top + Math.floor(i / cols) * (rh + gap);
      cell(
        (sequence ? number(i) + "   " : "") + label,
        values[i],
        left,
        yy,
        cw,
        rh,
        i,
      );
      if (!sequence || i === labels.length - 1) return;
      if (cols === 1) {
        const xx = left + cw / 2,
          bottom = yy + rh,
          tip = bottom + gap - 0.045;
        out.push(
          line(xx, bottom, xx, tip, muted),
          line(xx - 0.036, tip - 0.05, xx, tip, muted),
          line(xx + 0.036, tip - 0.05, xx, tip, muted),
        );
      } else if (i % cols !== cols - 1) {
        const mid = yy + rh / 2,
          right = left + cw,
          tip = right + gap - 0.045;
        out.push(
          line(right, mid, tip, mid, muted),
          line(tip - 0.05, mid - 0.036, tip, mid, muted),
          line(tip - 0.05, mid + 0.036, tip, mid, muted),
        );
      }
    });
    return out;
  }

  function compose(method, ratio, values, t, category) {
    const [w, h] = spec(ratio),
      wide = w > h,
      tall = ratio === "9:16";
    const m = wide ? 0.66 : 0.43,
      width = w - 2 * m,
      end = h - 0.68;
    const title = (label, heading) => [
      text(label.toUpperCase(), m, 0.92, width, 0.26, 11, true, muted),
      text(heading, m, 1.24, width, wide ? 1.05 : 1.35, wide ? 38 : 32, true),
    ];
    const stepList = (steps, area, cols) => {
      const [x, y, w, h] = area,
        gap = 0.18,
        cw = (w - gap * (cols - 1)) / cols;
      const rows = Math.ceil(steps.length / cols),
        rh = h / rows;
      return steps.flatMap((step, i) => {
        const xx = x + (i % cols) * (cw + gap),
          yy = y + Math.floor(i / cols) * rh;
        return [
          line(xx, yy, xx + cw, yy),
          box(xx, yy + 0.1, 0.38, 0.34, orange),
          text(number(i), xx + 0.065, yy + 0.15, 0.27, 0.2, 10, true),
          text(step, xx + 0.53, yy + 0.12, cw - 0.53, rh - 0.2, wide ? 18 : 17),
        ];
      });
    };
    const frame = (i, items) => [
      box(0, 0, w, h, paper),
      box(m, 0.34, 0.51, 0.07, orange),
      text(
        "THE UNFINISHED 30  /  " + t("day"),
        m,
        0.49,
        width - 1,
        0.23,
        9,
        true,
        muted,
      ),
      text(number(i) + " / 08", w - m - 0.52, 0.49, 0.52, 0.23, 9, true, muted),
      ...items,
      line(m, end, w - m, end),
      {
        ...text(
          method.n +
            "  ·  Salah Khenissi · " +
            (method.uiLang === "fr" ? "Ouvrir le canevas" : "Open worksheet"),
          m,
          end + 0.12,
          width,
          0.31,
          9,
          true,
          muted,
        ),
        url: method.publicURL,
      },
    ];
    const y = wide ? 2.39 : 2.75,
      available = end - y - 0.16;
    const { scene, check, headlines = [] } = method.case;
    const compact = tall ? 8.25 : wide ? 4.25 : 5.9;
    const artwork = wide
      ? [w - m - 3.25, 1.68, 3.2, 2.26]
      : [m, 4.17, width, tall ? 3.55 : 1.47];
    const cover = [
      box(0, 0.82, w, end - 0.83, ink),
      text(
        category.toUpperCase() + "  /  " + method.t + " min",
        m,
        1.25,
        width,
        0.35,
        13,
        true,
        orange,
      ),
      text(
        method.n,
        m,
        wide ? 1.85 : 2.15,
        wide ? width * 0.68 : width,
        1.94,
        wide ? 60 : 51,
        true,
        paper,
      ),
      ...motif(method, artwork, true),
      line(m, compact, w - m, compact, muted),
      text(
        method.resultSummary || method.why,
        m,
        compact + 0.25,
        width,
        wide ? 1.4 : tall ? 1.7 : 1.2,
        wide ? 26 : 25,
        false,
        paper,
      ),
      text(
        method.outcome,
        m,
        wide ? end - 0.52 : end - 0.78,
        width,
        wide ? 0.34 : 0.55,
        wide ? 15 : 17,
        true,
        orange,
      ),
    ];
    const briefing = [
      ...title(t("caseLabel"), headlines[0] || t("caseContext")),
      box(m, y, width, wide ? 1.6 : 2.15, tint),
      text(
        scene,
        m + 0.24,
        y + 0.24,
        width - 0.48,
        wide ? 1.16 : 1.65,
        wide ? 24 : 23,
        true,
      ),
      ...stepList(
        [t("whenPrompt"), t("successPrompt")],
        [m, y + (wide ? 1.86 : 2.48), width, available - (wide ? 1.86 : 2.48)],
        wide ? 2 : 1,
      ),
    ];
    const exampleW = wide ? width * 0.55 : width;
    const exampleTop = wide ? y : y + (tall ? 2.85 : 2.25);
    const resultX = wide ? m + exampleW + 0.21 : m,
      resultW = wide ? width - exampleW - 0.21 : width;
    const reasonH = wide ? 2.13 : tall ? 1.55 : 1.16,
      decisionY = y + reasonH + 0.21;
    const example = [
      ...title(t("caseLabel"), headlines[2] || t("decisionChapter")),
      box(resultX, y, resultW, reasonH, tint),
      text(
        t("caseReasoning").toUpperCase(),
        resultX + 0.15,
        y + 0.12,
        resultW - 0.3,
        0.22,
        10,
        true,
        muted,
      ),
      text(
        method.case.reasoning,
        resultX + 0.15,
        y + 0.4,
        resultW - 0.3,
        reasonH - 0.5,
        wide ? 17 : 16,
      ),
      text(
        t("caseDecision").toUpperCase(),
        resultX + 0.15,
        decisionY,
        resultW - 0.3,
        0.22,
        10,
        true,
        muted,
      ),
      text(
        method.exampleNote,
        resultX + 0.15,
        decisionY + 0.28,
        resultW - 0.3,
        wide ? available - reasonH - 0.64 : tall ? 0.65 : 0.45,
        wide ? 17 : 15,
        true,
      ),
      ...framework(
        method.source || method,
        (method.source || method).sampleCells ||
          (method.source || method).sample,
        [m, exampleTop, exampleW, end - exampleTop - 0.18],
        t,
      ),
    ];
    const action = [
      ...title(t("practice"), t("applyTitle")),
      ...stepList(
        method.solo,
        [m, y, width, available - 0.75],
        wide || (!tall && method.solo.length > 4) ? 2 : 1,
      ),
      box(m, end - 0.71, width, 0.51, tint),
      text(method.outcome, m + 0.13, end - 0.58, width - 0.26, 0.28, 14, true),
    ];
    const workshop = [
      ...title(t("asTeam"), t("teamTitle")),
      ...stepList(method.team, [m, y, width, available - 1.0], wide ? 2 : 1),
      box(m, end - 0.94, width, 0.74, ink),
      text(
        t("teamOutput"),
        m + 0.15,
        end - 0.81,
        width - 0.3,
        0.45,
        17,
        true,
        paper,
      ),
    ];
    const follow = [
      ...title(t("reviewChapter"), headlines[3] || t("reviewTitle")),
      box(m, y, width, wide ? 1.44 : 1.93, tint),
      text(
        t("reviewEvidence").toUpperCase(),
        m + 0.19,
        y + 0.15,
        width - 0.38,
        0.24,
        11,
        true,
        muted,
      ),
      text(
        check,
        m + 0.19,
        y + 0.48,
        width - 0.38,
        wide ? 0.76 : 1.19,
        wide ? 20 : 19,
        true,
      ),
      ...stepList(
        [t("nextPrompt"), t("ownerPrompt"), t("reviewPrompt")],
        [m, y + (wide ? 1.72 : 2.2), width, available - (wide ? 1.72 : 2.2)],
        wide ? 3 : 1,
      ),
    ];
    const mapTop = y + 0.59;
    const map = [
      ...title(t("method"), headlines[1] || t("methodMap")),
      text(method.pitfall, m, y, width, 0.49, 15, true),
      ...framework(method, {}, [m, mapTop, width, end - mapTop - 0.16], t),
    ];
    return [
      cover,
      briefing,
      map,
      action,
      [
        ...title(t("canvas"), t("canvasTitle")),
        ...framework(method, values, [m, y, width, available], t, true),
      ],
      example,
      workshop,
      follow,
    ].map((items, i) => frame(i, items));
  }

  let measure;
  function fit(original) {
    const item = original.vertical
      ? { ...original, w: original.h, h: original.w }
      : original;
    if (!measure && typeof document.createElement === "function")
      measure = document.createElement("canvas").getContext?.("2d");
    const width = item.w * 72 * 0.96,
      height = item.h * 72;
    const chars = (word) => Array.from(word);
    for (let size = item.size; size >= 5; size--) {
      if (measure)
        measure.font = (item.bold ? "bold " : "") + size + "px Arial";
      const length = (value) =>
        measure ? measure.measureText(value).width : value.length * size * 0.52;
      const lines = item.content.split(/\r?\n/).flatMap((paragraph) => {
        const rows = [];
        let row = "";
        for (const word of paragraph.split(/\s+/)) {
          if (length(row + " " + word) > width && row) {
            rows.push(row);
            row = "";
          }
          if (length(word) > width) {
            for (const char of chars(word)) {
              if (length(row + char) > width && row) {
                rows.push(row);
                row = "";
              }
              row += char;
            }
          } else row += (row ? " " : "") + word;
        }
        return [...rows, row];
      });
      const leading = size * 1.18;
      if (lines.length * leading <= height) return { lines, size, leading };
      if (size === 5) {
        const clipped = lines.slice(
          0,
          Math.max(1, Math.floor(height / leading)),
        );
        let last = clipped.at(-1);
        while (last && length(last + "…") > width) last = last.slice(0, -1);
        clipped[clipped.length - 1] = last + "…";
        return { lines: clipped, size, leading, clipped: true };
      }
    }
  }

  let svgSequence = 0;
  function svg(items, w, h, escape, label) {
    const u = (n) => (n * 72).toFixed(2);
    const content = items
      .map((i) => {
        if (i.type === "placeholder") return "";
        if (i.type === "box")
          return (
            '<rect x="' +
            u(i.x) +
            '" y="' +
            u(i.y) +
            '" width="' +
            u(i.w) +
            '" height="' +
            u(i.h) +
            '" fill="#' +
            i.fill +
            '"' +
            (i.stroke ? ' stroke="#' + i.stroke + '"' : "") +
            "/>"
          );
        if (i.type === "line")
          return (
            '<line x1="' +
            u(i.x) +
            '" y1="' +
            u(i.y) +
            '" x2="' +
            u(i.x2) +
            '" y2="' +
            u(i.y2) +
            '" stroke="#' +
            i.color +
            '"/>'
          );
        const { lines, size, leading } = fit(i);
        const tx = i.vertical ? i.x + i.w / 2 - i.h / 2 : i.x;
        const ty = i.vertical ? i.y + i.h / 2 - i.w / 2 : i.y;
        const tw = i.vertical ? i.h : i.w;
        const ax =
          tx + (i.align === "center" ? tw / 2 : i.align === "right" ? tw : 0);
        const transform = i.vertical
          ? ' transform="rotate(-90 ' +
            u(i.x + i.w / 2) +
            " " +
            u(i.y + i.h / 2) +
            ')"'
          : "";
        return (
          '<text fill="#' +
          i.color +
          '" font-family="Arial" font-size="' +
          size +
          '" font-weight="' +
          (i.bold ? 700 : 400) +
          '" text-anchor="' +
          (i.align === "center"
            ? "middle"
            : i.align === "right"
              ? "end"
              : "start") +
          '"' +
          transform +
          ">" +
          lines
            .map(
              (row, j) =>
                '<tspan x="' +
                u(ax) +
                '" y="' +
                (ty * 72 + size * 0.88 + j * leading) +
                '">' +
                escape(row) +
                "</tspan>",
            )
            .join("") +
          "</text>"
        );
      })
      .join("");
    const id = "method-diagram-" + ++svgSequence;
    return (
      '<svg viewBox="0 0 ' +
      u(w) +
      " " +
      u(h) +
      '" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="' +
      id +
      "-title " +
      id +
      '-desc"><title id="' +
      id +
      '-title">' +
      escape(label || "Method diagram") +
      '</title><desc id="' +
      id +
      '-desc">' +
      escape(
        items
          .filter((i) => i.type === "text")
          .map((i) => i.content)
          .join(". "),
      ) +
      "</desc>" +
      content +
      "</svg>"
    );
  }

  function addPptx(slide, shape, items, lang) {
    items.forEach((i) => {
      if (i.type === "box") {
        slide.addShape(shape.rect, {
          x: i.x,
          y: i.y,
          w: i.w,
          h: i.h,
          fill: { color: i.fill },
          line: i.stroke
            ? { color: i.stroke, width: 0.6 }
            : { transparency: 100 },
        });
      } else if (i.type === "line") {
        slide.addShape(shape.line, {
          x: Math.min(i.x, i.x2),
          y: Math.min(i.y, i.y2),
          w: Math.abs(i.x2 - i.x),
          h: Math.abs(i.y2 - i.y),
          flipV: (i.x2 - i.x) * (i.y2 - i.y) < 0,
          line: { color: i.color, width: 0.75 },
        });
      } else if (i.content) {
        const { lines, size, leading } = fit(i);
        slide.addText(lines.join("\n"), {
          x: i.x,
          y: i.y,
          w: i.w,
          h: i.h,
          fontFace: "Arial",
          fontSize: size,
          color: i.color,
          bold: i.bold,
          margin: 0,
          lang: lang === "fr" ? "fr-FR" : "en-US",
          valign: "top",
          lineSpacing: leading,
          wrap: false,
          align: i.align || "left",
          ...(i.vertical ? { vert: "vert270" } : {}),
          ...(i.url ? { hyperlink: { url: i.url } } : {}),
        });
      }
    });
  }

  function addPdf(pdf, items) {
    items.forEach((i) => {
      if (i.type === "box") {
        pdf.setFillColor("#" + i.fill);
        if (i.stroke) pdf.setDrawColor("#" + i.stroke);
        pdf.setLineWidth(0.009);
        pdf.rect(i.x, i.y, i.w, i.h, i.stroke ? "FD" : "F");
      } else if (i.type === "line") {
        pdf.setDrawColor("#" + i.color);
        pdf.setLineWidth(0.013);
        pdf.line(i.x, i.y, i.x2, i.y2);
      } else if (i.type === "text" && i.content) {
        const { lines, size, leading } = fit(i);
        pdf.setFont("helvetica", i.bold ? "bold" : "normal");
        pdf.setFontSize(size);
        pdf.setTextColor("#" + i.color);
        if (i.url) pdf.link(i.x, i.y, i.w, i.h, { url: i.url });
        lines.forEach((row, j) => {
          const value = row
            .replace(/[\u202f\u2009]/g, " ")
            .replace(/→/g, ">")
            .replace(/↑/g, "")
            .replace(/≤/g, "<=");
          if (i.vertical) {
            const cx = i.x + i.w / 2,
              cy = i.y + i.h / 2;
            const rowW =
              pdf.getTextWidth?.(value) || (value.length * size * 0.52) / 72;
            const tx = cx - (i.align === "center" ? rowW / 2 : i.h / 2);
            const ty = cy - i.w / 2 + (size * 0.88 + j * leading) / 72;
            pdf.text(value, cx + ty - cy, cy - tx + cx, { angle: 90 });
          } else
            pdf.text(
              value,
              i.x +
                (i.align === "center"
                  ? i.w / 2
                  : i.align === "right"
                    ? i.w
                    : 0),
              i.y + (size * 0.88 + j * leading) / 72,
              { align: i.align || "left" },
            );
        });
      }
    });
  }

  return {
    spec,
    fieldNames,
    framework,
    motif,
    compose,
    svg,
    addPptx,
    addPdf,
    fit,
  };
})();
