import { render as rtlRender } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { createPinia } from "pinia";
import type { Component } from "vue";
import { createRouter, createMemoryHistory, type RouteRecordRaw } from "vue-router";
import Form from "../layers/base/app/components/ui/Form.vue";
import Input from "../layers/base/app/components/ui/Input.vue";
import Button from "../layers/base/app/components/ui/Button.vue";
import FieldWrapper from "../layers/base/app/components/ui/FieldWrapper.vue";
import Checkbox from "../layers/base/app/components/ui/Checkbox.vue";
import Label from "../layers/base/app/components/ui/Label.vue";
import SimpleSelect from "../layers/base/app/components/ui/SimpleSelect.vue";
import Switch from "../layers/base/app/components/ui/Switch.vue";
import Select from "../layers/base/app/components/ui/Select.vue";

interface RenderOptions {
  url?: string;
  path?: string;
  [key: string]: unknown;
}

export const renderComponent = async (
  ui: Component,
  { url = "/", path = "/", ...renderOptions }: RenderOptions = {},
) => {
  // Create a fresh Pinia instance for each test
  const pinia = createPinia();

  const routes: RouteRecordRaw[] = [
    {
      path: path,
      component: ui,
    },
  ];

  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  });

  if (url) {
    await router.push(url);
  }

  const returnValue = {
    ...rtlRender(ui, {
      global: {
        plugins: [pinia, router],
        components: {
          UiForm: Form,
          UiInput: Input,
          UiButton: Button,
          UiFieldWrapper: FieldWrapper,
          UiCheckbox: Checkbox,
          UiLabel: Label,
          UiSimpleSelect: SimpleSelect,
          UiSwitch: Switch,
          UiSelect: Select,
        },
        stubs: {
          NuxtLink: {
            template: "<a><slot /></a>",
          },
        },
      },
      ...renderOptions,
    }),
    pinia,
    router,
  };

  return returnValue;
};

// Export all from @testing-library/vue except render (we override it)
export {
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
  getByText,
  getByRole,
  queryByText,
  queryByRole,
  findByText,
  findByRole,
} from "@testing-library/vue";
export { userEvent };
