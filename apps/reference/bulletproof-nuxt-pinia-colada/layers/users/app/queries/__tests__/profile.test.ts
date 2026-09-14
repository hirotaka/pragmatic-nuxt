import { beforeEach, expect, test, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import type { UpdateProfileInput } from "~users/shared/schemas";
import { updateProfileMutation } from "../profile";

const { apiMock, refreshSession, loggedIn } = vi.hoisted(() => ({
  apiMock: vi.fn(),
  refreshSession: vi.fn(),
  loggedIn: { value: true },
}));

vi.mock("@pinia/colada", () => ({
  defineMutationOptions: (factory: () => unknown) => factory,
  PiniaColadaQueryHooksPlugin: vi.fn(() => ({})),
}));
vi.mock("#imports", async importOriginal => importOriginal<typeof import("#imports")>());
vi.mock("#build/fetch.mjs", () => ({ $fetch: vi.fn() }));
mockNuxtImport("useUserSession", () => () => ({ fetch: refreshSession, loggedIn }));

const input: UpdateProfileInput = {
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  bio: "Analytical engine notes",
};

beforeEach(() => {
  apiMock.mockReset().mockResolvedValue(undefined);
  refreshSession.mockReset().mockResolvedValue(undefined);
  loggedIn.value = true;
  Object.assign(useNuxtApp(), { $api: apiMock });
});

test("completes the profile write before refreshing the session", async () => {
  const events: string[] = [];
  apiMock.mockImplementation(async () => events.push("write"));
  refreshSession.mockImplementation(async () => events.push("session"));

  await (updateProfileMutation() as unknown as { mutation: (value: UpdateProfileInput, context: unknown) => Promise<void> }).mutation(input, {});

  expect(events).toEqual(["write", "session"]);
  expect(apiMock).toHaveBeenCalledWith("/api/profile", { method: "PATCH", body: input });
});

test("resolves the API client when the profile mutation executes", async () => {
  const mutation = updateProfileMutation() as unknown as {
    mutation: (value: UpdateProfileInput, context: unknown) => Promise<void>;
  };
  const executionApi = vi.fn().mockResolvedValue(undefined);
  Object.assign(useNuxtApp(), { $api: executionApi });

  await mutation.mutation(input, {});

  expect(executionApi).toHaveBeenCalledWith("/api/profile", { method: "PATCH", body: input });
});

test("does not refresh the session when the profile write fails", async () => {
  const error = new Error("Profile update failed");
  apiMock.mockRejectedValueOnce(error);

  await expect((updateProfileMutation() as unknown as { mutation: (value: UpdateProfileInput, context: unknown) => Promise<void> }).mutation(input, {})).rejects.toBe(error);
  expect(refreshSession).not.toHaveBeenCalled();
});

test("rejects a session refresh failure after a successful profile write", async () => {
  refreshSession.mockRejectedValueOnce(new Error("Session refresh failed"));

  await expect((updateProfileMutation() as unknown as { mutation: (value: UpdateProfileInput, context: unknown) => Promise<void> }).mutation(input, {})).rejects.toMatchObject({
    name: "UserSessionRefreshError",
  });
  expect(apiMock).toHaveBeenCalledOnce();
});

test("rejects a resolved unauthenticated session after a successful profile write", async () => {
  loggedIn.value = false;

  await expect((updateProfileMutation() as unknown as { mutation: (value: UpdateProfileInput, context: unknown) => Promise<void> }).mutation(input, {})).rejects.toMatchObject({
    name: "UserSessionRefreshError",
  });
  expect(apiMock).toHaveBeenCalledOnce();
  expect(refreshSession).toHaveBeenCalledOnce();
});
