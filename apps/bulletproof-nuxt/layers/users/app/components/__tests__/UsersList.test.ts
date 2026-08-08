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

const mountUsersList = (realDeleteUser = false) => mountSuspended(UsersList, {
  global: {
    stubs: realDeleteUser
      ? {}
      : {
          DeleteUser: {
            template: "<button @click=\"refresh()\">Delete User</button>",
            props: ["id", "refresh"],
          },
        },
  },
});

test("UsersList renders user rows and delete action cell", async () => {
  const wrapper = await mountUsersList();

  const screen = within(wrapper.element as HTMLElement);
  const desktopTable = screen.getByRole("table");
  const mobileCards = screen.getByRole("list", { name: "User directory cards" });

  expect(within(desktopTable).getByText("Ada")).toBeTruthy();
  expect(within(desktopTable).getByText("Lovelace")).toBeTruthy();
  expect(within(desktopTable).getByText("admin@example.com")).toBeTruthy();
  expect(within(desktopTable).getByText("Team team-1")).toBeTruthy();
  expect(within(desktopTable).getByText("ADMIN")).toBeTruthy();
  expect(within(desktopTable).getByRole("button", { name: "Delete User" })).toBeTruthy();

  expect(within(mobileCards).getByText("Ada Lovelace")).toBeTruthy();
  expect(within(mobileCards).getByText("admin@example.com")).toBeTruthy();
  expect(within(mobileCards).getByText("team-1")).toBeTruthy();
  expect(within(mobileCards).getByText("ADMIN")).toBeTruthy();
  expect(within(mobileCards).getByRole("button", { name: "Delete User" })).toBeTruthy();
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

test("UsersList refreshes the users read after mobile delete succeeds", async () => {
  const wrapper = await mountUsersList();

  const screen = within(wrapper.element as HTMLElement);
  const mobileCards = screen.getByRole("list", { name: "User directory cards" });
  await userEvent.click(within(mobileCards).getByRole("button", { name: "Delete User" }));
  const bodyScreen = within(document.body);
  const deleteButtons = bodyScreen.getAllByRole("button", { name: "Delete User" });
  await userEvent.click(deleteButtons[deleteButtons.length - 1]!);

  expect(refresh).toHaveBeenCalledTimes(1);
  expect(deleteUserMutate).toHaveBeenCalledWith("user-1");
});

test("wires the users refresh through real DeleteUser and waits before close", async () => {
  const refreshSettlement = deferred();
  refresh.mockImplementationOnce(() => refreshSettlement.promise);
  const wrapper = await mountUsersList(true);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);
  const desktopTable = screen.getByRole("table");

  await userEvent.click(within(desktopTable).getByRole("button", { name: /delete user/i }));
  const deleteButtons = await bodyScreen.findAllByRole("button", { name: /delete user/i });
  await userEvent.click(deleteButtons[deleteButtons.length - 1]!);

  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  expect(deleteUserMutate).toHaveBeenCalledWith("user-1");
  expect(bodyScreen.getByText(/are you sure you want to delete Ada Lovelace/i)).toBeTruthy();

  refreshSettlement.resolve();

  await waitFor(() => {
    expect(bodyScreen.queryByText(/are you sure you want to delete this user/i)).toBeNull();
  });
});

test("does not refresh a remounted users owner when an earlier delete settles", async () => {
  let finishDelete!: () => void;
  deleteUserMutate.mockReturnValueOnce(new Promise<void>((resolve) => {
    finishDelete = resolve;
  }));
  const firstOwner = await mountUsersList(true);
  const firstScreen = within(firstOwner.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(within(firstScreen.getByRole("table")).getByRole("button", { name: /delete user/i }));
  const deleteButtons = await bodyScreen.findAllByRole("button", { name: /delete user/i });
  await userEvent.click(deleteButtons[deleteButtons.length - 1]!);
  await waitFor(() => expect(deleteUserMutate).toHaveBeenCalledWith("user-1"));

  firstOwner.unmount();
  await mountUsersList(true);
  finishDelete();
  await waitFor(() => expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "User Deleted",
  }));

  expect(refresh).not.toHaveBeenCalled();
});
