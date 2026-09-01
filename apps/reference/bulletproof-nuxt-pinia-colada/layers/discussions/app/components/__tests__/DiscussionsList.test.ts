import { beforeEach, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import type { Component } from "vue";
import type { Discussion, PaginatedDiscussions } from "~discussions/shared/types";
import DiscussionsList from "../DiscussionsList.vue";

const discussions: Discussion[] = [
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
const paginatedDiscussions: PaginatedDiscussions = {
  data: discussions,
  meta: {
    page: 1,
    limit: 10,
    total: discussions.length,
    totalPages: 1,
    hasMore: false,
  },
};
const emptyDiscussions: PaginatedDiscussions = {
  data: [],
  meta: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasMore: false,
  },
};
const routerPush = vi.fn().mockResolvedValue(undefined);
const routerReplace = vi.fn().mockResolvedValue(undefined);
const queryData = ref<PaginatedDiscussions | undefined>(paginatedDiscussions);
const queryStatus = ref("success");
const queryAsyncStatus = ref("idle");
const { detailOptions, ensure, refresh, useQuery } = vi.hoisted(() => ({
  detailOptions: { key: ["discussions", "1"] },
  ensure: vi.fn((options: unknown) => ({ ext: {}, options })),
  refresh: vi.fn().mockResolvedValue(undefined),
  useQuery: vi.fn(),
}));

vi.mock("vue-router", async () => {
  const actual = await vi.importActual("vue-router");
  return {
    ...(actual as object),
    useRoute: () => ({ query: {} }),
    useRouter: () => ({ push: routerPush, replace: routerReplace }),
  };
});

vi.mock("#app", async () => {
  const actual = await vi.importActual("#app");
  return {
    ...(actual as object),
    useRoute: () => ({ query: {} }),
    useRouter: () => ({ push: routerPush, replace: routerReplace }),
  };
});

vi.mock("@pinia/colada", () => ({
  defineMutationOptions: (options: unknown) => options,
  useQueryCache: () => ({ ensure, refresh }),
  useQuery,
  PiniaColadaQueryHooksPlugin: vi.fn(() => ({})),
}));

vi.mock("~discussions/app/queries/discussions", () => ({
  createDiscussionMutation: vi.fn(),
  deleteDiscussionMutation: vi.fn(),
  discussionDetailQuery: vi.fn(() => detailOptions),
  discussionListQuery: vi.fn(),
}));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ isAdmin: { value: true } }),
}));

beforeEach(() => {
  queryData.value = paginatedDiscussions;
  queryStatus.value = "success";
  queryAsyncStatus.value = "idle";
  ensure.mockClear();
  refresh.mockClear();
  useQuery.mockReset();
  useQuery.mockReturnValue({
    data: queryData,
    error: ref(undefined),
    status: queryStatus,
    asyncStatus: queryAsyncStatus,
  });
});

const mountDiscussionsList = (
  state: {
    discussions?: PaginatedDiscussions;
    status?: string;
    asyncStatus?: string;
  },
  dataTableStub: Component,
) => {
  queryData.value = Object.hasOwn(state, "discussions")
    ? state.discussions
    : paginatedDiscussions;
  queryStatus.value = state.status ?? "success";
  queryAsyncStatus.value = state.asyncStatus ?? "idle";

  return mountSuspended(DiscussionsList, {
    global: {
      stubs: {
        DataTable: dataTableStub,
        DeleteDiscussion: true,
        NuxtLink: {
          props: ["to"],
          template: `<a :href="to"><slot /></a>`,
        },
        Spinner: { template: "<div data-testid='spinner' />" },
      },
    },
  });
};

test("owns the discussions query", async () => {
  await mountDiscussionsList({}, {
    template: "<div />",
    props: ["data", "columns", "pagination"],
    emits: ["page-change"],
  });

  expect(useQuery).toHaveBeenCalled();
});

test("prefetches a discussion detail on pointer navigation intent", async () => {
  const wrapper = await mountDiscussionsList({}, {
    template: `
      <div>
        <template v-for="entry in data" :key="entry.id">
          <slot name="cell-view" :entry="entry" />
        </template>
      </div>
    `,
    props: ["data", "columns", "pagination"],
  });

  await wrapper.find("a").trigger("pointerdown");

  expect(ensure).toHaveBeenCalledWith(detailOptions);
  expect(refresh).toHaveBeenCalledOnce();
});

test("shows a full loading state before initial list data exists", async () => {
  const wrapper = await mountDiscussionsList({
    discussions: undefined,
    status: "pending",
  }, {
    template: "<div data-testid='data-table' />",
    props: ["data", "columns", "pagination"],
  });

  expect(wrapper.find("[data-testid='spinner']").exists()).toBe(true);
  expect(wrapper.find("[data-testid='data-table']").exists()).toBe(false);
  expect(wrapper.find("[aria-label='Refreshing discussions']").exists()).toBe(false);
});

test("shows a non-blocking status while existing discussions refresh", async () => {
  const wrapper = await mountDiscussionsList({ asyncStatus: "loading" }, {
    template: "<div data-testid='data-table' />",
    props: ["data", "columns", "pagination"],
  });

  expect(wrapper.find("[data-testid='data-table']").exists()).toBe(true);
  expect(wrapper.find("[aria-label='Refreshing discussions']").exists()).toBe(true);
});

test("renders the empty state when the list succeeds with no discussions", async () => {
  const wrapper = await mountDiscussionsList({ discussions: emptyDiscussions }, {
    template: "<p>{{ emptyTitle }}</p>",
    props: ["data", "columns", "pagination", "emptyTitle"],
  });

  expect(wrapper.text()).toContain("No Entries Found");
});

test("renders discussion rows", async () => {
  const wrapper = await mountDiscussionsList({}, {
    template: `
      <table>
        <tbody>
          <tr v-for="item in data" :key="item.id">
            <td>{{ item.title }}</td>
          </tr>
        </tbody>
      </table>
    `,
    props: ["data", "columns", "pagination"],
  });

  expect(wrapper.text()).toContain("First Discussion");
  expect(wrapper.text()).toContain("Second Discussion");
});
