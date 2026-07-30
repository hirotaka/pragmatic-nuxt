import { beforeEach, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
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
const loadPage = vi.fn();
const refresh = vi.fn();
const { useDiscussions } = vi.hoisted(() => ({
  useDiscussions: vi.fn(),
}));

vi.mock("~discussions/app/composables/useDiscussions", () => ({
  useDiscussions,
}));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ isAdmin: { value: true } }),
}));

beforeEach(() => {
  loadPage.mockReset().mockResolvedValue(undefined);
  refresh.mockReset().mockResolvedValue(undefined);
  useDiscussions.mockReset();
});

const mountDiscussionsList = (
  props: Partial<InstanceType<typeof DiscussionsList>["$props"]>,
  dataTableStub: Component,
) => mountSuspended(DiscussionsList, {
  props: {
    discussions: paginatedDiscussions,
    isPending: false,
    loadPage,
    refresh,
    ...props,
  },
  global: {
    stubs: {
      DataTable: dataTableStub,
      DeleteDiscussion: true,
      Spinner: { template: "<div data-testid='spinner' />" },
    },
  },
});

test("delegates page changes to the pagination owner", async () => {
  const wrapper = await mountDiscussionsList({}, {
    template: "<button type='button' @click=\"$emit('page-change', 2)\">Next page</button>",
    props: ["data", "columns", "pagination"],
    emits: ["page-change"],
  });

  await wrapper.get("button").trigger("click");

  expect(loadPage).toHaveBeenCalledWith(2);
  expect(useDiscussions).not.toHaveBeenCalled();
});

test("shows a full loading state before initial list data exists", async () => {
  const wrapper = await mountDiscussionsList({
    discussions: emptyDiscussions,
    isPending: true,
  }, {
    template: "<div data-testid='data-table' />",
    props: ["data", "columns", "pagination"],
  });

  expect(wrapper.find("[data-testid='spinner']").exists()).toBe(true);
  expect(wrapper.find("[data-testid='data-table']").exists()).toBe(false);
});

test("keeps stale list data visible while refreshing", async () => {
  const wrapper = await mountDiscussionsList({ isPending: true }, {
    template: "<p>{{ data[0].title }}</p>",
    props: ["data", "columns", "pagination"],
  });

  expect(wrapper.text()).toContain("Refreshing discussions...");
  expect(wrapper.text()).toContain("First Discussion");
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
