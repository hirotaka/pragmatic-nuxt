import { expect } from "vitest";
import { createDiscussion, setupDiscussionTests } from "#layers/discussions/test/support/request";

const { test, request } = setupDiscussionTests();

// Success.

test("200: returns an empty page for a team with no discussions", async ({ actors }) => {
  const response = await actors.author.request("/api/discussions");

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0, hasMore: false } });
});

test("200: paginates newest-first within the current team and returns the public author shape", async ({ db, actors }) => {
  await createDiscussion(db, actors.author.user, { title: "Oldest", createdAt: new Date("2026-01-01T00:00:00Z") });
  const middle = await createDiscussion(db, actors.member.user, { title: "Middle", createdAt: new Date("2026-01-02T00:00:00Z") });
  const newest = await createDiscussion(db, actors.author.user, { title: "Newest", createdAt: new Date("2026-01-03T00:00:00Z") });
  await createDiscussion(db, actors.outsider.user, { title: "Other team", createdAt: new Date("2026-01-04T00:00:00Z") });

  const first = await actors.author.request("/api/discussions?page=1&limit=1");

  expect(first.status).toBe(200);
  expect((await first.json()).items.map((item: { id: string }) => item.id)).toEqual([newest.id]);

  const response = await actors.author.request("/api/discussions?page=2&limit=1");

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

  const last = await actors.author.request("/api/discussions?page=3&limit=1");

  expect(last.status).toBe(200);
  expect((await last.json()).meta.hasMore).toBe(false);
});

test("200: returns an empty overflow page while preserving the filtered total", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const first = await actors.author.request("/api/discussions?page=1&limit=10");

  expect(first.status).toBe(200);
  const pageOne = await first.json();
  expect(pageOne).toMatchObject({
    items: [{ id: discussion.id }],
    meta: { page: 1, limit: 10, total: 1, totalPages: 1, hasMore: false },
  });
  expect(pageOne).not.toHaveProperty("data");

  const response = await actors.author.request("/api/discussions?page=2&limit=10");

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    items: [],
    meta: { page: 2, limit: 10, total: 1, totalPages: 1, hasMore: false },
  });
});

// Authentication.

test("401: rejects unauthenticated requests", async () => {
  const response = await request("/api/discussions");

  expect(response.status).toBe(401);
});

// Validation.

test("400: rejects an invalid page with the native error body", async ({ actors }) => {
  const response = await actors.author.request("/api/discussions?page=1suffix");

  expect(response.status).toBe(400);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 400, statusMessage: "Invalid pagination parameters", message: "Invalid pagination parameters" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
});
