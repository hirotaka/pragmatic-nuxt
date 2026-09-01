---
title: Organize Mutations by Domain with `defineMutationOptions()`
semanticId: pinia-colada-mutation-ownership-and-invalidation
category: mutation-organization
status: confirmed
---

# Organize Mutations by Domain with `defineMutationOptions()`

## Practice

Use `defineMutationOptions()` for Mutation definitions and organize them in domain-specific
files. Keep the Mutation function, variables, hooks, and related Query invalidation together
in the options definition. Pass those options to `useMutation()` at the component.

The component owns the interaction associated with executing the Mutation; the domain
module owns the Mutation definition.

## Apply When

- A domain has multiple Mutation operations or multiple components use the same Mutation.
- Mutation hooks need access to the same domain Query key factory or related domain state.
- Mutation options should be type-safe and reusable at `useMutation()` call sites.

## Do Not Apply When

- A one-off operation has no reusable domain options or Mutation hooks. Inline
  `useMutation()` options may be sufficient.
- The operation is a provider-owned session operation such as refreshing the authenticated
  session. Keep that operation with the session provider boundary.
- The operation needs a separate Optimistic Update, rollback, or concurrent-write policy.
  Those policies require additional ownership and evidence beyond this Practice.

## Why

`defineMutationOptions()` separates the Mutation definition from the component that executes
it.

The domain defines the Mutation function and lifecycle hooks. The component passes those
options to `useMutation()` and receives the execution state. This avoids repeating the
request or hooks in each component while keeping the same type-safe Mutation options
reusable.

When a Mutation changes cached data, its invalidation hook can live beside the Mutation
function. The relationship between the write and the affected Query stays visible, and the
domain can reuse its Query key factory.

Use `defineMutation()` when the domain needs a composable that includes `useMutation()` state
and additional state or actions. Use `defineMutationOptions()` when execution state and
interaction should remain in the component.

## Implementation Guidance

- Define each domain's Mutations with `defineMutationOptions()` and keep them in a
  domain-specific file.
- Keep the Mutation function and its lifecycle hooks together in the same options definition.
- Pass the domain options to `useMutation()` from the component, and keep the interaction
  associated with executing the Mutation in the component.
- When a Mutation changes cached data, invalidate the related Query from a Mutation hook. Use
  the domain's Query key factory and derive the target from the Mutation input or server
  result rather than changing ambient route or component state.
- Decide whether invalidation is awaited or performed in the background from the workflow
  requirements; this organization Practice does not choose that policy.

## Minimal Nuxt Example

Define the Mutation options in a domain-specific file.

```ts
// comments.ts
interface DeleteCommentInput {
  commentId: string;
  discussionId: string;
}

export const deleteCommentMutation = defineMutationOptions(() => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  return {
    mutation: async ({ commentId }: DeleteCommentInput) => {
      await $api(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
    },
    onSuccess: (_data, { discussionId }) => {
      void queryCache
        .invalidateQueries({
          key: COMMENT_QUERY_KEYS.discussion(discussionId),
        })
        .catch(() => undefined);
    },
  };
});
```

Pass the domain options to `useMutation()` in the component and execute the Mutation from the
user interaction.

```ts
// DeleteComment.vue
const { isLoading, mutateAsync } = useMutation(deleteCommentMutation());

const handleDelete = async () => {
  await mutateAsync({
    commentId: props.commentId,
    discussionId: props.discussionId,
  });
};
```

`comments.ts` defines the delete request and the Comments Query to invalidate after success.

`DeleteComment.vue` passes the identity of the item to delete and manages the interaction
associated with executing the Mutation, such as pending feedback and confirmation.

`discussionId` is not used by the delete request, but it is included in the Mutation input to
identify which Comments Query to invalidate after success.

## Verified App Examples

- [`discussions.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/queries/discussions.ts)
  defines create, update, and delete Mutation options in the Discussions domain module.
- [`comments.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/comments/app/queries/comments.ts)
  defines create and delete Mutation options and derives the discussion-specific invalidation
  key from Mutation input.
- [`users.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/users/app/queries/users.ts)
  defines Users collection deletion and its related Query invalidation.
- [`CreateComment.vue`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/comments/app/components/CreateComment.vue)
  and [`DeleteComment.vue`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/comments/app/components/DeleteComment.vue)
  pass domain Mutation options to `useMutation()` while retaining interaction workflow.

## Trade-offs and Limitations

When Mutation options live in a separate file, the component alone no longer shows the request
or hooks; understanding the operation also requires reading the domain-specific file. In
return, the Mutation function, hooks, and related Query keys can be understood together by
domain. For a genuinely one-off Mutation with no reusable hooks or options, defining the
options inline in `useMutation()` may be easier to follow.

`defineMutationOptions()` reuses options, not Mutation state. Each `useMutation()` call has
its own status, data, and error state. Use `defineMutation()` when multiple components need
to share Mutation state or additional composable state.


## Sources

- [Pinia Colada Mutations](https://pinia-colada.esm.dev/guide/mutations.html)
- [`defineMutationOptions()` API](https://pinia-colada.esm.dev/api/@pinia/colada/functions/defineMutationOptions.html)
- [`defineMutation()` API](https://pinia-colada.esm.dev/api/@pinia/colada/functions/defineMutation.html)
- [Pinia Colada Query Invalidation](https://pinia-colada.esm.dev/guide/query-invalidation.html)

## Related Practices

- [Organize Queries by Domain with `defineQueryOptions()`](query-organization.md)
- [Use Infinite Queries for Load More Lists](infinite-query-explicit-load-more.md)
