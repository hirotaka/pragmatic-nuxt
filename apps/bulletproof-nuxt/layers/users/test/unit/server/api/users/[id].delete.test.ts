import { expect } from "vitest";
import { setupUserTests } from "#layers/users/test/support/request";

const { test, request } = setupUserTests();

// Success.

test("204: deletes a teammate and their related content while preserving unrelated rows", async ({ db, actors }) => {
  const { discussionFactory } = await import("~~/test/factories/discussion");
  const { commentFactory } = await import("~~/test/factories/comment");
  const memberDiscussion = await discussionFactory(db, { authorId: actors.member.user.id, teamId: actors.member.user.teamId }).create();
  const adminDiscussion = await discussionFactory(db, { authorId: actors.admin.user.id, teamId: actors.admin.user.teamId }).create();
  // Another author's comment disappears with the deleted user's discussion.
  await commentFactory(db, { discussionId: memberDiscussion.id, authorId: actors.admin.user.id }).create();
  // The deleted user's comment disappears even on a surviving discussion.
  await commentFactory(db, { discussionId: adminDiscussion.id, authorId: actors.member.user.id }).create();
  const retainedComment = await commentFactory(db, { discussionId: adminDiscussion.id, authorId: actors.admin.user.id }).create();
  const usersBefore = await db.query.users.findMany();
  const teamsBefore = await db.query.teams.findMany();

  const response = await actors.admin.request(`/api/users/${actors.member.user.id}`, { method: "DELETE" });

  expect(response.status).toBe(204);
  expect(await response.text()).toBe("");
  expect(await db.query.users.findMany()).toEqual(usersBefore.filter(user => user.id !== actors.member.user.id));
  expect(await db.query.discussions.findMany()).toEqual([adminDiscussion]);
  expect(await db.query.comments.findMany()).toEqual([retainedComment]);
  expect(await db.query.teams.findMany()).toEqual(teamsBefore);
});

// Authentication.

test("401: rejects unauthenticated deletion without changing users", async ({ db, actors }) => {
  const before = await db.query.users.findMany();

  const response = await request(`/api/users/${actors.member.user.id}`, { method: "DELETE" });

  expect(response.status).toBe(401);
  expect(await db.query.users.findMany()).toEqual(before);
});

// Authorization.

test("403: forbids a USER from deleting a teammate", async ({ db, actors }) => {
  const before = await db.query.users.findMany();

  const response = await actors.member.request(`/api/users/${actors.admin.user.id}`, { method: "DELETE" });

  expect(response.status).toBe(403);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 403, statusMessage: "Admin access required", message: "Admin access required" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
  expect(await db.query.users.findMany()).toEqual(before);
});

// Resource scope.

test("404: conceals another team's user and leaves all users unchanged", async ({ db, actors }) => {
  const before = await db.query.users.findMany();

  const response = await actors.admin.request(`/api/users/${actors.outsider.user.id}`, { method: "DELETE" });

  expect(response.status).toBe(404);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 404, statusMessage: "User not found", message: "User not found" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
  expect(await db.query.users.findMany()).toEqual(before);
});

test("404: rejects a missing user without changing users", async ({ db, actors }) => {
  const before = await db.query.users.findMany();

  const response = await actors.admin.request("/api/users/missing", { method: "DELETE" });

  expect(response.status).toBe(404);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 404, statusMessage: "User not found", message: "User not found" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
  expect(await db.query.users.findMany()).toEqual(before);
});

// Conflicts.

test("409: prevents an ADMIN from deleting their own account", async ({ db, actors }) => {
  const before = await db.query.users.findMany();

  const response = await actors.admin.request(`/api/users/${actors.admin.user.id}`, { method: "DELETE" });

  expect(response.status).toBe(409);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 409, statusMessage: "Cannot delete your own account", message: "Cannot delete your own account" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
  expect(await db.query.users.findMany()).toEqual(before);
});
