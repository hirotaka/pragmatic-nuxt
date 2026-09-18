---
title: Load More Pages with Infinite Queries
semanticId: load-more-pages-with-infinite-queries
category: pagination
status: confirmed
---

# Load More Pages with Infinite Queries

## Practice

Use an infinite query when a list loads more data onto an existing set of data. Let the user request the next page with a "load more" action. If that request fails, keep the existing data visible and offer a retry.

## Apply When

Use this practice when:

- Each new page should be added to the existing list without replacing the data already displayed.
- After each request, the list can determine whether another page is available.
- The user should choose when to load the next page through an explicit "load more" action rather than automatic scrolling.

## Do Not Apply When

Do not use this practice when:

- Page navigation should replace the data currently displayed instead of adding to it.
- The list should load the next page automatically as the user scrolls.
- The list must load both earlier and later pages or preserve its loaded pages across sessions.

## Why

Adding each page to the existing list preserves the user's place and keeps earlier pages available. If the request for the next page fails, replacing the list with an error would hide pages that are still usable. Keeping those pages visible and showing a separate retry lets the user continue reading and decide when to try the failed request again.

## Implementation Guidance

- Define the infinite query options with `infiniteQueryOptions()` and read them with `useInfiniteQuery()`.
- Include every value used to select the list, such as an account or parent record identifier, in the query key.
- Set `initialPageParam` and return the next page parameter from `getNextPageParam`. Return `undefined` when no next page is available.
- Pass the query function's `AbortSignal` to the request.
- Render all loaded pages from `data.pages`. Keep them visible while the request for another page is pending or after it fails.
- Call `fetchNextPage()` only when `hasNextPage` is true and `isFetchingNextPage` is false. Use the same action to retry a failed request.

## Minimal Nuxt Example

```ts
// app/queries/comments.ts
export function commentsInfiniteQuery(discussionId: string) {
  const { $api } = useNuxtApp();

  return infiniteQueryOptions({
    queryKey: ["comments", discussionId],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }): Promise<PaginatedComments> =>
      $api<PaginatedComments>("/api/comments", {
        query: { discussionId, page: pageParam },
        signal,
      }),
    getNextPageParam: lastPage =>
      lastPage.meta.hasMore ? lastPage.meta.page + 1 : undefined,
  });
}
```

```ts
// app/components/Comments.vue
const commentsQuery = useInfiniteQuery(commentsInfiniteQuery(discussionId));
const comments = computed(() =>
  commentsQuery.data.value?.pages.flatMap(page => page.data) ?? [],
);

async function loadMore(): Promise<void> {
  if (!commentsQuery.hasNextPage.value || commentsQuery.isFetchingNextPage.value) return;

  await commentsQuery.fetchNextPage();
}
```

`data.pages` keeps the pages loaded before a request fails. The same `loadMore()` function can handle both the explicit "load more" action and its retry action.

## App Examples

- [`comments.ts`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/comments/app/queries/comments.ts) defines infinite query options with the discussion in the query key, an initial page parameter, and the calculation for the next page.
- [`Comments.vue`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/comments/app/components/Comments.vue) reads the infinite query, combines `data.pages` for display, and prevents duplicate requests for another page.
- [`CommentsList.vue`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/comments/app/components/CommentsList.vue) keeps loaded comments visible and provides separate "load more" and retry actions when a request for another page fails.

## Trade-offs and Limitations

Keeping loaded pages and their page parameters in one infinite query supports loading another page and retrying its request, but the cached result becomes larger as the user loads more pages.

An infinite query does not provide navigation between numbered pages or direct URL access to a specific page. It cannot determine whether another page exists unless a fetched page provides enough pagination information for `getNextPageParam`.

## Sources

- [TanStack Query: Infinite Queries](https://tanstack.com/query/latest/docs/framework/vue/guides/infinite-queries)

## Related Practices

- [Use Nuxt Query to Integrate TanStack Query with Nuxt](use-nuxt-query-to-integrate-tanstack-query-with-nuxt.md)
- [Keep Query Keys and Query Functions Together as Reusable Query Options](keep-query-keys-and-query-functions-together-as-reusable-query-options.md)
- [Keep Mutation Success Separate from Query Refetch Failures](keep-mutation-success-separate-from-query-refetch-failures.md)
