import { beforeEach, expect, test, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import type { UpdateProfileInput } from "~users/shared/schemas";
import { updateProfileMutation } from "../profile";

const { apiMock, refreshSession } = vi.hoisted(() => ({
  apiMock: vi.fn(),
  refreshSession: vi.fn(),
}));

vi.mock("@pinia/colada", () => ({
  defineMutationOptions: (factory: () => unknown) => factory,
  PiniaColadaQueryHooksPlugin: vi.fn(() => ({})),
}));
vi.mock("#imports", async importOriginal => importOriginal<typeof import("#imports")>());
vi.mock("#build/fetch.mjs", () => ({ $fetch: vi.fn() }));
mockNuxtImport("useUserSession", () => () => ({ fetch: refreshSession }));

const input: UpdateProfileInput = {
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  bio: "Analytical engine notes",
};

beforeEach(() => {
  apiMock.mockReset().mockResolvedValue(undefined);
  refreshSession.mockReset().mockResolvedValue(undefined);
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

test("does not refresh the session when the profile write fails", async () => {
  const error = new Error("Profile update failed");
  apiMock.mockRejectedValueOnce(error);

  await expect((updateProfileMutation() as unknown as { mutation: (value: UpdateProfileInput, context: unknown) => Promise<void> }).mutation(input, {})).rejects.toBe(error);
  expect(refreshSession).not.toHaveBeenCalled();
});

test("propagates a session refresh failure after a successful profile write", async () => {
  const error = new Error("Session refresh failed");
  refreshSession.mockRejectedValueOnce(error);

  await expect((updateProfileMutation() as unknown as { mutation: (value: UpdateProfileInput, context: unknown) => Promise<void> }).mutation(input, {})).rejects.toBe(error);
  expect(apiMock).toHaveBeenCalledOnce();
});
