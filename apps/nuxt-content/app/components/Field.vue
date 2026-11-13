<script setup lang="ts">
defineProps<{ name?: string; type?: string; required?: boolean }>();
</script>

<template>
  <div class="p-4">
    <code>{{ name }}</code><span class="text-muted-foreground ml-2 text-sm">{{ type }}</span><span
      v-if="required"
      class="text-primary ml-2 text-xs"
    >required</span><slot />
  </div>
</template>
