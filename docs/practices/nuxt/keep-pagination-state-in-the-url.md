---
title: Keep Pagination State in the URL
semanticId: keep-pagination-state-in-the-url
category: routing
prerequisites: []
status: confirmed
---

# Keep Pagination State in the URL

## Practice

For numbered page navigation in a Nuxt application, the URL query holds the selected page. The list derives its page number from the current route, and selecting another page updates the URL.

## Apply When

- A list displays one numbered page of results at a time.
- Reloading, sharing a link, or using browser back and forward should restore the selected page.

## Do Not Apply When

- A list accumulates items through a load more interaction rather than navigating between numbered pages.
- Pagination is temporary state inside a dialog or component and should not affect the URL or browser history.

## Why

A page number stored only in component state is lost when the page reloads and is absent from a shared link. Keeping a separate page number in shared state can also make a plain list URL reopen a previously selected page.

Reading the page number from the URL gives direct visits, reloads, and browser history the same input. A reactive query passed to `useFetch` then connects that selection to the list request without maintaining a second writable page value.

## Implementation Guidance

- Read the page query parameter through Nuxt's `useRoute` and derive a positive integer page number. Use page one when the parameter is missing or invalid.
- Pass the derived page number as a reactive query value to `useFetch` or a composable that wraps it.
- Update the route with `navigateTo` when a page is selected. Preserve unrelated query parameters, and omit the page parameter for page one.
- Keep the default history push behavior when users should be able to return to earlier page selections with the browser's back button.

## Minimal Nuxt Example

This composable reads a page number from the URL and uses it to request a product list. The `/api/products` endpoint accepts `page` and `limit` query parameters.

```ts
// app/composables/useProducts.ts
export async function useProducts() {
  const route = useRoute();
  const page = computed(() => {
    const value = typeof route.query.page === "string"
      ? Number(route.query.page)
      : Number.NaN;
    return Number.isSafeInteger(value) && value > 0 ? value : 1;
  });

  const { data, status } = await useFetch("/api/products", {
    query: { page, limit: 10 },
  });

  const setPage = (nextPage: number) => navigateTo({
    path: route.path,
    query: {
      ...route.query,
      page: nextPage === 1 ? undefined : String(nextPage),
    },
    hash: route.hash,
  });

  return { page, data, status, setPage };
}
```

The computed value normalizes the URL parameter without storing another page number. Calling `setPage(2)` navigates to the same path with `page=2`, preserving the other query parameters and hash. `useFetch` watches the reactive page value and fetches the selected page. Returning to page one removes the page parameter; a missing parameter is read as page one.

## App Examples

- [`useDiscussionList.ts`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussionList.ts) derives the selected page from the route query and updates the URL when another page is selected.
- [`DiscussionList.vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/DiscussionList.vue) passes the table's page selection to `setPage`.

## Trade-offs and Limitations

By default, `navigateTo` adds a browser history entry for each page selection. The back button therefore revisits earlier selections, so users may need several presses to return to the page they visited before opening the list.

## Sources

- [Nuxt: `useRoute`](https://nuxt.com/docs/4.x/api/composables/use-route)
- [Nuxt: `navigateTo`](https://nuxt.com/docs/4.x/api/utils/navigate-to)
- [Nuxt: `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)

## Related Practices

- [Design API Responses for useFetch](design-api-responses-for-usefetch.md)
- [Reuse Load More Logic Through a Composable](reuse-load-more-logic-through-a-composable.md)
