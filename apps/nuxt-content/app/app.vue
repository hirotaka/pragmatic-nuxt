<script setup lang="ts">
const colorMode = useColorMode();
const themeColor = computed(() => colorMode.value === "dark" ? "#171717" : "#ffffff");

useHead({
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { key: "theme-color", name: "theme-color", content: themeColor },
  ],
  link: [
    { rel: "icon", href: "/favicon.ico" },
  ],
  htmlAttrs: { lang: "en" },
});

useSeoMeta({
  titleTemplate: "%s - Stackhacker UI SaaS template",
  twitterCard: "summary_large_image",
  ogImage: {
    url: withSiteUrl("/screenshots/saas-light.png", { withBase: true }).value,
    width: 1660,
    height: 930,
  },
});

const { data: navigation } = await useAsyncData("navigation", () => queryCollectionNavigation("docs"), {
  transform: data => data.find(item => item.path === "/docs")?.children || [],
});
provide("navigation", navigation);
</script>

<template>
  <div class="min-h-screen bg-background text-foreground antialiased">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
