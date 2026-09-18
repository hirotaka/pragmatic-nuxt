import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import CreateCommentForm from "../CreateCommentForm.vue";

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

beforeEach(() => {
  addNotification.mockReset();
  createCommentMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => cleanup());

const mountForm = (disabled = false) =>
  mountSuspended(CreateCommentForm, {
    props: { disabled, discussionId: "discussion-1" },
  });

async function enterComment(wrapper: Awaited<ReturnType<typeof mountForm>>) {
  await wrapper.get("textarea[name='body']").setValue("New comment");
  await wrapper.get("form").trigger("submit");
}

test("emits success after creating a comment", async () => {
  const wrapper = await mountForm();

  await enterComment(wrapper);

  await waitFor(() => expect(wrapper.emitted("success")).toHaveLength(1));
  expect(createCommentMutate).toHaveBeenCalledWith({
    body: "New comment",
    discussionId: "discussion-1",
  });
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Comment Created" });
});

test("recovers from mutation failure with the draft available", async () => {
  createCommentMutate.mockRejectedValueOnce(new Error("Create failed"));
  const wrapper = await mountForm();

  await enterComment(wrapper);

  await waitFor(() => expect(wrapper.get("textarea[name='body']").attributes("disabled")).toBeUndefined());
  expect(addNotification).not.toHaveBeenCalled();
  expect(wrapper.emitted("success")).toBeUndefined();
  expect((wrapper.get("textarea[name='body']").element as HTMLTextAreaElement).value).toBe("New comment");

  await wrapper.get("form").trigger("submit");
  await waitFor(() => expect(createCommentMutate).toHaveBeenCalledTimes(2));
  expect(wrapper.emitted("success")).toHaveLength(1);
});

test("prevents creation while comments are unavailable", async () => {
  const wrapper = await mountForm(true);
  expect(wrapper.get("textarea[name='body']").attributes("disabled")).toBeDefined();

  await wrapper.get("form").trigger("submit");
  expect(createCommentMutate).not.toHaveBeenCalled();
});
