---
title: Use Custom Fetchers for Your API
semanticId: custom-api-fetchers
category: request-boundaries
prerequisites: []
status: confirmed
---

# Use Custom Fetchers for Your API

## Practice

When application code calls your API, use custom fetchers instead of configuring each request separately. Use a custom `useFetch` composable for AsyncData reads and a custom `$fetch` instance for imperative requests.

Add default options and hooks only when they apply across API calls. Define API paths, methods, and request bodies in the composable for each API call. Let the component or page decide whether to refresh displayed data, close a dialog, or navigate after the request.

## Apply When

- Several calls to your API require the same base URL, headers, or request and response hooks.
- Page-rendering data must use shared default options without losing the AsyncData and SSR behavior of `useFetch`.
- A request that runs after setup, such as a form submission, must use shared default options without creating AsyncData state.

## Do Not Apply When

- Nuxt Auth Utils sends the request as part of its session handling.
- A request starts in a server handler that can call server-only code or access data without another HTTP request.
- A third-party library sends and configures the request itself.
- Another API uses a different base URL, credentials, or hooks and needs a separate custom fetcher.
- A one-off call needs no shared defaults and is clearer with raw `useFetch` or `$fetch`.

## Why

Custom fetchers keep shared default options and hooks in one place instead of repeating them for every API call. A custom `useFetch` composable retains Nuxt's AsyncData and SSR behavior for page-rendering data, while a custom `$fetch` instance sends imperative requests without creating AsyncData state.

This split keeps form submissions and other user-triggered requests out of AsyncData, while page-rendering requests continue to use it. Composables can reuse shared request setup without moving refresh, dialog, or navigation decisions into the custom fetchers.

## Implementation Guidance

1. **Create custom fetchers.** Define `useAPI` with `createUseFetch()` for AsyncData reads. In a Nuxt plugin, create a custom `$fetch` instance with `$fetch.create()` and provide it as `$api`.
2. **Configure shared behavior.** Add an option or hook only when several API calls need the same behavior. If `useAPI` and a domain or feature composable both define `onResponseError`, pass both functions as an array so that both run.
3. **Define API calls.** In a domain or feature composable, use `useAPI` for page-rendering data or `$api` for a request triggered after setup. Define the API path, method, request body, and return value there.
4. **Handle results.** In the component or page that starts the request, decide whether to refresh data, close a dialog, or navigate after it finishes.

Do not add headers, credentials, authentication, or request-header forwarding by default. If one of them is required, first define the allowed destinations and headers and the protection for credentialed mutations.

## Minimal Nuxt Example

Create a custom `useFetch` composable and a custom `$fetch` instance with the same shared base URL.

```ts
// app/composables/useAPI.ts
export const useAPI = createUseFetch(() => ({
  baseURL: "/api",
}));

// app/plugins/api.ts
export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    baseURL: "/api",
  });

  return { provide: { api } };
});
```

Define API calls in a domain-specific composable.

```ts
// projects.ts
interface CreateProjectInput {
  name: string;
}

export function useProjects() {
  return useAPI("/projects");
}

export function useCreateProject() {
  const { $api } = useNuxtApp();

  return (body: CreateProjectInput) => $api("/projects", {
    method: "POST",
    body,
  });
}
```

`useProjects()` keeps page-rendering data in AsyncData. `useCreateProject()` returns an imperative request function. Both keep the `/projects` path and request options out of components and pages.

## Verified App Examples

- [`useAPI`](../../../apps/bulletproof-nuxt/layers/base/app/composables/useAPI.ts) defines the custom `useFetch` composable for AsyncData reads. It adds shared `onRequestError` and `onResponseError` notification functions before functions supplied for a specific API call. Its notification functions are not restricted to browser execution.
- The [API plugin](../../../apps/bulletproof-nuxt/layers/base/app/plugins/api.ts) creates the custom `$fetch` instance and provides it as `$api` for imperative requests. Its error hooks add notifications in the browser and skip notification updates during SSR.
- [`useDiscussions`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussions.ts) defines the Discussions collection path and query for `useAPI`. [`useCreateDiscussion`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useCreateDiscussion.ts) defines the path, method, and body for `$api`.
- [`CreateDiscussion.vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/CreateDiscussion.vue) manages pending state, adds the success notification, refreshes the collection, and completes the drawer after `useCreateDiscussion` succeeds.

## Trade-offs and Limitations

Using two custom fetchers means that shared hook wiring must be maintained and tested in two places. The custom `useFetch` composable and the custom `$fetch` instance can differ intentionally, and changing one does not change the other.

`useAPI` and `$api` add notifications in different runtimes. The `useAPI` notification functions have no browser-only guard, while the `$api` hooks skip notification updates during SSR. During SSR, notification state can therefore differ depending on which fetcher sends the request.

Requests made through raw `useFetch`, global `$fetch`, Nuxt Auth Utils, server-handler code, or a third-party library do not receive these shared defaults. Another API with different options needs a separate custom fetcher.

Neither `useAPI` nor `$api` configures credentials, authentication, request-header forwarding, or CSRF controls. Adding any of these capabilities introduces new security requirements. Before enabling such behavior, define and verify destination restrictions, allowed headers, and protection for credentialed mutations.

## Sources

- [Nuxt Custom `useFetch`](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch)
- [Nuxt Data Fetching](https://nuxt.com/docs/4.x/getting-started/data-fetching)
- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [ofetch Interceptors](https://github.com/unjs/ofetch/tree/v1#%EF%B8%8F-interceptors)
- [OWASP Cross-Site Request Forgery Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

## Related Practices

- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Define Domain and Feature API Calls in Composables](domain-feature-api-calls.md)
- [Handle API Error Notifications in Custom Fetchers](api-error-notifications.md)
- [Orchestrate Auth Session State Outside the Fetch Client](auth-session-orchestration.md)
