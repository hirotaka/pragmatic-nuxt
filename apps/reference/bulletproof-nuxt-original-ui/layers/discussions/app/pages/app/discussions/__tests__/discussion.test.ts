import { describe, test, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import type { Discussion } from "~discussions/shared/types";
import type { Comment, PaginatedComments } from "~comments/shared/types";
import type { User } from "~auth/shared/types";

// Import components after mocks
import DiscussionView from "~discussions/app/components/DiscussionView.vue";
import CommentsList from "~comments/app/components/CommentsList.vue";

// Use vi.hoisted to define mock data that can be used in vi.mock factories
const { mockDiscussionId, mockUser, mockDiscussion, mockPaginatedComments } = vi.hoisted(() => {
  const mockDiscussionId = "discussion-1";

  const mockUser: User = {
    id: "1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: "ADMIN",
    bio: "",
    teamId: "team-1",
    createdAt: new Date(),
  };

  const mockDiscussion: Discussion = {
    id: mockDiscussionId,
    title: "Test Discussion",
    body: "This is a test discussion body",
    authorId: mockUser.id,
    teamId: "team-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: mockUser.id,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
    },
  };

  const mockComments: Comment[] = [
    {
      id: "comment-1",
      body: "First comment",
      discussionId: mockDiscussionId,
      authorId: mockUser.id,
      author: {
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "comment-2",
      body: "Second comment",
      discussionId: mockDiscussionId,
      authorId: mockUser.id,
      author: {
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      },
      createdAt: new Date(Date.now() - 1000),
      updatedAt: new Date(Date.now() - 1000),
    },
  ];

  const mockPaginatedComments: PaginatedComments = {
    data: mockComments,
    meta: {
      page: 1,
      total: mockComments.length,
      totalPages: 1,
      hasMore: false,
    },
  };

  return { mockDiscussionId, mockUser, mockDiscussion, mockPaginatedComments };
});

// Mock Nuxt composables
vi.mock("#imports", async () => {
  const actual = await vi.importActual("#imports");
  return {
    ...(actual as object),
    useHead: vi.fn(),
    definePageMeta: vi.fn(),
    useRoute: () => ({
      params: { id: mockDiscussionId },
      query: {},
    }),
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
    }),
    refreshNuxtData: vi.fn(),
    useFetch: vi.fn(),
  };
});

// Mock useDiscussion composable
vi.mock("~discussions/app/composables/useDiscussion", () => ({
  useDiscussion: () => ({
    data: { value: { discussion: mockDiscussion } },
    isPending: { value: false },
    isSuccess: { value: true },
    error: { value: null },
    fetch: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock useUpdateDiscussion composable
vi.mock("~discussions/app/composables/useUpdateDiscussion", () => ({
  useUpdateDiscussion: () => ({
    mutate: vi.fn(),
    isPending: { value: false },
    isSuccess: { value: false },
    error: { value: null },
  }),
}));

// Mock useDeleteDiscussion composable
vi.mock("~discussions/app/composables/useDeleteDiscussion", () => ({
  useDeleteDiscussion: () => ({
    mutate: vi.fn(),
    isPending: { value: false },
    isSuccess: { value: false },
    error: { value: null },
  }),
}));

// Mock useComments composable
vi.mock("~comments/app/composables/useComments", async () => {
  const { ref } = await import("vue");
  return {
    useComments: () => ({
      comments: ref(mockPaginatedComments.data),
      currentPage: ref(1),
      totalPages: ref(1),
      hasMore: ref(false),
      isLoading: ref(false),
      loadComments: vi.fn(),
      loadMore: vi.fn(),
    }),
  };
});

// Mock useCreateComment composable
vi.mock("~comments/app/composables/useCreateComment", () => ({
  useCreateComment: () => ({
    mutate: vi.fn(),
    isPending: { value: false },
    isSuccess: { value: false },
    error: { value: null },
  }),
}));

// Mock useDeleteComment composable
vi.mock("~comments/app/composables/useDeleteComment", () => ({
  useDeleteComment: () => ({
    mutate: vi.fn(),
    isPending: { value: false },
    isSuccess: { value: false },
    error: { value: null },
  }),
}));

// Mock useUser composable
vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({
    user: { value: mockUser },
    isAdmin: { value: true },
  }),
}));

// Mock useAuthorization
vi.mock("#layers/auth/app/composables/useAuthorization", () => ({
  POLICIES: {
    "comment:delete": () => true,
  },
}));

// Mock useNotifications composable
vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({
    addNotification: vi.fn(),
  }),
}));

describe("Discussion Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should render discussion detail", async () => {
    const wrapper = await mountSuspended(DiscussionView, {
      props: {
        discussionId: mockDiscussionId,
      },
      global: {
        stubs: {
          UpdateDiscussion: true,
          UMDPreview: {
            template: "<div>{{ value }}</div>",
            props: ["value"],
          },
        },
      },
    });

    await waitFor(() => {
      expect(wrapper.text()).toContain("Test");
      expect(wrapper.text()).toContain("User");
    });
  });

  test("should render discussion body", async () => {
    const wrapper = await mountSuspended(DiscussionView, {
      props: {
        discussionId: mockDiscussionId,
      },
      global: {
        stubs: {
          UpdateDiscussion: true,
          UMDPreview: {
            template: "<div data-testid=\"body\">{{ value }}</div>",
            props: ["value"],
          },
        },
      },
    });

    await waitFor(() => {
      expect(wrapper.text()).toContain("This is a test discussion body");
    });
  });

  test("should render comments section", async () => {
    const wrapper = await mountSuspended(CommentsList, {
      props: {
        discussionId: mockDiscussionId,
      },
      global: {
        stubs: {
          USpinner: true,
          UButton: {
            template: "<button><slot /></button>",
          },
          UMDPreview: {
            template: "<div>{{ value }}</div>",
            props: ["value"],
          },
          DeleteComment: true,
          Authorization: {
            template: "<div><slot /></div>",
            props: ["policyCheck"],
          },
          ArchiveX: true,
        },
      },
    });

    await waitFor(() => {
      expect(wrapper.text()).toContain("First comment");
      expect(wrapper.text()).toContain("Second comment");
    });
  });
});
