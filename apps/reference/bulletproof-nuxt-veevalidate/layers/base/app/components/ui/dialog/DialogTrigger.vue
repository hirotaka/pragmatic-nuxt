<script setup lang="ts">
import { DialogTrigger, type DialogTriggerProps } from "reka-ui";

// Extend RadixVue props for potential future customization
type Props = DialogTriggerProps;

defineProps<Props>();
</script>

<template>
  <DialogTrigger
    v-bind="$props"
    as-child
  >
    <slot />
  </DialogTrigger>
</template>
