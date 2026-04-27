import { test, expect } from 'vitest'
import { defineComponent } from 'vue'

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../'

import { Button } from '@/components/ui/button'
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils'

const openButtonText = 'Open Drawer'
const titleText = 'Drawer Title'
const cancelButtonText = 'Cancel'
const drawerContentText = 'Hello From Drawer'

const TestDrawer = defineComponent({
  name: 'TestDrawer',
  components: {
    UIButton: Button,
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  },
  setup() {
    return {
      openButtonText,
      titleText,
      cancelButtonText,
      drawerContentText,
    }
  },
  template: `
    <Drawer>
      <DrawerTrigger as-child>
        <UIButton variant="outline">{{ openButtonText }}</UIButton>
      </DrawerTrigger>
      <DrawerContent class="flex max-w-[800px] flex-col justify-between sm:max-w-[540px]">
        <div class="flex flex-col">
          <DrawerHeader>
            <DrawerTitle>{{ titleText }}</DrawerTitle>
          </DrawerHeader>
          <div>{{ drawerContentText }}</div>
        </div>
        <DrawerFooter>
          <DrawerClose as-child>
            <UIButton value="outline" type="submit">
              {{ cancelButtonText }}
            </UIButton>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  `,
})

test('should handle basic drawer flow', async () => {
  rtlRender(TestDrawer)

  expect(screen.queryByText(titleText)).not.toBeInTheDocument()

  await userEvent.click(
    screen.getByRole('button', {
      name: openButtonText,
    }),
  )

  expect(await screen.findByText(titleText)).toBeInTheDocument()

  await userEvent.click(
    screen.getByRole('button', {
      name: cancelButtonText,
    }),
  )

  await waitFor(() => expect(screen.queryByText(titleText)).not.toBeInTheDocument())
})
