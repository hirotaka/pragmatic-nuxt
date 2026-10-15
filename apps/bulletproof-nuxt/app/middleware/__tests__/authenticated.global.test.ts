import type { RouteLocationNormalized } from "vue-router";
import { beforeEach, expect, test, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import authenticatedMiddleware from "../authenticated.global";

const { loggedIn, navigateTo, useUserSession } = vi.hoisted(() => ({
  loggedIn: { value: false },
  navigateTo: vi.fn(),
  useUserSession: vi.fn(),
}));

mockNuxtImport("useUserSession", () => useUserSession);
mockNuxtImport("navigateTo", () => navigateTo);

beforeEach(() => {
  loggedIn.value = false;
  navigateTo.mockReset();
  useUserSession.mockReset().mockReturnValue({ loggedIn });
});

function route(path: string, fullPath = path): RouteLocationNormalized {
  return { path, fullPath } as RouteLocationNormalized;
}

test.each([
  ["/app", "/app"],
  ["/app/", "/app/"],
  ["/app/discussions", "/app/discussions?page=2"],
])("redirects an anonymous visit to %s while preserving %s", async (path, fullPath) => {
  const redirect = { path: "/auth/login", query: { redirectTo: fullPath } };
  navigateTo.mockReturnValue(redirect);

  const result = await authenticatedMiddleware(route(path, fullPath), route("/"));

  expect(useUserSession).toHaveBeenCalledOnce();
  expect(navigateTo).toHaveBeenCalledWith(redirect);
  expect(result).toBe(redirect);
});

test.each(["/", "/register", "/auth/login", "/application", "/api/discussions"])(
  "does not gate a non-app path %s",
  async (path) => {
    await authenticatedMiddleware(route(path), route("/"));

    expect(useUserSession).not.toHaveBeenCalled();
    expect(navigateTo).not.toHaveBeenCalled();
  },
);

test("allows an authenticated visit to a protected route", async () => {
  loggedIn.value = true;

  await authenticatedMiddleware(route("/app/discussions"), route("/"));

  expect(useUserSession).toHaveBeenCalledOnce();
  expect(navigateTo).not.toHaveBeenCalled();
});
