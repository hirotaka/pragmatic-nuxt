import { expect, test } from "@nuxt/test-utils/playwright";
import { waitForNuxtHydration } from "./support/nuxt-navigation";

test("an authenticated session survives a cold protected deep link", async ({ page, goto }) => {
  await goto("/app/discussions?page=2", { waitUntil: "hydration" });
  await waitForNuxtHydration(page);

  expect(new URL(page.url()).pathname).toBe("/app/discussions");
  expect(new URL(page.url()).searchParams.get("page")).toBe("2");
  await expect(page.getByRole("heading", { name: "Discussions" })).toBeVisible();
});

test("an anonymous protected deep link preserves its full return path", async ({ page, goto }) => {
  await page.context().clearCookies();
  await goto("/app/discussions?page=2", { waitUntil: "hydration" });

  await expect(page).toHaveURL(/\/auth\/login/);
  const url = new URL(page.url());
  expect(url.searchParams.get("redirectTo")).toBe("/app/discussions?page=2");
});

test("provider logout clears the server-backed session", async ({ page, goto }) => {
  await goto("/app", { waitUntil: "hydration" });
  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign Out" }).click();
  await page.waitForURL(/\/auth\/login\?redirectTo=/);

  const response = await page.request.get(new URL("/api/_auth/session", page.url()).href);
  expect(response.ok()).toBe(true);
  expect(await response.json()).not.toHaveProperty("user");
});
