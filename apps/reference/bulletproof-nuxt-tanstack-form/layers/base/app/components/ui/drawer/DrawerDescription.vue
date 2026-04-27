<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { DialogDescription, type DialogDescriptionProps } from "reka-ui";
import { cn } from "~base/app/lib/utils";

interface Props extends DialogDescriptionProps {
  class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
</script>

<template>
  <DialogDescription :class="cn('text-sm text-muted-foreground', props.class)">
    <slot />
  </DialogDescription>
</template>
