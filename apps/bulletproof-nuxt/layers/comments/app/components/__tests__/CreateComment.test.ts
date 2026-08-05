import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import userEvent from "@testing-library/user-event";
import CreateComment from "../CreateComment.vue";

const { addNotification, createCommentMutate } = vi.hoisted(() => ({
  addNotification: vi.fn(),
  createCommentMutate: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));

vi.mock("~comments/app/composables/useCreateComment", () => ({
  useCreateComment: () => createCommentMutate,
}));

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((nextResolve, nextReject) => {
    resolve = nextResolve;
    reject = nextReject;
  });
  return { promise, resolve, reject };
}

async function submitComment(refresh: () => Promise<void>) {
  const wrapper = await mountSuspended(CreateComment, {
    props: { discussionId: "discussion-1", refresh },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create comment/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/body/i), "New comment");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  return bodyScreen;
}

beforeEach(() => {
  addNotification.mockReset();
  createCommentMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("publishes success then waits for refresh before completing the drawer", async () => {
  const refreshSettlement = deferred();
  const refresh = vi.fn(() => refreshSettlement.promise);
  const bodyScreen = await submitComment(refresh);

  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  expect(createCommentMutate).toHaveBeenCalledWith({
    body: "New comment",
    discussionId: "discussion-1",
  });
  expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "Comment Created",
  });
  expect(addNotification.mock.invocationCallOrder[0]).toBeLessThan(
    refresh.mock.invocationCallOrder[0]!,
  );
  expect(bodyScreen.getByLabelText(/body/i)).toBeTruthy();

  refreshSettlement.resolve();

  await waitFor(() => expect(bodyScreen.queryByLabelText(/body/i)).toBeNull());
  expect(addNotification).toHaveBeenCalledTimes(1);
});

test("keeps committed success when refresh fails and completes after failure settlement", async () => {
  const refreshSettlement = deferred();
  const refresh = vi.fn(async () => {
    try {
      await refreshSettlement.promise;
    }
    catch (error) {
      addNotification({ type: "error", title: "Error", message: "Refresh failed" });
      throw error;
    }
  });
  const bodyScreen = await submitComment(refresh);

  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  expect(bodyScreen.getByLabelText(/body/i)).toBeTruthy();
  refreshSettlement.reject(new Error("Refresh failed"));

  await waitFor(() => expect(bodyScreen.queryByLabelText(/body/i)).toBeNull());
  expect(addNotification.mock.calls).toEqual([
    [{ type: "success", title: "Comment Created" }],
    [{ type: "error", title: "Error", message: "Refresh failed" }],
  ]);
});

test("recovers from mutation failure with the draft and submission available", async () => {
  createCommentMutate.mockRejectedValueOnce(new Error("Create failed"));
  const refresh = vi.fn();
  const bodyScreen = await submitComment(refresh);

  await waitFor(() => expect(createCommentMutate).toHaveBeenCalledOnce());
  expect(addNotification.mock.calls.filter(([notification]) => notification.type === "success")).toHaveLength(0);
  expect(refresh).not.toHaveBeenCalled();
  expect(bodyScreen.getByLabelText(/body/i)).toBeTruthy();
  expect(bodyScreen.getByRole("button", { name: /submit/i }).hasAttribute("disabled")).toBe(false);
});

test("prevents creation while initial comments are unavailable", async () => {
  const wrapper = await mountSuspended(CreateComment, {
    props: {
      disabled: true,
      discussionId: "discussion-1",
      refresh: vi.fn(),
    },
  });
  const screen = within(wrapper.element as HTMLElement);

  const trigger = screen.getByRole("button", { name: /create comment/i });
  expect(trigger.hasAttribute("disabled")).toBe(true);
  await userEvent.click(trigger);

  expect(within(document.body).queryByRole("dialog", { name: /create comment/i })).toBeNull();
  expect(createCommentMutate).not.toHaveBeenCalled();
});

test("does not publish or refresh after its discussion scope is disposed", async () => {
  const mutationSettlement = deferred();
  createCommentMutate.mockImplementationOnce(() => mutationSettlement.promise);
  const refresh = vi.fn();
  const wrapper = await mountSuspended(CreateComment, {
    props: {
      discussionId: "discussion-1",
      refresh,
    },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create comment/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/body/i), "Comment from old discussion");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));
  await waitFor(() => expect(createCommentMutate).toHaveBeenCalledOnce());

  wrapper.unmount();
  mutationSettlement.resolve();
  await flushPromises();

  expect(addNotification).not.toHaveBeenCalled();
  expect(refresh).not.toHaveBeenCalled();
});
