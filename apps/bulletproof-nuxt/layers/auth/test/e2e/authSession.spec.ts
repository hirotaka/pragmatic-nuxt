import { expect, test } from "@nuxt/test-utils/playwright";
import { createTeam, createAccount } from "~~/test/e2e/support/factories";
import { login } from "~~/test/e2e/support/authentication";

test("failed login shows a styled Sonner toast that can be dismissed", async ({ page, baseURL, goto }) => {
  const team = await createTeam(baseURL);
  const { user } = await createAccount(baseURL, "failed-login", team.id, "ADMIN");
  await page.context().clearCookies();
  await goto("/auth/login", { waitUntil: "hydration" });
  await expect(page.getByRole("link", { name: "Bulletproof Nuxt home" })).toBeVisible();
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("banner").getByRole("link", { name: "Bulletproof Nuxt home" })).toBeVisible();

  await page.getByLabel("Email Address").fill(user.email);
  await page.getByLabel("Password").fill("WrongPassword123!");
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

test("an authenticated session survives a cold protected deep link", async ({ page, baseURL, goto }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "cold-deep-link", team.id, "ADMIN");
  await login(page.request, baseURL, account);
  const response = await page.request.get(new URL("/api/_auth/session", baseURL).href);
  expect(response.status()).toBe(200);
  const session = await response.json();
  expect(session.user).toMatchObject({ id: account.user.id, email: account.user.email, teamId: team.id, role: "ADMIN" });
  expect(session.user).not.toHaveProperty("password");

  await goto("/app/discussions?page=2", { waitUntil: "hydration" });

  expect(new URL(page.url()).pathname).toBe("/app/discussions");
  expect(new URL(page.url()).searchParams.get("page")).toBe("2");
  await expect(page.getByRole("heading", { name: "Discussions" })).toBeVisible();
});

test("an unauthenticated deep link returns to its full path after UI login", async ({ page, baseURL, goto }) => {
  const team = await createTeam(baseURL);
  const { user, password } = await createAccount(baseURL, "login-return-path", team.id, "ADMIN");
  await page.context().clearCookies();
  await goto("/app/discussions?page=2", { waitUntil: "hydration" });

  await expect(page).toHaveURL(/\/auth\/login/);
  const url = new URL(page.url());
  expect(url.searchParams.get("redirectTo")).toBe("/app/discussions?page=2");

  // Login is the action under test; do not prepare its cookie through the API.
  await page.getByLabel("Email Address").fill(user.email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL("/app/discussions?page=2");
  await expect(page.getByRole("heading", { name: "Discussions" })).toBeVisible();
});

test("logout clears the server-backed session and prevents reopening a protected deep link", async ({ page, baseURL, goto }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "logout", team.id, "ADMIN");
  await login(page.request, baseURL, account);
  await goto("/app", { waitUntil: "hydration" });
  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign Out" }).click();
  await page.waitForURL(/\/auth\/login\?redirectTo=/);

  const response = await page.request.get(new URL("/api/_auth/session", page.url()).href);
  expect(response.ok()).toBe(true);
  expect(await response.json()).not.toHaveProperty("user");

  // Re-enter through the server without manually clearing the logout cookie state.
  await goto("/app/discussions?page=2", { waitUntil: "hydration" });

  await expect(page).toHaveURL(/\/auth\/login/);
  const url = new URL(page.url());
  expect(url.searchParams.get("redirectTo")).toBe("/app/discussions?page=2");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});
