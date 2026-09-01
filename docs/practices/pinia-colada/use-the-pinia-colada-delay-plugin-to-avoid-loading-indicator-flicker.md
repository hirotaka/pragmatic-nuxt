---
title: Use the Pinia Colada Delay Plugin to Avoid Loading Indicator Flicker During Short Background Refetches
semanticId: pinia-colada-background-loading-delay
category: query-loading
status: confirmed
---

# Use the Pinia Colada Delay Plugin to Avoid Loading Indicator Flicker During Short Background Refetches

## Practice

When the application refetches a Pinia Colada Query (referred to as a Query in this Practice) after its data has been displayed, the previous data remains visible while the request runs. Showing a loading indicator immediately during a short refetch can make the indicator flicker. Use the Pinia Colada Delay plugin (referred to as the Delay plugin in this Practice) so the background indicator appears only if the delayed `asyncStatus` value becomes `loading`; if the refetch finishes before the configured threshold, no indicator appears.

During initial loading, there is no previous data to display, so show loading feedback immediately when Query `status` is `pending` and no data is available. The request starts immediately; the Delay plugin only postpones the appearance of the loading indicator during a background refetch.

## Apply When

- Previously loaded data remains valid and visible while the Query refetches.
- The loading indicator should remain hidden for short refetches and appear only if the refetch is still pending after the chosen delay.

## Do Not Apply When

- You need to postpone or debounce request execution. The Delay plugin only delays the `asyncStatus` transition to `loading`.
- Loading feedback must appear when the request starts. Disable the delay with `delay: 0` or `delay: false` for that Query.
- The refetch has no valid content to keep visible. The Delay plugin does not supply previous data; configure Query Cache behavior or `placeholderData` separately.
- The UI requires the indicator to remain visible for a minimum duration after it appears. The Delay plugin controls when the indicator appears, not how long it remains visible.

## Why

A loading indicator shows when a request is still running. During a background refetch, previously loaded data remains visible. If the indicator appears only briefly, it flashes on and off while the existing data stays visible. Delaying the indicator prevents short refetches from showing it while allowing longer refetches to show loading feedback.

## Implementation Guidance

- Register `PiniaColadaDelayQuery()` to apply the delay to Query loading feedback.
- Choose a global delay that fits the application's UI. Override it per Query when a surface needs different timing. Use `delay: 0` or `delay: false` for immediate feedback.
- Keep initial and background loading feedback separate. Show initial loading when `status === "pending"` and no data is available. During a refetch, keep valid data visible and show a non-blocking indicator when `asyncStatus === "loading"`.
- The Delay plugin controls loading feedback, not which data remains visible. Use cached Query data or `placeholderData` to keep content visible during a request.

## Minimal Nuxt Example

Register `PiniaColadaDelayQuery()` in `colada.options.ts`. This example uses a 200ms delay; choose a threshold that fits the application's UI.

```ts
import { PiniaColadaDelayQuery } from "@pinia/colada-plugin-delay";
import type { PiniaColadaOptions } from "@pinia/colada";

export default {
  plugins: [
    PiniaColadaDelayQuery({ delay: 200 }),
  ],
} satisfies PiniaColadaOptions;
```

Use Query `status` for initial loading and delayed `asyncStatus` for background feedback. Keep the current data visible while the Query refetches. In this example, `projectListQuery` represents the application's existing Query definition.

```vue
<script setup lang="ts">
const { data, status, asyncStatus } = useQuery(projectListQuery);
</script>

<template>
  <AppSpinner
    v-if="status === 'pending' && !data"
    label="Loading projects"
  />

  <div v-else>
    <AppSpinner
      v-if="data && asyncStatus === 'loading'"
      label="Refreshing projects"
    />

    <ProjectList :projects="data ?? []" />
  </div>
</template>
```

Set `delay: 0` on a Query that must show feedback immediately.

```ts
export const activityQuery = defineQueryOptions(() => ({
  key: ["activity"],
  delay: 0,
  query: fetchActivity,
}));
```

## Verified App Examples

- [`colada.options.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/colada.options.ts) registers `PiniaColadaDelayQuery({ delay: 200 })` on the client only. A 200ms delay and client-only registration are choices for this application.
- [`DiscussionsList.vue`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/components/DiscussionsList.vue) renders initial loading from Query `status`. During a refetch, it keeps the table visible and shows the accessible `Refreshing discussions` status after delayed `asyncStatus` becomes `loading`.
- [`comments.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/comments/app/queries/comments.ts) sets `delay: 0` so the Comments Infinite Query shows Load More feedback immediately.

## Trade-offs and Limitations

During the configured delay, the request is already running but `asyncStatus` remains `idle`. The UI intentionally shows no loading feedback during this interval.

A longer delay hides more brief indicators but postpones feedback for slower requests. A shorter delay shows feedback sooner but allows more brief indicators to appear. Choose the delay based on the application's UI behavior.

A global delay affects every Query that does not override it, including initial loads, background refetches, prefetches, and Infinite Query requests. Use a per-Query override for surfaces that require immediate feedback.

## Sources

- [Pinia Colada Delay plugin guide](https://pinia-colada.esm.dev/plugins/official/delay.html)
- [`PiniaColadaDelayQuery()` API](https://pinia-colada.esm.dev/api/plugins/delay/src/functions/PiniaColadaDelayQuery.html)

## Related Practices

- [Synchronize Related Queries in the Background After Successful Writes](synchronize-related-queries-in-the-background-after-successful-writes.md)
- [Handle Page Changes with Paginated Queries](handle-page-changes-with-paginated-queries.md)
