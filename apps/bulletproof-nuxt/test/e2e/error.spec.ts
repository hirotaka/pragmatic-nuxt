import { test, expect } from "@nuxt/test-utils/playwright";
import { createTeam, createAccount } from "~~/test/e2e/support/factories";
import { login } from "~~/test/e2e/support/authentication";
import { waitForNuxtHydration } from "~~/test/e2e/support/nuxtNavigation";

test("not-found page sets safe metadata and recovers to home", async ({ page, baseURL }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "not-found-recovery", team.id, "ADMIN");
  await login(page.request, baseURL, account);
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
  await expect(page.getByRole("heading", { name: "Bulletproof Nuxt", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Get started" })).toBeVisible();
  await waitForNuxtHydration(page);
  await page.getByRole("button", { name: "Get started" }).click();
  await expect(page).toHaveURL("/app");
  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
});

test("an injected API failure shows a safe error page and allows returning to the workspace", async ({ page, baseURL }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "api-error-recovery", team.id, "ADMIN");
  await login(page.request, baseURL, account);
  await page.goto("/app", { waitUntil: "networkidle" });
  await page.route(/\/api\/discussions(?:\?.*)?$/, async route => route.fulfill({
    status: 500,
    contentType: "application/json",
    body: JSON.stringify({ message: "Internal database connection failed" }),
  }));

  await page.getByRole("link", { name: "Discussions" }).click();

  await expect(page.getByRole("heading", { name: "500" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Something Went Wrong" })).toBeVisible();
  await expect(page.locator("[data-sonner-toast][data-type=error]")).toHaveCount(0);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByText("Something went wrong. Please try again.")).toBeVisible();
  await expect(page.getByText("Internal database connection failed")).toHaveCount(0);
  await expect(page).toHaveTitle(/Something Went Wrong/);
  await expect(page).not.toHaveTitle(/Internal database connection failed/);
  await expect(page.locator("meta[name=\"description\"]"))
    .toHaveAttribute("content", "Something went wrong. Please try again.");
  await page.getByRole("button", { name: "Go to Home" }).click();
  await expect(page).toHaveURL("/");
  await expect(page).toHaveTitle("Bulletproof Nuxt");
  await expect(page.getByRole("heading", { name: "Bulletproof Nuxt", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Get started" })).toBeVisible();
  await waitForNuxtHydration(page);
  await page.getByRole("button", { name: "Get started" }).click();
  await expect(page).toHaveURL("/app");
  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
});
