import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import UpdateDiscussionForm from "../UpdateDiscussionForm.vue";

const { addNotification, updateDiscussionMutate } = vi.hoisted(() => ({
  addNotification: vi.fn(),
  updateDiscussionMutate: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));

vi.mock("~discussions/app/composables/useUpdateDiscussion", () => ({
  useUpdateDiscussion: (id: () => string) => async (input: unknown) => updateDiscussionMutate(id(), input),
}));

beforeEach(() => {
  addNotification.mockClear();
  updateDiscussionMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => cleanup());

const mountForm = () => mountSuspended(UpdateDiscussionForm, {
  props: {
    body: "Existing body",
    discussionId: "discussion-1",
    title: "Existing title",
  },
});

test("UpdateDiscussionForm preloads current values and submits changed data", async () => {
  const wrapper = await mountForm();
  const title = wrapper.get("input[name='title']").element;

  expect((title as HTMLInputElement).value).toBe("Existing title");
  expect((wrapper.get("textarea[name='body']").element as HTMLTextAreaElement).value).toBe("Existing body");

  await wrapper.get("input[name='title']").setValue("Updated title");
  await wrapper.get("form").trigger("submit");

  await waitFor(() => expect(updateDiscussionMutate).toHaveBeenCalledWith(
    "discussion-1",
    {
      title: "Updated title",
      body: "Existing body",
    },
  ));
  expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "Discussion Updated",
  });
  expect(wrapper.emitted("success")).toHaveLength(1);
});

test("UpdateDiscussionForm remains retryable after mutation failure", async () => {
  updateDiscussionMutate.mockRejectedValueOnce(new Error("Update failed"));
  const wrapper = await mountForm();

  await wrapper.get("form").trigger("submit");

  await waitFor(() => expect(wrapper.get("input[name='title']").attributes("disabled")).toBeUndefined());
  expect(addNotification).not.toHaveBeenCalled();
  expect(wrapper.emitted("success")).toBeUndefined();

  await wrapper.get("form").trigger("submit");
  await waitFor(() => expect(updateDiscussionMutate).toHaveBeenCalledTimes(2));
});
