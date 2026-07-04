<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

defineOptions({ name: "UiSeparator" });

const props = withDefaults(defineProps<{
  orientation?: "horizontal" | "vertical";
  class?: HTMLAttributes["class"];
}>(), {
  orientation: "horizontal",
  class: undefined,
});
</script>

<template>
  <div
    role="separator"
    :aria-orientation="orientation"
    :class="cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      props.class,
    )"
  />
</template>
