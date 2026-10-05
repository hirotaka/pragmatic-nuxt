import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import DiscussionActionsMenu from "../DiscussionActionsMenu.vue";

const {
  addNotification,
  deleteDiscussionMutate,
  discussion,
} = vi.hoisted(() => ({
  addNotification: vi.fn(),
  deleteDiscussionMutate: vi.fn(),
  discussion: {
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
}));

vi.mock("vue-sonner", () => ({
  toast: { success: addNotification },
}));

mockNuxtImport("useDeleteDiscussion", () => () => async (id: string) => deleteDiscussionMutate(id));

async function confirmDelete() {
  const wrapper = await mountSuspended(DiscussionActionsMenu, {
    props: {
      actionLabel: "Open discussion actions",
      discussion,
    },
  });
  const componentScreen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(componentScreen.getByRole("button", { name: "Open discussion actions" }));
  await userEvent.click(await bodyScreen.findByRole("menuitem", { name: /delete discussion/i }));
  const dialog = await bodyScreen.findByRole("alertdialog", { name: /delete discussion/i });
  await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

  return { bodyScreen, wrapper };
}

beforeEach(() => {
  addNotification.mockReset();
  deleteDiscussionMutate.mockReset().mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("reports successful deletion after its action dropdown closes", async () => {
  const { bodyScreen, wrapper } = await confirmDelete();

  await waitFor(() => expect(wrapper.emitted("success")).toHaveLength(1));
  expect(deleteDiscussionMutate).toHaveBeenCalledWith("discussion-1");
  expect(addNotification).toHaveBeenCalledWith("Discussion Deleted");
  await waitFor(() => {
    expect(bodyScreen.queryByRole("alertdialog", { name: /delete discussion/i })).toBeNull();
  });
  expect(bodyScreen.getByRole("menu", { hidden: true }).getAttribute("data-state")).toBe("closed");
});

test("releases dialog controls and stays open when mutation fails", async () => {
  deleteDiscussionMutate.mockRejectedValueOnce(new Error("Delete failed"));
  const { bodyScreen, wrapper } = await confirmDelete();

  await waitFor(() => expect(deleteDiscussionMutate).toHaveBeenCalledOnce());
  expect(addNotification).not.toHaveBeenCalled();
  expect(wrapper.emitted("success")).toBeUndefined();
  const dialog = bodyScreen.getByRole("alertdialog", { name: /delete discussion/i });
  expect(within(dialog).getByRole("button", { name: "Delete" }).hasAttribute("disabled")).toBe(false);
  expect(within(dialog).getByRole("button", { name: /cancel/i }).hasAttribute("disabled")).toBe(false);
  await userEvent.click(within(dialog).getByRole("button", { name: /cancel/i }));
  await waitFor(() => expect(bodyScreen.queryByRole("alertdialog", { name: /delete discussion/i })).toBeNull());
});

test("keeps the alert dialog open and its controls disabled while deletion is pending", async () => {
  let finishDeletion!: () => void;
  deleteDiscussionMutate.mockImplementationOnce(() => new Promise<void>((resolve) => {
    finishDeletion = resolve;
  }));
  const { bodyScreen, wrapper } = await confirmDelete();
  const dialog = bodyScreen.getByRole("alertdialog", { name: /delete discussion/i });

  await waitFor(() => {
    const deleteButton = within(dialog).getByRole("button", { name: "Delete" });
    expect(deleteButton.hasAttribute("disabled")).toBe(true);
    expect(deleteButton.getAttribute("aria-busy")).toBe("true");
    expect(within(dialog).getByRole("button", { name: /cancel/i }).hasAttribute("disabled")).toBe(true);
  });
  await userEvent.keyboard("{Escape}");
  expect(dialog.getAttribute("data-state")).toBe("open");
  expect(wrapper.emitted("success")).toBeUndefined();

  finishDeletion();
  await waitFor(() => expect(wrapper.emitted("success")).toHaveLength(1));
  await waitFor(() => expect(bodyScreen.queryByRole("alertdialog", { name: /delete discussion/i })).toBeNull());
});
