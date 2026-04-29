<script setup lang="ts">
interface ContentLayoutProps {
  title?: string;
}

defineProps<ContentLayoutProps>();
</script>

<template>
  <main class="py-6">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <h1
        v-if="title"
        class="text-2xl font-semibold text-gray-900"
      >
        {{ title }}
      </h1>
    </div>
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8">
      <slot />
    </div>
  </main>
</template>
