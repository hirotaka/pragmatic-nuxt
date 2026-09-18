import type { H3Event } from "h3";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const { findAll, getQuery } = vi.hoisted(() => ({
  findAll: vi.fn(),
  getQuery: vi.fn(),
}));

vi.mock("~users/server/repository/userRepository", () => ({
  createUserRepository: () => ({ findAll }),
}));

beforeEach(() => {
  findAll.mockReset();
  getQuery.mockReset().mockReturnValue({ page: "2", limit: "10" });
  vi.stubGlobal("getQuery", getQuery);
  vi.stubGlobal("defineProtectedEventHandler", <T extends (event: H3Event, currentUser: never) => unknown>(handler: T) => handler);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("passes authorized team pagination to the repository and serializes page data", async () => {
  const createdAt = new Date("2026-01-01T00:00:00.000Z");
  findAll.mockResolvedValue({
    data: [{
      id: "user-1",
      email: "admin@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      role: "ADMIN",
      teamId: "team-1",
      createdAt,
    }],
    meta: { page: 2, limit: 10, total: 11, totalPages: 2, hasMore: false },
  });

  const { default: handler } = await import("../api/users/index.get");
  const protectedHandler = handler as unknown as (event: H3Event, user: unknown) => Promise<unknown>;
  const result = await protectedHandler({} as H3Event, {
    id: "admin-1",
    role: "ADMIN",
    teamId: "team-1",
  });

  expect(findAll).toHaveBeenCalledWith({ teamId: "team-1", page: 2, limit: 10 });
  expect(result).toMatchObject({
    data: [{ createdAt: "2026-01-01T00:00:00.000Z" }],
    meta: { page: 2, totalPages: 2 },
  });
});

test("rejects non-admin users before entering the repository", async () => {
  const { default: handler } = await import("../api/users/index.get");
  const protectedHandler = handler as unknown as (event: H3Event, user: unknown) => Promise<unknown>;

  await expect(protectedHandler({} as H3Event, {
    id: "member-1",
    role: "USER",
    teamId: "team-1",
  })).rejects.toMatchObject({ statusCode: 403 });
  expect(findAll).not.toHaveBeenCalled();
});
