import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import type { LoginInput, RegisterInput } from "~auth/shared/schemas";
import { loginMutation, registerMutation } from "../auth";

const { fetchMock, refreshSession, loggedIn } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  refreshSession: vi.fn(),
  loggedIn: { value: true },
}));

vi.mock("@pinia/colada", () => ({
  defineMutationOptions: (factory: () => unknown) => factory,
  PiniaColadaQueryHooksPlugin: vi.fn(() => ({})),
}));
vi.mock("#imports", async importOriginal => ({
  ...await importOriginal<typeof import("#imports")>(),
  $fetch: fetchMock,
}));
vi.mock("#build/fetch.mjs", () => ({ $fetch: fetchMock }));
mockNuxtImport("useUserSession", () => () => ({ fetch: refreshSession, loggedIn }));

const loginInput: LoginInput = { email: "ada@example.com", password: "Password123!" };
const registerInput: RegisterInput = {
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  password: "Password123!",
  teamId: null,
  teamName: "Analytical Engines",
};

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue(undefined);
  refreshSession.mockReset().mockResolvedValue(undefined);
  loggedIn.value = true;
  Object.assign(useNuxtApp(), { $api: fetchMock });
});

describe.each([
  ["login", loginMutation, loginInput, "/api/auth/login"],
  ["registration", registerMutation, registerInput, "/api/auth/register"],
])("%s mutation", (_name, createMutation, input, endpoint) => {
  test("sends the write and refreshes the session before settling", async () => {
    const events: string[] = [];
    let resolveRefresh!: () => void;
    const refresh = new Promise<void>((resolve) => {
      resolveRefresh = resolve;
    });
    fetchMock.mockImplementation(async () => {
      events.push("write");
    });
    refreshSession.mockImplementation(async () => {
      events.push("session");
      await refresh;
    });

    const mutation = createMutation() as unknown as {
      mutation: (value: typeof input) => Promise<void>;
    };
    const operation = mutation.mutation(input);

    await vi.waitFor(() => expect(refreshSession).toHaveBeenCalledOnce());
    expect(events).toEqual(["write", "session"]);
    expect(fetchMock).toHaveBeenCalledWith(endpoint, { method: "POST", body: input });

    let settled = false;
    void operation.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);

    resolveRefresh();
    await operation;
  });

  test("resolves the API client when the mutation executes", async () => {
    const mutation = createMutation() as unknown as {
      mutation: (value: typeof input) => Promise<void>;
    };
    const executionApi = vi.fn().mockResolvedValue(undefined);
    Object.assign(useNuxtApp(), { $api: executionApi });

    await mutation.mutation(input);

    expect(executionApi).toHaveBeenCalledWith(endpoint, { method: "POST", body: input });
  });

  test("does not refresh when the write fails and preserves the write error", async () => {
    const writeError = new Error("Authenticated write failed");
    fetchMock.mockRejectedValueOnce(writeError);
    const mutation = createMutation() as unknown as {
      mutation: (value: typeof input) => Promise<void>;
    };

    await expect(mutation.mutation(input)).rejects.toBe(writeError);
    expect(refreshSession).not.toHaveBeenCalled();
  });

  test("rejects when refresh resolves without an authenticated session", async () => {
    loggedIn.value = false;
    const mutation = createMutation() as unknown as {
      mutation: (value: typeof input) => Promise<void>;
    };

    await expect(mutation.mutation(input)).rejects.toMatchObject({
      name: "UserSessionRefreshError",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(refreshSession).toHaveBeenCalledOnce();
  });

  test("propagates a refresh rejection after a successful write", async () => {
    const refreshError = new Error("Session refresh failed");
    refreshSession.mockRejectedValueOnce(refreshError);
    const mutation = createMutation() as unknown as {
      mutation: (value: typeof input) => Promise<void>;
    };

    await expect(mutation.mutation(input)).rejects.toMatchObject({
      name: "UserSessionRefreshError",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(refreshSession).toHaveBeenCalledOnce();
  });
});
