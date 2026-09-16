---
title: Update Paginated Lists Differently for Page Navigation and Load More
semanticId: pagination-strategies
category: collection-strategies
prerequisites: [page-rendering-data, async-data-identity]
status: confirmed
---

# Update Paginated Lists Differently for Page Navigation and Load More

## Practice

Paginated lists let users browse results one page at a time or load more items into the same view. Page navigation replaces what is shown; loading more extends it. Keep this distinction clear in how the list changes.

For page navigation, replace the displayed items with those from the selected page after the load succeeds.

For a load more interaction, keep the displayed items and append the next page's items after the load succeeds. A pending or failed load must not remove items the user has already loaded. Limit item accumulation to one list. When switching to another list, start from its first page without carrying over the previous items.

## Apply When

Use this practice when:

- An endpoint returns one page from a larger list rather than the entire list at once.
- The interface supports one or both of these interactions:
  - Moving between pages, where the selected page replaces the displayed items.
  - Loading more results, where new items extend the displayed list.
- The first page must be available in server-rendered output and reused during hydration.

## Do Not Apply When

Do not use this practice when:

- The interface displays the complete list in one response and provides neither page navigation nor load more.
- Pagination uses a cursor or continuation token instead of page numbers.
- Virtualization or streaming requires a different model for deciding which items remain visible.
- Changing the page size must preserve the user's position or previously loaded items.
- The operation returns a single item or the outcome of a change rather than a paginated list.

## Why

Page navigation and load more differ in what should remain visible after the next page arrives. With page navigation, the previous page no longer belongs in the selected view. With load more, the items already shown remain part of the list the user is browsing.

This difference changes the state each behavior needs. Page navigation needs only the selected page and its results. Load more must preserve accumulated items as later pages arrive. Applying accumulation rules to page navigation adds unnecessary coordination, while replacing the list during load more discards the user's browsing progress.

For load more, a pending or failed request must not erase accumulated items. Those items must instead be cleared when the user begins browsing a different list.

## Implementation Guidance

- For example, structure successful responses from a page-based list endpoint as `{ data, meta }`. In this response shape, `data` contains the items from the requested page, while `meta` contains `page`, `limit`, `total`, `totalPages`, and `hasMore`.
- Fetch the first page during SSR. Include its items in the initial HTML and reuse the response from the Nuxt payload during hydration, using one request across SSR and hydration.
- For page navigation, replace the displayed items after the selected page loads so the list contains only items from that page.
- For load more, let page one replace the list. Append items from each later page at most once and only after the load succeeds.
- Wait for a pending page to finish before loading another page, and stop loading pages when `hasMore` becomes `false`. Keep accumulated items when a later page fails.
- Associate accumulated items with the list they belong to. When that list changes, restart from page one and prevent obsolete work from updating the new list. When pagination state is discarded, prevent its pending work from updating local state and leave state used elsewhere intact.

## Minimal Nuxt Example

For page navigation, pass the selected page as a reactive query value and use the returned AsyncData state as the current page.

```ts
// layers/discussions/app/composables/useDiscussions.ts
export function useProjects(page: MaybeRefOrGetter<number>) {
  return useFetch<PaginatedResult<Project>>("/api/projects", {
    query: {
      page,
      limit: 10,
    },
  });
}
```

For load more, keep the request state separate from the accumulated list. In this example, `usePaginatedData` is an application composable that implements the append behavior described above; it is not a Nuxt API.

```ts
// layers/base/app/composables/usePaginatedData.ts
export async function useActivities(
  projectId: MaybeRefOrGetter<string>,
) {
  const page = ref(1);
  const listKey = computed(() => toValue(projectId));

  const read = useFetch<PaginatedResult<Activity>>("/api/activities", {
    query: {
      projectId: listKey,
      page,
      limit: 10,
    },
    watch: false,
  });

  const pagination = usePaginatedData<Activity>(read, {
    strategy: "append",
    page,
    resourceKey: listKey,
  });

  await read;
  return pagination;
}
```

The first composable replaces its current result when the selected page changes. The second uses the same page response shape while keeping an accumulated list for load more.

## App Examples

- [`useDiscussions.ts`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussions.ts) passes the reactive page and limit values to its collection request and returns the AsyncData state used for page replacement.
- [`DiscussionsCollection.vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/DiscussionsCollection.vue) displays the returned page and updates the page value after the user selects another page.
- [`useComments.ts`](../../../apps/bulletproof-nuxt/layers/comments/app/composables/useComments.ts) uses append pagination for comments and associates the accumulated items with the current discussion ID.
- [`usePaginatedData.ts`](../../../apps/bulletproof-nuxt/layers/base/app/composables/usePaginatedData.ts) replaces page one, appends later pages, preserves accumulated items after a later-page failure, and ignores obsolete work.
- [`comments/index.get.ts`](../../../apps/bulletproof-nuxt/layers/comments/server/api/comments/index.get.ts) returns serialized comment items with page metadata.

## Trade-offs and Limitations

Page navigation can display one page without maintaining an accumulated list. Load more requires additional state for accumulated items, pending requests, published pages, list changes, and obsolete work. This state increases implementation and testing effort.

Each page-number request observes the list at a different time. Items inserted or deleted between requests can move between pages, so an appended list may contain the same item twice or miss an item. Appending each page at most once prevents page-level repetition only; item-level deduplication remains a separate concern.

The guidance above assumes a fixed page size and page numbers. Cursor pagination needs rules based on its continuation token. Streaming and virtualization need different rules for deciding which items remain visible. Changing the page size needs explicit rules for the user's current position and any accumulated items. Retry policies and request timeouts also remain separate concerns.

## Sources

- [Nuxt Data Fetching](https://nuxt.com/docs/4.x/getting-started/data-fetching)
- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)

## Related Practices

- [Use useFetch Semantics for Page Rendering Data](page-rendering-data.md)
- [Let Request Inputs Define AsyncData Identity](async-data-identity.md)
- [Share AsyncData Through Feature Composables](shared-async-data.md)
- [Keep Existing Data Visible During Refresh](refresh-data-visibility.md)
- [Handle API Error Notifications in Custom Fetchers](api-error-notifications.md)
