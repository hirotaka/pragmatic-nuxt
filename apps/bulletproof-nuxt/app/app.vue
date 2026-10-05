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
      color="var(--primary)"
      error-color="var(--destructive)"
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
