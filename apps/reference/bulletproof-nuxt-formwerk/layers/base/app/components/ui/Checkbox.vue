<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import {
  CheckboxRoot,
  CheckboxIndicator,
  type CheckboxRootProps,
} from "reka-ui";
import { cn } from "~base/app/lib/utils";

interface Props extends CheckboxRootProps {
  checked?: boolean | "indeterminate";
  class?: HTMLAttributes["class"];
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  checked: undefined,
  class: undefined,
  name: undefined,
  value: undefined,
});

const emit = defineEmits<{
  "update:checked": [value: boolean | "indeterminate"];
}>();
</script>

<template>
  <CheckboxRoot
    v-bind="props"
    :class="
      cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        props.class,
      )
    "
    @update:checked="emit('update:checked', $event)"
  >
    <CheckboxIndicator class="flex h-full w-full items-center justify-center text-current">
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
        class="h-4 w-4"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
