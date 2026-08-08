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
      || typeof session.user.email !== "string"
      || typeof session.user.teamId !== "string"
    ) {
      throw new Error("Test setup failed: registered account has an invalid session user");
    }

    return {
      request,
      teamName,
      user: {
        id: session.user.id,
        email: session.user.email,
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
  await row.getByRole("button", { name: "Delete User", exact: true }).click();
  return page.getByRole("dialog", { name: "Delete User" });
}

test("direct users collection is SSR-rendered without a hydration GET", { tag: ["@users", "@ssr"] }, async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const users = await expectJson(await page.request.get(new URL("/api/users", page.url()).href));
  expect(Array.isArray(users)).toBe(true);
  expect(users).not.toHaveProperty("data");
  const session: unknown = await expectJson(await page.request.get(new URL("/api/_auth/session", page.url()).href));
  if (!isApiRecord(session) || !isApiRecord(session.user) || typeof session.user.email !== "string") {
    throw new Error("Test setup failed: current session has no user email");
  }
  const email = session.user.email;
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

test("user delete stays pending until its users refresh settles", { tag: ["@users", "@mutation-refresh"] }, async ({ page, goto }) => {
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

  await expect.poll(() => refreshGetCount).toBe(1);
  await expect(page.locator("table").getByText(member.email)).toBeVisible();
  await expect(page.getByLabel("User Deleted")).toHaveCount(1);
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Delete User" })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();

  refresh.resolve();
  await expect(dialog).toBeHidden();
  await expect(page.getByText(member.email)).toHaveCount(0);
});
