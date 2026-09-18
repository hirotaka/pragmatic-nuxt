import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { nextTick, ref, toValue } from "vue";
import type { Discussion } from "~discussions/shared/types";
import DiscussionPage from "../[id].vue";

const {
  discussionDetailQuery,
  discussionRefetch,
  mockDiscussion,
  mockDiscussionId,
  useQuery,
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
    discussionDetailQuery: vi.fn(),
    discussionRefetch: vi.fn(),
    mockDiscussion,
    mockDiscussionId,
    useQuery: vi.fn(),
  };
});

const discussionState = ref<Discussion | undefined>(mockDiscussion);
const queryStatus = ref<"pending" | "error" | "success">("success");

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
vi.mock("@tanstack/vue-query", () => ({ useQuery }));
vi.mock("~discussions/app/queries/discussions", () => ({ discussionDetailQuery }));

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
      Spinner: { template: "<div data-testid='spinner' />" },
    },
  },
});

describe("Discussion Page", () => {
  beforeEach(() => {
    clearNuxtState();
    vi.clearAllMocks();
    discussionState.value = mockDiscussion;
    queryStatus.value = "success";
    discussionDetailQuery.mockReturnValue({ queryKey: ["discussions", "detail", mockDiscussionId] });
    discussionRefetch.mockResolvedValue(undefined);
    useQuery.mockImplementation((query) => {
      toValue(query);
      return {
        data: discussionState,
        refetch: discussionRefetch,
        status: queryStatus,
      };
    });
  });

  test("creates the detail Query from the reactive route identity", async () => {
    await mountDiscussionPage();

    expect(discussionDetailQuery).toHaveBeenCalledWith({
      id: mockDiscussionId,
      enabled: false,
    });
  });

  test("does not compose detail children before discussion data is available", async () => {
    discussionState.value = undefined;
    queryStatus.value = "pending";
    const wrapper = await mountDiscussionPage();

    expect(wrapper.find("[data-testid='discussion-view']").exists()).toBe(false);
    expect(wrapper.find("[data-testid='comments']").exists()).toBe(false);
    expect(wrapper.get("[role='status']").text()).toContain("Loading discussion");
  });

  test("removes settled detail content when a new route has no Query data", async () => {
    const wrapper = await mountDiscussionPage();
    expect(wrapper.get("[data-testid='discussion-view']").text()).toBe(mockDiscussionId);

    discussionState.value = undefined;
    queryStatus.value = "pending";
    await nextTick();

    expect(wrapper.find("[data-testid='discussion-view']").exists()).toBe(false);
    expect(wrapper.find("[data-testid='comments']").exists()).toBe(false);
    expect(wrapper.get("[role='status']").text()).toContain("Loading discussion");
  });

  test("passes the settled discussion ID to detail children", async () => {
    const wrapper = await mountDiscussionPage();

    expect(wrapper.get("[data-testid='discussion-view']").text()).toBe(mockDiscussionId);
    expect(wrapper.get("[data-testid='comments']").text()).toBe(mockDiscussionId);
  });
});
