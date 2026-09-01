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

const { queryState } = vi.hoisted(() => ({
  queryState: {
    data: { __v_isRef: true, value: undefined as { pages: Array<{ data: typeof comments }> } | undefined },
    error: { __v_isRef: true, value: undefined as Error | undefined },
    status: { __v_isRef: true, value: "pending" },
    hasNextPage: { __v_isRef: true, value: false },
    asyncStatus: { __v_isRef: true, value: "idle" },
    loadNextPage: vi.fn(),
  },
}));
const DeleteCommentStub = defineComponent({
  name: "DeleteComment",
  props: ["commentId", "discussionId", "asMenuItem", "actionLabel"],
  template: "<button>Delete Comment</button>",
});

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ user: { value: null } }),
}));

vi.mock("~comments/app/queries/comments", () => ({ commentsQuery: vi.fn() }));

vi.mock("@pinia/colada", () => ({
  useInfiniteQuery: () => queryState,
  PiniaColadaQueryHooksPlugin: vi.fn(() => ({})),
}));

beforeEach(() => {
  queryState.data.value = { pages: [{ data: comments }] };
  queryState.error.value = undefined;
  queryState.status.value = "success";
  queryState.hasNextPage.value = false;
  queryState.asyncStatus.value = "idle";
  queryState.loadNextPage.mockReset().mockResolvedValue(undefined);
});

const mountCommentsList = (props: Partial<InstanceType<typeof CommentsList>["$props"]> = {}) => {
  return mountSuspended(CommentsList, {
    props: {
      discussionId: "discussion-1",
      ...props,
    },
    global: {
      stubs: {
        Authorization: { template: "<div><slot /></div>" },
        CreateComment: { template: "<button>Create Comment</button>" },
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
  queryState.asyncStatus.value = "loading";
  const wrapper = await mountCommentsList();
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByText("Existing comment")).toBeTruthy();
  expect(screen.queryByTestId("spinner")).toBeNull();
});

test("shows an accessible pending state before initial comments settle", async () => {
  queryState.data.value = undefined;
  queryState.status.value = "pending";
  const wrapper = await mountCommentsList();
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByRole("status")).toBeTruthy();
  expect(wrapper.text()).toContain("Loading comments");
  expect(screen.queryByText("No Comments Found")).toBeNull();
});

test("shows successful empty only after initial comments settle", async () => {
  queryState.data.value = { pages: [{ data: [] }] };
  const wrapper = await mountCommentsList();
  const screen = within(wrapper.element as HTMLElement);

  expect(wrapper.find("[aria-label='comments']").exists()).toBe(true);
  expect(screen.getByText("No Comments Found")).toBeTruthy();
});

test("delegates pagination to the accumulated-state owner", async () => {
  queryState.hasNextPage.value = true;
  const wrapper = await mountCommentsList();
  const screen = within(wrapper.element as HTMLElement);

  await screen.getByRole("button", { name: /load more comments/i }).click();

  expect(queryState.loadNextPage).toHaveBeenCalledOnce();
});
