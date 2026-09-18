import { beforeEach, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { ref, type Ref } from "vue";
import { within } from "@testing-library/vue";
import type { Comment } from "~comments/shared/types";
import type { PaginatedResult } from "#layers/base/shared/types/pagination";
import CommentsList from "../CommentsList.vue";

const {
  loadMore,
  refreshAfterDelete,
  useComments,
} = vi.hoisted(() => ({
  loadMore: vi.fn(),
  refreshAfterDelete: vi.fn(),
  useComments: vi.fn(),
}));

vi.mock("~comments/app/composables/useComments", () => ({
  useComments,
}));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ user: { value: null } }),
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

const comments: Ref<PaginatedResult<Comment> | undefined> = ref();
const isLoading = ref(false);

const paginatedComments = (data: Comment[] = existingComments): PaginatedResult<Comment> => ({
  data,
  meta: {
    page: 1,
    limit: 10,
    total: data.length,
    totalPages: 1,
    hasMore: false,
  },
});

beforeEach(() => {
  comments.value = paginatedComments();
  isLoading.value = false;
  loadMore.mockReset().mockResolvedValue(undefined);
  refreshAfterDelete.mockReset().mockResolvedValue(undefined);
  useComments.mockReset().mockResolvedValue({
    comments,
    isLoading,
    loadMore,
    refreshAfterDelete,
  });
});

const mountCommentsList = () => mountSuspended(CommentsList, {
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
  isLoading.value = true;
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
  comments.value = paginatedComments([]);
  const wrapper = await mountCommentsList();
  const screen = within(wrapper.element as HTMLElement);

  expect(wrapper.find("[aria-label='comments']").exists()).toBe(true);
  expect(screen.getByText("No Comments Found")).toBeTruthy();
});

test("loads the next page from its data owner", async () => {
  comments.value = {
    ...paginatedComments(),
    meta: {
      ...paginatedComments().meta,
      hasMore: true,
    },
  };
  const wrapper = await mountCommentsList();
  const screen = within(wrapper.element as HTMLElement);

  await screen.getByRole("button", { name: /load more comments/i }).click();

  expect(loadMore).toHaveBeenCalledOnce();
});

test("settles its data after successful deletion", async () => {
  const wrapper = await mountCommentsList();

  await wrapper.get("button").trigger("click");

  expect(refreshAfterDelete).toHaveBeenCalledOnce();
});
