import { request as playwrightRequest, type Page } from "@playwright/test";
import { expect, test } from "@nuxt/test-utils/playwright";
import { expectCreatedResponse, expectJson } from "./support/api-response";
import { gotoWithSsrHtml } from "./support/nuxt-navigation";

const password = "Password123!";

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

test("registration page SSR-renders an existing team and allows selecting it", { tag: ["@registration", "@ssr"] }, async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const account = await registerIsolatedAccount(page, "registration-teams");

  try {
    if (account.teamName === null) {
      throw new Error("Test setup failed: isolated account did not create a Team");
    }

    await page.context().clearCookies();
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
  }
  finally {
    await account.request.dispose();
  }
});
