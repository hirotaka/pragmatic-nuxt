import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { ref, toValue } from "vue";
import type { Discussion } from "~discussions/shared/types";
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

vi.mock("~discussions/app/composables/useDiscussion", () => ({
  useDiscussion: async (id: MaybeRefOrGetter<string>) => {
    useDiscussionMock(toValue(id));
    return {
      data: ref(discussionState.data),
      execute: discussionExecute,
    };
  },
}));

const mountDiscussionPage = () => mountSuspended(DiscussionPage, {
  global: {
    stubs: {
      LayoutsContentLayout: {
        template: "<section><slot /></section>",
        props: ["title", "description"],
      },
      DiscussionView: {
        template: "<div data-testid='discussion-view'>{{ discussionId }}</div>",
        props: ["discussionId"],
      },
      Comments: {
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

  test("passes the settled discussion ID to detail children", async () => {
    const wrapper = await mountDiscussionPage();

    expect(wrapper.get("[data-testid='discussion-view']").text()).toBe(mockDiscussionId);
    expect(wrapper.get("[data-testid='comments']").text()).toBe(mockDiscussionId);
  });
});
