<script setup lang="ts">
import { DialogTitle } from 'reka-ui'

import { cn } from '@/utils/cn'

export type DialogTitleProps = {
  class?: string
}

const props = defineProps<DialogTitleProps>()
</script>

<template>
  <DialogTitle :class="cn('text-lg font-semibold leading-none tracking-tight', props.class)">
    <slot></slot>
  </DialogTitle>
</template>
