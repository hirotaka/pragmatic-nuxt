import type { Page, Request } from "@playwright/test";
import { expect, test } from "@nuxt/test-utils/playwright";
import { expectCreatedResponse, expectEmptyResponse, expectJson } from "./support/api-response";
import { gotoWithSsrHtml, waitForNuxtHydration } from "./support/nuxt-navigation";

const password = "Password123!";

async function registerIsolatedUser(page: Page, label: string) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const unique = `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await expectEmptyResponse(await page.request.post(new URL("/api/register", page.url()).href, {
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
  if (!isApiRecord(result) || !Array.isArray(result.items)) {
    throw new Error("Test setup failed: discussions response has invalid data");
  }

  const discussion = result.items.find(item => isApiRecord(item) && item.title === title);
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

test("responsive direct entry hydrates the SSR app shell and discussions without sidebar mismatches", { tag: ["@discussions", "@ssr"] }, async ({ page }) => {
  await registerIsolatedUser(page, "responsive-ssr-sidebar");
  const marker = `Mobile SSR discussion ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const discussion = await createDiscussion(page, marker);
  const hydrationWarnings: string[] = [];
  page.on("console", (message) => {
    if (/hydration/i.test(message.text())) hydrationWarnings.push(message.text());
  });

  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const sidebarOpen of ["true", "false"]) {
      await page.context().addCookies([{
        name: "sidebar_state",
        value: sidebarOpen,
        url: page.url(),
      }]);
      for (const path of ["/app", "/app/discussions", `/app/discussions/${discussion.id}`]) {
        const { html } = await gotoWithSsrHtml(page, path);
        expect(html).toContain("Primary navigation");
        if (path !== "/app") {
          expect(html).toContain(marker);
          await expect(page.getByRole("main").getByText(marker, { exact: true })).toBeVisible();
        }
        await expect(page.getByRole("main")).toHaveCount(1);
      }
    }
  }

  expect(hydrationWarnings).toEqual([]);
  await page.getByRole("button", { name: "Toggle Sidebar" }).click();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await page.getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Discussions" }).click();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(0);
  expect(hydrationWarnings).toEqual([]);
});

test("list URL pages survive SSR, reload and history but not a plain list entry", { tag: ["@discussions", "@ssr", "@pagination"] }, async ({ page }) => {
  await registerIsolatedUser(page, "url-pagination");
  for (let index = 1; index <= 11; index++) {
    await expectCreatedResponse(await page.request.post(new URL("/api/discussions", page.url()).href, {
      data: { title: `URL discussion ${index}`, body: `URL body ${index}` },
    }));
  }
  const secondPage = await expectJson(await page.request.get(
    new URL("/api/discussions?page=2&limit=10", page.url()).href,
  ));
  const marker = secondPage.items[0].title as string;
  const browserPages: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.method() === "GET" && url.pathname === "/api/discussions") {
      browserPages.push(url.searchParams.get("page") ?? "");
    }
  });

  const { html } = await gotoWithSsrHtml(page, "/app/discussions?page=2");
  const documentHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  expect(documentHtml).toContain(marker);
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await expect(page.getByText(marker, { exact: true })).toBeVisible();
  expect(browserPages).toEqual([]);

  await page.reload();
  await waitForNuxtHydration(page);
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  expect(browserPages).toEqual([]);

  await page.getByRole("button", { name: "Page 1", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/discussions$/);
  await expect(page.getByText("Page 1 of 2")).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/app\/discussions\?page=2$/);
  await expect(page.getByText(marker, { exact: true })).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/app\/discussions$/);
  await expect(page.getByText("Page 1 of 2")).toBeVisible();

  await page.getByRole("button", { name: "Page 2", exact: true }).click();
  await page.getByRole("row").filter({ hasText: marker }).getByRole("link", { name: "View" }).click();
  await expect(page.getByRole("heading", { name: marker })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/app\/discussions\?page=2$/);
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await page.getByRole("row").filter({ hasText: marker }).getByRole("link", { name: "View" }).click();
  await expect(page.getByRole("heading", { name: marker })).toBeVisible();
  await page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Discussions" }).click();
  await expect(page).toHaveURL(/\/app\/discussions$/);
  await expect(page.getByText("Page 1 of 2")).toBeVisible();
});

