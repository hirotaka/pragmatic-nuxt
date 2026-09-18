import type { Page } from "@playwright/test";

export async function waitForNuxtHydration(page: Page) {
  await page.waitForFunction(() => window.useNuxtApp?.().isHydrating === false);
}

export async function gotoWithSsrHtml(page: Page, url: string) {
  const response = await page.request.get(new URL(url, page.url()).href);
  if (!response.ok()) {
    throw new Error(`SSR request to ${url} failed with status ${response.status()}`);
  }

  const html = await response.text();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await waitForNuxtHydration(page);

  return { html, status: response.status() };
}
