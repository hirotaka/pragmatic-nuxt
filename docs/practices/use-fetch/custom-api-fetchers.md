---
title: Use Configured API Fetchers for App-Owned Requests
semanticId: custom-api-fetchers
category: request-boundaries
prerequisites: []
status: confirmed
---

# Use Configured API Fetchers for App-Owned Requests

## Practice

Route app-owned client and server-rendered API requests through configured fetchers. Create `useAPI` with `createUseFetch()` for AsyncData reads, and create `$api` with `$fetch.create()` and provide it through `NuxtApp` for imperative requests.

When a concrete requirement exists, use these fetchers as bounded extension points for transport concerns. Do not assume headers, credentials, transport authentication, or unauthorized-response handling are required by default.

## Apply When

- Client or server-rendered application code calls an API owned by the app.
- A concrete API requirement needs bounded common transport configuration or a non-lifecycle response hook.
- Page reads need configured `useFetch` behavior without losing Nuxt AsyncData semantics.
- Imperative operations need the same transport boundary without creating AsyncData state.

## Do Not Apply When

- Nuxt Auth Utils performs its own internal session request.
- A server handler performs an internal request whose boundary is owned by server code.
- A third-party library owns its internal transport.
- A raw primitive is an intentional exception that does not need the app's configured behavior.

## Why

Configured fetchers give app-owned API traffic explicit extension points without repeating transport setup in every feature. `createUseFetch()` preserves Nuxt's server-rendering, hydration, and AsyncData lifecycle for reads, while a provided `$fetch` instance supports imperative operations without pretending to be a cache or AsyncData owner.

The fetchers establish transport behavior only. Page-read selection, imperative workflow ownership, notification policy, feature success, refresh, dialogs, navigation, and session lifecycle remain separate decisions.

Sensitive transport configuration also has a destination boundary. Scope credentials and authorization to trusted API destinations, never forward inbound cookies or authorization to arbitrary URLs during SSR, and define an explicit CSRF policy before sending credentialed mutations.

## Implementation Guidance

- Create `useAPI` with `createUseFetch()` and keep its return value compatible with native `useFetch`.
- Create `$api` in a Nuxt plugin with `$fetch.create()` and provide it through `NuxtApp`.
- Add headers, credentials, transport authentication, or common response hooks only for a concrete bounded requirement.
- Scope sensitive headers and credentials to trusted destinations. Do not forward inbound cookies or authorization to arbitrary URLs during SSR.
- Require an explicit CSRF policy for credentialed mutations.
- Keep common transport hooks non-lifecycle. Let the auth/session owner interpret session-invalidating responses and decide whether to clear session state or navigate.
- Keep feature endpoints, methods, bodies, and returned values in feature composables.
- Treat raw `useFetch` and global `$fetch` as explicit exceptions for app-owned API requests.
- Do not route Nuxt Auth Utils internals, server-handler internals, or third-party library internals through these clients solely for uniformity.
- Keep failure presentation, feature completion, refresh targets, navigation, and session orchestration in their owning practices.

## Minimal Nuxt Example

```ts
// app/composables/useAPI.ts
export const useAPI = createUseFetch(() => ({
}));

// app/plugins/api.ts
export default defineNuxtPlugin(() => {
  const api = $fetch.create({});

  return { provide: { api } };
});
```

```ts
// Page-rendering read
const projects = await useAPI("/api/projects");

// Imperative operation
const { $api } = useNuxtApp();
await $api("/api/projects", {
  method: "POST",
  body: { name: "Migration" },
});
```

## Verified App Examples

- [`useAPI`](../../../apps/bulletproof-nuxt/layers/base/app/composables/useAPI.ts) is the configured AsyncData fetcher for app-owned page reads.
- The [API plugin](../../../apps/bulletproof-nuxt/layers/base/app/plugins/api.ts) provides `$api` for app-owned imperative requests.
- Both configured clients install the app's verified API notification hooks while keeping feature and workflow ownership outside the base layer.

## Trade-offs and Limitations

Two configured clients are intentional because AsyncData reads and imperative operations have different lifecycles. Shared transport configuration should not hide that distinction.

Requests outside these clients do not automatically receive their transport behavior. Keep exceptions explicit, but do not take ownership away from provider, server, or library internals merely to force one transport path.

Adding credentials or sensitive headers increases the security obligations of the shared boundary. Restrict trusted destinations, prevent SSR credential forwarding to arbitrary URLs, and pair credentialed mutations with a deliberate CSRF policy.

## Sources

- [Nuxt custom `useFetch`](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch)
- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [ofetch interceptors](https://github.com/unjs/ofetch#interceptors)

## Related Practices

- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Handle API Error Notifications in Custom Fetchers](api-error-notifications.md)
- [Orchestrate Auth Session State Outside the Fetch Client](auth-session-orchestration.md)
