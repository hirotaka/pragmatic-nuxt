import { test, expect } from "@nuxt/test-utils/playwright";

test("not-found page sets safe metadata", async ({ page }) => {
  const response = await page.goto("/missing-page-for-error-test");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
  await expect(page).toHaveTitle(/Page Not Found/);
  await expect(page.locator("meta[name=\"description\"]"))
    .toHaveAttribute("content", "Sorry, we couldn't find the page you're looking for.");
});

test("server error page keeps internal details out of metadata", async ({ page }) => {
  await page.goto("/app", { waitUntil: "networkidle" });
  await page.route(/\/api\/discussions(?:\?.*)?$/, async route => route.fulfill({
    status: 500,
    contentType: "application/json",
    body: JSON.stringify({ message: "Internal database connection failed" }),
  }));

  await page.getByRole("link", { name: "Discussions" }).click();

  await expect(page.getByRole("heading", { name: "Something Went Wrong" })).toBeVisible();
  await expect(page.getByText("Internal database connection failed")).toBeVisible();
  await expect(page).toHaveTitle(/Something Went Wrong/);
  await expect(page.locator("meta[name=\"description\"]"))
    .toHaveAttribute("content", "Something went wrong. Please try again.");
});
