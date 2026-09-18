import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import Comments from "../Comments.vue";

const {
  createCommentMutate,
  refreshAfterCreate,
  useComments,
} = vi.hoisted(() => ({
  createCommentMutate: vi.fn(),
  refreshAfterCreate: vi.fn(),
  useComments: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification: vi.fn() }),
}));

vi.mock("~comments/app/composables/useCreateComment", () => ({
  useCreateComment: () => createCommentMutate,
}));

vi.mock("~comments/app/composables/useComments", () => ({
  useComments: (discussionId: () => string) => {
    useComments(discussionId);
    return { refreshAfterCreate };
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
  createCommentMutate.mockReset().mockResolvedValue(undefined);
  refreshAfterCreate.mockReset().mockResolvedValue(undefined);
  useComments.mockReset();
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const mountComments = (discussionId = "discussion-1") => mountSuspended(Comments, {
  props: { discussionId },
  global: {
    stubs: {
      CommentsList: {
        name: "CommentsList",
        props: ["discussionId"],
        template: "<div data-testid='comments-list' />",
      },
    },
  },
});

test("renders the list as the comments data owner", async () => {
  const wrapper = await mountComments();
  const list = wrapper.findComponent({ name: "CommentsList" });

  expect(list.props("discussionId")).toBe("discussion-1");
  expect(useComments).toHaveBeenCalledOnce();
  expect(useComments.mock.calls[0]![0]()).toBe("discussion-1");
});

test("discards an open creation draft when discussion identity changes", async () => {
  const wrapper = await mountComments();
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

test("settles creation before closing the drawer", async () => {
  const refreshSettlement = deferred();
  refreshAfterCreate.mockReturnValueOnce(refreshSettlement.promise);
  const wrapper = await mountComments();
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create comment/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/body/i), "New comment");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => expect(refreshAfterCreate).toHaveBeenCalledOnce());
  expect(bodyScreen.getByLabelText(/body/i)).toBeTruthy();

  refreshSettlement.resolve();

  await waitFor(() => expect(bodyScreen.queryByLabelText(/body/i)).toBeNull());
});
