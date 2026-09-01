import { request as playwrightRequest, type Page } from "@playwright/test";
import { expect, test } from "@nuxt/test-utils/playwright";
import { expectCreatedResponse, expectJson } from "./support/api-response";
import { gotoWithSsrHtml, waitForNuxtHydration } from "./support/nuxt-navigation";

const password = "Password123!";

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function registerIsolatedAccount(page: Page, label: string, teamId?: string) {
  const unique = `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const teamName = teamId ? null : `Boundary ${unique}`;
  const request = await playwrightRequest.newContext({
    baseURL: new URL(page.url()).origin,
  });

  try {
    await expectCreatedResponse(await request.post("/api/auth/register", {
      data: {
        email: `${unique}@example.com`,
        firstName: "Boundary",
        lastName: "Evidence",
        password,
        teamId: teamId ?? null,
        teamName,
      },
    }));
    const session: unknown = await expectJson(await request.get("/api/_auth/session"));
    if (
      !isApiRecord(session)
      || !isApiRecord(session.user)
      || typeof session.user.id !== "string"
      || typeof session.user.teamId !== "string"
    ) {
      throw new Error("Test setup failed: registered account has an invalid session user");
    }

    return {
      request,
      teamName,
      user: {
        id: session.user.id,
        email: `${unique}@example.com`,
        teamId: session.user.teamId,
      },
    };
  }
  catch (error) {
    await request.dispose();
    throw error;
  }
}

test("registration page SSR-renders an existing team and allows selecting it", { tag: ["@registration", "@ssr"] }, async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const account = await registerIsolatedAccount(page, "registration-teams");

  try {
    if (account.teamName === null) {
      throw new Error("Test setup failed: isolated account did not create a Team");
    }

    await page.context().clearCookies();
    let browserTeamsGets = 0;
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (request.method() === "GET" && url.pathname === "/api/teams") {
        browserTeamsGets += 1;
      }
    });
    const { html, status } = await gotoWithSsrHtml(page, "/auth/register");
    expect(status).toBe(200);
    expect(html).toContain(account.teamName);
    await expect(page).toHaveURL(/\/auth\/register$/);
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();

    await page.getByLabel("Join existing team").check();
    const teamSelect = page.getByLabel("Team", { exact: true });
    await expect(teamSelect).toBeVisible();
    await expect(teamSelect.locator("option", { hasText: account.teamName })).toHaveCount(1);

    await teamSelect.selectOption(account.user.teamId);
    await expect(teamSelect).toHaveValue(account.user.teamId);
    expect(browserTeamsGets).toBe(0);
  }
  finally {
    await account.request.dispose();
  }
});

test("registration keeps only new-team creation when Teams is empty", { tag: ["@registration", "@empty"] }, async ({ page }) => {
  await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
  await waitForNuxtHydration(page);
  await page.route("**/api/teams", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      body: "[]",
    });
  });

  await page.getByRole("link", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/auth\/register$/);
  await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  await expect(page.getByLabel("Join existing team")).toHaveCount(0);
});

test("registration keeps the form hidden while the Teams read is pending", { tag: ["@registration", "@pending"] }, async ({ page }) => {
  await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
  await waitForNuxtHydration(page);

  const responseRelease = deferred<undefined>();
  let teamsGetCount = 0;
  let registrationPostCount = 0;
  await page.route("**/api/teams", async (route) => {
    teamsGetCount += 1;
    await responseRelease.promise;
    await route.fulfill({
      contentType: "application/json",
      body: "[]",
    });
  });
  await page.route("**/api/auth/register", async (route) => {
    registrationPostCount += 1;
    await route.continue();
  });

  await page.getByRole("link", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/auth\/register$/);
  await expect.poll(() => teamsGetCount).toBe(1);
  await expect(page.getByRole("status", { name: "Loading teams" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Register" })).toHaveCount(0);
  expect(registrationPostCount).toBe(0);

  responseRelease.resolve(undefined);
  await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  expect(registrationPostCount).toBe(0);
});

test("registration shows one notification after bounded Teams retries are exhausted", { tag: ["@registration", "@error"] }, async ({ page }) => {
  await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
  await waitForNuxtHydration(page);
  let teamsAttempts = 0;
  await page.route("**/api/teams", async (route) => {
    teamsAttempts += 1;

    if (teamsAttempts <= 3) {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Teams unavailable" }),
      });
      return;
    }

    await route.continue();
  });

  let registrationPostCount = 0;
  await page.route("**/api/auth/register", async (route) => {
    registrationPostCount += 1;
    await route.continue();
  });

  await page.getByRole("link", { name: "Register" }).click();
  await expect(page).toHaveURL(/\/auth\/register$/);
  await expect(page.getByText("Teams could not be loaded.")).toBeVisible();
  await expect(page.getByRole("alert", { name: "Error" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Register" })).toHaveCount(0);
  expect(registrationPostCount).toBe(0);
  expect(teamsAttempts).toBe(3);

  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByRole("button", { name: "Register" })).toBeVisible();
  expect(teamsAttempts).toBe(4);
});
