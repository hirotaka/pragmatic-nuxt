import { constants } from "node:fs";
import { copyFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createPage, setup, url, waitForHydration } from "@nuxt/test-utils/e2e";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

describe("documentation search", async () => {
  const fixture = new URL("../fixtures/content/search-proof.md", import.meta.url);
  const content = new URL("../../content/1.docs/search-proof.md", import.meta.url);
  let fixtureCreated = false;
  // If the process is killed before teardown, remove only this test-created copy before a production build.
  beforeAll(async () => {
    await copyFile(fixture, content, constants.COPYFILE_EXCL);
    fixtureCreated = true;
  });
  afterAll(async () => {
    if (fixtureCreated) await unlink(content);
  });

  await setup({ rootDir: fileURLToPath(new URL("../..", import.meta.url)), browser: true });

  let page: Awaited<ReturnType<typeof createPage>>;
  let diagnostics: string[];
  beforeEach(async () => {
    page = await createPage();
    diagnostics = [];
    page.on("console", (message) => {
      if (["warning", "error"].includes(message.type())) diagnostics.push(message.text());
    });
    page.on("pageerror", error => diagnostics.push(error.message));
  });
  afterEach(async () => {
    await page.close();
    expect(diagnostics).toEqual([]);
  });

  it("supports focus, shortcuts, one-character queries, empty results and a narrow viewport", async () => {
    await page.goto(url("/docs/getting-started"), { waitUntil: "hydration" });
    const trigger = page.getByRole("button", { name: "Search documentation", exact: true });
    const input = page.getByRole("combobox", { name: "Search documentation" });
    const options = page.getByRole("option");
    await trigger.click();
    await page.getByRole("status").filter({ hasText: "Type to search documentation." }).waitFor();
    expect(await input.evaluate(element => element === document.activeElement)).toBe(true);
    await input.fill("composables");
    await options.first().waitFor();
    expect((await options.allTextContents()).join(" ")).toMatch(/composables/i);
    await input.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    expect(await trigger.evaluate(element => element === document.activeElement)).toBe(true);
    await page.keyboard.press("Control+k");
    await input.waitFor();
    expect(await input.inputValue()).toBe("");
    expect(await options.count()).toBe(0);
    await input.fill("a");
    await options.first().waitFor();
    await input.fill("zzzzsearchmissingtoken");
    await page.getByRole("status").filter({ hasText: "No results found." }).waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    await input.fill("composables");
    await options.first().waitFor();
    const fits = await page.getByRole("dialog").evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= innerWidth;
    });
    expect(fits).toBe(true);
  });

  it("can close and reopen while the real WASM index is still initializing", async () => {
    const requested = Promise.withResolvers<undefined>();
    const release = Promise.withResolvers<undefined>();
    await page.route("**/*.wasm", async (route) => {
      requested.resolve(undefined);
      await release.promise;
      await route.continue();
    });
    try {
      await page.goto(url("/docs/getting-started"), { waitUntil: "hydration" });
      await page.getByRole("button", { name: "Search documentation", exact: true }).click();
      await requested.promise;
      await page.getByRole("status").filter({ hasText: "Preparing documentation search" }).waitFor();
      const input = page.getByRole("combobox");
      await input.fill("superseded");
      await input.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      await page.keyboard.press("Control+k");
      await input.waitFor();
      expect(await input.inputValue()).toBe("");
    }
    finally {
      release.resolve(undefined);
    }
    await page.getByRole("status").filter({ hasText: "Type to search documentation." }).waitFor();
    expect(await page.getByRole("option").count()).toBe(0);
  });

  it("preserves fixture ranking, body context, safe text and keyboard/pointer destinations", async () => {
    await page.goto(url("/docs/getting-started"), { waitUntil: "hydration" });
    await page.getByRole("button", { name: "Search documentation", exact: true }).click();
    const input = page.getByRole("combobox");
    const options = page.getByRole("option");
    await input.fill("bodyneedle");
    await options.first().waitFor();
    expect(await options.count()).toBe(1);
    expect(await options.first().textContent()).toContain("Reference");
    expect(await options.first().textContent()).toContain("Rankneedle guide");
    expect(await options.first().textContent()).toContain("bodyneedle <img src=x onerror=\"window.searchProof=1\">");
    expect(await options.first().locator("img,script").count()).toBe(0);
    expect(await page.evaluate(() => Reflect.get(window, "searchProof"))).toBeUndefined();
    await input.press("ArrowDown");
    await input.press("Enter");
    await page.waitForURL(url("/docs/search-proof#reference"));
    await page.locator("#reference").waitFor();
    await page.keyboard.press("Control+k");
    await input.fill("rankneedle");
    await expect.poll(() => options.count()).toBe(3);
    expect(await options.allTextContents()).toEqual([
      expect.stringMatching(/^\s*Rankneedle guide/),
      expect.stringMatching(/^\s*Related/),
      expect.stringMatching(/^\s*Reference/),
    ]);
    await options.nth(1).click();
    await page.waitForURL(url("/docs/search-proof#related"));
    await page.locator("#related").waitFor();
  });

  it("shows a real WASM failure and recovers only after a new document loads", async () => {
    await page.route("**/*.wasm", route => route.abort());
    await page.goto(url("/docs/getting-started"), { waitUntil: "hydration" });
    await page.getByRole("button", { name: "Search documentation", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Search is unavailable." }).waitFor();
    const expectedFailureDiagnostics = diagnostics.splice(0);
    expect(expectedFailureDiagnostics.length).toBeGreaterThan(0);
    expect(expectedFailureDiagnostics.join(" ")).toMatch(/wasm|sqlite/i);
    const timeOrigin = await page.evaluate(() => performance.timeOrigin);
    await page.unroute("**/*.wasm");
    await Promise.all([
      page.waitForEvent("domcontentloaded"),
      page.getByRole("button", { name: "Reload page", exact: true }).click(),
    ]);
    await waitForHydration(page, url("/docs/getting-started"), "hydration");
    expect(await page.evaluate(() => performance.timeOrigin)).not.toBe(timeOrigin);
    await page.getByRole("button", { name: "Search documentation", exact: true }).click();
    await page.getByRole("status").filter({ hasText: "Type to search documentation." }).waitFor();
    await page.getByRole("combobox").fill("composables");
    await page.getByRole("option").first().waitFor();
  });
});
