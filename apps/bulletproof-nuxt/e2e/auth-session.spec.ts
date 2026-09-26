import { expect, test } from "@nuxt/test-utils/playwright";
import { waitForNuxtHydration } from "./support/nuxt-navigation";

test("login validation is lazy until blur and updates while editing", async ({ page, goto }) => {
  await page.context().clearCookies();
  await goto("/auth/login", { waitUntil: "hydration" });

  const email = page.getByLabel("Email Address");
  const password = page.getByLabel("Password");

  await email.fill("not-an-email");
  await expect(email).not.toHaveAttribute("aria-invalid", "true");
  await expect(password).not.toHaveAttribute("aria-invalid", "true");

  await page.getByRole("heading", { name: "Welcome back" }).click();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(password).not.toHaveAttribute("aria-invalid", "true");

  await email.fill("user@example.com");
  await expect(email).not.toHaveAttribute("aria-invalid", "true");
});

test("failed login shows a styled Sonner toast that can be dismissed", async ({ page, goto }) => {
  await page.context().clearCookies();
  await goto("/auth/login", { waitUntil: "hydration" });

  await page.getByLabel("Email Address").fill("missing@example.com");
  await page.getByLabel("Password").fill("MissingPassword123!");
  await page.getByRole("button", { name: "Log in" }).click();

  const toast = page.locator("[data-sonner-toast][data-type=error]");
  await expect(toast).toContainText("Invalid email or password");
  const toaster = page.locator("[data-sonner-toaster]");
  await expect(toaster).toHaveAttribute("data-y-position", "top");
  await expect(toaster).toHaveAttribute("data-x-position", "right");
  await expect.poll(() => toast.evaluate(element => getComputedStyle(element).backgroundColor))
    .not.toBe("rgba(0, 0, 0, 0)");

  await toast.getByRole("button", { name: "Close toast" }).click();
  await expect(toast).toHaveCount(0);
});

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
