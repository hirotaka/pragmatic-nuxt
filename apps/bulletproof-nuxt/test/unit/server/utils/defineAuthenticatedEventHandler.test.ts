import type { EventHandler } from "h3";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { currentUser, requireCurrentUser } = vi.hoisted(() => ({
  currentUser: {
    id: "user-1",
    email: "user@example.com",
    firstName: "Test",
    lastName: "User",
    role: "USER" as const,
    teamId: "team-1",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  },
  requireCurrentUser: vi.fn(),
}));

describe("defineAuthenticatedEventHandler", () => {
  beforeEach(() => {
    requireCurrentUser.mockReset().mockResolvedValue(currentUser);
    // Direct unit imports do not run Nitro's auto-import transform.
    vi.stubGlobal("requireCurrentUser", requireCurrentUser);
    vi.stubGlobal("defineEventHandler", <T>(handler: T) => handler);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves the database current user before invoking the handler", async () => {
    const { defineAuthenticatedEventHandler } = await import("~~/server/utils/defineAuthenticatedEventHandler");
    const event = { path: "/api/discussions" };
    const handler = vi.fn().mockResolvedValue({ ok: true });
    const protectedHandler = defineAuthenticatedEventHandler(handler) as EventHandler;

    await expect(protectedHandler(event as never)).resolves.toEqual({ ok: true });
    expect(requireCurrentUser).toHaveBeenCalledWith(event);
    expect(handler).toHaveBeenCalledWith(event, currentUser);
    expect(requireCurrentUser.mock.invocationCallOrder[0]!).toBeLessThan(handler.mock.invocationCallOrder[0]!);
  });

  it("does not invoke the handler when authentication fails", async () => {
    const { defineAuthenticatedEventHandler } = await import("~~/server/utils/defineAuthenticatedEventHandler");
    const authenticationError = new Error("Unauthorized");
    const handler = vi.fn();
    requireCurrentUser.mockRejectedValue(authenticationError);
    const protectedHandler = defineAuthenticatedEventHandler(handler) as EventHandler;

    await expect(protectedHandler({} as never)).rejects.toBe(authenticationError);
    expect(handler).not.toHaveBeenCalled();
  });
});
