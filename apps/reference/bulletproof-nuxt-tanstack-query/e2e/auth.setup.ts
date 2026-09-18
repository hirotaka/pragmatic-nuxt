import { test as setup } from "@nuxt/test-utils/playwright";
import { createUser } from "../test/data-generators";
import { waitForNuxtHydration } from "./support/nuxt-navigation";

const authFile = "e2e/.auth/user.json";

setup("authenticate", async ({ page, goto }) => {
  const user = createUser({
    firstName: "E2E",
    lastName: "Admin",
    email: `e2e-admin-${Date.now()}@example.com`,
    password: "Password123!",
    teamName: `E2E Team ${Date.now()}`,
  });

  await goto("/auth/register", { waitUntil: "hydration" });

  // registration:
  await page.getByLabel("First Name").click();
  await page.getByLabel("First Name").fill(user.firstName);
  await page.getByLabel("Last Name").click();
  await page.getByLabel("Last Name").fill(user.lastName);
  await page.getByLabel("Email Address").click();
  await page.getByLabel("Email Address").fill(user.email);
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill(user.password);
  await page.getByLabel("Team Name").click();
  await page.getByLabel("Team Name").fill(user.teamName);
  await page.getByRole("button", { name: "Register" }).click();
  await page.waitForURL("/app");
  await waitForNuxtHydration(page);

  // log out:
  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign Out" }).click();
  await page.waitForURL("/auth/login?redirectTo=%2Fapp");

  // log in:
  await page.getByLabel("Email Address").click();
  await page.getByLabel("Email Address").fill(user.email);
  await page.getByLabel("Password").click();
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("/app");
  await waitForNuxtHydration(page);

  await page.context().storageState({ path: authFile });
});
