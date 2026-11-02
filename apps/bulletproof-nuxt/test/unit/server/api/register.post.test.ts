import { expect } from "vitest";
import { json, setupRequestTests } from "~~/test/support/request";

const { test, request, sessionData, hashPassword } = setupRequestTests();
const input = {
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  password: "Password123!",
  teamName: "Analytical Engine",
  teamId: null,
};

// Success.

test("201: registers a new-team ADMIN with a working password and an identity-only session", async ({ db }) => {
  const response = await request("/api/register", json("POST", input));

  expect(response.status).toBe(201);
  expect(await response.text()).toBe("");

  const teams = await db.query.teams.findMany();
  expect(teams).toEqual([expect.objectContaining({ id: expect.any(String), name: input.teamName })]);
  const users = await db.query.users.findMany();
  expect(users).toEqual([expect.objectContaining({
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    teamId: teams[0]?.id,
    role: "ADMIN",
  })]);
  const [user] = users;
  expect(user?.password).not.toBe(input.password);
  expect((await sessionData(response)).user).toEqual({ id: user?.id });

  const login = await request("/api/auth/login", json("POST", { email: input.email, password: input.password }));

  expect(login.status).toBe(204);
  expect(await login.text()).toBe("");
});

test("201: joins an existing team as USER without creating another team", async ({ db }) => {
  const { teamFactory } = await import("~~/test/factories/team");
  const team = await teamFactory(db).create();

  const response = await request("/api/register", json("POST", { ...input, teamId: team.id, teamName: null }));

  expect(response.status).toBe(201);
  expect(await response.text()).toBe("");
  const users = await db.query.users.findMany();
  expect(users).toEqual([expect.objectContaining({ email: input.email, teamId: team.id, role: "USER" })]);
  const [user] = users;
  expect(await db.query.teams.findMany()).toEqual([team]);
  expect((await sessionData(response)).user).toEqual({ id: user?.id });
});

// Resource scope.

test("404: rejects a missing team without saving a user or team", async ({ db }) => {
  const response = await request("/api/register", json("POST", { ...input, teamId: "missing", teamName: null }));

  expect(response.status).toBe(404);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 404, statusMessage: "Team not found", message: "Team not found" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
  expect(await db.query.users.findMany()).toEqual([]);
  expect(await db.query.teams.findMany()).toEqual([]);
});

// Validation.

test.for([
  { label: "missing fields", body: {} },
  { label: "missing team selection", body: { ...input, teamId: null, teamName: null } },
])("400: rejects $label without saving a user or team", async ({ body: inputBody }, { db }) => {
  const response = await request("/api/register", json("POST", inputBody));

  expect(response.status).toBe(400);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 400, statusMessage: "Invalid registration", message: "Invalid registration" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
  expect(await db.query.users.findMany()).toEqual([]);
  expect(await db.query.teams.findMany()).toEqual([]);
});

// Conflicts.

test("409: rejects an existing email without changing users or teams", async ({ db }) => {
  const { teamFactory } = await import("~~/test/factories/team");
  const { userFactory } = await import("~~/test/factories/user");
  const team = await teamFactory(db).create();
  await userFactory(db, { teamId: team.id, password: await hashPassword(input.password) }).create({ email: input.email });
  const usersBefore = await db.query.users.findMany();
  const teamsBefore = await db.query.teams.findMany();

  const response = await request("/api/register", json("POST", input));

  expect(response.status).toBe(409);
  const body: unknown = await response.json();
  expect(body).toMatchObject({ statusCode: 409, statusMessage: "Email already registered", message: "Email already registered" });
  expect(body).not.toHaveProperty("data");
  expect(body).not.toHaveProperty("issues");
  expect(await db.query.users.findMany()).toEqual(usersBefore);
  expect(await db.query.teams.findMany()).toEqual(teamsBefore);
});
