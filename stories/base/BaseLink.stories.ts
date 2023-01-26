import type { Meta, StoryFn } from '@storybook/vue3'
import vueRouter from 'storybook-vue3-router'

import BaseLink from '~/components/base/BaseLink.vue'

export default {
  title: 'Components/Base/BaseLink',
  component: BaseLink,
  parameters: {
    controls: { expanded: true }
  }
} as Meta<typeof BaseLink>

const Template: StoryFn<typeof BaseLink> = (args) => ({
  components: { BaseLink },
  setup() {
    return { args }
  },
  template: `
    <BaseLink to="/">
      Hello
    </BaseLink>
  `
})

export const Default = Template.bind({})
Default.decorators = [vueRouter()]
