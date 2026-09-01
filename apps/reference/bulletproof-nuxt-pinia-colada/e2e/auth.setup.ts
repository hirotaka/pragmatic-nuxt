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

  await goto("/auth/register", { waitUntil: "domcontentloaded" });
  await waitForNuxtHydration(page);

  // registration:
  await page.locator("input[name=\"firstName\"]").fill(user.firstName);
  await page.locator("input[name=\"lastName\"]").fill(user.lastName);
  await page.locator("input[name=\"email\"]").fill(user.email);
  await page.locator("input[name=\"password\"]").fill(user.password);
  await page.locator("input[name=\"teamName\"]").fill(user.teamName);
  await page.getByRole("button", { name: "Register" }).click();
  await page.waitForURL("/app");
  await waitForNuxtHydration(page);

  // log out:
  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign Out" }).click();
  await page.waitForURL("/");
  await page.goto("/auth/login?redirectTo=%2Fapp");

  // log in:
  await page.locator("input[name=\"email\"]").fill(user.email);
  await page.locator("input[name=\"password\"]").fill(user.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL("/app");
  await waitForNuxtHydration(page);

  await page.context().storageState({ path: authFile });
});
