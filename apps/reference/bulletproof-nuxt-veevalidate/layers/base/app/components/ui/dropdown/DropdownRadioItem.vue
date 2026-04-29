<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  DropdownMenuRadioItem,
  type DropdownMenuRadioItemProps,
  DropdownMenuItemIndicator,
} from "reka-ui";
import { Circle } from "lucide-vue-next";
import { cn } from "~base/app/lib/utils";

interface Props extends DropdownMenuRadioItemProps {
  class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
</script>

<template>
  <DropdownMenuRadioItem
    :class="
      cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        props.class,
      )
    "
    v-bind="props"
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuItemIndicator>
        <Circle class="h-2 w-2 fill-current" />
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </DropdownMenuRadioItem>
</template>
