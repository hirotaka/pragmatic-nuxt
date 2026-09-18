import type { QueryClient } from "@tanstack/vue-query";
import { beforeEach, expect, test, vi } from "vitest";
import {
  USER_QUERY_KEYS,
  deleteUserMutation,
  invalidateUserLists,
  normalizeUserPage,
  userListQuery,
} from "../users";

const { api } = vi.hoisted(() => ({ api: vi.fn() }));

vi.mock("#app", async importOriginal => ({
  ...await importOriginal<typeof import("#app")>(),
  useNuxtApp: () => ({ $api: api }),
}));

beforeEach(() => {
  api.mockReset();
});

test("normalizes route pages before using the same list identity and API parameters", async () => {
  expect(normalizeUserPage(undefined)).toBe(1);
  expect(normalizeUserPage("0")).toBe(1);
  expect(normalizeUserPage("invalid")).toBe(1);
  expect(normalizeUserPage("2")).toBe(2);

  api.mockResolvedValue({ data: [], meta: {} });
  const query = userListQuery({ page: "2", limit: 10 });

  expect(query.queryKey).toEqual(USER_QUERY_KEYS.list(2, 10));
  expect(query.meta).toEqual({ authenticated: true });
  if (typeof query.queryFn !== "function") throw new Error("Users query function is unavailable");
  const controller = new AbortController();
  await query.queryFn({ signal: controller.signal } as never);

  expect(api).toHaveBeenCalledWith("/api/users", {
    signal: controller.signal,
    query: { page: 2, limit: 10 },
  });
});

test("keeps previous User data while another page loads", () => {
  const previous = { data: [], meta: {} };
  const query = userListQuery({ page: 2, limit: 10 });

  if (typeof query.placeholderData !== "function") throw new Error("Users placeholder data is unavailable");
  expect(query.placeholderData(previous as never, {
    queryKey: USER_QUERY_KEYS.list(1, 10),
  } as never)).toBe(previous);
});

test("keeps delete completion scoped to the write and list synchronization separate", async () => {
  api.mockResolvedValue(undefined);
  const mutation = deleteUserMutation();
  if (!mutation.mutationFn) throw new Error("Delete mutation function is unavailable");
  expect(mutation.meta).toEqual({ authenticated: true });

  await expect(mutation.mutationFn("user-1", {} as never)).resolves.toBeUndefined();
  expect(api).toHaveBeenCalledWith("/api/users/user-1", { method: "DELETE" });

  const invalidateQueries = vi.fn().mockRejectedValue(new Error("Users refresh failed"));
  const queryClient = { invalidateQueries } as unknown as QueryClient;
  await expect(invalidateUserLists(queryClient)).rejects.toThrow("Users refresh failed");
  expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: USER_QUERY_KEYS.lists() });
});
