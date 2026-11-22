import { constants } from "node:fs";
import { copyFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createPage, setup, url } from "@nuxt/test-utils/e2e";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { e2eNuxtConfig } from "./nuxt-config";

const geometryImages: Record<string, [number, number]> = {
  "standalone.svg": [1200, 630],
  "thumbnail.svg": [286, 150],
  "wide.svg": [1200, 400],
  "square.svg": [400, 400],
  "landscape.svg": [600, 300],
};

describe("Markdown content components", async () => {
  const created: URL[] = [];
  beforeAll(async () => {
    for (const name of ["mdc-rendering", "mdc-navigation"]) {
      const target = new URL(`../../content/1.docs/${name}.md`, import.meta.url);
      await copyFile(new URL(`../fixtures/content/${name}.md`, import.meta.url), target, constants.COPYFILE_EXCL);
      created.push(target);
    }
  });
  afterAll(async () => {
    await Promise.all(created.map(target => unlink(target)));
  });

  await setup({ rootDir: fileURLToPath(new URL("../..", import.meta.url)), browser: true, nuxtConfig: e2eNuxtConfig });

  let page: Awaited<ReturnType<typeof createPage>>;
  afterEach(async () => {
    await page.close();
  });

  it.each([
    { name: "server-rendered", javaScriptEnabled: false },
    { name: "hydrated", javaScriptEnabled: true },
  ])("renders Markdown props and slots ($name)", async ({ javaScriptEnabled }) => {
    page = await createPage(undefined, { javaScriptEnabled });
    await page.route("https://images.example.test/**", route => route.fulfill({
      path: fileURLToPath(new URL("../fixtures/images/content.svg", import.meta.url)),
      contentType: "image/svg+xml",
    }));
    const diagnostics: string[] = [];
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type())) diagnostics.push(message.text());
    });
    page.on("pageerror", error => diagnostics.push(error.message));
    const waitUntil = javaScriptEnabled ? "hydration" : "domcontentloaded";
    await page.goto(url("/docs/mdc-rendering"), { waitUntil });
    const body = page.locator(".prose-content");
    const callout = body.getByRole("alert").filter({ hasText: "A formatted description with inline code." });
    expect(await callout.locator("[data-slot=alert-title]").allTextContents()).toEqual(["Fixture note"]);
    expect(await callout.locator("[data-slot=alert-description]").innerText()).toBe("A formatted description with inline code.");
    expect(await callout.locator("strong").innerText()).toBe("formatted");
    expect(await callout.locator("code").innerText()).toBe("code");
    expect(await page.locator("article aside").getByRole("link", { name: "Fixture note", exact: true }).count()).toBe(0);
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
    expect(await preview.locator("pre").innerText()).toContain("::callout{title=\"Fixture note\"}");
    expect(await preview.locator("pre").innerText()).toContain("**formatted**");
    const badge = body.locator("[data-slot=badge]").filter({ hasText: "Fixture badge" });
    const labelledPreview = badge.locator("xpath=ancestor::div[.//pre][1]");
    expect(await labelledPreview.getByText("Fixture preview", { exact: true }).innerText()).toBe("Fixture preview");
    expect(await badge.locator("strong").innerText()).toBe("Fixture badge");
    expect(await labelledPreview.locator("pre").innerText()).toContain("**Fixture badge**");

    const note = body.getByRole("alert").filter({ hasText: "Follow the documentation link." });
    expect(await note.locator("[data-slot=alert-description]").innerText()).toBe("Follow the documentation link.");
    expect(await note.getByRole("link", { name: "Learn more", exact: true }).getAttribute("href")).toBe("/docs/mdc-navigation");

    await page.waitForFunction(() => [...document.querySelectorAll<HTMLLinkElement>("link[rel=stylesheet]")].every(link => link.sheet));
    const cards = body.locator("[data-testid$='-card']");
    expect(await cards.count()).toBe(2);
    for (const [index, name] of ["First", "Second"].entries()) {
      const card = cards.nth(index);
      const regions = card.locator(":scope > div > div");
      expect(await regions.count()).toBe(2);
      expect(await regions.nth(0).getByRole("img", { name: `${name} card illustration`, exact: true }).count()).toBe(1);
      expect(await regions.nth(1).innerText()).toBe(`${name} card body.`);
      expect(await regions.nth(1).locator("strong").innerText()).toBe(`${name} card`);
      expect(await card.evaluate(element => Number.parseFloat(getComputedStyle(element).borderTopWidth))).toBeGreaterThan(0);
    }
    expect(await body.getByRole("img", { name: "Standalone illustration", exact: true }).getAttribute("loading")).toBe("eager");
    expect(await body.getByRole("img", { name: "Thumbnail illustration", exact: true }).getAttribute("loading")).toBe("lazy");
    expect(diagnostics).toEqual([]);
  });

  it.each([
    { width: 1365, height: 900 },
    { width: 390, height: 844 },
  ])("reserves standalone, thumbnail and flex-gallery image space before download ($width)", async ({ width, height }) => {
    page = await createPage();
    await page.setViewportSize({ width, height });
    const release = Promise.withResolvers<undefined>();
    await page.route("**/*", async (route) => {
      const request = route.request();
      if (request.resourceType() === "image") {
        await release.promise;
        const name = new URL(request.url()).pathname.replace(/^.*\//, "");
        const dimensions = geometryImages[name] ?? [640, 360];
        const [w, h] = dimensions;
        return route.fulfill({ contentType: "image/svg+xml", body: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#ddd"/></svg>` });
      }
      if (!request.url().startsWith(url("/"))) return route.abort();
      return route.continue();
    });
    try {
      await page.goto(url("/docs/mdc-rendering"), { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => Reflect.get(window, "useNuxtApp")?.().isHydrating === false);
      await page.waitForFunction(() => [...document.querySelectorAll<HTMLLinkElement>("link[rel=stylesheet]")].every(link => link.sheet));
      const images = page.locator(".prose-content img[src^='https://images.example.test/geometry/']");
      expect(await images.count()).toBe(Object.keys(geometryImages).length);
      const before = await images.evaluateAll(elements => elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }));
      for (const rect of before) {
        expect(rect.width).toBeGreaterThan(100);
        expect(rect.height).toBeGreaterThan(50);
      }
      release.resolve(undefined);
      await page.evaluate(() => {
        for (const image of document.images) image.loading = "eager";
      });
      await page.waitForFunction(() => [...document.images].every(image => image.complete));
      expect(await images.evaluateAll(elements => elements.every(element => element instanceof HTMLImageElement && element.naturalWidth > 0 && element.naturalHeight > 0))).toBe(true);
      const after = await images.evaluateAll(elements => elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }));
      expect(after).toEqual(before.map(rect => ({
        width: expect.closeTo(rect.width, 0),
        height: expect.closeTo(rect.height, 0),
      })));
    }
    finally {
      release.resolve(undefined);
      await page.unrouteAll({ behavior: "wait" });
    }
  });

  it("keeps Markdown anchors and Docs navigation client-side and fits mobile content", async () => {
    page = await createPage();
    await page.route("https://images.example.test/**", route => route.fulfill({
      path: fileURLToPath(new URL("../fixtures/images/content.svg", import.meta.url)),
      contentType: "image/svg+xml",
    }));
    await page.goto(url("/docs/mdc-rendering"), { waitUntil: "hydration" });
    const timeOrigin = await page.evaluate(() => performance.timeOrigin);
    await page.locator("article aside").getByRole("link", { name: "Card examples", exact: true }).click();
    await page.waitForURL(url("/docs/mdc-rendering#card-examples"));
    expect(await page.locator(".prose-content #card-examples").count()).toBe(1);
    await page.locator(".prose-content").getByRole("link", { name: "Learn more", exact: true }).click();
    await page.waitForURL(url("/docs/mdc-navigation"));
    await page.getByRole("heading", { name: "MDC navigation contract", exact: true, level: 1 }).waitFor();
    await page.getByRole("link", { name: "MDC rendering contract", exact: true }).click();
    await page.waitForURL(url("/docs/mdc-rendering"));
    await page.getByRole("heading", { name: "MDC rendering contract", exact: true, level: 1 }).waitFor();
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin);
    await page.setViewportSize({ width: 390, height: 844 });
    const callout = page.locator(".prose-content").getByRole("alert").filter({ hasText: "A formatted description with inline code." });
    expect(await callout.locator("[data-slot=alert-title]").innerText()).toBe("Fixture note");
    expect(await callout.evaluate(element => element.getBoundingClientRect().right <= innerWidth)).toBe(true);
  });
});
