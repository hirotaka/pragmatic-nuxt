import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import { Button } from '../button'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './'

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  render: (args) => ({
    components: {
      Button,
      Dialog,
      DialogContent,
      DialogDescription,
      DialogFooter,
      DialogHeader,
      DialogTitle,
      DialogTrigger,
    },
    setup() {
      const isOpen = ref(false)
      return { args, isOpen }
    },
    template: `
      <Dialog v-model:open="isOpen">
        <DialogTrigger as-child>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Lorem ipsum</DialogDescription>
          </DialogHeader>
          <div class="grid gap-4 py-4">Lorem ipsum</div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
            <Button variant="outline" @click="isOpen = false">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
  }),
}

export default meta

type Story = StoryObj<typeof Dialog>

export const Demo: Story = {}
