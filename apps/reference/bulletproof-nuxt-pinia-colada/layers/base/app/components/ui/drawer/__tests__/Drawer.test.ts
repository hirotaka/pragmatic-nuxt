import { expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { within, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import {
  DrawerRoot,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "../index";
import { useDisclosure } from "~base/app/composables/useDisclosure";
import Button from "~base/app/components/ui/Button.vue";

const openButtonText = "Open Drawer";
const titleText = "Drawer Title";
const cancelButtonText = "Cancel";
const drawerContentText = "Hello From Drawer";

const TestDrawer = defineComponent({
  setup() {
    const { isOpen, open, close } = useDisclosure();

    return () =>
      h(
        DrawerRoot,
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
              DrawerTrigger,
              { asChild: true },
              {
                default: () =>
                  h(Button, { variant: "outline" }, { default: () => openButtonText }),
              },
            ),
            h(
              DrawerContent,
              { class: "flex max-w-[800px] flex-col justify-between sm:max-w-[540px]" },
              {
                default: () => [
                  h("div", { class: "flex flex-col" }, [
                    h(DrawerHeader, {}, {
                      default: () => [
                        h(DrawerTitle, {}, { default: () => titleText }),
                        h(DrawerDescription, { class: "sr-only" }, { default: () => "Drawer description" }),
                      ],
                    }),
                    h("div", {}, drawerContentText),
                  ]),
                  h(DrawerFooter, {}, {
                    default: () =>
                      h(
                        Button,
                        {
                          variant: "outline",
                          type: "submit",
                          onClick: close,
                        },
                        { default: () => cancelButtonText },
                      ),
                  }),
                ],
              },
            ),
          ],
        },
      );
  },
});

test("should handle basic drawer flow", async () => {
  const wrapper = await mountSuspended(TestDrawer);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  expect(bodyScreen.queryByText(titleText)).toBeFalsy();

  await userEvent.click(screen.getByRole("button", { name: openButtonText }));

  expect(await bodyScreen.findByText(titleText)).toBeTruthy();

  await userEvent.click(bodyScreen.getByRole("button", { name: cancelButtonText }));

  await waitFor(() => expect(bodyScreen.queryByText(titleText)).toBeFalsy());
});
