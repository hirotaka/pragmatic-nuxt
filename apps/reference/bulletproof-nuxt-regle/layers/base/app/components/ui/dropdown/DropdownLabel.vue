<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { DropdownMenuLabel, type DropdownMenuLabelProps } from "reka-ui";
import { cn } from "~base/app/lib/utils";

interface Props extends DropdownMenuLabelProps {
  class?: HTMLAttributes["class"];
  inset?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <DropdownMenuLabel
    :class="
      cn(
        'px-2 py-1.5 text-sm font-semibold',
        inset && 'pl-8',
        props.class,
      )
    "
  >
    <slot />
  </DropdownMenuLabel>
</template>
