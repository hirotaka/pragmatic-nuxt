<script setup lang="ts">
const route = useRoute();
const { data: page } = await useAsyncData("blog", () => queryCollection("blog").first());
const { data: posts } = await useAsyncData(route.path, () => queryCollection("posts").all());

const title = computed(() => page.value?.seo?.title || page.value?.title || "Blog");
const description = computed(() => page.value?.seo?.description || page.value?.description || "Discover the latest insights from our team.");

useSeoMeta({ title, ogTitle: title, description, ogDescription: description });
</script>

<template>
  <div class="border-grid border-y">
    <div class="container py-12 md:py-16">
      <BlogHero
        :title="page?.title"
        :description="page?.description"
      />
      <BlogPostGrid :posts="posts || []" />
    </div>
  </div>
</template>
