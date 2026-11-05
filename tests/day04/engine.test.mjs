import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const ctx = vm.createContext({
  window: {},
  Intl,
  TextEncoder,
  crypto: globalThis.crypto,
});
for (const file of ["engine", "search", "reuse"])
  vm.runInContext(
    fs.readFileSync("day-04-productivity-library/" + file + ".js", "utf8"),
    ctx,
  );
const E = ctx.window.ProductivityEngine,
  S = ctx.window.ProductivitySearch;
const methods = JSON.parse(
  fs.readFileSync("day-04-productivity-library/data/methods.json", "utf8"),
);
const method = (id) => methods.find((m) => m.id === id);
test("RICE handles percentage, zero effort and sorting", () => {
  const w = E.sample(method("rice"));
  const r = E.calculate(method("rice"), w);
  assert.deepEqual(
    Array.from(r.ranked, (r) => r.score),
    [160, 80],
  );
  w.rows[0].effort = "0";
  assert.ok(E.calculate(method("rice"), w).errors.includes("rice"));
  w.rows[0].effort = "4";
  w.rows[0].confidence = "101";
  assert.ok(E.calculate(method("rice"), w).errors.includes("rice"));
  assert.equal(E.number("1,5"), 1.5);
  assert.equal(E.number("1,2,3"), null);
});
test("Pareto uses actual totals and cumulative shares", () => {
  const w = E.validate({
    rows: [
      { title: "A", value: "18" },
      { title: "B", value: "12" },
      { title: "C", value: "6" },
      { title: "D", value: "4" },
    ],
  });
  const r = E.calculate(method("pareto"), w);
  assert.equal(r.detail.total, 40);
  assert.equal(r.ranked[1].cumulative, 0.75);
  const p = E.project(method("pareto"), w);
  assert.equal(p.method.total, 40);
  assert.equal(p.method.counts[0], 18);
  w.rows[0].value = "-1";
  assert.ok(E.calculate(method("pareto"), w).errors.includes("nonnegative"));
});
test("Weighted scoring checks scale and weights and preserves source", () => {
  const w = E.sample(method("weighted"));
  let r = E.calculate(method("weighted"), w);
  assert.equal(r.ranked[0].title, "C");
  assert.ok(Math.abs(r.ranked[0].score - 3.9) < 1e-10);
  w.weights = ["0", "0", "0"];
  assert.ok(E.calculate(method("weighted"), w).errors.includes("weights"));
});
test("CSV parser quotes, limits and formula-safe export", () => {
  const rows = E.parseDelimited(
    'name;value\r\n"a;b";"1,5"\r\n"double""quote";2',
  );
  assert.equal(rows[1][0], "a;b");
  assert.equal(rows[2][0], 'double"quote');
  assert.throws(() => E.parseDelimited('name,value\n"unfinished,1'));
  assert.match(E.csv([["=1+1", "@SUM(1)", "normal"]]), /"'=1\+1"/);
  assert.throws(() => E.parseDelimited("x".repeat(262145)));
});
test("Structured import is bounded and removes unknown keys", () => {
  const w = E.validate(
    JSON.parse(
      '{"rows":[{"title":"ok","__proto__":{"polluted":true},"group":99,"due":"2026-02-31"}],"unexpected":"value"}',
    ),
  );
  assert.equal(w.rows[0].title, "ok");
  assert.equal(w.rows[0].group, 3);
  assert.equal(w.rows[0].due, "");
  assert.equal(w.unexpected, undefined);
  assert.equal({}.polluted, undefined);
});
test("Search understands common needs, typos and both languages", () => {
  for (const [q, id] of [
    ["eisenower", "eisenhower"],
    ["urgent important", "eisenhower"],
    ["prioriser backlog", "rice"],
    ["compte rendu atelier", "four-ls"],
    ["80 20", "pareto"],
  ]) {
    const found = methods.filter((m) => S.match(m, q));
    assert.ok(
      found.some((m) => m.id === id),
      q,
    );
  }
});
test("100-row performance stays below a worker threshold", () => {
  const w = E.validate({
    rows: Array.from({ length: 100 }, (_, i) => ({
      title: "Item " + i,
      reach: "400",
      impact: "2",
      confidence: "80",
      effort: "4",
    })),
  });
  const start = performance.now();
  for (let i = 0; i < 100; i++) E.calculate(method("rice"), w);
  assert.ok(performance.now() - start < 1000);
});
test("Merging a backup keeps existing decisions and never silently drops rows", () => {
  const current = E.validate({
      rows: [{ title: "Keep" }],
      decision: "Keep decision",
    }),
    incoming = E.validate({
      rows: [{ title: "Add" }],
      decision: "Other decision",
      owner: "Lina",
    });
  const result = E.merge(current, incoming);
  assert.equal(result.rows.length, 2);
  assert.equal(result.decision, "Keep decision");
  assert.equal(result.owner, "Lina");
  assert.throws(() =>
    E.merge(
      E.validate({ rows: Array.from({ length: 100 }, () => ({ title: "x" })) }),
      incoming,
    ),
  );
});
