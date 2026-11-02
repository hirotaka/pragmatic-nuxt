import { expect } from "vitest";
import { setupUserTests } from "#layers/users/test/support/request";

const { test, request } = setupUserTests();

// Success.

test("200: returns only the ADMIN's team newest-first with public fields and no password", async ({ actors }) => {
  const response = await actors.admin.request("/api/users");

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual([
    {
      id: actors.member.user.id,
      email: actors.member.user.email,
      firstName: "Member",
      lastName: "User",
      bio: "Original bio",
      role: "USER",
      teamId: actors.admin.user.teamId,
      createdAt: "2026-01-02T00:00:00.000Z",
    },
    {
      id: actors.admin.user.id,
      email: actors.admin.user.email,
      firstName: "Admin",
      lastName: "User",
      bio: "Original bio",
      role: "ADMIN",
      teamId: actors.admin.user.teamId,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ]);
});

// Authentication.

test("401: rejects an unauthenticated user list request", async () => {
  const response = await request("/api/users");

  expect(response.status).toBe(401);
});

// Authorization.

test("403: forbids a USER from reading the user list", async ({ actors }) => {
  const response = await actors.member.request("/api/users");

  expect(response.status).toBe(403);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 403, statusMessage: "Admin access required", message: "Admin access required" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
});
