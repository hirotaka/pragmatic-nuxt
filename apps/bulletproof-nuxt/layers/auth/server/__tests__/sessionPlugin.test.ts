import { createError } from "h3";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

const { createUserRepository, findById, hook } = vi.hoisted(() => ({
  createUserRepository: vi.fn(),
  findById: vi.fn(),
  hook: vi.fn(),
}));

vi.mock("#layers/users/server/repository/userRepository", () => ({
  createUserRepository,
}));

const user = {
  id: "user-1",
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  bio: "Mathematician",
  role: "ADMIN" as const,
  teamId: "team-1",
  createdAt: new Date("2026-09-11T00:00:00.000Z"),
};

beforeEach(() => {
  vi.resetModules();
  createUserRepository.mockReset().mockReturnValue({ findById });
  findById.mockReset().mockResolvedValue(user);
  hook.mockReset();
  vi.stubGlobal("createError", createError);
  vi.stubGlobal("defineNitroPlugin", <T>(plugin: T) => plugin);
  vi.stubGlobal("sessionHooks", { hook });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function registerFetchHook() {
  const { default: registerSessionPlugin } = await import("../plugins/session");
  registerSessionPlugin({} as never);

  const fetchHook = hook.mock.calls[0]?.[1];
  if (!fetchHook) throw new Error("Session fetch hook was not registered");
  return fetchHook;
}

test("projects the current allowlisted user onto the fetch response", async () => {
  const fetchHook = await registerFetchHook();
  const session = { id: "provider-session", user: { id: user.id } };

  await fetchHook(session, {});

  expect(findById).toHaveBeenCalledWith(user.id);
  expect(session).toEqual({
    id: "provider-session",
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      role: user.role,
      teamId: user.teamId,
      createdAt: user.createdAt.toISOString(),
    },
  });
  expect(session.user).not.toHaveProperty("password");
});

test("leaves an anonymous session unauthenticated", async () => {
  const fetchHook = await registerFetchHook();
  const session = { id: "provider-session" };

  await fetchHook(session, {});

  expect(session).toEqual({ id: "provider-session" });
  expect(findById).not.toHaveBeenCalled();
});

test("does not resolve a missing persistent identity as an authenticated user", async () => {
  findById.mockResolvedValueOnce(null);
  const fetchHook = await registerFetchHook();

  await expect(fetchHook({ id: "provider-session", user: { id: "deleted-user" } }, {})).rejects.toMatchObject({
    statusCode: 401,
    statusMessage: "Unauthorized",
  });
});

test("rejects an invalid session identity before querying the repository", async () => {
  const fetchHook = await registerFetchHook();

  await expect(fetchHook({ id: "provider-session", user: { id: "" } }, {})).rejects.toMatchObject({
    statusCode: 401,
    statusMessage: "Unauthorized",
  });
  expect(findById).not.toHaveBeenCalled();
});
