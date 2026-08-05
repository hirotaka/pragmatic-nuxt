import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import CreateDiscussion from "../CreateDiscussion.vue";

const {
  addNotification,
  createDiscussionMutate,
  discussionRefresh,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  createDiscussionMutate: vi.fn(),
  discussionRefresh: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({
    addNotification,
  }),
}));

vi.mock("~discussions/app/composables/useCreateDiscussion", () => ({
  useCreateDiscussion: () => async (input: unknown) => createDiscussionMutate(input),
}));

beforeEach(() => {
  addNotification.mockClear();
  createDiscussionMutate.mockReset().mockResolvedValue(undefined);
  discussionRefresh.mockReset().mockResolvedValue(undefined);
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

test("CreateDiscussion blocks invalid submit and sends a valid payload", async () => {
  const refreshSettlement = deferred();
  discussionRefresh.mockReturnValueOnce(refreshSettlement.promise);
  const wrapper = await mountSuspended(CreateDiscussion, {
    props: { refresh: discussionRefresh },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create discussion/i }));
  await userEvent.click(await bodyScreen.findByRole("button", { name: /submit/i }));

  await bodyScreen.findAllByText(/required/i);
  expect(createDiscussionMutate).toHaveBeenCalledTimes(0);

  await userEvent.type(bodyScreen.getByLabelText(/title/i), "New discussion");
  await userEvent.type(bodyScreen.getByLabelText(/body/i), "Discussion body");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(createDiscussionMutate).toHaveBeenCalledWith({
    title: "New discussion",
    body: "Discussion body",
  }));
  await waitFor(() => expect(discussionRefresh).toHaveBeenCalledTimes(1));
  expect(addNotification).toHaveBeenCalledTimes(1);
  expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "Discussion Created",
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
  expect(bodyScreen.getByRole("dialog", { name: /create discussion/i })).toBeTruthy();

  refreshSettlement.resolve();

  await waitFor(() => {
    expect(bodyScreen.queryByRole("dialog", { name: /create discussion/i })).toBeNull();
  });
});

test("CreateDiscussion does not duplicate the API failure and releases drawer controls", async () => {
  createDiscussionMutate.mockRejectedValueOnce(new Error("Create failed"));
  const wrapper = await mountSuspended(CreateDiscussion, {
    props: { refresh: discussionRefresh },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create discussion/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/title/i), "New discussion");
  await userEvent.type(bodyScreen.getByLabelText(/body/i), "Discussion body");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => {
    expect(bodyScreen.getByRole("button", { name: /submit/i }).hasAttribute("disabled")).toBe(false);
  });
  expect(addNotification).not.toHaveBeenCalled();
  expect(discussionRefresh).not.toHaveBeenCalled();
  expect(bodyScreen.queryByRole("alert")).toBeNull();
  const closeButton = bodyScreen.getAllByRole("button", { name: /close/i })[0]!;
  expect(closeButton.hasAttribute("disabled")).toBe(false);

  await userEvent.click(closeButton);

  await waitFor(() => {
    expect(bodyScreen.queryByRole("dialog", { name: /create discussion/i })).toBeNull();
  });
});

test("CreateDiscussion keeps mutation success when the follow-up refresh fails", async () => {
  discussionRefresh.mockImplementationOnce(async () => {
    addNotification({ type: "error", title: "Error", message: "Refresh failed" });
    throw new Error("Refresh failed");
  });
  const wrapper = await mountSuspended(CreateDiscussion, {
    props: { refresh: discussionRefresh },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create discussion/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/title/i), "New discussion");
  await userEvent.type(bodyScreen.getByLabelText(/body/i), "Discussion body");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(discussionRefresh).toHaveBeenCalledTimes(1));
  expect(createDiscussionMutate).toHaveBeenCalledTimes(1);
  expect(addNotification.mock.calls).toEqual([
    [{ type: "success", title: "Discussion Created" }],
    [{ type: "error", title: "Error", message: "Refresh failed" }],
  ]);
  await waitFor(() => {
    expect(bodyScreen.queryByRole("dialog", { name: /create discussion/i })).toBeNull();
  });
});
