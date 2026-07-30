import type { Page } from "@playwright/test";
import { expect, test } from "@nuxt/test-utils/playwright";
import { expectCreatedResponse, expectEmptyResponse, expectJson } from "./support/api-response";

const password = "Password123!";

async function registerIsolatedUser(page: Page, label: string) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const unique = `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await expectEmptyResponse(await page.request.post(new URL("/api/auth/register", page.url()).href, {
    data: {
      email: `${unique}@example.com`,
      firstName: "Data",
      lastName: "Evidence",
      password,
      teamId: null,
      teamName: `Evidence ${unique}`,
    },
  }), 201);
  return { unique };
}

function isApiRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function findDiscussionByTitle(page: Page, title: string) {
  const result: unknown = await expectJson(await page.request.get(
    new URL("/api/discussions?limit=100", page.url()).href,
  ));
  if (!isApiRecord(result) || !Array.isArray(result.data)) {
    throw new Error("Test setup failed: discussions response has invalid data");
  }

  const discussion = result.data.find(item => isApiRecord(item) && item.title === title);
  if (!isApiRecord(discussion) || typeof discussion.id !== "string") {
    throw new Error(`Test setup failed: discussion not found for title: ${title}`);
  }

  return discussion;
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

async function createDiscussion(page: Page, title: string) {
  await expectEmptyResponse(await page.request.post(
    new URL("/api/discussions", page.url()).href,
    {
      data: {
        title,
        body: `${title} body`,
      },
    },
  ), 201);
  const discussion = await findDiscussionByTitle(page, title);

  return { id: discussion.id, title };
}

async function createDiscussionForComments(page: Page, label: string) {
  await registerIsolatedUser(page, label);
  const title = `${label} discussion ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const discussion = await createDiscussion(page, title);

  return discussion.id;
}

