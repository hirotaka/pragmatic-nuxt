import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import CreateComment from "#layers/comments/app/components/CreateComment.vue";
import DeleteComment from "#layers/comments/app/components/DeleteComment.vue";
import CreateDiscussion from "../CreateDiscussion.vue";
import CreateDiscussionForm from "../CreateDiscussionForm.vue";
import DeleteDiscussion from "../DeleteDiscussion.vue";
import UpdateDiscussion from "../UpdateDiscussion.vue";

const {
  addNotification,
  createCommentMutate,
  deleteCommentMutate,
  createDiscussionMutate,
  deleteDiscussionMutate,
  updateDiscussionMutate,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  createCommentMutate: vi.fn(),
  deleteCommentMutate: vi.fn(),
  createDiscussionMutate: vi.fn(),
  deleteDiscussionMutate: vi.fn(),
  updateDiscussionMutate: vi.fn(),
}));

vi.mock("#imports", async () => {
  const actual = await vi.importActual("#imports");
  return {
    ...(actual as object),
    refreshNuxtData: vi.fn(),
  };
});

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({
    addNotification,
  }),
}));

vi.mock("#layers/comments/app/composables/useCreateComment", () => ({
  useCreateComment: () => ({
    mutate: createCommentMutate,
    isPending: { value: false },
    isSuccess: { value: false },
    error: { value: null },
  }),
}));

vi.mock("#layers/comments/app/composables/useDeleteComment", () => ({
  useDeleteComment: (options?: { onSuccess?: () => void | Promise<void> }) => ({
    mutate: async (id: string) => {
      deleteCommentMutate(id);
      await options?.onSuccess?.();
    },
    isPending: { value: false },
    isSuccess: { value: false },
    error: { value: null },
  }),
}));

vi.mock("~discussions/app/composables/useCreateDiscussion", () => ({
  useCreateDiscussion: () => ({
    mutate: createDiscussionMutate,
    isPending: { value: false },
    isSuccess: { value: false },
    error: { value: null },
  }),
}));

vi.mock("~discussions/app/composables/useDeleteDiscussion", () => ({
  useDeleteDiscussion: (options?: { onSuccess?: () => void | Promise<void> }) => ({
    mutate: async (id: string) => {
      deleteDiscussionMutate(id);
      await options?.onSuccess?.();
    },
    isPending: { value: false },
    isSuccess: { value: false },
    error: { value: null },
  }),
}));

vi.mock("~discussions/app/composables/useDiscussion", () => ({
  useDiscussion: () => ({
    data: {
      value: {
        discussion: {
          id: "discussion-1",
          title: "Existing title",
          body: "Existing body",
        },
      },
    },
  }),
}));

vi.mock("~discussions/app/composables/useUpdateDiscussion", () => ({
  useUpdateDiscussion: () => ({
    mutate: updateDiscussionMutate,
    isPending: { value: false },
    isSuccess: { value: false },
    error: { value: null },
  }),
}));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({
    isAdmin: { value: true },
  }),
}));

beforeEach(() => {
  addNotification.mockClear();
  createCommentMutate.mockReset().mockResolvedValue({ id: "comment-1" });
  deleteCommentMutate.mockReset().mockResolvedValue({ id: "comment-1" });
  createDiscussionMutate.mockReset().mockResolvedValue({ id: "discussion-1" });
  deleteDiscussionMutate.mockReset().mockResolvedValue({ id: "discussion-1" });
  updateDiscussionMutate.mockReset().mockResolvedValue({ id: "discussion-1" });
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

function getInputValue(element: HTMLElement) {
  return (element as HTMLInputElement | HTMLTextAreaElement).value;
}

test("CreateComment submits body with the current discussion id", async () => {
  const wrapper = await mountSuspended(CreateComment, {
    props: { discussionId: "discussion-1" },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create comment/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/body/i), "New comment");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(createCommentMutate).toHaveBeenCalledWith({
    body: "New comment",
    discussionId: "discussion-1",
  }));
});

test("CreateDiscussion blocks invalid submit and sends a valid payload", async () => {
  const wrapper = await mountSuspended(CreateDiscussion);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create discussion/i }));
  await userEvent.click(await bodyScreen.findByRole("button", { name: /submit/i }));

  await bodyScreen.findAllByText(/required/i);
  expect(createDiscussionMutate).toHaveBeenCalledTimes(0);

  await userEvent.type(bodyScreen.getByLabelText(/title/i), "New discussion");
  await userEvent.type(bodyScreen.getByLabelText(/body/i), "Discussion body");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(createDiscussionMutate).toHaveBeenCalledWith({
    title: "New discussion",
    body: "Discussion body",
  }));
});

test("CreateDiscussionForm submits payload from inline fields", async () => {
  const wrapper = await mountSuspended(CreateDiscussionForm);
  const screen = within(wrapper.element as HTMLElement);

  await fireEvent.update(screen.getByPlaceholderText(/enter discussion title/i), "Inline discussion");
  await fireEvent.update(screen.getByPlaceholderText(/enter discussion body/i), "Inline body");
  await fireEvent.submit(wrapper.element.querySelector("form") as HTMLFormElement);

  await waitFor(() => expect(createDiscussionMutate).toHaveBeenCalledWith({
    title: "Inline discussion",
    body: "Inline body",
  }));
});

test("UpdateDiscussion preloads current values and submits changed data", async () => {
  const wrapper = await mountSuspended(UpdateDiscussion, {
    props: { discussionId: "discussion-1" },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /update discussion/i }));

  const title = await bodyScreen.findByLabelText(/title/i);
  expect(getInputValue(title)).toBe("Existing title");
  expect(getInputValue(bodyScreen.getByLabelText(/body/i))).toBe("Existing body");

  await userEvent.clear(title);
  await userEvent.type(title, "Updated title");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(updateDiscussionMutate).toHaveBeenCalledWith({
    id: "discussion-1",
    data: {
      title: "Updated title",
      body: "Existing body",
    },
  }));
});

test("DeleteDiscussion confirms destructive action and deletes the discussion", async () => {
  const wrapper = await mountSuspended(DeleteDiscussion, {
    props: { id: "discussion-1" },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /delete discussion/i }));
  expect(await bodyScreen.findByText(/are you sure you want to delete this discussion/i)).toBeTruthy();

  const buttons = bodyScreen.getAllByRole("button", { name: /delete discussion/i });
  await userEvent.click(buttons[buttons.length - 1]!);

  await waitFor(() => expect(deleteDiscussionMutate).toHaveBeenCalledWith("discussion-1"));
  expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "Discussion Deleted",
  });
});

test("DeleteComment confirms destructive action, deletes the comment, and emits deleted", async () => {
  const wrapper = await mountSuspended(DeleteComment, {
    props: { commentId: "comment-1" },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /delete comment/i }));
  expect(await bodyScreen.findByText(/are you sure you want to delete this comment/i)).toBeTruthy();

  const buttons = bodyScreen.getAllByRole("button", { name: /delete comment/i });
  await userEvent.click(buttons[buttons.length - 1]!);

  await waitFor(() => expect(deleteCommentMutate).toHaveBeenCalledWith("comment-1"));
  expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "Comment Deleted",
  });
  expect(wrapper.emitted("deleted")).toHaveLength(1);
});
