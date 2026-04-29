<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "~base/app/lib/utils";

interface Props {
  class?: HTMLAttributes["class"];
}

const props = defineProps<Props>();
</script>

<template>
  <tfoot
    :class="
      cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', props.class)
    "
  >
    <slot />
  </tfoot>
</template>
