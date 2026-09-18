import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import DeleteComment from "../DeleteComment.vue";

const {
  addNotification,
  deleteCommentMutation,
  invalidateComments,
  mutateAsync,
  mutationPending,
  useMutation,
  useQueryClient,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  deleteCommentMutation: vi.fn(),
  invalidateComments: vi.fn(),
  mutateAsync: vi.fn(),
  mutationPending: { __v_isRef: true, value: false },
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));
vi.mock("@tanstack/vue-query", () => ({ useMutation, useQueryClient }));
vi.mock("~comments/app/queries/comments", () => ({ deleteCommentMutation, invalidateComments }));

beforeEach(() => {
  addNotification.mockReset();
  deleteCommentMutation.mockReset().mockReturnValue({ mutationKey: ["comments", "delete"] });
  invalidateComments.mockReset().mockResolvedValue(undefined);
  mutateAsync.mockReset().mockResolvedValue(undefined);
  mutationPending.value = false;
  useMutation.mockReset().mockReturnValue({ isPending: mutationPending, mutateAsync });
  useQueryClient.mockReset().mockReturnValue({});
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

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

test("settles a native delete Mutation before detached discussion-scoped invalidation", async () => {
  const synchronization = new Promise<void>(() => undefined);
  invalidateComments.mockReturnValueOnce(synchronization);
  const bodyScreen = await confirmDelete();

  await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ commentId: "comment-1", discussionId: "discussion-1" }));
  await waitFor(() => expect(invalidateComments).toHaveBeenCalledWith({}, "discussion-1"));
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Comment Deleted" });
  await waitFor(() => expect(bodyScreen.queryByRole("dialog", { name: "Delete Comment" })).toBeNull());
});

test("keeps the confirmation dialog available when the delete Mutation fails", async () => {
  mutateAsync.mockRejectedValueOnce(new Error("Delete failed"));
  const bodyScreen = await confirmDelete();

  await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce());
  expect(addNotification).not.toHaveBeenCalled();
  expect(invalidateComments).not.toHaveBeenCalled();
  expect(bodyScreen.getByRole("dialog", { name: "Delete Comment" })).toBeTruthy();
});
