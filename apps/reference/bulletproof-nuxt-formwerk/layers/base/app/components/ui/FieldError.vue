<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "~base/app/lib/utils";

interface Props {
  message?: string;
  class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
</script>

<template>
  <p
    v-if="message"
    :class="cn('text-sm font-medium text-destructive', props.class)"
  >
    {{ message }}
  </p>
</template>
