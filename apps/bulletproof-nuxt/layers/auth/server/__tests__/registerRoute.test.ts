import type { H3Event } from "h3";
import { createError } from "h3";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const {
  createTeamRepository,
  createUserRepository,
  findByEmail,
  hashPassword,
  readBody,
  replaceUserSession,
  teamCreate,
  userCreate,
} = vi.hoisted(() => ({
  createTeamRepository: vi.fn(),
  createUserRepository: vi.fn(),
  findByEmail: vi.fn(),
  hashPassword: vi.fn(),
  readBody: vi.fn(),
  replaceUserSession: vi.fn(),
  teamCreate: vi.fn(),
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
  createTeamRepository.mockReset().mockReturnValue({ create: teamCreate });
  createUserRepository.mockReset().mockReturnValue({ findByEmail, create: userCreate });
  findByEmail.mockReset().mockResolvedValue(null);
  hashPassword.mockReset().mockResolvedValue("$scrypt$registered-hash");
  readBody.mockReset().mockResolvedValue(input);
  replaceUserSession.mockReset().mockResolvedValue(undefined);
  teamCreate.mockReset().mockResolvedValue({ id: user.teamId });
  userCreate.mockReset().mockResolvedValue(user);
  vi.stubGlobal("createError", createError);
  vi.stubGlobal("defineEventHandler", <T>(eventHandler: T) => eventHandler);
  vi.stubGlobal("hashPassword", hashPassword);
  vi.stubGlobal("readBody", readBody);
  vi.stubGlobal("replaceUserSession", replaceUserSession);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("uses the official hasher before creating a registered user session", async () => {
  const { default: handler } = await import("../api/auth/register.post");

  await handler({} as H3Event);

  expect(hashPassword).toHaveBeenCalledWith(input.password);
  expect(userCreate).toHaveBeenCalledWith(expect.objectContaining({
    password: "$scrypt$registered-hash",
  }));
  expect(replaceUserSession).toHaveBeenCalledWith({}, { user: { id: user.id } });
});
