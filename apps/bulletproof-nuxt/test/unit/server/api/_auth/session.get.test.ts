import { expect } from "vitest";
import { json, setupRequestTests } from "~~/test/support/request";

const { test, request, hashPassword } = setupRequestTests();

// Success.

test("200: returns only the current public user fields with an ISO creation datetime", async ({ db }) => {
  const { teamFactory } = await import("~~/test/factories/team");
  const { userFactory } = await import("~~/test/factories/user");
  const team = await teamFactory(db).create();
  const password = "Password123!";
  const user = await userFactory(db, { teamId: team.id, password: await hashPassword(password) }).create();
  const login = await request("/api/auth/login", json("POST", { email: user.email, password }));
  expect(login.status).toBe(204);
  const cookie = login.headers.getSetCookie().map(value => value.split(";")[0]).join("; ");

  const response = await request("/api/_auth/session", { headers: { cookie } });

  expect(response.status).toBe(200);
  const session = await response.json();
  expect(session.user).toEqual({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: "USER",
    teamId: team.id,
    createdAt: "2026-01-01T00:00:00.000Z",
  });
  expect(session.user).not.toHaveProperty("password");
});