test("creation from page two returns the URL and list to page one", { tag: ["@discussions", "@mutation-refresh"] }, async ({ page }) => {
  await registerIsolatedUser(page, "url-create");
  for (let index = 1; index <= 11; index++) {
    await expectCreatedResponse(await page.request.post(new URL("/api/discussions", page.url()).href, {
      data: { title: `Create page discussion ${index}`, body: `Create page body ${index}` },
    }));
  }
  // Visit page one before creating so a previously read page must also be refreshed.
  await page.goto("/app/discussions");
  await waitForNuxtHydration(page);
  await page.getByRole("button", { name: "Page 2", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/discussions\?page=2$/);
  await expect(page.getByText("Page 2 of 2")).toBeVisible();

  const refreshPages: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.method() === "GET" && url.pathname === "/api/discussions") {
      refreshPages.push(url.searchParams.get("page") ?? "");
    }
  });
  await page.getByRole("button", { name: "Create Discussion" }).click();
  const drawer = page.getByRole("dialog", { name: "Create Discussion" });
  await drawer.getByLabel("Title").fill("Created from page two");
  await drawer.getByLabel("Body").fill("New discussion body");
  await drawer.getByRole("button", { name: "Submit" }).click();

  await expect(drawer).toBeHidden();
  await expect(page).toHaveURL(/\/app\/discussions$/);
  await expect(page.getByText("Page 1 of 2")).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: "Created from page two" })).toBeVisible();
  expect(refreshPages).toEqual(["1"]);
});

test("direct discussion detail is SSR-rendered without a hydration GET", { tag: ["@discussions", "@ssr"] }, async ({ page }) => {
  await registerIsolatedUser(page, "ssr-discussion-detail");
  const discussion = await createDiscussion(page, `SSR discussion detail ${Date.now()}`);
  const commentBody = `SSR discussion comment ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await expectCreatedResponse(await page.request.post(new URL(`/api/discussions/${discussion.id}/comments`, page.url()).href, {
    data: { body: commentBody },
  }));
  let browserDiscussionGets = 0;
  let browserCommentGets = 0;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.method() === "GET" && url.pathname === `/api/discussions/${discussion.id}`) {
      browserDiscussionGets += 1;
    }
    if (request.method() === "GET" && url.pathname === `/api/discussions/${discussion.id}/comments`) {
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

test("discussion markdown uses Typeset and sanitizes unsafe attributes", { tag: ["@discussions", "@markdown"] }, async ({ page }) => {
  await registerIsolatedUser(page, "typeset-markdown");
  const title = `Typeset markdown ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await expectCreatedResponse(await page.request.post(new URL("/api/discussions", page.url()).href, {
    data: { title, body: `<img src="x" onerror="window.__unsafeMarkdown = true"> **Safe**` },
  }));
  const discussion = await findDiscussionByTitle(page, title);

  await page.goto(`/app/discussions/${discussion.id}`, { waitUntil: "domcontentloaded" });
  const preview = page.locator(".typeset");
  await expect(preview.locator("strong")).toHaveText("Safe");
  await expect(preview.locator("img")).toHaveCount(1);
  expect(await preview.locator("img").getAttribute("onerror")).toBeNull();
  expect(await page.evaluate(() => (window as Window & { __unsafeMarkdown?: boolean }).__unsafeMarkdown)).toBeUndefined();
});

