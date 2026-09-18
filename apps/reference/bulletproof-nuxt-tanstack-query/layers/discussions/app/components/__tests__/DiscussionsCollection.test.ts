import { beforeEach, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import type { PaginatedDiscussions } from "~discussions/shared/types";
import DiscussionsCollection from "../DiscussionsCollection.vue";

const { discussionListQuery, refetch, useQuery } = vi.hoisted(() => ({
  discussionListQuery: vi.fn(),
  refetch: vi.fn(),
  useQuery: vi.fn(),
}));

const queryState = {
  data: ref<PaginatedDiscussions | undefined>(),
  isFetching: ref(false),
  status: ref<"pending" | "error" | "success">("success"),
};

vi.mock("@tanstack/vue-query", () => ({ useQuery }));
vi.mock("~discussions/app/queries/discussions", () => ({
  discussionListQuery,
  normalizeDiscussionPage: (value: unknown) => value === "2" ? 2 : 1,
}));

const discussions: PaginatedDiscussions = {
  data: [],
  meta: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasMore: false,
  },
};

beforeEach(() => {
  discussionListQuery.mockReset().mockReturnValue({ queryKey: ["discussions"] });
  refetch.mockReset().mockResolvedValue(undefined);
  queryState.data.value = discussions;
  queryState.isFetching.value = false;
  queryState.status.value = "success";
  useQuery.mockReset().mockReturnValue({
    data: queryState.data,
    isFetching: queryState.isFetching,
    refetch,
    status: queryState.status,
  });
});

const mountCollection = () => mountSuspended(DiscussionsCollection, {
  global: {
    stubs: {
      LayoutsContentLayout: {
        template: "<section><slot name='actions' /><slot /></section>",
      },
      CreateDiscussion: {
        name: "CreateDiscussion",
        props: ["refresh"],
        template: "<div />",
      },
      DiscussionsList: {
        name: "DiscussionsList",
        props: ["discussions", "isPending", "refresh"],
        template: "<div data-testid='discussions-list' />",
      },
      Spinner: { template: "<div data-testid='spinner' />" },
    },
  },
});

test("keeps successful list data mounted while a background refetch is active", async () => {
  queryState.isFetching.value = true;
  const wrapper = await mountCollection();
  const list = wrapper.getComponent({ name: "DiscussionsList" });

  expect(list.props("discussions")).toEqual(discussions);
  expect(list.props("isPending")).toBe(true);
  expect(wrapper.find("[role='status']").exists()).toBe(false);
});

test("renders an initial read failure with a retry owned by the list Query", async () => {
  queryState.data.value = undefined;
  queryState.status.value = "error";
  const wrapper = await mountCollection();

  expect(wrapper.get("[role='alert']").text()).toContain("Discussions could not be loaded.");
  await wrapper.get("button").trigger("click");

  expect(refetch).toHaveBeenCalledWith({ throwOnError: true });
});

test("keeps cached list data with a persistent retry after refetch failure", async () => {
  queryState.status.value = "error";
  const wrapper = await mountCollection();

  expect(wrapper.getComponent({ name: "DiscussionsList" }).props("discussions")).toEqual(discussions);
  expect(wrapper.get("[role='alert']").text()).toContain("Discussions could not be refreshed.");
  await wrapper.get("[role='alert'] button").trigger("click");

  expect(refetch).toHaveBeenCalledWith({ throwOnError: true });
});

test("keeps Query refetch ownership with the list read surface", async () => {
  const wrapper = await mountCollection();
  const list = wrapper.getComponent({ name: "DiscussionsList" });
  const create = wrapper.getComponent({ name: "CreateDiscussion" });

  expect(list.props("refresh")).toBeUndefined();
  expect(create.props("refresh")).toBeUndefined();
  expect(refetch).not.toHaveBeenCalled();
});
