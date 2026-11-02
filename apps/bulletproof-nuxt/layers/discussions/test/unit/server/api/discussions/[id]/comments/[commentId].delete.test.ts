import { expect } from "vitest";
import { createComment, createDiscussion, setupDiscussionTests } from "#layers/discussions/test/support/request";

const { test, request } = setupDiscussionTests();

// Success.

test.for(["author", "admin"] as const)("204: allows the %s to delete the comment without deleting another comment", async (actor, { db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);
  const comment = await createComment(db, discussion, actors.author.user);
  const other = await createComment(db, discussion, actors.member.user);

  const response = await actors[actor].request(`/api/discussions/${discussion.id}/comments/${comment.id}`, { method: "DELETE" });

  expect(response.status).toBe(204);
  expect(await response.text()).toBe("");
  expect(await db.query.comments.findMany()).toEqual([other]);
  expect(await db.query.discussions.findMany()).toEqual([discussion]);
});

// Authentication.

test("401: rejects unauthenticated deletion and keeps the comment", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);
  const comment = await createComment(db, discussion, actors.author.user);

  const response = await request(`/api/discussions/${discussion.id}/comments/${comment.id}`, { method: "DELETE" });

  expect(response.status).toBe(401);
  expect(await db.query.comments.findMany()).toEqual([comment]);
});

// Authorization.

test("403: forbids a same-team USER from deleting another author's comment", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);
  const comment = await createComment(db, discussion, actors.author.user);

  const response = await actors.member.request(`/api/discussions/${discussion.id}/comments/${comment.id}`, { method: "DELETE" });

  expect(response.status).toBe(403);
  expect(await db.query.comments.findMany()).toEqual([comment]);
});

// Resource scope.

test("404: conceals the comment from another team's ADMIN and keeps it", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);
  const comment = await createComment(db, discussion, actors.author.user);

  const response = await actors.outsider.request(`/api/discussions/${discussion.id}/comments/${comment.id}`, { method: "DELETE" });

  expect(response.status).toBe(404);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 404, statusMessage: "Discussion not found", message: "Discussion not found" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
  expect(await db.query.comments.findMany()).toEqual([comment]);
});

test("404: rejects a comment belonging to a different discussion without deleting it", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);
  const other = await createDiscussion(db, actors.author.user);
  const comment = await createComment(db, other, actors.author.user);

  const response = await actors.author.request(`/api/discussions/${discussion.id}/comments/${comment.id}`, { method: "DELETE" });

  expect(response.status).toBe(404);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 404, statusMessage: "Comment not found", message: "Comment not found" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
  expect(await db.query.comments.findMany()).toEqual([comment]);
});

test("404: rejects a missing comment without deleting an existing comment", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);
  const comment = await createComment(db, discussion, actors.author.user);

  const response = await actors.author.request(`/api/discussions/${discussion.id}/comments/missing`, { method: "DELETE" });

  expect(response.status).toBe(404);
  expect(await db.query.comments.findMany()).toEqual([comment]);
});

test("404: rejects a missing parent without deleting an existing comment", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);
  const comment = await createComment(db, discussion, actors.author.user);

  const response = await actors.author.request(`/api/discussions/missing/comments/${comment.id}`, { method: "DELETE" });

  expect(response.status).toBe(404);
  expect(await db.query.comments.findMany()).toEqual([comment]);
});

test("404: rejects the obsolete flat comment deletion route without deleting the comment", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);
  const comment = await createComment(db, discussion, actors.author.user);

  const response = await actors.admin.request(`/api/comments/${comment.id}`, { method: "DELETE" });

  expect(response.status).toBe(404);
  expect(await db.query.comments.findMany()).toEqual([comment]);
});
