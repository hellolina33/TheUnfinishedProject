import { test, expect } from "@playwright/test";
import fs from "node:fs";
import JSZip from "jszip";
const base = "/day-04-productivity-library/";
const editor = (page) => page.getByRole("tab", { name: /Mon canevas/ }).click();
test("Canonical routes, bilingual metadata and search recover the right tools", async ({
  page,
}) => {
  await page.goto(base + "tools/pareto/?lang=fr#/tool/four-ls");
  await expect(page).toHaveURL(/\/fr\/outils\/four-ls\//);
  await expect(page.locator("[rel=canonical]")).toHaveAttribute(
    "href",
    /\/fr\/outils\/four-ls\/$/,
  );
  await page
    .getByRole("link", { name: "Méthodes", exact: true })
    .first()
    .click();
  await page.locator("#search-tools").fill("eisenower");
  await expect(page.locator(".s-card")).toHaveCount(1);
  await page.locator(".s-card").click();
  await expect(page.locator(".s-detailhead h1")).toContainText("Eisenhower");
  await page.goBack();
  await expect(page.locator("#search-tools")).toHaveValue("eisenower");
  await page.locator("#search-tools").fill("urgent important");
  await expect(page.locator(".s-card")).toHaveCount(1);
});
test("RICE computes real values, exports one result and creates an editable deck", async ({
  page,
}) => {
  await page.goto(base + "fr/outils/rice/");
  await editor(page);
  await page.locator("[data-work-act=sample]").click();
  await expect(page.locator("#work-results")).toContainText("160");
  await page.locator('[data-work="rows.0.effort"]').fill("0");
  await expect(page.locator(".w-validation")).toBeVisible();
  await page.locator('[data-work="rows.0.effort"]').fill("4");
  await expect(page.locator(".w-validation")).toHaveCount(0);
  await page.locator(".w-reuse summary").click();
  const [csv] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("[data-reuse=csvOut]").click(),
  ]);
  expect(fs.readFileSync(await csv.path(), "utf8")).toContain("160");
  await page.getByRole("tab", { name: /Présentation/ }).click();
  const [file] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("[data-act=pptx]").click(),
  ]);
  const zip = await JSZip.loadAsync(fs.readFileSync(await file.path()));
  expect(
    Object.keys(zip.files).filter((p) => /^ppt\/slides\/slide\d+.xml$/.test(p)),
  ).toHaveLength(8);
  expect(await zip.file("ppt/slides/slide5.xml").async("string")).toContain(
    "400",
  );
});
test("Pareto imports CSV after mapping and recalculates the cumulative total", async ({
  page,
}) => {
  await page.goto(base + "fr/outils/pareto/");
  await editor(page);
  await page.locator(".w-csv summary").click();
  await page.locator("#work-csv").fill("Cause;Count\nA;18\nB;12\nC;6\nD;4");
  await page.locator("[data-work-act=csv-preview]").click();
  await page.locator("[data-work-act=csv-apply]").click();
  await expect(page.locator("#work-results")).toContainText("75");
  await expect(page.locator("#work-results")).toContainText("40");
  await page.locator('[data-work="rows.0.value"]').fill("-5");
  await expect(page.locator(".w-validation")).toBeVisible();
});
test("Eisenhower tasks move by keyboard and 4Ls transfers only selected actions", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto(base + "fr/outils/four-ls/");
  await editor(page);
  await page.locator("[data-work-act=sample]").click();
  await page.locator('[data-work="rows.0.selected"]').check();
  await page.locator(".w-reuse summary").click();
  await page.locator("[data-work-act=transfer]").click();
  await expect(page).toHaveURL(/eisenhower.*view=practice/);
  await expect(page.locator(".w-row")).toHaveCount(1);
  await page.locator('[data-work="rows.0.group"]').selectOption("2");
  await page.locator("[data-work-act=update]").click();
  await expect(page.locator("#work-results")).toContainText("Éliminer");
});
test("Untrusted input stays text, session answers are absent from the downloadable app", async ({
  page,
  browser,
  browserName,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto(base + "fr/outils/eisenhower/");
  await editor(page);
  await page.locator("[data-work-act=add]").click();
  await page
    .locator('[data-work="rows.0.title"]')
    .fill('<img src=x onerror="window.exposed=1">PRIVATE_WORKSHEET');
  await expect(page.locator("#work-results img")).toHaveCount(0);
  expect(await page.evaluate(() => window.exposed)).toBeUndefined();
  await page.locator(".s-utility summary").click();
  const [file] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("header [data-act=html]").click(),
  ]);
  const contents = fs.readFileSync(await file.path(), "utf8");
  expect(contents).not.toContain("PRIVATE_WORKSHEET");
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
  const context = await browser.newContext({
      offline: browserName !== "webkit",
    }),
    offline = await context.newPage(),
    requests = [];
  await context.route(/^https?:/, (route) => route.abort());
  offline.on("request", (req) => {
    if (/^https?:/.test(req.url())) requests.push(req.url());
  });
  const offlinePath = test.info().outputPath("studio.html");
  await file.saveAs(offlinePath);
  await offline.goto("file://" + offlinePath);
  await expect(offline.locator(".s-hero")).toBeVisible();
  await context.setOffline(true);
  await offline.locator(".s-journeychoice").first().click();
  await offline.locator(".s-journeysteps a").first().click();
  await editor(offline);
  await offline.locator("[data-work-act=sample]").click();
  await offline.getByRole("tab", { name: /Présentation/ }).click();
  const [pdf] = await Promise.all([
    offline.waitForEvent("download"),
    offline.locator("[data-act=pdf]").click(),
  ]);
  expect(
    fs
      .readFileSync(await pdf.path())
      .subarray(0, 4)
      .toString(),
  ).toBe("%PDF");
  expect(requests).toEqual([]);
  await context.close();
});
test("Mobile input comes before the preview and the slide text has a readable alternative", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto(base + "fr/outils/rice/");
  await editor(page);
  await expect(page.locator(".w-editor")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("tab", { name: /Présentation/ }).click();
  await page.locator("[data-work-act=read-slides]").click();
  await expect(page.locator(".w-reading section")).toHaveCount(8);
});
test("Guides and the interactive worksheet meet automated critical accessibility checks", async ({
  page,
}) => {
  const axe = fs.readFileSync("node_modules/axe-core/axe.min.js", "utf8");
  for (const route of ["fr/", "en/tools/rice/", "fr/outils/eisenhower/"]) {
    await page.goto(base + route);
    await page.evaluate(axe);
    const result = await page.evaluate(() =>
      window.axe.run(document, {
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
        },
      }),
    );
    expect(
      result.violations
        .filter((v) => ["critical", "serious"].includes(v.impact))
        .map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  }
});
test("Versioned backups restore the structured work without losing prior worksheets", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto(base + "fr/outils/rice/");
  await editor(page);
  await page.locator("[data-work-act=sample]").click();
  await page.locator("#answer-management summary").click();
  const [file] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("[data-act=json]").click(),
  ]);
  const backup = JSON.parse(fs.readFileSync(await file.path(), "utf8"));
  expect(backup.schemaVersion).toBe(3);
  expect(backup.workspace.rows[0].reach).toBe("400");
  await page.locator("[data-work-act=blank]").click();
  await page.locator("#answer-management summary").click();
  await page.locator("#import-file").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await page.locator("[data-act=import-blank]").click();
  await expect(page.locator("#work-results")).toContainText("160");
});
test("Result-only files, calendar and generic action plans preserve the entered values", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto(base + "fr/outils/swot/");
  await editor(page);
  await page.locator("#input-0").fill("Original strength");
  await page.locator("[data-work=decision]").fill("Launch a small trial");
  await page.locator("[data-work=owner]").fill("Lina");
  await page.locator("[data-work=due]").fill("2026-12-01");
  await page.locator(".w-reuse summary").click();
  const [csv] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("[data-reuse=csvOut]").click(),
  ]);
  expect(fs.readFileSync(await csv.path(), "utf8")).toContain(
    "Original strength",
  );
  const [ics] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("[data-reuse=calendar]").click(),
  ]);
  expect(fs.readFileSync(await ics.path(), "utf8")).toContain("20261201");
  const [ppt] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("[data-reuse=onePpt]").click(),
  ]);
  const zip = await JSZip.loadAsync(fs.readFileSync(await ppt.path()));
  expect(
    Object.keys(zip.files).filter((p) => /^ppt\/slides\/slide\d+.xml$/.test(p)),
  ).toHaveLength(1);
  expect(await zip.file("ppt/slides/slide1.xml").async("string")).toContain(
    "Original strength",
  );
  await page.getByRole("tab", { name: /Présentation/ }).click();
  await expect(page.locator("#slide-canvas")).toBeVisible();
});
test("Public sharing restores the selected slide and never adds worksheet text to its URL", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      value: async (data) => {
        window.sharedPublicLink = data.url;
      },
      configurable: true,
    });
  });
  await page.goto(base + "fr/outils/eisenhower/?view=practice");
  await page.locator("[data-work-act=add]").click();
  await page.locator('[data-work="rows.0.title"]').fill("DO_NOT_SHARE_THIS");
  await page.getByRole("tab", { name: /Présentation/ }).click();
  await page.locator(".s-deckcontents summary").click();
  await page.locator('[data-act=slide][data-val="5"]').click();
  await page.locator("[data-act=share]").click();
  const link = await page.evaluate(() => window.sharedPublicLink);
  expect(link).toContain("view=slides");
  expect(link).toContain("slide=5");
  expect(link).not.toContain("DO_NOT_SHARE_THIS");
});
test("Localized metadata, scenario kits and the dedicated widget are deployable", async ({
  page,
  request,
}) => {
  const response = await request.get(base + "fr/outils/rice/");
  const html = await response.text();
  expect(html).toContain('rel="canonical"');
  expect(html).toContain('hreflang="en"');
  expect(html).toContain("Une équipe ne peut livrer");
  expect(response.headers()["content-security-policy"]).toContain(
    "script-src 'self'",
  );
  const situationPage = await request.get(base + "fr/kits/backlog/");
  const situationHtml = await situationPage.text();
  expect(situationHtml).toContain(
    'property="og:title" content="Prioriser un backlog produit',
  );
  expect(situationHtml).toContain(
    'property="og:url" content="https://the-unfinished-30.vercel.app/day-04-productivity-library/fr/kits/backlog/"',
  );
  const kit = await request.get(base + "downloads/kit-backlog-fr.zip");
  expect(kit.ok()).toBeTruthy();
  const zip = await JSZip.loadAsync(await kit.body());
  expect(zip.file("rice.md")).toBeTruthy();
  expect(zip.file("productivity-studio-fr.html")).toBeTruthy();
  const social = await request.get(base + "social/fr-rice.png");
  expect((await social.body()).subarray(1, 4).toString()).toBe("PNG");
  await page.goto(base + "embed/fr/eisenhower/");
  await expect(page.locator(".w-editor")).toBeVisible();
  await expect(page.locator("header")).not.toBeVisible();
});
test("Recommendations distinguish exact fits from explicit alternatives", async ({
  page,
}) => {
  await page.goto(base + "fr/?section=find");
  await page
    .locator("label")
    .filter({ has: page.locator("input[name=who][value=client]") })
    .click();
  await page
    .locator("label")
    .filter({ has: page.locator("input[name=time][value=short]") })
    .click();
  await page.locator("#studio-quiz button[type=submit]").last().click();
  await expect(page.locator(".w-no-match")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Alternatives à comparer" }),
  ).toBeVisible();
  await expect(page.locator(".s-rec").first()).toContainText("Alternative");
});

