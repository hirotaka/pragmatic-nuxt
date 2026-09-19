import { afterEach, expect, test } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import DiscussionActionsMenu from "../DiscussionActionsMenu.vue";

const discussion = {
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
};

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("closes its menu when the delete dialog opens", async () => {
  const wrapper = await mountSuspended(DiscussionActionsMenu, {
    props: {
      actionLabel: "Open discussion actions",
      discussion,
    },
  });
  const componentScreen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);
  const trigger = componentScreen.getByRole("button", {
    name: "Open discussion actions",
  });

  await userEvent.click(trigger);
  await userEvent.click(await componentScreen.findByRole("menuitem", { name: /delete discussion/i }));

  const dialog = await bodyScreen.findByRole("dialog", { name: /delete discussion/i });
  expect(dialog).toBeTruthy();
  await waitFor(() => {
    expect(componentScreen.getByRole("menu").getAttribute("data-state")).toBe("closed");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  await userEvent.click(within(dialog).getByRole("button", { name: /cancel/i }));
  await waitFor(() => expect(bodyScreen.queryByRole("dialog", { name: /delete discussion/i })).toBeNull());
  expect(componentScreen.getByRole("menu").getAttribute("data-state")).toBe("closed");
});
