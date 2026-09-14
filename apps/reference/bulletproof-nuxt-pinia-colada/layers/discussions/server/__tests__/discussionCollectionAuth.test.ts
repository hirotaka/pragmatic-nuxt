import type { H3Event } from "h3";
import { createError } from "h3";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const { createDiscussionRepository, requireCurrentUser } = vi.hoisted(() => ({
  createDiscussionRepository: vi.fn(),
  requireCurrentUser: vi.fn(),
}));

vi.mock("~discussions/server/repository/discussionRepository", () => ({
  createDiscussionRepository,
}));

vi.mock("#layers/auth/server/utils/defineProtectedEventHandler", () => ({
  defineProtectedEventHandler: <T extends (event: H3Event, currentUser: unknown) => unknown>(handler: T) =>
    async (event: H3Event) => handler(event, await requireCurrentUser(event)),
}));

beforeEach(() => {
  createDiscussionRepository.mockReset();
  requireCurrentUser.mockReset();
});

afterEach(() => {
  vi.resetModules();
});

test("rejects an unauthenticated request before entering the discussion repository", async () => {
  const { default: handler } = await import("../api/discussions/index.get");
  requireCurrentUser.mockRejectedValueOnce(createError({
    statusCode: 401,
    statusMessage: "Unauthorized",
  }));

  await expect(handler({} as H3Event)).rejects.toMatchObject({
    statusCode: 401,
  });

  expect(createDiscussionRepository).not.toHaveBeenCalled();
});
