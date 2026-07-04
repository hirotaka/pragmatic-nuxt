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
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <NotificationCenter />
  </div>
</template>
