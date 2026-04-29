import { describe, test, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import type { Discussion, PaginatedDiscussions } from "~discussions/shared/types";
import type { User } from "~auth/shared/types";

// Import components after mocks
import DiscussionsList from "~discussions/app/components/DiscussionsList.vue";
import CreateDiscussion from "~discussions/app/components/CreateDiscussion.vue";

// Use vi.hoisted to define mock data that can be used in vi.mock factories
const { mockUser, mockPaginatedDiscussions } = vi.hoisted(() => {
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

  const mockDiscussions: Discussion[] = [
    {
      id: "1",
      title: "First Discussion",
      body: "First discussion body",
      authorId: mockUser.id,
      teamId: "team-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      author: {
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      },
    },
    {
      id: "2",
      title: "Second Discussion",
      body: "Second discussion body",
      authorId: mockUser.id,
      teamId: "team-1",
      createdAt: new Date(Date.now() - 1000),
      updatedAt: new Date(Date.now() - 1000),
      author: {
        id: mockUser.id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
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
    },
  };

  return { mockUser, mockDiscussions, mockPaginatedDiscussions };
});

// Mock Nuxt composables
vi.mock("#imports", async () => {
  const actual = await vi.importActual("#imports");
  return {
    ...(actual as object),
    useHead: vi.fn(),
    definePageMeta: vi.fn(),
    useRoute: () => ({
      params: {},
      query: {},
    }),
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
    }),
    refreshNuxtData: vi.fn(),
    useFetch: vi.fn(),
  };
});

// Mock useDiscussions composable
vi.mock("~discussions/app/composables/useDiscussions", () => ({
  useDiscussions: () => ({
    data: { value: mockPaginatedDiscussions },
    isPending: { value: false },
    isSuccess: { value: true },
    error: { value: null },
    fetch: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock useCreateDiscussion composable
vi.mock("~discussions/app/composables/useCreateDiscussion", () => ({
  useCreateDiscussion: () => ({
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

// Mock useUser composable
vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({
    user: { value: mockUser },
    isAdmin: { value: true },
  }),
}));

// Mock useNotifications composable
vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({
    addNotification: vi.fn(),
  }),
}));

describe("Discussions Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should render discussions list", async () => {
    const wrapper = await mountSuspended(DiscussionsList, {
      global: {
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
            props: ["to"],
          },
          USpinner: true,
          UTable: {
            template: `
              <div>
                <table>
                  <tbody>
                    <tr v-for="item in data" :key="item.id">
                      <td>{{ item.title }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `,
            props: ["data", "columns", "pagination"],
          },
          DeleteDiscussion: true,
        },
      },
    });

    await waitFor(() => {
      expect(wrapper.text()).toContain("First Discussion");
      expect(wrapper.text()).toContain("Second Discussion");
    });
  });

  test("should render create discussion button", async () => {
    const wrapper = await mountSuspended(CreateDiscussion, {
      global: {
        stubs: {
          UFormDrawer: {
            template: "<div><slot name=\"triggerButton\" /></div>",
          },
          UButton: {
            template: "<button><slot name=\"icon\" /><slot /></button>",
            props: ["size", "isLoading"],
          },
          UForm: true,
          UInput: true,
          UTextarea: true,
          Plus: true,
        },
      },
    });

    expect(wrapper.text()).toContain("Create Discussion");
  });
});
