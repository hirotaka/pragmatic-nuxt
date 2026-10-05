import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import CommentActionsMenu from "../CommentActionsMenu.vue";

const { addNotification, deleteCommentMutate } = vi.hoisted(() => ({
  addNotification: vi.fn(),
  deleteCommentMutate: vi.fn(),
}));

vi.mock("vue-sonner", () => ({
  toast: { success: addNotification },
}));

mockNuxtImport("useDeleteComment", () => () => deleteCommentMutate);

async function confirmDelete() {
  const wrapper = await mountSuspended(CommentActionsMenu, {
    props: {
      actionLabel: "Open comment actions",
      commentId: "comment-1",
    },
  });
  const componentScreen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(componentScreen.getByRole("button", { name: "Open comment actions" }));
  await userEvent.click(await bodyScreen.findByRole("menuitem", { name: /delete comment/i }));
  const dialog = await bodyScreen.findByRole("alertdialog", { name: /delete comment/i });
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

test("reports successful deletion after its action dropdown closes", async () => {
  const { bodyScreen, wrapper } = await confirmDelete();

  await waitFor(() => expect(wrapper.emitted("success")).toHaveLength(1));
  expect(deleteCommentMutate).toHaveBeenCalledWith("comment-1");
  expect(addNotification).toHaveBeenCalledWith("Comment Deleted");
  await waitFor(() => {
    expect(bodyScreen.queryByRole("alertdialog", { name: /delete comment/i })).toBeNull();
  });
  expect(bodyScreen.getByRole("menu", { hidden: true }).getAttribute("data-state")).toBe("closed");
});

test("releases dialog controls and stays open when mutation fails", async () => {
  deleteCommentMutate.mockRejectedValueOnce(new Error("Delete failed"));
  const { bodyScreen, wrapper } = await confirmDelete();

  await waitFor(() => expect(deleteCommentMutate).toHaveBeenCalledOnce());
  expect(addNotification).not.toHaveBeenCalled();
  expect(wrapper.emitted("success")).toBeUndefined();
  const dialog = bodyScreen.getByRole("alertdialog", { name: /delete comment/i });
  expect(within(dialog).getByRole("button", { name: /delete comment/i }).hasAttribute("disabled")).toBe(false);
  expect(within(dialog).getByRole("button", { name: /cancel/i }).hasAttribute("disabled")).toBe(false);
});
