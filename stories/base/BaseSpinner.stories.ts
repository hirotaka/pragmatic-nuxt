import type { Meta, StoryFn } from "@storybook/vue3";
import BaseSpinner, {
  baseSpinnerVariants,
  baseSpinnerSizes,
} from "@/components/base/BaseSpinner.vue";

export default {
  title: "Components/Base/BaseSpinner",
  component: BaseSpinner,
  parameters: {
    controls: { expanded: true },
  },
  argTypes: {
    variant: {
      control: { type: "radio" },
      options: Object.keys(baseSpinnerVariants),
    },
    size: {
      control: { type: "radio" },
      options: Object.keys(baseSpinnerSizes),
    },
  },
} as Meta<typeof BaseSpinner>;

const Template: StoryFn<typeof BaseSpinner> = (args) => ({
  components: { BaseSpinner },
  setup() {
    return { args };
  },
  template: '<BaseSpinner v-bind="args" />',
});

export const Default = Template.bind({});
Default.args = {};
