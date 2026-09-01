---
title: Use Query Prefetching to Reduce Waiting for Data
semanticId: pinia-colada-query-prefetching
category: query-prefetching
status: confirmed
---

# Use Query Prefetching to Reduce Waiting for Data

## Practice

Use Query prefetching to begin loading data before a page or component needs it.
When the page or component later uses the same Query, Pinia Colada can reuse fresh cached data or an ongoing request, which can reduce the user's wait for data.

## Apply When

- The application can identify which Query will likely be needed next, such as when a user starts navigating to a specific page.
- The prefetch and later `useQuery()` call can use the same Query options. If the prefetch has completed, `useQuery()` can use its cached result; if it is still running, `useQuery()` can reuse that request.
- The action that triggers the prefetch can continue without waiting for the request, giving the request time to run before the page or component needs the data.
- The application can accept the network request and cache entry when no page or component ends up using the prefetched data.

## Do Not Apply When

- A page or component already needs the data. Call `useQuery()` there instead of adding a separate prefetch step.
- The data is already available from another source. Ensure the Query entry and populate it with `setQueryData()` instead of starting another network request.
- No specific Query is likely to be used next. Let the page or component that eventually needs the data start its normal `useQuery()` request instead of prefetching possible choices.

## Why

When a page or component starts loading only when it needs to display data, the user must wait for the full request. Prefetching starts the same Query earlier, allowing a later `useQuery()` call to use the result if it has completed or reuse the request if it is still running, which can reduce the wait that remains after the data is needed.

## Implementation Guidance

- Define reusable Query options with `defineQueryOptions()`. Use the same Query options for Query Cache prefetching and the page or component's `useQuery()` call. See [Organize Queries by Domain with `defineQueryOptions()`](query-organization.md).
- When the Query is likely to be needed soon, pass its options to Query Cache `ensure()` and pass the returned entry to `refresh()`. Await `refresh()` only when the code that starts the prefetch must receive the data before it continues. If that code can continue without the data, do not await the Promise and handle its rejection.
- Keep the page or component's normal `useQuery()` call. It can use the cached result when the prefetch has completed, reuse the same request while it is running, or start the normal request when no prefetch occurred.
- If the application has global Query error handling, keep an unused inactive prefetch failure separate from an active Query failure. Do not show an error for a page the user never opened, but retain the normal error and recovery behavior after the Query becomes active.

## Minimal Nuxt Example

Define the Query options once in the feature's Query module.

```ts
import { defineQueryOptions } from "@pinia/colada";

export const projectDetailQuery = defineQueryOptions(
  ({ id }: { id: string }) => ({
    key: ["projects", id],
    query: ({ signal }) => {
      const { $api } = useNuxtApp();

      return $api(`/api/projects/${id}`, { signal });
    },
  }),
);
```

Start the Query from an action that indicates the project data is likely to be needed soon.

```vue
<script setup lang="ts">
import { useQueryCache } from "@pinia/colada";
import { projectDetailQuery } from "~/queries/projects";

const props = defineProps<{ projectId: string }>();
const queryCache = useQueryCache();

const prefetchProject = () => {
  const entry = queryCache.ensure(
    projectDetailQuery({ id: props.projectId }),
  );

  void queryCache.refresh(entry).catch(() => undefined);
};
</script>

<template>
  <NuxtLink
    :to="`/projects/${projectId}`"
    @pointerdown="prefetchProject"
  >
    View project
  </NuxtLink>
</template>
```

In this example, `pointerdown` starts the request before the `NuxtLink` navigation completes, while the link continues without waiting. A different trigger can be used when it reliably identifies the Query that will be needed next. The destination page or component uses the same Query options.

```vue
<script setup lang="ts">
import { useQuery } from "@pinia/colada";
import { projectDetailQuery } from "~/queries/projects";

const props = defineProps<{ projectId: string }>();

const { data: project } = useQuery(() =>
  projectDetailQuery({ id: props.projectId }),
);
</script>

<template>
  <ProjectDetails
    v-if="project"
    :project="project"
  />
</template>
```

If the prefetch has completed, `useQuery()` uses the cached result.
If it is still running, `useQuery()` reuses the same request.
If no prefetch occurred, `useQuery()` starts the normal request.

## Verified App Examples

- [`discussions.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/queries/discussions.ts) defines the Discussion detail Query options shared by prefetching, the detail page, and `DiscussionView.vue`.
- [`DiscussionsList.vue`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/components/DiscussionsList.vue) passes those options to Query Cache `ensure()` and starts `refresh()` from the View link's `pointerdown` without waiting for the request or replacing native link navigation.
- The [Discussion detail page](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/pages/app/discussions/[id].vue) and [`DiscussionView.vue`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/components/DiscussionView.vue) pass the same options to `useQuery()` after navigation.
- [`colada.options.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/colada.options.ts) suppresses global error handling for a marked prefetch only while its Query entry is inactive. Active Query failures retain the normal error behavior.

## Trade-offs and Limitations

Prefetching trades additional network and cache use for the possibility of a shorter wait. If no page or component uses the prefetched data, the request can still complete and leave a cache entry without providing a user-visible benefit. Use prefetching only when the data is likely to be needed often enough to justify that cost.

The benefit also depends on when and where the prefetch trigger runs. A late prefetch can still be running when the data is needed, while an early prefetch can become stale before use. A path that does not run the trigger receives no head start and begins loading through its normal `useQuery()` call. Prefetching changes when the request starts; it does not shorten the request or guarantee that the data will be ready.

Applications with global Query error handling must distinguish a failed inactive prefetch from an active Query failure. Error suppression should apply only while the unused prefetch remains inactive; otherwise, it can hide an error after the Query becomes active.

## Sources

- [Pinia Colada Prefetching](https://pinia-colada.esm.dev/cookbook/prefetching.html)
- [Pinia Colada Query Cache](https://pinia-colada.esm.dev/advanced/query-cache.html)
- [Pinia Colada Organizing Queries](https://pinia-colada.esm.dev/guide/queries.html#organizing-queries)

## Related Practices

- [Organize Queries by Domain with `defineQueryOptions()`](query-organization.md)
