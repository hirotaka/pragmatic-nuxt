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

test("SSR detail Not Found flows through the global error page", { tag: ["@discussions", "@ssr"] }, async ({ page, goto }) => {
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

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
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

  await expect(page.getByRole("heading", { name: "Discussions", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toHaveCount(0);

  responseRelease.resolve();
  await navigation;
  await page.waitForURL("/app/discussions");
  await expect(page.getByText(marker)).toBeVisible();
});

test("cancelled discussion navigation cannot publish stale page state", { tag: ["@discussions", "@navigation", "@initial-read"] }, async ({ page }) => {
  await registerIsolatedUser(page, "cancelled-discussions");
  await page.goto("/app", { waitUntil: "networkidle" });

  const requestStarted = deferred();
  const responseRelease = deferred();
  await page.route(/\/api\/discussions(?:\?.*)?$/, async (route) => {
    requestStarted.resolve();
    await responseRelease.promise;
    await route.continue();
  });

  const discussionsNavigation = page.getByRole("link", { name: "Discussions" }).click();
  await requestStarted.promise;

  await page.getByRole("link", { name: "Users" }).click();
  await page.waitForURL("/app/users");
  await expect(page.getByRole("heading", { name: "Users", exact: true })).toBeVisible();

  responseRelease.resolve();
  await discussionsNavigation;
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 0)));

  await expect(page).toHaveURL(/\/app\/users$/);
  await expect(page).toHaveTitle("Users | Bulletproof Nuxt");
  await expect(page.getByRole("heading", { name: "Users", exact: true })).toBeVisible();
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

  await expect(page.getByRole("heading", { name: discussionA.title })).toHaveCount(0);
  await expect(page.getByText(`${discussionB.title} body`)).toHaveCount(0);
  await expect(page.getByText(discussionBComment)).toHaveCount(0);

  responseRelease.resolve();
  await navigation;
  await page.waitForURL(`/app/discussions/${discussionB.id}`);

  await expect(page.getByRole("heading", { name: discussionB.title })).toBeVisible();
  await expect(page.getByText(`${discussionB.title} body`)).toBeVisible();
  await expect(page.getByText(discussionBComment)).toBeVisible();
});

test("pointer intent starts detail prefetch without delaying native navigation", { tag: ["@discussions", "@prefetch"] }, async ({ page }) => {
  await registerIsolatedUser(page, "pointer-prefetch");
  const discussion = await createDiscussion(page, `Pointer prefetch ${Date.now()}`);
  await page.goto("/app/discussions", { waitUntil: "networkidle" });

  const requestStarted = deferred();
  const responseRelease = deferred();
  let detailGets = 0;
  await page.route(url => url.pathname === `/api/discussions/${discussion.id}`, async (route) => {
    if (route.request().method() === "GET") {
      detailGets += 1;
      requestStarted.resolve();
      await responseRelease.promise;
    }
    await route.continue();
  });

  const link = page.locator(`a[href="/app/discussions/${discussion.id}"]`);
  await link.dispatchEvent("pointerdown");
  await requestStarted.promise;

  const navigation = link.click();
  await page.waitForURL(`/app/discussions/${discussion.id}`);
  expect(detailGets).toBe(1);

  responseRelease.resolve();
  await navigation;
  await expect(page.getByRole("heading", { name: discussion.title })).toBeVisible();
});

test("completed detail prefetch is reused while the entry is fresh", { tag: ["@discussions", "@prefetch"] }, async ({ page }) => {
  await registerIsolatedUser(page, "fresh-prefetch");
  const discussion = await createDiscussion(page, `Fresh prefetch ${Date.now()}`);
  await page.goto("/app/discussions", { waitUntil: "networkidle" });

  let detailGets = 0;
  await page.route(url => url.pathname === `/api/discussions/${discussion.id}`, async (route) => {
    if (route.request().method() === "GET") detailGets += 1;
    await route.continue();
  });

  const link = page.locator(`a[href="/app/discussions/${discussion.id}"]`);
  const prefetchResponse = page.waitForResponse(response => response.url().endsWith(`/api/discussions/${discussion.id}`));
  await link.dispatchEvent("pointerdown");
  await prefetchResponse;
  expect(detailGets).toBe(1);

  await link.click();
  await page.waitForURL(`/app/discussions/${discussion.id}`);
  await expect(page.getByRole("heading", { name: discussion.title })).toBeVisible();
  expect(detailGets).toBe(1);
});

