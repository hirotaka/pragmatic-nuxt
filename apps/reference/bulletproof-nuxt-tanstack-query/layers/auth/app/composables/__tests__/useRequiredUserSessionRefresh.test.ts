import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, expect, test, vi } from "vitest";
import { useRequiredUserSessionRefresh, UserSessionRefreshError } from "../useRequiredUserSessionRefresh";

const { addNotification, fetchSession, loggedIn } = vi.hoisted(() => ({
  addNotification: vi.fn(),
  fetchSession: vi.fn(),
  loggedIn: { value: false },
}));

mockNuxtImport("useUserSession", () => () => ({ fetch: fetchSession, loggedIn }));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));

beforeEach(() => {
  addNotification.mockReset();
  fetchSession.mockReset().mockResolvedValue(undefined);
  loggedIn.value = false;
});

test("settles only after the refreshed session is authenticated", async () => {
  fetchSession.mockImplementation(async () => {
    loggedIn.value = true;
  });

  await expect(useRequiredUserSessionRefresh()()).resolves.toBeUndefined();
  expect(addNotification).not.toHaveBeenCalled();
});

test("reports one session error when refresh settles logged out", async () => {
  await expect(useRequiredUserSessionRefresh()()).rejects.toBeInstanceOf(UserSessionRefreshError);
  expect(addNotification).toHaveBeenCalledOnce();
  expect(addNotification).toHaveBeenCalledWith({
    type: "error",
    title: "Session Unavailable",
    message: "The request completed, but the session could not be refreshed. Please try again.",
  });
});

test("reports one session error when refresh throws", async () => {
  fetchSession.mockRejectedValueOnce(new Error("Session endpoint unavailable"));

  await expect(useRequiredUserSessionRefresh()()).rejects.toBeInstanceOf(UserSessionRefreshError);
  expect(addNotification).toHaveBeenCalledOnce();
});
