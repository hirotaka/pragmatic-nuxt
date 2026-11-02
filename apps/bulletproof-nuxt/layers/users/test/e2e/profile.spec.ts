import { test, expect } from "@nuxt/test-utils/playwright";
import { createTeam, createAccount } from "~~/test/e2e/support/factories";
import { login } from "~~/test/e2e/support/authentication";
import { waitForNuxtHydration } from "~~/test/e2e/support/nuxtNavigation";

test("updates the profile and user menu and preserves changes after reload", async ({ page, baseURL, goto }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "profile-update", team.id, "ADMIN");
  const { user } = account;
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);
  const updated = { firstName: "Updated", bio: "My updated profile bio" };
  const updatedName = `${updated.firstName} ${user.lastName}`;

  await goto("/app", { waitUntil: "hydration" });
  const userMenu = page.getByRole("button", { name: "Open user menu" });
  await expect(userMenu).toContainText(user.email);
  await userMenu.click();
  await page.getByRole("menuitem", { name: "Your Profile" }).click();
  await expect(page).toHaveURL(/\/app\/profile$/);
  await page.getByRole("button", { name: "Update Profile" }).click();
  const drawer = page.getByRole("dialog", { name: "Update Profile" });
  await drawer.getByLabel("First Name").fill(updated.firstName);
  await drawer.getByLabel("Bio").fill(updated.bio);
  await drawer.getByRole("button", { name: "Submit" }).click();

  await expect(drawer).toBeHidden();
  await page
    .locator("[data-sonner-toast][data-type=success]", { hasText: "Profile Updated" })
    .getByRole("button", { name: "Close toast" })
    .click();
  const profile = page.getByRole("main");
  await expect(profile.getByText(updated.firstName, { exact: true })).toBeVisible();
  await expect(profile.getByText(updated.bio, { exact: true })).toBeVisible();
  await expect(userMenu).toContainText(updatedName);

  await page.reload();
  await waitForNuxtHydration(page);
  await expect(profile.getByText(updated.firstName, { exact: true })).toBeVisible();
  await expect(profile.getByText(updated.bio, { exact: true })).toBeVisible();
  await expect(userMenu).toContainText(updatedName);
});
