import type { Page } from "@playwright/test";
import { expect, test } from "@nuxt/test-utils/playwright";
import { expectCreatedResponse, expectEmptyResponse, expectJson } from "./support/api-response";
import { gotoWithSsrHtml } from "./support/nuxt-navigation";

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

test("discussions are SSR-rendered without a hydration GET", { tag: ["@discussions", "@ssr"] }, async ({ page }) => {
  await registerIsolatedUser(page, "ssr-discussions");
  const marker = `SSR discussion ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await expectCreatedResponse(await page.request.post(new URL("/api/discussions", page.url()).href, {
    data: {
      title: marker,
      body: "SSR evidence body",
    },
  }));

  let browserDiscussionGets = 0;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.method() === "GET" && url.pathname === "/api/discussions") {
      browserDiscussionGets += 1;
    }
  });

  const { html } = await gotoWithSsrHtml(page, "/app/discussions");
  const documentHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  expect(documentHtml).toContain(marker);
  await expect(page.getByText(marker)).toBeVisible();
  expect(browserDiscussionGets).toBe(0);
});

test("direct discussion detail is SSR-rendered without a hydration GET", { tag: ["@discussions", "@ssr"] }, async ({ page }) => {
  await registerIsolatedUser(page, "ssr-discussion-detail");
  const discussion = await createDiscussion(page, `SSR discussion detail ${Date.now()}`);
  const commentBody = `SSR discussion comment ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await expectCreatedResponse(await page.request.post(new URL("/api/comments", page.url()).href, {
    data: { discussionId: discussion.id, body: commentBody },
  }));
  let browserDiscussionGets = 0;
  let browserCommentGets = 0;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.method() === "GET" && url.pathname === `/api/discussions/${discussion.id}`) {
      browserDiscussionGets += 1;
    }
    if (request.method() === "GET" && url.pathname === "/api/comments") {
      browserCommentGets += 1;
    }
  });

  const { html } = await gotoWithSsrHtml(page, `/app/discussions/${discussion.id}`);
  const documentHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  expect(documentHtml).toContain(discussion.title);
  expect(documentHtml).toContain(commentBody);
  await expect(page.getByRole("heading", { name: discussion.title })).toBeVisible();
  await expect(page.getByText(`${discussion.title} body`)).toBeVisible();
  await expect(page.getByText(commentBody)).toBeVisible();
  expect(browserDiscussionGets).toBe(0);
  expect(browserCommentGets).toBe(0);
});

test("SSR detail failure hydrates the configured read notification", { tag: ["@discussions", "@ssr"] }, async ({ page, goto }) => {
  await registerIsolatedUser(page, "ssr-detail-failure");
  const discussionId = `missing-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let browserDiscussionGets = 0;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.method() === "GET" && url.pathname === `/api/discussions/${discussionId}`) {
      browserDiscussionGets += 1;
    }
  });

  const response = await goto(`/app/discussions/${discussionId}`, { waitUntil: "hydration" });
  expect(response).not.toBeNull();

  await expect(page.getByLabel("Error")).toHaveCount(1);
  await expect(page.getByText("Discussion not found")).toHaveCount(1);
  expect(browserDiscussionGets).toBe(0);
});

test("discussion navigation waits for the initial read before showing the target page", { tag: ["@discussions", "@navigation", "@initial-read"] }, async ({ page }) => {
  await registerIsolatedUser(page, "awaited-discussions");
  await page.goto("/app", { waitUntil: "networkidle" });
  const marker = `Awaited discussion ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await expectCreatedResponse(await page.request.post(new URL("/api/discussions", page.url()).href, {
    data: {
      title: marker,
      body: "Awaited navigation evidence body",
    },
  }));

  const requestStarted = deferred();
  const responseRelease = deferred();
  await page.route(/\/api\/discussions(?:\?.*)?$/, async (route) => {
    requestStarted.resolve();
    await responseRelease.promise;
    await route.continue();
  });

  const navigation = page.getByRole("link", { name: "Discussions" }).click();
  await requestStarted.promise;

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Discussions", exact: true })).toHaveCount(0);

  responseRelease.resolve();
  await navigation;
  await page.waitForURL("/app/discussions");
  await expect(page.getByText(marker)).toBeVisible();
});

