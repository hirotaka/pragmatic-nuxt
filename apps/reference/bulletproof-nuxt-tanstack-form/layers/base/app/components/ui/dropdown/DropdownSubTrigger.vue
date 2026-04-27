<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { DropdownMenuSubTrigger, type DropdownMenuSubTriggerProps } from "reka-ui";
import { ChevronRight } from "lucide-vue-next";
import { cn } from "~base/app/lib/utils";

interface Props extends DropdownMenuSubTriggerProps {
  class?: HTMLAttributes["class"];
  inset?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <DropdownMenuSubTrigger
    :class="
      cn(
        'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent',
        inset && 'pl-8',
        props.class,
      )
    "
    v-bind="props"
  >
    <slot />
    <ChevronRight class="ml-auto h-4 w-4" />
  </DropdownMenuSubTrigger>
</template>
