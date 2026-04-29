<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { DialogTitle, type DialogTitleProps } from "reka-ui";
import { cn } from "~base/app/lib/utils";

interface Props extends DialogTitleProps {
  class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
</script>

<template>
  <DialogTitle
    :class="cn('text-lg font-semibold text-foreground', props.class)"
  >
    <slot />
  </DialogTitle>
</template>
