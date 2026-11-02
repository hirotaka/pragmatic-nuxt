import { expect } from "vitest";
import { json } from "~~/test/support/request";
import { createDiscussion, setupDiscussionTests } from "#layers/discussions/test/support/request";

const { test, request } = setupDiscussionTests();
const input = { body: "Created comment" };

// Success.

test("201: lets a team member comment using the authenticated author and route's discussion", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);
  const other = await createDiscussion(db, actors.outsider.user);

  const response = await actors.member.request(`/api/discussions/${discussion.id}/comments`, json("POST", {
    ...input, authorId: actors.outsider.user.id, discussionId: other.id,
  }));

  expect(response.status).toBe(201);
  expect(await response.text()).toBe("");
  expect(await db.query.comments.findMany()).toEqual([expect.objectContaining({
    ...input, authorId: actors.member.user.id, discussionId: discussion.id,
  })]);

  const read = await actors.member.request(`/api/discussions/${discussion.id}/comments`);

  expect(read.status).toBe(200);
  const [created] = (await read.json()).items;
  expect(created).toMatchObject({
    ...input, authorId: actors.member.user.id, discussionId: discussion.id,
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  });
  expect(new Date(created.createdAt).toISOString()).toBe(created.createdAt);
  expect(new Date(created.updatedAt).toISOString()).toBe(created.updatedAt);
});
// Authentication.

test("401: rejects unauthenticated creation without saving a comment", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await request(`/api/discussions/${discussion.id}/comments`, json("POST", input));

  expect(response.status).toBe(401);
  expect(await db.query.comments.findMany()).toEqual([]);
});

// Resource scope.

test("404: conceals another team's discussion without saving a comment", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await actors.outsider.request(`/api/discussions/${discussion.id}/comments`, json("POST", input));

  expect(response.status).toBe(404);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 404, statusMessage: "Discussion not found", message: "Discussion not found" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
  expect(await db.query.comments.findMany()).toEqual([]);
});

test("404: rejects a missing parent without saving a comment", async ({ db, actors }) => {
  const response = await actors.author.request("/api/discussions/missing/comments", json("POST", input));

  expect(response.status).toBe(404);
  expect(await db.query.comments.findMany()).toEqual([]);
});

test("404: rejects the obsolete flat comment creation route without saving a comment", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await actors.admin.request("/api/comments", json("POST", { discussionId: discussion.id, body: "Legacy request" }));

  expect(response.status).toBe(404);
  expect(await db.query.comments.findMany()).toEqual([]);
});

// Validation.

test("400: rejects invalid input without saving a comment", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await actors.author.request(`/api/discussions/${discussion.id}/comments`, json("POST", { body: "" }));

  expect(response.status).toBe(400);
  expect(await db.query.comments.findMany()).toEqual([]);
});
