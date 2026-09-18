import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import UpdateDiscussion from "../UpdateDiscussion.vue";

const { addNotification, discussionRefresh, updateDiscussionMutate } = vi.hoisted(() => ({
  addNotification: vi.fn(),
  discussionRefresh: vi.fn(),
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
  discussionRefresh.mockReset().mockResolvedValue(undefined);
  updateDiscussionMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => cleanup());

const mountForm = () => mountSuspended(UpdateDiscussion, {
  props: {
    body: "Existing body",
    discussionId: "discussion-1",
    refresh: discussionRefresh,
    title: "Existing title",
  },
});

test("UpdateDiscussion preloads current values and submits changed data", async () => {
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
  expect(discussionRefresh).toHaveBeenCalledOnce();
  expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "Discussion Updated",
  });
  expect(wrapper.emitted("success")).toHaveLength(1);
});

test("UpdateDiscussion keeps mutation success when its refresh rejects", async () => {
  discussionRefresh.mockRejectedValueOnce(new Error("Refresh failed"));
  const wrapper = await mountForm();

  await wrapper.get("form").trigger("submit");

  await waitFor(() => expect(discussionRefresh).toHaveBeenCalledOnce());
  expect(updateDiscussionMutate).toHaveBeenCalledOnce();
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Discussion Updated" });
  expect(wrapper.emitted("success")).toHaveLength(1);
});

test("UpdateDiscussion remains retryable after mutation failure", async () => {
  updateDiscussionMutate.mockRejectedValueOnce(new Error("Update failed"));
  const wrapper = await mountForm();

  await wrapper.get("form").trigger("submit");

  await waitFor(() => expect(wrapper.get("input[name='title']").attributes("disabled")).toBeUndefined());
  expect(discussionRefresh).not.toHaveBeenCalled();
  expect(addNotification).not.toHaveBeenCalled();
  expect(wrapper.emitted("success")).toBeUndefined();

  await wrapper.get("form").trigger("submit");
  await waitFor(() => expect(updateDiscussionMutate).toHaveBeenCalledTimes(2));
  expect(discussionRefresh).toHaveBeenCalledOnce();
});
