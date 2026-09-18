import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import DeleteDiscussion from "../DeleteDiscussion.vue";

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
vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ isAdmin: { value: true } }),
}));

beforeEach(() => {
  addNotification.mockReset();
  deleteDiscussionMutation.mockReset().mockReturnValue({ mutationKey: ["discussions", "delete"] });
  invalidateDiscussionLists.mockReset().mockResolvedValue(undefined);
  mutateAsync.mockReset().mockResolvedValue(undefined);
  mutationPending.value = false;
  useMutation.mockReset().mockReturnValue({ isPending: mutationPending, mutateAsync });
  useQueryClient.mockReset().mockReturnValue({});
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

test("DeleteDiscussion confirms destructive action and targets the native Mutation", async () => {
  const wrapper = await mountSuspended(DeleteDiscussion, { props: { id: "discussion-1" } });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /delete discussion/i }));
  const buttons = await bodyScreen.findAllByRole("button", { name: /delete discussion/i });
  await userEvent.click(buttons[buttons.length - 1]!);

  await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith("discussion-1"));
});

test("DeleteDiscussion closes after the write before current-page synchronization settles", async () => {
  const synchronization = deferred();
  invalidateDiscussionLists.mockReturnValueOnce(synchronization.promise);
  const wrapper = await mountSuspended(DeleteDiscussion, { props: { id: "discussion-1" } });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /delete discussion/i }));
  const buttons = await bodyScreen.findAllByRole("button", { name: /delete discussion/i });
  await userEvent.click(buttons[buttons.length - 1]!);

  await waitFor(() => expect(invalidateDiscussionLists).toHaveBeenCalledWith({}));
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Discussion Deleted" });
  await waitFor(() => expect(bodyScreen.queryByRole("dialog", { name: /delete discussion/i })).toBeNull());

  synchronization.resolve();
});

test("DeleteDiscussion leaves confirmation open and retryable when the write fails", async () => {
  mutateAsync.mockRejectedValueOnce(new Error("Delete failed"));
  const wrapper = await mountSuspended(DeleteDiscussion, { props: { id: "discussion-1" } });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /delete discussion/i }));
  const buttons = await bodyScreen.findAllByRole("button", { name: /delete discussion/i });
  await userEvent.click(buttons[buttons.length - 1]!);

  await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
  expect(addNotification).not.toHaveBeenCalled();
  expect(invalidateDiscussionLists).not.toHaveBeenCalled();
  expect(bodyScreen.getByRole("dialog", { name: /delete discussion/i })).toBeTruthy();
  expect(bodyScreen.getByRole("button", { name: /cancel/i }).hasAttribute("disabled")).toBe(false);
});

test("DeleteDiscussion safely ignores a rejected detached synchronization", async () => {
  invalidateDiscussionLists.mockRejectedValueOnce(new Error("Read failed"));
  const wrapper = await mountSuspended(DeleteDiscussion, { props: { id: "discussion-1" } });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /delete discussion/i }));
  const buttons = await bodyScreen.findAllByRole("button", { name: /delete discussion/i });
  await userEvent.click(buttons[buttons.length - 1]!);

  await waitFor(() => expect(invalidateDiscussionLists).toHaveBeenCalledTimes(1));
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Discussion Deleted" });
  await waitFor(() => expect(bodyScreen.queryByRole("dialog", { name: /delete discussion/i })).toBeNull());
});
