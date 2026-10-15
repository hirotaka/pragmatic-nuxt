---
title: Design API Responses for useFetch
semanticId: design-api-responses-for-usefetch
category: request-boundaries
prerequisites: []
status: confirmed
---

# Design API Responses for useFetch

## Practice

In a full-stack Nuxt application, shape the data returned by API routes on the Nitro server so the Vue app can use it through `useFetch`.

## Apply When

- A full-stack Nuxt application controls both the JSON returned by API routes on the Nitro server and the code that reads it.
- Pages or components use `useFetch`, directly or through a composable, to read those responses.

## Do Not Apply When

- An external API or a Nuxt module defines a response format that the application cannot change.
- A route returns a stream, file, redirect, or another non-JSON response.

## Why

When an API route returns the data the Vue app needs, `useFetch` exposes that result through its `data` ref without an extra wrapper in the HTTP body. A collection can be an array when nothing else is needed, while a paginated collection can carry its items and metadata together. Nuxt infers API response types for `useFetch`, helping TypeScript reveal code affected when a route's returned data changes.

## Implementation Guidance

- Return a resource as an object or a collection as an array from an API route when that result is all the page or component needs.
- For a paginated list that needs metadata, return an object such as `{ items, meta }`: put the entries in `items` and the page number and total count in `meta`.
- Return no body when the response status alone represents success.
- In pages and components, use the `data` ref from `useFetch` to read the returned body. Add an HTTP `{ data }` wrapper only when the API needs it for a purpose beyond the ref.

## Minimal Nuxt Example

The API route returns a user array for a list that needs no metadata. A component renders that array through `useFetch`.

```ts
// server/api/users.get.ts
export default defineEventHandler(() => {
  return [
    { id: "1", name: "Ada" },
    { id: "2", name: "Grace" },
  ];
});
```

The API route returns the user array as the HTTP body, without placing it inside a `{ data }` object.

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

`useFetch` makes the returned array available through its `data` ref. Vue unwraps that ref in the template, so the component iterates over the users directly.

## App Examples

- [`users/index.get.ts`](../../../apps/bulletproof-nuxt/layers/users/server/api/users/index.get.ts) returns a user array without an HTTP response wrapper.
- [`discussions/index.get.ts`](../../../apps/bulletproof-nuxt/layers/discussions/server/api/discussions/index.get.ts) returns both paginated discussion items and metadata.
- [`useDiscussionList.ts`](../../../apps/bulletproof-nuxt/layers/discussions/app/composables/useDiscussionList.ts) reads the `items` field from the `useAPI` result's `data` ref.
- [`discussions/index.post.ts`](../../../apps/bulletproof-nuxt/layers/discussions/server/api/discussions/index.post.ts) sets a 201 status without returning a body.

## Trade-offs and Limitations

Returning a single resource directly but wrapping a collection with metadata makes data access inconsistent in component templates: a resource's fields are available as `data.id`, while a collection's entries are under `data.items`. The wrapper keeps the entries and metadata together, but the Vue app must account for these different response shapes.

An alternative is to return the collection as an array and put metadata, such as the total count, in HTTP headers. The resource or collection is then available directly through `data` in the template, without an additional `items` field for the collection.

## Sources

- [Nuxt: Server Directory](https://nuxt.com/docs/4.x/directory-structure/server)
- [Nuxt: `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt: `$fetch`](https://nuxt.com/docs/4.x/api/utils/dollarfetch)

## Related Practices

- [Treat API Payloads as Serialized JSON Values](../nuxt-use-fetch/serialized-api-payloads.md)
- [Present API Failures from Custom Fetchers](../nuxt-use-fetch/api-error-notifications.md)
- [Keep Pagination State in the URL](keep-pagination-state-in-the-url.md)
- [Reuse Load More Logic Through a Composable](reuse-load-more-logic-through-a-composable.md)
