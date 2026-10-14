---
title: Use Nuxt's Built-in Head Management for SEO
semanticId: use-nuxt-built-in-head-management-for-seo
category: head-and-metadata
prerequisites: []
status: confirmed
---

# Use Nuxt's Built-in Head Management for SEO

## Practice

Nuxt's built-in head management is used to configure SEO metadata that communicates the site's and each page's content to search engines. This includes shared site metadata and page-specific metadata, whether the values are fixed or change with the page's content.

## Apply When

- A Nuxt site needs SEO metadata.
- The site has shared defaults and page-specific metadata.
- Some metadata depends on content that can change.

## Do Not Apply When

- Another system owns the HTML document and its metadata outside Nuxt.
- The requirement is to generate a sitemap or manage robots.txt, rather than configure head metadata.

## Why

Nuxt already integrates Unhead for head management, so basic SEO metadata does not require a separate SEO module. Nuxt includes declared metadata in the HTML returned by SSR and updates it during browser navigation. Browser-only changes to the document head do not appear in that initial HTML.

Nuxt also provides typed SEO fields to help avoid misspelled names and incorrect meta tag attributes. Reactive inputs keep data-dependent metadata aligned with the page as its content changes.

## Implementation Guidance

- Set fixed application-wide defaults in `nuxt.config.ts` under `app.head`.
- Set shared title formatting with `useHead()` in `app/app.vue`.
- Use `useSeoMeta()` for named SEO fields, and `useHead()` for general head settings such as link tags or title templates.
- Pass refs, computed values, or getters for metadata derived from data that can change.
- Make data needed for the initial metadata available during SSR, and supply fallback values when that data is unavailable.

## Minimal Nuxt Example

Fixed settings can be configured once for the application.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
})
```

The shared title formatting below adds the application name to each page title. It uses the application name alone when no page title is supplied.

```vue
<!-- app/app.vue -->
<script setup lang="ts">
useHead({
  titleTemplate: title => title ? `${title} | Example App` : 'Example App',
})
</script>

<template>
  <NuxtPage />
</template>
```

The page below loads its article during SSR and derives its title and description from that data. These fields illustrate page metadata; they are not a required set for every page. The article API returns an object with `title` and `summary` fields.

```vue
<!-- app/pages/articles/[id].vue -->
<script setup lang="ts">
const route = useRoute()
const { data: article } = await useFetch<{ title: string; summary: string }>(
  () => `/api/articles/${route.params.id}`,
)

useHead({
  title: () => article.value?.title ?? 'Article',
})
useSeoMeta({
  description: () => article.value?.summary ?? 'Read this article.',
})
</script>

<template>
  <article v-if="article">
    <h1>{{ article.title }}</h1>
    <p>{{ article.summary }}</p>
  </article>
</template>
```

The getters read the current article rather than copying its title and summary once. When navigation changes the article data, the head values update with the displayed content.

## App Examples

- [`nuxt.config.ts`](../../../apps/bulletproof-nuxt/nuxt.config.ts) configures the static favicon in `app.head`.
- [`app.vue`](../../../apps/bulletproof-nuxt/app/app.vue) provides the shared title formatting.
- [`[id].vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/pages/app/discussions/[id].vue) derives the page title from the current Discussion.
- [`index.vue`](../../../apps/bulletproof-nuxt/app/pages/index.vue) sets the Home description with `useSeoMeta()`.

## Trade-offs and Limitations

If metadata depends on data loaded only in the browser, the initial server-rendered HTML cannot include the data-dependent values. Defaults or fallback values can be supplied instead.

For SEO features beyond head metadata, such as sitemap generation or robots.txt management, consider a third-party module such as `@nuxtjs/seo`. It also provides modules for structured data and OG image generation.

## Sources

- [Nuxt SEO and Meta](https://nuxt.com/docs/4.x/getting-started/seo-meta)
- [Nuxt SEO module](https://nuxt.com/modules/seo)

## Related Practices

- [Use useFetch Semantics for Page Rendering Data](../nuxt-use-fetch/page-rendering-data.md)
