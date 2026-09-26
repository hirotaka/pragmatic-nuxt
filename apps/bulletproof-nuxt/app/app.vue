<script setup lang="ts">
import "vue-sonner/style.css";

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} | Bulletproof Nuxt` : "Bulletproof Nuxt";
  },
});
</script>

<template>
  <div>
    <NuxtLoadingIndicator
      color="var(--color-primary)"
      error-color="var(--color-destructive)"
    />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster
      close-button
      position="top-right"
    />
  </div>
</template>
