import type { H3Event } from "h3";
import { createError } from "h3";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { registerInputSchema } from "../../shared/utils/registration";
import { serializeSessionIdentity } from "../utils/serializeSessionIdentity";

const {
  createTeamRepository,
  createUserRepository,
  findByEmail,
  hashPassword,
  readBody,
  replaceUserSession,
  teamCreate,
  findTeamById,
  userCreate,
} = vi.hoisted(() => ({
  createTeamRepository: vi.fn(),
  createUserRepository: vi.fn(),
  findByEmail: vi.fn(),
  hashPassword: vi.fn(),
  readBody: vi.fn(),
  replaceUserSession: vi.fn(),
  teamCreate: vi.fn(),
  findTeamById: vi.fn(),
  userCreate: vi.fn(),
}));

vi.mock("#layers/teams/server/repository/teamRepository", () => ({
  createTeamRepository,
}));
vi.mock("#layers/users/server/repository/userRepository", () => ({
  createUserRepository,
}));

const input = {
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  password: "Password123!",
  teamName: "Analytical Engine",
  teamId: null,
};

const user = {
  id: "user-1",
  email: input.email,
  firstName: input.firstName,
  lastName: input.lastName,
  bio: undefined,
  role: "ADMIN" as const,
  teamId: "team-1",
  createdAt: new Date("2026-09-11T00:00:00.000Z"),
};

beforeEach(() => {
  createTeamRepository.mockReset().mockReturnValue({ create: teamCreate, findById: findTeamById });
  createUserRepository.mockReset().mockReturnValue({ findByEmail, create: userCreate });
  findByEmail.mockReset().mockResolvedValue(null);
  hashPassword.mockReset().mockResolvedValue("$scrypt$registered-hash");
  readBody.mockReset().mockResolvedValue(input);
  replaceUserSession.mockReset().mockResolvedValue(undefined);
  teamCreate.mockReset().mockResolvedValue({ id: user.teamId });
  findTeamById.mockReset().mockResolvedValue({ id: user.teamId });
  userCreate.mockReset().mockResolvedValue(user);
  vi.stubGlobal("createError", createError);
  vi.stubGlobal("defineEventHandler", <T>(eventHandler: T) => eventHandler);
  vi.stubGlobal("hashPassword", hashPassword);
  vi.stubGlobal("readBody", readBody);
  vi.stubGlobal("replaceUserSession", replaceUserSession);
  vi.stubGlobal("registerInputSchema", registerInputSchema);
  vi.stubGlobal("serializeSessionIdentity", serializeSessionIdentity);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("uses the official hasher before creating a registered user session", async () => {
  const { default: handler } = await import("../api/register.post");

  await handler({} as H3Event);

  expect(hashPassword).toHaveBeenCalledWith(input.password);
  expect(userCreate).toHaveBeenCalledWith(expect.objectContaining({
    password: "$scrypt$registered-hash",
  }));
  expect(replaceUserSession).toHaveBeenCalledWith({}, { user: { id: user.id } });
});

test("rejects invalid registration before creating a user or team", async () => {
  readBody.mockResolvedValueOnce({ ...input, teamId: null, teamName: null });
  const { default: handler } = await import("../api/register.post");

  await expect(handler({} as H3Event)).rejects.toMatchObject({ statusCode: 400 });
  expect(createUserRepository).not.toHaveBeenCalled();
  expect(createTeamRepository).not.toHaveBeenCalled();
});

test("requires an existing team before joining it", async () => {
  readBody.mockResolvedValueOnce({ ...input, teamId: "missing", teamName: null });
  findTeamById.mockResolvedValueOnce(null);
  const { default: handler } = await import("../api/register.post");

  await expect(handler({} as H3Event)).rejects.toMatchObject({ statusCode: 404 });
  expect(userCreate).not.toHaveBeenCalled();
});

test("joins an existing team without granting the creator role", async () => {
  readBody.mockResolvedValueOnce({ ...input, teamId: user.teamId, teamName: null });
  const { default: handler } = await import("../api/register.post");

  await handler({} as H3Event);
  expect(teamCreate).not.toHaveBeenCalled();
  expect(userCreate).toHaveBeenCalledWith(expect.objectContaining({ teamId: user.teamId, role: "USER" }));
});
