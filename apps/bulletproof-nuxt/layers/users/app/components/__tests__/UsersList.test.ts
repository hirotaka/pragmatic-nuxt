import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { cleanup, waitFor, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import type { User } from "~users/shared/types";
import UsersList from "../UsersList.vue";

const {
  addNotification,
  deleteUserMutate,
  refresh,
  users,
  usersState,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  deleteUserMutate: vi.fn(),
  refresh: vi.fn(),
  users: [
    {
      id: "user-1",
      email: "admin@example.com",
      firstName: "Ada",
      lastName: "Lovelace",
      role: "ADMIN",
      bio: "",
      teamId: "team-1",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ] as User[],
  usersState: {
    data: undefined as User[] | undefined,
  },
}));

usersState.data = users;

vi.mock("~users/app/composables/useUsers", () => ({
  useUsers: async () => ({
    data: usersState.data,
    refresh,
  }),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ user: { value: { id: "current-user" } } }),
}));

vi.mock("~users/app/composables/useDeleteUser", () => ({
  useDeleteUser: () => deleteUserMutate,
}));

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

async function confirmDelete(region: HTMLElement) {
  await userEvent.click(within(region).getByRole("button", { name: /open user actions for ada lovelace/i }));

  let menu!: HTMLElement;
  await waitFor(() => {
    menu = region.querySelector<HTMLElement>("[role='menu'][data-state='open']")!;
    expect(menu).toBeTruthy();
  });
  await userEvent.click(within(menu).getByRole("menuitem", { name: /delete user/i }));

  const bodyScreen = within(document.body);
  const dialog = await bodyScreen.findByRole("dialog", { name: /delete user/i });
  await userEvent.click(within(dialog).getByRole("button", { name: /delete user/i }));

  return { bodyScreen, dialog };
}

beforeEach(() => {
  refresh.mockReset().mockResolvedValue(undefined);
  addNotification.mockReset();
  deleteUserMutate.mockReset().mockResolvedValue(undefined);
  usersState.data = users;
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const mountUsersList = () => mountSuspended(UsersList);

test("UsersList renders user rows and action menus", async () => {
  const wrapper = await mountUsersList();
  const screen = within(wrapper.element as HTMLElement);
  const desktopTable = screen.getByRole("table");
  const mobileCards = screen.getByRole("list", { name: "User directory cards" });

  expect(within(desktopTable).getByText("Ada")).toBeTruthy();
  expect(within(desktopTable).getByText("Lovelace")).toBeTruthy();
  expect(within(desktopTable).getByText("admin@example.com")).toBeTruthy();
  expect(within(desktopTable).getByText("Team team-1")).toBeTruthy();
  expect(within(desktopTable).getByText("ADMIN")).toBeTruthy();
  expect(within(desktopTable).getByRole("button", { name: /open user actions for ada lovelace/i })).toBeTruthy();

  expect(within(mobileCards).getByText("Ada Lovelace")).toBeTruthy();
  expect(within(mobileCards).getByText("admin@example.com")).toBeTruthy();
  expect(within(mobileCards).getByText("team-1")).toBeTruthy();
  expect(within(mobileCards).getByText("ADMIN")).toBeTruthy();
  expect(within(mobileCards).getByRole("button", { name: /open user actions for ada lovelace/i })).toBeTruthy();
  expect(refresh).not.toHaveBeenCalled();
});

test("UsersList does not render a successful empty state before data exists", async () => {
  usersState.data = undefined;
  const wrapper = await mountUsersList();
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.queryByRole("table")).toBeNull();
  expect(screen.queryByRole("list", { name: "User directory cards" })).toBeNull();
  expect(screen.queryByText(/no users found/i)).toBeNull();
  expect(screen.queryByText("Administrators")).toBeNull();
  expect(screen.queryByText("Latest account")).toBeNull();
});

test("UsersList renders the successful empty response", async () => {
  usersState.data = [];
  const wrapper = await mountUsersList();
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getAllByText(/No users found/)).toHaveLength(2);
  expect(screen.getByText("No accounts yet")).toBeTruthy();
  expect(screen.getAllByText("0")).toHaveLength(2);
});

test("refreshes the users read after mobile deletion succeeds", async () => {
  const wrapper = await mountUsersList();
  const mobileCards = within(wrapper.element as HTMLElement).getByRole("list", { name: "User directory cards" });

  await confirmDelete(mobileCards);

  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  expect(deleteUserMutate).toHaveBeenCalledWith("user-1");
});

test("closes the dialog without waiting for the owner refresh", async () => {
  const refreshSettlement = deferred();
  refresh.mockImplementationOnce(() => refreshSettlement.promise);
  const wrapper = await mountUsersList();
  const desktopTable = within(wrapper.element as HTMLElement).getByRole("table");
  const { bodyScreen } = await confirmDelete(desktopTable);

  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  expect(deleteUserMutate).toHaveBeenCalledWith("user-1");
  await waitFor(() => {
    expect(bodyScreen.queryByRole("dialog", { name: /delete user/i })).toBeNull();
  });

  refreshSettlement.resolve();
});

test("keeps deletion success when the users refresh reports an error", async () => {
  refresh.mockImplementationOnce(async () => {
    addNotification({ type: "error", title: "Error", message: "Users refresh failed" });
    throw new Error("Users refresh failed");
  });
  const wrapper = await mountUsersList();
  const desktopTable = within(wrapper.element as HTMLElement).getByRole("table");

  await confirmDelete(desktopTable);

  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  expect(deleteUserMutate).toHaveBeenCalledWith("user-1");
  expect(addNotification.mock.calls).toEqual([
    [{ type: "success", title: "User Deleted" }],
    [{ type: "error", title: "Error", message: "Users refresh failed" }],
  ]);
});

test("does not refresh a remounted users owner when an earlier deletion settles", async () => {
  let finishDelete!: () => void;
  deleteUserMutate.mockReturnValueOnce(new Promise<void>((resolve) => {
    finishDelete = resolve;
  }));
  const firstOwner = await mountUsersList();
  const desktopTable = within(firstOwner.element as HTMLElement).getByRole("table");

  const confirmation = confirmDelete(desktopTable);
  await waitFor(() => expect(deleteUserMutate).toHaveBeenCalledWith("user-1"));

  firstOwner.unmount();
  await mountUsersList();
  finishDelete();
  await confirmation;
  await waitFor(() => expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "User Deleted",
  }));

  expect(refresh).not.toHaveBeenCalled();
});
