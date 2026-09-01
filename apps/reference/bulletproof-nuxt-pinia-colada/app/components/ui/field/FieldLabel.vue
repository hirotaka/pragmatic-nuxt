<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  for?: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <label
    data-slot="field-label"
    :for="props.for"
    :class="cn('text-sm leading-none font-medium', props.class)"
  >
    <slot />
  </label>
</template>
