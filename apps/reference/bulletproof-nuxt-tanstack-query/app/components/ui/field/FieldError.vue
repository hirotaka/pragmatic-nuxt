<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  id?: string;
  error?: string | boolean;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <p
    v-if="$slots.default || error"
    :id="id"
    role="alert"
    data-slot="field-error"
    :class="cn('text-destructive text-sm font-medium', props.class)"
  >
    <slot>
      {{ typeof error === "string" ? error : "Invalid value." }}
    </slot>
  </p>
</template>