test("SSR detail failure renders the error page without a hydration GET or toast", { tag: ["@discussions", "@ssr"] }, async ({ page, goto }) => {
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
  expect(response?.status()).toBe(404);
  const html = await response!.text();
  expect(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")).toContain("Page Not Found");

  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
  await expect(page.locator("[data-sonner-toast][data-type=error]")).toHaveCount(0);
  expect(browserDiscussionGets).toBe(0);

  await page.getByRole("button", { name: "Go to Home" }).click();
  await expect(page).toHaveURL("/");
});

test("SSR failed and successful reads keep their error state separate", { tag: ["@discussions", "@ssr"] }, async ({ page }) => {
  await registerIsolatedUser(page, "ssr-error-isolation");
  const discussion = await createDiscussion(page, `SSR isolation ${Date.now()}`);
  const failedUrl = new URL("/app/discussions/missing-ssr-isolation", page.url()).href;
  const successfulUrl = new URL(`/app/discussions/${discussion.id}`, page.url()).href;

  const [failed, successful] = await Promise.all([
    page.request.get(failedUrl),
    page.request.get(successfulUrl),
  ]);
  expect(failed.status()).toBe(404);
  expect(successful.status()).toBe(200);
  expect(await successful.text()).toContain(discussion.title);
  expect((await page.request.get(successfulUrl)).status()).toBe(200);
});

test("client navigation to a missing discussion retains the notification", { tag: ["@discussions", "@navigation", "@initial-read"] }, async ({ page }) => {
  await registerIsolatedUser(page, "client-missing-discussion");
  await page.goto("/app", { waitUntil: "domcontentloaded" });
  await waitForNuxtHydration(page);

  const path = `/app/discussions/missing-${Date.now()}`;
  await page.evaluate(path => window.useNuxtApp?.().$router.push(path), path);

  await expect(page).toHaveURL(path);
  await expect(page.getByRole("heading", { name: "Discussion", exact: true })).toBeVisible();
  await expect(page.getByText("Discussion not found")).toBeVisible();
  await expect(page.locator("[data-sonner-toast][data-type=error]")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toHaveCount(0);
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
  await expectCreatedResponse(await page.request.post(new URL(`/api/discussions/${discussionB.id}/comments`, page.url()).href, {
    data: { body: discussionBComment },
  }));

  await page.goto(`/app/discussions/${discussionA.id}`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: discussionA.title })).toBeVisible();
  await expect(page).toHaveTitle(`${discussionA.title} | Bulletproof Nuxt`);

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
  await expect(page).toHaveTitle(`${discussionB.title} | Bulletproof Nuxt`);
  await expect(page.getByText(`${discussionB.title} body`)).toBeVisible();
  await expect(page.getByText(discussionBComment)).toBeVisible();
});

test("comment pagination starts at page one on detail screen entry", { tag: ["@discussions", "@navigation", "@pagination"] }, async ({ page }) => {
  await registerIsolatedUser(page, "comment-page-entry");
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const discussionA = await createDiscussion(page, `Paged comments A ${unique}`);
  const discussionB = await createDiscussion(page, `Paged comments B ${unique}`);

  for (let index = 1; index <= 11; index++) {
    await expectCreatedResponse(await page.request.post(new URL(`/api/discussions/${discussionA.id}/comments`, page.url()).href, {
      data: { body: `A comment ${index} ${unique}` },
    }));
  }
  const bComment = `B comment ${unique}`;
  await expectCreatedResponse(await page.request.post(new URL(`/api/discussions/${discussionB.id}/comments`, page.url()).href, {
    data: { body: bComment },
  }));

  await page.goto(`/app/discussions/${discussionA.id}`);
  await waitForNuxtHydration(page);
  await page.getByRole("button", { name: "Load More Comments" }).click();
  await expect(page.getByRole("list", { name: "comments" }).getByRole("listitem")).toHaveCount(11);

  const discussionsLink = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Discussions" });
  await discussionsLink.click();
  await page.getByRole("row").filter({ hasText: discussionA.title }).getByRole("link", { name: "View" }).click();
  await expect(page.getByRole("list", { name: "comments" }).getByRole("listitem")).toHaveCount(10);
  await expect(page.getByRole("button", { name: "Load More Comments" })).toBeVisible();

  await page.getByRole("button", { name: "Load More Comments" }).click();
  await expect(page.getByRole("list", { name: "comments" }).getByRole("listitem")).toHaveCount(11);
  const bReads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.method() === "GET" && url.pathname === `/api/discussions/${discussionB.id}/comments`) {
      bReads.push(url.search);
    }
  });
  await discussionsLink.click();
  await page.getByRole("row").filter({ hasText: discussionB.title }).getByRole("link", { name: "View" }).click();
  await expect(page.getByText(bComment)).toBeVisible();
  expect(bReads).toEqual(["?page=1&limit=10"]);
  await expect(page.getByText(`A comment 1 ${unique}`)).toHaveCount(0);
});

