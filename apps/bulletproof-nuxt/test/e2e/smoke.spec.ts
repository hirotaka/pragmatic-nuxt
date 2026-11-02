import { test, expect } from "@nuxt/test-utils/playwright";
import { createTeam, createAccount } from "~~/test/e2e/support/factories";
import { login } from "~~/test/e2e/support/authentication";

import { waitForNuxtHydration } from "~~/test/e2e/support/nuxtNavigation";

test("persists the discussion and comment lifecycle across reloads", async ({ page, baseURL, goto }) => {
  const discussion = { title: "Smoke discussion", body: "Smoke discussion body" };
  const comment = { body: "Smoke comment" };

  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "smoke", team.id, "ADMIN");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);
  await test.step("Enter the workspace", async () => {
    await goto("/", { waitUntil: "hydration" });
    await expect(page.locator("meta[name=\"description\"]")).toHaveAttribute("content", "Welcome to bulletproof nuxt");
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(0);
    await expect(page.getByRole("main")).toHaveCount(1);
    await page.getByRole("button", { name: "Get started" }).click();
    await page.waitForURL("/app");
    await waitForNuxtHydration(page);
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.locator("[data-slot=sidebar-inset] > header")).toHaveCount(1);
    await expect(page.locator("[data-slot=sidebar-inset] > main")).toHaveCount(1);
  });

  await test.step("Create a discussion and verify it survives reload", async () => {
    await page.getByRole("link", { name: "Discussions" }).click();
    await page.waitForURL("/app/discussions");
    await waitForNuxtHydration(page);

    await expect(page.getByRole("button", { name: "Create Discussion" })).toBeVisible();
    await page.getByRole("button", { name: "Create Discussion" }).click();
    const createDiscussionDrawer = page.getByRole("dialog", { name: "Create Discussion" });
    await expect(createDiscussionDrawer).toBeVisible();
    await createDiscussionDrawer.getByLabel("Title").click();
    await createDiscussionDrawer.getByLabel("Title").fill(discussion.title);
    await createDiscussionDrawer.getByLabel("Body").click();
    await createDiscussionDrawer.getByLabel("Body").fill(discussion.body);
    await createDiscussionDrawer.getByRole("button", { name: "Submit" }).click();
    await page
      .locator("[data-sonner-toast][data-type=success]", { hasText: "Discussion Created" })
      .getByRole("button", { name: "Close toast" })
      .click();
    await expect(page.getByText(discussion.title)).toBeVisible();
    await page.reload();
    await waitForNuxtHydration(page);
    await expect(page.getByText(discussion.title)).toBeVisible();
  });

  await test.step("Update the discussion and verify it survives reload", async () => {
    await page
      .getByRole("row")
      .filter({ hasText: discussion.title })
      .getByRole("link", { name: "View" })
      .click();

    await expect(page.getByText(discussion.body)).toBeVisible();

    await page.getByRole("button", { name: "Update Discussion" }).click();
    const updateDiscussionDrawer = page.getByRole("dialog", { name: "Update Discussion" });
    await expect(updateDiscussionDrawer).toBeVisible();
    await updateDiscussionDrawer.getByLabel("Title").click();
    await updateDiscussionDrawer.getByLabel("Title").fill(`${discussion.title} - updated`);
    await updateDiscussionDrawer.getByLabel("Body").click();
    await updateDiscussionDrawer.getByLabel("Body").fill(`${discussion.body} - updated`);
    await updateDiscussionDrawer.getByRole("button", { name: "Submit" }).click();
    await page
      .locator("[data-sonner-toast][data-type=success]", { hasText: "Discussion Updated" })
      .getByRole("button", { name: "Close toast" })
      .click();

    await expect(page.getByText(`${discussion.body} - updated`)).toBeVisible();
    await page.reload();
    await waitForNuxtHydration(page);
    await expect(page.getByText(`${discussion.body} - updated`)).toBeVisible();
  });

  await test.step("Create a comment and verify it survives reload", async () => {
    await page.getByRole("button", { name: "Create Comment" }).click();
    const createCommentDrawer = page.getByRole("dialog", { name: "Create Comment" });
    await expect(createCommentDrawer).toBeVisible();
    await createCommentDrawer.getByLabel("Body").click();
    await createCommentDrawer.getByLabel("Body").fill(comment.body);
    await createCommentDrawer.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText(comment.body)).toBeVisible();
    await page
      .locator("[data-sonner-toast][data-type=success]", { hasText: "Comment Created" })
      .getByRole("button", { name: "Close toast" })
      .click();
    await page.reload();
    await waitForNuxtHydration(page);
    await expect(page.getByText(comment.body)).toBeVisible();
  });

  await test.step("Delete the comment and verify it stays deleted after reload", async () => {
    await page.getByRole("button", { name: "Open comment actions" }).click();
    await page.getByRole("menuitem", { name: "Delete Comment" }).click();
    await expect(
      page.getByText("Are you sure you want to delete this comment?"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Delete Comment" }).click();
    await page
      .locator("[data-sonner-toast][data-type=success]", { hasText: "Comment Deleted" })
      .getByRole("button", { name: "Close toast" })
      .click();
    await expect(
      page.getByRole("heading", { name: "No Comments Found" }),
    ).toBeVisible();
    await expect(page.getByText(comment.body)).toBeHidden();
    await page.reload();
    await waitForNuxtHydration(page);
    await expect(
      page.getByRole("heading", { name: "No Comments Found" }),
    ).toBeVisible();
    await expect(page.getByText(comment.body)).toBeHidden();
  });

  await test.step("Delete the discussion and verify it stays deleted after reload", async () => {
    await page.getByRole("link", { name: "Discussions" }).click();
    await page.waitForURL("/app/discussions");
    await waitForNuxtHydration(page);

    const discussionRow = page
      .getByRole("row")
      .filter({ hasText: `${discussion.title} - updated` });
    await discussionRow
      .getByRole("button", { name: "Open discussion actions" })
      .click();
    await page.getByRole("menuitem", { name: "Delete Discussion" }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await page
      .locator("[data-sonner-toast][data-type=success]", { hasText: "Discussion Deleted" })
      .getByRole("button", { name: "Close toast" })
      .click();
    await expect(
      page.getByRole("heading", { name: "No Entries Found" }),
    ).toBeVisible();
    await page.reload();
    await waitForNuxtHydration(page);
    await expect(
      page.getByRole("heading", { name: "No Entries Found" }),
    ).toBeVisible();
    await expect(page.getByText(`${discussion.title} - updated`)).toBeHidden();
  });
});
