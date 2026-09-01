---
title: Organize Queries by Domain with `defineQueryOptions()`
semanticId: pinia-colada-query-organization
category: query-organization
status: confirmed
---

# Organize Queries by Domain with `defineQueryOptions()`

## Practice

Use `defineQueryOptions()` as the default for Query definitions. Organize Query options
and their corresponding keys by domain in dedicated files under the `queries/`
directory instead of defining options inline at `useQuery()` call sites. Keep the
Query key, query function, Meta, and cache-related options together so the same
options can be passed to `useQuery()` and Pinia Colada's Query Cache when needed.
Include every value that changes the query result in the Query key. Reuse the resulting
Query options with `useQuery()` and prefetching.

## Apply When

- The number of Queries or their usage sites is growing, and Query options and
  corresponding keys should be organized by domain.
- The same Query options are reused by multiple `useQuery()` calls or by prefetching.
- A Query accepts parameters and should be exposed as a type-safe options factory.

## Do Not Apply When

- The Query uses `useInfiniteQuery()` to accumulate multiple pages. Define it with
  `defineInfiniteQueryOptions()` instead; page progression and Load More behavior
  belong to the Infinite Query Practice.
- The operation creates, updates, or deletes data. Define it with
  `defineMutationOptions()` instead; invalidation and write completion belong to the
  Mutation Practice.

## Why

Pinia Colada uses Query keys to distinguish data in its cache. Normal data reads,
invalidation, and prefetching need to create or target the same cache entry using the
same Query key rules.

Key factories keep the structure and creation of Query keys consistent within a
domain.

`defineQueryOptions()` puts the Query key, query function, and other options in one
place. The type of the returned data is also carried by that definition.

Putting these definitions in domain-specific `queries/` files makes them easy to
find. Normal data reads and prefetching then refer to the same Query options from that
file. When the Query key, query function, or options change, only the definition in
the domain file needs to be updated rather than repeating the change at each usage
site.

## Implementation Guidance

- Put each domain's Query options and key factories in a dedicated file under the
  `queries/` directory.
- Define the Query key, query function, Meta, and cache-related options with
  `defineQueryOptions()`.
- For parameterized Queries, normalize each result-changing input to the
  representation used by both the Query key and the query function before passing it
  to the options factory.
- Treat accepted values and invalid-input behavior as a separate product or domain
  policy. Define the policy at the relevant route or domain boundary when the
  product requires it; do not infer the policy from this Query Organization Practice.
- Within the options factory, use the same input for the Query key and query function.
  Include every result-changing value in the serializable Query key, excluding secrets
  and ambient session values.
- In `useQuery()` call sites, use the options returned by the domain file instead of
  redefining the Query key or query function.
- When a consumer needs a local option such as `enabled`, extend the base Query options
  and add only that option.
- For prefetching, pass the same Query options to Query Cache `ensure()`, then pass the
  returned entry to `refresh()`.
- Keep key factories scoped to their domain. Do not add an app-wide wrapper or shared
  key framework just to hide Pinia Colada.

```ts
useQuery(() => ({
  ...projectDetailQuery({ id: projectId.value }),
  enabled: Boolean(projectId.value),
}));
```

```ts
const options = projectDetailQuery({ id });
const entry = queryCache.ensure(options);

await queryCache.refresh(entry);
```

## Minimal Nuxt Example

```ts
export const PROJECT_QUERY_KEYS = {
  all: ["projects"] as const,
  detail: (id: string) => [...PROJECT_QUERY_KEYS.all, id] as const,
};

export const projectDetailQuery = defineQueryOptions(
  ({ id }: { id: string }) => ({
    key: PROJECT_QUERY_KEYS.detail(id),
    query: ({ signal }) => {
      const { $api } = useNuxtApp();

      return $api(`/api/projects/${id}`, { signal });
    },
  }),
);
```

This example defines the Project domain's key factory and detail Query options in a
`queries/projects.ts` file. The `id` is used in both the Query key and the query
function.

## Verified App Examples

- [`discussions.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/queries/discussions.ts)
  defines the Discussions domain's key factory and list/detail Query options.
- The Discussion list uses `page` and `limit` in both the Query key and API query. The
  detail Query uses `id` in both the Query key and endpoint request.
- The detail page, [`DiscussionView.vue`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/components/DiscussionView.vue),
  and [`UpdateDiscussion.vue`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/components/UpdateDiscussion.vue)
  all pass the same `discussionDetailQuery({ id })` options to `useQuery()`.
- [`DiscussionsList.vue`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/components/DiscussionsList.vue)
  passes the same `discussionDetailQuery({ id })` options to Query Cache `ensure()`,
  then refreshes the returned entry for navigation prefetching.
- [`users.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/users/app/queries/users.ts) and
  [`teams.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/teams/app/queries/teams.ts) define
  static Query keys and options for their respective domains.
- [`UsersList.vue`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/users/app/components/UsersList.vue)
  and the [registration page](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/auth/app/pages/auth/register.vue)
  import `usersQuery()` and `teamsQuery()` for `useQuery()` instead of defining Query
  keys or query functions inline.

## Trade-offs and Limitations

Using a dedicated `queries/` file and an options factory adds an extra level between
the component and the query function compared with inline `useQuery()` options. The
benefit is that the Query key, query function, and related options have one place to
find and update.

Consumers can still add local options such as `enabled`, so two uses of the same base
Query options do not necessarily have identical behavior.

Normalizing an input so the Query key and query function use the same representation
does not define which values are valid or how invalid values are handled. Redirects,
rejections, fallbacks, and range corrections require an explicit product or domain
policy and separate evidence.

## Sources

- [Pinia Colada Query Keys](https://pinia-colada.esm.dev/guide/query-keys.html)
- [Pinia Colada Queries](https://pinia-colada.esm.dev/guide/queries.html)
- [Pinia Colada Query Cache](https://pinia-colada.esm.dev/advanced/query-cache.html)
- [Pinia Colada Prefetching](https://pinia-colada.esm.dev/cookbook/prefetching.html)

## Related Practices

- [Use Infinite Queries for Load More Lists](infinite-query-explicit-load-more.md)
- [Organize Mutations by Domain with `defineMutationOptions()`](mutation-ownership-and-invalidation.md)
- [Handle Page Changes with Paginated Queries](handle-page-changes-with-paginated-queries.md)
- [Use Query Prefetching to Reduce Waiting for Data](use-query-prefetching-to-reduce-waiting-for-data.md)
