import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import Comments from "../Comments.vue";

const {
  addNotification,
  commentsState,
  createCommentMutate,
  deleteCommentMutate,
  hasInitialError,
  isInitialReady,
  isLoading,
  loadComments,
  useComments,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  commentsState: { value: [] as Array<Record<string, unknown>> },
  createCommentMutate: vi.fn(),
  deleteCommentMutate: vi.fn(),
  hasInitialError: { __v_isRef: true, value: false },
  isInitialReady: { __v_isRef: true, value: true },
  isLoading: { __v_isRef: true, value: false },
  loadComments: vi.fn(),
  useComments: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({ user: { value: null } }),
}));

vi.mock("~comments/app/composables/useCreateComment", () => ({
  useCreateComment: () => createCommentMutate,
}));

vi.mock("~comments/app/composables/useDeleteComment", () => ({
  useDeleteComment: () => deleteCommentMutate,
}));

vi.mock("~comments/app/composables/useComments", () => ({
  useComments: (discussionId: () => string) => {
    useComments(discussionId);
    return {
      comments: { __v_isRef: true, get value() { return commentsState.value; } },
      currentPage: { __v_isRef: true, value: 1 },
      hasInitialError,
      hasMore: { __v_isRef: true, value: false },
      isInitialReady,
      isLoading,
      refreshFirstPage: loadComments,
      loadMore: vi.fn(),
    };
  },
}));

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

beforeEach(() => {
  addNotification.mockReset();
  commentsState.value = [];
  createCommentMutate.mockReset().mockResolvedValue(undefined);
  deleteCommentMutate.mockReset().mockResolvedValue(undefined);
  hasInitialError.value = false;
  isInitialReady.value = true;
  isLoading.value = false;
  loadComments.mockReset().mockResolvedValue(undefined);
  useComments.mockReset();
});

test("keeps creation disabled and suppresses empty while initial comments are unsettled", async () => {
  isInitialReady.value = false;
  const wrapper = await mountSuspended(Comments, {
    props: { discussionId: "discussion-1" },
  });
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByRole("button", { name: /create comment/i }).hasAttribute("disabled")).toBe(true);
});

test("recovers an initial comments failure through the existing read owner", async () => {
  const retrySettlement = deferred();
  loadComments.mockImplementationOnce(() => retrySettlement.promise);
  hasInitialError.value = true;
  isInitialReady.value = false;
  const wrapper = await mountSuspended(Comments, {
    props: { discussionId: "discussion-1" },
  });
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByRole("button", { name: /create comment/i }).hasAttribute("disabled")).toBe(true);
  await userEvent.click(screen.getByRole("button", { name: "Retry comments" }));

  expect(loadComments).toHaveBeenCalledWith();
  expect(screen.getByRole("button", { name: "Retry comments" }).hasAttribute("disabled")).toBe(true);

  retrySettlement.resolve();

  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Retry comments" }).hasAttribute("disabled")).toBe(false);
  });
  expect(screen.getByRole("button", { name: /create comment/i }).hasAttribute("disabled")).toBe(true);
});

test("keeps creation enabled during a later comments refresh", async () => {
  isLoading.value = true;
  const wrapper = await mountSuspended(Comments, {
    props: { discussionId: "discussion-1" },
  });
  const screen = within(wrapper.element as HTMLElement);

  expect(screen.getByRole("button", { name: /create comment/i }).hasAttribute("disabled")).toBe(false);
});

test("discards an open creation draft when discussion identity changes", async () => {
  const wrapper = await mountSuspended(Comments, {
    props: { discussionId: "discussion-1" },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create comment/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/body/i), "Draft for discussion one");

  await wrapper.setProps({ discussionId: "discussion-2" });

  await waitFor(() => expect(bodyScreen.queryByLabelText(/body/i)).toBeNull());
  await userEvent.click(screen.getByRole("button", { name: /create comment/i }));
  const freshBody = await bodyScreen.findByLabelText(/body/i) as HTMLTextAreaElement;
  expect(freshBody.value).toBe("");
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("wires one accumulated-state owner through create refresh", async () => {
  const refreshSettlement = deferred();
  loadComments.mockImplementationOnce(() => refreshSettlement.promise);
  const wrapper = await mountSuspended(Comments, {
    props: { discussionId: "discussion-1" },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  expect(useComments).toHaveBeenCalledOnce();
  expect(useComments.mock.calls[0]![0]()).toBe("discussion-1");

  await userEvent.click(screen.getByRole("button", { name: /create comment/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/body/i), "New comment");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(loadComments).toHaveBeenCalledOnce());
  expect(loadComments).toHaveBeenCalledWith();
  expect(bodyScreen.getByLabelText(/body/i)).toBeTruthy();

  refreshSettlement.resolve();

  await waitFor(() => expect(bodyScreen.queryByLabelText(/body/i)).toBeNull());
});

test("wires the owner refresh through CommentsList and real DeleteComment", async () => {
  commentsState.value = [{
    id: "comment-1",
    body: "Existing comment",
    discussionId: "discussion-1",
    authorId: "user-1",
    author: { id: "user-1", firstName: "Ada", lastName: "Lovelace" },
    createdAt: "2026-07-10T00:00:00.000Z",
    updatedAt: "2026-07-10T00:00:00.000Z",
  }];
  const refreshSettlement = deferred();
  loadComments.mockImplementationOnce(() => refreshSettlement.promise);
  const wrapper = await mountSuspended(Comments, {
    props: { discussionId: "discussion-1" },
    global: {
      stubs: {
        Authorization: { template: "<div><slot /></div>" },
        DropdownRoot: { template: "<div><slot /></div>" },
        DropdownTrigger: { template: "<div><slot /></div>" },
        DropdownContent: { template: "<div><slot /></div>" },
        DropdownItem: {
          template: "<button @click=\"$emit('click')\"><slot /></button>",
          emits: ["click"],
        },
      },
    },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);
  await userEvent.click(screen.getByRole("button", { name: /delete comment/i }));
  const deleteButtons = await bodyScreen.findAllByRole("button", { name: /delete comment/i });
  await userEvent.click(deleteButtons[deleteButtons.length - 1]!);

  await waitFor(() => expect(loadComments).toHaveBeenCalledOnce());
  expect(deleteCommentMutate).toHaveBeenCalledWith("comment-1");
  expect(bodyScreen.getByText(/are you sure you want to delete this comment/i)).toBeTruthy();

  refreshSettlement.resolve();

  await waitFor(() => {
    expect(bodyScreen.queryByText(/are you sure you want to delete this comment/i)).toBeNull();
  });
});
