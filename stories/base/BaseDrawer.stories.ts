import type { Meta, StoryFn } from '@storybook/vue3'

import BaseButton from '~/components/base/BaseButton.vue'
import BaseDrawer from '~/components/base/BaseDrawer.vue'

import { useDisclosure } from '~/composables/useDisclosure'

export default {
  title: 'Components/Base/BaseDrawer',
  component: BaseDrawer,
  parameters: {
    controls: { expanded: true }
  },
  argTypes: {}
} as Meta<typeof BaseDrawer>

const Template: StoryFn<typeof BaseDrawer> = (args) => ({
  components: { BaseDrawer, BaseButton },
  setup() {
    const { close, open, isOpen } = useDisclosure()

    return { close, open, isOpen, args }
  },
  template: `
    <BaseButton @click="open">Open Drawer</BaseButton>
    <BaseDrawer
      @close="close"
      :isOpen="isOpen"
      title="Sample Drawer"
      size="md"
    >
      Hello
      <template #footer>
        <BaseButton variant="inverse" size="sm" @click="close">
          Cancel
        </BaseButton>
      </template>
    </BaseDrawer>
  `
})

export const Demo = Template.bind({})
