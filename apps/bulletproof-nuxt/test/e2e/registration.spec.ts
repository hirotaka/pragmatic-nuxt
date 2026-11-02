import { expect, test } from "@nuxt/test-utils/playwright";
import { registrationInput, createTeam } from "~~/test/e2e/support/factories";
import { gotoWithSsrHtml, waitForNuxtHydration } from "~~/test/e2e/support/nuxtNavigation";

test("registers a new team, logs out, and logs back in through the UI", { tag: ["@registration", "@auth"] }, async ({ page, goto }) => {
  const input = registrationInput();
  await page.context().clearCookies();
  await goto("/register", { waitUntil: "hydration" });

  // Registration creates the account under test; factories must not pre-save it.
  await page.getByLabel("First Name").fill(input.firstName);
  await page.getByLabel("Last Name").fill(input.lastName);
  await page.getByLabel("Email Address").fill(input.email);
  await page.getByLabel("Password").fill(input.password);
  await page.getByLabel("Team Name").fill(input.teamName);
  await page.getByRole("button", { name: "Register" }).click();

  await page.waitForURL("/app");
  await waitForNuxtHydration(page);
  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
  await expect(page.getByRole("main").getByText(input.email, { exact: true })).toBeVisible();

  // Verify logout prevents fresh access to the protected dashboard.
  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign Out" }).click();
  await page.waitForURL(url => url.pathname === "/auth/login" && url.searchParams.get("redirectTo") === "/app");
  await goto("/app", { waitUntil: "hydration" });
  await expect(page).toHaveURL(url => url.pathname === "/auth/login" && url.searchParams.get("redirectTo") === "/app");
  await expect(page.getByRole("heading", { name: "Welcome back", exact: true })).toBeVisible();

  // Login restores the same user and access to the protected dashboard.
  await page.getByLabel("Email Address").fill(input.email);
  await page.getByLabel("Password").fill(input.password);
  await page.getByRole("button", { name: "Log in" }).click();

  await page.waitForURL("/app");
  await waitForNuxtHydration(page);
  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
  await expect(page.getByRole("main").getByText(input.email, { exact: true })).toBeVisible();
});

test("registration page hydrates server-fetched teams without a browser GET and allows selecting one", { tag: ["@registration", "@ssr"] }, async ({ page, baseURL }) => {
  const team = await createTeam(baseURL);
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await page.context().clearCookies();
  let browserTeamGets = 0;
  page.on("request", (request) => {
    if (request.method() === "GET" && new URL(request.url()).pathname === "/api/teams") {
      browserTeamGets += 1;
    }
  });

  const { html, status } = await gotoWithSsrHtml(page, "/register");
  expect(status).toBe(200);
  // The initially hidden select receives server-fetched teams through the serialized payload.
  expect(html).toContain(team.name);
  await expect(page).toHaveURL(/\/register$/);
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Bulletproof Nuxt home" })).toBeVisible();
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("banner").getByRole("link", { name: "Bulletproof Nuxt home" })).toBeVisible();

  await page.getByLabel("Join existing team").check();
  const teamSelect = page.getByLabel("Team", { exact: true });
  await expect(teamSelect).toBeVisible();
  await expect(teamSelect.locator("option", { hasText: team.name })).toHaveCount(1);

  await teamSelect.selectOption(team.id);
  await expect(teamSelect).toHaveValue(team.id);
  expect(browserTeamGets).toBe(0);
});
