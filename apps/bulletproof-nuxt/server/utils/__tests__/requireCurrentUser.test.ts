import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireCurrentUser } from "../requireCurrentUser";

const { createError, findById, requireUserSession } = vi.hoisted(() => ({
  createError: vi.fn((input: { statusCode: number; statusMessage: string }) => Object.assign(new Error(input.statusMessage), input)),
  findById: vi.fn(),
  requireUserSession: vi.fn(),
}));

vi.mock("#layers/users/server/repository/userRepository", () => ({
  createUserRepository: () => ({ findById }),
}));

describe("requireCurrentUser", () => {
  beforeEach(() => {
    createError.mockClear();
    findById.mockReset();
    requireUserSession.mockReset();
    vi.stubGlobal("createError", createError);
    vi.stubGlobal("requireUserSession", requireUserSession);
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
  ])("rejects a malformed session identity before querying the database", async (user) => {
    requireUserSession.mockResolvedValue({ user });

    await expect(requireCurrentUser({} as never)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
    expect(findById).not.toHaveBeenCalled();
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
