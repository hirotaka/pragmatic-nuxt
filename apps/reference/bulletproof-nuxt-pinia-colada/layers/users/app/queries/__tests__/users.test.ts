import { beforeEach, expect, test, vi } from "vitest";
import { USER_QUERY_KEYS, deleteUserMutation, usersQuery } from "../users";
import type { User } from "~users/shared/types";

const { fetchMock, invalidateQueries } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  invalidateQueries: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@pinia/colada", () => ({
  defineQueryOptions: (factory: unknown) => factory,
  defineMutationOptions: (factory: () => unknown) => factory,
  useQueryCache: () => ({ invalidateQueries }),
  PiniaColadaQueryHooksPlugin: vi.fn(() => ({})),
}));
vi.mock("#imports", async importOriginal => ({
  ...await importOriginal<typeof import("#imports")>(),
  $fetch: fetchMock,
}));
vi.mock("#build/fetch.mjs", () => ({ $fetch: fetchMock }));

beforeEach(() => {
  fetchMock.mockReset();
  invalidateQueries.mockClear();
  Object.assign(useNuxtApp(), { $api: fetchMock });
});

test("defines a session-scoped users query and forwards request signal", async () => {
  const users = [{ id: "user-1" }] as User[];
  fetchMock.mockResolvedValue(users);
  const options = usersQuery() as unknown as {
    key: unknown;
    query: (context: { signal: AbortSignal }) => Promise<User[]>;
  };
  const signal = new AbortController().signal;

  await expect(options.query({ signal })).resolves.toBe(users);
  expect(options.key).toEqual(USER_QUERY_KEYS.all);
  expect(fetchMock).toHaveBeenCalledWith("/api/users", expect.objectContaining({ signal }));
});

test("invalidates only users after successful deletion", async () => {
  fetchMock.mockResolvedValue(undefined);
  const mutation = deleteUserMutation() as unknown as {
    mutation: (userId: string) => Promise<void>;
    onSuccess: () => void;
  };

  await mutation.mutation("user-1");
  mutation.onSuccess();

  expect(fetchMock).toHaveBeenCalledWith("/api/users/user-1", { method: "DELETE" });
  expect(invalidateQueries).toHaveBeenCalledWith({ key: USER_QUERY_KEYS.all });
});
