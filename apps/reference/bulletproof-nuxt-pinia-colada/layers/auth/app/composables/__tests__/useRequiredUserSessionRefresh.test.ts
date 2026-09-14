import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, expect, test, vi } from "vitest";
import { useRequiredUserSessionRefresh, UserSessionRefreshError } from "../useRequiredUserSessionRefresh";

const { fetchSession, loggedIn } = vi.hoisted(() => ({
  fetchSession: vi.fn(),
  loggedIn: { value: false },
}));

mockNuxtImport("useUserSession", () => () => ({ fetch: fetchSession, loggedIn }));

beforeEach(() => {
  fetchSession.mockReset().mockResolvedValue(undefined);
  loggedIn.value = false;
});

test("settles only after the refreshed session is authenticated", async () => {
  fetchSession.mockImplementation(async () => {
    loggedIn.value = true;
  });

  await expect(useRequiredUserSessionRefresh()()).resolves.toBeUndefined();
});

test("rejects when refresh settles logged out", async () => {
  await expect(useRequiredUserSessionRefresh()()).rejects.toBeInstanceOf(UserSessionRefreshError);
});

test("normalizes a refresh rejection to the mutation error contract", async () => {
  fetchSession.mockRejectedValueOnce(new Error("Session endpoint unavailable"));

  await expect(useRequiredUserSessionRefresh()()).rejects.toBeInstanceOf(UserSessionRefreshError);
});
