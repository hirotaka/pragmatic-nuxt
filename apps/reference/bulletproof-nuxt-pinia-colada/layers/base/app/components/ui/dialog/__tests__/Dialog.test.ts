import { expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { within, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../index";
import { useDisclosure } from "~base/app/composables/useDisclosure";

const openButtonText = "Open Modal";
const cancelButtonText = "Cancel";
const titleText = "Modal Title";

const TestDialog = defineComponent({
  setup() {
    const { close, open, isOpen } = useDisclosure();

    return () =>
      h(
        DialogRoot,
        {
          "open": isOpen.value,
          "onUpdate:open": (value: boolean) => {
            if (!value) {
              close();
            }
            else {
              open();
            }
          },
        },
        {
          default: () => [
            h(
              DialogTrigger,
              { asChild: true },
              {
                default: () =>
                  h("button", { class: "outline" }, openButtonText),
              },
            ),
            h(
              DialogContent,
              { class: "sm:max-w-[425px]" },
              {
                default: () => [
                  h(DialogHeader, {}, {
                    default: () => [
                      h(DialogTitle, {}, { default: () => titleText }),
                      h(DialogDescription, { class: "sr-only" }, { default: () => "Dialog description" }),
                    ],
                  }),
                  h(DialogFooter, {}, {
                    default: () => [
                      h("button", { type: "submit" }, "Submit"),
                      h(
                        "button",
                        {
                          class: "outline",
                          onClick: close,
                        },
                        cancelButtonText,
                      ),
                    ],
                  }),
                ],
              },
            ),
          ],
        },
      );
  },
});

test("should handle basic dialog flow", async () => {
  const wrapper = await mountSuspended(TestDialog);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  expect(bodyScreen.queryByText(titleText)).toBeFalsy();

  await userEvent.click(screen.getByRole("button", { name: openButtonText }));

  expect(await bodyScreen.findByText(titleText)).toBeTruthy();

  await userEvent.click(bodyScreen.getByRole("button", { name: cancelButtonText }));

  await waitFor(() => expect(bodyScreen.queryByText(titleText)).toBeFalsy());
});
