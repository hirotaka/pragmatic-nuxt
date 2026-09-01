import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import { ref } from "vue";
import CreateDiscussion from "../CreateDiscussion.vue";

const {
  addNotification,
  createDiscussionMutate,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  createDiscussionMutate: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({
    addNotification,
  }),
}));

vi.mock("~discussions/app/queries/discussions", () => ({
  createDiscussionMutation: vi.fn(),
}));

vi.mock("@pinia/colada", () => ({
  useMutation: () => ({
    isLoading: ref(false),
    mutateAsync: createDiscussionMutate,
  }),
  PiniaColadaQueryHooksPlugin: vi.fn(() => ({})),
}));

beforeEach(() => {
  addNotification.mockClear();
  createDiscussionMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
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
  expect(addNotification).toHaveBeenCalledTimes(1);
  expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "Discussion Created",
  });
  await waitFor(() => {
    expect(bodyScreen.queryByRole("dialog", { name: /create discussion/i })).toBeNull();
  });
});

test("CreateDiscussion does not duplicate the API failure and releases drawer controls", async () => {
  createDiscussionMutate.mockRejectedValueOnce(new Error("Create failed"));
  const wrapper = await mountSuspended(CreateDiscussion);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /create discussion/i }));
  await userEvent.type(await bodyScreen.findByLabelText(/title/i), "New discussion");
  await userEvent.type(bodyScreen.getByLabelText(/body/i), "Discussion body");
  await userEvent.click(bodyScreen.getByRole("button", { name: /submit/i }));

  await waitFor(() => {
    expect(bodyScreen.getByRole("button", { name: /submit/i }).hasAttribute("disabled")).toBe(false);
  });
  expect(bodyScreen.queryByRole("alert")).toBeNull();
  const closeButton = bodyScreen.getAllByRole("button", { name: /close/i })[0]!;
  expect(closeButton.hasAttribute("disabled")).toBe(false);

  await userEvent.click(closeButton);

  await waitFor(() => {
    expect(bodyScreen.queryByRole("dialog", { name: /create discussion/i })).toBeNull();
  });
});
