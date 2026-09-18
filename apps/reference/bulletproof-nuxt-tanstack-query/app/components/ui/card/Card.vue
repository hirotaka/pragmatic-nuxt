<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

defineOptions({ name: "UiCard" });

defineProps<{
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <div :class="cn('rounded-xl border bg-card text-card-foreground shadow-sm', $props.class)">
    <slot />
  </div>
</template>
