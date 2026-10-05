import { afterEach, expect, test } from "vitest";
import { cleanup, waitFor, within } from "@testing-library/vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import userEvent from "@testing-library/user-event";
import { h } from "vue";
import FormDrawer from "../FormDrawer.vue";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

test("FormDrawer opens and closes with the Sheet slot while rendering presentation slots", async () => {
  const wrapper = await mountSuspended(FormDrawer, {
    props: { title: "Create Item" },
    slots: {
      triggerButton: "<button>Open drawer</button>",
      default: ({ close }: { close: () => void }) => h("div", [
        h("span", "Drawer body"),
        h("button", { type: "button", onClick: close }, "Finish"),
      ]),
      submitButton: "<button type='submit'>Submit drawer</button>",
    },
  });
  const bodyScreen = within(document.body);
  const trigger = within(wrapper.element as HTMLElement).getByRole("button", { name: "Open drawer" });

  await userEvent.click(trigger);
  const drawer = await bodyScreen.findByRole("dialog", { name: "Create Item" });
  expect(within(drawer).getByText("Drawer body")).toBeDefined();
  expect(within(drawer).getByRole("button", { name: "Submit drawer" })).toBeDefined();
  expect(drawer.classList.contains("justify-between")).toBe(false);
  const body = drawer.querySelector("[data-slot='form-drawer-body']");
  expect(body).not.toBeNull();
  expect(Array.from(body?.classList ?? [])).toEqual(
    expect.arrayContaining(["grid", "flex-1", "auto-rows-min", "px-4"]),
  );

  await userEvent.click(within(drawer).getByRole("button", { name: "Finish" }));
  await waitFor(() => expect(bodyScreen.queryByRole("dialog", { name: "Create Item" })).toBeNull());

  await userEvent.click(trigger);
  const reopened = await bodyScreen.findByRole("dialog", { name: "Create Item" });
  const footer = reopened.querySelector("[data-slot='sheet-footer']");
  expect(footer).not.toBeNull();
  await userEvent.click(within(footer as HTMLElement).getByRole("button", { name: "Close" }));
  await waitFor(() => expect(bodyScreen.queryByRole("dialog", { name: "Create Item" })).toBeNull());
});
