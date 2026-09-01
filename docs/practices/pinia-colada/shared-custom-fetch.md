---
title: Use a Custom `$fetch` Instance in Pinia Colada Queries and Mutations
semanticId: pinia-colada-request-aware-side-effect-free-transport
category: nuxt-integration
status: confirmed
---

# Use a Custom `$fetch` Instance in Pinia Colada Queries and Mutations

## Practice

Use Nuxt's `$fetch` utility function as the HTTP client when calling HTTP APIs from Pinia Colada
Queries and Mutations.

Pinia Colada manages asynchronous Query state, request deduplication, caching, and Mutation
operation status. `$fetch` handles the HTTP transport. Keep these responsibilities separate.

When the application needs shared default options or request handling, use a custom `$fetch`
instance as an app-owned transport boundary. Keep request-specific API operations and Pinia
Colada Query or Mutation behavior in their feature boundaries.

This makes the HTTP transport explicit while preserving Pinia Colada's native APIs and
responsibilities.

## Apply When

- Multiple Pinia Colada Query or Mutation functions use the same app-specific `$fetch` options
  or request handling.
- A same-app API request made during SSR needs headers from the current Nuxt request.
- Shared transport defaults should be centralized while request-specific API operations and
  Query or Mutation behavior remain in feature boundaries.

## Do Not Apply When

- Do not create a custom `$fetch` instance when Query and Mutation functions need only the
  default `$fetch` behavior; call the `$fetch` utility function directly instead.
- `useFetch()`, `createUseFetch()`, or `useRequestFetch()` already owns the required SSR request
  headers and data-fetching lifecycle.
- The request is a session operation provided by Nuxt Auth Utils, such as
  `useUserSession().fetch()` or `useUserSession().clear()`.
- The request targets an API outside the Nuxt server and needs different base URL, header,
  redirect, or retry settings.

## Why

Query and Mutation functions that call HTTP APIs need an HTTP client. Nuxt provides `$fetch` by
default for both browser and server use, so requests can be made without adding another HTTP
client.

When multiple Queries and Mutations use the same default options or request handling, sharing
them through a custom `$fetch` instance avoids duplicated configuration and provides consistent
HTTP requests.

Keeping settings and handling shared by multiple requests in the custom `$fetch` instance, while
keeping request-specific API operations in each Query or Mutation definition, makes the roles of
the shared and request-specific parts clear.

## Implementation Guidance

- Create a custom `$fetch` instance with `$fetch.create()` in a Nuxt plugin and provide it as
  `$api`.
- During SSR, create the custom `$fetch` instance for each Nuxt app and set the required headers
  from the current request.
- In the browser, use normal same-origin fetch behavior.
- Configure headers, API destinations, and transport options shared by multiple requests in the
  custom `$fetch` instance.
- Use `$api` from Query and Mutation functions, and keep each endpoint, method, query parameter,
  request body, abort signal, and response type in its corresponding definition.
- Keep Pinia Colada options such as Query keys, Mutation hooks, and invalidation in the
  corresponding Query or Mutation definition.

## Minimal Nuxt Example

During SSR, create a custom `$fetch` instance in a Nuxt plugin that uses the current Nuxt
request's `Cookie` header, and provide it as `$api`.

```ts
export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    headers: import.meta.server
      ? useRequestHeaders(["cookie"])
      : undefined,
    retry: 0,
    onRequest: ({ request }) => {
      if (typeof request !== "string" || !request.startsWith("/api/")) {
        throw new Error("App API transport only accepts internal /api/ paths");
      }
    },
  });

  return {
    provide: { api },
  };
});
```

Use `$api` from a Pinia Colada Query definition.

```ts
export const discussionDetailQuery = defineQueryOptions((id: string) => ({
  key: ["discussions", id],
  query: ({ signal }) => {
    const { $api } = useNuxtApp();

    return $api<Discussion>(`/api/discussions/${id}`, {
      signal,
    });
  },
}));
```

The custom `$fetch` instance holds the `Cookie` header used during SSR, the raw internal-path
check, and the transport retry setting. Before request execution, the check rejects non-string
requests and raw string values that do not start with `/api/`. It does not prove the final request
destination after URL normalization or redirects.

The Query definition retains the requested resource, endpoint, abort signal, and response type.

## Verified App Examples

- [`api.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/base/app/plugins/api.ts) provides the custom
  `$fetch` instance for internal API requests as `$api`.
- [`createAppApi.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/base/app/utils/createAppApi.ts)
  owns the current app's SSR cookie header, initial internal-path restriction, and transport
  retry default.
- [`discussions.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/queries/discussions.ts)
  and the other feature Query modules call `$api` while retaining endpoint, signal, response,
  Mutation, and invalidation ownership.
- [`colada.options.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/colada.options.ts) keeps Query retry,
  notifications, and protected-session recovery outside `$api`.

## Trade-offs and Limitations

Providing a custom `$fetch` instance as `$api` means that understanding a request requires
checking both the Query or Mutation definition and the `$api` configuration.

A change to the custom `$fetch` instance affects every Query and Mutation that uses it. Review
the effect on each API operation when changing shared settings.

When a custom `$fetch` instance uses headers from the current request during SSR, create it
within the Nuxt app for that request. Sharing an instance that retains request-specific headers
across server requests can expose one user's credentials to another request.

A raw `startsWith("/api/")` check is only an initial application boundary. It does not normalize
URLs or guarantee redirect containment. When forwarding request credentials makes destination
containment security-sensitive, use a stronger normalized destination policy and explicit
redirect handling, and verify those controls separately.

APIs with different authentication, base URL, header, or retry requirements should use separate
custom `$fetch` instances. As the number of instances grows, the application must keep their
purposes and consumers distinguishable.

## Sources

- [Nuxt Custom `$fetch`](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch)
- [Nuxt `useRequestHeaders`](https://nuxt.com/docs/4.x/api/composables/use-request-headers)
- [ofetch retry behavior](https://github.com/unjs/ofetch/tree/v1#%EF%B8%8F-auto-retry)
- [Pinia Colada Queries](https://pinia-colada.esm.dev/guide/queries.html)
- [Pinia Colada Mutations](https://pinia-colada.esm.dev/guide/mutations.html)

## Related Practices

- [Disable `$fetch` Retry When Using Pinia Colada Query Retry](use-pinia-colada-query-retry-without-transport-retry.md)
- [Organize Queries by Domain with `defineQueryOptions()`](query-organization.md)
- [Organize Mutations by Domain with `defineMutationOptions()`](mutation-ownership-and-invalidation.md)
