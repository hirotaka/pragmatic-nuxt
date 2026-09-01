import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import CreateComment from "../CreateComment.vue";

const { addNotification, mutateAsync } = vi.hoisted(() => ({ addNotification: vi.fn(), mutateAsync: vi.fn() }));
vi.mock("#layers/base/app/composables/useNotifications", () => ({ useNotifications: () => ({ addNotification }) }));
vi.mock("~comments/app/queries/comments", () => ({ createCommentMutation: vi.fn() }));
vi.mock("@pinia/colada", () => ({
  useMutation: () => ({ isLoading: false, mutateAsync }),
  PiniaColadaQueryHooksPlugin: vi.fn(() => ({})),
}));

beforeEach(() => {
  addNotification.mockReset();
  mutateAsync.mockReset().mockResolvedValue(undefined);
});
afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("completes at write success without waiting for refresh", async () => {
  const wrapper = await mountSuspended(CreateComment, { props: { discussionId: "discussion-1" } });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);
  await screen.getByRole("button", { name: /create comment/i }).click();
  await userEvent.type(await bodyScreen.findByLabelText(/body/i), "New comment");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));
  await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ body: "New comment", discussionId: "discussion-1" }));
  expect(addNotification).toHaveBeenCalledWith({ type: "success", title: "Comment Created" });
  await waitFor(() => expect(bodyScreen.queryByLabelText(/body/i)).toBeNull());
});

test("keeps the draft available after mutation failure", async () => {
  mutateAsync.mockRejectedValueOnce(new Error("Create failed"));
  const wrapper = await mountSuspended(CreateComment, { props: { discussionId: "discussion-1" } });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);
  await screen.getByRole("button", { name: /create comment/i }).click();
  await userEvent.type(await bodyScreen.findByLabelText(/body/i), "Retry comment");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));
  await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce());
  expect(bodyScreen.getByLabelText(/body/i)).toBeTruthy();
});

test("prevents creation while comments are unavailable", async () => {
  const wrapper = await mountSuspended(CreateComment, { props: { disabled: true, discussionId: "discussion-1" } });
  expect(within(wrapper.element as HTMLElement).getByRole("button", { name: /create comment/i }).hasAttribute("disabled")).toBe(true);
});
