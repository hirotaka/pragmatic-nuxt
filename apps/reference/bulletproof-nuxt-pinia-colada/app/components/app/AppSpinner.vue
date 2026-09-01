<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  label: string;
  size?: "sm" | "default" | "lg";
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<Props>(), {
  size: "default",
  class: undefined,
});
</script>

<template>
  <span
    :aria-label="props.label"
    class="inline-flex items-center"
    :class="cn(props.class)"
    role="status"
  >
    <Spinner
      aria-hidden="true"
      :size="props.size"
    />
    <span class="sr-only">{{ props.label }}</span>
  </span>
</template>
