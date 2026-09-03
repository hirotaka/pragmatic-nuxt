# 📡 API Layer

### Use Shared Custom Fetchers

When application code calls your API, reuse custom fetchers instead of configuring each request separately. Shared fetchers contain only default options and hooks used by multiple API calls.

The Main app uses `useAPI`, a custom `useFetch` composable, for page-rendering data and `$api`, a custom `$fetch` instance, for imperative requests. The Pinia Colada Reference app uses its custom `$api` instance inside Query and Mutation definitions. Page-rendering reads retain the SSR, hydration, and caching behavior of the selected data-fetching approach.

Nuxt Auth Utils continues to own authentication session requests in both apps rather than routing them through the shared fetchers.

[Main App `useAPI`](../../apps/bulletproof-nuxt/layers/base/app/composables/useAPI.ts)

[Main App `$api` Plugin](../../apps/bulletproof-nuxt/layers/base/app/plugins/api.ts)

[Pinia Colada Reference `$api` Plugin](../../apps/reference/bulletproof-nuxt-pinia-colada/layers/base/app/plugins/api.ts)

### Define API Calls by Domain

Rather than declaring API requests directly in components, define them with the domain or feature that owns the operation. Each API-call definition should contain:

- Request and response types, plus validation schemas when needed
- The API path, method, parameters, and request body
- The feature composable, Query definition, or Mutation definition that uses the shared fetcher

Components and pages use these definitions and retain view-specific behavior such as pending feedback, dialogs, and navigation. In the Main app, they also decide when an imperative request should refresh related AsyncData. In the Pinia Colada Reference app, Mutation definitions invalidate related Query cache entries after successful writes.

[Main App Discussion Read](../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussions.ts)

[Main App Discussion Create](../../apps/bulletproof-nuxt/layers/discussions/app/composables/useCreateDiscussion.ts)

[Pinia Colada Reference Discussion Definitions](../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/queries/discussions.ts)

See [Use Custom Fetchers for Your API](../practices/use-fetch/custom-api-fetchers.md), [Define Domain and Feature API Calls in Composables](../practices/use-fetch/domain-feature-api-calls.md), and [Use a Custom `$fetch` Instance in Pinia Colada Queries and Mutations](../practices/pinia-colada/shared-custom-fetch.md) for detailed guidance.
