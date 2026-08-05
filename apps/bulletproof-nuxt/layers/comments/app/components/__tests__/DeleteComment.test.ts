import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import DeleteComment from "../DeleteComment.vue";

const { addNotification, deleteCommentMutate } = vi.hoisted(() => ({
  addNotification: vi.fn(),
  deleteCommentMutate: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));

vi.mock("~comments/app/composables/useDeleteComment", () => ({
  useDeleteComment: () => deleteCommentMutate,
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
  const wrapper = await mountSuspended(DeleteComment, {
    props: { commentId: "comment-1", refresh },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /delete comment/i }));
  const buttons = await bodyScreen.findAllByRole("button", { name: /delete comment/i });
  await userEvent.click(buttons[buttons.length - 1]!);

  return bodyScreen;
}

beforeEach(() => {
  addNotification.mockReset();
  deleteCommentMutate.mockReset().mockResolvedValue(undefined);
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
  expect(deleteCommentMutate).toHaveBeenCalledWith("comment-1");
  expect(addNotification.mock.invocationCallOrder[0]).toBeLessThan(
    refresh.mock.invocationCallOrder[0]!,
  );
  expect(bodyScreen.getByText(/are you sure you want to delete this comment/i)).toBeTruthy();
  await userEvent.click(bodyScreen.getByRole("button", { name: /cancel/i }));
  await userEvent.keyboard("{Escape}");
  expect(bodyScreen.getByText(/are you sure you want to delete this comment/i)).toBeTruthy();

  refreshSettlement.resolve();

  await waitFor(() => {
    expect(bodyScreen.queryByText(/are you sure you want to delete this comment/i)).toBeNull();
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
    expect(bodyScreen.queryByText(/are you sure you want to delete this comment/i)).toBeNull();
  });
  expect(addNotification.mock.calls).toEqual([
    [{ type: "success", title: "Comment Deleted" }],
    [{ type: "error", title: "Error", message: "Refresh failed" }],
  ]);
});

test("releases dialog controls and allows cancel when mutation fails", async () => {
  deleteCommentMutate.mockRejectedValueOnce(new Error("Delete failed"));
  const refresh = vi.fn();
  const bodyScreen = await confirmDelete(refresh);

  await waitFor(() => expect(deleteCommentMutate).toHaveBeenCalledOnce());
  expect(addNotification.mock.calls.filter(([notification]) => notification.type === "success")).toHaveLength(0);
  expect(refresh).not.toHaveBeenCalled();
  expect(bodyScreen.getByText(/are you sure you want to delete this comment/i)).toBeTruthy();
  expect(bodyScreen.getByRole("button", { name: /delete comment/i }).hasAttribute("disabled")).toBe(false);
  const cancelButton = bodyScreen.getByRole("button", { name: /cancel/i });
  expect(cancelButton.hasAttribute("disabled")).toBe(false);

  await userEvent.click(cancelButton);

  await waitFor(() => {
    expect(bodyScreen.queryByText(/are you sure you want to delete this comment/i)).toBeNull();
  });
});
