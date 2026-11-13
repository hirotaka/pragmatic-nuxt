<script setup lang="ts">
const { data: page } = await useAsyncData("index", () => queryCollection("index").first());

const title = computed(() => page.value?.seo?.title || page.value?.title || "Stackhacker UI SaaS Template");
const description = computed(() => page.value?.seo?.description || page.value?.description || "Build production-ready SaaS applications with Stackhacker UI.");

useSeoMeta({
  titleTemplate: "",
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: "https://ui.stackhacker.io/templates/saas-light.png",
});
</script>

<template>
  <div v-if="page">
    <HomeHero
      :title="page.title || ''"
      :description="page.description"
      :links="page.hero.links"
    />
    <HomeFeatureSplit :sections="page.sections" />
    <HomeFeatureGrid
      :title="page.features.title"
      :description="page.features.description"
      :items="page.features.items"
    />
    <HomeHighlights
      :headline="page.highlights.headline"
      :title="page.highlights.title"
      :description="page.highlights.description"
      :items="page.highlights.items"
    />
    <HomeCta
      :title="page.cta.title"
      :description="page.cta.description"
      :links="page.cta.links"
    />
  </div>
</template>
