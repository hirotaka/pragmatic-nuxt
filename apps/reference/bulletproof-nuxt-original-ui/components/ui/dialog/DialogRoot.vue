<script setup lang="ts">
import { DialogRoot as RekaDialogRoot, type DialogRootProps } from "reka-ui";

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
  <RekaDialogRoot
    :open="props.open"
    :default-open="props.defaultOpen"
    :modal="props.modal"
    @update:open="emit('update:open', $event)"
  >
    <slot />
  </RekaDialogRoot>
</template>
