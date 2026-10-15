import type { H3Event } from "h3";
import { createError } from "h3";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { loginInputSchema } from "#layers/auth/shared/utils/schemas";

const { findCredentials, getAuthApplication, readBody, replaceUserSession, verifyPassword } = vi.hoisted(() => ({
  findCredentials: vi.fn(),
  getAuthApplication: vi.fn(),
  readBody: vi.fn(),
  replaceUserSession: vi.fn(),
  verifyPassword: vi.fn(),
}));

const account = { id: "account-1", passwordHash: "$scrypt$seeded-hash" };

beforeEach(() => {
  findCredentials.mockReset().mockResolvedValue(account);
  getAuthApplication.mockReset().mockReturnValue({ findCredentials });
  readBody.mockReset().mockResolvedValue({
    email: "ada@example.com",
    password: "Password123!",
  });
  replaceUserSession.mockReset().mockResolvedValue(undefined);
  verifyPassword.mockReset().mockResolvedValue(true);
  vi.stubGlobal("createError", createError);
  vi.stubGlobal("defineEventHandler", <T>(eventHandler: T) => eventHandler);
  vi.stubGlobal("readBody", readBody);
  vi.stubGlobal("replaceUserSession", replaceUserSession);
  vi.stubGlobal("verifyPassword", verifyPassword);
  vi.stubGlobal("loginInputSchema", loginInputSchema);
  vi.stubGlobal("getAuthApplication", getAuthApplication);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("uses the official verifier before creating a session for correct credentials", async () => {
  const { default: handler } = await import("../api/auth/login.post");

  const event = { context: {} };
  await handler(event as H3Event);

  expect(getAuthApplication).toHaveBeenCalledWith(event);
  expect(findCredentials).toHaveBeenCalledWith("ada@example.com");
  expect(verifyPassword).toHaveBeenCalledWith(account.passwordHash, "Password123!");
  expect(replaceUserSession).toHaveBeenCalledWith(event, { user: { id: account.id } });
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

  await expect(handler({ context: {} } as H3Event)).rejects.toMatchObject({
    statusCode: 401,
    statusMessage: "Invalid email or password",
  });

  expect(replaceUserSession).not.toHaveBeenCalled();
});
