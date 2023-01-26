import type { Meta, StoryFn } from '@storybook/vue3'
import BaseMDPreview from '~/components/base/BaseMDPreview.vue'

export default {
  title: 'Components/Base/BaseMDPreview',
  component: BaseMDPreview,
  parameters: {
    controls: { expanded: true }
  },
  argTypes: {}
} as Meta<typeof BaseMDPreview>

const Template: StoryFn<typeof BaseMDPreview> = (args) => ({
  components: { BaseMDPreview },
  setup() {
    return { args }
  },
  template: '<BaseMDPreview v-bind="args" />'
})

export const Default = Template.bind({})
Default.args = {
  value: `## Hello World`
}
