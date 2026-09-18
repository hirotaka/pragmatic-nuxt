import type { H3Event } from "h3";
import { createError } from "h3";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const { createUserRepository, findByEmail, readBody, replaceUserSession, verifyPassword } = vi.hoisted(() => ({
  createUserRepository: vi.fn(),
  findByEmail: vi.fn(),
  readBody: vi.fn(),
  replaceUserSession: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock("#layers/users/server/repository/userRepository", () => ({
  createUserRepository,
}));

const user = {
  id: "user-1",
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  bio: undefined,
  role: "USER" as const,
  teamId: "team-1",
  password: "$scrypt$seeded-hash",
  createdAt: new Date("2026-09-11T00:00:00.000Z"),
};

beforeEach(() => {
  createUserRepository.mockReset().mockReturnValue({ findByEmail });
  findByEmail.mockReset().mockResolvedValue(user);
  readBody.mockReset().mockResolvedValue({
    email: user.email,
    password: "Password123!",
  });
  replaceUserSession.mockReset().mockResolvedValue(undefined);
  verifyPassword.mockReset().mockResolvedValue(true);
  vi.stubGlobal("createError", createError);
  vi.stubGlobal("defineEventHandler", <T>(eventHandler: T) => eventHandler);
  vi.stubGlobal("readBody", readBody);
  vi.stubGlobal("replaceUserSession", replaceUserSession);
  vi.stubGlobal("verifyPassword", verifyPassword);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("uses the official verifier before creating a session for correct credentials", async () => {
  const { default: handler } = await import("../api/auth/login.post");

  await handler({} as H3Event);

  expect(verifyPassword).toHaveBeenCalledWith(user.password, "Password123!");
  expect(replaceUserSession).toHaveBeenCalledWith({}, { user: { id: user.id } });
});

test.each([
  ["a wrong password", false],
  ["a malformed or unsupported stored hash", new Error("Unsupported password hash")],
])("rejects %s with the generic invalid-credentials outcome", async (_scenario, verificationResult) => {
  const { default: handler } = await import("../api/auth/login.post");
  if (verificationResult instanceof Error) {
    verifyPassword.mockRejectedValueOnce(verificationResult);
  }
  else {
    verifyPassword.mockResolvedValueOnce(verificationResult);
  }

  await expect(handler({} as H3Event)).rejects.toMatchObject({
    statusCode: 401,
    statusMessage: "Invalid email or password",
  });

  expect(replaceUserSession).not.toHaveBeenCalled();
});
