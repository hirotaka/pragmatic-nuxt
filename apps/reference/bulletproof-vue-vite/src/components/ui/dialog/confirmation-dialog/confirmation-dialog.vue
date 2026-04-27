<script setup lang="ts">
import { CircleAlert, Info } from 'lucide-vue-next'
import type { VNode } from 'vue'
import { ref, watch } from 'vue'

import { Button } from '../../button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../dialog'

export type ConfirmationDialogProps = {
  triggerButton?: VNode
  confirmButton?: VNode
  title: string
  body?: string
  cancelButtonText?: string
  icon?: 'danger' | 'info'
  isDone?: boolean
}

const props = withDefaults(defineProps<ConfirmationDialogProps>(), {
  body: '',
  cancelButtonText: 'Cancel',
  icon: 'danger',
  isDone: false,
})

const isOpen = ref(false)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

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
  <Dialog
    :open="isOpen"
    @update:open="
      (value) => {
        if (!value) {
          close()
        } else {
          open()
        }
      }
    "
  >
    <DialogTrigger as-child>
      <slot name="triggerButton">
        <component :is="triggerButton" />
      </slot>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader class="flex">
        <DialogTitle class="flex items-center gap-2">
          <CircleAlert v-if="icon === 'danger'" class="size-6 text-red-600" aria-hidden="true" />
          <Info v-if="icon === 'info'" class="size-6 text-blue-600" aria-hidden="true" />
          {{ title }}
        </DialogTitle>
        <DialogDescription class="sr-only">Confirmation dialog</DialogDescription>
      </DialogHeader>

      <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
        <div v-if="body" class="mt-2">
          <p>{{ body }}</p>
        </div>
      </div>

      <DialogFooter>
        <slot name="confirmButton">
          <component :is="confirmButton" />
        </slot>
        <Button variant="outline" @click="close">
          {{ cancelButtonText }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