test("abandoned prefetch failures remain silent on the Discussions list", { tag: ["@discussions", "@prefetch", "@error"] }, async ({ page }) => {
  await registerIsolatedUser(page, "abandoned-prefetch-failure");
  const discussion = await createDiscussion(page, `Abandoned prefetch ${Date.now()}`);
  await page.goto("/app/discussions", { waitUntil: "networkidle" });

  let detailGets = 0;
  await page.route(url => url.pathname === `/api/discussions/${discussion.id}`, async (route) => {
    if (route.request().method() === "GET") {
      detailGets += 1;
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Prefetch failed" }),
      });
      return;
    }
    await route.continue();
  });

  const link = page.locator(`a[href="/app/discussions/${discussion.id}"]`);
  const prefetchResponse = page.waitForResponse(response => response.url().endsWith(`/api/discussions/${discussion.id}`));
  await link.dispatchEvent("pointerdown");
  await prefetchResponse;
  expect(detailGets).toBe(1);

  await expect(page).toHaveURL(/\/app\/discussions$/);
  await expect(page.getByRole("alert", { name: "Error" })).toHaveCount(0);
});

test("active detail failures retain the normal error experience", { tag: ["@discussions", "@prefetch", "@error"] }, async ({ page }) => {
  await registerIsolatedUser(page, "active-prefetch-failure");
  const discussion = await createDiscussion(page, `Active prefetch failure ${Date.now()}`);
  await page.goto("/app/discussions", { waitUntil: "networkidle" });

  await page.route(url => url.pathname === `/api/discussions/${discussion.id}`, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Detail read failed" }),
      });
      return;
    }
    await route.continue();
  });

  const link = page.locator(`a[href="/app/discussions/${discussion.id}"]`);
  await link.evaluate(element => (element as HTMLAnchorElement).click());
  await page.waitForURL(`/app/discussions/${discussion.id}`);

  await expect(page.getByText("Discussion could not be loaded.")).toBeVisible();
  await expect(page.getByRole("alert", { name: "Error" })).toBeVisible();
});

test("initial Discussions GET failure shows a shared notification and local retry state", { tag: ["@discussions", "@initial-read"] }, async ({ page }) => {
  await registerIsolatedUser(page, "initial-get");
  await page.goto("/app", { waitUntil: "networkidle" });
  await page.route(/\/api\/discussions(?:\?.*)?$/, async route => route.fulfill({
    status: 500,
    contentType: "application/json",
    body: JSON.stringify({ message: "Initial discussions GET failed" }),
  }));

  await page.getByRole("link", { name: "Discussions" }).click();

  await expect(page.getByRole("alert", { name: "Discussions unavailable" })).toBeVisible();
  await expect(page.getByRole("alert", { name: "Error" })).toBeVisible();
});

test("discussion pagination follows the URL page", { tag: ["@discussions", "@navigation"] }, async ({ page }) => {
  await registerIsolatedUser(page, "pagination");

  for (let index = 1; index <= 11; index += 1) {
    await expectCreatedResponse(await page.request.post(new URL("/api/discussions", page.url()).href, {
      data: {
        title: `Clamp discussion ${String(index).padStart(2, "0")}`,
        body: `Clamp body ${index}`,
      },
    }));
  }

  const secondPage = await expectJson(await page.request.get(
    new URL("/api/discussions?page=2&limit=10", page.url()).href,
  ));
  expect(secondPage.data).toHaveLength(1);
  const secondPageTitle = secondPage.data[0].title as string;

  await page.goto("/app/discussions", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "2", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/discussions\?page=2$/);
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await expect(page.getByText(secondPageTitle)).toBeVisible();
});

