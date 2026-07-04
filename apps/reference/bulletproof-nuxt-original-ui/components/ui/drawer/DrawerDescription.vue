<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { DialogDescription as RekaDialogDescription, type DialogDescriptionProps } from "reka-ui";
import { cn } from "@/lib/utils";

interface Props extends DialogDescriptionProps {
  class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
</script>

<template>
  <RekaDialogDescription :class="cn('text-sm text-muted-foreground', props.class)">
    <slot />
  </RekaDialogDescription>
</template>
