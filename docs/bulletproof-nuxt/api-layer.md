# 📡 API Layer

### Use Shared Custom Fetchers

Reuse custom fetchers for shared request options and failure presentation. The app uses `useAPI` for page-rendering reads and `$api` for imperative requests. Nuxt Auth Utils owns session requests separately.

See [Use Custom Fetchers for Your API](../practices/nuxt-use-fetch/custom-api-fetchers.md).

### Define API Calls by Domain

Keep API paths, request inputs, and response types in feature composables rather than repeating requests in components. Components own view-specific feedback, dialogs, and navigation.

See [Define Domain and Feature API Calls in Composables](../practices/nuxt-use-fetch/domain-feature-api-calls.md). Related guidance:

- [Design API Responses for useFetch](../practices/nuxt/design-api-responses-for-usefetch.md)
- [Keep Pagination State in the URL](../practices/nuxt/keep-pagination-state-in-the-url.md)
- [Reuse Load More Logic Through a Composable](../practices/nuxt/reuse-load-more-logic-through-a-composable.md)
