<script setup lang="ts">
import { DialogTrigger, type DialogTriggerProps } from "reka-ui";

// Extend RadixVue props for potential future customization
type Props = DialogTriggerProps;

defineOptions({ inheritAttrs: false });

const props = defineProps<Props>();
</script>

<template>
  <DialogTrigger
    v-bind="{ ...props, ...$attrs }"
    as-child
  >
    <slot />
  </DialogTrigger>
</template>
