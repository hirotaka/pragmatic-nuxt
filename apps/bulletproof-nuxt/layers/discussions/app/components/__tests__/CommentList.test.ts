import { beforeEach, expect, test, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { computed, nextTick, ref, type Ref } from "vue";
import { within } from "@testing-library/vue";
import type { Comment } from "#layers/discussions/shared/types/comment";
import type { PaginatedResult } from "~~/shared/types/pagination";
import CommentList from "../CommentList.vue";

const {
  loadMore,
  refresh,
  useCommentList,
} = vi.hoisted(() => ({
  loadMore: vi.fn(),
  refresh: vi.fn(),
  useCommentList: vi.fn(),
}));

mockNuxtImport("useCommentList", () => useCommentList);

vi.mock("~~/app/composables/useCurrentUser", () => ({
  useCurrentUser: () => ({ user: { value: null } }),
}));

const existingComments: Comment[] = [{
  id: "comment-1",
  body: "Existing comment",
  discussionId: "discussion-1",
  authorId: "user-1",
  author: {
    id: "user-1",
    firstName: "Ada",
    lastName: "Lovelace",
  },
  createdAt: "2026-07-10T00:00:00.000Z",
  updatedAt: "2026-07-10T00:00:00.000Z",
}];

const comments: Ref<{ pages: PaginatedResult<Comment>[] } | undefined> = ref();
const status = ref("success");
const isLoadingMore = ref(false);

const paginatedComments = (items: Comment[] = existingComments): PaginatedResult<Comment> => ({
  items,
  meta: {
    page: 1,
    limit: 10,
    total: items.length,
    totalPages: 1,
    hasMore: false,
  },
});

beforeEach(() => {
  comments.value = { pages: [paginatedComments()] };
  status.value = "success";
  isLoadingMore.value = false;
  loadMore.mockReset().mockResolvedValue(undefined);
  refresh.mockReset().mockResolvedValue(undefined);
  useCommentList.mockReset().mockResolvedValue({
    data: comments,
    isLoading: computed(() => status.value === "pending" || isLoadingMore.value),
    isLoadingMore,
    hasNextPage: computed(() => comments.value?.pages.at(-1)?.meta.hasMore),
    loadMore,
    refresh,
  });
});

const mountCommentsList = () => mountSuspended(CommentList, {
  props: {
    discussionId: "discussion-1",
  },
  global: {
    stubs: {
      Authorization: { template: "<div><slot /></div>" },
      CommentActionsMenu: {
        emits: ["success"],
        template: "<button type='button' @click='$emit(\"success\")'>Delete succeeded</button>",
      },
      MarkdownPreview: {
        template: "<p>{{ value }}</p>",
        props: ["value"],
      },
      Spinner: { template: "<span data-testid='spinner' />" },
    },
  },
});

test("keeps existing comments visible during a page-one reload", async () => {
  status.value = "pending";
  const wrapper = await mountCommentsList();
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByText("Existing comment")).toBeTruthy();
  expect(screen.queryByTestId("spinner")).toBeNull();
});

test("does not present unsettled comments as successful empty", async () => {
  comments.value = undefined;
  const wrapper = await mountCommentsList();

  expect(wrapper.text()).toBe("");
  expect(wrapper.find("[aria-label='comments']").exists()).toBe(false);
});

test("shows successful empty only after initial comments settle", async () => {
  comments.value = { pages: [paginatedComments([])] };
  const wrapper = await mountCommentsList();
  const screen = within(wrapper.element as HTMLElement);

  expect(wrapper.find("[data-slot='empty'][aria-label='comments']").exists()).toBe(true);
  expect(screen.getByRole("heading", { name: "No Comments Found" })).toBeTruthy();
});

test("loads the next page through its independent feature call", async () => {
  comments.value!.pages[0]!.meta.hasMore = true;
  const wrapper = await mountCommentsList();
  const screen = within(wrapper.element as HTMLElement);

  await screen.getByRole("button", { name: /load more comments/i }).click();

  expect(loadMore).toHaveBeenCalledOnce();
  expect(useCommentList).toHaveBeenCalledWith("discussion-1");
  expect(useCommentList).toHaveBeenCalledOnce();
});

test("replaces the load-more label with a spinner until loading settles", async () => {
  comments.value!.pages[0]!.meta.hasMore = true;
  const wrapper = await mountCommentsList();
  const screen = within(wrapper.element as HTMLElement);
  const button = screen.getByRole("button", { name: "Load More Comments" });

  expect(button.hasAttribute("disabled")).toBe(false);
  expect(screen.queryByTestId("spinner")).toBeNull();

  isLoadingMore.value = true;
  await nextTick();

  expect(within(button).getByTestId("spinner")).toBeTruthy();
  expect(button.textContent).not.toContain("Load More Comments");
  expect(button.hasAttribute("disabled")).toBe(true);
  expect(screen.getByText("Existing comment")).toBeTruthy();

  isLoadingMore.value = false;
  await nextTick();

  expect(screen.queryByTestId("spinner")).toBeNull();
  expect(screen.getByRole("button", { name: "Load More Comments" }).hasAttribute("disabled")).toBe(false);
});

test("renders items from every loaded page", async () => {
  comments.value!.pages.push(paginatedComments([{ ...existingComments[0]!, id: "comment-2", body: "Next comment" }]));
  const wrapper = await mountCommentsList();
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByText("Existing comment")).toBeTruthy();
  expect(screen.getByText("Next comment")).toBeTruthy();
});

test("settles its data after successful deletion", async () => {
  const wrapper = await mountCommentsList();

  await wrapper.get("button").trigger("click");

  expect(refresh).toHaveBeenCalledOnce();
});
