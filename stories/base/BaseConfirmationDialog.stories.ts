import type { Meta, StoryFn } from "@storybook/vue3";

import BaseConfirmationDialog from "@/components/base/BaseConfirmationDialog.vue";
import BaseButton from "@/components/base/BaseButton.vue";

export default {
  title: "Components/Base/BaseConfirmationDialog",
  component: BaseConfirmationDialog,
  parameters: {
    controls: { expanded: true },
  },
  argTypes: {
    icon: {
      control: "radio",
      options: ["danger", "info"],
    },
    title: {
      control: "text",
    },
    body: {
      control: "text",
    },
  },
} as Meta<typeof BaseConfirmationDialog>;

const Template: StoryFn<typeof BaseConfirmationDialog> = (args) => ({
  components: { BaseConfirmationDialog, BaseButton },
  setup() {
    return { args };
  },
  template: `
    <BaseConfirmationDialog v-bind="args">
      <template #triggerButton>
        <BaseButton>Open</BaseButton>
      </template>
      <template #confirmButton>
        <BaseButton class="bg-red-500">Confirm</BaseButton>
      </template>
    </BaseConfirmationDialog>
  `,
});

export const Danger = Template.bind({});
Danger.args = {
  icon: "danger",
  title: "Confirmation",
  body: "Hello World",
};

const AsInfoTemplate: StoryFn<typeof BseConfirmationDialog> = (args) => ({
  components: { BaseConfirmationDialog, BaseButton },
  setup() {
    return { args };
  },
  template: `
    <BaseConfirmationDialog v-bind="args">
      <template #triggerButton>
        <BaseButton>Open</BaseButton>
      </template>
      <template #confirmButton>
        <BaseButton>Confirm</BaseButton>
      </template>
    </BaseConfirmationDialog>
  `,
});

export const Info = AsInfoTemplate.bind({});
Info.args = {
  icon: "info",
  title: "Confirmation",
  body: "Hello World",
};