test("discussion content waits for the initial comments response", { tag: ["@comments", "@initial-read"] }, async ({ page }) => {
  await registerIsolatedUser(page, "blocking-comments");
  const discussion = await createDiscussion(page, `Blocking comments ${Date.now()}`);
  await page.goto("/app/discussions", { waitUntil: "networkidle" });

  const requestStarted = deferred();
  const responseRelease = deferred();
  await page.route((url) => {
    return url.pathname === "/api/comments"
      && url.searchParams.get("discussionId") === discussion.id;
  }, async (route) => {
    requestStarted.resolve();
    await responseRelease.promise;
    await route.continue();
  });

  const row = page.getByRole("row").filter({ hasText: discussion.title });
  const navigation = row.getByRole("link", { name: "View" }).click();
  await requestStarted.promise;

  await expect(page).toHaveURL(new RegExp(`/app/discussions/${discussion.id}$`));
  await expect(page.getByRole("heading", { name: discussion.title })).toHaveCount(0);
  await expect(page.getByText(`${discussion.title} body`)).toHaveCount(0);

  responseRelease.resolve();
  await navigation;

  await expect(page).toHaveURL(new RegExp(`/app/discussions/${discussion.id}$`));
  await expect(page.getByRole("heading", { name: discussion.title })).toBeVisible();
  await expect(page.getByText(`${discussion.title} body`)).toBeVisible();
  await expect(page.getByRole("heading", { name: "No Comments Found" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Comment" })).toBeEnabled();
});

test("failed initial comments provide persistent recovery and retry to success", { tag: ["@comments", "@initial-read"] }, async ({ page }) => {
  await registerIsolatedUser(page, "comments-failure");
  const discussion = await createDiscussion(page, `Comments failure ${Date.now()}`);
  await page.goto("/app/discussions", { waitUntil: "networkidle" });

  let failCommentsRead = true;
  const retryStarted = deferred();
  const retryRelease = deferred();
  await page.route((url) => {
    return url.pathname === "/api/comments"
      && url.searchParams.get("discussionId") === discussion.id;
  }, async (route) => {
    if (failCommentsRead) {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Initial comments GET failed" }),
      });
      return;
    }

    retryStarted.resolve();
    await retryRelease.promise;
    await route.continue();
  });

  const row = page.getByRole("row").filter({ hasText: discussion.title });
  await row.getByRole("link", { name: "View" }).click();

  await expect(page).toHaveURL(new RegExp(`/app/discussions/${discussion.id}$`));
  await expect(page.getByRole("heading", { name: discussion.title })).toBeVisible();
  await expect(page.getByLabel("Error").first()).toBeVisible();
  await expect(page.getByText("Initial comments GET failed").first()).toBeVisible();
  await expect(page.getByRole("alert", { name: "Comments unavailable" })).toBeVisible();
  await expect(page.getByRole("status", { name: "Loading comments" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "No Comments Found" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Create Comment" })).toBeDisabled();

  failCommentsRead = false;
  await page.getByRole("button", { name: "Retry comments" }).click();
  await retryStarted.promise;

  await expect(page.getByRole("alert", { name: "Comments unavailable" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry comments" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Create Comment" })).toBeDisabled();

  retryRelease.resolve();

  await expect(page.getByRole("alert", { name: "Comments unavailable" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "No Comments Found" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Comment" })).toBeEnabled();
});

test("comment create stays pending until its comments refresh settles", { tag: ["@comments", "@mutation-refresh"] }, async ({ page }) => {
  const discussionId = await createDiscussionForComments(page, "comment-create-refresh");
  const commentBody = "Created after delayed refresh";

  await page.goto(`/app/discussions/${discussionId}`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "No Comments Found" })).toBeVisible();

  const refresh = deferred();
  let delayRefresh = false;
  let refreshGetCount = 0;
  await page.route(/\/api\/comments(?:\?.*)?$/, async (route) => {
    if (delayRefresh && route.request().method() === "GET") {
      refreshGetCount += 1;
      await refresh.promise;
    }
    await route.continue();
  });

  await page.getByRole("button", { name: "Create Comment" }).click();
  const drawer = page.getByRole("dialog", { name: "Create Comment" });
  await drawer.getByLabel("Body").fill(commentBody);
  delayRefresh = true;
  await drawer.getByRole("button", { name: "Submit" }).click();

  await expect.poll(() => refreshGetCount).toBe(1);
  await expect(page.getByLabel("Comment Created")).toHaveCount(1);
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("button", { name: "Submit" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeVisible();

  refresh.resolve();
  await expect(page.getByText(commentBody)).toBeVisible();
  await expect(drawer).toBeHidden();
});

test("failed post-delete comments refresh preserves success ordering and existing rows", { tag: ["@comments", "@mutation-refresh"] }, async ({ page }) => {
  const discussionId = await createDiscussionForComments(page, "comment-delete-refresh-failure");
  const commentBody = "Deleted before failed refresh";
  await expectCreatedResponse(await page.request.post(new URL("/api/comments", page.url()).href, {
    data: { discussionId, body: commentBody },
  }));

  await page.goto(`/app/discussions/${discussionId}`, { waitUntil: "networkidle" });
  await expect(page.getByText(commentBody)).toBeVisible();

  let failRefresh = false;
  let refreshGetCount = 0;
  await page.route(/\/api\/comments(?:\?.*)?$/, async (route) => {
    if (failRefresh && route.request().method() === "GET") {
      refreshGetCount += 1;
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Comments refresh failed" }),
      });
      return;
    }
    await route.continue();
  });

  await page.getByRole("button", { name: "Open comment actions for comment 1" }).click();
  await page.getByRole("menuitem", { name: "Delete Comment" }).click();
  const dialog = page.getByRole("dialog", { name: "Delete Comment" });
  failRefresh = true;
  await dialog.getByRole("button", { name: "Delete Comment" }).click();

  await expect.poll(() => refreshGetCount).toBe(2);
  const alerts = page.locator("[aria-live='assertive'] [role='alert']");
  await expect(alerts).toHaveCount(3);
  await expect(alerts.nth(0)).toHaveAttribute("aria-label", "Comment Deleted");
  await expect(alerts.nth(1)).toHaveAttribute("aria-label", "Error");
  await expect(alerts.nth(2)).toHaveAttribute("aria-label", "Error");
  await expect(page.getByText("Comments refresh failed")).toHaveCount(2);
  await expect(dialog).toBeHidden();
  await expect(page.getByText(commentBody)).toBeVisible();

  const persisted = await expectJson(await page.request.get(
    new URL(`/api/comments?discussionId=${discussionId}`, page.url()).href,
  ));
  expect(persisted.data).toHaveLength(0);
});
