import type { Request } from "@playwright/test";
import { expect, test } from "@nuxt/test-utils/playwright";
import { createTeam, createAccount, createDiscussion, createComment } from "~~/test/e2e/support/factories";
import { login } from "~~/test/e2e/support/authentication";
import { gotoWithSsrHtml, waitForNuxtHydration } from "~~/test/e2e/support/nuxtNavigation";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

test("desktop and mobile navigation keep the discussion list accessible", { tag: ["@discussions", "@navigation"] }, async ({ page, baseURL }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "responsive-sidebar", team.id, "ADMIN");
  const { user } = account;
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);
  const marker = `Responsive discussion ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await createDiscussion(baseURL, user, marker);

  for (const { width, sidebarOpen } of [
    { width: 1280, sidebarOpen: "true" },
    { width: 390, sidebarOpen: "false" },
  ]) {
    await page.setViewportSize({ width, height: 844 });
    await page.context().addCookies([{
      name: "sidebar_state",
      value: sidebarOpen,
      url: page.url(),
    }]);
    await page.goto("/app/discussions");
    await waitForNuxtHydration(page);
    await expect(page.getByRole("main").getByText(marker, { exact: true })).toBeVisible();
    await expect(page.getByRole("main")).toHaveCount(1);
    if (width === 1280) {
      await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    }
  }

  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(0);
  await page.getByRole("button", { name: "Toggle Sidebar" }).click();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await page.getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Discussions" }).click();
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(0);
});

test("list URL pages survive direct entry, reload and history but not a plain list entry", { tag: ["@discussions", "@pagination"] }, async ({ page, baseURL }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "url-pagination", team.id, "ADMIN");
  const { user } = account;
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);
  const oldest = await createDiscussion(baseURL, user, "URL discussion 01", "URL body 1");
  for (let index = 2; index <= 11; index++) {
    await createDiscussion(baseURL, user, `URL discussion ${String(index).padStart(2, "0")}`, `URL body ${index}`);
  }
  const marker = oldest.title;
  await page.goto("/app/discussions?page=2");
  await waitForNuxtHydration(page);
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await expect(page.getByText(marker, { exact: true })).toBeVisible();

  await page.reload();
  await waitForNuxtHydration(page);
  await expect(page.getByText("Page 2 of 2")).toBeVisible();

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

test("creation from page two returns the URL and list to page one", { tag: ["@discussions", "@mutation-refresh"] }, async ({ page, baseURL }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "url-create", team.id, "ADMIN");
  const { user } = account;
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);
  for (let index = 1; index <= 11; index++) {
    await createDiscussion(baseURL, user, `Create page discussion ${index}`, `Create page body ${index}`);
  }
  // Visit page one before creating so a previously read page must also be refreshed.
  await page.goto("/app/discussions");
  await waitForNuxtHydration(page);
  await page.getByRole("button", { name: "Page 2", exact: true }).click();
  await expect(page).toHaveURL(/\/app\/discussions\?page=2$/);
  await expect(page.getByText("Page 2 of 2")).toBeVisible();

  await page.getByRole("button", { name: "Create Discussion" }).click();
  const drawer = page.getByRole("dialog", { name: "Create Discussion" });
  await drawer.getByLabel("Title").fill("Created from page two");
  await drawer.getByLabel("Body").fill("New discussion body");
  await drawer.getByRole("button", { name: "Submit" }).click();

  await expect(drawer).toBeHidden();
  await expect(page).toHaveURL(/\/app\/discussions$/);
  await expect(page.getByText("Page 1 of 2")).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: "Created from page two" })).toBeVisible();
});

test("direct discussion detail renders its title on the server and content after hydration", { tag: ["@discussions", "@ssr"] }, async ({ page, baseURL }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "ssr-discussion-detail", team.id, "ADMIN");
  const { user } = account;
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);
  const discussion = await createDiscussion(baseURL, user, `SSR discussion detail ${Date.now()}`);
  const commentBody = `SSR discussion comment ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await createComment(baseURL, user, discussion.id, commentBody);

  const { html } = await gotoWithSsrHtml(page, `/app/discussions/${discussion.id}`);
  const documentHtml = html
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  expect(documentHtml).toContain(discussion.title);
  await expect(page.getByRole("heading", { name: discussion.title })).toBeVisible();
  await expect(page.getByText(discussion.body)).toBeVisible();
  await expect(page.getByText(commentBody)).toBeVisible();
});

