import { expect } from "vitest";
import { json } from "~~/test/support/request";
import { createDiscussion, setupDiscussionTests } from "#layers/discussions/test/support/request";

const { test, request } = setupDiscussionTests();
const input = { title: "Created discussion", body: "Created discussion body" };

// Success.

test("201: saves the authenticated author and team rather than client-supplied identities", async ({ db, actors }) => {
  const response = await actors.author.request("/api/discussions", json("POST", {
    ...input, authorId: actors.outsider.user.id, teamId: actors.outsider.user.teamId,
  }));

  expect(response.status).toBe(201);
  expect(await response.text()).toBe("");
  expect(await db.query.discussions.findMany()).toEqual([expect.objectContaining({
    ...input, authorId: actors.author.user.id, teamId: actors.author.user.teamId,
  })]);

  const read = await actors.author.request("/api/discussions");

  expect(read.status).toBe(200);
  const [created] = (await read.json()).items;
  expect(created).toMatchObject({
    ...input, authorId: actors.author.user.id, teamId: actors.author.user.teamId,
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  });
  expect(new Date(created.createdAt).toISOString()).toBe(created.createdAt);
  expect(new Date(created.updatedAt).toISOString()).toBe(created.updatedAt);
});
// Authentication.

test("401: rejects unauthenticated creation without saving a discussion", async ({ db }) => {
  const response = await request("/api/discussions", json("POST", input));

  expect(response.status).toBe(401);
  expect(await db.query.discussions.findMany()).toEqual([]);
});

// Validation.

test("400: rejects invalid input without changing existing discussions", async ({ db, actors }) => {
  const existing = await createDiscussion(db, actors.author.user);

  const response = await actors.author.request("/api/discussions", json("POST", { title: "", body: "" }));

  expect(response.status).toBe(400);
  expect(await db.query.discussions.findMany()).toEqual([existing]);
});