test("paginated queries keep the previous page visible while the next page loads", { tag: ["@discussions", "@navigation"] }, async ({ page }) => {
  await registerIsolatedUser(page, "pagination-placeholder");

  for (let index = 1; index <= 11; index += 1) {
    await expectCreatedResponse(await page.request.post(new URL("/api/discussions", page.url()).href, {
      data: {
        title: `Placeholder discussion ${String(index).padStart(2, "0")}`,
        body: `Placeholder body ${index}`,
      },
    }));
  }

  const firstPage = await expectJson(await page.request.get(
    new URL("/api/discussions?page=1&limit=10", page.url()).href,
  ));
  const firstPageTitle = firstPage.data[0].title as string;
  const secondPage = await expectJson(await page.request.get(
    new URL("/api/discussions?page=2&limit=10", page.url()).href,
  ));
  const secondPageTitle = secondPage.data[0].title as string;

  await page.goto("/app/discussions", { waitUntil: "networkidle" });
  await expect(page.getByText(firstPageTitle)).toBeVisible();

  const requestStarted = deferred();
  const responseRelease = deferred();
  let holdPageTwo = true;
  await page.route(/\/api\/discussions(?:\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    if (holdPageTwo && route.request().method() === "GET" && url.searchParams.get("page") === "2") {
      holdPageTwo = false;
      requestStarted.resolve();
      await responseRelease.promise;
    }
    await route.continue();
  });

  await page.getByRole("button", { name: "2", exact: true }).click();
  await requestStarted.promise;
  await expect(page.getByText(firstPageTitle)).toBeVisible();
  await expect(page.getByRole("status", { name: "Refreshing discussions" })).toBeVisible();

  responseRelease.resolve();
  await expect(page.getByText(secondPageTitle)).toBeVisible();
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
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

test("create completes before the list invalidation settles", { tag: ["@discussions", "@mutation-refresh"] }, async ({ page }) => {
  await registerIsolatedUser(page, "mutation-order");
  await page.goto("/app/discussions", { waitUntil: "networkidle" });

  const requestStarted = deferred();
  const responseRelease = deferred();
  let holdRefresh = false;
  await page.route(/\/api\/discussions(?:\?.*)?$/, async (route) => {
    if (holdRefresh && route.request().method() === "GET") {
      holdRefresh = false;
      requestStarted.resolve();
      await responseRelease.promise;
    }
    await route.continue();
  });

  const marker = `Ordered discussion ${Date.now()}`;
  holdRefresh = true;
  await page.getByRole("button", { name: "Create Discussion" }).click();
  const drawer = page.getByRole("dialog", { name: "Create Discussion" });
  await drawer.getByLabel("Title").fill(marker);
  await drawer.getByLabel("Body").fill("Mutation ordering body");
  await drawer.getByRole("button", { name: "Submit" }).click();

  await requestStarted.promise;
  await expect(page.getByLabel("Discussion Created")).toBeVisible();
  await expect(drawer).toHaveCount(0);
  await expect(page.getByRole("status", { name: "Refreshing discussions" })).toBeVisible();

  responseRelease.resolve();
  await expect(page.getByText(marker)).toBeVisible();
  await expect(page.getByRole("status", { name: "Refreshing discussions" })).toHaveCount(0);
});

test("fast list invalidation does not show a background loading indicator", { tag: ["@discussions", "@mutation-refresh"] }, async ({ page }) => {
  await registerIsolatedUser(page, "fast-mutation-refresh");
  await page.goto("/app/discussions", { waitUntil: "networkidle" });

  const refreshStarted = deferred();
  const refreshFinished = deferred();
  let holdRefresh = false;
  await page.route(/\/api\/discussions(?:\?.*)?$/, async (route) => {
    if (holdRefresh && route.request().method() === "GET") {
      holdRefresh = false;
      refreshStarted.resolve();
      await new Promise(resolve => setTimeout(resolve, 50));
      await route.continue();
      refreshFinished.resolve();
      return;
    }
    await route.continue();
  });

  holdRefresh = true;
  await page.getByRole("button", { name: "Create Discussion" }).click();
  const drawer = page.getByRole("dialog", { name: "Create Discussion" });
  await drawer.getByLabel("Title").fill(`Fast refresh ${Date.now()}`);
  await drawer.getByLabel("Body").fill("Fast refresh body");
  await drawer.getByRole("button", { name: "Submit" }).click();

  await refreshStarted.promise;
  await refreshFinished.promise;
  await expect(page.getByRole("status", { name: "Refreshing discussions" })).toHaveCount(0);
});

test("create keeps write success when list invalidation shows a shared notification", { tag: ["@discussions", "@mutation-refresh"] }, async ({ page }) => {
  await registerIsolatedUser(page, "mutation-refresh-failure");
  await page.goto("/app/discussions", { waitUntil: "networkidle" });

  const marker = `Refresh failure discussion ${Date.now()}`;
  const refreshStarted = deferred();
  const responseRelease = deferred();
  await page.route(/\/api\/discussions(?:\?.*)?$/, async (route) => {
    if (route.request().method() === "GET") {
      refreshStarted.resolve();
      await responseRelease.promise;
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Discussions refresh failed" }),
      });
      return;
    }
    await route.continue();
  });

  await page.getByRole("button", { name: "Create Discussion" }).click();
  const drawer = page.getByRole("dialog", { name: "Create Discussion" });
  await drawer.getByLabel("Title").fill(marker);
  await drawer.getByLabel("Body").fill("Refresh failure body");
  await drawer.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByLabel("Discussion Created")).toBeVisible();
  await expect(drawer).toHaveCount(0);
  await refreshStarted.promise;
  responseRelease.resolve();
  await expect(page.getByRole("alert", { name: "Error" })).toBeVisible();
});

