import type { Page } from "@playwright/test";

export async function waitForNuxtHydration(page: Page) {
  await page.waitForFunction(() => window.useNuxtApp?.().isHydrating === false);
}

export async function gotoWithSsrHtml(page: Page, url: string) {
  const response = await page.goto(url, { waitUntil: "domcontentloaded" });
  if (!response?.ok()) {
    throw new Error(`SSR request to ${url} failed with status ${response?.status() ?? "no response"}`);
  }

  const html = await response.text();
  await waitForNuxtHydration(page);

  return { html, status: response.status() };
}
