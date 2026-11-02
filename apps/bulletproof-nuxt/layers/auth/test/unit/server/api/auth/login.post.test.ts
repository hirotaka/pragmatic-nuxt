import { expect } from "vitest";
import { json, setupRequestTests } from "~~/test/support/request";

const { test, request, sessionData, hashPassword } = setupRequestTests();
const input = { email: "ada@example.com", password: "Password123!" };

type Database = typeof import("@nuxthub/db").db;

async function createAccount(db: Database, passwordHash: string) {
  const { teamFactory } = await import("~~/test/factories/team");
  const { userFactory } = await import("~~/test/factories/user");
  const team = await teamFactory(db).create();
  return userFactory(db, { teamId: team.id, password: passwordHash }).create({ email: input.email });
}

// Success.

test("204: logs in with correct credentials and an identity-only session", async ({ db }) => {
  const account = await createAccount(db, await hashPassword(input.password));

  const response = await request("/api/auth/login", json("POST", input));

  expect(response.status).toBe(204);
  expect(await response.text()).toBe("");
  expect((await sessionData(response)).user).toEqual({ id: account.id });
  expect(await db.query.users.findMany()).toEqual([account]);
});

// Authentication.

test("401: rejects a wrong password with the generic invalid-credentials outcome and no session cookie", async ({ db }) => {
  const account = await createAccount(db, await hashPassword(input.password));

  const response = await request("/api/auth/login", json("POST", { ...input, password: "WrongPassword123!" }));

  expect(response.status).toBe(401);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 401, statusMessage: "Invalid email or password", message: "Invalid email or password" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
  expect(response.headers.getSetCookie()).toEqual([]);
  expect(await db.query.users.findMany()).toEqual([account]);
});

test("401: rejects a malformed or unsupported stored hash with the same generic outcome and no session cookie", async ({ db }) => {
  const account = await createAccount(db, "not-a-supported-password-hash");

  const response = await request("/api/auth/login", json("POST", input));

  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({ statusMessage: "Invalid email or password" });
  expect(response.headers.getSetCookie()).toEqual([]);
  expect(await db.query.users.findMany()).toEqual([account]);
});
