<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const modelValue = defineModel<string | number | null | undefined>();

const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"];
  type?: string;
}>(), {
  class: undefined,
  type: "text",
});

defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <input
    v-bind="$attrs"
    v-model="modelValue"
    :type="type"
    data-slot="input"
    :class="cn(
      'border-input bg-background ring-offset-background placeholder:text-muted-foreground flex h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm transition-colors',
      'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-1',
      'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
      props.class,
    )"
  >
</template>
