import { request as playwrightRequest, type Page } from "@playwright/test";
import { expect, test } from "@nuxt/test-utils/playwright";
import { waitForNuxtHydration } from "./support/nuxt-navigation";

const password = "Password123!";

async function createIsolatedAccount(page: Page, label: string) {
  const unique = `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = `${unique}@example.com`;
  const request = await playwrightRequest.newContext({ baseURL: new URL(page.url()).origin });

  const response = await request.post("/api/auth/register", {
    data: {
      email,
      firstName: "Session",
      lastName: "Boundary",
      password,
      teamId: null,
      teamName: `Session ${unique}`,
    },
  });
  expect(response.status()).toBe(201);
  await request.dispose();

  return { email, password };
}

async function login(page: Page, account: { email: string; password: string }) {
  await page.goto("/auth/login", { waitUntil: "networkidle" });
  await page.getByLabel("Email Address").fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Log In" }).click();
  await page.waitForURL(/\/app(?:\/)?$/);
}

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

test("terminal authenticated read failure refreshes the session and redirects after expiry", async ({ page, goto }) => {
  await goto("/app/discussions", { waitUntil: "hydration" });
  await expect(page.getByRole("heading", { name: "Discussions" })).toBeVisible();

  const clearResponse = await page.request.delete(new URL("/api/_auth/session", page.url()).href);
  expect(clearResponse.ok()).toBe(true);
  await page.getByRole("link", { name: "Users" }).click();

  await page.waitForURL(/\/auth\/login/);
  await expect(page.getByRole("heading", { name: "Users", exact: true })).toHaveCount(0);
});

test("logout and login do not reuse authenticated Query data", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const accountA = await createIsolatedAccount(page, "query-identity-a");
  const accountB = await createIsolatedAccount(page, "query-identity-b");
  await page.context().clearCookies();
  await login(page, accountA);

  const marker = `Only account A ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const createResponse = await page.request.post(new URL("/api/discussions", page.url()).href, {
    data: { title: marker, body: "Identity-scoped Query evidence" },
  });
  expect(createResponse.status()).toBe(201);
  await page.getByRole("link", { name: "Discussions" }).click();
  await expect(page.getByText(marker)).toBeVisible();

  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign Out" }).click();
  await page.waitForURL(/\/auth\/login/);
  await login(page, accountB);
  await page.getByRole("link", { name: "Discussions" }).click();

  await expect(page.getByRole("heading", { name: "Discussions" })).toBeVisible();
  await expect(page.getByText(marker)).toHaveCount(0);
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
