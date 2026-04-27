<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { DropdownMenu as DropdownMenuPrimitive } from 'reka-ui/namespaced'

import { cn } from '@/utils/cn'

type DropdownCheckboxItemProps = {
  checked?: boolean
  class?: string
}

defineProps<DropdownCheckboxItemProps>()

const emit = defineEmits<{
  'update:checked': [value: boolean]
}>()
</script>

<template>
  <DropdownMenuPrimitive.CheckboxItem
    :checked="checked"
    :class="
      cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        $props.class,
      )
    "
    @update:checked="emit('update:checked', $event)"
  >
    <span class="absolute left-2 flex size-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check class="size-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    <slot />
  </DropdownMenuPrimitive.CheckboxItem>
</template>
