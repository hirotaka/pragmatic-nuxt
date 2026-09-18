---
title: Keep Query Keys and Query Functions Together as Reusable Query Options
semanticId: keep-query-keys-and-query-functions-together-as-reusable-query-options
category: query-organization
status: confirmed
---

# Keep Query Keys and Query Functions Together as Reusable Query Options

## Practice

Keep each query's query key and query function together as reusable query options. Include every variable that the query function depends on in the query key. Reuse those options whenever the same data is read, and use the associated query key definitions when invalidating related queries.

## Apply When

Use this practice when:

- More than one page or component reads the same data.
- The query function depends on values that change the returned data, such as a route parameter, record identifier, page number, or filter.
- A mutation creates, updates, or deletes data returned by one query or a group of related queries.

## Do Not Apply When

Do not use this practice when:

- An operation uses a mutation but has no related query.
- Only one page or component reads the data, and no mutation invalidates its query.
- An authentication provider, such as Nuxt Auth Utils, supplies the authenticated user's data instead of a TanStack Query query.

## Why

TanStack Query uses query keys to identify cached data. Keeping the query key and query function together as reusable query options gives every read the same key and function for that data. Including each variable that changes the returned data in the query key keeps different results in different cache entries. Reusing the same query key definitions directs invalidation to the intended query or group of related queries.

## Implementation Guidance

- Validate and convert route parameters, identifiers, page numbers, and filters. Use the same resulting values in both the query key and the request.
- Use `queryOptions()` to create reusable query options that keep `queryKey` and `queryFn` together.
- Include every variable that the query function depends on in the query key.
- Pass the `AbortSignal` from the query function to the request.
- Build query keys from broad to specific and reuse their prefixes when invalidating related queries.
- Use `infiniteQueryOptions()` for a query that accumulates pages.

## Minimal Nuxt Example

```ts
// app/queries/projects.ts
import { queryOptions, type QueryClient } from "@tanstack/vue-query";

export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
};

export function projectQuery(id: string) {
  const { $api } = useNuxtApp();

  return queryOptions({
    queryKey: projectKeys.detail(id),
    queryFn: ({ signal }) => $api(`/api/projects/${id}`, { signal }),
  });
}

export function invalidateProjects(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: projectKeys.all });
}
```

`projectQuery()` keeps the project query key and query function together. The project identifier appears in both the query key and the request. `invalidateProjects()` reuses the broad key to invalidate every project query.

## App Examples

- [`discussions.ts`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/discussions/app/queries/discussions.ts) defines list and detail query options, a shared query key hierarchy, and related invalidation functions.
- [`DiscussionView.vue`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/discussions/app/components/DiscussionView.vue) and [`UpdateDiscussion.vue`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/discussions/app/components/UpdateDiscussion.vue) reuse the same detail query options for a discussion.
- [`users.ts`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/users/app/queries/users.ts) validates and converts page and limit values, uses them in the query key and request, and reuses the list key prefix for invalidation.

## Trade-offs and Limitations

Reusable query options reduce duplication and keep query keys consistent, but they also move part of a page or component's data-fetching behavior into a shared definition. A change to that definition affects every read that reuses it.

Shared definitions have no effect on code that does not reuse them. Such code can construct a different query key for the same data or use a different query function.

## Sources

- [TanStack Query Query Keys](https://tanstack.com/query/latest/docs/framework/vue/guides/query-keys)
- [TanStack Query Query Functions](https://tanstack.com/query/latest/docs/framework/vue/guides/query-functions)
- [TanStack Query Query Options](https://tanstack.com/query/latest/docs/framework/vue/guides/query-options)
- [TanStack Query Query Cancellation](https://tanstack.com/query/latest/docs/framework/vue/guides/query-cancellation)
- [TanStack Query Query Invalidation](https://tanstack.com/query/latest/docs/framework/vue/guides/query-invalidation)
- [TanStack Query Mutations](https://tanstack.com/query/latest/docs/framework/vue/guides/mutations)

## Related Practices

- [Use Nuxt Query to Integrate TanStack Query with Nuxt](use-nuxt-query-to-integrate-tanstack-query-with-nuxt.md)
- [Load More Pages with Infinite Queries](load-more-pages-with-infinite-queries.md)
