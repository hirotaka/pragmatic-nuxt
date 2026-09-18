import { mountSuspended } from "@nuxt/test-utils/runtime";
import { within } from "@testing-library/vue";
import { expect, test, vi } from "vitest";
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

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ user: { value: null } }),
}));

const mountCommentsList = (props: Partial<InstanceType<typeof CommentsList>["$props"]> = {}) => {
  return mountSuspended(CommentsList, {
    props: {
      comments,
      currentPage: 1,
      hasInitialError: false,
      hasMore: false,
      isInitialReady: true,
      isLoading: false,
      isRetrying: false,
      ...props,
    },
    global: {
      stubs: {
        Authorization: { template: "<div><slot /></div>" },
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
  const wrapper = await mountCommentsList({
    comments: [],
    hasInitialError: true,
    isInitialReady: false,
    isRetrying: true,
  });
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByRole("alert", { name: "Comments unavailable" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Retry comments" }).hasAttribute("disabled")).toBe(true);
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

  expect(wrapper.emitted("load-more")).toHaveLength(1);
});
