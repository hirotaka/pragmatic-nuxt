<script setup lang="ts">
import { DialogRoot } from 'reka-ui'

export type DialogProps = {
  open?: boolean
  defaultOpen?: boolean
  modal?: boolean
}

const props = defineProps<DialogProps>()
const emit = defineEmits<{
  'update:open': [open: boolean]
}>()
</script>

<template>
  <DialogRoot
    :open="props.open"
    :default-open="props.defaultOpen"
    :modal="props.modal"
    @update:open="emit('update:open', $event)"
  >
    <slot></slot>
  </DialogRoot>
</template>
