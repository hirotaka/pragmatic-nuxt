import type { Meta, StoryFn } from "@storybook/vue3";
import BaseButton, { variants, sizes } from "@/components/base/BaseButton.vue";

export default {
  title: "Components/Base/BaseButton",
  component: BaseButton,
  parameters: {
    controls: { expanded: true },
  },
  argTypes: {
    default: {
      control: { type: "text" },
    },
    variant: {
      control: { type: "radio" },
      options: Object.keys(variants),
    },
    size: {
      control: { type: "radio" },
      options: Object.keys(sizes),
    },
    isLoading: {
      control: { type: "boolean" },
    },
  },
} as Meta<typeof BaseButton>;

const Template: StoryFn<typeof BaseButton> = (args) => ({
  components: { BaseButton },
  setup() {
    return { args };
  },
  template: '<BaseButton v-bind="args">{{ args.default }}</BaseButton>',
});

export const Primary = Template.bind({});
Primary.args = {
  default: "Primary Button",
  variant: "primary",
};

export const Inverse = Template.bind({});
Inverse.args = {
  default: "Inverse Button",
  variant: "inverse",
};

export const Danger = Template.bind({});
Danger.args = {
  default: "Danger Button",
  variant: "danger",
};
