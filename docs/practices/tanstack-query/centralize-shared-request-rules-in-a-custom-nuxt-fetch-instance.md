---
title: Centralize Shared Request Rules in a Custom Nuxt `$fetch` Instance
semanticId: centralize-shared-request-rules-in-a-custom-nuxt-fetch-instance
category: request-boundaries
status: confirmed
---

# Centralize Shared Request Rules in a Custom Nuxt `$fetch` Instance

## Practice

Use a custom Nuxt `$fetch` instance when TanStack Query query and mutation functions call internal API routes with the same request headers, retry behavior, or URL restrictions. Configure these shared request rules once, then use that instance in each query or mutation function.

## Apply When

Use this practice when:

- Multiple query or mutation functions call internal API routes with the same request headers, retry behavior, or URL restrictions.
- Data is prefetched during server rendering from an internal API route that reads the user's session from a cookie.

## Do Not Apply When

Do not use this practice when:

- Each query or mutation function has different request requirements and no setup to share.
- A request can use Nuxt's default `$fetch` behavior without server-side cookie forwarding, custom retry behavior, or URL restrictions.
- The target is an external API with its own base URL, credentials, or redirect policy.

## Why

A custom Nuxt `$fetch` instance keeps shared request headers, retry behavior, and URL restrictions consistent across query and mutation functions. During server rendering, forwarding the user's cookie sent by the browser lets protected internal API routes authenticate the same user who requested the page.

## Implementation Guidance

- Create a custom Nuxt `$fetch` instance during Nuxt plugin setup so server requests do not share one instance.
- On the server, read only the `cookie` header with `useRequestHeaders(["cookie"])` and pass it to `$fetch.create`.
- Allow only relative `/api/` paths for internal API routes.
- Configure `$fetch` retry separately from TanStack Query retry.
- Provide the custom instance through the Nuxt app and use it from query and mutation functions.

## Minimal Nuxt Example

```ts
// app/plugins/api.ts
export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    headers: import.meta.server
      ? useRequestHeaders(["cookie"])
      : undefined,
    retry: 0,
    onRequest: ({ request }) => {
      if (typeof request !== "string" || !request.startsWith("/api/")) {
        throw new Error("Only internal API routes are supported");
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});
```

```ts
// app/queries/projects.ts
export function projectQuery() {
  const { $api } = useNuxtApp();

  return queryOptions({
    queryKey: ["projects"],
    queryFn: () => $api("/api/projects"),
  });
}
```

`app/plugins/api.ts` creates the custom Nuxt `$fetch` instance and provides it as `$api`. Each query or mutation function calls `$api` with its own internal API path and request input while sharing cookie forwarding, retry behavior, and URL restrictions.

## App Examples

- [`createAppApi.ts`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/base/app/utils/createAppApi.ts) creates a custom Nuxt `$fetch` instance with server-rendering cookie forwarding, `$fetch` retry disabled, and a relative `/api/` path restriction.
- [`api.ts`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/base/app/plugins/api.ts) provides that custom instance as `$api` through the Nuxt app.
- [`discussions.ts`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/discussions/app/queries/discussions.ts) defines query and mutation functions that call `$api` with their internal API paths and request inputs.

## Trade-offs and Limitations

Centralizing shared request rules reduces duplication, but it splits each request's configuration between the custom Nuxt `$fetch` instance and the query or mutation function that sends the request. Changing the shared configuration affects every query and mutation function that uses the custom instance.

The shared rules apply only to requests made through that custom `$fetch` instance. They do not automatically apply to Nuxt's global `$fetch`, `useFetch`, or other custom fetchers.

## Sources

- [Nuxt Custom `$fetch`](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch)
- [Nuxt `useRequestHeaders`](https://nuxt.com/docs/4.x/api/composables/use-request-headers)
- [ofetch retry behavior](https://github.com/unjs/ofetch/tree/v1#%EF%B8%8F-auto-retry)
- [TanStack Query Query Functions](https://tanstack.com/query/latest/docs/framework/vue/guides/query-functions)
- [TanStack Query Mutations](https://tanstack.com/query/latest/docs/framework/vue/guides/mutations)

## Related Practices

- [Use Nuxt Query to Integrate TanStack Query with Nuxt](use-nuxt-query-to-integrate-tanstack-query-with-nuxt.md)
- [Use Custom Fetchers for Your API](../use-fetch/custom-api-fetchers.md)
- [Keep Query Retries in TanStack Query](keep-query-retries-in-tanstack-query.md)
