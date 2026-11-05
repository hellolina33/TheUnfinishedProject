import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import Pptx from "pptxgenjs";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
test("600 real output binaries have correct page counts, native text and dimensions", async () => {
  const folder = "day-04-productivity-library/";
  const context = vm.createContext({
    window: {},
    document: {
      createElement() {
        return {};
      },
    },
    Intl,
  });
  vm.runInContext(fs.readFileSync(folder + "deck.js", "utf8"), context);
  const source = fs.readFileSync(folder + "studio.js", "utf8"),
    strings = vm.runInNewContext(
      source.slice(
        source.search(/\bconst L\s*=/),
        source.search(/\blet legacy\s*=/),
      ) + "\nL",
    );
  const methods = JSON.parse(
      fs.readFileSync(folder + "data/methods.json", "utf8"),
    ),
    D = context.window.ProductivityDeck;
  for (const [i, method] of methods.entries())
    for (const lang of ["en", "fr"])
      for (const ratio of ["16:9", "9:10", "9:16"]) {
        const m = {
            ...method,
            ...(lang === "fr" ? method.fr : {}),
            number: i + 1,
          },
          [w, h] = D.spec(ratio),
          pages = D.compose(
            m,
            ratio,
            {},
            (key) => strings[lang][key] || key,
            "Category",
          );
        const ppt = new Pptx();
        ppt.defineLayout({ name: "C", width: w, height: h });
        ppt.layout = "C";
        const pdf = new jsPDF({
          orientation: w > h ? "landscape" : "portrait",
          unit: "in",
          format: [w, h],
        });
        pages.forEach((items, index) => {
          D.addPptx(ppt.addSlide(), ppt.ShapeType, items, lang);
          if (index) pdf.addPage([w, h], w > h ? "landscape" : "portrait");
          D.addPdf(pdf, items);
        });
        const zip = await JSZip.loadAsync(
          await ppt.write({ outputType: "nodebuffer" }),
        );
        assert.equal(
          Object.keys(zip.files).filter((p) =>
            /^ppt\/slides\/slide\d+.xml$/.test(p),
          ).length,
          8,
        );
        const canvas = await zip.file("ppt/slides/slide5.xml").async("string");
        assert.match(canvas, /<a:t>/);
        assert.doesNotMatch(canvas, /<p:pic>/);
        assert.equal(pdf.getNumberOfPages(), 8);
        assert.ok(Math.abs(pdf.internal.pageSize.getWidth() - w) < 1e-8);
        assert.ok(Math.abs(pdf.internal.pageSize.getHeight() - h) < 1e-8);
        assert.ok(pdf.output().startsWith("%PDF"));
      }
});
