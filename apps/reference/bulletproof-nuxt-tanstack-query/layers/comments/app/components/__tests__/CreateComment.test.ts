import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import CreateComment from "../CreateComment.vue";

const {
  addNotification,
  createCommentMutation,
  invalidateComments,
  mutateAsync,
  mutationPending,
  useMutation,
  useQueryClient,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  createCommentMutation: vi.fn(),
  invalidateComments: vi.fn(),
  mutateAsync: vi.fn(),
  mutationPending: { __v_isRef: true, value: false },
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({ addNotification }),
}));
vi.mock("@tanstack/vue-query", () => ({ useMutation, useQueryClient }));
vi.mock("~comments/app/queries/comments", () => ({ createCommentMutation, invalidateComments }));

beforeEach(() => {
  addNotification.mockReset();
  createCommentMutation.mockReset().mockReturnValue({ mutationKey: ["comments", "create"] });
  invalidateComments.mockReset().mockResolvedValue(undefined);
  mutateAsync.mockReset().mockResolvedValue(undefined);
  mutationPending.value = false;
  useMutation.mockReset().mockReturnValue({ isPending: mutationPending, mutateAsync });
  useQueryClient.mockReset().mockReturnValue({});
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

async function submitComment() {
  const wrapper = await mountSuspended(CreateComment, { props: { discussionId: "discussion-1" } });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create comment/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/body/i), "New comment");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  return bodyScreen;
}

test("settles a native create Mutation before detached discussion-scoped invalidation", async () => {
  const synchronization = new Promise<void>(() => undefined);
  invalidateComments.mockReturnValueOnce(synchronization);
  const bodyScreen = await submitComment();

  await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ body: "New comment", discussionId: "discussion-1" }));
  await waitFor(() => expect(invalidateComments).toHaveBeenCalledWith({}, "discussion-1"));
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Comment Created" });
  await waitFor(() => expect(bodyScreen.queryByRole("dialog", { name: "Create Comment" })).toBeNull());
});

test("ignores a late native Mutation settlement after its discussion scope disposes", async () => {
  let resolveMutation!: () => void;
  mutateAsync.mockImplementationOnce(() => new Promise<void>((resolve) => {
    resolveMutation = resolve;
  }));
  const wrapper = await mountSuspended(CreateComment, { props: { discussionId: "discussion-1" } });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create comment/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/body/i), "Late comment");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));
  await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce());

  wrapper.unmount();
  resolveMutation();
  await Promise.resolve();

  expect(addNotification).not.toHaveBeenCalled();
  expect(invalidateComments).not.toHaveBeenCalled();
});

test("keeps the draft available when the create Mutation fails", async () => {
  mutateAsync.mockRejectedValueOnce(new Error("Create failed"));
  const bodyScreen = await submitComment();

  await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce());
  expect(addNotification).not.toHaveBeenCalled();
  expect(invalidateComments).not.toHaveBeenCalled();
  expect(bodyScreen.getByLabelText(/body/i)).toBeTruthy();
});
