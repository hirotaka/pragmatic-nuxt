<script setup lang="ts">
withDefaults(defineProps<{ orientation?: "horizontal" | "vertical" }>(), { orientation: "horizontal" });
</script>

<template>
  <div
    class="flex items-center justify-between gap-4"
    :class="orientation === 'vertical' ? 'flex-col' : 'flex-row'"
  >
    <slot />
  </div>
</template>
