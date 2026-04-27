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
    :class="cn('text-lg font-semibold leading-none tracking-tight', props.class)"
  >
    <slot />
  </DialogTitle>
</template>
