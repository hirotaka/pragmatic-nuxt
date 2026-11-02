import { expect } from "vitest";
import { createDiscussion, setupDiscussionTests } from "#layers/discussions/test/support/request";

const { test, request } = setupDiscussionTests();

// Success.

test("200: allows another team member to read the public discussion and author", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await actors.member.request(`/api/discussions/${discussion.id}`);

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    ...discussion,
    createdAt: discussion.createdAt.toISOString(),
    updatedAt: discussion.updatedAt.toISOString(),
    author: { id: actors.author.user.id, firstName: actors.author.user.firstName, lastName: actors.author.user.lastName },
  });
});

// Authentication.

test("401: rejects an unauthenticated read of an existing discussion", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await request(`/api/discussions/${discussion.id}`);

  expect(response.status).toBe(401);
});

// Resource scope.

test("404: conceals another team's discussion even from an ADMIN", async ({ db, actors }) => {
  const discussion = await createDiscussion(db, actors.author.user);

  const response = await actors.outsider.request(`/api/discussions/${discussion.id}`);

  expect(response.status).toBe(404);
});

test("404: rejects a missing discussion", async ({ actors }) => {
  const response = await actors.author.request("/api/discussions/missing");

  expect(response.status).toBe(404);
});
