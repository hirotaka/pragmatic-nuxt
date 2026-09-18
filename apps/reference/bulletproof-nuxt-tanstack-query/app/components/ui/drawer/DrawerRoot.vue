<script setup lang="ts">
import { DialogRoot, type DialogRootProps } from "reka-ui";

interface Props extends DialogRootProps {
  open?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modal: true,
});

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();
</script>

<template>
  <DialogRoot
    :open="props.open"
    :default-open="props.defaultOpen"
    :modal="props.modal"
    @update:open="emit('update:open', $event)"
  >
    <slot />
  </DialogRoot>
</template>
