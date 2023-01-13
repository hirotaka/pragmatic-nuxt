<script setup lang="ts">
import { cloneVNode, useSlots, watchEffect } from "vue";

import type BaseDrawerProps from "@/components/base/BaseDrawer.vue";

interface FormDrawerProps {
  title: string;
  size?: BaseDrawerProps["size"];
  isDone: boolean;
}

const { close, open, isOpen } = useDisclosure();
const slots = useSlots();

const props = withDefaults(defineProps<FormDrawerProps>(), {
  size: "md",
});

const triggerButton = cloneVNode(slots.triggerButton()[0], {
  onClick: () => open(),
});

watchEffect(() => {
  if (props.isDone) {
    close();
  }
});
</script>

<template>
  <component :is="triggerButton" />
  <BaseDrawer :is-open="isOpen" :title="title" :size="size" @close="close">
    <slot></slot>
    <template #footer>
      <BaseButton variant="inverse" size="sm" @click="close">
        Cancel
      </BaseButton>
      <slot name="submitButton"></slot>
    </template>
  </BaseDrawer>
</template>
