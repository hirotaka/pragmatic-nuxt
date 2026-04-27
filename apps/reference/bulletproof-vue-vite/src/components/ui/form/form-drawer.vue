<script setup lang="ts">
import { watch } from 'vue'

import { Button } from '../button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../drawer'

import { useDisclosure } from '@/composables/use-disclosure'

export type FormDrawerProps = {
  isDone: boolean
  title: string
}

const props = withDefaults(defineProps<FormDrawerProps>(), {
  isDone: false,
})

const { isOpen, open, close } = useDisclosure()

// Close drawer when form submission is done
watch(
  () => props.isDone,
  (newValue) => {
    if (newValue) {
      close()
    }
  },
)
</script>

<template>
  <Drawer :open="isOpen" @update:open="(value: boolean) => (value ? open() : close())">
    <DrawerTrigger as-child>
      <slot name="triggerButton" />
    </DrawerTrigger>
    <DrawerContent class="flex max-w-[800px] flex-col justify-between sm:max-w-[540px]">
      <div class="flex flex-col">
        <DrawerHeader>
          <DrawerTitle>{{ title }}</DrawerTitle>
          <DrawerDescription class="sr-only">{{ title }}</DrawerDescription>
        </DrawerHeader>
        <div>
          <slot />
        </div>
      </div>
      <DrawerFooter>
        <DrawerClose as-child>
          <Button variant="outline" type="button">Close</Button>
        </DrawerClose>
        <slot name="submitButton" />
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
