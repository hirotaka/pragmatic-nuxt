<script setup lang="ts">
import NotificationCenter from "@/components/app/NotificationCenter.vue";

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
    <NotificationCenter />
  </div>
</template>
