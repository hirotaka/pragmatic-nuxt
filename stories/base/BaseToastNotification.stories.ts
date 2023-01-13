import BaseToastNotification, {
  icons,
} from "@/components/base/BaseToastNotification.vue";

export default {
  title: "Components/Base/BaseToastNotification",
  component: BaseToastNotification,
  parameters: {
    controls: { expanded: true },
  },
  argTypes: {
    id: {
      control: { type: "text" },
    },
    type: {
      control: { type: "radio" },
      options: Object.keys(icons),
    },
    title: {
      control: { type: "string" },
    },
    message: {
      control: { type: "string" },
    },
    onConfirmed: {},
  },
};

const Template = (args) => ({
  components: { BaseToastNotification },
  setup() {
    return { args };
  },
  template: '<BaseToastNotification v-bind="{ notification: args }" />',
});

export const Info = Template.bind({});
Info.args = {
  id: "1",
  type: "info",
  title: "Hello Info",
  message: "This is info notification",
};
