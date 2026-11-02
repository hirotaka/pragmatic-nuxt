import { expect } from "vitest";
import { json } from "~~/test/support/request";
import { createDiscussion, setupDiscussionTests } from "#layers/discussions/test/support/request";

const { test, request } = setupDiscussionTests();
const input = { title: "Updated discussion", body: "Updated discussion body" };

// Success.

test("204: lets the author update content without transferring ownership or team", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await actors.author.request(`/api/discussions/${discussion.id}`, json("PATCH", {
    ...input, authorId: actors.outsider.user.id, teamId: actors.outsider.user.teamId,
  }));

  expect(response.status).toBe(204);
  expect(await response.text()).toBe("");
  expect(await db.query.discussions.findMany()).toEqual([expect.objectContaining({
    id: discussion.id, ...input, authorId: discussion.authorId, teamId: discussion.teamId,
  })]);

  const read = await actors.author.request(`/api/discussions/${discussion.id}`);

  expect(read.status).toBe(200);
  const saved = await read.json();
  expect(saved).toMatchObject({
    id: discussion.id,
    ...input,
    createdAt: discussion.createdAt.toISOString(),
    updatedAt: expect.any(String),
  });
  expect(new Date(saved.updatedAt).toISOString()).toBe(saved.updatedAt);
});

// Authentication.

test("401: rejects an unauthenticated update without changing the discussion", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await request(`/api/discussions/${discussion.id}`, json("PATCH", input));

  expect(response.status).toBe(401);
  expect(await db.query.discussions.findMany()).toEqual([discussion]);
});

// Authorization.

test.for(["member", "admin"] as const)("403: forbids a same-team %s from updating another author's discussion", async (actor, { db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await actors[actor].request(`/api/discussions/${discussion.id}`, json("PATCH", input));

  expect(response.status).toBe(403);
  expect(await db.query.discussions.findMany()).toEqual([discussion]);
});

// Resource scope.

test("404: conceals another team's discussion and leaves it unchanged", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await actors.outsider.request(`/api/discussions/${discussion.id}`, json("PATCH", input));

  expect(response.status).toBe(404);
  expect(await db.query.discussions.findMany()).toEqual([discussion]);
});

test("404: rejects a missing discussion", async ({ actors }) => {
  const response = await actors.author.request("/api/discussions/missing", json("PATCH", input));

  expect(response.status).toBe(404);
});

// Validation.

test("400: rejects invalid content without changing the discussion", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await actors.author.request(`/api/discussions/${discussion.id}`, json("PATCH", { title: "" }));

  expect(response.status).toBe(400);
  expect(await db.query.discussions.findMany()).toEqual([discussion]);
});
