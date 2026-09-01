---
title: Synchronize Related Queries in the Background After Successful Writes
semanticId: pinia-colada-background-query-synchronization
category: mutation-strategy
status: confirmed
---

# Synchronize Related Queries in the Background After Successful Writes

## Practice

After a server write succeeds, continue the success flow without waiting for related Query synchronization unless the next action depends on fresh Query data.
If the related Query refetch fails after the write succeeds, do not treat the successful write as failed.

## Apply When

- The success flow can continue without waiting for fresh Query data, such as showing confirmation, closing a form or dialog, or navigating away.
- The current screen can temporarily show stale data while its related Queries refetch.
- A Query refetch failure can be reported or recovered as a separate read error without presenting the completed write as failed.

## Do Not Apply When

- The next navigation, selection, calculation, or authorization decision depends on freshly refetched Query data.
- The operation is not considered complete until the client refetches and confirms the server state after the write.
- The operation uses a separately designed data consistency approach, such as an Optimistic Update, local-first workflow, or offline write.

## Why

The application must wait for the server write to complete, but it does not always need to wait for the related Query refetch that starts afterward. When the next action does not depend on fresh Query data, letting the refetch run in the background avoids delaying the success flow.

If the refetch fails, the successful server write is not reversed. Presenting that failure as a Mutation failure could prompt the user to repeat a write that already succeeded, so preserve the write success and report the refetch failure separately.

## Implementation Guidance

- First, establish the write-completion boundary. Await the server request inside the Mutation function, and await `mutateAsync()` in the component before showing confirmation, closing a form or dialog, or continuing navigation. This keeps the success flow tied to completion of the server write rather than completion of the Query refetch.
- Then decide whether to wait for Query synchronization based on whether the next action requires fresh data. To synchronize in the background, call `invalidateQueries()` from the Mutation success hook without returning its Promise. When fresh data is required, return or await that Promise instead.
- Keep synchronization failures and invalidation scope with the Query layer. Handle the detached Promise so it cannot produce an unhandled rejection, while reporting and recovery remain in Query-level error handling. Limit invalidation to the domain Query keys affected by the write.

## Minimal Nuxt Example

The Mutation function waits for the server write to complete, then starts the related Query refetch in the background after success.

```ts
export const deleteUserMutation = defineMutationOptions(() => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  return {
    mutation: async (userId: string): Promise<void> => {
      await $api(`/api/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      void queryCache
        .invalidateQueries({ key: USER_QUERY_KEYS.all })
        .catch(() => undefined);
    },
  };
});
```

The component waits for the server write to complete before continuing the success flow.

```ts
const { mutateAsync } = useMutation(deleteUserMutation());

const removeUser = async (userId: string) => {
  await mutateAsync(userId);
  showSuccess();
  closeDialog();
};
```

The `mutation` waits for the DELETE request to complete. The `onSuccess` hook then starts the Users Query refetch, but `mutateAsync()` does not wait for that refetch to finish. As a result, the component can show confirmation and close the dialog after the write succeeds while the Users Query continues updating in the background.

If the refetch fails, the application reports that it could not load the latest data rather than presenting the deletion as failed. The deletion remains successful because the server write has already completed.

## Verified App Examples

- The current CRUD Mutations start related Query invalidation after the server write succeeds without waiting for the refetch to finish. This includes create, update, and delete in [`discussions.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/queries/discussions.ts), create and delete in [`comments.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/comments/app/queries/comments.ts), and delete in [`users.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/users/app/queries/users.ts).
- The shared Query error hook in [`colada.options.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/colada.options.ts) reports Query refetch failures separately from write failures.

## Trade-offs and Limitations

Because the application continues without waiting for the Query refetch to finish, the screen can temporarily show stale data. If the refetch fails, the write remains successful, and the application reports that the latest data could not be loaded through its Query error handling.

By default, `invalidateQueries()` marks all matching cached Queries as stale. It immediately refetches only enabled Queries currently used by mounted components. A matching Query that remains in the cache but is not currently used refetches the next time a component uses it.

Background synchronization therefore does not guarantee that every matching cached Query contains fresh data immediately after the Mutation succeeds.

When the next action depends on freshly refetched data, wait for the Query refetch before continuing. This keeps the operation in a loading state after the write succeeds and increases the user's wait, but it ensures that the next action uses the required fresh data.

## Sources

- [Pinia Colada Query Invalidation](https://pinia-colada.esm.dev/guide/query-invalidation.html)
- [Pinia Colada Mutations](https://pinia-colada.esm.dev/guide/mutations.html)

## Related Practices

- [Organize Mutations by Domain with `defineMutationOptions()`](mutation-ownership-and-invalidation.md)
- [Wait for Mutation Requests to Complete](wait-for-mutation-requests-to-complete.md)
