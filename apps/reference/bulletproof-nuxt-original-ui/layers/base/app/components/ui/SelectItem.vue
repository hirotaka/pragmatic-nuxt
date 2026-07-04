<script setup lang="ts">
import type { AcceptableValue } from "reka-ui";
import SelectItemPrimitive from "~~/components/ui/select/SelectItem.vue";

const props = defineProps<{
  value: AcceptableValue;
  disabled?: boolean;
  textValue?: string;
}>();
</script>

<template>
  <SelectItemPrimitive
    :value="props.value"
    :disabled="props.disabled"
    :text-value="props.textValue"
    v-bind="$attrs"
  >
    <slot />
  </SelectItemPrimitive>
</template>
