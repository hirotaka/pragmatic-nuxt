<script setup lang="ts">
defineProps<{ value?: string }>();
</script>

<template>
  <kbd class="rounded border px-1.5 py-0.5 text-xs"><slot>{{ value }}</slot></kbd>
</template>
