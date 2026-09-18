import type { RouteLocationNormalized } from "vue-router";
import { beforeEach, expect, test, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import authMiddleware from "../auth";

const { loggedIn, navigateTo } = vi.hoisted(() => ({
  loggedIn: { value: false },
  navigateTo: vi.fn(),
}));

mockNuxtImport("useUserSession", () => () => ({ loggedIn }));
mockNuxtImport("navigateTo", () => navigateTo);

beforeEach(() => {
  loggedIn.value = false;
  navigateTo.mockReset();
});

test("redirects unauthenticated page navigation to login with the full return path", async () => {
  const to = { fullPath: "/app/discussions?page=2" } as RouteLocationNormalized;
  const redirect = {
    path: "/auth/login",
    query: { redirectTo: "/app/discussions?page=2" },
  };
  navigateTo.mockReturnValue(redirect);

  const result = await authMiddleware(to, {} as RouteLocationNormalized);

  expect(navigateTo).toHaveBeenCalledWith(redirect);
  expect(result).toBe(redirect);
});

test("allows authenticated page navigation", async () => {
  loggedIn.value = true;
  const to = { fullPath: "/app" } as RouteLocationNormalized;

  await authMiddleware(to, {} as RouteLocationNormalized);

  expect(navigateTo).not.toHaveBeenCalled();
});
