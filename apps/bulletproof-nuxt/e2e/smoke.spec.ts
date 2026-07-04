import { test, expect } from "@nuxt/test-utils/playwright";

import {
  createDiscussion,
  createComment,
} from "../test/data-generators";

test("smoke", async ({ page, goto }) => {
  const discussion = createDiscussion();
  const comment = createComment();

  await goto("/", { waitUntil: "hydration" });
  await page.getByRole("button", { name: "Get started" }).click();
  await page.waitForURL("/app");

  // create discussion:
  await page.getByRole("link", { name: "Discussions" }).click();
  await page.waitForURL("/app/discussions");

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
    .getByLabel("Discussion Created")
    .getByRole("button", { name: "Close" })
    .click();
  await expect(page.getByText(discussion.title)).toBeVisible();
  await page.reload();
  await expect(page.getByText(discussion.title)).toBeVisible();

  // visit discussion page:
  await page.getByRole("link", { name: "View" }).click();

  await expect(page.getByText(discussion.body)).toBeVisible();

  // update discussion:
  await page.getByRole("button", { name: "Update Discussion" }).click();
  const updateDiscussionDrawer = page.getByRole("dialog", { name: "Update Discussion" });
  await expect(updateDiscussionDrawer).toBeVisible();
  await updateDiscussionDrawer.getByLabel("Title").click();
  await updateDiscussionDrawer.getByLabel("Title").fill(`${discussion.title} - updated`);
  await updateDiscussionDrawer.getByLabel("Body").click();
  await updateDiscussionDrawer.getByLabel("Body").fill(`${discussion.body} - updated`);
  await updateDiscussionDrawer.getByRole("button", { name: "Submit" }).click();
  await page
    .getByLabel("Discussion Updated")
    .getByRole("button", { name: "Close" })
    .click();

  await expect(page.getByText(`${discussion.body} - updated`)).toBeVisible();
  await page.reload();
  await expect(page.getByText(`${discussion.body} - updated`)).toBeVisible();

  // create comment:
  await page.getByRole("button", { name: "Create Comment" }).click();
  const createCommentDrawer = page.getByRole("dialog", { name: "Create Comment" });
  await expect(createCommentDrawer).toBeVisible();
  await createCommentDrawer.getByLabel("Body").click();
  await createCommentDrawer.getByLabel("Body").fill(comment.body);
  await createCommentDrawer.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText(comment.body)).toBeVisible();
  await page
    .getByLabel("Comment Created")
    .getByRole("button", { name: "Close" })
    .click();
  await page.reload();
  await expect(page.getByText(comment.body)).toBeVisible();

  // delete comment:
  await page.getByRole("button", { name: "Open comment actions" }).click();
  await page.getByRole("menuitem", { name: "Delete Comment" }).click();
  await expect(
    page.getByText("Are you sure you want to delete this comment?"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete Comment" }).click();
  await page
    .getByLabel("Comment Deleted")
    .getByRole("button", { name: "Close" })
    .click();
  await expect(
    page.getByRole("heading", { name: "No Comments Found" }),
  ).toBeVisible();
  await expect(page.getByText(comment.body)).toBeHidden();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "No Comments Found" }),
  ).toBeVisible();
  await expect(page.getByText(comment.body)).toBeHidden();

  // go back to discussions:
  await page.getByRole("link", { name: "Discussions" }).click();
  await page.waitForURL("/app/discussions");

  // delete discussion:
  await page.getByRole("button", { name: "Open discussion actions" }).click();
  await page.getByRole("menuitem", { name: "Delete Discussion" }).click();
  await page.getByRole("button", { name: "Delete Discussion" }).click();
  await page
    .getByLabel("Discussion Deleted")
    .getByRole("button", { name: "Close" })
    .click();
  await expect(
    page.getByRole("heading", { name: "No Entries Found" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "No Entries Found" }),
  ).toBeVisible();
  await expect(page.getByText(`${discussion.title} - updated`)).toBeHidden();
});
