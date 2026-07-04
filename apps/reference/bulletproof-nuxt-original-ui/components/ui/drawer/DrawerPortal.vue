<script setup lang="ts">
import { DialogPortal as RekaDialogPortal, type DialogPortalProps } from "reka-ui";

// Extend RadixVue props for potential future customization
type Props = DialogPortalProps;

defineProps<Props>();
</script>

<template>
  <RekaDialogPortal v-bind="$props">
    <slot />
  </RekaDialogPortal>
</template>
