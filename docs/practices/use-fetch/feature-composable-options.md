---
title: Forward Native Options Through Thin Feature Reads
semanticId: feature-composable-options
category: request-boundaries
prerequisites:
  - custom-api-fetchers
  - page-rendering-data
status: confirmed
---

# Forward Native Options Through Thin Feature Reads

## Practice

Let thin Read feature composables accept native `useFetch` options and pass them unchanged to the app's configured `useAPI`. Keep the endpoint and default response type visible in the feature composable while preserving native lifecycle, request, identity, cache, data-shaping, retry, and hook options for callers.

Use this full pass-through only when the composable does not own fixed options that would compete with callers. A composable that owns pagination query values, `watch` behavior, or collection mechanics needs its own explicit contract instead of pretending to provide unrestricted native options.

## Apply When

- A thin feature composable owns an endpoint and default response type.
- Callers need native `useFetch` options such as `server`, `lazy`, `immediate`, `dedupe`, cache controls, or hooks.
- The composable can forward one options object without filtering, renaming, or overriding fields.

## Do Not Apply When

- The composable owns fixed query, key, watch, pagination, or data-shaping behavior that conflicts with caller options.
- The feature needs a smaller domain-specific contract rather than the complete native option surface.
- The operation is an imperative workflow that should use the configured `$api` mutation boundary.

## Why

Native option names preserve Nuxt semantics and avoid a second wrapper vocabulary such as `clientOnly` or `deferred`. Passing the object through unchanged also keeps the configured `useAPI` boundary responsible for app-wide hooks while allowing caller hooks to compose with it.

Full pass-through is intentionally powerful. It includes method, body, manual key, query, data shaping, cache, retry, and hooks, not only rendering lifecycle flags. Callers are responsible for choosing options compatible with the endpoint and with other consumers sharing the same AsyncData key.

## Implementation Guidance

- Derive the default GET response with `FetchResult<Route, "get">`, type the options with `UseFetchOptions`, and call the configured `useAPI` with the same object. Let the request URL drive the actual `useAPI` inference.
- Do not derive the option type from `Parameters<typeof useAPI>`; the overloaded generic function can collapse to an `unknown` response type.
- Do not clone, pick, rename, or silently override fields in a contract described as full pass-through.
- Keep reactive endpoint inputs in the feature composable so the default generated identity follows resource changes.
- Preserve the configured fetcher's hook composition; do not replace it with raw `useFetch` or a caller-provided transport by accident.
- Keep imperative mutation guidance separate even though the native option type contains `method` and `body`.

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
const project = await useProject(projectId, {
  server: false,
  dedupe: "defer",
  onResponse({ response }) {
    recordProjectRead(response.status);
  },
});
```

## Verified App Example

- [`useDiscussion`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussion.ts) forwards native options to the configured `useAPI` while retaining its reactive endpoint and default Discussion response type.

## Trade-offs and Limitations

The wrapper's option type uses the endpoint's GET response as its default shape but does not reproduce every generic inference path of calling native `useFetch` directly. A method with a different response, such as DELETE, remains typed as the GET response. A caller-provided transform or default also does not create a new inferred wrapper return type. Use the configured imperative API boundary when the operation needs method-specific result typing.

Manual keys and options not included in Nuxt's generated key can create incompatible same-key consumers. Keep shared callers compatible or choose distinct keys deliberately.

Do not apply this contract mechanically to pagination composables. Their query, watch, accumulation, and refresh mechanics are feature-owned behavior rather than transparent native options.

## Sources

- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt custom `useFetch`](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch)

## Related Practices

- [Use Configured API Fetchers for App-Owned Requests](custom-api-fetchers.md)
- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Let Request Inputs Define AsyncData Identity](async-data-identity.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
