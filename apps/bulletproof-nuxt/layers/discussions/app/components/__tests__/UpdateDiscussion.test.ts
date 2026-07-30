import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import { ref, toValue } from "vue";
import UpdateDiscussion from "../UpdateDiscussion.vue";

const {
  addNotification,
  discussionData,
  discussionRefresh,
  useDiscussionRead,
  updateDiscussionMutate,
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
    author: {
      id: "user-1",
      firstName: "Test",
      lastName: "User",
    },
  },
  discussionRefresh: vi.fn(),
  useDiscussionRead: vi.fn(),
  updateDiscussionMutate: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({
    addNotification,
  }),
}));

vi.mock("~discussions/app/composables/useUpdateDiscussion", () => ({
  useUpdateDiscussion: () => async (input: unknown) => updateDiscussionMutate(input),
}));

vi.mock("~discussions/app/composables/useDiscussion", () => ({
  useDiscussion: async (id: MaybeRefOrGetter<string>) => {
    useDiscussionRead(toValue(id));
    return {
      data: ref(discussionData),
      refresh: discussionRefresh,
    };
  },
}));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({
    isAdmin: { value: true },
  }),
}));

beforeEach(() => {
  addNotification.mockClear();
  discussionData.title = "Existing title";
  discussionData.body = "Existing body";
  discussionRefresh.mockReset().mockResolvedValue(undefined);
  useDiscussionRead.mockClear();
  updateDiscussionMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

function getInputValue(element: HTMLElement) {
  return (element as HTMLInputElement | HTMLTextAreaElement).value;
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

test("UpdateDiscussion preloads current values and submits changed data", async () => {
  const refreshSettlement = deferred();
  discussionRefresh.mockReturnValueOnce(refreshSettlement.promise);
  const wrapper = await mountSuspended(UpdateDiscussion, {
    props: { discussionId: "discussion-1" },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  expect(useDiscussionRead).toHaveBeenCalledTimes(1);
  expect(useDiscussionRead).toHaveBeenCalledWith("discussion-1");

  await userEvent.click(screen.getByRole("button", { name: /update discussion/i }));

  const title = await bodyScreen.findByLabelText(/title/i);
  expect(getInputValue(title)).toBe("Existing title");
  expect(getInputValue(bodyScreen.getByLabelText(/body/i))).toBe("Existing body");

  await userEvent.clear(title);
  await userEvent.type(title, "Updated title");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(updateDiscussionMutate).toHaveBeenCalledWith({
    id: "discussion-1",
    data: {
      title: "Updated title",
      body: "Existing body",
    },
  }));
  await waitFor(() => expect(discussionRefresh).toHaveBeenCalledTimes(1));
  expect(addNotification).toHaveBeenCalledTimes(1);
  expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "Discussion Updated",
  });
  expect(addNotification.mock.invocationCallOrder[0]).toBeLessThan(
    discussionRefresh.mock.invocationCallOrder[0]!,
  );
  const closeButton = bodyScreen
    .getAllByRole("button", { name: /close/i })
    .find(button => button.hasAttribute("disabled"));
  expect(closeButton).toBeTruthy();
  await userEvent.click(closeButton!);
  await userEvent.keyboard("{Escape}");
  expect(bodyScreen.getByRole("dialog", { name: /update discussion/i })).toBeTruthy();

  refreshSettlement.resolve();

  await waitFor(() => {
    expect(bodyScreen.queryByRole("dialog", { name: /update discussion/i })).toBeNull();
  });
});

test("UpdateDiscussion keeps mutation success when its shared refresh rejects", async () => {
  discussionRefresh.mockImplementationOnce(async () => {
    throw new Error("Refresh failed");
  });
  const wrapper = await mountSuspended(UpdateDiscussion, {
    props: { discussionId: "discussion-1" },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /update discussion/i }));
  await userEvent.click(await bodyScreen.findByRole("button", { name: /submit/i }));

  await waitFor(() => expect(discussionRefresh).toHaveBeenCalledTimes(1));
  expect(updateDiscussionMutate).toHaveBeenCalledTimes(1);
  expect(addNotification.mock.calls).toEqual([
    [{ type: "success", title: "Discussion Updated" }],
  ]);
  await waitFor(() => {
    expect(bodyScreen.queryByRole("dialog", { name: /update discussion/i })).toBeNull();
  });
});

test("UpdateDiscussion does not duplicate the API failure or continue success processing", async () => {
  updateDiscussionMutate.mockRejectedValueOnce(new Error("Update failed"));
  const wrapper = await mountSuspended(UpdateDiscussion, {
    props: { discussionId: "discussion-1" },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /update discussion/i }));
  await userEvent.click(await bodyScreen.findByRole("button", { name: /submit/i }));

  await waitFor(() => {
    expect(bodyScreen.getByRole("button", { name: /submit/i }).hasAttribute("disabled")).toBe(false);
  });
  expect(discussionRefresh).not.toHaveBeenCalled();
  expect(addNotification).not.toHaveBeenCalled();
  expect(bodyScreen.queryByRole("alert")).toBeNull();
  const closeButton = bodyScreen.getAllByRole("button", { name: /close/i })[0]!;
  expect(closeButton.hasAttribute("disabled")).toBe(false);

  await userEvent.click(closeButton);

  await waitFor(() => {
    expect(bodyScreen.queryByRole("dialog", { name: /update discussion/i })).toBeNull();
  });
});

test("UpdateDiscussion does not refresh or publish UI success after its owner is disposed", async () => {
  const mutationSettlement = deferred();
  updateDiscussionMutate.mockReturnValueOnce(mutationSettlement.promise);
  const wrapper = await mountSuspended(UpdateDiscussion, {
    props: { discussionId: "discussion-1" },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /update discussion/i }));
  await userEvent.click(await bodyScreen.findByRole("button", { name: /submit/i }));
  await waitFor(() => expect(updateDiscussionMutate).toHaveBeenCalledTimes(1));

  wrapper.unmount();
  mutationSettlement.resolve();
  await mutationSettlement.promise;
  await Promise.resolve();

  expect(discussionRefresh).not.toHaveBeenCalled();
  expect(addNotification).not.toHaveBeenCalled();
});
