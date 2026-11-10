import { test, expect } from "@playwright/test";
const url="/day-06-yes-man/";
async function generate(page) {
  await page.goto(url);
  await page.locator("#request").fill("Can you redo the deck by tomorrow?");
  await page.locator("#intent").selectOption("decline");
  await page.locator("#boundary").fill("I cannot work tonight.");
  await page.locator("#suggest").click();
  await expect(page.locator("#results-view")).toBeVisible();
}

test("reply language and edited words survive interface translation and back navigation",async({page})=>{
  await generate(page);
  await expect(page.locator("#intent-decline")).toHaveAttribute("aria-selected","true");
  await page.locator("#draft").fill("I can review Monday, but not tonight.");
  await page.locator('[data-lang="fr"]').click();
  await expect(page.locator("#draft")).toHaveValue("I can review Monday, but not tonight.");
  await expect(page.locator("#copy-draft")).toContainText("Copier");
  await page.locator("#step-prepare").click();
  await expect(page.locator("#request")).toHaveValue("Can you redo the deck by tomorrow?");
  await page.locator("#step-results").click();
  await expect(page.locator("#draft")).toHaveValue("I can review Monday, but not tonight.");
});

test("custom reply begins immediately and multi-round rehearsal can replay",async({page})=>{
  await generate(page);
  await page.locator("#rehearsal-settings summary").click();
  await page.locator("#rounds").selectOption("3");
  await page.locator("#allow-acceptance").uncheck();
  await page.locator("#test-draft").click();
  await expect(page.locator("#round-marker")).toHaveText("Follow-up 1/3");
  for(let i=0;i<3;i++){
    await page.locator("#reply").fill("I cannot do this. I am keeping my original commitment.");
    await page.locator("#duel-next").click();
  }
  await expect(page.locator("#jury-view")).toBeVisible();
  await page.locator("#replay").click();
  await page.locator("#replay-now").click();
  await page.locator("#reply").fill("I cannot take this on.");
  await page.locator("#duel-next").click();
  await expect(page.locator("#jury-view")).toBeVisible();
  await page.locator("#takes").click();
  await expect(page.locator(".ym-added")).toContainText("take this");
});

test("anonymization is previewed and reversible",async({page})=>{
  await page.goto(url);
  const request="Alex, write to alex@example.com by Friday.";
  await page.locator("#request").fill(request);
  await page.locator("#import-tools summary").click();
  await page.locator("#anonymize").click();
  await page.locator("#anon-names").fill("Alex");
  await expect(page.locator("#anon-result")).not.toHaveValue(/Alex|alex@example/);
  await expect(page.locator("#request")).toHaveValue(request);
  await page.locator("#use-anon").click();
  await page.locator("#undo-input").click();
  await expect(page.locator("#request")).toHaveValue(request);
});

test("draft recovery is opt-in and restores an exact edited reply",async({page})=>{
  await generate(page);
  await page.locator("#settings").click();
  await page.locator("#remember").check();
  await page.locator("#settings-close").click();
  await page.locator("#draft").fill("My exact wording.");
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem("ym-draft"))).toContain("My exact wording.");
  await page.reload();
  await page.locator("#resume").click();
  await expect(page.locator("#draft")).toHaveValue("My exact wording.");
  await page.locator("#settings").click();
  await page.locator("#erase-data").click();
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem("ym-draft"))).toBeNull();
});

test("editor reflows on a small screen",async({page})=>{
  await page.setViewportSize({width:375,height:844});
  await generate(page);
  await page.locator("#settings").click();
  await page.locator("#text-size").selectOption("large");
  await page.locator("#settings-close").click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await expect(page.locator("#intent-tabs button")).toHaveCount(4);
});
