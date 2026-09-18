<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  id?: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <p
    :id="id"
    data-slot="field-description"
    :class="cn('text-muted-foreground text-sm leading-normal', props.class)"
  >
    <slot />
  </p>
</template>
