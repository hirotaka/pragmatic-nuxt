import type { H3Event } from "h3";
import { createError } from "h3";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const { createUserRepository, findByEmail, readBody, replaceUserSession, customVerifyPassword, setResponseStatus } = vi.hoisted(() => ({
  createUserRepository: vi.fn(),
  findByEmail: vi.fn(),
  readBody: vi.fn(),
  replaceUserSession: vi.fn(),
  customVerifyPassword: vi.fn(),
  setResponseStatus: vi.fn(),
}));

vi.mock("#layers/users/server/repository/userRepository", () => ({
  createUserRepository,
}));
vi.mock("~auth/server/utils/password", () => ({
  customVerifyPassword,
}));

const user = {
  id: "user-1",
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  bio: undefined,
  role: "USER" as const,
  teamId: "team-1",
  password: "hashed-password",
  createdAt: new Date("2026-09-11T00:00:00.000Z"),
};

beforeEach(() => {
  vi.resetModules();
  createUserRepository.mockReset().mockReturnValue({ findByEmail });
  findByEmail.mockReset().mockResolvedValue(user);
  readBody.mockReset().mockResolvedValue({
    email: user.email,
    password: "Password123!",
  });
  replaceUserSession.mockReset().mockResolvedValue(undefined);
  customVerifyPassword.mockReset().mockResolvedValue(true);
  setResponseStatus.mockReset();
  vi.stubGlobal("createError", createError);
  vi.stubGlobal("defineEventHandler", <T>(eventHandler: T) => eventHandler);
  vi.stubGlobal("readBody", readBody);
  vi.stubGlobal("replaceUserSession", replaceUserSession);
  vi.stubGlobal("setResponseStatus", setResponseStatus);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("writes only the authenticated user identity to the session after a valid login", async () => {
  const { default: handler } = await import("../api/auth/login.post");
  const event = { node: { res: {} } } as H3Event;

  await handler(event);

  expect(customVerifyPassword).toHaveBeenCalledWith("Password123!", user.password);
  expect(replaceUserSession).toHaveBeenCalledWith(event, { user: { id: user.id } });
});

test("does not create a session for an invalid password", async () => {
  const { default: handler } = await import("../api/auth/login.post");
  customVerifyPassword.mockResolvedValueOnce(false);

  await expect(handler({} as H3Event)).rejects.toMatchObject({
    statusCode: 401,
    statusMessage: "Invalid email or password",
  });
  expect(replaceUserSession).not.toHaveBeenCalled();
});
