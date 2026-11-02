import { expect } from "vitest";
import { createComment, createDiscussion, setupDiscussionTests } from "#layers/discussions/test/support/request";

const { test, request } = setupDiscussionTests();

// Success.

test("204: lets the author delete a discussion and its comments without deleting other discussions", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);
  await createComment(db, discussion, actors.member.user);
  const other = await createDiscussion(db, actors.member.user);
  const otherComment = await createComment(db, other, actors.member.user);

  const response = await actors.author.request(`/api/discussions/${discussion.id}`, { method: "DELETE" });

  expect(response.status).toBe(204);
  expect(await response.text()).toBe("");
  expect(await db.query.discussions.findMany()).toEqual([other]);
  expect(await db.query.comments.findMany()).toEqual([otherComment]);
});

// Authentication.

test("401: rejects unauthenticated deletion and keeps the discussion", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await request(`/api/discussions/${discussion.id}`, { method: "DELETE" });

  expect(response.status).toBe(401);
  expect(await db.query.discussions.findMany()).toEqual([discussion]);
});

// Authorization.

test.for(["member", "admin"] as const)("403: forbids a same-team %s from deleting another author's discussion", async (actor, { db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await actors[actor].request(`/api/discussions/${discussion.id}`, { method: "DELETE" });

  expect(response.status).toBe(403);
  expect(await db.query.discussions.findMany()).toEqual([discussion]);
});

// Resource scope.

test("404: conceals another team's discussion and keeps it", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await actors.outsider.request(`/api/discussions/${discussion.id}`, { method: "DELETE" });

  expect(response.status).toBe(404);
  expect(await db.query.discussions.findMany()).toEqual([discussion]);
});

test("404: rejects a missing discussion", async ({ actors }) => {
  const response = await actors.author.request("/api/discussions/missing", { method: "DELETE" });

  expect(response.status).toBe(404);
});
