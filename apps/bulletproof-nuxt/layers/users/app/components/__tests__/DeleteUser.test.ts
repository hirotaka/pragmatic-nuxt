import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import DeleteUser from "../DeleteUser.vue";

const { addNotification, deleteUserMutate } = vi.hoisted(() => ({
  addNotification: vi.fn(),
  deleteUserMutate: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ user: { id: "current-user" } }),
}));

vi.mock("~users/app/composables/useDeleteUser", () => ({
  useDeleteUser: () => deleteUserMutate,
}));

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });
  return { promise, resolve, reject };
}

async function confirmDelete(refresh: () => Promise<void>) {
  const wrapper = await mountSuspended(DeleteUser, {
    props: { id: "user-1", refresh },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /^delete$/i }));
  const buttons = await bodyScreen.findAllByRole("button", { name: /delete user/i });
  await userEvent.click(buttons[buttons.length - 1]!);

  return bodyScreen;
}

beforeEach(() => {
  addNotification.mockReset();
  deleteUserMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("publishes success then waits for refresh before closing", async () => {
  const refreshSettlement = deferred();
  const refresh = vi.fn(() => refreshSettlement.promise);
  const bodyScreen = await confirmDelete(refresh);

  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  expect(deleteUserMutate).toHaveBeenCalledWith("user-1");
  expect(addNotification.mock.invocationCallOrder[0]).toBeLessThan(
    refresh.mock.invocationCallOrder[0]!,
  );
  expect(bodyScreen.getByText(/are you sure you want to delete this user/i)).toBeTruthy();
  await userEvent.click(bodyScreen.getByRole("button", { name: /cancel/i }));
  await userEvent.keyboard("{Escape}");
  expect(bodyScreen.getByText(/are you sure you want to delete this user/i)).toBeTruthy();

  refreshSettlement.resolve();

  await waitFor(() => {
    expect(bodyScreen.queryByText(/are you sure you want to delete this user/i)).toBeNull();
  });
  expect(addNotification).toHaveBeenCalledTimes(1);
});

test("keeps committed success when refresh fails and closes after failure settlement", async () => {
  const refreshSettlement = deferred();
  const refresh = vi.fn(async () => {
    try {
      await refreshSettlement.promise;
    }
    catch (error) {
      addNotification({ type: "error", title: "Error", message: "Refresh failed" });
      throw error;
    }
  });
  const bodyScreen = await confirmDelete(refresh);

  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  refreshSettlement.reject(new Error("Refresh failed"));

  await waitFor(() => {
    expect(bodyScreen.queryByText(/are you sure you want to delete this user/i)).toBeNull();
  });
  expect(addNotification.mock.calls).toEqual([
    [{ type: "success", title: "User Deleted" }],
    [{ type: "error", title: "Error", message: "Refresh failed" }],
  ]);
});

test("does not notify, refresh, or close when mutation fails", async () => {
  deleteUserMutate.mockRejectedValueOnce(new Error("Delete failed"));
  const refresh = vi.fn().mockResolvedValue(undefined);
  const bodyScreen = await confirmDelete(refresh);

  await waitFor(() => expect(deleteUserMutate).toHaveBeenCalledOnce());
  expect(addNotification.mock.calls.filter(([notification]) => notification.type === "success")).toHaveLength(0);
  expect(refresh).not.toHaveBeenCalled();
  expect(bodyScreen.getByText(/are you sure you want to delete this user/i)).toBeTruthy();
  const confirmButton = bodyScreen.getByRole("button", { name: /delete user/i });
  const cancelButton = bodyScreen.getByRole("button", { name: /cancel/i });
  expect(confirmButton.hasAttribute("disabled")).toBe(false);
  expect(cancelButton.hasAttribute("disabled")).toBe(false);

  deleteUserMutate.mockResolvedValueOnce(undefined);
  await userEvent.click(confirmButton);
  await waitFor(() => expect(deleteUserMutate).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
});
