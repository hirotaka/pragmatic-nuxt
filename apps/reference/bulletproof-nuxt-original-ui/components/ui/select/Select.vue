<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { SelectRoot } from "reka-ui";

interface Props {
  modelValue?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  modelValue: undefined,
  name: undefined,
  id: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <SelectRoot
    :model-value="modelValue"
    :disabled="disabled"
    :name="name"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <slot />
  </SelectRoot>
</template>
