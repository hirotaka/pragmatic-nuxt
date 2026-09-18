import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import { ref, toValue } from "vue";
import UpdateDiscussion from "../UpdateDiscussion.vue";

const {
  addNotification,
  discussionData,
  discussionDetailQuery,
  invalidateUpdatedDiscussion,
  mutateAsync,
  mutationPending,
  updateDiscussionMutation,
  useMutation,
  useQuery,
  useQueryClient,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  discussionData: {
    id: "discussion-1",
    title: "Existing title",
    body: "Existing body",
    authorId: "user-1",
    teamId: "team-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    author: { id: "user-1", firstName: "Test", lastName: "User" },
  },
  discussionDetailQuery: vi.fn(),
  invalidateUpdatedDiscussion: vi.fn(),
  mutateAsync: vi.fn(),
  mutationPending: { __v_isRef: true, value: false },
  updateDiscussionMutation: vi.fn(),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));
vi.mock("@tanstack/vue-query", () => ({ useMutation, useQuery, useQueryClient }));
vi.mock("~discussions/app/queries/discussions", () => ({
  discussionDetailQuery,
  invalidateUpdatedDiscussion,
  updateDiscussionMutation,
}));
vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ isAdmin: { value: true } }),
}));

beforeEach(() => {
  addNotification.mockReset();
  discussionData.title = "Existing title";
  discussionData.body = "Existing body";
  discussionDetailQuery.mockReset().mockReturnValue({ queryKey: ["discussions", "detail", "discussion-1"] });
  invalidateUpdatedDiscussion.mockReset().mockResolvedValue(undefined);
  mutateAsync.mockReset().mockResolvedValue({ id: "discussion-1" });
  mutationPending.value = false;
  updateDiscussionMutation.mockReset().mockReturnValue({ mutationKey: ["discussions", "update"] });
  useMutation.mockReset().mockReturnValue({ isPending: mutationPending, mutateAsync });
  useQuery.mockReset().mockImplementation((query) => {
    toValue(query);
    return { data: ref(discussionData) };
  });
  useQueryClient.mockReset().mockReturnValue({});
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

function deferred<T = void>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

test("UpdateDiscussion preloads values and targets the native update Mutation", async () => {
  const wrapper = await mountSuspended(UpdateDiscussion, { props: { discussionId: "discussion-1" } });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  expect(discussionDetailQuery).toHaveBeenCalledWith({
    id: "discussion-1",
    enabled: false,
  });
  await userEvent.click(screen.getByRole("button", { name: /update discussion/i }));
  const title = await bodyScreen.findByLabelText(/title/i);
  expect((title as HTMLInputElement).value).toBe("Existing title");
  await userEvent.clear(title);
  await userEvent.type(title, "Updated title");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({
    id: "discussion-1",
    data: { title: "Updated title", body: "Existing body" },
  }));
});

test("UpdateDiscussion settles committed success while detail and list synchronization is pending", async () => {
  const synchronization = deferred();
  invalidateUpdatedDiscussion.mockReturnValueOnce(synchronization.promise);
  const wrapper = await mountSuspended(UpdateDiscussion, { props: { discussionId: "discussion-1" } });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /update discussion/i }));
  await userEvent.click(await bodyScreen.findByRole("button", { name: /submit/i }));

  await waitFor(() => expect(invalidateUpdatedDiscussion).toHaveBeenCalledWith({}, "discussion-1"));
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Discussion Updated" });
  await waitFor(() => expect(bodyScreen.queryByRole("dialog", { name: /update discussion/i })).toBeNull());

  synchronization.resolve();
});

test("UpdateDiscussion preserves its draft when the write fails", async () => {
  mutateAsync.mockRejectedValueOnce(new Error("Update failed"));
  const wrapper = await mountSuspended(UpdateDiscussion, { props: { discussionId: "discussion-1" } });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /update discussion/i }));
  const title = await bodyScreen.findByLabelText(/title/i);
  await userEvent.clear(title);
  await userEvent.type(title, "Retry title");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
  expect(addNotification).not.toHaveBeenCalled();
  expect(invalidateUpdatedDiscussion).not.toHaveBeenCalled();
  expect((bodyScreen.getByLabelText(/title/i) as HTMLInputElement).value).toBe("Retry title");
  expect(bodyScreen.getByRole("dialog", { name: /update discussion/i })).toBeTruthy();
});

test("UpdateDiscussion does not settle closed UI after unmounting during a write", async () => {
  const write = deferred<{ id: string }>();
  mutateAsync.mockReturnValueOnce(write.promise);
  const wrapper = await mountSuspended(UpdateDiscussion, { props: { discussionId: "discussion-1" } });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /update discussion/i }));
  await userEvent.click(await bodyScreen.findByRole("button", { name: /submit/i }));
  await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));

  wrapper.unmount();
  write.resolve({ id: "discussion-1" });
  await write.promise;
  await Promise.resolve();

  expect(addNotification).not.toHaveBeenCalled();
  expect(invalidateUpdatedDiscussion).not.toHaveBeenCalled();
});
