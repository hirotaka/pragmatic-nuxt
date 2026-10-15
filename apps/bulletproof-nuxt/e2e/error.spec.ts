import { test, expect } from "@nuxt/test-utils/playwright";
import { waitForNuxtHydration } from "./support/nuxt-navigation";

test("not-found page sets safe metadata and recovers to home", async ({ page }) => {
  const response = await page.goto("/missing-page-for-error-test");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page).toHaveTitle(/Page Not Found/);
  await expect(page.locator("meta[name=\"description\"]"))
    .toHaveAttribute("content", "Sorry, we couldn't find the page you're looking for.");
  await waitForNuxtHydration(page);
  await page.getByRole("button", { name: "Go to Home" }).click();
  await expect(page).toHaveURL("/");
  await expect(page).toHaveTitle("Bulletproof Nuxt");
  await page.waitForFunction(() => window.useNuxtApp?.().payload.error == null);
});

test("server error page keeps internal details out of visible text and metadata", async ({ page }) => {
  await page.goto("/app", { waitUntil: "networkidle" });
  await page.route(/\/api\/discussions(?:\?.*)?$/, async route => route.fulfill({
    status: 500,
    contentType: "application/json",
    body: JSON.stringify({ message: "Internal database connection failed" }),
  }));

  await page.getByRole("link", { name: "Discussions" }).click();

  await expect(page.getByRole("heading", { name: "Something Went Wrong" })).toBeVisible();
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByText("Something went wrong. Please try again.")).toBeVisible();
  await expect(page.getByText("Internal database connection failed")).toHaveCount(0);
  await expect(page).toHaveTitle(/Something Went Wrong/);
  await expect(page.locator("meta[name=\"description\"]"))
    .toHaveAttribute("content", "Something went wrong. Please try again.");
  await page.getByRole("button", { name: "Go to Home" }).click();
  await expect(page).toHaveURL("/");
  await expect(page).toHaveTitle("Bulletproof Nuxt");
  await page.waitForFunction(() => window.useNuxtApp?.().payload.error == null);
});
