---
title: Share Pagination Mechanics and Choose the Collection Strategy
semanticId: pagination-strategies
category: collection-strategies
prerequisites: [custom-api-fetchers, page-rendering-data, async-data-identity]
status: confirmed
---

# Share Pagination Mechanics and Choose the Collection Strategy

## Practice

Use one pagination state owner for both replacement-style pages and append-style load more. Let each feature keep its route-specific `useAPI` call and explicitly choose whether a successful page replaces or extends the visible collection.

Return the same response shape from paginated collection endpoints:

```ts
interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
```

## Apply When

- Multiple collections share page, loading, failure, and stale-response mechanics.
- Some collections replace the visible page while others append the next page.
- Initial collection data should participate in Nuxt SSR and hydration.
- Existing appended rows should remain visible when a later-page request fails.
- A resource identity change can invalidate an in-flight request.

## Do Not Apply When

- The server returns the complete collection in one bounded response.
- Cursor pagination cannot be represented by the shared page metadata.
- Virtualization or streaming requires a different collection model.
- Independent pages intentionally have different response contracts or settlement semantics.
- The endpoint returns a single resource or mutation outcome.

## Why

Replacement and append pagination differ in how successful responses update visible rows, but they share reactive query inputs, pending state, failure settlement, stale-response rejection, and scope-safe completion.

Keeping the route-specific `useAPI` call in the feature preserves generated request identity, server rendering, hydration, and endpoint inference. Passing that AsyncData owner to a common pagination composable centralizes timing-sensitive mechanics without hiding route details.

## Implementation Guidance

- Standardize paginated endpoints on `{ data, meta }` with page, limit, total, totalPages, and hasMore.
- Keep each `useAPI` call in its feature composable and pass the resulting AsyncData owner to a common pagination composable.
- Register pagination watchers and scope disposal before awaiting initial settlement.
- Synchronize initial data immediately so SSR renders page one and hydration does not issue a duplicate GET.
- Choose `replace` for page navigation and `append` for load more at the feature boundary.
- Let UI owners call and await `loadPage()` directly.
- Replace rows on page one and append only a later page that has not already been published.
- Ignore load-more calls while pending or when `hasMore` is false.
- Preserve accumulated rows when a later-page request fails.
- Reset to page one when resource identity or page size changes.
- Allow only the latest request for the current resource to publish or settle local state.
- On disposal, invalidate local work without clearing shared AsyncData another consumer may use.

## Minimal Nuxt Example

```ts
export async function useActivities(projectId: MaybeRefOrGetter<string>) {
  const page = ref(1);
  const currentProjectId = computed(() => toValue(projectId));

  const read = useAPI("/api/activities", {
    query: { projectId: currentProjectId, page, limit: 10 },
    watch: false,
  });

  const pagination = usePaginatedData<Activity>(read, {
    strategy: "append",
    page,
    resourceKey: currentProjectId,
  });

  await read;
  return pagination;
}
```

## Verified App Examples

- `useDiscussions()` keeps its typed route-specific `useAPI` call and selects replacement pagination.
- `DiscussionsList` uses `loadPage()` for ordinary navigation and post-delete page clamping.
- Discussion page one is server-rendered and hydrates without a duplicate browser GET.
- `useComments()` keeps its typed `useAPI` call and selects append pagination.
- Comment page one replaces the collection; later pages append without republishing a loaded page.
- A later comment-page failure preserves accumulated comments.
- A discussion identity change resets comments and prevents an obsolete response from publishing.

## Trade-offs and Limitations

The common owner adds generation and settlement logic beyond a direct `useAPI` call. Focused checks should cover replace, append, duplicate prevention, later-page failure, resource transitions, and disposal.

Generated AsyncData identity can be shared by multiple consumers. Local disposal should stop local writes, but clearing shared data can disrupt a surviving consumer. The page-based contract does not define cursor encoding, virtualization, streaming, request deadlines, or timeout notifications.

## Sources

- [Nuxt Data Fetching](https://nuxt.com/docs/4.x/getting-started/data-fetching)
- [Nuxt Custom useFetch](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch)

## Related Practices

- [Use Configured API Fetchers for App-Owned Requests](custom-api-fetchers.md)
- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Let Request Inputs Define AsyncData Identity](async-data-identity.md)
- [Keep Existing Data Visible During Refresh](refresh-data-visibility.md)
- [Distinguish Mutation Failures from Data Refresh Failures](mutation-refresh-outcomes.md)
