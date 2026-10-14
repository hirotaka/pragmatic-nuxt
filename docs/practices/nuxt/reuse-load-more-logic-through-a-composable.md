---
title: Reuse Load More Logic Through a Composable
semanticId: reuse-load-more-logic-through-a-composable
category: data-fetching
prerequisites: []
status: confirmed
---

# Reuse Load More Logic Through a Composable

## Practice

Extract the common behavior of load more lists into a reusable Nuxt composable. Let each list supply its request inputs and next-page rule, while the composable manages fetching, accumulated results, and loading state. Components display the results and invoke the returned load more action instead of implementing that behavior themselves.

## Apply When

- Multiple lists need the same load more behavior but use different endpoints or query parameters.
- Lists append results after successful requests and retain displayed items during pending or failed requests.
- The first page should be available during SSR and reused during hydration.

## Do Not Apply When

- Pagination uses page navigation to replace the displayed items with the selected page's results.
- A list displays all its items from a single response.
- Lists require substantially different accumulation or request lifecycles that would make the composable depend on list-specific branches.

## Why

Load more lists repeat the same coordination: fetch the first page, retain loaded results, request the next page, and prevent overlapping requests. Implementing this in each component duplicates state transitions and makes fixes harder to apply consistently.

Separating those operations from endpoint and pagination settings makes the behavior reusable without coupling it to one domain. Components can focus on presentation, while list-specific composables describe what to request and how to find the next page.

## Implementation Guidance

- Accept list-specific settings: the endpoint, initial page, query builder, and next-page rule.
- Use `useFetch` for the first page and `$fetch` for load more, or their custom wrappers.
- Keep accumulated pages local to each call. Append successful results, retain existing pages on failure, and prevent overlapping requests.
- Return the pages, loading state, next-page availability, and load more action for components to use.
- Start a fresh call when the resource changes, and cancel pending requests when the old call's scope is disposed.

## Minimal Nuxt Example

This composable supports numbered pages. Callers provide the endpoint and pagination rules; the common implementation handles initial fetching, accumulation, and subsequent requests.

```ts
// app/composables/useLoadMore.ts
interface LoadMoreOptions<Page> {
  initialPage: number;
  query: (page: number) => Record<string, string | number | boolean>;
  nextPage: (lastPage: Page) => number | null;
}

export async function useLoadMore<Page>(
  endpoint: string,
  options: LoadMoreOptions<Page>,
) {
  const firstPage = useFetch(endpoint, {
    query: options.query(options.initialPage),
    transform: (page: Page) => ({ pages: [page] }),
  });
  const pages = shallowRef<Page[]>([]);
  const pending = shallowRef<AbortController>();
  const isLoadingMore = computed(() => !!pending.value);
  const nextPage = computed(() => {
    const last = pages.value.at(-1);
    return last === undefined ? null : options.nextPage(last);
  });
  const hasNextPage = computed(() => nextPage.value !== null);

  onScopeDispose(() => pending.value?.abort());

  async function loadMore() {
    const page = nextPage.value;
    if (pending.value || page === null) return;
    const controller = new AbortController();
    pending.value = controller;
    try {
      const result = await $fetch<Page, string>(endpoint, {
        query: options.query(page),
        signal: controller.signal,
      });
      if (!controller.signal.aborted) pages.value = [...pages.value, result];
    }
    catch {
      // Present request errors through the application's error handling.
      // Keep previously loaded pages unchanged.
    }
    finally {
      pending.value = undefined;
    }
  }

  await firstPage;
  if (firstPage.data.value) pages.value = firstPage.data.value.pages;

  return { pages, isLoadingMore, hasNextPage, loadMore };
}
```

Each call creates its own accumulated pages and additional-request state. The next-page rule returns `null` when loading is complete. A failed request leaves loaded pages intact. Scope disposal aborts the pending request, and the abort check prevents its response from appending results. Error presentation is omitted from this example.

```ts
// app/composables/useActivities.ts
interface ActivityPage {
  items: { id: string; title: string }[];
  meta: { page: number; hasMore: boolean };
}

export function useActivities(projectId: string) {
  return useLoadMore<ActivityPage>(`/api/projects/${projectId}/activities`, {
    initialPage: 1,
    query: page => ({ page, limit: 10 }),
    nextPage: ({ meta }) => meta.hasMore ? meta.page + 1 : null,
  });
}
```

The list-specific composable supplies the endpoint and interprets its pagination metadata. A component awaits `useActivities(projectId)`, flattens the returned pages' `items` for display, and connects its button to `loadMore`. Keying that component by `projectId` creates a fresh call when the project changes, rather than carrying the old project's accumulated results into the new list.

## App Examples

- [`useInfiniteAPI.ts`](../../../apps/bulletproof-nuxt/app/composables/useInfiniteAPI.ts) implements reusable fetching and accumulation for load more lists.
- [`useCommentList.ts`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useCommentList.ts) supplies the comment endpoint and pagination rules to the reusable composable.
- [`CommentList.vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/CommentList.vue) displays accumulated comments and invokes the returned load more action.

## Trade-offs and Limitations

Keeping loaded pages in memory increases memory use as users load more. Because each composable call keeps its own accumulated pages, two lists showing the same resource can also request and retain the same additional pages independently.

## Sources

- [Vue: Composables](https://vuejs.org/guide/reusability/composables.html)
- [Nuxt: `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt: `$fetch`](https://nuxt.com/docs/4.x/api/utils/dollarfetch)
- [Vue: `onScopeDispose`](https://vuejs.org/api/reactivity-advanced.html#onscopedispose)

## Related Practices

- [Keep Pagination State in the URL](keep-pagination-state-in-the-url.md)
- [Use useFetch Semantics for Page Rendering Data](../nuxt-use-fetch/page-rendering-data.md)
- [Define Domain and Feature API Calls in Composables](../nuxt-use-fetch/domain-feature-api-calls.md)
