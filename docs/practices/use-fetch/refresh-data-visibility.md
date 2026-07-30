---
title: Keep Existing Data Visible During Refresh
semanticId: refresh-data-visibility
category: async-data-lifecycle
prerequisites: [page-rendering-data]
status: confirmed
---

# Keep Existing Data Visible During Refresh

## Practice

When a data refresh is pending and displayable data already exists, keep that data visible. Distinguish initial loading from refreshing instead of replacing existing content with loading UI on every refresh.

## Apply When

- A list or detail view is refreshed.
- Existing content can remain available while the refresh is pending.
- Initial loading and refreshing need different UI treatments.
- Affected data is refreshed after a mutation succeeds.

## Do Not Apply When

- The initial request is pending and no displayable data exists yet.
- Showing existing data during refresh is not acceptable for security or correctness reasons.
- Load-more results are appended to local accumulated state.

## Why

An AsyncData `status` of `pending` does not mean that no displayable data exists. Data from an earlier successful request may remain available during refresh.

Replacing existing content with a spinner whenever refresh starts causes visual flicker and temporarily removes content or controls the user was reading or using.

## Implementation Guidance

- Use the raw `refresh()` returned by the owning feature composable.
- Do not hide existing content solely because `status === "pending"`.
- Treat pending without data as initial loading and pending with data as refreshing.
- Keep existing content visible and show a non-blocking refresh indicator when useful.
- Do not clear `data` manually before starting refresh.
- Report refresh failures through the common API error contract. This practice does not add data retention after failure.

## Minimal Nuxt Example

```vue
<script setup lang="ts">
const { data: projects, status, refresh } = await useAPI<Project[]>("/api/projects");

const isInitialPending = computed(() => status.value === "pending" && projects.value === undefined);
const isRefreshing = computed(() => status.value === "pending" && projects.value !== undefined);
</script>

<template>
  <Spinner v-if="isInitialPending" />
  <section v-else>
    <p v-if="isRefreshing" aria-live="polite">Refreshing projects...</p>
    <ProjectList v-if="projects" :projects="projects" />
    <button type="button" @click="refresh">Refresh</button>
  </section>
</template>
```

## Verified App Examples

- The discussion list shows a spinner during initial loading when no data exists.
- When discussion rows exist, the list keeps them visible during refresh and shows `Refreshing discussions...`.
- The discussion detail view keeps existing detail content visible while its refresh request is pending.
- The users list keeps existing users visible while refresh is pending.

## Trade-offs and Limitations

Existing data shown during refresh is not the result of the pending request. Indicate that a refresh is in progress when users need that context.

Keeping existing data visible avoids flicker, but each surface must decide whether interactions should remain available. Treat append-style pagination with local accumulated state as a separate practice.

## Sources

- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt `useAsyncData`](https://nuxt.com/docs/4.x/api/composables/use-async-data)
- [Nuxt data fetching](https://nuxt.com/docs/4.x/getting-started/data-fetching)

## Related Practices

- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Let Request Inputs Define AsyncData Identity](async-data-identity.md)
- [Distinguish Mutation Failures from Data Refresh Failures](mutation-refresh-outcomes.md)
- [Handle API Error Notifications in Custom Fetchers](api-error-notifications.md)
- [Share Pagination Mechanics and Choose the Collection Strategy](pagination-strategies.md)
