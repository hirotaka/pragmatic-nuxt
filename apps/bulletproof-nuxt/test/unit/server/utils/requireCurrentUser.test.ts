import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requireCurrentUser } from "~~/server/utils/requireCurrentUser";

const { findById, requireUserSession } = vi.hoisted(() => ({
  findById: vi.fn(),
  requireUserSession: vi.fn(),
}));

vi.mock("#layers/users/server/repository/userRepository", () => ({
  createUserRepository: () => ({ findById }),
}));

describe("requireCurrentUser", () => {
  beforeEach(() => {
    findById.mockReset();
    requireUserSession.mockReset();
    vi.stubGlobal("requireUserSession", requireUserSession);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the current database user from the session identity", async () => {
    const currentUser = { id: "user-1", role: "USER", teamId: "team-1" };
    requireUserSession.mockResolvedValue({ user: { id: "user-1" } });
    findById.mockResolvedValue(currentUser);

    await expect(requireCurrentUser({} as never)).resolves.toBe(currentUser);
    expect(findById).toHaveBeenCalledWith("user-1");
  });

  it.each([
    { id: "" },
    { id: 42 },
    { id: undefined },
  ])("rejects a malformed session identity before querying the database", async (user) => {
    requireUserSession.mockResolvedValue({ user });

    await expect(requireCurrentUser({} as never)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
    expect(findById).not.toHaveBeenCalled();
  });

  it("propagates a session failure without querying the database", async () => {
    const error = new Error("Session unavailable");
    requireUserSession.mockRejectedValue(error);

    await expect(requireCurrentUser({} as never)).rejects.toBe(error);
    expect(findById).not.toHaveBeenCalled();
  });

  it("propagates a database failure without returning a current user", async () => {
    const error = new Error("Database unavailable");
    requireUserSession.mockResolvedValue({ user: { id: "user-1" } });
    findById.mockRejectedValue(error);

    await expect(requireCurrentUser({} as never)).rejects.toBe(error);
  });

  it("rejects an identity whose database user no longer exists", async () => {
    requireUserSession.mockResolvedValue({ user: { id: "deleted-user" } });
    findById.mockResolvedValue(null);

    await expect(requireCurrentUser({} as never)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  });
});
