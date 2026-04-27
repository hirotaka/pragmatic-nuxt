import { test, expect } from 'vitest'
import { defineComponent, ref } from 'vue'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../'

import { Button } from '@/components/ui/button'
import { useDisclosure } from '@/composables/use-disclosure'
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils'

const openButtonText = 'Open Modal'
const cancelButtonText = 'Cancel'
const titleText = 'Modal Title'

const TestDialog = defineComponent({
  name: 'TestDialog',
  components: {
    UIButton: Button,
    UIDialog: Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  },
  setup() {
    const { close, open, isOpen } = useDisclosure()
    const cancelButtonRef = ref(null)

    return {
      close,
      open,
      isOpen,
      cancelButtonRef,
      openButtonText,
      cancelButtonText,
      titleText,
    }
  },
  template: `
    <UIDialog
      :open="isOpen"
      @update:open="(value) => {
        if (!value) {
          close()
        } else {
          open()
        }
      }"
    >
      <DialogTrigger as-child>
        <UIButton variant="outline">{{ openButtonText }}</UIButton>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ titleText }}</DialogTitle>
        </DialogHeader>

        <DialogFooter>
          <UIButton type="submit">Submit</UIButton>
          <UIButton :ref="cancelButtonRef" variant="outline" @click="close">
            {{ cancelButtonText }}
          </UIButton>
        </DialogFooter>
      </DialogContent>
    </UIDialog>
  `,
})

test('should handle basic dialog flow', async () => {
  rtlRender(TestDialog)

  expect(screen.queryByText(titleText)).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: openButtonText }))

  expect(await screen.findByText(titleText)).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: cancelButtonText }))

  await waitFor(() => expect(screen.queryByText(titleText)).not.toBeInTheDocument())
})
