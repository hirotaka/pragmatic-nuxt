---
title: Use Nuxt Query to Integrate TanStack Query with Nuxt
semanticId: use-nuxt-query-to-integrate-tanstack-query-with-nuxt
category: nuxt-integration
status: confirmed
---

# Use Nuxt Query to Integrate TanStack Query with Nuxt

## Practice

When using TanStack Query in a Nuxt application, use Nuxt Query (`@peterbud/nuxt-query`) as the integration module. TanStack Query's `QueryClient` manages cached query data and the default behavior of queries. Let Nuxt Query create and provide this client, register TanStack Query with the application's Vue instance, dehydrate the client's cache after server rendering, and hydrate the cache in the browser. Use Nuxt Query's configuration options for application-specific settings. Use its configuration hook for extensions.

## Apply When

Use this practice when:

- A Nuxt application uses TanStack Query to load and cache server state.
- Server-rendered query results need to initialize the browser cache during hydration.
- The required `QueryClient` settings and extensions can be provided through Nuxt Query's configuration options or configuration hook.

## Do Not Apply When

Do not use this practice when:

- The application already has a tested Nuxt integration for `QueryClient` creation, Vue plugin registration, and server-rendered cache transfer, and replacing it would not improve behavior or reduce maintenance.
- The application needs cache serialization or cleanup behavior that Nuxt Query does not expose.
- The available Nuxt Query version is incompatible with the application's Nuxt or TanStack Query version, or the required server-rendering and hydration verification fails.

## Why

Nuxt Query keeps Vue plugin registration, `QueryClient` provision, and server-to-browser cache transfer under one Nuxt module. This reduces the amount of integration code that the application must maintain and keeps server rendering and browser hydration tied to the same client lifecycle. The application can still supply its own `QueryClient` settings and extensions through the interfaces that Nuxt Query provides.

## Implementation Guidance

- Add Nuxt Query (`@peterbud/nuxt-query`) to the root Nuxt module list.
- Set `QueryClient` defaults with `nuxtQuery.queryClientOptions`.
- Use the `nuxt-query:configure` hook when the application needs a custom `QueryClient`.
- For server rendering, create a custom `QueryClient` during each Nuxt plugin execution; do not share a module-level client across requests.
- Decide whether Nuxt Query's auto-import and DevTools features belong in the application.
- Verify that pages backed by TanStack Query render on the server and reuse the server-provided cache during browser hydration.

## Minimal Nuxt Example

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@peterbud/nuxt-query"],
  nuxtQuery: {
    autoImports: false,
    devtools: false,
    queryClientOptions: {
      defaultOptions: {
        queries: {
          staleTime: 60_000,
        },
      },
    },
  },
});
```

Nuxt Query creates a `QueryClient` from TanStack Query with these defaults. Use the configuration hook provided by Nuxt Query when the application needs a custom client setup that cannot be expressed with `queryClientOptions`.

## App Examples

- [`nuxt.config.ts`](../../../apps/reference/bulletproof-nuxt-tanstack-query/nuxt.config.ts) registers Nuxt Query and disables its auto-import and DevTools features.
- [`vue-query.ts`](../../../apps/reference/bulletproof-nuxt-tanstack-query/app/plugins/vue-query.ts) uses Nuxt Query's configuration hook to supply a custom `QueryClient` with the application's query defaults and mutation-error handler.

## Trade-offs and Limitations

Nuxt Query reduces the amount of code that an application must maintain to connect TanStack Query to Nuxt. In exchange, the application depends on a module published and maintained outside the TanStack Query and Nuxt projects. Compatibility with both projects becomes the application's maintenance responsibility.

Nuxt Query's public interfaces may not expose every server-rendering lifecycle control an application requires. The module cannot satisfy requirements for controls outside those interfaces.

## Sources

- [Nuxt Query](https://github.com/peterbud/nuxt-query)
- [TanStack Query: Server Rendering and Hydration](https://tanstack.com/query/latest/docs/framework/vue/guides/ssr)
- [TanStack Query: `QueryClient`](https://tanstack.com/query/latest/docs/framework/vue/reference/classes/QueryClient)

## Related Practices

- [Centralize Shared Request Rules in a Custom Nuxt `$fetch` Instance](centralize-shared-request-rules-in-a-custom-nuxt-fetch-instance.md)
- [Keep Query Keys and Query Functions Together as Reusable Query Options](keep-query-keys-and-query-functions-together-as-reusable-query-options.md)
- [Keep Query Retries in TanStack Query](keep-query-retries-in-tanstack-query.md)
