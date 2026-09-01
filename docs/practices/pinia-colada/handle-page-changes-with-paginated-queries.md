---
title: Handle Page Changes with Paginated Queries
semanticId: pinia-colada-handle-page-changes-with-paginated-queries
category: paginated-queries
status: confirmed
---

# Handle Page Changes with Paginated Queries

## Practice

For a paginated Query, make the Query key that includes the page number reactive to
page changes. Keep the previous data through `placeholderData` while navigating
between pages.

## Apply When

- The list is split into multiple pages and shows one page at a time.
- Each page is fetched when the user switches to it.
- The previous page should remain visible while the new page is loading.

## Do Not Apply When

- The user wants to accumulate pages in one result. Use `useInfiniteQuery()` and
  `pageParam` for that behavior instead.
- The operation creates, updates, or deletes data. Use a Mutation for that operation.

## Why

Pinia Colada uses the Query key to identify a Query in the cache. When the page
number in a reactive Query key changes, the Query key changes as well. This triggers
the request for the new page and creates a new cache entry for it.

The new cache entry has no data until the request completes. Returning the previous
data through `placeholderData` lets the UI keep displaying the previous list while
the new page is loading. The placeholder is not saved in the new cache entry. When
the request completes, the new page's data replaces the placeholder data.

## Implementation Guidance

- Make the Query key change when `page` changes.
- Include `page` and `limit` in both the Query key and the API request so the Query
  key matches the result being fetched.
- Return the previous data through `placeholderData` so the previous list remains
  visible while the new page is loading.
- Distinguish the initial data state from a fetch while previous data is displayed:
  use `status` for the initial data state and `asyncStatus` for the in-progress fetch.

## Minimal Nuxt Example

```ts
const route = useRoute()
const page = computed(() => Number(route.query.page || 1))
const limit = 10

const { data, status, asyncStatus } = useQuery(() => ({
  key: ['projects', { page: page.value, limit }],
  query: ({ signal }) => $fetch('/api/projects', {
    signal,
    query: { page: page.value, limit },
  }),
  placeholderData: previousData => previousData,
}))
```

When `page` changes, the Query key changes and the new page starts loading. While the
request is pending, `placeholderData` keeps the previous page's result in `data`,
`status` remains `success`, and `asyncStatus` is `loading`. When the request
completes, `data` changes to the new page's result.

## Verified App Examples

- [`discussions.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/queries/discussions.ts)
  includes `page` and `limit` in the Discussions list Query key, sends the same
  values to `/api/discussions`, and returns the previous data through
  `placeholderData`.
- [`DiscussionsList.vue`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/components/DiscussionsList.vue)
  derives Query options from the reactive `currentPage`, updates the Query key when
  the page changes, and shows `Refreshing discussions` while `asyncStatus` is
  `loading` with previous data available.

## Trade-offs and Limitations

While the new page is loading, `data` contains the previous page's result. The page
being requested and the data being displayed therefore differ temporarily.

While placeholder data is returned, `status` is `success` because previous data is
available, while `asyncStatus` is `loading` because the new page is being fetched.
The UI cannot determine the loading state from `status` alone and must also use
`asyncStatus`, which adds more conditional states to handle.

`placeholderData` does not prefetch the new page or make the request faster. It only
returns the previous data temporarily while the new page is being fetched.

When there is no previous data, such as during the initial fetch, `placeholderData`
cannot provide a result. The UI still needs a normal initial loading state.

## Sources

- [Pinia Colada Query Keys](https://pinia-colada.esm.dev/guide/query-keys.html)
- [Pinia Colada Queries](https://pinia-colada.esm.dev/guide/queries.html)
- [Pinia Colada Paginated Queries](https://pinia-colada.esm.dev/guide/paginated-queries.html)
- [Pinia Colada Infinite Queries](https://pinia-colada.esm.dev/guide/infinite-queries.html)
- [Nuxt `useRoute`](https://nuxt.com/docs/4.x/api/composables/use-route)

## Related Practices

- [Organize Queries by Domain with `defineQueryOptions()`](query-organization.md)
- [Use Infinite Queries for Load More Lists](infinite-query-explicit-load-more.md)
- [Organize Mutations by Domain with `defineMutationOptions()`](mutation-ownership-and-invalidation.md)
