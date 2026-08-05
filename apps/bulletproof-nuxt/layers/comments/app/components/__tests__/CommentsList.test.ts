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
  author: {
    id: "user-1",
    firstName: "Ada",
    lastName: "Lovelace",
  },
  createdAt: "2026-07-10T00:00:00.000Z",
  updatedAt: "2026-07-10T00:00:00.000Z",
}];

const refresh = vi.fn();
const loadMore = vi.fn();
const DeleteCommentStub = defineComponent({
  name: "DeleteComment",
  props: ["commentId", "refresh", "asMenuItem", "actionLabel"],
  template: "<button>Delete Comment</button>",
});

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ user: { value: null } }),
}));

beforeEach(() => {
  refresh.mockReset().mockResolvedValue(undefined);
  loadMore.mockReset().mockResolvedValue(undefined);
});

const mountCommentsList = (props: Partial<InstanceType<typeof CommentsList>["$props"]> = {}) => {
  return mountSuspended(CommentsList, {
    props: {
      comments,
      currentPage: 1,
      hasInitialError: false,
      hasMore: false,
      isInitialReady: true,
      isLoading: false,
      loadMore,
      refresh,
      ...props,
    },
    global: {
      stubs: {
        Authorization: { template: "<div><slot /></div>" },
        DeleteComment: DeleteCommentStub,
        MarkdownPreview: {
          template: "<p>{{ value }}</p>",
          props: ["value"],
        },
        Spinner: { template: "<span data-testid='spinner' />" },
      },
    },
  });
};

test("keeps existing comments visible during a page-one reload", async () => {
  const wrapper = await mountCommentsList({ isLoading: true });
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByText("Existing comment")).toBeTruthy();
  expect(screen.queryByTestId("spinner")).toBeNull();
});

test("shows an accessible pending state before initial comments settle", async () => {
  const wrapper = await mountCommentsList({
    comments: [],
    isInitialReady: false,
  });
  const screen = within(wrapper.element as HTMLElement);

  expect(wrapper.element.getAttribute("role")).toBe("status");
  expect(wrapper.text()).toContain("Loading comments");
  expect(screen.queryByText("No Comments Found")).toBeNull();
});

test("shows persistent recovery without presenting initial failure as successful empty", async () => {
  const wrapper = await mountCommentsList({
    comments: [],
    hasInitialError: true,
    isInitialReady: false,
  });
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.queryByText("No Comments Found")).toBeNull();
  expect(screen.getByRole("alert", { name: "Comments unavailable" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Retry comments" })).toBeTruthy();
});

test("keeps persistent recovery visible and disables retry while it settles", async () => {
  let resolveRetry!: () => void;
  refresh.mockImplementationOnce(() => new Promise<void>((resolve) => {
    resolveRetry = resolve;
  }));
  const wrapper = await mountCommentsList({
    comments: [],
    hasInitialError: true,
    isInitialReady: false,
  });
  const screen = within(wrapper.element as HTMLElement);

  await screen.getByRole("button", { name: "Retry comments" }).click();

  expect(screen.getByRole("alert", { name: "Comments unavailable" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Retry comments" }).hasAttribute("disabled")).toBe(true);

  resolveRetry();
  await vi.waitFor(() => {
    expect(screen.getByRole("button", { name: "Retry comments" }).hasAttribute("disabled")).toBe(false);
  });
  expect(refresh).toHaveBeenCalledOnce();
});

test("shows successful empty only after initial comments settle", async () => {
  const wrapper = await mountCommentsList({ comments: [] });
  const screen = within(wrapper.element as HTMLElement);

  expect(wrapper.find("[aria-label='comments']").exists()).toBe(true);
  expect(screen.getByText("No Comments Found")).toBeTruthy();
});

test("delegates pagination to the accumulated-state owner", async () => {
  const wrapper = await mountCommentsList({ hasMore: true });
  const screen = within(wrapper.element as HTMLElement);

  await screen.getByRole("button", { name: /load more comments/i }).click();

  expect(loadMore).toHaveBeenCalledOnce();
});
