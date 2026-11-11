<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();
</script>

<template>
  <header class="max-w-3xl py-8 md:py-10">
    <h1 class="text-4xl font-semibold tracking-tight text-pretty md:text-6xl">
      {{ title }}
    </h1>
    <p class="mt-5 text-lg/8 text-muted-foreground">
      {{ description }}
    </p>
  </header>
</template>
