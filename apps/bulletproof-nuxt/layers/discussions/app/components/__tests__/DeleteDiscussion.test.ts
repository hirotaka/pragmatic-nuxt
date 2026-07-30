import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import DeleteDiscussion from "../DeleteDiscussion.vue";

const {
  addNotification,
  deleteDiscussionMutate,
  discussionRefresh,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  deleteDiscussionMutate: vi.fn(),
  discussionRefresh: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({
    addNotification,
  }),
}));

vi.mock("~discussions/app/composables/useDeleteDiscussion", () => ({
  useDeleteDiscussion: () => async (id: string) => deleteDiscussionMutate(id),
}));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({
    isAdmin: { value: true },
  }),
}));

beforeEach(() => {
  addNotification.mockClear();
  deleteDiscussionMutate.mockReset().mockResolvedValue(undefined);
  discussionRefresh.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("DeleteDiscussion confirms destructive action and deletes the discussion", async () => {
  const wrapper = await mountSuspended(DeleteDiscussion, {
    props: { id: "discussion-1", refresh: discussionRefresh },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /delete discussion/i }));
  expect(await bodyScreen.findByText(/are you sure you want to delete this discussion/i)).toBeTruthy();

  const buttons = bodyScreen.getAllByRole("button", { name: /delete discussion/i });
  await userEvent.click(buttons[buttons.length - 1]!);

  await waitFor(() => expect(deleteDiscussionMutate).toHaveBeenCalledWith("discussion-1"));
  await waitFor(() => expect(discussionRefresh).toHaveBeenCalledTimes(1));
  expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "Discussion Deleted",
  });
  expect(addNotification).toHaveBeenCalledTimes(1);
  expect(addNotification.mock.invocationCallOrder[0]).toBeLessThan(
    discussionRefresh.mock.invocationCallOrder[0]!,
  );
});

test("DeleteDiscussion keeps mutation success when the follow-up refresh fails", async () => {
  discussionRefresh.mockImplementationOnce(async () => {
    addNotification({ type: "error", title: "Error", message: "Refresh failed" });
    throw new Error("Refresh failed");
  });
  const wrapper = await mountSuspended(DeleteDiscussion, {
    props: { id: "discussion-1", refresh: discussionRefresh },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /delete discussion/i }));
  const buttons = await bodyScreen.findAllByRole("button", { name: /delete discussion/i });
  await userEvent.click(buttons[buttons.length - 1]!);

  await waitFor(() => expect(discussionRefresh).toHaveBeenCalledTimes(1));
  expect(deleteDiscussionMutate).toHaveBeenCalledTimes(1);
  expect(addNotification.mock.calls).toEqual([
    [{ type: "success", title: "Discussion Deleted" }],
    [{ type: "error", title: "Error", message: "Refresh failed" }],
  ]);
  await waitFor(() => {
    expect(bodyScreen.queryByText(/are you sure you want to delete this discussion/i)).toBeNull();
  });
});

test("DeleteDiscussion does not duplicate the API failure or continue success processing", async () => {
  deleteDiscussionMutate.mockRejectedValueOnce(new Error("Delete failed"));
  const wrapper = await mountSuspended(DeleteDiscussion, {
    props: { id: "discussion-1", refresh: discussionRefresh },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /delete discussion/i }));
  const buttons = await bodyScreen.findAllByRole("button", { name: /delete discussion/i });
  await userEvent.click(buttons[buttons.length - 1]!);

  const dialog = bodyScreen.getByRole("dialog", { name: /delete discussion/i });
  await waitFor(() => {
    expect(within(dialog).getByRole("button", { name: "Delete Discussion" }).hasAttribute("disabled")).toBe(false);
  });
  expect(discussionRefresh).not.toHaveBeenCalled();
  expect(addNotification).not.toHaveBeenCalled();
  expect(within(dialog).queryByRole("alert")).toBeNull();
  expect(within(dialog).getByRole("button", { name: /cancel/i }).hasAttribute("disabled")).toBe(false);
});
