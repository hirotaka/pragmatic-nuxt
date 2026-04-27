<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { SelectTrigger, type SelectTriggerProps } from "reka-ui";
import { cn } from "~base/app/lib/utils";

interface Props extends SelectTriggerProps {
  class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
</script>

<template>
  <SelectTrigger
    v-bind="props"
    :class="
      cn(
        'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        props.class,
      )
    "
  >
    <slot />
  </SelectTrigger>
</template>
