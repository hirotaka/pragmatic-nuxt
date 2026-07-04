<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const modelValue = defineModel<string | null | undefined>();

defineProps<{
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <select
    v-model="modelValue"
    data-slot="select"
    :class="cn(
      'border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-base shadow-sm transition-colors',
      'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-1',
      'disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
      $props.class,
    )"
  >
    <option
      v-if="placeholder"
      value=""
      disabled
    >
      {{ placeholder }}
    </option>
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>
