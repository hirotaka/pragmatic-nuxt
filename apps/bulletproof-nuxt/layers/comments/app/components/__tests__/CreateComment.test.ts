import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
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
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

beforeEach(() => {
  addNotification.mockReset();
  createCommentMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => cleanup());

const mountForm = (refresh = vi.fn().mockResolvedValue(undefined), disabled = false) =>
  mountSuspended(CreateComment, {
    props: { disabled, discussionId: "discussion-1", refresh },
  });

async function enterComment(wrapper: Awaited<ReturnType<typeof mountForm>>) {
  await wrapper.get("textarea[name='body']").setValue("New comment");
  await wrapper.get("form").trigger("submit");
}

test("publishes success and settles refresh before emitting success", async () => {
  const refreshSettlement = deferred();
  const refresh = vi.fn(() => refreshSettlement.promise);
  const wrapper = await mountForm(refresh);

  await enterComment(wrapper);
  await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
  expect(createCommentMutate).toHaveBeenCalledWith({
    body: "New comment",
    discussionId: "discussion-1",
  });
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Comment Created" });
  expect(wrapper.emitted("success")).toBeUndefined();

  refreshSettlement.resolve();
  await waitFor(() => expect(wrapper.emitted("success")).toHaveLength(1));
});

test("keeps committed success when refresh fails", async () => {
  const refresh = vi.fn().mockRejectedValue(new Error("Refresh failed"));
  const wrapper = await mountForm(refresh);

  await enterComment(wrapper);

  await waitFor(() => expect(wrapper.emitted("success")).toHaveLength(1));
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Comment Created" });
});

test("recovers from mutation failure with the draft available", async () => {
  createCommentMutate.mockRejectedValueOnce(new Error("Create failed"));
  const refresh = vi.fn().mockResolvedValue(undefined);
  const wrapper = await mountForm(refresh);

  await enterComment(wrapper);

  await waitFor(() => expect(wrapper.get("textarea[name='body']").attributes("disabled")).toBeUndefined());
  expect(addNotification).not.toHaveBeenCalled();
  expect(refresh).not.toHaveBeenCalled();
  expect((wrapper.get("textarea[name='body']").element as HTMLTextAreaElement).value).toBe("New comment");

  await wrapper.get("form").trigger("submit");
  await waitFor(() => expect(createCommentMutate).toHaveBeenCalledTimes(2));
  expect(refresh).toHaveBeenCalledOnce();
});

test("prevents creation while comments are unavailable", async () => {
  const wrapper = await mountForm(vi.fn(), true);
  expect(wrapper.get("textarea[name='body']").attributes("disabled")).toBeDefined();

  await wrapper.get("form").trigger("submit");
  expect(createCommentMutate).not.toHaveBeenCalled();
});
