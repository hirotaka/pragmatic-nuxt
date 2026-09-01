import { request as playwrightRequest, type Page } from "@playwright/test";
import { expect, test } from "@nuxt/test-utils/playwright";
import { expectCreatedResponse, expectJson } from "./support/api-response";
import { gotoWithSsrHtml } from "./support/nuxt-navigation";

const password = "Password123!";

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

async function createSameTeamMember(page: Page, label: string) {
  const currentUser: unknown = await expectJson(await page.request.get(new URL("/api/_auth/session", page.url()).href));
  if (!isApiRecord(currentUser) || !isApiRecord(currentUser.user) || typeof currentUser.user.teamId !== "string") {
    throw new Error("Test setup failed: current user response has an invalid user.teamId");
  }

  const member = await registerIsolatedAccount(page, label, currentUser.user.teamId);

  try {
    return {
      id: member.user.id,
      email: member.user.email,
    };
  }
  finally {
    await member.request.dispose();
  }
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

async function openUserDeleteDialog(page: Page, email: string) {
  const row = page.getByRole("row").filter({ hasText: email });
  await row.getByRole("button", { name: `Open user actions for ${email}` }).click();
  await page.getByRole("menuitem", { name: "Delete User" }).click();
  return page.getByRole("dialog", { name: "Delete User" });
}

test("direct users collection is SSR-rendered without a hydration GET", { tag: ["@users", "@ssr"] }, async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const users = await expectJson(await page.request.get(new URL("/api/users", page.url()).href));
  expect(Array.isArray(users)).toBe(true);
  expect(users).not.toHaveProperty("data");
  const session: unknown = await expectJson(await page.request.get(new URL("/api/_auth/session", page.url()).href));
  if (!isApiRecord(session) || !isApiRecord(session.user) || typeof session.user.id !== "string") {
    throw new Error("Test setup failed: current session has no user id");
  }
  const email = (session.user as Record<string, unknown>).email;
  let browserUserGets = 0;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.method() === "GET" && url.pathname === "/api/users") {
      browserUserGets += 1;
    }
  });

  const { html } = await gotoWithSsrHtml(page, "/app/users");
  const documentHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  expect(documentHtml).toContain(email);
  await expect(page.getByText(email).first()).toBeVisible();
  expect(browserUserGets).toBe(0);
});

test("users SSR state remains isolated across sequential warm requests", { tag: ["@users", "@ssr", "@isolation"] }, async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const first = await registerIsolatedAccount(page, "users-isolation-a");
  const second = await registerIsolatedAccount(page, "users-isolation-b");
  const origin = new URL(page.url()).origin;
  const firstContext = await playwrightRequest.newContext({
    baseURL: origin,
    storageState: await first.request.storageState(),
  });
  const secondContext = await playwrightRequest.newContext({
    baseURL: origin,
    storageState: await second.request.storageState(),
  });

  try {
    const firstResponse = await firstContext.get("/app/users");
    const firstHtml = await firstResponse.text();
    const secondResponse = await secondContext.get("/app/users");
    const secondHtml = await secondResponse.text();

    expect(firstHtml).toContain(first.user.email);
    expect(firstHtml).not.toContain(second.user.email);
    expect(secondHtml).toContain(second.user.email);
    expect(secondHtml).not.toContain(first.user.email);
  }
  finally {
    await firstContext.dispose();
    await secondContext.dispose();
    await first.request.dispose();
    await second.request.dispose();
  }
});

test("user delete completes before its users synchronization settles", { tag: ["@users", "@mutation-refresh"] }, async ({ page, goto }) => {
  await goto("/app/users", { waitUntil: "hydration" });
  const member = await createSameTeamMember(page, "user-delete-refresh");
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.getByRole("table").getByText(member.email)).toBeVisible();

  const refresh = deferred();
  let deleteCommitted = false;
  let refreshGetCount = 0;
  page.on("response", (response) => {
    if (response.request().method() === "DELETE" && new URL(response.url()).pathname === `/api/users/${member.id}` && response.ok()) {
      deleteCommitted = true;
    }
  });
  await page.route(/\/api\/users(?:\?.*)?$/, async (route) => {
    if (deleteCommitted && route.request().method() === "GET") {
      refreshGetCount += 1;
      await refresh.promise;
    }
    await route.continue();
  });

  const dialog = await openUserDeleteDialog(page, member.email);
  await dialog.getByRole("button", { name: "Delete User" }).click();

  await expect.poll(() => refreshGetCount).toBeGreaterThan(0);
  await expect(page.getByLabel("User Deleted")).toHaveCount(1);
  await expect(dialog).toBeHidden();

  refresh.resolve();
  await expect(page.getByText(member.email)).toHaveCount(0);
});
