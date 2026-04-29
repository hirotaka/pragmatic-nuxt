<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "~base/app/lib/utils";

const spinnerVariants = cva("animate-spin text-current", {
  variants: {
    size: {
      sm: "h-3 w-3",
      default: "h-4 w-4",
      lg: "h-6 w-6",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type SpinnerVariants = VariantProps<typeof spinnerVariants>;

interface Props {
  size?: SpinnerVariants["size"];
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  size: "default",
  class: undefined,
});
</script>

<template>
  <svg
    :class="cn(spinnerVariants({ size }), props.class)"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      class="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="4"
    />
    <path
      class="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
</template>
