import { defineComponent, ref } from "vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, expect, test, vi } from "vitest";
import Comments from "../Comments.vue";

const {
  commentsInfiniteQuery,
  fetchNextPage,
  infiniteData,
  isFetchNextPageError,
  isFetchingNextPage,
  status,
  useInfiniteQuery,
} = vi.hoisted(() => ({
  commentsInfiniteQuery: vi.fn(),
  fetchNextPage: vi.fn(),
  infiniteData: { __v_isRef: true, value: undefined as undefined | { pages: Array<{ data: Array<{ id: string }>; meta: { page: number } }> } },
  isFetchNextPageError: { __v_isRef: true, value: false },
  isFetchingNextPage: { __v_isRef: true, value: false },
  status: { __v_isRef: true, value: "pending" },
  useInfiniteQuery: vi.fn(),
}));

vi.mock("@tanstack/vue-query", () => ({ useInfiniteQuery }));
vi.mock("~comments/app/queries/comments", () => ({ commentsInfiniteQuery }));

const CreateCommentStub = defineComponent({
  props: ["disabled", "discussionId"],
  template: "<div data-testid='create-comment' :data-disabled='disabled' :data-discussion='discussionId' />",
});
const CommentsListStub = defineComponent({
  props: ["comments", "hasInitialError", "hasNextPageError", "isInitialReady", "isLoadingMore", "loadMore", "retryLoadMore"],
  template: "<div data-testid='comments-list' :data-initial-ready='isInitialReady' :data-next-error='hasNextPageError' />",
});

beforeEach(() => {
  commentsInfiniteQuery.mockReset().mockImplementation(({ discussionId }) => ({ queryKey: ["comments", "discussion", discussionId] }));
  fetchNextPage.mockReset().mockResolvedValue(undefined);
  infiniteData.value = undefined;
  isFetchNextPageError.value = false;
  isFetchingNextPage.value = false;
  status.value = "pending";
  useInfiniteQuery.mockReset().mockReturnValue({
    data: infiniteData,
    fetchNextPage,
    hasNextPage: ref(true),
    isFetchNextPageError,
    isFetchingNextPage,
    refetch: vi.fn(),
    status,
    suspense: vi.fn(),
  });
});

const mountComments = () => mountSuspended(Comments, {
  props: { discussionId: "discussion-1" },
  global: { stubs: { CreateComment: CreateCommentStub, CommentsList: CommentsListStub } },
});

test("derives initial readiness from native infinite data rather than treating pending as empty", async () => {
  const wrapper = await mountComments();

  expect(wrapper.get("[data-testid='create-comment']").attributes("data-disabled")).toBe("true");
  expect(wrapper.get("[data-testid='comments-list']").attributes("data-initial-ready")).toBe("false");
});

test("switches to a distinct discussion identity without retaining the old pages", async () => {
  const wrapper = await mountComments();
  const query = useInfiniteQuery.mock.calls[0]?.[0] as { value: { queryKey: unknown } };

  expect(query.value.queryKey).toEqual(["comments", "discussion", "discussion-1"]);
  await wrapper.setProps({ discussionId: "discussion-2" });

  expect(query.value.queryKey).toEqual(["comments", "discussion", "discussion-2"]);
  expect(commentsInfiniteQuery).toHaveBeenLastCalledWith({
    discussionId: "discussion-2",
    enabled: false,
  });
});

test("does not start a duplicate next-page request while one is already active", async () => {
  isFetchingNextPage.value = true;
  const wrapper = await mountComments();
  const list = wrapper.findComponent(CommentsListStub);

  await (list.props("loadMore") as () => Promise<void>)();
  expect(fetchNextPage).not.toHaveBeenCalled();
});
