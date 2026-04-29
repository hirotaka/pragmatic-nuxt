<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  RadioGroupItem,
  RadioGroupIndicator,
  type RadioGroupItemProps,
} from "reka-ui";
import { cn } from "~base/app/lib/utils";

interface Props extends RadioGroupItemProps {
  class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
</script>

<template>
  <RadioGroupItem
    v-bind="props"
    :class="
      cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  >
    <RadioGroupIndicator class="flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-3.5 w-3.5 fill-primary"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
      </svg>
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
