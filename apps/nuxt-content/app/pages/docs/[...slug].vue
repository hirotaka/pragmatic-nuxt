<script setup lang="ts">
definePageMeta({ layout: "docs" });

const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => queryCollection("docs").path(route.path).first());
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => queryCollectionItemSurroundings("docs", route.path, { fields: ["description"] }));

const title = computed(() => page.value?.seo?.title || page.value?.title || "Docs");
const description = computed(() => page.value?.seo?.description || page.value?.description || "Documentation");
useSeoMeta({ title, ogTitle: title, description, ogDescription: description });
</script>

<template>
  <DocsArticle
    v-if="page"
    :page="page"
    :surround="surround"
  />
</template>
