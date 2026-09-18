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

test("discussion content stays available while the initial comments Query loads", { tag: ["@comments", "@initial-read"] }, async ({ page }) => {
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
  await expect(page.getByRole("heading", { name: discussion.title })).toBeVisible();
  await expect(page.getByText(`${discussion.title} body`)).toBeVisible();
  await expect(page.getByText("Loading comments")).toBeVisible();

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
  await expect(page.getByLabel("Error")).toHaveCount(0);
  await expect(page.getByRole("alert", { name: "Comments unavailable" })).toBeVisible({ timeout: 15_000 });
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

test("failed later comments page keeps the comments already displayed", { tag: ["@comments", "@pagination"] }, async ({ page }) => {
  const discussionId = await createDiscussionForComments(page, "comments-later-page-failure");
  const commentBodies = Array.from(
    { length: 11 },
    (_, index) => `Later-page comment ${index + 1} ${Date.now()}`,
  );

  for (const body of commentBodies) {
    await expectCreatedResponse(await page.request.post(new URL("/api/comments", page.url()).href, {
      data: { discussionId, body },
    }));
  }

  let laterPageGetCount = 0;
  await page.route((url) => {
    return url.pathname === "/api/comments"
      && url.searchParams.get("discussionId") === discussionId
      && url.searchParams.get("page") === "2";
  }, async (route) => {
    laterPageGetCount += 1;
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Later comments page failed" }),
    });
  });

  await page.goto(`/app/discussions/${discussionId}`, { waitUntil: "networkidle" });
  const displayedComments = page.getByRole("list", { name: "comments" }).getByRole("listitem");
  await expect(displayedComments).toHaveCount(10);
  const displayedLabels = await displayedComments.evaluateAll((items) => {
    return items.map(item => item.getAttribute("aria-label") ?? "");
  });
  expect(displayedLabels).not.toContain("");

  await page.getByRole("button", { name: "Load More Comments" }).click();

  await expect.poll(() => laterPageGetCount).toBeGreaterThan(0);
  await expect(page.getByRole("alert", { name: "More comments unavailable" })).toContainText(
    "Couldn't load more comments.",
    { timeout: 15_000 },
  );
  for (const label of displayedLabels) {
    await expect(page.getByLabel(label, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "Load More Comments" })).toBeVisible();
});

test("comment create settles before its detached comments synchronization", { tag: ["@comments", "@mutation-refresh"] }, async ({ page }) => {
  const discussionId = await createDiscussionForComments(page, "comment-create-refresh");
  const commentBody = "Created after delayed synchronization";

  await page.goto(`/app/discussions/${discussionId}`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "No Comments Found" })).toBeVisible();

  const synchronization = deferred();
  let delaySynchronization = false;
  let synchronizationGetCount = 0;
  await page.route(/\/api\/comments(?:\?.*)?$/, async (route) => {
    if (delaySynchronization && route.request().method() === "GET") {
      synchronizationGetCount += 1;
      await synchronization.promise;
    }
    await route.continue();
  });

  await page.getByRole("button", { name: "Create Comment" }).click();
  const drawer = page.getByRole("dialog", { name: "Create Comment" });
  await drawer.getByLabel("Body").fill(commentBody);
  delaySynchronization = true;
  await drawer.getByRole("button", { name: "Submit" }).click();

  await expect.poll(() => synchronizationGetCount).toBe(1);
  await expect(page.getByLabel("Comment Created")).toHaveCount(1);
  await expect(drawer).toBeHidden();

  synchronization.resolve();
  await expect(page.getByText(commentBody)).toBeVisible();
});

test("comment delete stays successful when detached comments synchronization fails", { tag: ["@comments", "@mutation-refresh"] }, async ({ page }) => {
  const discussionId = await createDiscussionForComments(page, "comment-delete-refresh-failure");
  const commentBody = "Deleted before failed synchronization";
  await expectCreatedResponse(await page.request.post(new URL("/api/comments", page.url()).href, {
    data: { discussionId, body: commentBody },
  }));

  await page.goto(`/app/discussions/${discussionId}`, { waitUntil: "networkidle" });
  await expect(page.getByText(commentBody)).toBeVisible();

  let failSynchronization = false;
  await page.route(/\/api\/comments(?:\?.*)?$/, async (route) => {
    if (failSynchronization && route.request().method() === "GET") {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Comments synchronization failed" }),
      });
      return;
    }
    await route.continue();
  });

  await page.getByRole("button", { name: "Open comment actions for comment 1" }).click();
  await page.getByRole("menuitem", { name: "Delete Comment" }).click();
  const dialog = page.getByRole("dialog", { name: "Delete Comment" });
  failSynchronization = true;
  await dialog.getByRole("button", { name: "Delete Comment" }).click();

  await expect(page.getByLabel("Comment Deleted")).toHaveCount(1);
  await expect(dialog).toBeHidden();

  const persisted = await expectJson(await page.request.get(
    new URL(`/api/comments?discussionId=${discussionId}`, page.url()).href,
  ));
  expect(persisted.data).toHaveLength(0);
});