test("discussion detail follows a reactive route identity", { tag: ["@discussions", "@navigation"] }, async ({ page }) => {
  await registerIsolatedUser(page, "reactive-discussion-detail");
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const discussionA = await createDiscussion(page, `Reactive discussion A ${unique}`);
  const discussionB = await createDiscussion(page, `Reactive discussion B ${unique}`);
  const discussionBComment = `Reactive discussion B comment ${unique}`;
  await expectCreatedResponse(await page.request.post(new URL("/api/comments", page.url()).href, {
    data: { discussionId: discussionB.id, body: discussionBComment },
  }));

  await page.goto(`/app/discussions/${discussionA.id}`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: discussionA.title })).toBeVisible();

  const requestStarted = deferred();
  const responseRelease = deferred();
  await page.route((url) => {
    return url.pathname === `/api/discussions/${discussionB.id}`;
  }, async (route) => {
    requestStarted.resolve();
    await responseRelease.promise;
    await route.continue();
  });

  const navigation = page.evaluate((path) => {
    const root = document.querySelector("#__nuxt") as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $router?: { push: (to: string) => Promise<unknown> };
          };
        };
      };
    };
    const router = root.__vue_app__?.config.globalProperties.$router;
    if (!router) throw new Error("Vue router is unavailable");
    return router.push(path);
  }, `/app/discussions/${discussionB.id}`);
  await requestStarted.promise;

  await expect(page.getByRole("heading", { name: discussionA.title })).toBeVisible();
  await expect(page.getByText(`${discussionB.title} body`)).toHaveCount(0);
  await expect(page.getByText(discussionBComment)).toHaveCount(0);

  responseRelease.resolve();
  await navigation;
  await page.waitForURL(`/app/discussions/${discussionB.id}`);

  await expect(page.getByRole("heading", { name: discussionB.title })).toBeVisible();
  await expect(page.getByText(`${discussionB.title} body`)).toBeVisible();
  await expect(page.getByText(discussionBComment)).toBeVisible();
});

test("custom fetcher reports each failed initial GET attempt without an inline error", { tag: ["@discussions", "@initial-read"] }, async ({ page }) => {
  await registerIsolatedUser(page, "initial-get");
  await page.goto("/app", { waitUntil: "networkidle" });
  await page.route(/\/api\/discussions(?:\?.*)?$/, async route => route.fulfill({
    status: 500,
    contentType: "application/json",
    body: JSON.stringify({ message: "Initial discussions GET failed" }),
  }));

  await page.getByRole("link", { name: "Discussions" }).click();

  await expect(page.getByLabel("Error")).toHaveCount(2);
  await expect(page.getByText("Initial discussions GET failed")).toHaveCount(2);
  await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
});

test("page-2 last-row deletion clamps to page 1 and renders the new-key rows", { tag: ["@discussions", "@mutation-refresh"] }, async ({ page }) => {
  await registerIsolatedUser(page, "clamp");

  for (let index = 1; index <= 11; index += 1) {
    await expectCreatedResponse(await page.request.post(new URL("/api/discussions", page.url()).href, {
      data: {
        title: `Clamp discussion ${String(index).padStart(2, "0")}`,
        body: `Clamp body ${index}`,
      },
    }));
  }

  const firstPage = await expectJson(await page.request.get(
    new URL("/api/discussions?page=1&limit=10", page.url()).href,
  ));
  const secondPage = await expectJson(await page.request.get(
    new URL("/api/discussions?page=2&limit=10", page.url()).href,
  ));
  expect(secondPage.data).toHaveLength(1);
  const deletedTitle = secondPage.data[0].title as string;

  await page.goto("/app/discussions", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "2", exact: true }).click();
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await expect(page.getByText(deletedTitle)).toBeVisible();

  await page.getByRole("button", { name: `Open discussion actions for ${deletedTitle}` }).click();
  await page.getByRole("menuitem", { name: "Delete Discussion" }).click();
  await page.getByRole("button", { name: "Delete Discussion", exact: true }).click();

  await expect(page.getByLabel("Discussion Deleted")).toHaveCount(1);
  await expect(page.getByText("Page 1 of 1")).toBeVisible();
  await expect(page.getByText(deletedTitle)).toHaveCount(0);
  await expect(page.getByText(firstPage.data[0].title)).toBeVisible();
});

