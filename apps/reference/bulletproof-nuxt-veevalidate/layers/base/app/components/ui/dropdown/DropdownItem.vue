<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { DropdownMenuItem, type DropdownMenuItemProps } from "reka-ui";
import { cn } from "~base/app/lib/utils";

interface Props extends DropdownMenuItemProps {
  class?: HTMLAttributes["class"];
  inset?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <DropdownMenuItem
    :class="
      cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        props.class,
      )
    "
    v-bind="props"
  >
    <slot />
  </DropdownMenuItem>
</template>
