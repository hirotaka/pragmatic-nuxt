import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import { ref } from "vue";
import UpdateDiscussion from "../UpdateDiscussion.vue";

const {
  addNotification,
  discussionData,
  updateDiscussionMutate,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  discussionData: {
    id: "discussion-1",
    title: "Existing title",
    body: "Existing body",
    authorId: "user-1",
    teamId: "team-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    author: {
      id: "user-1",
      firstName: "Test",
      lastName: "User",
    },
  },
  updateDiscussionMutate: vi.fn(),
}));

vi.mock("#layers/base/app/composables/useNotifications", () => ({
  useNotifications: () => ({
    addNotification,
  }),
}));

vi.mock("~discussions/app/queries/discussions", () => ({
  discussionDetailQuery: (input: unknown) => input,
  updateDiscussionMutation: () => ({}),
}));

vi.mock("@pinia/colada", async importOriginal => ({
  ...await importOriginal<typeof import("@pinia/colada")>(),
  useQuery: () => ({
    data: ref(discussionData),
  }),
  useMutation: () => {
    const status = ref("idle");

    return {
      isLoading: ref(false),
      mutateAsync: async (variables: unknown) => {
        try {
          const result = await updateDiscussionMutate(variables);
          status.value = "success";
          return result;
        }
        catch (error) {
          status.value = "error";
          throw error;
        }
      },
      status,
    };
  },
}));

vi.mock("#layers/auth/app/composables/useUser", () => ({
  useUser: () => ({
    isAdmin: { value: true },
  }),
}));

beforeEach(() => {
  addNotification.mockClear();
  discussionData.title = "Existing title";
  discussionData.body = "Existing body";
  updateDiscussionMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

function getInputValue(element: HTMLElement) {
  return (element as HTMLInputElement | HTMLTextAreaElement).value;
}

test("UpdateDiscussion preloads current values and submits changed data", async () => {
  const wrapper = await mountSuspended(UpdateDiscussion, {
    props: { discussionId: discussionData.id },
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
  expect(addNotification).toHaveBeenCalledTimes(1);
  expect(addNotification).toHaveBeenCalledWith({
    type: "success",
    title: "Discussion Updated",
  });
  await waitFor(() => {
    expect(bodyScreen.queryByRole("dialog", { name: /update discussion/i })).toBeNull();
  });
});

test("UpdateDiscussion completes when the write succeeds without waiting for read synchronization", async () => {
  const wrapper = await mountSuspended(UpdateDiscussion, {
    props: { discussionId: discussionData.id },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /update discussion/i }));
  await userEvent.click(await bodyScreen.findByRole("button", { name: /submit/i }));

  expect(updateDiscussionMutate).toHaveBeenCalledTimes(1);
  expect(addNotification.mock.calls).toEqual([
    [{ type: "success", title: "Discussion Updated" }],
  ]);
  await waitFor(() => {
    expect(bodyScreen.queryByRole("dialog", { name: /update discussion/i })).toBeNull();
  });
});

test("UpdateDiscussion does not duplicate the API failure or continue success processing", async () => {
  updateDiscussionMutate.mockRejectedValueOnce(new Error("Update failed"));
  const wrapper = await mountSuspended(UpdateDiscussion, {
    props: { discussionId: discussionData.id },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /update discussion/i }));
  await userEvent.click(await bodyScreen.findByRole("button", { name: /submit/i }));

  await waitFor(() => {
    expect(bodyScreen.getByRole("button", { name: /submit/i }).hasAttribute("disabled")).toBe(false);
  });
  expect(addNotification).not.toHaveBeenCalled();
  expect(bodyScreen.queryByRole("alert")).toBeNull();
  const closeButton = bodyScreen.getAllByRole("button", { name: /close/i })[0]!;
  expect(closeButton.hasAttribute("disabled")).toBe(false);

  await userEvent.click(closeButton);

  await waitFor(() => {
    expect(bodyScreen.queryByRole("dialog", { name: /update discussion/i })).toBeNull();
  });
});
