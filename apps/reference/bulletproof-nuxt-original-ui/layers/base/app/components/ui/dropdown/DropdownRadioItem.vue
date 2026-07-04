<script setup lang="ts">
import type { AcceptableValue } from "reka-ui";
import DropdownRadioItemPrimitive from "~~/components/ui/dropdown-menu/DropdownRadioItem.vue";

const props = defineProps<{
  value: AcceptableValue;
  disabled?: boolean;
  textValue?: string;
}>();
</script>

<template>
  <DropdownRadioItemPrimitive
    :value="props.value"
    :disabled="props.disabled"
    :text-value="props.textValue"
    v-bind="$attrs"
  >
    <slot />
  </DropdownRadioItemPrimitive>
</template>
