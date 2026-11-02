import { expect, test } from "@nuxt/test-utils/playwright";
import { createTeam, createAccount } from "~~/test/e2e/support/factories";
import { login } from "~~/test/e2e/support/authentication";
import { waitForNuxtHydration } from "~~/test/e2e/support/nuxtNavigation";

test("an admin can cancel then delete a teammate and keep the deletion after reload", { tag: ["@users", "@mutation-refresh"] }, async ({ page, baseURL, goto }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "user-directory", team.id, "ADMIN");
  const { user: admin } = account;
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);
  const { user: member } = await createAccount(baseURL, "deletable-member", admin.teamId, "USER");

  await goto("/app", { waitUntil: "hydration" });
  await page.getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Users", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/users$/);
  await expect(page.getByRole("heading", { name: "Users", exact: true })).toBeVisible();
  const table = page.getByRole("table");
  const memberRow = table.getByRole("row").filter({ hasText: member.email });
  await expect(table.getByText(admin.email, { exact: true })).toBeVisible();
  await expect(memberRow).toBeVisible();

  await memberRow.getByRole("button", { name: /Open user actions for/ }).click();
  await page.getByRole("menuitem", { name: "Delete User" }).click();
  const dialog = page.getByRole("alertdialog", { name: "Delete User" });
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(memberRow).toBeVisible();

  await memberRow.getByRole("button", { name: /Open user actions for/ }).click();
  await page.getByRole("menuitem", { name: "Delete User" }).click();
  await dialog.getByRole("button", { name: "Delete User", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator("[data-sonner-toast][data-type=success]", { hasText: "User Deleted" })).toHaveCount(1);
  await expect(memberRow).toHaveCount(0);
  await expect(table.getByText(admin.email, { exact: true })).toBeVisible();

  await page.reload();
  await waitForNuxtHydration(page);
  await expect(memberRow).toHaveCount(0);
  await expect(table.getByText(admin.email, { exact: true })).toBeVisible();
});
