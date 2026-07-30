import { request as playwrightRequest, type APIRequestContext, type APIResponse, type Page } from "@playwright/test";
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

async function expectNativeError(response: APIResponse, status: number, statusMessage: string) {
  expect(response.status()).toBe(status);
  const body: unknown = await response.json();
  expect(body).toMatchObject({
    statusCode: status,
    statusMessage,
    message: statusMessage,
  });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
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

async function findCommentByBody(page: Page, discussionId: string, body: string) {
  const result: unknown = await expectJson(await page.request.get(
    new URL(`/api/comments?discussionId=${discussionId}&limit=100`, page.url()).href,
  ));
  if (!isApiRecord(result) || !Array.isArray(result.data)) {
    throw new Error("Test setup failed: comments response has invalid data");
  }

  const comment = result.data.find(item => isApiRecord(item) && item.body === body);
  if (!isApiRecord(comment)) {
    throw new Error(`Test setup failed: comment not found for body: ${body}`);
  }

  return comment;
}

function expectIsoString(value: unknown) {
  expect(typeof value).toBe("string");
  expect(new Date(value as string).toISOString()).toBe(value);
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

async function registerIsolatedAccount(page: Page, label: string, teamId?: string) {
  const unique = `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const teamName = teamId ? null : `Boundary ${unique}`;
  const request = await playwrightRequest.newContext({
    baseURL: new URL(page.url()).origin,
  });

  try {
    await expectCreatedResponse(await request.post("/api/auth/register", {
      data: {
        email: `${unique}@example.com`,
        firstName: "Boundary",
        lastName: "Evidence",
        password,
        teamId: teamId ?? null,
        teamName,
      },
    }));
    const session: unknown = await expectJson(await request.get("/api/_auth/session"));
    if (
      !isApiRecord(session)
      || !isApiRecord(session.user)
      || typeof session.user.id !== "string"
      || typeof session.user.email !== "string"
      || typeof session.user.teamId !== "string"
    ) {
      throw new Error("Test setup failed: registered account has an invalid session user");
    }

    return {
      request,
      teamName,
      user: {
        id: session.user.id,
        email: session.user.email,
        teamId: session.user.teamId,
      },
    };
  }
  catch (error) {
    await request.dispose();
    throw error;
  }
}

async function createSameTeamMember(page: Page, label: string) {
  const currentUser: unknown = await expectJson(await page.request.get(new URL("/api/_auth/session", page.url()).href));
  if (!isApiRecord(currentUser) || !isApiRecord(currentUser.user) || typeof currentUser.user.teamId !== "string") {
    throw new Error("Test setup failed: current user response has an invalid user.teamId");
  }

  const member = await registerIsolatedAccount(page, label, currentUser.user.teamId);

  try {
    return {
      id: member.user.id,
      email: member.user.email,
    };
  }
  finally {
    await member.request.dispose();
  }
}

async function expectUserPresent(request: APIRequestContext, userId: string) {
  const users: unknown = await expectJson(await request.get("/api/users"));
  expect(Array.isArray(users)).toBe(true);
  expect(users.some(user => isApiRecord(user) && user.id === userId)).toBe(true);
}

test("discussion and comment pagination enforce the route contract", { tag: ["@contract", "@discussions", "@comments"] }, async ({ page }) => {
  await registerIsolatedUser(page, "invalid-pagination");
  const discussion = await createDiscussion(page, `Invalid pagination ${Date.now()}`);
  await expectCreatedResponse(await page.request.post(new URL("/api/comments", page.url()).href, {
    data: { discussionId: discussion.id, body: "Pagination contract comment" },
  }));

  const routes = [
    { path: "/api/discussions", invalid: "page=1suffix" },
    { path: `/api/comments?discussionId=${discussion.id}`, invalid: "limit=101" },
  ];

  for (const { path, invalid } of routes) {
    const separator = path.includes("?") ? "&" : "?";
    const pageOne = await expectJson(await page.request.get(
      new URL(`${path}${separator}page=1&limit=10`, page.url()).href,
    ));
    expect(pageOne).toMatchObject({
      data: expect.any(Array),
      meta: { page: 1, limit: 10, total: 1, totalPages: 1, hasMore: false },
    });

    const overflow = await expectJson(await page.request.get(
      new URL(`${path}${separator}page=2&limit=10`, page.url()).href,
    ));
    expect(overflow).toEqual({
      data: [],
      meta: { page: 2, limit: 10, total: 1, totalPages: 1, hasMore: false },
    });

    await expectNativeError(await page.request.get(
      new URL(`${path}${separator}${invalid}`, page.url()).href,
    ), 400, "Invalid pagination parameters");
  }
});

test("app errors use native minimal bodies and bounded auth statuses", { tag: ["@contract", "@auth"] }, async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const unique = `native-errors-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = `${unique}@example.com`;

  await expectNativeError(await page.request.post(new URL("/api/auth/register", page.url()).href, {
    data: {},
  }), 400, "Invalid registration");
  await expectNativeError(await page.request.post(new URL("/api/auth/register", page.url()).href, {
    data: {
      email,
      firstName: "Missing",
      lastName: "Team",
      password,
      teamId: `missing-${unique}`,
      teamName: null,
    },
  }), 404, "Team not found");

  await expectEmptyResponse(await page.request.post(new URL("/api/auth/register", page.url()).href, {
    data: {
      email,
      firstName: "Native",
      lastName: "Error",
      password,
      teamId: null,
      teamName: `Native ${unique}`,
    },
  }), 201);
  await expectNativeError(await page.request.post(new URL("/api/auth/register", page.url()).href, {
    data: {
      email,
      firstName: "Duplicate",
      lastName: "Email",
      password,
      teamId: null,
      teamName: `Duplicate ${unique}`,
    },
  }), 409, "Email already registered");
  await expectNativeError(await page.request.post(new URL("/api/auth/login", page.url()).href, {
    data: { email, password: "WrongPassword123!" },
  }), 401, "Invalid email or password");
});

test("duplicate profile email is a conflict and keeps the current profile", { tag: ["@contract", "@profile"] }, async ({ page }) => {
  await registerIsolatedUser(page, "duplicate-profile");
  const session = await expectJson(await page.request.get(new URL("/api/_auth/session", page.url()).href));
  const member = await registerIsolatedAccount(page, "duplicate-profile-member", session.user.teamId as string);

  try {
    await expectNativeError(await page.request.patch(new URL("/api/profile", page.url()).href, {
      data: {
        email: member.user.email,
        firstName: "Duplicate",
        lastName: "Profile",
        bio: "Must remain unchanged",
      },
    }), 409, "Email already in use");
    const unchanged = await expectJson(await page.request.get(new URL("/api/_auth/session", page.url()).href));
    expect(unchanged.user.email).toBe(session.user.email);
  }
  finally {
    await member.request.dispose();
  }
});

test("user deletion is confined to the admin team", { tag: ["@contract", "@users"] }, async ({ page }) => {
  await registerIsolatedUser(page, "delete-boundary-admin");
  const adminSession = await expectJson(await page.request.get(new URL("/api/_auth/session", page.url()).href));
  const sameTeam = await registerIsolatedAccount(page, "delete-boundary-same", adminSession.user.teamId as string);
  const nonAdmin = await registerIsolatedAccount(page, "delete-boundary-non-admin", adminSession.user.teamId as string);
  const crossTeam = await registerIsolatedAccount(page, "delete-boundary-cross");

  try {
    await expectNativeError(await nonAdmin.request.get("/api/users"), 403, "Admin access required");
    await expectNativeError(await nonAdmin.request.delete(`/api/users/${sameTeam.user.id}`), 403, "Admin access required");
    await expectUserPresent(page.request, sameTeam.user.id);
    await expectNativeError(await page.request.delete(
      new URL(`/api/users/missing-${Date.now()}`, page.url()).href,
    ), 404, "User not found");
    await expectNativeError(await page.request.delete(
      new URL(`/api/users/${crossTeam.user.id}`, page.url()).href,
    ), 404, "User not found");
    await expectUserPresent(crossTeam.request, crossTeam.user.id);
    await expectNativeError(await page.request.delete(
      new URL(`/api/users/${adminSession.user.id as string}`, page.url()).href,
    ), 409, "Cannot delete your own account");

    await expectEmptyResponse(await page.request.delete(
      new URL(`/api/users/${sameTeam.user.id}`, page.url()).href,
    ), 204);
    const remaining: unknown = await expectJson(await page.request.get(new URL("/api/users", page.url()).href));
    expect(Array.isArray(remaining)).toBe(true);
    expect(remaining.some(user => isApiRecord(user) && user.id === sameTeam.user.id)).toBe(false);
  }
  finally {
    await Promise.all([
      sameTeam.request.dispose(),
      nonAdmin.request.dispose(),
      crossTeam.request.dispose(),
    ]);
  }
});

test("completion-only mutations return explicit status with an empty body", { tag: ["@contract", "@cross-domain"] }, async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const unique = `bodyless-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const email = `${unique}@example.com`;

  await expectEmptyResponse(await page.request.post(new URL("/api/auth/register", page.url()).href, {
    data: {
      email,
      firstName: "Bodyless",
      lastName: "Contract",
      password,
      teamId: null,
      teamName: `Bodyless ${unique}`,
    },
  }), 201);
  const anonymousRequest = await playwrightRequest.newContext({
    baseURL: new URL(page.url()).origin,
  });
  try {
    await expectEmptyResponse(await anonymousRequest.post("/api/auth/login", {
      data: { email, password },
    }), 204);
    const loggedIn = await expectJson(await anonymousRequest.get("/api/_auth/session"));
    expect(loggedIn.user.email).toBe(email);
  }
  finally {
    await anonymousRequest.dispose();
  }

  const discussionTitle = `Bodyless discussion ${unique}`;
  await expectEmptyResponse(await page.request.post(new URL("/api/discussions", page.url()).href, {
    data: { title: discussionTitle, body: "Bodyless discussion body" },
  }), 201);
  const discussion = await findDiscussionByTitle(page, discussionTitle);
  const discussionId = discussion.id as string;

  const commentBody = `Bodyless comment ${unique}`;
  await expectEmptyResponse(await page.request.post(new URL("/api/comments", page.url()).href, {
    data: { discussionId, body: commentBody },
  }), 201);
  const comment = await findCommentByBody(page, discussionId, commentBody);
  expect(typeof comment.id).toBe("string");

  await expectEmptyResponse(await page.request.patch(
    new URL(`/api/discussions/${discussionId}`, page.url()).href,
    { data: { title: `${discussionTitle} updated`, body: "Updated bodyless discussion body" } },
  ), 204);
  const updatedDiscussion = await expectJson(await page.request.get(
    new URL(`/api/discussions/${discussionId}`, page.url()).href,
  ));
  expect(updatedDiscussion.title).toBe(`${discussionTitle} updated`);

  await expectEmptyResponse(await page.request.delete(
    new URL(`/api/comments/${comment.id as string}`, page.url()).href,
  ), 204);

  await expectEmptyResponse(await page.request.patch(new URL("/api/profile", page.url()).href, {
    data: {
      email,
      firstName: "Updated",
      lastName: "Contract",
      bio: "Bodyless profile update",
    },
  }), 204);
  const updatedSession = await expectJson(await page.request.get(new URL("/api/_auth/session", page.url()).href));
  expect(updatedSession.user.firstName).toBe("Updated");

  const member = await createSameTeamMember(page, "bodyless-user-delete");
  await expectEmptyResponse(await page.request.delete(
    new URL(`/api/users/${member.id}`, page.url()).href,
  ), 204);
  await expectEmptyResponse(await page.request.delete(
    new URL(`/api/discussions/${discussionId}`, page.url()).href,
  ), 204);
});

test("datetime fields are actual JSON ISO strings across auth, teams, users, discussions, and comments", { tag: ["@contract", "@cross-domain"] }, async ({ page }) => {
  const { unique } = await registerIsolatedUser(page, "datetime");
  const registered = await expectJson(await page.request.get(new URL("/api/_auth/session", page.url()).href));
  expectIsoString(registered.user.createdAt);

  const teams = await expectJson(await page.request.get(new URL("/api/teams", page.url()).href));
  expectIsoString(teams[0].createdAt);
  expectIsoString(teams[0].updatedAt);

  const users = await expectJson(await page.request.get(new URL("/api/users", page.url()).href));
  expect(Array.isArray(users)).toBe(true);
  expect(users).not.toHaveProperty("data");
  expectIsoString(users[0].createdAt);

  const discussionTitle = `Datetime discussion ${unique}`;
  await expectCreatedResponse(await page.request.post(
    new URL("/api/discussions", page.url()).href,
    { data: { title: discussionTitle, body: "Datetime body" } },
  ));
  const listedDiscussion = await findDiscussionByTitle(page, discussionTitle);
  expectIsoString(listedDiscussion.createdAt);
  expectIsoString(listedDiscussion.updatedAt);
  const discussionId = listedDiscussion.id;

  const detail = await expectJson(await page.request.get(
    new URL(`/api/discussions/${discussionId}`, page.url()).href,
  ));
  expect(detail).not.toHaveProperty("discussion");
  expectIsoString(detail.createdAt);
  expectIsoString(detail.updatedAt);

  await expectEmptyResponse(await page.request.patch(
    new URL(`/api/discussions/${discussionId}`, page.url()).href,
    { data: { title: "Updated datetime discussion", body: "Updated datetime body" } },
  ), 204);
  const updatedDiscussion = await expectJson(await page.request.get(
    new URL(`/api/discussions/${discussionId}`, page.url()).href,
  ));
  expectIsoString(updatedDiscussion.createdAt);
  expectIsoString(updatedDiscussion.updatedAt);

  const commentBody = `Datetime comment ${unique}`;
  await expectCreatedResponse(await page.request.post(
    new URL("/api/comments", page.url()).href,
    { data: { discussionId, body: commentBody } },
  ));
  const listedComment = await findCommentByBody(page, discussionId, commentBody);
  expectIsoString(listedComment.createdAt);
  expectIsoString(listedComment.updatedAt);

  await expectEmptyResponse(await page.request.patch(
    new URL("/api/profile", page.url()).href,
    {
      data: {
        email: registered.user.email,
        firstName: "Datetime",
        lastName: "Evidence",
        bio: "Wire contract",
      },
    },
  ), 204);
  const updatedSession = await expectJson(await page.request.get(new URL("/api/_auth/session", page.url()).href));
  expectIsoString(updatedSession.user.createdAt);
});
