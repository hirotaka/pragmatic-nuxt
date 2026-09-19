---
title: Let Request Inputs Define AsyncData Identity
semanticId: async-data-identity
category: async-data-lifecycle
prerequisites: [page-rendering-data]
status: confirmed
---

# Let Request Inputs Define AsyncData Identity

## Practice

Use Nuxt-generated AsyncData keys by default. When request inputs such as page numbers or resource IDs change, pass them as reactive query values or URLs rather than duplicating them in a manually constructed key. Provide an explicit key when your application needs to access data by key or keep separate state for otherwise identical requests.

## Apply When

Use this practice when:

- The request URL and query parameters do not change, as with a simple user list.
- Query parameters such as page number, search text, or sort order determine which results to fetch.
- The resource ID in the URL determines which resource to fetch.
- You need to access or refresh the fetched data by a known key through `useNuxtData()` or `refreshNuxtData()`.
- You need to keep AsyncData state separate for otherwise identical requests.

## Do Not Apply When

Do not use this practice when:

- Requests need a separate AsyncData state for values that Nuxt does not include in the generated key, such as a language header.
- The application controls when to fetch data after request inputs change, instead of relying on automatic refetching.

## Why

Letting Nuxt generate the key means that adding or changing a page number, search term, or resource ID does not require a matching change to a manually constructed key.

Reactive URLs and query values also let Nuxt handle data fetching when those inputs change, without a separate watcher just to call `refresh()`.

## Implementation Guidance

- Keep pagination, search, and sort inputs reactive when passing them through the `query` option.
- Use a reactive URL when the resource to fetch can change.
- Let Nuxt handle refetching when those inputs change. Use `refresh()` for an explicit rerun of the current request.
- If an explicit key depends on changing request inputs, keep the key reactive as well.

## Minimal Nuxt Example

```ts
// layers/discussions/app/composables/useDiscussions.ts
const page = ref(1);
const projectId = ref("project-1");

const { data: projects } = await useFetch("/api/projects", {
  query: { page },
});

const { data: project } = await useFetch(
  () => `/api/projects/${projectId.value}`,
);
```

Nuxt generates the keys for both calls. Changing the value of `page` changes the list's query parameters and generated key. Changing the value of `projectId` changes the URL for the detail request and its generated key. With automatic refetching enabled, Nuxt fetches the data for the updated inputs.

## App Examples

- [`useDiscussions.ts`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussions.ts) passes reactive `page` and `limit` values through `query` and uses a stable key containing the current page so create settlement can refresh the list without starting another list read.
- [`useComments.ts`](../../../apps/bulletproof-nuxt/layers/comments/app/composables/useComments.ts) uses a reactive key containing the Discussion ID and current page so create settlement refreshes the matching Comment list.
- [`useDiscussion.ts`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussion.ts) uses a URL getter so the request URL follows changes to the discussion ID.
- [`useUsers.ts`](../../../apps/bulletproof-nuxt/layers/users/app/composables/useUsers.ts) calls `useAPI` with the fixed `/api/users` URL and leaves key generation to Nuxt.

## Trade-offs and Limitations

Nuxt generates keys from call-site information, the request URL, and selected fetch options. The same URL and query parameters at different call sites may therefore produce different keys.

Generated keys are useful for managing request inputs without a separate naming scheme, but they are not stable names for application code to reference. Use an explicit key when the code needs to identify the data by name, such as with `useNuxtData()` or `refreshNuxtData()`.

## Sources

- [Nuxt: `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt: `useAsyncData`](https://nuxt.com/docs/4.x/api/composables/use-async-data)
- [Nuxt: `useNuxtData`](https://nuxt.com/docs/4.x/api/composables/use-nuxt-data)
- [Nuxt 4.5.1: `useFetch` source](https://github.com/nuxt/nuxt/blob/v4.5.1/packages/nuxt/src/app/composables/fetch.ts)

## Related Practices

- [Use useFetch Semantics for Page Rendering Data](page-rendering-data.md)
- [Share AsyncData Through Feature Composables](shared-async-data.md)
- [Update Paginated Lists Differently for Page Navigation and Load More](pagination-strategies.md)
