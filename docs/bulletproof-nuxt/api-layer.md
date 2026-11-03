# 📡 API Layer

### Use Shared Custom Fetchers

The app uses `useAPI` for page-rendering reads and `$api` for imperative requests. Nuxt Auth Utils owns session requests separately.

See [Use Custom Fetchers for Your API](../practices/nuxt-use-fetch/custom-api-fetchers.md).

### Define API Calls by Domain

Feature composables define this app's API paths, request inputs, and response types. Components own view-specific feedback, dialogs, and navigation.

For numbered lists, [`usePaginatedAPI`](../../apps/bulletproof-nuxt/app/composables/usePaginatedAPI.ts) owns URL page state and refresh settlement after creation or deletion. [`useDiscussionList`](../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussionList.ts) supplies the endpoint, page query, page size, and empty-page predicate. Components keep the same list-facing interface.

See [Define Domain and Feature API Calls in Composables](../practices/nuxt-use-fetch/domain-feature-api-calls.md). Related guidance:

- [Design API Responses for useFetch](../practices/nuxt/design-api-responses-for-usefetch.md)
- [Keep Pagination State in the URL](../practices/nuxt/keep-pagination-state-in-the-url.md)
- [Reuse Load More Logic Through a Composable](../practices/nuxt/reuse-load-more-logic-through-a-composable.md)
