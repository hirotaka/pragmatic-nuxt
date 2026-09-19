import { beforeEach, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { nextTick, ref, type Component, type Ref } from "vue";
import type { Discussion, PaginatedDiscussions } from "~discussions/shared/types";
import DiscussionsList from "../DiscussionsList.vue";

const { useDiscussions } = vi.hoisted(() => ({
  useDiscussions: vi.fn(),
}));

vi.mock("~discussions/app/composables/useDiscussions", () => ({
  useDiscussions,
}));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ isAdmin: { value: true } }),
}));

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

const refreshAfterDelete = vi.fn();
let currentPage: Ref<number>;
let data: Ref<PaginatedDiscussions | undefined>;
let status: Ref<string>;

beforeEach(() => {
  currentPage = ref(1);
  data = ref(paginatedDiscussions);
  status = ref("success");
  refreshAfterDelete.mockReset().mockResolvedValue(undefined);
  useDiscussions.mockReset().mockResolvedValue({ currentPage, data, refreshAfterDelete, status });
});

const mountDiscussionsList = (dataTableStub: Component) => mountSuspended(DiscussionsList, {
  global: {
    stubs: {
      DataTable: dataTableStub,
      DiscussionActionsMenu: true,
      Spinner: { template: "<div data-testid='spinner' />" },
    },
  },
});

test("owns the current page and updates its reactive Read query", async () => {
  const wrapper = await mountDiscussionsList({
    template: "<button type='button' @click=\"$emit('page-change', 2)\">Next page</button>",
    props: ["data", "columns", "pagination"],
    emits: ["page-change"],
  });
  expect(useDiscussions).toHaveBeenCalledWith();
  expect(currentPage.value).toBe(1);

  await wrapper.get("button").trigger("click");

  expect(currentPage.value).toBe(2);
});

test.each([
  { name: "empty", response: emptyDiscussions, content: "No Entries Found" },
  { name: "nonempty", response: paginatedDiscussions, content: "First Discussion" },
])("keeps a fetched $name table mounted throughout refresh", async ({ response, content }) => {
  data.value = response;
  const wrapper = await mountDiscussionsList({
    template: "<div data-testid='data-table'>{{ data.length ? data[0].title : emptyTitle }}</div>",
    props: ["data", "columns", "pagination", "emptyTitle"],
  });
  const table = wrapper.get("[data-testid='data-table']").element;
  expect(wrapper.text()).toContain(content);

  status.value = "pending";
  await nextTick();

  expect(wrapper.get("[data-testid='data-table']").element).toBe(table);
  expect(wrapper.text()).toContain(content);
  expect(wrapper.text()).toContain("Refreshing discussions...");
  expect(wrapper.find("[data-testid='spinner']").exists()).toBe(false);

  status.value = "success";
  data.value = paginatedDiscussions;
  await nextTick();

  expect(wrapper.get("[data-testid='data-table']").element).toBe(table);
  expect(wrapper.text()).toContain("First Discussion");
  expect(wrapper.text()).not.toContain("Refreshing discussions...");
});

test("reserves the refresh message space before, during, and after refresh", async () => {
  const wrapper = await mountDiscussionsList({
    template: "<div />",
    props: ["data", "columns", "pagination"],
  });
  const message = wrapper.get("[aria-live='polite']");
  expect(message.classes()).toContain("min-h-5");
  expect(message.text()).toBe("");

  status.value = "pending";
  await nextTick();
  expect(wrapper.get("[aria-live='polite']").element).toBe(message.element);
  expect(message.text()).toBe("Refreshing discussions...");

  status.value = "success";
  await nextTick();
  expect(wrapper.get("[aria-live='polite']").element).toBe(message.element);
  expect(message.text()).toBe("");
});

test("settles its data after successful deletion", async () => {
  const wrapper = await mountSuspended(DiscussionsList, {
    global: {
      stubs: {
        DataTable: {
          props: ["data"],
          template: "<div><slot name='cell-delete' :entry='data[0]' /></div>",
        },
        DiscussionActionsMenu: {
          emits: ["success"],
          template: "<button type='button' @click='$emit(\"success\")'>Delete succeeded</button>",
        },
      },
    },
  });

  await wrapper.get("button").trigger("click");

  expect(refreshAfterDelete).toHaveBeenCalledOnce();
});

test("renders discussion rows", async () => {
  const wrapper = await mountDiscussionsList({
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
