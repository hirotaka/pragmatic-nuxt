---
title: Separate Completed Changes from Data Refresh Failures
semanticId: completed-change-refresh-failures
category: failure-and-workflow-outcomes
prerequisites: [page-rendering-data, imperative-api-requests, api-error-notifications]
status: confirmed
---

# Separate Completed Changes from Data Refresh Failures

## Practice

After a create, update, or delete request succeeds, an app may send another request to reload the displayed data. Treat the completed change and the data reload as separate results.

If reloading the data fails, do not report the completed change as failed. Present the reload failure according to the shared API failure policy: unexpected failures open the error page, while predictable failures can leave the current interface available.

## Apply When

Use this practice when:

- The app reloads a list or detail view after a create, update, or delete request succeeds.
- Users need different messages depending on whether the change request or the data reload fails.
- Retrying a completed change after a data reload failure could create duplicates or repeat an operation.
- The app can determine that the change succeeded independently of whether the latest data can be loaded.

## Do Not Apply When

Do not use this practice when:

- A user action is not considered successful until its follow-up work is complete, such as confirming a payment.
- The app can safely update the displayed data from the successful create, update, or delete response without sending another request.
- The client receives one combined result instead of separate results for the change and the data reload.

## Why

A create, update, or delete request and the request that reloads the displayed data are separate requests. If the first request succeeds but reloading the data fails, the completed change remains successful.

When the same `try/catch` handles both requests, a data reload failure can be presented as though the change itself failed. The user may then retry a request that has already succeeded, creating duplicate data or repeating the operation.

Report the completed change first. If reloading the data fails, use the app's error handling for loading data to report that failure separately. This lets the user understand what succeeded and what failed.

## Implementation Guidance

- Run the create, update, or delete request in its own `try/catch`.
- If the request fails, stop without showing a success message or reloading the data.
- If the request succeeds, show a success message before reloading the data.
- Run `refresh()` outside the first `try/catch`.
- If `refresh()` fails, preserve the completed mutation outcome and use the shared API failure presentation. An unexpected failure can replace the current interface with the error page.
- Decide whether the user must wait for `refresh()` to finish or can continue while the data reloads in the background.

## Minimal Nuxt Example

```ts
// app/components/UpdateProjectForm.vue
const { refresh } = await useProjects();
const updateProject = useUpdateProject();

const handleSubmit = async (input: UpdateProjectInput) => {
  try {
    await updateProject(input);
  }
  catch {
    return;
  }

  addNotification({
    type: "success",
    title: "Project Updated",
  });

  // useProjects applies the shared API failure policy if refresh() fails.
  await refresh();
};
```

The `catch` handles only the update request. The data reload starts after the update succeeds and remains outside that `catch`. `useProjects()` shows a reload failure, so the submit handler does not show the same error again.

## App Examples

- [`UpdateDiscussionForm.vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/UpdateDiscussionForm.vue) handles the update request in its own `try/catch`, shows `Discussion Updated`, and emits success. [`DiscussionView.vue`](../../../apps/bulletproof-nuxt/layers/discussions/app/components/DiscussionView.vue) then reloads the shared discussion outside the mutation handler before closing the drawer.
- [`DeleteUserDialog.vue`](../../../apps/bulletproof-nuxt/layers/users/app/components/DeleteUserDialog.vue) shows `User Deleted` and closes after the deletion succeeds. [`UsersList.vue`](../../../apps/bulletproof-nuxt/layers/users/app/components/UsersList.vue) reloads the user list separately after receiving that success event.

## Trade-offs and Limitations

The mutation and reload remain separate results even when an unexpected reload failure opens the error page. The server-side change is still complete; returning to the feature later loads its current state.

Waiting for the data to reload delays completion. Reloading in the background lets the user continue sooner, but the displayed data may remain out of date until the reload succeeds.

A failed data reload may throw an error from `refresh()` or finish with `status` set to `"error"`. Code that needs to distinguish success from failure must handle both cases.

Request cancellation, preventing duplicate submissions, and handling work that finishes after a component unmounts require separate lifecycle decisions.

## Sources

- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt `useAsyncData`](https://nuxt.com/docs/4.x/api/composables/use-async-data)
- [Nuxt data fetching](https://nuxt.com/docs/4.x/getting-started/data-fetching)

## Related Practices

- [Use useFetch Semantics for Page Rendering Data](page-rendering-data.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Present API Failures from Custom Fetchers](api-error-notifications.md)
- [Keep Existing Data Visible During Refresh](refresh-data-visibility.md)
- [Share AsyncData Through Feature Composables](shared-async-data.md)
