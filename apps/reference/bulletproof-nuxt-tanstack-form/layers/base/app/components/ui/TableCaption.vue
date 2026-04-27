<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "~base/app/lib/utils";

interface Props {
  class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
</script>

<template>
  <caption :class="cn('mt-4 text-sm text-muted-foreground', props.class)">
    <slot />
  </caption>
</template>
