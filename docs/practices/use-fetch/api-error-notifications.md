---
title: Present API Failures from Custom Fetchers
semanticId: api-error-notifications
category: failure-and-workflow-outcomes
prerequisites: [custom-api-fetchers]
status: proposed
---

# Present API Failures from Custom Fetchers

## Practice

Define common API failure presentation in the error hooks of custom fetchers. Send unexpected transport and server failures to the Nuxt error page. Use notifications for predictable failures that leave the current interface usable.

Requests made through the custom fetchers then follow the same distinction without repeating error presentation in each component or composable.

## Apply When

- Unexpected transport failures or 5xx responses mean the current operation cannot recover in place.
- Predictable API failures, such as validation, authorization, conflict, or not-found responses, can be explained while the current interface remains usable.
- Errors from SSR-capable custom `useFetch` requests need consistent presentation during SSR, hydration, and client navigation.
- Individual requests need to override or suppress notification content for predictable failures.

## Do Not Apply When

- The feedback belongs to field validation, such as a message beside invalid input.
- A domain operation has a more specific recovery flow than the shared status-based policy.
- An intentional cancellation ends obsolete work and should produce no user-facing error.

## Why

A user cannot resolve an unexpected server exception or transport failure from a notification. Leaving the current page visible suggests that retrying the same interaction is a meaningful recovery action even when the application cannot complete its required request.

The Nuxt error page gives these failures one clear presentation and navigation path. Predictable failures can remain notifications when the current page is still valid and the user can change input, sign in with sufficient access, resolve a conflict, or choose another resource.

Keeping this distinction in custom fetchers prevents components from choosing different presentations for the same failure class. It also prevents one failed request from producing both a notification and an error page.

## Implementation Guidance

- Treat transport failures without an HTTP status as unexpected.
- Treat 5xx responses as unexpected and call `showError()` with the status and extracted message.
- Treat intentional cancellation as neither an error page nor a notification.
- Build notifications for predictable responses only after excluding unexpected failures and cancellation.
- Preserve request-specific error hooks after the shared presentation hook when callers need additional state cleanup.
- Let a request override or suppress notification content for predictable failures. Notification suppression must not hide unexpected failures.
- Keep the error page accurate for both not-found and unexpected failures; do not label every status as 404.

## Minimal Nuxt Example

```ts
const presentError = (error: unknown, options: FetchOptions) => {
  const unexpectedError = resolveUnexpectedApiError(error)
  if (unexpectedError) {
    showError(unexpectedError)
    return
  }

  const notification = resolveApiErrorNotification(
    error,
    options.errorNotification,
  )

  if (notification) {
    useNotifications().addNotification(notification)
  }
}

export const useApi = createUseFetch(() => ({
  onRequestError: ({ error, options }) => presentError(error, options),
  onResponseError: ({ options, response }) => {
    presentError(response._data, options)
  },
}))
```

The unexpected-error resolver returns a fatal Nuxt error for transport failures and 5xx responses. The notification resolver handles only predictable responses that remain after that classification.

## App Examples

- [`useAPI.ts`](../../../apps/bulletproof-nuxt/layers/base/app/composables/useAPI.ts) applies the shared policy to page-rendering reads and AsyncData refreshes.
- [`api.ts`](../../../apps/bulletproof-nuxt/layers/base/app/plugins/api.ts) applies the same policy to imperative requests made through `$api`.
- [`apiNotifications.ts`](../../../apps/bulletproof-nuxt/layers/base/app/utils/apiNotifications.ts) separates unexpected errors from predictable notification content and suppresses intentional cancellation.
- [`error.vue`](../../../apps/bulletproof-nuxt/app/error.vue) distinguishes not-found presentation from unexpected failures.
- [`NotificationCenter.vue`](../../../apps/bulletproof-nuxt/app/components/app/NotificationCenter.vue) renders predictable API failure notifications.

## Trade-offs and Limitations

A status-based policy cannot determine every domain recovery condition. A specific operation may need a narrower rule, but that exception should be explicit rather than inferred independently in each component.

Opening the error page after a successful mutation and a failed refresh hides stale content and the mutation success notification. The server-side mutation remains complete. Returning to the feature later loads its current state.

A transport failure can be temporary, but the application does not have enough evidence to promise that an in-place retry is safe. Adding retry behavior requires a separate product decision.

## Sources

- [Nuxt `showError`](https://nuxt.com/docs/4.x/api/utils/show-error)
- [Nuxt error handling](https://nuxt.com/docs/4.x/getting-started/error-handling)
- [Nuxt custom `useFetch`](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch)
- [Nuxt `createUseFetch`](https://nuxt.com/docs/4.x/api/composables/create-usefetch)
- [ofetch interceptors](https://github.com/unjs/ofetch#interceptors)

## Related Practices

- [Use Custom Fetchers for Your API](custom-api-fetchers.md)
- [Use Imperative API Requests for Application Operations](imperative-api-requests.md)
- [Separate Completed Changes from Data Refresh Failures](completed-change-refresh-failures.md)
