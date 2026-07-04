import { afterEach, expect, test, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { cleanup, waitFor, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import Form from "@/components/form/Form.vue";
import FormDrawer from "../FormDrawer.vue";
import Button from "../Button.vue";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

function getCloseButton(container: ReturnType<typeof within>) {
  const button = container.getAllByRole("button", { name: /^close$/i })[0];
  if (!button) throw new Error("Expected drawer close button to exist");
  return button;
}

const TestFormDrawer = defineComponent({
  props: {
    onSubmit: {
      type: Function,
      required: true,
    },
  },
  setup(props: { onSubmit: () => void }) {
    const isDone = ref(false);

    return () =>
      h(
        FormDrawer,
        {
          isDone: isDone.value,
          title: "Update Profile",
        },
        {
          triggerButton: () => h(Button, { size: "sm" }, { default: () => "Open drawer" }),
          default: () => h(
            Form,
            {
              id: "drawer-form",
              state: {},
              validate: () => [],
              onSubmit: () => props.onSubmit(),
            },
            { default: () => h("p", "Drawer form content") },
          ),
          submitButton: () => h(Button, { type: "submit", form: "drawer-form" }, { default: () => "Submit drawer" }),
        },
      );
  },
});

test("FormDrawer supports close without submitting and external submit by form id", async () => {
  const handleSubmit = vi.fn();
  const wrapper = await mountSuspended(TestFormDrawer, {
    props: { onSubmit: handleSubmit },
  });
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /open drawer/i }));
  expect(await bodyScreen.findByText(/drawer form content/i)).toBeTruthy();

  await userEvent.click(getCloseButton(bodyScreen));
  await waitFor(() => expect(bodyScreen.queryByText(/drawer form content/i)).toBeFalsy());
  expect(handleSubmit).toHaveBeenCalledTimes(0);

  await userEvent.click(screen.getByRole("button", { name: /open drawer/i }));
  await userEvent.click(await bodyScreen.findByRole("button", { name: /submit drawer/i }));

  await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
});

test("FormDrawer closes when isDone becomes true", async () => {
  const TestDoneDrawer = defineComponent({
    setup() {
      const isDone = ref(false);

      return () =>
        h("div", [
          h(Button, { onClick: () => { isDone.value = true; } }, { default: () => "Mark done" }),
          h(
            FormDrawer,
            {
              isDone: isDone.value,
              title: "Done Drawer",
            },
            {
              triggerButton: () => h(Button, {}, { default: () => "Open done drawer" }),
              default: () => h("p", "Done drawer content"),
            },
          ),
        ]);
    },
  });

  const wrapper = await mountSuspended(TestDoneDrawer);
  const screen = within(wrapper.element as HTMLElement);
  const bodyScreen = within(document.body);

  await userEvent.click(screen.getByRole("button", { name: /open done drawer/i }));
  expect(await bodyScreen.findByText(/done drawer content/i)).toBeTruthy();

  await userEvent.click(screen.getByRole("button", { name: /mark done/i }));

  await waitFor(() => expect(bodyScreen.queryByText(/done drawer content/i)).toBeFalsy());
});
