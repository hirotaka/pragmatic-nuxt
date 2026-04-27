<script setup lang="ts">
import { cn } from '@/utils/cn'

type DialogFooterProps = {
  class?: string
}

const props = defineProps<DialogFooterProps>()
</script>

<template>
  <div :class="cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', props.class)">
    <slot></slot>
  </div>
</template>
