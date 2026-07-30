<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"];
  orientation?: "vertical" | "horizontal" | "responsive";
}>(), {
  orientation: "vertical",
  class: undefined,
});
</script>

<template>
  <div
    role="group"
    data-slot="field"
    :data-orientation="orientation"
    :class="cn('group/field flex w-full gap-3 data-[invalid=true]:text-destructive', orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col', props.class)"
  >
    <slot />
  </div>
</template>
