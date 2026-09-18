---
title: Keep Query Retries in TanStack Query
semanticId: keep-query-retries-in-tanstack-query
category: failure-handling
status: confirmed
---

# Keep Query Retries in TanStack Query

## Practice

Configure retries for queries in TanStack Query, and disable retries in the shared custom Nuxt
`$fetch` instance so a single failure is not retried by both layers. Retry a query only if it is
safe to repeat the request. After TanStack Query stops retrying, show the error and a retry action
where the query data is rendered. Handle mutation failures and session failures through separate
error paths.

## Apply When

Use this practice when:

- Query functions use a custom Nuxt `$fetch` instance whose retry option can issue additional HTTP requests after a failure.
- TanStack Query should own the retry attempts for failed queries.
- The UI that renders the query data can show the error after TanStack Query stops retrying and let the user try the request again.

## Do Not Apply When

Do not use this practice when:

- The operation is a mutation used to create, update, or delete data or perform a server-side effect.
- The custom Nuxt `$fetch` instance must apply the same retry policy to requests made both inside and
  outside TanStack Query.
- An offline or background system queues failed requests and controls when they are retried.

## Why

TanStack Query and the custom Nuxt `$fetch` instance can each retry a failed request. When retries
are enabled in both places, one execution of the query function can issue multiple HTTP requests.
The total number of requests can then exceed the retry count configured in TanStack Query.
Disabling retries for the `$fetch` instance means that only TanStack Query makes retry attempts for
queries.

After TanStack Query stops retrying, the UI that renders the query data can show the error and let
the user try the request again. Keeping mutation and session error paths separate prevents the
query retry policy from repeating operations that have different completion and recovery
requirements.

## Implementation Guidance

- Leave `retry` unset when TanStack Query's default query retry behavior meets the application's requirements.
- Configure `retry` in the `QueryClient` default query options or in an individual query's options only when the application has a concrete reason to change that behavior.
- Configure `retry: 0` in the custom Nuxt `$fetch` instance.
- Pass the query function's `AbortSignal` to the custom Nuxt `$fetch` instance so cancellation can stop the HTTP request.
- After TanStack Query stops retrying, show the error where the query data is rendered and let the user try the request again.
- Keep mutation failures and session recovery outside the query retry policy.

## Minimal Nuxt Example

```ts
// app/plugins/query-api.ts
import { QueryClient } from "@tanstack/vue-query";

export default defineNuxtPlugin({
  name: "query-api",
  enforce: "pre",
  setup(nuxtApp) {
    const api = $fetch.create({
      retry: 0,
    });

    nuxtApp.hook("nuxt-query:configure", (setQueryClient) => {
      setQueryClient(new QueryClient());
    });

    return {
      provide: {
        api,
      },
    };
  },
});
```

```ts
// app/queries/projects.ts
import { queryOptions } from "@tanstack/vue-query";

export function projectsQuery() {
  const { $api } = useNuxtApp();

  return queryOptions({
    queryKey: ["projects"],
    queryFn: ({ signal }) => $api("/api/projects", { signal }),
  });
}
```

The `QueryClient` does not override `retry`. TanStack Query therefore uses its defaults: a failed query is retried three times in the browser and zero times on the server. The three browser retries follow the initial request, so the query function can run up to four times. The custom Nuxt `$fetch` instance uses `retry: 0`, so each execution of the query function sends one HTTP request.

## App Examples

- [`vue-query.ts`](../../../apps/reference/bulletproof-nuxt-tanstack-query/app/plugins/vue-query.ts) creates the app's `QueryClient` without overriding `retry`, so queries use TanStack Query's default retry behavior.
- [`createAppApi.ts`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/base/app/utils/createAppApi.ts) creates the custom Nuxt `$fetch` instance with `retry: 0`.
- [`discussions.ts`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/discussions/app/queries/discussions.ts) passes each query function's `AbortSignal` to the custom Nuxt `$fetch` instance.
- [`DiscussionsCollection.vue`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/discussions/app/components/DiscussionsCollection.vue) displays query errors and lets the user run the failed query again.

## Trade-offs and Limitations

Letting TanStack Query retry failed queries while the custom Nuxt `$fetch` instance uses `retry: 0` prevents both layers from retrying the same failure. With the default browser behavior, however, a failed query can run its query function up to four times before the final error appears.

Setting `retry: 0` affects only requests made through that custom Nuxt `$fetch` instance. It does not change Nuxt's global `$fetch`, other custom fetchers, mutations, session recovery, or offline queues.

## Sources

- [TanStack Query: Query Retries](https://tanstack.com/query/latest/docs/framework/vue/guides/query-retries)
- [TanStack Query: Query Cancellation](https://tanstack.com/query/latest/docs/framework/vue/guides/query-cancellation)
- [ofetch retry behavior](https://github.com/unjs/ofetch/tree/v1#%EF%B8%8F-auto-retry)

## Related Practices

- [Use Nuxt Query to Integrate TanStack Query with Nuxt](use-nuxt-query-to-integrate-tanstack-query-with-nuxt.md)
- [Centralize Shared Request Rules in a Custom Nuxt `$fetch` Instance](centralize-shared-request-rules-in-a-custom-nuxt-fetch-instance.md)
- [Keep Mutation Success Separate from Query Refetch Failures](keep-mutation-success-separate-from-query-refetch-failures.md)
