import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { mountSuspended, mockNuxtImport } from "@nuxt/test-utils/runtime";
import { cleanup, waitFor, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { ref } from "vue";
import type { PaginatedUsers, User } from "~users/shared/types";
import UsersList from "../UsersList.vue";

const {
  addNotification,
  invalidateUserLists,
  mutateAsync,
  queryClient,
  refetch,
  replace,
  push,
  route,
  useMutation,
  useQuery,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  invalidateUserLists: vi.fn(),
  mutateAsync: vi.fn(),
  queryClient: {},
  refetch: vi.fn(),
  replace: vi.fn(),
  push: vi.fn(),
  route: { query: {} as Record<string, string | undefined> },
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

mockNuxtImport("useRoute", () => () => route);
mockNuxtImport("useRouter", () => () => ({
  afterEach: vi.fn(),
  beforeEach: vi.fn(),
  beforeResolve: vi.fn(),
  push,
  replace,
}));

const queryState = {
  data: ref<PaginatedUsers>(),
  isFetching: ref(false),
  isRefetchError: ref(false),
  status: ref<"pending" | "error" | "success">("success"),
};
const mutationState = { isPending: ref(false) };

vi.mock("@tanstack/vue-query", () => ({
  useMutation,
  useQuery,
  useQueryClient: () => queryClient,
}));
vi.mock("~users/app/queries/users", () => ({
  deleteUserMutation: () => ({ mutationKey: ["users", "delete"] }),
  invalidateUserLists,
  normalizeUserPage: (value: unknown) => value === "2" ? 2 : 1,
  userListQuery: ({ page, limit }: { page: number; limit: number }) => ({ queryKey: ["users", "list", { page, limit }] }),
}));
vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));
vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ user: ref({ id: "current-user" }) }),
}));

const user: User = {
  id: "user-1",
  email: "admin@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  role: "ADMIN",
  teamId: "team-1",
  createdAt: "2026-01-01T00:00:00.000Z",
};

function result(overrides: Partial<PaginatedUsers> = {}): PaginatedUsers {
  return {
    data: [user],
    meta: { page: 1, limit: 10, total: 11, totalPages: 2, hasMore: true },
    ...overrides,
  };
}

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });
  return { promise, reject, resolve };
}

beforeEach(() => {
  route.query = {};
  queryState.data.value = result();
  queryState.isFetching.value = false;
  queryState.isRefetchError.value = false;
  queryState.status.value = "success";
  mutationState.isPending.value = false;
  addNotification.mockReset();
  invalidateUserLists.mockReset().mockResolvedValue(undefined);
  mutateAsync.mockReset().mockResolvedValue(undefined);
  refetch.mockReset().mockResolvedValue(undefined);
  replace.mockReset().mockResolvedValue(undefined);
  push.mockReset().mockResolvedValue(undefined);
  useQuery.mockReset().mockReturnValue({ ...queryState, refetch, suspense: vi.fn() });
  useMutation.mockReset().mockReturnValue({ isPending: mutationState.isPending, mutateAsync });
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const mountUsersList = () => mountSuspended(UsersList);

test("renders paginated rows and total without page-local aggregate cards", async () => {
  route.query = { page: "2" };
  queryState.data.value = result({
    meta: { page: 2, limit: 10, total: 11, totalPages: 2, hasMore: false },
  });
  const wrapper = await mountUsersList();
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByRole("table")).toBeTruthy();
  expect(screen.getAllByText("Ada Lovelace").length).toBeGreaterThan(0);
  expect(screen.getAllByText("11 users").length).toBeGreaterThan(0);
  expect(screen.queryByText("Administrators")).toBeNull();
  expect(screen.queryByText("Latest account")).toBeNull();
});

test("distinguishes initial pending, initial error, and successful empty data", async () => {
  queryState.data.value = undefined;
  queryState.status.value = "pending";
  const pending = await mountUsersList();
  expect(within(pending.element as HTMLElement).getByRole("status")).toBeTruthy();
  pending.unmount();

  queryState.status.value = "error";
  const failed = await mountUsersList();
  const alert = within(failed.element as HTMLElement).getByRole("alert");
  expect(alert.textContent).toContain("Users could not be loaded");
  await userEvent.click(within(alert).getByRole("button", { name: "Retry" }));
  expect(refetch).toHaveBeenCalledWith({ throwOnError: true });
  failed.unmount();

  queryState.data.value = result({
    data: [],
    meta: { page: 1, limit: 10, total: 0, totalPages: 0, hasMore: false },
  });
  queryState.status.value = "success";
  const empty = await mountUsersList();
  expect(within(empty.element as HTMLElement).getAllByText(/No users found/)).toHaveLength(2);
});

test("settles a committed delete before detached list synchronization", async () => {
  const synchronization = deferred();
  invalidateUserLists.mockReturnValueOnce(synchronization.promise);
  const wrapper = await mountUsersList();
  const screen = within(wrapper.element as HTMLElement);
  const body = within(document.body);

  await userEvent.click(within(screen.getByRole("table")).getByRole("button", { name: "Delete User" }));
  const buttons = await body.findAllByRole("button", { name: "Delete User" });
  await userEvent.click(buttons.at(-1)!);

  await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith("user-1"));
  await waitFor(() => expect(body.queryByRole("dialog", { name: "Delete User" })).toBeNull());
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "User Deleted" });
  expect(invalidateUserLists).toHaveBeenCalledWith(queryClient);

  synchronization.reject(new Error("Users refresh failed"));
  await Promise.resolve();
  expect(addNotification).toHaveBeenCalledTimes(1);
});

test("keeps the current route after refreshed metadata reports a smaller last page", async () => {
  route.query = { page: "2" };
  const synchronization = deferred();
  invalidateUserLists.mockImplementationOnce(async () => {
    await synchronization.promise;
    queryState.data.value = result({
      data: [],
      meta: { page: 2, limit: 10, total: 10, totalPages: 1, hasMore: false },
    });
  });
  const wrapper = await mountUsersList();
  const body = within(document.body);
  push.mockClear();
  replace.mockClear();

  const screen = within(wrapper.element as HTMLElement);
  await userEvent.click(within(screen.getByRole("table")).getByRole("button", { name: "Delete User" }));
  const buttons = await body.findAllByRole("button", { name: "Delete User" });
  await userEvent.click(buttons.at(-1)!);

  synchronization.resolve();
  await waitFor(() => expect(queryState.data.value?.meta.totalPages).toBe(1));
  expect(push).not.toHaveBeenCalled();
  expect(replace).not.toHaveBeenCalled();
  expect(route.query).toEqual({ page: "2" });
});

test("keeps mutation failure retryable and does not synchronize", async () => {
  mutateAsync.mockRejectedValueOnce(new Error("Delete failed"));
  const wrapper = await mountUsersList();
  const body = within(document.body);

  const screen = within(wrapper.element as HTMLElement);
  await userEvent.click(within(screen.getByRole("table")).getByRole("button", { name: "Delete User" }));
  const buttons = await body.findAllByRole("button", { name: "Delete User" });
  await userEvent.click(buttons.at(-1)!);

  await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce());
  expect(body.getByRole("dialog", { name: "Delete User" })).toBeTruthy();
  expect(addNotification).not.toHaveBeenCalled();
  expect(invalidateUserLists).not.toHaveBeenCalled();
});
