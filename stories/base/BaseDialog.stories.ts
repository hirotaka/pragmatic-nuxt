import type { Meta, StoryFn } from '@storybook/vue3'

import BaseDialog, { BaseDialogTitle } from '~/components/base/BaseDialog.vue'
import BaseButton from '~/components/base/BaseButton.vue'

import { useDisclosure } from '~/composables/useDisclosure'

export default {
  title: 'Components/Base/BaseDialog',
  component: BaseDialog,
  parameters: {
    controls: { expanded: true }
  }
} as Meta<typeof BaseDialog>

const Template: StoryFn<typeof BaseDialog> = (args) => ({
  components: { BaseDialog, BaseDialogTitle, BaseButton },
  setup() {
    const { open, close, isOpen } = useDisclosure()

    return { open, close, isOpen, args }
  },
  template: `
    <BaseButton @click="open">
      Open Modal
    </BaseButton>
    <BaseDialog
      @close="close"
      :isOpen="isOpen"
      :initialFocus="cancelButtonRef"
    >
      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <BaseDialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900">
            Modal Title
          </BaseDialogTitle>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <BaseButton
            type="button"
            variant="inverse"
            @click="close"
            ref="cancelButtonRef"
          >
            Cancel
          </BaseButton>
        </div>
      </div>
    </BaseDialog>
  `
})

export const Default = Template.bind({})
