import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import DiscussionActionsMenu from "../DiscussionActionsMenu.vue";

const {
  addNotification,
  deleteDiscussionMutate,
  discussion,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  deleteDiscussionMutate: vi.fn(),
  discussion: {
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
  useNotifications: () => ({ addNotification }),
}));

vi.mock("~discussions/app/composables/useDeleteDiscussion", () => ({
  useDeleteDiscussion: () => async (id: string) => deleteDiscussionMutate(id),
}));

async function confirmDelete() {
  const wrapper = await mountSuspended(DiscussionActionsMenu, {
    props: {
      actionLabel: "Open discussion actions",
      discussion,
    },
  });
  const componentScreen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(componentScreen.getByRole("button", { name: "Open discussion actions" }));
  await userEvent.click(await componentScreen.findByRole("menuitem", { name: /delete discussion/i }));
  const dialog = await bodyScreen.findByRole("dialog", { name: /delete discussion/i });
  await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

  return { bodyScreen, componentScreen, wrapper };
}

beforeEach(() => {
  addNotification.mockReset();
  deleteDiscussionMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("reports successful deletion after its action dropdown closes", async () => {
  const { bodyScreen, componentScreen, wrapper } = await confirmDelete();

  await waitFor(() => expect(wrapper.emitted("success")).toHaveLength(1));
  expect(deleteDiscussionMutate).toHaveBeenCalledWith("discussion-1");
  expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "Discussion Deleted",
  });
  await waitFor(() => {
    expect(bodyScreen.queryByRole("dialog", { name: /delete discussion/i })).toBeNull();
  });
  expect(componentScreen.getByRole("menu").getAttribute("data-state")).toBe("closed");
});

test("releases dialog controls and stays open when mutation fails", async () => {
  deleteDiscussionMutate.mockRejectedValueOnce(new Error("Delete failed"));
  const { bodyScreen, wrapper } = await confirmDelete();

  await waitFor(() => expect(deleteDiscussionMutate).toHaveBeenCalledOnce());
  expect(addNotification).not.toHaveBeenCalled();
  expect(wrapper.emitted("success")).toBeUndefined();
  const dialog = bodyScreen.getByRole("dialog", { name: /delete discussion/i });
  expect(within(dialog).getByRole("button", { name: "Delete" }).hasAttribute("disabled")).toBe(false);
  expect(within(dialog).getByRole("button", { name: /cancel/i }).hasAttribute("disabled")).toBe(false);
});
