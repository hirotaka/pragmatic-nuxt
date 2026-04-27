<script setup lang="ts">
import { Circle } from 'lucide-vue-next'
import { DropdownMenu as DropdownMenuPrimitive } from 'reka-ui/namespaced'

import { cn } from '@/utils/cn'

type DropdownRadioItemProps = {
  value: string
  class?: string
}

defineProps<DropdownRadioItemProps>()
</script>

<template>
  <DropdownMenuPrimitive.RadioItem
    :value="value"
    :class="
      cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        $props.class,
      )
    "
  >
    <span class="absolute left-2 flex size-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle class="size-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    <slot />
  </DropdownMenuPrimitive.RadioItem>
</template>
