<script setup lang="ts">
const route = useRoute();
const { data: page } = await useAsyncData("changelog", () => queryCollection("changelog").first());
const { data: versions } = await useAsyncData(route.path, () => queryCollection("versions").order("date", "DESC").all());

const title = computed(() => page.value?.seo?.title || page.value?.title || "Changelog");
const description = computed(() => page.value?.seo?.description || page.value?.description || "Track the latest updates and improvements.");
useSeoMeta({ title, ogTitle: title, description, ogDescription: description });
</script>

<template>
  <div class="border-grid border-y">
    <div class="container py-12 md:py-16">
      <BlogHero
        :title="page?.title"
        :description="page?.description"
      />
      <ChangelogTimeline :versions="versions || []" />
    </div>
  </div>
</template>
