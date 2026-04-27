<script setup lang="ts">
import { DialogDescription } from 'reka-ui'

import { cn } from '@/utils/cn'

type DialogDescriptionProps = {
  class?: string
}

const props = defineProps<DialogDescriptionProps>()
</script>

<template>
  <DialogDescription :class="cn('text-sm text-muted-foreground', props.class)">
    <slot></slot>
  </DialogDescription>
</template>
