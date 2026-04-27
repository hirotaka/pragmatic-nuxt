<script setup lang="ts">
import { DropdownMenu as DropdownMenuPrimitive } from 'reka-ui/namespaced'

import { cn } from '@/utils/cn'

type DropdownLabelProps = {
  class?: string
  inset?: boolean
}

defineProps<DropdownLabelProps>()
</script>

<template>
  <DropdownMenuPrimitive.Label
    :class="cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8', $props.class)"
  >
    <slot />
  </DropdownMenuPrimitive.Label>
</template>
