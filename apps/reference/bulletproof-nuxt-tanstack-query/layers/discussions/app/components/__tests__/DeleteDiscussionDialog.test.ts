import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import DeleteDiscussionDialog from "../DeleteDiscussionDialog.vue";

const {
  addNotification,
  deleteDiscussionMutation,
  invalidateDiscussionLists,
  mutateAsync,
  mutationPending,
  useMutation,
  useQueryClient,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  deleteDiscussionMutation: vi.fn(),
  invalidateDiscussionLists: vi.fn(),
  mutateAsync: vi.fn(),
  mutationPending: { __v_isRef: true, value: false },
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));
vi.mock("@tanstack/vue-query", () => ({ useMutation, useQueryClient }));
vi.mock("~discussions/app/queries/discussions", () => ({
  deleteDiscussionMutation,
  invalidateDiscussionLists,
}));

const discussion = {
  id: "discussion-1",
  title: "Existing title",
  body: "Existing body",
  authorId: "user-1",
  teamId: "team-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  author: { id: "user-1", firstName: "Test", lastName: "User" },
};

beforeEach(() => {
  addNotification.mockReset();
  deleteDiscussionMutation.mockReset().mockReturnValue({ mutationKey: ["discussions", "delete"] });
  invalidateDiscussionLists.mockReset().mockResolvedValue(undefined);
  mutateAsync.mockReset().mockRejectedValue(new Error("Delete failed"));
  mutationPending.value = false;
  useMutation.mockReset().mockReturnValue({ isPending: mutationPending, mutateAsync });
  useQueryClient.mockReset().mockReturnValue({});
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("DeleteDiscussionDialog keeps its owner open after a native mutation failure", async () => {
  const wrapper = await mountSuspended(DeleteDiscussionDialog, {
    props: { discussion, open: true },
  });
  const dialog = within(document.body).getByRole("dialog", { name: /delete discussion/i });

  await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

  await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith("discussion-1"));
  expect(addNotification).not.toHaveBeenCalled();
  expect(invalidateDiscussionLists).not.toHaveBeenCalled();
  expect(wrapper.emitted("success")).toBeUndefined();
  expect(wrapper.emitted("update:open")).toBeUndefined();
  expect(within(dialog).getByRole("button", { name: /cancel/i }).hasAttribute("disabled")).toBe(false);
});
