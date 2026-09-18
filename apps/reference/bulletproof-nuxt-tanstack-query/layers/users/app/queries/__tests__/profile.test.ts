import { beforeEach, expect, test, vi } from "vitest";
import type { UpdateProfileInput } from "~users/shared/schemas";
import { updateProfileMutation } from "../profile";

const { api, refreshSession } = vi.hoisted(() => ({
  api: vi.fn(),
  refreshSession: vi.fn(),
}));

vi.mock("#app", async importOriginal => ({
  ...await importOriginal<typeof import("#app")>(),
  useNuxtApp: () => ({ $api: api }),
}));
vi.mock("#layers/auth/app/composables/useRequiredUserSessionRefresh", () => ({
  useRequiredUserSessionRefresh: () => refreshSession,
}));

const input: UpdateProfileInput = {
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  bio: "Updated",
};

beforeEach(() => {
  api.mockReset().mockResolvedValue(undefined);
  refreshSession.mockReset().mockResolvedValue(undefined);
});

test("settles only after the profile write and required session refresh", async () => {
  const events: string[] = [];
  let releaseRefresh!: () => void;
  api.mockImplementation(async () => {
    events.push("write");
  });
  refreshSession.mockImplementation(() => new Promise<void>((resolve) => {
    events.push("refresh");
    releaseRefresh = resolve;
  }));
  const mutation = updateProfileMutation();
  if (!mutation.mutationFn) throw new Error("Profile mutation function is unavailable");
  expect(mutation.meta).toEqual({ authenticated: true });

  let settled = false;
  const pending = mutation.mutationFn(input, {} as never).then(() => {
    settled = true;
  });
  await vi.waitFor(() => expect(refreshSession).toHaveBeenCalledOnce());

  expect(events).toEqual(["write", "refresh"]);
  expect(settled).toBe(false);
  releaseRefresh();
  await pending;
  expect(settled).toBe(true);
  expect(api).toHaveBeenCalledWith("/api/profile", {
    method: "PATCH",
    body: input,
  });
});

test("does not refresh the provider session after a failed profile write", async () => {
  api.mockRejectedValueOnce(new Error("Profile write failed"));
  const mutation = updateProfileMutation();
  if (!mutation.mutationFn) throw new Error("Profile mutation function is unavailable");

  await expect(mutation.mutationFn(input, {} as never)).rejects.toThrow("Profile write failed");
  expect(refreshSession).not.toHaveBeenCalled();
});