test("unexpected initial discussion read failures open the error page", { tag: ["@discussions", "@initial-read"] }, async ({ page }) => {
  await registerIsolatedUser(page, "initial-get");
  await page.goto("/app", { waitUntil: "networkidle" });
  await page.route(/\/api\/discussions(?:\?.*)?$/, async route => route.fulfill({
    status: 500,
    contentType: "application/json",
    body: JSON.stringify({ message: "Initial discussions GET failed" }),
  }));

  await page.getByRole("link", { name: "Discussions" }).click();

  await expect(page.getByRole("heading", { name: "500" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Something Went Wrong" })).toBeVisible();
  await expect(page.getByText("Something went wrong. Please try again.")).toBeVisible();
  await expect(page.getByText("Initial discussions GET failed")).toHaveCount(0);
  await expect(page.locator("[data-sonner-toast][data-type=error]")).toHaveCount(0);
});

test("rapid discussion page selection keeps the last selected page", { tag: ["@discussions", "@pagination"] }, async ({ page }) => {
  await registerIsolatedUser(page, "rapid-pagination");

  for (let index = 1; index <= 21; index += 1) {
    await expectCreatedResponse(await page.request.post(new URL("/api/discussions", page.url()).href, {
      data: {
        title: `Rapid discussion ${String(index).padStart(2, "0")}`,
        body: `Rapid body ${index}`,
      },
    }));
  }

  const secondPage = await expectJson(await page.request.get(
    new URL("/api/discussions?page=2&limit=10", page.url()).href,
  ));
  const thirdPage = await expectJson(await page.request.get(
    new URL("/api/discussions?page=3&limit=10", page.url()).href,
  ));
  const secondPageTitle = secondPage.items[0].title as string;
  const thirdPageTitle = thirdPage.items[0].title as string;

  await page.goto("/app/discussions", { waitUntil: "networkidle" });
  const secondPageStarted = deferred();
  const releaseSecondPage = deferred();
  const secondPageRouteHandled = deferred();
  const secondPageTerminal = deferred();
  const resolveSecondPageTerminal = (request: Request) => {
    const requestUrl = new URL(request.url());
    if (request.method() === "GET" && requestUrl.pathname === "/api/discussions" && requestUrl.searchParams.get("page") === "2") {
      secondPageTerminal.resolve();
    }
  };
  page.on("requestfinished", resolveSecondPageTerminal);
  page.on("requestfailed", resolveSecondPageTerminal);
  await page.route(/\/api\/discussions(?:\?.*)?$/, async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.searchParams.get("page") === "2") {
      secondPageStarted.resolve();
      await releaseSecondPage.promise;
      try {
        await route.continue();
      }
      finally {
        secondPageRouteHandled.resolve();
      }
      return;
    }
    await route.continue();
  });

  await page.getByRole("button", { name: "Page 2", exact: true }).click();
  await secondPageStarted.promise;
  await page.getByRole("button", { name: "Page 3", exact: true }).click();

  await expect(page.getByText("Page 3 of 3")).toBeVisible();
  await expect(page.getByText(thirdPageTitle)).toBeVisible();
  releaseSecondPage.resolve();
  await Promise.all([secondPageRouteHandled.promise, secondPageTerminal.promise]);

  await expect(page).toHaveURL(/\/app\/discussions\?page=3$/);
  await expect(page.getByText("Page 3 of 3")).toBeVisible();
  await expect(page.getByText(thirdPageTitle)).toBeVisible();
  await expect(page.getByText(secondPageTitle)).toHaveCount(0);
});

test("page-2 last-row deletion returns to the previous page", { tag: ["@discussions", "@mutation-refresh"] }, async ({ page }) => {
  await registerIsolatedUser(page, "native-current-page");

  for (let index = 1; index <= 11; index += 1) {
    await expectCreatedResponse(await page.request.post(new URL("/api/discussions", page.url()).href, {
      data: {
        title: `Native page discussion ${String(index).padStart(2, "0")}`,
        body: `Native page body ${index}`,
      },
    }));
  }

  const secondPage = await expectJson(await page.request.get(
    new URL("/api/discussions?page=2&limit=10", page.url()).href,
  ));
  expect(secondPage.items).toHaveLength(1);
  const deletedTitle = secondPage.items[0].title as string;

  await page.goto("/app/discussions", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Page 2", exact: true }).click();
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await expect(page.getByText(deletedTitle)).toBeVisible();

  const refreshPages: string[] = [];
  let deletionStarted = false;
  page.on("request", (request) => {
    const requestUrl = new URL(request.url());
    if (deletionStarted && request.method() === "GET" && requestUrl.pathname === "/api/discussions") {
      refreshPages.push(requestUrl.searchParams.get("page") ?? "");
    }
  });

  await page.getByRole("button", { name: `Open discussion actions for ${deletedTitle}` }).click();
  await page.getByRole("menuitem", { name: "Delete Discussion" }).click();
  deletionStarted = true;
  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await expect(page.locator("[data-sonner-toast][data-type=success]", { hasText: "Discussion Deleted" })).toHaveCount(1);
  await expect(page.getByText(deletedTitle)).toHaveCount(0);
  await expect(page.getByText("Page 1 of 1")).toBeVisible();
  await expect(page).toHaveURL(/\/app\/discussions$/);
  expect(refreshPages).toEqual(["2", "1"]);
});

test("unexpected post-delete discussion refresh failures open the error page", { tag: ["@discussions", "@mutation-refresh"] }, async ({ page }) => {
  await registerIsolatedUser(page, "current-page-failure");

  for (let index = 1; index <= 11; index += 1) {
    await expectCreatedResponse(await page.request.post(new URL("/api/discussions", page.url()).href, {
      data: {
        title: `Current page failure ${String(index).padStart(2, "0")}`,
        body: `Current page failure body ${index}`,
      },
    }));
  }
  const secondPage = await expectJson(await page.request.get(
    new URL("/api/discussions?page=2&limit=10", page.url()).href,
  ));
  const deletedTitle = secondPage.items[0].title as string;

  await page.goto("/app/discussions", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Page 2", exact: true }).click();
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await expect(page.getByText(deletedTitle)).toBeVisible();

  let failCurrentPageRefresh = false;
  const refreshPages: string[] = [];
  await page.route(/\/api\/discussions(?:\?.*)?$/, async (route) => {
    const requestUrl = new URL(route.request().url());
    if (failCurrentPageRefresh) {
      refreshPages.push(requestUrl.searchParams.get("page") ?? "");
    }
    if (failCurrentPageRefresh && requestUrl.searchParams.get("page") === "2") {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Current page GET failed" }),
      });
      return;
    }
    await route.continue();
  });

  await page.getByRole("button", { name: `Open discussion actions for ${deletedTitle}` }).click();
  await page.getByRole("menuitem", { name: "Delete Discussion" }).click();
  failCurrentPageRefresh = true;
  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await expect(page.getByRole("heading", { name: "500" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Something Went Wrong" })).toBeVisible();
  await expect(page.getByText("Something went wrong. Please try again.")).toBeVisible();
  await expect(page.getByText("Current page GET failed")).toHaveCount(0);
  await expect(page.locator("[data-sonner-toast][data-type=error]")).toHaveCount(0);
  expect(refreshPages).toContain("2");
  expect(refreshPages).not.toContain("1");
});

test("unexpected discussion mutation failures open the error page", { tag: ["@discussions", "@mutation"] }, async ({ page }) => {
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

  await expect(page.getByRole("heading", { name: "500" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Something Went Wrong" })).toBeVisible();
  await expect(page.getByText("Something went wrong. Please try again.")).toBeVisible();
  await expect(page.getByText("Discussion creation failed")).toHaveCount(0);
  await expect(page.locator("[data-sonner-toast][data-type=error]")).toHaveCount(0);
});
