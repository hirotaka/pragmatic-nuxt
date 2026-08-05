---
title: Distinguish Mutation Failures from Data Refresh Failures
semanticId: mutation-refresh-outcomes
category: failure-and-workflow-outcomes
prerequisites: [page-rendering-data, imperative-api-requests, api-error-notifications]
status: confirmed
---

# Distinguish Mutation Failures from Data Refresh Failures

## Practice

Treat a mutation and the data refresh performed after it succeeds as separate request outcomes. If the refresh fails after the mutation completes, do not present the mutation itself as failed.

## Apply When

- A list or detail view is refreshed after a mutation succeeds.
- Mutation failures and subsequent GET failures use different notifications.
- Retrying a completed mutation after a refresh failure could create duplicates or repeat an operation.
- Display data is refreshed after mutation success has been established.

## Do Not Apply When

- The subsequent work is part of the operation's success condition, such as payment confirmation or server-side transaction completion.
- The mutation response can update display state safely without another data request.
- The mutation and refresh occur in the same server-side transaction and cannot be observed as independent client outcomes.

## Why

A mutation request and its subsequent data refresh are separate requests. If the refresh fails after the server write completes, the result of creating, updating, or deleting the resource is not reversed.

When both requests share one `try/catch`, a refresh failure may be presented as though the mutation failed. Users cannot distinguish a completed write from a failure to retrieve the latest data, and retrying the mutation can repeat the operation.

## Implementation Guidance

- Do not use the same error boundary for the mutation and data refresh.
- Run the mutation in its own `try/catch` and return without starting follow-up work when it fails.
- Present success as soon as the mutation succeeds.
- Then call the `refresh()` returned by the feature composable that owns the affected data.
- Do not let a refresh rejection enter the mutation's `catch`; handle it through the GET error contract.
- Ignore a rejected refresh only when its read owner has already reported or recorded the failure.
- Decide from the app's UX requirements whether to wait for refresh settlement before closing the UI or refresh in the background.

## Minimal Nuxt Example

```ts
const { refresh } = await useDiscussion(() => props.discussionId);
const updateDiscussion = useUpdateDiscussion();

const handleSubmit = async (input: UpdateDiscussionInput) => {
  try {
    await updateDiscussion({ id: props.discussionId, data: input });
  }
  catch {
    return;
  }

  addNotification({ type: "success", title: "Discussion Updated" });
  await refresh().catch(() => undefined);
  closeDrawer();
};
```

## Verified App Examples

- Discussion create, update, and delete operations present mutation success before refreshing the affected list or detail.
- Comment create and delete operations treat mutation success and a comments refresh failure as separate outcomes.
- User deletion treats delete success and a users-list refresh failure as separate outcomes.
- A refresh failure preserves mutation success and produces a separate GET error notification.
- As an app-specific UX choice, this app waits for required refresh settlement before closing the drawer or dialog.

## Trade-offs and Limitations

A GET error notification may appear immediately after a mutation success notification. This accurately reports that the mutation succeeded but the latest data could not be retrieved.

Use `refresh().catch(() => undefined)` only when the read owner reports or records the failure separately. Waiting for refresh settlement increases pending time; background refresh can leave stale data visible temporarily.

## Sources

- [Nuxt `useFetch`](https://nuxt.com/docs/4.x/api/composables/use-fetch)
- [Nuxt `useAsyncData`](https://nuxt.com/docs/4.x/api/composables/use-async-data)
- [Nuxt data fetching](https://nuxt.com/docs/4.x/getting-started/data-fetching)

## Related Practices

- [Use `useFetch` Semantics for Page Rendering Data](page-rendering-data.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Handle API Error Notifications in Custom Fetchers](api-error-notifications.md)
- [Share AsyncData Through Feature Composables](shared-async-data.md)
