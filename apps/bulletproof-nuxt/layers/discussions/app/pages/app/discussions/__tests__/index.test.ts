import { beforeEach, describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import type { Discussion, PaginatedDiscussions } from "~discussions/shared/types";
import DiscussionsPage from "../index.vue";

const {
  discussionsState,
  discussionsLoadPage,
  discussionsRefresh,
  mockPaginatedDiscussions,
  useDiscussionsMock,
} = vi.hoisted(() => {
  const mockDiscussions: Discussion[] = [
    {
      id: "1",
      title: "First Discussion",
      body: "First discussion body",
      authorId: "user-1",
      teamId: "team-1",
      createdAt: "2026-07-28T00:00:00.000Z",
      updatedAt: "2026-07-28T00:00:00.000Z",
      author: {
        id: "user-1",
        firstName: "Test",
        lastName: "User",
      },
    },
    {
      id: "2",
      title: "Second Discussion",
      body: "Second discussion body",
      authorId: "user-1",
      teamId: "team-1",
      createdAt: "2026-07-27T00:00:00.000Z",
      updatedAt: "2026-07-27T00:00:00.000Z",
      author: {
        id: "user-1",
        firstName: "Test",
        lastName: "User",
      },
    },
  ];
  const mockPaginatedDiscussions: PaginatedDiscussions = {
    data: mockDiscussions,
    meta: {
      page: 1,
      limit: 10,
      total: mockDiscussions.length,
      totalPages: 1,
      hasMore: false,
    },
  };

  return {
    discussionsState: {
      data: mockPaginatedDiscussions as PaginatedDiscussions | undefined,
    },
    discussionsLoadPage: vi.fn(),
    discussionsRefresh: vi.fn(),
    mockPaginatedDiscussions,
    useDiscussionsMock: vi.fn(),
  };
});

vi.mock("#imports", async () => {
  const actual = await vi.importActual("#imports");
  return {
    ...(actual as object),
    definePageMeta: vi.fn(),
    useHead: vi.fn(),
  };
});

vi.mock("~discussions/app/composables/useDiscussions", () => ({
  useDiscussions: async (params: { page: { value: number }; limit: number }) => {
    useDiscussionsMock(params);

    return {
      data: ref(discussionsState.data),
      status: ref("success"),
      refresh: discussionsRefresh,
      loadPage: async (page: number) => {
        params.page.value = page;
        await discussionsLoadPage(page);
      },
    };
  },
}));

describe("Discussions Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    discussionsState.data = mockPaginatedDiscussions;
    discussionsLoadPage.mockResolvedValue(undefined);
    discussionsRefresh.mockResolvedValue(undefined);
  });

  test("shares lifted pagination state between create actions and the list", async () => {
    const wrapper = await mountSuspended(DiscussionsPage, {
      global: {
        stubs: {
          LayoutsContentLayout: {
            template: "<section><slot name='actions' /><slot /></section>",
            props: ["title", "description"],
          },
          CreateDiscussion: {
            template: "<div data-testid='create-discussion'>{{ typeof refresh }}</div>",
            props: ["refresh"],
          },
          DiscussionsList: {
            template: `
              <button type="button" data-testid="discussions-list" @click="loadPage(2)">
                {{ page }}:{{ discussions.data.length }}:{{ typeof refresh }}
              </button>
            `,
            props: ["page", "discussions", "isPending", "loadPage", "refresh"],
          },
        },
      },
    });

    expect(wrapper.get("[data-testid='create-discussion']").text()).toBe("function");
    expect(wrapper.get("[data-testid='discussions-list']").text()).toBe("1:2:function");
    expect(useDiscussionsMock).toHaveBeenCalledTimes(1);

    await wrapper.get("[data-testid='discussions-list']").trigger("click");

    expect(wrapper.get("[data-testid='create-discussion']").text()).toBe("function");
    expect(wrapper.get("[data-testid='discussions-list']").text()).toBe("2:2:function");
  });

  test("does not compose the list before discussions data exists", async () => {
    discussionsState.data = undefined;

    const wrapper = await mountSuspended(DiscussionsPage, {
      global: {
        stubs: {
          LayoutsContentLayout: {
            template: "<section><slot name='actions' /><slot /></section>",
            props: ["title", "description"],
          },
          CreateDiscussion: true,
          DiscussionsList: {
            template: "<div data-testid='discussions-list' />",
            props: ["page", "discussions", "isPending", "loadPage", "refresh"],
          },
        },
      },
    });

    expect(wrapper.find("[data-testid='discussions-list']").exists()).toBe(false);
  });
});
