import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import DeleteCommentDialog from "../DeleteCommentDialog.vue";

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

async function confirmDelete() {
  const wrapper = await mountSuspended(DeleteCommentDialog, {
    props: {
      commentId: "comment-1",
      open: true,
    },
  });
  const bodyScreen = within(document.body);
  const dialog = bodyScreen.getByRole("dialog", { name: /delete comment/i });

  await userEvent.click(within(dialog).getByRole("button", { name: /delete comment/i }));

  return { bodyScreen, wrapper };
}

beforeEach(() => {
  addNotification.mockReset();
  deleteCommentMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("reports successful deletion and asks its owner to close", async () => {
  const { wrapper } = await confirmDelete();

  await waitFor(() => expect(wrapper.emitted("success")).toHaveLength(1));
  expect(deleteCommentMutate).toHaveBeenCalledWith("comment-1");
  expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "Comment Deleted",
  });
  expect(wrapper.emitted("update:open")).toEqual([[false]]);
});

test("releases dialog controls and stays open when mutation fails", async () => {
  deleteCommentMutate.mockRejectedValueOnce(new Error("Delete failed"));
  const { bodyScreen, wrapper } = await confirmDelete();

  await waitFor(() => expect(deleteCommentMutate).toHaveBeenCalledOnce());
  expect(addNotification).not.toHaveBeenCalled();
  expect(wrapper.emitted("success")).toBeUndefined();
  expect(wrapper.emitted("update:open")).toBeUndefined();
  expect(bodyScreen.getByRole("button", { name: /delete comment/i }).hasAttribute("disabled")).toBe(false);
  expect(bodyScreen.getByRole("button", { name: /cancel/i }).hasAttribute("disabled")).toBe(false);
});
