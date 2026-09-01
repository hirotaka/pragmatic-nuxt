import { expect, test } from "@nuxt/test-utils/playwright";
import { createUser } from "../test/data-generators";
import { expectJson } from "./support/api-response";
import { waitForNuxtHydration } from "./support/nuxt-navigation";

test("registration and login establish a browser session before redirecting", { tag: ["@auth", "@mutation"] }, async ({ page }) => {
  const user = createUser({
    email: `auth-mutation-${Date.now()}@example.com`,
    password: "Password123!",
    teamName: `Auth Mutation Team ${Date.now()}`,
  });

  await page.context().clearCookies();
  await page.goto("/auth/register", { waitUntil: "domcontentloaded" });
  await waitForNuxtHydration(page);
  await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  await page.locator("input[name=firstName]").fill(user.firstName);
  await page.locator("input[name=lastName]").fill(user.lastName);
  await page.locator("input[name=email]").fill(user.email);
  await page.locator("input[name=password]").fill(user.password);
  await page.locator("input[name=teamName]").fill(user.teamName);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByRole("alert", { name: "Account Created" })).toBeVisible();
  await expect(page).toHaveURL(/\/app$/);

  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign Out" }).click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/auth/login?redirectTo=%2Fapp%2Fdiscussions%2F123", { waitUntil: "domcontentloaded" });
  let loginPosts = 0;
  await page.route("**/api/auth/login", async (route) => {
    loginPosts += 1;
    await route.continue();
  });
  await page.locator("input[name=email]").fill(user.email);
  await page.locator("input[name=password]").fill(user.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("alert", { name: "Logged In" })).toBeVisible();
  await expect(page).toHaveURL(/\/app\/discussions\/123$/);
  expect(loginPosts).toBe(1);

  const session = await page.request.get("/api/_auth/session");
  const sessionBody = await expectJson(session);
  expect(sessionBody.user).toMatchObject({
    id: expect.any(String),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: expect.any(String),
    teamId: expect.any(String),
  });
  expect(sessionBody.user).not.toHaveProperty("password");
});

test("reloads the current protected route after an authenticated 401", { tag: ["@auth", "@session"] }, async ({ page }) => {
  const user = createUser({
    email: `auth-session-${Date.now()}@example.com`,
    password: "Password123!",
    teamName: `Auth Session Team ${Date.now()}`,
  });

  await page.context().clearCookies();
  await page.goto("/auth/register", { waitUntil: "domcontentloaded" });
  await waitForNuxtHydration(page);
  await page.locator("input[name=firstName]").fill(user.firstName);
  await page.locator("input[name=lastName]").fill(user.lastName);
  await page.locator("input[name=email]").fill(user.email);
  await page.locator("input[name=password]").fill(user.password);
  await page.locator("input[name=teamName]").fill(user.teamName);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/app$/);

  let discussionRequests = 0;
  await page.route("**/api/discussions**", async (route) => {
    discussionRequests += 1;
    if (discussionRequests === 1) {
      await route.fulfill({ status: 401, body: JSON.stringify({ statusCode: 401, statusMessage: "Session expired" }) });
      return;
    }

    await route.continue();
  });

  const reload = page.waitForEvent("load");
  await page.getByRole("link", { name: "Discussions" }).click();
  await expect(page).toHaveURL(/\/app\/discussions$/);
  await reload;
  expect(discussionRequests).toBe(1);
});

test("reloads with fresh session state after the server session is invalidated", { tag: ["@auth", "@session"] }, async ({ page }) => {
  const user = createUser({
    email: `auth-invalidated-session-${Date.now()}@example.com`,
    password: "Password123!",
    teamName: `Invalidated Session Team ${Date.now()}`,
  });

  await page.context().clearCookies();
  await page.goto("/auth/register", { waitUntil: "domcontentloaded" });
  await waitForNuxtHydration(page);
  await page.locator("input[name=firstName]").fill(user.firstName);
  await page.locator("input[name=lastName]").fill(user.lastName);
  await page.locator("input[name=email]").fill(user.email);
  await page.locator("input[name=password]").fill(user.password);
  await page.locator("input[name=teamName]").fill(user.teamName);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/app$/);

  const clearResponse = await page.request.delete("/api/_auth/session");
  expect(clearResponse.ok()).toBe(true);

  const unauthorizedRequest = page.waitForResponse((response) => {
    return new URL(response.url()).pathname === "/api/discussions" && response.status() === 401;
  });
  await page.getByRole("link", { name: "Discussions" }).click();
  await unauthorizedRequest;

  await expect(page).toHaveURL(/\/auth\/login(?:\?|$)/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("auth pages render without executing mutations during SSR", { tag: ["@auth", "@ssr"] }, async ({ page }) => {
  await page.context().clearCookies();
  let loginPosts = 0;
  let registrationPosts = 0;
  page.on("request", (request) => {
    if (request.method() !== "POST") return;
    const pathname = new URL(request.url()).pathname;
    if (pathname === "/api/auth/login") loginPosts += 1;
    if (pathname === "/api/auth/register") registrationPosts += 1;
  });

  await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.goto("/auth/register", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  expect(loginPosts).toBe(0);
  expect(registrationPosts).toBe(0);
});
