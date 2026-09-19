---
title: Keep Existing Data Visible During Refresh
semanticId: refresh-data-visibility
category: async-data-lifecycle
prerequisites: [page-rendering-data]
status: confirmed
---

# Keep Existing Data Visible During Refresh

## Practice

Keep previously fetched data visible while `useFetch` refreshes it. Show initial loading UI when a request is pending and no fetched data is available.

## Apply When

Use this practice when:

- A list or detail view already has fetched data to display.
- Users can continue viewing the previous result while updated data is being fetched.

## Do Not Apply When

Do not use this practice when:

- The initial request is pending and there is no previously fetched data to display.
- The previous result must no longer be displayed, for example because the user no longer has permission to view it.
- The request loads another page to append to a list, rather than refreshing the displayed result.

## Why

`useFetch` can keep data from a previous successful request while a refresh is pending.

Keeping that data visible avoids the flicker and layout shifts caused by replacing existing content with a loading screen and then restoring it. Users can continue reading while updated data is fetched. The layout may still change when the new data arrives, for example if the number of items changes.

## Implementation Guidance

- Use `status` and the fetched `data` to distinguish initial loading from refreshing. Keep the current content visible while a refresh is pending.
- Call `refresh()` from the feature composable to fetch updated data.
- Show a refresh indicator alongside the existing content when users need progress feedback.

## Minimal Nuxt Example

Define a feature composable for an API that returns a project array.

```ts
// composables/useProjects.ts
export function useProjects() {
  return useFetch("/api/projects");
}
```

Use its data, status, and refresh function in the component.

```vue
<!-- layers/discussions/app/components/DiscussionsList.vue -->
<script setup lang="ts">
const { data: projects, status, refresh } = useProjects();
</script>

<template>
  <p v-if="status === 'pending' && !projects" role="status">
    Loading projects...
  </p>

  <section v-else-if="projects">
    <p role="status" style="min-height: 1.5em">
      {{ status === "pending" ? "Refreshing projects..." : "" }}
    </p>
    <ProjectList :projects="projects" />
    <button type="button" @click="refresh()">
      Refresh
    </button>
  </section>
</template>
```

The list stays visible during refresh. Reserve space for the progress message to keep it from shifting the list.

## App Examples

- [`DiscussionsList.vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/DiscussionsList.vue) keeps existing discussion rows visible during refresh and shows `Refreshing discussions...` above the table.
- [`DiscussionView.vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/DiscussionView.vue) keeps the discussion details visible during refresh by rendering them whenever `discussion` data is available.
- [`UsersList.vue`](../../../apps/bulletproof-nuxt/layers/users/app/components/UsersList.vue) keeps the user list visible while refreshing it after a successful deletion.

## Trade-offs and Limitations

The visible data comes from the previous successful request and may be out of date until the refresh succeeds.

Keeping data visible while a refresh is pending does not guarantee that it will remain available if the request fails.

## Sources

- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt `useAsyncData`](https://nuxt.com/docs/4.x/api/composables/use-async-data)
- [Nuxt Data Fetching guide](https://nuxt.com/docs/4.x/getting-started/data-fetching)

## Related Practices

- [Use useFetch Semantics for Page Rendering Data](page-rendering-data.md)
- [Let Request Inputs Define AsyncData Identity](async-data-identity.md)
- [Separate Completed Changes from Data Refresh Failures](completed-change-refresh-failures.md)
- [Present API Failures from Custom Fetchers](api-error-notifications.md)
- [Update Paginated Lists Differently for Page Navigation and Load More](pagination-strategies.md)
