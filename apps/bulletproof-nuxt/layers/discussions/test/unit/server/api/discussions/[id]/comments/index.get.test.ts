import { expect } from "vitest";
import { createComment, createDiscussion, setupDiscussionTests } from "#layers/discussions/test/support/request";

const { test, request } = setupDiscussionTests();

// Success.

test("200: returns an empty page for a discussion with no comments", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await actors.member.request(`/api/discussions/${discussion.id}/comments`);

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0, hasMore: false } });
});

test("200: paginates only the selected discussion's comments with public authors and ISO datetimes", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);
  await createComment(db, discussion, actors.author.user, { createdAt: new Date("2026-01-01T00:00:00Z") });
  const middle = await createComment(db, discussion, actors.member.user, { createdAt: new Date("2026-01-02T00:00:00Z") });
  const newest = await createComment(db, discussion, actors.author.user, { createdAt: new Date("2026-01-03T00:00:00Z") });
  const other = await createDiscussion(db, actors.author.user);
  await createComment(db, other, actors.author.user, { createdAt: new Date("2026-01-04T00:00:00Z") });

  const path = `/api/discussions/${discussion.id}/comments`;

  const first = await actors.member.request(`${path}?page=1&limit=1`);

  expect(first.status).toBe(200);
  expect((await first.json()).items.map((item: { id: string }) => item.id)).toEqual([newest.id]);

  const response = await actors.member.request(`${path}?page=2&limit=1`);

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    items: [{
      ...middle,
      createdAt: middle.createdAt.toISOString(),
      updatedAt: middle.updatedAt.toISOString(),
      author: { id: actors.member.user.id, firstName: actors.member.user.firstName, lastName: actors.member.user.lastName },
    }],
    meta: { page: 2, limit: 1, total: 3, totalPages: 3, hasMore: true },
  });

  const last = await actors.member.request(`${path}?page=3&limit=1`);

  expect(last.status).toBe(200);
  expect((await last.json()).meta.hasMore).toBe(false);
});

test("200: returns an empty overflow page while preserving the discussion's total", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);
  const comment = await createComment(db, discussion, actors.author.user);

  const first = await actors.author.request(`/api/discussions/${discussion.id}/comments?page=1&limit=10`);

  expect(first.status).toBe(200);
  const pageOne = await first.json();
  expect(pageOne).toMatchObject({
    items: [{ id: comment.id }],
    meta: { page: 1, limit: 10, total: 1, totalPages: 1, hasMore: false },
  });
  expect(pageOne).not.toHaveProperty("data");

  const response = await actors.author.request(`/api/discussions/${discussion.id}/comments?page=2&limit=10`);

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    items: [],
    meta: { page: 2, limit: 10, total: 1, totalPages: 1, hasMore: false },
  });
});

// Authentication.

test("401: rejects an unauthenticated read of existing comments", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);
  await createComment(db, discussion, actors.author.user);

  const response = await request(`/api/discussions/${discussion.id}/comments`);

  expect(response.status).toBe(401);
});

// Resource scope.

test("404: conceals comments from an ADMIN in another team", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);
  await createComment(db, discussion, actors.author.user);

  const response = await actors.outsider.request(`/api/discussions/${discussion.id}/comments`);

  expect(response.status).toBe(404);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 404, statusMessage: "Discussion not found", message: "Discussion not found" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
});

test("404: rejects a missing parent discussion", async ({ actors }) => {
  const response = await actors.author.request("/api/discussions/missing/comments");

  expect(response.status).toBe(404);
});

test("404: rejects the obsolete flat comment list route", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);
  await createComment(db, discussion, actors.author.user);

  const response = await actors.admin.request(`/api/comments?discussionId=${discussion.id}`);

  expect(response.status).toBe(404);
});

// Validation.

test("400: rejects an excessive limit with the native error body", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await actors.author.request(`/api/discussions/${discussion.id}/comments?limit=101`);

  expect(response.status).toBe(400);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 400, statusMessage: "Invalid pagination parameters", message: "Invalid pagination parameters" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
});
