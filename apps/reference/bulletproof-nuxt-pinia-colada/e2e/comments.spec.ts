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

test("discussion detail keeps its content while the initial comments response is pending", { tag: ["@comments", "@initial-read"] }, async ({ page }) => {
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

  responseRelease.resolve();
  await navigation;

  await expect(page).toHaveURL(new RegExp(`/app/discussions/${discussion.id}$`));
  await expect(page.getByRole("heading", { name: discussion.title })).toBeVisible();
  await expect(page.getByText(`${discussion.title} body`)).toBeVisible();
  await expect(page.getByRole("heading", { name: "No Comments Found" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Comment" })).toBeEnabled();
});

test("failed initial comments show a shared notification and local retry state", { tag: ["@comments", "@initial-read"] }, async ({ page }) => {
  await registerIsolatedUser(page, "comments-failure");
  const discussion = await createDiscussion(page, `Comments failure ${Date.now()}`);
  await page.goto("/app/discussions", { waitUntil: "networkidle" });

  await page.route((url) => {
    return url.pathname === "/api/comments"
      && url.searchParams.get("discussionId") === discussion.id;
  }, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ message: "Initial comments GET failed" }),
    });
  });

  const row = page.getByRole("row").filter({ hasText: discussion.title });
  await row.getByRole("link", { name: "View" }).click();

  await expect(page).toHaveURL(new RegExp(`/app/discussions/${discussion.id}$`));
  await expect(page.getByRole("alert", { name: "Comments unavailable" })).toBeVisible();
  await expect(page.getByRole("alert", { name: "Error" })).toBeVisible();
});

test("Load More appends the next comments page", { tag: ["@comments", "@infinite-query"] }, async ({ page }) => {
  const discussionId = await createDiscussionForComments(page, "comments-load-more");
  const commentsEndpoint = new URL("/api/comments", page.url()).href;

  for (let index = 1; index <= 11; index += 1) {
    await expectCreatedResponse(await page.request.post(commentsEndpoint, {
      data: { discussionId, body: `Load More comment ${index}` },
    }));
  }

  await page.goto(`/app/discussions/${discussionId}`, { waitUntil: "networkidle" });

  await expect(page.getByText("Load More comment 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Load More comment 11", { exact: true })).toHaveCount(0);

  const nextPageRequestStarted = deferred();
  const nextPageResponseRelease = deferred();
  await page.route((url) => {
    return url.pathname === "/api/comments"
      && url.searchParams.get("discussionId") === discussionId
      && url.searchParams.get("page") === "2";
  }, async (route) => {
    nextPageRequestStarted.resolve();
    await nextPageResponseRelease.promise;
    await route.continue();
  });

  await page.getByRole("button", { name: "Load More Comments" }).click();

  await nextPageRequestStarted.promise;
  await expect(page.getByText("Load More comment 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Loading more comments", { exact: true })).toBeVisible();

  nextPageResponseRelease.resolve();

  await expect(page.getByText("Load More comment 11", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Load More Comments" })).toHaveCount(0);
});

test("comment create completes before its comments refresh settles", { tag: ["@comments", "@mutation-refresh"] }, async ({ page }) => {
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
  await expect(drawer).toBeHidden();

  refresh.resolve();
  await expect(page.getByText(commentBody)).toBeVisible();
  await expect(drawer).toBeHidden();
});

test("failed post-delete comments refresh keeps data and shows a shared notification", { tag: ["@comments", "@mutation-refresh"] }, async ({ page }) => {
  const discussionId = await createDiscussionForComments(page, "comment-delete-refresh-failure");
  const commentBody = "Deleted before failed refresh";
  await expectCreatedResponse(await page.request.post(new URL("/api/comments", page.url()).href, {
    data: { discussionId, body: commentBody },
  }));

  await page.goto(`/app/discussions/${discussionId}`, { waitUntil: "networkidle" });
  await expect(page.getByText(commentBody)).toBeVisible();

  let refreshGetCount = 0;
  await page.route(/\/api\/comments(?:\?.*)?$/, async (route) => {
    if (route.request().method() === "GET") {
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
  await dialog.getByRole("button", { name: "Delete Comment" }).click();

  await expect.poll(() => refreshGetCount).toBeGreaterThan(0);
  await expect(dialog).toBeHidden();
  await expect(page.getByText(commentBody)).toBeVisible();
  await expect(page.getByRole("alert", { name: "Error" })).toBeVisible();

  const persisted = await expectJson(await page.request.get(
    new URL(`/api/comments?discussionId=${discussionId}`, page.url()).href,
  ));
  expect(persisted.data).toHaveLength(0);
});
