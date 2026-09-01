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

vi.mock("~comments/app/queries/comments", () => ({
  deleteCommentMutation: vi.fn(),
}));

vi.mock("@pinia/colada", () => ({
  useMutation: () => ({
    isLoading: false,
    mutateAsync: deleteCommentMutate,
  }),
  PiniaColadaQueryHooksPlugin: vi.fn(() => ({})),
}));

async function confirmDelete() {
  const wrapper = await mountSuspended(DeleteComment, {
    props: { commentId: "comment-1", discussionId: "discussion-1" },
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

test("completes at write success without waiting for refresh", async () => {
  const bodyScreen = await confirmDelete();

  expect(deleteCommentMutate).toHaveBeenCalledWith({ commentId: "comment-1", discussionId: "discussion-1" });
  await waitFor(() => {
    expect(bodyScreen.queryByText(/are you sure you want to delete this comment/i)).toBeNull();
  });
  expect(addNotification).toHaveBeenCalledTimes(1);
});

test("releases dialog controls and allows cancel when mutation fails", async () => {
  deleteCommentMutate.mockRejectedValueOnce(new Error("Delete failed"));
  const bodyScreen = await confirmDelete();

  await waitFor(() => expect(deleteCommentMutate).toHaveBeenCalledOnce());
  expect(addNotification.mock.calls.filter(([notification]) => notification.type === "success")).toHaveLength(0);
  expect(bodyScreen.getByText(/are you sure you want to delete this comment/i)).toBeTruthy();
  expect(bodyScreen.getByRole("button", { name: /delete comment/i }).hasAttribute("disabled")).toBe(false);
  const cancelButton = bodyScreen.getByRole("button", { name: /cancel/i });
  expect(cancelButton.hasAttribute("disabled")).toBe(false);

  await userEvent.click(cancelButton);

  await waitFor(() => {
    expect(bodyScreen.queryByText(/are you sure you want to delete this comment/i)).toBeNull();
  });
});
