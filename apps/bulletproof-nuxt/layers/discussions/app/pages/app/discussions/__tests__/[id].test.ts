import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { nextTick, ref, toValue } from "vue";
import type { Discussion } from "#layers/discussions/shared/types/discussion";
import DiscussionPage from "../[id].vue";

const {
  discussionExecute,
  discussionState,
  mockDiscussion,
  mockDiscussionId,
  useDiscussionMock,
} = vi.hoisted(() => {
  const mockDiscussionId = "discussion-1";
  const mockDiscussion: Discussion = {
    id: mockDiscussionId,
    title: "Test Discussion",
    body: "This is a test discussion body",
    authorId: "user-1",
    teamId: "team-1",
    createdAt: "2026-07-28T00:00:00.000Z",
    updatedAt: "2026-07-28T00:00:00.000Z",
    author: {
      id: "user-1",
      firstName: "Test",
      lastName: "User",
    },
  };

  return {
    discussionExecute: vi.fn(),
    discussionState: {
      data: mockDiscussion as Discussion | undefined,
    },
    mockDiscussion,
    mockDiscussionId,
    useDiscussionMock: vi.fn(),
  };
});

mockNuxtImport("useRoute", () => () => ({
  params: { id: mockDiscussionId },
  query: {},
}));

vi.mock("#imports", async () => {
  const actual = await vi.importActual("#imports");
  return {
    ...(actual as object),
    definePageMeta: vi.fn(),
    useHead: vi.fn(),
  };
});

const activeDiscussion = ref<Discussion>();

mockNuxtImport("useDiscussion", () => async (id: MaybeRefOrGetter<string>) => {
  useDiscussionMock(toValue(id));
  activeDiscussion.value = discussionState.data;
  return {
    data: activeDiscussion,
    execute: discussionExecute,
  };
});

const mountDiscussionPage = () => mountSuspended(DiscussionPage, {
  global: {
    stubs: {
      PageContent: {
        template: "<section><slot /></section>",
        props: ["title", "description"],
      },
      DiscussionView: {
        template: "<div data-testid='discussion-view'>{{ discussionId }}</div>",
        props: ["discussionId"],
      },
      CommentSection: {
        name: "CommentSection",
        template: "<div data-testid='comments'>{{ discussionId }}</div>",
        props: ["discussionId"],
      },
    },
  },
});

describe("Discussion Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    discussionState.data = mockDiscussion;
  });

  test("creates the detail Read from the route without manually executing it", async () => {
    await mountDiscussionPage();

    expect(useDiscussionMock).toHaveBeenCalledOnce();
    expect(useDiscussionMock).toHaveBeenCalledWith(mockDiscussionId);
    expect(discussionExecute).not.toHaveBeenCalled();
  });

  test("does not compose detail children before discussion data is available", async () => {
    discussionState.data = undefined;

    const wrapper = await mountDiscussionPage();

    expect(wrapper.find("[data-testid='discussion-view']").exists()).toBe(false);
    expect(wrapper.find("[data-testid='comments']").exists()).toBe(false);
  });

  test("recreates the comments scope when the settled discussion changes", async () => {
    const wrapper = await mountDiscussionPage();
    const original = wrapper.findComponent({ name: "CommentSection" }).vm;
    activeDiscussion.value = { ...mockDiscussion, id: "discussion-2" };
    await nextTick();

    expect(wrapper.get("[data-testid='comments']").text()).toBe("discussion-2");
    expect(wrapper.findComponent({ name: "CommentSection" }).vm).not.toBe(original);
  });

  test("passes the settled discussion ID to detail children", async () => {
    const wrapper = await mountDiscussionPage();

    expect(wrapper.get("[data-testid='discussion-view']").text()).toBe(mockDiscussionId);
    expect(wrapper.get("[data-testid='comments']").text()).toBe(mockDiscussionId);
  });
});
