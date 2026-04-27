<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  DropdownMenuContent,
  type DropdownMenuContentProps,
} from "reka-ui";
import { cn } from "~base/app/lib/utils";

interface Props extends DropdownMenuContentProps {
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  sideOffset: 4,
  class: undefined,
});
</script>

<template>
  <DropdownMenuContent
    :class="
      cn(
        'z-[9999] min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        props.class,
      )
    "
    v-bind="props"
  >
    <slot />
  </DropdownMenuContent>
</template>
