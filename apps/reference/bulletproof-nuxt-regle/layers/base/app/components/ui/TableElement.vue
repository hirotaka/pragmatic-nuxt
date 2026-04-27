<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "~base/app/lib/utils";

interface Props {
  class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
</script>

<template>
  <div class="relative w-full overflow-auto">
    <table
      :class="cn('w-full caption-bottom text-sm', props.class)"
    >
      <slot />
    </table>
  </div>
</template>
