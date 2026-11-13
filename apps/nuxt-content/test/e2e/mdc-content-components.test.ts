import { fileURLToPath } from "node:url";
import { createPage, setup, url } from "@nuxt/test-utils/e2e";
import { afterEach, describe, expect, it } from "vitest";

describe("Markdown content components", async () => {
  await setup({ rootDir: fileURLToPath(new URL("../..", import.meta.url)), browser: true });

  let page: Awaited<ReturnType<typeof createPage>>;
  afterEach(async () => {
    await page.close();
  });

  it.each([
    { name: "server-rendered", javaScriptEnabled: false },
    { name: "hydrated", javaScriptEnabled: true },
  ])("renders Markdown props and slots ($name)", async ({ javaScriptEnabled }) => {
    page = await createPage(undefined, { javaScriptEnabled });
    const diagnostics: string[] = [];
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type())) diagnostics.push(message.text());
    });
    page.on("pageerror", error => diagnostics.push(error.message));
    const waitUntil = javaScriptEnabled ? "hydration" : "domcontentloaded";
    await page.goto(url("/docs/essentials/prose-components"), { waitUntil });
    const body = page.locator(".prose-content");
    const callout = body.getByRole("alert").filter({ hasText: "This is a callout with full markdown support." });
    expect(await callout.locator("[data-slot=alert-title]").allTextContents()).toEqual(["Note"]);
    expect(await callout.locator("[data-slot=alert-description]").innerText()).toBe("This is a callout with full markdown support.");
    expect(await callout.locator("strong").innerText()).toBe("markdown");
    expect(await callout.locator("code").innerText()).toBe("callout");
    expect(await page.locator("article aside").getByRole("link", { name: "Note", exact: true }).count()).toBe(0);
    const preview = callout.locator("xpath=ancestor::div[.//pre][1]");
    const slots = await preview.evaluate((element) => {
      const regions = [...element.children];
      return {
        preview: regions.findIndex(region => region.querySelector("[role=alert]")),
        code: regions.findIndex(region => region.querySelector("pre")),
      };
    });
    expect(slots.preview).toBeGreaterThanOrEqual(0);
    expect(slots.code).toBeGreaterThan(slots.preview);
    expect(await preview.locator("pre").innerText()).toContain("::callout{title=\"Note\"}");
    expect(await preview.locator("pre").innerText()).toContain("**markdown**");
    const badge = body.locator("[data-slot=badge]").filter({ hasText: "v3.0.0-alpha.10" });
    const labelledPreview = badge.locator("xpath=ancestor::div[.//pre][1]");
    expect(await labelledPreview.getByText("Preview", { exact: true }).innerText()).toBe("Preview");
    expect(await badge.locator("strong").innerText()).toBe("v3.0.0-alpha.10");
    expect(await labelledPreview.locator("pre").innerText()).toContain("**v3.0.0-alpha.10**");

    await page.goto(url("/docs/getting-started/usage"), { waitUntil });
    const tip = body.getByRole("alert");
    expect(await tip.locator("[data-slot=alert-description]").innerText()).toBe("Learn more on how to take the most out of Stackhacker UI!");
    expect(await tip.getByRole("link", { name: "Learn more", exact: true }).getAttribute("href")).toBe("https://ui.stackhacker.io/docs/getting-started");

    await page.goto(url("/blog/animals"), { waitUntil });
    await page.waitForFunction(() => [...document.querySelectorAll<HTMLLinkElement>("link[rel=stylesheet]")].every(link => link.sheet));
    const cards = page.locator(".prose-content > div:has(img)");
    const images = ["Lion", "monkey", "wolf", "Bears", "sea", "human", "marsh", "desert", "Jaguars", "humans"];
    expect(await cards.count()).toBe(images.length);
    for (const [index, alt] of images.entries()) {
      const card = cards.nth(index);
      const regions = card.locator(":scope > div > div");
      expect(await regions.count()).toBe(2);
      expect(await regions.nth(0).getByRole("img", { name: alt, exact: true }).count()).toBe(1);
      expect((await regions.nth(1).innerText()).trim()).not.toBe("");
      expect(await card.evaluate(element => Number.parseFloat(getComputedStyle(element).borderTopWidth))).toBeGreaterThan(0);
    }
    expect(await cards.nth(0).locator("strong").innerText()).toBe("Tigers");
    expect(await cards.nth(1).locator("strong").innerText()).toBe("Monkeys");
    expect(diagnostics).toEqual([]);
  });

  it("keeps Markdown anchors and Docs navigation client-side and fits mobile content", async () => {
    page = await createPage("/docs/essentials/prose-components");
    const timeOrigin = await page.evaluate(() => performance.timeOrigin);
    await page.locator("article aside").getByRole("link", { name: "Callout", exact: true }).click();
    await page.waitForURL(url("/docs/essentials/prose-components#callout"));
    expect(await page.locator(".prose-content #callout").count()).toBe(1);
    await page.getByRole("link", { name: "Usage", exact: true }).click();
    await page.waitForURL(url("/docs/getting-started/usage"));
    await page.getByRole("heading", { name: "Usage", exact: true, level: 1 }).waitFor();
    expect(await page.locator(".prose-content").getByRole("alert").innerText()).toContain("Learn more");
    await page.getByRole("link", { name: "Prose Components", exact: true }).click();
    await page.waitForURL(url("/docs/essentials/prose-components"));
    await page.getByRole("heading", { name: "Prose Components", exact: true, level: 1 }).waitFor();
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin);
    await page.setViewportSize({ width: 390, height: 844 });
    const callout = page.locator(".prose-content").getByRole("alert").filter({ hasText: "This is a callout with full markdown support." });
    expect(await callout.locator("[data-slot=alert-title]").innerText()).toBe("Note");
    expect(await callout.evaluate(element => element.getBoundingClientRect().right <= innerWidth)).toBe(true);
  });
});
