---
title: Wait for Mutation Requests to Complete
semanticId: pinia-colada-wait-for-mutation-requests-to-complete
category: mutation-strategy
status: confirmed
---

# Wait for Mutation Requests to Complete

## Practice

Wait for a Mutation request to complete before continuing its success workflow.
Treat the server response as the write-success boundary, and keep pending state, success handling, and related Query synchronization in a consistent lifecycle across Mutations.

## Apply When

- The server response determines whether the write succeeded.
- An administrative or CRUD surface contains multiple Mutations that can use the same request, loading, and success order.
- Related cached data can be synchronized after the request completes instead of predicting the result before the response.

## Do Not Apply When

- The operation has a separately designed Optimistic Update that must show its expected result before the request completes.
- The application uses a local-first or offline-write architecture where local state is intentionally authoritative before server confirmation.
- The state is entirely local and does not depend on a server Mutation.

## Why

Waiting for Mutation requests to complete gives each Mutation the same execution order:

1. The component starts the Mutation and exposes loading state through `isLoading`.
2. The Mutation function awaits the write request.
3. After the request resolves, `onSuccess` synchronizes related Queries and the component continues its success interaction.

Components can use the same `isLoading` and `mutateAsync()` interaction pattern.
Domain Mutation options can keep each request and its post-success Query synchronization together.

In administrative screens and other repeated CRUD workflows, this structure makes new Mutations straightforward to add from an existing example.
The input, request, and Query keys can change while the loading and success handling stay the same.
This makes repeated behavior easier to share, test, and review.

Waiting for the request before continuing the success workflow avoids bringing result prediction, early Query Cache changes, and failure rollback into the shared flow.
Reducing Mutation-specific branches keeps the shared processing order simple and predictable.

## Implementation Guidance

- Wait for the server request to complete in the Mutation function.
- Use `isLoading` to show that the request is in progress.
- In the component, wait for `mutateAsync()` to complete before showing a success message.
- Close forms or dialogs, and navigate to pages that depend on the write result, only after `mutateAsync()` completes.
- After the write succeeds, synchronize related Queries from a Mutation hook.
- Use the same processing order across Mutations, and keep differences such as inputs, requests, and related Queries in their owning domains.
- Treat whether Query synchronization is awaited or performed in the background as a separate decision.

## Minimal Nuxt Example

Define the request and its post-success Query synchronization together.

```ts
interface UpdateDiscussionInput {
  id: string;
  title: string;
  body: string;
}

export const updateDiscussionMutation = defineMutationOptions(() => {
  const { $api } = useNuxtApp();
  const queryCache = useQueryCache();

  return {
    mutation: async ({ id, ...body }: UpdateDiscussionInput): Promise<void> => {
      await $api(`/api/discussions/${id}`, {
        method: "PATCH",
        body,
      });
    },
    onSuccess: () => {
      void queryCache
        .invalidateQueries({ key: DISCUSSION_QUERY_KEYS.all })
        .catch(() => undefined);
    },
  };
});
```

Use the Mutation's loading state for pending feedback and wait for `mutateAsync()` before continuing the success interaction.

```ts
const { isLoading, mutateAsync } = useMutation(updateDiscussionMutation());

const save = async () => {
  await mutateAsync({
    id: discussionId,
    title,
    body,
  });

  showSuccess();
};
```

This request, loading, success, and Query synchronization shape can remain consistent across Mutations even when their domain details differ.

## Verified App Examples

- The create, update, and delete Mutations in [`discussions.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/queries/discussions.ts) run `onSuccess` after the server request completes.
- The Mutations in [`comments.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/comments/app/queries/comments.ts) and [`users.ts`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/users/app/queries/users.ts) also wait for the server request to complete and invalidate related Queries from `onSuccess`.
- [`CreateDiscussion.vue`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/components/CreateDiscussion.vue), [`UpdateDiscussion.vue`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/discussions/app/components/UpdateDiscussion.vue), and [`DeleteUser.vue`](../../../apps/reference/bulletproof-nuxt-pinia-colada/layers/users/app/components/DeleteUser.vue) expose `isLoading` and await `mutateAsync()` before continuing their success interaction.

These examples show that the current app uses the same order: complete the server request, then continue success handling.

## Trade-offs and Limitations

This Practice assumes that the server request completes within a time the user can reasonably wait.

While the request is running, the related form or action remains in a loading state.
The user cannot continue actions that depend on the write until the request completes.

For work that is expected to take a long time, start a background job and show its progress instead of keeping one Mutation request open.

## Sources

- [Pinia Colada Mutations](https://pinia-colada.esm.dev/guide/mutations.html)
- [Pinia Colada Query Invalidation](https://pinia-colada.esm.dev/guide/query-invalidation.html)
- [Pinia Colada Optimistic Updates](https://pinia-colada.esm.dev/guide/optimistic-updates.html)

## Related Practices

- [Organize Mutations by Domain with `defineMutationOptions()`](mutation-ownership-and-invalidation.md)
