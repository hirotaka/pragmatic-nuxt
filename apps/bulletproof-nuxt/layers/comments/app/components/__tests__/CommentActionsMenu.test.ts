import { afterEach, expect, test } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import CommentActionsMenu from "../CommentActionsMenu.vue";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("closes its menu when the delete dialog opens", async () => {
  const wrapper = await mountSuspended(CommentActionsMenu, {
    props: {
      actionLabel: "Open comment actions",
      commentId: "comment-1",
    },
  });
  const componentScreen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);
  const trigger = componentScreen.getByRole("button", {
    name: "Open comment actions",
  });

  await userEvent.click(trigger);
  await userEvent.click(await bodyScreen.findByRole("menuitem", { name: /delete comment/i }));

  const dialog = await bodyScreen.findByRole("alertdialog", { name: /delete comment/i });
  expect(dialog).toBeTruthy();
  await waitFor(() => {
    expect(bodyScreen.getByRole("menu", { hidden: true }).getAttribute("data-state")).toBe("closed");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  await userEvent.click(within(dialog).getByRole("button", { name: /cancel/i }));
  await waitFor(() => expect(bodyScreen.queryByRole("alertdialog", { name: /delete comment/i })).toBeNull());
  expect(bodyScreen.getByRole("menu", { hidden: true }).getAttribute("data-state")).toBe("closed");
});
