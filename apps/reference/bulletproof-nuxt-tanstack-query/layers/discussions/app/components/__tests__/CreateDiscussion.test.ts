import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import CreateDiscussion from "../CreateDiscussion.vue";

const {
  addNotification,
  createDiscussionMutation,
  invalidateDiscussionLists,
  mutateAsync,
  mutationPending,
  useMutation,
  useQueryClient,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  createDiscussionMutation: vi.fn(),
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
  createDiscussionMutation,
  invalidateDiscussionLists,
}));

beforeEach(() => {
  addNotification.mockReset();
  createDiscussionMutation.mockReset().mockReturnValue({ mutationKey: ["discussions", "create"] });
  invalidateDiscussionLists.mockReset().mockResolvedValue(undefined);
  mutateAsync.mockReset().mockResolvedValue({ id: "discussion-1" });
  mutationPending.value = false;
  useMutation.mockReset().mockReturnValue({ isPending: mutationPending, mutateAsync });
  useQueryClient.mockReset().mockReturnValue({});
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

function deferred<T = void>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });
  return { promise, reject, resolve };
}

test("CreateDiscussion blocks invalid submit and sends a valid native Mutation payload", async () => {
  const wrapper = await mountSuspended(CreateDiscussion);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create discussion/i }));
  await userEvent.click(await bodyScreen.findByRole("button", { name: /submit/i }));
  await bodyScreen.findAllByText(/required/i);
  expect(mutateAsync).not.toHaveBeenCalled();

  await userEvent.type(bodyScreen.getByLabelText(/title/i), "New discussion");
  await userEvent.type(bodyScreen.getByLabelText(/body/i), "Discussion body");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({
    title: "New discussion",
    body: "Discussion body",
  }));
});

test("CreateDiscussion settles success before its detached list synchronization", async () => {
  const synchronization = deferred();
  invalidateDiscussionLists.mockReturnValueOnce(synchronization.promise);
  const wrapper = await mountSuspended(CreateDiscussion);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create discussion/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/title/i), "New discussion");
  await userEvent.type(bodyScreen.getByLabelText(/body/i), "Discussion body");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(invalidateDiscussionLists).toHaveBeenCalledWith({}));
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Discussion Created" });
  await waitFor(() => {
    expect(bodyScreen.queryByRole("dialog", { name: /create discussion/i })).toBeNull();
  });

  synchronization.resolve();
});

test("CreateDiscussion preserves the draft and retry controls when the write fails", async () => {
  mutateAsync.mockRejectedValueOnce(new Error("Create failed"));
  const wrapper = await mountSuspended(CreateDiscussion);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create discussion/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/title/i), "New discussion");
  await userEvent.type(bodyScreen.getByLabelText(/body/i), "Discussion body");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1));
  expect(addNotification).not.toHaveBeenCalled();
  expect(invalidateDiscussionLists).not.toHaveBeenCalled();
  expect(bodyScreen.getByRole("dialog", { name: /create discussion/i })).toBeTruthy();
  expect((bodyScreen.getByLabelText(/title/i) as HTMLInputElement).value).toBe("New discussion");
});

test("CreateDiscussion safely ignores a rejected detached synchronization", async () => {
  invalidateDiscussionLists.mockRejectedValueOnce(new Error("Read failed"));
  const wrapper = await mountSuspended(CreateDiscussion);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create discussion/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/title/i), "New discussion");
  await userEvent.type(bodyScreen.getByLabelText(/body/i), "Discussion body");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(invalidateDiscussionLists).toHaveBeenCalledTimes(1));
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Discussion Created" });
  await waitFor(() => expect(bodyScreen.queryByRole("dialog", { name: /create discussion/i })).toBeNull());
});
