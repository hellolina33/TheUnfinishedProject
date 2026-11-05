import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import Pptx from "pptxgenjs";
import JSZip from "jszip";
const folder = "day-04-productivity-library/";
const context = vm.createContext({
  window: {},
  document: { createElement: () => ({}) },
  Intl,
});
vm.runInContext(fs.readFileSync(folder + "deck.js", "utf8"), context);
vm.runInContext(fs.readFileSync(folder + "engine.js", "utf8"), context);
const D = context.window.ProductivityDeck,
  E = context.window.ProductivityEngine;
const source = fs.readFileSync(folder + "studio.js", "utf8");
const labels = vm.runInNewContext(
  source.slice(
    source.search(/\bconst L\s*=/),
    source.search(/\blet legacy\s*=/),
  ) + "\nL",
);
const methods = JSON.parse(
  fs.readFileSync(folder + "data/methods.json", "utf8"),
);
const translate = (lang) => (key) => labels[lang][key] || key;

test("Matrix dimensions, endpoints and quadrant meanings agree in both languages", () => {
  for (const original of methods.filter((m) => m.d[0] === "matrix"))
    for (const lang of ["en", "fr"]) {
      const m = {
        ...original,
        ...(lang === "fr" ? original.fr : {}),
        uiLang: lang,
      };
      const items = D.framework(m, {}, [0.4, 0.4, 9, 5], translate(lang), true),
        a = m.d[1];
      const find = (text) =>
        items.find((i) => i.type === "text" && i.content === text);
      const quadrants = a.q.map(find),
        xTitle = find(a.x),
        yTitle = find(a.y);
      assert.equal(
        yTitle.vertical,
        true,
        m.id + " y-title must follow the vertical axis",
      );
      assert.ok(
        xTitle.y > Math.max(...quadrants.map((i) => i.y)),
        m.id + " x-title belongs below the cells",
      );
      assert.ok(
        yTitle.x + yTitle.w < Math.min(...quadrants.map((i) => i.x)),
        m.id + " y-title belongs left of the cells",
      );
      const firstCell = items.find(
        (i) => i.type === "box" && i.stroke && i.fill === "FFFDF9",
      );
      const axisValue = (value, horizontal) =>
        items.find(
          (i) =>
            i.type === "text" &&
            i.content === value &&
            (horizontal ? i.x >= firstCell.x : i.x < firstCell.x),
        );
      assert.ok(axisValue(a.xLow, true).x < axisValue(a.xHigh, true).x);
      assert.ok(axisValue(a.yHigh, false).y < axisValue(a.yLow, false).y);
      assert.ok(
        quadrants[0].x < quadrants[1].x && quadrants[0].y < quadrants[2].y,
      );
      for (const [value, horizontal] of [
        [a.xLow, true],
        [a.xHigh, true],
        [a.yLow, false],
        [a.yHigh, false],
      ]) {
        const label = axisValue(value, horizontal);
        assert.equal(
          D.fit(label).lines.join(" "),
          value,
          m.id + " endpoint words must remain intact",
        );
      }
      if (m.id === "swot") assert.match(a.yHigh, /Helpful|Favorable/);
      if (m.id === "eisenhower")
        assert.ok(
          items.some(
            (i) =>
              i.type === "box" && i.fill === "FF5A32" && i.x > quadrants[0].x,
          ),
        );
    }
});

test("Pareto keeps count and percentage scales distinct for a total other than 100", () => {
  const m = { ...methods.find((m) => m.id === "pareto"), uiLang: "en" };
  const work = E.validate({
    rows: [
      { title: "A", value: "13" },
      { title: "B", value: "7" },
      { title: "C", value: "5" },
    ],
  });
  const { method, values } = E.project(m, work);
  const items = D.framework(method, values, [0.4, 0.4, 9, 5], translate("en"));
  const words = items.filter((i) => i.type === "text");
  assert.ok(words.some((i) => i.content === "25" && i.align === "right"));
  assert.ok(words.some((i) => i.content === "100%" && !i.bold));
  assert.equal(words.filter((i) => i.vertical).length, 2);
  const categories = words.find(
    (i) => i.content === labels.en.paretoCategories,
  );
  assert.ok(categories.y > words.find((i) => i.content === "A").y);
  const plot = items.find(
    (i) => i.type === "line" && i.x === i.x2 && i.y < i.y2,
  );
  const bars = items.filter((i) => i.type === "box" && i.w > 0.2);
  assert.ok(Math.abs(bars[0].h / (plot.y2 - plot.y) - 13 / 25) < 1e-9);
});

test("Rotated axis labels remain native editable PowerPoint text", async () => {
  const m = methods.find((m) => m.id === "eisenhower");
  const ppt = new Pptx();
  const [w, h] = D.spec("16:9");
  ppt.defineLayout({ name: "C", width: w, height: h });
  ppt.layout = "C";
  D.addPptx(
    ppt.addSlide(),
    ppt.ShapeType,
    D.framework(m, {}, [0.4, 0.4, w - 0.8, h - 0.8], translate("en"), true),
    "en",
  );
  const zip = await JSZip.loadAsync(
    await ppt.write({ outputType: "nodebuffer" }),
  );
  const slide = await zip.file("ppt/slides/slide1.xml").async("string");
  assert.match(slide, /vert="vert270"/);
  assert.match(slide, />Importance</);
  assert.doesNotMatch(slide, /<p:pic>/);
});

test("All default slide texts fit after reserving separate axis-label space", () => {
  for (const original of methods)
    for (const lang of ["en", "fr"])
      for (const ratio of ["16:9", "9:10", "9:16"]) {
        const m = {
          ...original,
          ...(lang === "fr" ? original.fr : {}),
          uiLang: lang,
        };
        const pages = D.compose(m, ratio, {}, translate(lang), "Category");
        for (const [n, items] of pages.entries())
          for (const item of items.filter((i) => i.type === "text")) {
            const fit = D.fit(item);
            assert.ok(
              !fit.clipped,
              `${m.id} ${lang} ${ratio} slide ${n + 1}: ${item.content}`,
            );
          }
      }
});
