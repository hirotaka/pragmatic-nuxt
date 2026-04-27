<script setup lang="ts">
import { DropdownMenu as DropdownPrimitive } from 'reka-ui/namespaced'

import { cn } from '@/utils/cn'

type DropdownItemProps = {
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<DropdownItemProps>(), {
  disabled: false,
})
</script>

<template>
  <DropdownPrimitive.Item
    :disabled="disabled"
    :class="
      cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        'focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        props.class,
      )
    "
  >
    <slot></slot>
  </DropdownPrimitive.Item>
</template>
