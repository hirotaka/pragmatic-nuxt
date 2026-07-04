<script setup lang="ts">
import { DropdownMenuTrigger, type DropdownMenuTriggerProps } from "reka-ui";

// Extend RadixVue props for potential future customization
type Props = DropdownMenuTriggerProps;

defineProps<Props>();
</script>

<template>
  <DropdownMenuTrigger v-bind="$props">
    <slot />
  </DropdownMenuTrigger>
</template>
