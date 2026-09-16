---
title: Share AsyncData Through Feature Composables
semanticId: shared-async-data
category: async-data-lifecycle
prerequisites: [page-rendering-data, async-data-identity]
status: confirmed
---

# Share AsyncData Through Feature Composables

## Practice

Use a feature composable to share AsyncData state between components that need the same API data, loading or error state, or refresh operation. Let these components call the composable directly. Pass data as props to components that only display it.

## Apply When

Use this practice when:

- Multiple components need access to the same API data, loading state, or error state.
- A component needs to refresh data that other components also use, such as after saving an edit.

## Do Not Apply When

Do not use this practice when:

- A component only displays data provided to it.
- Components need separate data, loading, or error states for the same resource.
- Components require incompatible data-shaping options, such as different `transform` or `pick` settings.
- The only goal is to guarantee a single HTTP request.

## Why

Compatible `useFetch` calls with the same AsyncData key access the same `data`, `error`, and `status`. A refresh initiated by one component updates the shared state used by the others.

A feature composable keeps the request and `useFetch` options together. An editor can read the shared data and call `refresh()` after saving. Intermediate components do not need to forward a refresh callback they do not use. Display components can receive data as props, keeping their presentation logic independent of how the data is fetched.

## Implementation Guidance

- Keep the request and shared `useFetch` options in a feature composable that returns AsyncData. Components sharing the resource should pass matching inputs and resolve to the same AsyncData key.
- Keep `default`, `transform`, `pick`, `deep`, and `getCachedData` consistent across calls sharing a key.
- Obtain `refresh()` from that composable in the component that needs to refresh the resource. Keep display-only components driven by props.
- Define shared request hooks, such as `onRequestError` and `onResponseError`, in the configured fetcher or feature composable. Perform component-specific actions, such as closing an edit dialog after a successful save, in the component's save handler.
- When switching resources, pass the ID that belongs to the displayed data to dependent components. Avoid pairing a new route ID with data from the previous resource.

## Minimal Nuxt Example

Define the shared request in `useProject`.

```ts
// useProject.ts
export function useProject(id: MaybeRefOrGetter<string>) {
  return useFetch(() => `/api/projects/${toValue(id)}`);
}
```

The page reads the project and passes the ID from the loaded data to `ProjectEditor`.

```vue
<!-- layers/discussions/app/pages/app/discussions/[id].vue -->
<script setup lang="ts">
const { data: project } = await useProject("project-1");
</script>

<template>
  <ProjectEditor
    v-if="project"
    :project-id="project.id"
  />
</template>
```

The editor receives only `projectId`. It reads the project and obtains `refresh()` from the same composable, rather than receiving the data or a refresh callback from the page.

```ts
// ProjectEditor.vue — script setup
const props = defineProps<{
  projectId: string;
}>();

const { data: project, refresh } = await useProject(
  () => props.projectId,
);
```

With the same project ID, both components use the same `useFetch` call site and generated AsyncData key. The editor can call `refresh()` after saving, and the page sees the updated shared state.

## App Examples

- [`useDiscussion.ts`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussion.ts) centralizes the discussion detail request through `useAPI` for the page, `DiscussionView`, and `UpdateDiscussion`.
- [`[id].vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/pages/app/discussions/%5Bid%5D.vue) calls `useDiscussion()` with the route ID and passes the fetched `discussion.id` to `DiscussionView`.
- [`DiscussionView.vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/DiscussionView.vue) reads the discussion through the same composable and passes its ID to `UpdateDiscussion`. It passes the discussion body to [`MarkdownPreview.vue`](../../../apps/bulletproof-nuxt/app/components/app/MarkdownPreview.vue) as a prop, keeping Markdown rendering independent of data fetching.
- [`UpdateDiscussion.vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/UpdateDiscussion.vue) copies the shared title and body into local form state and obtains `refresh()` from `useDiscussion()`. It calls `refresh()` after the update succeeds, without receiving a refresh callback through props.

## Trade-offs and Limitations

Sharing AsyncData state does not guarantee a single HTTP request. Nested components can start separate server-side fetches sequentially when they await the same composable. `dedupe` handles overlapping fetches, not later calls after the previous fetch has completed.

During hydration, Nuxt can reuse the server result from its payload without making another browser request. The number of composable calls therefore does not determine the number of HTTP requests.

With `server: false`, the component does not start a server-side fetch. Another server-side read may still supply the shared data. Otherwise, on the initial page load, the component waits for a browser fetch to complete before it can display that data.

## Sources

- [Nuxt: `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt: `useAsyncData`](https://nuxt.com/docs/4.x/api/composables/use-async-data)

## Related Practices

- [Use useFetch Semantics for Page Rendering Data](page-rendering-data.md)
- [Let Request Inputs Define AsyncData Identity](async-data-identity.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
