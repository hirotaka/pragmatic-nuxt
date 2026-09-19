import type { Discussion } from "~discussions/shared/types";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, ref } from "vue";
import { beforeEach, expect, test, vi } from "vitest";
import { formatDate } from "#layers/base/app/utils/format";
import DiscussionView from "../DiscussionView.vue";

const discussion: Discussion = {
  id: "discussion-1",
  title: "Test Discussion",
  body: "This is a test discussion body",
  authorId: "user-1",
  teamId: "team-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  author: {
    id: "user-1",
    firstName: "Test",
    lastName: "User",
  },
};

const { discussionRefresh, useDiscussionMock } = vi.hoisted(() => ({
  discussionRefresh: vi.fn(),
  useDiscussionMock: vi.fn(),
}));

vi.mock("~discussions/app/composables/useDiscussion", () => ({
  useDiscussion: async (id: MaybeRefOrGetter<string>) => {
    useDiscussionMock(toValue(id));
    return { data: ref(discussion), refresh: discussionRefresh };
  },
}));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ isAdmin: { value: true } }),
}));

beforeEach(() => {
  discussionRefresh.mockReset().mockResolvedValue(undefined);
  useDiscussionMock.mockClear();
});

const UpdateDiscussionFormStub = defineComponent({
  name: "UpdateDiscussionForm",
  props: ["body", "discussionId", "title"],
  emits: ["success"],
  template: "<div />",
});

const MarkdownPreviewStub = defineComponent({
  name: "MarkdownPreview",
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  template: "<div>{{ value }}</div>",
});

const mountDiscussionView = () => mountSuspended(DiscussionView, {
  props: { discussionId: discussion.id },
  global: {
    stubs: {
      UpdateDiscussionForm: UpdateDiscussionFormStub,
      MarkdownPreview: MarkdownPreviewStub,
    },
  },
});

test("renders discussion metadata and the update control", async () => {
  const wrapper = await mountDiscussionView();

  expect(wrapper.text()).toContain(formatDate(discussion.createdAt));
  expect(wrapper.text()).toContain("Test User");
  expect(wrapper.text()).toContain("Update Discussion");
  await wrapper.get("button").trigger("click");
  expect(wrapper.getComponent(UpdateDiscussionFormStub).props("discussionId")).toBe(discussion.id);
  expect(wrapper.getComponent(UpdateDiscussionFormStub).props("title")).toBe(discussion.title);
  expect(wrapper.getComponent(UpdateDiscussionFormStub).props("body")).toBe(discussion.body);
  expect(useDiscussionMock).toHaveBeenCalledWith(discussion.id);
});

test("refreshes the discussion after an update succeeds", async () => {
  discussionRefresh.mockResolvedValueOnce(undefined);
  const wrapper = await mountDiscussionView();

  await wrapper.get("button").trigger("click");
  wrapper.getComponent(UpdateDiscussionFormStub).vm.$emit("success");

  await vi.waitFor(() => expect(discussionRefresh).toHaveBeenCalledOnce());
});

test("renders the discussion body", async () => {
  const wrapper = await mountDiscussionView();

  expect(wrapper.getComponent(MarkdownPreviewStub).props("value")).toBe(discussion.body);
});