test("update failure keeps the drawer retryable with one error notification", { tag: ["@discussions", "@mutation"] }, async ({ page }) => {
  await registerIsolatedUser(page, "update-failure");
  const discussion = await createDiscussion(page, `Update failure ${Date.now()}`);
  await page.goto(`/app/discussions/${discussion.id}`, { waitUntil: "networkidle" });
  await page.route((url) => {
    return url.pathname === `/api/discussions/${discussion.id}`
      && url.searchParams.toString() === ""
      && url.pathname.endsWith(discussion.id);
  }, async (route) => {
    if (route.request().method() === "PATCH") {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Discussion update failed" }),
      });
      return;
    }
    await route.continue();
  });

  await page.getByRole("button", { name: "Update Discussion" }).click();
  const drawer = page.getByRole("dialog", { name: "Update Discussion" });
  await drawer.getByLabel("Title").fill("Retryable update");
  await drawer.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByLabel("Error")).toHaveCount(1);
  await expect(page.getByText("Discussion update failed")).toHaveCount(1);
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("button", { name: "Submit" })).toBeEnabled();
  await expect(drawer.getByLabel("Title")).toHaveValue("Retryable update");
});

test("update completes before detail synchronization settles", { tag: ["@discussions", "@mutation-refresh"] }, async ({ page }) => {
  await registerIsolatedUser(page, "update-order");
  const discussion = await createDiscussion(page, `Update ordering ${Date.now()}`);
  await page.goto(`/app/discussions/${discussion.id}`, { waitUntil: "networkidle" });

  const refreshStarted = deferred();
  const refreshRelease = deferred();
  let holdRefresh = false;
  await page.route(url => url.pathname === `/api/discussions/${discussion.id}`, async (route) => {
    if (holdRefresh && route.request().method() === "GET") {
      holdRefresh = false;
      refreshStarted.resolve();
      await refreshRelease.promise;
    }
    await route.continue();
  });

  holdRefresh = true;
  await page.getByRole("button", { name: "Update Discussion" }).click();
  const drawer = page.getByRole("dialog", { name: "Update Discussion" });
  const updatedTitle = `${discussion.title} updated`;
  await drawer.getByLabel("Title").fill(updatedTitle);
  await drawer.getByRole("button", { name: "Submit" }).click();

  await refreshStarted.promise;
  await expect(page.getByLabel("Discussion Updated")).toBeVisible();
  await expect(drawer).toHaveCount(0);

  refreshRelease.resolve();
  await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();
});
