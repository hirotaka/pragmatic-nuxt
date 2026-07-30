import type { Discussion } from "~discussions/shared/types";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, ref } from "vue";
import { expect, test, vi } from "vitest";
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

const { useDiscussionMock } = vi.hoisted(() => ({
  useDiscussionMock: vi.fn(),
}));

vi.mock("~discussions/app/composables/useDiscussion", () => ({
  useDiscussion: async (id: MaybeRefOrGetter<string>) => {
    useDiscussionMock(toValue(id));
    return { data: ref(discussion) };
  },
}));

const UpdateDiscussionStub = defineComponent({
  name: "UpdateDiscussion",
  props: {
    discussionId: {
      type: String,
      required: true,
    },
  },
  template: "<button>Update Discussion</button>",
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
      UpdateDiscussion: UpdateDiscussionStub,
      MarkdownPreview: MarkdownPreviewStub,
    },
  },
});

test("renders discussion metadata and the update control", async () => {
  const wrapper = await mountDiscussionView();

  expect(wrapper.text()).toContain(formatDate(discussion.createdAt));
  expect(wrapper.text()).toContain("Test User");
  expect(wrapper.getComponent(UpdateDiscussionStub).text()).toBe("Update Discussion");
  expect(wrapper.getComponent(UpdateDiscussionStub).props("discussionId")).toBe(discussion.id);
  expect(useDiscussionMock).toHaveBeenCalledWith(discussion.id);
});

test("renders the discussion body", async () => {
  const wrapper = await mountDiscussionView();

  expect(wrapper.getComponent(MarkdownPreviewStub).props("value")).toBe(discussion.body);
});