for (const journey of [
  { role: "student", id: "study", method: "time-blocking", next: "pomodoro" },
  {
    role: "manager",
    id: "team-priorities",
    method: "impact-effort",
    next: "moscow",
  },
  {
    role: "professional",
    id: "vendors",
    method: "weighted",
    next: "premortem",
  },
])
  test(`${journey.role} can choose a goal, work, continue and recover the same answers`, async ({
    page,
  }) => {
    await page.goto(base + "fr/");
    await expect(page.locator("header .s-nav a")).toHaveCount(2);
    await page.locator(`[data-persona=${journey.role}]`).click();
    await expect(page.locator(".s-journeychoice")).toHaveCount(2);
    await page.locator(`.s-journeychoice[href*="/${journey.id}/"]`).click();
    await expect(page.locator(".s-journeysteps>li")).toHaveCount(3);
    await page.locator(".s-journeysteps a").first().click();
    await expect(page).toHaveURL(
      new RegExp(journey.method + ".*journey=" + journey.id),
    );
    await expect(page.locator(".s-journeycontext")).toContainText("1 / 3");
    if (journey.method === "impact-effort")
      await page.locator("#input-0").fill("Choix conservé pour le parcours");
    else
      await page
        .locator("[data-work=decision]")
        .fill("Choix conservé pour le parcours");
    await page.locator(".s-journeycontinue a").click();
    await expect(page).toHaveURL(
      new RegExp(journey.next + ".*journey=" + journey.id),
    );
    await expect(page.locator(".s-journeycontext")).toContainText("2 / 3");
    await page.goBack();
    await expect(
      page.locator(
        journey.method === "impact-effort"
          ? "#input-0"
          : "[data-work=decision]",
      ),
    ).toHaveValue("Choix conservé pour le parcours");
    await page.locator(".s-journeycontext a").click();
    await page.locator(".s-journeyfiles summary").click();
    const [summary] = await Promise.all([
      page.waitForEvent("download"),
      page.locator("[data-act=journey-export]").click(),
    ]);
    expect(fs.readFileSync(await summary.path(), "utf8")).toContain(
      "Choix conservé pour le parcours",
    );
  });

