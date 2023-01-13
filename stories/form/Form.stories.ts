import type { Meta, StoryFn } from "@storybook/vue3";

import MyForm from "./MyForm.vue";
import FormDrawer from "@/components/form/FormDrawer.vue";
import BaseButton from "@/components/Base/BaseButton.vue";

export default {
  title: "Components/Form",
  component: MyForm,
  parameters: {
    controls: { expanded: true },
  },
  argTypes: {},
} as Meta<typeof MyForm>;

const Template: StoryFn<typeof MyForm> = (args) => ({
  components: { MyForm },
  setup() {
    return { args };
  },
  template: '<MyForm v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {};

const AsFormDrawerTemplate: StoryFn<typeof MyForm> = (args) => ({
  components: { FormDrawer, MyForm, BaseButton },
  setup() {
    return { args };
  },
  template: `
    <FormDrawer
      title="My Form"
      size="lg"
      :isDone="true"
    >
      <template #triggerButton>
        <BaseButton>
          Open
        </BaseButton>
      </template>
      <MyForm hiddenSubmit />
      <template #submitButton>
        <BaseButton form="my-form" type="submit">
          Submit
        </BaseButton>
      </template>
    </FormDrawer>
  `,
});

export const AsFormDrawer = AsFormDrawerTemplate.bind({});
AsFormDrawer.args = {};
