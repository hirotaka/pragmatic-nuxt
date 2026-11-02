import { expect } from "vitest";
import { json } from "~~/test/support/request";
import { setupUserTests } from "#layers/users/test/support/request";

const { test, request } = setupUserTests();
const input = { email: "updated@example.com", firstName: "Updated", lastName: "Profile", bio: "New bio" };

// Success.

test("204: updates only the current user's profile and ignores identity, privileges and password inputs", async ({ db, actors }) => {
  const before = await db.query.users.findMany();

  const response = await actors.member.request("/api/profile", json("PATCH", {
    ...input,
    id: actors.outsider.user.id,
    teamId: actors.outsider.user.teamId,
    role: "ADMIN",
    password: "ReplacementPassword123!",
    createdAt: "2030-01-01T00:00:00.000Z",
  }));

  expect(response.status).toBe(204);
  expect(await response.text()).toBe("");
  const after = await db.query.users.findMany();
  const updated = after.find(user => user.id === actors.member.user.id);
  expect(updated).toEqual({
    ...actors.member.user,
    ...input,
    updatedAt: expect.any(Date),
  });
  expect(after.filter(user => user.id !== actors.member.user.id)).toEqual(before.filter(user => user.id !== actors.member.user.id));

  const session = await actors.member.request("/api/_auth/session");

  expect(session.status).toBe(200);
  expect((await session.json()).user).toEqual({
    id: actors.member.user.id,
    ...input,
    role: "USER",
    teamId: actors.member.user.teamId,
    createdAt: "2026-01-02T00:00:00.000Z",
  });
});

test("204: accepts the unchanged email, preserves an omitted bio and allows clearing it", async ({ db, actors }) => {
  const unchangedEmailInput = { email: actors.member.user.email, firstName: "Updated", lastName: "Profile" };

  const response = await actors.member.request("/api/profile", json("PATCH", unchangedEmailInput));

  expect(response.status).toBe(204);
  expect(await response.text()).toBe("");
  expect((await db.query.users.findMany()).find(user => user.id === actors.member.user.id)).toMatchObject({ ...unchangedEmailInput, bio: "Original bio" });

  const cleared = await actors.member.request("/api/profile", json("PATCH", { ...unchangedEmailInput, bio: "" }));

  expect(cleared.status).toBe(204);
  expect(await cleared.text()).toBe("");
  expect((await db.query.users.findMany()).find(user => user.id === actors.member.user.id)).toMatchObject({ ...unchangedEmailInput, bio: "" });
});

// Authentication.

test("401: rejects unauthenticated profile changes and leaves users unchanged", async ({ db, actors }) => {
  const before = await db.query.users.findMany();
  expect(before.some(user => user.id === actors.member.user.id)).toBe(true);

  const response = await request("/api/profile", json("PATCH", input));

  expect(response.status).toBe(401);
  expect(await db.query.users.findMany()).toEqual(before);
});

// Validation.

test("400: rejects invalid input and leaves users unchanged", async ({ db, actors }) => {
  const before = await db.query.users.findMany();

  const response = await actors.member.request("/api/profile", json("PATCH", { ...input, email: "invalid-email" }));

  expect(response.status).toBe(400);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 400, statusMessage: "Invalid profile", message: "Invalid profile" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
  expect(await db.query.users.findMany()).toEqual(before);
});

// Conflicts.

test.for(["admin", "outsider"] as const)("409: rejects an email belonging to the %s and leaves users unchanged", async (other, { db, actors }) => {
  const before = await db.query.users.findMany();

  const response = await actors.member.request("/api/profile", json("PATCH", { ...input, email: actors[other].user.email }));

  expect(response.status).toBe(409);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 409, statusMessage: "Email already in use", message: "Email already in use" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
  expect(await db.query.users.findMany()).toEqual(before);
});
