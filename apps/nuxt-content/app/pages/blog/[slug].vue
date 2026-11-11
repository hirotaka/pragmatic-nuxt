<script setup lang="ts">
const route = useRoute();
const { data: post } = await useAsyncData(route.path, () => queryCollection("posts").path(route.path).first());
if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: "Post not found", fatal: true });
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => queryCollectionItemSurroundings("posts", route.path, { fields: ["description"] }));

const title = computed(() => post.value?.seo?.title || post.value?.title || "Blog");
const description = computed(() => post.value?.seo?.description || post.value?.description || "Blog post");
useSeoMeta({ title, ogTitle: title, description, ogDescription: description, ogImage: post.value?.image?.src });
</script>

<template>
  <BlogPostArticle
    v-if="post"
    :post="post"
    :surround="surround"
  />
</template>
