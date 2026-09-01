import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import type { LoginInput, RegisterInput } from "~auth/shared/schemas";
import { loginMutation, registerMutation } from "../auth";

const { fetchMock, refreshSession } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  refreshSession: vi.fn(),
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
mockNuxtImport("useUserSession", () => () => ({ fetch: refreshSession }));

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
});
