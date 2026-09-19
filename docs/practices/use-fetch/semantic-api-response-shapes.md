---
title: Design API Responses for Direct Use with Nuxt Data Fetching
semanticId: semantic-api-response-shapes
category: request-boundaries
prerequisites:
  - serialized-api-payloads
status: confirmed
---

# Design API Responses for Direct Use with Nuxt Data Fetching

## Practice

When building a full-stack application with Nuxt, design API response bodies to match the results the calling code needs.

Return a single resource as an object and a collection as an array when no additional information is needed. If the calling code also needs pagination details or other metadata, include them in an object such as `{ data, meta }`. When an operation only needs to report success or failure, return no body on success.

With these response shapes, `$fetch` returns the result directly, and `useFetch` makes it available through its `data` ref. An additional `{ data }` wrapper in the HTTP response is useful only when it serves a purpose beyond the container that `useFetch` already provides.

## Apply When

- Building a full-stack Nuxt application where you can design or change both the JSON API routes and the code that calls them.
- Using `useFetch` or `$fetch` to call those routes, either directly or through application-specific wrappers such as `useAPI` or `$api`.

## Do Not Apply When

- Consuming an API whose response format you cannot change, and adapting its responses when needed.
- Using a response format defined by a Nuxt module or another dependency, such as Nuxt Auth Utils.
- Returning streams, files, redirects, or other non-JSON responses.

## Why

In a full-stack Nuxt application, you can design an API response and its use in a page or component together. Returning the result in the form that code needs reduces repetitive work at call sites, such as extracting an array from an object that contains nothing else. Information that belongs together, such as a collection and its total count, can still travel in one response.

Nuxt infers response types from server routes, so the route also gives the calling code its TypeScript description of the result. This reduces duplicate type definitions and helps TypeScript identify affected callers when the response shape changes.

Beyond defining what data an API returns on success, its response also needs to indicate when an operation fails. Using an HTTP error status for a failed operation lets `$fetch` reject the request and `useFetch` expose the failure through its `error` ref. Calling code can then handle success and failure separately, without checking a successful response body for an embedded error.

## Implementation Guidance

- In the server route, return a resource as an object or a collection as an array. Return `users` rather than `{ data: users }` when only the array is needed.
- Include metadata in an object such as `{ data, meta }` when the code that calls the API needs it.
- Return no response body on success when the code that calls the API only needs confirmation that the operation completed.
- Throw `createError` with an appropriate HTTP error status when an operation fails.
- In client code, use the response body directly through `$fetch` or the `data` ref returned by `useFetch`, with its type inferred from the server route.

## Minimal Nuxt Example

The server route returns a user array, and the component renders that array without removing an extra object layer. This example uses a fixed list to focus on the response shape.

```ts
// server/api/users.get.ts
export default defineEventHandler(() => {
  const users = [
    { id: "1", name: "Ada" },
    { id: "2", name: "Grace" },
  ];

  return users;
});
```

```vue
<!-- app/components/UserList.vue -->
<script setup lang="ts">
const { data: users } = await useFetch("/api/users");
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>
```

The route returns `users`, not `{ data: users }`, so the component can iterate over the array directly. Nuxt infers the response type from the server route.

## App Examples

- [`useDiscussion.ts`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussion.ts) exposes the discussion object returned by the [detail route](../../../apps/bulletproof-nuxt/layers/discussions/server/api/discussions/%5Bid%5D.get.ts) through its `data` ref.
- [`useUsers.ts`](../../../apps/bulletproof-nuxt/layers/users/app/composables/useUsers.ts) exposes the user array returned by the [users route](../../../apps/bulletproof-nuxt/layers/users/server/api/users/index.get.ts) without removing an extra object layer.
- [`useDiscussions.ts`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussions.ts) exposes the `{ data, meta }` response from the [list route](../../../apps/bulletproof-nuxt/layers/discussions/server/api/discussions/index.get.ts), preserving both the discussions and their pagination metadata.
- [`useCreateDiscussion.ts`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useCreateDiscussion.ts) awaits the request to the [creation route](../../../apps/bulletproof-nuxt/layers/discussions/server/api/discussions/index.post.ts), which returns no body on success, without returning a result value.

## Trade-offs and Limitations

This practice addresses response structure, not which fields a user may access or how input is validated. Detailed HTTP status choices, error fields, validation, authentication, and authorization need separate design decisions.

## Sources

- [Nuxt: Server Routes](https://nuxt.com/docs/4.x/directory-structure/server)
- [Nuxt: `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt: `$fetch`](https://nuxt.com/docs/4.x/api/utils/dollarfetch)
- [Nuxt: `createError`](https://nuxt.com/docs/4.x/api/utils/create-error)
- [ofetch: Error Handling](https://github.com/unjs/ofetch#error-handling)

## Related Practices

- [Treat API Payloads as Serialized JSON Values](serialized-api-payloads.md)
- [Use Custom Fetchers for Your API](custom-api-fetchers.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Present API Failures from Custom Fetchers](api-error-notifications.md)
- [Share Pagination Mechanics and Choose the Collection Strategy](pagination-strategies.md)
