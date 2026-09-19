import { afterEach, expect, test } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import UserActionsMenu from "../UserActionsMenu.vue";

const user = {
  id: "user-1",
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Lovelace",
  role: "ADMIN" as const,
  bio: "",
  teamId: "team-1",
  createdAt: "2026-01-01T00:00:00.000Z",
};

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("closes its menu when the delete dialog opens", async () => {
  const wrapper = await mountSuspended(UserActionsMenu, {
    props: {
      actionLabel: "Open user actions",
      user,
    },
  });
  const componentScreen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);
  const trigger = componentScreen.getByRole("button", {
    name: "Open user actions",
  });

  await userEvent.click(trigger);
  await userEvent.click(await componentScreen.findByRole("menuitem", { name: /delete user/i }));

  const dialog = await bodyScreen.findByRole("dialog", { name: /delete user/i });
  expect(dialog).toBeTruthy();
  await waitFor(() => {
    expect(componentScreen.getByRole("menu").getAttribute("data-state")).toBe("closed");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  await userEvent.click(within(dialog).getByRole("button", { name: /cancel/i }));
  await waitFor(() => expect(bodyScreen.queryByRole("dialog", { name: /delete user/i })).toBeNull());
  expect(componentScreen.getByRole("menu").getAttribute("data-state")).toBe("closed");
});
