---
title: Use useFetch Semantics for Page Rendering Data
semanticId: page-rendering-data
category: request-boundaries
prerequisites: [custom-api-fetchers]
status: confirmed
---

# Use `useFetch` Semantics for Page Rendering Data

## Practice

Use the app's configured `useAPI` composable for data required to render a page. Preserve Nuxt `useFetch` semantics so the read participates in server rendering, payload hydration, native AsyncData state, reactive updates, and the owning component's refresh lifecycle.

## Apply When

- A route needs the data for its initial meaningful render.
- Server rendering and payload hydration should avoid repeating the initial browser request.
- The owner needs AsyncData status, error, or refresh behavior.
- The URL or request options are reactive inputs to replacement-style data.

## Do Not Apply When

- An imperative request does not need AsyncData state or Nuxt's read lifecycle.
- Later pages append to an existing local collection instead of replacing one AsyncData value.
- The work is unrelated to page rendering and another owner already defines its lifecycle.

## Why

The configured `useAPI` preserves `useFetch` integration with Nuxt's server-rendering and hydration lifecycle while applying the app's common API transport behavior. Awaiting its initial promise at the page or data-aware owner gives Nuxt responsibility for initial settlement without adding a second server-state layer or an application-specific readiness wrapper.

## Implementation Guidance

- Keep the URL and options in a feature composable when the read represents a feature resource.
- Return and await the native AsyncData result rather than wrapping its `data`, `status`, `error`, or `refresh` refs.
- Start with Nuxt's initial-fetch defaults. Change the initial lifecycle only for a concrete route or browser-only requirement.
- Use `immediate: false` when a Nuxt-owned read is intentionally started later, and `server: false` when the data is intentionally browser-only. These options change initial execution without turning the read into an imperative `$api` action.
- Leave `data` undefined until a successful response unless the same domain-valid fallback before the request and after failure is an explicit contract.
- Distinguish a successful empty response from unavailable data. Do not turn a missing or failed response into an empty collection for template convenience.
- Await reactive refetches and manual refreshes at the operation that owns them; they are separate from the initial setup promise.

## Minimal Nuxt Example

```vue
<script setup lang="ts">
const { data, status, refresh } = await useAPI("/api/projects");
const projects = computed(() => data.value?.projects);
</script>

<template>
  <ProjectList
    v-if="projects"
    :projects="projects"
    :is-refreshing="status === 'pending'"
    @refresh="refresh()"
  />
</template>
```

## Verified App Examples

- The [discussion collection composable](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussions.ts) centralizes a page-rendering read with reactive pagination inputs.
- The [discussion detail page](../../../apps/bulletproof-nuxt/layers/discussions/app/pages/app/discussions/%5Bid%5D.vue) awaits its resource before rendering dependent UI.
- The [users list](../../../apps/bulletproof-nuxt/layers/users/app/components/UsersList.vue) renders successful empty data separately from unavailable data.
- The [registration page](../../../apps/bulletproof-nuxt/layers/auth/app/pages/auth/register.vue) owns a simple fixed-URL page read.

## Trade-offs and Limitations

Awaiting route data can delay navigation settlement, so the app should provide route-level progress feedback. This practice is scoped to data needed for the page render; it does not require every GET request to use AsyncData. Transport deadlines and cancellation ownership are separate concerns.

## Sources

- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt data fetching guide](https://nuxt.com/docs/4.x/getting-started/data-fetching)

## Related Practices

- [Use Configured API Fetchers for App-Owned Requests](custom-api-fetchers.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Let Request Inputs Define AsyncData Identity](async-data-identity.md)
- [Share AsyncData Through Feature Composables](shared-async-data.md)
