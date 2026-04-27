<script setup lang="ts">
import { RadioGroupRoot, type RadioGroupRootProps } from "reka-ui";

interface Props extends RadioGroupRootProps {
  modelValue?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  modelValue: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <RadioGroupRoot
    v-bind="props"
    @update:model-value="emit('update:modelValue', String($event))"
  >
    <slot />
  </RadioGroupRoot>
</template>
