<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const modelValue = defineModel<string | null | undefined>();

const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"];
  rows?: number;
}>(), {
  class: undefined,
  rows: 3,
});

defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <textarea
    v-bind="$attrs"
    v-model="modelValue"
    :rows="rows"
    data-slot="textarea"
    :class="cn(
      'border-input bg-background ring-offset-background placeholder:text-muted-foreground flex min-h-20 w-full rounded-md border px-3 py-2 text-base shadow-sm transition-colors',
      'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-1',
      'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
      props.class,
    )"
  />
</template>