test("The compact mobile menu, support pages and language switch remain usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + "fr/");
  expect(
    await page
      .locator("header")
      .evaluate((el) => el.getBoundingClientRect().height),
  ).toBeLessThan(130);
  await page.locator(".s-utility summary").click();
  await expect(page.locator("header [data-act=html]")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(".s-utility")).not.toHaveAttribute("open", "");
  await page.locator(".s-utility summary").click();
  await page.locator('header a[href="#/help"]').click();
  await expect(page.locator("#help")).toBeVisible();
  await expect(page.locator(".s-taskhome")).toHaveCount(0);
  await page.locator(".s-utility summary").click();
  await page.locator("header [data-act=lang]").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("link", { name: "Start here", exact: true }).click();
  await page.locator("[data-persona=student]").click();
  await expect(page.locator(".s-journeychoices")).toContainText(
    "Plan my revision",
  );
});

test("A guide example really fills the worksheet and slide state survives a reload", async ({
  page,
}) => {
  await page.goto(base + "fr/outils/pareto/");
  await page.locator("[data-act=example-workspace]").click();
  await expect(page.locator("#work-results")).toContainText("100");
  await page.getByRole("tab", { name: /Présentation/ }).click();
  await page.locator(".s-deckcontents summary").click();
  await page.locator('[data-act=slide][data-val="2"]').click();
  await page.locator("#ratio").selectOption("9:16");
  await expect(page).toHaveURL(/view=slides.*slide=2.*ratio=9%3A16/);
  page.on("dialog", (dialog) => dialog.accept());
  await page.reload();
  await expect(page.locator(".s-slide")).toHaveAttribute("data-ratio", "9:16");
  await expect(page.locator(".s-count")).toContainText("3 / 8");
});
