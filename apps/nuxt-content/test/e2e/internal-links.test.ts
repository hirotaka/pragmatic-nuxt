import { fileURLToPath } from "node:url";
import { createPage, setup, url } from "@nuxt/test-utils/e2e";
import { describe, expect, it } from "vitest";
import { e2eNuxtConfig } from "./nuxt-config";

describe("internal link destinations", async () => {
  await setup({ rootDir: fileURLToPath(new URL("../..", import.meta.url)), browser: true, nuxtConfig: e2eNuxtConfig });

  it.each([
    { name: "server-rendered", javaScriptEnabled: false },
    { name: "hydrated", javaScriptEnabled: true },
  ])("resolves published Docs fragment links without reloading the document ($name)", async ({ javaScriptEnabled }) => {
    const page = await createPage(undefined, { javaScriptEnabled });
    try {
      await page.goto(url("/docs/essentials/code-blocks"), {
        waitUntil: javaScriptEnabled ? "hydration" : "domcontentloaded",
      });
      const fragments = await page.locator("article a[href^='#']").evaluateAll(links => links.map(link => link.getAttribute("href")));
      expect(fragments.length).toBeGreaterThan(0);
      for (const fragment of fragments) {
        expect(fragment).not.toBe("#");
        expect(await page.evaluate(hash => !!document.getElementById(decodeURIComponent(String(hash).slice(1))), fragment), String(fragment)).toBe(true);
      }
      const link = page.locator("article aside a[href^='#']").first();
      const fragment = await link.getAttribute("href");
      const timeOrigin = await page.evaluate(() => performance.timeOrigin);
      await link.click();
      await page.waitForURL(url(`/docs/essentials/code-blocks${fragment}`));
      expect(await page.evaluate(() => performance.timeOrigin)).toBe(timeOrigin);
    }
    finally {
      await page.close();
    }
  });

  it.each([
    { path: "/login", javaScriptEnabled: false, notice: "Demo UI only. This form does not sign you in." },
    { path: "/login", javaScriptEnabled: true, notice: "Demo UI only. This form does not sign you in." },
    { path: "/signup", javaScriptEnabled: false, notice: "Demo UI only. This form does not create an account." },
    { path: "/signup", javaScriptEnabled: true, notice: "Demo UI only. This form does not create an account." },
  ])("explains the auth demo without a misleading terms link ($path, JS=$javaScriptEnabled)", async ({ path, javaScriptEnabled, notice }) => {
    const page = await createPage(undefined, { javaScriptEnabled });
    try {
      await page.goto(url(path), {
        waitUntil: javaScriptEnabled ? "hydration" : "domcontentloaded",
      });
      const form = page.locator("main form");
      expect.soft(await form.getByRole("link", { name: "Terms of Service", exact: true }).count()).toBe(0);
      expect(await form.getByText(notice, { exact: true }).count()).toBe(1);
    }
    finally {
      await page.close();
    }
  });
});
