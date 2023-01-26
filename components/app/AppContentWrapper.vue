<script setup lang="ts">
type ContentLayoutProps = {
  title?: string
}

defineProps<ContentLayoutProps>()
</script>

<template>
  <div>
    <AppHead :title="title" />
    <div class="py-6">
      <div v-if="title" class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 class="text-2xl font-semibold text-gray-900">
          {{ title }}
        </h1>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <slot />
      </div>
    </div>
  </div>
</template>
