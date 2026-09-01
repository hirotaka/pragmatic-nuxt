import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import type { Discussion } from "~discussions/shared/types";
import DiscussionPage from "../[id].vue";

const {
  mockDiscussion,
  mockDiscussionId,
  queryState,
  refetch,
  useQueryMock,
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
    queryState: {
      data: mockDiscussion as Discussion | undefined,
      error: undefined as unknown,
      status: "success",
      asyncStatus: "idle",
    },
    mockDiscussion,
    mockDiscussionId,
    refetch: vi.fn(),
    useQueryMock: vi.fn(),
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

vi.mock("~discussions/app/queries/discussions", () => ({
  discussionDetailQuery: (input: unknown) => input,
}));

vi.mock("@pinia/colada", async importOriginal => ({
  ...await importOriginal<typeof import("@pinia/colada")>(),
  useQuery: (options: unknown) => {
    useQueryMock(options);
    return {
      data: ref(queryState.data),
      error: ref(queryState.error),
      status: ref(queryState.status),
      asyncStatus: ref(queryState.asyncStatus),
      refetch,
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
    queryState.data = mockDiscussion;
    queryState.error = undefined;
    queryState.status = "success";
    queryState.asyncStatus = "idle";
  });

  test("creates the native detail query from the route", async () => {
    await mountDiscussionPage();

    expect(useQueryMock).toHaveBeenCalledOnce();
    expect(refetch).not.toHaveBeenCalled();
  });

  test("does not compose detail children before discussion data is available", async () => {
    queryState.data = undefined;
    queryState.status = "pending";

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
