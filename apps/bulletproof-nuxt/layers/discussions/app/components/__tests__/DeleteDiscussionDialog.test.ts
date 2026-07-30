import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import DeleteDiscussionDialog from "../DeleteDiscussionDialog.vue";

const {
  addNotification,
  deleteDiscussionMutate,
  discussionData,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  deleteDiscussionMutate: vi.fn(),
  discussionData: {
    id: "discussion-1",
    title: "Existing title",
    body: "Existing body",
    authorId: "user-1",
    teamId: "team-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    author: {
      id: "user-1",
      firstName: "Test",
      lastName: "User",
    },
  },
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({
    addNotification,
  }),
}));

vi.mock("~discussions/app/composables/useDeleteDiscussion", () => ({
  useDeleteDiscussion: () => async (id: string) => deleteDiscussionMutate(id),
}));

beforeEach(() => {
  addNotification.mockClear();
  deleteDiscussionMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("DeleteDiscussionDialog keeps its owner open after the API reports a deletion failure", async () => {
  deleteDiscussionMutate.mockRejectedValueOnce(new Error("Delete failed"));
  const wrapper = await mountSuspended(DeleteDiscussionDialog, {
    props: {
      discussion: discussionData,
      open: true,
    },
  });
  const bodyScreen = within(document.body);
  const dialog = bodyScreen.getByRole("dialog", { name: /delete discussion/i });

  await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

  await waitFor(() => {
    expect(within(dialog).getByRole("button", { name: "Delete" }).hasAttribute("disabled")).toBe(false);
  });
  expect(addNotification).not.toHaveBeenCalled();
  expect(within(dialog).queryByRole("alert")).toBeNull();
  expect(within(dialog).getByRole("button", { name: /cancel/i }).hasAttribute("disabled")).toBe(false);
  expect(wrapper.emitted("success")).toBeUndefined();
  expect(wrapper.emitted("update:open")).toBeUndefined();
});
