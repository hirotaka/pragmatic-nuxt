import { test, expect } from "@nuxt/test-utils/playwright";

test("profile", async ({ page, goto }) => {
  // update user:
  await goto("/app", { waitUntil: "hydration" });
  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Your Profile" }).click();
  await page.getByRole("button", { name: "Update Profile" }).click();
  await page.getByLabel("Bio").click();
  await page.getByLabel("Bio").fill("My bio");
  await page.getByRole("button", { name: "Submit" }).click();
  await page
    .getByLabel("Profile Updated")
    .getByRole("button", { name: "Close" })
    .click();
  await expect(page.getByText("My bio")).toBeVisible();
});
