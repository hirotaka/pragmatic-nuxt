<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { DropdownMenu as DropdownMenuPrimitive } from 'reka-ui/namespaced'

import { cn } from '@/utils/cn'

type DropdownSubTriggerProps = {
  class?: string
  inset?: boolean
}

defineProps<DropdownSubTriggerProps>()
</script>

<template>
  <DropdownMenuPrimitive.SubTrigger
    :class="
      cn(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent',
        inset && 'pl-8',
        $props.class,
      )
    "
  >
    <slot />
    <ChevronRight class="ml-auto size-4" />
  </DropdownMenuPrimitive.SubTrigger>
</template>
