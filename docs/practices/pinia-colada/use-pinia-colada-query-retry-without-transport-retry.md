---
title: Disable `$fetch` Retry When Using Pinia Colada Query Retry
semanticId: pinia-colada-query-retry-ownership
category: query-retry
status: confirmed
---

# Disable `$fetch` Retry When Using Pinia Colada Query Retry

## Practice

When a Pinia Colada Query needs automatic retry, disable retry in the custom `$fetch` instance used by that Query. Configure the Pinia Colada Retry plugin with a finite retry count.

The initial Query function invocation and each retry then correspond to one `$fetch` request. Because `$fetch` starts no additional retries, the Pinia Colada policy determines the maximum number of requests before the Query succeeds or reaches its final failure.

## Apply When

- Pinia Colada Queries use a custom `$fetch` instance and should retry failed reads a limited number of times.
- Each Query retry should send one HTTP request so the maximum number of requests remains predictable.
- The application needs to decide retry eligibility based on the error and failure count.
- A specific Query may need a different retry policy from the global policy.

## Do Not Apply When

- The Query should stop after its first failed request rather than retry automatically.
- The request runs outside a Pinia Colada Query.
- The application already retries the request through `$fetch`, another HTTP client, or request-specific code.
- The failed operation is a Mutation or session operation. The code that starts that operation must decide whether repeating it is safe instead of relying on Query retry.

## Why

With Pinia Colada `retry: 2`, the Query function runs once initially and up to two more times, for three calls in total. If `$fetch` also retries once, each call can send two HTTP requests. Together, these settings can send up to six requests.

With `$fetch` set to `retry: 0`, each Query function call sends one HTTP request. Pinia Colada `retry: 2` then produces at most three requests when all calls fail, so the maximum is clear from the Pinia Colada setting alone.

## Implementation Guidance

- Create a custom `$fetch` instance with `retry: 0`. See [Use a Custom `$fetch` Instance in Pinia Colada Queries and Mutations](shared-custom-fetch.md).
- Register `@pinia/colada-plugin-retry` and configure `retry` with a finite number or a function with an explicit failure-count limit.
- A numeric `retry` value counts retries after the first Query function call. `retry: 2` permits up to three calls.
- In Query functions, call the shared `$api` without a per-request retry override. An override would add `$fetch` retries again.
- Set the Pinia Colada Retry plugin's `retry` option on a specific Query when it needs a different retry count or eligibility rule.
- If retry eligibility depends on the error, configure `retry` as a function. Return `false` if sending the same request again will fail for the same reason. For example, stop retrying when the session must be refreshed or the request data must be corrected first. Identify these errors from the application's API and authentication contracts.
- Register the Pinia Colada Retry plugin only on the client. A failed SSR Query then stops after its first request instead of issuing additional requests during server rendering.

## Minimal Nuxt Example

Create a custom `$fetch` instance with `retry: 0`.

```ts
export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    retry: 0,
  });

  return {
    provide: { api },
  };
});
```

Register the Pinia Colada Retry plugin (`@pinia/colada-plugin-retry`) only on the client and set a global limit of two retries per Query. Because the Pinia Colada Retry plugin is not registered on the server, a failed SSR Query stops after its first request.

```ts
import { PiniaColadaRetry } from "@pinia/colada-plugin-retry";
import type { PiniaColadaOptions } from "@pinia/colada";

export default {
  plugins: import.meta.client
    ? [PiniaColadaRetry({ retry: 2 })]
    : [],
} satisfies PiniaColadaOptions;
```

Call `$api` from the Query without a per-request `retry` override, and forward the Query's abort signal.

```ts
export const projectQuery = defineQueryOptions((id: string) => ({
  key: ["projects", id],
  query: ({ signal }) => {
    const { $api } = useNuxtApp();

    return $api(`/api/projects/${id}`, { signal });
  },
}));
```

With this setup, Pinia Colada can call the Query function at most three times: once initially and twice as retries. Each call makes one `$api` request because `$api` uses `retry: 0`, so a failed Query sends no more than three requests.

## Verified App Examples

- [`createAppApi.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/base/app/utils/createAppApi.ts) creates the shared `$api` instance with `retry: 0`. A failed `$api` request does not start an automatic `$fetch` retry.
- [`teams.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/teams/app/queries/teams.ts) defines the Teams Query with one `$api` call per Query function invocation, forwards the abort signal, and does not override `retry`.
- [`colada.options.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/colada.options.ts) registers the Pinia Colada Retry plugin only on the client and permits up to two retries for non-`401` errors.
- The same file returns `false` for `401 Unauthorized`, so the app can handle a protected `401` after the first request.

Together, these examples show that the current app keeps `$fetch` single-attempt, permits up to two client Query retries for eligible failures, and does not retry `401` or SSR Query failures.

## Trade-offs and Limitations

Each retry sends another HTTP request and delays the final Query outcome. Keep the retry count finite and verify the maximum total number of requests.

The Pinia Colada Retry plugin's global `retry` option applies to every Query that does not override it, including initial loads, background refreshes, prefetches, Infinite Query pages, and invalidation-triggered refetches. Review those paths before giving them the same rule, and set a Query-specific option where they differ.

The Pinia Colada Retry plugin does not retry a Mutation. A successful Mutation can still invalidate a related Query, and the resulting refetch starts its own retry sequence. A successful write can therefore be followed by several read requests.

Retry only failures that the application's API and authentication contracts identify as safe to repeat. If another attempt requires different credentials, corrected request data, or an endpoint-specific delay, stop the global retry or configure that Query separately.

The Pinia Colada Retry plugin stops retrying after all `useQuery()` instances for a cached Query entry have been disposed or while the Query's `enabled` option evaluates to `false`. If multiple fetches start close together, it also avoids retrying an earlier fetch after a newer fetch for the same Query has started.

## Sources

- [Pinia Colada Retry plugin guide](https://pinia-colada.esm.dev/plugins/official/retry.html)
- [Pinia Colada `RetryOptions` API reference](https://pinia-colada.esm.dev/api/plugins/retry/src/interfaces/RetryOptions.html)
- [ofetch automatic retry behavior](https://github.com/unjs/ofetch/tree/v1#%EF%B8%8F-auto-retry)

## Related Practices

- [Use a Custom `$fetch` Instance in Pinia Colada Queries and Mutations](shared-custom-fetch.md)
- [Organize Queries by Domain with `defineQueryOptions()`](query-organization.md)
