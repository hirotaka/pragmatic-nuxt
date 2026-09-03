---
title: Pass Native `useFetch` Options Through Data-Fetching Composables
semanticId: feature-composable-options
category: request-boundaries
prerequisites:
  - custom-api-fetchers
  - page-rendering-data
status: confirmed
---

# Pass Native `useFetch` Options Through Data-Fetching Composables

## Practice

Let data-fetching composables accept native `useFetch` options and pass them directly to the app's custom `useFetch` composable. This lets each use adjust fetch behavior with familiar Nuxt options instead of wrapper-specific options.

Keep the endpoint and default response type in the composable so those API details remain consistent wherever it is used.

## Apply When

- A composable defines the endpoint and default response type for a data-fetching request.
- Application code that uses the composable needs to adjust `useFetch` behavior through native options, such as `server`, `lazy`, `immediate`, `dedupe`, caching, or hooks.
- The composable can pass those options to the custom `useFetch` composable without translating them into wrapper-specific names.

## Do Not Apply When

- The composable already owns query values, watch sources, pagination, or response transformation.
- The feature needs a smaller, domain-specific set of inputs rather than all native options.
- The request is an imperative operation that does not need AsyncData state. Use the app's custom `$fetch` boundary instead.

## Why

Using Nuxt's `UseFetchOptions` preserves Nuxt's option names. Application code can choose server rendering, request timing, deduplication, caching, and hooks without learning wrapper-specific options.

The composable keeps the endpoint and default response type in one place, while the custom `useFetch` composable applies shared defaults and hooks. This separates stable API details from fetch behavior that varies by use.

## Implementation Guidance

- Type the options with `UseFetchOptions<FetchResult<Route, "get">>` and pass them directly to the custom `useFetch` composable. Keep the request URL reactive when the endpoint can change.
- When the composable sets query values, an AsyncData key, watch sources, pagination, or response transformation, accept only the specific inputs that may vary.
- Use the custom `useFetch` composable instead of raw `useFetch` so that shared defaults and hooks still apply.
- Use the app's custom `$fetch` boundary for imperative requests. Passing `method` or `body` through this wrapper does not change its default GET response type.

## Minimal Nuxt Example

```ts
import type { FetchResult, UseFetchOptions } from "#app";

type ProjectRoute = `/api/projects/${string}`;

export async function useProject(
  id: MaybeRefOrGetter<string>,
  options?: UseFetchOptions<FetchResult<ProjectRoute, "get">>,
) {
  return await useAPI(
    () => `/api/projects/${toValue(id)}`,
    options,
  );
}
```

```ts
const { data: project } = await useProject(projectId, {
  dedupe: "defer",
});
```

`useProject` owns the reactive endpoint and the default GET response type. Code using it can pass compatible native options, such as `dedupe`, without repeating those API details.

## Verified App Example

- [`useDiscussion`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussion.ts) defines a reactive endpoint and the default GET response type, then forwards its `options` argument to the app's custom `useAPI` composable.

## Trade-offs and Limitations

Accepting the complete `UseFetchOptions` type keeps the wrapper simple and avoids maintaining a separate set of options. It also exposes options that may not fit an endpoint-specific GET request.

The wrapper's response type remains based on the endpoint's default GET result. Changing `method`, or using a shape-changing `transform` or `default`, does not reproduce the return-type inference of a direct `useFetch` call. Use a dedicated imperative request composable when an operation needs a different method or response type.

Options such as `$fetch` and a manual `key` can change the request transport or AsyncData identity. Use them only when that change is intentional and compatible with the app's custom `useFetch` composable and other code using the same key.

## Sources

- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt `createUseFetch`](https://nuxt.com/docs/4.x/api/composables/create-use-fetch)
- [Nuxt custom `useFetch`](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch)
- [Nuxt 4.5.1 `useFetch` source](https://github.com/nuxt/nuxt/blob/v4.5.1/packages/nuxt/src/app/composables/fetch.ts)

## Related Practices

- [Use Configured API Fetchers for App-Owned Requests](custom-api-fetchers.md)
- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Let Request Inputs Define AsyncData Identity](async-data-identity.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
