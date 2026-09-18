import type { Discussion } from "~discussions/shared/types";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { computed, defineComponent, ref, toValue } from "vue";
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

const { discussionDetailQuery, useQuery } = vi.hoisted(() => ({
  discussionDetailQuery: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("@tanstack/vue-query", () => ({ useQuery }));
vi.mock("~discussions/app/queries/discussions", () => ({ discussionDetailQuery }));

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

test("renders discussion metadata and the update control from the shared detail Query", async () => {
  discussionDetailQuery.mockReset().mockReturnValue({ queryKey: ["discussions", "detail", discussion.id] });
  useQuery.mockReset().mockImplementation((query) => {
    toValue(query);
    return { data: ref(discussion) };
  });
  const wrapper = await mountDiscussionView();

  expect(discussionDetailQuery).toHaveBeenCalledWith({
    id: discussion.id,
    enabled: false,
  });
  expect(wrapper.text()).toContain(formatDate(discussion.createdAt));
  expect(wrapper.text()).toContain("Test User");
  expect(wrapper.getComponent(UpdateDiscussionStub).text()).toBe("Update Discussion");
  expect(wrapper.getComponent(UpdateDiscussionStub).props("discussionId")).toBe(discussion.id);
});

test("updates when the route selects a different discussion", async () => {
  discussionDetailQuery.mockReset().mockReturnValue({ queryKey: ["discussions", "detail", "discussion-2"] });
  useQuery.mockReset().mockImplementation((query) => {
    toValue(query);
    return { data: computed(() => ({ ...discussion, id: "discussion-2" })) };
  });
  const wrapper = await mountSuspended(DiscussionView, {
    props: { discussionId: discussion.id },
  });

  expect(wrapper.findComponent(UpdateDiscussionStub).exists()).toBe(false);
  expect(wrapper.text()).not.toContain(discussion.body);
});
