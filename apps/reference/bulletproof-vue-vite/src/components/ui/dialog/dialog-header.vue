<script setup lang="ts">
import { cn } from '@/utils/cn'

export type DialogHeaderProps = {
  class?: string
}

const props = defineProps<DialogHeaderProps>()
</script>

<template>
  <div :class="cn('flex flex-col space-y-1.5 text-center sm:text-left', props.class)">
    <slot></slot>
  </div>
</template>
