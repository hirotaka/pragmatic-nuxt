import type { Meta, StoryObj } from '@storybook/vue3'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './'

import { Button } from '@/components/ui/button'
import { useDisclosure } from '@/composables/use-disclosure'

const meta: Meta<typeof Drawer> = {
  component: Drawer,
  render: (args) => ({
    components: {
      Button,
      Drawer,
      DrawerClose,
      DrawerContent,
      DrawerDescription,
      DrawerFooter,
      DrawerHeader,
      DrawerTitle,
      DrawerTrigger,
    },
    setup() {
      const { close, open, isOpen } = useDisclosure()

      const hoge = (isOpen: boolean) => {
        console.log(isOpen)
        if (!isOpen) {
          close()
        } else {
          open()
        }
      }

      return { isOpen, hoge, args }
    },
    template: `
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline">Open</Button>
        </DrawerTrigger>
        <DrawerContent class="flex max-w-[800px] flex-col justify-between sm:max-w-[540px]">
          <div class="flex flex-col">
            <DrawerHeader>
              <DrawerTitle>Drawer Header</DrawerTitle>
              <DrawerDescription>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </DrawerDescription>
            </DrawerHeader>
            <div>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button type="submit">Save changes</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    `,
  }),
}

export default meta

type Story = StoryObj<typeof Drawer>

export const Default: Story = {}
