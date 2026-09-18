import { defineComponent } from "vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { within } from "@testing-library/vue";
import { beforeEach, expect, test, vi } from "vitest";
import CommentsList from "../CommentsList.vue";

const comments = [{
  id: "comment-1",
  body: "Existing comment",
  discussionId: "discussion-1",
  authorId: "user-1",
  author: { id: "user-1", firstName: "Ada", lastName: "Lovelace" },
  createdAt: "2026-07-10T00:00:00.000Z",
  updatedAt: "2026-07-10T00:00:00.000Z",
}];

const refresh = vi.fn();
const loadMore = vi.fn();
const retryLoadMore = vi.fn();
const DeleteCommentStub = defineComponent({
  name: "DeleteComment",
  props: ["commentId", "discussionId", "asMenuItem", "actionLabel"],
  template: "<button>Delete Comment</button>",
});

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ user: { value: null } }),
}));

beforeEach(() => {
  refresh.mockReset().mockResolvedValue(undefined);
  loadMore.mockReset().mockResolvedValue(undefined);
  retryLoadMore.mockReset().mockResolvedValue(undefined);
});

const mountCommentsList = (props: Partial<InstanceType<typeof CommentsList>["$props"]> = {}) => mountSuspended(CommentsList, {
  props: {
    comments,
    currentPage: 1,
    hasInitialError: false,
    hasMore: false,
    hasNextPageError: false,
    isInitialReady: true,
    isLoadingMore: false,
    loadMore,
    refresh,
    retryLoadMore,
    ...props,
  },
  global: {
    stubs: {
      Authorization: { template: "<div><slot /></div>" },
      DeleteComment: DeleteCommentStub,
      MarkdownPreview: { template: "<p>{{ value }}</p>", props: ["value"] },
      Spinner: { template: "<span data-testid='spinner' />" },
    },
  },
});

test("shows initial loading and failure separately from successful empty comments", async () => {
  const pending = await mountCommentsList({ comments: [], isInitialReady: false });
  expect(pending.element.getAttribute("role")).toBe("status");

  const failed = await mountCommentsList({ comments: [], hasInitialError: true, isInitialReady: false });
  expect(within(failed.element as HTMLElement).getByRole("alert", { name: "Comments unavailable" })).toBeTruthy();

  const empty = await mountCommentsList({ comments: [] });
  expect(within(empty.element as HTMLElement).getByText("No Comments Found")).toBeTruthy();
});

test("keeps committed comments visible and retries only the failed next page", async () => {
  const wrapper = await mountCommentsList({ hasMore: true, hasNextPageError: true });
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByText("Existing comment")).toBeTruthy();
  expect(screen.getByRole("alert", { name: "More comments unavailable" })).toBeTruthy();
  await screen.getByRole("button", { name: "Retry loading comments" }).click();

  expect(retryLoadMore).toHaveBeenCalledOnce();
  expect(loadMore).not.toHaveBeenCalled();
});

test("disables duplicate load-more actions while the native infinite query is fetching", async () => {
  const wrapper = await mountCommentsList({ hasMore: true, isLoadingMore: true });
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getAllByRole("button").at(-1)?.hasAttribute("disabled")).toBe(true);
  expect(screen.getByTestId("spinner")).toBeTruthy();
});
