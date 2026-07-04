<script setup lang="ts">
import { DialogTrigger as RekaDialogTrigger, type DialogTriggerProps } from "reka-ui";

// Extend RadixVue props for potential future customization
type Props = DialogTriggerProps;

defineProps<Props>();
</script>

<template>
  <RekaDialogTrigger v-bind="$props">
    <slot />
  </RekaDialogTrigger>
</template>
