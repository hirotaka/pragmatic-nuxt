<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "~base/app/lib/utils";

interface Props {
  class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
</script>

<template>
  <div
    :class="cn('flex flex-col space-y-1.5 text-center sm:text-left', props.class)"
  >
    <slot />
  </div>
</template>
