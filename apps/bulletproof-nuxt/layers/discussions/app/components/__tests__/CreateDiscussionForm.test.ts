import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import CreateDiscussionForm from "../CreateDiscussionForm.vue";

const { addNotification, createDiscussionMutate } = vi.hoisted(() => ({
  addNotification: vi.fn(),
  createDiscussionMutate: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));

vi.mock("~discussions/app/composables/useCreateDiscussion", () => ({
  useCreateDiscussion: () => async (input: unknown) => createDiscussionMutate(input),
}));

beforeEach(() => {
  addNotification.mockClear();
  createDiscussionMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => cleanup());

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

const mountForm = () => mountSuspended(CreateDiscussionForm);

test("CreateDiscussionForm blocks invalid submit and sends a valid payload", async () => {
  const wrapper = await mountForm();

  await wrapper.get("form").trigger("submit");
  expect(createDiscussionMutate).not.toHaveBeenCalled();
  await waitFor(() => expect(wrapper.get("input[name='title']").attributes("disabled")).toBeUndefined());

  await wrapper.get("input[name='title']").setValue("New discussion");
  await wrapper.get("textarea[name='body']").setValue("Discussion body");
  await wrapper.get("form").trigger("submit");

  await waitFor(() => expect(createDiscussionMutate).toHaveBeenCalledWith({
    title: "New discussion",
    body: "Discussion body",
  }));
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Discussion Created" });
  expect(wrapper.emitted("success")).toHaveLength(1);
});

test("CreateDiscussionForm ignores another submit while its mutation is pending", async () => {
  const mutationSettlement = deferred();
  createDiscussionMutate.mockReturnValueOnce(mutationSettlement.promise);
  const wrapper = await mountForm();

  await wrapper.get("input[name='title']").setValue("New discussion");
  await wrapper.get("textarea[name='body']").setValue("Discussion body");
  await wrapper.get("form").trigger("submit");
  await waitFor(() => expect(createDiscussionMutate).toHaveBeenCalledOnce());
  await wrapper.get("form").trigger("submit");
  expect(createDiscussionMutate).toHaveBeenCalledOnce();

  mutationSettlement.resolve();
  await waitFor(() => expect(wrapper.emitted("success")).toHaveLength(1));
});

test("CreateDiscussionForm remains retryable after mutation failure", async () => {
  createDiscussionMutate.mockRejectedValueOnce(new Error("Create failed"));
  const wrapper = await mountForm();

  await wrapper.get("input[name='title']").setValue("New discussion");
  await wrapper.get("textarea[name='body']").setValue("Discussion body");
  await wrapper.get("form").trigger("submit");

  await waitFor(() => expect(wrapper.get("input[name='title']").attributes("disabled")).toBeUndefined());
  expect(addNotification).not.toHaveBeenCalled();

  await wrapper.get("form").trigger("submit");
  await waitFor(() => expect(createDiscussionMutate).toHaveBeenCalledTimes(2));
  expect(wrapper.emitted("success")).toHaveLength(1);
});
