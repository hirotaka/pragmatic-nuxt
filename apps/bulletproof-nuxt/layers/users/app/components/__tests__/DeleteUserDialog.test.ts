import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import UserActionsMenu from "../UserActionsMenu.vue";

const { addNotification, deleteUserMutate, user } = vi.hoisted(() => ({
  addNotification: vi.fn(),
  deleteUserMutate: vi.fn(),
  user: {
    id: "user-1",
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Lovelace",
    role: "ADMIN" as const,
    bio: "",
    teamId: "team-1",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));

vi.mock("~users/app/composables/useDeleteUser", () => ({
  useDeleteUser: () => deleteUserMutate,
}));

async function confirmDelete() {
  const wrapper = await mountSuspended(UserActionsMenu, {
    props: {
      actionLabel: "Open user actions",
      user,
    },
  });
  const componentScreen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(componentScreen.getByRole("button", { name: "Open user actions" }));
  await userEvent.click(await componentScreen.findByRole("menuitem", { name: /delete user/i }));
  const dialog = await bodyScreen.findByRole("dialog", { name: /delete user/i });
  await userEvent.click(within(dialog).getByRole("button", { name: /delete user/i }));

  return { bodyScreen, componentScreen, wrapper };
}

beforeEach(() => {
  addNotification.mockReset();
  deleteUserMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("reports successful deletion after its action dropdown closes", async () => {
  const { bodyScreen, componentScreen, wrapper } = await confirmDelete();

  await waitFor(() => expect(wrapper.emitted("success")).toHaveLength(1));
  expect(deleteUserMutate).toHaveBeenCalledWith("user-1");
  expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "User Deleted",
  });
  await waitFor(() => {
    expect(bodyScreen.queryByRole("dialog", { name: /delete user/i })).toBeNull();
  });
  expect(componentScreen.getByRole("menu").getAttribute("data-state")).toBe("closed");
});

test("releases dialog controls and stays open when mutation fails", async () => {
  deleteUserMutate.mockRejectedValueOnce(new Error("Delete failed"));
  const { bodyScreen, wrapper } = await confirmDelete();

  await waitFor(() => expect(deleteUserMutate).toHaveBeenCalledOnce());
  expect(addNotification).not.toHaveBeenCalled();
  expect(wrapper.emitted("success")).toBeUndefined();
  const dialog = bodyScreen.getByRole("dialog", { name: /delete user/i });
  expect(within(dialog).getByRole("button", { name: /delete user/i }).hasAttribute("disabled")).toBe(false);
  expect(within(dialog).getByRole("button", { name: /cancel/i }).hasAttribute("disabled")).toBe(false);
});
