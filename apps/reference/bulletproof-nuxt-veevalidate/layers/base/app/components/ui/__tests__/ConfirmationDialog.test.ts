import { expect, test } from "vitest";
import { h, defineComponent, ref } from "vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { within, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import ConfirmationDialog from "../ConfirmationDialog.vue";
import Button from "../Button.vue";

test("should handle confirmation flow", async () => {
  const titleText = "Are you sure?";
  const bodyText = "Are you sure you want to delete this item?";
  const confirmationButtonText = "Confirm";
  const openButtonText = "Open";

  const TestComponent = defineComponent({
    setup() {
      const isOpen = ref(false);
      return () =>
        h(
          ConfirmationDialog,
          {
            "open": isOpen.value,
            "onUpdate:open": (value: boolean) => {
              isOpen.value = value;
            },
            "variant": "danger",
            "title": titleText,
            "body": bodyText,
            "confirmText": confirmationButtonText,
          },
          {
            triggerButton: () => h(Button, {}, { default: () => openButtonText }),
          },
        );
    },
  });

  const wrapper = await mountSuspended(TestComponent);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  expect(bodyScreen.queryByText(titleText)).toBeFalsy();

  await userEvent.click(screen.getByRole("button", { name: openButtonText }));

  expect(await bodyScreen.findByText(titleText)).toBeTruthy();

  expect(bodyScreen.getByText(bodyText)).toBeTruthy();

  await userEvent.click(bodyScreen.getByRole("button", { name: "Cancel" }));

  await waitFor(() => expect(bodyScreen.queryByText(titleText)).toBeFalsy());

  expect(bodyScreen.queryByText(bodyText)).toBeFalsy();
});
