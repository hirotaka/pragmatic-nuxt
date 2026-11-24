<script setup lang="ts">
const route = useRoute();
const { data: post } = await useAsyncData(route.path, () => queryCollection("posts").path(route.path).first());
if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: "Post not found", fatal: true });
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => queryCollectionItemSurroundings("posts", route.path, { fields: ["description"] }));

const title = computed(() => post.value?.seo?.title || post.value?.title || "Blog");
const description = computed(() => post.value?.seo?.description || post.value?.description || "Blog post");
useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: {
    url: post.value.image.src,
    width: post.value.image.dimensions?.width,
    height: post.value.image.dimensions?.height,
  },
});

useSchemaOrg([
  defineArticle({
    "@type": "BlogPosting",
    "headline": post.value.title,
    "description": post.value.description,
    "image": post.value.image.src,
    "datePublished": post.value.date,
    "author": post.value.authors.map(author => ({ name: author.name })),
  }),
]);
</script>

<template>
  <BlogPostArticle
    v-if="post"
    :post="post"
    :surround="surround"
  />
</template>
