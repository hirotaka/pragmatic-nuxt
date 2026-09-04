---
title: Use useFetch Semantics for Page Rendering Data
semanticId: page-rendering-data
category: request-boundaries
prerequisites: [custom-api-fetchers]
status: confirmed
---

# Use `useFetch` Semantics for Page Rendering Data

## Practice

Use Nuxt `useFetch` for data used in page rendering, and await its initial promise by default. `useFetch` integrates the request with server rendering and payload hydration while returning native `AsyncData` state for reactive updates and refreshes.

Awaiting keeps code after the call and client-side navigation pending until the initial request settles. Change the initial lifecycle only when a concrete requirement calls for different behavior before the data is ready.

## Apply When

- Data is fetched for page rendering, and no concrete requirement calls for a different initial lifecycle.
- Code after the `useFetch` call depends on the fetched data.
- The destination should present the fetched content when client-side navigation finishes.
- The server-rendered response should include content based on the fetched data.
- The page or component needs native AsyncData `status`, `error`, or `refresh` behavior while fetching the data.
- Changes to reactive URLs or request options should fetch new data and replace the current AsyncData value.

## Do Not Apply When

- The destination page should open before the data is ready and display its own loading or error state while the request is pending.
- The page remains useful while an independent section loads after navigation.
- The application starts the request imperatively and requires no AsyncData state for its result.
- A later request appends items to an existing local collection instead of replacing the current AsyncData value.
- A page or parent component already fetches the data and passes it to the component that renders it.

## Why

During universal rendering, `useFetch` sends server-fetched data to the browser through the Nuxt payload, avoiding the same request during hydration. The server-rendered HTML is the same whether or not the `useFetch` call is awaited.

For page-rendering data, `await` pauses code after the call and keeps client-side navigation pending until the request settles. This gives data-dependent rendering a predictable starting point without the need for an application-specific readiness wrapper.

Nuxt also supports non-blocking, delayed, and browser-only lifecycles when a concrete requirement calls for them.

## Implementation Guidance

- Await the initial `useFetch` promise for page-rendering data.
- Return `AsyncData` directly and use its native `data`, `status`, `error`, and `refresh` behavior.
- Keep Nuxt's initial-fetch defaults unless a concrete requirement calls for different timing. Use `lazy: true` for non-blocking navigation, `immediate: false` for a request started later, and `server: false` for browser-only data.
- When the initial lifecycle does not wait for data, render loading and error states from the returned `status` and `error` refs.
- Leave `data` undefined until a successful response unless an explicit domain-valid default exists. Keep a successful empty response distinct from unavailable data.

## Minimal Nuxt Example

```vue
<script setup lang="ts">
const { data: projects, status, refresh } = await useFetch("/api/projects");
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

The endpoint returns projects as an array. `useFetch` exposes the response through its `data` ref, which this example renames to `projects`.

The list appears after a successful response and receives the array as its `projects` prop. An empty array is still a successful response, so the list can display its empty state.

The `status` and `refresh` values let the list show refresh progress and request another result.

## Verified App Examples

- The [discussion collection](../../../apps/bulletproof-nuxt/layers/discussions/app/components/DiscussionsCollection.vue) awaits a [feature composable](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussions.ts) that returns `AsyncData` with reactive pagination inputs.
- The [discussion detail page](../../../apps/bulletproof-nuxt/layers/discussions/app/pages/app/discussions/%5Bid%5D.vue) awaits one discussion before rendering the UI that uses it.
- The [user directory](../../../apps/bulletproof-nuxt/layers/users/app/components/UsersList.vue) awaits an array of users and renders a successful empty array separately from unavailable data.
- The [registration page](../../../apps/bulletproof-nuxt/layers/auth/app/pages/auth/register.vue) awaits the teams before passing them to the registration form.

## Trade-offs and Limitations

With `await`, client-side navigation is blocked until the data resolves, so the user stays on the current page while the request is pending. A `<NuxtLoadingIndicator>` can show progress between page navigations.

Without `await`, navigation happens immediately, and the page must handle loading and error states through the returned `status` and `error` refs. Use `lazy` when non-blocking behavior should be explicit and the request should be deferred until the component mounts.

This practice covers the initial `useFetch` call for page-rendering data. It does not define imperative requests, pagination that appends items, error presentation, timeouts, or how to cancel an in-flight request.

## Sources

- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt Data Fetching: A note on `await`](https://nuxt.com/docs/4.x/getting-started/data-fetching#a-note-on-await)
- [Nuxt `<NuxtLoadingIndicator>`](https://nuxt.com/docs/4.x/api/components/nuxt-loading-indicator)
- [Nuxt 4.5.1 `useFetch` source](https://github.com/nuxt/nuxt/blob/v4.5.1/packages/nuxt/src/app/composables/fetch.ts)
- [Nuxt 4.5.1 `useAsyncData` source](https://github.com/nuxt/nuxt/blob/v4.5.1/packages/nuxt/src/app/composables/asyncData.ts)

## Related Practices

- [Use Custom Fetchers for Your API](custom-api-fetchers.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Let Request Inputs Define AsyncData Identity](async-data-identity.md)
- [Share AsyncData Through Feature Composables](shared-async-data.md)
