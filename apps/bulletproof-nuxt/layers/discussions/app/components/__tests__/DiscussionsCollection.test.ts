import { beforeEach, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref, type Ref } from "vue";
import type { PaginatedDiscussions } from "~discussions/shared/types";
import DiscussionsCollection from "../DiscussionsCollection.vue";

const { useDiscussions } = vi.hoisted(() => ({
  useDiscussions: vi.fn(),
}));

vi.mock("~discussions/app/composables/useDiscussions", () => ({
  useDiscussions,
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
const refresh = vi.fn();

beforeEach(() => {
  refresh.mockReset().mockResolvedValue(undefined);
  useDiscussions.mockReset().mockResolvedValue({
    data: ref(discussions),
    status: ref("success"),
    refresh,
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
        emits: ["pageChange"],
        template: `
          <div>
            <p>{{ discussions.meta.page }}</p>
            <button type="button" @click="$emit('pageChange', 2)">Page 2</button>
            <button type="button" @click="$emit('pageChange', 3)">Page 3</button>
          </div>
        `,
      },
    },
  },
});

test("owns the current page and updates the reactive Read query from List events", async () => {
  const wrapper = await mountCollection();
  const params = useDiscussions.mock.calls[0]?.[0] as { page: Ref<number>; limit: number };

  expect(params.page.value).toBe(1);
  expect(params.limit).toBe(10);

  await wrapper.get("button:nth-of-type(1)").trigger("click");
  expect(params.page.value).toBe(2);

  await wrapper.get("button:nth-of-type(2)").trigger("click");
  expect(params.page.value).toBe(3);
});

test("passes native AsyncData state and refresh to the interaction owners", async () => {
  const wrapper = await mountCollection();
  const list = wrapper.findComponent({ name: "DiscussionsList" });
  const create = wrapper.findComponent({ name: "CreateDiscussion" });

  expect(list.props("discussions")).toEqual(discussions);
  expect(list.props("isPending")).toBe(false);
  expect(list.props("refresh")).toBe(refresh);
  expect(create.props("refresh")).toBe(refresh);
});
