---
title: Keep Mutation Success Separate from Query Refetch Failures
semanticId: keep-mutation-success-separate-from-query-refetch-failures
category: mutations
status: confirmed
---

# Keep Mutation Success Separate from Query Refetch Failures

## Practice

When a mutation succeeds, invalidate the affected queries. Wait for the resulting refetch to finish only when the next action needs the updated data from the server. A refetch failure is a query error, not a mutation failure. Show the query error and a retry action where the query data appears.

## Apply When

Use this practice when:

- A form or dialog can be closed or reset as soon as its create, update, or delete request succeeds.
- One or more queries need invalidation after the mutation.
- The query data can remain visible while a failed refetch is reported and retried separately.

## Do Not Apply When

Do not use this practice when:

- The next navigation, calculation, or authorization decision depends on the updated data returned by the refetch.
- A session refresh or another follow-up operation must succeed before the mutation is complete.
- The mutation uses an optimistic update, offline workflow, or another consistency strategy with its own failure handling.

## Why

A mutation request and a later query refetch are separate requests. The mutation can succeed even if the refetch fails. Reporting the refetch failure as a mutation failure can lead the user to repeat a create, update, or delete request that the server has already accepted. Keeping the outcomes separate lets the form or dialog finish while the query UI continues showing cached data with an error and retry action.

## Implementation Guidance

- Await `mutateAsync()` before reporting success, closing the form or dialog, or resetting its fields.
- Invalidate only the query keys whose data may have changed.
- If the next action does not need the updated data from the server, start `invalidateQueries()` without awaiting it and attach a rejection handler to its Promise.
- If the next action needs the updated data from the server, await `invalidateQueries()` before continuing.
- Keep refetch errors and retry actions in the component that displays the query data.
- Await any session refresh or other operation that must succeed before the mutation is complete.

## Minimal Nuxt Example

```ts
// app/components/ProjectForm.vue
async function saveProject(input: UpdateProjectInput) {
  await mutation.mutateAsync(input);
  closeDialog();

  void queryClient
    .invalidateQueries({ queryKey: projectKeys.all })
    .catch(() => undefined);
}
```

The dialog closes after the mutation succeeds. Query invalidation then runs without delaying the completed form interaction. If the refetch fails, the component that displays the project query reports the read error and provides its retry action.

## App Examples

- [`CreateDiscussion.vue`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/discussions/app/components/CreateDiscussion.vue) waits for the create mutation, reports success, and then starts list invalidation without awaiting it.
- [`UpdateDiscussion.vue`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/discussions/app/components/UpdateDiscussion.vue) waits for the update mutation, reports success, and then starts invalidation for the affected list and detail queries without awaiting it.
- [`DeleteDiscussion.vue`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/discussions/app/components/DeleteDiscussion.vue) closes its confirmation dialog after the delete mutation succeeds and then starts list invalidation without awaiting it.
- [`DiscussionsCollection.vue`](../../../apps/reference/bulletproof-nuxt-tanstack-query/layers/discussions/app/components/DiscussionsCollection.vue) keeps cached list data visible when a refetch fails and displays a separate error and retry action.

## Trade-offs and Limitations

Not waiting for the refetch lets the mutation interaction finish sooner, but the UI may temporarily show data from before the mutation. The query component also needs a separate error and retry state so that a failed refetch is not hidden.

By default, query invalidation refetches active matching queries. Inactive matching queries are marked stale but are not refetched by that invalidation call. This approach does not cover optimistic rollback, offline replay, or coordination between concurrent mutations.

## Sources

- [TanStack Query Mutations](https://tanstack.com/query/latest/docs/framework/vue/guides/mutations)
- [TanStack Query Invalidations from Mutations](https://tanstack.com/query/latest/docs/framework/vue/guides/invalidations-from-mutations)
- [TanStack Query Query Invalidation](https://tanstack.com/query/latest/docs/framework/vue/guides/query-invalidation)

## Related Practices

- [Use Nuxt Query to Integrate TanStack Query with Nuxt](use-nuxt-query-to-integrate-tanstack-query-with-nuxt.md)
- [Keep Query Keys and Query Functions Together as Reusable Query Options](keep-query-keys-and-query-functions-together-as-reusable-query-options.md)
- [Keep Query Retries in TanStack Query](keep-query-retries-in-tanstack-query.md)