test("discussion markdown uses Typeset and sanitizes unsafe attributes", { tag: ["@discussions", "@markdown"] }, async ({ page, baseURL }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "typeset-markdown", team.id, "ADMIN");
  const { user } = account;
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);
  const title = `Typeset markdown ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const discussion = await createDiscussion(baseURL, user, title, `<img src="x" onerror="window.__unsafeMarkdown = true"> **Safe**`);

  await page.goto(`/app/discussions/${discussion.id}`, { waitUntil: "domcontentloaded" });
  const preview = page.locator(".typeset");
  await expect(preview.locator("strong")).toHaveText("Safe");
  await expect(preview.locator("img")).toHaveCount(1);
  expect(await preview.locator("img").getAttribute("onerror")).toBeNull();
  expect(await page.evaluate(() => (window as Window & { __unsafeMarkdown?: boolean }).__unsafeMarkdown)).toBeUndefined();
});

test("direct entry to a missing discussion shows a recoverable not-found page", { tag: ["@discussions", "@navigation"] }, async ({ page, baseURL, goto }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "direct-missing-discussion", team.id, "ADMIN");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);
  const discussionId = `missing-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const response = await goto(`/app/discussions/${discussionId}`, { waitUntil: "hydration" });
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
  await expect(page.locator("[data-sonner-toast][data-type=error]")).toHaveCount(0);

  await page.getByRole("button", { name: "Go to Home" }).click();
  await expect(page).toHaveURL("/");
});

test("client navigation to a missing discussion retains the notification", { tag: ["@discussions", "@navigation", "@initial-read"] }, async ({ page, baseURL }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "client-missing-discussion", team.id, "ADMIN");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);
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

test("rapid discussion page selection keeps the last selected page", { tag: ["@discussions", "@pagination"] }, async ({ page, baseURL }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "rapid-pagination", team.id, "ADMIN");
  const { user } = account;
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);

  const discussions: { title: string }[] = [];
  for (let index = 1; index <= 21; index += 1) {
    discussions.push(await createDiscussion(baseURL, user, `Rapid discussion ${String(index).padStart(2, "0")}`, `Rapid body ${index}`));
  }

  // Factory timestamps increase; newest-first pagination uses a page size of ten.
  const secondPageTitle = discussions[10]!.title;
  const thirdPageTitle = discussions[0]!.title;

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

test("page-2 last-row deletion returns to the previous page", { tag: ["@discussions", "@mutation-refresh"] }, async ({ page, baseURL }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "native-current-page", team.id, "ADMIN");
  const { user } = account;
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);

  const oldest = await createDiscussion(baseURL, user, "Native page discussion 01", "Native page body 1");
  for (let index = 2; index <= 11; index += 1) {
    await createDiscussion(baseURL, user, `Native page discussion ${String(index).padStart(2, "0")}`, `Native page body ${index}`);
  }
  const deletedTitle = oldest.title;

  await page.goto("/app/discussions", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Page 2", exact: true }).click();
  await expect(page.getByText("Page 2 of 2")).toBeVisible();
  await expect(page.getByText(deletedTitle)).toBeVisible();

  await page.getByRole("button", { name: `Open discussion actions for ${deletedTitle}` }).click();
  await page.getByRole("menuitem", { name: "Delete Discussion" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();

  await expect(page.locator("[data-sonner-toast][data-type=success]", { hasText: "Discussion Deleted" })).toHaveCount(1);
  await expect(page.getByText(deletedTitle)).toHaveCount(0);
  await expect(page.getByText("Page 1 of 1")).toBeVisible();
  await expect(page).toHaveURL(/\/app\/discussions$/);
});

test("unexpected discussion mutation failures open the error page", { tag: ["@discussions", "@mutation"] }, async ({ page, baseURL }) => {
  const team = await createTeam(baseURL);
  const account = await createAccount(baseURL, "mutation-failure", team.id, "ADMIN");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await login(page.request, baseURL, account);
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