test("clamp-target GET failure preserves mutation success and does not restore the deleted page", { tag: ["@discussions", "@mutation-refresh"] }, async ({ page }) => {
  await registerIsolatedUser(page, "clamp-failure");

  for (let index = 1; index <= 11; index += 1) {
    await expectCreatedResponse(await page.request.post(new URL("/api/discussions", page.url()).href, {
      data: {
        title: `Clamp failure ${String(index).padStart(2, "0")}`,
        body: `Clamp failure body ${index}`,
      },
    }));
  }
  const secondPage = await expectJson(await page.request.get(
    new URL("/api/discussions?page=2&limit=10", page.url()).href,
  ));
  const deletedTitle = secondPage.data[0].title as string;

  await page.goto("/app/discussions", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "2", exact: true }).click();
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await expect(page.getByText(deletedTitle)).toBeVisible();

  let failClampTarget = false;
  await page.route(/\/api\/discussions(?:\?.*)?$/, async (route) => {
    const requestUrl = new URL(route.request().url());
    if (failClampTarget && requestUrl.searchParams.get("page") === "1") {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Clamp target GET failed" }),
      });
      return;
    }
    await route.continue();
  });

  await page.getByRole("button", { name: `Open discussion actions for ${deletedTitle}` }).click();
  await page.getByRole("menuitem", { name: "Delete Discussion" }).click();
  failClampTarget = true;
  await page.getByRole("button", { name: "Delete Discussion", exact: true }).click();

  const alerts = page.locator("[aria-live='assertive'] [role='alert']");
  await expect(alerts).toHaveCount(3);
  await expect(alerts.nth(0)).toHaveAttribute("aria-label", "Discussion Deleted");
  await expect(alerts.nth(1)).toHaveAttribute("aria-label", "Error");
  await expect(alerts.nth(2)).toHaveAttribute("aria-label", "Error");
  await expect(page.getByText("Clamp target GET failed")).toHaveCount(2);
  await expect(page.getByText(deletedTitle)).toHaveCount(0);
  await expect(page.getByText("Page 2 of 2")).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Delete Discussion" })).toHaveCount(0);
});

test("mutation failure uses the API notification without an inline form error", { tag: ["@discussions", "@mutation"] }, async ({ page }) => {
  await registerIsolatedUser(page, "mutation-failure");
  await page.goto("/app/discussions", { waitUntil: "networkidle" });
  await page.route(/\/api\/discussions$/, async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Discussion creation failed" }),
      });
      return;
    }
    await route.continue();
  });

  await page.getByRole("button", { name: "Create Discussion" }).click();
  const drawer = page.getByRole("dialog", { name: "Create Discussion" });
  await drawer.getByLabel("Title").fill("Failed discussion");
  await drawer.getByLabel("Body").fill("This request should fail");
  await drawer.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByLabel("Error")).toHaveCount(1);
  await expect(page.getByText("Discussion creation failed")).toHaveCount(1);
  await expect(drawer.getByRole("alert")).toHaveCount(0);
  await expect(drawer.getByRole("button", { name: "Submit" })).toBeEnabled();
  await expect(drawer).toBeVisible();
});
