<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "~base/app/lib/utils";

interface Props {
  for?: string;
  class?: HTMLAttributes["class"];
  required?: boolean;
  error?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  error: false,
  for: undefined,
  class: undefined,
});
</script>

<template>
  <label
    :for="props.for"
    :class="
      cn(
        'block mb-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        error && 'text-destructive',
        props.class,
      )
    "
  >
    <slot />
    <span
      v-if="required"
      class="ml-1 text-destructive"
    >*</span>
  </label>
</template>
