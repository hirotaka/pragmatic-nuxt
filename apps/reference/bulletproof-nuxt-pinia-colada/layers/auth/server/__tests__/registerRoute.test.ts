import type { H3Event } from "h3";
import { createError } from "h3";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const {
  createTeamRepository,
  createUserRepository,
  findByEmail,
  readBody,
  replaceUserSession,
  teamCreate,
  userCreate,
  customHashPassword,
  setResponseStatus,
} = vi.hoisted(() => ({
  createTeamRepository: vi.fn(),
  createUserRepository: vi.fn(),
  findByEmail: vi.fn(),
  readBody: vi.fn(),
  replaceUserSession: vi.fn(),
  teamCreate: vi.fn(),
  userCreate: vi.fn(),
  customHashPassword: vi.fn(),
  setResponseStatus: vi.fn(),
}));

vi.mock("#layers/teams/server/repository/teamRepository", () => ({
  createTeamRepository,
}));
vi.mock("#layers/users/server/repository/userRepository", () => ({
  createUserRepository,
}));
vi.mock("~auth/server/utils/password", () => ({
  customHashPassword,
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
  vi.resetModules();
  createTeamRepository.mockReset().mockReturnValue({ create: teamCreate });
  createUserRepository.mockReset().mockReturnValue({ findByEmail, create: userCreate });
  findByEmail.mockReset().mockResolvedValue(null);
  customHashPassword.mockReset().mockResolvedValue("hashed-password");
  setResponseStatus.mockReset();
  readBody.mockReset().mockResolvedValue(input);
  replaceUserSession.mockReset().mockResolvedValue(undefined);
  teamCreate.mockReset().mockResolvedValue({ id: user.teamId });
  userCreate.mockReset().mockResolvedValue(user);
  vi.stubGlobal("createError", createError);
  vi.stubGlobal("defineEventHandler", <T>(eventHandler: T) => eventHandler);
  vi.stubGlobal("readBody", readBody);
  vi.stubGlobal("replaceUserSession", replaceUserSession);
  vi.stubGlobal("setResponseStatus", setResponseStatus);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("writes only the registered user identity to the session", async () => {
  const { default: handler } = await import("../api/auth/register.post");
  const event = { node: { res: {} } } as H3Event;

  await handler(event);

  expect(customHashPassword).toHaveBeenCalledWith(input.password);
  expect(userCreate).toHaveBeenCalledWith(expect.objectContaining({
    password: "hashed-password",
  }));
  expect(replaceUserSession).toHaveBeenCalledWith(event, { user: { id: user.id } });
});
