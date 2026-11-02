import { expect, test } from "@nuxt/test-utils/playwright";
import { createTeam, createAccount, createDiscussion, createComment } from "~~/test/e2e/support/factories";
import { login } from "~~/test/e2e/support/authentication";
import { waitForNuxtHydration } from "~~/test/e2e/support/nuxtNavigation";

test("loads more comments without losing earlier comments", { tag: ["@comments", "@pagination"] }, async ({ page, baseURL }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "comment-pagination", team.id, "ADMIN");
  const { user } = account;
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);
  const discussion = await createDiscussion(baseURL, user, "Discussion with more comments");
  const bodies = Array.from({ length: 11 }, (_, index) => `Pagination comment ${index + 1}`);
  for (const body of bodies) {
    await createComment(baseURL, user, discussion.id, body);
  }

  await page.goto(`/app/discussions/${discussion.id}`);
  await waitForNuxtHydration(page);
  const comments = page.getByRole("list", { name: "comments" }).getByRole("listitem");
  await expect(comments).toHaveCount(10);
  const loadMore = page.getByRole("button", { name: "Load More Comments" });
  await expect(loadMore).toBeVisible();

  await loadMore.click();

  await expect(comments).toHaveCount(11);
  for (const body of bodies) {
    await expect(comments.getByText(body, { exact: true })).toBeVisible();
  }
  await expect(loadMore).toHaveCount(0);
});

test("creates a comment on mobile after cancelling and reopening the drawer", { tag: ["@comments", "@mutation-refresh"] }, async ({ page, baseURL }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "mobile-comment-create", team.id, "ADMIN");
  const { user } = account;
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);
  const discussion = await createDiscussion(baseURL, user, "Mobile comment discussion");
  const body = "Comment posted from mobile";
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/app/discussions/${discussion.id}`);
  await waitForNuxtHydration(page);
  await expect(page.getByRole("heading", { name: "No Comments Found" })).toBeVisible();

  const trigger = page.getByRole("button", { name: "Create Comment" });
  const drawer = page.getByRole("dialog", { name: "Create Comment" });
  await trigger.click();
  await expect(drawer).toBeVisible();
  await expect.poll(() => drawer.evaluate(element => element.contains(document.activeElement))).toBe(true);
  await drawer.locator("[data-slot='sheet-footer']").getByRole("button", { name: "Close", exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();

  await trigger.click();
  await expect(drawer).toBeVisible();
  await drawer.getByLabel("Body").fill(body);
  await drawer.getByRole("button", { name: "Submit" }).click();

  await expect(drawer).toBeHidden();
  await expect(page.getByRole("list", { name: "comments" }).getByText(body, { exact: true })).toBeVisible();
  await expect(page.locator("[data-sonner-toast][data-type=success]", { hasText: "Comment Created" })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "No Comments Found" })).toHaveCount(0);
});
