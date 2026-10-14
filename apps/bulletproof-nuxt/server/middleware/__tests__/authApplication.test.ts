import type { H3Event } from "h3";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const { createUserRepository, findByEmail } = vi.hoisted(() => ({
  createUserRepository: vi.fn(),
  findByEmail: vi.fn(),
}));

vi.mock("#layers/users/server/repository/userRepository", () => ({ createUserRepository }));

beforeEach(() => {
  findByEmail.mockReset().mockResolvedValue({
    id: "account-1",
    password: "$scrypt$hash",
    email: "ada@example.com",
    teamId: "team-1",
    role: "ADMIN",
  });
  createUserRepository.mockReset().mockReturnValue({ findByEmail });
  vi.stubGlobal("defineEventHandler", <T>(handler: T) => handler);
});

afterEach(() => vi.unstubAllGlobals());

test("provides each request with a credential-only account port", async () => {
  const { default: middleware } = await import("../authApplication");
  const first = { context: {} } as H3Event;
  const second = { context: {} } as H3Event;
  middleware(first);
  middleware(second);

  expect(first.context.authApplication).not.toBe(second.context.authApplication);
  await expect(first.context.authApplication!.findCredentials("ada@example.com")).resolves.toEqual({
    id: "account-1",
    passwordHash: "$scrypt$hash",
  });
});
