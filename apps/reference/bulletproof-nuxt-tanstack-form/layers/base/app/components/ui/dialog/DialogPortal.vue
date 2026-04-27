<script setup lang="ts">
import { DialogPortal, type DialogPortalProps } from "reka-ui";

// Extend RadixVue props for potential future customization
type Props = DialogPortalProps;

defineProps<Props>();
</script>

<template>
  <DialogPortal v-bind="$props">
    <slot />
  </DialogPortal>
</template>
