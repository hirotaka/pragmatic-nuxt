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
const refresh = vi.fn();

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ isAdmin: { value: true } }),
}));

beforeEach(() => {
  refresh.mockReset().mockResolvedValue(undefined);
});

const mountDiscussionsList = (
  props: Partial<InstanceType<typeof DiscussionsList>["$props"]>,
  dataTableStub: Component,
) => mountSuspended(DiscussionsList, {
  props: {
    discussions: paginatedDiscussions,
    isPending: false,
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

test("emits page changes without calling a domain Read", async () => {
  const wrapper = await mountDiscussionsList({}, {
    template: "<button type='button' @click=\"$emit('page-change', 2)\">Next page</button>",
    props: ["data", "columns", "pagination"],
    emits: ["page-change"],
  });

  await wrapper.get("button").trigger("click");

  expect(wrapper.emitted("pageChange")).toEqual([[2]]);
});

test.each([
  { name: "empty", response: emptyDiscussions, content: "No Entries Found" },
  { name: "nonempty", response: paginatedDiscussions, content: "First Discussion" },
])("keeps a fetched $name table mounted throughout refresh", async ({ response, content }) => {
  const wrapper = await mountDiscussionsList({ discussions: response }, {
    template: "<div data-testid='data-table'>{{ data.length ? data[0].title : emptyTitle }}</div>",
    props: ["data", "columns", "pagination", "emptyTitle"],
  });
  const table = wrapper.get("[data-testid='data-table']").element;
  expect(wrapper.text()).toContain(content);

  await wrapper.setProps({ isPending: true });

  expect(wrapper.get("[data-testid='data-table']").element).toBe(table);
  expect(wrapper.text()).toContain(content);
  expect(wrapper.text()).toContain("Refreshing discussions...");
  expect(wrapper.find("[data-testid='spinner']").exists()).toBe(false);

  await wrapper.setProps({ isPending: false, discussions: paginatedDiscussions });

  expect(wrapper.get("[data-testid='data-table']").element).toBe(table);
  expect(wrapper.text()).toContain("First Discussion");
  expect(wrapper.text()).not.toContain("Refreshing discussions...");
});

test("reserves the refresh message space before, during, and after refresh", async () => {
  const wrapper = await mountDiscussionsList({}, {
    template: "<div />",
    props: ["data", "columns", "pagination"],
  });
  const message = wrapper.get("[aria-live='polite']");
  expect(message.classes()).toContain("min-h-5");
  expect(message.text()).toBe("");

  await wrapper.setProps({ isPending: true });
  expect(wrapper.get("[aria-live='polite']").element).toBe(message.element);
  expect(message.text()).toBe("Refreshing discussions...");

  await wrapper.setProps({ isPending: false });
  expect(wrapper.get("[aria-live='polite']").element).toBe(message.element);
  expect(message.text()).toBe("");
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
