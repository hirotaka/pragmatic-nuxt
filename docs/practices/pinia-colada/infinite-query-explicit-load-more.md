---
title: Use Infinite Queries for Load More Lists
semanticId: pinia-colada-infinite-query-explicit-load-more
category: infinite-queries
status: confirmed
---

# Use Infinite Queries for Load More Lists

## Practice

Use `useInfiniteQuery()` when a list needs "Load More" or infinite scrolling behavior.
Infinite Queries are also a good fit when all loaded pages should be invalidated and
refetched as one unit, or when pages should not be garbage-collected independently.

## Apply When

- The list uses "Load More" or infinite scrolling behavior.
- All loaded pages should be invalidated and refetched together.
- Pages should not be garbage-collected independently.

## Do Not Apply When

- The UI shows one page at a time and replaces the displayed page when the user changes
  pages. Use a regular paginated Query for that behavior.
- Each page needs to be a separate cache entry with independent invalidation, refetch, or
  garbage collection.

## Why

Infinite Queries load and merge multiple pages into a single cache entry. A regular
paginated Query with `useQuery()` creates a separate cache entry for each page because the
page is part of the Query key.

With an Infinite Query, the resource identity and filters belong in the Query key, but the
page or cursor does not. The page or cursor is passed as `pageParam`, so calling
`loadNextPage()` adds the next page to the same cache entry. Changing the Query key creates
a new cache entry and resets the Infinite Query.

`getNextPageParam` defines how to obtain the next page parameter from the response. When
it returns `null` or `undefined`, `hasNextPage` becomes false and `loadNextPage()` does
nothing.

## Implementation Guidance

- Define the resource identity and result-changing filters in the Query key.
- Pass the page or cursor through `pageParam`, not the Query key.
- Set `initialPageParam`, pass each received `pageParam` to the API request, and return
  the next value from `getNextPageParam`.
- Render `data.pages` as one list.
- Show the Load More action while `hasNextPage` is true and call `loadNextPage()` from
  that action.

## Minimal Nuxt Example

```ts
const {
  data,
  hasNextPage,
  loadNextPage,
} = useInfiniteQuery(() => ({
  key: ['comments', { discussionId: discussionId.value }],
  initialPageParam: 1,
  query: ({ pageParam, signal }) => $fetch('/api/comments', {
    signal,
    query: {
      discussionId: discussionId.value,
      page: pageParam,
      limit: 10,
    },
  }),
  getNextPageParam: lastPage => lastPage.meta.hasMore
    ? lastPage.meta.page + 1
    : undefined,
}))

const comments = computed(() => data.value?.pages.flatMap(page => page.data) ?? [])
```

The component can render `comments` as one list and show a "Load More" button while
`hasNextPage` is true.

## Verified App Examples

- [`comments.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/comments/app/queries/comments.ts)
  defines a discussion-scoped Query key, keeps the page number out of that key, passes
  `pageParam` to the Comments API, and derives the next page from response metadata.
- [`CommentsList.vue`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/comments/app/components/CommentsList.vue)
  renders `data.pages` as one list and offers an accessible `Load More Comments` button
  while `hasNextPage` is true.

## Trade-offs and Limitations

All loaded pages belong to one cache entry. Invalidating or refetching that entry applies
to the loaded pages as a unit, and pages cannot be garbage-collected independently.

The current app uses an explicit Load More button. Infinite scrolling can use the same
Infinite Query, but its trigger and interaction states are outside this Practice.

## Sources

- [Pinia Colada Infinite Queries](https://pinia-colada.esm.dev/guide/infinite-queries.html)

## Related Practices

- [Handle Page Changes with Paginated Queries](handle-page-changes-with-paginated-queries.md)
- [Organize Queries by Domain with `defineQueryOptions()`](query-organization.md)
- [Organize Mutations by Domain with `defineMutationOptions()`](mutation-ownership-and-invalidation.md)
